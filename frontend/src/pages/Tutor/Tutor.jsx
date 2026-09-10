import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Upload,
  FileText,
  Send,
  Bot,
  User,
  Sparkles,
  Brain,
  RefreshCw,
  Paperclip,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BookOpen,
  Lightbulb,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Square,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { extractPDF, askTutor } from "../../services/api";


// ============================================================
// SUGGESTIONS
// ============================================================

const suggestions = [
  "Explain this topic in simple words.",
  "What are the most important points?",
  "Give me an example.",
  "Explain this step by step.",
  "Give me a practice question.",
  "Create 5 MCQs from this material.",
];


// ============================================================
// INITIAL MESSAGE
// ============================================================

const initialMessage = {
  id: "welcome-message",
  role: "assistant",
  content:
    "Welcome to STATWISE AI Tutor. Upload a PDF learning material first, then ask me questions about it. I will use your uploaded material to explain concepts, answer questions, and help you prepare.",
};


// ============================================================
// TUTOR COMPONENT
// ============================================================

export default function Tutor() {
  // ----------------------------------------------------------
  // FILE
  // ----------------------------------------------------------

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // ----------------------------------------------------------
  // PDF STATE
  // ----------------------------------------------------------

  const [pdfText, setPdfText] = useState("");
  const [pdfName, setPdfName] = useState("");
  const [pdfCharacters, setPdfCharacters] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);

  // ----------------------------------------------------------
  // LOADING
  // ----------------------------------------------------------

  const [uploading, setUploading] = useState(false);
  const [asking, setAsking] = useState(false);

  // ----------------------------------------------------------
  // CHAT
  // ----------------------------------------------------------

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    initialMessage,
  ]);

  // ----------------------------------------------------------
  // LEARNING SKILL
  // ----------------------------------------------------------

  const [activeSkill, setActiveSkill] = useState(
    "General Learning"
  );

  // ----------------------------------------------------------
  // BACKEND
  // ----------------------------------------------------------

  const [backendStatus, setBackendStatus] =
    useState("unknown");

  // ==========================================================
  // VOICE TUTOR STATE
  // ==========================================================

  const [isListening, setIsListening] = useState(false);

  const [voiceSupported, setVoiceSupported] =
    useState(true);

  const [autoSpeak, setAutoSpeak] = useState(true);

  const [isSpeaking, setIsSpeaking] = useState(false);

  const [interimTranscript, setInterimTranscript] =
    useState("");

  const [selectedVoice, setSelectedVoice] =
    useState("");

  const [availableVoices, setAvailableVoices] =
    useState([]);

  const recognitionRef = useRef(null);

  const finalTranscriptRef = useRef("");

  const voiceRequestRef = useRef(false);

  const messagesRef = useRef(messages);

  const pdfTextRef = useRef(pdfText);

  const activeSkillRef = useRef(activeSkill);

  const askingRef = useRef(asking);

  const autoSpeakRef = useRef(autoSpeak);

  // Keep refs updated
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    pdfTextRef.current = pdfText;
  }, [pdfText]);

  useEffect(() => {
    activeSkillRef.current = activeSkill;
  }, [activeSkill]);

  useEffect(() => {
    askingRef.current = asking;
  }, [asking]);

  useEffect(() => {
    autoSpeakRef.current = autoSpeak;
  }, [autoSpeak]);


  // ==========================================================
  // LOAD SAVED PDF
  // ==========================================================

  useEffect(() => {
    const savedText = sessionStorage.getItem(
      "statwise_tutor_pdf_text"
    );

    const savedName = sessionStorage.getItem(
      "statwise_tutor_pdf_name"
    );

    if (savedText) {
      setPdfText(savedText);
      setPdfCharacters(savedText.length);
    }

    if (savedName) {
      setPdfName(savedName);
    }
  }, []);


  // ==========================================================
  // AUTO SCROLL
  // ==========================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, asking]);


  // ==========================================================
  // SPEECH SYNTHESIS VOICES
  // ==========================================================

  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      return;
    }

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();

      setAvailableVoices(voices);

      if (voices.length > 0) {
        const preferred =
          voices.find(
            (voice) =>
              voice.lang === "en-IN"
          ) ||
          voices.find(
            (voice) =>
              voice.lang.startsWith("en")
          ) ||
          voices[0];

        setSelectedVoice(
          preferred.name
        );
      }
    };

    loadVoices();

    window.speechSynthesis.onvoiceschanged =
      loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged =
        null;

      window.speechSynthesis.cancel();
    };
  }, []);


  // ==========================================================
  // SPEAK AI RESPONSE
  // ==========================================================

  const speakText = (text) => {
    if (!("speechSynthesis" in window)) {
      toast.error(
        "Speech synthesis is not supported in this browser."
      );
      return;
    }

    if (!text) return;

    window.speechSynthesis.cancel();

    // Remove markdown symbols for natural speech
    const cleanText = text
      .replace(/[*#_`]/g, "")
      .replace(/\|/g, " ")
      .replace(/\n+/g, ". ")
      .trim();

    const utterance =
      new SpeechSynthesisUtterance(
        cleanText
      );

    utterance.lang = "en-IN";
    utterance.rate = 0.95;
    utterance.pitch = 1;

    const voice =
      availableVoices.find(
        (item) =>
          item.name === selectedVoice
      );

    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(
      utterance
    );
  };


  // ==========================================================
  // STOP AI SPEAKING
  // ==========================================================

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
  };


  // ==========================================================
  // SPEECH RECOGNITION SETUP
  // ==========================================================

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang = "en-IN";

    recognition.continuous = false;

    recognition.interimResults = true;

    recognition.maxAlternatives = 1;


    recognition.onstart = () => {
      setIsListening(true);
      setInterimTranscript("");
      finalTranscriptRef.current = "";

      toast.success(
        "Listening... Speak your question."
      );
    };


    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        const transcript =
          event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalText += transcript + " ";
        } else {
          interimText += transcript;
        }
      }

      if (finalText) {
        finalTranscriptRef.current +=
          finalText;
      }

      setInterimTranscript(
        interimText
      );

      setQuestion(
        `${finalTranscriptRef.current} ${interimText}`.trim()
      );
    };


    recognition.onerror = (event) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      setIsListening(false);

      if (
        event.error ===
        "not-allowed"
      ) {
        toast.error(
          "Microphone permission was denied. Please allow microphone access."
        );
      } else if (
        event.error ===
        "no-speech"
      ) {
        toast.error(
          "No speech detected. Please try again."
        );
      } else {
        toast.error(
          "Voice recognition failed. Please try again."
        );
      }
    };


    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");

      const spokenQuestion =
        finalTranscriptRef.current.trim();

      if (
        spokenQuestion &&
        pdfTextRef.current.trim() &&
        !askingRef.current
      ) {
        voiceRequestRef.current =
          true;

        // Automatically send voice question
        setTimeout(() => {
          submitQuestionRef.current?.(
            spokenQuestion
          );
        }, 100);
      }
    };

    recognitionRef.current =
      recognition;

    return () => {
      try {
        recognition.stop();
      } catch {
        // Ignore stop errors
      }

      recognitionRef.current =
        null;
    };
  }, []);


  // ==========================================================
  // START / STOP LISTENING
  // ==========================================================

  const toggleListening = () => {
    if (!voiceSupported) {
      toast.error(
        "Voice recognition is not supported. Please use Google Chrome."
      );
      return;
    }

    if (!pdfText.trim()) {
      toast.error(
        "Please upload a PDF before using Voice Tutor."
      );
      return;
    }

    if (asking) {
      toast.error(
        "Please wait for AI Tutor to finish."
      );
      return;
    }

    if (!recognitionRef.current) {
      toast.error(
        "Voice recognition is unavailable."
      );
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }

      return;
    }

    finalTranscriptRef.current = "";
    setQuestion("");
    setInterimTranscript("");

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error(error);
    }
  };


  // ==========================================================
  // OPEN FILE SELECTOR
  // ==========================================================

  const handleSelectPDF = () => {
    if (uploading) return;

    fileInputRef.current?.click();
  };


  // ==========================================================
  // PDF UPLOAD
  // ==========================================================

  const handlePDFUpload = async (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    const isPDF =
      file.type ===
        "application/pdf" ||
      file.name
        .toLowerCase()
        .endsWith(".pdf");

    if (!isPDF) {
      toast.error(
        "Please select a PDF file only."
      );

      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setUploading(true);

    const loadingToast =
      toast.loading(
        "Reading your PDF..."
      );

    try {
      const result =
        await extractPDF(file);

      if (!result) {
        throw new Error(
          "No response received from backend."
        );
      }

      if (result.success === false) {
        throw new Error(
          result.message ||
            "PDF extraction failed."
        );
      }

      const extractedText =
        result.text || "";

      if (!extractedText.trim()) {
        throw new Error(
          "No readable text was found in this PDF."
        );
      }

      const characterCount =
        result.characters ||
        extractedText.length;

      setPdfText(
        extractedText
      );

      setPdfName(
        file.name
      );

      setPdfCharacters(
        characterCount
      );

      sessionStorage.setItem(
        "statwise_tutor_pdf_text",
        extractedText
      );

      sessionStorage.setItem(
        "statwise_tutor_pdf_name",
        file.name
      );

      setMessages([
        {
          id: `pdf-${Date.now()}`,
          role: "assistant",
          content:
            `I've successfully loaded "${file.name}".\n\n` +
            `I extracted ${characterCount.toLocaleString()} characters from the document.\n\n` +
            "You can now ask me questions about this learning material.",
        },
      ]);

      setBackendStatus(
        "connected"
      );

      toast.success(
        "PDF uploaded successfully!",
        {
          id: loadingToast,
        }
      );
    } catch (error) {
      console.error(
        "PDF upload error:",
        error
      );

      setSelectedFile(null);
      setPdfText("");
      setPdfName("");
      setPdfCharacters(0);

      sessionStorage.removeItem(
        "statwise_tutor_pdf_text"
      );

      sessionStorage.removeItem(
        "statwise_tutor_pdf_name"
      );

      toast.error(
        error?.message ||
          "Failed to process PDF.",
        {
          id: loadingToast,
        }
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };


  // ==========================================================
  // ASK QUESTION REF
  // ==========================================================

  const submitQuestionRef =
    useRef(null);


  // ==========================================================
  // ASK AI TUTOR
  // ==========================================================

  const handleAskQuestion = async (
    customQuestion = null
  ) => {
    const trimmedQuestion =
      (
        customQuestion !== null
          ? customQuestion
          : question
      ).trim();

    if (!trimmedQuestion) {
      toast.error(
        "Please enter a question."
      );
      return;
    }

    if (!pdfText.trim()) {
      toast.error(
        "Please upload a PDF before asking questions."
      );
      return;
    }

    if (askingRef.current) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmedQuestion,
    };

    setMessages(
      (previous) => [
        ...previous,
        userMessage,
      ]
    );

    setQuestion("");
    setInterimTranscript("");
    setAsking(true);

    askingRef.current = true;

    try {
      const conversationHistory =
        messagesRef.current
          .filter(
            (message) =>
              message.role ===
                "user" ||
              message.role ===
                "assistant"
          )
          .slice(-8)
          .map(
            (message) => ({
              role: message.role,
              content:
                message.content,
            })
          );

      const result =
        await askTutor({
          question:
            trimmedQuestion,

          pdfText:
            pdfText,

          conversationHistory:
            conversationHistory,

          skill:
            activeSkill,
        });

      if (!result) {
        throw new Error(
          "No response received from AI Tutor."
        );
      }

      if (result.success === false) {
        throw new Error(
          result.message ||
            "AI Tutor failed."
        );
      }

      const answer =
        result.answer ||
        "I could not generate an answer.";

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: answer,
      };

      setMessages(
        (previous) => [
          ...previous,
          assistantMessage,
        ]
      );

      setBackendStatus(
        "connected"
      );

      // ======================================================
      // AUTOMATIC VOICE RESPONSE
      // ======================================================

      if (
        voiceRequestRef.current ||
        autoSpeakRef.current
      ) {
        setTimeout(() => {
          speakText(answer);
        }, 300);
      }

      voiceRequestRef.current =
        false;
    } catch (error) {
      console.error(
        "AI Tutor error:",
        error
      );

      setMessages(
        (previous) => [
          ...previous,
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            isError: true,
            content:
              error?.message ||
              "Sorry, I could not connect to the AI Tutor.",
          },
        ]
      );

      toast.error(
        error?.message ||
          "AI Tutor request failed."
      );

      voiceRequestRef.current =
        false;
    } finally {
      setAsking(false);
      askingRef.current = false;
    }
  };


  // Keep latest function available to speech recognition
  useEffect(() => {
    submitQuestionRef.current =
      handleAskQuestion;
  });


  // ==========================================================
  // ENTER KEY
  // ==========================================================

  const handleKeyDown = (
    event
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      handleAskQuestion();
    }
  };


  // ==========================================================
  // SUGGESTION
  // ==========================================================

  const handleSuggestion = (
    text
  ) => {
    if (!pdfText.trim()) {
      toast.error(
        "Please upload a PDF first."
      );
      return;
    }

    setQuestion(text);
  };


  // ==========================================================
  // REMOVE PDF
  // ==========================================================

  const removePDF = () => {
    stopSpeaking();

    setSelectedFile(null);
    setPdfText("");
    setPdfName("");
    setPdfCharacters(0);

    sessionStorage.removeItem(
      "statwise_tutor_pdf_text"
    );

    sessionStorage.removeItem(
      "statwise_tutor_pdf_name"
    );

    setMessages([
      initialMessage,
    ]);

    toast.success(
      "PDF removed."
    );
  };


  // ==========================================================
  // CLEAR CHAT
  // ==========================================================

  const clearChat = () => {
    stopSpeaking();

    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: pdfText
          ? `Your PDF "${pdfName}" is still loaded. Ask me anything about it.`
          : initialMessage.content,
      },
    ]);

    toast.success(
      "Chat cleared."
    );
  };


  // ==========================================================
  // COPY ANSWER
  // ==========================================================

  const copyAnswer = async (
    text
  ) => {
    try {
      await navigator.clipboard.writeText(
        text
      );

      toast.success(
        "Answer copied!"
      );
    } catch {
      toast.error(
        "Could not copy answer."
      );
    }
  };


  // ==========================================================
  // REGENERATE
  // ==========================================================

  const regenerateLastAnswer =
    async () => {
      if (asking) return;

      const lastUserMessage =
        [...messages]
          .reverse()
          .find(
            (message) =>
              message.role ===
              "user"
          );

      if (!lastUserMessage) {
        toast.error(
          "There is no question to regenerate."
        );
        return;
      }

      if (!pdfText.trim()) {
        toast.error(
          "Please upload a PDF first."
        );
        return;
      }

      await handleAskQuestion(
        lastUserMessage.content
      );
    };


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#fffdf5] text-[#172033]">

      {/* Background */}

      <div className="fixed inset-0 pointer-events-none overflow-hidden">

        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-yellow-200/30 blur-3xl" />

        <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-blue-200/20 blur-3xl" />

        <div className="absolute bottom-0 left-1/3 w-96 h-96 rounded-full bg-purple-200/10 blur-3xl" />

      </div>


      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="relative z-10 border-b border-slate-200 bg-white/85 backdrop-blur-xl">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">

          <div className="flex items-center justify-between gap-4">

            <div className="flex items-center gap-3">

              <motion.div
                initial={{
                  scale: 0.8,
                  opacity: 0,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                className="w-12 h-12 rounded-2xl bg-[#172033] flex items-center justify-center shadow-lg"
              >
                <Brain className="w-6 h-6 text-yellow-300" />
              </motion.div>

              <div>

                <h1 className="text-xl sm:text-2xl font-bold">
                  STATWISE AI Tutor
                </h1>

                <p className="text-xs sm:text-sm text-slate-500">
                  Personalized learning from your study material
                </p>

              </div>

            </div>


            <div className="hidden sm:flex items-center gap-2">

              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  backendStatus === "connected"
                    ? "bg-green-500"
                    : "bg-yellow-500"
                }`}
              />

              <span className="text-sm text-slate-600">
                {backendStatus === "connected"
                  ? "AI Connected"
                  : "AI Tutor"}
              </span>

            </div>

          </div>

        </div>

      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6">

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">


          {/* =================================================
              LEFT SIDEBAR
          ================================================= */}

          <aside className="space-y-5">


            {/* PDF */}

            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-5">

              <div className="flex items-center justify-between mb-4">

                <div>

                  <h2 className="font-bold text-lg">
                    Learning Material
                  </h2>

                  <p className="text-xs text-slate-500 mt-1">
                    Upload your PDF
                  </p>

                </div>

                <FileText className="w-6 h-6 text-yellow-500" />

              </div>


              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handlePDFUpload}
                className="hidden"
              />


              {!pdfText ? (

                <motion.button
                  type="button"
                  whileHover={{
                    scale: 1.02,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  onClick={
                    handleSelectPDF
                  }
                  disabled={uploading}
                  className="w-full border-2 border-dashed border-slate-300 hover:border-yellow-400 rounded-2xl p-7 transition bg-slate-50 hover:bg-yellow-50 disabled:opacity-60"
                >

                  {uploading ? (

                    <div className="flex flex-col items-center">

                      <Loader2 className="w-9 h-9 animate-spin text-yellow-500 mb-3" />

                      <span className="font-semibold">
                        Processing PDF...
                      </span>

                      <span className="text-xs text-slate-500 mt-1">
                        Extracting learning content
                      </span>

                    </div>

                  ) : (

                    <div className="flex flex-col items-center">

                      <div className="w-14 h-14 rounded-2xl bg-yellow-100 flex items-center justify-center mb-3">

                        <Upload className="w-7 h-7 text-yellow-700" />

                      </div>

                      <span className="font-semibold">
                        Upload PDF
                      </span>

                      <span className="text-xs text-slate-500 mt-1">
                        Click to choose a PDF
                      </span>

                      <span className="text-[11px] text-slate-400 mt-2">
                        PDF files only
                      </span>

                    </div>

                  )}

                </motion.button>

              ) : (

                <div className="space-y-3">

                  <div className="rounded-2xl border border-green-200 bg-green-50 p-4">

                    <div className="flex gap-3">

                      <div className="w-10 h-10 shrink-0 rounded-xl bg-white flex items-center justify-center">

                        <FileText className="w-5 h-5 text-green-600" />

                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="font-semibold text-sm truncate">
                          {pdfName}
                        </p>

                        <p className="text-xs text-green-700 mt-1">
                          {pdfCharacters.toLocaleString()} characters extracted
                        </p>

                        <div className="flex items-center gap-1 mt-2 text-xs text-green-700">

                          <CheckCircle2 className="w-3.5 h-3.5" />

                          Ready for AI Tutor

                        </div>

                      </div>

                    </div>

                  </div>


                  <button
                    type="button"
                    onClick={
                      handleSelectPDF
                    }
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-medium"
                  >

                    <RefreshCw className="w-4 h-4" />

                    Change PDF

                  </button>


                  <button
                    type="button"
                    onClick={removePDF}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium"
                  >

                    <X className="w-4 h-4" />

                    Remove PDF

                  </button>

                </div>

              )}

            </div>


            {/* Learning Focus */}

            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-5">

              <div className="flex items-center gap-2 mb-3">

                <Sparkles className="w-5 h-5 text-yellow-500" />

                <h3 className="font-bold">
                  Learning Focus
                </h3>

              </div>


              <select
                value={activeSkill}
                onChange={(event) =>
                  setActiveSkill(
                    event.target.value
                  )
                }
                className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-yellow-300"
              >

                <option>
                  General Learning
                </option>

                <option>
                  Statistics
                </option>

                <option>
                  Probability
                </option>

                <option>
                  Data Analysis
                </option>

                <option>
                  Data Visualization
                </option>

                <option>
                  Statistical Computing
                </option>

                <option>
                  Python
                </option>

                <option>
                  Machine Learning
                </option>

              </select>

            </div>


            {/* Capabilities */}

            <div className="bg-[#172033] text-white rounded-3xl p-5 shadow-lg">

              <div className="flex items-center gap-2 mb-4">

                <Sparkles className="w-5 h-5 text-yellow-300" />

                <h3 className="font-bold">
                  AI Tutor
                </h3>

              </div>


              <div className="space-y-3 text-sm">

                {[
                  "Explain concepts",
                  "Step-by-step solutions",
                  "Simple examples",
                  "Practice questions",
                  "Generate MCQs",
                  "Voice-based learning",
                ].map((item) => (

                  <div
                    key={item}
                    className="flex gap-2"
                  >

                    <CheckCircle2 className="w-4 h-4 text-yellow-300 mt-0.5" />

                    <span>
                      {item}
                    </span>

                  </div>

                ))}

              </div>

            </div>

          </aside>


          {/* =================================================
              AI TUTOR
          ================================================= */}

          <section className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[700px]">


            {/* CHAT HEADER */}

            <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-2xl bg-yellow-100 flex items-center justify-center">

                  <Bot className="w-6 h-6 text-yellow-700" />

                </div>

                <div>

                  <h2 className="font-bold">
                    AI Learning Assistant
                  </h2>

                  <div className="flex items-center gap-2 text-xs text-slate-500">

                    <span
                      className={`w-2 h-2 rounded-full ${
                        pdfText
                          ? "bg-green-500"
                          : "bg-slate-300"
                      }`}
                    />

                    {pdfText
                      ? "PDF context loaded"
                      : "Waiting for PDF"}

                  </div>

                </div>

              </div>


              <button
                type="button"
                onClick={clearChat}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-600"
              >

                <Trash2 className="w-4 h-4" />

                <span className="hidden sm:inline">
                  Clear
                </span>

              </button>

            </div>


            {/* =================================================
                VOICE TUTOR PANEL
            ================================================= */}

            <div className="px-4 sm:px-6 pt-5">

              <motion.div
                layout
                className={`relative overflow-hidden rounded-3xl border-2 transition-all duration-300 ${
                  isListening
                    ? "border-red-300 bg-red-50"
                    : "border-yellow-200 bg-gradient-to-r from-[#fffdf0] to-[#fff8dc]"
                }`}
              >

                {/* Animated glow */}

                {isListening && (
                  <>
                    <motion.div
                      animate={{
                        scale: [
                          1,
                          1.5,
                          1,
                        ],
                        opacity: [
                          0.3,
                          0,
                          0.3,
                        ],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                      className="absolute left-10 top-8 w-24 h-24 rounded-full bg-red-300 blur-2xl"
                    />
                  </>
                )}


                <div className="relative p-5">

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                    {/* Voice information */}

                    <div className="flex items-center gap-4">

                      <motion.div
                        animate={
                          isListening
                            ? {
                                scale: [
                                  1,
                                  1.12,
                                  1,
                                ],
                              }
                            : {}
                        }
                        transition={{
                          duration: 0.9,
                          repeat: Infinity,
                        }}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                          isListening
                            ? "bg-red-500 text-white"
                            : "bg-[#172033] text-yellow-300"
                        }`}
                      >

                        {isListening ? (
                          <MicOff className="w-7 h-7" />
                        ) : (
                          <Mic className="w-7 h-7" />
                        )}

                      </motion.div>


                      <div>

                        <div className="flex items-center gap-2">

                          <h3 className="font-bold text-lg">
                            Voice Tutor
                          </h3>

                          <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">
                            LIVE
                          </span>

                        </div>


                        <p className="text-xs sm:text-sm text-slate-500 mt-1">

                          {isListening
                            ? "Listening to your question..."
                            : "Speak naturally and learn with AI"}

                        </p>

                      </div>

                    </div>


                    {/* Microphone button */}

                    <motion.button
                      type="button"
                      whileHover={{
                        scale: 1.04,
                      }}
                      whileTap={{
                        scale: 0.95,
                      }}
                      onClick={
                        toggleListening
                      }
                      disabled={
                        !pdfText ||
                        asking ||
                        !voiceSupported
                      }
                      className={`px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-semibold transition shadow-md ${
                        isListening
                          ? "bg-red-500 text-white hover:bg-red-600"
                          : "bg-[#172033] text-white hover:bg-[#25314a]"
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >

                      {isListening ? (
                        <>
                          <Square className="w-4 h-4 fill-current" />
                          Stop & Send
                        </>
                      ) : (
                        <>
                          <Mic className="w-5 h-5" />
                          Speak
                        </>
                      )}

                    </motion.button>

                  </div>


                  {/* Listening status */}

                  <AnimatePresence>

                    {isListening && (

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
                        className="mt-4"
                      >

                        <div className="rounded-2xl bg-white/80 border border-red-100 p-4">

                          <div className="flex items-center gap-2 mb-2">

                            <div className="flex gap-1">

                              {[1, 2, 3, 4, 5].map(
                                (bar) => (

                                  <motion.div
                                    key={bar}
                                    animate={{
                                      height: [
                                        5,
                                        18,
                                        8,
                                        22,
                                        5,
                                      ],
                                    }}
                                    transition={{
                                      duration:
                                        0.8,
                                      repeat:
                                        Infinity,
                                      delay:
                                        bar * 0.08,
                                    }}
                                    className="w-1 rounded-full bg-red-500"
                                  />

                                )
                              )}

                            </div>

                            <span className="text-xs font-semibold text-red-600">
                              Listening...
                            </span>

                          </div>


                          <p className="text-sm text-slate-700 min-h-[24px]">

                            {question ||
                              "Start speaking..."}

                          </p>

                        </div>

                      </motion.div>

                    )}

                  </AnimatePresence>


                  {/* Voice controls */}

                  <div className="mt-4 flex flex-wrap items-center gap-3">

                    <button
                      type="button"
                      onClick={() =>
                        setAutoSpeak(
                          (value) =>
                            !value
                        )
                      }
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border ${
                        autoSpeak
                          ? "bg-[#172033] text-white border-[#172033]"
                          : "bg-white text-slate-600 border-slate-200"
                      }`}
                    >

                      {autoSpeak ? (
                        <Volume2 className="w-4 h-4" />
                      ) : (
                        <VolumeX className="w-4 h-4" />
                      )}

                      Auto voice reply:{" "}
                      {autoSpeak
                        ? "ON"
                        : "OFF"}

                    </button>


                    {isSpeaking && (

                      <button
                        type="button"
                        onClick={
                          stopSpeaking
                        }
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-red-50 text-red-600 border border-red-200"
                      >

                        <VolumeX className="w-4 h-4" />

                        Stop AI voice

                      </button>

                    )}


                    {!voiceSupported && (

                      <span className="text-xs text-red-500">
                        Voice recognition requires Google Chrome.
                      </span>

                    )}

                  </div>

                </div>

              </motion.div>

            </div>


            {/* =================================================
                MESSAGES
            ================================================= */}

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">

              {!pdfText && (

                <div className="max-w-xl mx-auto mb-8 text-center">

                  <motion.div
                    initial={{
                      scale: 0.8,
                      opacity: 0,
                    }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                    }}
                    className="w-20 h-20 mx-auto rounded-3xl bg-yellow-100 flex items-center justify-center mb-4"
                  >

                    <BookOpen className="w-10 h-10 text-yellow-700" />

                  </motion.div>

                  <h3 className="text-xl font-bold">
                    Upload your learning material
                  </h3>

                  <p className="text-sm text-slate-500 mt-2">
                    Upload a PDF from the left panel.
                    Once processed, you can ask the
                    AI Tutor questions about it.
                  </p>

                  <button
                    type="button"
                    onClick={
                      handleSelectPDF
                    }
                    disabled={uploading}
                    className="mt-5 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#172033] text-white hover:bg-[#25314a] font-semibold disabled:opacity-50"
                  >

                    <Upload className="w-4 h-4" />

                    Upload PDF

                  </button>

                </div>

              )}


              <div className="space-y-5">

                <AnimatePresence initial={false}>

                  {messages.map(
                    (message) => (

                      <motion.div
                        key={message.id}
                        initial={{
                          opacity: 0,
                          y: 10,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        className={`flex gap-3 ${
                          message.role ===
                          "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >

                        {message.role ===
                          "assistant" && (

                          <div className="w-9 h-9 shrink-0 rounded-xl bg-[#172033] flex items-center justify-center">

                            <Bot className="w-5 h-5 text-yellow-300" />

                          </div>

                        )}


                        <div
                          className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
                            message.role ===
                            "user"
                              ? "bg-[#172033] text-white rounded-br-md"
                              : message.isError
                              ? "bg-red-50 border border-red-200 text-red-700 rounded-bl-md"
                              : "bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-md"
                          }`}
                        >

                          {message.isError && (

                            <div className="flex items-center gap-2 mb-2 font-semibold text-sm">

                              <AlertCircle className="w-4 h-4" />

                              Tutor Error

                            </div>

                          )}


                          <div className="whitespace-pre-wrap text-sm leading-7">

                            {message.content}

                          </div>


                          {message.role ===
                            "assistant" &&
                            !message.isError &&
                            message.id !==
                              "welcome-message" && (

                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200">

                              {/* Copy */}

                              <button
                                type="button"
                                onClick={() =>
                                  copyAnswer(
                                    message.content
                                  )
                                }
                                className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-blue-600"
                                title="Copy answer"
                              >

                                <Copy className="w-4 h-4" />

                              </button>


                              {/* Speak */}

                              <button
                                type="button"
                                onClick={() =>
                                  speakText(
                                    message.content
                                  )
                                }
                                className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-yellow-600"
                                title="Read answer aloud"
                              >

                                <Volume2 className="w-4 h-4" />

                              </button>


                              {/* Like */}

                              <button
                                type="button"
                                className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-green-600"
                                title="Helpful"
                              >

                                <ThumbsUp className="w-4 h-4" />

                              </button>


                              {/* Dislike */}

                              <button
                                type="button"
                                className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-red-600"
                                title="Not helpful"
                              >

                                <ThumbsDown className="w-4 h-4" />

                              </button>


                              {/* Regenerate */}

                              <button
                                type="button"
                                onClick={
                                  regenerateLastAnswer
                                }
                                disabled={
                                  asking
                                }
                                className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-blue-600 disabled:opacity-40"
                                title="Regenerate"
                              >

                                <RefreshCw className="w-4 h-4" />

                              </button>

                            </div>

                          )}

                        </div>


                        {message.role ===
                          "user" && (

                          <div className="w-9 h-9 shrink-0 rounded-xl bg-yellow-100 flex items-center justify-center">

                            <User className="w-5 h-5 text-yellow-700" />

                          </div>

                        )}

                      </motion.div>

                    )
                  )}

                </AnimatePresence>


                {/* AI THINKING */}

                <AnimatePresence>

                  {asking && (

                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: 10,
                      }}
                      className="flex gap-3"
                    >

                      <div className="w-9 h-9 shrink-0 rounded-xl bg-[#172033] flex items-center justify-center">

                        <Bot className="w-5 h-5 text-yellow-300" />

                      </div>


                      <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3">

                        <div className="flex items-center gap-2 text-sm text-slate-500">

                          <Loader2 className="w-4 h-4 animate-spin" />

                          <span>
                            STATWISE AI is thinking...
                          </span>

                        </div>

                      </div>

                    </motion.div>

                  )}

                </AnimatePresence>


                <div ref={messagesEndRef} />

              </div>

            </div>


            {/* =================================================
                SUGGESTIONS
            ================================================= */}

            <div className="px-4 sm:px-6 pb-3">

              <div className="flex items-center gap-2 mb-2">

                <Lightbulb className="w-4 h-4 text-yellow-500" />

                <span className="text-xs font-semibold text-slate-500">
                  Try asking
                </span>

              </div>


              <div className="flex gap-2 overflow-x-auto pb-2">

                {suggestions.map(
                  (suggestion) => (

                    <button
                      key={suggestion}
                      type="button"
                      onClick={() =>
                        handleSuggestion(
                          suggestion
                        )
                      }
                      disabled={
                        !pdfText ||
                        asking
                      }
                      className="whitespace-nowrap px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-yellow-50 hover:border-yellow-300 text-xs text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {suggestion}
                    </button>

                  )
                )}

              </div>

            </div>


            {/* =================================================
                INPUT
            ================================================= */}

            <div className="border-t border-slate-200 p-4 sm:p-5">

              <div className="flex items-end gap-2">


                {/* PDF */}

                <button
                  type="button"
                  onClick={
                    handleSelectPDF
                  }
                  disabled={uploading}
                  title="Upload PDF"
                  className="w-11 h-11 shrink-0 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-yellow-50 hover:border-yellow-300 disabled:opacity-50"
                >

                  <Paperclip className="w-5 h-5 text-slate-500" />

                </button>


                {/* TEXT */}

                <textarea
                  value={question}
                  onChange={(event) =>
                    setQuestion(
                      event.target.value
                    )
                  }
                  onKeyDown={
                    handleKeyDown
                  }
                  disabled={
                    !pdfText ||
                    asking
                  }
                  placeholder={
                    pdfText
                      ? "Ask anything about your PDF or use 🎤 Voice Tutor..."
                      : "Upload a PDF first..."
                  }
                  rows={1}
                  className="flex-1 resize-none px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:opacity-60"
                />


                {/* MICROPHONE */}

                <motion.button
                  type="button"
                  whileTap={{
                    scale: 0.92,
                  }}
                  onClick={
                    toggleListening
                  }
                  disabled={
                    !pdfText ||
                    asking ||
                    !voiceSupported
                  }
                  title={
                    isListening
                      ? "Stop and send voice question"
                      : "Voice Tutor"
                  }
                  className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center transition ${
                    isListening
                      ? "bg-red-500 text-white"
                      : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                  } disabled:opacity-40`}
                >

                  {isListening ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}

                </motion.button>


                {/* SEND */}

                <button
                  type="button"
                  onClick={() =>
                    handleAskQuestion()
                  }
                  disabled={
                    !pdfText ||
                    !question.trim() ||
                    asking
                  }
                  className="w-11 h-11 shrink-0 rounded-xl bg-[#172033] text-white flex items-center justify-center hover:bg-[#25314a] disabled:opacity-40 disabled:cursor-not-allowed transition"
                >

                  {asking ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}

                </button>

              </div>


              <div className="flex items-center justify-between mt-2 px-1">

                <div className="text-[11px] text-slate-400">

                  {pdfText
                    ? "Enter to send • 🎤 Speak to use Voice Tutor"
                    : "Upload PDF to start"}

                </div>


                <div className="text-[11px] text-slate-400">

                  {pdfText
                    ? `${pdfCharacters.toLocaleString()} chars loaded`
                    : "No PDF loaded"}

                </div>

              </div>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}