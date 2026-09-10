import { motion } from "framer-motion";
import {
  BrainCircuit,
  CheckCircle2,
  Circle,
  Loader2,
  Target,
  BookOpen,
  GraduationCap,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const agents = [
  {
    id: 1,
    name: "Assessment Agent",
    description: "Analyzing learner assessment responses",
    icon: BrainCircuit,
  },
  {
    id: 2,
    name: "Skill Gap Agent",
    description: "Identifying competency gaps and priorities",
    icon: Target,
  },
  {
    id: 3,
    name: "Learning Agent",
    description: "Selecting personalized learning resources",
    icon: BookOpen,
  },
  {
    id: 4,
    name: "Competency Agent",
    description: "Updating the learner competency profile",
    icon: GraduationCap,
  },
  {
    id: 5,
    name: "Tutor Agent",
    description: "Preparing targeted AI learning assistance",
    icon: Sparkles,
  },
  {
    id: 6,
    name: "Progress Agent",
    description: "Updating continuous learning progress",
    icon: TrendingUp,
  },
];

export default function AgentActivity({
  activeAgent = 6,
  compact = false,
}) {
  return (
    <div
      className={`rounded-3xl border border-slate-200 bg-white shadow-sm ${
        compact ? "p-4" : "p-6"
      }`}
    >
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff3b0]">
            <BrainCircuit className="text-slate-900" size={23} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900">
                AI Agent Activity
              </h3>

              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Live
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              STATWISE AI orchestration layer
            </p>
          </div>
        </div>

        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500"
        />
      </div>

      {/* Agent Pipeline */}
      <div className="space-y-3">
        {agents.map((agent, index) => {
          const Icon = agent.icon;

          const completed = index + 1 < activeAgent;
          const active = index + 1 === activeAgent;

          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className={`relative flex items-center gap-4 rounded-2xl border p-4 transition ${
                active
                  ? "border-[#e5c84b] bg-[#fffbea]"
                  : completed
                  ? "border-slate-100 bg-slate-50"
                  : "border-slate-100 bg-white"
              }`}
            >
              {/* Connector */}
              {index !== agents.length - 1 && (
                <div className="absolute left-[27px] top-[57px] h-4 w-px bg-slate-200" />
              )}

              {/* Icon */}
              <div
                className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  completed
                    ? "bg-emerald-100 text-emerald-700"
                    : active
                    ? "bg-[#f6d76a] text-slate-900"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {completed ? (
                  <CheckCircle2 size={20} />
                ) : active ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Circle size={19} />
                )}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-900">
                    {agent.name}
                  </span>

                  {active && (
                    <span className="rounded-full bg-[#f6d76a] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-900">
                      Processing
                    </span>
                  )}

                  {completed && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                      Completed
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  {agent.description}
                </p>
              </div>

              {/* Step number */}
              <div className="hidden text-xs font-bold text-slate-300 sm:block">
                0{agent.id}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-5 rounded-2xl bg-slate-900 px-4 py-3">
        <div className="flex items-center gap-3">
          <Sparkles size={17} className="text-[#f6d76a]" />

          <p className="text-xs leading-relaxed text-slate-300">
            Multiple specialized AI agents collaborate to continuously
            evaluate skills, personalize learning, and update competency.
          </p>
        </div>
      </div>
    </div>
  );
}