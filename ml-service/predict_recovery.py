"""
Single-Item Recovery Status Predictor
------------------------------------
Uses the trained Best Model (Random Forest Classifier) to predict
the recovery status of a campus item report ('Pending', 'Recovered', 'Closed').
"""

import os
import sys
import joblib
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from pipelines.preprocessing import clean_dataframe


def predict_item_recovery(item_dict: dict):
    model_path = os.path.join(BASE_DIR, "models", "best_recovery_model.joblib")
    if not os.path.exists(model_path):
        print(f"[!] Model artifact not found at {model_path}. Run train_recovery_models.py first.")
        return None

    # Load fitted pipeline
    pipeline = joblib.load(model_path)

    # Preprocess input dictionary
    df_raw = pd.DataFrame([item_dict])
    df_clean = clean_dataframe(df_raw)

    # Predict class & probabilities
    pred_class = pipeline.predict(df_clean)[0]
    classes = pipeline.named_steps['classifier'].classes_
    probs = pipeline.predict_proba(df_clean)[0]

    prob_dict = {cls: round(float(prob) * 100, 2) for cls, prob in zip(classes, probs)}
    confidence = prob_dict[pred_class]

    return {
        "predicted_status": pred_class,
        "confidence_percent": confidence,
        "class_probabilities": prob_dict
    }


def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')

    print("=" * 65)
    print("  Smart Campus Lost & Found - Recovery Status Prediction")
    print("=" * 65)

    sample_item = {
        "item_type": "Lost",
        "item_name": "Scientific Calculator",
        "category": "Electronics",
        "color": "Black",
        "brand": "Casio",
        "location": "GLA University Central Library",
        "item_date": "2026-11-08",
        "item_age_days": 2,
        "description": "Black Casio fx-991EX scientific calculator with solar panel left on desk"
    }

    print("\n[*] Input Item Report:")
    for k, v in sample_item.items():
        print(f"    - {k:16s}: {v}")

    result = predict_item_recovery(sample_item)

    print("\n" + "=" * 65)
    print("  🤖 MODEL PREDICTION RESULTS")
    print("=" * 65)
    print(f"  • Predicted Recovery Status :  {result['predicted_status'].upper()}")
    print(f"  • Model Confidence          :  {result['confidence_percent']}%")
    print("  • Class Probability Breakdown:")
    for cls, pct in result['class_probabilities'].items():
        bar = "█" * int(pct // 5)
        print(f"      - {cls:10s}: {pct:5.1f}%  {bar}")
    print("=" * 65)


if __name__ == "__main__":
    main()

