import os
import json
import re

from groq import Groq
from dotenv import load_dotenv

load_dotenv()


def clean_json_response(raw_text: str):
    """
    Extract JSON safely from an LLM response.
    Handles:
    - normal JSON
    - ```json ... ```
    - accidental surrounding text
    """

    if not raw_text:
        raise ValueError("AI returned an empty response.")

    raw_text = raw_text.strip()

    # Remove markdown code fences
    raw_text = re.sub(
        r"^```json\s*",
        "",
        raw_text,
        flags=re.IGNORECASE
    )

    raw_text = re.sub(
        r"^```\s*",
        "",
        raw_text
    )

    raw_text = re.sub(
        r"\s*```$",
        "",
        raw_text
    )

    raw_text = raw_text.strip()

    # First attempt: direct JSON
    try:
        return json.loads(raw_text)
    except json.JSONDecodeError:
        pass

    # Second attempt: locate first { and last }
    start = raw_text.find("{")
    end = raw_text.rfind("}")

    if start == -1 or end == -1:
        raise ValueError(
            "No JSON object found in AI response."
        )

    json_text = raw_text[start:end + 1]

    return json.loads(json_text)


def normalize_learning_path(data):
    """
    Makes the AI response safe for the frontend.
    """

    if not isinstance(data, dict):
        raise ValueError("Learning path is not a JSON object.")

    path = data.get("learning_path", data)

    if not isinstance(path, dict):
        raise ValueError(
            "learning_path must be a JSON object."
        )

    path.setdefault(
        "title",
        "Personalized Learning Journey"
    )

    path.setdefault(
        "subtitle",
        "Your AI-generated learning roadmap"
    )

    path.setdefault(
        "learner_level",
        "Intermediate"
    )

    path.setdefault(
        "overall_goal",
        "Master the uploaded learning material"
    )

    path.setdefault(
        "estimated_hours",
        4
    )

    path.setdefault(
        "completion_percentage",
        0
    )

    path.setdefault(
        "strengths",
        []
    )

    path.setdefault(
        "skill_gaps",
        []
    )

    path.setdefault(
        "learning_strategy",
        []
    )

    path.setdefault(
        "stages",
        []
    )

    path.setdefault(
        "milestones",
        []
    )

    path.setdefault(
        "final_outcome",
        "Successfully understand and apply the concepts."
    )

    # Make sure stages is a list
    if not isinstance(path["stages"], list):
        path["stages"] = []

    # Normalize stages
    for index, stage in enumerate(path["stages"]):

        if not isinstance(stage, dict):
            continue

        stage.setdefault(
            "stage_id",
            index + 1
        )

        stage.setdefault(
            "title",
            f"Learning Stage {index + 1}"
        )

        stage.setdefault(
            "emoji",
            "📚"
        )

        stage.setdefault(
            "description",
            "Build knowledge and practical understanding."
        )

        stage.setdefault(
            "modules",
            []
        )

        if not isinstance(stage["modules"], list):
            stage["modules"] = []

        for module_index, module in enumerate(
            stage["modules"]
        ):

            if not isinstance(module, dict):
                continue

            module.setdefault(
                "module_id",
                f"M{index + 1}_{module_index + 1}"
            )

            module.setdefault(
                "title",
                "Learning Module"
            )

            module.setdefault(
                "description",
                "Study this concept carefully."
            )

            module.setdefault(
                "topic",
                "Core Concept"
            )

            module.setdefault(
                "level",
                "Intermediate"
            )

            module.setdefault(
                "estimated_minutes",
                30
            )

            module.setdefault(
                "why_recommended",
                "This topic is important for progressing through the learning path."
            )

            module.setdefault(
                "learning_objectives",
                []
            )

            module.setdefault(
                "activities",
                ["Read", "Practice", "Quiz"]
            )

            module.setdefault(
                "quiz_available",
                True
            )

            module.setdefault(
                "tutor_available",
                True
            )

    return path


