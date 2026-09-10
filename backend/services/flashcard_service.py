import os
import json

from groq import Groq
from dotenv import load_dotenv

load_dotenv()


def generate_flashcards(text: str, number_of_cards: int = 12):

    if not text or not text.strip():
        return {
            "success": False,
            "message": "No text was extracted from the PDF."
        }

    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        return {
            "success": False,
            "message": "GROQ_API_KEY is not configured."
        }

    try:

        client = Groq(api_key=api_key)

        # Limit the amount of text sent to the AI
        content = text[:50000]

        prompt = f"""
You are STATWISE AI Flashcard Generator.

Your task is to create high-quality educational flashcards
ONLY from the uploaded learning material.

Create exactly {number_of_cards} flashcards.

Each flashcard must contain:

1. A clear question
2. A correct answer
3. The topic/skill
4. Difficulty level
5. A short explanation

IMPORTANT RULES:

- Use ONLY information available in the uploaded material.
- Do NOT invent facts.
- Do NOT create unrelated questions.
- Questions should test understanding, not just copy sentences.
- Keep questions concise.
- Keep answers accurate and student-friendly.
- Mix easy, medium and difficult questions.
- Cover different topics from the document.
- Avoid duplicate questions.
- Answers should be detailed enough to learn from.

Return ONLY valid JSON.

Required format:

{{
    "flashcards": [
        {{
            "id": 1,
            "question": "What is ...?",
            "answer": "....",
            "topic": "....",
            "difficulty": "Easy",
            "explanation": "...."
        }}
    ]
}}

UPLOADED LEARNING MATERIAL:

{content}
"""

        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are STATWISE AI, an expert educational "
                        "flashcard generation assistant."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2,
            response_format={"type": "json_object"},
            max_tokens=10000
        )

        raw = response.choices[0].message.content

        if not raw:
            return {
                "success": False,
                "message": "Groq returned an empty response."
            }

        try:

            result = json.loads(raw)

        except json.JSONDecodeError:

            return {
                "success": False,
                "message": "AI returned invalid flashcard data."
            }

        flashcards = result.get("flashcards", [])

        if not flashcards:
            return {
                "success": False,
                "message": "No flashcards were generated."
            }

        return {
            "success": True,
            "flashcards": flashcards
        }

    except Exception as e:

        print("========== FLASHCARD ERROR ==========")
        print(str(e))
        print("=====================================")

        return {
            "success": False,
            "message": "Failed to generate flashcards.",
            "error": str(e)
        }