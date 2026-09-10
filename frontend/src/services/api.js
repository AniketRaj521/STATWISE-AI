import axios from "axios";

/*
=========================================================
STATWISE AI - FRONTEND API SERVICE
=========================================================

Backend:
http://127.0.0.1:8000

Start backend with:

python -m uvicorn main:app --reload

=========================================================
*/


// =======================================================
// API BASE URL
// =======================================================

const API_BASE_URL = "http://127.0.0.1:8000";


// =======================================================
// AXIOS INSTANCE
// =======================================================

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
});


// =======================================================
// ERROR HANDLER
// =======================================================

const handleApiError = (error, defaultMessage) => {

  console.error("STATWISE API Error:", error);

  // Backend returned an error
  if (error.response) {

    const message =
      error.response.data?.message ||
      error.response.data?.detail ||
      error.response.data?.error ||
      defaultMessage;

    throw new Error(message);
  }

  // Request was sent but no response
  if (error.request) {

    throw new Error(
      "Cannot connect to STATWISE AI backend. Make sure FastAPI is running on port 8000."
    );
  }

  // Other error
  throw new Error(
    error.message || defaultMessage
  );
};


// =======================================================
// BACKEND HEALTH
// =======================================================

export const checkBackendHealth = async () => {

  try {

    const response = await api.get("/health");

    return response.data;

  } catch (error) {

    handleApiError(
      error,
      "STATWISE AI backend health check failed."
    );

  }

};


// =======================================================
// ROOT BACKEND CHECK
// =======================================================

export const checkBackend = async () => {

  try {

    const response = await api.get("/");

    return response.data;

  } catch (error) {

    handleApiError(
      error,
      "Unable to connect to STATWISE AI backend."
    );

  }

};


// =======================================================
// UPLOAD PDF
// =======================================================

export const uploadPDF = async (file) => {

  try {

    if (!file) {

      throw new Error(
        "Please select a PDF file."
      );

    }


    const isPDF =
      file.type === "application/pdf" ||
      file.name
        .toLowerCase()
        .endsWith(".pdf");


    if (!isPDF) {

      throw new Error(
        "Only PDF files are allowed."
      );

    }


    const formData = new FormData();

    formData.append(
      "file",
      file
    );


    const response = await api.post(
      "/upload-pdf",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );


    return response.data;

  } catch (error) {

    handleApiError(
      error,
      "Failed to upload PDF."
    );

  }

};


// =======================================================
// EXTRACT PDF TEXT
// =======================================================

export const extractPDF = async (file) => {

  try {

    if (!file) {

      throw new Error(
        "Please select a PDF file."
      );

    }


    const isPDF =
      file.type === "application/pdf" ||
      file.name
        .toLowerCase()
        .endsWith(".pdf");


    if (!isPDF) {

      throw new Error(
        "Only PDF files are allowed."
      );

    }


    const formData = new FormData();

    formData.append(
      "file",
      file
    );


    console.log(
      "Sending PDF to /extract-pdf..."
    );


    const response = await api.post(
      "/extract-pdf",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );


    console.log(
      "PDF extraction response:",
      response.data
    );


    return response.data;

  } catch (error) {

    handleApiError(
      error,
      "Failed to extract text from PDF."
    );

  }

};


// =======================================================
// GENERATE QUIZ
// =======================================================

export const generateQuiz = async (file) => {

  try {

    if (!file) {

      throw new Error(
        "Please select a PDF file."
      );

    }


    const isPDF =
      file.type === "application/pdf" ||
      file.name
        .toLowerCase()
        .endsWith(".pdf");


    if (!isPDF) {

      throw new Error(
        "Only PDF files are allowed."
      );

    }


    const formData = new FormData();

    formData.append(
      "file",
      file
    );


    console.log(
      "Sending PDF to /generate-quiz..."
    );


    const response = await api.post(
      "/generate-quiz",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );


    console.log(
      "Quiz response:",
      response.data
    );


    return response.data;

  } catch (error) {

    handleApiError(
      error,
      "Failed to generate quiz."
    );

  }

};


// =======================================================
// SUBMIT QUIZ
// =======================================================

