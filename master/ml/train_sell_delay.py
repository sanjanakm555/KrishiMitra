"""
KrishiMitra - Farmer Advisory Sell / Delay Decision Support with Ensemble Learning
State: Karnataka ONLY
Task: 3-Class Agricultural Decision Classification (SELL NOW, WAIT / DELAY, MONITOR)
Ensemble Algorithm: Soft Voting Ensemble (Gradient Boosting + Random Forest + Extra Trees)
Evaluates: Accuracy, Precision, Recall, F1-Score, Confusion Matrix
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
from sklearn.model_selection import train_test_split
from sklearn.ensemble import (
    GradientBoostingClassifier, 
    RandomForestClassifier, 
    ExtraTreesClassifier, 
    VotingClassifier
)
from sklearn.preprocessing import StandardScaler, OneHotEncoder, LabelEncoder
from sklearn.compose import ColumnTransformer
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

def train_sell_delay_model():
    feat_path = os.path.join(PROCESSED_DIR, "karnataka_prices_feature_engineered.csv")
    print(f"[DATA] Loading data from: {feat_path}")
    df = pd.read_csv(feat_path)
    
    df_clean = df.dropna(subset=["decision_label", "target_price_7d", "target_price_tomorrow"]).copy()
    
    numeric_features = [
        "modal_price", "target_price_tomorrow", "target_price_7d",
        "price_change_1d", "price_change_7d", "price_change_30d",
        "arrival_change_7", "rolling_std_7"
    ]
    categorical_features = ["season"]
    
    X = df_clean[numeric_features + categorical_features]
    y_raw = df_clean["decision_label"]
    
    le = LabelEncoder()
    y = le.fit_transform(y_raw)
    
    # Chronological Split (Train: <= 2024, Test: >= 2025)
    train_mask = df_clean["year"] <= 2024
    test_mask = df_clean["year"] >= 2025
    
    X_train = X[train_mask]
    y_train = y[train_mask]
    
    X_test = X[test_mask]
    y_test = y[test_mask]
    
    print(f"[SPLIT] Chronological Split: Train={len(X_train)} samples, Test={len(X_test)} samples")
    
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numeric_features),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features)
        ]
    )
    
    X_train_trans = preprocessor.fit_transform(X_train)
    X_test_trans = preprocessor.transform(X_test)
    
    # Ensemble Estimators: Boosting + Bagging
    gb_clf = GradientBoostingClassifier(n_estimators=60, learning_rate=0.1, max_depth=5, random_state=42)
    rf_clf = RandomForestClassifier(n_estimators=60, max_depth=12, random_state=42, n_jobs=-1)
    et_clf = ExtraTreesClassifier(n_estimators=60, max_depth=12, random_state=42, n_jobs=-1)
    
    voting_clf = VotingClassifier(
        estimators=[
            ("gb", gb_clf),
            ("rf", rf_clf),
            ("et", et_clf)
        ],
        voting="soft",
        weights=[1.2, 1.0, 1.0],
        n_jobs=-1
    )
    
    print("[TRAIN] Training Soft-Voting Ensemble Classifier (Gradient Boosting + Random Forest + Extra Trees)...")
    voting_clf.fit(X_train_trans, y_train)
    
    y_pred = voting_clf.predict(X_test_trans)
    
    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
    rec = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
    f1 = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))
    cm = confusion_matrix(y_test, y_pred).tolist()
    
    print("\n================== SELL / DELAY ENSEMBLE EVALUATION ==================")
    print(f"Classification Accuracy:  {acc * 100:.2f}%")
    print(f"Weighted Precision:       {prec:.4f}")
    print(f"Weighted Recall:          {rec:.4f}")
    print(f"Weighted F1-Score:        {f1:.4f}")
    print(f"Confusion Matrix:         {cm}")
    print("\nDetailed Classification Report:")
    print(classification_report(y_test, y_pred, target_names=le.classes_))
    
    artifacts = {
        "preprocessor": preprocessor,
        "model": voting_clf,
        "label_encoder": le,
        "classes": le.classes_.tolist(),
        "numeric_features": numeric_features,
        "categorical_features": categorical_features
    }
    
    save_path = os.path.join(MODELS_DIR, "sell_delay_model.pkl")
    joblib.dump(artifacts, save_path)
    print(f"[SAVED] Sell/delay model saved to: {save_path}")
    
    metrics_path = os.path.join(MODELS_DIR, "sell_delay_metrics.json")
    with open(metrics_path, "w") as f:
        json.dump({
            "task": "Farmer Advisory Decision Support (SELL / WAIT / MONITOR)",
            "ensemble_algorithm": "Soft-Voting Ensemble (Gradient Boosting + Random Forest + Extra Trees)",
            "classes": le.classes_.tolist(),
            "metrics": {
                "accuracy": round(acc, 4),
                "precision": round(prec, 4),
                "recall": round(rec, 4),
                "f1_score": round(f1, 4),
                "confusion_matrix": cm
            }
        }, f, indent=2)
    print(f"[SAVED] Metrics JSON saved to: {metrics_path}")
    
    return artifacts

if __name__ == "__main__":
    train_sell_delay_model()
