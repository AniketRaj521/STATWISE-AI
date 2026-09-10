import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import {
  Upload,
  FileText,
  Brain,
  Sparkles,
  Target,
  BookOpen,
  CheckCircle2,
  Clock3,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Play,
  RotateCcw,
  Award,
  BarChart3,
  Lightbulb,
  ShieldCheck,
  Zap,
  Search,
  X,
  Send,
  GraduationCap,
  Layers,
  Trophy,
  CircleDot,
  Route,
  ClipboardCheck,
  Cpu,
  Database,
  Network,
  RefreshCw,
  FileUp,
  MessageSquareText,
  Wand2,
  Lock,
} from "lucide-react";

/* =========================================================
   CONFIG
========================================================= */

const API_BASE = "http://127.0.0.1:8000";

/* =========================================================
   ANIMATION VARIANTS
========================================================= */

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 25,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: "easeOut",
    },
  },
};

const popVariants = {
  hidden: {
    opacity: 0,
    scale: 0.92,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
    },
  },
};

/* =========================================================
   HELPERS
========================================================= */

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function clamp(value, min = 0, max = 100) {
  const n = Number(value);

  if (Number.isNaN(n)) return min;

  return Math.max(min, Math.min(max, n));
}

function formatNumber(value) {
  const n = Number(value);

  if (Number.isNaN(n)) return 0;

  return Math.round(n);
}

function getStageColor(index) {
  const colors = [
    "from-yellow-300 via-amber-300 to-orange-300",
    "from-blue-300 via-cyan-300 to-indigo-300",
    "from-purple-300 via-fuchsia-300 to-pink-300",
    "from-emerald-300 via-teal-300 to-cyan-300",
    "from-orange-300 via-red-300 to-pink-300",
  ];

  return colors[index % colors.length];
}

function getLevelColor(level = "") {
  const value = level.toLowerCase();

  if (value.includes("advanced") || value.includes("expert")) {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }

  if (value.includes("intermediate")) {
    return "bg-blue-100 text-blue-700 border-blue-200";
  }

  return "bg-amber-100 text-amber-700 border-amber-200";
}

/* =========================================================
   AI GENERATION STAGES
========================================================= */