export const submitQuiz = async (
  questions,
  answers
) => {

  try {

    if (!Array.isArray(questions)) {

      throw new Error(
        "Quiz questions must be an array."
      );

    }


    if (!answers) {

      throw new Error(
        "Quiz answers are required."
      );

    }


    const response = await api.post(
      "/submit-quiz",
      {
        questions,
        answers,
      }
    );


    return response.data;

  } catch (error) {

    handleApiError(
      error,
      "Failed to calculate quiz score."
    );

  }

};


// =======================================================
// SKILL GAP ANALYSIS
// =======================================================

export const analyzeSkillGap = async (
  score
) => {

  try {

    if (
      score === undefined ||
      score === null ||
      score === ""
    ) {

      throw new Error(
        "Assessment score is required."
      );

    }


    const response = await api.post(
      "/skill-gap",
      {
        score: Number(score),
      }
    );


    return response.data;

  } catch (error) {

    handleApiError(
      error,
      "Skill gap analysis failed."
    );

  }

};


// =======================================================
// GENERATE AI NOTES
// =======================================================

export const generateNotes = async (
  file
) => {

  try {

    if (!file) {

      throw new Error(
        "Please select a PDF file."
      );

    }


    const isPDF =
      file.type === "application/pdf" ||
      file.name
        .toLowerCase()
        .endsWith(".pdf");


    if (!isPDF) {

      throw new Error(
        "Only PDF files are allowed."
      );

    }


    const formData = new FormData();

    formData.append(
      "file",
      file
    );


    console.log(
      "Sending PDF to /generate-notes..."
    );


    const response = await api.post(
      "/generate-notes",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );


    console.log(
      "AI Notes response:",
      response.data
    );


    return response.data;

  } catch (error) {

    handleApiError(
      error,
      "Failed to generate AI notes."
    );

  }

};


// =======================================================
// AI TUTOR
// =======================================================

export const askTutor = async ({
  question,
  pdfText,
  conversationHistory = [],
  skill = "",
}) => {

  try {

    // ---------------------------------------------------
    // Validate question
    // ---------------------------------------------------

    if (
      !question ||
      !question.trim()
    ) {

      throw new Error(
        "Please enter a question."
      );

    }


    // ---------------------------------------------------
    // Validate PDF
    // ---------------------------------------------------

    if (
      !pdfText ||
      !pdfText.trim()
    ) {

      throw new Error(
        "Please upload a PDF before asking the AI Tutor."
      );

    }


    // ---------------------------------------------------
    // Prepare request
    // ---------------------------------------------------

    const requestData = {

      question:
        question.trim(),

      pdf_text:
        pdfText,

      conversation_history:
        Array.isArray(
          conversationHistory
        )
          ? conversationHistory
          : [],

      skill:
        skill || "",

    };


    console.log(
      "Sending AI Tutor request..."
    );

    console.log(
      "Tutor request:",
      {
        question:
          requestData.question,

        pdfCharacters:
          requestData.pdf_text.length,

        historyMessages:
          requestData
            .conversation_history
            .length,

        skill:
          requestData.skill,
      }
    );


    // ---------------------------------------------------
    // Send request
    // ---------------------------------------------------

    const response = await api.post(
      "/tutor",
      requestData
    );


    // ---------------------------------------------------
    // Log response
    // ---------------------------------------------------

    console.log(
      "AI Tutor response:",
      response.data
    );


    return response.data;

  } catch (error) {

    console.error(
      "AI Tutor request failed:",
      error
    );


    handleApiError(
      error,
      "AI Tutor request failed."
    );

  }

};
export const generatePPT = async ({
  file,
  style = "Visual Learning",
}) => {
  if (!file) {
    throw new Error("Please select a PDF file.");
  }

  const formData = new FormData();

  formData.append("file", file);
  formData.append("style", style);

  const response = await fetch(
    "http://127.0.0.1:8000/generate-ppt",
    {
      method: "POST",
      body: formData,
    }
  );

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "Invalid response received from backend."
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      "PPT generation failed."
    );
  }

  if (data?.success === false) {
    throw new Error(
      data?.message ||
      "PPT generation failed."
    );
  }

  return data;
};


// ===============================
// DIGITAL TWIN
// ===============================

export const analyzeDigitalTwin = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(
    "http://127.0.0.1:8000/digital-twin/analyze",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};


// =======================================================
// DEFAULT AXIOS INSTANCE
// =======================================================

export default api;