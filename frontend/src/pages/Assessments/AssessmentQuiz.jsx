import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Check,
  CheckCircle2,
  Clock3,
  Home,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import questionsData from "../../data/questions.json";
import coursesData from "../../data/courses.json";

import {
  selectNextQuestion,
  getNextDifficulty,
} from "../../services/adaptiveAssessment";

import { saveAssessmentResult } from "../../services/assessmentStore";
import { calculateUpdatedCompetency } from "../../services/competencyEngine";

const TOTAL_QUESTIONS = 10;
const TEST_DURATION = 15 * 60;
const INITIAL_COMPETENCY = 65.18;

/* ============================================================
   HELPERS
============================================================ */

const getQuestionId = (q, index = 0) =>
  q?.question_id ||
  q?.id ||
  `Q${String(index + 1).padStart(3, "0")}`;

const getOptionText = (option) => {
  if (typeof option === "string") return option;
  if (option?.text) return option.text;
  if (option?.label) return option.label;
  return String(option ?? "");
};

const answerLetterToText = (answer, options) => {
  if (answer === null || answer === undefined) return "";

  const value = String(answer).trim();

  // A/B/C/D -> actual option text
  if (/^[A-D]$/i.test(value)) {
    const index = value.toUpperCase().charCodeAt(0) - 65;
    return getOptionText(options[index]) || value;
  }

  // "Option A", "Answer: C", etc.
  const match = value.match(/\b([A-D])\b/i);
  if (match) {
    const index = match[1].toUpperCase().charCodeAt(0) - 65;
    if (options[index]) return getOptionText(options[index]);
  }

  return value;
};

const inferSkill = (question) => {
  if (question?.skill) return question.skill;
  if (question?.category) return question.category;

  const text = String(question?.question || "").toLowerCase();

  if (
    text.includes("probability") ||
    text.includes("distribution") ||
    text.includes("random variable") ||
    text.includes("bayes")
  ) {
    return "Probability";
  }

  if (
    text.includes("statistics") ||
    text.includes("mean") ||
    text.includes("median") ||
    text.includes("variance") ||
    text.includes("sampling") ||
    text.includes("standard deviation")
  ) {
    return "Statistics";
  }

  if (
    text.includes("sql") ||
    text.includes("data analysis") ||
    text.includes("regression") ||
    text.includes("dataset") ||
    text.includes("pandas") ||
    text.includes("analysis")
  ) {
    return "Data Analysis";
  }

  if (
    text.includes("chart") ||
    text.includes("visualization") ||
    text.includes("graph") ||
    text.includes("dashboard")
  ) {
    return "Data Visualization";
  }

  if (
    text.includes("python") ||
    text.includes("r programming") ||
    text.includes("stata") ||
    text.includes("spss") ||
    text.includes("sas") ||
    text.includes("statistical computing")
  ) {
    return "Statistical Computing";
  }

  return "Statistics";
};

/*
  IMPORTANT FIX:
  Groq returns:
    {
      question: "...",
      options: ["A", "B", "C", "D"],
      answer: "C"
    }

  The frontend needs:
    correct_answer: "actual option text"

  This normalizer performs that conversion.
*/
const normalizeQuestions = (data) => {
  let rawQuestions = [];

  if (Array.isArray(data)) {
    rawQuestions = data;
  } else if (data && Array.isArray(data.questions)) {
    rawQuestions = data.questions;
  } else if (data && typeof data === "object") {
    rawQuestions = Object.values(data).flatMap((value) =>
      Array.isArray(value) ? value : []
    );
  }

  return rawQuestions
    .filter((q) => q && typeof q === "object")
    .map((q, index) => {
      const options = Array.isArray(q.options)
        ? q.options.map(getOptionText)
        : [];

      const rawAnswer =
        q.correct_answer ??
        q.correctAnswer ??
        q.answer ??
        q.correct_option ??
        q.correctOption ??
        "";

      const correctAnswer = answerLetterToText(rawAnswer, options);

      return {
        ...q,
        question_id: getQuestionId(q, index),
        question: q.question || q.question_text || q.text || "",
        options,
        correct_answer: correctAnswer,
        skill: inferSkill(q),
        difficulty:
          q.difficulty ||
          q.level ||
          "Intermediate",
      };
    })
    .filter(
      (q) =>
        q.question &&
        Array.isArray(q.options) &&
        q.options.length >= 2 &&
        q.correct_answer
    );
};

const loadQuestions = () => {
  try {
    const stored = sessionStorage.getItem("statwise_quiz");

    if (stored) {
      const parsed = JSON.parse(stored);
      const normalized = normalizeQuestions(parsed);

      if (normalized.length > 0) {
        return normalized.slice(0, TOTAL_QUESTIONS);
      }
    }
  } catch (error) {
    console.warn("Could not load stored AI quiz:", error);
  }

  return normalizeQuestions(questionsData).slice(0, TOTAL_QUESTIONS);
};

const flattenCourses = (data) => {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.courses)) {
    return data.courses;
  }

  if (data && typeof data === "object") {
    return Object.values(data).flatMap((value) =>
      Array.isArray(value) ? value : []
    );
  }

  return [];
};

