import { useMemo, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";

import {
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronDown,
  Download,
  Lightbulb,
  Loader2,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import statwiseAnalysis from "../../data/statwiseAnalysis.js";
import { getAssessmentResult } from "../../services/assessmentStore";

// ============================================================
// FALLBACK ROLE PROFILES
// ============================================================

const fallbackRoleProfiles = {
  "Statistical Officer": {
    role: "Statistical Officer",
    domain: "Statistics & Data",
    score: 65,
    level: "Intermediate",
    skills: [
      {
        name: "Statistics",
        current: 82,
        target: 85,
        priority: "Low",
      },
      {
        name: "Probability",
        current: 38,
        target: 80,
        priority: "High",
      },
      {
        name: "Data Analysis",
        current: 58,
        target: 75,
        priority: "Medium",
      },
      {
        name: "Data Visualization",
        current: 76,
        target: 70,
        priority: "Low",
      },
      {
        name: "Statistical Computing",
        current: 64,
        target: 65,
        priority: "Low",
      },
    ],
  },

  "Data Analyst": {
    role: "Data Analyst",
    domain: "Data Analytics",
    score: 72,
    level: "Intermediate",
    skills: [
      {
        name: "Statistics",
        current: 72,
        target: 85,
        priority: "Medium",
      },
      {
        name: "Probability",
        current: 65,
        target: 75,
        priority: "Medium",
      },
      {
        name: "Data Analysis",
        current: 78,
        target: 90,
        priority: "Medium",
      },
      {
        name: "Data Visualization",
        current: 82,
        target: 90,
        priority: "Medium",
      },
      {
        name: "Statistical Computing",
        current: 68,
        target: 80,
        priority: "Medium",
      },
    ],
  },

  "Research Officer": {
    role: "Research Officer",
    domain: "Research & Analytics",
    score: 69,
    level: "Intermediate",
    skills: [
      {
        name: "Statistics",
        current: 76,
        target: 88,
        priority: "Medium",
      },
      {
        name: "Probability",
        current: 61,
        target: 78,
        priority: "Medium",
      },
      {
        name: "Data Analysis",
        current: 70,
        target: 85,
        priority: "Medium",
      },
      {
        name: "Data Visualization",
        current: 63,
        target: 80,
        priority: "High",
      },
      {
        name: "Statistical Computing",
        current: 59,
        target: 75,
        priority: "High",
      },
    ],
  },

  "Data Scientist": {
    role: "Data Scientist",
    domain: "AI & Data Science",
    score: 74,
    level: "Advanced",
    skills: [
      {
        name: "Statistics",
        current: 84,
        target: 90,
        priority: "Low",
      },
      {
        name: "Probability",
        current: 78,
        target: 88,
        priority: "Medium",
      },
      {
        name: "Data Analysis",
        current: 86,
        target: 92,
        priority: "Low",
      },
      {
        name: "Data Visualization",
        current: 79,
        target: 88,
        priority: "Medium",
      },
      {
        name: "Statistical Computing",
        current: 81,
        target: 90,
        priority: "Medium",
      },
    ],
  },
};

// ============================================================
// HELPERS
// ============================================================

function toDisplayText(value, fallback = "") {
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
      rawRole.label ||
      "Statistical Officer"
    );
  }

  return "Statistical Officer";
}

function getNumber(...values) {
  for (const value of values) {
    const number = Number(value);

    if (Number.isFinite(number)) {
      return number;
    }
  }

  return null;
}

function getSkillArray(data) {
  const possibleArrays = [
    data?.skills,
    data?.skill_gaps,
    data?.skillGaps,
    data?.gaps,
    data?.skill_gap_analysis?.gaps,
    data?.skillGapAnalysis?.gaps,
    data?.analysis?.skills,
  ];

  for (const array of possibleArrays) {
    if (Array.isArray(array)) {
      return array;
    }
  }

  return [];
}

