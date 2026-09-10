import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Upload,
  FileText,
  Presentation,
  Sparkles,
  Brain,
  Wand2,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Trash2,
  Layers,
  BarChart3,
  Lightbulb,
  BookOpen,
  Target,
  Zap,
  ShieldCheck,
  RefreshCw,
  X,
  Play,
  Rocket,
} from "lucide-react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import toast from "react-hot-toast";

import { generatePPT } from "../../services/api";


const BACKEND_URL =
  "http://127.0.0.1:8000";


const styles = [
  {
    id: "Visual Learning",
    title: "Visual Learning",
    description:
      "Diagrams, comparisons, examples and visual structure.",
    icon: Presentation,
  },
  {
    id: "Professional",
    title: "Professional",
    description:
      "Clean presentation suitable for academic or professional use.",
    icon: Target,
  },
  {
    id: "Academic",
    title: "Academic",
    description:
      "Detailed explanations, concepts and structured learning.",
    icon: BookOpen,
  },
  {
    id: "Exam Preparation",
    title: "Exam Preparation",
    description:
      "Key concepts, important points and knowledge checks.",
    icon: Lightbulb,
  },
];


const generationSteps = [
  "Reading your PDF",
  "Understanding the learning material",
  "Finding important concepts",
  "Organizing topics",
  "Planning slide structure",
  "Creating visual layouts",
  "Building presentation",
  "Finalizing PowerPoint",
];


function formatSlideType(type) {
  if (!type) return "Content";

  return type
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}


