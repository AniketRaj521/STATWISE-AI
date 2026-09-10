import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  Activity,
  AlertCircle,
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  BrainCircuit,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Flame,
  GraduationCap,
  Layers,
  Lightbulb,
  MessageCircle,
  NotebookPen,
  Play,
  Presentation,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Upload as UploadIcon,
  UserRound,
  Zap,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import statwiseAnalysis from "../../data/statwiseAnalysis";
import { getAssessmentResult } from "../../services/assessmentStore";
import AgentActivity from "../../components/AgentActivity";
import CompetencySimulator from "../../components/CompetencySimulator";

// ============================================================
// HELPERS
// ============================================================

function toText(value, fallback = "") {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (value && typeof value === "object") {
    return (
      value.name ||
      value.skill ||
      value.title ||
      value.label ||
      value.role ||
      fallback
    );
  }

  return fallback;
}

function normalizeRole(rawRole) {
  if (typeof rawRole === "string") {
    return rawRole;
  }

  if (rawRole && typeof rawRole === "object") {
    return (
      rawRole.name ||
      rawRole.role ||
      rawRole.title ||
      "Statistical Officer"
    );
  }

  return "Statistical Officer";
}

function getCompetencyScore(data) {
  const candidates = [
    data?.competency?.competency_score,
    data?.competency?.competencyScore,
    data?.competency?.score,
    data?.competency_score,
    data?.competencyScore,
    data?.score,
  ];

  for (const value of candidates) {
    const number = Number(value);

    if (Number.isFinite(number)) {
      return Math.round(Math.max(0, Math.min(100, number)));
    }
  }

  return 65;
}

function getCompetencyLevel(data) {
  const candidates = [
    data?.competency?.competency_level,
    data?.competency?.competencyLevel,
    data?.competency_level,
    data?.competencyLevel,
    data?.level,
  ];

  for (const value of candidates) {
    if (typeof value === "string") {
      return value;
    }
  }

  return "Intermediate";
}

function getSkills(data) {
  const possible =
    data?.skills ||
    data?.skill_gaps ||
    data?.skillGapAnalysis?.gaps ||
    data?.skill_gap_analysis?.gaps ||
    data?.gaps ||
    [];

  if (!Array.isArray(possible)) {
    return [];
  }

  return possible.map((item, index) => {
    const current = Number(
      item?.current ??
        item?.current_score ??
        item?.score ??
        item?.currentScore ??
        0
    );

    const target = Number(
      item?.target ??
        item?.target_score ??
        item?.targetScore ??
        70
    );

    const safeCurrent = Number.isFinite(current) ? current : 0;
    const safeTarget = Number.isFinite(target) ? target : 70;

    const calculatedGap = Math.max(0, safeTarget - safeCurrent);

    const suppliedGap = Number(item?.gap);

    const gap = Number.isFinite(suppliedGap)
      ? Math.max(0, suppliedGap)
      : calculatedGap;

    return {
      id: item?.id || `skill-${index}`,

      name: toText(
        item?.name || item?.skill,
        `Skill ${index + 1}`
      ),

      current: Math.round(
        Math.max(0, Math.min(100, safeCurrent))
      ),

      target: Math.round(
        Math.max(0, Math.min(100, safeTarget))
      ),

      gap: Math.round(gap),

      priority: toText(
        item?.priority || item?.status,
        gap >= 30
          ? "Critical"
          : gap >= 20
          ? "High"
          : gap > 0
          ? "Medium"
          : "Low"
      ),

      reason: toText(
        item?.reason || item?.recommendation,
        gap > 0
          ? "Focused learning can improve this competency."
          : "Competency target achieved."
      ),
    };
  });
}

function getCourses(data) {
  const possible =
    data?.recommended_courses ||
    data?.recommendedCourses ||
    data?.courses ||
    [];

  if (!Array.isArray(possible)) {
    return [];
  }

  return possible.map((course, index) => ({
    id:
      course?.id ||
      course?.course_id ||
      `course-${index}`,

    title: toText(
      course?.title || course?.name,
      `Recommended Course ${index + 1}`
    ),

    category: toText(
      course?.category,
      "Skill Development"
    ),

    duration: toText(
      course?.duration,
      "Self-paced"
    ),

    level: toText(
      course?.level,
      "Intermediate"
    ),

    description: toText(
      course?.description,
      "AI-recommended learning based on your competency profile."
    ),

    skill: toText(
      course?.skill,
      ""
    ),

    priority: toText(
      course?.priority,
      "Medium"
    ),
  }));
}

// ============================================================
// MERGE LATEST ASSESSMENT
// ============================================================

function mergeAssessmentIntoProfile(baseData, assessment) {
  if (!assessment) {
    return baseData;
  }

  const updatedCompetency =
    Number(assessment?.updatedCompetency);

  const assessmentScore =
    Number(assessment?.score);

  const hasUpdatedCompetency =
    Number.isFinite(updatedCompetency);

  const hasAssessmentScore =
    Number.isFinite(assessmentScore);

  const baseSkills = getSkills(baseData);

  const assessmentSkillScores =
    assessment?.skillScores || {};

  const mergedSkills = baseSkills.map((skill) => {
    const assessedScore = Number(
      assessmentSkillScores?.[skill.name]
    );

    if (!Number.isFinite(assessedScore)) {
      return skill;
    }

    const current = Math.round(
      Math.max(0, Math.min(100, assessedScore))
    );

    const gap = Math.max(
      0,
      skill.target - current
    );

    let priority = "Low";

    if (gap >= 30) {
      priority = "Critical";
    } else if (gap >= 20) {
      priority = "High";
    } else if (gap >= 10) {
      priority = "Medium";
    }

    return {
      ...skill,
      current,
      gap,
      priority,
    };
  });

  const finalScore = hasUpdatedCompetency
    ? Math.round(updatedCompetency)
    : hasAssessmentScore
    ? Math.round(assessmentScore)
    : getCompetencyScore(baseData);

  let finalLevel = "Beginner";

  if (finalScore >= 85) {
    finalLevel = "Expert";
  } else if (finalScore >= 70) {
    finalLevel = "Advanced";
  } else if (finalScore >= 50) {
    finalLevel = "Intermediate";
  }

  return {
    ...baseData,

    competency: {
      ...(baseData?.competency || {}),
      competency_score: finalScore,
      competency_level: finalLevel,
    },

    skills: mergedSkills,
  };
}

