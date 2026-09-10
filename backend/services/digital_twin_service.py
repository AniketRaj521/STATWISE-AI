import json
import os
import re
from typing import Any, Dict

from dotenv import load_dotenv
from groq import Groq


# ---------------------------------------------------------
# LOAD ENVIRONMENT
# ---------------------------------------------------------

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

ENV_PATH = os.path.join(BASE_DIR, ".env")

load_dotenv(ENV_PATH, override=True)


# ---------------------------------------------------------
# GROQ CLIENT
# ---------------------------------------------------------

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise RuntimeError(
        "GROQ_API_KEY is not configured in backend/.env"
    )

client = Groq(api_key=GROQ_API_KEY)


# ---------------------------------------------------------
# AI DIGITAL TWIN ANALYZER
# ---------------------------------------------------------

def analyze_pdf_for_digital_twin(
    pdf_text: str,
    filename: str = "uploaded_document.pdf"
) -> Dict[str, Any]:

    if not pdf_text or len(pdf_text.strip()) < 100:
        raise ValueError(
            "The uploaded PDF does not contain enough readable text."
        )

    # Prevent excessively large prompts
    pdf_text = pdf_text[:60000]

    prompt = f"""
You are STATWISE AI's Digital Twin Intelligence Engine.

Your task is to analyze the uploaded learning document and construct
a competency-oriented Digital Twin based ONLY on the information
contained in the document.

DOCUMENT NAME:
{filename}

DOCUMENT CONTENT:
-------------------------
{pdf_text}
-------------------------

IMPORTANT RULES:

1. Analyze ONLY the uploaded document.
2. Do NOT assume that the document is about Statistics.
3. Do NOT automatically create competencies such as Probability,
   Statistics, Data Analysis, or Visualization unless the document
   actually supports them.
4. Discover the major subjects, concepts, technical skills and
   competencies from the document.
5. The competency names must be dynamically generated according to
   the uploaded document.
6. Do NOT use a predefined skill list.
7. Do NOT invent facts that are not supported by the document.
8. If evidence for a competency is weak, give it a lower confidence.
9. This is a learning-material competency profile, not a medical,
   employment, or psychological diagnosis.
10. Scores represent estimated competency relevance/coverage based
    on the document content, NOT an actual examination result.
11. Return valid JSON only.
12. Do not use Markdown.
13. Generate 4 to 8 important competencies.
14. Generate 3 to 6 important knowledge topics.
15. Identify learning gaps based on areas that appear incomplete,
    advanced, or insufficiently covered in the document.
16. Recommend learning areas directly related to the document.
17. Estimate future learning potential based on the concepts covered.
18. Explain every competency with evidence from the document.

Return exactly this JSON structure:

{{
  "document": {{
    "filename": "{filename}",
    "title": "",
    "summary": "",
    "topics": []
  }},

  "competencies": [
    {{
      "name": "",
      "score": 0,
      "confidence": 0,
      "level": "",
      "evidence": ""
    }}
  ],

  "skill_gaps": [
    {{
      "name": "",
      "priority": "High",
      "reason": ""
    }}
  ],

  "recommended_learning": [
    {{
      "title": "",
      "reason": "",
      "estimated_hours": 0
    }}
  ],

  "future_potential": 0,

  "overall_competency": 0,

  "overall_level": "",

  "ai_insight": "",

  "learning_path": [
    {{
      "step": 1,
      "title": "",
      "description": ""
    }}
  ]
}}
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a precise educational competency "
                    "analysis engine. Return only valid JSON."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2,
        max_tokens=5000
    )

    raw_response = response.choices[0].message.content.strip()

    # -----------------------------------------------------
    # CLEAN POSSIBLE MARKDOWN WRAPPERS
    # -----------------------------------------------------

    raw_response = re.sub(
        r"^```json\s*",
        "",
        raw_response,
        flags=re.IGNORECASE
    )

    raw_response = re.sub(
        r"^```\s*",
        "",
        raw_response
    )

    raw_response = re.sub(
        r"\s*```$",
        "",
        raw_response
    )

    # -----------------------------------------------------
    # PARSE JSON
    # -----------------------------------------------------

    try:
        result = json.loads(raw_response)

    except json.JSONDecodeError:

        # Try extracting the JSON object
        start = raw_response.find("{")
        end = raw_response.rfind("}")

        if start == -1 or end == -1:
            raise ValueError(
                "AI did not return valid JSON."
            )

        try:
            result = json.loads(
                raw_response[start:end + 1]
            )
        except json.JSONDecodeError as exc:
            raise ValueError(
                f"Unable to parse AI Digital Twin response: {exc}"
            )

    # -----------------------------------------------------
    # NORMALIZE RESULT
    # -----------------------------------------------------

    result = normalize_digital_twin(result)

    return result


# ---------------------------------------------------------
# NORMALIZATION
# ---------------------------------------------------------

def normalize_digital_twin(
    data: Dict[str, Any]
) -> Dict[str, Any]:

    document = data.get("document", {})

    competencies = data.get(
        "competencies",
        []
    )

    skill_gaps = data.get(
        "skill_gaps",
        []
    )

    recommended_learning = data.get(
        "recommended_learning",
        []
    )

    learning_path = data.get(
        "learning_path",
        []
    )

    # Make sure competency scores are valid
    for competency in competencies:

        try:
            competency["score"] = round(
                max(
                    0,
                    min(
                        100,
                        float(
                            competency.get(
                                "score",
                                0
                            )
                        )
                    )
                )
            )
        except (ValueError, TypeError):
            competency["score"] = 0

        try:
            competency["confidence"] = round(
                max(
                    0,
                    min(
                        100,
                        float(
                            competency.get(
                                "confidence",
                                0
                            )
                        )
                    )
                )
            )
        except (ValueError, TypeError):
            competency["confidence"] = 0

    # Calculate overall competency from AI competencies
    if competencies:

        scores = [
            item["score"]
            for item in competencies
        ]

        overall = round(
            sum(scores) / len(scores)
        )

    else:
        overall = 0

    if overall < 40:
        overall_level = "Beginner"
    elif overall < 70:
        overall_level = "Intermediate"
    elif overall < 85:
        overall_level = "Advanced"
    else:
        overall_level = "Expert"

    # Future potential should remain realistic
    ai_future = data.get(
        "future_potential",
        overall
    )

    try:
        future_potential = round(
            max(
                overall,
                min(
                    100,
                    float(ai_future)
                )
            )
        )
    except (ValueError, TypeError):
        future_potential = overall

    return {
        "document": {
            "filename": document.get(
                "filename",
                "uploaded_document.pdf"
            ),
            "title": document.get(
                "title",
                "Uploaded Learning Material"
            ),
            "summary": document.get(
                "summary",
                ""
            ),
            "topics": document.get(
                "topics",
                []
            )
        },

        "competencies": competencies,

        "skill_gaps": skill_gaps,

        "recommended_learning": recommended_learning,

        "future_potential": future_potential,

        "overall_competency": overall,

        "overall_level": overall_level,

        "ai_insight": data.get(
            "ai_insight",
            ""
        ),

        "learning_path": learning_path,

        "twin_status": "Active",

        "analysis_type": (
            "PDF-grounded competency analysis"
        )
    }