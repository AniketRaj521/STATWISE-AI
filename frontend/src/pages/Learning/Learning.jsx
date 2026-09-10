import { useMemo, useRef, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";

import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  FileText,
  Filter,
  Flame,
  GraduationCap,
  Loader2,
  Play,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  UploadCloud,
  X,
  Zap,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import coursesData from "../../data/courses.json";
import statwiseAnalysis from "../../data/statwiseAnalysis";

const API = "http://127.0.0.1:8000";

/* ============================================================
   HELPERS
============================================================ */

function text(value, fallback = "") {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (value && typeof value === "object") {
    return (
      value.name ||
      value.title ||
      value.label ||
      value.skill ||
      fallback
    );
  }

  return fallback;
}

function normalizeCourses(data) {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.courses)) {
    return data.courses;
  }

  if (data && typeof data === "object") {
    const flattened = [];

    Object.values(data).forEach((group) => {
      if (Array.isArray(group)) {
        flattened.push(...group);
      }
    });

    return flattened;
  }

  return [];
}

function normalizeSkills(data) {
  const skills =
    data?.skills ||
    data?.skill_gap_analysis?.gaps ||
    data?.skillGapAnalysis?.gaps ||
    data?.gaps ||
    [];

  if (!Array.isArray(skills)) return [];

  return skills.map((item) => {
    const current = Number(
      item?.current ??
        item?.current_score ??
        item?.score ??
        0
    );

    const target = Number(
      item?.target ??
        item?.target_score ??
        70
    );

    return {
      name: text(
        item?.name || item?.skill,
        "Skill"
      ),
      current,
      target,
      gap: Math.max(0, target - current),
    };
  });
}

/* ============================================================
   COURSE CARD
============================================================ */

