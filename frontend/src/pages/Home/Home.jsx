import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileQuestion,
  GraduationCap,
  LineChart,
  MessageCircle,
  Play,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
  Activity,
  Award,
  BookOpen,
  Bot,
  RefreshCw,
} from "lucide-react";

import governmentWorkforce from "../../assets/government-workforce.png";

// ============================================================
// ANIMATION SETTINGS
// ============================================================

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 25,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

// ============================================================
// HOME
// ============================================================

function Home() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [demoRunning, setDemoRunning] = useState(false);
  const [activeSkill, setActiveSkill] = useState("Data Analysis");

  const [competency, setCompetency] = useState(78);
  const [learningProgress, setLearningProgress] = useState(68);

  const [liveIndex, setLiveIndex] = useState(0);

  // ==========================================================
  // DUMMY SKILLS
  // ==========================================================

  const skills = {
    "Data Analysis": 72,
    Statistics: 86,
    Probability: 64,
    Visualization: 61,
  };

  // ==========================================================
  // ROTATING AI STATUS
  // ==========================================================

  const aiStatuses = [
    "Analyzing competency signals...",
    "Detecting priority skill gaps...",
    "Mapping learning recommendations...",
    "Updating personalized pathway...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveIndex((prev) => (prev + 1) % aiStatuses.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // ==========================================================
  // DEMO ANIMATION
  // ==========================================================

  useEffect(() => {
    if (!demoRunning) return;

    const interval = setInterval(() => {
      setCompetency((prev) => {
        if (prev >= 86) {
          return 86;
        }

        return prev + 1;
      });

      setLearningProgress((prev) => {
        if (prev >= 92) {
          return 92;
        }

        return prev + 2;
      });
    }, 180);

    return () => clearInterval(interval);
  }, [demoRunning]);

  // ==========================================================
  // STOP DEMO
  // ==========================================================

  useEffect(() => {
    if (!demoRunning) return;

    const timeout = setTimeout(() => {
      setDemoRunning(false);
    }, 1800);

    return () => clearTimeout(timeout);
  }, [demoRunning]);

  // ==========================================================
  // RUN DEMO
  // ==========================================================

  const runDemo = () => {
    setCompetency(78);
    setLearningProgress(68);
    setDemoRunning(true);
  };

  return (
    <main className="overflow-hidden bg-[#FFFDF5] text-[#172033]">

      {/* ========================================================
          HERO
      ======================================================== */}

      <section className="relative bg-[#FFFDF5]">

        {/* BACKGROUND BLOBS */}

        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-[-100px] top-10 h-72 w-72 rounded-full bg-[#FFF3B0] opacity-60 blur-3xl"
        />

        <motion.div
          animate={{
            x: [0, -25, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute right-[-100px] top-20 h-80 w-80 rounded-full bg-[#F4C430] opacity-10 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-12 sm:px-8 lg:px-10 lg:pb-28 lg:pt-20">

          <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">

            {/* ==================================================
                HERO LEFT
            ================================================== */}

            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="max-w-2xl"
            >

              {/* BADGE */}

              <motion.div
                variants={fadeUp}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E7DFAF] bg-white px-4 py-2 text-sm font-semibold shadow-sm"
              >

                <motion.span
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F4C430]"
                >
                  <Sparkles size={15} />
                </motion.span>

                AI-Powered Skill Intelligence Platform

                <ChevronRight
                  size={15}
                  className="text-gray-500"
                />

              </motion.div>

              {/* TITLE */}

              <motion.h1
                variants={fadeUp}
                className="text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[4.35rem]"
              >

                Empowering the

                <span className="block text-[#172033]">
                  Government Workforce
                </span>

                <span className="relative inline-block">

                  with

                  <span className="ml-3 text-[#D89B00]">
                    AI & Data
                  </span>

                  <motion.span
                    animate={{
                      width: ["0%", "100%"],
                    }}
                    transition={{
                      duration: 1.4,
                      repeat: Infinity,
                      repeatDelay: 2.5,
                    }}
                    className="absolute -bottom-2 left-0 h-2 rounded-full bg-[#F4C430]/40"
                  />

                </span>

              </motion.h1>

              {/* DESCRIPTION */}

              <motion.p
                variants={fadeUp}
                className="mt-7 max-w-xl text-base leading-7 text-slate-600 sm:text-lg"
              >
                STATWISE AI identifies skill gaps, predicts competency,
                recommends personalized learning paths, and helps employees
                continuously improve through intelligent AI assistance.
              </motion.p>

              {/* BUTTONS */}

              <motion.div
                variants={fadeUp}
                className="mt-8 flex flex-col gap-3 sm:flex-row"
              >

                <a
                  href="/signup"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#172033] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
                >
                  Start Learning

                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />

                </a>

                <button
                  onClick={() =>
                    document
                      .getElementById("ai-demo")
                      ?.scrollIntoView({
                        behavior: "smooth",
                      })
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DCD3A5] bg-white px-6 py-3.5 text-sm font-bold text-[#172033] transition hover:-translate-y-1 hover:bg-[#FFF8D9]"
                >

                  <Play size={16} />

                  Try AI Demo

                </button>

              </motion.div>

              {/* TRUST ITEMS */}

              <motion.div
                variants={fadeUp}
                className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500"
              >

                <div className="flex items-center gap-2">
                  <CheckCircle2
                    size={17}
                    className="text-[#16865B]"
                  />
                  Personalized learning
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2
                    size={17}
                    className="text-[#16865B]"
                  />
                  AI skill analysis
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2
                    size={17}
                    className="text-[#16865B]"
                  />
                  Continuous assessment
                </div>

              </motion.div>

            </motion.div>

            {/* ==================================================
                HERO RIGHT
            ================================================== */}

            <motion.div
              initial={{
                opacity: 0,
                x: 40,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.9,
                delay: 0.2,
              }}
              className="relative mx-auto w-full max-w-[620px]"
            >

              {/* DECORATION */}

              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute -right-6 -top-8 h-24 w-24 rounded-full border border-[#F4C430]/30"
              />

              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                }}
                className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-[#FFF3B0] blur-2xl"
              />

              {/* IMAGE */}

              <div className="relative overflow-hidden rounded-[2rem] border-[6px] border-white bg-[#F5E7A5] shadow-[0_30px_70px_rgba(23,32,51,0.18)]">

                <div className="relative h-[410px] sm:h-[500px]">

                  <img
                    src={governmentWorkforce}
                    alt="Government workforce using digital learning technology"
                    className="absolute inset-0 h-full w-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#172033]/55 via-transparent to-transparent" />

                  {/* AI BADGE */}

                  <motion.div
                    animate={{
                      y: [0, -7, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute left-5 top-5 flex items-center gap-3 rounded-2xl border border-white/50 bg-white/90 px-4 py-3 shadow-xl backdrop-blur"
                  >

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4C430]">

                      <Brain size={20} />

                    </div>

                    <div>

                      <p className="text-xs font-medium text-slate-500">
                        Intelligence Engine
                      </p>

                      <p className="text-sm font-extrabold">
                        AI Skill Analysis
                      </p>

                    </div>

                  </motion.div>

                  {/* COMPETENCY CARD */}

                  <motion.div
                    animate={{
                      y: [0, 6, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute bottom-5 left-5 w-[210px] rounded-2xl border border-white/60 bg-white/95 p-4 shadow-2xl backdrop-blur"
                  >

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="text-xs text-slate-500">
                          Competency Score
                        </p>

                        <motion.p
                          key={competency}
                          initial={{
                            scale: 1.15,
                          }}
                          animate={{
                            scale: 1,
                          }}
                          className="mt-1 text-3xl font-extrabold"
                        >
                          {competency}%
                        </motion.p>

                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E6F5ED]">

                        <TrendingUp
                          size={21}
                          className="text-[#16865B]"
                        />

                      </div>

                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">

                      <motion.div
                        animate={{
                          width: `${competency}%`,
                        }}
                        transition={{
                          duration: 0.5,
                        }}
                        className="h-full rounded-full bg-[#16865B]"
                      />

                    </div>

                    <p className="mt-2 text-xs font-semibold text-[#16865B]">
                      +6.4% improvement
                    </p>

                  </motion.div>

                  {/* SKILL GAP CARD */}

                  <motion.div
                    animate={{
                      y: [0, -5, 0],
                    }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                    }}
                    className="absolute bottom-5 right-5 hidden w-[205px] rounded-2xl border border-white/60 bg-white/95 p-4 shadow-2xl backdrop-blur sm:block"
                  >

                    <div className="mb-3 flex items-center gap-2">

                      <Target
                        size={17}
                        className="text-[#D89B00]"
                      />

                      <span className="text-xs font-bold">
                        Skill Gap
                      </span>

                    </div>

                    <SkillMini
                      name="Data Analysis"
                      value={72}
                    />

                    <SkillMini
                      name="Statistics"
                      value={86}
                    />

                    <SkillMini
                      name="Visualization"
                      value={61}
                    />

                  </motion.div>

                </div>

              </div>

              {/* FLOATING ICON */}

              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                }}
                className="absolute -right-4 top-1/2 hidden h-16 w-16 items-center justify-center rounded-2xl bg-[#172033] text-[#F4C430] shadow-2xl lg:flex"
              >
                <Zap size={27} />
              </motion.div>

            </motion.div>

          </div>
        </div>
      </section>

      {/* ========================================================
          STATS
      ======================================================== */}

      <section className="bg-[#172033]">

        <div className="mx-auto grid max-w-7xl grid-cols-2 px-5 py-12 sm:px-8 lg:grid-cols-4 lg:px-10">

          <Stat
            value="AI"
            label="Powered Skill Intelligence"
          />

          <Stat
            value="24/7"
            label="Learning Assistance"
          />

          <Stat
            value="100%"
            label="Personalized Learning"
          />

          <Stat
            value="∞"
            label="Continuous Growth"
          />

        </div>

      </section>

      {/* ========================================================
          INTERACTIVE AI DEMO
      ======================================================== */}

      <section
        id="ai-demo"
        className="bg-[#FFFDF5] py-20 lg:py-28"
      >

        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

          <SectionHeading
            eyebrow="LIVE AI DEMO"
            title="See how STATWISE AI thinks"
            description="This interactive prototype demonstrates how competency signals can be converted into learning recommendations."
          />

          <div className="mt-14 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">

            {/* LEFT */}

            <motion.div
              initial={{
                opacity: 0,
                x: -30,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
              }}
              className="rounded-[2rem] border border-[#E7DFAF] bg-white p-7 shadow-[0_25px_60px_rgba(23,32,51,0.08)]"
            >

              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF3B0]">

                  <Bot size={24} />

                </div>

                <div>

                  <p className="text-xs font-bold uppercase tracking-wider text-[#9A6900]">
                    AI Competency Engine
                  </p>

                  <h3 className="text-xl font-extrabold">
                    Employee Skill Profile
                  </h3>

                </div>

              </div>

              <div className="mt-8 space-y-4">

                {/* ROLE */}

                <div className="rounded-2xl bg-[#FFF8D9] p-4">

                  <div className="flex items-center justify-between">

                    <span className="text-sm font-bold">
                      Role
                    </span>

                    <span className="rounded-lg bg-white px-3 py-1 text-xs font-bold">
                      Statistical Officer
                    </span>

                  </div>

                </div>

                {/* COMPETENCY */}

                <div className="rounded-2xl border border-slate-100 p-4">

                  <div className="flex items-center justify-between">

                    <span className="text-sm font-bold">
                      Current Competency
                    </span>

                    <motion.span
                      key={competency}
                      initial={{
                        scale: 1.2,
                      }}
                      animate={{
                        scale: 1,
                      }}
                      className="text-xl font-extrabold text-[#16865B]"
                    >
                      {competency}%
                    </motion.span>

                  </div>

                </div>

                {/* PROGRESS */}

                <div className="rounded-2xl border border-slate-100 p-4">

                  <div className="flex items-center justify-between">

                    <span className="text-sm font-bold">
                      Learning Progress
                    </span>

                    <span className="text-sm font-extrabold">
                      {learningProgress}%
                    </span>

                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">

                    <motion.div
                      animate={{
                        width: `${learningProgress}%`,
                      }}
                      transition={{
                        duration: 0.4,
                      }}
                      className="h-full rounded-full bg-[#F4C430]"
                    />

                  </div>

                </div>

              </div>

              {/* BUTTON */}

              <button
                onClick={runDemo}
                disabled={demoRunning}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#172033] px-5 py-3.5 text-sm font-bold text-white transition hover:-translate-y-1 hover:bg-[#263653] disabled:cursor-wait disabled:opacity-70"
              >

                {demoRunning ? (
                  <>
                    <RefreshCw
                      size={17}
                      className="animate-spin"
                    />

                    AI is analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles size={17} />

                    Analyze Skills
                  </>
                )}

              </button>

              {/* LIVE STATUS */}

              <AnimatePresence mode="wait">

                <motion.div
                  key={liveIndex}
                  initial={{
                    opacity: 0,
                    y: 5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -5,
                  }}
                  className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500"
                >

                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#16865B]" />

                  {aiStatuses[liveIndex]}

                </motion.div>

              </AnimatePresence>

            </motion.div>

            {/* RIGHT */}

            <motion.div
              initial={{
                opacity: 0,
                x: 30,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
              }}
              className="rounded-[2rem] bg-[#172033] p-7 text-white shadow-2xl"
            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs uppercase tracking-wider text-slate-400">
                    AI Analysis
                  </p>

                  <h3 className="mt-1 text-2xl font-extrabold">
                    Competency Intelligence
                  </h3>

                </div>

                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F4C430] text-[#172033]"
                >
                  <Activity size={21} />
                </motion.div>

              </div>

              {/* SKILLS */}

              <div className="mt-8 grid gap-3 sm:grid-cols-2">

                {Object.entries(skills).map(
                  ([name, value]) => (

                    <button
                      key={name}
                      onClick={() =>
                        setActiveSkill(name)
                      }
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        activeSkill === name
                          ? "border-[#F4C430] bg-white/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >

                      <div className="flex items-center justify-between">

                        <span className="text-sm font-semibold">
                          {name}
                        </span>

                        <span className="text-sm font-extrabold text-[#F4C430]">
                          {value}%
                        </span>

                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">

                        <motion.div
                          initial={{
                            width: 0,
                          }}
                          whileInView={{
                            width: `${value}%`,
                          }}
                          viewport={{
                            once: true,
                          }}
                          transition={{
                            duration: 1,
                          }}
                          className="h-full rounded-full bg-[#F4C430]"
                        />

                      </div>

                    </button>

                  ),
                )}

              </div>

              {/* RECOMMENDATION */}

              <motion.div
                key={activeSkill}
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="mt-7 rounded-2xl bg-[#F4C430] p-5 text-[#172033]"
              >

                <div className="flex gap-3">

                  <Sparkles
                    size={21}
                    className="mt-0.5 shrink-0"
                  />

                  <div>

                    <p className="text-sm font-extrabold">
                      AI Recommendation
                    </p>

                    <p className="mt-1 text-sm leading-6">

                      {activeSkill === "Visualization"
                        ? "Prioritize data visualization training to strengthen dashboard and reporting skills."
                        : activeSkill === "Probability"
                        ? "Build stronger probability fundamentals through targeted practice and adaptive quizzes."
                        : activeSkill === "Statistics"
                        ? "Maintain your strong statistics competency and apply it to advanced statistical analysis."
                        : "Focus on practical data analysis projects and statistical computing exercises."}

                    </p>

                  </div>

                </div>

              </motion.div>

            </motion.div>

          </div>

        </div>

      </section>

      {/* ========================================================
          PLATFORM
      ======================================================== */}

      <section
        id="platform"
        className="bg-white py-20 lg:py-28"
      >

        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

          <SectionHeading
            eyebrow="THE STATWISE ADVANTAGE"
            title="One intelligent platform for workforce growth"
            description="From identifying competency gaps to measuring learning outcomes, STATWISE AI connects every stage of the employee development journey."
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.15,
            }}
            variants={stagger}
            className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4"
          >

            <FeatureCard
              icon={<Brain size={24} />}
              title="AI Skill Intelligence"
              description="Analyze competency levels and identify the skills that need improvement."
            />

            <FeatureCard
              icon={<Target size={24} />}
              title="Skill Gap Detection"
              description="Compare current capabilities against role-specific competency targets."
            />

            <FeatureCard
              icon={<GraduationCap size={24} />}
              title="Personalized Learning"
              description="Generate focused learning paths based on individual skill gaps."
            />

            <FeatureCard
              icon={<MessageCircle size={24} />}
              title="AI Tutor"
              description="Get instant explanations, guidance and learning support whenever needed."
            />

          </motion.div>

        </div>

      </section>

      {/* ========================================================
          HOW IT WORKS
      ======================================================== */}

      <section className="bg-[#FFF8D9] py-20 lg:py-28">

        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

          <SectionHeading
            eyebrow="HOW IT WORKS"
            title="From skills to measurable impact"
            description="STATWISE AI creates a continuous intelligence loop for learning and workforce development."
          />

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

            <ProcessCard
              number="01"
              icon={<Users size={22} />}
              title="Know Your Role"
              text="Build a competency profile based on the learner's role, experience and assessment data."
            />

            <ProcessCard
              number="02"
              icon={<Target size={22} />}
              title="Find Skill Gaps"
              text="AI compares current competency against target skills and highlights priority gaps."
            />

            <ProcessCard
              number="03"
              icon={<GraduationCap size={22} />}
              title="Learn Personally"
              text="Receive targeted courses, resources, quizzes and AI-assisted learning."
            />

            <ProcessCard
              number="04"
              icon={<LineChart size={22} />}
              title="Measure Growth"
              text="Track competency improvement and use feedback to continuously refine learning."
            />

          </div>

        </div>

      </section>

      {/* ========================================================
          PERSONALIZED LEARNING
      ======================================================== */}

      <section className="bg-[#FFFDF5] py-20 lg:py-28">

        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

          <div className="grid items-center gap-14 lg:grid-cols-2">

            <div>

              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#D89B00]">
                Personalized Learning
              </p>

              <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                Every learner gets a path built around their needs.
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
                Instead of giving every employee the same training,
                STATWISE AI focuses learning on the exact competencies
                that need improvement.
              </p>

              <div className="mt-8 space-y-4">

                <CheckRow text="Role-based competency mapping" />
                <CheckRow text="AI-powered skill gap analysis" />
                <CheckRow text="Recommended courses and resources" />
                <CheckRow text="Adaptive quizzes and assessments" />
                <CheckRow text="Continuous competency tracking" />

              </div>

              <a
                href="/learning"
                className="mt-9 inline-flex items-center gap-2 rounded-xl bg-[#172033] px-6 py-3.5 text-sm font-bold text-white transition hover:-translate-y-1"
              >
                Explore Learning Paths
                <ArrowRight size={18} />
              </a>

            </div>

            <div className="relative">

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.96,
                }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                }}
                viewport={{
                  once: true,
                }}
                className="rounded-[2rem] border border-[#E7DFAF] bg-white p-6 shadow-[0_25px_60px_rgba(23,32,51,0.10)] sm:p-8"
              >

                <div className="flex items-center justify-between border-b border-slate-100 pb-5">

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Recommended Path
                    </p>

                    <h3 className="mt-1 text-xl font-extrabold">
                      Data Analysis Essentials
                    </h3>

                  </div>

                  <motion.div
                    animate={{
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF3B0]"
                  >
                    <BarChart3 size={21} />
                  </motion.div>

                </div>

                <div className="mt-6 space-y-4">

                  <LearningPathItem
                    number="01"
                    title="Data Analysis Fundamentals"
                    meta="6 hours • Beginner"
                    progress={100}
                    done
                  />

                  <LearningPathItem
                    number="02"
                    title="Statistical Data Interpretation"
                    meta="8 hours • Intermediate"
                    progress={68}
                  />

                  <LearningPathItem
                    number="03"
                    title="Advanced Data Visualization"
                    meta="5 hours • Intermediate"
                    progress={24}
                  />

                  <LearningPathItem
                    number="04"
                    title="Applied Statistical Computing"
                    meta="7 hours • Advanced"
                    progress={0}
                  />

                </div>

                <motion.div
                  animate={{
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                  className="mt-6 rounded-2xl bg-[#172033] p-5 text-white"
                >

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4C430] text-[#172033]">

                      <Sparkles size={19} />

                    </div>

                    <div>

                      <p className="text-xs text-slate-300">
                        AI Recommendation
                      </p>

                      <p className="text-sm font-bold">
                        Focus next on statistical interpretation.
                      </p>

                    </div>

                  </div>

                </motion.div>

              </motion.div>

            </div>

          </div>

        </div>

      </section>

      {/* ========================================================
          SKILL INTELLIGENCE
      ======================================================== */}

      <section className="bg-[#172033] py-20 text-white lg:py-28">

        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

          <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">

            <div>

              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#F4C430]">
                Skill Intelligence
              </p>

              <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                Turn competency data into actionable decisions.
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
                STATWISE AI transforms assessment and learning signals
                into a clear view of current competency, target competency
                and the gaps that matter most.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4">

                <DarkMini
                  icon={<BarChart3 size={20} />}
                  title="Competency"
                  value="78%"
                />

                <DarkMini
                  icon={<Target size={20} />}
                  title="Priority Gaps"
                  value="03"
                />

                <DarkMini
                  icon={<Clock3 size={20} />}
                  title="Learning Hours"
                  value="24h"
                />

                <DarkMini
                  icon={<TrendingUp size={20} />}
                  title="Growth"
                  value="+6.4%"
                />

              </div>

            </div>

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              whileInView={{
                opacity: 1,
                scale: 1,
              }}
              viewport={{
                once: true,
              }}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur sm:p-7"
            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs text-slate-400">
                    Competency Overview
                  </p>

                  <h3 className="mt-1 text-xl font-extrabold">
                    Statistical Officer
                  </h3>

                </div>

                <div className="rounded-full bg-[#16865B]/20 px-3 py-1 text-xs font-bold text-[#70E1A8]">
                  Intermediate
                </div>

              </div>

              <div className="mt-8 grid gap-5 sm:grid-cols-[150px_1fr]">

                <div className="flex items-center justify-center">

                  <motion.div
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 12,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="relative flex h-36 w-36 items-center justify-center rounded-full border-[12px] border-[#F4C430]"
                  >

                    <div className="text-center">

                      <p className="text-4xl font-extrabold">
                        78
                      </p>

                      <p className="text-xs text-slate-400">
                        / 100
                      </p>

                    </div>

                  </motion.div>

                </div>

                <div className="space-y-5">

                  <DarkSkill
                    name="Statistics"
                    value={82}
                  />

                  <DarkSkill
                    name="Probability"
                    value={64}
                  />

                  <DarkSkill
                    name="Data Analysis"
                    value={72}
                  />

                  <DarkSkill
                    name="Visualization"
                    value={61}
                  />

                </div>

              </div>

              <div className="mt-7 rounded-2xl bg-[#F4C430] p-5 text-[#172033]">

                <div className="flex gap-3">

                  <Sparkles
                    size={21}
                    className="mt-0.5 shrink-0"
                  />

                  <div>

                    <p className="text-sm font-extrabold">
                      AI Insight
                    </p>

                    <p className="mt-1 text-sm leading-6">
                      Data visualization is the highest-priority
                      competency gap. A focused learning path is recommended.
                    </p>

                  </div>

                </div>

              </div>

            </motion.div>

          </div>

        </div>

      </section>

      {/* ========================================================
          LEARNING ECOSYSTEM
      ======================================================== */}

      <section className="bg-white py-20 lg:py-28">

        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

          <SectionHeading
            eyebrow="LEARNING ECOSYSTEM"
            title="Everything needed for continuous development"
            description="A connected ecosystem for learning, assessment, AI assistance and measurable workforce intelligence."
          />

          <div className="mt-14 grid gap-5 md:grid-cols-2">

            <EcosystemCard
              icon={<GraduationCap size={25} />}
              title="Learning Hub"
              description="Discover structured courses and personalized learning resources."
              link="Explore Learning"
              href="/learning"
            />

            <EcosystemCard
              icon={<FileQuestion size={25} />}
              title="Assessment Hub"
              description="Evaluate competency through adaptive quizzes and assessments."
              link="Take an Assessment"
              href="/assessments"
            />

            <EcosystemCard
              icon={<MessageCircle size={25} />}
              title="AI Tutor"
              description="Ask questions, understand concepts and get contextual learning support."
              link="Talk to AI Tutor"
              href="/tutor"
            />

            <EcosystemCard
              icon={<BarChart3 size={25} />}
              title="Skill Intelligence"
              description="Track competency, identify gaps and monitor development over time."
              link="View Skill Intelligence"
              href="/skills"
            />

          </div>

        </div>

      </section>

      {/* ========================================================
          FINAL CTA
      ======================================================== */}

      <section className="bg-[#FFF3B0] py-16 lg:py-20">

        <div className="mx-auto max-w-5xl px-5 text-center sm:px-8">

          <motion.div
            animate={{
              y: [0, -6, 0],
              rotate: [0, 2, -2, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#172033] text-[#F4C430] shadow-xl"
          >
            <Brain size={30} />
          </motion.div>

          <h2 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Build a smarter, continuously learning workforce.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600">
            Start with your skills. Discover your gaps. Follow your
            personalized learning path. Measure your growth.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

            <a
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#172033] px-7 py-3.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-1"
            >
              Start Your Learning Journey
              <ArrowRight size={18} />
            </a>

            <button
              onClick={runDemo}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D5C875] bg-white px-7 py-3.5 text-sm font-bold text-[#172033] transition hover:-translate-y-1"
            >
              <Sparkles size={17} />
              Run AI Demo
            </button>

          </div>

        </div>

      </section>

    </main>
  );
}

// ============================================================
// SKILL MINI
// ============================================================

function SkillMini({ name, value }) {
  return (
    <div className="mb-3 last:mb-0">

      <div className="mb-1 flex justify-between text-[10px] font-bold">
        <span>{name}</span>
        <span>{value}%</span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">

        <motion.div
          initial={{
            width: 0,
          }}
          whileInView={{
            width: `${value}%`,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 1,
          }}
          className="h-full rounded-full bg-[#F4C430]"
        />

      </div>

    </div>
  );
}

// ============================================================
// STAT
// ============================================================

function Stat({ value, label }) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
      }}
      whileHover={{
        y: -5,
      }}
      className="border-b border-white/10 p-5 text-center lg:border-b-0 lg:border-r last:border-r-0"
    >

      <motion.div
        initial={{
          scale: 0.8,
        }}
        whileInView={{
          scale: 1,
        }}
        viewport={{
          once: true,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
        }}
        className="text-3xl font-black text-[#F4C430] sm:text-4xl"
      >
        {value}
      </motion.div>

      <p className="mt-2 text-xs font-medium text-slate-400 sm:text-sm">
        {label}
      </p>

    </motion.div>
  );
}

// ============================================================
// SECTION HEADING
// ============================================================

function SectionHeading({
  eyebrow,
  title,
  description,
}) {
  return (
    <motion.div
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
      className="max-w-3xl"
    >

      <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#D89B00]">
        {eyebrow}
      </p>

      <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
        {title}
      </h2>

      <p className="mt-5 text-base leading-7 text-slate-600">
        {description}
      </p>

    </motion.div>
  );
}

// ============================================================
// FEATURE CARD
// ============================================================

function FeatureCard({
  icon,
  title,
  description,
}) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{
        y: -8,
      }}
      transition={{
        type: "spring",
        stiffness: 250,
      }}
      className="group rounded-[1.5rem] border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-xl"
    >

      <motion.div
        whileHover={{
          rotate: 5,
          scale: 1.08,
        }}
        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF3B0] text-[#172033]"
      >
        {icon}
      </motion.div>

      <h3 className="mt-5 text-lg font-extrabold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        {description}
      </p>

      <div className="mt-5 flex items-center gap-2 text-xs font-bold text-[#9A6900]">

        Explore

        <ArrowRight
          size={14}
          className="transition-transform group-hover:translate-x-1"
        />

      </div>

    </motion.div>
  );
}

