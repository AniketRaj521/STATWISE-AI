import json
import os
import re
from google import genai
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not configured")

client = genai.Client(api_key=API_KEY)


def generate_mindmap(pdf_text: str, filename: str = "document.pdf"):

    # Limit text so very large PDFs don't overload the model
    pdf_text = pdf_text[:50000]

    prompt = f"""
You are an expert educational mind-map generator.

Create a clear hierarchical mind map from the following PDF learning material.

PDF filename:
{filename}

Learning material:
{pdf_text}

Return ONLY valid JSON.

Required JSON structure:

{{
  "title": "Main topic of the document",
  "nodes": [
    {{
      "id": "1",
      "label": "Main Topic",
      "type": "root"
    }},
    {{
      "id": "2",
      "label": "Major Concept",
      "type": "branch"
    }},
    {{
      "id": "3",
      "label": "Sub Concept",
      "type": "child"
    }}
  ],
  "edges": [
    {{
      "source": "1",
      "target": "2"
    }},
    {{
      "source": "2",
      "target": "3"
    }}
  ]
}}

Rules:

1. Create one root node.
2. Identify 4 to 8 major concepts.
3. Add useful sub-concepts under each major concept.
4. Keep labels short and readable.
5. Do not create unnecessary nodes.
6. Every edge source and target must refer to an existing node ID.
7. The structure must represent the actual PDF content.
8. Do not invent unrelated concepts.
9. Use simple educational language.
10. Return JSON only.
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    text = response.text.strip()

    # Remove markdown code fences if Gemini adds them
    text = re.sub(r"^```json\s*", "", text)
    text = re.sub(r"^```\s*", "", text)
    text = re.sub(r"\s*```$", "", text)

    try:
        result = json.loads(text)
    except json.JSONDecodeError as e:
        raise ValueError(f"Gemini returned invalid JSON: {e}")

    # Basic validation
    if "title" not in result:
        result["title"] = filename.replace(".pdf", "")

    if "nodes" not in result:
        result["nodes"] = []

    if "edges" not in result:
        result["edges"] = []

    return result