function CourseCard({
  course,
  index,
  recommended,
  onOpen,
}) {
  const title = text(
    course?.title || course?.name,
    "Learning Course"
  );

  const description = text(
    course?.description,
    "Build practical knowledge and strengthen your professional competency."
  );

  const category = text(
    course?.category,
    "Skill Development"
  );

  const duration = text(
    course?.duration,
    "Self-paced"
  );

  const level = text(
    course?.level,
    "Intermediate"
  );

  const progress = Number(
    course?.progress ?? 0
  );

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
      transition={{
        delay: index * 0.07,
        duration: 0.45,
      }}
      whileHover={{
        y: -7,
      }}
      className="group relative overflow-hidden rounded-[1.7rem] border border-black/8 bg-white shadow-sm transition hover:border-black/15 hover:shadow-xl"
    >
      {recommended && (
        <div className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-[#F6D76A] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#172033]">
          <Sparkles size={11} />
          AI Pick
        </div>
      )}

      <div className="relative h-36 overflow-hidden bg-[#172033]">
        <motion.div
          className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#F6D76A]/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative flex h-full items-center justify-between px-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F6D76A] text-[#172033] shadow-lg">
            <BookOpen size={25} />
          </div>

          <div className="text-right text-white">
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
              Course
            </div>

            <div className="mt-1 text-sm font-black">
              {category}
            </div>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-[10px] font-black uppercase text-gray-500">
            {level}
          </span>

          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock3 size={13} />
            {duration}
          </span>
        </div>

        <h3 className="mt-4 min-h-[52px] text-lg font-black leading-6">
          {title}
        </h3>

        <p className="mt-2 line-clamp-2 min-h-[48px] text-sm leading-6 text-gray-500">
          {description}
        </p>

        <div className="mt-5">
          <div className="mb-2 flex justify-between text-xs">
            <span className="font-semibold text-gray-400">
              Your progress
            </span>

            <span className="font-black">
              {progress}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
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
                duration: 0.8,
              }}
              className="h-full rounded-full bg-[#172033]"
            />
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={() => onOpen(course)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-black/10 py-3 text-sm font-black transition hover:bg-gray-50"
          >
            View Details
          </button>

          <button
            onClick={() => {
              toast.success(`Opening ${title}`);
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#172033] px-4 py-3 text-sm font-black text-white transition hover:bg-black"
          >
            <Play
              size={15}
              fill="currentColor"
            />
            Start
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   GENERATION LOADING SCREEN
============================================================ */

function GenerationOverlay() {
  const steps = [
    "Reading your learning material",
    "Analyzing competency requirements",
    "Identifying learning priorities",
    "Building personalized modules",
    "Optimizing your learning roadmap",
  ];

  const [step, setStep] = useState(0);

  useState(() => {
    const timer = setInterval(() => {
      setStep((current) =>
        current < steps.length - 1
          ? current + 1
          : current
      );
    }, 1400);

    return () => clearInterval(timer);
  });

  return (
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
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#172033]/85 p-5 backdrop-blur-md"
    >
      <motion.div
        initial={{
          scale: 0.9,
          y: 20,
        }}
        animate={{
          scale: 1,
          y: 0,
        }}
        className="w-full max-w-xl overflow-hidden rounded-[2rem] bg-white shadow-2xl"
      >
        <div className="bg-[#172033] p-8 text-white">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear",
              }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F6D76A] text-[#172033]"
            >
              <BrainCircuit size={30} />
            </motion.div>

            <div>
              <div className="text-xs font-black uppercase tracking-[0.2em] text-[#F6D76A]">
                STATWISE AI
              </div>

              <h2 className="mt-1 text-2xl font-black">
                Building your learning path
              </h2>
            </div>
          </div>
        </div>

        <div className="p-7">
          <div className="space-y-4">
            {steps.map((item, index) => {
              const active = index <= step;

              return (
                <motion.div
                  key={item}
                  initial={{
                    opacity: 0,
                    x: -15,
                  }}
                  animate={{
                    opacity: active ? 1 : 0.35,
                    x: 0,
                  }}
                  className="flex items-center gap-3"
                >
                  {active ? (
                    <CheckCircle2
                      size={20}
                      className="text-[#172033]"
                    />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-200" />
                  )}

                  <span
                    className={`text-sm ${
                      active
                        ? "font-bold text-[#172033]"
                        : "text-gray-400"
                    }`}
                  >
                    {item}
                  </span>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-7 h-2 overflow-hidden rounded-full bg-gray-100">
            <motion.div
              animate={{
                width: `${((step + 1) / steps.length) * 100}%`,
              }}
              className="h-full rounded-full bg-[#F6D76A]"
            />
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-gray-400">
            <Loader2
              size={14}
              className="animate-spin"
            />
            AI is personalizing your roadmap...
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ============================================================
   LEARNING PATH DISPLAY
============================================================ */

function LearningPathResult({
  path,
  filename,
  onReset,
}) {
  const [openStage, setOpenStage] =
    useState(0);

  const stages = Array.isArray(path?.stages)
    ? path.stages
    : [];

  const strengths = Array.isArray(
    path?.strengths
  )
    ? path.strengths
    : [];

  const skillGaps = Array.isArray(
    path?.skill_gaps
  )
    ? path.skill_gaps
    : [];

  const milestones = Array.isArray(
    path?.milestones
  )
    ? path.milestones
    : [];

  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 30,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="mx-auto max-w-[1500px] px-5 py-12 lg:px-8"
    >
      <div className="overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-xl">
        {/* HEADER */}

        <div className="relative overflow-hidden bg-[#172033] p-7 text-white lg:p-10">
          <motion.div
            className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#F6D76A]/10 blur-3xl"
            animate={{
              scale: [1, 1.25, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
            }}
          />

          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#F6D76A]">
                <Sparkles size={15} />
                AI Generated Learning Path
              </div>

              <h2 className="mt-3 text-3xl font-black lg:text-4xl">
                {text(
                  path?.title,
                  "Your Personalized Learning Journey"
                )}
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
                {text(
                  path?.subtitle ||
                    path?.goal ||
                    path?.description,
                  "A learning roadmap generated from your uploaded learning material."
                )}
              </p>

              {filename && (
                <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white/70">
                  <FileText size={14} />
                  {filename}
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F6D76A] text-[#172033]">
                <GraduationCap size={23} />
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                  Learner Level
                </div>

                <div className="mt-1 font-black">
                  {text(
                    path?.learner_level,
                    "Personalized"
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SUMMARY STATS */}

        <div className="grid border-b border-black/5 sm:grid-cols-3">
          <div className="flex items-center gap-4 p-6 sm:border-r">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F6D76A]/25">
              <Clock3 size={20} />
            </div>

            <div>
              <div className="text-2xl font-black">
                {text(
                  path?.estimated_hours,
                  "—"
                )}
              </div>

              <div className="text-xs text-gray-400">
                Estimated hours
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t border-black/5 p-6 sm:border-t-0 sm:border-r">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F6D76A]/25">
              <Target size={20} />
            </div>

            <div>
              <div className="text-2xl font-black">
                {stages.length}
              </div>

              <div className="text-xs text-gray-400">
                Learning stages
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t border-black/5 p-6 sm:border-t-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F6D76A]/25">
              <TrendingUp size={20} />
            </div>

            <div>
              <div className="text-2xl font-black">
                {milestones.length}
              </div>

              <div className="text-xs text-gray-400">
                Milestones
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 p-6 lg:grid-cols-[0.8fr_1.2fr] lg:p-10">
          {/* LEFT */}

          <div className="space-y-6">
            {/* SKILL GAPS */}

            {skillGaps.length > 0 && (
              <div className="rounded-3xl bg-[#fffdf5] p-6">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#172033]/45">
                  <Target size={15} />
                  Skill Gaps
                </div>

                <h3 className="mt-2 text-xl font-black">
                  Focus areas
                </h3>

                <div className="mt-5 space-y-3">
                  {skillGaps.map(
                    (gap, index) => {
                      const skillName =
                        text(
                          gap?.skill ||
                            gap?.name ||
                            gap?.title,
                          `Skill ${index + 1}`
                        );

                      const gapValue =
                        Number(
                          gap?.gap ??
                            gap?.difference ??
                            0
                        );

                      return (
                        <div
                          key={`${skillName}-${index}`}
                          className="rounded-2xl bg-white p-4 shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-black">
                              {skillName}
                            </span>

                            {gapValue > 0 && (
                              <span className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-black text-red-600">
                                GAP {Math.round(
                                  gapValue
                                )}
                              </span>
                            )}
                          </div>

                          <div className="mt-3 text-xs leading-5 text-gray-500">
                            {text(
                              gap?.reason ||
                                gap?.description,
                              "This competency has been identified as a priority for your learning journey."
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* STRENGTHS */}

            {strengths.length > 0 && (
              <div className="rounded-3xl bg-[#172033] p-6 text-white">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#F6D76A]">
                  <Zap size={15} />
                  Current strengths
                </div>

                <div className="mt-5 space-y-3">
                  {strengths.map(
                    (strength, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 rounded-xl bg-white/5 p-3"
                      >
                        <CheckCircle2
                          size={17}
                          className="mt-0.5 shrink-0 text-[#F6D76A]"
                        />

                        <span className="text-sm text-white/75">
                          {text(
                            strength,
                            "Existing competency"
                          )}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT - ROADMAP */}

          <div>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#172033]/40">
                  <Sparkles size={15} />
                  Personalized roadmap
                </div>

                <h3 className="mt-2 text-2xl font-black">
                  Your learning journey
                </h3>
              </div>
            </div>

            <div className="relative mt-7 space-y-4">
              <div className="absolute bottom-8 left-6 top-8 hidden w-px bg-black/10 sm:block" />

              {stages.length > 0 ? (
                stages.map(
                  (stage, stageIndex) => {
                    const isOpen =
                      openStage ===
                      stageIndex;

                    const modules =
                      Array.isArray(
                        stage?.modules
                      )
                        ? stage.modules
                        : [];

                    return (
                      <motion.div
                        key={
                          stage?.id ||
                          stage?.stage_id ||
                          stageIndex
                        }
                        layout
                        className="relative z-10"
                      >
                        <button
                          onClick={() =>
                            setOpenStage(
                              isOpen
                                ? -1
                                : stageIndex
                            )
                          }
                          className="w-full rounded-2xl border border-black/8 bg-white p-4 text-left shadow-sm transition hover:shadow-md"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F6D76A] font-black text-[#172033]">
                              {stageIndex +
                                1}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-black uppercase tracking-wider text-gray-400">
                                Stage{" "}
                                {stageIndex +
                                  1}
                              </div>

                              <h4 className="mt-1 text-lg font-black">
                                {text(
                                  stage?.title ||
                                    stage?.name,
                                  `Learning Stage ${stageIndex + 1}`
                                )}
                              </h4>

                              <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
                                {text(
                                  stage?.description,
                                  "Build the next layer of your competency."
                                )}
                              </p>
                            </div>

                            <div className="shrink-0">
                              {isOpen ? (
                                <ChevronUp
                                  size={20}
                                />
                              ) : (
                                <ChevronDown
                                  size={20}
                                />
                              )}
                            </div>
                          </div>
                        </button>

                        <AnimatePresence>
                          {isOpen && (
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
                              <div className="ml-4 border-l border-black/10 pl-5 pt-3 sm:ml-6">
                                {modules.length >
                                0 ? (
                                  <div className="space-y-3">
                                    {modules.map(
                                      (
                                        module,
                                        moduleIndex
                                      ) => (
                                        <div
                                          key={
                                            module?.id ||
                                            module?.module_id ||
                                            moduleIndex
                                          }
                                          className="rounded-2xl bg-[#fffdf5] p-4"
                                        >
                                          <div className="flex items-start gap-3">
                                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#172033] text-white">
                                              <BookOpen
                                                size={
                                                  14
                                                }
                                              />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                              <div className="flex flex-wrap items-center justify-between gap-2">
                                                <h5 className="font-black">
                                                  {text(
                                                    module?.title ||
                                                      module?.name,
                                                    `Module ${moduleIndex + 1}`
                                                  )}
                                                </h5>

                                                {module?.duration && (
                                                  <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                                                    <Clock3
                                                      size={
                                                        12
                                                      }
                                                    />
                                                    {text(
                                                      module.duration
                                                    )}
                                                  </span>
                                                )}
                                              </div>

                                              <p className="mt-1 text-xs leading-5 text-gray-500">
                                                {text(
                                                  module?.description ||
                                                    module?.objective ||
                                                    module?.summary,
                                                  "Complete this learning module and apply the concepts through practice."
                                                )}
                                              </p>

                                              <div className="mt-3 flex flex-wrap gap-2">
                                                {module?.skill && (
                                                  <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-gray-500">
                                                    {text(
                                                      module.skill
                                                    )}
                                                  </span>
                                                )}

                                                {module?.assessment && (
                                                  <span className="rounded-full bg-[#F6D76A]/30 px-2.5 py-1 text-[10px] font-bold text-[#172033]">
                                                    Assessment
                                                  </span>
                                                )}

                                                {module?.practice && (
                                                  <span className="rounded-full bg-[#172033]/10 px-2.5 py-1 text-[10px] font-bold text-[#172033]">
                                                    Practice
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                ) : (
                                  <div className="rounded-2xl bg-[#fffdf5] p-5 text-sm text-gray-500">
                                    {text(
                                      stage?.content ||
                                        stage?.description,
                                      "Follow this stage as part of your personalized learning journey."
                                    )}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  }
                )
              ) : (
                <div className="rounded-2xl border border-dashed border-black/15 p-8 text-center">
                  <BrainCircuit
                    size={35}
                    className="mx-auto text-gray-300"
                  />

                  <p className="mt-3 text-sm text-gray-500">
                    The AI returned a learning path, but no stages were detected.
                  </p>
                </div>
              )}
            </div>

            {/* MILESTONES */}

            {milestones.length > 0 && (
              <div className="mt-8 rounded-3xl bg-[#F6D76A]/20 p-6">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#172033]/50">
                  <CheckCircle2 size={15} />
                  Milestones
                </div>

                <div className="mt-4 space-y-3">
                  {milestones.map(
                    (milestone, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3"
                      >
                        <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#172033] text-[10px] font-black text-white">
                          {index + 1}
                        </div>

                        <div className="text-sm font-semibold text-[#172033]/75">
                          {text(
                            milestone,
                            "Learning milestone"
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* FINAL OUTCOME */}

            {path?.outcome && (
              <div className="mt-6 rounded-3xl bg-[#172033] p-6 text-white">
                <div className="text-xs font-black uppercase tracking-wider text-[#F6D76A]">
                  Expected outcome
                </div>

                <p className="mt-3 text-sm leading-6 text-white/70">
                  {text(
                    path.outcome,
                    "Complete the personalized learning journey and improve your targeted competencies."
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ACTIONS */}

        <div className="flex flex-col gap-3 border-t border-black/5 bg-[#fffdf5] p-6 sm:flex-row sm:justify-end">
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-black transition hover:bg-gray-50"
          >
            <UploadCloud size={17} />
            Upload Another PDF
          </button>

          <button
            onClick={() => {
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#172033] px-5 py-3 text-sm font-black text-white"
          >
            <ArrowRight size={17} />
            Continue Learning
          </button>
        </div>
      </div>
    </motion.section>
  );
}

/* ============================================================
   MAIN LEARNING PAGE
============================================================ */

export default function Learning() {
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("All");

  const [selectedCourse, setSelectedCourse] =
    useState(null);

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [isDragging, setIsDragging] =
    useState(false);

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [learningPath, setLearningPath] =
    useState(null);

  const [generatedFilename, setGeneratedFilename] =
    useState("");

  const [role, setRole] =
    useState("Statistical Officer");

  const [assessmentScore, setAssessmentScore] =
    useState(
      Number(
        statwiseAnalysis?.assessment_score ??
          statwiseAnalysis?.assessmentScore ??
          65
      )
    );

  const [quizAccuracy, setQuizAccuracy] =
    useState(
      Number(
        statwiseAnalysis?.quiz_accuracy ??
          statwiseAnalysis?.quizAccuracy ??
          70
      )
    );

  const [yearsExperience, setYearsExperience] =
    useState(2);

  const [learningGoal, setLearningGoal] =
    useState(
      "Improve professional competency and close identified skill gaps."
    );

  const courses = useMemo(
    () => normalizeCourses(coursesData),
    []
  );

  const skills = useMemo(
    () => normalizeSkills(statwiseAnalysis),
    []
  );

  /* ============================================================
     CATEGORIES
  ============================================================ */

  const categories = useMemo(() => {
    const values = courses
      .map((course) =>
        text(
          course?.category,
          "Skill Development"
        )
      )
      .filter(Boolean);

    return [
      "All",
      ...Array.from(new Set(values)),
    ];
  }, [courses]);

  /* ============================================================
     PRIORITY SKILLS
  ============================================================ */

  const prioritySkills = useMemo(() => {
    return [...skills]
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 3);
  }, [skills]);

  /* ============================================================
     FILTER COURSES
  ============================================================ */

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const title = text(
        course?.title || course?.name
      ).toLowerCase();

      const description = text(
        course?.description
      ).toLowerCase();

      const courseCategory = text(
        course?.category,
        "Skill Development"
      );

      const searchValue =
        search.toLowerCase();

      const matchesSearch =
        title.includes(searchValue) ||
        description.includes(searchValue);

      const matchesCategory =
        category === "All" ||
        courseCategory === category;

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [
    courses,
    search,
    category,
  ]);

  const aiRecommendations =
    filteredCourses.slice(0, 3);

  /* ============================================================
     FILE VALIDATION
  ============================================================ */

  const handleFile = (file) => {
    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      toast.error(
        "Please upload a PDF file only."
      );
      return;
    }

    setSelectedFile(file);

    toast.success(
      `${file.name} selected`
    );
  };

  const handleFileInput = (event) => {
    const file =
      event.target.files?.[0];

    handleFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();

    setIsDragging(false);

    const file =
      event.dataTransfer.files?.[0];

    handleFile(file);
  };

  /* ============================================================
     GENERATE PERSONALIZED LEARNING PATH
  ============================================================ */

  const generateLearningPath = async () => {
    if (!selectedFile) {
      toast.error(
        "Please upload a PDF first."
      );
      return;
    }

    if (
      !selectedFile.name
        .toLowerCase()
        .endsWith(".pdf")
    ) {
      toast.error(
        "Only PDF files are supported."
      );
      return;
    }

    const formData = new FormData();

    formData.append(
      "file",
      selectedFile
    );

    formData.append(
      "role",
      role
    );

    formData.append(
      "assessment_score",
      String(
        Math.max(
          0,
          Math.min(100, assessmentScore)
        )
      )
    );

    formData.append(
      "quiz_accuracy",
      String(
        Math.max(
          0,
          Math.min(100, quizAccuracy)
        )
      )
    );

    formData.append(
      "years_experience",
      String(
        Math.max(
          0,
          yearsExperience
        )
      )
    );

    formData.append(
      "learning_goal",
      learningGoal
    );

    try {
      setIsGenerating(true);

      const response = await fetch(
        `${API}/personalized-learning-path`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Server error while generating learning path."
        );
      }

      if (!data?.success) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to generate personalized learning path."
        );
      }

      const generatedPath =
        data?.learning_path ||
        data?.path ||
        data?.result;

      if (!generatedPath) {
        throw new Error(
          "The backend returned no learning path."
        );
      }

      setLearningPath(
        generatedPath
      );

      setGeneratedFilename(
        data?.filename ||
          selectedFile.name
      );

      toast.success(
        "Personalized learning path generated!"
      );

      setTimeout(() => {
        document
          .getElementById(
            "learning-path-result"
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 200);
    } catch (error) {
      console.error(
        "Learning path error:",
        error
      );

      toast.error(
        error?.message ||
          "Unable to generate learning path."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  /* ============================================================
     RESET GENERATOR
  ============================================================ */

  const resetGenerator = () => {
    setSelectedFile(null);
    setLearningPath(null);
    setGeneratedFilename("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-[#fffdf5] text-[#172033]">
      {/* ========================================================
          NAVBAR
      ======================================================== */}

      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#172033] text-white shadow-lg">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-3 lg:px-8">
          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F6D76A] text-[#172033]">
              <BrainCircuit size={21} />
            </div>

            <div className="text-left">
              <div className="text-lg font-black">
                STATWISE AI
              </div>

              <div className="text-[9px] uppercase tracking-[0.18em] text-white/40">
                Personalized Learning
              </div>
            </div>
          </button>

          <div className="hidden items-center gap-2 md:flex">
            <button
              onClick={() =>
                navigate("/dashboard")
              }
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white/60 hover:bg-white/10 hover:text-white"
            >
              Dashboard
            </button>

            <button
              onClick={() =>
                navigate("/skills")
              }
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white/60 hover:bg-white/10 hover:text-white"
            >
              Skills
            </button>

            <button
              onClick={() =>
                navigate("/assessments")
              }
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white/60 hover:bg-white/10 hover:text-white"
            >
              Assessments
            </button>

            <button
              onClick={() =>
                navigate("/tutor")
              }
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white/60 hover:bg-white/10 hover:text-white"
            >
              AI Tutor
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================
          HERO
      ======================================================== */}

      <section className="relative overflow-hidden bg-[#172033]">
        <motion.div
          className="absolute -left-32 -top-20 h-80 w-80 rounded-full bg-[#F6D76A]/10 blur-3xl"
          animate={{
            x: [0, 70, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
          }}
        />

        <motion.div
          className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-white/5 blur-3xl"
          animate={{
            x: [0, -60, 0],
            y: [0, -25, 0],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
            backgroundSize: "45px 45px",
          }}
        />

        <div className="relative mx-auto max-w-[1500px] px-5 py-12 lg:px-8 lg:py-16">
          <div className="max-w-4xl">
            <motion.div
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="inline-flex items-center gap-2 rounded-full border border-[#F6D76A]/20 bg-[#F6D76A]/10 px-4 py-2 text-xs font-black text-[#F6D76A]"
            >
              <Sparkles size={14} />
              AI-PERSONALIZED LEARNING
            </motion.div>

            <motion.h1
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.1,
              }}
              className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              Upload a PDF.
              <span className="block text-[#F6D76A]">
                Get your learning path.
              </span>
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
              className="mt-5 max-w-3xl text-base leading-7 text-white/55 sm:text-lg"
            >
              STATWISE AI analyzes your learning
              material, identifies important
              competencies, and creates a
              personalized learning roadmap based
              on your profile and performance.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ========================================================
          PDF GENERATOR
      ======================================================== */}

      {!learningPath && (
        <section className="mx-auto max-w-[1500px] px-5 py-10 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            {/* PDF UPLOAD */}

            <motion.div
              initial={{
                opacity: 0,
                y: 25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="rounded-[2rem] border border-black/8 bg-white p-6 shadow-xl lg:p-8"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F6D76A]/30">
                  <UploadCloud size={23} />
                </div>

                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-gray-400">
                    Step 1
                  </div>

                  <h2 className="text-2xl font-black">
                    Upload learning material
                  </h2>
                </div>
              </div>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Upload the PDF you want STATWISE AI
                to analyze and convert into a
                personalized learning journey.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileInput}
                className="hidden"
              />

              <motion.div
                whileHover={{
                  scale: 1.01,
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() =>
                  setIsDragging(false)
                }
                onDrop={handleDrop}
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className={`mt-7 cursor-pointer rounded-3xl border-2 border-dashed p-10 text-center transition ${
                  isDragging
                    ? "border-[#F6D76A] bg-[#F6D76A]/10"
                    : "border-black/10 bg-[#fffdf5] hover:border-black/20"
                }`}
              >
                <motion.div
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                  }}
                  className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#172033] text-[#F6D76A]"
                >
                  <FileText size={35} />
                </motion.div>

                <h3 className="mt-5 text-lg font-black">
                  {selectedFile
                    ? "PDF ready for analysis"
                    : "Drop your PDF here"}
                </h3>

                <p className="mt-2 text-sm text-gray-400">
                  {selectedFile
                    ? selectedFile.name
                    : "or click to browse from your computer"}
                </p>

                <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#F6D76A] px-5 py-3 text-sm font-black text-[#172033]">
                  <UploadCloud size={17} />
                  {selectedFile
                    ? "Change PDF"
                    : "Choose PDF"}
                </div>

                <div className="mt-4 text-[11px] font-semibold text-gray-400">
                  PDF files only
                </div>
              </motion.div>

              {selectedFile && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="mt-5 flex items-center gap-3 rounded-2xl bg-[#172033] p-4 text-white"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F6D76A] text-[#172033]">
                    <FileText size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-black">
                      {selectedFile.name}
                    </div>

                    <div className="mt-1 text-[11px] text-white/40">
                      {(
                        selectedFile.size /
                        1024 /
                        1024
                      ).toFixed(2)}{" "}
                      MB
                    </div>
                  </div>

                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedFile(null);

                      if (
                        fileInputRef.current
                      ) {
                        fileInputRef.current.value =
                          "";
                      }
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20"
                  >
                    <X size={17} />
                  </button>
                </motion.div>
              )}
            </motion.div>

            {/* PROFILE */}

            <motion.div
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
              className="rounded-[2rem] border border-black/8 bg-white p-6 shadow-xl lg:p-8"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F6D76A]/30">
                  <Target size={23} />
                </div>

                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-gray-400">
                    Step 2
                  </div>

                  <h2 className="text-2xl font-black">
                    Your learning profile
                  </h2>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                {/* ROLE */}

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-400">
                    Role
                  </label>

                  <select
                    value={role}
                    onChange={(event) =>
                      setRole(event.target.value)
                    }
                    className="w-full rounded-xl border border-black/10 bg-[#fffdf5] px-4 py-3 text-sm font-semibold outline-none focus:border-[#F6D76A]"
                  >
                    <option>
                      Statistical Officer
                    </option>

                    <option>
                      Data Analyst
                    </option>

                    <option>
                      Research Officer
                    </option>
                  </select>
                </div>

                {/* ASSESSMENT */}

                <div>
                  <div className="mb-2 flex justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-gray-400">
                      Assessment Score
                    </label>

                    <span className="font-black">
                      {assessmentScore}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={assessmentScore}
                    onChange={(event) =>
                      setAssessmentScore(
                        Number(
                          event.target.value
                        )
                      )
                    }
                    className="w-full accent-[#172033]"
                  />
                </div>

                {/* QUIZ */}

                <div>
                  <div className="mb-2 flex justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-gray-400">
                      Quiz Accuracy
                    </label>

                    <span className="font-black">
                      {quizAccuracy}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={quizAccuracy}
                    onChange={(event) =>
                      setQuizAccuracy(
                        Number(
                          event.target.value
                        )
                      )
                    }
                    className="w-full accent-[#172033]"
                  />
                </div>

                {/* EXPERIENCE */}

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-400">
                    Years of Experience
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={yearsExperience}
                    onChange={(event) =>
                      setYearsExperience(
                        Number(
                          event.target.value
                        )
                      )
                    }
                    className="w-full rounded-xl border border-black/10 bg-[#fffdf5] px-4 py-3 text-sm font-semibold outline-none focus:border-[#F6D76A]"
                  />
                </div>

                {/* GOAL */}

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-400">
                    Learning Goal
                  </label>

                  <textarea
                    value={learningGoal}
                    onChange={(event) =>
                      setLearningGoal(
                        event.target.value
                      )
                    }
                    rows={3}
                    className="w-full resize-none rounded-xl border border-black/10 bg-[#fffdf5] px-4 py-3 text-sm leading-6 outline-none focus:border-[#F6D76A]"
                  />
                </div>

                {/* GENERATE */}

                <motion.button
                  whileHover={{
                    scale: 1.02,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  onClick={
                    generateLearningPath
                  }
                  disabled={
                    isGenerating ||
                    !selectedFile
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#172033] py-4 text-sm font-black text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Sparkles size={18} />

                  {selectedFile
                    ? "Generate Personalized Learning Path"
                    : "Upload PDF to Continue"}

                  <ArrowRight size={17} />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ========================================================
          GENERATED PATH
      ======================================================== */}

      {learningPath && (
        <div id="learning-path-result">
          <LearningPathResult
            path={learningPath}
            filename={generatedFilename}
            onReset={resetGenerator}
          />
        </div>
      )}

      {/* ========================================================
          SKILL + COURSE LIBRARY
      ======================================================== */}

      {!learningPath && (
        <>
          {/* STATS */}

          <section className="mx-auto -mt-6 max-w-[1500px] px-5 lg:px-8">
            <div className="grid overflow-hidden rounded-3xl border border-black/8 bg-white shadow-xl sm:grid-cols-3">
              {[
                {
                  icon: BookOpen,
                  value: courses.length,
                  title: "Courses available",
                },
                {
                  icon: Target,
                  value: prioritySkills.length,
                  title: "Priority skill areas",
                },
                {
                  icon: TrendingUp,
                  value: "AI",
                  title: "Recommendation engine",
                },
              ].map(
                (stat, index) => {
                  const Icon =
                    stat.icon;

                  return (
                    <motion.div
                      key={stat.title}
                      initial={{
                        opacity: 0,
                        y: 10,
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
                      className="flex items-center gap-4 border-b border-black/5 p-5 last:border-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F6D76A]/25">
                        <Icon size={20} />
                      </div>

                      <div>
                        <div className="text-2xl font-black">
                          {stat.value}
                        </div>

                        <div className="text-xs text-gray-400">
                          {stat.title}
                        </div>
                      </div>
                    </motion.div>
                  );
                }
              )}
            </div>
          </section>

          {/* PRIORITY SKILLS */}

          {prioritySkills.length >
            0 && (
            <section className="mx-auto max-w-[1500px] px-5 pt-12 lg:px-8">
              <div className="rounded-[2rem] border border-black/8 bg-white p-6 shadow-sm lg:p-8">
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-[#172033]/40">
                      <Target size={15} />
                      AI Skill Gap Analysis
                    </div>

                    <h2 className="mt-2 text-2xl font-black">
                      Learning priorities for you
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      These areas have the largest gap between your current competency and target.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      navigate("/skills")
                    }
                    className="flex items-center gap-2 text-sm font-black"
                  >
                    View skill intelligence
                    <ArrowRight size={16} />
                  </button>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {prioritySkills.map(
                    (
                      skill,
                      index
                    ) => (
                      <motion.div
                        key={
                          skill.name
                        }
                        whileHover={{
                          y: -4,
                        }}
                        className="rounded-2xl bg-[#fffdf5] p-5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black">
                            {skill.name}
                          </span>

                          <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-black text-red-600">
                            GAP{" "}
                            {Math.round(
                              skill.gap
                            )}
                          </span>
                        </div>

                        <div className="mt-4 flex items-end justify-between">
                          <div>
                            <div className="text-2xl font-black">
                              {Math.round(
                                skill.current
                              )}
                              %
                            </div>

                            <div className="text-xs text-gray-400">
                              Current
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-black">
                              {Math.round(
                                skill.target
                              )}
                              %
                            </div>

                            <div className="text-xs text-gray-400">
                              Target
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200">
                          <motion.div
                            initial={{
                              width: 0,
                            }}
                            whileInView={{
                              width: `${Math.min(
                                100,
                                skill.target
                              )}%`,
                            }}
                            viewport={{
                              once: true,
                            }}
                            transition={{
                              duration: 1,
                              delay:
                                index *
                                0.1,
                            }}
                            className="h-full rounded-full bg-[#172033]"
                          />
                        </div>
                      </motion.div>
                    )
                  )}
                </div>
              </div>
            </section>
          )}

          {/* COURSES */}

          <main className="mx-auto max-w-[1500px] px-5 py-12 lg:px-8">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div>
                <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-[#172033]/40">
                  <Sparkles size={16} />
                  Recommended for you
                </div>

                <h2 className="mt-2 text-3xl font-black">
                  Your AI learning ecosystem
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Explore courses while STATWISE AI builds your personalized learning roadmap.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-[#F6D76A]/25 px-4 py-3 text-sm font-bold">
                <Zap size={16} />
                AI optimized
              </div>
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {aiRecommendations.map(
                (
                  course,
                  index
                ) => (
                  <CourseCard
                    key={
                      course?.id ||
                      course?.course_id ||
                      index
                    }
                    course={course}
                    index={index}
                    recommended
                    onOpen={
                      setSelectedCourse
                    }
                  />
                )
              )}
            </div>

            {/* ALL COURSES */}

            <section className="mt-16">
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-[#172033]/40">
                    <BookOpen size={16} />
                    Learning Library
                  </div>

                  <h2 className="mt-2 text-3xl font-black">
                    Explore all courses
                  </h2>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <Filter
                    size={17}
                    className="shrink-0 text-gray-400"
                  />

                  {categories.map(
                    (item) => (
                      <button
                        key={item}
                        onClick={() =>
                          setCategory(
                            item
                          )
                        }
                        className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-black transition ${
                          category ===
                          item
                            ? "bg-[#172033] text-white"
                            : "border border-black/8 bg-white text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* SEARCH */}

              <div className="mt-6 flex items-center rounded-2xl border border-black/8 bg-white p-2">
                <Search
                  size={19}
                  className="ml-3 text-gray-400"
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search courses..."
                  className="w-full bg-transparent px-3 py-3 text-sm outline-none"
                />
              </div>

              <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredCourses.map(
                  (
                    course,
                    index
                  ) => (
                    <CourseCard
                      key={
                        course?.id ||
                        course?.course_id ||
                        `course-${index}`
                      }
                      course={course}
                      index={index}
                      recommended={
                        index < 3
                      }
                      onOpen={
                        setSelectedCourse
                      }
                    />
                  )
                )}
              </div>

              {filteredCourses.length ===
                0 && (
                <div className="mt-7 rounded-3xl border border-dashed border-black/15 bg-white p-12 text-center">
                  <Search
                    className="mx-auto text-gray-300"
                    size={40}
                  />

                  <h3 className="mt-4 text-xl font-black">
                    No courses found
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    Try another search term or category.
                  </p>

                  <button
                    onClick={() => {
                      setSearch("");
                      setCategory(
                        "All"
                      );
                    }}
                    className="mt-5 rounded-xl bg-[#F6D76A] px-5 py-3 text-sm font-black"
                  >
                    Reset filters
                  </button>
                </div>
              )}
            </section>
          </main>
        </>
      )}

      {/* ========================================================
          COURSE MODAL
      ======================================================== */}

      <AnimatePresence>
        {selectedCourse && (
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
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#172033]/70 p-5 backdrop-blur-sm"
            onClick={() =>
              setSelectedCourse(null)
            }
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.92,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.92,
                y: 20,
              }}
              onClick={(event) =>
                event.stopPropagation()
              }
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl"
            >
              <div className="relative bg-[#172033] p-7 text-white">
                <button
                  onClick={() =>
                    setSelectedCourse(
                      null
                    )
                  }
                  className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20"
                >
                  <X size={18} />
                </button>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F6D76A] text-[#172033]">
                  <BookOpen size={25} />
                </div>

                <h2 className="mt-5 pr-10 text-3xl font-black">
                  {text(
                    selectedCourse?.title ||
                      selectedCourse?.name,
                    "Learning Course"
                  )}
                </h2>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold">
                    {text(
                      selectedCourse?.level,
                      "Intermediate"
                    )}
                  </span>

                  <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold">
                    {text(
                      selectedCourse?.duration,
                      "Self-paced"
                    )}
                  </span>
                </div>
              </div>

              <div className="p-7">
                <div className="flex items-center gap-3 rounded-2xl bg-[#F6D76A]/20 p-4">
                  <Sparkles size={21} />

                  <div>
                    <div className="text-sm font-black">
                      Why STATWISE AI recommends this
                    </div>

                    <div className="mt-1 text-xs leading-5 text-gray-500">
                      This course is part of your personalized learning ecosystem and can help strengthen your professional competency.
                    </div>
                  </div>
                </div>

                <h3 className="mt-7 text-lg font-black">
                  About this course
                </h3>

                <p className="mt-2 text-sm leading-7 text-gray-500">
                  {text(
                    selectedCourse?.description,
                    "This learning resource is designed to build practical knowledge and improve competency."
                  )}
                </p>

                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <Clock3 size={18} />

                    <div className="mt-3 text-xs text-gray-400">
                      Duration
                    </div>

                    <div className="mt-1 font-black">
                      {text(
                        selectedCourse?.duration,
                        "Self-paced"
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-gray-50 p-4">
                    <Target size={18} />

                    <div className="mt-3 text-xs text-gray-400">
                      Level
                    </div>

                    <div className="mt-1 font-black">
                      {text(
                        selectedCourse?.level,
                        "Intermediate"
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-gray-50 p-4">
                    <CheckCircle2 size={18} />

                    <div className="mt-3 text-xs text-gray-400">
                      Format
                    </div>

                    <div className="mt-1 font-black">
                      Online
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    toast.success(
                      "Course started successfully."
                    );

                    setSelectedCourse(
                      null
                    );
                  }}
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#172033] py-4 font-black text-white transition hover:bg-black"
                >
                  <Play
                    size={17}
                    fill="currentColor"
                  />
                  Start Learning
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================
          GENERATION OVERLAY
      ======================================================== */}

      <AnimatePresence>
        {isGenerating && (
          <GenerationOverlay />
        )}
      </AnimatePresence>
    </div>
  );
}