// ============================================================
// PROCESS CARD
// ============================================================

function ProcessCard({
  number,
  icon,
  title,
  text,
}) {
  return (
    <motion.div
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
      whileHover={{
        y: -7,
      }}
      className="relative rounded-[1.5rem] border border-[#E7DFAF] bg-white p-6 shadow-sm transition-shadow hover:shadow-lg"
    >

      <div className="flex items-center justify-between">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF3B0]">
          {icon}
        </div>

        <span className="text-4xl font-black text-[#F0E8BC]">
          {number}
        </span>

      </div>

      <h3 className="mt-6 text-lg font-extrabold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        {text}
      </p>

    </motion.div>
  );
}

// ============================================================
// CHECK ROW
// ============================================================

function CheckRow({ text }) {
  return (
    <motion.div
      whileHover={{
        x: 5,
      }}
      className="flex items-center gap-3"
    >

      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E6F5ED]">

        <CheckCircle2
          size={16}
          className="text-[#16865B]"
        />

      </div>

      <span className="text-sm font-semibold text-slate-700">
        {text}
      </span>

    </motion.div>
  );
}

// ============================================================
// LEARNING PATH ITEM
// ============================================================

function LearningPathItem({
  number,
  title,
  meta,
  progress,
  done = false,
}) {
  return (
    <motion.div
      whileHover={{
        x: 4,
      }}
      className="rounded-xl border border-slate-100 p-4"
    >

      <div className="flex items-start gap-3">

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold ${
            done
              ? "bg-[#E6F5ED] text-[#16865B]"
              : "bg-[#FFF3B0] text-[#9A6900]"
          }`}
        >

          {done ? (
            <CheckCircle2 size={17} />
          ) : (
            number
          )}

        </div>

        <div className="min-w-0 flex-1">

          <div className="flex items-center justify-between gap-3">

            <p className="text-sm font-bold">
              {title}
            </p>

            <span className="text-xs font-bold text-slate-500">
              {progress}%
            </span>

          </div>

          <p className="mt-1 text-[11px] text-slate-400">
            {meta}
          </p>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">

            <motion.div
              initial={{
                width: 0,
              }}
              whileInView={{
                width: `${progress}%`,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 1,
                delay: 0.1,
              }}
              className="h-full rounded-full bg-[#F4C430]"
            />

          </div>

        </div>

      </div>

    </motion.div>
  );
}

// ============================================================
// DARK MINI
// ============================================================

function DarkMini({
  icon,
  title,
  value,
}) {
  return (
    <motion.div
      whileHover={{
        y: -4,
      }}
      className="rounded-2xl border border-white/10 bg-white/5 p-4"
    >

      <div className="flex items-center gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F4C430] text-[#172033]">
          {icon}
        </div>

        <div>

          <p className="text-xs text-slate-400">
            {title}
          </p>

          <p className="mt-1 text-lg font-extrabold">
            {value}
          </p>

        </div>

      </div>

    </motion.div>
  );
}

// ============================================================
// DARK SKILL
// ============================================================

function DarkSkill({ name, value }) {
  return (
    <div>

      <div className="mb-2 flex items-center justify-between">

        <span className="text-sm font-semibold">
          {name}
        </span>

        <span className="text-sm font-extrabold text-[#F4C430]">
          {value}%
        </span>

      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/10">

        <motion.div
          initial={{
            width: 0,
          }}
          whileInView={{
            width: `${value}%`,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 1,
          }}
          className="h-full rounded-full bg-[#F4C430]"
        />

      </div>

    </div>
  );
}

// ============================================================
// ECOSYSTEM CARD
// ============================================================

function EcosystemCard({
  icon,
  title,
  description,
  link,
  href,
}) {
  return (
    <motion.a
      href={href}
      whileHover={{
        y: -7,
      }}
      className="group rounded-[1.5rem] border border-slate-100 bg-white p-7 shadow-sm transition-shadow hover:shadow-xl"
    >

      <div className="flex items-start justify-between">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF3B0]">
          {icon}
        </div>

        <ArrowRight
          size={19}
          className="text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-[#172033]"
        />

      </div>

      <h3 className="mt-6 text-xl font-extrabold">
        {title}
      </h3>

      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
        {description}
      </p>

      <div className="mt-6 text-sm font-bold text-[#9A6900]">
        {link}
      </div>

    </motion.a>
  );
}

export default Home;