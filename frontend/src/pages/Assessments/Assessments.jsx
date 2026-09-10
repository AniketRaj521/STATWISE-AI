import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrainCircuit,
  Target,
  Trophy,
  Clock3,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Search,
  Filter,
  Play,
  BarChart3,
  BookOpen,
  Zap,
  ShieldCheck,
  Lightbulb,
  X,
  ChevronDown,
  Flame,
  Rocket,
  Smile,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// --------------------------------------------------
// DEMO ASSESSMENT DATA
// --------------------------------------------------

const assessments = [
  {
    id: 1,
    title: "Statistical Foundations",
    shortTitle: "Statistics",
    description:
      "Test your understanding of descriptive statistics, distributions, sampling and statistical reasoning.",
    skill: "Statistics",
    difficulty: "Beginner",
    duration: "10 min",
    questions: 15,
    progress: 0,
    recommended: true,
    status: "Recommended",
    icon: "📊",
    color: "yellow",
    reason: "High priority skill",
  },

  {
    id: 2,
    title: "Probability & Uncertainty",
    shortTitle: "Probability",
    description:
      "Evaluate your ability to reason about probability, uncertainty, events and statistical outcomes.",
    skill: "Probability",
    difficulty: "Intermediate",
    duration: "12 min",
    questions: 15,
    progress: 0,
    recommended: true,
    status: "Recommended",
    icon: "🎲",
    color: "blue",
    reason: "Skill gap detected",
  },

  {
    id: 3,
    title: "Data Analysis Challenge",
    shortTitle: "Data Analysis",
    description:
      "Measure your practical knowledge of data cleaning, analysis, interpretation and decision-making.",
    skill: "Data Analysis",
    difficulty: "Intermediate",
    duration: "15 min",
    questions: 20,
    progress: 35,
    recommended: false,
    status: "In Progress",
    icon: "📈",
    color: "green",
    reason: "Continue where you stopped",
  },

  {
    id: 4,
    title: "Data Visualization",
    shortTitle: "Visualization",
    description:
      "Assess your ability to select charts, communicate insights and build meaningful visual narratives.",
    skill: "Data Visualization",
    difficulty: "Intermediate",
    duration: "10 min",
    questions: 15,
    progress: 100,
    recommended: false,
    status: "Completed",
    icon: "📉",
    color: "purple",
    reason: "Completed recently",
  },

  {
    id: 5,
    title: "Statistical Computing",
    shortTitle: "Computing",
    description:
      "Challenge your knowledge of statistical programming, computational techniques and automation.",
    skill: "Statistical Computing",
    difficulty: "Advanced",
    duration: "18 min",
    questions: 20,
    progress: 0,
    recommended: false,
    status: "Available",
    icon: "💻",
    color: "orange",
    reason: "Recommended for your role",
  },

  {
    id: 6,
    title: "AI & Data Intelligence",
    shortTitle: "AI + Data",
    description:
      "Explore your understanding of AI-assisted analytics, intelligent decision systems and modern data workflows.",
    skill: "AI & Data",
    difficulty: "Advanced",
    duration: "15 min",
    questions: 20,
    progress: 0,
    recommended: false,
    status: "Available",
    icon: "🤖",
    color: "dark",
    reason: "Future-ready skill",
  },
];

// --------------------------------------------------
// FILTERS
// --------------------------------------------------

const filters = [
  "All",
  "Recommended",
  "In Progress",
  "Completed",
];

// --------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------

function Assessments() {
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // ------------------------------------------------
  // FILTER DATA
  // ------------------------------------------------

  const filteredAssessments = useMemo(() => {
    return assessments.filter((assessment) => {
      const matchesSearch =
        assessment.title
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        assessment.skill
          .toLowerCase()
          .includes(search.toLowerCase());

      let matchesFilter = true;

      if (activeFilter === "Recommended") {
        matchesFilter = assessment.recommended;
      }

      if (activeFilter === "In Progress") {
        matchesFilter = assessment.status === "In Progress";
      }

      if (activeFilter === "Completed") {
        matchesFilter = assessment.status === "Completed";
      }

      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, search]);

  // ------------------------------------------------
  // START ASSESSMENT
  // ------------------------------------------------

  const startAssessment = (assessment) => {
    toast.success(
      `${assessment.shortTitle} assessment is ready! 🚀`
    );

    setTimeout(() => {
      navigate("/assessments/quiz");
    }, 400);
  };

  // ------------------------------------------------
  // RETURN
  // ------------------------------------------------

  return (
    <div className="min-h-screen bg-[#fffdf5] text-[#172033]">

      {/* ==================================================
          HERO SECTION
      ================================================== */}

      <section className="relative overflow-hidden bg-[#172033]">

        {/* Decorative circles */}

        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#F6D76A]/20 blur-2xl"
        />

        <motion.div
          animate={{
            x: [0, -25, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-32 left-10 h-80 w-80 rounded-full bg-white/5 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-20">

          <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">

            {/* LEFT */}

            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#F6D76A]/30 bg-[#F6D76A]/10 px-4 py-2 text-sm font-bold text-[#F6D76A]">

                <Sparkles className="h-4 w-4" />

                AI-Powered Assessments

              </div>

              <h1 className="max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">

                Measure Skills.
                <br />

                <span className="text-[#F6D76A]">
                  Discover Potential.
                </span>

              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">

                STATWISE AI evaluates your competency, identifies skill gaps
                and helps build a personalized learning journey.

              </p>

              <div className="mt-8 flex flex-wrap gap-4">

                <button
                  onClick={() => navigate("/assessments/quiz")}
                  className="group flex items-center gap-3 rounded-xl bg-[#F6D76A] px-6 py-3.5 font-black text-[#172033] shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
                >

                  <Play className="h-5 w-5 fill-current" />

                  Take AI Assessment

                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />

                </button>

                <button
                  onClick={() => {
                    document
                      .getElementById("assessment-library")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 font-bold text-white transition hover:bg-white/10"
                >
                  Explore Assessments
                </button>

              </div>

            </motion.div>

            {/* RIGHT SCORE CARD */}

            <motion.div
              initial={{ opacity: 0, scale: 0.85, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{
                duration: 0.8,
                type: "spring",
              }}
              className="relative mx-auto w-full max-w-md"
            >

              <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm font-bold text-white/50">
                      Your Competency Score
                    </p>

                    <h2 className="mt-1 text-3xl font-black text-white">
                      Ready to measure?
                    </h2>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F6D76A]">
                    <BrainCircuit className="h-6 w-6 text-[#172033]" />
                  </div>

                </div>

                {/* SCORE */}

                <div className="mt-8 flex justify-center">

                  <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-[16px] border-white/10">

                    <motion.div
                      initial={{ rotate: -90 }}
                      animate={{ rotate: 270 }}
                      transition={{
                        duration: 1.8,
                        ease: "easeOut",
                      }}
                      className="absolute inset-[-16px] rounded-full border-[16px] border-transparent border-t-[#F6D76A]"
                    />

                    <div className="text-center">

                      <div className="text-5xl font-black text-white">
                        --
                      </div>

                      <div className="mt-1 text-xs font-bold text-white/40">
                        Take assessment
                      </div>

                    </div>

                  </div>

                </div>

                <div className="mt-7 grid grid-cols-3 gap-3">

                  <MiniStat
                    icon={<Target />}
                    value="6"
                    label="Assessments"
                  />

                  <MiniStat
                    icon={<Clock3 />}
                    value="~15"
                    label="Minutes"
                  />

                  <MiniStat
                    icon={<Trophy />}
                    value="AI"
                    label="Analysis"
                  />

                </div>

              </div>

              {/* FLOATING CARD */}

              <motion.div
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
                className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-black/10 bg-white p-4 shadow-xl sm:block"
              >

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F6D76A]">
                    <Sparkles className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-gray-400">
                      AI Insight
                    </p>

                    <p className="text-sm font-black text-[#172033]">
                      Let's find your strengths!
                    </p>
                  </div>

                </div>

              </motion.div>

            </motion.div>

          </div>

        </div>
      </section>

      {/* ==================================================
          QUICK STATS
      ================================================== */}

      <section className="border-b border-black/5 bg-white">

        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-black/5 md:grid-cols-4">

          <QuickStat
            icon={<BrainCircuit />}
            value="AI"
            label="Powered Evaluation"
          />

          <QuickStat
            icon={<Target />}
            value="Skill"
            label="Gap Detection"
          />

          <QuickStat
            icon={<BookOpen />}
            value="Smart"
            label="Learning Paths"
          />

          <QuickStat
            icon={<Zap />}
            value="Real-time"
            label="Feedback"
          />

        </div>

      </section>

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <main
        id="assessment-library"
        className="mx-auto max-w-7xl px-6 py-14 lg:px-8"
      >

        {/* SECTION HEADER */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
        >

          <div>

            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-400">

              <span className="h-2 w-2 rounded-full bg-[#F6D76A]" />

              Assessment Library

            </div>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Choose your challenge
            </h2>

            <p className="mt-3 max-w-2xl leading-7 text-gray-500">
              Assess your knowledge, understand your strengths and discover
              where your next learning opportunity lies.
            </p>

          </div>

          {/* FUNNY MICRO COPY */}

          <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-5 py-4 shadow-sm">

            <div className="text-2xl">
              🧠
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                Friendly reminder
              </p>

              <p className="text-sm font-black text-[#172033]">
                No panic. Even AI gets confused sometimes. 🤖
              </p>
            </div>

          </div>

        </motion.div>

        {/* SEARCH + FILTER */}

        <div className="mt-10 flex flex-col gap-4 lg:flex-row">

          {/* SEARCH */}

          <div className="relative flex-1">

            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              placeholder="Search assessments or skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-white py-4 pl-12 pr-5 outline-none transition focus:border-[#F6D76A] focus:ring-4 focus:ring-[#F6D76A]/20"
            />

          </div>

          {/* MOBILE FILTER BUTTON */}

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-5 py-4 font-bold lg:hidden"
          >

            <Filter className="h-5 w-5" />

            Filters

            <ChevronDown
              className={`h-4 w-4 transition ${
                showFilters ? "rotate-180" : ""
              }`}
            />

          </button>

          {/* DESKTOP FILTERS */}

          <div
            className={`${
              showFilters ? "flex" : "hidden"
            } flex-wrap gap-2 lg:flex`}
          >

            {filters.map((filter) => (

              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`rounded-xl px-5 py-3 font-bold transition ${
                  activeFilter === filter
                    ? "bg-[#172033] text-white shadow-lg"
                    : "border border-black/10 bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                {filter}
              </button>

            ))}

          </div>

        </div>

        {/* ==================================================
            RECOMMENDED BANNER
        ================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 overflow-hidden rounded-3xl bg-[#F6D76A] p-7"
        >

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div className="flex items-start gap-4">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#172033] text-[#F6D76A]">

                <Sparkles className="h-7 w-7" />

              </div>

              <div>

                <p className="text-xs font-black uppercase tracking-widest text-[#172033]/50">
                  STATWISE AI Recommendation
                </p>

                <h3 className="mt-1 text-xl font-black text-[#172033]">
                  Start with Probability & Statistics
                </h3>

                <p className="mt-1 max-w-xl text-sm leading-6 text-[#172033]/65">
                  These assessments provide the strongest starting point for
                  building your competency profile.
                </p>

              </div>

            </div>

            <button
              onClick={() => navigate("/assessments/quiz")}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#172033] px-5 py-3 font-black text-white transition hover:scale-105"
            >

              Start Recommended

              <ArrowRight className="h-4 w-4" />

            </button>

          </div>

        </motion.div>

        {/* ==================================================
            ASSESSMENT CARDS
        ================================================== */}

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          <AnimatePresence mode="popLayout">

            {filteredAssessments.map((assessment, index) => (

              <AssessmentCard
                key={assessment.id}
                assessment={assessment}
                index={index}
                onStart={() => startAssessment(assessment)}
                onDetails={() => setSelectedAssessment(assessment)}
              />

            ))}

          </AnimatePresence>

        </div>

        {/* EMPTY */}

        {filteredAssessments.length === 0 && (

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-10 rounded-3xl border border-dashed border-black/10 bg-white p-16 text-center"
          >

            <div className="text-5xl">
              🔎
            </div>

            <h3 className="mt-5 text-2xl font-black">
              No assessments found
            </h3>

            <p className="mt-2 text-gray-500">
              Try another search or choose a different filter.
            </p>

            <button
              onClick={() => {
                setSearch("");
                setActiveFilter("All");
              }}
              className="mt-6 rounded-xl bg-[#F6D76A] px-5 py-3 font-black"
            >
              Reset Filters
            </button>

          </motion.div>

        )}

        {/* ==================================================
            HOW IT WORKS
        ================================================== */}

        <section className="mt-20">

          <div className="text-center">

            <div className="inline-flex items-center gap-2 rounded-full bg-[#172033] px-4 py-2 text-xs font-black uppercase tracking-widest text-white">
              <BrainCircuit className="h-4 w-4 text-[#F6D76A]" />
              Intelligent Assessment
            </div>

            <h2 className="mt-5 text-3xl font-black sm:text-4xl">
              Your assessment becomes your roadmap
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-gray-500">
              STATWISE AI transforms assessment results into actionable
              learning recommendations.
            </p>

          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-4">

            <ProcessCard
              number="01"
              icon={<BrainCircuit />}
              title="Assess"
              text="Answer skill-focused questions."
            />

            <ProcessCard
              number="02"
              icon={<BarChart3 />}
              title="Analyze"
              text="AI evaluates your competency."
            />

            <ProcessCard
              number="03"
              icon={<Target />}
              title="Identify"
              text="Skill gaps are highlighted."
            />

            <ProcessCard
              number="04"
              icon={<Rocket />}
              title="Improve"
              text="Get your personalized path."
            />

          </div>

        </section>

        {/* ==================================================
            FUN AI MOTIVATION
        ================================================== */}

        <motion.section
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-20 overflow-hidden rounded-[2rem] bg-[#172033] p-8 text-white md:p-12"
        >

          <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">

            <div>

              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F6D76A] text-[#172033]">

                  <Smile className="h-6 w-6" />

                </div>

                <span className="font-black text-[#F6D76A]">
                  STATWISE AI says:
                </span>

              </div>

              <h2 className="mt-5 max-w-3xl text-3xl font-black leading-tight md:text-4xl">

                "Don't worry about getting every question right."

              </h2>

              <p className="mt-4 max-w-2xl leading-7 text-white/60">

                The goal isn't to prove that you already know everything.
                The goal is to discover what you should learn next.

              </p>

            </div>

            <div className="text-center">

              <motion.div
                animate={{
                  rotate: [-5, 5, -5],
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
                className="text-7xl"
              >
                🤖
              </motion.div>

              <p className="mt-2 text-sm font-bold text-white/40">
                Your friendly AI examiner
              </p>

            </div>

          </div>

        </motion.section>

        {/* ==================================================
            FINAL CTA
        ================================================== */}

        <section className="py-20 text-center">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F6D76A]">

              <Trophy className="h-8 w-8 text-[#172033]" />

            </div>

            <h2 className="mt-6 text-3xl font-black sm:text-4xl">
              Ready to discover your skill profile?
            </h2>

            <p className="mx-auto mt-3 max-w-xl leading-7 text-gray-500">
              Take your first assessment and let STATWISE AI turn your
              performance into a personalized learning journey.
            </p>

            <button
              onClick={() => navigate("/assessments/quiz")}
              className="mt-7 inline-flex items-center gap-3 rounded-xl bg-[#172033] px-7 py-4 font-black text-white shadow-xl transition hover:-translate-y-1"
            >

              Start Assessment

              <ArrowRight className="h-5 w-5" />

            </button>

          </motion.div>

        </section>

        {/* PROTOTYPE NOTE */}

        <div className="rounded-2xl border border-black/5 bg-white p-5 text-center text-xs leading-6 text-gray-400">

          <ShieldCheck className="mx-auto mb-2 h-5 w-5 text-gray-400" />

          Assessment content shown in this prototype uses the STATWISE AI
          development question bank. Production deployment can connect
          authorized organizational competency data and assessment services.

        </div>

      </main>

      {/* ==================================================
          DETAILS MODAL
      ================================================== */}

      <AnimatePresence>

        {selectedAssessment && (

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#172033]/70 px-5 backdrop-blur-sm"
            onClick={() => setSelectedAssessment(null)}
          >

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{
                type: "spring",
                damping: 22,
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-[2rem] bg-white p-7 shadow-2xl"
            >

              <div className="flex items-start justify-between">

                <div className="flex items-center gap-4">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F6D76A] text-3xl">
                    {selectedAssessment.icon}
                  </div>

                  <div>

                    <h2 className="text-2xl font-black">
                      {selectedAssessment.title}
                    </h2>

                    <p className="text-sm text-gray-500">
                      {selectedAssessment.skill}
                    </p>

                  </div>

                </div>

                <button
                  onClick={() => setSelectedAssessment(null)}
                  className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>

              </div>

              <p className="mt-6 leading-7 text-gray-500">
                {selectedAssessment.description}
              </p>

              <div className="mt-6 grid grid-cols-3 gap-3">

                <InfoBox
                  icon={<Clock3 />}
                  label="Duration"
                  value={selectedAssessment.duration}
                />

                <InfoBox
                  icon={<BrainCircuit />}
                  label="Questions"
                  value={selectedAssessment.questions}
                />

                <InfoBox
                  icon={<BarChart3 />}
                  label="Level"
                  value={selectedAssessment.difficulty}
                />

              </div>

              <div className="mt-6 rounded-2xl bg-[#fffdf5] p-4">

                <div className="flex items-center gap-3">

                  <Lightbulb className="h-5 w-5 text-[#d5a900]" />

                  <div>

                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                      AI Recommendation
                    </p>

                    <p className="mt-1 text-sm font-black">
                      {selectedAssessment.reason}
                    </p>

                  </div>

                </div>

              </div>

              <button
                onClick={() => startAssessment(selectedAssessment)}
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-[#172033] px-5 py-4 font-black text-white transition hover:bg-black"
              >

                <Play className="h-5 w-5 fill-current" />

                Begin Assessment

              </button>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>

    </div>
  );
}

// ======================================================
// ASSESSMENT CARD
// ======================================================

function AssessmentCard({
  assessment,
  index,
  onStart,
  onDetails,
}) {
  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        y: 30,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        scale: 0.95,
      }}
      transition={{
        delay: index * 0.06,
      }}
      whileHover={{
        y: -8,
      }}
      className="group relative overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm transition hover:shadow-2xl"
    >

      {/* TOP */}

      <div className="p-6">

        <div className="flex items-start justify-between">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff8d9] text-3xl transition group-hover:scale-110">
            {assessment.icon}
          </div>

          {assessment.recommended && (

            <span className="flex items-center gap-1 rounded-full bg-[#F6D76A] px-3 py-1.5 text-xs font-black text-[#172033]">

              <Sparkles className="h-3 w-3" />

              AI Pick

            </span>

          )}

        </div>

        <div className="mt-6">

          <div className="flex items-center gap-2">

            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-gray-500">
              {assessment.difficulty}
            </span>

            {assessment.status === "Completed" && (

              <span className="flex items-center gap-1 text-xs font-bold text-green-600">

                <CheckCircle2 className="h-3.5 w-3.5" />

                Completed

              </span>

            )}

          </div>

          <h3 className="mt-3 text-xl font-black text-[#172033]">
            {assessment.title}
          </h3>

          <p className="mt-2 min-h-[72px] text-sm leading-6 text-gray-500">
            {assessment.description}
          </p>

        </div>

        {/* META */}

        <div className="mt-6 flex items-center gap-4 text-xs font-bold text-gray-400">

          <span className="flex items-center gap-1.5">

            <Clock3 className="h-4 w-4" />

            {assessment.duration}

          </span>

          <span className="flex items-center gap-1.5">

            <BrainCircuit className="h-4 w-4" />

            {assessment.questions} questions

          </span>

        </div>

        {/* PROGRESS */}

        {assessment.progress > 0 && (

          <div className="mt-6">

            <div className="mb-2 flex justify-between text-xs font-bold">

              <span className="text-gray-400">
                Progress
              </span>

              <span>
                {assessment.progress}%
              </span>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-gray-100">

              <motion.div
                initial={{ width: 0 }}
                whileInView={{
                  width: `${assessment.progress}%`,
                }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="h-full rounded-full bg-[#F6D76A]"
              />

            </div>

          </div>

        )}

      </div>

      {/* FOOTER */}

      <div className="flex items-center gap-2 border-t border-black/5 bg-[#fffdf5] p-4">

        <button
          onClick={onDetails}
          className="flex-1 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-black text-[#172033] transition hover:bg-gray-50"
        >
          View Details
        </button>

        <button
          onClick={onStart}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#172033] px-4 py-3 text-sm font-black text-white transition hover:bg-black"
        >

          <Play className="h-4 w-4 fill-current" />

          {assessment.status === "In Progress"
            ? "Continue"
            : assessment.status === "Completed"
            ? "Retake"
            : "Start"}

        </button>

      </div>

    </motion.div>
  );
}

// ======================================================
// QUICK STAT
// ======================================================

function QuickStat({ icon, value, label }) {
  return (
    <div className="flex items-center gap-4 px-6 py-6">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff8d9]">
        {icon}
      </div>

      <div>

        <div className="text-lg font-black">
          {value}
        </div>

        <div className="text-xs font-bold text-gray-400">
          {label}
        </div>

      </div>

    </div>
  );
}

// ======================================================
// MINI STAT
// ======================================================

function MiniStat({ icon, value, label }) {
  return (
    <div className="rounded-2xl bg-white/5 p-3 text-center">

      <div className="mx-auto flex h-8 w-8 items-center justify-center text-[#F6D76A]">
        {icon}
      </div>

      <div className="mt-1 text-sm font-black text-white">
        {value}
      </div>

      <div className="text-[10px] font-bold text-white/30">
        {label}
      </div>

    </div>
  );
}

// ======================================================
// PROCESS CARD
// ======================================================

function ProcessCard({ number, icon, title, text }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="relative rounded-3xl border border-black/10 bg-white p-6 shadow-sm"
    >

      <div className="flex items-center justify-between">

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F6D76A]">
          {icon}
        </div>

        <span className="text-4xl font-black text-gray-100">
          {number}
        </span>

      </div>

      <h3 className="mt-6 text-lg font-black">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        {text}
      </p>

    </motion.div>
  );
}

// ======================================================
// INFO BOX
// ======================================================

function InfoBox({ icon, label, value }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">

      <div className="flex h-8 w-8 items-center justify-center text-gray-500">
        {icon}
      </div>

      <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-[#172033]">
        {value}
      </p>

    </div>
  );
}

export default Assessments;