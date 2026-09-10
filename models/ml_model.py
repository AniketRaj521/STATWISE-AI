import pandas as pd
import numpy as np
import joblib

from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


# ============================================================
# STATWISE AI - COMPETENCY PREDICTION MODEL
# ============================================================

# Project paths
BASE_DIR = Path(__file__).resolve().parent.parent

DATA_PATH = BASE_DIR / "data" / "statwise_employee_competency_dataset.csv"
MODEL_PATH = BASE_DIR / "models" / "competency_model.pkl"


print("=" * 60)
print("STATWISE AI - ML MODEL TRAINING")
print("=" * 60)


# ------------------------------------------------------------
# 1. Load dataset
# ------------------------------------------------------------

if not DATA_PATH.exists():
    raise FileNotFoundError(
        f"\nDataset not found!\nExpected location:\n{DATA_PATH}"
    )

df = pd.read_csv(DATA_PATH)

print(f"\nDataset loaded successfully.")
print(f"Number of records : {len(df)}")
print(f"Number of columns : {len(df.columns)}")


# ------------------------------------------------------------
# 2. Select ML features
# ------------------------------------------------------------

FEATURES = [
    "assessment_score",
    "quiz_accuracy",
    "learning_hours",
    "training_hours",
    "assessment_attempts",
    "years_experience"
]

TARGET = "competency_score"


# Check required columns
missing_columns = [
    column for column in FEATURES + [TARGET]
    if column not in df.columns
]

if missing_columns:
    raise ValueError(
        f"\nMissing columns in dataset: {missing_columns}"
    )


X = df[FEATURES].copy()
y = df[TARGET].copy()


# ------------------------------------------------------------
# 3. Clean data
# ------------------------------------------------------------

X = X.apply(pd.to_numeric, errors="coerce")
y = pd.to_numeric(y, errors="coerce")

valid_rows = X.notnull().all(axis=1) & y.notnull()

X = X[valid_rows]
y = y[valid_rows]

print(f"Valid records      : {len(X)}")
print(f"Features used      : {FEATURES}")
print(f"Target             : {TARGET}")


# ------------------------------------------------------------
# 4. Split dataset
# ------------------------------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42
)

print("\nData split:")
print(f"Training records   : {len(X_train)}")
print(f"Testing records    : {len(X_test)}")


# ------------------------------------------------------------
# 5. Create Random Forest model
# ------------------------------------------------------------

model = RandomForestRegressor(
    n_estimators=200,
    max_depth=10,
    min_samples_leaf=3,
    random_state=42,
    n_jobs=-1
)


# ------------------------------------------------------------
# 6. Train model
# ------------------------------------------------------------

print("\nTraining Random Forest model...")

model.fit(X_train, y_train)

print("Model training completed.")


# ------------------------------------------------------------
# 7. Evaluate model
# ------------------------------------------------------------

predictions = model.predict(X_test)

mae = mean_absolute_error(y_test, predictions)
rmse = np.sqrt(mean_squared_error(y_test, predictions))
r2 = r2_score(y_test, predictions)


print("\n" + "=" * 60)
print("MODEL PERFORMANCE")
print("=" * 60)

print(f"MAE  : {mae:.2f}")
print(f"RMSE : {rmse:.2f}")
print(f"R²   : {r2:.4f}")


# ------------------------------------------------------------
# 8. Feature importance
# ------------------------------------------------------------

print("\nFeature Importance:")

importance = pd.DataFrame({
    "Feature": FEATURES,
    "Importance": model.feature_importances_
})

importance = importance.sort_values(
    by="Importance",
    ascending=False
)

for _, row in importance.iterrows():
    print(
        f"{row['Feature']:25s} : "
        f"{row['Importance']:.4f}"
    )


# ------------------------------------------------------------
# 9. Save trained model
# ------------------------------------------------------------

joblib.dump(model, MODEL_PATH)

print("\nModel saved successfully!")
print(f"Model location: {MODEL_PATH}")


# ------------------------------------------------------------
# 10. Test with a sample employee
# ------------------------------------------------------------

sample_employee = pd.DataFrame([{
    "assessment_score": 72,
    "quiz_accuracy": 78,
    "learning_hours": 12,
    "training_hours": 20,
    "assessment_attempts": 3,
    "years_experience": 2
}])

sample_prediction = model.predict(sample_employee)[0]

sample_prediction = np.clip(
    sample_prediction,
    0,
    100
)

print("\n" + "=" * 60)
print("SAMPLE PREDICTION")
print("=" * 60)

print(f"Predicted Competency Score : {sample_prediction:.2f}")


# ------------------------------------------------------------
# 11. Competency level
# ------------------------------------------------------------

if sample_prediction >= 80:
    level = "Advanced"
elif sample_prediction >= 60:
    level = "Intermediate"
else:
    level = "Beginner"

print(f"Competency Level            : {level}")

print("\n" + "=" * 60)
print("ML MODEL READY")
print("=" * 60)