function normalizeSkill(item, index) {
  const name = toDisplayText(
    item?.name ??
      item?.skill ??
      item?.skill_name ??
      item?.title ??
      item?.label,
    `Skill ${index + 1}`
  );

  const current = getNumber(
    item?.current,
    item?.current_score,
    item?.currentScore,
    item?.score,
    item?.current_level
  );

  const target = getNumber(
    item?.target,
    item?.target_score,
    item?.targetScore,
    item?.required,
    item?.expected
  );

  const safeCurrent = current ?? 0;
  const safeTarget = target ?? safeCurrent;

  const gap = Math.max(0, safeTarget - safeCurrent);

  let priority = toDisplayText(
    item?.priority ?? item?.status,
    gap >= 30
      ? "High"
      : gap >= 10
      ? "Medium"
      : "Low"
  );

  if (!["Critical", "High", "Medium", "Low"].includes(priority)) {
    priority =
      gap >= 30
        ? "High"
        : gap >= 10
        ? "Medium"
        : "Low";
  }

  return {
    name,
    current: Math.max(
      0,
      Math.min(100, safeCurrent)
    ),
    target: Math.max(
      0,
      Math.min(100, safeTarget)
    ),
    gap,
    priority,
    reason: toDisplayText(
      item?.reason ?? item?.recommendation,
      gap > 0
        ? `Improve ${name} to reach the recommended competency level.`
        : `${name} is currently meeting the target level.`
    ),
  };
}

function normalizeProfile(data) {
  const rawRole =
    data?.role ??
    data?.employee?.role ??
    data?.profile?.role ??
    data?.user?.role;

  const role = normalizeRole(rawRole);

  const rawSkills = getSkillArray(data);

  const skills = rawSkills.map(normalizeSkill);

  let score = getNumber(
    data?.competency?.competency_score,
    data?.competency?.competencyScore,
    data?.competency?.score,
    data?.competency_score,
    data?.competencyScore,
    data?.score,
    data?.profile?.competency_score
  );

  if (score === null && skills.length > 0) {
    score =
      skills.reduce(
        (sum, skill) => sum + skill.current,
        0
      ) / skills.length;
  }

  score = Math.round(
    Math.max(0, Math.min(100, score ?? 0))
  );

  const level =
    toDisplayText(
      data?.competency?.competency_level ??
        data?.competency?.competencyLevel ??
        data?.competency_level ??
        data?.competencyLevel ??
        data?.level,
      score >= 85
        ? "Expert"
        : score >= 70
        ? "Advanced"
        : score >= 50
        ? "Intermediate"
        : "Beginner"
    ) || "Intermediate";

  const domain = toDisplayText(
    data?.domain ??
      data?.employee?.domain ??
      data?.profile?.domain,
    "Statistics & Data"
  );

  return {
    role,
    domain,
    score,
    level,
    skills,
  };
}

// ============================================================
// BUILD PROFILE FROM LATEST ASSESSMENT
// ============================================================

function buildAssessmentProfile(baseProfile, assessment) {
  if (!assessment) {
    return baseProfile;
  }

  const skillScores =
    assessment.skillScores || {};

  if (
    Object.keys(skillScores).length === 0 &&
    !assessment.updatedCompetency
  ) {
    return baseProfile;
  }

  const updatedSkills = baseProfile.skills.map(
    (skill) => {
      const matchingScore =
        skillScores[skill.name];

      if (
        matchingScore === undefined ||
        matchingScore === null
      ) {
        return skill;
      }

      const current = Math.max(
        0,
        Math.min(100, Number(matchingScore))
      );

      const gap = Math.max(
        0,
        skill.target - current
      );

      const priority =
        gap >= 30
          ? "High"
          : gap >= 10
          ? "Medium"
          : "Low";

      return {
        ...skill,
        current,
        gap,
        priority,
        reason:
          gap > 0
            ? `${skill.name} needs ${Math.round(
                gap
              )} percentage points of improvement to reach the target.`
            : `${skill.name} has reached the recommended target.`,
      };
    }
  );

  const updatedScore = getNumber(
    assessment.updatedCompetency
  );

  return {
    ...baseProfile,
    score:
      updatedScore !== null
        ? Math.round(updatedScore)
        : baseProfile.score,
    level:
      updatedScore !== null
        ? updatedScore >= 85
          ? "Expert"
          : updatedScore >= 70
          ? "Advanced"
          : updatedScore >= 50
          ? "Intermediate"
          : "Beginner"
        : baseProfile.level,
    skills: updatedSkills,
  };
}

// ============================================================
// PRIORITY STYLES
// ============================================================

function priorityClasses(priority) {
  if (priority === "Critical") {
    return "bg-red-100 text-red-800 border-red-300";
  }

  if (priority === "High") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (priority === "Medium") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  return "bg-emerald-50 text-emerald-700 border-emerald-200";
}

// ============================================================
// SKILL BAR
// ============================================================

