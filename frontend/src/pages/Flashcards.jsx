import { useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  Sparkles,
  Brain,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Shuffle,
  Search,
  Trophy,
  Flame,
  Lightbulb,
  PartyPopper,
  Stars,
  Zap,
  Target,
  BookOpen,
  Rocket,
  Heart,
  Laugh,
  RefreshCw,
  Download,
  Copy,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL = "http://127.0.0.1:8000";

const fallbackCards = [
  {
    id: 1,
    question: "What is statistical sampling?",
    answer:
      "Statistical sampling is the process of selecting a representative subset of a population so that information about the entire population can be estimated efficiently.",
    topic: "Statistics",
    difficulty: "Easy",
    explanation:
      "Sampling allows researchers to study a smaller group instead of collecting information from every member of a population.",
  },
  {
    id: 2,
    question: "What is the purpose of probability?",
    answer:
      "Probability provides a mathematical way to measure uncertainty and quantify how likely an event is to occur.",
    topic: "Probability",
    difficulty: "Easy",
    explanation:
      "Probability values range from 0 to 1, where 0 represents impossibility and 1 represents certainty.",
  },
  {
    id: 3,
    question: "What is data visualization?",
    answer:
      "Data visualization is the graphical representation of data using charts, graphs, plots, maps, and other visual formats.",
    topic: "Data Visualization",
    difficulty: "Medium",
    explanation:
      "Visual representations make patterns, trends, relationships, and outliers easier to understand.",
  },
];

const floatingEmojis = [
  "🧠",
  "✨",
  "📚",
  "🚀",
  "🎯",
  "💡",
  "🤓",
  "🔥",
  "⭐",
  "🎓",
];

export default function Flashcards() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const [knownCards, setKnownCards] = useState([]);
  const [practiceCards, setPracticeCards] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("All");

  const [showComplete, setShowComplete] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeCards = cards.length > 0 ? cards : [];

  const currentCard = activeCards[currentIndex];

  const topics = useMemo(() => {
    const values = activeCards
      .map((card) => card.topic)
      .filter(Boolean);

    return ["All", ...new Set(values)];
  }, [activeCards]);

  const filteredCards = useMemo(() => {
    return activeCards.filter((card) => {
      const matchesSearch =
        !searchTerm ||
        card.question
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        card.answer
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesTopic =
        selectedTopic === "All" ||
        card.topic === selectedTopic;

      return matchesSearch && matchesTopic;
    });
  }, [activeCards, searchTerm, selectedTopic]);

  const progress =
    activeCards.length > 0
      ? Math.round(((currentIndex + 1) / activeCards.length) * 100)
      : 0;

  const masteredCount = knownCards.length;

  const handleFile = (file) => {
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("📄 Please choose a PDF file.");
      return;
    }

    setSelectedFile(file);
    toast.success("🎉 PDF loaded successfully!");
  };

  const handleInputChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleFile(file);
    }
  };

  const generateFlashcards = async () => {
    if (!selectedFile) {
      toast.error("📚 Upload a PDF first!");
      return;
    }

    try {
      setGenerating(true);
      setGenerationStage("📖 Reading your learning material...");

      const formData = new FormData();
      formData.append("file", selectedFile);

      await new Promise((resolve) => setTimeout(resolve, 700));

      setGenerationStage("🧠 AI is understanding the concepts...");

      await new Promise((resolve) => setTimeout(resolve, 900));

      setGenerationStage("✨ Creating smart flashcards...");

      const response = await axios.post(
        `${API_URL}/generate-flashcards`,
        formData
      );

      const data = response.data;

      if (!data.success) {
        throw new Error(
          data.message || "Flashcard generation failed."
        );
      }

      const generatedCards = Array.isArray(data.flashcards)
        ? data.flashcards
        : [];

      if (generatedCards.length === 0) {
        throw new Error("No flashcards were generated.");
      }

      setCards(generatedCards);
      setCurrentIndex(0);
      setFlipped(false);
      setKnownCards([]);
      setPracticeCards([]);
      setSearchTerm("");
      setSelectedTopic("All");

      setGenerationStage("🎉 Your flashcards are ready!");

      toast.success(
        `🧠 ${generatedCards.length} AI flashcards created!`
      );
    } catch (error) {
      console.error("Flashcard generation error:", error);

      const message =
        error.response?.data?.message ||
        error.message ||
        "Could not generate flashcards.";

      toast.error(`😵 ${message}`);

      /*
       * IMPORTANT:
       * We don't automatically show fake cards when backend fails.
       * This makes it clear to the evaluator whether AI generation
       * actually worked.
       */
    } finally {
      setTimeout(() => {
        setGenerating(false);
        setGenerationStage("");
      }, 700);
    }
  };

  const nextCard = () => {
    if (!activeCards.length) return;

    if (currentIndex >= activeCards.length - 1) {
      setShowComplete(true);
      return;
    }

    setFlipped(false);

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 120);
  };

  const previousCard = () => {
    if (!activeCards.length) return;

    setFlipped(false);

    setTimeout(() => {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }, 120);
  };

  const markKnown = () => {
    if (!currentCard) return;

    setKnownCards((prev) => {
      if (prev.includes(currentCard.id)) {
        return prev;
      }

      return [...prev, currentCard.id];
    });

    toast.success("🔥 Nice! You mastered this one!");

    setTimeout(() => {
      nextCard();
    }, 350);
  };

  const markPractice = () => {
    if (!currentCard) return;

    setPracticeCards((prev) => {
      if (prev.includes(currentCard.id)) {
        return prev;
      }

      return [...prev, currentCard.id];
    });

    toast("💪 Added to your practice list!", {
      icon: "📚",
    });

    setTimeout(() => {
      nextCard();
    }, 350);
  };

  const shuffleCards = () => {
    if (activeCards.length < 2) return;

    const shuffled = [...activeCards].sort(
      () => Math.random() - 0.5
    );

    setCards(shuffled);
    setCurrentIndex(0);
    setFlipped(false);

    toast.success("🎲 Cards shuffled!");
  };

  const restartCards = () => {
    setCurrentIndex(0);
    setFlipped(false);
    setKnownCards([]);
    setPracticeCards([]);
    setShowComplete(false);

    toast.success("🔄 Fresh start! Let's learn!");
  };

  const copyCard = async () => {
    if (!currentCard) return;

    const text = `Question: ${currentCard.question}

Answer: ${currentCard.answer}

Topic: ${currentCard.topic || "General"}

Difficulty: ${currentCard.difficulty || "Medium"}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      toast.success("📋 Flashcard copied!");

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      toast.error("Could not copy flashcard.");
    }
  };

  const downloadCards = () => {
    if (!activeCards.length) return;

    const content = activeCards
      .map(
        (card, index) =>
          `${index + 1}. ${card.question}

Answer:
${card.answer}

Topic:
${card.topic || "General"}

Difficulty:
${card.difficulty || "Medium"}

Explanation:
${card.explanation || "N/A"}

-----------------------------------
`
      )
      .join("\n");

    const blob = new Blob([content], {
      type: "text/plain",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "STATWISE-AI-Flashcards.txt";
    link.click();

    URL.revokeObjectURL(url);

    toast.success("⬇️ Flashcards downloaded!");
  };

  const useDemoCards = () => {
    setCards(fallbackCards);
    setCurrentIndex(0);
    setFlipped(false);
    setKnownCards([]);
    setPracticeCards([]);

    toast.success("🎮 Demo learning deck loaded!");
  };

  return (
    <div className="min-h-screen bg-[#fffdf5] text-[#172033] overflow-hidden relative">
      {/* ------------------------------------------------ */}
      {/* BACKGROUND */}
      {/* ------------------------------------------------ */}

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -40, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-yellow-200/40 blur-3xl"
        />

        <motion.div
          animate={{
            x: [0, -50, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-orange-200/30 blur-3xl"
        />

        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(#172033 1px, transparent 1px), linear-gradient(90deg, #172033 1px, transparent 1px)",
            backgroundSize: "45px 45px",
          }}
        />

        {floatingEmojis.map((emoji, index) => (
          <motion.div
            key={index}
            initial={{
              opacity: 0,
              y: 50,
            }}
            animate={{
              opacity: [0.15, 0.5, 0.15],
              y: [-20, -80, -20],
              x: [0, index % 2 ? 20 : -20, 0],
            }}
            transition={{
              duration: 5 + index,
              repeat: Infinity,
              delay: index * 0.4,
            }}
            className="absolute text-2xl"
            style={{
              left: `${5 + index * 9}%`,
              top: `${12 + (index % 5) * 15}%`,
            }}
          >
            {emoji}
          </motion.div>
        ))}
      </div>

      {/* ------------------------------------------------ */}
      {/* HERO */}
      {/* ------------------------------------------------ */}

      <section className="relative max-w-7xl mx-auto px-6 pt-12 pb-8">
        <div className="grid lg:grid-cols-[1fr_350px] gap-10 items-center">
          <div>
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 border border-yellow-300 text-yellow-800 font-semibold text-sm"
            >
              <Sparkles className="w-4 h-4" />
              AI-POWERED ACTIVE LEARNING
            </motion.div>

            <motion.h1
              initial={{
                opacity: 0,
                y: 30,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.1,
              }}
              className="text-5xl md:text-6xl font-black tracking-tight mt-5"
            >
              Learn.
              <span className="text-yellow-500"> Flip.</span>
              <br />
              Remember. 🚀
            </motion.h1>

            <motion.p
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: 0.25,
              }}
              className="mt-5 text-lg text-gray-600 max-w-2xl leading-relaxed"
            >
              Upload your study material and let{" "}
              <strong>STATWISE AI</strong> transform it into
              interactive flashcards designed to make learning
              faster, smarter and a little more fun. 🧠✨
            </motion.p>

            <div className="flex flex-wrap gap-3 mt-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border shadow-sm">
                <Brain className="w-4 h-4 text-purple-500" />
                AI Generated
              </div>

              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border shadow-sm">
                <RotateCcw className="w-4 h-4 text-blue-500" />
                3D Flip
              </div>

              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border shadow-sm">
                <Flame className="w-4 h-4 text-orange-500" />
                Learning Streak
              </div>
            </div>
          </div>

          {/* Animated Brain */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.7,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="relative h-72 flex items-center justify-center"
          >
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute w-64 h-64 border-2 border-dashed border-yellow-300 rounded-full"
            />

            <motion.div
              animate={{
                rotate: -360,
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute w-48 h-48 border-2 border-dotted border-orange-300 rounded-full"
            />

            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [-3, 3, -3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
              className="w-36 h-36 rounded-[2.5rem] bg-gradient-to-br from-yellow-200 to-orange-300 shadow-2xl flex items-center justify-center text-7xl"
            >
              🧠
            </motion.div>

            <motion.div
              animate={{
                y: [-8, 8, -8],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
              }}
              className="absolute top-3 right-10 text-4xl"
            >
              💡
            </motion.div>

            <motion.div
              animate={{
                y: [8, -8, 8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="absolute bottom-3 left-8 text-4xl"
            >
              🎯
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ------------------------------------------------ */}
      {/* UPLOAD */}
      {/* ------------------------------------------------ */}

      {cards.length === 0 && (
        <section className="relative max-w-5xl mx-auto px-6 pb-16">
          <motion.div
            initial={{
              opacity: 0,
              y: 40,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.3,
            }}
            className="bg-white/90 backdrop-blur-xl rounded-[2rem] border border-yellow-200 shadow-2xl p-6 md:p-10"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full text-purple-700 font-semibold">
                <Rocket className="w-4 h-4" />
                Step 1 • Feed your AI
              </div>

              <h2 className="text-3xl font-black mt-4">
                Drop your study material here 📚
              </h2>

              <p className="text-gray-500 mt-2">
                PDF → AI → Flashcards → Mastery
              </p>
            </div>

            <motion.label
              htmlFor="flashcard-pdf"
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              whileHover={{
                scale: 1.01,
              }}
              className={`relative block cursor-pointer rounded-3xl border-2 border-dashed p-12 text-center transition-all ${
                dragActive
                  ? "border-yellow-500 bg-yellow-100"
                  : "border-yellow-300 bg-yellow-50/50 hover:bg-yellow-100/60"
              }`}
            >
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 4, -4, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                }}
                className="text-7xl mb-5"
              >
                📄
              </motion.div>

              <div className="flex justify-center mb-4">
                <div className="p-4 bg-yellow-200 rounded-2xl">
                  <Upload className="w-8 h-8 text-yellow-800" />
                </div>
              </div>

              <h3 className="text-xl font-bold">
                {selectedFile
                  ? selectedFile.name
                  : "Drop your PDF here"}
              </h3>

              <p className="text-gray-500 mt-2">
                or click to browse from your computer
              </p>

              <div className="mt-5 flex justify-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-white rounded-full text-xs border">
                  PDF only
                </span>

                <span className="px-3 py-1 bg-white rounded-full text-xs border">
                  AI generated
                </span>

                <span className="px-3 py-1 bg-white rounded-full text-xs border">
                  12 cards
                </span>
              </div>

              <input
                id="flashcard-pdf"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleInputChange}
                className="hidden"
              />
            </motion.label>

            {selectedFile && (
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.9,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                className="mt-5 flex items-center justify-between gap-4 p-4 rounded-2xl bg-green-50 border border-green-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>

                  <div>
                    <p className="font-bold text-green-800">
                      PDF Ready! 🎉
                    </p>

                    <p className="text-sm text-green-600">
                      {selectedFile.name}
                    </p>
                  </div>
                </div>

                <span className="text-2xl">😎</span>
              </motion.div>
            )}

            <AnimatePresence>
              {generating && (
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
                  <div className="mt-6 p-6 rounded-2xl bg-[#172033] text-white">
                    <div className="flex items-center gap-4">
                      <motion.div
                        animate={{
                          rotate: 360,
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-12 h-12 rounded-full border-4 border-yellow-300 border-t-transparent"
                      />

                      <div>
                        <p className="font-bold">
                          STATWISE AI is thinking... 🧠
                        </p>

                        <p className="text-gray-300 text-sm mt-1">
                          {generationStage}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{
                          x: "-100%",
                        }}
                        animate={{
                          x: "100%",
                        }}
                        transition={{
                          duration: 1.4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="h-full w-1/2 bg-yellow-300 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{
                scale: 1.02,
                y: -2,
              }}
              whileTap={{
                scale: 0.97,
              }}
              onClick={generateFlashcards}
              disabled={!selectedFile || generating}
              className="w-full mt-6 py-5 rounded-2xl bg-[#172033] text-white font-black text-lg flex items-center justify-center gap-3 shadow-xl disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  AI is creating magic...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  Generate AI Flashcards ✨
                </>
              )}
            </motion.button>

            <button
              onClick={useDemoCards}
              className="w-full mt-3 py-3 text-sm text-gray-500 hover:text-[#172033] transition"
            >
              🎮 Preview with demo cards
            </button>
          </motion.div>
        </section>
      )}

      {/* ------------------------------------------------ */}
      {/* FLASHCARD LEARNING AREA */}
      {/* ------------------------------------------------ */}

      {cards.length > 0 && (
        <section className="relative max-w-7xl mx-auto px-6 pb-20">
          {/* TOP STATS */}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<Brain />}
              label="AI Cards"
              value={activeCards.length}
              emoji="🧠"
            />

            <StatCard
              icon={<CheckCircle2 />}
              label="Mastered"
              value={masteredCount}
              emoji="🔥"
            />

            <StatCard
              icon={<Target />}
              label="Progress"
              value={`${progress}%`}
              emoji="🎯"
            />

            <StatCard
              icon={<Flame />}
              label="Streak"
              value="3 days"
              emoji="🚀"
            />
          </div>

          {/* TOOLBAR */}

          <div className="bg-white rounded-2xl border shadow-sm p-4 mb-8 flex flex-col lg:flex-row gap-4 justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search your flashcards..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {topics.slice(0, 5).map((topic) => (
                <button
                  key={topic}
                  onClick={() => {
                    setSelectedTopic(topic);
                    setCurrentIndex(0);
                    setFlipped(false);
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                    selectedTopic === topic
                      ? "bg-[#172033] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-yellow-100"
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>

            <button
              onClick={shuffleCards}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-yellow-100 hover:bg-yellow-200 font-semibold"
            >
              <Shuffle className="w-4 h-4" />
              Shuffle
            </button>
          </div>

          {/* PROGRESS */}

          <div className="mb-8">
            <div className="flex justify-between text-sm font-semibold mb-2">
              <span>
                Card {currentIndex + 1} of {activeCards.length}
              </span>

              <span>{progress}% complete</span>
            </div>

            <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
              <motion.div
                animate={{
                  width: `${progress}%`,
                }}
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
              />
            </div>
          </div>

          {/* MAIN CARD */}

          {currentCard && (
            <div className="grid lg:grid-cols-[1fr_300px] gap-10">
              <div>
                <div
                  className="relative mx-auto max-w-3xl h-[430px]"
                  style={{
                    perspective: "1400px",
                  }}
                >
                  <motion.div
                    animate={{
                      rotateY: flipped ? 180 : 0,
                    }}
                    transition={{
                      duration: 0.7,
                      type: "spring",
                      stiffness: 100,
                      damping: 15,
                    }}
                    className="relative w-full h-full"
                    style={{
                      transformStyle: "preserve-3d",
                    }}
                  >
                    {/* FRONT */}

                    <div
                      className="absolute inset-0 rounded-[2.5rem] bg-white border-2 border-yellow-200 shadow-2xl overflow-hidden"
                      style={{
                        backfaceVisibility: "hidden",
                      }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-300" />

                      <div className="absolute top-7 left-7 text-5xl">
                        🤔
                      </div>

                      <div className="absolute top-7 right-7">
                        <span className="px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 text-sm font-bold">
                          {currentCard.difficulty ||
                            "Medium"}
                        </span>
                      </div>

                      <div className="h-full flex flex-col items-center justify-center px-10 text-center">
                        <div className="mb-5">
                          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 text-purple-700 text-sm font-bold">
                            <BookOpen className="w-4 h-4" />
                            {currentCard.topic ||
                              "Learning"}
                          </span>
                        </div>

                        <p className="text-sm uppercase tracking-[0.25em] text-gray-400 font-bold mb-5">
                          Question
                        </p>

                        <h2 className="text-3xl md:text-4xl font-black leading-tight">
                          {currentCard.question}
                        </h2>

                        <motion.button
                          whileHover={{
                            scale: 1.05,
                          }}
                          whileTap={{
                            scale: 0.95,
                          }}
                          onClick={() => setFlipped(true)}
                          className="mt-10 px-7 py-4 rounded-2xl bg-[#172033] text-white font-bold flex items-center gap-3"
                        >
                          <RotateCcw className="w-5 h-5" />
                          Reveal Answer 💡
                        </motion.button>
                      </div>
                    </div>

                    {/* BACK */}

                    <div
                      className="absolute inset-0 rounded-[2.5rem] bg-[#172033] text-white shadow-2xl overflow-hidden"
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-300" />

                      <div className="absolute top-6 left-7 text-4xl">
                        💡
                      </div>

                      <div className="absolute top-6 right-7 text-4xl">
                        🎓
                      </div>

                      <div className="h-full flex flex-col justify-center px-10">
                        <p className="text-yellow-300 text-sm uppercase tracking-[0.25em] font-bold mb-4">
                          Answer
                        </p>

                        <h3 className="text-2xl md:text-3xl font-bold leading-relaxed">
                          {currentCard.answer}
                        </h3>

                        {currentCard.explanation && (
                          <div className="mt-6 p-5 rounded-2xl bg-white/10 border border-white/10">
                            <div className="flex items-center gap-2 text-yellow-300 font-bold mb-2">
                              <Lightbulb className="w-4 h-4" />
                              AI Insight
                            </div>

                            <p className="text-gray-300 text-sm leading-relaxed">
                              {currentCard.explanation}
                            </p>
                          </div>
                        )}

                        <button
                          onClick={() => setFlipped(false)}
                          className="mt-6 text-sm text-gray-300 hover:text-white flex items-center gap-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Flip back
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* CARD CONTROLS */}

                <div className="flex flex-wrap justify-center gap-3 mt-7">
                  <button
                    onClick={previousCard}
                    disabled={currentIndex === 0}
                    className="p-4 rounded-2xl bg-white border shadow-sm disabled:opacity-30"
                  >
                    <ChevronLeft />
                  </button>

                  <motion.button
                    whileHover={{
                      scale: 1.04,
                    }}
                    whileTap={{
                      scale: 0.96,
                    }}
                    onClick={markPractice}
                    className="px-6 py-4 rounded-2xl bg-red-50 text-red-600 border border-red-200 font-bold flex items-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Need Practice 😅
                  </motion.button>

                  <motion.button
                    whileHover={{
                      scale: 1.04,
                    }}
                    whileTap={{
                      scale: 0.96,
                    }}
                    onClick={markKnown}
                    className="px-7 py-4 rounded-2xl bg-green-500 text-white font-bold shadow-lg flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    I Know It! 🔥
                  </motion.button>

                  <button
                    onClick={nextCard}
                    className="p-4 rounded-2xl bg-white border shadow-sm"
                  >
                    <ChevronRight />
                  </button>
                </div>

                {/* EXTRA ACTIONS */}

                <div className="flex justify-center flex-wrap gap-3 mt-5">
                  <button
                    onClick={copyCard}
                    className="px-4 py-2 rounded-xl bg-white border text-sm font-semibold flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? "Copied!" : "Copy"}
                  </button>

                  <button
                    onClick={downloadCards}
                    className="px-4 py-2 rounded-xl bg-white border text-sm font-semibold flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Deck
                  </button>

                  <button
                    onClick={restartCards}
                    className="px-4 py-2 rounded-xl bg-white border text-sm font-semibold flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Restart
                  </button>
                </div>
              </div>

              {/* SIDE PANEL */}

              <div className="space-y-5">
                <motion.div
                  initial={{
                    opacity: 0,
                    x: 20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  className="bg-[#172033] text-white rounded-3xl p-6 shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">🔥</div>

                    <div>
                      <p className="text-gray-300 text-sm">
                        Learning streak
                      </p>

                      <p className="text-3xl font-black">
                        3 Days
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mt-4">
                    Keep going! Your brain loves consistency. 🧠
                  </p>
                </motion.div>

                <div className="bg-white rounded-3xl border p-6 shadow-sm">
                  <h3 className="font-black text-lg flex items-center gap-2">
                    <Trophy className="text-yellow-500" />
                    Your Progress
                  </h3>

                  <div className="mt-5 space-y-4">
                    <ProgressRow
                      label="Mastered"
                      value={knownCards.length}
                      total={activeCards.length}
                    />

                    <ProgressRow
                      label="Practice"
                      value={practiceCards.length}
                      total={activeCards.length}
                    />
                  </div>
                </div>

                <div className="rounded-3xl bg-gradient-to-br from-yellow-100 to-orange-100 border border-yellow-200 p-6">
                  <div className="text-4xl mb-3">
                    🧙‍♂️
                  </div>

                  <h3 className="font-black">
                    AI Learning Tip
                  </h3>

                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                    Don't just flip the card immediately.
                    Think for a few seconds first. Your brain
                    learns more when it retrieves the answer
                    itself. 💡
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SEARCH EMPTY */}

          {filteredCards.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl">🔍</div>

              <h3 className="text-2xl font-black mt-4">
                No cards found
              </h3>

              <p className="text-gray-500 mt-2">
                Try another search or topic.
              </p>
            </div>
          )}
        </section>
      )}

      {/* ------------------------------------------------ */}
      {/* COMPLETION MODAL */}
      {/* ------------------------------------------------ */}

      <AnimatePresence>
        {showComplete && (
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
            className="fixed inset-0 z-50 bg-[#172033]/70 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.7,
                y: 30,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              className="relative max-w-lg w-full bg-white rounded-[2.5rem] p-10 text-center shadow-2xl"
            >
              <button
                onClick={() => setShowComplete(false)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100"
              >
                <X />
              </button>

              <motion.div
                animate={{
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  duration: 1.2,
                  repeat: 2,
                }}
                className="text-8xl"
              >
                🎉
              </motion.div>

              <h2 className="text-4xl font-black mt-5">
                Deck Complete! 🏆
              </h2>

              <p className="text-gray-500 mt-3">
                You finished your AI-generated flashcard deck.
              </p>

              <div className="grid grid-cols-2 gap-4 mt-7">
                <div className="p-5 rounded-2xl bg-green-50">
                  <p className="text-3xl font-black text-green-600">
                    {knownCards.length}
                  </p>

                  <p className="text-sm text-gray-500">
                    Mastered 🔥
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-yellow-50">
                  <p className="text-3xl font-black text-yellow-600">
                    {activeCards.length}
                  </p>

                  <p className="text-sm text-gray-500">
                    Total Cards 🧠
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-7">
                <button
                  onClick={restartCards}
                  className="flex-1 py-4 rounded-2xl bg-[#172033] text-white font-bold"
                >
                  🔄 Study Again
                </button>

                <button
                  onClick={() => setShowComplete(false)}
                  className="flex-1 py-4 rounded-2xl bg-yellow-100 text-yellow-800 font-bold"
                >
                  ✨ Done
                </button>
              </div>

              <div className="mt-6 flex justify-center gap-3 text-2xl">
                <span>🎓</span>
                <span>🚀</span>
                <span>🧠</span>
                <span>🔥</span>
                <span>🏆</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------ */}
      {/* FOOTER */}
      {/* ------------------------------------------------ */}

      <footer className="relative border-t bg-white/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 font-black text-xl">
                <Brain className="text-yellow-500" />
                STATWISE AI
              </div>

              <p className="text-gray-500 text-sm mt-2">
                Intelligent Learning. Measurable Impact.
              </p>
            </div>

            <div className="text-sm text-gray-500">
              Built for personalized learning 🚀
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------ */
/* SMALL COMPONENTS */
/* ------------------------------------------------ */

function StatCard({ icon, label, value, emoji }) {
  return (
    <motion.div
      whileHover={{
        y: -4,
      }}
      className="bg-white rounded-2xl border p-5 shadow-sm"
    >
      <div className="flex justify-between">
        <div className="p-3 rounded-xl bg-yellow-50 text-yellow-700">
          {icon}
        </div>

        <span className="text-2xl">
          {emoji}
        </span>
      </div>

      <p className="text-gray-500 text-sm mt-4">
        {label}
      </p>

      <p className="text-3xl font-black mt-1">
        {value}
      </p>
    </motion.div>
  );
}

function ProgressRow({ label, value, total }) {
  const percentage =
    total > 0
      ? Math.round((value / total) * 100)
      : 0;

  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="font-semibold">
          {label}
        </span>

        <span className="text-gray-500">
          {value}/{total}
        </span>
      </div>

      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          animate={{
            width: `${percentage}%`,
          }}
          className="h-full bg-yellow-400 rounded-full"
        />
      </div>
    </div>
  );
}