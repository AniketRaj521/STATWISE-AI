import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GoogleLogin from "../../components/GoogleLogin";
import { motion } from "framer-motion";

import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  BarChart3,
  BrainCircuit,
  BookOpenCheck,
  CheckCircle2,
  Landmark,
  UserRound,
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      alert("Please enter your email and password.");
      return;
    }

    setLoading(true);

    // Temporary frontend authentication flow.
    // Real backend authentication can be connected later.

    setTimeout(() => {
      setLoading(false);

      if (remember) {
        localStorage.setItem("statwise_remember", "true");
      }

      localStorage.setItem("statwise_user", form.email);

      navigate("/verify-otp");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#fffdf5] text-[#172033] overflow-hidden">

      {/* =====================================================
          TOP GOVERNMENT-STYLE STRIP
      ====================================================== */}

      <div className="bg-[#172033] text-white">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-2.5 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs">

          <div className="flex items-center gap-2">
            <Landmark size={14} />

            <span>
              Government Workforce Learning & Skill Intelligence Platform
            </span>
          </div>

          <div className="flex items-center gap-5 text-white/75">
            <span>Accessibility</span>
            <span>Help</span>
            <span>English</span>
          </div>

        </div>
      </div>

      {/* =====================================================
          MAIN NAVIGATION
      ====================================================== */}

      <header className="bg-[#F6D76A] border-b border-black/5">

        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-[76px] flex items-center justify-between">

          <Link to="/" className="flex items-center gap-3">

            <motion.div
              whileHover={{
                rotate: 5,
                scale: 1.05,
              }}
              className="w-11 h-11 rounded-xl bg-[#172033] flex items-center justify-center shadow-lg"
            >
              <BrainCircuit
                className="text-[#F6D76A]"
                size={25}
              />
            </motion.div>

            <div>
              <div className="font-black text-xl tracking-tight">
                STATWISE
                <span className="text-[#7C5CFC]"> AI</span>
              </div>

              <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#172033]/60">
                Intelligent Learning
              </div>
            </div>

          </Link>

          <Link
            to="/"
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/60 hover:bg-white transition-all font-semibold text-sm"
          >
            ← Back to Home
          </Link>

        </div>

      </header>

      {/* =====================================================
          LOGIN AREA
      ====================================================== */}

      <main className="relative min-h-[calc(100vh-120px)] flex items-center">

        {/* Background decorative elements */}

        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 4, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-16 left-[5%] w-24 h-24 rounded-full bg-[#FFF3B0] blur-xl opacity-80"
        />

        <motion.div
          animate={{
            y: [0, 25, 0],
            x: [0, 15, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-10 right-[7%] w-32 h-32 rounded-full bg-[#E7DFFF] blur-2xl opacity-70"
        />

        <div className="max-w-7xl mx-auto w-full px-5 lg:px-8 py-12 lg:py-16">

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* =================================================
                LEFT VISUAL / PLATFORM SECTION
            ================================================== */}

            <motion.section
              initial={{
                opacity: 0,
                x: -40,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.7,
              }}
              className="hidden lg:block"
            >

              <div className="max-w-xl">

                {/* Badge */}

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.15,
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#172033]/10 shadow-sm text-sm font-semibold mb-6"
                >
                  <Sparkles
                    size={16}
                    className="text-[#7C5CFC]"
                  />

                  AI-Powered Government Learning
                </motion.div>

                {/* Main heading */}

                <h1 className="text-5xl xl:text-6xl font-black leading-[1.05] tracking-tight mb-6">

                  Build Skills.
                  <br />

                  <span className="text-[#7C5CFC]">
                    Measure Impact.
                  </span>

                  <br />

                  Improve Governance.

                </h1>

                <p className="text-lg text-[#172033]/65 leading-8 max-w-lg mb-8">
                  Sign in to access your personalized competency profile,
                  AI-powered skill-gap analysis, adaptive learning paths,
                  assessments and intelligent learning assistance.
                </p>

                {/* =================================================
                    MINI FEATURE CARDS
                ================================================== */}

                <div className="grid grid-cols-2 gap-4 mb-8">

                  <FeatureCard
                    icon={<BarChart3 size={21} />}
                    title="Skill Intelligence"
                    text="Know your current & target competency."
                    delay={0.3}
                  />

                  <FeatureCard
                    icon={<BookOpenCheck size={21} />}
                    title="Personalized Learning"
                    text="AI-curated learning paths for you."
                    delay={0.4}
                  />

                </div>

                {/* =================================================
                    TRUST PANEL
                ================================================== */}

                <div className="flex items-center gap-4">

                  <div className="flex -space-x-2">
                    <Avatar letter="A" />
                    <Avatar letter="S" />
                    <Avatar letter="R" />
                    <Avatar letter="M" />
                  </div>

                  <div>

                    <div className="flex items-center gap-1.5 font-bold text-sm">

                      <ShieldCheck
                        size={17}
                        className="text-[#16865B]"
                      />

                      Secure Learning Environment

                    </div>

                    <p className="text-xs text-[#172033]/50 mt-1">
                      Designed for workforce skill development
                    </p>

                  </div>

                </div>

              </div>

            </motion.section>

            {/* =================================================
                LOGIN CARD
            ================================================== */}

            <motion.section
              initial={{
                opacity: 0,
                y: 40,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              transition={{
                duration: 0.65,
                delay: 0.1,
              }}
              className="w-full max-w-md mx-auto lg:ml-auto"
            >

              <div className="bg-white rounded-[28px] shadow-[0_25px_80px_rgba(23,32,51,0.12)] border border-[#172033]/8 overflow-hidden">

                {/* Card top accent */}

                <div className="h-2 bg-gradient-to-r from-[#F4C430] via-[#E89B00] to-[#7C5CFC]" />

                <div className="p-7 sm:p-9">

                  {/* Header */}

                  <div className="mb-8">

                    <motion.div
                      initial={{
                        scale: 0,
                      }}
                      animate={{
                        scale: 1,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        delay: 0.25,
                      }}
                      className="w-14 h-14 rounded-2xl bg-[#FFF3B0] flex items-center justify-center mb-5"
                    >

                      <LockKeyhole
                        size={26}
                        className="text-[#172033]"
                      />

                    </motion.div>

                    <h2 className="text-3xl font-black tracking-tight">
                      Welcome back
                    </h2>

                    <p className="text-[#172033]/55 mt-2">
                      Sign in to continue your learning journey.
                    </p>

                  </div>

                  {/* =================================================
                      LOGIN FORM
                  ================================================== */}

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >

                    {/* Email */}

                    <div>

                      <label className="block text-sm font-bold mb-2">
                        Email address
                      </label>

                      <motion.div
                        animate={{
                          scale:
                            focused === "email"
                              ? 1.01
                              : 1,
                        }}
                        className={`relative rounded-xl transition-all ${
                          focused === "email"
                            ? "ring-2 ring-[#F4C430]"
                            : ""
                        }`}
                      >

                        <Mail
                          size={19}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#172033]/40"
                        />

                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          onFocus={() => setFocused("email")}
                          onBlur={() => setFocused("")}
                          placeholder="Enter your email"
                          className="w-full h-14 pl-12 pr-4 rounded-xl bg-[#FFFDF5] border border-[#172033]/10 outline-none focus:border-[#F4C430] transition-all"
                        />

                      </motion.div>

                    </div>

                    {/* Password */}

                    <div>

                      <div className="flex justify-between items-center mb-2">

                        <label className="text-sm font-bold">
                          Password
                        </label>

                        <button
                          type="button"
                          onClick={() =>
                            alert(
                              "Password reset will be available soon."
                            )
                          }
                          className="text-xs font-bold text-[#7C5CFC] hover:underline"
                        >
                          Forgot password?
                        </button>

                      </div>

                      <motion.div
                        animate={{
                          scale:
                            focused === "password"
                              ? 1.01
                              : 1,
                        }}
                        className={`relative rounded-xl transition-all ${
                          focused === "password"
                            ? "ring-2 ring-[#F4C430]"
                            : ""
                        }`}
                      >

                        <LockKeyhole
                          size={19}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#172033]/40"
                        />

                        <input
                          type={
                            showPassword
                              ? "text"
                              : "password"
                          }
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          onFocus={() =>
                            setFocused("password")
                          }
                          onBlur={() => setFocused("")}
                          placeholder="Enter your password"
                          className="w-full h-14 pl-12 pr-12 rounded-xl bg-[#FFFDF5] border border-[#172033]/10 outline-none focus:border-[#F4C430] transition-all"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword(
                              !showPassword
                            )
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#172033]/40 hover:text-[#172033] transition-colors"
                          aria-label={
                            showPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >

                          {showPassword ? (
                            <EyeOff size={19} />
                          ) : (
                            <Eye size={19} />
                          )}

                        </button>

                      </motion.div>

                    </div>

                    {/* Remember */}

                    <label className="flex items-center gap-3 cursor-pointer select-none">

                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) =>
                          setRemember(
                            e.target.checked
                          )
                        }
                        className="w-4 h-4 accent-[#7C5CFC]"
                      />

                      <span className="text-sm text-[#172033]/65">
                        Remember me on this device
                      </span>

                    </label>

                    {/* Submit */}

                    <motion.button
                      whileHover={{
                        scale: 1.015,
                      }}
                      whileTap={{
                        scale: 0.98,
                      }}
                      type="submit"
                      disabled={loading}
                      className="relative overflow-hidden w-full h-14 rounded-xl bg-[#172033] text-white font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
                    >

                      <motion.span
                        animate={{
                          x: loading
                            ? 0
                            : [0, 3, 0],
                        }}
                        transition={{
                          duration: 1.4,
                          repeat: Infinity,
                        }}
                      >
                        {loading
                          ? "Verifying..."
                          : "Sign in securely"}
                      </motion.span>

                      {!loading && (
                        <ArrowRight size={19} />
                      )}

                      {loading && (
                        <motion.div
                          animate={{
                            rotate: 360,
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                      )}

                    </motion.button>

                  </form>

                  {/* =================================================
                      GOOGLE SIGN-IN
                  ================================================== */}

                  <div className="flex items-center gap-4 my-6">

                    <div className="h-px flex-1 bg-[#172033]/10" />

                    <span className="text-xs font-semibold text-[#172033]/40">
                      OR
                    </span>

                    <div className="h-px flex-1 bg-[#172033]/10" />

                  </div>

                  <div className="w-full">

                    <GoogleLogin mode="signin" />

                  </div>

                  {/* =================================================
                      DIVIDER
                  ================================================== */}

                  <div className="flex items-center gap-4 my-7">

                    <div className="h-px flex-1 bg-[#172033]/10" />

                    <span className="text-xs font-semibold text-[#172033]/40">
                      NEW TO STATWISE AI?
                    </span>

                    <div className="h-px flex-1 bg-[#172033]/10" />

                  </div>

                  {/* Signup */}

                  <Link
                    to="/signup"
                    className="w-full h-13 rounded-xl border-2 border-[#172033]/10 hover:border-[#F4C430] hover:bg-[#FFFDF5] transition-all flex items-center justify-center gap-2 font-bold"
                  >

                    <UserRound size={18} />

                    Create an account

                  </Link>

                  {/* Security note */}

                  <div className="mt-6 p-4 rounded-xl bg-[#F4FBF7] border border-[#16865B]/10">

                    <div className="flex gap-3">

                      <CheckCircle2
                        size={18}
                        className="text-[#16865B] mt-0.5 shrink-0"
                      />

                      <div>

                        <p className="text-xs font-bold text-[#16865B]">
                          Secure authentication
                        </p>

                        <p className="text-[11px] text-[#172033]/55 mt-1 leading-5">
                          Your account is protected with secure
                          authentication and OTP verification.
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

              <p className="text-center text-xs text-[#172033]/40 mt-5">
                STATWISE AI • Intelligent Learning. Measurable Impact.
              </p>

            </motion.section>

          </div>

        </div>

      </main>

      {/* =====================================================
          BOTTOM GOVERNMENT-STYLE BAND
      ====================================================== */}

      <div className="bg-[#172033] text-white/60 py-3">

        <div className="max-w-7xl mx-auto px-5 lg:px-8 flex flex-col sm:flex-row justify-between gap-2 text-[11px]">

          <span>
            © 2026 STATWISE AI
          </span>

          <span>
            AI-powered skill intelligence • Personalized learning •
            Competency development
          </span>

        </div>

      </div>

    </div>
  );
}

/* ============================================================
   FEATURE CARD
============================================================ */

function FeatureCard({
  icon,
  title,
  text,
  delay,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay,
      }}
      whileHover={{
        y: -5,
        boxShadow:
          "0 15px 35px rgba(23,32,51,0.10)",
      }}
      className="p-5 rounded-2xl bg-white border border-[#172033]/8 transition-all"
    >

      <div className="w-10 h-10 rounded-xl bg-[#FFF3B0] flex items-center justify-center mb-3">
        {icon}
      </div>

      <h3 className="font-black text-sm mb-1">
        {title}
      </h3>

      <p className="text-xs text-[#172033]/55 leading-5">
        {text}
      </p>

    </motion.div>
  );
}

/* ============================================================
   AVATAR
============================================================ */

function Avatar({ letter }) {
  return (
    <motion.div
      whileHover={{
        y: -4,
      }}
      className="w-9 h-9 rounded-full bg-[#F6D76A] border-2 border-white flex items-center justify-center text-xs font-black"
    >
      {letter}
    </motion.div>
  );
}