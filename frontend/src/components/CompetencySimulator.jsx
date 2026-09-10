import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  RotateCcw,
  TrendingUp,
  Target,
  Sparkles,
  Clock3,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";

import statwiseAnalysis from "../data/statwiseAnalysis";

function clamp(value, min = 0, max = 100) {
  return Math.min(Math.max(Number(value) || 0, min), max);
}

export default function CompetencySimulator() {
  const baseCompetency = Number(
    statwiseAnalysis?.competency_score ??
      statwiseAnalysis?.competencyScore ??
      65.18
  );

  const [learningHours, setLearningHours] = useState(10);
  const [trainingHours, setTrainingHours] = useState(12);
  const [assessmentScore, setAssessmentScore] = useState(65);
  const [quizAccuracy, setQuizAccuracy] = useState(65);

  const projectedCompetency = useMemo(() => {
    /*
      Scenario-based projection.

      This is intentionally labelled as a simulation,
      not as a live ML prediction.
    */

    const learningImpact = Math.min(
      learningHours * 0.35,
      12
    );

    const trainingImpact = Math.min(
      trainingHours * 0.18,
      8
    );

    const assessmentImpact =
      (assessmentScore - 50) * 0.12;

    const quizImpact =
      (quizAccuracy - 50) * 0.10;

    const projected =
      baseCompetency +
      learningImpact +
      trainingImpact +
      assessmentImpact +
      quizImpact;

    return Number(
      clamp(projected, 0, 100).toFixed(1)
    );
  }, [
    baseCompetency,
    learningHours,
    trainingHours,
    assessmentScore,
    quizAccuracy,
  ]);

  const improvement = Number(
    (projectedCompetency - baseCompetency).toFixed(1)
  );

  const getLevel = (score) => {
    if (score >= 85) return "Expert";
    if (score >= 70) return "Advanced";
    if (score >= 50) return "Intermediate";
    return "Beginner";
  };

  const level = getLevel(projectedCompetency);

  const resetSimulation = () => {
    setLearningHours(10);
    setTrainingHours(12);
    setAssessmentScore(65);
    setQuizAccuracy(65);
  };

  return (
    <div className="overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-sm">

      {/* Header */}
      <div className="bg-[#172033] p-6 text-white sm:p-7">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F6D76A] text-[#172033]">
              <BrainCircuit size={23} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">

                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#F6D76A]">
                  What-If Intelligence
                </p>

                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white/60">
                  Simulation
                </span>

              </div>

              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                What happens if you learn more?
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
                Adjust your learning behaviour and see how
                your projected competency could change.
              </p>
            </div>

          </div>

          <button
            onClick={resetSimulation}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <RotateCcw size={14} />
            Reset
          </button>

        </div>

      </div>


      {/* Main */}
      <div className="grid gap-8 p-6 lg:grid-cols-[1fr_0.8fr] sm:p-7">

        {/* Controls */}
        <div>

          <div className="mb-6">

            <div className="flex items-center gap-2">
              <Target size={17} />
              <h3 className="font-black">
                Scenario Inputs
              </h3>
            </div>

            <p className="mt-1 text-xs leading-5 text-gray-400">
              Change the variables below to explore a possible
              competency improvement scenario.
            </p>

          </div>


          {/* Learning Hours */}
          <SliderControl
            icon={Clock3}
            label="Learning Hours"
            value={learningHours}
            min={0}
            max={40}
            suffix=" hrs"
            onChange={setLearningHours}
          />


          {/* Training Hours */}
          <SliderControl
            icon={GraduationCap}
            label="Training Hours"
            value={trainingHours}
            min={0}
            max={40}
            suffix=" hrs"
            onChange={setTrainingHours}
          />


          {/* Assessment Score */}
          <SliderControl
            icon={Target}
            label="Assessment Score"
            value={assessmentScore}
            min={0}
            max={100}
            suffix="%"
            onChange={setAssessmentScore}
          />


          {/* Quiz Accuracy */}
          <SliderControl
            icon={CheckCircle2}
            label="Quiz Accuracy"
            value={quizAccuracy}
            min={0}
            max={100}
            suffix="%"
            onChange={setQuizAccuracy}
          />

        </div>


        {/* Result */}
        <div className="flex flex-col">

          <div className="rounded-[1.7rem] bg-[#fff8cf] p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-black uppercase tracking-[0.14em] text-gray-400">
                  Current
                </p>

                <p className="mt-2 text-3xl font-black">
                  {baseCompetency.toFixed(1)}
                </p>

              </div>

              <TrendingUp
                size={24}
                className="text-gray-400"
              />

            </div>


            <div className="my-5 h-px bg-black/10" />


            <div>

              <p className="text-xs font-black uppercase tracking-[0.14em] text-gray-400">
                Projected Competency
              </p>

              <div className="mt-2 flex items-end gap-2">

                <motion.span
                  key={projectedCompetency}
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="text-5xl font-black"
                >
                  {projectedCompetency.toFixed(1)}
                </motion.span>

                <span className="pb-2 text-sm font-bold text-gray-400">
                  / 100
                </span>

              </div>

            </div>


            {/* Improvement */}
            <div className="mt-5 flex items-center justify-between rounded-2xl bg-white px-4 py-3">

              <span className="text-xs font-bold text-gray-500">
                Potential Improvement
              </span>

              <span
                className={`text-sm font-black ${
                  improvement > 0
                    ? "text-emerald-600"
                    : improvement < 0
                    ? "text-red-500"
                    : "text-gray-500"
                }`}
              >
                {improvement > 0 ? "+" : ""}
                {improvement} points
              </span>

            </div>

          </div>


          {/* Level */}
          <div className="mt-4 rounded-3xl border border-black/8 p-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F6D76A]">
                <Sparkles size={18} />
              </div>

              <div>

                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Projected Level
                </p>

                <p className="text-lg font-black">
                  {level}
                </p>

              </div>

            </div>


            {/* Progress */}
            <div className="mt-5">

              <div className="h-3 overflow-hidden rounded-full bg-gray-100">

                <motion.div
                  initial={{
                    width: `${baseCompetency}%`,
                  }}
                  animate={{
                    width: `${projectedCompetency}%`,
                  }}
                  transition={{
                    duration: 0.5,
                  }}
                  className="h-full rounded-full bg-[#F6D76A]"
                />

              </div>

              <div className="mt-2 flex justify-between text-[9px] font-bold text-gray-400">

                <span>BEGINNER</span>
                <span>INTERMEDIATE</span>
                <span>ADVANCED</span>
                <span>EXPERT</span>

              </div>

            </div>

          </div>


          {/* Explanation */}
          <div className="mt-4 rounded-3xl bg-[#172033] p-5 text-white">

            <div className="flex items-start gap-3">

              <Sparkles
                size={17}
                className="mt-0.5 shrink-0 text-[#F6D76A]"
              />

              <p className="text-xs leading-6 text-white/60">

                {improvement > 10
                  ? "This scenario indicates a strong potential improvement. Consistent learning, training, and assessment practice could significantly strengthen the competency profile."
                  : improvement > 0
                  ? "This scenario indicates gradual competency improvement. Increasing focused learning and assessment performance can create a stronger outcome."
                  : "Try increasing learning hours or assessment performance to explore a stronger competency scenario."}

              </p>

            </div>

          </div>

        </div>

      </div>


      {/* Disclaimer */}
      <div className="border-t border-black/5 bg-gray-50 px-6 py-4 sm:px-7">

        <p className="text-[10px] leading-5 text-gray-400">
          <strong className="text-gray-500">
            Simulation note:
          </strong>{" "}
          This is a scenario-based projection for the
          prototype. It is not a live prediction from the
          production ML model. Once the backend prediction
          API is connected, these projections can be replaced
          with model-generated results.
        </p>

      </div>

    </div>
  );
}


// ============================================================
// SLIDER COMPONENT
// ============================================================

function SliderControl({
  icon: Icon,
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}) {
  return (
    <div className="mb-7">

      <div className="mb-3 flex items-center justify-between gap-4">

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100">
            <Icon size={16} />
          </div>

          <span className="text-sm font-black">
            {label}
          </span>

        </div>

        <span className="rounded-xl bg-[#fff3b0] px-3 py-1.5 text-xs font-black">
          {value}
          {suffix}
        </span>

      </div>


      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) =>
          onChange(Number(event.target.value))
        }
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-[#F6D76A]"
      />

      <div className="mt-1 flex justify-between text-[9px] font-bold text-gray-300">
        <span>
          {min}
          {suffix}
        </span>

        <span>
          {max}
          {suffix}
        </span>
      </div>

    </div>
  );
}