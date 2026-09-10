import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function GoogleLogin({ mode = "signin" }) {
  const googleButtonRef = useRef(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.error(
        "VITE_GOOGLE_CLIENT_ID is missing from frontend/.env"
      );
      return;
    }

    const handleGoogleResponse = async (response) => {
      try {
        if (!response?.credential) {
          toast.error("Google authentication failed.");
          return;
        }

        toast.loading("Signing you in with Google...", {
          id: "google-login",
        });

        const result = await fetch(
          "http://127.0.0.1:8000/auth/google",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              credential: response.credential,
            }),
          }
        );

        const data = await result.json();

        if (!result.ok || !data.success) {
          throw new Error(
            data.message || "Google login failed."
          );
        }

        localStorage.setItem(
          "statwise_user",
          JSON.stringify(data.user)
        );

        if (data.access_token) {
          localStorage.setItem(
            "statwise_token",
            data.access_token
          );
        }

        toast.success(
          `Welcome ${data.user?.name || "to STATWISE AI"}!`,
          {
            id: "google-login",
          }
        );

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 700);
      } catch (error) {
        console.error("Google Login Error:", error);

        toast.error(
          error.message ||
            "Unable to sign in with Google.",
          {
            id: "google-login",
          }
        );
      }
    };

    const initializeGoogle = () => {
      if (
        !window.google ||
        !window.google.accounts ||
        !googleButtonRef.current
      ) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        ux_mode: "popup",
        auto_select: false,
      });

      googleButtonRef.current.innerHTML = "";

      window.google.accounts.id.renderButton(
        googleButtonRef.current,
        {
          type: "standard",
          theme: "outline",
          size: "large",
          text:
            mode === "signup"
              ? "signup_with"
              : "continue_with",
          shape: "pill",
          logo_alignment: "left",
          width: 360,
        }
      );
    };

    if (window.google) {
      initializeGoogle();
    } else {
      const script = document.createElement("script");

      script.src =
        "https://accounts.google.com/gsi/client";

      script.async = true;
      script.defer = true;

      script.onload = initializeGoogle;

      document.head.appendChild(script);
    }

    return () => {
      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = "";
      }
    };
  }, [mode]);

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
      }}
      className="w-full flex justify-center"
    >
      <div
        ref={googleButtonRef}
        className="min-h-[44px]"
      />
    </motion.div>
  );
}