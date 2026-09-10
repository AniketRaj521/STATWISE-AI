from models.predict import predict_competency
from models.skill_gap import analyze_skill_gaps
from models.recommend_courses import recommend_courses


def run_statwise_analysis(
    role,
    assessment_score,
    quiz_accuracy,
    learning_hours,
    training_hours,
    assessment_attempts,
    years_experience,
    skill_scores
):
    # -----------------------------------------
    # 1. Predict overall competency
    # -----------------------------------------
    competency = predict_competency(
        assessment_score=assessment_score,
        quiz_accuracy=quiz_accuracy,
        learning_hours=learning_hours,
        training_hours=training_hours,
        assessment_attempts=assessment_attempts,
        years_experience=years_experience
    )

    # -----------------------------------------
    # 2. Analyze skill gaps
    # -----------------------------------------
    gap_result = analyze_skill_gaps(
        role=role,
        skill_scores=skill_scores
    )

    # -----------------------------------------
    # 3. Recommend courses
    # -----------------------------------------
    if gap_result["status"] == "success":
        courses = recommend_courses(
            gap_result["gaps"],
            max_courses=3
        )
    else:
        courses = []

    # -----------------------------------------
    # 4. Combine everything
    # -----------------------------------------
    return {
        "role": role,

        "competency": competency,

        "skill_gap_analysis": gap_result,

        "recommended_courses": courses
    }


# ============================================
# TEST
# ============================================

if __name__ == "__main__":

    result = run_statwise_analysis(

        role="Statistical Officer",

        assessment_score=75,

        quiz_accuracy=80,

        learning_hours=15,

        training_hours=25,

        assessment_attempts=3,

        years_experience=2,

        skill_scores={
            "Statistics": 82,
            "Probability": 38,
            "Data Analysis": 58,
            "Data Visualization": 76,
            "Statistical Computing": 64
        }
    )

    print("\n==========================================")
    print("          STATWISE AI ANALYSIS")
    print("==========================================")

    print("\nROLE:")
    print(result["role"])

    print("\nCOMPETENCY:")
    print(result["competency"])

    print("\nSKILL GAPS:")

    for gap in result["skill_gap_analysis"].get("gaps", []):
        print(
            f"- {gap['skill']}: "
            f"{gap['current_score']} → "
            f"{gap['target_score']} "
            f"(Gap: {gap['gap']})"
        )

    print("\nRECOMMENDED COURSES:")

    for course in result["recommended_courses"]:
        print(
            f"- {course['course_id']}: "
            f"{course['title']}"
        )

    print("\n==========================================")