// ============================================================
// ANIMATED NUMBER
// ============================================================

function AnimatedNumber({ value, suffix = "" }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const end = Number(value) || 0;
    const duration = 900;
    const stepTime = 20;

    const steps = Math.max(
      1,
      Math.floor(duration / stepTime)
    );

    let step = 0;

    setDisplay(0);

    const timer = setInterval(() => {
      step += 1;

      const next = Math.round(
        (end * step) / steps
      );

      setDisplay(next);

      if (step >= steps) {
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <>
      {display}
      {suffix}
    </>
  );
}

// ============================================================
// FLOATING PARTICLE
// ============================================================

function FloatingParticle({ index }) {
  const positions = [
    { left: "8%", top: "20%" },
    { left: "18%", top: "72%" },
    { left: "34%", top: "30%" },
    { left: "48%", top: "82%" },
    { left: "62%", top: "18%" },
    { left: "75%", top: "64%" },
    { left: "87%", top: "28%" },
    { left: "93%", top: "78%" },
  ];

  const position =
    positions[index % positions.length];

  return (
    <motion.div
      className="absolute h-1.5 w-1.5 rounded-full bg-[#F6D76A]"
      style={position}
      animate={{
        y: [0, -25, 0],
        opacity: [0.15, 0.8, 0.15],
        scale: [0.8, 1.4, 0.8],
      }}
      transition={{
        duration: 4 + index * 0.4,
        repeat: Infinity,
        ease: "easeInOut",
        delay: index * 0.3,
      }}
    />
  );
}

// ============================================================
// COMPETENCY RING
// ============================================================

function CompetencyRing({ score }) {
  const radius = 78;

  const circumference =
    2 * Math.PI * radius;

  const safeScore = Math.max(
    0,
    Math.min(100, Number(score) || 0)
  );

  const progress =
    circumference -
    (safeScore / 100) * circumference;

  return (
    <div className="relative h-52 w-52">
      <svg
        className="h-full w-full -rotate-90"
        viewBox="0 0 200 200"
      >
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="14"
        />

        <motion.circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#F6D76A"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{
            strokeDashoffset: circumference,
          }}
          animate={{
            strokeDashoffset: progress,
          }}
          transition={{
            duration: 1.5,
            ease: "easeOut",
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.5,
            type: "spring",
          }}
          className="text-5xl font-black text-white"
        >
          <AnimatedNumber value={safeScore} />
        </motion.div>

        <div className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-white/50">
          Competency
        </div>
      </div>
    </div>
  );
}

// ============================================================
// EXPLORE ITEMS
// ============================================================

const exploreItems = [
  {
    title: "Learning Paths",
    description: "Personalized courses for your role",
    icon: BookOpen,
    path: "/learning",
  },

  {
    title: "Skill Intelligence",
    description: "Discover and close your skill gaps",
    icon: Target,
    path: "/skills",
  },

  {
    title: "AI Tutor",
    description: "Learn with your intelligent assistant",
    icon: Bot,
    path: "/tutor",
  },

  {
    title: "Assessments",
    description: "Measure your competency growth",
    icon: BarChart3,
    path: "/assessments",
  },

  {
    title: "Upload Learning Material",
    description: "Upload PDFs and learning materials",
    icon: UploadIcon,
    path: "/upload",
  },

  {
    title: "Generate Notes",
    description:
      "Transform learning material into smart AI notes",
    icon: NotebookPen,
    path: "/generate-notes",
  },

  {
    title: "AI Flashcards",
    description:
      "Flip, learn, remember & master concepts",
    icon: Layers,
    path: "/flashcards",
  },

  {
    title: "AI PPT Generator",
    description:
      "Turn PDF learning material into dynamic presentations",
    icon: Presentation,
    path: "/ppt-generator",
  },

  {
    title: "Digital Twin",
    description:
      "Simulate your skills, growth and future learning",
    icon: Brain,
    path: "/digital-twin",
  },
];

// ============================================================
// DASHBOARD
// ============================================================

