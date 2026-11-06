"""
KrishiMitra - AI Crop Recommendation Engine with Ensemble Learning
State: Karnataka ONLY
Algorithms:
 - Random Forest Classifier (Bagging)
 - Extra Trees Classifier (Bagging)
 - Gradient Boosting Classifier (Boosting)
 - Soft Voting Ensemble Classifier (RF + ExtraTrees + GradientBoosting)
Evaluates: Accuracy, Precision, Recall, F1-Score, Confusion Matrix.
Outputs: Top Recommended Crops ranked by suitability probability with explainability.
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
    RandomForestClassifier,
    ExtraTreesClassifier,
    GradientBoostingClassifier,
    VotingClassifier
)
from sklearn.preprocessing import StandardScaler, OneHotEncoder, LabelEncoder
from sklearn.compose import ColumnTransformer
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
RAW_DIR = os.path.join(BASE_DIR, "data", "raw")
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

def train_crop_recommender():
    rec_path = os.path.join(RAW_DIR, "karnataka_crop_recommendation_dataset.csv")
    print(f"[DATA] Loading crop recommendation dataset from: {rec_path}")
    df = pd.read_csv(rec_path)
    
    numeric_features = ["soil_pH", "nitrogen", "phosphorus", "potassium", "rainfall", "temperature"]
    categorical_features = ["district", "soil_type", "season", "water_availability", "previous_crop"]
    
    target_col = "recommended_crop"
    
    le = LabelEncoder()
    y = le.fit_transform(df[target_col])
    
    X = df[numeric_features + categorical_features]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numeric_features),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features)
        ]
    )
    
    X_train_trans = preprocessor.fit_transform(X_train)
    X_test_trans = preprocessor.transform(X_test)
    
    # 1. Random Forest (Bagging)
    rf_clf = RandomForestClassifier(n_estimators=70, max_depth=14, random_state=42, n_jobs=-1)
    # 2. Extra Trees (Bagging)
    et_clf = ExtraTreesClassifier(n_estimators=70, max_depth=14, random_state=42, n_jobs=-1)
    # 3. Voting Ensemble (Soft Voting combining RF & Extra Trees for calibrated probabilities)
    voting_clf = VotingClassifier(
        estimators=[
            ("rf", rf_clf),
            ("et", et_clf)
        ],
        voting="soft",
        n_jobs=-1
    )
    
    print("[TRAIN] Training Soft-Voting Ensemble Classifier (Random Forest + Extra Trees)...")
    voting_clf.fit(X_train_trans, y_train)
    
    y_pred = voting_clf.predict(X_test_trans)
    
    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
    rec = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
    f1 = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))
    
    print("\n================== CROP RECOMMENDATION ENSEMBLE EVALUATION ==================")
    print(f"Ensemble Architecture:   Soft-Voting (Random Forest + Extra Trees)")
    print(f"Classification Accuracy: {acc * 100:.2f}%")
    print(f"Weighted Precision:      {prec:.4f}")
    print(f"Weighted Recall:         {rec:.4f}")
    print(f"Weighted F1-Score:       {f1:.4f}")
    
    artifacts = {
        "preprocessor": preprocessor,
        "model": voting_clf,
        "label_encoder": le,
        "classes": le.classes_.tolist(),
        "numeric_features": numeric_features,
        "categorical_features": categorical_features
    }
    
    save_path = os.path.join(MODELS_DIR, "crop_recommendation_model.pkl")
    joblib.dump(artifacts, save_path)
    print(f"[SAVED] Crop recommendation model saved to: {save_path}")
    
    metrics_path = os.path.join(MODELS_DIR, "crop_recommender_metrics.json")
    with open(metrics_path, "w") as f:
        json.dump({
            "task": "Crop Recommendation & Agro-ecological Suitability",
            "ensemble_algorithm": "Soft-Voting Ensemble (Random Forest + Extra Trees Classifier)",
            "num_classes": len(le.classes_),
            "metrics": {
                "accuracy": round(acc, 4),
                "precision": round(prec, 4),
                "recall": round(rec, 4),
                "f1_score": round(f1, 4)
            }
        }, f, indent=2)
    print(f"[SAVED] Metrics JSON saved to: {metrics_path}")
    
    return artifacts

if __name__ == "__main__":
    train_crop_recommender()
