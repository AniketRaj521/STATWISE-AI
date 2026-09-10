import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()


# ============================================================
# SUPPORTED LANGUAGES
# ============================================================

SUPPORTED_LANGUAGES = [
    "English",
    "Hindi",
    "Telugu",
    "Tamil",
    "Kannada",
    "Malayalam",
    "Marathi",
    "Bengali",
]


# ============================================================
# LANGUAGE NORMALIZER
# ============================================================

def normalize_language(language: str) -> str:

    if not language:
        return "English"

    language = language.strip()

    for supported in SUPPORTED_LANGUAGES:
        if language.lower() == supported.lower():
            return supported

    return "English"


# ============================================================
# GENERATE NOTES
# ============================================================

def generate_notes(
    text: str,
    language: str = "English",
    topic: str = ""
):

    # --------------------------------------------------------
    # Validate text
    # --------------------------------------------------------

    if not text or not text.strip():

        return {
            "success": False,
            "message": "No text was extracted from the PDF."
        }

    # --------------------------------------------------------
    # API KEY
    # --------------------------------------------------------

    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:

        return {
            "success": False,
            "message": "GROQ_API_KEY is not configured."
        }

    # --------------------------------------------------------
    # Normalize language
    # --------------------------------------------------------

    language = normalize_language(language)

    # --------------------------------------------------------
    # Create Groq client
    # --------------------------------------------------------

    try:

        client = Groq(
            api_key=api_key
        )

        # ----------------------------------------------------
        # Limit PDF text
        # ----------------------------------------------------

        content = text[:50000]

        # ----------------------------------------------------
        # Topic instruction
        # ----------------------------------------------------

        topic_instruction = ""

        if topic and topic.strip():

            topic_instruction = f"""
Additional learner request:

{topic}

Use this request when creating the notes.
"""

        # ----------------------------------------------------
        # AI PROMPT
        # ----------------------------------------------------

        prompt = f"""
You are STATWISE AI, an intelligent learning assistant.

Your task is to generate high-quality study notes from
the provided learning material.

TARGET LANGUAGE:
{language}

VERY IMPORTANT LANGUAGE RULE:

Every learner-facing textual value in the JSON MUST be written
in {language}.

This includes:

- title
- overview
- summary
- section headings
- section content
- key points
- important points
- examples
- important terms
- meanings
- formulas explanations
- exam points
- quick revision points
- practice questions
- conclusion

Do NOT translate JSON field names.

Keep JSON field names exactly as requested.

For example:

Correct:
{{
  "title": "தமிழில் தலைப்பு",
  "overview": "தமிழில் விளக்கம்"
}}

Not:
{{
  "தலைப்பு": "...",
  "மேலோட்டம்": "..."
}}

If the requested language is Telugu, generate the learner-facing
content in Telugu.

If the requested language is Hindi, generate the learner-facing
content in Hindi.

If the requested language is Tamil, generate the learner-facing
content in Tamil.

If the requested language is Kannada, generate the learner-facing
content in Kannada.

If the requested language is Malayalam, generate the learner-facing
content in Malayalam.

If the requested language is Marathi, generate the learner-facing
content in Marathi.

If the requested language is Bengali, generate the learner-facing
content in Bengali.

English technical terms may be retained when they are commonly
used in the subject, but explanations should follow the selected
language.

Do not mix languages unnecessarily.

Do not write English explanations when another language was selected.

{topic_instruction}

Return ONLY valid JSON.

Use this exact structure:

{{
    "title": "AI generated title",

    "overview": "Short overview of the learning material",

    "sections": [
        {{
            "heading": "Section heading",
            "content": "Detailed but easy explanation",

            "key_points": [
                "Important point 1",
                "Important point 2"
            ],

            "examples": [
                "Example 1",
                "Example 2"
            ]
        }}
    ],

    "important_terms": [
        {{
            "term": "Important term",
            "meaning": "Simple meaning"
        }}
    ],

    "important_formulas": [
        {{
            "formula": "Formula",
            "explanation": "Explanation"
        }}
    ],

    "exam_points": [
        "Important exam point 1",
        "Important exam point 2"
    ],

    "quick_revision": [
        "Quick revision point 1",
        "Quick revision point 2"
    ],

    "practice_questions": [
        "Practice question 1",
        "Practice question 2"
    ],

    "conclusion": "Short conclusion"
}}

QUALITY REQUIREMENTS:

1. Use simple language.
2. Keep the explanation educational.
3. Extract information from the supplied material.
4. Do not invent unrelated facts.
5. Organize the material logically.
6. Highlight important concepts.
7. Include formulas when present.
8. Include exam-oriented points.
9. Create useful revision points.
10. Create practice questions from the material.
11. Keep technical terms accurate.
12. Do not return Markdown.
13. Return valid JSON only.

LEARNING MATERIAL:

{content}
"""

        # ----------------------------------------------------
        # GROQ REQUEST
        # ----------------------------------------------------

        response = client.chat.completions.create(

            model="openai/gpt-oss-20b",

            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are STATWISE AI, an expert "
                        "multilingual educational assistant. "
                        "Always follow the requested output "
                        "language."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],

            temperature=0.2,

            response_format={
                "type": "json_object"
            },

            max_tokens=12000
        )

        # ----------------------------------------------------
        # Get response
        # ----------------------------------------------------

        raw = response.choices[0].message.content

        if not raw:

            return {
                "success": False,
                "message": "AI returned an empty response."
            }

        # ----------------------------------------------------
        # Parse JSON
        # ----------------------------------------------------

        try:

            notes = json.loads(raw)

        except json.JSONDecodeError:

            # Fallback if AI returned plain text
            notes = {
                "title": "STATWISE AI Notes",
                "overview": raw,
                "sections": [],
                "important_terms": [],
                "important_formulas": [],
                "exam_points": [],
                "quick_revision": [],
                "practice_questions": [],
                "conclusion": ""
            }

        # ----------------------------------------------------
        # Return
        # ----------------------------------------------------

        return {
            "success": True,
            "language": language,
            "notes": notes
        }

    # --------------------------------------------------------
    # ERROR
    # --------------------------------------------------------

    except Exception as e:

        print("==========================================")
        print("       STATWISE NOTES ERROR")
        print("==========================================")
        print(str(e))
        print("==========================================")

        return {
            "success": False,
            "message": "Failed to generate multilingual notes.",
            "error": str(e)
        }