export default function Dashboard() {
  const navigate = useNavigate();

  const [exploreOpen, setExploreOpen] =
    useState(false);

  const [quoteIndex, setQuoteIndex] =
    useState(0);

  const [activeSkill, setActiveSkill] =
    useState(null);

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const [refreshKey, setRefreshKey] =
    useState(0);

  // ----------------------------------------------------------
  // READ LATEST ASSESSMENT
  // ----------------------------------------------------------

  const latestAssessment = useMemo(() => {
    return getAssessmentResult();
  }, [refreshKey]);

  // ----------------------------------------------------------
  // MERGED PROFILE
  // ----------------------------------------------------------

  const liveAnalysis = useMemo(() => {
    return mergeAssessmentIntoProfile(
      statwiseAnalysis,
      latestAssessment
    );
  }, [latestAssessment]);

  // ----------------------------------------------------------
  // PROFILE DATA
  // ----------------------------------------------------------

  const role = normalizeRole(
    liveAnalysis?.role ||
      liveAnalysis?.employee?.role ||
      liveAnalysis?.profile?.role
  );

  const competencyScore =
    getCompetencyScore(liveAnalysis);

  const competencyLevel =
    getCompetencyLevel(liveAnalysis);

  const skills = useMemo(() => {
    return getSkills(liveAnalysis);
  }, [liveAnalysis]);

  const courses = useMemo(() => {
    return getCourses(liveAnalysis);
  }, [liveAnalysis]);

  // ----------------------------------------------------------
  // QUOTES
  // ----------------------------------------------------------

  const quotes = [
    "Learn today. Measure tomorrow. Lead the future.",
    "Every skill gap is an opportunity to grow.",
    "Data tells you where you are. Learning takes you where you want to go.",
    "Competence is built one learning decision at a time.",
    "The future belongs to professionals who keep learning.",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex(
        (previous) =>
          (previous + 1) % quotes.length
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [quotes.length]);

  // ----------------------------------------------------------
  // DERIVED METRICS
  // ----------------------------------------------------------

  const skillAverage =
    skills.length > 0
      ? Math.round(
          skills.reduce(
            (sum, skill) =>
              sum + skill.current,
            0
          ) / skills.length
        )
      : competencyScore;

  const highPriorityGaps =
    skills.filter(
      (skill) => skill.gap >= 20
    );

  const strongestSkill =
    skills.length > 0
      ? [...skills].sort(
          (a, b) =>
            b.current - a.current
        )[0]
      : null;

  const weakestSkill =
    skills.length > 0
      ? [...skills].sort(
          (a, b) =>
            b.gap - a.gap
        )[0]
      : null;

  const learningHours =
    statwiseAnalysis?.learning_progress
      ?.learning_hours ?? 0;

  const completedCourses =
    statwiseAnalysis?.learning_progress
      ?.courses_completed ?? 0;

  // ----------------------------------------------------------
  // ACTIONS
  // ----------------------------------------------------------

  function handleReAnalyze() {
    setRefreshKey(
      (previous) => previous + 1
    );

    toast.success(
      "AI analysis refreshed successfully."
    );
  }

  function handleExport() {
    const exportData = {
      platform: "STATWISE AI",

      exportedAt:
        new Date().toISOString(),

      profile: liveAnalysis,

      latestAssessment:
        latestAssessment || null,
    };

    const blob = new Blob(
      [
        JSON.stringify(
          exportData,
          null,
          2
        ),
      ],
      {
        type: "application/json",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;

    anchor.download =
      "statwise-ai-analysis.json";

    document.body.appendChild(anchor);

    anchor.click();

    anchor.remove();

    URL.revokeObjectURL(url);

    toast.success(
      "Analysis exported successfully."
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen overflow-hidden bg-[#fffdf5] text-[#172033]">

      {/* ======================================================
          TOP NAV
      ====================================================== */}

      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#172033] text-white shadow-xl">

        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-3 lg:px-8">

          {/* LOGO */}

          <button
            onClick={() =>
              navigate("/")
            }
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F6D76A] text-[#172033]">
              <BrainCircuit size={22} />
            </div>

            <div className="text-left">
              <div className="text-lg font-black tracking-tight">
                STATWISE AI
              </div>

              <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/50">
                Skill Intelligence Platform
              </div>
            </div>
          </button>

          {/* DESKTOP NAV */}

          <div className="hidden items-center gap-2 md:flex">

            <button
              onClick={() =>
                navigate("/learning")
              }
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              Learning
            </button>

            <button
              onClick={() =>
                navigate("/skills")
              }
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              Skills
            </button>

            <button
              onClick={() =>
                navigate("/assessments")
              }
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              Assessments
            </button>

            <button
              onClick={() =>
                navigate("/tutor")
              }
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              AI Tutor
            </button>

            {/* ==================================================
                EXPLORE
            ================================================== */}

            <div className="relative">

              <button
                onClick={() =>
                  setExploreOpen(
                    !exploreOpen
                  )
                }
                className="flex items-center gap-1 text-sm font-medium text-white/80 transition hover:text-white"
              >
                Explore

                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    exploreOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              {exploreOpen && (
                <div className="absolute left-1/2 top-full z-[100] mt-4 w-[420px] -translate-x-1/2 rounded-2xl border border-white/10 bg-[#172033] p-3 shadow-2xl">

                  <div className="mb-2 px-3 py-2">

                    <p className="text-sm font-semibold text-white">
                      Explore STATWISE AI
                    </p>

                    <p className="text-xs text-white/50">
                      Discover intelligent learning tools
                    </p>

                  </div>

                  <div className="grid grid-cols-1 gap-1">

                    {exploreItems.map(
                      (item) => {

                        const Icon =
                          item.icon;

                        return (
                          <button
                            key={
                              item.title
                            }
                            onClick={() => {
                              setExploreOpen(
                                false
                              );

                              navigate(
                                item.path
                              );
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-white/10"
                          >

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                              <Icon
                                size={19}
                                className="text-white"
                              />
                            </div>

                            <div>

                              <p className="text-sm font-medium text-white">
                                {
                                  item.title
                                }
                              </p>

                              <p className="text-xs text-white/50">
                                {
                                  item.description
                                }
                              </p>

                            </div>

                          </button>
                        );
                      }
                    )}

                  </div>

                </div>
              )}

            </div>

            {/* ==================================================
                NOTIFICATIONS
            ================================================== */}

            <div className="relative ml-2">

              <button
                onClick={() =>
                  setNotificationOpen(
                    !notificationOpen
                  )
                }
                className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 transition hover:bg-white/10"
              >

                <Bell size={18} />

                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#F6D76A]" />

              </button>

              <AnimatePresence>

                {notificationOpen && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                    }}
                    className="absolute right-0 mt-3 w-80 overflow-hidden rounded-2xl border border-black/10 bg-white text-[#172033] shadow-2xl"
                  >

                    <div className="border-b border-black/10 px-5 py-4">

                      <div className="font-black">
                        AI Notifications
                      </div>

                      <div className="mt-1 text-xs text-gray-500">
                        Your latest learning insights
                      </div>

                    </div>

                    <div className="p-3">

                      <div className="rounded-xl p-3 transition hover:bg-gray-50">

                        <div className="flex gap-3">

                          <Sparkles
                            size={18}
                            className="mt-0.5"
                          />

                          <div>

                            <div className="text-sm font-bold">
                              New learning recommendation
                            </div>

                            <div className="mt-1 text-xs text-gray-500">
                              {weakestSkill
                                ? `${weakestSkill.name} needs the most attention.`
                                : "AI learning recommendations are ready."}
                            </div>

                          </div>

                        </div>

                      </div>

                      <div className="rounded-xl p-3 transition hover:bg-gray-50">

                        <div className="flex gap-3">

                          <Target
                            size={18}
                            className="mt-0.5"
                          />

                          <div>

                            <div className="text-sm font-bold">
                              Competency review available
                            </div>

                            <div className="mt-1 text-xs text-gray-500">
                              Take an assessment to update your profile.
                            </div>

                          </div>

                        </div>

                      </div>

                    </div>

                  </motion.div>
                )}

              </AnimatePresence>

            </div>

            {/* ==================================================
                PROFILE
            ================================================== */}

            <button
              onClick={() =>
                navigate("/profile")
              }
              className="ml-1 flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 transition hover:bg-white/10"
            >

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F6D76A] text-[#172033]">
                <UserRound size={16} />
              </div>

              <span className="text-sm font-bold">
                My Profile
              </span>

            </button>

          </div>

        </div>

      </header>

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden bg-[#172033]">

        {/* Animated glow */}

        <motion.div
          className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-[#F6D76A]/10 blur-3xl"
          animate={{
            x: [0, 80, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-white/5 blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Particles */}

        {Array.from({
          length: 16,
        }).map((_, index) => (
          <FloatingParticle
            key={index}
            index={index}
          />
        ))}

        {/* Grid */}

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",

            backgroundSize:
              "45px 45px",
          }}
        />

        <div className="relative mx-auto max-w-[1500px] px-5 py-10 lg:px-8 lg:py-14">

          <div className="grid items-center gap-10 lg:grid-cols-[1.4fr_.8fr]">

            {/* LEFT */}

            <motion.div
              initial={{
                opacity: 0,
                x: -30,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.7,
              }}
            >

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#F6D76A]/20 bg-[#F6D76A]/10 px-4 py-2 text-xs font-bold text-[#F6D76A]">

                <span className="relative flex h-2 w-2">

                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F6D76A] opacity-75" />

                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#F6D76A]" />

                </span>

                {latestAssessment
                  ? "AI ANALYSIS UPDATED"
                  : "AI ANALYSIS ACTIVE"}

              </div>

              <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">

                Welcome to your

                <span className="block text-[#F6D76A]">
                  Skill Intelligence Hub.
                </span>

              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-white/60 sm:text-lg">
                Your learning journey is no longer guesswork.
                STATWISE AI analyzes your competency profile,
                identifies skill gaps, and recommends your next
                best learning action.
              </p>

              {/* Assessment update indicator */}

              {latestAssessment && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#F6D76A]/20 bg-[#F6D76A]/10 px-4 py-2 text-xs font-semibold text-[#F6D76A]"
                >

                  <CheckCircle2
                    size={15}
                  />

                  Latest adaptive assessment integrated

                </motion.div>
              )}

              {/* Quote */}

              <div className="mt-7 max-w-2xl">

                <AnimatePresence mode="wait">

                  <motion.div
                    key={quoteIndex}
                    initial={{
                      opacity: 0,
                      y: 12,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -12,
                    }}
                    transition={{
                      duration: 0.4,
                    }}
                    className="border-l-2 border-[#F6D76A] pl-4 text-lg font-semibold italic text-white/85"
                  >
                    “{quotes[quoteIndex]}”
                  </motion.div>

                </AnimatePresence>

              </div>

              {/* Actions */}

              <div className="mt-8 flex flex-wrap gap-3">

                <motion.button
                  whileHover={{
                    scale: 1.03,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  onClick={() =>
                    navigate("/learning")
                  }
                  className="flex items-center gap-2 rounded-xl bg-[#F6D76A] px-5 py-3.5 font-black text-[#172033] shadow-lg shadow-black/20"
                >

                  <Play
                    size={17}
                    fill="currentColor"
                  />

                  Continue Learning

                </motion.button>

                <motion.button
                  whileHover={{
                    scale: 1.03,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  onClick={() =>
                    navigate("/assessments")
                  }
                  className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3.5 font-bold text-white backdrop-blur transition hover:bg-white/10"
                >

                  <Target size={17} />

                  Take Assessment

                </motion.button>

                <motion.button
                  whileHover={{
                    scale: 1.03,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  onClick={
                    handleReAnalyze
                  }
                  className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3.5 font-semibold text-white/60 transition hover:text-white"
                >

                  <RefreshCw
                    size={16}
                  />

                  Refresh AI

                </motion.button>

              </div>

            </motion.div>

            {/* RIGHT */}

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.9,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.8,
                delay: 0.15,
              }}
              className="relative"
            >

              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-7 backdrop-blur-xl">

                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#F6D76A]/10 blur-3xl" />

                <div className="relative">

                  <div className="flex items-start justify-between">

                    <div>

                      <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">
                        Current Profile
                      </div>

                      <div className="mt-2 text-xl font-black text-white">
                        {role}
                      </div>

                      <div className="mt-1 text-sm text-white/50">
                        AI competency assessment
                      </div>

                    </div>

                    <div className="rounded-xl bg-[#F6D76A]/10 p-3 text-[#F6D76A]">

                      <BrainCircuit
                        size={21}
                      />

                    </div>

                  </div>

                  <div className="mt-5 flex justify-center">

                    <CompetencyRing
                      score={
                        competencyScore
                      }
                    />

                  </div>

                  <div className="grid grid-cols-2 gap-3">

                    <div className="rounded-2xl border border-white/10 bg-black/10 p-4">

                      <div className="text-xs text-white/40">
                        Level
                      </div>

                      <div className="mt-1 font-black text-white">
                        {competencyLevel}
                      </div>

                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/10 p-4">

                      <div className="text-xs text-white/40">
                        Skill Avg.
                      </div>

                      <div className="mt-1 font-black text-white">

                        <AnimatedNumber
                          value={
                            skillAverage
                          }
                          suffix="%"
                        />

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </motion.div>

          </div>

        </div>

        <div className="grid grid-cols-3 gap-3">

          <div className="rounded-2xl border border-white/10 bg-black/10 p-4">

            <div className="text-xs text-white/40">
              Level
            </div>

            <div className="mt-1 font-black text-white">
              {competencyLevel}
            </div>

          </div>

          <div className="rounded-2xl border border-white/10 bg-black/10 p-4">

            <div className="text-xs text-white/40">
              Skill Avg.
            </div>

            <div className="mt-1 font-black text-white">

              <AnimatedNumber
                value={skillAverage}
                suffix="%"
              />

            </div>

          </div>

          <div className="rounded-2xl border border-white/10 bg-black/10 p-4">

            <div className="text-xs text-white/40">
              Assessment
            </div>

            <div className="mt-1 font-black text-white">

              {latestAssessment
                ? `${Math.round(
                    Number(
                      latestAssessment.score
                    ) || 0
                  )}%`
                : "—"}

            </div>

          </div>

        </div>

      </section>

      {/* ======================================================
          QUICK STATS
      ====================================================== */}

      <section className="relative z-10 mx-auto -mt-5 max-w-[1500px] px-5 lg:px-8">

        <div className="grid overflow-hidden rounded-3xl border border-black/10 bg-white shadow-xl shadow-black/5 sm:grid-cols-2 lg:grid-cols-4">

          {[
            {
              icon: Target,
              title: "Competency Score",
              value: competencyScore,
              suffix: "%",
              text: "Current AI score",
            },

            {
              icon: AlertCircle,
              title: "Skill Gaps",
              value:
                highPriorityGaps.length,
              suffix: "",
              text: "Areas needing focus",
            },

            {
              icon: BookOpen,
              title: "Learning Paths",
              value: courses.length,
              suffix: "",
              text: "AI recommendations",
            },

            {
              icon: Clock3,
              title: "Learning Hours",
              value: learningHours,
              suffix: "h",
              text: "Estimated activity",
            },
          ].map(
            (item, index) => {

              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      0.2 +
                      index * 0.1,
                  }}
                  whileHover={{
                    y: -4,
                  }}
                  className="border-b border-black/5 p-5 transition last:border-0 sm:border-r sm:last:border-r-0 lg:border-b-0"
                >

                  <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F6D76A]/25 text-[#172033]">

                      <Icon size={21} />

                    </div>

                    <div>

                      <div className="text-xs font-semibold text-gray-400">
                        {item.title}
                      </div>

                      <div className="mt-0.5 text-2xl font-black">

                        <AnimatedNumber
                          value={
                            item.value
                          }
                          suffix={
                            item.suffix
                          }
                        />

                      </div>

                      <div className="text-[11px] text-gray-400">
                        {item.text}
                      </div>

                    </div>

                  </div>

                </motion.div>
              );
            }
          )}

        </div>

      </section>

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="mx-auto max-w-[1500px] px-5 py-12 lg:px-8">

        <div className="grid gap-8 lg:grid-cols-[1.45fr_.75fr]">

          {/* ==================================================
              LEFT COLUMN
          ================================================== */}

          <div className="space-y-8">

            {/* SKILL INTELLIGENCE */}

            <section>

              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">

                <div>

                  <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-[#172033]/40">

                    <Activity size={16} />

                    Skill Intelligence

                  </div>

                  <h2 className="mt-2 text-3xl font-black tracking-tight">
                    Where should you focus?
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    AI-ranked competency areas based on your current profile.
                  </p>

                </div>

                <button
                  onClick={() =>
                    navigate("/skills")
                  }
                  className="flex items-center gap-1 text-sm font-black hover:underline"
                >

                  View all

                  <ChevronRight
                    size={16}
                  />

                </button>

              </div>

              <div className="grid gap-4 md:grid-cols-2">

                {skills.length === 0 ? (

                  <div className="col-span-full rounded-3xl border border-dashed border-black/15 bg-white p-10 text-center">

                    <BrainCircuit
                      className="mx-auto"
                      size={35}
                    />

                    <h3 className="mt-4 font-black">
                      No skill analysis available yet
                    </h3>

                    <p className="mt-2 text-sm text-gray-500">
                      Complete an assessment to generate your personalized skill intelligence.
                    </p>

                  </div>

                ) : (

                  skills
                    .slice(0, 6)
                    .map(
                      (
                        skill,
                        index
                      ) => {

                        const isActive =
                          activeSkill ===
                          skill.id;

                        const percentage =
                          skill.target >
                          0
                            ? Math.min(
                                100,
                                Math.round(
                                  (skill.current /
                                    skill.target) *
                                    100
                                )
                              )
                            : skill.current;

                        return (
                          <motion.div
                            key={
                              skill.id
                            }
                            initial={{
                              opacity: 0,
                              y: 20,
                            }}
                            whileInView={{
                              opacity: 1,
                              y: 0,
                            }}
                            viewport={{
                              once: true,
                            }}
                            transition={{
                              delay:
                                index *
                                0.07,
                            }}
                            whileHover={{
                              y: -5,
                            }}
                            onClick={() =>
                              setActiveSkill(
                                isActive
                                  ? null
                                  : skill.id
                              )
                            }
                            className={`group cursor-pointer overflow-hidden rounded-3xl border bg-white p-5 shadow-sm transition ${
                              isActive
                                ? "border-[#F6D76A] shadow-lg"
                                : "border-black/8 hover:border-black/15"
                            }`}
                          >

                            <div className="flex items-start justify-between gap-3">

                              <div className="flex items-center gap-3">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#172033] text-[#F6D76A]">

                                  <BarChart3
                                    size={19}
                                  />

                                </div>

                                <div>

                                  <h3 className="font-black">
                                    {
                                      skill.name
                                    }
                                  </h3>

                                  <div className="mt-1 text-xs text-gray-400">
                                    Target:{" "}
                                    {
                                      skill.target
                                    }
                                    %
                                  </div>

                                </div>

                              </div>

                              <div
                                className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${
                                  skill.gap >=
                                  20
                                    ? "bg-red-50 text-red-600"
                                    : skill.gap >
                                      0
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-green-50 text-green-700"
                                }`}
                              >

                                {skill.gap >=
                                20
                                  ? "High gap"
                                  : skill.gap >
                                    0
                                  ? "Improve"
                                  : "On target"}

                              </div>

                            </div>

                            <div className="mt-6 flex items-end justify-between">

                              <div>

                                <div className="text-3xl font-black">

                                  <AnimatedNumber
                                    value={
                                      skill.current
                                    }
                                    suffix="%"
                                  />

                                </div>

                                <div className="text-xs text-gray-400">
                                  Current score
                                </div>

                              </div>

                              {skill.gap >
                                0 && (

                                <div className="text-right">

                                  <div className="text-xl font-black text-[#172033]">
                                    +
                                    {
                                      skill.gap
                                    }
                                  </div>

                                  <div className="text-xs text-gray-400">
                                    point gap
                                  </div>

                                </div>

                              )}

                            </div>

                            <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">

                              <motion.div
                                initial={{
                                  width: 0,
                                }}
                                whileInView={{
                                  width: `${percentage}%`,
                                }}
                                viewport={{
                                  once: true,
                                }}
                                transition={{
                                  duration: 1,
                                  delay:
                                    index *
                                    0.08,
                                }}
                                className="h-full rounded-full bg-[#172033]"
                              />

                            </div>

                            <AnimatePresence>

                              {isActive && (

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

                                  <div className="mt-4 border-t border-black/5 pt-4 text-sm leading-6 text-gray-500">

                                    <span className="font-bold text-[#172033]">
                                      AI Insight:
                                    </span>{" "}

                                    {
                                      skill.reason
                                    }

                                  </div>

                                  {skill.gap >
                                    0 && (

                                    <button
                                      onClick={(
                                        event
                                      ) => {

                                        event.stopPropagation();

                                        navigate(
                                          "/learning"
                                        );

                                      }}
                                      className="mt-4 flex items-center gap-2 text-sm font-black"
                                    >

                                      Improve this skill

                                      <ArrowRight
                                        size={15}
                                      />

                                    </button>

                                  )}

                                </motion.div>

                              )}

                            </AnimatePresence>

                          </motion.div>
                        );
                      }
                    )

                )}

              </div>

            </section>

            {/* AI INSIGHT */}

            <motion.section
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              className="relative overflow-hidden rounded-[2rem] bg-[#172033] p-7 text-white"
            >

              <motion.div
                className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#F6D76A]/10 blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                }}
              />

              <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                <div className="max-w-2xl">

                  <div className="flex items-center gap-2 text-[#F6D76A]">

                    <Sparkles
                      size={18}
                    />

                    <span className="text-xs font-black uppercase tracking-[0.18em]">
                      AI Insight
                    </span>

                  </div>

                  <h2 className="mt-3 text-2xl font-black">

                    {weakestSkill
                      ? `${weakestSkill.name} is your highest-priority development area.`
                      : "Your competency profile is ready for analysis."}

                  </h2>

                  <p className="mt-3 text-sm leading-6 text-white/55">

                    {highPriorityGaps.length >
                    0
                      ? `STATWISE AI identified ${highPriorityGaps.length} ${
                          highPriorityGaps.length ===
                          1
                            ? "priority area"
                            : "priority areas"
                        } that could create the biggest improvement in your overall competency score.`
                      : "Your current competency profile is balanced. Continue learning and complete another assessment to keep your profile updated."}

                  </p>

                </div>

                <motion.button
                  whileHover={{
                    scale: 1.04,
                  }}
                  whileTap={{
                    scale: 0.96,
                  }}
                  onClick={() =>
                    navigate("/skills")
                  }
                  className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#F6D76A] px-5 py-3 font-black text-[#172033]"
                >

                  Explore Analysis

                  <ArrowRight
                    size={17}
                  />

                </motion.button>

              </div>

            </motion.section>

            {/* ==================================================
                AGENTIC INTELLIGENCE
            ================================================== */}

            <motion.section
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              className="rounded-[2rem] border border-black/8 bg-white p-7 shadow-sm"
            >

              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                <div>

                  <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-[#172033]/40">

                    <BrainCircuit
                      size={16}
                    />

                    Agentic Intelligence

                  </div>

                  <h2 className="mt-2 text-3xl font-black tracking-tight">
                    How STATWISE AI is working for you
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                    Specialized AI agents collaborate to assess competency,
                    identify skill gaps, personalize learning, and continuously
                    update your professional profile.
                  </p>

                </div>

                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#F6D76A]/20 px-3 py-2 text-xs font-black text-[#172033]">

                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />

                  AI SYSTEM ACTIVE

                </div>

              </div>

              <AgentActivity activeAgent={6} />

            </motion.section>

            <CompetencySimulator />

            {/* PERSONALIZED LEARNING */}

            <section>

              <div className="mb-5 flex items-end justify-between">

                <div>

                  <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-[#172033]/40">

                    <GraduationCap
                      size={16}
                    />

                    Personalized Learning

                  </div>

                  <h2 className="mt-2 text-3xl font-black">
                    Your next best actions
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Recommendations generated from your competency profile.
                  </p>

                </div>

                <button
                  onClick={() =>
                    navigate("/learning")
                  }
                  className="hidden items-center gap-1 text-sm font-black hover:underline sm:flex"
                >

                  Explore learning

                  <ChevronRight
                    size={16}
                  />

                </button>

              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                {courses.length ===
                0 ? (

                  <div className="col-span-full rounded-3xl border border-dashed border-black/15 bg-white p-8 text-center">

                    <BookOpen
                      className="mx-auto"
                      size={32}
                    />

                    <p className="mt-3 font-bold">
                      Complete an assessment to unlock AI recommendations.
                    </p>

                  </div>

                ) : (

                  courses
                    .slice(0, 4)
                    .map(
                      (
                        course,
                        index
                      ) => (

                        <motion.div
                          key={
                            course.id
                          }
                          initial={{
                            opacity: 0,
                            y: 20,
                          }}
                          whileInView={{
                            opacity: 1,
                            y: 0,
                          }}
                          viewport={{
                            once: true,
                          }}
                          transition={{
                            delay:
                              index *
                              0.08,
                          }}
                          whileHover={{
                            y: -5,
                          }}
                          className="group rounded-3xl border border-black/8 bg-white p-5 shadow-sm transition hover:border-black/15 hover:shadow-lg"
                        >

                          <div className="flex items-start justify-between">

                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F6D76A]/30">

                              <BookOpen
                                size={20}
                              />

                            </div>

                            <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-black uppercase">
                              AI Pick
                            </span>

                          </div>

                          <h3 className="mt-5 text-lg font-black">
                            {
                              course.title
                            }
                          </h3>

                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                            {
                              course.description
                            }
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2">

                            <span className="rounded-lg bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-500">
                              {
                                course.category
                              }
                            </span>

                            <span className="rounded-lg bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-500">
                              {
                                course.duration
                              }
                            </span>

                            <span className="rounded-lg bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-500">
                              {
                                course.level
                              }
                            </span>

                          </div>

                          <button
                            onClick={() =>
                              navigate(
                                "/learning"
                              )
                            }
                            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#172033] py-3 text-sm font-black text-white transition group-hover:bg-black"
                          >

                            Start Learning

                            <ArrowRight
                              size={15}
                            />

                          </button>

                        </motion.div>

                      )
                    )

                )}

              </div>

            </section>

          </div>

          {/* ==================================================
              RIGHT COLUMN
          ================================================== */}

          <aside className="space-y-6">

            {/* PROFILE CARD */}

            <motion.div
              initial={{
                opacity: 0,
                x: 20,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
              }}
              className="overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-sm"
            >

              <div className="bg-[#172033] p-6 text-white">

                <div className="flex items-center gap-4">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F6D76A] text-[#172033]">

                    <UserRound
                      size={28}
                    />

                  </div>

                  <div>

                    <div className="text-xs font-semibold uppercase tracking-wider text-white/40">
                      Professional Profile
                    </div>

                    <div className="mt-1 text-xl font-black">
                      {role}
                    </div>

                    <div className="mt-1 text-sm text-white/50">
                      STATWISE AI learner
                    </div>

                  </div>

                </div>

              </div>

              <div className="p-5">

                <div className="grid grid-cols-2 gap-3">

                  <div className="rounded-2xl bg-[#fffdf5] p-4">

                    <div className="text-xs text-gray-400">
                      Competency
                    </div>

                    <div className="mt-1 text-xl font-black">
                      {
                        competencyScore
                      }
                      %
                    </div>

                  </div>

                  <div className="rounded-2xl bg-[#fffdf5] p-4">

                    <div className="text-xs text-gray-400">
                      Level
                    </div>

                    <div className="mt-1 text-xl font-black">
                      {
                        competencyLevel
                      }
                    </div>

                  </div>

                </div>

                <button
                  onClick={() =>
                    navigate(
                      "/profile"
                    )
                  }
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 py-3 text-sm font-black transition hover:bg-gray-50"
                >

                  View Profile

                  <ArrowRight
                    size={15}
                  />

                </button>

              </div>

            </motion.div>

            {/* LEARNING PROGRESS */}

            <motion.div
              initial={{
                opacity: 0,
                x: 20,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                delay: 0.1,
              }}
              className="rounded-[2rem] border border-black/8 bg-white p-6 shadow-sm"
            >

              <div className="flex items-center justify-between">

                <div>

                  <div className="flex items-center gap-2 text-sm font-black">

                    <Trophy
                      size={18}
                    />

                    Learning Progress

                  </div>

                  <p className="mt-1 text-xs text-gray-400">
                    Keep building your professional edge.
                  </p>

                </div>

                <Award size={22} />

              </div>

              <div className="mt-6 space-y-5">

                <div>

                  <div className="flex justify-between text-xs">

                    <span className="font-bold">
                      Courses explored
                    </span>

                    <span className="text-gray-400">
                      {
                        completedCourses
                      }
                      /10
                    </span>

                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">

                    <motion.div
                      initial={{
                        width: 0,
                      }}
                      whileInView={{
                        width: `${Math.min(
                          100,
                          completedCourses *
                            10
                        )}%`,
                      }}
                      viewport={{
                        once: true,
                      }}
                      transition={{
                        duration: 1,
                      }}
                      className="h-full rounded-full bg-[#172033]"
                    />

                  </div>

                </div>

                <div>

                  <div className="flex justify-between text-xs">

                    <span className="font-bold">
                      Competency level
                    </span>

                    <span className="font-black">
                      {
                        competencyScore
                      }
                      %
                    </span>

                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">

                    <motion.div
                      initial={{
                        width: 0,
                      }}
                      whileInView={{
                        width: `${competencyScore}%`,
                      }}
                      viewport={{
                        once: true,
                      }}
                      transition={{
                        duration: 1,
                      }}
                      className="h-full rounded-full bg-[#F6D76A]"
                    />

                  </div>

                </div>

              </div>

            </motion.div>

            {/* QUICK ACTIONS */}

            <motion.div
              initial={{
                opacity: 0,
                x: 20,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                delay: 0.2,
              }}
            >

              <div className="mb-4 flex items-center gap-2 text-sm font-black">

                <Zap size={18} />

                Quick Actions

              </div>

              <div className="grid gap-3">

                {[
                  {
                    icon: Target,
                    title: "Take Assessment",
                    text: "Update your competency profile",
                    path: "/assessments",
                  },

                  {
                    icon: MessageCircle,
                    title: "Ask AI Tutor",
                    text: "Get personalized learning support",
                    path: "/tutor",
                  },

                  {
                    icon: BookOpen,
                    title: "Explore Courses",
                    text: "Discover your learning path",
                    path: "/learning",
                  },

                  {
                    icon: Search,
                    title: "Explore Skills",
                    text: "Understand your skill intelligence",
                    path: "/skills",
                  },
                ].map(
                  (
                    action
                  ) => {

                    const Icon =
                      action.icon;

                    return (
                      <motion.button
                        key={
                          action.title
                        }
                        whileHover={{
                          x: 5,
                        }}
                        onClick={() =>
                          navigate(
                            action.path
                          )
                        }
                        className="group flex items-center gap-4 rounded-2xl border border-black/8 bg-white p-4 text-left shadow-sm transition hover:border-black/15 hover:shadow-md"
                      >

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F6D76A]/25">

                          <Icon
                            size={19}
                          />

                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="font-black">
                            {
                              action.title
                            }
                          </div>

                          <div className="mt-0.5 truncate text-xs text-gray-400">
                            {
                              action.text
                            }
                          </div>

                        </div>

                        <ChevronRight
                          size={17}
                          className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-[#172033]"
                        />

                      </motion.button>
                    );
                  }
                )}

              </div>

            </motion.div>

            {/* MOTIVATION CARD */}

            <motion.div
              whileHover={{
                y: -3,
              }}
              className="relative overflow-hidden rounded-[2rem] bg-[#F6D76A] p-6"
            >

              <motion.div
                className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/30 blur-2xl"
                animate={{
                  scale: [1, 1.25, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                }}
              />

              <div className="relative">

                <Flame size={25} />

                <h3 className="mt-4 text-xl font-black">
                  Keep your learning momentum.
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#172033]/60">
                  Small learning actions compound into measurable professional growth.
                </p>

                <button
                  onClick={() =>
                    navigate(
                      "/learning"
                    )
                  }
                  className="mt-5 flex items-center gap-2 rounded-xl bg-[#172033] px-4 py-3 text-sm font-black text-white"
                >

                  Continue

                  <ArrowRight
                    size={15}
                  />

                </button>

              </div>

            </motion.div>

          </aside>

        </div>

        {/* ====================================================
            EXPORT
        ==================================================== */}

        <section className="mt-10 flex flex-col items-center justify-between gap-4 rounded-3xl border border-black/8 bg-white p-6 sm:flex-row">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#172033] text-[#F6D76A]">

              <Lightbulb
                size={20}
              />

            </div>

            <div>

              <div className="font-black">
                Your intelligence profile is continuously evolving.
              </div>

              <div className="mt-1 text-xs text-gray-400">
                Complete assessments and learning activities to improve your recommendations.
              </div>

            </div>

          </div>

          <button
            onClick={
              handleExport
            }
            className="flex items-center gap-2 rounded-xl border border-black/10 px-4 py-3 text-sm font-black transition hover:bg-gray-50"
          >

            <TrendingUp
              size={16}
            />

            Export Analysis

          </button>

        </section>

      </main>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer className="border-t border-black/10 bg-[#172033] px-5 py-8 text-white lg:px-8">

        <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-4 text-sm sm:flex-row sm:items-center">

          <div>

            <div className="font-black">
              STATWISE AI
            </div>

            <div className="mt-1 text-xs text-white/40">
              Intelligent Learning. Measurable Impact.
            </div>

          </div>

          <div className="text-xs text-white/40">
            AI-powered skill intelligence platform
          </div>

        </div>

      </footer>

    </div>
  );
}