function GenerationOverlay() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((current) =>
        current <
        generationSteps.length - 1
          ? current + 1
          : current
      );
    }, 1200);

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-[#172033]/95 backdrop-blur-xl flex items-center justify-center p-6"
    >
      <div className="max-w-lg w-full">

        <div className="relative mx-auto w-40 h-40 mb-8">

          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 rounded-full border-2 border-yellow-300/30 border-t-yellow-300"
          />

          <motion.div
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-5 rounded-full border border-blue-300/30 border-r-blue-300"
          />

          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              boxShadow: [
                "0 0 20px rgba(246,215,106,.2)",
                "0 0 70px rgba(246,215,106,.45)",
                "0 0 20px rgba(246,215,106,.2)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="absolute inset-10 rounded-3xl bg-yellow-300 flex items-center justify-center"
          >
            <Brain className="w-12 h-12 text-[#172033]" />
          </motion.div>

        </div>

        <div className="text-center text-white">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 mb-4">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-sm">
              STATWISE AI is creating your presentation
            </span>
          </div>

          <h2 className="text-3xl font-bold">
            Building Your PPT
          </h2>

          <p className="text-white/60 mt-2">
            Turning knowledge into an interactive presentation
          </p>

        </div>

        <div className="mt-8 space-y-3">

          {generationSteps.map(
            (item, index) => {

              const completed =
                index < step;

              const active =
                index === step;

              return (
                <motion.div
                  key={item}
                  initial={{
                    opacity: 0,
                    x: -15,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay: index * 0.04,
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    active
                      ? "bg-yellow-300 text-[#172033]"
                      : completed
                      ? "bg-green-400/10 text-green-300"
                      : "bg-white/5 text-white/40"
                  }`}
                >

                  {completed ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : active ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-current" />
                  )}

                  <span className="text-sm font-medium">
                    {item}
                  </span>

                </motion.div>
              );
            }
          )}

        </div>

      </div>
    </motion.div>
  );
}


function StatCard({
  icon: Icon,
  value,
  label,
}) {
  return (
    <motion.div
      whileHover={{
        y: -4,
      }}
      className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"
    >
      <div className="flex items-center gap-3">

        <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
          <Icon className="w-5 h-5 text-yellow-700" />
        </div>

        <div>
          <div className="text-xl font-bold text-[#172033]">
            {value}
          </div>

          <div className="text-xs text-slate-500">
            {label}
          </div>
        </div>

      </div>
    </motion.div>
  );
}


export default function PPTGenerator() {

  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [style, setStyle] =
    useState("Visual Learning");

  const [dragging, setDragging] =
    useState(false);

  const [generating, setGenerating] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [activeSlide, setActiveSlide] =
    useState(0);

  const [showPreview, setShowPreview] =
    useState(false);


  const presentation =
    result?.presentation;

  const slides =
    presentation?.slides || [];


  const totalSlides =
    slides.length + 1;


  const currentSlide =
    activeSlide === 0
      ? {
          type: "title",
          title:
            presentation?.title ||
            "STATWISE AI Presentation",
          subtitle:
            presentation?.subtitle ||
            "AI Generated Presentation",
        }
      : slides[
          activeSlide - 1
        ];


  const fileSize =
    useMemo(() => {

      if (!selectedFile)
        return "";

      const mb =
        selectedFile.size /
        (1024 * 1024);

      return `${mb.toFixed(2)} MB`;

    }, [selectedFile]);


  useEffect(() => {

    const handleKeyDown =
      (event) => {

        if (!showPreview)
          return;

        if (
          event.key ===
          "ArrowRight"
        ) {
          setActiveSlide(
            (current) =>
              Math.min(
                current + 1,
                totalSlides - 1
              )
          );
        }

        if (
          event.key ===
          "ArrowLeft"
        ) {
          setActiveSlide(
            (current) =>
              Math.max(
                current - 1,
                0
              )
          );
        }

        if (
          event.key ===
          "Escape"
        ) {
          setShowPreview(false);
        }
      };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

  }, [
    showPreview,
    totalSlides,
  ]);


  const validatePDF = (
    file
  ) => {

    if (!file)
      return false;

    const isPDF =
      file.type ===
        "application/pdf" ||
      file.name
        .toLowerCase()
        .endsWith(".pdf");

    if (!isPDF) {

      toast.error(
        "Only PDF files are allowed."
      );

      return false;
    }

    return true;
  };


  const selectFile = (
    file
  ) => {

    if (!validatePDF(file))
      return;

    setSelectedFile(file);
    setResult(null);
    setActiveSlide(0);

    toast.success(
      "PDF selected successfully."
    );
  };


  const handleFileInput = (
    event
  ) => {

    const file =
      event.target.files?.[0];

    if (file) {
      selectFile(file);
    }

    event.target.value = "";
  };


  const handleDrop = (
    event
  ) => {

    event.preventDefault();

    setDragging(false);

    const file =
      event.dataTransfer.files?.[0];

    if (file) {
      selectFile(file);
    }
  };


  const generate = async () => {

    if (!selectedFile) {

      toast.error(
        "Please upload a PDF first."
      );

      return;
    }

    setGenerating(true);

    try {

      const data =
        await generatePPT({
          file: selectedFile,
          style,
        });

      if (
        !data ||
        data.success === false
      ) {
        throw new Error(
          data?.message ||
          "Presentation generation failed."
        );
      }

      setResult(data);
      setActiveSlide(0);

      toast.success(
        "Your presentation is ready!"
      );

    } catch (error) {

      console.error(
        "PPT generation error:",
        error
      );

      toast.error(
        error?.message ||
        "Unable to generate presentation."
      );

    } finally {

      setGenerating(false);
    }
  };


  const reset = () => {

    setSelectedFile(null);
    setResult(null);
    setActiveSlide(0);
    setShowPreview(false);

    toast.success(
      "Presentation workspace reset."
    );
  };


  const downloadPPT = () => {

    if (!result?.download_url) {

      toast.error(
        "No presentation file available."
      );

      return;
    }

    const url =
      result.download_url.startsWith(
        "http"
      )
        ? result.download_url
        : `${BACKEND_URL}${result.download_url}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };


  const nextSlide = () => {

    setActiveSlide(
      (current) =>
        Math.min(
          current + 1,
          totalSlides - 1
        )
    );
  };


  const previousSlide = () => {

    setActiveSlide(
      (current) =>
        Math.max(
          current - 1,
          0
        )
    );
  };


  return (
    <div className="min-h-screen bg-[#fffdf5] text-[#172033]">

      {/* Background */}

      <div className="fixed inset-0 pointer-events-none overflow-hidden">

        <motion.div
          animate={{
            x: [0, 40, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-48 -left-48 w-[500px] h-[500px] rounded-full bg-yellow-200/30 blur-3xl"
        />

        <motion.div
          animate={{
            x: [0, -50, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/3 -right-48 w-[500px] h-[500px] rounded-full bg-blue-200/20 blur-3xl"
        />

      </div>


      {/* Header */}

      <header className="relative z-10 border-b border-slate-200 bg-white/80 backdrop-blur-xl">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <motion.div
                animate={{
                  rotate: [0, 3, -3, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
                className="w-12 h-12 rounded-2xl bg-[#172033] flex items-center justify-center shadow-lg"
              >
                <Presentation className="w-6 h-6 text-yellow-300" />
              </motion.div>

              <div>

                <h1 className="text-xl sm:text-2xl font-bold">
                  STATWISE AI PPT Generator
                </h1>

                <p className="text-xs sm:text-sm text-slate-500">
                  Turn learning material into dynamic presentations
                </p>

              </div>

            </div>

            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">

              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />

              AI Presentation Engine

            </div>

          </div>

        </div>

      </header>


      {/* Main */}

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {!result ? (

          <>

            {/* Hero */}

            <section className="text-center max-w-4xl mx-auto mb-10">

              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 border border-yellow-200 text-yellow-800 text-sm font-semibold"
              >
                <Sparkles className="w-4 h-4" />
                AI-Powered Presentation Intelligence
              </motion.div>

              <motion.h2
                initial={{
                  opacity: 0,
                  y: 25,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.1,
                }}
                className="text-4xl sm:text-6xl font-black tracking-tight mt-5"
              >
                Turn Knowledge
                <br />

                <span className="text-yellow-500">
                  Into Presentations
                </span>
              </motion.h2>

              <motion.p
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.2,
                }}
                className="text-slate-500 text-base sm:text-lg mt-5 max-w-2xl mx-auto"
              >
                Upload a PDF and let STATWISE AI
                understand the material, organize the
                concepts and build a rich educational
                PowerPoint automatically.
              </motion.p>

            </section>


            {/* Upload + Style */}

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Upload */}

              <motion.div
                whileHover={{
                  y: -3,
                }}
                className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm"
              >

                <div className="flex items-center justify-between mb-5">

                  <div>

                    <h3 className="text-xl font-bold flex items-center gap-2">

                      <FileText className="w-5 h-5 text-yellow-600" />

                      Upload Learning Material

                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      PDF files only
                    </p>

                  </div>

                  <div className="px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                    PDF ONLY
                  </div>

                </div>


                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileInput}
                  className="hidden"
                />


                {!selectedFile ? (

                  <motion.button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() =>
                      setDragging(false)
                    }
                    onDrop={handleDrop}
                    animate={{
                      scale: dragging
                        ? 1.015
                        : 1,
                    }}
                    className={`w-full min-h-[330px] rounded-3xl border-2 border-dashed transition flex flex-col items-center justify-center ${
                      dragging
                        ? "border-yellow-400 bg-yellow-50"
                        : "border-slate-300 bg-slate-50 hover:bg-yellow-50 hover:border-yellow-300"
                    }`}
                  >

                    <motion.div
                      animate={{
                        y: [0, -8, 0],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                      }}
                      className="w-20 h-20 rounded-3xl bg-yellow-100 flex items-center justify-center mb-5"
                    >
                      <Upload className="w-10 h-10 text-yellow-700" />
                    </motion.div>

                    <h4 className="text-xl font-bold">
                      Drop your PDF here
                    </h4>

                    <p className="text-sm text-slate-500 mt-2">
                      or click to browse your computer
                    </p>

                    <div className="flex items-center gap-3 mt-5 text-xs text-slate-400">

                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4" />
                        Secure processing
                      </span>

                      <span>•</span>

                      <span>
                        PDF only
                      </span>

                    </div>

                  </motion.button>

                ) : (

                  <div className="rounded-3xl border border-green-200 bg-green-50 p-6">

                    <div className="flex items-start gap-4">

                      <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shrink-0">
                        <FileText className="w-7 h-7 text-green-600" />
                      </div>

                      <div className="min-w-0 flex-1">

                        <h4 className="font-bold truncate">
                          {selectedFile.name}
                        </h4>

                        <p className="text-sm text-green-700 mt-1">
                          {fileSize}
                        </p>

                        <div className="flex items-center gap-2 mt-3 text-sm text-green-700">

                          <CheckCircle2 className="w-4 h-4" />

                          PDF ready for AI analysis

                        </div>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedFile(null)
                        }
                        className="w-9 h-9 rounded-xl bg-white flex items-center justify-center hover:bg-red-50 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>

                    </div>


                    <div className="grid grid-cols-3 gap-3 mt-6">

                      <div className="bg-white rounded-xl p-3 text-center">
                        <FileText className="w-5 h-5 mx-auto text-slate-500" />
                        <p className="text-xs text-slate-500 mt-1">
                          PDF
                        </p>
                      </div>

                      <div className="bg-white rounded-xl p-3 text-center">
                        <Brain className="w-5 h-5 mx-auto text-yellow-600" />
                        <p className="text-xs text-slate-500 mt-1">
                          AI Analysis
                        </p>
                      </div>

                      <div className="bg-white rounded-xl p-3 text-center">
                        <Presentation className="w-5 h-5 mx-auto text-blue-600" />
                        <p className="text-xs text-slate-500 mt-1">
                          PPTX
                        </p>
                      </div>

                    </div>

                  </div>

                )}

              </motion.div>


              {/* Style */}

              <motion.div
                whileHover={{
                  y: -3,
                }}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm"
              >

                <h3 className="text-xl font-bold flex items-center gap-2">

                  <Wand2 className="w-5 h-5 text-yellow-600" />

                  Presentation Style

                </h3>

                <p className="text-sm text-slate-500 mt-1 mb-5">
                  Tell AI how you want your presentation to feel.
                </p>


                <div className="space-y-3">

                  {styles.map(
                    (item) => {

                      const Icon =
                        item.icon;

                      const active =
                        style ===
                        item.id;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            setStyle(
                              item.id
                            )
                          }
                          className={`w-full text-left rounded-2xl p-4 border transition ${
                            active
                              ? "border-yellow-400 bg-yellow-50 shadow-sm"
                              : "border-slate-200 hover:border-yellow-300 hover:bg-slate-50"
                          }`}
                        >

                          <div className="flex items-start gap-3">

                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                active
                                  ? "bg-yellow-300"
                                  : "bg-slate-100"
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>

                            <div className="flex-1">

                              <div className="font-bold text-sm">
                                {item.title}
                              </div>

                              <div className="text-xs text-slate-500 mt-1 leading-5">
                                {item.description}
                              </div>

                            </div>

                            {active && (
                              <CheckCircle2 className="w-5 h-5 text-yellow-600" />
                            )}

                          </div>

                        </button>
                      );
                    }
                  )}

                </div>

              </motion.div>

            </section>


            {/* Intelligence Pipeline */}

            <section className="mt-8 bg-[#172033] rounded-3xl p-6 sm:p-8 text-white overflow-hidden relative">

              <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-yellow-300/10 blur-3xl" />

              <div className="relative">

                <div className="flex items-center gap-2">

                  <Zap className="w-5 h-5 text-yellow-300" />

                  <h3 className="font-bold text-lg">
                    AI Presentation Pipeline
                  </h3>

                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">

                  {[
                    ["01", "Read PDF"],
                    ["02", "Understand"],
                    ["03", "Plan Slides"],
                    ["04", "Build PPT"],
                  ].map(
                    ([number, title]) => (
                      <motion.div
                        key={number}
                        whileHover={{
                          y: -5,
                        }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-4"
                      >

                        <div className="text-yellow-300 font-black text-2xl">
                          {number}
                        </div>

                        <div className="font-semibold mt-2">
                          {title}
                        </div>

                      </motion.div>
                    )
                  )}

                </div>

              </div>

            </section>


            {/* Generate */}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">

              <motion.button
                whileHover={{
                  scale: 1.03,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                onClick={generate}
                disabled={
                  !selectedFile ||
                  generating
                }
                className="px-8 py-4 rounded-2xl bg-[#172033] text-white font-bold shadow-xl hover:bg-[#25314a] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3"
              >

                <Rocket className="w-5 h-5 text-yellow-300" />

                Generate Dynamic Presentation

              </motion.button>

            </div>

          </>

        ) : (

          /* ==================================================
             RESULT
          ================================================== */

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
          >

            {/* Success header */}

            <section className="bg-[#172033] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">

              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute -right-20 -top-20 w-72 h-72 rounded-full border border-yellow-300/20"
              />

              <div className="relative">

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

                  <div>

                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-400/10 text-green-300 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      PRESENTATION READY
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-black mt-4">
                      {presentation?.title}
                    </h2>

                    <p className="text-white/60 mt-2">
                      {presentation?.subtitle}
                    </p>

                  </div>


                  <div className="flex flex-wrap gap-3">

                    <button
                      type="button"
                      onClick={() => {
                        setActiveSlide(0);
                        setShowPreview(true);
                      }}
                      className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 flex items-center gap-2 font-semibold"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>

                    <button
                      type="button"
                      onClick={downloadPPT}
                      className="px-5 py-3 rounded-xl bg-yellow-300 text-[#172033] hover:bg-yellow-200 flex items-center gap-2 font-bold"
                    >
                      <Download className="w-4 h-4" />
                      Download PPT
                    </button>

                  </div>

                </div>

              </div>

            </section>


            {/* Statistics */}

            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">

              <StatCard
                icon={Layers}
                value={result.slides || totalSlides}
                label="Slides generated"
              />

              <StatCard
                icon={Brain}
                value={
                  result.concepts ||
                  slides.length
                }
                label="AI content blocks"
              />

              <StatCard
                icon={BarChart3}
                value={
                  result.visuals || 0
                }
                label="Visual layouts"
              />

              <StatCard
                icon={Sparkles}
                value={presentation?.style}
                label="Presentation style"
              />

            </section>


            {/* Preview */}

            <section className="mt-6 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">

              <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                <div>

                  <h3 className="font-bold flex items-center gap-2">

                    <Eye className="w-5 h-5 text-yellow-600" />

                    Presentation Preview

                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    Slide {activeSlide + 1} of {totalSlides}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveSlide(0);
                    setShowPreview(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-yellow-50 text-sm font-semibold flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Full Preview
                </button>

              </div>


              <div className="p-5 sm:p-8">

                {/* Slide */}

                <motion.div
                  key={activeSlide}
                  initial={{
                    opacity: 0,
                    scale: 0.98,
                    x: 20,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    x: 0,
                  }}
                  className={`aspect-video rounded-2xl overflow-hidden shadow-xl border ${
                    activeSlide === 0
                      ? "bg-[#172033]"
                      : "bg-[#fffdf5]"
                  }`}
                >

                  {activeSlide === 0 ? (

                    <div className="h-full flex flex-col justify-center px-[8%] relative overflow-hidden">

                      <div className="absolute right-[-10%] top-[-30%] w-[40%] aspect-square rounded-full bg-yellow-300/20 blur-2xl" />

                      <div className="relative">

                        <div className="inline-flex px-4 py-2 rounded-full bg-yellow-300 text-[#172033] text-xs font-bold">
                          STATWISE AI
                        </div>

                        <h4 className="text-white text-3xl sm:text-5xl font-black mt-6 max-w-4xl">
                          {currentSlide.title}
                        </h4>

                        <p className="text-yellow-300 text-lg sm:text-xl mt-4 max-w-3xl">
                          {currentSlide.subtitle}
                        </p>

                      </div>

                    </div>

                  ) : (

                    <div className="h-full p-6 sm:p-10">

                      <div className="flex items-center justify-between gap-4">

                        <div>

                          <div className="text-xs uppercase tracking-widest text-yellow-600 font-bold">
                            {formatSlideType(
                              currentSlide.type
                            )}
                          </div>

                          <h4 className="text-xl sm:text-3xl font-black mt-2">
                            {currentSlide.title}
                          </h4>

                        </div>

                        <div className="hidden sm:flex w-10 h-10 rounded-xl bg-yellow-100 items-center justify-center">
                          <Sparkles className="w-5 h-5 text-yellow-700" />
                        </div>

                      </div>


                      <div className="mt-6 h-[65%] overflow-hidden">

                        {currentSlide.type ===
                        "comparison" ? (

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 h-full">

                            {currentSlide.items
                              ?.slice(0, 4)
                              .map(
                                (
                                  item,
                                  index
                                ) => (
                                  <div
                                    key={index}
                                    className="rounded-2xl border border-slate-200 bg-white p-4"
                                  >

                                    <div className="font-bold text-sm">
                                      {item.name}
                                    </div>

                                    <div className="text-xs text-slate-500 mt-2">
                                      {item.description}
                                    </div>

                                    {item.example && (
                                      <div className="text-xs text-yellow-700 mt-3 font-medium">
                                        {item.example}
                                      </div>
                                    )}

                                  </div>
                                )
                              )}

                          </div>

                        ) : currentSlide.type ===
                          "process" ? (

                          <div className="flex items-center justify-center h-full">

                            <div className="flex items-center gap-2 flex-wrap justify-center">

                              {currentSlide.items
                                ?.slice(0, 6)
                                .map(
                                  (
                                    item,
                                    index
                                  ) => (
                                    <React.Fragment
                                      key={index}
                                    >

                                      <div className="w-28 h-24 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center text-center p-2 shadow-sm">

                                        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center font-bold text-yellow-700">
                                          {index + 1}
                                        </div>

                                        <div className="text-xs font-bold mt-2">
                                          {item.name}
                                        </div>

                                      </div>

                                      {index <
                                        currentSlide.items.length -
                                          1 && (
                                        <ChevronRight className="w-5 h-5 text-slate-400" />
                                      )}

                                    </React.Fragment>
                                  )
                                )}

                            </div>

                          </div>

                        ) : (

                          <div className="grid md:grid-cols-2 gap-4 h-full overflow-auto pr-2">

                            {currentSlide.points
                              ?.slice(0, 8)
                              .map(
                                (
                                  point,
                                  index
                                ) => (
                                  <div
                                    key={index}
                                    className="rounded-2xl bg-white border border-slate-200 p-4 flex gap-3"
                                  >

                                    <div className="w-7 h-7 shrink-0 rounded-lg bg-yellow-100 flex items-center justify-center">
                                      <span className="text-xs font-bold text-yellow-700">
                                        {index + 1}
                                      </span>
                                    </div>

                                    <p className="text-sm leading-6 text-slate-700">
                                      {point}
                                    </p>

                                  </div>
                                )
                              )}

                            {!currentSlide.points?.length &&
                              currentSlide.items?.map(
                                (
                                  item,
                                  index
                                ) => (
                                  <div
                                    key={index}
                                    className="rounded-2xl bg-white border border-slate-200 p-4"
                                  >
                                    <div className="font-bold">
                                      {item.name}
                                    </div>

                                    <p className="text-sm text-slate-500 mt-2">
                                      {item.description}
                                    </p>
                                  </div>
                                )
                              )}

                          </div>

                        )}

                      </div>

                    </div>

                  )}

                </motion.div>


                {/* Controls */}

                <div className="flex items-center justify-between mt-5">

                  <button
                    type="button"
                    onClick={previousSlide}
                    disabled={
                      activeSlide === 0
                    }
                    className="w-11 h-11 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-2 overflow-x-auto max-w-[70%] px-2">

                    {Array.from({
                      length: totalSlides,
                    }).map(
                      (_, index) => (

                        <button
                          key={index}
                          type="button"
                          onClick={() =>
                            setActiveSlide(
                              index
                            )
                          }
                          className={`shrink-0 w-8 h-8 rounded-lg text-xs font-bold transition ${
                            activeSlide ===
                            index
                              ? "bg-[#172033] text-white"
                              : "bg-slate-100 text-slate-500 hover:bg-yellow-100"
                          }`}
                        >
                          {index + 1}
                        </button>

                      )
                    )}

                  </div>

                  <button
                    type="button"
                    onClick={nextSlide}
                    disabled={
                      activeSlide ===
                      totalSlides - 1
                    }
                    className="w-11 h-11 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                </div>

              </div>

            </section>


            {/* Bottom actions */}

            <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">

              <button
                type="button"
                onClick={downloadPPT}
                className="px-6 py-3 rounded-xl bg-[#172033] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#25314a]"
              >
                <Download className="w-4 h-4 text-yellow-300" />
                Download PowerPoint
              </button>

              <button
                type="button"
                onClick={reset}
                className="px-6 py-3 rounded-xl border border-slate-200 bg-white font-semibold flex items-center justify-center gap-2 hover:bg-slate-50"
              >
                <RefreshCw className="w-4 h-4" />
                Create Another
              </button>

            </div>

          </motion.div>

        )}

      </main>


      {/* Full Preview Modal */}

      <AnimatePresence>

        {showPreview && result && (

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-[90] bg-[#172033]/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
          >

            <div className="w-full max-w-6xl">

              <div className="flex items-center justify-between mb-4 text-white">

                <div>

                  <h3 className="font-bold text-lg">
                    Presentation Preview
                  </h3>

                  <p className="text-white/50 text-sm">
                    Use ← and → to navigate
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowPreview(false)
                  }
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/15 flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>

              </div>


              <motion.div
                key={activeSlide}
                initial={{
                  opacity: 0,
                  scale: 0.96,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                className={`aspect-video rounded-2xl overflow-hidden shadow-2xl ${
                  activeSlide === 0
                    ? "bg-[#172033]"
                    : "bg-[#fffdf5]"
                }`}
              >

                {activeSlide === 0 ? (

                  <div className="h-full flex flex-col justify-center px-[8%]">

                    <div className="inline-flex self-start px-4 py-2 rounded-full bg-yellow-300 text-[#172033] text-xs font-bold">
                      STATWISE AI
                    </div>

                    <h4 className="text-white text-4xl sm:text-6xl font-black mt-6">
                      {currentSlide.title}
                    </h4>

                    <p className="text-yellow-300 text-xl mt-5">
                      {currentSlide.subtitle}
                    </p>

                  </div>

                ) : (

                  <div className="h-full p-8 sm:p-12">

                    <div className="text-xs uppercase tracking-widest text-yellow-600 font-bold">
                      {formatSlideType(
                        currentSlide.type
                      )}
                    </div>

                    <h4 className="text-3xl sm:text-4xl font-black mt-3">
                      {currentSlide.title}
                    </h4>

                    {currentSlide.subtitle && (
                      <p className="text-slate-500 mt-2">
                        {currentSlide.subtitle}
                      </p>
                    )}

                    <div className="mt-8 grid md:grid-cols-2 gap-4 max-h-[60%] overflow-auto">

                      {currentSlide.points
                        ?.map(
                          (
                            point,
                            index
                          ) => (
                            <div
                              key={index}
                              className="bg-white border border-slate-200 rounded-2xl p-5"
                            >

                              <div className="flex gap-3">

                                <div className="w-8 h-8 rounded-xl bg-yellow-100 flex items-center justify-center shrink-0">
                                  <span className="font-bold text-yellow-700">
                                    {index + 1}
                                  </span>
                                </div>

                                <p className="text-sm leading-6">
                                  {point}
                                </p>

                              </div>

                            </div>
                          )
                        )}

                    </div>

                  </div>

                )}

              </motion.div>


              <div className="flex items-center justify-center gap-4 mt-5">

                <button
                  type="button"
                  onClick={previousSlide}
                  className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
                >
                  <ChevronLeft />
                </button>

                <span className="text-white font-semibold">
                  {activeSlide + 1} / {totalSlides}
                </span>

                <button
                  type="button"
                  onClick={nextSlide}
                  className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
                >
                  <ChevronRight />
                </button>

              </div>

            </div>

          </motion.div>

        )}

      </AnimatePresence>


      {/* Generation overlay */}

      <AnimatePresence>

        {generating && (
          <GenerationOverlay />
        )}

      </AnimatePresence>

    </div>
  );
}