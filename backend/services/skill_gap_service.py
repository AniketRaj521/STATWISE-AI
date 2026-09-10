def analyze_skill_gap(score):
    
    target_score = 80

    gap = target_score - score

    if score >= 80:
        level = "Advanced"
    elif score >= 60:
        level = "Intermediate"
    elif score >= 40:
        level = "Needs Improvement"
    else:
        level = "Critical"

    return {
        "current_score": score,
        "target_score": target_score,
        "gap": max(gap, 0),
        "level": level
    }