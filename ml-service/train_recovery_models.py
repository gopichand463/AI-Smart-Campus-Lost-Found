"""
Train & Benchmark 4 Supervised ML Models on 120,000 Campus Records
------------------------------------------------------------------
Predicts `recovery_status` ('Pending', 'Recovered', 'Closed').
Evaluates:
1. Logistic Regression (Linear baseline)
2. Decision Tree Classifier (Interpretable tree)
3. Random Forest Classifier (Ensemble bagging)
4. Histogram-based Gradient Boosting (Ensemble boosting)

Outputs:
- Benchmark comparison table (Accuracy, Precision, Recall, Macro F1)
- Confusion matrices for all models
- Feature importances
- Exported best model artifact (`best_recovery_model.joblib`)
- Metadata log for MySQL `model_versions` table (SRS NFR-4)
"""

import os
import sys
import time
import json
import joblib
import pandas as pd
import numpy as np

# Ensure ml-service root is in sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from pipelines.preprocessing import clean_dataframe

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

# Models
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier


def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')

    print("=" * 75)
    print("  Smart Campus Lost & Found - Supervised ML Benchmark (120k Records)")
    print("=" * 75)

    project_root = os.path.dirname(BASE_DIR)
    csv_path = os.path.join(project_root, "data", "smart_campus_dataset_120k.csv")
    models_dir = os.path.join(BASE_DIR, "models")
    os.makedirs(models_dir, exist_ok=True)

    # 1. Load and clean dataset
    print(f"\n[*] Loading dataset from: {os.path.basename(csv_path)}...")
    t0 = time.time()
    df_raw = pd.read_csv(csv_path)
    print(f"[OK] Loaded {len(df_raw):,} raw records in {time.time() - t0:.2f}s.")

    print("[*] Running standard preprocessing & feature engineering pipeline...")
    df = clean_dataframe(df_raw)

    # 2. Define Features & Target
    categorical_cols = ['item_type', 'category', 'color', 'brand', 'location']
    numerical_cols = ['item_age_days', 'description_length', 'has_brand', 'report_month', 'report_day_of_week', 'is_weekend']
    target_col = 'recovery_status'

    # Filter any unexpected nulls
    df = df.dropna(subset=categorical_cols + numerical_cols + [target_col])

    X = df[categorical_cols + numerical_cols]
    y = df[target_col]

    classes = ['Pending', 'Recovered', 'Closed']
    print(f"[*] Target Distribution (120k Records):")
    counts = y.value_counts()
    for cls in classes:
        print(f"    - {cls:10s}: {counts.get(cls, 0):,}")

    # 3. Stratified Train/Test Split (80% Train, 20% Test)
    print("\n[*] Splitting dataset: 80% Train, 20% Held-Out Test (Stratified)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"    - Train Samples: {len(X_train):,}")
    print(f"    - Test Samples:  {len(X_test):,}")

    # 4. Define Feature Preprocessing Pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_cols),
            ('num', StandardScaler(), numerical_cols)
        ]
    )

    # 5. Define the 4 Models to Benchmark
    candidate_models = {
        "Logistic Regression": LogisticRegression(
            class_weight='balanced',
            max_iter=1000,
            random_state=42,
            solver='lbfgs'
        ),
        "Decision Tree": DecisionTreeClassifier(
            class_weight='balanced',
            max_depth=12,
            min_samples_split=20,
            random_state=42
        ),
        "Random Forest": RandomForestClassifier(
            n_estimators=100,
            class_weight='balanced',
            max_depth=15,
            min_samples_split=10,
            random_state=42,
            n_jobs=-1
        ),
        "Gradient Boosting": HistGradientBoostingClassifier(
            class_weight='balanced',
            max_iter=100,
            random_state=42
        )
    }

    results = {}
    best_model_name = None
    best_macro_f1 = -1.0
    best_pipeline = None

    print("\n" + "=" * 75)
    print("  TRAINING & EVALUATION BENCHMARK")
    print("=" * 75)

    for name, clf in candidate_models.items():
        print(f"\n[*] Training Model: {name}...")
        pipeline = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('classifier', clf)
        ])

        t_train = time.time()
        pipeline.fit(X_train, y_train)
        train_time = time.time() - t_train

        # Evaluate on Test Data
        t_pred = time.time()
        y_pred = pipeline.predict(X_test)
        pred_time = time.time() - t_pred

        acc = accuracy_score(y_test, y_pred)
        bal_acc = balanced_accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, average='macro', zero_division=0)
        rec = recall_score(y_test, y_pred, average='macro', zero_division=0)
        f1 = f1_score(y_test, y_pred, average='macro', zero_division=0)
        cm = confusion_matrix(y_test, y_pred, labels=classes).tolist()

        results[name] = {
            "accuracy": round(acc * 100, 2),
            "balanced_accuracy": round(bal_acc * 100, 2),
            "precision_macro": round(prec * 100, 2),
            "recall_macro": round(rec * 100, 2),
            "macro_f1_score": round(f1 * 100, 2),
            "train_time_sec": round(train_time, 2),
            "test_latency_ms": round((pred_time / len(X_test)) * 1000, 3),
            "confusion_matrix": cm,
            "classification_report": classification_report(y_test, y_pred, target_names=classes, output_dict=True)
        }

        print(f"    [OK] Finished in {train_time:.2f}s")
        print(f"    Accuracy: {acc*100:.2f}% | Balanced Acc: {bal_acc*100:.2f}% | Macro F1: {f1*100:.2f}%")

        if f1 > best_macro_f1:
            best_macro_f1 = f1
            best_model_name = name
            best_pipeline = pipeline

    # 6. Display Comparison Summary Table
    print("\n" + "=" * 75)
    print("  🏆 FINAL CLASSIFICATION BENCHMARK COMPARISON (Held-Out Test Set)")
    print("=" * 75)
    print(f"{'Model Algorithm':<22} | {'Accuracy':<10} | {'Balanced Acc':<13} | {'Macro F1':<10} | {'Train Time':<10}")
    print("-" * 75)
    for name, m in results.items():
        best_tag = " ★ (BEST)" if name == best_model_name else ""
        print(f"{name:<22} | {m['accuracy']:>6.2f}%   | {m['balanced_accuracy']:>9.2f}%   | {m['macro_f1_score']:>6.2f}%   | {m['train_time_sec']:>6.2f}s{best_tag}")
    print("=" * 75)

    # 7. Export Best Model Artifact
    best_model_path = os.path.join(models_dir, "best_recovery_model.joblib")
    joblib.dump(best_pipeline, best_model_path)
    print(f"\n[OK] Saved best model ({best_model_name}) to: {os.path.basename(best_model_path)}")

    # 8. Export Benchmark Metrics JSON
    report_path = os.path.join(models_dir, "classification_benchmark_report.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"[OK] Saved full metrics report to: {os.path.basename(report_path)}")

    # 9. Generate SQL Entry for `model_versions` Table (NFR-4)
    model_version_id = f"v1.0_{best_model_name.lower().replace(' ', '_')}_{int(time.time())}"
    sql_insert = f"""
-- Log Best Model Metadata (SRS NFR-4)
INSERT INTO model_versions (model_version, created_at, dataset_version, random_seed, preprocessing_config, model_type, macro_f1_score)
VALUES ('{model_version_id}', NOW(), '120k_synthetic_v1.0', 42, 'OneHot(ignore)+StandardScaler', '{best_model_name}', {results[best_model_name]['macro_f1_score']});
    """
    sql_log_path = os.path.join(models_dir, "model_version_log.sql")
    with open(sql_log_path, "w", encoding="utf-8") as f:
        f.write(sql_insert.strip())
    print(f"[OK] Generated SQL audit entry in: {os.path.basename(sql_log_path)}")

    print("\n" + "=" * 75)
    print(f"  All 4 Supervised ML Models successfully trained and evaluated!")
    print(f"  Best Classifier Selected: {best_model_name} (Macro F1: {results[best_model_name]['macro_f1_score']}%)")
    print("=" * 75)


if __name__ == "__main__":
    main()