def generate_personalized_learning_path(
    text: str,
    role: str = "Learner",
    assessment_score: float = 60,
    quiz_accuracy: float = 60,
    learning_goal: str = "Master the uploaded learning material"
):

    if not text or not text.strip():

        return {
            "success": False,
            "message": "No readable content was found in the PDF."
        }

    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:

        return {
            "success": False,
            "message": "GROQ_API_KEY is not configured."
        }

    try:

        client = Groq(api_key=api_key)

        # Limit PDF content
        content = text[:50000]

        prompt = f"""
You are STATWISE AI.

Create a personalized learning roadmap from the uploaded
learning material.

LEARNER INFORMATION

Role: {role}
Assessment score: {assessment_score}
Quiz accuracy: {quiz_accuracy}
Learning goal: {learning_goal}

Analyze ONLY the uploaded material.

Identify:

- important concepts
- subtopics
- prerequisites
- difficulty
- strengths
- skill gaps
- learning priorities
- practical applications

Create exactly 4 learning stages:

1. Foundation
2. Intermediate
3. Application
4. Mastery

Each stage should contain 2 or 3 modules.

For every module include:

module_id
title
description
topic
level
estimated_minutes
why_recommended
learning_objectives
activities
quiz_available
tutor_available

Also generate:

strengths
skill_gaps
learning_strategy
milestones
final_outcome
estimated_hours

PERSONALIZATION:

Assessment score = {assessment_score}
Quiz accuracy = {quiz_accuracy}

Lower scores should result in more foundational learning
and practice.

Higher scores should result in faster progression
towards application and mastery.

IMPORTANT:
Return ONLY valid JSON.
Do not use markdown.
Do not write explanations outside the JSON.

Use exactly this structure:

{{
  "learning_path": {{
    "title": "Personalized Learning Journey",
    "subtitle": "AI-generated roadmap based on your learning material",
    "learner_level": "Beginner",
    "overall_goal": "Master the uploaded learning material",
    "estimated_hours": 5,
    "completion_percentage": 0,

    "strengths": [
      "strength"
    ],

    "skill_gaps": [
      {{
        "skill": "concept",
        "current_level": 45,
        "target_level": 80,
        "gap": 35,
        "priority": "High"
      }}
    ],

    "learning_strategy": [
      "strategy"
    ],

    "stages": [
      {{
        "stage_id": 1,
        "title": "Foundation",
        "emoji": "🌱",
        "description": "description",

        "modules": [
          {{
            "module_id": "M1",
            "title": "module title",
            "description": "module description",
            "topic": "topic",
            "level": "Beginner",
            "estimated_minutes": 30,
            "why_recommended": "reason",

            "learning_objectives": [
              "objective 1",
              "objective 2"
            ],

            "activities": [
              "Read",
              "Practice",
              "Quiz"
            ],

            "quiz_available": true,
            "tutor_available": true
          }}
        ]
      }}
    ],

    "milestones": [
      {{
        "title": "Foundation Complete",
        "description": "description",
        "target": "Stage 1",
        "emoji": "🌱"
      }}
    ],

    "final_outcome": "final outcome"
  }}
}}

UPLOADED MATERIAL:

{content}
"""

        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",

            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are STATWISE AI. "
                        "Return only valid JSON."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],

            temperature=0.1,

            # IMPORTANT:
            # Do NOT use response_format JSON here.
            max_tokens=10000
        )

        raw = response.choices[0].message.content

        print("\n========== AI RAW RESPONSE ==========")
        print(raw[:3000])
        print("=====================================\n")

        # Parse JSON ourselves
        parsed = clean_json_response(raw)

        # Normalize
        learning_path = normalize_learning_path(
            parsed
        )

        print(
            "========== LEARNING PATH GENERATED =========="
        )

        print(
            "Stages:",
            len(learning_path["stages"])
        )

        total_modules = sum(
            len(stage.get("modules", []))
            for stage in learning_path["stages"]
        )

        print(
            "Modules:",
            total_modules
        )

        print(
            "=============================================="
        )

        return {
            "success": True,
            "learning_path": learning_path
        }

    except json.JSONDecodeError as e:

        print(
            "JSON PARSE ERROR:",
            str(e)
        )

        return {
            "success": False,
            "message": "AI generated invalid JSON.",
            "error": str(e)
        }

    except Exception as e:

        print(
            "\n========== LEARNING PATH ERROR =========="
        )

        print(str(e))

        print(
            "=========================================\n"
        )

        return {
            "success": False,
            "message": (
                "Failed to generate personalized learning path."
            ),
            "error": str(e)
        }