import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  UserRound,
  Mail,
  Phone,
  LockKeyhole,
  Eye,
  EyeOff,
  Building2,
  BriefcaseBusiness,
  GraduationCap,
  ShieldCheck,
  BrainCircuit,
  Sparkles,
  Landmark,
} from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focused, setFocused] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    // Remove previous error when user edits
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Basic validation
    if (
      !form.name ||
      !form.email ||
      !form.phone ||
      !form.department ||
      !form.role ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Please fill in all the fields.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      console.log("Sending registration request...");

      const response = await fetch("http://127.0.0.1:8000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      let data;

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      console.log("Register API response:", data);

      if (!response.ok) {
        let message = "Registration failed.";

        if (typeof data.detail === "string") {
          message = data.detail;
        } else if (typeof data.message === "string") {
          message = data.message;
        } else if (Array.isArray(data.detail)) {
          message = data.detail
            .map((item) => item.msg || "Invalid input")
            .join(", ");
        }

        throw new Error(message);
      }

      // Save email so VerifyOTP can use it
      localStorage.setItem(
        "pending_email",
        form.email.trim().toLowerCase()
      );

      // Save basic user information for later pages
      localStorage.setItem(
        "statwise_pending_user",
        JSON.stringify({
          full_name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone,
          department: form.department,
          role: form.role,
        })
      );

      console.log("Registration successful.");
      console.log("OTP should be sent to:", form.email);

      // Go to OTP verification page
      navigate("/verify-otp", {
        state: {
          email: form.email.trim().toLowerCase(),
        },
      });
    } catch (error) {
      console.error("Registration error:", error);

      if (
        error instanceof TypeError &&
        error.message.toLowerCase().includes("fetch")
      ) {
        setError(
          "Cannot connect to the backend. Please make sure the backend is running on http://127.0.0.1:8000."
        );
      } else {
        setError(
          error.message || "Unable to create your account. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffdf5] text-[#172033] overflow-hidden">
      {/* =====================================================
          TOP GOVERNMENT STRIP
      ====================================================== */}
      <div className="bg-[#172033] text-white">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-2.5 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Landmark size={14} />
            <span>
              Government Workforce Learning & Skill Intelligence Platform
            </span>
          </div>

          <div className="flex gap-5 text-white/70">
            <span>Accessibility</span>
            <span>Help</span>
            <span>English</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          NAVBAR
      ====================================================== */}
      <header className="bg-[#F6D76A] border-b border-black/5">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-[76px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <motion.div
              whileHover={{
                scale: 1.08,
                rotate: 5,
              }}
              className="w-11 h-11 rounded-xl bg-[#172033] flex items-center justify-center shadow-lg"
            >
              <BrainCircuit
                size={25}
                className="text-[#F6D76A]"
              />
            </motion.div>

            <div>
              <div className="font-black text-xl">
                STATWISE
                <span className="text-[#7C5CFC]"> AI</span>
              </div>

              <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#172033]/60">
                Intelligent Learning
              </div>
            </div>
          </Link>

          <Link
            to="/login"
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 hover:bg-white transition-all font-bold text-sm"
          >
            Already have an account?
            <span className="text-[#7C5CFC]">Sign in</span>
          </Link>
        </div>
      </header>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}
      <main className="relative">
        {/* Decorative animated circles */}
        <motion.div
          animate={{
            y: [0, -25, 0],
            x: [0, 15, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-[4%] top-20 w-28 h-28 rounded-full bg-[#FFF3B0] blur-2xl"
        />

        <motion.div
          animate={{
            y: [0, 20, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute right-[5%] bottom-20 w-36 h-36 rounded-full bg-[#E7DFFF] blur-3xl"
        />

        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-12">
          <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12 items-start">

            {/* =================================================
                LEFT INFORMATION PANEL
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
              className="hidden lg:block pt-10"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-black/5 shadow-sm text-sm font-bold mb-6">
                <Sparkles
                  size={16}
                  className="text-[#7C5CFC]"
                />
                Join the Intelligent Learning Ecosystem
              </div>

              <h1 className="text-5xl xl:text-6xl font-black leading-[1.05] tracking-tight">
                Your Skills.
                <br />
                Your
                <span className="text-[#7C5CFC]">
                  {" "}Growth.
                </span>
                <br />
                Your Impact.
              </h1>

              <p className="mt-6 text-lg leading-8 text-[#172033]/60 max-w-lg">
                Create your STATWISE AI profile and unlock
                personalized competency analysis, adaptive learning,
                assessments and AI-powered guidance.
              </p>

              <div className="mt-9 space-y-4">
                <SignupFeature
                  icon={<BrainCircuit size={21} />}
                  title="AI Skill Intelligence"
                  text="Understand your strengths and skill gaps."
                  delay={0.2}
                />

                <SignupFeature
                  icon={<GraduationCap size={21} />}
                  title="Personalized Learning"
                  text="Get learning paths based on your competency."
                  delay={0.3}
                />

                <SignupFeature
                  icon={<ShieldCheck size={21} />}
                  title="Secure Profile"
                  text="Protected account with OTP verification."
                  delay={0.4}
                />
              </div>

              <motion.div
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.5,
                }}
                className="mt-9 p-5 rounded-3xl bg-[#172033] text-white shadow-xl"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-white/50">
                      YOUR FUTURE PROFILE
                    </p>

                    <p className="font-black text-lg mt-1">
                      Competency Intelligence
                    </p>
                  </div>

                  <div className="w-12 h-12 rounded-full border-4 border-[#F6D76A] flex items-center justify-center font-black text-sm">
                    AI
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-5">
                  <MiniStat
                    value="AI"
                    label="Insights"
                  />

                  <MiniStat
                    value="24/7"
                    label="Learning"
                  />

                  <MiniStat
                    value="360°"
                    label="Profile"
                  />
                </div>
              </motion.div>
            </motion.section>

            {/* =================================================
                SIGNUP CARD
            ================================================== */}
            <motion.section
              initial={{
                opacity: 0,
                y: 35,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              transition={{
                duration: 0.65,
              }}
              className="w-full max-w-2xl mx-auto"
            >
              <div className="bg-white rounded-[28px] shadow-[0_25px_80px_rgba(23,32,51,0.12)] border border-[#172033]/8 overflow-hidden">

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
                      }}
                      className="w-14 h-14 rounded-2xl bg-[#FFF3B0] flex items-center justify-center mb-5"
                    >
                      <UserRound size={27} />
                    </motion.div>

                    <h2 className="text-3xl font-black">
                      Create your account
                    </h2>

                    <p className="text-[#172033]/55 mt-2">
                      Build your professional learning profile.
                    </p>
                  </div>

                  {/* ERROR MESSAGE */}
                  {error && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: -10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium"
                    >
                      {error}
                    </motion.div>
                  )}

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    {/* =================================================
                        PERSONAL INFORMATION
                    ================================================== */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 rounded-lg bg-[#FFF3B0] flex items-center justify-center">
                          <UserRound size={15} />
                        </div>

                        <h3 className="font-black text-sm">
                          Personal Information
                        </h3>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">

                        <InputField
                          name="name"
                          label="Full name"
                          placeholder="Enter your full name"
                          icon={<UserRound size={18} />}
                          value={form.name}
                          onChange={handleChange}
                          focused={focused}
                          setFocused={setFocused}
                          required
                        />

                        <InputField
                          name="email"
                          type="email"
                          label="Email address"
                          placeholder="name@example.com"
                          icon={<Mail size={18} />}
                          value={form.email}
                          onChange={handleChange}
                          focused={focused}
                          setFocused={setFocused}
                          required
                        />

                        <InputField
                          name="phone"
                          type="tel"
                          label="Mobile number"
                          placeholder="Enter mobile number"
                          icon={<Phone size={18} />}
                          value={form.phone}
                          onChange={handleChange}
                          focused={focused}
                          setFocused={setFocused}
                          required
                        />

                      </div>
                    </div>

                    {/* =================================================
                        PROFESSIONAL INFORMATION
                    ================================================== */}
                    <div className="pt-2">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 rounded-lg bg-[#EDE8FF] flex items-center justify-center">
                          <BriefcaseBusiness size={15} />
                        </div>

                        <h3 className="font-black text-sm">
                          Professional Profile
                        </h3>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">

                        <SelectField
                          name="department"
                          label="Department"
                          icon={<Building2 size={18} />}
                          value={form.department}
                          onChange={handleChange}
                          options={[
                            "Statistics",
                            "Data & Analytics",
                            "Research",
                            "Finance",
                            "Administration",
                            "Information Technology",
                            "Other",
                          ]}
                        />

                        <SelectField
                          name="role"
                          label="Professional role"
                          icon={<BriefcaseBusiness size={18} />}
                          value={form.role}
                          onChange={handleChange}
                          options={[
                            "Statistical Officer",
                            "Data Analyst",
                            "Research Officer",
                            "Data Scientist",
                            "Project Manager",
                            "Other",
                          ]}
                        />

                      </div>
                    </div>

                    {/* =================================================
                        PASSWORD
                    ================================================== */}
                    <div className="pt-2">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 rounded-lg bg-[#EDE8FF] flex items-center justify-center">
                          <LockKeyhole size={15} />
                        </div>

                        <h3 className="font-black text-sm">
                          Account Security
                        </h3>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">

                        <PasswordField
                          name="password"
                          label="Create password"
                          placeholder="Create a strong password"
                          value={form.password}
                          onChange={handleChange}
                          show={showPassword}
                          setShow={setShowPassword}
                          focused={focused}
                          setFocused={setFocused}
                        />

                        <PasswordField
                          name="confirmPassword"
                          label="Confirm password"
                          placeholder="Re-enter your password"
                          value={form.confirmPassword}
                          onChange={handleChange}
                          show={showConfirm}
                          setShow={setShowConfirm}
                          focused={focused}
                          setFocused={setFocused}
                        />

                      </div>
                    </div>

                    {/* Password indicator */}
                    {form.password && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          height: 0,
                        }}
                        animate={{
                          opacity: 1,
                          height: "auto",
                        }}
                        className="p-3 rounded-xl bg-[#FFFDF5]"
                      >
                        <div className="flex gap-1 mb-2">
                          {[1, 2, 3, 4].map((item) => (
                            <div
                              key={item}
                              className={`h-1.5 flex-1 rounded-full ${
                                form.password.length >= item * 3
                                  ? "bg-[#16865B]"
                                  : "bg-black/10"
                              }`}
                            />
                          ))}
                        </div>

                        <p className="text-[11px] text-[#172033]/50">
                          Use at least 8 characters with a mix of
                          letters, numbers and symbols.
                        </p>
                      </motion.div>
                    )}

                    {/* Terms */}
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        className="mt-1 w-4 h-4 accent-[#7C5CFC]"
                      />

                      <span className="text-xs text-[#172033]/55 leading-5">
                        I agree to the platform's terms of use,
                        privacy policy and secure authentication
                        process.
                      </span>
                    </label>

                    {/* Submit */}
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{
                        scale: 1.015,
                      }}
                      whileTap={{
                        scale: 0.98,
                      }}
                      className="w-full h-14 rounded-xl bg-[#172033] text-white font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
                    >
                      {loading ? (
                        <>
                          Sending OTP...

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
                        </>
                      ) : (
                        <>
                          Create account
                          <ArrowRight size={19} />
                        </>
                      )}
                    </motion.button>
                  </form>

                  {/* Login */}
                  <div className="text-center mt-6">
                    <p className="text-sm text-[#172033]/55">
                      Already registered?
                    </p>

                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 mt-2 font-black text-[#7C5CFC] hover:underline"
                    >
                      Sign in to STATWISE AI
                      <ArrowRight size={15} />
                    </Link>
                  </div>

                  {/* Security */}
                  <div className="mt-7 p-4 rounded-xl bg-[#F4FBF7] border border-[#16865B]/10">
                    <div className="flex gap-3">
                      <ShieldCheck
                        size={19}
                        className="text-[#16865B] mt-0.5 shrink-0"
                      />

                      <div>
                        <p className="text-xs font-black text-[#16865B]">
                          OTP verification enabled
                        </p>

                        <p className="text-[11px] text-[#172033]/50 mt-1 leading-5">
                          After registration, your account will
                          be verified using a one-time password.
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
    </div>
  );
}

/* ============================================================
   INPUT FIELD
============================================================ */

function InputField({
  name,
  type = "text",
  label,
  placeholder,
  icon,
  value,
  onChange,
  focused,
  setFocused,
  required = false,
}) {
  return (
    <div>
      <label className="block text-xs font-bold mb-2">
        {label}
      </label>

      <motion.div
        animate={{
          scale: focused === name ? 1.01 : 1,
        }}
        className={`relative ${
          focused === name
            ? "ring-2 ring-[#F4C430]"
            : ""
        } rounded-xl`}
      >
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#172033]/40">
          {icon}
        </span>

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(name)}
          onBlur={() => setFocused("")}
          placeholder={placeholder}
          required={required}
          className="w-full h-13 pl-11 pr-4 rounded-xl bg-[#FFFDF5] border border-[#172033]/10 outline-none focus:border-[#F4C430] transition-all text-sm"
        />
      </motion.div>
    </div>
  );
}

/* ============================================================
   SELECT FIELD
============================================================ */

function SelectField({
  name,
  label,
  icon,
  value,
  onChange,
  options,
}) {
  return (
    <div>
      <label className="block text-xs font-bold mb-2">
        {label}
      </label>

      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#172033]/40">
          {icon}
        </span>

        <select
          name={name}
          value={value}
          onChange={onChange}
          required
          className="appearance-none w-full h-13 pl-11 pr-4 rounded-xl bg-[#FFFDF5] border border-[#172033]/10 outline-none focus:border-[#F4C430] transition-all text-sm"
        >
          <option value="">
            Select {label.toLowerCase()}
          </option>

          {options.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

/* ============================================================
   PASSWORD FIELD
============================================================ */

function PasswordField({
  name,
  label,
  placeholder,
  value,
  onChange,
  show,
  setShow,
  focused,
  setFocused,
}) {
  return (
    <div>
      <label className="block text-xs font-bold mb-2">
        {label}
      </label>

      <motion.div
        animate={{
          scale: focused === name ? 1.01 : 1,
        }}
        className={`relative rounded-xl ${
          focused === name
            ? "ring-2 ring-[#F4C430]"
            : ""
        }`}
      >
        <LockKeyhole
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#172033]/40"
        />

        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(name)}
          onBlur={() => setFocused("")}
          placeholder={placeholder}
          required
          className="w-full h-13 pl-11 pr-11 rounded-xl bg-[#FFFDF5] border border-[#172033]/10 outline-none focus:border-[#F4C430] transition-all text-sm"
        />

        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#172033]/40 hover:text-[#172033]"
        >
          {show ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>
      </motion.div>
    </div>
  );
}

/* ============================================================
   SIGNUP FEATURE
============================================================ */

function SignupFeature({
  icon,
  title,
  text,
  delay,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: -20,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        delay,
      }}
      whileHover={{
        x: 5,
      }}
      className="flex gap-4 items-center"
    >
      <div className="w-11 h-11 rounded-xl bg-white border border-black/5 shadow-sm flex items-center justify-center">
        {icon}
      </div>

      <div>
        <h3 className="font-black text-sm">
          {title}
        </h3>

        <p className="text-xs text-[#172033]/50 mt-1">
          {text}
        </p>
      </div>
    </motion.div>
  );
}

/* ============================================================
   MINI STAT
============================================================ */

function MiniStat({ value, label }) {
  return (
    <div className="bg-white/5 rounded-xl p-3 text-center">
      <div className="font-black text-lg text-[#F6D76A]">
        {value}
      </div>

      <div className="text-[10px] text-white/45 mt-1">
        {label}
      </div>
    </div>
  );
}