import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
CATALOG_PATH = BASE_DIR / "data" / "statwise_role_skill_catalog.csv"

if not CATALOG_PATH.exists():
    raise FileNotFoundError(
        f"Role-skill catalog not found: {CATALOG_PATH}"
    )

catalog = pd.read_csv(CATALOG_PATH)


def analyze_skill_gaps(role, skill_scores):

    role_data = catalog[
        catalog["role"].astype(str).str.lower() == str(role).lower()
    ]

    # Unknown role
    if role_data.empty:
        return {
            "status": "unknown_role",
            "message": (
                f"No predefined competency framework found for '{role}'. "
                "Dynamic AI competency generation is required."
            ),
            "gaps": []
        }

    gaps = []

    for _, row in role_data.iterrows():

        skill = row["skill"]
        target = float(row["target_score"])

        current = skill_scores.get(skill)

        if current is None:
            continue

        current = float(current)

        gap = target - current

        if gap >= 25:
            status = "Critical Gap"
        elif gap >= 15:
            status = "High Gap"
        elif gap >= 5:
            status = "Moderate Gap"
        else:
            status = "Proficient"

        gaps.append({
            "skill": skill,
            "target_score": round(target, 2),
            "current_score": round(current, 2),
            "gap": round(max(gap, 0), 2),
            "status": status,
            "priority": row["priority"]
        })

    # Largest skill gaps first
    gaps.sort(
        key=lambda x: x["gap"],
        reverse=True
    )

    return {
        "status": "success",
        "role": role,
        "gaps": gaps
    }


# Test the module directly
if __name__ == "__main__":

    sample_scores = {
        "Statistics": 82,
        "Probability": 38,
        "Data Analysis": 58,
        "Data Visualization": 76,
        "Statistical Computing": 64
    }

    result = analyze_skill_gaps(
        role="Statistical Officer",
        skill_scores=sample_scores
    )

    print("\n===== STATWISE SKILL GAP ANALYSIS =====\n")

    print(f"Role: {result.get('role', 'Unknown')}")
    print(f"Status: {result['status']}\n")

    for gap in result["gaps"]:
        print(
            f"{gap['skill']}: "
            f"Current={gap['current_score']} | "
            f"Target={gap['target_score']} | "
            f"Gap={gap['gap']} | "
            f"{gap['status']}"
        )