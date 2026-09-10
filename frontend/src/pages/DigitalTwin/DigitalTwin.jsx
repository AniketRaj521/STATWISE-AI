import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  Gauge,
  Lightbulb,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  X,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { analyzeDigitalTwin } from "../../services/api";

/* ============================================================
   HELPERS
============================================================ */

const getLevelClass = (level = "") => {
  const value = String(level).toLowerCase();

  if (value.includes("expert")) {
    return "bg-purple-100 text-purple-700";
  }

  if (value.includes("advanced")) {
    return "bg-blue-100 text-blue-700";
  }

  if (value.includes("intermediate")) {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-red-100 text-red-700";
};

const getGapClass = (priority = "") => {
  const value = String(priority).toLowerCase();

  if (value === "high") {
    return "border-red-200 bg-red-50";
  }

  if (value === "medium") {
    return "border-amber-200 bg-amber-50";
  }

  return "border-green-200 bg-green-50";
};

const getGapTextClass = (priority = "") => {
  const value = String(priority).toLowerCase();

  if (value === "high") {
    return "text-red-700";
  }

  if (value === "medium") {
    return "text-amber-700";
  }

  return "text-green-700";
};

/* ============================================================
   ANIMATED NUMBER
============================================================ */

function AnimatedNumber({ value, suffix = "" }) {
  const numericValue = Number(value) || 0;

  return (
    <motion.span
      key={numericValue}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      {Math.round(numericValue)}
      {suffix}
    </motion.span>
  );
}

/* ============================================================
   SKILL BAR
============================================================ */

function SkillBar({ skill }) {
  const score = Math.max(
    0,
    Math.min(100, Number(skill?.score) || 0)
  );

  const confidence = Math.max(
    0,
    Math.min(100, Number(skill?.confidence) || 0)
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45 }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-[#172033]">
            {skill?.name || "Competency"}
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            {skill?.evidence || "AI-analyzed from uploaded learning material."}
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black text-[#1769c2]">
            <AnimatedNumber value={score} suffix="%" />
          </div>

          <span
            className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${getLevelClass(
              skill?.level
            )}`}
          >
            {skill?.level || "Analyzed"}
          </span>
        </div>
      </div>

      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{
            duration: 1.1,
            ease: "easeOut",
          }}
          className="h-full rounded-full bg-gradient-to-r from-[#1769c2] to-[#55b8ff]"
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>AI confidence</span>
        <span>{Math.round(confidence)}%</span>
      </div>
    </motion.div>
  );
}

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function DigitalTwin() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [backendData, setBackendData] = useState(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const [activeTab, setActiveTab] = useState("overview");

  const [showUpload, setShowUpload] = useState(true);
  const [dragActive, setDragActive] = useState(false);

  /* ============================================================
     EXTRACT DATA
  ============================================================ */

  const twin = backendData?.digital_twin || backendData || null;

  const documentData = twin?.document || {};

  const competencies = Array.isArray(twin?.competencies)
    ? twin.competencies
    : [];

  const skillGaps = Array.isArray(twin?.skill_gaps)
    ? twin.skill_gaps
    : [];

  const recommendations = Array.isArray(
    twin?.recommended_learning
  )
    ? twin.recommended_learning
    : [];

  const learningPath = Array.isArray(twin?.learning_path)
    ? twin.learning_path
    : [];

  const overallCompetency = Number(
    twin?.overall_competency || 0
  );

  const futurePotential = Number(
    twin?.future_potential || 0
  );

  const overallLevel =
    twin?.overall_level || "Not analyzed";

  const aiInsight =
    twin?.ai_insight ||
    "Upload a learning material to generate an AI-powered competency twin.";

  /* ============================================================
     TOP SKILLS
  ============================================================ */

  const strongestSkill = useMemo(() => {
    if (!competencies.length) return null;

    return [...competencies].sort(
      (a, b) =>
        Number(b.score || 0) -
        Number(a.score || 0)
    )[0];
  }, [competencies]);

  const weakestSkill = useMemo(() => {
    if (!competencies.length) return null;

    return [...competencies].sort(
      (a, b) =>
        Number(a.score || 0) -
        Number(b.score || 0)
    )[0];
  }, [competencies]);

  /* ============================================================
     ANALYZE PDF
  ============================================================ */

  const handleDigitalTwinAnalysis = async (file) => {
    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      toast.error("Please upload a PDF file.");
      return;
    }

    setSelectedFile(file);
    setBackendData(null);
    setIsAnalyzing(true);
    setScanProgress(0);
    setShowUpload(false);

    try {
      /*
       * Visual scanning animation.
       * The actual AI request runs in parallel.
       */
      const progressTimer = setInterval(() => {
        setScanProgress((previous) => {
          if (previous >= 92) {
            clearInterval(progressTimer);
            return 92;
          }

          return previous + Math.floor(Math.random() * 8) + 2;
        });
      }, 350);

      const result = await analyzeDigitalTwin(file);

      clearInterval(progressTimer);
      setScanProgress(100);

      if (!result?.success) {
        throw new Error(
          result?.detail ||
            "Digital Twin analysis failed."
        );
      }

      setBackendData(result);

      toast.success(
        "Digital Twin generated successfully!"
      );

      setActiveTab("overview");
    } catch (error) {
      console.error(
        "Digital Twin API Error:",
        error
      );

      setErrorMessage(
        error?.response?.data?.detail ||
          error?.message ||
          "Unable to connect to Digital Twin backend."
      );

      setShowUpload(true);

      toast.error(
        error?.response?.data?.detail ||
          "Digital Twin analysis failed."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  /* ============================================================
     ERROR STATE
  ============================================================ */

  const [errorMessage, setErrorMessage] = useState("");

  /* ============================================================
     FILE HANDLING
  ============================================================ */

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      handleDigitalTwinAnalysis(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleDigitalTwinAnalysis(file);
    }
  };

  const resetTwin = () => {
    setSelectedFile(null);
    setBackendData(null);
    setScanProgress(0);
    setShowUpload(true);
    setErrorMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* ============================================================
     UPLOAD SCREEN
  ============================================================ */

  if (!backendData && !isAnalyzing) {
    return (
      <div className="min-h-screen bg-[#fffdf5] text-[#172033]">
        {/* HEADER */}

        <div className="border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#172033] text-white">
                <Brain size={22} />
              </div>

              <div>
                <h1 className="font-black">
                  STATWISE AI
                </h1>

                <p className="text-xs text-slate-500">
                  AI Competency Digital Twin
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Dashboard
            </button>
          </div>
        </div>

        {/* HERO */}

        <section className="relative overflow-hidden px-5 py-16 sm:px-8 lg:py-24">
          <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />

          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-purple-200/20 blur-3xl" />

          <div className="relative mx-auto max-w-5xl text-center">
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{ duration: 0.7 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-[#eaf4ff] px-4 py-2 text-xs font-black uppercase tracking-wider text-[#1769c2]">
                <Sparkles size={14} />
                AI-Powered Digital Twin
              </span>

              <h2 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl">
                Build Your
                <span className="text-[#1769c2]">
                  {" "}
                  Competency Twin
                </span>
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-500 sm:text-lg">
                Upload your learning material and let
                STATWISE AI analyze the document,
                discover competencies, identify skill
                gaps and generate a personalized growth
                intelligence profile.
              </p>
            </motion.div>

            {/* UPLOAD */}

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                delay: 0.2,
                duration: 0.6,
              }}
              className="mx-auto mt-12 max-w-3xl"
            >
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => {
                  setDragActive(false);
                }}
                onDrop={handleDrop}
                className={`relative rounded-[2rem] border-2 border-dashed p-10 transition sm:p-14 ${
                  dragActive
                    ? "border-[#1769c2] bg-blue-50"
                    : "border-slate-300 bg-white"
                } shadow-xl shadow-slate-200/50`}
              >
                <motion.div
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                  className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#eaf4ff] text-[#1769c2]"
                >
                  <Brain size={42} />
                </motion.div>

                <h3 className="mt-7 text-2xl font-black">
                  Upload Learning Material
                </h3>

                <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-500">
                  Upload a PDF containing learning
                  material, training content, notes or
                  competency-related information.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <button
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-[#172033] px-7 py-4 font-black text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <Upload size={19} />
                  Choose PDF
                </button>

                <p className="mt-4 text-xs text-slate-400">
                  PDF files only
                </p>
              </div>
            </motion.div>

            {/* FEATURES */}

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: Target,
                  title: "Discover Skills",
                  text: "AI identifies competencies from your material.",
                },
                {
                  icon: Activity,
                  title: "Find Gaps",
                  text: "Detect areas that require further learning.",
                },
                {
                  icon: TrendingUp,
                  title: "Predict Growth",
                  text: "Estimate future competency potential.",
                },
              ].map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.title}
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: 0.3 + index * 0.1,
                    }}
                    className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-[#1769c2]">
                      <Icon size={21} />
                    </div>

                    <h4 className="mt-4 font-black">
                      {item.title}
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {item.text}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {errorMessage && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="mx-auto mt-8 max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
              >
                {errorMessage}
              </motion.div>
            )}
          </div>
        </section>
      </div>
    );
  }

  /* ============================================================
     SCANNING SCREEN
  ============================================================ */

  if (isAnalyzing) {
    return (
      <div className="min-h-screen overflow-hidden bg-[#fffdf5] text-[#172033]">
        <div className="flex min-h-screen items-center justify-center px-5">
          <div className="w-full max-w-3xl text-center">
            {/* ORB */}

            <div className="relative mx-auto h-72 w-72">
              {[1, 2, 3].map((ring) => (
                <motion.div
                  key={ring}
                  className="absolute inset-0 rounded-full border border-blue-300/50"
                  animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 2 + ring * 0.4,
                    repeat: Infinity,
                    delay: ring * 0.2,
                  }}
                  style={{
                    margin: `${ring * 18}px`,
                  }}
                />
              ))}

              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute inset-10 rounded-full border-2 border-dashed border-[#1769c2]"
              />

              <motion.div
                animate={{
                  scale: [1, 1.08, 1],
                  boxShadow: [
                    "0 0 20px rgba(23,105,194,0.2)",
                    "0 0 70px rgba(23,105,194,0.5)",
                    "0 0 20px rgba(23,105,194,0.2)",
                  ],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                }}
                className="absolute inset-20 flex items-center justify-center rounded-full bg-[#172033] text-white"
              >
                <Brain size={58} />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h1 className="mt-8 text-3xl font-black">
                Building Your Digital Twin
              </h1>

              <p className="mt-3 text-slate-500">
                AI is analyzing your uploaded learning
                material...
              </p>
            </motion.div>

            <div className="mx-auto mt-8 max-w-xl">
              <div className="mb-3 flex justify-between text-sm font-bold">
                <span>AI Analysis</span>

                <span>{scanProgress}%</span>
              </div>

              <div className="h-4 overflow-hidden rounded-full bg-slate-200">
                <motion.div
                  animate={{
                    width: `${scanProgress}%`,
                  }}
                  transition={{
                    duration: 0.3,
                  }}
                  className="h-full rounded-full bg-gradient-to-r from-[#1769c2] to-[#55b8ff]"
                />
              </div>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                "Reading PDF",
                "Discovering Skills",
                "Finding Gaps",
                "Predicting Growth",
              ].map((text, index) => (
                <motion.div
                  key={text}
                  initial={{
                    opacity: 0.3,
                  }}
                  animate={{
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: index * 0.3,
                  }}
                  className="rounded-xl bg-white p-3 text-xs font-bold text-slate-500 shadow-sm"
                >
                  {text}
                </motion.div>
              ))}
            </div>

            <div className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-400">
              <Loader2
                size={14}
                className="animate-spin"
              />

              {selectedFile?.name}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================
     DASHBOARD
  ============================================================ */

  return (
    <div className="min-h-screen bg-[#fffdf5] text-[#172033]">
      {/* HEADER */}

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#172033] text-white">
              <Brain size={21} />
            </div>

            <div>
              <h1 className="font-black">
                STATWISE AI
              </h1>

              <p className="text-[11px] font-semibold text-slate-500">
                Competency Digital Twin
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetTwin}
              className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 sm:flex"
            >
              <RefreshCw size={15} />
              New Analysis
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-xl bg-[#172033] px-4 py-2 text-sm font-bold text-white"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-12">
        {/* HERO */}

        <motion.section
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="relative overflow-hidden rounded-[2rem] bg-[#172033] p-7 text-white shadow-xl sm:p-10"
        >
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />

          <div className="absolute -bottom-20 left-20 h-60 w-60 rounded-full bg-purple-400/10 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-blue-200">
                  <Sparkles size={14} />
                  AI GENERATED
                </span>

                <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white/70">
                  {documentData?.filename ||
                    selectedFile?.name ||
                    "Learning Material"}
                </span>
              </div>

              <h2 className="mt-5 text-3xl font-black sm:text-5xl">
                Your Competency
                <span className="text-blue-300">
                  {" "}
                  Digital Twin
                </span>
              </h2>

              <p className="mt-4 max-w-2xl leading-7 text-white/70">
                A living AI representation of the
                competencies discovered from your learning
                material, including skill strengths, gaps,
                learning priorities and future potential.
              </p>
            </div>

            {/* TWIN ORB */}

            <motion.div
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
              className="mx-auto flex h-36 w-36 items-center justify-center rounded-full border border-blue-300/30 bg-white/5 shadow-[0_0_80px_rgba(70,160,255,0.18)]"
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-400/10">
                <Brain
                  size={48}
                  className="text-blue-300"
                />
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* METRICS */}

        <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Overall Competency",
              value: overallCompetency,
              suffix: "%",
              icon: Gauge,
              description: overallLevel,
            },
            {
              title: "Future Potential",
              value: futurePotential,
              suffix: "%",
              icon: TrendingUp,
              description: "Growth potential",
            },
            {
              title: "Competencies",
              value: competencies.length,
              suffix: "",
              icon: Target,
              description: "AI discovered",
            },
            {
              title: "Priority Gaps",
              value: skillGaps.length,
              suffix: "",
              icon: Activity,
              description: "Areas to improve",
            },
          ].map((metric, index) => {
            const Icon = metric.icon;

            return (
              <motion.div
                key={metric.title}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.08,
                }}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf4ff] text-[#1769c2]">
                    <Icon size={21} />
                  </div>

                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase text-slate-500">
                    Live Twin
                  </span>
                </div>

                <p className="mt-5 text-sm font-semibold text-slate-500">
                  {metric.title}
                </p>

                <div className="mt-1 text-3xl font-black text-[#172033]">
                  <AnimatedNumber
                    value={metric.value}
                    suffix={metric.suffix}
                  />
                </div>

                <p className="mt-1 text-xs font-semibold text-slate-400">
                  {metric.description}
                </p>
              </motion.div>
            );
          })}
        </section>

        {/* TABS */}

        <div className="mt-8 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2">
          {[
            {
              id: "overview",
              label: "Overview",
              icon: Gauge,
            },
            {
              id: "gaps",
              label: "Skill Gaps",
              icon: Target,
            },
            {
              id: "learning",
              label: "Learning Path",
              icon: FileText,
            },
            {
              id: "insights",
              label: "AI Insights",
              icon: Lightbulb,
            },
          ].map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition ${
                  activeTab === tab.id
                    ? "bg-[#172033] text-white shadow"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENT */}

        <AnimatePresence mode="wait">
          {/* ==================================================
              OVERVIEW
          ================================================== */}

          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              className="mt-7 grid gap-7 lg:grid-cols-[1.5fr_1fr]"
            >
              {/* COMPETENCIES */}

              <section>
                <div className="mb-4 flex items-end justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-[#1769c2]">
                      Skill Intelligence
                    </p>

                    <h3 className="mt-1 text-2xl font-black">
                      Competency Profile
                    </h3>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${getLevelClass(
                      overallLevel
                    )}`}
                  >
                    {overallLevel}
                  </span>
                </div>

                <div className="space-y-4">
                  {competencies.length > 0 ? (
                    competencies.map((skill, index) => (
                      <SkillBar
                        key={`${skill.name}-${index}`}
                        skill={skill}
                      />
                    ))
                  ) : (
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                      No competency data available.
                    </div>
                  )}
                </div>
              </section>

              {/* DOCUMENT + TOP SKILLS */}

              <aside className="space-y-5">
                {/* DOCUMENT */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff8dc] text-[#9a7300]">
                      <FileText size={21} />
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Source Material
                      </p>

                      <h3 className="mt-1 font-black">
                        {documentData?.title ||
                          selectedFile?.name ||
                          "Uploaded PDF"}
                      </h3>
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-7 text-slate-500">
                    {documentData?.summary ||
                      "AI analyzed the uploaded learning material and generated a competency-oriented representation."}
                  </p>

                  {documentData?.topics?.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {documentData.topics.map(
                        (topic, index) => (
                          <span
                            key={`${topic}-${index}`}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"
                          >
                            {topic}
                          </span>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* STRONGEST */}

                {strongestSkill && (
                  <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-green-600">
                        <CheckCircle2 size={21} />
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase text-green-600">
                          Strongest Competency
                        </p>

                        <h3 className="font-black text-green-900">
                          {strongestSkill.name}
                        </h3>
                      </div>
                    </div>

                    <div className="mt-4 text-3xl font-black text-green-700">
                      <AnimatedNumber
                        value={strongestSkill.score}
                        suffix="%"
                      />
                    </div>
                  </div>
                )}

                {/* WEAKEST */}

                {weakestSkill && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-red-600">
                        <Target size={21} />
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase text-red-600">
                          Development Focus
                        </p>

                        <h3 className="font-black text-red-900">
                          {weakestSkill.name}
                        </h3>
                      </div>
                    </div>

                    <div className="mt-4 text-3xl font-black text-red-700">
                      <AnimatedNumber
                        value={weakestSkill.score}
                        suffix="%"
                      />
                    </div>
                  </div>
                )}
              </aside>
            </motion.div>
          )}

          {/* ==================================================
              GAPS
          ================================================== */}

          {activeTab === "gaps" && (
            <motion.div
              key="gaps"
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              className="mt-7"
            >
              <div className="mb-6">
                <p className="text-xs font-black uppercase tracking-wider text-red-600">
                  Gap Analysis
                </p>

                <h3 className="mt-1 text-2xl font-black">
                  Priority Skill Gaps
                </h3>

                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
                  These areas were identified by the AI
                  analysis as competencies that require
                  additional development.
                </p>
              </div>

              {skillGaps.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-2">
                  {skillGaps.map((gap, index) => (
                    <motion.div
                      key={`${gap.name}-${index}`}
                      initial={{
                        opacity: 0,
                        scale: 0.96,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      transition={{
                        delay: index * 0.08,
                      }}
                      className={`rounded-2xl border p-6 ${getGapClass(
                        gap.priority
                      )}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                            <Target
                              size={21}
                              className={getGapTextClass(
                                gap.priority
                              )}
                            />
                          </div>

                          <div>
                            <h3 className="font-black">
                              {gap.name}
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-slate-600">
                              {gap.reason ||
                                "Additional learning is recommended for this competency."}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`shrink-0 rounded-full bg-white px-3 py-1 text-xs font-black ${getGapTextClass(
                            gap.priority
                          )}`}
                        >
                          {gap.priority ||
                            "Priority"}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-10 text-center">
                  <CheckCircle2
                    size={45}
                    className="mx-auto text-green-600"
                  />

                  <h3 className="mt-4 text-xl font-black text-green-900">
                    No major skill gaps detected
                  </h3>

                  <p className="mt-2 text-sm text-green-700">
                    Continue learning and reassess your
                    competency regularly.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* ==================================================
              LEARNING
          ================================================== */}

          {activeTab === "learning" && (
            <motion.div
              key="learning"
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              className="mt-7 grid gap-7 lg:grid-cols-[1.2fr_0.8fr]"
            >
              {/* LEARNING PATH */}

              <section>
                <div className="mb-6">
                  <p className="text-xs font-black uppercase tracking-wider text-[#1769c2]">
                    Personalized Growth
                  </p>

                  <h3 className="mt-1 text-2xl font-black">
                    Recommended Learning Path
                  </h3>
                </div>

                <div className="space-y-4">
                  {learningPath.length > 0 ? (
                    learningPath.map((step, index) => (
                      <motion.div
                        key={`${step.step}-${index}`}
                        initial={{
                          opacity: 0,
                          x: -15,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          delay: index * 0.08,
                        }}
                        className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                      >
                        <div className="flex gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#172033] text-sm font-black text-white">
                            {step.step ||
                              index + 1}
                          </div>

                          <div>
                            <h3 className="font-black">
                              {step.title ||
                                "Learning Step"}
                            </h3>

                            <p className="mt-2 text-sm leading-7 text-slate-500">
                              {step.description ||
                                "Continue with this learning activity to improve competency."}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : recommendations.length > 0 ? (
                    recommendations.map(
                      (course, index) => (
                        <motion.div
                          key={`${course.title}-${index}`}
                          initial={{
                            opacity: 0,
                            x: -15,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          transition={{
                            delay: index * 0.08,
                          }}
                          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-black">
                                {course.title}
                              </h3>

                              <p className="mt-2 text-sm leading-6 text-slate-500">
                                {course.reason}
                              </p>
                            </div>

                            <span className="flex shrink-0 items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                              <Clock3 size={12} />
                              {course.estimated_hours ||
                                0}
                              h
                            </span>
                          </div>
                        </motion.div>
                      )
                    )
                  ) : (
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                      No learning path generated yet.
                    </div>
                  )}
                </div>
              </section>

              {/* COURSE RECOMMENDATIONS */}

              <aside>
                <div className="mb-6">
                  <p className="text-xs font-black uppercase tracking-wider text-purple-600">
                    AI Recommendations
                  </p>

                  <h3 className="mt-1 text-2xl font-black">
                    Next Best Actions
                  </h3>
                </div>

                <div className="space-y-4">
                  {recommendations.length > 0 ? (
                    recommendations.map(
                      (course, index) => (
                        <motion.div
                          key={`${course.title}-recommendation-${index}`}
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
                          className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                              <Zap size={19} />
                            </div>

                            <div>
                              <h4 className="font-black">
                                {course.title}
                              </h4>

                              <p className="mt-2 text-sm leading-6 text-slate-500">
                                {course.reason}
                              </p>

                              {course.estimated_hours && (
                                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-400">
                                  <Clock3 size={13} />
                                  Estimated learning:
                                  {" "}
                                  {
                                    course.estimated_hours
                                  }
                                  hours
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )
                    )
                  ) : (
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                      No recommendations available.
                    </div>
                  )}
                </div>
              </aside>
            </motion.div>
          )}

          {/* ==================================================
              INSIGHTS
          ================================================== */}

          {activeTab === "insights" && (
            <motion.div
              key="insights"
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              className="mt-7 grid gap-7 lg:grid-cols-[1.2fr_0.8fr]"
            >
              {/* AI INSIGHT */}

              <section className="rounded-[2rem] bg-[#172033] p-7 text-white shadow-xl sm:p-9">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <Lightbulb
                      size={24}
                      className="text-yellow-300"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-blue-300">
                      AI Insight
                    </p>

                    <h3 className="mt-1 text-xl font-black">
                      Digital Twin Intelligence
                    </h3>
                  </div>
                </div>

                <p className="mt-7 text-lg leading-9 text-white/80">
                  {aiInsight}
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/5 p-5">
                    <p className="text-xs font-bold text-white/50">
                      Current State
                    </p>

                    <p className="mt-2 text-2xl font-black">
                      {overallCompetency}%
                    </p>

                    <p className="mt-1 text-xs text-white/50">
                      {overallLevel}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/5 p-5">
                    <p className="text-xs font-bold text-white/50">
                      Future Potential
                    </p>

                    <p className="mt-2 text-2xl font-black text-blue-300">
                      {futurePotential}%
                    </p>

                    <p className="mt-1 text-xs text-white/50">
                      AI estimated growth potential
                    </p>
                  </div>
                </div>
              </section>

              {/* HOW TWIN WORKS */}

              <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
                <p className="text-xs font-black uppercase tracking-wider text-[#1769c2]">
                  Continuous Intelligence
                </p>

                <h3 className="mt-1 text-2xl font-black">
                  Twin Learning Loop
                </h3>

                <div className="mt-7 space-y-3">
                  {[
                    {
                      icon: FileText,
                      title: "Analyze",
                      text: "AI analyzes learning material.",
                    },
                    {
                      icon: Target,
                      title: "Identify",
                      text: "Competencies and gaps are discovered.",
                    },
                    {
                      icon: Zap,
                      title: "Learn",
                      text: "Personalized learning is recommended.",
                    },
                    {
                      icon: CheckCircle2,
                      title: "Assess",
                      text: "Future assessments can update competency.",
                    },
                    {
                      icon: TrendingUp,
                      title: "Predict",
                      text: "The twin estimates future growth.",
                    },
                  ].map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <motion.div
                        key={item.title}
                        initial={{
                          opacity: 0,
                          x: 15,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          delay: index * 0.08,
                        }}
                        className="flex items-center gap-4 rounded-xl bg-slate-50 p-4"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#1769c2] shadow-sm">
                          <Icon size={18} />
                        </div>

                        <div>
                          <h4 className="text-sm font-black">
                            {item.title}
                          </h4>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {item.text}
                          </p>
                        </div>

                        {index <
                          4 && (
                          <ArrowRight
                            size={15}
                            className="ml-auto text-slate-300"
                          />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ======================================================
            BOTTOM ACTION
        ====================================================== */}

        <section className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Sparkles
                size={21}
                className="mt-1 shrink-0 text-[#1769c2]"
              />

              <div>
                <h3 className="font-black text-blue-900">
                  Keep your Digital Twin evolving
                </h3>

                <p className="mt-1 text-sm leading-6 text-blue-700">
                  Complete recommended learning,
                  take assessments and generate a new
                  analysis to track competency growth.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                resetTwin();
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#172033] px-5 py-3 text-sm font-black text-white"
            >
              <RefreshCw size={16} />
              Analyze New Material
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}