import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Brain,
  Check,
  ChevronRight,
  Clock3,
  Download,
  FileText,
  Globe,
  KeyRound,
  Lock,
  LogOut,
  Monitor,
  Moon,
  Palette,
  Save,
  Shield,
  Sparkles,
  Sun,
  Trash2,
  User,
  Volume2,
  X,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";


// ------------------------------------------------------------
// ANIMATION VARIANTS
// ------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 25,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};


// ------------------------------------------------------------
// TOGGLE COMPONENT
// ------------------------------------------------------------

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative h-7 w-12 rounded-full transition-all duration-300 ${
        enabled ? "bg-[#172033]" : "bg-slate-300"
      }`}
      aria-label="Toggle setting"
    >
      <motion.div
        animate={{
          x: enabled ? 20 : 2,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
        className="absolute top-1 h-5 w-5 rounded-full bg-white shadow-md"
      />
    </button>
  );
}


// ------------------------------------------------------------
// SETTING ROW
// ------------------------------------------------------------

function SettingRow({
  icon: Icon,
  title,
  description,
  children,
}) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ x: 3 }}
      className="flex items-center justify-between gap-5 border-b border-slate-100 py-5 last:border-b-0"
    >
      <div className="flex min-w-0 items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fff8d8] text-[#172033]">
          <Icon size={20} />
        </div>

        <div>
          <h4 className="font-semibold text-[#172033]">
            {title}
          </h4>

          <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="shrink-0">
        {children}
      </div>
    </motion.div>
  );
}


// ------------------------------------------------------------
// SECTION
// ------------------------------------------------------------

function Section({
  icon: Icon,
  title,
  description,
  children,
}) {
  return (
    <motion.section
      variants={itemVariants}
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-100 bg-gradient-to-r from-[#fffdf0] to-white px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f6d76a] text-[#172033]">
            <Icon size={21} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#172033]">
              {title}
            </h2>

            <p className="text-sm text-slate-500">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6">
        {children}
      </div>
    </motion.section>
  );
}


// ------------------------------------------------------------
// MODAL
// ------------------------------------------------------------

function Modal({
  open,
  title,
  description,
  children,
  onClose,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#172033]/60 px-4 backdrop-blur-sm"
          onClick={onClose}
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
            transition={{
              duration: 0.25,
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div>
                <h3 className="text-xl font-bold text-[#172033]">
                  {title}
                </h3>

                {description && (
                  <p className="mt-1 text-sm text-slate-500">
                    {description}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-[#172033]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


// ------------------------------------------------------------
// MAIN SETTINGS PAGE
// ------------------------------------------------------------

export default function Settings() {
  const navigate = useNavigate();

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [learningReminders, setLearningReminders] = useState(true);
  const [assessmentAlerts, setAssessmentAlerts] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(false);

  // AI preferences
  const [aiRecommendations, setAiRecommendations] = useState(true);
  const [adaptiveLearning, setAdaptiveLearning] = useState(true);
  const [aiTutorSuggestions, setAiTutorSuggestions] = useState(true);
  const [autoGenerateQuizzes, setAutoGenerateQuizzes] = useState(false);

  // Accessibility
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [soundEffects, setSoundEffects] = useState(false);

  // Privacy
  const [activityTracking, setActivityTracking] = useState(true);
  const [personalizedAnalytics, setPersonalizedAnalytics] = useState(true);

  // Appearance
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("English");

  // Modals
  const [deleteModal, setDeleteModal] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [sessionsModal, setSessionsModal] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Save
  const [saving, setSaving] = useState(false);


  // ----------------------------------------------------------
  // SAVE SETTINGS
  // ----------------------------------------------------------

  const saveSettings = async () => {
    setSaving(true);

    await new Promise((resolve) => {
      setTimeout(resolve, 900);
    });

    setSaving(false);

    toast.success("Settings saved successfully");
  };


  // ----------------------------------------------------------
  // DOWNLOAD DATA
  // ----------------------------------------------------------

  const downloadData = () => {
    const data = {
      platform: "STATWISE AI",
      settings: {
        notifications: {
          emailNotifications,
          learningReminders,
          assessmentAlerts,
          weeklySummary,
        },

        aiPreferences: {
          aiRecommendations,
          adaptiveLearning,
          aiTutorSuggestions,
          autoGenerateQuizzes,
        },

        accessibility: {
          reducedMotion,
          highContrast,
          soundEffects,
        },

        privacy: {
          activityTracking,
          personalizedAnalytics,
        },

        appearance: {
          theme,
          language,
        },
      },
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      {
        type: "application/json",
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "statwise-ai-settings.json";
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    toast.success("Settings data downloaded");
  };


  // ----------------------------------------------------------
  // CHANGE PASSWORD
  // ----------------------------------------------------------

  const changePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all password fields");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must contain at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setPasswordModal(false);

    toast.success("Password updated successfully");
  };


  // ----------------------------------------------------------
  // LOGOUT
  // ----------------------------------------------------------

  const logout = () => {
    setLogoutModal(false);

    toast.success("Logged out successfully");

    setTimeout(() => {
      navigate("/login");
    }, 700);
  };


  // ----------------------------------------------------------
  // DELETE ACCOUNT
  // ----------------------------------------------------------

  const deleteAccount = () => {
    setDeleteModal(false);

    toast.error(
      "Demo mode: account deletion is disabled"
    );
  };


  return (
    <div className="min-h-screen bg-[#fffdf5] text-[#172033]">

      {/* =====================================================
          TOP GOVERNMENT BAR
      ===================================================== */}

      <div className="bg-[#172033] px-4 py-2 text-xs text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <span>
            AI-Powered Skill Intelligence Platform
          </span>

          <div className="hidden items-center gap-5 sm:flex">
            <span>Accessibility</span>
            <span>Help</span>
            <span>English</span>
          </div>
        </div>
      </div>


      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-black/5 bg-[#f6d76a]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6">

          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#172033] text-white shadow-lg">
              <Brain size={23} />
            </div>

            <div className="text-left">
              <div className="text-lg font-black tracking-tight">
                STATWISE
              </div>

              <div className="-mt-1 text-[10px] font-semibold uppercase tracking-[0.25em]">
                AI
              </div>
            </div>
          </button>


          <nav className="hidden items-center gap-1 lg:flex">
            <button
              onClick={() => navigate("/")}
              className="rounded-xl px-4 py-2 text-sm font-semibold transition hover:bg-white/40"
            >
              Home
            </button>

            <button
              onClick={() => navigate("/learning")}
              className="rounded-xl px-4 py-2 text-sm font-semibold transition hover:bg-white/40"
            >
              Learning
            </button>

            <button
              onClick={() => navigate("/skills")}
              className="rounded-xl px-4 py-2 text-sm font-semibold transition hover:bg-white/40"
            >
              Skills
            </button>

            <button
              onClick={() => navigate("/assessments")}
              className="rounded-xl px-4 py-2 text-sm font-semibold transition hover:bg-white/40"
            >
              Assessments
            </button>

            <button
              onClick={() => navigate("/tutor")}
              className="rounded-xl px-4 py-2 text-sm font-semibold transition hover:bg-white/40"
            >
              AI Tutor
            </button>
          </nav>


          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="hidden items-center gap-2 rounded-xl bg-white/60 px-4 py-2 text-sm font-bold transition hover:bg-white md:flex"
            >
              <User size={17} />
              Profile
            </button>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#172033] text-sm font-bold text-white">
              AS
            </div>
          </div>

        </div>
      </header>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden bg-[#172033]">
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(246,215,106,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(246,215,106,.15) 1px, transparent 1px)",
              backgroundSize: "45px 45px",
            }}
          />
        </div>

        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
          }}
          className="absolute -right-20 -top-32 h-80 w-80 rounded-full bg-[#f6d76a] blur-3xl"
        />

        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.08, 0.18, 0.08],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: 1,
          }}
          className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-blue-400 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur">
              <Sparkles size={16} className="text-[#f6d76a]" />
              Personalized Platform Controls
            </div>

            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
              Settings &
              <span className="text-[#f6d76a]">
                {" "}Preferences
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Customize your STATWISE AI learning experience,
              notifications, AI recommendations, privacy,
              accessibility and security preferences.
            </p>
          </motion.div>

        </div>
      </section>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-8 lg:grid-cols-[1fr_340px]"
        >

          {/* =================================================
              LEFT COLUMN
          ================================================= */}

          <div className="space-y-8">


            {/* =================================================
                ACCOUNT STATUS
            ================================================= */}

            <motion.div
              variants={itemVariants}
              className="grid gap-4 sm:grid-cols-3"
            >

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Shield size={19} />
                  </div>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                    Active
                  </span>
                </div>

                <h3 className="mt-4 font-bold">
                  Account Status
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Your account is active and protected.
                </p>
              </div>


              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff8d8] text-[#172033]">
                  <Brain size={19} />
                </div>

                <h3 className="mt-4 font-bold">
                  AI Personalization
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  AI recommendations are enabled.
                </p>
              </div>


              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Lock size={19} />
                </div>

                <h3 className="mt-4 font-bold">
                  Security
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Account security settings are available.
                </p>
              </div>

            </motion.div>


            {/* =================================================
                NOTIFICATIONS
            ================================================= */}

            <Section
              icon={Bell}
              title="Notifications"
              description="Control how STATWISE AI keeps you informed."
            >

              <SettingRow
                icon={Bell}
                title="Email Notifications"
                description="Receive important platform updates and account notifications."
              >
                <Toggle
                  enabled={emailNotifications}
                  onChange={setEmailNotifications}
                />
              </SettingRow>


              <SettingRow
                icon={Clock3}
                title="Learning Reminders"
                description="Get reminders about your personalized learning activities."
              >
                <Toggle
                  enabled={learningReminders}
                  onChange={setLearningReminders}
                />
              </SettingRow>


              <SettingRow
                icon={FileText}
                title="Assessment Alerts"
                description="Receive notifications when assessments or competency checks are due."
              >
                <Toggle
                  enabled={assessmentAlerts}
                  onChange={setAssessmentAlerts}
                />
              </SettingRow>


              <SettingRow
                icon={Download}
                title="Weekly Learning Summary"
                description="Receive a weekly overview of your learning progress."
              >
                <Toggle
                  enabled={weeklySummary}
                  onChange={setWeeklySummary}
                />
              </SettingRow>

            </Section>


            {/* =================================================
                AI & LEARNING
            ================================================= */}

            <Section
              icon={Brain}
              title="AI & Learning Preferences"
              description="Configure how STATWISE AI personalizes your development."
            >

              <SettingRow
                icon={Sparkles}
                title="AI Recommendations"
                description="Allow STATWISE AI to recommend courses based on your competency gaps."
              >
                <Toggle
                  enabled={aiRecommendations}
                  onChange={setAiRecommendations}
                />
              </SettingRow>


              <SettingRow
                icon={Brain}
                title="Adaptive Learning"
                description="Automatically adjust learning recommendations based on your progress."
              >
                <Toggle
                  enabled={adaptiveLearning}
                  onChange={setAdaptiveLearning}
                />
              </SettingRow>


              <SettingRow
                icon={Sparkles}
                title="AI Tutor Suggestions"
                description="Allow the AI Tutor to suggest questions, resources and learning activities."
              >
                <Toggle
                  enabled={aiTutorSuggestions}
                  onChange={setAiTutorSuggestions}
                />
              </SettingRow>


              <SettingRow
                icon={FileText}
                title="Automatic Quiz Generation"
                description="Generate practice questions from available learning materials."
              >
                <Toggle
                  enabled={autoGenerateQuizzes}
                  onChange={setAutoGenerateQuizzes}
                />
              </SettingRow>

            </Section>


            {/* =================================================
                APPEARANCE
            ================================================= */}

            <Section
              icon={Palette}
              title="Appearance"
              description="Customize the visual experience of STATWISE AI."
            >

              <div className="py-6">

                <div className="mb-4">
                  <h4 className="font-semibold">
                    Theme
                  </h4>

                  <p className="mt-1 text-sm text-slate-500">
                    Choose your preferred interface appearance.
                  </p>
                </div>


                <div className="grid gap-3 sm:grid-cols-3">

                  {[
                    {
                      id: "light",
                      label: "Light",
                      icon: Sun,
                    },
                    {
                      id: "dark",
                      label: "Dark",
                      icon: Moon,
                    },
                    {
                      id: "system",
                      label: "System",
                      icon: Monitor,
                    },
                  ].map((option) => {
                    const Icon = option.icon;
                    const active = theme === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setTheme(option.id)}
                        className={`rounded-2xl border-2 p-4 text-left transition ${
                          active
                            ? "border-[#172033] bg-[#fff8d8]"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                            <Icon size={18} />
                          </div>

                          {active && (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#172033] text-white">
                              <Check size={14} />
                            </div>
                          )}
                        </div>

                        <div className="mt-3 font-semibold">
                          {option.label}
                        </div>
                      </button>
                    );
                  })}

                </div>

              </div>


              <div className="border-t border-slate-100 py-6">

                <div className="mb-4">
                  <h4 className="font-semibold">
                    Language
                  </h4>

                  <p className="mt-1 text-sm text-slate-500">
                    Select your preferred platform language.
                  </p>
                </div>


                <div className="relative max-w-sm">

                  <Globe
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-[#172033]"
                  >
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Telugu</option>
                  </select>

                  <ChevronRight
                    size={18}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400"
                  />

                </div>

              </div>

            </Section>


            {/* =================================================
                ACCESSIBILITY
            ================================================= */}

            <Section
              icon={Eye}
              title="Accessibility"
              description="Make STATWISE AI more comfortable and accessible."
            >

              <SettingRow
                icon={Monitor}
                title="Reduced Motion"
                description="Reduce interface animations and transitions."
              >
                <Toggle
                  enabled={reducedMotion}
                  onChange={setReducedMotion}
                />
              </SettingRow>


              <SettingRow
                icon={Eye}
                title="High Contrast"
                description="Increase visual contrast for improved readability."
              >
                <Toggle
                  enabled={highContrast}
                  onChange={setHighContrast}
                />
              </SettingRow>


              <SettingRow
                icon={Volume2}
                title="Sound Effects"
                description="Enable interface sounds for important interactions."
              >
                <Toggle
                  enabled={soundEffects}
                  onChange={setSoundEffects}
                />
              </SettingRow>

            </Section>


            {/* =================================================
                PRIVACY
            ================================================= */}

            <Section
              icon={Shield}
              title="Privacy & Data"
              description="Manage how your learning information is used."
            >

              <SettingRow
                icon={Clock3}
                title="Learning Activity Tracking"
                description="Use your learning activity to improve competency and recommendation accuracy."
              >
                <Toggle
                  enabled={activityTracking}
                  onChange={setActivityTracking}
                />
              </SettingRow>


              <SettingRow
                icon={Brain}
                title="Personalized Analytics"
                description="Allow analytics to personalize your learning dashboard and insights."
              >
                <Toggle
                  enabled={personalizedAnalytics}
                  onChange={setPersonalizedAnalytics}
                />
              </SettingRow>


              <motion.div
                variants={itemVariants}
                className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between"
              >

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fff8d8]">
                    <Download size={20} />
                  </div>

                  <div>
                    <h4 className="font-semibold">
                      Download Your Data
                    </h4>

                    <p className="mt-1 text-sm text-slate-500">
                      Download a copy of your current STATWISE AI preferences.
                    </p>
                  </div>

                </div>

                <button
                  type="button"
                  onClick={downloadData}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold transition hover:bg-slate-50"
                >
                  <Download size={17} />
                  Download
                </button>

              </motion.div>

            </Section>


            {/* =================================================
                SECURITY
            ================================================= */}

            <Section
              icon={Lock}
              title="Security"
              description="Protect your STATWISE AI account."
            >

              <SettingRow
                icon={KeyRound}
                title="Change Password"
                description="Update your account password regularly to keep your account secure."
              >
                <button
                  type="button"
                  onClick={() => setPasswordModal(true)}
                  className="rounded-xl bg-[#172033] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#26334b]"
                >
                  Change
                </button>
              </SettingRow>


              <SettingRow
                icon={Monitor}
                title="Active Sessions"
                description="Review devices currently associated with your account."
              >
                <button
                  type="button"
                  onClick={() => setSessionsModal(true)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold transition hover:bg-slate-50"
                >
                  View
                </button>
              </SettingRow>


              <SettingRow
                icon={LogOut}
                title="Sign Out"
                description="Sign out of your STATWISE AI account on this device."
              >
                <button
                  type="button"
                  onClick={() => setLogoutModal(true)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold transition hover:bg-slate-50"
                >
                  Sign Out
                </button>
              </SettingRow>

            </Section>


            {/* =================================================
                DANGER ZONE
            ================================================= */}

            <motion.section
              variants={itemVariants}
              className="overflow-hidden rounded-3xl border border-red-200 bg-white"
            >

              <div className="border-b border-red-100 bg-red-50 px-6 py-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600">
                    <Trash2 size={20} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-red-700">
                      Danger Zone
                    </h2>

                    <p className="text-sm text-red-600/80">
                      Actions in this section can affect your account.
                    </p>
                  </div>

                </div>

              </div>

              <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <h4 className="font-bold text-[#172033]">
                    Delete Account
                  </h4>

                  <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                    Permanently delete your account and associated platform data.
                    This action cannot be undone.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setDeleteModal(true)}
                  className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
                >
                  Delete Account
                </button>

              </div>

            </motion.section>


            {/* =================================================
                SAVE BUTTON
            ================================================= */}

            <motion.div
              variants={itemVariants}
              className="sticky bottom-4 z-20 flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur"
            >

              <div className="hidden items-center gap-3 sm:flex">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff8d8]">
                  <Save size={18} />
                </div>

                <div>
                  <p className="text-sm font-bold">
                    Save your preferences
                  </p>

                  <p className="text-xs text-slate-500">
                    Your settings are stored for this session.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={saveSettings}
                disabled={saving}
                className="ml-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#172033] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#26334b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Sparkles size={17} />
                    </motion.div>

                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Save Changes
                  </>
                )}
              </button>

            </motion.div>

          </div>


          {/* =================================================
              RIGHT SIDEBAR
          ================================================= */}

          <aside className="space-y-6">

            {/* AI CARD */}

            <motion.div
              variants={itemVariants}
              className="overflow-hidden rounded-3xl bg-[#172033] text-white shadow-xl"
            >

              <div className="relative p-6">

                <motion.div
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute -right-10 -top-10 h-36 w-36 rounded-full border border-[#f6d76a]/20"
                />

                <motion.div
                  animate={{
                    scale: [1, 1.08, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                  className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f6d76a] text-[#172033]"
                >
                  <Brain size={27} />
                </motion.div>

                <h3 className="text-xl font-black">
                  AI Personalization
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-300">
                  STATWISE AI uses your competency profile,
                  learning progress and assessment activity to
                  personalize your learning experience.
                </p>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400">
                      <Check size={17} />
                    </div>

                    <div>
                      <p className="text-sm font-bold">
                        AI Recommendations
                      </p>

                      <p className="text-xs text-slate-400">
                        Currently enabled
                      </p>
                    </div>

                  </div>

                </div>

              </div>

            </motion.div>


            {/* QUICK NAVIGATION */}

            <motion.div
              variants={itemVariants}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >

              <h3 className="font-bold text-[#172033]">
                Quick Navigation
              </h3>

              <div className="mt-4 space-y-2">

                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="flex w-full items-center justify-between rounded-xl p-3 text-left transition hover:bg-slate-50"
                >
                  <span className="flex items-center gap-3 text-sm font-semibold">
                    <User size={17} />
                    Profile
                  </span>

                  <ChevronRight size={17} className="text-slate-400" />
                </button>


                <button
                  type="button"
                  onClick={() => navigate("/skills")}
                  className="flex w-full items-center justify-between rounded-xl p-3 text-left transition hover:bg-slate-50"
                >
                  <span className="flex items-center gap-3 text-sm font-semibold">
                    <Brain size={17} />
                    Skill Intelligence
                  </span>

                  <ChevronRight size={17} className="text-slate-400" />
                </button>


                <button
                  type="button"
                  onClick={() => navigate("/learning")}
                  className="flex w-full items-center justify-between rounded-xl p-3 text-left transition hover:bg-slate-50"
                >
                  <span className="flex items-center gap-3 text-sm font-semibold">
                    <Sparkles size={17} />
                    Learning
                  </span>

                  <ChevronRight size={17} className="text-slate-400" />
                </button>


                <button
                  type="button"
                  onClick={() => navigate("/tutor")}
                  className="flex w-full items-center justify-between rounded-xl p-3 text-left transition hover:bg-slate-50"
                >
                  <span className="flex items-center gap-3 text-sm font-semibold">
                    <Brain size={17} />
                    AI Tutor
                  </span>

                  <ChevronRight size={17} className="text-slate-400" />
                </button>

              </div>

            </motion.div>


            {/* SECURITY INFO */}

            <motion.div
              variants={itemVariants}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Shield size={19} />
                </div>

                <div>
                  <h3 className="font-bold">
                    Security Reminder
                  </h3>

                  <p className="text-xs text-slate-500">
                    Keep your account protected.
                  </p>
                </div>

              </div>

              <ul className="mt-5 space-y-3 text-sm text-slate-600">

                <li className="flex gap-2">
                  <Check
                    size={16}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />
                  Use a strong password.
                </li>

                <li className="flex gap-2">
                  <Check
                    size={16}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />
                  Review active sessions regularly.
                </li>

                <li className="flex gap-2">
                  <Check
                    size={16}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />
                  Sign out from shared devices.
                </li>

              </ul>

            </motion.div>

          </aside>

        </motion.div>

      </main>


      {/* =====================================================
          PASSWORD MODAL
      ===================================================== */}

      <Modal
        open={passwordModal}
        onClose={() => setPasswordModal(false)}
        title="Change Password"
        description="Update your account password."
      >

        <div className="space-y-4">

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Current Password
            </label>

            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#172033]"
            />
          </div>


          <div>
            <label className="mb-2 block text-sm font-semibold">
              New Password
            </label>

            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#172033]"
            />
          </div>


          <div>
            <label className="mb-2 block text-sm font-semibold">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#172033]"
            />
          </div>


          <button
            type="button"
            onClick={changePassword}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#172033] py-3 font-bold text-white transition hover:bg-[#26334b]"
          >
            <KeyRound size={17} />
            Update Password
          </button>

        </div>

      </Modal>


      {/* =====================================================
          ACTIVE SESSIONS MODAL
      ===================================================== */}

      <Modal
        open={sessionsModal}
        onClose={() => setSessionsModal(false)}
        title="Active Sessions"
        description="Devices currently associated with your account."
      >

        <div className="space-y-3">

          <div className="rounded-2xl border border-slate-200 p-4">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff8d8]">
                <Monitor size={19} />
              </div>

              <div className="flex-1">

                <p className="font-bold">
                  Windows Desktop
                </p>

                <p className="text-xs text-slate-500">
                  Current session · Active now
                </p>

              </div>

              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
                Current
              </span>

            </div>

          </div>


          <div className="rounded-2xl border border-slate-200 p-4">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <Monitor size={19} />
              </div>

              <div className="flex-1">

                <p className="font-bold">
                  Previous Browser Session
                </p>

                <p className="text-xs text-slate-500">
                  Demo session information
                </p>

              </div>

              <span className="text-xs text-slate-400">
                Demo
              </span>

            </div>

          </div>


          <button
            type="button"
            onClick={() => {
              setSessionsModal(false);
              toast.success("Other sessions signed out");
            }}
            className="mt-3 w-full rounded-xl border border-slate-200 py-3 text-sm font-bold transition hover:bg-slate-50"
          >
            Sign Out Other Sessions
          </button>

        </div>

      </Modal>


      {/* =====================================================
          LOGOUT MODAL
      ===================================================== */}

      <Modal
        open={logoutModal}
        onClose={() => setLogoutModal(false)}
        title="Sign Out?"
        description="You will need to sign in again to access your account."
      >

        <div className="text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff8d8] text-[#172033]">
            <LogOut size={28} />
          </div>

          <p className="mt-5 text-sm leading-6 text-slate-500">
            Are you sure you want to sign out of STATWISE AI?
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">

            <button
              type="button"
              onClick={() => setLogoutModal(false)}
              className="rounded-xl border border-slate-200 py-3 text-sm font-bold transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={logout}
              className="rounded-xl bg-[#172033] py-3 text-sm font-bold text-white transition hover:bg-[#26334b]"
            >
              Sign Out
            </button>

          </div>

        </div>

      </Modal>


      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      <Modal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Account"
        description="This action cannot be undone."
      >

        <div className="text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <Trash2 size={28} />
          </div>

          <p className="mt-5 text-sm leading-6 text-slate-500">
            Are you sure you want to delete your STATWISE AI account?
            Your account data and learning history may be permanently removed.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">

            <button
              type="button"
              onClick={() => setDeleteModal(false)}
              className="rounded-xl border border-slate-200 py-3 text-sm font-bold transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={deleteAccount}
              className="rounded-xl bg-red-600 py-3 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Delete
            </button>

          </div>

        </div>

      </Modal>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:px-6">

          <div className="flex items-center gap-2">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#172033] text-white">
              <Brain size={15} />
            </div>

            <span>
              © 2026 STATWISE AI
            </span>

          </div>

          <div className="flex items-center gap-5">
            <span>Privacy</span>
            <span>Security</span>
            <span>Accessibility</span>
          </div>

        </div>

      </footer>

    </div>
  );
}