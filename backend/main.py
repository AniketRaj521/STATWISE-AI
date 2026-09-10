from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

import os
from pathlib import Path
from typing import Any


# ============================================================
# SERVICES
# ============================================================

from services.flashcard_service import generate_flashcards
from services.ppt_service import generate_presentation, GENERATED_DIR
from services.pdf_service import extract_text_from_pdf
from services.quiz_service import generate_mcqs
from services.assessment_service import calculate_score
from services.skill_gap_service import analyze_skill_gap
from services.notes_service import generate_notes
from services.google_auth_service import verify_google_token
from services.digital_twin_service import analyze_pdf_for_digital_twin
from services.tutor_service import generate_tutor_response


from services.learning_path_service import (
    generate_personalized_learning_path
)

from services.auth_service import (
    register_user,
    verify_otp,
    resend_otp
)


# ============================================================
# APP CONFIGURATION
# ============================================================

app = FastAPI(
    title="STATWISE AI",
    description=(
        "AI-Enabled Skill Intelligence & Personalized Learning Platform"
    ),
    version="1.0.0"
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# DIRECTORIES
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

UPLOAD_FOLDER = BASE_DIR / "uploads"

UPLOAD_FOLDER.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def safe_filename(filename: str) -> str:
    """
    Prevent unsafe path traversal from uploaded filenames.
    """
    return os.path.basename(filename)


async def save_uploaded_pdf(
    file: UploadFile
) -> tuple[str, str]:
    """
    Save uploaded PDF.

    Returns:
        (filename, file_path)
    """

    if not file.filename:
        raise ValueError("No file selected.")

    if not file.filename.lower().endswith(".pdf"):
        raise ValueError(
            "Only PDF files are allowed."
        )

    filename = safe_filename(
        file.filename
    )

    file_path = UPLOAD_FOLDER / filename

    content = await file.read()

    if not content:
        raise ValueError(
            "Uploaded file is empty."
        )

    with open(
        file_path,
        "wb"
    ) as buffer:
        buffer.write(content)

    return filename, str(file_path)


def validate_learning_text(
    text: str
) -> str:
    """
    Clean and validate learning material.
    """

    if not text:
        raise ValueError(
            "No learning material was provided."
        )

    cleaned = text.strip()

    if not cleaned:
        raise ValueError(
            "Learning material is empty."
        )

    if len(cleaned) < 100:
        raise ValueError(
            "Please provide at least 100 characters "
            "of learning material."
        )

    return cleaned


def clean_score(
    value: Any,
    default: float = 60
) -> float:
    """
    Convert score safely and keep it between 0 and 100.
    """

    try:
        value = float(value)
    except (TypeError, ValueError):
        value = default

    return max(
        0,
        min(100, value)
    )


def clean_experience(
    value: Any,
    default: float = 0
) -> float:
    """
    Convert experience safely.
    """

    try:
        value = float(value)
    except (TypeError, ValueError):
        value = default

    return max(0, value)


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():

    return {
        "project": "STATWISE AI",
        "status": "running",
        "version": "1.0.0",
        "message": (
            "Backend is connected successfully."
        )
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():

    return {
        "status": "healthy",
        "service": "STATWISE AI Backend"
    }


# ============================================================
# UPLOAD PDF
# ============================================================

@app.post("/upload-pdf")
async def upload_pdf(
    file: UploadFile = File(...)
):

    try:

        filename, file_path = (
            await save_uploaded_pdf(file)
        )

        return {
            "success": True,
            "message": (
                "PDF uploaded successfully."
            ),
            "filename": filename,
            "file_path": file_path
        }

    except ValueError as e:

        return {
            "success": False,
            "message": str(e)
        }

    except Exception as e:

        print(
            "========== UPLOAD PDF ERROR =========="
        )

        print(str(e))

        print(
            "======================================"
        )

        return {
            "success": False,
            "message": "Failed to upload PDF.",
            "error": str(e)
        }


# ============================================================
# EXTRACT PDF TEXT
# ============================================================

@app.post("/extract-pdf")
async def extract_pdf(
    file: UploadFile = File(...)
):

    try:

        filename, file_path = (
            await save_uploaded_pdf(file)
        )

        text = extract_text_from_pdf(
            file_path
        )

        if not text or not text.strip():

            return {
                "success": False,
                "message": (
                    "No readable text found in the PDF. "
                    "Please upload a text-based PDF."
                )
            }

        cleaned_text = text.strip()

        return {
            "success": True,
            "filename": filename,
            "characters": len(cleaned_text),
            "preview": cleaned_text[:2000],
            "text": cleaned_text
        }

    except ValueError as e:

        return {
            "success": False,
            "message": str(e)
        }

    except Exception as e:

        print(
            "========== EXTRACT PDF ERROR =========="
        )

        print(str(e))

        print(
            "========================================"
        )

        return {
            "success": False,
            "message": (
                "Failed to extract PDF text."
            ),
            "error": str(e)
        }


# ============================================================
# GENERATE QUIZ
# ============================================================

@app.post("/generate-quiz")
async def generate_quiz(
    file: UploadFile = File(...)
):

    try:

        filename, file_path = (
            await save_uploaded_pdf(file)
        )

        text = extract_text_from_pdf(
            file_path
        )

        if not text or not text.strip():

            return {
                "success": False,
                "message": (
                    "No readable text found in PDF."
                )
            }

        quiz = generate_mcqs(text)

        return {
            "success": True,
            "filename": filename,
            "questions": quiz,
            "message": (
                "Quiz generated successfully."
            )
        }

    except ValueError as e:

        return {
            "success": False,
            "message": str(e)
        }

    except Exception as e:

        print(
            "========== QUIZ ERROR =========="
        )

        print(str(e))

        print(
            "================================"
        )

        return {
            "success": False,
            "message": (
                "Failed to generate quiz."
            ),
            "error": str(e)
        }


# ============================================================
# SUBMIT QUIZ
# ============================================================

@app.post("/submit-quiz")
async def submit_quiz(
    data: dict
):

    try:

        questions = data.get(
            "questions"
        )

        answers = data.get(
            "answers"
        )

        if questions is None:

            return {
                "success": False,
                "message": (
                    "Questions are required."
                )
            }

        if answers is None:

            return {
                "success": False,
                "message": (
                    "Answers are required."
                )
            }

        result = calculate_score(
            questions,
            answers
        )

        return {
            "success": True,
            "result": result
        }

    except Exception as e:

        print(
            "========== SUBMIT QUIZ ERROR =========="
        )

        print(str(e))

        print(
            "======================================="
        )

        return {
            "success": False,
            "message": (
                "Failed to calculate quiz score."
            ),
            "error": str(e)
        }


# ============================================================
# PERSONALIZED LEARNING PATH FROM TEXT
# ============================================================

@app.post(
    "/personalized-learning-path-text"
)
async def personalized_learning_path_text(
    text: str = Form(...),
    role: str = Form(
        "Learner"
    ),
    assessment_score: float = Form(
        60
    ),
    quiz_accuracy: float = Form(
        60
    ),
    years_experience: float = Form(
        0
    ),
    learning_goal: str = Form(
        "Master the learning material"
    )
):

    try:

        # ----------------------------------------------------
        # Validate text
        # ----------------------------------------------------

        cleaned_text = (
            validate_learning_text(text)
        )

        # ----------------------------------------------------
        # Clean profile
        # ----------------------------------------------------

        role = (
            role.strip()
            if role
            else "Learner"
        )

        learning_goal = (
            learning_goal.strip()
            if learning_goal
            else "Master the learning material"
        )

        # ----------------------------------------------------
        # Clean scores
        # ----------------------------------------------------

        assessment_score = clean_score(
            assessment_score,
            60
        )

        quiz_accuracy = clean_score(
            quiz_accuracy,
            60
        )

        years_experience = clean_experience(
            years_experience,
            0
        )

        # ----------------------------------------------------
        # Generate AI learning path
        # ----------------------------------------------------

        result = (
            generate_personalized_learning_path(
                text=cleaned_text,
                role=role,
                assessment_score=assessment_score,
                quiz_accuracy=quiz_accuracy,
                learning_goal=learning_goal
            )
        )

        return {
            "success": result.get(
                "success",
                False
            ),
            "filename": (
                "pasted-learning-material"
            ),
            "learning_path": result.get(
                "learning_path",
                {}
            ),
            "message": result.get(
                "message"
            ),
            "error": result.get(
                "error"
            )
        }

    except ValueError as e:

        return {
            "success": False,
            "message": str(e)
        }

    except Exception as e:

        print(
            "========== PERSONALIZED TEXT ERROR =========="
        )

        print(str(e))

        print(
            "=============================================="
        )

        return {
            "success": False,
            "message": (
                "Failed to generate personalized "
                "learning path."
            ),
            "error": str(e)
        }


# ============================================================
# SKILL GAP ANALYSIS
# ============================================================

@app.post("/skill-gap")
async def skill_gap(
    data: dict
):

    try:

        score = data.get(
            "score"
        )

        if score is None:

            return {
                "success": False,
                "message": (
                    "Score is required."
                )
            }

        score = clean_score(
            score,
            0
        )

        result = analyze_skill_gap(
            score
        )

        return {
            "success": True,
            "result": result
        }

    except Exception as e:

        print(
            "========== SKILL GAP ERROR =========="
        )

        print(str(e))

        print(
            "====================================="
        )

        return {
            "success": False,
            "message": (
                "Skill gap analysis failed."
            ),
            "error": str(e)
        }


# ============================================================
# GENERATE AI NOTES
# ============================================================

@app.post("/generate-notes")
async def generate_notes_from_pdf(
    file: UploadFile = File(...),
    language: str = Form("English"),
    topic: str = Form("")
):
    try:

        # ====================================================
        # FILE VALIDATION
        # ====================================================

        if not file.filename:

            return {
                "success": False,
                "message": "No file selected."
            }

        if not file.filename.lower().endswith(".pdf"):

            return {
                "success": False,
                "message": "Only PDF files are allowed."
            }

        # ====================================================
        # LANGUAGE VALIDATION
        # ====================================================

        supported_languages = [
            "English",
            "Hindi",
            "Telugu",
            "Tamil",
            "Kannada",
            "Malayalam",
            "Marathi",
            "Bengali"
        ]

        language = language.strip()

        matched_language = "English"

        for item in supported_languages:

            if language.lower() == item.lower():

                matched_language = item
                break

        language = matched_language

        # ====================================================
        # SAVE PDF
        # ====================================================

        filename, file_path = await save_uploaded_pdf(file)

        print("==========================================")
        print("       STATWISE NOTES REQUEST")
        print("==========================================")
        print("File     :", filename)
        print("Language :", language)
        print("Topic    :", topic)
        print("==========================================")

        # ====================================================
        # EXTRACT PDF TEXT
        # ====================================================

        text = extract_text_from_pdf(file_path)

        if not text or len(text.strip()) < 100:

            return {
                "success": False,
                "message": (
                    "Could not extract enough text from "
                    "the PDF."
                )
            }

        text = text.strip()

        # ====================================================
        # GENERATE MULTILINGUAL NOTES
        # ====================================================

        result = generate_notes(
            text=text,
            language=language,
            topic=topic
        )

        # ====================================================
        # FAILED AI REQUEST
        # ====================================================

        if not result.get("success", False):

            return {
                "success": False,
                "filename": filename,
                "language": language,
                "message": result.get(
                    "message",
                    "Failed to generate notes."
                ),
                "error": result.get("error")
            }

        # ====================================================
        # SUCCESS
        # ====================================================

        return {
            "success": True,
            "filename": filename,
            "language": language,
            "notes": result.get("notes"),
            "message": (
                f"Notes generated successfully "
                f"in {language}."
            )
        }

    except Exception as e:

        print("==========================================")
        print("       NOTES ENDPOINT ERROR")
        print("==========================================")
        print(str(e))
        print("==========================================")

        return {
            "success": False,
            "message": "Failed to generate notes.",
            "error": str(e)
        }
    try:
        if not file.filename:
            return {
                "success": False,
                "message": "No file selected."
            }

        if not file.filename.lower().endswith(".pdf"):
            return {
                "success": False,
                "message": "Only PDF files are allowed."
            }

        # Save uploaded PDF
        filename, file_path = await save_uploaded_pdf(file)

        # Extract text from PDF
        text = extract_text_from_pdf(file_path)

        if not text or len(text.strip()) < 100:
            return {
                "success": False,
                "message": "Could not extract enough text from the PDF."
            }

        text = text.strip()

        # Generate notes in selected language
        result = generate_notes(
            text=text,
            language=language
        )

        return {
            "success": result.get("success", False),
            "filename": filename,
            "language": language,
            "notes": result.get("notes"),
            "message": result.get("message")
        }

    except Exception as e:
        print("========== NOTES ERROR ==========")
        print(str(e))
        print("=================================")

        return {
            "success": False,
            "message": "Failed to generate notes.",
            "error": str(e)
        }

    try:

        filename, file_path = (
            await save_uploaded_pdf(file)
        )

        text = extract_text_from_pdf(
            file_path
        )

        if not text or not text.strip():

            return {
                "success": False,
                "message": (
                    "No readable text found in PDF."
                )
            }

        result = generate_notes(
            text
        )

        return {
            "success": result.get(
                "success",
                False
            ),
            "filename": filename,
            "notes": result.get(
                "notes"
            ),
            "message": result.get(
                "message"
            ),
            "error": result.get(
                "error"
            )
        }

    except ValueError as e:

        return {
            "success": False,
            "message": str(e)
        }

    except Exception as e:

        print(
            "========== NOTES ERROR =========="
        )

        print(str(e))

        print(
            "================================="
        )

        return {
            "success": False,
            "message": (
                "Failed to generate AI notes."
            ),
            "error": str(e)
        }


# ============================================================
# GENERATE AI FLASHCARDS
# ============================================================

@app.post("/generate-flashcards")
async def generate_flashcards_from_pdf(
    file: UploadFile = File(...)
):

    try:

        filename, file_path = (
            await save_uploaded_pdf(file)
        )

        # ----------------------------------------------------
        # Extract PDF text
        # ----------------------------------------------------

        text = extract_text_from_pdf(
            file_path
        )

        if not text or not text.strip():

            return {
                "success": False,
                "message": (
                    "No readable text found in PDF."
                )
            }

        # ----------------------------------------------------
        # Generate flashcards
        # ----------------------------------------------------

        result = generate_flashcards(
            text=text,
            number_of_cards=12
        )

        return {
            "success": result.get(
                "success",
                False
            ),
            "filename": filename,
            "flashcards": result.get(
                "flashcards",
                []
            ),
            "message": result.get(
                "message"
            ),
            "error": result.get(
                "error"
            )
        }

    except ValueError as e:

        return {
            "success": False,
            "message": str(e)
        }

    except Exception as e:

        print(
            "========== FLASHCARD ERROR =========="
        )

        print(str(e))

        print(
            "======================================"
        )

        return {
            "success": False,
            "message": (
                "Failed to generate flashcards."
            ),
            "error": str(e)
        }


# ============================================================
# AI TUTOR
# ============================================================

@app.post("/tutor")
async def tutor(
    data: dict
):

    try:

        # ----------------------------------------------------
        # Read request
        # ----------------------------------------------------

        question = data.get(
            "question",
            ""
        )

        pdf_text = data.get(
            "pdf_text",
            ""
        )

        conversation_history = data.get(
            "conversation_history",
            []
        )

        skill = data.get(
            "skill",
            ""
        )

        # ----------------------------------------------------
        # Clean values
        # ----------------------------------------------------

        question = (
            question.strip()
            if isinstance(question, str)
            else ""
        )

        pdf_text = (
            pdf_text.strip()
            if isinstance(pdf_text, str)
            else ""
        )

        skill = (
            skill.strip()
            if isinstance(skill, str)
            else ""
        )

        # ----------------------------------------------------
        # Validate question
        # ----------------------------------------------------

        if not question:

            return {
                "success": False,
                "message": (
                    "Question is required."
                )
            }

        # ----------------------------------------------------
        # Validate PDF
        # ----------------------------------------------------

        if not pdf_text:

            return {
                "success": False,
                "message": (
                    "Please upload a PDF before "
                    "using AI Tutor."
                )
            }

        # ----------------------------------------------------
        # Generate tutor response
        # ----------------------------------------------------

        result = generate_tutor_response(
            question=question,
            pdf_text=pdf_text,
            conversation_history=conversation_history,
            skill=skill
        )

        return result

    except Exception as e:

        print(
            "========== TUTOR ERROR =========="
        )

        print(str(e))

        print(
            "================================="
        )

        return {
            "success": False,
            "message": (
                "AI Tutor request failed."
            ),
            "error": str(e)
        }


# ============================================================
# VOICE TUTOR
#
# Browser Speech Recognition
#            ↓
# Text Question
#            ↓
# Existing AI Tutor / Groq
#            ↓
# Text Answer
#            ↓
# Browser Speech Synthesis
# ============================================================

@app.post("/voice-tutor")
async def voice_tutor(
    question: str = Form(...),
    pdf_text: str = Form(...),
    skill: str = Form(
        "General Learning"
    ),
    conversation_history: str = Form(
        "[]"
    )
):

    try:

        import json

        # ----------------------------------------------------
        # Clean input
        # ----------------------------------------------------

        question = (
            question.strip()
            if question
            else ""
        )

        pdf_text = (
            pdf_text.strip()
            if pdf_text
            else ""
        )

        skill = (
            skill.strip()
            if skill
            else "General Learning"
        )

        # ----------------------------------------------------
        # Validate question
        # ----------------------------------------------------

        if not question:

            return {
                "success": False,
                "message": (
                    "Question is required."
                )
            }

        # ----------------------------------------------------
        # Validate PDF
        # ----------------------------------------------------

        if not pdf_text:

            return {
                "success": False,
                "message": (
                    "Please upload a PDF before "
                    "using Voice Tutor."
                )
            }

        # ----------------------------------------------------
        # Parse conversation history
        # ----------------------------------------------------

        try:

            history = json.loads(
                conversation_history
            )

            if not isinstance(
                history,
                list
            ):
                history = []

        except Exception:

            history = []

        # ----------------------------------------------------
        # Use existing tutor AI
        # ----------------------------------------------------

        result = generate_tutor_response(
            question=question,
            pdf_text=pdf_text,
            conversation_history=history,
            skill=skill
        )

        return result

    except Exception as e:

        print(
            "========== VOICE TUTOR ERROR =========="
        )

        print(str(e))

        print(
            "======================================="
        )

        return {
            "success": False,
            "message": (
                "Voice Tutor request failed."
            ),
            "error": str(e)
        }


# ============================================================
# PERSONALIZED LEARNING PATH FROM PDF
# ============================================================

@app.post(
    "/personalized-learning-path"
)
async def personalized_learning_path(
    file: UploadFile = File(...),
    role: str = Form(
        "Learner"
    ),
    assessment_score: float = Form(
        60
    ),
    quiz_accuracy: float = Form(
        60
    ),
    years_experience: float = Form(
        0
    ),
    learning_goal: str = Form(
        "Master the uploaded learning material"
    )
):

    try:

        # ----------------------------------------------------
        # Save PDF
        # ----------------------------------------------------

        filename, file_path = (
            await save_uploaded_pdf(file)
        )

        # ----------------------------------------------------
        # Extract PDF text
        # ----------------------------------------------------

        text = extract_text_from_pdf(
            file_path
        )

        if not text or not text.strip():

            return {
                "success": False,
                "message": (
                    "No readable text found in PDF."
                )
            }

        # ----------------------------------------------------
        # Validate profile
        # ----------------------------------------------------

        role = (
            role.strip()
            if role
            else "Learner"
        )

        learning_goal = (
            learning_goal.strip()
            if learning_goal
            else (
                "Master the uploaded "
                "learning material"
            )
        )

        assessment_score = clean_score(
            assessment_score,
            60
        )

        quiz_accuracy = clean_score(
            quiz_accuracy,
            60
        )

        years_experience = clean_experience(
            years_experience,
            0
        )

        # ----------------------------------------------------
        # Generate personalized path
        # ----------------------------------------------------

        result = (
            generate_personalized_learning_path(
                text=text,
                role=role,
                assessment_score=assessment_score,
                quiz_accuracy=quiz_accuracy,
                learning_goal=learning_goal
            )
        )

        # ----------------------------------------------------
        # Return response
        # ----------------------------------------------------

        return {
            "success": result.get(
                "success",
                False
            ),
            "filename": filename,
            "learning_path": result.get(
                "learning_path",
                {}
            ),
            "message": result.get(
                "message"
            ),
            "error": result.get(
                "error"
            )
        }

    except ValueError as e:

        return {
            "success": False,
            "message": str(e)
        }

    except Exception as e:

        print(
            "========== PERSONALIZED PDF ERROR =========="
        )

        print(str(e))

        print(
            "============================================="
        )

        return {
            "success": False,
            "message": (
                "Failed to generate personalized "
                "learning path."
            ),
            "error": str(e)
        }


# ============================================================
# REGISTER
# ============================================================

@app.post("/register")
async def register(
    data: dict
):

    try:

        required_fields = [
            "full_name",
            "email",
            "password"
        ]

        for field in required_fields:

            if not data.get(field):

                return {
                    "success": False,
                    "message": (
                        f"{field} is required."
                    )
                }

        # Send registration data to auth service
        result = register_user(
            data
        )

        return result

    except Exception as e:

        print(
            "========== REGISTER ERROR =========="
        )

        print(str(e))

        print(
            "===================================="
        )

        return {
            "success": False,
            "message": (
                "Registration failed."
            ),
            "error": str(e)
        }


# ============================================================
# VERIFY OTP
# ============================================================

@app.post("/verify-otp")
async def verify_email_otp(
    data: dict
):

    try:

        email = data.get(
            "email",
            ""
        )

        otp = data.get(
            "otp",
            ""
        )

        # ----------------------------------------------------
        # Clean email
        # ----------------------------------------------------

        email = (
            email.strip().lower()
            if isinstance(email, str)
            else ""
        )

        # ----------------------------------------------------
        # Clean OTP
        # ----------------------------------------------------

        otp = (
            otp.strip()
            if isinstance(otp, str)
            else str(otp).strip()
        )

        # ----------------------------------------------------
        # Validate email
        # ----------------------------------------------------

        if not email:

            return {
                "success": False,
                "message": (
                    "Email is required."
                )
            }

        # ----------------------------------------------------
        # Validate OTP
        # ----------------------------------------------------

        if not otp:

            return {
                "success": False,
                "message": (
                    "OTP is required."
                )
            }

        # ----------------------------------------------------
        # OTP must contain 6 digits
        # ----------------------------------------------------

        if len(otp) != 6 or not otp.isdigit():

            return {
                "success": False,
                "message": (
                    "OTP must be a 6-digit number."
                )
            }

        # ----------------------------------------------------
        # Verify OTP through auth service
        # ----------------------------------------------------

        result = verify_otp(
            email,
            otp
        )

        return result

    except Exception as e:

        print(
            "========== OTP ERROR =========="
        )

        print(str(e))

        print(
            "==============================="
        )

        return {
            "success": False,
            "message": (
                "OTP verification failed."
            ),
            "error": str(e)
        }


# ============================================================
# RESEND OTP
# ============================================================

@app.post("/resend-otp")
async def resend_email_otp(
    data: dict
):

    try:

        email = data.get(
            "email",
            ""
        )

        email = (
            email.strip().lower()
            if isinstance(email, str)
            else ""
        )

        # ----------------------------------------------------
        # Validate email
        # ----------------------------------------------------

        if not email:

            return {
                "success": False,
                "message": (
                    "Email is required."
                )
            }

        # ----------------------------------------------------
        # Generate and send new OTP
        # ----------------------------------------------------

        result = resend_otp(
            email
        )

        return result

    except Exception as e:

        print(
            "========== RESEND OTP ERROR =========="
        )

        print(str(e))

        print(
            "======================================"
        )

        return {
            "success": False,
            "message": (
                "Failed to resend OTP."
            ),
            "error": str(e)
        }


# ============================================================
# GOOGLE AUTHENTICATION
# ============================================================

@app.post("/auth/google")
async def google_login(
    data: dict
):

    try:

        credential = data.get(
            "credential"
        )

        if not credential:

            return {
                "success": False,
                "message": (
                    "Google credential is required."
                )
            }

        result = verify_google_token(
            credential
        )

        if not result.get(
            "success",
            False
        ):

            return result

        user = result.get(
            "user",
            {}
        )

        return {
            "success": True,
            "message": (
                "Google authentication successful."
            ),
            "user": user
        }

    except Exception as e:

        print(
            "========== GOOGLE AUTH ERROR =========="
        )

        print(str(e))

        print(
            "======================================="
        )

        return {
            "success": False,
            "message": (
                "Google authentication failed."
            ),
            "error": str(e)
        }


# ============================================================
# GENERATE POWERPOINT FROM PDF
# ============================================================

@app.post("/generate-ppt")
async def generate_ppt_from_pdf(
    file: UploadFile = File(...),
    style: str = Form(
        "Visual Learning"
    )
):

    if not file.filename:

        return {
            "success": False,
            "message": "No file selected."
        }

    if not file.filename.lower().endswith(".pdf"):

        return {
            "success": False,
            "message": "Only PDF files are allowed."
        }

    filename = os.path.basename(
        file.filename
    )

    temporary_filename = (
        f"ppt_source_{os.getpid()}_{filename}"
    )

    temporary_path = (
        Path(UPLOAD_FOLDER) /
        temporary_filename
    )

    try:

        content = await file.read()

        if not content:

            return {
                "success": False,
                "message": "Uploaded PDF is empty."
            }

        with open(
            temporary_path,
            "wb"
        ) as output_file:

            output_file.write(content)

        # ----------------------------------------------------
        # Extract PDF text
        # ----------------------------------------------------

        extracted_text = extract_text_from_pdf(
            str(temporary_path)
        )

        if not extracted_text or not extracted_text.strip():

            return {
                "success": False,
                "message": (
                    "No readable text was found "
                    "in this PDF."
                )
            }

        # ----------------------------------------------------
        # Generate presentation
        # ----------------------------------------------------

        result = generate_presentation(
            pdf_text=extracted_text,
            original_filename=filename,
            style=style
        )

        if not result.get("success"):

            return result

        # ----------------------------------------------------
        # Create browser download path
        # ----------------------------------------------------

        generated_filename = result[
            "filename"
        ]

        result["download_url"] = (
            f"/download-ppt/{generated_filename}"
        )

        result["source_filename"] = filename

        result["characters"] = len(
            extracted_text
        )

        return result

    except Exception as error:

        print(
            "\n========== GENERATE PPT ERROR ==========\n",
            error
        )

        return {
            "success": False,
            "message": "Failed to generate presentation.",
            "error": str(error)
        }

    finally:

        try:

            if temporary_path.exists():

                temporary_path.unlink()

        except Exception:

            pass


# ============================================================
# DOWNLOAD POWERPOINT
# ============================================================

@app.get("/download-ppt/{filename}")
async def download_ppt(
    filename: str
):

    safe_name = os.path.basename(
        filename
    )

    file_path = (
        GENERATED_DIR /
        safe_name
    )

    if not file_path.exists():

        return {
            "success": False,
            "message": "PowerPoint file not found."
        }

    return FileResponse(
        path=str(file_path),
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "presentationml.presentation"
        ),
        filename=safe_name
    )


# ============================================================
# DIGITAL TWIN
#
# PDF → TEXT → AI ANALYSIS → DIGITAL TWIN
#
# IMPORTANT:
# No hardcoded Statistics
# No hardcoded Probability
# No fixed employee skills
# No fixed target scores
#
# The uploaded PDF determines the competencies.
# ============================================================

@app.post("/digital-twin/analyze")
async def analyze_digital_twin_pdf(
    file: UploadFile = File(...)
):

    """
    Generate an AI-powered Digital Twin from
    an uploaded PDF.

    The uploaded PDF is the primary source for:

    - document understanding
    - topics
    - competencies
    - competency scores
    - confidence
    - skill gaps
    - learning recommendations
    - future potential
    - overall competency
    - AI insights
    - personalized learning path

    The system does NOT use a predefined
    Statistics/Probability skill list.
    """

    # --------------------------------------------------------
    # Validate file
    # --------------------------------------------------------

    if not file.filename:

        return {
            "success": False,
            "message": "No file selected."
        }

    if not file.filename.lower().endswith(".pdf"):

        return {
            "success": False,
            "message": "Please upload a PDF file."
        }

    temporary_path = None

    try:

        # ----------------------------------------------------
        # Save uploaded PDF
        # ----------------------------------------------------

        filename = safe_filename(
            file.filename
        )

        temporary_filename = (
            f"digital_twin_{os.getpid()}_{filename}"
        )

        temporary_path = (
            UPLOAD_FOLDER /
            temporary_filename
        )

        pdf_bytes = await file.read()

        if not pdf_bytes:

            return {
                "success": False,
                "message": "The uploaded PDF is empty."
            }

        with open(
            temporary_path,
            "wb"
        ) as output_file:

            output_file.write(
                pdf_bytes
            )

        # ----------------------------------------------------
        # Extract text from PDF
        # ----------------------------------------------------

        pdf_text = extract_text_from_pdf(
            str(temporary_path)
        )

        if not pdf_text or len(
            pdf_text.strip()
        ) < 100:

            return {
                "success": False,
                "message": (
                    "Could not extract enough text "
                    "from the PDF. Please upload a "
                    "text-based PDF."
                )
            }

        # ----------------------------------------------------
        # Limit AI input size
        # ----------------------------------------------------

        pdf_text = pdf_text.strip()

        pdf_text = pdf_text[:60000]

        # ----------------------------------------------------
        # AI analyzes ONLY the uploaded PDF
        # ----------------------------------------------------

        result = analyze_pdf_for_digital_twin(
            pdf_text=pdf_text,
            filename=filename
        )

        # ----------------------------------------------------
        # Return Digital Twin
        # ----------------------------------------------------

        return {
            "success": True,
            "filename": filename,
            "digital_twin": result
        }

    except ValueError as e:

        return {
            "success": False,
            "message": str(e)
        }

    except Exception as e:

        print(
            "========== DIGITAL TWIN ERROR =========="
        )

        print(
            str(e)
        )

        print(
            "========================================="
        )

        return {
            "success": False,
            "message": (
                "Digital Twin analysis failed."
            ),
            "error": str(e)
        }

    finally:

        # ----------------------------------------------------
        # Delete temporary PDF
        # ----------------------------------------------------

        try:

            if (
                temporary_path
                and temporary_path.exists()
            ):

                temporary_path.unlink()

        except Exception as cleanup_error:

            print(
                "Digital Twin cleanup warning:",
                cleanup_error
            )


# ============================================================
# SERVER START
# ============================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )