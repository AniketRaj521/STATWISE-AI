import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Landmark,
  LockKeyhole,
  Mail,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function VerifyOTP() {
  const navigate = useNavigate();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(45);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);

  const inputRefs = useRef([]);

  /* ============================================================
     COUNTDOWN
  ============================================================ */

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  /* ============================================================
     OTP INPUT
  ============================================================ */

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const updatedOtp = [...otp];
    updatedOtp[index] = value;

    setOtp(updatedOtp);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  /* ============================================================
     BACKSPACE
  ============================================================ */

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  /* ============================================================
     PASTE OTP
  ============================================================ */

  const handlePaste = (e) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    const newOtp = ["", "", "", "", "", ""];

    pasted.split("").forEach((digit, index) => {
      newOtp[index] = digit;
    });

    setOtp(newOtp);
    setError("");

    const nextIndex = Math.min(pasted.length, 5);

    inputRefs.current[nextIndex]?.focus();
  };

  /* ============================================================
     VERIFY
  ============================================================ */

  const handleVerify = (e) => {
    e.preventDefault();

    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setError("");
    setVerifying(true);

    // Temporary frontend verification.
    // Backend OTP verification will be connected later.

    setTimeout(() => {
      setVerifying(false);
      setVerified(true);

      setTimeout(() => {
        navigate("/dashboard");
      }, 1400);
    }, 1200);
  };

  /* ============================================================
     RESEND
  ============================================================ */

  const handleResend = () => {
    if (timeLeft > 0 || resending) return;

    setResending(true);
    setOtp(["", "", "", "", "", ""]);
    setError("");

    setTimeout(() => {
      setTimeLeft(45);
      setResending(false);
      inputRefs.current[0]?.focus();
    }, 900);
  };

  /* ============================================================
     VERIFIED SCREEN
  ============================================================ */

  if (verified) {
    return (
      <div className="min-h-screen bg-[#fffdf5] flex items-center justify-center px-5">

        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 180,
            }}
            className="w-24 h-24 rounded-full bg-[#E9F8F0] flex items-center justify-center mx-auto mb-6"
          >

            <CheckCircle2
              size={52}
              className="text-[#16865B]"
            />

          </motion.div>

          <h1 className="text-3xl font-black">
            Verification Successful
          </h1>

          <p className="text-[#172033]/55 mt-3">
            Your account has been securely verified.
          </p>

          <div className="flex items-center justify-center gap-2 mt-6 text-sm font-bold text-[#16865B]">

            <Sparkles size={16} />

            Taking you to your dashboard...

          </div>

        </motion.div>

      </div>
    );
  }

  /* ============================================================
     MAIN
  ============================================================ */

  return (
    <div className="min-h-screen bg-[#fffdf5] text-[#172033] overflow-hidden">

      {/* ========================================================
          TOP STRIP
      ======================================================== */}

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

      {/* ========================================================
          NAVBAR
      ======================================================== */}

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
            className="flex items-center gap-2 text-sm font-bold hover:underline"
          >
            <ArrowLeft size={16} />
            Back to login
          </Link>

        </div>

      </header>

      {/* ========================================================
          MAIN
      ======================================================== */}

      <main className="relative min-h-[calc(100vh-120px)] flex items-center justify-center px-5 py-12">

        {/* Floating background shapes */}

        <motion.div
          animate={{
            x: [0, 25, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-[8%] top-[15%] w-28 h-28 rounded-full bg-[#FFF3B0] blur-2xl"
        />

        <motion.div
          animate={{
            x: [0, -20, 0],
            y: [0, 25, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute right-[8%] bottom-[12%] w-36 h-36 rounded-full bg-[#E7DFFF] blur-3xl"
        />

        {/* ======================================================
            CARD
        ====================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 35,
            scale: 0.96,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.65,
          }}
          className="relative w-full max-w-xl"
        >

          <div className="bg-white rounded-[30px] shadow-[0_30px_90px_rgba(23,32,51,0.14)] border border-black/5 overflow-hidden">

            {/* Accent */}

            <div className="h-2 bg-gradient-to-r from-[#F4C430] via-[#E89B00] to-[#7C5CFC]" />

            <div className="p-8 sm:p-10">

              {/* Icon */}

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 180,
                }}
                className="w-16 h-16 rounded-2xl bg-[#FFF3B0] flex items-center justify-center mb-6"
              >

                <LockKeyhole size={29} />

              </motion.div>

              {/* Heading */}

              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                Verify your account
              </h1>

              <p className="text-[#172033]/55 mt-3 leading-6">
                Enter the 6-digit verification code sent to
                your registered email address.
              </p>

              {/* Email indicator */}

              <div className="mt-5 p-4 rounded-xl bg-[#FFFDF5] border border-black/5 flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                  <Mail size={18} />
                </div>

                <div>

                  <p className="text-[11px] uppercase tracking-wider font-bold text-[#172033]/40">
                    Verification sent to
                  </p>

                  <p className="font-bold text-sm mt-1">
                    your registered email
                  </p>

                </div>

              </div>

              {/* ==================================================
                  OTP FORM
              =================================================== */}

              <form
                onSubmit={handleVerify}
                className="mt-8"
              >

                <label className="block text-sm font-black mb-4">
                  Enter verification code
                </label>

                <div
                  className="flex justify-between gap-2 sm:gap-3"
                  onPaste={handlePaste}
                >

                  {otp.map((digit, index) => (

                    <motion.input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      value={digit}
                      onChange={(e) =>
                        handleOtpChange(
                          e.target.value,
                          index
                        )
                      }
                      onKeyDown={(e) =>
                        handleKeyDown(e, index)
                      }
                      whileFocus={{
                        scale: 1.07,
                      }}
                      maxLength={1}
                      inputMode="numeric"
                      aria-label={`OTP digit ${index + 1}`}
                      className={`w-full h-14 sm:h-16 rounded-xl text-center text-2xl font-black bg-[#FFFDF5] border-2 outline-none transition-all ${
                        digit
                          ? "border-[#7C5CFC] bg-[#F8F6FF]"
                          : "border-[#172033]/10 focus:border-[#F4C430]"
                      }`}
                    />

                  ))}

                </div>

                {/* Error */}

                <AnimatePresence>
                  {error && (

                    <motion.p
                      initial={{
                        opacity: 0,
                        y: -5,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                      }}
                      className="text-sm text-red-600 font-semibold mt-4"
                    >
                      {error}
                    </motion.p>

                  )}
                </AnimatePresence>

                {/* ==================================================
                    TIMER
                =================================================== */}

                <div className="flex justify-between items-center mt-6">

                  <div className="flex items-center gap-2 text-sm text-[#172033]/50">

                    <Clock3 size={16} />

                    {timeLeft > 0 ? (
                      <span>
                        Code expires in{" "}
                        <strong className="text-[#172033]">
                          00:{String(timeLeft).padStart(2, "0")}
                        </strong>
                      </span>
                    ) : (
                      <span className="text-red-500 font-semibold">
                        OTP expired
                      </span>
                    )}

                  </div>

                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={timeLeft > 0 || resending}
                    className={`flex items-center gap-2 text-sm font-bold transition-all ${
                      timeLeft > 0
                        ? "text-[#172033]/25 cursor-not-allowed"
                        : "text-[#7C5CFC] hover:underline"
                    }`}
                  >

                    <RefreshCw
                      size={15}
                      className={
                        resending
                          ? "animate-spin"
                          : ""
                      }
                    />

                    {resending
                      ? "Sending..."
                      : "Resend OTP"}

                  </button>

                </div>

                {/* ==================================================
                    VERIFY BUTTON
                =================================================== */}

                <motion.button
                  type="submit"
                  disabled={verifying || timeLeft === 0}
                  whileHover={{
                    scale: 1.015,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  className="mt-7 w-full h-14 rounded-xl bg-[#172033] text-white font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >

                  {verifying ? (
                    <>
                      Verifying identity

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
                      Verify & Continue
                      <ArrowRight size={19} />
                    </>
                  )}

                </motion.button>

              </form>

              {/* ==================================================
                  SECURITY
              =================================================== */}

              <div className="mt-7 p-4 rounded-2xl bg-[#F4FBF7] border border-[#16865B]/10">

                <div className="flex gap-3">

                  <ShieldCheck
                    size={20}
                    className="text-[#16865B] shrink-0"
                  />

                  <div>

                    <p className="text-sm font-black text-[#16865B]">
                      Secure verification
                    </p>

                    <p className="text-xs text-[#172033]/50 mt-1 leading-5">
                      Never share your OTP with anyone.
                      STATWISE AI will never ask you to disclose
                      your verification code.
                    </p>

                  </div>

                </div>

              </div>

              {/* Back */}

              <div className="text-center mt-6">

                <Link
                  to="/login"
                  className="text-sm font-bold text-[#7C5CFC] hover:underline"
                >
                  ← Use a different account
                </Link>

              </div>

            </div>

          </div>

          <p className="text-center text-xs text-[#172033]/40 mt-5">
            STATWISE AI • Intelligent Learning. Measurable Impact.
          </p>

        </motion.div>

      </main>

    </div>
  );
}