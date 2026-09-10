import joblib
import pandas as pd
import numpy as np
from pathlib import Path


# ============================================================
# STATWISE AI - COMPETENCY PREDICTION ENGINE
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = BASE_DIR / "models" / "competency_model.pkl"


# ------------------------------------------------------------
# Load trained model
# ------------------------------------------------------------

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Trained model not found at:\n{MODEL_PATH}\n\n"
        "Run ml_model.py first."
    )

model = joblib.load(MODEL_PATH)


# ------------------------------------------------------------
# Prediction function
# ------------------------------------------------------------

def predict_competency(
    assessment_score,
    quiz_accuracy,
    learning_hours,
    training_hours,
    assessment_attempts,
    years_experience
):

    input_data = pd.DataFrame([{
        "assessment_score": assessment_score,
        "quiz_accuracy": quiz_accuracy,
        "learning_hours": learning_hours,
        "training_hours": training_hours,
        "assessment_attempts": assessment_attempts,
        "years_experience": years_experience
    }])

    prediction = model.predict(input_data)[0]

    # Keep score between 0 and 100
    prediction = float(np.clip(prediction, 0, 100))

    # Competency level
    if prediction >= 80:
        level = "Advanced"
    elif prediction >= 60:
        level = "Intermediate"
    else:
        level = "Beginner"

    return {
        "competency_score": round(prediction, 2),
        "competency_level": level
    }


# ------------------------------------------------------------
# Test prediction
# ------------------------------------------------------------

if __name__ == "__main__":

    result = predict_competency(
        assessment_score=75,
        quiz_accuracy=80,
        learning_hours=15,
        training_hours=25,
        assessment_attempts=3,
        years_experience=2
    )

    print("=" * 60)
    print("STATWISE AI - TEST PREDICTION")
    print("=" * 60)

    print(f"Competency Score : {result['competency_score']}")
    print(f"Competency Level : {result['competency_level']}")

    print("=" * 60)
    print("PREDICTION ENGINE READY")
    print("=" * 60)