import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Building2,
  BriefcaseBusiness,
  CalendarDays,
  MapPin,
  ShieldCheck,
  Award,
  BookOpen,
  Target,
  TrendingUp,
  BrainCircuit,
  Sparkles,
  Edit3,
  Download,
  CheckCircle2,
  Clock3,
  BarChart3,
  GraduationCap,
  ChevronRight,
  X,
  Save,
  Activity,
  FileText,
  BadgeCheck,
  Lightbulb,
  Star,
  ArrowUpRight,
  Settings,
  LockKeyhole,
} from "lucide-react";

import statwiseAnalysis from "../../data/statwiseAnalysis.js";

const fallbackSkills = [
  {
    skill: "Probability",
    current_score: 38,
    target_score: 80,
    gap: 42,
    priority: "High",
  },
  {
    skill: "Data Analysis",
    current_score: 58,
    target_score: 75,
    gap: 17,
    priority: "Medium",
  },
  {
    skill: "Statistics",
    current_score: 82,
    target_score: 85,
    gap: 3,
    priority: "Low",
  },
  {
    skill: "Statistical Computing",
    current_score: 64,
    target_score: 65,
    gap: 1,
    priority: "Low",
  },
  {
    skill: "Data Visualization",
    current_score: 76,
    target_score: 70,
    gap: 0,
    priority: "Low",
  },
];

function AnimatedNumber({ value, suffix = "" }) {
  const numericValue = Number(value) || 0;

  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      {numericValue.toFixed(numericValue % 1 ? 2 : 0)}
      {suffix}
    </motion.span>
  );
}

function ScoreRing({ score }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (score / 100) * circumference;

  return (
    <div className="relative h-40 w-40">
      <svg className="h-full w-full -rotate-90">
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="10"
          fill="none"
        />

        <motion.circle
          cx="80"
          cy="80"
          r={radius}
          stroke="#F6D76A"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: progress }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <span className="text-4xl font-black">
          <AnimatedNumber value={score} />
        </span>
        <span className="text-xs text-white/60">Competency</span>
      </div>
    </div>
  );
}

