import json
import os

from dotenv import load_dotenv
from groq import Groq

load_dotenv()


def generate_mcqs(text):
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise ValueError(
            "GROQ_API_KEY is not configured. "
            "Please add it to your backend .env file."
        )

    client = Groq(api_key=api_key)

    prompt = f"""
Generate 10 multiple choice questions from the following educational content.

Return ONLY valid JSON.
Do not include markdown.
Do not include ```json.
Do not include explanations outside the JSON.

Required format:

[
  {{
    "question": "Question text",
    "options": ["A", "B", "C", "D"],
    "answer": "Correct option"
  }}
]

Content:
{text[:6000]}
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an educational quiz generator. "
                    "Return valid JSON only."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        temperature=0.3,
    )

    result = response.choices[0].message.content

    try:
        return json.loads(result)
    except json.JSONDecodeError:
        return {
            "error": "Invalid JSON",
            "raw_response": result,
        }