function SkillBar({ skill }) {
  const gap = Math.max(
    0,
    skill.target - skill.current
  );

  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-bold text-[#172033]">
              {skill.name}
            </h3>

            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-bold ${priorityClasses(
                skill.priority
              )}`}
            >
              {skill.priority}
            </span>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Current{" "}
            {Math.round(skill.current)}% · Target{" "}
            {Math.round(skill.target)}%
          </p>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-2xl font-black text-[#172033]">
            {Math.round(skill.current)}%
          </div>

          {gap > 0 ? (
            <div className="text-xs font-semibold text-red-500">
              {Math.round(gap)}% gap
            </div>
          ) : (
            <div className="text-xs font-semibold text-emerald-600">
              Target reached
            </div>
          )}
        </div>
      </div>

      <div className="relative mt-5 h-3 overflow-hidden rounded-full bg-gray-100">
        <motion.div
          initial={{ width: 0 }}
          animate={{
            width: `${skill.current}%`,
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
          className="absolute left-0 top-0 h-full rounded-full bg-[#172033]"
        />

        <div
          className="absolute top-0 h-full w-0.5 bg-[#D49B00]"
          style={{
            left: `${skill.target}%`,
          }}
        />
      </div>

      <p className="mt-3 text-sm leading-6 text-gray-500">
        {skill.reason}
      </p>
    </motion.div>
  );
}

// ============================================================
// SCORE RING
// ============================================================

function ScoreRing({ score }) {
  const radius = 52;

  const circumference =
    2 * Math.PI * radius;

  const progress =
    circumference -
    (score / 100) * circumference;

  return (
    <div className="relative h-40 w-40">
      <svg
        viewBox="0 0 140 140"
        className="h-full w-full -rotate-90"
      >
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          className="text-gray-100"
        />

        <motion.circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          strokeLinecap="round"
          className="text-[#D49B00]"
          strokeDasharray={circumference}
          initial={{
            strokeDashoffset: circumference,
          }}
          animate={{
            strokeDashoffset: progress,
          }}
          transition={{
            duration: 1,
            ease: "easeOut",
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-[#172033]">
          {score}%
        </span>

        <span className="text-xs font-semibold text-gray-500">
          competency
        </span>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function SkillIntelligence() {
  const navigate = useNavigate();

  // ----------------------------------------------------------
  // LOAD LATEST ASSESSMENT
  // ----------------------------------------------------------

  const latestAssessment = useMemo(
    () => getAssessmentResult(),
    []
  );

  // ----------------------------------------------------------
  // BASE PROFILE
  // ----------------------------------------------------------

  const mainProfile = useMemo(
    () =>
      normalizeProfile(
        statwiseAnalysis
      ),
    []
  );

  // ----------------------------------------------------------
  // LIVE PROFILE
  // ----------------------------------------------------------

  const liveProfile = useMemo(
    () =>
      buildAssessmentProfile(
        mainProfile,
        latestAssessment
      ),
    [mainProfile, latestAssessment]
  );

  // ----------------------------------------------------------
  // AVAILABLE ROLES
  // ----------------------------------------------------------

  const availableRoles = useMemo(() => {
    const roles = Object.keys(
      fallbackRoleProfiles
    );

    if (
      mainProfile.role &&
      !roles.includes(mainProfile.role)
    ) {
      roles.unshift(mainProfile.role);
    }

    return roles;
  }, [mainProfile.role]);

  // ----------------------------------------------------------
  // STATE
  // ----------------------------------------------------------

  const [selectedRole, setSelectedRole] =
    useState(mainProfile.role);

  const [showRoleMenu, setShowRoleMenu] =
    useState(false);

  const [isAnalyzing, setIsAnalyzing] =
    useState(false);

  // ----------------------------------------------------------
  // SELECT PROFILE
  // ----------------------------------------------------------

  const profile = useMemo(() => {
    if (
      selectedRole === mainProfile.role
    ) {
      return liveProfile;
    }

    return (
      fallbackRoleProfiles[selectedRole] ||
      mainProfile
    );
  }, [
    selectedRole,
    mainProfile,
    liveProfile,
  ]);

  const isLiveAnalysis =
    selectedRole === mainProfile.role;

  // ----------------------------------------------------------
  // SKILL GAPS
  // ----------------------------------------------------------

  const skillGaps = useMemo(() => {
    return [...profile.skills].sort(
      (a, b) => b.gap - a.gap
    );
  }, [profile.skills]);

  const highestGap = skillGaps[0];

  // ----------------------------------------------------------
  // KPI CALCULATIONS
  // ----------------------------------------------------------

  const completedSkills =
    profile.skills.filter(
      (skill) =>
        skill.current >= skill.target
    ).length;

  const averageSkill =
    profile.skills.length
      ? Math.round(
          profile.skills.reduce(
            (sum, skill) =>
              sum + skill.current,
            0
          ) / profile.skills.length
        )
      : 0;

  // ----------------------------------------------------------
  // LATEST ASSESSMENT INFO
  // ----------------------------------------------------------

  const hasAssessment =
    Boolean(latestAssessment);

  const assessmentScore = getNumber(
    latestAssessment?.score
  );

  const assessmentPriority =
    latestAssessment?.priority ||
    latestAssessment?.weakestSkill ||
    highestGap?.name;

  // ----------------------------------------------------------
  // ANALYZE
  // ----------------------------------------------------------

  const handleAnalyze = () => {
    setIsAnalyzing(true);

    setTimeout(() => {
      setIsAnalyzing(false);

      toast.success(
        "Skill intelligence analysis refreshed."
      );
    }, 1000);
  };

  // ----------------------------------------------------------
  // EXPORT
  // ----------------------------------------------------------

  const handleExport = () => {
    const exportData = {
      platform: "STATWISE AI",
      generatedAt:
        new Date().toISOString(),

      role: profile.role,
      domain: profile.domain,

      competency: {
        score: profile.score,
        level: profile.level,
      },

      skills: profile.skills,

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
      "statwise-skill-intelligence.json";

    document.body.appendChild(anchor);

    anchor.click();

    document.body.removeChild(anchor);

    URL.revokeObjectURL(url);

    toast.success(
      "Skill intelligence report exported."
    );
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#fffdf5] text-[#172033]">
      {/* TOP STRIP */}

      <div className="bg-[#172033] px-4 py-2 text-xs text-white sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <span className="hidden sm:block">
            STATWISE AI · AI-Powered Skill
            Intelligence Platform
          </span>

          <div className="ml-auto flex items-center gap-4">
            <span>Accessibility</span>
            <span>Help</span>
            <span>English</span>
          </div>
        </div>
      </div>

      {/* HEADER */}

      <header className="border-b border-black/10 bg-[#F6D76A]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-10">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#172033] text-white shadow-sm">
              <Brain size={23} />
            </div>

            <div className="text-left">
              <div className="text-xl font-black tracking-tight">
                STATWISE AI
              </div>

              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#172033]/70">
                Skill Intelligence
              </div>
            </div>
          </button>

          <div className="hidden items-center gap-2 md:flex">
            <button
              onClick={() =>
                navigate("/dashboard")
              }
              className="rounded-xl px-4 py-2 text-sm font-bold hover:bg-white/30"
            >
              Dashboard
            </button>

            <button
              onClick={() =>
                navigate("/learning")
              }
              className="rounded-xl px-4 py-2 text-sm font-bold hover:bg-white/30"
            >
              Learning
            </button>

            <button
              onClick={() =>
                navigate("/assessments")
              }
              className="rounded-xl px-4 py-2 text-sm font-bold hover:bg-white/30"
            >
              Assessments
            </button>

            <button
              onClick={() =>
                navigate("/profile")
              }
              className="rounded-xl bg-[#172033] px-4 py-2 text-sm font-bold text-white"
            >
              My Profile
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}

      <section className="border-b border-black/10 bg-[#fffdf5]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D49B00]/30 bg-[#F6D76A]/30 px-4 py-2 text-sm font-bold text-[#6B5000]">
                <Zap size={15} />
                AI Skill Intelligence
              </div>

              <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Understand your skills.
                <span className="block text-[#9A7100]">
                  Close the gaps.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
                STATWISE AI analyzes competency
                levels, identifies priority skill
                gaps, and creates a personalized
                learning path aligned with your role.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    navigate("/learning")
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-[#172033] px-5 py-3.5 font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  View Learning Path
                  <ArrowRight size={18} />
                </button>

                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="inline-flex items-center gap-2 rounded-xl border border-black/15 bg-white px-5 py-3.5 font-bold transition hover:bg-gray-50 disabled:opacity-60"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <TrendingUp size={18} />
                      Re-analyze Skills
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* SCORE */}

            <div className="flex justify-center lg:justify-end">
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.9,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                className="relative flex w-full max-w-sm items-center justify-center overflow-hidden rounded-3xl border border-black/10 bg-white p-8 shadow-xl"
              >
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#F6D76A]/40 blur-2xl" />

                <div className="relative">
                  <ScoreRing
                    score={profile.score}
                  />

                  <div className="mt-4 text-center">
                    <p className="font-black">
                      {profile.level}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Overall competency
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN */}

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
        {/* LIVE ASSESSMENT STATUS */}

        {hasAssessment &&
          isLiveAnalysis && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="mb-8 overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50"
            >
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
                    <CheckCircle2
                      size={21}
                    />
                  </div>

                  <div>
                    <p className="font-black text-emerald-900">
                      Latest adaptive assessment connected
                    </p>

                    <p className="mt-1 text-sm leading-6 text-emerald-800/80">
                      Your competency profile has
                      been updated using the latest
                      assessment performance.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {assessmentScore !== null && (
                    <span className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-black text-emerald-700">
                      Assessment:{" "}
                      {Math.round(
                        assessmentScore
                      )}
                      %
                    </span>
                  )}

                  {assessmentPriority && (
                    <span className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-black text-emerald-700">
                      Priority:{" "}
                      {assessmentPriority}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}

        {/* ROLE SELECTOR */}

        <section className="mb-8 rounded-3xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Target
                  size={19}
                  className="text-[#9A7100]"
                />

                <h2 className="text-xl font-black">
                  Role & Competency Profile
                </h2>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Select a role to understand the
                competency expectations and identify
                development priorities.
              </p>
            </div>

            <div className="relative w-full lg:w-80">
              <button
                onClick={() =>
                  setShowRoleMenu(
                    (value) => !value
                  )
                }
                className="flex w-full items-center justify-between rounded-xl border border-black/15 bg-[#fffdf5] px-4 py-3 text-left font-bold"
              >
                <span>{selectedRole}</span>

                <ChevronDown
                  size={18}
                  className={`transition ${
                    showRoleMenu
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {showRoleMenu && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -5,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -5,
                    }}
                    className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-xl border border-black/10 bg-white p-1 shadow-xl"
                  >
                    {availableRoles.map(
                      (role) => (
                        <button
                          key={role}
                          onClick={() => {
                            setSelectedRole(
                              role
                            );
                            setShowRoleMenu(
                              false
                            );
                          }}
                          className={`flex w-full rounded-lg px-3 py-3 text-left text-sm font-semibold transition hover:bg-[#F6D76A]/30 ${
                            selectedRole === role
                              ? "bg-[#F6D76A]/40"
                              : ""
                          }`}
                        >
                          {role}
                        </button>
                      )
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* STATUS */}

        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-[#D49B00]/20 bg-[#F6D76A]/20 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-[#F6D76A] p-2">
              <Brain size={18} />
            </div>

            <div>
              <p className="font-bold">
                {isLiveAnalysis
                  ? hasAssessment
                    ? "AI analysis updated from latest assessment"
                    : "AI analysis connected"
                  : "Role profile preview"}
              </p>

              <p className="mt-1 text-sm leading-6 text-gray-600">
                {isLiveAnalysis
                  ? hasAssessment
                    ? "Your latest adaptive assessment is now influencing competency and skill-gap analysis."
                    : "The selected profile is using the STATWISE AI competency analysis data."
                  : "This role uses the built-in prototype role profile. Connect organizational data for production personalization."}
              </p>
            </div>
          </div>

          <span className="whitespace-nowrap rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-bold">
            {profile.domain}
          </span>
        </div>

        {/* KPI */}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Trophy,
              label: "Competency Score",
              value: `${profile.score}%`,
              note: profile.level,
            },
            {
              icon: BarChart3,
              label: "Average Skill",
              value: `${averageSkill}%`,
              note: "Across mapped skills",
            },
            {
              icon: Target,
              label: "Skills on Target",
              value: `${completedSkills}/${profile.skills.length}`,
              note: "Target competency",
            },
            {
              icon: TrendingUp,
              label: "Largest Gap",
              value: highestGap
                ? `${Math.round(
                    highestGap.gap
                  )}%`
                : "0%",
              note:
                highestGap?.name ||
                "No major gap",
            },
          ].map((card, index) => {
            const Icon = card.icon;

            return (
              <motion.div
                key={card.label}
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.05,
                }}
                className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-[#F6D76A]/40 p-2.5">
                    <Icon size={20} />
                  </div>

                  <span className="text-2xl font-black">
                    {card.value}
                  </span>
                </div>

                <p className="mt-4 font-bold">
                  {card.label}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {card.note}
                </p>
              </motion.div>
            );
          })}
        </section>

        {/* SKILLS */}

        <section className="mt-10">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3
                  size={20}
                  className="text-[#9A7100]"
                />

                <h2 className="text-2xl font-black">
                  Skill Intelligence
                </h2>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Current capability compared with the
                recommended target.
              </p>
            </div>

            <button
              onClick={handleExport}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-bold hover:bg-gray-50"
            >
              <Download size={17} />
              Export Report
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {skillGaps.map((skill) => (
              <SkillBar
                key={skill.name}
                skill={skill}
              />
            ))}
          </div>

          {skillGaps.length === 0 && (
            <div className="rounded-2xl border border-dashed border-black/20 bg-white p-10 text-center">
              <p className="font-bold">
                No skill data available yet.
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Complete an assessment to generate
                your competency profile.
              </p>
            </div>
          )}
        </section>

        {/* AI PRIORITY */}

        <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-3xl border border-black/10 bg-[#172033] p-7 text-white shadow-lg">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-[#F6D76A] p-3 text-[#172033]">
                <Lightbulb size={24} />
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-[#F6D76A]">
                  AI Priority Recommendation
                </p>

                <h3 className="mt-2 text-2xl font-black">
                  {highestGap
                    ? `Focus on ${highestGap.name}`
                    : "Keep building your skills"}
                </h3>

                <p className="mt-3 max-w-xl leading-7 text-white/70">
                  {highestGap
                    ? `${highestGap.name} has the largest identified competency gap at ${Math.round(
                        highestGap.gap
                      )} percentage points. Strengthening this skill can have the greatest immediate impact on the selected role profile.`
                    : "Your current skill profile is close to the mapped targets. Continue with assessments and personalized learning."}
                </p>

                <button
                  onClick={() =>
                    navigate("/learning")
                  }
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#F6D76A] px-5 py-3 font-black text-[#172033] hover:shadow-lg"
                >
                  Build My Learning Path
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* NEXT ACTIONS */}

          <div className="rounded-3xl border border-black/10 bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#F6D76A]/40 p-3">
                <CheckCircle2 size={22} />
              </div>

              <div>
                <h3 className="font-black">
                  Next best actions
                </h3>

                <p className="text-sm text-gray-500">
                  Recommended by your skill profile
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {[
                highestGap
                  ? `Improve ${highestGap.name}`
                  : "Complete a competency assessment",

                "Complete recommended learning modules",

                "Retake assessment to measure progress",
              ].map((item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl bg-[#fffdf5] p-3"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F6D76A] text-xs font-black">
                    {index + 1}
                  </div>

                  <span className="text-sm font-semibold">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ASSESSMENT CONNECTION */}

        {hasAssessment &&
          isLiveAnalysis && (
            <motion.section
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="mt-10 overflow-hidden rounded-3xl bg-[#F6D76A] p-7"
            >
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Zap
                      size={20}
                      className="text-[#172033]"
                    />

                    <span className="text-sm font-black uppercase tracking-wider">
                      Continuous Competency Intelligence
                    </span>
                  </div>

                  <h3 className="mt-2 text-2xl font-black">
                    Your assessment is now part of your
                    skill profile.
                  </h3>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#172033]/70">
                    STATWISE AI combines assessment
                    performance with role-based targets
                    to identify where learning should
                    happen next.
                  </p>
                </div>

                <button
                  onClick={() =>
                    navigate("/assessments/quiz")
                  }
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#172033] px-5 py-3.5 font-black text-white transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Retake Assessment
                  <ArrowRight size={18} />
                </button>
              </div>
            </motion.section>
          )}
      </main>

      {/* FOOTER */}

      <footer className="border-t border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-7 text-sm text-gray-500 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <p>
            © {new Date().getFullYear()} STATWISE AI ·
            Intelligent Learning. Measurable Impact.
          </p>

          <div className="flex gap-5">
            <button
              onClick={() =>
                navigate("/dashboard")
              }
            >
              Dashboard
            </button>

            <button
              onClick={() =>
                navigate("/learning")
              }
            >
              Learning
            </button>

            <button
              onClick={() =>
                navigate("/assessments")
              }
            >
              Assessments
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}