const getCourseSkill = (course) =>
  course?.skill ||
  course?.category ||
  course?.competency ||
  course?.topic ||
  "";

const buildSkillGap = (skillScores) => {
  const targets = {
    Statistics: 85,
    Probability: 80,
    "Data Analysis": 75,
    "Data Visualization": 70,
    "Statistical Computing": 65,
  };

  return Object.entries(skillScores)
    .map(([skill, score]) => {
      const numericScore = Number(score) || 0;
      const target = targets[skill] ?? 70;

      return {
        skill,
        current_score: Number(numericScore.toFixed(1)),
        target_score: target,
        gap: Number(Math.max(target - numericScore, 0).toFixed(1)),
      };
    })
    .sort((a, b) => b.gap - a.gap);
};

const buildLearningPath = (skillGap) => {
  const courses = flattenCourses(coursesData);

  const recommended = [];

  skillGap
    .filter((item) => item.gap > 0)
    .slice(0, 3)
    .forEach((gap, index) => {
      const matching = courses.filter((course) => {
        const courseSkill = String(getCourseSkill(course)).toLowerCase();
        const skill = gap.skill.toLowerCase();

        return (
          courseSkill.includes(skill) ||
          skill.includes(courseSkill)
        );
      });

      matching.slice(0, 2).forEach((course) => {
        recommended.push({
          ...course,
          priority: index + 1,
          target_skill: gap.skill,
          gap: gap.gap,
        });
      });
    });

  // If courses.json uses different metadata, still return useful courses.
  if (recommended.length === 0) {
    return courses.slice(0, 4).map((course, index) => ({
      ...course,
      priority: index + 1,
      target_skill: skillGap[index]?.skill || "Statistics",
      gap: skillGap[index]?.gap || 0,
    }));
  }

  return recommended.slice(0, 6);
};