function SkillProgress({ skill }) {
  const score = Number(skill.current_score || 0);
  const target = Number(skill.target_score || 0);

  const priorityStyles = {
    High: "bg-red-50 text-red-600 border-red-100",
    Medium: "bg-orange-50 text-orange-600 border-orange-100",
    Low: "bg-green-50 text-green-600 border-green-100",
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-[#172033]">{skill.skill}</h3>
          <p className="mt-1 text-xs text-gray-500">
            Target score: {target}
          </p>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-bold ${
            priorityStyles[skill.priority] ||
            "bg-gray-50 text-gray-600 border-gray-100"
          }`}
        >
          {skill.priority || "Normal"}
        </span>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex justify-between text-xs font-semibold">
          <span className="text-gray-500">Current competency</span>
          <span className="text-[#172033]">{score}%</span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(score, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full bg-[#F6D76A]"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          Gap: {Number(skill.gap || 0)} points
        </span>

        <span className="flex items-center gap-1 text-xs font-bold text-[#172033]">
          View details
          <ChevronRight size={14} />
        </span>
      </div>
    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value, subtitle }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF5C7] text-[#172033]">
          <Icon size={21} />
        </div>

        <ArrowUpRight size={17} className="text-gray-300" />
      </div>

      <div className="mt-5">
        <div className="text-2xl font-black text-[#172033]">{value}</div>
        <div className="mt-1 text-sm font-semibold text-gray-600">
          {label}
        </div>
        <div className="mt-1 text-xs text-gray-400">{subtitle}</div>
      </div>
    </motion.div>
  );
}

function SectionTitle({ icon: Icon, title, description }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F6D76A] text-[#172033]">
          <Icon size={19} />
        </div>

        <div>
          <h2 className="text-xl font-black text-[#172033]">{title}</h2>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Profile() {
  const [editOpen, setEditOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const employee = statwiseAnalysis.employee || {};
  const competency = statwiseAnalysis.competency || {};

  const role =
    employee.role ||
    statwiseAnalysis.role ||
    "Statistical Officer";

  const department =
    employee.department ||
    "Data & Statistics Division";

  const experience =
    employee.experience ??
    3;

  const competencyScore =
    Number(competency.competency_score) || 65.18;

  const competencyLevel =
    competency.competency_level || "Intermediate";

  const skills = useMemo(() => {
    return Array.isArray(statwiseAnalysis.skills)
      ? statwiseAnalysis.skills
      : fallbackSkills;
  }, []);

  const learning = statwiseAnalysis.learning_progress || {};
  const assessment = statwiseAnalysis.assessment || {};

  const employeeName =
    employee.name || "Aarav Sharma";

  const employeeId =
    employee.employee_id || "EMP001";

  const profileCompletion = 92;

  const handleSave = () => {
    setSaved(true);
    setEditOpen(false);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const handleExport = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#fffdf5] text-[#172033]">

      {/* ================= TOP GOVERNMENT BAR ================= */}

      <div className="bg-[#172033] px-6 py-2.5 text-xs text-white/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} />
            Government Workforce Skill Intelligence Platform
          </div>

          <div className="hidden items-center gap-5 md:flex">
            <span>Digital India Ready</span>
            <span>•</span>
            <span>Secure Profile</span>
          </div>
        </div>
      </div>

      {/* ================= HEADER ================= */}

      <header className="border-b border-black/5 bg-[#F6D76A]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#172033] text-[#F6D76A] shadow-lg">
              <BrainCircuit size={25} />
            </div>

            <div>
              <div className="text-xl font-black tracking-tight">
                STATWISE AI
              </div>
              <div className="text-xs font-semibold text-[#172033]/60">
                Intelligent Workforce Profile
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="hidden items-center gap-2 rounded-xl bg-white/70 px-4 py-2.5 text-sm font-bold transition hover:bg-white md:flex"
            >
              <Download size={16} />
              Export
            </button>

            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-[#172033] px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5"
            >
              <Edit3 size={16} />
              Edit Profile
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 md:px-6">

        {/* ================= PROFILE HERO ================= */}

        <motion.section
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2rem] bg-[#172033] p-6 text-white shadow-2xl md:p-9"
        >

          {/* Animated background */}

          <motion.div
            animate={{
              x: [0, 80, 0],
              y: [0, -40, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#F6D76A]/15 blur-3xl"
          />

          <motion.div
            animate={{
              x: [0, -70, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-blue-400/10 blur-3xl"
          />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto]">

            <div className="flex flex-col gap-7 md:flex-row md:items-center">

              {/* Avatar */}

              <motion.div
                whileHover={{ scale: 1.05, rotate: 2 }}
                className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-[2rem] bg-[#F6D76A] text-4xl font-black text-[#172033] shadow-xl"
              >
                {employeeName
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)}

                <div className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border-4 border-[#172033] bg-green-500">
                  <CheckCircle2 size={17} />
                </div>
              </motion.div>

              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-[#F6D76A]">
                  <BadgeCheck size={14} />
                  Verified Professional Profile
                </div>

                <h1 className="text-3xl font-black md:text-4xl">
                  {employeeName}
                </h1>

                <p className="mt-2 text-lg font-semibold text-white/80">
                  {role}
                </p>

                <div className="mt-5 flex flex-wrap gap-3 text-sm text-white/60">
                  <span className="flex items-center gap-2">
                    <Building2 size={15} />
                    {department}
                  </span>

                  <span className="flex items-center gap-2">
                    <BriefcaseBusiness size={15} />
                    {experience} years experience
                  </span>

                  <span className="flex items-center gap-2">
                    <ShieldCheck size={15} />
                    ID: {employeeId}
                  </span>
                </div>
              </div>
            </div>

            {/* Score */}

            <div className="flex items-center justify-center lg:pr-8">
              <div className="text-center">
                <ScoreRing score={competencyScore} />

                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold">
                  <TrendingUp size={14} className="text-[#F6D76A]" />
                  {competencyLevel} Level
                </div>
              </div>
            </div>
          </div>

          {/* Profile completion */}

          <div className="relative mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">
                  Profile completeness
                </p>
                <p className="mt-1 text-xs text-white/50">
                  Complete your profile to unlock better personalization.
                </p>
              </div>

              <span className="text-lg font-black text-[#F6D76A]">
                {profileCompletion}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${profileCompletion}%` }}
                transition={{ duration: 1.2 }}
                className="h-full rounded-full bg-[#F6D76A]"
              />
            </div>
          </div>
        </motion.section>

        {/* ================= QUICK STATS ================= */}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            icon={Target}
            label="Competency Score"
            value={`${competencyScore.toFixed(1)}%`}
            subtitle="AI evaluated"
          />

          <StatCard
            icon={BookOpen}
            label="Courses Completed"
            value={learning.courses_completed || 1}
            subtitle={`${learning.courses_started || 2} courses started`}
          />

          <StatCard
            icon={Clock3}
            label="Learning Hours"
            value={`${learning.learning_hours || 8}h`}
            subtitle={`Weekly goal ${learning.weekly_goal || 10}h`}
          />

          <StatCard
            icon={BarChart3}
            label="Assessment Score"
            value={`${assessment.latest_score || 72}%`}
            subtitle={`${assessment.assessment_attempts || 3} attempts`}
          />
        </section>

        {/* ================= MAIN GRID ================= */}

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_1fr]">

          {/* LEFT */}

          <div className="space-y-10">

            {/* Personal information */}

            <section>
              <SectionTitle
                icon={User}
                title="Professional Information"
                description="Your official workforce profile details"
              />

              <div className="grid gap-4 sm:grid-cols-2">

                {[
                  {
                    icon: User,
                    label: "Full Name",
                    value: employeeName,
                  },
                  {
                    icon: BriefcaseBusiness,
                    label: "Designation",
                    value: role,
                  },
                  {
                    icon: Building2,
                    label: "Department",
                    value: department,
                  },
                  {
                    icon: CalendarDays,
                    label: "Experience",
                    value: `${experience} years`,
                  },
                  {
                    icon: Mail,
                    label: "Official Email",
                    value: `${employeeName
                      .toLowerCase()
                      .replace(" ", ".")}@gov.in`,
                  },
                  {
                    icon: MapPin,
                    label: "Work Location",
                    value: "Government of India",
                  },
                ].map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -3 }}
                      className="flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-5 shadow-sm"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF5C7]">
                        <Icon size={19} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          {item.label}
                        </p>

                        <p className="mt-1 truncate font-bold text-[#172033]">
                          {item.value}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* Skills */}

            <section>
              <SectionTitle
                icon={BrainCircuit}
                title="Competency Profile"
                description="AI-powered view of your current skill levels"
              />

              <div className="grid gap-4">
                {skills.map((skill) => (
                  <SkillProgress
                    key={skill.skill}
                    skill={skill}
                  />
                ))}
              </div>
            </section>

            {/* Learning activity */}

            <section>
              <SectionTitle
                icon={Activity}
                title="Learning Activity"
                description="Your recent professional development journey"
              />

              <div className="relative ml-3 border-l-2 border-[#F6D76A]/60 pl-8">

                {[
                  {
                    icon: CheckCircle2,
                    title: "Completed Probability Fundamentals",
                    text: "Course completion recorded",
                    time: "Recently",
                  },
                  {
                    icon: FileText,
                    title: "Completed Competency Assessment",
                    text: `Scored ${assessment.latest_score || 72}%`,
                    time: "Recent assessment",
                  },
                  {
                    icon: BrainCircuit,
                    title: "AI Skill Analysis Updated",
                    text: "Probability identified as priority skill",
                    time: "System analysis",
                  },
                  {
                    icon: GraduationCap,
                    title: "Learning Path Generated",
                    text: "Personalized path created by STATWISE AI",
                    time: "AI recommendation",
                  },
                ].map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: -15 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="relative mb-8"
                    >
                      <div className="absolute -left-[47px] flex h-9 w-9 items-center justify-center rounded-full border-4 border-[#fffdf5] bg-[#F6D76A] text-[#172033]">
                        <Icon size={15} />
                      </div>

                      <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-bold">
                              {item.title}
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                              {item.text}
                            </p>
                          </div>

                          <span className="shrink-0 text-xs font-semibold text-gray-400">
                            {item.time}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* RIGHT */}

          <div className="space-y-6">

            {/* AI insight */}

            <motion.section
              whileHover={{ y: -3 }}
              className="overflow-hidden rounded-3xl bg-[#172033] p-6 text-white shadow-xl"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F6D76A] text-[#172033]"
                >
                  <Sparkles size={20} />
                </motion.div>

                <div>
                  <h2 className="font-black">AI Profile Insight</h2>
                  <p className="text-xs text-white/50">
                    Personalized intelligence
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm leading-7 text-white/75">
                  Your current competency is at the{" "}
                  <strong className="text-[#F6D76A]">
                    {competencyLevel}
                  </strong>{" "}
                  level. STATWISE AI identifies{" "}
                  <strong className="text-white">
                    Probability
                  </strong>{" "}
                  as your highest-priority improvement area.
                </p>
              </div>

              <button
                onClick={() => {
                  window.location.href = "/skills";
                }}
                className="mt-6 flex w-full items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm font-bold transition hover:bg-white/15"
              >
                View Skill Intelligence
                <ChevronRight size={17} />
              </button>
            </motion.section>

            {/* Achievement */}

            <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF5C7]">
                    <Award size={19} />
                  </div>

                  <div>
                    <h2 className="font-black">
                      Achievements
                    </h2>
                    <p className="text-xs text-gray-400">
                      Professional milestones
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-600">
                  3 earned
                </span>
              </div>

              <div className="mt-6 space-y-3">

                {[
                  {
                    icon: GraduationCap,
                    title: "Learning Starter",
                    text: "Started personalized learning",
                  },
                  {
                    icon: Target,
                    title: "Assessment Ready",
                    text: "Completed competency assessment",
                  },
                  {
                    icon: Star,
                    title: "Skill Explorer",
                    text: "Explored AI skill intelligence",
                  },
                ].map((achievement) => {
                  const Icon = achievement.icon;

                  return (
                    <motion.div
                      whileHover={{ x: 4 }}
                      key={achievement.title}
                      className="flex items-center gap-3 rounded-xl bg-[#fffdf5] p-3"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F6D76A]">
                        <Icon size={17} />
                      </div>

                      <div>
                        <p className="text-sm font-bold">
                          {achievement.title}
                        </p>

                        <p className="text-xs text-gray-400">
                          {achievement.text}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* Learning progress */}

            <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF5C7]">
                  <TrendingUp size={19} />
                </div>

                <div>
                  <h2 className="font-black">
                    Learning Progress
                  </h2>

                  <p className="text-xs text-gray-400">
                    Weekly development goal
                  </p>
                </div>
              </div>

              <div className="mt-7 text-center">
                <div className="text-4xl font-black">
                  {learning.weekly_progress || 8}
                  <span className="text-lg text-gray-400">
                    /{learning.weekly_goal || 10}h
                  </span>
                </div>

                <p className="mt-1 text-xs text-gray-400">
                  Learning completed this week
                </p>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(
                      ((learning.weekly_progress || 8) /
                        (learning.weekly_goal || 10)) *
                        100,
                      100
                    )}%`,
                  }}
                  transition={{ duration: 1.2 }}
                  className="h-full rounded-full bg-[#F6D76A]"
                />
              </div>

              <div className="mt-4 flex justify-between text-xs">
                <span className="text-gray-400">
                  Keep going!
                </span>

                <span className="font-bold">
                  {Math.round(
                    ((learning.weekly_progress || 8) /
                      (learning.weekly_goal || 10)) *
                      100
                  )}
                  %
                </span>
              </div>
            </section>

            {/* Security */}

            <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <LockKeyhole size={19} />
                </div>

                <div>
                  <h2 className="font-black">
                    Profile Security
                  </h2>

                  <p className="text-xs text-gray-400">
                    Account protection
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">

                <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
                  <span className="text-sm font-semibold">
                    Profile verification
                  </span>

                  <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                    <CheckCircle2 size={14} />
                    Verified
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
                  <span className="text-sm font-semibold">
                    Secure access
                  </span>

                  <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                    <ShieldCheck size={14} />
                    Active
                  </span>
                </div>

              </div>

              <button
                onClick={() => {
                  window.location.href = "/settings";
                }}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 px-4 py-3 text-sm font-bold transition hover:bg-gray-50"
              >
                <Settings size={16} />
                Manage Settings
              </button>
            </section>

          </div>
        </div>

        {/* ================= CAREER CTA ================= */}

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mt-10 overflow-hidden rounded-3xl bg-[#F6D76A] p-7 md:p-9"
        >

          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[35px] border-[#172033]/5"
          />

          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">

            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-bold">
                <Lightbulb size={18} />
                AI-Powered Career Development
              </div>

              <h2 className="text-2xl font-black md:text-3xl">
                Continue building your professional competency
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#172033]/65">
                Follow your personalized learning path, close priority
                skill gaps and continuously improve your workforce profile.
              </p>
            </div>

            <button
              onClick={() => {
                window.location.href = "/learning";
              }}
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#172033] px-6 py-3.5 font-bold text-white transition hover:-translate-y-1"
            >
              Open Learning Path
              <ArrowUpRight size={17} />
            </button>
          </div>
        </motion.section>

      </main>

      {/* ================= EDIT MODAL ================= */}

      <AnimatePresence>
        {editOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#172033]/60 p-5 backdrop-blur-sm"
          >

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl md:p-8"
            >

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black">
                    Edit Professional Profile
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Update your profile information
                  </p>
                </div>

                <button
                  onClick={() => setEditOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 transition hover:bg-gray-200"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">

                {[
                  ["Full Name", employeeName],
                  ["Employee ID", employeeId],
                  ["Designation", role],
                  ["Department", department],
                  ["Experience", `${experience} years`],
                  ["Work Location", "Government of India"],
                ].map(([label, value]) => (
                  <label key={label}>
                    <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-400">
                      {label}
                    </span>

                    <input
                      defaultValue={value}
                      className="w-full rounded-xl border border-black/10 bg-[#fffdf5] px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#F6D76A] focus:ring-4 focus:ring-[#F6D76A]/20"
                    />
                  </label>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-[#F6D76A]/40 bg-[#FFF9DC] p-4">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 shrink-0" size={18} />

                  <p className="text-xs leading-5 text-[#172033]/70">
                    Some official workforce identifiers may require
                    organizational verification before they can be changed.
                  </p>
                </div>
              </div>

              <div className="mt-7 flex justify-end gap-3">

                <button
                  onClick={() => setEditOpen(false)}
                  className="rounded-xl border border-black/10 px-5 py-3 text-sm font-bold"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 rounded-xl bg-[#172033] px-5 py-3 text-sm font-bold text-white"
                >
                  <Save size={16} />
                  Save Changes
                </button>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= SAVE TOAST ================= */}

      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-2xl bg-[#172033] px-5 py-4 text-sm font-bold text-white shadow-2xl"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
              <CheckCircle2 size={16} />
            </div>

            Profile updated successfully
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default Profile;