const generationStages = [
  {
    icon: FileText,
    title: "Reading material",
    description: "Extracting useful learning content",
  },
  {
    icon: Brain,
    title: "Understanding concepts",
    description: "Identifying topics and competencies",
  },
  {
    icon: Target,
    title: "Finding skill gaps",
    description: "Comparing your learning needs",
  },
  {
    icon: Route,
    title: "Building roadmap",
    description: "Creating your personalized path",
  },
  {
    icon: Sparkles,
    title: "Optimizing journey",
    description: "Preparing an adaptive experience",
  },
];

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Learning() {
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  /* -------------------------
     SOURCE
  ------------------------- */

  const [sourceMode, setSourceMode] = useState("pdf");
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState("");

  /* -------------------------
     PROFILE
  ------------------------- */

  const [role, setRole] = useState("Statistical Officer");
  const [experience, setExperience] = useState("2");
  const [assessmentScore, setAssessmentScore] = useState("60");
  const [quizAccuracy, setQuizAccuracy] = useState("60");

  const [learningGoal, setLearningGoal] = useState(
    "Master the uploaded learning material"
  );

  /* -------------------------
     GENERATION
  ------------------------- */

  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStage, setGenerationStage] = useState(0);

  /* -------------------------
     RESULT
  ------------------------- */

  const [learningPath, setLearningPath] = useState(null);

  /* -------------------------
     UI
  ------------------------- */

  const [expandedStages, setExpandedStages] = useState({});
  const [completedModules, setCompletedModules] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [showProfile, setShowProfile] = useState(true);
  const [showStrategy, setShowStrategy] = useState(true);
  const [showMilestones, setShowMilestones] = useState(true);
  const [showUpload, setShowUpload] = useState(true);

  /* =========================================================
     FILE HANDLING
  ========================================================= */

  const handleFileSelect = (file) => {
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please select a PDF file.");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error("PDF size must be below 20 MB.");
      return;
    }

    setSelectedFile(file);
    setSourceMode("pdf");

    toast.success("Learning material selected.");
  };

  const handleFileInput = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();

    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleFileSelect(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =========================================================
     TEXT INPUT
  ========================================================= */

  const handleTextChange = (event) => {
    const value = event.target.value;

    if (value.length <= 50000) {
      setPastedText(value);
    }
  };

  const insertExampleText = () => {
    const example = `Introduction to Statistical Analysis

Statistical analysis is the process of collecting, organizing,
analyzing and interpreting data.

Descriptive statistics summarize data using measures such as
mean, median, mode, variance and standard deviation.

Inferential statistics use sample data to make conclusions
about a larger population.

Probability is used to measure uncertainty and forms the
foundation for statistical inference.

Regression analysis is used to understand relationships
between variables and make predictions.

Data visualization helps communicate statistical findings
using charts, graphs and dashboards.`;

    setPastedText(example);
    toast.success("Example learning material inserted.");
  };

  /* =========================================================
     GENERATE PATH
  ========================================================= */

  const generateLearningPath = async () => {
    if (sourceMode === "pdf" && !selectedFile) {
      toast.error("Please upload a PDF first.");
      return;
    }

    if (sourceMode === "text" && pastedText.trim().length < 100) {
      toast.error("Please enter at least 100 characters of learning material.");
      return;
    }

    setGenerating(true);
    setGenerationProgress(0);
    setGenerationStage(0);
    setLearningPath(null);

    try {
      /* -----------------------------------------------
         Animation progress
      ------------------------------------------------ */

      const progressTimer = setInterval(() => {
        setGenerationProgress((previous) => {
          if (previous >= 92) {
            return previous;
          }

          const next = previous + Math.random() * 7;

          return Math.min(next, 92);
        });
      }, 500);

      const stageTimer = setInterval(() => {
        setGenerationStage((previous) => {
          return Math.min(previous + 1, generationStages.length - 1);
        });
      }, 1200);

      let response;

      /* -----------------------------------------------
         PDF
      ------------------------------------------------ */

      if (sourceMode === "pdf") {
        const formData = new FormData();

        formData.append("file", selectedFile);

        formData.append("role", role);

        formData.append(
          "assessment_score",
          String(Number(assessmentScore) || 60)
        );

        formData.append(
          "quiz_accuracy",
          String(Number(quizAccuracy) || 60)
        );

        formData.append(
          "years_experience",
          String(Number(experience) || 0)
        );

        formData.append("learning_goal", learningGoal);

        response = await axios.post(
          `${API_BASE}/personalized-learning-path`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            timeout: 120000,
          }
        );
      }

      /* -----------------------------------------------
         TEXT
      ------------------------------------------------ */

      if (sourceMode === "text") {
        const formData = new FormData();

        formData.append("text", pastedText);

        formData.append("role", role);

        formData.append(
          "assessment_score",
          String(Number(assessmentScore) || 60)
        );

        formData.append(
          "quiz_accuracy",
          String(Number(quizAccuracy) || 60)
        );

        formData.append(
          "years_experience",
          String(Number(experience) || 0)
        );

        formData.append("learning_goal", learningGoal);

        response = await axios.post(
          `${API_BASE}/personalized-learning-path-text`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            timeout: 120000,
          }
        );
      }

      clearInterval(progressTimer);
      clearInterval(stageTimer);

      if (!response?.data?.success) {
        throw new Error(
          response?.data?.message ||
            response?.data?.error ||
            "Learning path generation failed."
        );
      }

      const path = response.data.learning_path;

      if (!path) {
        throw new Error("Backend returned an empty learning path.");
      }

      setGenerationProgress(100);
      setGenerationStage(generationStages.length - 1);

      await new Promise((resolve) => setTimeout(resolve, 700));

      setLearningPath(path);

      setExpandedStages({
        0: true,
      });

      toast.success("Your personalized learning path is ready!");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Learning Path Error:", error);

      let message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Something went wrong while generating the learning path.";

      if (error.code === "ECONNABORTED") {
        message = "AI generation took too long. Please try again.";
      }

      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  /* =========================================================
     MODULE COMPLETION
  ========================================================= */

  const toggleModule = (moduleId) => {
    setCompletedModules((previous) => ({
      ...previous,
      [moduleId]: !previous[moduleId],
    }));
  };

  /* =========================================================
     STAGE EXPANSION
  ========================================================= */

  const toggleStage = (index) => {
    setExpandedStages((previous) => ({
      ...previous,
      [index]: !previous[index],
    }));
  };

  /* =========================================================
     NORMALIZED STAGES
  ========================================================= */

  const stages = useMemo(() => {
    if (!learningPath) return [];

    return safeArray(learningPath.stages).map((stage, index) => ({
      id: stage.id || `stage-${index + 1}`,
      title: stage.title || `Learning Stage ${index + 1}`,
      description:
        stage.description ||
        "Build the required knowledge and practical skills.",
      duration: stage.duration || "Self-paced",
      objective:
        stage.objective ||
        "Develop the competency required for the next stage.",
      modules: safeArray(stage.modules).map((module, moduleIndex) => ({
        id:
          module.id ||
          `${stage.id || `stage-${index + 1}`}-module-${moduleIndex + 1}`,
        title: module.title || `Learning Module ${moduleIndex + 1}`,
        description:
          module.description ||
          "Study the concepts and complete the recommended activities.",
        duration: module.duration || "2 hours",
        difficulty: module.difficulty || "Intermediate",
        type: module.type || "Learning",
        activity:
          module.activity ||
          "Study the material and complete the recommended practice.",
        resources: safeArray(module.resources),
      })),
    }));
  }, [learningPath]);

  /* =========================================================
     ALL MODULES
  ========================================================= */

  const allModules = useMemo(() => {
    return stages.flatMap((stage) => stage.modules);
  }, [stages]);

  /* =========================================================
     PROGRESS
  ========================================================= */

  const completedCount = allModules.filter(
    (module) => completedModules[module.id]
  ).length;

  const progressPercentage =
    allModules.length > 0
      ? Math.round((completedCount / allModules.length) * 100)
      : Number(learningPath?.completion || 0);

  /* =========================================================
     SEARCHED MODULES
  ========================================================= */

  const filteredStages = useMemo(() => {
    if (!searchTerm.trim()) return stages;

    const query = searchTerm.toLowerCase();

    return stages
      .map((stage) => ({
        ...stage,
        modules: stage.modules.filter((module) => {
          return (
            module.title.toLowerCase().includes(query) ||
            module.description.toLowerCase().includes(query) ||
            module.type.toLowerCase().includes(query)
          );
        }),
      }))
      .filter((stage) => {
        return (
          stage.title.toLowerCase().includes(query) ||
          stage.description.toLowerCase().includes(query) ||
          stage.modules.length > 0
        );
      });
  }, [stages, searchTerm]);

  /* =========================================================
     RESET
  ========================================================= */

  const resetLearningPath = () => {
    setLearningPath(null);
    setCompletedModules({});
    setExpandedStages({});
    setSearchTerm("");
    setGenerationProgress(0);
    setGenerationStage(0);

    toast.success("Ready to create a new learning journey.");
  };

  /* =========================================================
     ENTERPRISE-STYLE DEMO
  ========================================================= */

  const useDemoPath = () => {
    const demo = {
      title: "Personalized Statistical Learning Journey",
      subtitle:
        "An adaptive roadmap designed around your competency profile.",
      learner_level: "Intermediate",
      goal: learningGoal,
      estimated_hours: 24,
      completion: 0,
      strengths: [
        "Basic statistical concepts",
        "Understanding of data interpretation",
        "Familiarity with data visualization",
      ],
      skill_gaps: [
        {
          skill: "Probability",
          current_score: 42,
          target_score: 80,
          gap: 38,
        },
        {
          skill: "Data Analysis",
          current_score: 58,
          target_score: 80,
          gap: 22,
        },
        {
          skill: "Statistical Computing",
          current_score: 48,
          target_score: 75,
          gap: 27,
        },
      ],
      strategy:
        "Start with probability fundamentals, strengthen analytical reasoning, then move toward applied statistical computing and project-based practice.",
      stages: [
        {
          id: "S1",
          title: "Foundation",
          description: "Build strong statistical fundamentals.",
          duration: "Week 1",
          objective: "Strengthen core concepts.",
          modules: [
            {
              id: "M1",
              title: "Probability Fundamentals",
              description:
                "Understand probability concepts and uncertainty.",
              duration: "3 hours",
              difficulty: "Beginner",
              type: "Concept",
              activity: "Learn → Practice → Quiz",
            },
            {
              id: "M2",
              title: "Descriptive Statistics",
              description:
                "Master measures of central tendency and dispersion.",
              duration: "3 hours",
              difficulty: "Beginner",
              type: "Concept",
              activity: "Learn → Practice",
            },
          ],
        },
        {
          id: "S2",
          title: "Intermediate Analysis",
          description: "Move from concepts to analytical reasoning.",
          duration: "Week 2",
          objective: "Develop practical analytical ability.",
          modules: [
            {
              id: "M3",
              title: "Probability Distributions",
              description:
                "Explore common probability distributions and their applications.",
              duration: "4 hours",
              difficulty: "Intermediate",
              type: "Learning",
              activity: "Learn → Practice → Assessment",
            },
            {
              id: "M4",
              title: "Regression Analysis",
              description:
                "Understand relationships between variables and predictions.",
              duration: "4 hours",
              difficulty: "Intermediate",
              type: "Applied",
              activity: "Learn → Case Study",
            },
          ],
        },
        {
          id: "S3",
          title: "Applied Practice",
          description: "Apply statistical knowledge to realistic problems.",
          duration: "Week 3",
          objective: "Build confidence through application.",
          modules: [
            {
              id: "M5",
              title: "Statistical Computing",
              description:
                "Use computational tools for statistical analysis.",
              duration: "5 hours",
              difficulty: "Intermediate",
              type: "Practical",
              activity: "Lab → Practice → Quiz",
            },
          ],
        },
      ],
      milestones: [
        {
          title: "Foundation Mastery",
          description: "Complete statistical fundamentals.",
        },
        {
          title: "Analytical Confidence",
          description: "Successfully solve intermediate problems.",
        },
        {
          title: "Applied Competency",
          description: "Complete a practical statistical task.",
        },
      ],
      outcome:
        "After completing the pathway, the learner should demonstrate stronger statistical reasoning, analytical confidence and practical competency.",
    };

    setLearningPath(demo);
    setExpandedStages({ 0: true });

    toast.success("Demo learning path loaded.");
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-[#fffdf5] text-[#172033] overflow-x-hidden"
    >
      {/* =====================================================
          BACKGROUND EFFECTS
      ===================================================== */}

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: [0, 80, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-yellow-200/30 rounded-full blur-3xl"
        />

        <motion.div
          animate={{
            x: [0, -60, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] bg-blue-200/20 rounded-full blur-3xl"
        />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(#172033 1px, transparent 1px), linear-gradient(90deg, #172033 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ===================================================
            HEADER
        =================================================== */}

        <motion.div
          variants={itemVariants}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-100 border border-yellow-200 text-yellow-800 text-xs font-bold mb-4">
              <Sparkles size={14} />
              AI PERSONALIZED LEARNING
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight">
              Your Learning
              <span className="text-yellow-500"> Journey</span>
            </h1>

            <p className="mt-3 text-gray-600 max-w-2xl text-base md:text-lg">
              Upload learning material or paste content and let STATWISE AI
              build an intelligent, competency-driven learning path for you.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={useDemoPath}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition flex items-center gap-2 font-semibold text-sm shadow-sm"
            >
              <Wand2 size={17} />
              Demo Path
            </button>

            {learningPath && (
              <button
                onClick={resetLearningPath}
                className="px-4 py-2.5 rounded-xl bg-[#172033] text-white hover:bg-black transition flex items-center gap-2 font-semibold text-sm shadow-lg"
              >
                <RotateCcw size={17} />
                New Path
              </button>
            )}
          </div>
        </motion.div>

        {/* ===================================================
            AI BRAIN HERO
        =================================================== */}

        <motion.div
          variants={itemVariants}
          className="relative mb-8 rounded-[2rem] overflow-hidden bg-[#172033] text-white shadow-2xl"
        >
          <div className="absolute inset-0 opacity-20">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 20%, rgba(246,215,106,.7) 0 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
          </div>

          <div className="relative grid lg:grid-cols-[1fr_320px] gap-8 p-7 md:p-10">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-yellow-300 text-[#172033] flex items-center justify-center shadow-lg">
                  <Brain size={25} />
                </div>

                <div>
                  <p className="text-yellow-300 text-xs font-bold uppercase tracking-wider">
                    STATWISE INTELLIGENCE ENGINE
                  </p>

                  <h2 className="font-bold text-xl">
                    Learn smarter. Not harder.
                  </h2>
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl font-black leading-tight max-w-3xl">
                From learning material to a
                <span className="text-yellow-300"> personalized roadmap.</span>
              </h2>

              <p className="text-white/65 mt-4 max-w-2xl leading-relaxed">
                STATWISE AI analyzes your material, competency profile,
                learning goal and performance indicators to create a structured
                journey from foundation to mastery.
              </p>

              <div className="flex flex-wrap gap-3 mt-7">
                {[
                  "AI Skill Mapping",
                  "Adaptive Learning",
                  "Competency Gaps",
                  "Progress Tracking",
                ].map((item) => (
                  <div
                    key={item}
                    className="px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-xs font-semibold"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Animated AI Core */}

            <div className="relative min-h-[240px] flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 18,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute w-56 h-56 rounded-full border border-yellow-300/20 border-dashed"
              />

              <motion.div
                animate={{ rotate: -360 }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute w-40 h-40 rounded-full border border-blue-300/20"
              />

              <motion.div
                animate={{
                  scale: [1, 1.08, 1],
                  boxShadow: [
                    "0 0 20px rgba(246,215,106,.2)",
                    "0 0 55px rgba(246,215,106,.45)",
                    "0 0 20px rgba(246,215,106,.2)",
                  ],
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                }}
                className="relative w-28 h-28 rounded-full bg-yellow-300 text-[#172033] flex items-center justify-center"
              >
                <Brain size={48} />
              </motion.div>

              {[Cpu, Database, Target, BookOpen].map((Icon, index) => {
                const positions = [
                  "top-5 left-1/2 -translate-x-1/2",
                  "bottom-5 left-8",
                  "bottom-5 right-8",
                  "top-1/2 -right-1",
                ];

                return (
                  <motion.div
                    key={index}
                    animate={{
                      y: [0, -7, 0],
                    }}
                    transition={{
                      duration: 2 + index * 0.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className={`absolute ${positions[index]} w-11 h-11 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center`}
                  >
                    <Icon size={19} className="text-yellow-200" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ===================================================
            PROFILE
        =================================================== */}

        <motion.div variants={itemVariants} className="mb-8">
          <button
            onClick={() => setShowProfile((value) => !value)}
            className="w-full flex items-center justify-between p-5 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <GraduationCap size={21} />
              </div>

              <div className="text-left">
                <h3 className="font-bold text-lg">Learner Profile</h3>
                <p className="text-sm text-gray-500">
                  Help AI understand your current competency level.
                </p>
              </div>
            </div>

            {showProfile ? <ChevronUp /> : <ChevronDown />}
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <InputField
                      label="Role"
                      value={role}
                      onChange={setRole}
                      placeholder="Statistical Officer"
                    />

                    <InputField
                      label="Experience"
                      value={experience}
                      onChange={setExperience}
                      type="number"
                      suffix="years"
                    />

                    <InputField
                      label="Assessment Score"
                      value={assessmentScore}
                      onChange={setAssessmentScore}
                      type="number"
                      suffix="%"
                    />

                    <InputField
                      label="Quiz Accuracy"
                      value={quizAccuracy}
                      onChange={setQuizAccuracy}
                      type="number"
                      suffix="%"
                    />
                  </div>

                  <div className="mt-5">
                    <label className="block text-sm font-bold mb-2">
                      Learning Goal
                    </label>

                    <select
                      value={learningGoal}
                      onChange={(event) =>
                        setLearningGoal(event.target.value)
                      }
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-300"
                    >
                      <option>
                        Master the uploaded learning material
                      </option>
                      <option>
                        Prepare for competency assessment
                      </option>
                      <option>
                        Strengthen weak statistical skills
                      </option>
                      <option>
                        Build practical job-ready skills
                      </option>
                      <option>
                        Prepare for advanced statistical analysis
                      </option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ===================================================
            SOURCE SECTION
        =================================================== */}

        {!learningPath && (
          <motion.div variants={itemVariants} className="mb-10">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* PDF */}

              <motion.div
                whileHover={{ y: -4 }}
                className={`rounded-[1.7rem] border-2 transition-all ${
                  sourceMode === "pdf"
                    ? "border-yellow-300 bg-yellow-50/50"
                    : "border-gray-200 bg-white"
                } p-6 shadow-sm`}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                      <FileText size={24} />
                    </div>

                    <div>
                      <h3 className="font-black text-lg">
                        Upload PDF
                      </h3>

                      <p className="text-sm text-gray-500">
                        Recommended for complete material
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSourceMode("pdf")}
                    className={`w-5 h-5 rounded-full border-2 ${
                      sourceMode === "pdf"
                        ? "border-yellow-500 bg-yellow-400"
                        : "border-gray-300"
                    }`}
                  />
                </div>

                <div
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => {
                    setSourceMode("pdf");
                    fileInputRef.current?.click();
                  }}
                  className="cursor-pointer rounded-2xl border-2 border-dashed border-gray-300 hover:border-yellow-400 hover:bg-yellow-50/50 transition p-8 text-center"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileInput}
                    className="hidden"
                  />

                  <motion.div
                    animate={{
                      y: [0, -6, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                    }}
                    className="mx-auto w-16 h-16 rounded-2xl bg-yellow-100 text-yellow-700 flex items-center justify-center mb-4"
                  >
                    <Upload size={27} />
                  </motion.div>

                  <h4 className="font-bold">
                    Drop your PDF here
                  </h4>

                  <p className="text-sm text-gray-500 mt-1">
                    or click to browse your computer
                  </p>

                  <p className="text-xs text-gray-400 mt-4">
                    PDF • Maximum 20 MB
                  </p>
                </div>

                <AnimatePresence>
                  {selectedFile && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-200"
                    >
                      <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                        <FileText size={19} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {selectedFile.name}
                        </p>

                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>

                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          removeFile();
                        }}
                        className="w-8 h-8 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 flex items-center justify-center"
                      >
                        <X size={17} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* TEXT */}

              <motion.div
                whileHover={{ y: -4 }}
                className={`rounded-[1.7rem] border-2 transition-all ${
                  sourceMode === "text"
                    ? "border-yellow-300 bg-yellow-50/50"
                    : "border-gray-200 bg-white"
                } p-6 shadow-sm`}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                      <MessageSquareText size={24} />
                    </div>

                    <div>
                      <h3 className="font-black text-lg">
                        Paste Learning Material
                      </h3>

                      <p className="text-sm text-gray-500">
                        Quickly analyze text content
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSourceMode("text")}
                    className={`w-5 h-5 rounded-full border-2 ${
                      sourceMode === "text"
                        ? "border-yellow-500 bg-yellow-400"
                        : "border-gray-300"
                    }`}
                  />
                </div>

                <textarea
                  ref={textareaRef}
                  value={pastedText}
                  onChange={handleTextChange}
                  onFocus={() => setSourceMode("text")}
                  placeholder="Paste your learning material here...

Example:
Statistical analysis is the process of collecting,
organizing, analyzing and interpreting data..."
                  className="w-full h-[215px] resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300 transition"
                />

                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-400">
                    {pastedText.length.toLocaleString()} / 50,000 characters
                  </span>

                  <button
                    onClick={insertExampleText}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    Insert Example
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Generate button */}

            <motion.div
              whileHover={{ scale: 1.01 }}
              className="mt-6 rounded-2xl bg-white border border-gray-200 p-4 shadow-sm"
            >
              <button
                disabled={generating}
                onClick={generateLearningPath}
                className="w-full py-4 rounded-xl bg-[#172033] text-white font-black text-lg flex items-center justify-center gap-3 hover:bg-black transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <RefreshCw className="animate-spin" size={21} />
                    AI is building your learning journey...
                  </>
                ) : (
                  <>
                    <Sparkles size={21} className="text-yellow-300" />
                    Generate My Personalized Learning Path
                    <ArrowRight size={21} />
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* ===================================================
            GENERATION SCREEN
        =================================================== */}

        <AnimatePresence>
          {generating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="fixed inset-0 z-50 bg-[#172033]/90 backdrop-blur-md flex items-center justify-center p-4"
            >
              <div className="w-full max-w-2xl rounded-[2rem] bg-white p-7 md:p-10 shadow-2xl">
                <div className="text-center">
                  <motion.div
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="mx-auto w-24 h-24 rounded-full border-4 border-yellow-100 border-t-yellow-400 flex items-center justify-center"
                  >
                    <Brain className="text-[#172033]" size={40} />
                  </motion.div>

                  <h2 className="text-2xl md:text-3xl font-black mt-6">
                    STATWISE AI is thinking...
                  </h2>

                  <p className="text-gray-500 mt-2">
                    Creating a competency-aware learning journey from your
                    material.
                  </p>
                </div>

                <div className="mt-8 space-y-3">
                  {generationStages.map((stage, index) => {
                    const Icon = stage.icon;

                    const active = index <= generationStage;

                    return (
                      <motion.div
                        key={stage.title}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: index * 0.12,
                        }}
                        className={`flex items-center gap-4 p-4 rounded-xl transition ${
                          active
                            ? "bg-yellow-50 border border-yellow-200"
                            : "bg-gray-50"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            active
                              ? "bg-yellow-300 text-[#172033]"
                              : "bg-gray-200 text-gray-400"
                          }`}
                        >
                          {index < generationStage ? (
                            <CheckCircle2 size={20} />
                          ) : (
                            <Icon size={20} />
                          )}
                        </div>

                        <div className="flex-1">
                          <p
                            className={`font-bold ${
                              active
                                ? "text-[#172033]"
                                : "text-gray-400"
                            }`}
                          >
                            {stage.title}
                          </p>

                          <p className="text-xs text-gray-500">
                            {stage.description}
                          </p>
                        </div>

                        {index === generationStage && (
                          <motion.div
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{
                              duration: 1.2,
                              repeat: Infinity,
                            }}
                            className="w-2.5 h-2.5 rounded-full bg-yellow-400"
                          />
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mt-7">
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span>AI Processing</span>
                    <span>{Math.round(generationProgress)}%</span>
                  </div>

                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full"
                      animate={{
                        width: `${generationProgress}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===================================================
            LEARNING PATH RESULT
        =================================================== */}

        <AnimatePresence>
          {learningPath && !generating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-7"
            >
              {/* Result Hero */}

              <motion.div
                variants={popVariants}
                initial="hidden"
                animate="visible"
                className="relative rounded-[2rem] bg-white border border-gray-200 shadow-xl overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-200/30 rounded-full blur-3xl" />

                <div className="relative p-7 md:p-9">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold mb-4">
                        <CheckCircle2 size={14} />
                        AI PATH GENERATED
                      </div>

                      <h2 className="text-3xl md:text-4xl font-black">
                        {learningPath.title ||
                          "Your Personalized Learning Journey"}
                      </h2>

                      <p className="text-gray-600 mt-3 max-w-3xl leading-relaxed">
                        {learningPath.subtitle ||
                          "A personalized roadmap designed around your learning needs and competency gaps."}
                      </p>

                      <div className="flex flex-wrap gap-3 mt-5">
                        <Tag
                          icon={<GraduationCap size={14} />}
                          text={
                            learningPath.learner_level ||
                            "Personalized Level"
                          }
                        />

                        <Tag
                          icon={<Clock3 size={14} />}
                          text={`${learningPath.estimated_hours || 0} hours`}
                        />

                        <Tag
                          icon={<Layers size={14} />}
                          text={`${allModules.length} modules`}
                        />

                        <Tag
                          icon={<Route size={14} />}
                          text={`${stages.length} stages`}
                        />
                      </div>
                    </div>

                    <div className="shrink-0">
                      <div className="relative w-28 h-28">
                        <svg
                          viewBox="0 0 100 100"
                          className="w-full h-full -rotate-90"
                        >
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            stroke="#f3f4f6"
                            strokeWidth="9"
                            fill="none"
                          />

                          <motion.circle
                            cx="50"
                            cy="50"
                            r="42"
                            stroke="#f6d76a"
                            strokeWidth="9"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray="264"
                            initial={{ strokeDashoffset: 264 }}
                            animate={{
                              strokeDashoffset:
                                264 - (264 * progressPercentage) / 100,
                            }}
                            transition={{
                              duration: 1.2,
                            }}
                          />
                        </svg>

                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-black">
                            {progressPercentage}%
                          </span>

                          <span className="text-[10px] uppercase font-bold text-gray-400">
                            Complete
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* =================================================
                  QUICK STATS
              ================================================= */}

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={<Route size={20} />}
                  label="Learning Stages"
                  value={stages.length}
                  text="Structured journey"
                />

                <StatCard
                  icon={<BookOpen size={20} />}
                  label="Modules"
                  value={allModules.length}
                  text="Personalized modules"
                />

                <StatCard
                  icon={<CheckCircle2 size={20} />}
                  label="Completed"
                  value={completedCount}
                  text="Your progress"
                />

                <StatCard
                  icon={<Clock3 size={20} />}
                  label="Estimated Time"
                  value={`${learningPath.estimated_hours || 0}h`}
                  text="AI estimated"
                />
              </div>

              {/* =================================================
                  SEARCH
              ================================================= */}

              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search your learning modules..."
                    className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-11 pr-10 outline-none focus:ring-2 focus:ring-yellow-300"
                  />

                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      <X size={17} />
                    </button>
                  )}
                </div>

                <button
                  onClick={() =>
                    toast.success(
                      "Your learning path is continuously adaptive."
                    )
                  }
                  className="px-5 py-3 rounded-xl bg-[#172033] text-white font-bold flex items-center justify-center gap-2"
                >
                  <Zap size={17} className="text-yellow-300" />
                  Adaptive Mode
                </button>
              </div>

              {/* =================================================
                  SKILL GAP + STRENGTHS
              ================================================= */}

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Skill Gaps */}

                <motion.div
                  variants={itemVariants}
                  className="rounded-[1.5rem] bg-white border border-gray-200 shadow-sm p-6"
                >
                  <SectionHeader
                    icon={<Target size={20} />}
                    title="Priority Skill Gaps"
                    subtitle="Competencies your pathway focuses on first."
                  />

                  <div className="mt-5 space-y-4">
                    {safeArray(learningPath.skill_gaps).length === 0 ? (
                      <EmptyState
                        icon={<Target size={25} />}
                        text="No explicit skill gaps were returned by the AI."
                      />
                    ) : (
                      safeArray(learningPath.skill_gaps).map(
                        (gap, index) => {
                          const current = clamp(
                            gap.current_score ??
                              gap.current ??
                              gap.score ??
                              0
                          );

                          const target = clamp(
                            gap.target_score ?? gap.target ?? 80
                          );

                          const gapValue = Math.max(
                            0,
                            target - current
                          );

                          return (
                            <div key={index}>
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-sm">
                                  {gap.skill ||
                                    gap.name ||
                                    `Competency ${index + 1}`}
                                </span>

                                <span className="text-xs font-bold text-red-500">
                                  Gap {formatNumber(gapValue)}%
                                </span>
                              </div>

                              <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${current}%`,
                                  }}
                                  transition={{
                                    duration: 0.9,
                                    delay: index * 0.1,
                                  }}
                                  className="h-full bg-gradient-to-r from-red-300 to-orange-400 rounded-full"
                                />
                              </div>

                              <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                                <span>
                                  Current {formatNumber(current)}%
                                </span>

                                <span>
                                  Target {formatNumber(target)}%
                                </span>
                              </div>
                            </div>
                          );
                        }
                      )
                    )}
                  </div>
                </motion.div>

                {/* Strengths */}

                <motion.div
                  variants={itemVariants}
                  className="rounded-[1.5rem] bg-white border border-gray-200 shadow-sm p-6"
                >
                  <SectionHeader
                    icon={<Award size={20} />}
                    title="Your Strengths"
                    subtitle="Areas the AI believes you can leverage."
                  />

                  <div className="mt-5 space-y-3">
                    {safeArray(learningPath.strengths).length === 0 ? (
                      <EmptyState
                        icon={<Award size={25} />}
                        text="No explicit strengths were returned."
                      />
                    ) : (
                      safeArray(learningPath.strengths).map(
                        (strength, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: index * 0.08,
                            }}
                            className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-100"
                          >
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                              <CheckCircle2 size={17} />
                            </div>

                            <p className="text-sm font-semibold text-emerald-900">
                              {typeof strength === "string"
                                ? strength
                                : strength.name ||
                                  strength.skill ||
                                  strength.description ||
                                  "Strength identified"}
                            </p>
                          </motion.div>
                        )
                      )
                    )}
                  </div>
                </motion.div>
              </div>

              {/* =================================================
                  LEARNING ROADMAP
              ================================================= */}

              <motion.div variants={itemVariants}>
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5">
                  <div>
                    <div className="inline-flex items-center gap-2 text-yellow-700 font-bold text-sm">
                      <Route size={17} />
                      PERSONALIZED ROADMAP
                    </div>

                    <h2 className="text-2xl md:text-3xl font-black mt-1">
                      Your journey to mastery
                    </h2>

                    <p className="text-gray-500 mt-1">
                      Follow the stages in order and complete each module.
                    </p>
                  </div>

                  <div className="text-sm font-bold text-gray-500">
                    {completedCount}/{allModules.length} modules completed
                  </div>
                </div>

                <div className="space-y-5">
                  {filteredStages.length === 0 ? (
                    <div className="p-12 text-center rounded-2xl bg-white border border-gray-200">
                      <Search
                        className="mx-auto text-gray-300"
                        size={40}
                      />

                      <p className="mt-3 font-bold">
                        No modules found
                      </p>

                      <button
                        onClick={() => setSearchTerm("")}
                        className="mt-3 text-sm font-bold text-blue-600"
                      >
                        Clear search
                      </button>
                    </div>
                  ) : (
                    filteredStages.map((stage, stageIndex) => {
                      const originalIndex = stages.findIndex(
                        (item) => item.id === stage.id
                      );

                      const isOpen =
                        expandedStages[originalIndex] || false;

                      const stageCompleted = stage.modules.filter(
                        (module) => completedModules[module.id]
                      ).length;

                      const stageProgress =
                        stage.modules.length > 0
                          ? Math.round(
                              (stageCompleted /
                                stage.modules.length) *
                                100
                            )
                          : 0;

                      return (
                        <motion.div
                          key={stage.id}
                          initial={{
                            opacity: 0,
                            y: 25,
                          }}
                          whileInView={{
                            opacity: 1,
                            y: 0,
                          }}
                          viewport={{
                            once: true,
                          }}
                          className="relative"
                        >
                          {/* connector */}

                          {stageIndex <
                            filteredStages.length - 1 && (
                            <div className="absolute left-7 top-20 bottom-[-20px] w-0.5 bg-gray-200 hidden md:block" />
                          )}

                          <div className="relative bg-white border border-gray-200 rounded-[1.5rem] shadow-sm overflow-hidden">
                            <button
                              onClick={() =>
                                toggleStage(originalIndex)
                              }
                              className="w-full text-left p-5 md:p-6 hover:bg-gray-50 transition"
                            >
                              <div className="flex items-start gap-4">
                                <div
                                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getStageColor(
                                    stageIndex
                                  )} flex items-center justify-center text-[#172033] font-black shrink-0 shadow-sm`}
                                >
                                  {stageIndex + 1}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="font-black text-xl">
                                      {stage.title}
                                    </h3>

                                    <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold">
                                      {stage.duration}
                                    </span>
                                  </div>

                                  <p className="text-gray-500 text-sm mt-1">
                                    {stage.description}
                                  </p>

                                  <div className="mt-4 max-w-xl">
                                    <div className="flex justify-between text-[11px] font-bold text-gray-400 mb-1">
                                      <span>
                                        Stage progress
                                      </span>

                                      <span>
                                        {stageCompleted}/
                                        {stage.modules.length}
                                      </span>
                                    </div>

                                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                      <motion.div
                                        animate={{
                                          width: `${stageProgress}%`,
                                        }}
                                        className="h-full bg-yellow-400 rounded-full"
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                                  {isOpen ? (
                                    <ChevronUp size={19} />
                                  ) : (
                                    <ChevronDown size={19} />
                                  )}
                                </div>
                              </div>
                            </button>

                            <AnimatePresence initial={false}>
                              {isOpen && (
                                <motion.div
                                  initial={{
                                    height: 0,
                                    opacity: 0,
                                  }}
                                  animate={{
                                    height: "auto",
                                    opacity: 1,
                                  }}
                                  exit={{
                                    height: 0,
                                    opacity: 0,
                                  }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-5 md:px-6 pb-6">
                                    <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-100 mb-5">
                                      <div className="flex items-start gap-3">
                                        <Lightbulb
                                          size={19}
                                          className="text-yellow-600 mt-0.5"
                                        />

                                        <div>
                                          <p className="text-xs font-bold uppercase tracking-wider text-yellow-700">
                                            Stage Objective
                                          </p>

                                          <p className="text-sm font-medium text-yellow-900 mt-1">
                                            {stage.objective}
                                          </p>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="space-y-3">
                                      {stage.modules.map(
                                        (
                                          module,
                                          moduleIndex
                                        ) => {
                                          const completed =
                                            completedModules[
                                              module.id
                                            ];

                                          return (
                                            <motion.div
                                              key={module.id}
                                              whileHover={{
                                                scale: 1.005,
                                              }}
                                              className={`rounded-2xl border transition-all ${
                                                completed
                                                  ? "border-emerald-200 bg-emerald-50/60"
                                                  : "border-gray-200 bg-white"
                                              } p-4`}
                                            >
                                              <div className="flex items-start gap-4">
                                                <button
                                                  onClick={() =>
                                                    toggleModule(
                                                      module.id
                                                    )
                                                  }
                                                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition ${
                                                    completed
                                                      ? "bg-emerald-500 text-white"
                                                      : "bg-gray-100 text-gray-400 hover:bg-yellow-100 hover:text-yellow-700"
                                                  }`}
                                                >
                                                  {completed ? (
                                                    <CheckCircle2
                                                      size={20}
                                                    />
                                                  ) : (
                                                    <CircleDot
                                                      size={20}
                                                    />
                                                  )}
                                                </button>

                                                <div className="flex-1 min-w-0">
                                                  <div className="flex flex-wrap gap-2 items-center">
                                                    <span className="text-[11px] font-black text-gray-400">
                                                      MODULE{" "}
                                                      {moduleIndex +
                                                        1}
                                                    </span>

                                                    <h4
                                                      className={`font-black ${
                                                        completed
                                                          ? "line-through text-gray-400"
                                                          : ""
                                                      }`}
                                                    >
                                                      {
                                                        module.title
                                                      }
                                                    </h4>
                                                  </div>

                                                  <p className="text-sm text-gray-500 mt-1">
                                                    {
                                                      module.description
                                                    }
                                                  </p>

                                                  <div className="flex flex-wrap gap-2 mt-3">
                                                    <MiniTag
                                                      icon={
                                                        <Clock3
                                                          size={
                                                            12
                                                          }
                                                        />
                                                      }
                                                      text={
                                                        module.duration
                                                      }
                                                    />

                                                    <MiniTag
                                                      icon={
                                                        <BarChart3
                                                          size={
                                                            12
                                                          }
                                                        />
                                                      }
                                                      text={
                                                        module.difficulty
                                                      }
                                                    />

                                                    <MiniTag
                                                      icon={
                                                        <Layers
                                                          size={
                                                            12
                                                          }
                                                        />
                                                      }
                                                      text={
                                                        module.type
                                                      }
                                                    />
                                                  </div>

                                                  {module.activity && (
                                                    <div className="mt-3 flex items-center gap-2 text-xs font-bold text-blue-700">
                                                      <Play
                                                        size={
                                                          13
                                                        }
                                                        fill="currentColor"
                                                      />

                                                      {
                                                        module.activity
                                                      }
                                                    </div>
                                                  )}

                                                  {safeArray(
                                                    module.resources
                                                  ).length >
                                                    0 && (
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                      {module.resources.map(
                                                        (
                                                          resource,
                                                          resourceIndex
                                                        ) => (
                                                          <span
                                                            key={
                                                              resourceIndex
                                                            }
                                                            className="text-xs px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-100"
                                                          >
                                                            {typeof resource ===
                                                            "string"
                                                              ? resource
                                                              : resource.title ||
                                                                resource.name ||
                                                                "Resource"}
                                                          </span>
                                                        )
                                                      )}
                                                    </div>
                                                  )}
                                                </div>

                                                <button
                                                  onClick={() => {
                                                    toast.success(
                                                      completed
                                                        ? "Module reopened."
                                                        : "Module marked complete!"
                                                    );
                                                    toggleModule(
                                                      module.id
                                                    );
                                                  }}
                                                  className={`hidden sm:flex px-3 py-2 rounded-lg text-xs font-bold shrink-0 ${
                                                    completed
                                                      ? "bg-white border border-emerald-200 text-emerald-700"
                                                      : "bg-[#172033] text-white"
                                                  }`}
                                                >
                                                  {completed
                                                    ? "Completed"
                                                    : "Complete"}
                                                </button>
                                              </div>
                                            </motion.div>
                                          );
                                        }
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </motion.div>

              {/* =================================================
                  AI STRATEGY
              ================================================= */}

              <motion.div
                variants={itemVariants}
                className="rounded-[1.5rem] bg-[#172033] text-white overflow-hidden shadow-xl"
              >
                <button
                  onClick={() =>
                    setShowStrategy((value) => !value)
                  }
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-yellow-300 text-[#172033] flex items-center justify-center">
                      <Brain size={21} />
                    </div>

                    <div>
                      <p className="text-yellow-300 text-xs font-bold uppercase tracking-wider">
                        AI LEARNING STRATEGY
                      </p>

                      <h3 className="text-xl font-black mt-0.5">
                        Why STATWISE created this path
                      </h3>
                    </div>
                  </div>

                  {showStrategy ? <ChevronUp /> : <ChevronDown />}
                </button>

                <AnimatePresence>
                  {showStrategy && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        height: 0,
                      }}
                      animate={{
                        opacity: 1,
                        height: "auto",
                      }}
                      exit={{
                        opacity: 0,
                        height: 0,
                      }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-7">
                        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
                          <div className="flex items-start gap-3">
                            <Lightbulb
                              className="text-yellow-300 mt-1 shrink-0"
                              size={21}
                            />

                            <p className="text-white/75 leading-relaxed">
                              {learningPath.strategy ||
                                "The AI has prioritized the topics that provide the strongest learning progression for your current competency level."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* =================================================
                  MILESTONES
              ================================================= */}

              <motion.div
                variants={itemVariants}
                className="rounded-[1.5rem] bg-white border border-gray-200 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() =>
                    setShowMilestones((value) => !value)
                  }
                  className="w-full p-6 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-yellow-100 text-yellow-700 flex items-center justify-center">
                      <Trophy size={21} />
                    </div>

                    <div>
                      <h3 className="font-black text-xl">
                        Milestones
                      </h3>

                      <p className="text-sm text-gray-500">
                        Track meaningful checkpoints in your journey.
                      </p>
                    </div>
                  </div>

                  {showMilestones ? <ChevronUp /> : <ChevronDown />}
                </button>

                <AnimatePresence>
                  {showMilestones && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        height: 0,
                      }}
                      animate={{
                        opacity: 1,
                        height: "auto",
                      }}
                      exit={{
                        opacity: 0,
                        height: 0,
                      }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-7">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {safeArray(
                            learningPath.milestones
                          ).map((milestone, index) => (
                            <motion.div
                              key={index}
                              whileHover={{
                                y: -4,
                              }}
                              className="p-5 rounded-2xl border border-gray-200 bg-gray-50"
                            >
                              <div className="w-10 h-10 rounded-xl bg-yellow-100 text-yellow-700 flex items-center justify-center mb-4">
                                <Award size={19} />
                              </div>

                              <h4 className="font-black">
                                {typeof milestone ===
                                "string"
                                  ? milestone
                                  : milestone.title ||
                                    `Milestone ${index + 1}`}
                              </h4>

                              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                                {typeof milestone ===
                                "string"
                                  ? "Complete the associated learning objectives."
                                  : milestone.description ||
                                    milestone.objective ||
                                    "Complete this learning checkpoint."}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* =================================================
                  FINAL OUTCOME
              ================================================= */}

              <motion.div
                variants={itemVariants}
                className="relative overflow-hidden rounded-[1.7rem] bg-gradient-to-br from-yellow-100 via-white to-blue-50 border border-yellow-200 p-7 md:p-9"
              >
                <motion.div
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute -right-20 -top-20 w-64 h-64 rounded-full border border-yellow-300/40 border-dashed"
                />

                <div className="relative flex flex-col lg:flex-row gap-6 lg:items-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#172033] text-yellow-300 flex items-center justify-center shrink-0">
                    <Trophy size={30} />
                  </div>

                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wider font-black text-yellow-700">
                      EXPECTED LEARNING OUTCOME
                    </p>

                    <h3 className="text-2xl font-black mt-1">
                      Ready to measure your growth?
                    </h3>

                    <p className="text-gray-600 mt-2 max-w-4xl leading-relaxed">
                      {learningPath.outcome ||
                        "Complete the personalized pathway and reassess your competency to measure improvement."}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      toast.success(
                        "Reassessment module will use your latest learning progress."
                      )
                    }
                    className="px-5 py-3 rounded-xl bg-[#172033] text-white font-black flex items-center justify-center gap-2 hover:bg-black transition shrink-0"
                  >
                    <ClipboardCheck size={18} />
                    Reassess
                  </button>
                </div>
              </motion.div>

              {/* =================================================
                  SECURITY FOOTER
              ================================================= */}

              <div className="flex flex-col md:flex-row items-center justify-center gap-5 text-xs text-gray-400 py-5">
                <span className="flex items-center gap-2">
                  <ShieldCheck size={15} />
                  Secure learning workflow
                </span>

                <span className="flex items-center gap-2">
                  <Lock size={14} />
                  Learner data protected
                </span>

                <span className="flex items-center gap-2">
                  <Cpu size={14} />
                  AI-assisted competency intelligence
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =====================================================
            EMPTY STATE
        ===================================================== */}

        {!learningPath && !generating && (
          <motion.div
            variants={itemVariants}
            className="grid md:grid-cols-3 gap-4 pb-10"
          >
            <FeatureCard
              icon={<Target size={21} />}
              title="Skill Gap Intelligence"
              text="Identify the competencies that need the most attention."
            />

            <FeatureCard
              icon={<Route size={21} />}
              title="Adaptive Roadmap"
              text="Turn learning material into a structured journey."
            />

            <FeatureCard
              icon={<BarChart3 size={21} />}
              title="Measurable Progress"
              text="Track module completion and reassess your competency."
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/* =========================================================
   INPUT FIELD
========================================================= */

function InputField({
  label,
  value,
  onChange,
  type = "text",
  suffix,
  placeholder,
}) {
  return (
    <div>
      <label className="block text-sm font-bold mb-2">
        {label}
      </label>

      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          min={type === "number" ? 0 : undefined}
          max={
            type === "number" &&
            (label.includes("Score") || label.includes("Accuracy"))
              ? 100
              : undefined
          }
          className={`w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-300 ${
            suffix ? "pr-16" : ""
          }`}
        />

        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   TAG
========================================================= */

function Tag({ icon, text }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 border border-gray-200 text-xs font-bold text-gray-600">
      {icon}
      {text}
    </span>
  );
}

/* =========================================================
   MINI TAG
========================================================= */

function MiniTag({ icon, text }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-500 text-[11px] font-bold">
      {icon}
      {text}
    </span>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-yellow-100 text-yellow-700 flex items-center justify-center shrink-0">
        {icon}
      </div>

      <div>
        <h3 className="font-black text-xl">{title}</h3>

        <p className="text-sm text-gray-500 mt-0.5">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ icon, label, value, text }) {
  return (
    <motion.div
      whileHover={{
        y: -4,
      }}
      className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5"
    >
      <div className="w-10 h-10 rounded-xl bg-gray-100 text-[#172033] flex items-center justify-center mb-4">
        {icon}
      </div>

      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className="text-2xl font-black mt-1">{value}</p>

      <p className="text-xs text-gray-400 mt-1">{text}</p>
    </motion.div>
  );
}

/* =========================================================
   FEATURE CARD
========================================================= */

function FeatureCard({ icon, title, text }) {
  return (
    <motion.div
      whileHover={{
        y: -5,
      }}
      className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5"
    >
      <div className="w-11 h-11 rounded-xl bg-yellow-100 text-yellow-700 flex items-center justify-center mb-4">
        {icon}
      </div>

      <h3 className="font-black">{title}</h3>

      <p className="text-sm text-gray-500 mt-2 leading-relaxed">
        {text}
      </p>
    </motion.div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({ icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400">
      {icon}

      <p className="text-sm mt-2">{text}</p>
    </div>
  );
}