function AnimatedNumber({ value, suffix = "" }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const target = Number(value) || 0;
    const duration = 800;
    const startTime = performance.now();

    const animate = (now) => {
      const progress = Math.min(
        (now - startTime) / duration,
        1
      );

      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(target * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <>
      {displayValue}
      {suffix}
    </>
  );
}

/* ============================================================
   PERFECT SCORE BADGE
   Shows only when the user gets 10/10
============================================================ */

function PerfectScoreBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.8,
        type: "spring",
        stiffness: 140,
        damping: 12,
      }}
      className="relative mx-auto mt-10 max-w-md"
    >
      {/* Confetti particles */}
      <div className="pointer-events-none absolute inset-0 overflow-visible">
        {Array.from({ length: 18 }).map((_, index) => (
          <motion.span
            key={index}
            initial={{
              opacity: 0,
              scale: 0,
              x: 0,
              y: 30,
              rotate: 0,
            }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0, 1, 1, 0.7],
              x: Math.cos(index * 1.7) * (80 + index * 3),
              y: Math.sin(index * 1.9) * (60 + index * 2) - 20,
              rotate: 360,
            }}
            transition={{
              duration: 2.2,
              delay: index * 0.04,
              ease: "easeOut",
            }}
            className="absolute left-1/2 top-1/2 w-2 h-2 rounded-sm bg-[#F6D76A]"
          />
        ))}
      </div>

      {/* Outer glow */}
      <motion.div
        animate={{
          scale: [1, 1.04, 1],
          opacity: [0.25, 0.45, 0.25],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 rounded-[2rem] bg-[#F6D76A] blur-2xl"
      />

      {/* Badge card */}
      <div className="relative overflow-hidden rounded-[2rem] border border-[#d8b94c] bg-[#172033] p-8 text-center shadow-2xl">

        {/* Decorative circles */}
        <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full border border-[#F6D76A]/20" />
        <div className="absolute -right-16 -bottom-16 h-40 w-40 rounded-full border border-[#F6D76A]/20" />

        <div className="relative">

          {/* Badge emblem */}
          <motion.div
            initial={{ rotate: -20 }}
            animate={{ rotate: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.7,
              type: "spring",
            }}
            className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-[6px] border-[#F6D76A] bg-gradient-to-br from-[#fff4a8] via-[#F6D76A] to-[#c99f18] shadow-[0_0_45px_rgba(246,215,106,0.45)]"
          >
            <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full border-2 border-[#172033]/30 bg-[#172033]">
              <Trophy
                size={34}
                className="text-[#F6D76A]"
              />

              <span className="mt-1 text-[11px] font-black tracking-[0.18em] text-[#F6D76A]">
                10 / 10
              </span>
            </div>
          </motion.div>

          {/* Badge title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.3em] text-[#F6D76A]">
              STATWISE AI HONOUR
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-white">
              PERFECT SCORE
            </h2>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/65">
              Exceptional performance. You answered every
              assessment question correctly.
            </p>
          </motion.div>

          {/* Divider */}
          <div className="mx-auto mt-6 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-[#F6D76A]/30" />

            <Sparkles
              size={17}
              className="text-[#F6D76A]"
            />

            <span className="h-px w-12 bg-[#F6D76A]/30" />
          </div>

          {/* Score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.8,
              type: "spring",
            }}
            className="mt-5"
          >
            <span className="text-5xl font-black text-[#F6D76A]">
              100%
            </span>

            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-white/45">
              Assessment Master
            </p>
          </motion.div>

          {/* Achievement footer */}
          <div className="mt-6 rounded-xl border border-[#F6D76A]/15 bg-white/5 px-4 py-3">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-white/70">
              <Trophy
                size={15}
                className="text-[#F6D76A]"
              />
              Perfect Score Achievement Unlocked
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function AssessmentQuiz() {
  const navigate = useNavigate();

  const questions = useMemo(() => loadQuestions(), []);

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentDifficulty, setCurrentDifficulty] =
    useState("Intermediate");
  const [askedQuestions, setAskedQuestions] = useState([]);
  const [assessmentAnswers, setAssessmentAnswers] =
    useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const [submitted, setSubmitted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] =
    useState(null);
  const [isTransitioning, setIsTransitioning] =
    useState(false);

  const isPdfQuiz = Boolean(
    sessionStorage.getItem("statwise_pdf_name")
  );

  const pdfName =
    sessionStorage.getItem("statwise_pdf_name") ||
    "Uploaded Learning Material";

  /* ==========================================================
     FIRST QUESTION
  ========================================================== */

  useEffect(() => {
    if (!questions.length) return;

    const first = selectNextQuestion(
      questions,
      "Intermediate",
      [],
      null
    );

    const firstQuestion = first || questions[0];

    setCurrentQuestion(firstQuestion);
    setAskedQuestions([
      getQuestionId(firstQuestion, 0),
    ]);
  }, [questions]);

  /* ==========================================================
     TIMER
  ========================================================== */

  useEffect(() => {
    if (submitted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          setSubmitted(true);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [submitted, timeLeft]);

  /* ==========================================================
     RESULT ENGINE

     SCORE
       ↓
     SKILL SCORES
       ↓
     SKILL GAP
       ↓
     COMPETENCY
       ↓
     LEARNING PATH
  ========================================================== */

  const result = useMemo(() => {
    if (!submitted) return null;

    const total = assessmentAnswers.length;

    if (total === 0) {
      return {
        correct: 0,
        wrong: 0,
        unanswered: 0,
        score: 0,
        skillScores: {},
        skillGap: [],
        weakestSkill: "Not available",
        weakestScore: 0,
        priority: "Critical",
        updatedCompetency: INITIAL_COMPETENCY,
        learningPath: [],
        recommendation:
          "Complete the assessment to generate your personalized learning path.",
      };
    }

    const correct = assessmentAnswers.filter(
      (answer) => answer.is_correct
    ).length;

    const wrong = assessmentAnswers.filter(
      (answer) => !answer.is_correct
    ).length;

    const score = Math.round((correct / total) * 100);

    /* Skill-wise scoring */
    const skillBuckets = {};

    assessmentAnswers.forEach((answer) => {
      const skill = answer.skill || "Statistics";

      if (!skillBuckets[skill]) {
        skillBuckets[skill] = {
          correct: 0,
          total: 0,
        };
      }

      skillBuckets[skill].total += 1;

      if (answer.is_correct) {
        skillBuckets[skill].correct += 1;
      }
    });

    const skillScores = Object.fromEntries(
      Object.entries(skillBuckets).map(
        ([skill, bucket]) => [
          skill,
          Math.round(
            (bucket.correct / bucket.total) * 100
          ),
        ]
      )
    );

    const skillGap = buildSkillGap(skillScores);

    const weakest =
      skillGap[0] || {
        skill: "Statistics",
        current_score: score,
        gap: Math.max(85 - score, 0),
      };

    let priority = "Low";

    if (score < 50) priority = "Critical";
    else if (score < 70) priority = "High";
    else if (score < 85) priority = "Medium";

    /* Existing competency engine */
    let updatedCompetency = INITIAL_COMPETENCY;

    try {
      updatedCompetency = calculateUpdatedCompetency({
        previousCompetency: INITIAL_COMPETENCY,
        assessmentScore: score,
        skillScores,
      });
    } catch (error) {
      console.warn(
        "Competency engine failed, using fallback:",
        error
      );

      updatedCompetency = Math.round(
        INITIAL_COMPETENCY * 0.4 + score * 0.6
      );
    }

    const learningPath = buildLearningPath(skillGap);

    const recommendation =
      weakest.gap > 0
        ? `${weakest.skill} is your highest-priority skill gap. Start with foundational learning and practice before progressing to advanced topics.`
        : "Your assessed competencies are on target. Continue with advanced and role-specific learning.";

    return {
      correct,
      wrong,
      unanswered: Math.max(
        TOTAL_QUESTIONS - total,
        0
      ),
      score,
      skillScores,
      skillGap,
      weakestSkill: weakest.skill,
      weakestScore: weakest.current_score,
      priority,
      updatedCompetency: Number(
        updatedCompetency.toFixed
          ? updatedCompetency.toFixed(1)
          : updatedCompetency
      ),
      learningPath,
      recommendation,
    };
  }, [submitted, assessmentAnswers]);

  /* ==========================================================
     SAVE RESULT FOR DASHBOARD / LEARNING PAGE
  ========================================================== */

  useEffect(() => {
    if (!result || assessmentAnswers.length === 0) return;

    const payload = {
      ...result,
      completedAt: new Date().toISOString(),
      source: isPdfQuiz ? "PDF + Groq AI" : "STATWISE AI",
      sourceFile: pdfName,
      totalQuestions: TOTAL_QUESTIONS,
    };

    try {
      saveAssessmentResult(payload);
    } catch (error) {
      console.warn(
        "assessmentStore save failed:",
        error
      );
    }

    sessionStorage.setItem(
      "statwise_assessment_result",
      JSON.stringify(payload)
    );

    sessionStorage.setItem(
      "statwise_skill_gap",
      JSON.stringify(result.skillGap)
    );

    sessionStorage.setItem(
      "statwise_learning_path",
      JSON.stringify(result.learningPath)
    );

    sessionStorage.setItem(
      "statwise_competency",
      String(result.updatedCompetency)
    );

        /* ========================================================
       PERFECT SCORE BADGE
       Unlock only for 10/10
    ======================================================== */

    if (
      result.score === 100 &&
      result.correct === TOTAL_QUESTIONS
    ) {
      const perfectScoreBadge = {
        id: "perfect-score",
        name: "Perfect Score",
        title: "STATWISE AI Honour",
        description:
          "Achieved a perfect 10/10 score in the AI Competency Assessment.",
        score: "10/10",
        percentage: 100,
        unlockedAt: new Date().toISOString(),
        source: pdfName,
      };

      localStorage.setItem(
        "statwise_perfect_score_badge",
        JSON.stringify(perfectScoreBadge)
      );

      localStorage.setItem(
        "statwise_badge_unlocked",
        "true"
      );
    }
  }, [
    result,
    assessmentAnswers.length,
    isPdfQuiz,
    pdfName,
  ]);

  /* ==========================================================
     ANSWER
  ========================================================== */

  const handleSelectAnswer = (answer) => {
    if (
      showFeedback ||
      submitted ||
      isTransitioning
    ) {
      return;
    }

    setSelectedAnswer(answer);
  };

  /* ==========================================================
     NEXT / FINISH
  ========================================================== */

  const handleNext = () => {
    if (!currentQuestion || isTransitioning) return;

    if (!selectedAnswer) {
      toast.error("Please select an answer first.");
      return;
    }

    const correctAnswer =
      currentQuestion.correct_answer;

    const isCorrect =
      String(selectedAnswer)
        .trim()
        .toLowerCase() ===
      String(correctAnswer)
        .trim()
        .toLowerCase();

    const answerRecord = {
      question_id: currentQuestion.question_id,
      question: currentQuestion.question,
      skill:
        currentQuestion.skill ||
        inferSkill(currentQuestion),
      difficulty:
        currentQuestion.difficulty ||
        currentDifficulty,
      selected_answer: selectedAnswer,
      correct_answer: correctAnswer,
      is_correct: isCorrect,
    };

    setAssessmentAnswers((previous) => [
      ...previous,
      answerRecord,
    ]);

    setLastAnswerCorrect(isCorrect);
    setShowFeedback(true);

    const nextDifficulty = getNextDifficulty(
      currentDifficulty,
      isCorrect
    );

    setCurrentDifficulty(nextDifficulty);
    setIsTransitioning(true);

    setTimeout(() => {
      const isLast =
        questionNumber >= TOTAL_QUESTIONS;

      if (isLast) {
        setSubmitted(true);
        setShowFeedback(false);
        setIsTransitioning(false);

        toast.success(
          "Assessment completed! Skill gaps and learning path generated."
        );

        return;
      }

      const updatedAsked = [
        ...askedQuestions,
        currentQuestion.question_id,
      ];

      const next =
        selectNextQuestion(
          questions,
          nextDifficulty,
          updatedAsked,
          currentQuestion.skill || null
        ) || questions[questionNumber];

      if (!next) {
        setSubmitted(true);
        setShowFeedback(false);
        setIsTransitioning(false);
        return;
      }

      setCurrentQuestion(next);

      setAskedQuestions((previous) => [
        ...previous,
        getQuestionId(next, questionNumber),
      ]);

      setQuestionNumber(
        (previous) => previous + 1
      );

      setSelectedAnswer(null);
      setShowFeedback(false);
      setLastAnswerCorrect(null);
      setIsTransitioning(false);
    }, 700);
  };

  /* ==========================================================
     RETAKE
  ========================================================== */

  const handleRetake = () => {
    setCurrentQuestion(null);
    setCurrentDifficulty("Intermediate");
    setAskedQuestions([]);
    setAssessmentAnswers([]);
    setSelectedAnswer(null);
    setQuestionNumber(1);
    setTimeLeft(TEST_DURATION);
    setSubmitted(false);
    setShowFeedback(false);
    setLastAnswerCorrect(null);
    setIsTransitioning(false);

    const first =
      selectNextQuestion(
        questions,
        "Intermediate",
        [],
        null
      ) || questions[0];

    setTimeout(() => {
      if (!first) return;

      setCurrentQuestion(first);
      setAskedQuestions([
        getQuestionId(first, 0),
      ]);
    }, 50);

    toast.success("New assessment started.");
  };

  const handleHome = () => {
    navigate("/dashboard");
  };

  const handleLearning = () => {
    navigate("/learning");
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const formattedTime =
    `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;

  const progress = Math.min(
    ((questionNumber - 1) /
      TOTAL_QUESTIONS) *
      100,
    100
  );

  /* ==========================================================
     NO QUESTIONS
  ========================================================== */

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-[#fffdf5] flex items-center justify-center px-6">
        <div className="text-center max-w-lg">
          <BrainCircuit
            size={55}
            className="mx-auto mb-5 text-[#d5a900]"
          />

          <h1 className="text-2xl font-black text-slate-900">
            Assessment unavailable
          </h1>

          <p className="mt-3 text-slate-600">
            No valid questions were found. Please
            generate the quiz again from the PDF.
          </p>

          <button
            onClick={() => navigate("/upload")}
            className="mt-6 px-6 py-3 rounded-xl bg-[#172033] text-white font-bold"
          >
            Upload PDF Again
          </button>
        </div>
      </div>
    );
  }

  /* ==========================================================
     RESULT SCREEN
  ========================================================== */

  if (submitted && result) {
    const score = Number(result.score || 0);
    const competency = Number(
      result.updatedCompetency || 0
    );

    return (
      <div className="min-h-screen bg-[#fffdf5] text-[#172033]">
        <div className="bg-[#172033] text-white">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BrainCircuit
                size={20}
                className="text-[#F6D76A]"
              />
              <span className="font-bold">
                STATWISE AI
              </span>

              {isPdfQuiz && (
                <span className="hidden sm:block text-xs text-[#F6D76A]">
                  • AI Quiz from {pdfName}
                </span>
              )}
            </div>

            <button
              onClick={handleHome}
              className="flex items-center gap-2 text-sm text-white/80 hover:text-white"
            >
              <Home size={17} />
              Dashboard
            </button>
          </div>
        </div>

        <section className="relative overflow-hidden bg-[#172033] text-white">
          <div className="absolute inset-0 opacity-20">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(246,215,106,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(246,215,106,.15) 1px, transparent 1px)",
                backgroundSize: "50px 50px",
              }}
            />
          </div>

          <div className="relative max-w-7xl mx-auto px-6 py-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F6D76A]/15 border border-[#F6D76A]/30 text-[#F6D76A] text-xs font-bold">
                <Trophy size={14} />
                ASSESSMENT COMPLETE
              </div>

              <h1 className="mt-5 text-4xl md:text-5xl font-black">
                Your AI Competency Analysis
              </h1>

              <p className="mt-4 text-white/70 text-lg max-w-3xl">
                STATWISE AI converted your assessment
                performance into a competency profile,
                skill-gap analysis and personalized
                learning pathway.
              </p>
            </motion.div>
          </div>
                </section>

        {/* ====================================================
            PERFECT SCORE BADGE
            Appears ONLY for 10/10
        ==================================================== */}

        {score === 100 &&
          result.correct === TOTAL_QUESTIONS && (
            <PerfectScoreBadge />
          )}

        <main className="max-w-7xl mx-auto px-6 py-10">
          {/* KPI CARDS */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                title: "Assessment Score",
                value: (
                  <AnimatedNumber
                    value={score}
                    suffix="%"
                  />
                ),
                icon: Target,
                subtitle: "Overall performance",
              },
              {
                title: "Updated Competency",
                value: (
                  <AnimatedNumber
                    value={competency}
                  />
                ),
                icon: BrainCircuit,
                subtitle: "AI competency score",
              },
              {
                title: "Correct Answers",
                value: result.correct,
                icon: CheckCircle2,
                subtitle: `Out of ${TOTAL_QUESTIONS}`,
              },
              {
                title: "Priority",
                value: result.priority,
                icon: Zap,
                subtitle: "AI learning priority",
              },
            ].map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.08,
                  }}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-500">
                      {item.title}
                    </span>
                    <Icon
                      size={21}
                      className="text-[#d5a900]"
                    />
                  </div>

                  <div className="mt-4 text-4xl font-black">
                    {item.value}
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    {item.subtitle}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* SKILL GAP + PRIORITY */}

          <div className="grid lg:grid-cols-[1.4fr_.8fr] gap-6 mt-8">
            <section className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
              <div className="flex items-center gap-3 mb-7">
                <div className="w-11 h-11 rounded-xl bg-[#F6D76A]/30 flex items-center justify-center">
                  <BarChart3
                    size={22}
                    className="text-[#9a7600]"
                  />
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    Skill-Gap Analysis
                  </h2>
                  <p className="text-sm text-slate-500">
                    AI identified your competency gaps
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {result.skillGap.length > 0 ? (
                  result.skillGap.map(
                    (item, index) => (
                      <motion.div
                        key={item.skill}
                        initial={{
                          opacity: 0,
                          x: -10,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          delay: index * 0.08,
                        }}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold">
                            {item.skill}
                          </span>

                          <span className="text-sm font-bold text-[#9a7600]">
                            {item.current_score}%
                            {" → "}
                            {item.target_score}%
                          </span>
                        </div>

                        <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                          <motion.div
                            initial={{
                              width: 0,
                            }}
                            animate={{
                              width: `${Math.min(
                                item.current_score,
                                100
                              )}%`,
                            }}
                            transition={{
                              duration: 0.8,
                            }}
                            className="h-full rounded-full bg-[#F6D76A]"
                          />
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                          Gap: {item.gap} points
                        </p>
                      </motion.div>
                    )
                  )
                ) : (
                  <p className="text-slate-500">
                    Skill data will appear after
                    assessment.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-2xl bg-[#172033] text-white p-7 relative overflow-hidden">
              <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-[#F6D76A]/10 blur-2xl" />

              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#F6D76A] flex items-center justify-center">
                    <Sparkles
                      size={21}
                      className="text-[#172033]"
                    />
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#F6D76A] font-bold">
                      AI Priority Skill
                    </p>

                    <h2 className="text-xl font-bold">
                      {result.weakestSkill}
                    </h2>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="text-sm text-white/60">
                    Current score
                  </div>

                  <div className="mt-1 text-4xl font-black">
                    {Number(
                      result.weakestScore || 0
                    ).toFixed(0)}
                    %
                  </div>
                </div>

                <div className="mt-7 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-start gap-3">
                    <Lightbulb
                      size={19}
                      className="text-[#F6D76A] mt-0.5"
                    />

                    <p className="text-sm leading-6 text-white/75">
                      {result.recommendation}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLearning}
                  className="mt-6 w-full py-3.5 rounded-xl bg-[#F6D76A] text-[#172033] font-bold flex items-center justify-center gap-2 hover:brightness-95"
                >
                  View Personalized Learning
                  <ArrowRight size={18} />
                </button>
              </div>
            </section>
          </div>

          {/* PERSONALIZED LEARNING PATH */}

          <section className="mt-6 bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#F6D76A]/30 flex items-center justify-center">
                <BrainCircuit
                  size={22}
                  className="text-[#9a7600]"
                />
              </div>

              <div>
                <h2 className="text-xl font-bold">
                  Personalized Learning Path
                </h2>

                <p className="text-sm text-slate-500">
                  Courses prioritized from your skill gaps
                </p>
              </div>
            </div>

            {result.learningPath.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-7">
                {result.learningPath.map(
                  (course, index) => (
                    <motion.div
                      key={
                        course.id ||
                        course.course_id ||
                        `${course.title}-${index}`
                      }
                      initial={{
                        opacity: 0,
                        y: 15,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: index * 0.08,
                      }}
                      className="p-5 rounded-xl bg-[#fffdf5] border border-slate-200"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full bg-[#F6D76A]/40 text-[#66531b] text-xs font-bold">
                          Priority {course.priority}
                        </span>

                        <span className="text-xs text-slate-500">
                          Gap {course.gap}
                        </span>
                      </div>

                      <h3 className="mt-4 font-bold text-slate-900">
                        {course.title ||
                          course.name ||
                          course.course_name ||
                          "Recommended Course"}
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        Focus: {course.target_skill}
                      </p>

                      {course.description && (
                        <p className="mt-2 text-xs text-slate-500 line-clamp-2">
                          {course.description}
                        </p>
                      )}
                    </motion.div>
                  )
                )}
              </div>
            ) : (
              <div className="mt-7 p-5 rounded-xl bg-[#fffdf5] border border-slate-200">
                <p className="text-slate-600">
                  Your learning path will be populated
                  from the available course catalogue.
                </p>
              </div>
            )}
          </section>

          {/* AI LEARNING LOOP */}

          <section className="mt-6 bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center">
                <Zap size={21} />
              </div>

              <div>
                <h2 className="text-xl font-bold">
                  STATWISE AI Learning Loop
                </h2>

                <p className="text-sm text-slate-500">
                  Your assessment now drives the next
                  learning decision.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mt-7">
              {[
                [
                  Target,
                  "1. Competency Update",
                  "Assessment score updates your competency profile.",
                ],
                [
                  BarChart3,
                  "2. Skill Gap",
                  "AI identifies the skills below their target level.",
                ],
                [
                  BrainCircuit,
                  "3. Learning Path",
                  "Courses are prioritized around the highest gaps.",
                ],
                [
                  Sparkles,
                  "4. AI Tutor",
                  "Use the tutor to get personalized support.",
                ],
              ].map(
                ([Icon, title, text]) => (
                  <div
                    key={title}
                    className="p-5 rounded-xl bg-[#fffdf5] border border-slate-200"
                  >
                    <Icon
                      size={22}
                      className="text-[#b18a00]"
                    />

                    <h3 className="mt-4 font-bold">
                      {title}
                    </h3>

                    <p className="mt-2 text-sm text-slate-500 leading-5">
                      {text}
                    </p>
                  </div>
                )
              )}
            </div>
          </section>

          {/* ACTIONS */}

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              onClick={handleRetake}
              className="flex-1 py-3.5 rounded-xl border border-slate-300 bg-white font-bold flex items-center justify-center gap-2 hover:bg-slate-50"
            >
              <RotateCcw size={18} />
              Retake Assessment
            </button>

            <button
              onClick={() => navigate("/skills")}
              className="flex-1 py-3.5 rounded-xl bg-[#172033] text-white font-bold flex items-center justify-center gap-2"
            >
              <BarChart3 size={18} />
              Explore Skill Intelligence
            </button>

            <button
              onClick={() => navigate("/tutor")}
              className="flex-1 py-3.5 rounded-xl bg-[#F6D76A] text-[#172033] font-bold flex items-center justify-center gap-2"
            >
              <Sparkles size={18} />
              Ask AI Tutor
            </button>
          </div>
        </main>
      </div>
    );
  }

  /* ==========================================================
     LOADING
  ========================================================== */

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-[#fffdf5] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
            className="mx-auto w-12 h-12 rounded-full border-4 border-slate-200 border-t-[#d5a900]"
          />

          <p className="mt-5 font-semibold text-slate-700">
            AI is preparing your assessment...
          </p>
        </div>
      </div>
    );
  }

  const options = currentQuestion.options || [];
  const questionText =
    currentQuestion.question || "Question unavailable";

  const skill =
    currentQuestion.skill || "Statistics";

  const difficulty =
    currentQuestion.difficulty ||
    currentDifficulty;

  /* ==========================================================
     QUESTION UI
  ========================================================== */

  return (
    <div className="min-h-screen bg-[#fffdf5] text-[#172033]">
      <div className="bg-[#172033] text-white">
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrainCircuit
              size={18}
              className="text-[#F6D76A]"
            />

            <span className="text-sm font-semibold">
              STATWISE AI
            </span>

            <span className="hidden sm:block text-white/30">
              |
            </span>

            <span className="hidden sm:block text-xs text-white/60">
              AI-Powered Competency Assessment
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-white/70">
            <Clock3 size={14} />
            {formattedTime}
          </div>
        </div>
      </div>

      <header className="bg-[#F6D76A] border-b border-[#d8b94c]">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 text-sm text-[#66531b]">
                <button
                  onClick={() =>
                    navigate("/assessments")
                  }
                  className="hover:underline"
                >
                  Assessments
                </button>

                <span>/</span>

                <span className="font-semibold">
                  Adaptive Assessment
                </span>
              </div>

              <h1 className="mt-2 text-2xl md:text-3xl font-black">
                AI Adaptive Competency Assessment
              </h1>

              {isPdfQuiz && (
                <p className="mt-2 text-xs font-semibold text-[#66531b]">
                  Generated from: {pdfName}
                </p>
              )}
            </div>

            <div className="px-4 py-2.5 rounded-xl bg-white/60 border border-white/70">
              <div className="flex items-center gap-2">
                <motion.span
                  animate={{
                    scale: [1, 1.25, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                  className="w-2 h-2 rounded-full bg-emerald-600"
                />

                <span className="text-xs font-bold uppercase tracking-wider text-[#66531b]">
                  AI Engine Active
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-xs font-semibold text-[#66531b] mb-2">
              <span>
                Question {questionNumber} of{" "}
                {TOTAL_QUESTIONS}
              </span>

              <span>
                {Math.round(progress)}%
              </span>
            </div>

            <div className="h-2.5 bg-white/60 rounded-full overflow-hidden">
              <motion.div
                animate={{
                  width: `${progress}%`,
                }}
                className="h-full bg-[#172033] rounded-full"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-7 py-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-full bg-[#F6D76A]/40 text-[#66531b] text-xs font-bold">
                  Adaptive Question
                </span>

                <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                  {skill}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  AI Difficulty
                </span>

                <span className="px-3 py-1.5 rounded-lg bg-[#172033] text-[#F6D76A] text-xs font-bold">
                  {difficulty}
                </span>
              </div>
            </div>

            <div className="p-7 md:p-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={
                    currentQuestion.question_id ||
                    questionNumber
                  }
                  initial={{
                    opacity: 0,
                    x: 20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -20,
                  }}
                >
                  <div className="text-sm font-bold text-[#b18a00]">
                    QUESTION {questionNumber}
                  </div>

                  <h2 className="mt-4 text-2xl md:text-3xl font-black leading-tight text-slate-900">
                    {questionText}
                  </h2>

                  <div className="mt-8 space-y-3">
                    {options.map(
                      (option, index) => {
                        const optionText =
                          getOptionText(option);

                        const isSelected =
                          selectedAnswer ===
                          optionText;

                        const isCorrectOption =
                          showFeedback &&
                          optionText
                            .trim()
                            .toLowerCase() ===
                            String(
                              currentQuestion.correct_answer
                            )
                              .trim()
                              .toLowerCase();

                        const isWrongSelected =
                          showFeedback &&
                          isSelected &&
                          !isCorrectOption;

                        return (
                          <motion.button
                            key={`${optionText}-${index}`}
                            whileHover={
                              !showFeedback
                                ? { x: 4 }
                                : {}
                            }
                            whileTap={
                              !showFeedback
                                ? { scale: 0.99 }
                                : {}
                            }
                            onClick={() =>
                              handleSelectAnswer(
                                optionText
                              )
                            }
                            disabled={showFeedback}
                            className={`
                              w-full text-left p-4 rounded-xl border-2 transition-all
                              ${
                                isCorrectOption
                                  ? "border-emerald-500 bg-emerald-50"
                                  : isWrongSelected
                                  ? "border-red-400 bg-red-50"
                                  : isSelected
                                  ? "border-[#d5a900] bg-[#F6D76A]/20"
                                  : "border-slate-200 hover:border-[#d5a900]/60 hover:bg-[#fffdf5]"
                              }
                            `}
                          >
                            <div className="flex items-center gap-4">
                              <span
                                className={`
                                  w-9 h-9 shrink-0 rounded-lg flex items-center justify-center font-bold text-sm
                                  ${
                                    isCorrectOption
                                      ? "bg-emerald-500 text-white"
                                      : isWrongSelected
                                      ? "bg-red-500 text-white"
                                      : isSelected
                                      ? "bg-[#172033] text-[#F6D76A]"
                                      : "bg-slate-100 text-slate-600"
                                  }
                                `}
                              >
                                {isCorrectOption ? (
                                  <Check size={17} />
                                ) : isWrongSelected ? (
                                  <XCircle size={17} />
                                ) : (
                                  String.fromCharCode(
                                    65 + index
                                  )
                                )}
                              </span>

                              <span className="flex-1 font-semibold text-slate-800">
                                {optionText}
                              </span>
                            </div>
                          </motion.button>
                        );
                      }
                    )}
                  </div>

                  <AnimatePresence>
                    {showFeedback && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          height: 0,
                        }}
                        animate={{
                          opacity: 1,
                          height: "auto",
                        }}
                        className={`
                          mt-6 p-4 rounded-xl border
                          ${
                            lastAnswerCorrect
                              ? "bg-emerald-50 border-emerald-200"
                              : "bg-red-50 border-red-200"
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          {lastAnswerCorrect ? (
                            <CheckCircle2
                              className="text-emerald-600 mt-0.5"
                              size={20}
                            />
                          ) : (
                            <XCircle
                              className="text-red-600 mt-0.5"
                              size={20}
                            />
                          )}

                          <div>
                            <p
                              className={`font-bold ${
                                lastAnswerCorrect
                                  ? "text-emerald-700"
                                  : "text-red-700"
                              }`}
                            >
                              {lastAnswerCorrect
                                ? "Correct!"
                                : "Not quite."}
                            </p>

                            <p className="mt-1 text-sm text-slate-600">
                              Your response has been
                              included in the skill-gap
                              analysis.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={handleNext}
                      disabled={
                        !selectedAnswer ||
                        isTransitioning
                      }
                      className={`
                        px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 transition
                        ${
                          selectedAnswer &&
                          !isTransitioning
                            ? "bg-[#172033] text-white hover:bg-[#202b42]"
                            : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        }
                      `}
                    >
                      {questionNumber >=
                      TOTAL_QUESTIONS
                        ? "Finish Assessment"
                        : "Next Adaptive Question"}

                      <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </section>

          <aside className="space-y-5">
            <div className="rounded-2xl bg-[#172033] text-white p-6 overflow-hidden relative">
              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F6D76A] flex items-center justify-center">
                    <BrainCircuit
                      size={21}
                      className="text-[#172033]"
                    />
                  </div>

                  <div>
                    <p className="font-bold">
                      Adaptive AI
                    </p>

                    <p className="text-xs text-white/50">
                      Real-time assessment engine
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-white/60">
                      Difficulty
                    </span>

                    <span className="text-sm font-bold text-[#F6D76A]">
                      {difficulty}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-white/60">
                      Skill
                    </span>

                    <span className="text-sm font-bold">
                      {skill}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-white/60">
                      Answered
                    </span>

                    <span className="text-sm font-bold">
                      {assessmentAnswers.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Target
                  size={20}
                  className="text-[#9a7600]"
                />

                <div>
                  <h3 className="font-bold">
                    Learning Intelligence
                  </h3>

                  <p className="text-xs text-slate-500">
                    Score → Skill Gap → Learning Path
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div className="p-3 rounded-xl bg-[#fffdf5]">
                  1. Evaluate your answers
                </div>

                <div className="p-3 rounded-xl bg-[#fffdf5]">
                  2. Detect competency gaps
                </div>

                <div className="p-3 rounded-xl bg-[#fffdf5]">
                  3. Prioritize learning
                </div>
              </div>
            </div>

            <div
              className={`
                rounded-2xl p-6 border
                ${
                  timeLeft <= 60
                    ? "bg-red-50 border-red-200"
                    : "bg-white border-slate-200"
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock3 size={20} />
                  <span className="font-bold">
                    Time Remaining
                  </span>
                </div>

                <span className="font-black">
                  {formattedTime}
                </span>
              </div>
            </div>

            <button
              onClick={() =>
                navigate("/assessments")
              }
              className="w-full py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold flex items-center justify-center gap-2 hover:bg-slate-50"
            >
              <ArrowLeft size={17} />
              Exit Assessment
            </button>
          </aside>
        </div>
      </main>

      <footer className="border-t border-slate-200 mt-8">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            STATWISE AI • Intelligent Learning.
            Measurable Impact.
          </p>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Zap size={13} />
            AI-powered adaptive assessment
          </div>
        </div>
      </footer>
    </div>
  );
}
