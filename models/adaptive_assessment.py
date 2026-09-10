import json
import os
import random


# ============================================================
# STATWISE AI - ADAPTIVE ASSESSMENT ENGINE
# ============================================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QUESTIONS_FILE = os.path.join(BASE_DIR, "data", "questions.json")


# ------------------------------------------------------------
# LOAD QUESTIONS
# ------------------------------------------------------------

def load_questions():
    with open(QUESTIONS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    if isinstance(data, list):
        return data

    if isinstance(data, dict):
        if "questions" in data:
            return data["questions"]

        # Support grouped question JSON
        questions = []

        for value in data.values():
            if isinstance(value, list):
                questions.extend(value)

        return questions

    return []


# ------------------------------------------------------------
# DIFFICULTY NORMALIZATION
# ------------------------------------------------------------

def normalize_difficulty(value):
    value = str(value).strip().lower()

    if value in ["easy", "beginner", "basic"]:
        return "Beginner"

    if value in ["medium", "intermediate", "moderate"]:
        return "Intermediate"

    if value in ["hard", "advanced", "difficult"]:
        return "Advanced"

    return "Intermediate"


DIFFICULTY_LEVELS = [
    "Beginner",
    "Intermediate",
    "Advanced"
]


# ------------------------------------------------------------
# GET QUESTIONS BY SKILL
# ------------------------------------------------------------

def get_skill_questions(questions, skill):
    return [
        q for q in questions
        if str(q.get("skill", "")).strip().lower()
        == str(skill).strip().lower()
    ]


# ------------------------------------------------------------
# GET QUESTIONS BY DIFFICULTY
# ------------------------------------------------------------

def get_difficulty_questions(questions, difficulty):
    difficulty = normalize_difficulty(difficulty)

    return [
        q for q in questions
        if normalize_difficulty(q.get("difficulty", "Intermediate"))
        == difficulty
    ]


# ------------------------------------------------------------
# SELECT NEXT QUESTION
# ------------------------------------------------------------

def select_next_question(
    questions,
    current_difficulty="Intermediate",
    skill=None,
    asked_ids=None
):
    """
    Select the next question dynamically.

    Priority:
    1. Requested skill
    2. Requested difficulty
    3. Avoid already asked questions
    """

    if asked_ids is None:
        asked_ids = set()

    available = [
        q for q in questions
        if q.get("question_id") not in asked_ids
    ]

    if not available:
        return None

    # Filter by skill
    if skill:
        skill_questions = [
            q for q in available
            if str(q.get("skill", "")).strip().lower()
            == str(skill).strip().lower()
        ]

        if skill_questions:
            available = skill_questions

    # Filter by difficulty
    difficulty_questions = [
        q for q in available
        if normalize_difficulty(
            q.get("difficulty", "Intermediate")
        ) == normalize_difficulty(current_difficulty)
    ]

    if difficulty_questions:
        available = difficulty_questions

    return random.choice(available)


# ------------------------------------------------------------
# ADAPT DIFFICULTY
# ------------------------------------------------------------

def get_next_difficulty(current_difficulty, is_correct):
    """
    Correct answer  → harder question
    Wrong answer    → easier question
    """

    current_difficulty = normalize_difficulty(current_difficulty)

    current_index = DIFFICULTY_LEVELS.index(current_difficulty)

    if is_correct:
        next_index = min(
            current_index + 1,
            len(DIFFICULTY_LEVELS) - 1
        )
    else:
        next_index = max(
            current_index - 1,
            0
        )

    return DIFFICULTY_LEVELS[next_index]


# ------------------------------------------------------------
# CALCULATE PERFORMANCE
# ------------------------------------------------------------

def calculate_performance(answers):
    """
    answers format:

    [
        {
            "skill": "Probability",
            "correct": True
        }
    ]
    """

    if not answers:
        return {
            "overall_score": 0,
            "skill_scores": {}
        }

    total = len(answers)
    correct = sum(
        1 for answer in answers
        if answer.get("correct") is True
    )

    overall_score = round(
        (correct / total) * 100,
        2
    )

    skill_data = {}

    for answer in answers:

        skill = answer.get("skill", "Unknown")

        if skill not in skill_data:
            skill_data[skill] = {
                "total": 0,
                "correct": 0
            }

        skill_data[skill]["total"] += 1

        if answer.get("correct") is True:
            skill_data[skill]["correct"] += 1

    skill_scores = {}

    for skill, data in skill_data.items():

        score = (
            data["correct"]
            / data["total"]
        ) * 100

        skill_scores[skill] = round(score, 2)

    return {
        "overall_score": overall_score,
        "skill_scores": skill_scores
    }


# ------------------------------------------------------------
# SKILL PROFICIENCY
# ------------------------------------------------------------

def calculate_skill_proficiency(score):

    if score >= 80:
        return "Advanced"

    if score >= 60:
        return "Intermediate"

    if score >= 40:
        return "Developing"

    return "Beginner"


# ------------------------------------------------------------
# FIND WEAKEST SKILL
# ------------------------------------------------------------

def identify_weakest_skill(skill_scores):

    if not skill_scores:
        return None

    return min(
        skill_scores,
        key=skill_scores.get
    )


# ------------------------------------------------------------
# RECOMMEND ACTION
# ------------------------------------------------------------

def recommend_action(skill, score):

    if score < 40:
        priority = "Critical"
        recommendation = (
            f"{skill} requires immediate foundational learning."
        )

    elif score < 60:
        priority = "High"
        recommendation = (
            f"{skill} needs focused practice and guided learning."
        )

    elif score < 80:
        priority = "Medium"
        recommendation = (
            f"{skill} is developing and should be strengthened "
            f"through intermediate learning."
        )

    else:
        priority = "Low"
        recommendation = (
            f"{skill} is performing well. Consider advanced learning."
        )

    return {
        "priority": priority,
        "recommendation": recommendation
    }


# ------------------------------------------------------------
# COMPLETE ASSESSMENT ANALYSIS
# ------------------------------------------------------------

def analyze_assessment(answers):

    performance = calculate_performance(answers)

    overall_score = performance["overall_score"]
    skill_scores = performance["skill_scores"]

    weakest_skill = identify_weakest_skill(skill_scores)

    if weakest_skill:
        weakest_score = skill_scores[weakest_skill]

        action = recommend_action(
            weakest_skill,
            weakest_score
        )

        priority = action["priority"]
        recommendation = action["recommendation"]

    else:
        weakest_score = 0
        priority = "None"
        recommendation = "Complete an assessment to generate recommendations."

    return {
        "overall_score": overall_score,
        "skill_scores": skill_scores,
        "weakest_skill": weakest_skill,
        "weakest_skill_score": weakest_score,
        "priority": priority,
        "recommendation": recommendation
    }


# ============================================================
# ADAPTIVE ASSESSMENT SESSION
# ============================================================

class AdaptiveAssessment:

    def __init__(self, questions, initial_difficulty="Intermediate"):

        self.questions = questions

        self.current_difficulty = normalize_difficulty(
            initial_difficulty
        )

        self.answers = []

        self.asked_ids = set()

        self.question_number = 0

    # --------------------------------------------------------
    # GET NEXT QUESTION
    # --------------------------------------------------------

    def next_question(self, skill=None):

        question = select_next_question(
            self.questions,
            current_difficulty=self.current_difficulty,
            skill=skill,
            asked_ids=self.asked_ids
        )

        if question is None:
            return None

        self.asked_ids.add(
            question.get("question_id")
        )

        self.question_number += 1

        return question

    # --------------------------------------------------------
    # SUBMIT ANSWER
    # --------------------------------------------------------

    def submit_answer(self, question, selected_answer):

        correct_answer = question.get("correct_answer")

        is_correct = (
            str(selected_answer).strip().lower()
            ==
            str(correct_answer).strip().lower()
        )

        skill = question.get(
            "skill",
            "Unknown"
        )

        self.answers.append({
            "question_id": question.get("question_id"),
            "skill": skill,
            "difficulty": normalize_difficulty(
                question.get("difficulty", "Intermediate")
            ),
            "selected_answer": selected_answer,
            "correct_answer": correct_answer,
            "correct": is_correct
        })

        # Adapt difficulty
        self.current_difficulty = get_next_difficulty(
            self.current_difficulty,
            is_correct
        )

        return {
            "correct": is_correct,
            "next_difficulty": self.current_difficulty,
            "skill": skill
        }

    # --------------------------------------------------------
    # GET CURRENT ANALYSIS
    # --------------------------------------------------------

    def get_analysis(self):

        return analyze_assessment(
            self.answers
        )


# ============================================================
# DEMO
# ============================================================

if __name__ == "__main__":

    print("=" * 50)
    print("        STATWISE AI")
    print("   ADAPTIVE ASSESSMENT ENGINE")
    print("=" * 50)

    questions = load_questions()

    print("\nQuestions loaded:", len(questions))

    # Create adaptive session
    assessment = AdaptiveAssessment(
        questions,
        initial_difficulty="Intermediate"
    )

    print("\nADAPTIVE SESSION")
    print("-" * 50)

    # Simulated answers
    for i in range(5):

        question = assessment.next_question()

        if question is None:
            break

        difficulty = normalize_difficulty(
            question.get("difficulty", "Intermediate")
        )

        print(
            f"\nQuestion {i + 1}"
        )

        print(
            "ID:",
            question.get("question_id")
        )

        print(
            "Skill:",
            question.get("skill")
        )

        print(
            "Difficulty:",
            difficulty
        )

        # Simulate answer
        correct_answer = question.get(
            "correct_answer"
        )

        # Demo alternates correct / wrong
        if i % 2 == 0:
            selected_answer = correct_answer
        else:
            selected_answer = "Wrong Answer"

        result = assessment.submit_answer(
            question,
            selected_answer
        )

        print(
            "Result:",
            "Correct" if result["correct"]
            else "Wrong"
        )

        print(
            "Next Difficulty:",
            result["next_difficulty"]
        )

    # Final analysis
    analysis = assessment.get_analysis()

    print("\n")
    print("=" * 50)
    print("FINAL ADAPTIVE ANALYSIS")
    print("=" * 50)

    print(
        "\nOverall Score:",
        analysis["overall_score"],
        "%"
    )

    print("\nSkill Scores:")

    for skill, score in analysis["skill_scores"].items():

        print(
            f"- {skill}: {score}%"
        )

    print(
        "\nWeakest Skill:",
        analysis["weakest_skill"]
    )

    print(
        "Priority:",
        analysis["priority"]
    )

    print(
        "\nAI Recommendation:"
    )

    print(
        analysis["recommendation"]
    )

    print("\n")
    print("=" * 50)