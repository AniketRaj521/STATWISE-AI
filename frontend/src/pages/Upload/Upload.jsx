import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UploadCloud,
  FileText,
  CheckCircle,
  Loader2,
  Sparkles,
  Brain,
  BookOpen,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  uploadPDF,
  extractPDF,
  generateQuiz,
} from "../../services/api";

export default function Upload() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [steps, setSteps] = useState({
    upload: false,
    extract: false,
    quiz: false,
  });

  const [extracted, setExtracted] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      toast.error("Please select a PDF file");
      return;
    }

    setFile(selectedFile);
    setSteps({
      upload: false,
      extract: false,
      quiz: false,
    });
    setExtracted(null);
  };

  const processPDF = async () => {
    if (!file) {
      toast.error("Please select a PDF first");
      return;
    }

    try {
      setLoading(true);

      // STEP 1 — Upload
      toast.loading("Uploading PDF...", { id: "pdf-process" });

      await uploadPDF(file);

      setSteps((prev) => ({
        ...prev,
        upload: true,
      }));

      // STEP 2 — Extract
      toast.loading("Extracting learning content...", {
        id: "pdf-process",
      });

      const extraction = await extractPDF(file);

      setExtracted(extraction);

      setSteps((prev) => ({
        ...prev,
        extract: true,
      }));

      // STEP 3 — Generate quiz
      toast.loading("AI is generating your quiz...", {
        id: "pdf-process",
      });

      const quiz = await generateQuiz(file);

      setSteps((prev) => ({
        ...prev,
        quiz: true,
      }));

      sessionStorage.setItem(
        "statwise_quiz",
        JSON.stringify(quiz.questions || quiz)
      );

      sessionStorage.setItem(
        "statwise_pdf_name",
        file.name
      );

      sessionStorage.setItem(
        "statwise_extraction",
        JSON.stringify(extraction)
      );

      toast.success("PDF processed successfully!", {
        id: "pdf-process",
      });

      setTimeout(() => {
        navigate("/assessments/quiz?source=pdf");
      }, 700);

    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.detail ||
          "Something went wrong while processing the PDF.",
        {
          id: "pdf-process",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setExtracted(null);
    setSteps({
      upload: false,
      extract: false,
      quiz: false,
    });
  };

  return (
    <div className="min-h-screen bg-[#fffdf5] px-6 py-12">

      {/* HEADER */}
      <div className="mx-auto max-w-6xl">

        <div className="mb-10 text-center">

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F6D76A]">
            <Brain className="h-8 w-8 text-[#172033]" />
          </div>

          <div className="mb-3 flex items-center justify-center gap-2 text-sm font-bold text-[#8a7200]">
            <Sparkles className="h-4 w-4" />
            STATWISE AI
          </div>

          <h1 className="text-4xl font-black text-[#172033] md:text-5xl">
            Turn Learning Material Into Intelligence
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-gray-500">
            Upload a PDF and let STATWISE AI extract knowledge,
            generate assessments and identify competency gaps.
          </p>

        </div>

        {/* MAIN GRID */}
        <div className="grid gap-8 lg:grid-cols-3">

          {/* UPLOAD CARD */}
          <div className="lg:col-span-2">

            <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-xl">

              <div className="mb-6 flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF3B0]">
                  <UploadCloud className="h-6 w-6 text-[#172033]" />
                </div>

                <div>
                  <h2 className="text-xl font-black text-[#172033]">
                    Upload Learning Material
                  </h2>

                  <p className="text-sm text-gray-500">
                    PDF files supported
                  </p>
                </div>

              </div>

              {!file ? (

                <label className="flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#F6D76A] bg-[#fffdf5] transition hover:bg-[#fff9d9]">

                  <UploadCloud className="mb-5 h-14 w-14 text-[#c6a900]" />

                  <h3 className="text-lg font-black text-[#172033]">
                    Drop your PDF here
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    or click to browse
                  </p>

                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                </label>

              ) : (

                <div className="rounded-2xl border border-black/10 bg-[#fffdf5] p-6">

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-4">

                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-100">
                        <FileText className="h-7 w-7 text-red-600" />
                      </div>

                      <div>

                        <h3 className="font-black text-[#172033]">
                          {file.name}
                        </h3>

                        <p className="text-sm text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>

                      </div>

                    </div>

                    {!loading && (
                      <button
                        onClick={removeFile}
                        className="rounded-lg p-2 hover:bg-gray-100"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}

                  </div>

                  <button
                    onClick={processPDF}
                    disabled={loading}
                    className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#172033] px-6 py-4 font-black text-white transition hover:scale-[1.01] disabled:opacity-60"
                  >

                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing PDF...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        Analyze with STATWISE AI
                      </>
                    )}

                  </button>

                </div>

              )}

            </div>

            {/* EXTRACTION RESULT */}
            {extracted && (

              <div className="mt-6 rounded-3xl border border-green-200 bg-green-50 p-6">

                <div className="flex items-center gap-3">

                  <CheckCircle className="h-6 w-6 text-green-600" />

                  <div>
                    <h3 className="font-black text-green-800">
                      PDF Extracted Successfully
                    </h3>

                    <p className="text-sm text-green-700">
                      {extracted.characters?.toLocaleString() || 0} characters
                      extracted from the document.
                    </p>
                  </div>

                </div>

              </div>

            )}

          </div>

          {/* PIPELINE */}
          <div>

            <div className="rounded-3xl border border-black/10 bg-[#172033] p-7 text-white shadow-xl">

              <div className="mb-7">

                <p className="text-xs font-bold uppercase tracking-widest text-[#F6D76A]">
                  AI PIPELINE
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  From PDF to Skills
                </h2>

              </div>

              <div className="space-y-6">

                <PipelineStep
                  number="01"
                  title="Upload"
                  description="Secure document processing"
                  done={steps.upload}
                />

                <PipelineStep
                  number="02"
                  title="Extract"
                  description="AI-ready learning content"
                  done={steps.extract}
                />

                <PipelineStep
                  number="03"
                  title="Generate Quiz"
                  description="Personalized MCQs"
                  done={steps.quiz}
                />

                <PipelineStep
                  number="04"
                  title="Assess"
                  description="Measure competency"
                  done={false}
                />

                <PipelineStep
                  number="05"
                  title="Skill Gap"
                  description="Identify learning needs"
                  done={false}
                />

              </div>

            </div>

            {/* FEATURES */}
            <div className="mt-6 grid gap-3">

              <Feature
                icon={<BookOpen />}
                title="Smart Notes"
                text="Convert documents into structured learning material."
              />

              <Feature
                icon={<Brain />}
                title="AI Quiz"
                text="Generate MCQs directly from uploaded content."
              />

              <Feature
                icon={<Sparkles />}
                title="Skill Intelligence"
                text="Identify competency gaps and learning priorities."
              />

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


function PipelineStep({ number, title, description, done }) {
  return (
    <div className="flex items-center gap-4">

      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-black ${
          done
            ? "bg-green-400 text-[#172033]"
            : "bg-white/10 text-[#F6D76A]"
        }`}
      >
        {done ? (
          <CheckCircle className="h-5 w-5" />
        ) : (
          number
        )}
      </div>

      <div>
        <p className="font-black">{title}</p>
        <p className="text-xs text-white/50">{description}</p>
      </div>

    </div>
  );
}


function Feature({ icon, title, text }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4">

      <div className="mb-2 flex items-center gap-3">

        <div className="text-[#b49a00]">
          {icon}
        </div>

        <h3 className="font-black text-[#172033]">
          {title}
        </h3>

      </div>

      <p className="text-sm leading-6 text-gray-500">
        {text}
      </p>

    </div>
  );
}