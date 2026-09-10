import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
COURSES_PATH = BASE_DIR / "data" / "courses.json"


def load_courses():
    """Load courses from courses.json."""
    if not COURSES_PATH.exists():
        raise FileNotFoundError(
            f"courses.json not found at: {COURSES_PATH}"
        )

    with open(COURSES_PATH, "r", encoding="utf-8") as file:
        data = json.load(file)

    # Handle different JSON structures safely
    if isinstance(data, list):
        return data

    if isinstance(data, dict):
        # If courses are stored inside a "courses" key
        if "courses" in data and isinstance(data["courses"], list):
            return data["courses"]

        # If courses are grouped by skill/category
        courses = []

        for key, value in data.items():
            if isinstance(value, list):
                for course in value:
                    if isinstance(course, dict):
                        course_copy = course.copy()

                        # Add skill/category if not already present
                        if "skill" not in course_copy:
                            course_copy["skill"] = key

                        courses.append(course_copy)

        return courses

    raise ValueError("Invalid courses.json format.")


def recommend_courses(skill_gaps, max_courses=3):
    """
    Recommend courses based on detected skill gaps.
    """

    courses = load_courses()
    recommendations = []

    for gap in skill_gaps:

        if gap.get("gap", 0) <= 0:
            continue

        skill = str(gap.get("skill", "")).strip().lower()

        for course in courses:

            if not isinstance(course, dict):
                continue

            course_skill = str(
                course.get("skill", "")
            ).strip().lower()

            if course_skill == skill:

                recommendations.append({
                    "course_id": course.get(
                        "course_id",
                        course.get("id", "N/A")
                    ),

                    "title": course.get(
                        "title",
                        course.get("name", "Untitled Course")
                    ),

                    "skill": course.get(
                        "skill",
                        gap.get("skill")
                    ),

                    "level": course.get(
                        "level",
                        course.get("difficulty", "All Levels")
                    ),

                    "duration": course.get(
                        "duration",
                        course.get("duration_hours", "N/A")
                    ),

                    "reason": (
                        f"Recommended because your "
                        f"{gap.get('skill')} gap is "
                        f"{gap.get('gap')} points."
                    ),

                    "priority": gap.get("priority", "Medium"),

                    "gap": gap.get("gap", 0)
                })


    # Highest skill gap first
    recommendations.sort(
        key=lambda x: x["gap"],
        reverse=True
    )

    # Remove duplicate courses
    unique_courses = []
    seen = set()

    for course in recommendations:

        course_id = course["course_id"]

        if course_id not in seen:
            unique_courses.append(course)
            seen.add(course_id)

    return unique_courses[:max_courses]


# --------------------------------------------------
# TEST
# --------------------------------------------------

if __name__ == "__main__":

    sample_gaps = [
        {
            "skill": "Probability",
            "target_score": 80,
            "current_score": 38,
            "gap": 42,
            "status": "Critical Gap",
            "priority": "High"
        },
        {
            "skill": "Data Analysis",
            "target_score": 75,
            "current_score": 58,
            "gap": 17,
            "status": "High Gap",
            "priority": "Medium"
        }
    ]

    recommendations = recommend_courses(sample_gaps)

    print("\n========================================")
    print("      STATWISE AI COURSE RECOMMENDER")
    print("========================================\n")

    if not recommendations:
        print("No matching courses found.")

    else:
        for i, course in enumerate(recommendations, start=1):

            print(f"Recommendation {i}")
            print("----------------------------------------")
            print(f"Course ID : {course['course_id']}")
            print(f"Title     : {course['title']}")
            print(f"Skill     : {course['skill']}")
            print(f"Level     : {course['level']}")
            print(f"Duration  : {course['duration']}")
            print(f"Gap       : {course['gap']} points")
            print(f"Priority  : {course['priority']}")
            print(f"Reason    : {course['reason']}")
            print()