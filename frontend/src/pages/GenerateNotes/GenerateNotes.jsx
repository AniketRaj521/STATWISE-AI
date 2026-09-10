import { useState } from "react";

import {
  Upload,
  FileText,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Download,
  RotateCcw,
  Brain,
  Languages,
} from "lucide-react";

import toast from "react-hot-toast";

const API_URL = "http://127.0.0.1:8000";

function GenerateNotes() {
  const [file, setFile] = useState(null);
  const [topic, setTopic] = useState("");

  // ==========================================================
  // LANGUAGE STATE
  // ==========================================================
  const [language, setLanguage] = useState(
    localStorage.getItem("statwise_language") || "English"
  );

  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState(null);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // ==========================================================
  // LANGUAGE CHANGE
  // ==========================================================
  const handleLanguageChange = (event) => {
    const selectedLanguage = event.target.value;

    setLanguage(selectedLanguage);

    // Save selected language for other STATWISE AI features
    localStorage.setItem(
      "statwise_language",
      selectedLanguage
    );

    toast.success(`Language changed to ${selectedLanguage}`);
  };

  // ==========================================================
  // FILE SELECT
  // ==========================================================
  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      toast.error("Please select a PDF file.");
      return;
    }

    setFile(selectedFile);
    setNotes(null);
    setError("");

    toast.success("PDF selected successfully.");
  };

  // ==========================================================
  // DRAG & DROP
  // ==========================================================
  const handleDragOver = (event) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);

    const droppedFile = event.dataTransfer.files?.[0];

    if (!droppedFile) return;

    if (droppedFile.type !== "application/pdf") {
      toast.error("Only PDF files are supported.");
      return;
    }

    setFile(droppedFile);
    setNotes(null);
    setError("");

    toast.success("PDF added successfully.");
  };

  // ==========================================================
  // NORMALIZE NOTES RESPONSE
  // ==========================================================
  const normalizeNotes = (data) => {
    if (!data) return null;

    // Direct notes object
    if (
      data.notes &&
      typeof data.notes === "object"
    ) {
      return data.notes;
    }

    // Nested result
    if (
      data.result &&
      data.result.notes &&
      typeof data.result.notes === "object"
    ) {
      return data.result.notes;
    }

    // If notes itself is a JSON string
    if (typeof data.notes === "string") {
      try {
        return JSON.parse(data.notes);
      } catch {
        return {
          title: "Generated Notes",
          summary: data.notes,
          key_points: [],
          sections: [],
          important_terms: [],
          formulas: [],
          quick_revision: [],
          practice_questions: [],
        };
      }
    }

    return null;
  };

  // ==========================================================
  // GENERATE NOTES
  // ==========================================================
  const handleGenerateNotes = async () => {
    setError("");
    setNotes(null);

    if (!file && !topic.trim()) {
      toast.error("Upload a PDF or enter a topic first.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      // ======================================================
      // LANGUAGE SUPPORT
      // ======================================================

      // Use the CURRENT selected dropdown language
      formData.append("language", language);

      // Backend accepts file
      if (file) {
        formData.append("file", file);
      }

      // Backend accepts topic
      if (topic.trim()) {
        formData.append("topic", topic.trim());
      }

      console.log(
        "Selected learning language:",
        language
      );

      console.log(
        "Sending request to:",
        `${API_URL}/generate-notes`
      );

      console.log(
        "File:",
        file?.name || "No file"
      );

      console.log(
        "Topic:",
        topic
      );

      const response = await fetch(
        `${API_URL}/generate-notes`,
        {
          method: "POST",
          body: formData,
        }
      );

      const rawText = await response.text();

      console.log(
        "Backend status:",
        response.status
      );

      console.log(
        "Backend raw response:",
        rawText
      );

      let data;

      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(
          `Backend returned an invalid response: ${rawText.substring(
            0,
            500
          )}`
        );
      }

      console.log(
        "Backend JSON:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            data?.error ||
            `Backend error ${response.status}`
        );
      }

      if (data.success === false) {
        throw new Error(
          data.message ||
            data.error ||
            "The backend could not generate notes."
        );
      }

      const generatedNotes =
        normalizeNotes(data);

      if (!generatedNotes) {
        console.error(
          "Unexpected backend response:",
          data
        );

        throw new Error(
          "Backend responded successfully, but no notes were found in the response."
        );
      }

      setNotes(generatedNotes);

      toast.success(
        `AI notes generated in ${language}!`
      );

      // Scroll to notes
      setTimeout(() => {
        document
          .getElementById("generated-notes")
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }, 200);
    } catch (err) {
      console.error(
        "Generate Notes Error:",
        err
      );

      const message =
        err?.message ||
        "Unable to generate notes. Please check the backend.";

      setError(message);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // COPY NOTES
  // ==========================================================
  const copyNotes = async () => {
    if (!notes) return;

    const text = buildPlainText(notes);

    try {
      await navigator.clipboard.writeText(text);

      toast.success(
        "Notes copied to clipboard."
      );
    } catch {
      toast.error(
        "Unable to copy notes."
      );
    }
  };

  // ==========================================================
  // DOWNLOAD NOTES
  // ==========================================================
  const downloadNotes = () => {
    if (!notes) return;

    const text = buildPlainText(notes);

    const blob = new Blob([text], {
      type: "text/plain;charset=utf-8",
    });

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "STATWISE_AI_Notes.txt";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    toast.success(
      "Notes downloaded."
    );
  };

  // ==========================================================
  // BUILD TEXT
  // ==========================================================
  const buildPlainText = (data) => {
    let output = "";

    output += `${
      data.title || "STATWISE AI Notes"
    }\n\n`;

    if (data.summary) {
      output += `SUMMARY\n`;
      output += `${data.summary}\n\n`;
    }

    if (
      Array.isArray(data.key_points) &&
      data.key_points.length
    ) {
      output += `KEY POINTS\n`;

      data.key_points.forEach(
        (point, index) => {
          output += `${index + 1}. ${point}\n`;
        }
      );

      output += "\n";
    }

    if (
      Array.isArray(data.sections)
    ) {
      output += `SECTIONS\n\n`;

      data.sections.forEach(
        (section) => {
          output += `${
            section.heading || "Section"
          }\n`;

          output += `${
            section.content || ""
          }\n`;

          if (
            Array.isArray(
              section.important_points
            ) &&
            section.important_points.length
          ) {
            section.important_points.forEach(
              (point) => {
                output += `• ${point}\n`;
              }
            );
          }

          if (
            Array.isArray(
              section.key_points
            ) &&
            section.key_points.length
          ) {
            section.key_points.forEach(
              (point) => {
                output += `• ${point}\n`;
              }
            );
          }

          if (
            Array.isArray(
              section.examples
            ) &&
            section.examples.length
          ) {
            output += `Examples:\n`;

            section.examples.forEach(
              (example) => {
                output += `- ${example}\n`;
              }
            );
          }

          output += "\n";
        }
      );
    }

    if (
      Array.isArray(
        data.important_terms
      ) &&
      data.important_terms.length
    ) {
      output += `IMPORTANT TERMS\n\n`;

      data.important_terms.forEach(
        (item) => {
          output += `${
            item.term || ""
          }: ${
            item.meaning || ""
          }\n`;
        }
      );

      output += "\n";
    }

    if (
      Array.isArray(data.formulas) &&
      data.formulas.length
    ) {
      output += `FORMULAS\n\n`;

      data.formulas.forEach(
        (item) => {
          output += `${
            item.name || "Formula"
          }\n`;

          output += `${
            item.formula || ""
          }\n`;

          output += `${
            item.explanation || ""
          }\n\n`;
        }
      );
    }

    // Support backend format:
    // important_formulas
    if (
      Array.isArray(
        data.important_formulas
      ) &&
      data.important_formulas.length
    ) {
      output += `IMPORTANT FORMULAS\n\n`;

      data.important_formulas.forEach(
        (item) => {
          output += `${
            item.formula || "Formula"
          }\n`;

          output += `${
            item.explanation || ""
          }\n\n`;
        }
      );
    }

    if (
      Array.isArray(
        data.quick_revision
      ) &&
      data.quick_revision.length
    ) {
      output += `QUICK REVISION\n`;

      data.quick_revision.forEach(
        (item, index) => {
          output += `${index + 1}. ${item}\n`;
        }
      );

      output += "\n";
    }

    if (
      Array.isArray(
        data.exam_points
      ) &&
      data.exam_points.length
    ) {
      output += `EXAM POINTS\n`;

      data.exam_points.forEach(
        (item, index) => {
          output += `${index + 1}. ${item}\n`;
        }
      );

      output += "\n";
    }

    if (
      Array.isArray(
        data.practice_questions
      ) &&
      data.practice_questions.length
    ) {
      output += `PRACTICE QUESTIONS\n`;

      data.practice_questions.forEach(
        (question, index) => {
          output += `${index + 1}. ${question}\n`;
        }
      );
    }

    if (data.conclusion) {
      output += `\nCONCLUSION\n`;
      output += `${data.conclusion}\n`;
    }

    return output;
  };

  // ==========================================================
  // RESET
  // ==========================================================
  const resetGenerator = () => {
    setFile(null);
    setTopic("");
    setNotes(null);
    setError("");

    // Keep selected language
  };

  // ==========================================================
  // RENDER
  // ==========================================================
  return (
    <div className="min-h-screen bg-[#fffdf5] text-[#172033]">

      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <div className="bg-[#172033] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">

          <div className="flex items-center gap-3">

            <Brain
              size={22}
              className="text-[#F6D76A]"
            />

            <span className="font-bold">
              STATWISE AI
            </span>

            <span className="hidden text-white/40 sm:block">
              /
            </span>

            <span className="hidden text-sm text-white/60 sm:block">
              AI Notes Generator
            </span>

          </div>

          <div className="flex items-center gap-2 text-xs text-white/60">

            <Sparkles size={14} />

            AI Powered

          </div>

        </div>
      </div>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden border-b border-[#ead58b] bg-[#FFF8D9]">

        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#F6D76A]/30 blur-3xl" />

        <div className="absolute -right-24 top-10 h-80 w-80 rounded-full bg-yellow-200/40 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:py-20">

          <div className="mx-auto max-w-4xl text-center">

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#172033] shadow-lg">

              <BookOpen
                size={30}
                className="text-[#F6D76A]"
              />

            </div>

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E4CE70] bg-white px-4 py-2 text-xs font-bold text-[#9A6900] shadow-sm">

              <Sparkles size={14} />

              AI LEARNING INTELLIGENCE

            </div>

            <h1 className="text-4xl font-black tracking-tight md:text-6xl">

              Generate

              <span className="text-[#C28A00]">
                {" "}Smart Notes
              </span>

            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">

              Upload your learning material and let STATWISE AI
              transform it into concise, structured and
              exam-ready study notes.

            </p>

          </div>

        </div>

      </section>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-6xl px-6 py-12">

        {/* ===================================================
            INPUT CARD
        =================================================== */}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg md:p-8">

          <div className="mb-7">

            <h2 className="text-2xl font-black">
              Create Your Notes
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Upload a PDF, select your language,
              enter a topic, or use both.
            </p>

          </div>

          {/* =================================================
              TOPIC
          ================================================= */}

          <div className="mb-6">

            <label className="mb-2 block text-sm font-bold text-[#172033]">
              Topic / Additional Instruction
            </label>

            <textarea
              value={topic}
              onChange={(e) =>
                setTopic(e.target.value)
              }
              placeholder="Example: Explain the OSI model in simple language for exam preparation..."
              rows={4}
              className="w-full resize-none rounded-2xl border border-slate-200 bg-[#fffdf5] p-4 text-sm outline-none transition focus:border-[#d5a900] focus:ring-4 focus:ring-[#F6D76A]/20"
            />

          </div>

          {/* =================================================
              PDF UPLOAD
          ================================================= */}

          <div>

            <label className="mb-2 block text-sm font-bold text-[#172033]">
              Learning Material
            </label>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative rounded-2xl border-2 border-dashed p-8 text-center transition-all
                ${
                  dragActive
                    ? "border-[#d5a900] bg-[#FFF8D9]"
                    : "border-slate-300 bg-slate-50 hover:border-[#d5a900]"
                }
              `}
            >

              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 cursor-pointer opacity-0"
              />

              {file ? (

                <div>

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F6D76A]">

                    <FileText
                      size={27}
                      className="text-[#172033]"
                    />

                  </div>

                  <h3 className="mt-4 font-bold text-[#172033]">
                    {file.name}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>

                  <p className="mt-3 text-xs font-semibold text-[#9A6900]">
                    Click or drop another PDF to replace it
                  </p>

                </div>

              ) : (

                <div>

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F6D76A]/40">

                    <Upload
                      size={27}
                      className="text-[#9A6900]"
                    />

                  </div>

                  <h3 className="mt-4 font-bold">
                    Upload your PDF
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Drag & drop your PDF here or click to browse
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    PDF files only
                  </p>

                </div>

              )}

            </div>

          </div>

          {/* =================================================
              LANGUAGE SELECTION
          ================================================= */}

          <div className="mt-7">

            <label className="mb-2 flex items-center gap-2 text-sm font-bold text-[#172033]">

              <Languages
                size={18}
                className="text-[#C28A00]"
              />

              Select Notes Language

            </label>

            <div className="relative">

              <select
                value={language}
                onChange={handleLanguageChange}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-[#fffdf5] px-4 py-4 pr-12 text-sm font-semibold text-[#172033] outline-none transition focus:border-[#d5a900] focus:ring-4 focus:ring-[#F6D76A]/20"
              >

                <option value="English">
                  English
                </option>

                <option value="Hindi">
                  Hindi
                </option>

                <option value="Telugu">
                  Telugu
                </option>

                <option value="Tamil">
                  Tamil
                </option>

                <option value="Kannada">
                  Kannada
                </option>

                <option value="Malayalam">
                  Malayalam
                </option>

                <option value="Marathi">
                  Marathi
                </option>

                <option value="Bengali">
                  Bengali
                </option>

              </select>

              {/* Custom arrow */}

              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#C28A00]">
                ▼
              </div>

            </div>

            <p className="mt-2 text-xs text-slate-500">
              STATWISE AI will generate the learner-facing notes in the selected language.
            </p>

          </div>

          {/* =================================================
              SELECTED LANGUAGE INDICATOR
          ================================================= */}

          <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#ead58b] bg-[#FFF8D9] px-4 py-3">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F6D76A]">

              <Languages
                size={16}
                className="text-[#172033]"
              />

            </div>

            <div>

              <p className="text-xs font-semibold text-slate-500">
                Selected Language
              </p>

              <p className="text-sm font-black text-[#172033]">
                {language}
              </p>

            </div>

          </div>

          {/* =================================================
              GENERATE BUTTON
          ================================================= */}

          <button
            onClick={handleGenerateNotes}
            disabled={loading}
            className="mt-7 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#172033] px-6 py-4 font-bold text-white shadow-md transition hover:bg-[#263653] disabled:cursor-not-allowed disabled:opacity-60"
          >

            {loading ? (

              <>

                <Loader2
                  size={21}
                  className="animate-spin"
                />

                STATWISE AI is generating notes...

              </>

            ) : (

              <>

                <Sparkles size={21} />

                Generate AI Notes

              </>

            )}

          </button>

        </section>

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (

          <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">

            <div className="flex items-start gap-3">

              <AlertCircle
                size={22}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div>

                <h3 className="font-bold text-red-700">
                  Notes Generation Failed
                </h3>

                <p className="mt-1 text-sm leading-6 text-red-600">
                  {error}
                </p>

                <p className="mt-3 text-xs text-red-500">
                  Check that your FastAPI backend is running on
                  port 8000 and that the Groq API key is configured.
                </p>

              </div>

            </div>

          </section>

        )}

        {/* ===================================================
            GENERATED NOTES
        =================================================== */}

        {notes && (

          <section
            id="generated-notes"
            className="mt-10"
          >

            {/* HEADER */}

            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <CheckCircle2
                    size={22}
                    className="text-emerald-600"
                  />

                  <span className="text-sm font-bold text-emerald-600">
                    AI GENERATION COMPLETE
                  </span>

                </div>

                <h2 className="mt-2 text-3xl font-black">
                  {notes.title ||
                    "Generated Study Notes"}
                </h2>

              </div>

              <div className="flex gap-2">

                <button
                  onClick={copyNotes}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold transition hover:bg-slate-50"
                >

                  <Copy size={16} />

                  Copy

                </button>

                <button
                  onClick={downloadNotes}
                  className="flex items-center gap-2 rounded-xl bg-[#172033] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#263653]"
                >

                  <Download size={16} />

                  Download

                </button>

              </div>

            </div>

            {/* SELECTED LANGUAGE RESULT */}

            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-[#ead58b] bg-[#FFF8D9] p-4">

              <Languages
                size={20}
                className="text-[#C28A00]"
              />

              <p className="text-sm font-semibold text-slate-700">

                Notes generated in:

                <span className="ml-2 font-black text-[#9A6900]">
                  {language}
                </span>

              </p>

            </div>

            {/* SUMMARY */}

            {notes.summary && (

              <div className="rounded-2xl border border-[#ead58b] bg-[#FFF8D9] p-6">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F6D76A]">

                    <Sparkles size={20} />

                  </div>

                  <h3 className="text-lg font-black">
                    AI Summary
                  </h3>

                </div>

                <p className="mt-4 leading-7 text-slate-700">
                  {notes.summary}
                </p>

              </div>

            )}

            {/* OVERVIEW */}

            {notes.overview && (

              <div className="mt-6 rounded-2xl border border-[#ead58b] bg-[#FFF8D9] p-6">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F6D76A]">

                    <BookOpen size={20} />

                  </div>

                  <h3 className="text-lg font-black">
                    Overview
                  </h3>

                </div>

                <p className="mt-4 leading-7 text-slate-700">
                  {notes.overview}
                </p>

              </div>

            )}

            {/* KEY POINTS */}

            {Array.isArray(notes.key_points) &&
              notes.key_points.length > 0 && (

                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                  <h3 className="flex items-center gap-2 text-xl font-black">

                    <CheckCircle2
                      size={21}
                      className="text-[#C28A00]"
                    />

                    Key Points

                  </h3>

                  <div className="mt-5 space-y-3">

                    {notes.key_points.map(
                      (point, index) => (

                        <div
                          key={index}
                          className="flex items-start gap-3 rounded-xl bg-[#fffdf5] p-4"
                        >

                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F6D76A] text-xs font-black">

                            {index + 1}

                          </span>

                          <p className="text-sm leading-6 text-slate-700">
                            {point}
                          </p>

                        </div>

                      )
                    )}

                  </div>

                </div>

              )}

            {/* SECTIONS */}

            {Array.isArray(notes.sections) &&
              notes.sections.length > 0 && (

                <div className="mt-6 space-y-5">

                  {notes.sections.map(
                    (section, index) => (

                      <article
                        key={index}
                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                      >

                        <div className="flex items-start gap-4">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F6D76A]">

                            <BookOpen size={19} />

                          </div>

                          <div className="flex-1">

                            <h3 className="text-xl font-black">

                              {section.heading ||
                                `Section ${index + 1}`}

                            </h3>

                            {section.content && (

                              <p className="mt-3 leading-7 text-slate-600">
                                {section.content}
                              </p>

                            )}

                          </div>

                        </div>

                        {Array.isArray(
                          section.important_points
                        ) &&
                          section.important_points.length > 0 && (

                            <div className="mt-5 rounded-xl bg-[#FFF8D9] p-4">

                              <p className="mb-3 text-xs font-black uppercase tracking-wider text-[#9A6900]">
                                Important Points
                              </p>

                              <ul className="space-y-2">

                                {section.important_points.map(
                                  (
                                    point,
                                    pointIndex
                                  ) => (

                                    <li
                                      key={pointIndex}
                                      className="flex gap-2 text-sm leading-6 text-slate-700"
                                    >

                                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C28A00]" />

                                      {point}

                                    </li>

                                  )
                                )}

                              </ul>

                            </div>

                          )}

                        {Array.isArray(
                          section.key_points
                        ) &&
                          section.key_points.length > 0 && (

                            <div className="mt-5 rounded-xl bg-[#FFF8D9] p-4">

                              <p className="mb-3 text-xs font-black uppercase tracking-wider text-[#9A6900]">
                                Key Points
                              </p>

                              <ul className="space-y-2">

                                {section.key_points.map(
                                  (
                                    point,
                                    pointIndex
                                  ) => (

                                    <li
                                      key={pointIndex}
                                      className="flex gap-2 text-sm leading-6 text-slate-700"
                                    >

                                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C28A00]" />

                                      {point}

                                    </li>

                                  )
                                )}

                              </ul>

                            </div>

                          )}

                        {Array.isArray(
                          section.examples
                        ) &&
                          section.examples.length > 0 && (

                            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">

                              <p className="mb-3 text-xs font-black uppercase tracking-wider text-slate-500">
                                Examples
                              </p>

                              <ul className="space-y-2">

                                {section.examples.map(
                                  (
                                    example,
                                    exampleIndex
                                  ) => (

                                    <li
                                      key={exampleIndex}
                                      className="text-sm leading-6 text-slate-700"
                                    >
                                      • {example}
                                    </li>

                                  )
                                )}

                              </ul>

                            </div>

                          )}

                      </article>

                    )
                  )}

                </div>

              )}

            {/* TERMS */}

            {Array.isArray(
              notes.important_terms
            ) &&
              notes.important_terms.length > 0 && (

                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                  <h3 className="text-xl font-black">
                    Important Terms
                  </h3>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">

                    {notes.important_terms.map(
                      (item, index) => (

                        <div
                          key={index}
                          className="rounded-xl bg-slate-50 p-4"
                        >

                          <p className="font-black text-[#172033]">
                            {item.term}
                          </p>

                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {item.meaning}
                          </p>

                        </div>

                      )
                    )}

                  </div>

                </div>

              )}

            {/* FORMULAS */}

            {Array.isArray(notes.formulas) &&
              notes.formulas.length > 0 && (

                <div className="mt-6 rounded-2xl bg-[#172033] p-6 text-white">

                  <h3 className="text-xl font-black">
                    Important Formulas
                  </h3>

                  <div className="mt-5 space-y-4">

                    {notes.formulas.map(
                      (item, index) => (

                        <div
                          key={index}
                          className="rounded-xl border border-white/10 bg-white/5 p-4"
                        >

                          <p className="font-bold text-[#F6D76A]">
                            {item.name ||
                              "Formula"}
                          </p>

                          <p className="mt-2 rounded-lg bg-black/20 p-3 font-mono text-sm">
                            {item.formula}
                          </p>

                          {item.explanation && (

                            <p className="mt-3 text-sm leading-6 text-white/70">
                              {item.explanation}
                            </p>

                          )}

                        </div>

                      )
                    )}

                  </div>

                </div>

              )}

            {/* IMPORTANT FORMULAS FROM BACKEND */}

            {Array.isArray(
              notes.important_formulas
            ) &&
              notes.important_formulas.length > 0 && (

                <div className="mt-6 rounded-2xl bg-[#172033] p-6 text-white">

                  <h3 className="text-xl font-black">
                    Important Formulas
                  </h3>

                  <div className="mt-5 space-y-4">

                    {notes.important_formulas.map(
                      (item, index) => (

                        <div
                          key={index}
                          className="rounded-xl border border-white/10 bg-white/5 p-4"
                        >

                          <p className="font-bold text-[#F6D76A]">
                            {item.formula}
                          </p>

                          {item.explanation && (

                            <p className="mt-3 text-sm leading-6 text-white/70">
                              {item.explanation}
                            </p>

                          )}

                        </div>

                      )
                    )}

                  </div>

                </div>

              )}

            {/* QUICK REVISION */}

            {Array.isArray(
              notes.quick_revision
            ) &&
              notes.quick_revision.length > 0 && (

                <div className="mt-6 rounded-2xl border border-[#ead58b] bg-[#FFF8D9] p-6">

                  <h3 className="text-xl font-black">
                    ⚡ Quick Revision
                  </h3>

                  <div className="mt-5 grid gap-3 md:grid-cols-2">

                    {notes.quick_revision.map(
                      (item, index) => (

                        <div
                          key={index}
                          className="rounded-xl bg-white p-4 text-sm font-semibold leading-6 shadow-sm"
                        >

                          {index + 1}. {item}

                        </div>

                      )
                    )}

                  </div>

                </div>

              )}

            {/* EXAM POINTS */}

            {Array.isArray(
              notes.exam_points
            ) &&
              notes.exam_points.length > 0 && (

                <div className="mt-6 rounded-2xl border border-[#ead58b] bg-[#FFF8D9] p-6">

                  <h3 className="text-xl font-black">
                    Exam Points
                  </h3>

                  <div className="mt-5 space-y-3">

                    {notes.exam_points.map(
                      (item, index) => (

                        <div
                          key={index}
                          className="rounded-xl bg-white p-4 text-sm font-semibold leading-6 shadow-sm"
                        >

                          {index + 1}. {item}

                        </div>

                      )
                    )}

                  </div>

                </div>

              )}

            {/* PRACTICE QUESTIONS */}

            {Array.isArray(
              notes.practice_questions
            ) &&
              notes.practice_questions.length > 0 && (

                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                  <h3 className="text-xl font-black">
                    Practice Questions
                  </h3>

                  <div className="mt-5 space-y-3">

                    {notes.practice_questions.map(
                      (
                        question,
                        index
                      ) => (

                        <div
                          key={index}
                          className="flex items-start gap-3 rounded-xl bg-slate-50 p-4"
                        >

                          <span className="font-black text-[#C28A00]">
                            Q{index + 1}.
                          </span>

                          <p className="text-sm leading-6 text-slate-700">
                            {question}
                          </p>

                        </div>

                      )
                    )}

                  </div>

                </div>

              )}

            {/* CONCLUSION */}

            {notes.conclusion && (

              <div className="mt-6 rounded-2xl border border-[#ead58b] bg-[#FFF8D9] p-6">

                <h3 className="text-xl font-black">
                  Conclusion
                </h3>

                <p className="mt-4 leading-7 text-slate-700">
                  {notes.conclusion}
                </p>

              </div>

            )}

            {/* RESET */}

            <div className="mt-8 flex justify-center">

              <button
                onClick={resetGenerator}
                className="flex items-center gap-2 rounded-xl border-2 border-[#172033] px-5 py-3 font-bold text-[#172033] transition hover:bg-[#172033] hover:text-white"
              >

                <RotateCcw size={17} />

                Generate New Notes

              </button>

            </div>

          </section>

        )}

      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-6 py-8 text-center">

          <div className="flex items-center justify-center gap-2">

            <Brain
              size={18}
              className="text-[#C28A00]"
            />

            <span className="font-black">
              STATWISE AI
            </span>

          </div>

          <p className="mt-2 text-xs text-slate-500">
            Intelligent Learning. Measurable Impact.
          </p>

        </div>

      </footer>

    </div>
  );
}

export default GenerateNotes;