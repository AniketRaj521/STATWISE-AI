def calculate_score(questions, user_answers):
    
    total = len(questions)
    correct = 0

    for q, ans in zip(questions, user_answers):

        if ans == q["answer"]:
            correct += 1

    percentage = round(
        (correct / total) * 100,
        2
    )

    return {
        "total": total,
        "correct": correct,
        "score": percentage
    }