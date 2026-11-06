"""
KrishiMitra - Agricultural Market Price Prediction Training with Ensemble Learning
State: Karnataka ONLY
Chronological Split: 2021-2024 (Train), 2025-2026 (Test)
Ensemble Algorithms:
 1. Random Forest Regressor (Bagging Ensemble)
 2. Extra Trees Regressor (Extremely Randomized Trees Bagging)
 3. Gradient Boosting Regressor (Boosting Ensemble)
 4. XGBoost Regressor (Extreme Gradient Boosting)
 5. Voting Ensemble Regressor (Weighted Averaging Ensemble: RF + Extra Trees + XGBoost)
 6. Stacking Ensemble Regressor (Meta-Learning Stacking with Ridge Meta-Estimator)
Metrics: MAE, MSE, RMSE, R², MAPE
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import (
    RandomForestRegressor, 
    ExtraTreesRegressor, 
    GradientBoostingRegressor, 
    VotingRegressor, 
    StackingRegressor
)
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import xgboost as xgb

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

def calculate_mape(y_true, y_pred):
    return float(np.mean(np.abs((y_true - y_pred) / (y_true + 1e-5))) * 100)

def train_price_models():
    feat_path = os.path.join(PROCESSED_DIR, "karnataka_prices_feature_engineered.csv")
    print(f"[DATA] Loading feature dataset from: {feat_path}")
    df = pd.read_csv(feat_path)
    df["date"] = pd.to_datetime(df["date"])
    
    df_clean = df.dropna(subset=["target_price_tomorrow", "target_price_7d"]).copy()
    
    numeric_features = [
        "modal_price", "min_price", "max_price", "arrival_quantity",
        "price_lag_1", "price_lag_3", "price_lag_7", "price_lag_14", "price_lag_30",
        "rolling_mean_7", "rolling_mean_14", "rolling_mean_30",
        "rolling_std_7", "rolling_std_30",
        "arrival_lag_7", "arrival_rolling_mean_7", "arrival_change_7",
        "price_change_1d", "price_change_7d", "price_change_30d",
        "month", "day_of_week", "quarter"
    ]
    
    categorical_features = ["commodity", "market", "season"]
    
    target_tomorrow = "target_price_tomorrow"
    target_7d = "target_price_7d"
    
    # Chronological Split (Train: 2021-2024, Test: 2025-2026)
    train_mask = df_clean["year"] <= 2024
    test_mask = df_clean["year"] >= 2025
    
    train_df = df_clean[train_mask]
    test_df = df_clean[test_mask]
    
    print(f"[SPLIT] Chronological Split:")
    print(f"        Training Set (2021-2024): {len(train_df)} observations")
    print(f"        Test Set     (2025-2026): {len(test_df)} observations")
    
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numeric_features),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features)
        ]
    )
    
    print("[PREPROCESS] Fitting ColumnTransformer on training partition...")
    X_train = preprocessor.fit_transform(train_df[numeric_features + categorical_features])
    X_test = preprocessor.transform(test_df[numeric_features + categorical_features])
    
    y_train_tomorrow = train_df[target_tomorrow].values
    y_test_tomorrow = test_df[target_tomorrow].values
    
    y_train_7d = train_df[target_7d].values
    y_test_7d = test_df[target_7d].values
    
    # Base ensemble estimators
    rf = RandomForestRegressor(n_estimators=80, max_depth=14, random_state=42, n_jobs=-1)
    et = ExtraTreesRegressor(n_estimators=80, max_depth=14, random_state=42, n_jobs=-1)
    gb = GradientBoostingRegressor(n_estimators=70, max_depth=5, learning_rate=0.1, random_state=42)
    xgb_reg = xgb.XGBRegressor(n_estimators=80, max_depth=5, learning_rate=0.1, random_state=42, n_jobs=-1)
    
    # Voting Ensemble: Combines RF, Extra Trees, and XGBoost
    voting_ensemble = VotingRegressor(
        estimators=[
            ("rf", RandomForestRegressor(n_estimators=50, max_depth=12, random_state=42, n_jobs=-1)),
            ("et", ExtraTreesRegressor(n_estimators=50, max_depth=12, random_state=42, n_jobs=-1)),
            ("xgb", xgb.XGBRegressor(n_estimators=60, max_depth=5, learning_rate=0.1, random_state=42, n_jobs=-1))
        ],
        weights=[1.0, 1.0, 1.2],
        n_jobs=-1
    )
    
    # Stacking Ensemble: Combines RF & XGBoost with Ridge Meta-Learner
    stacking_ensemble = StackingRegressor(
        estimators=[
            ("rf", RandomForestRegressor(n_estimators=40, max_depth=10, random_state=42, n_jobs=-1)),
            ("xgb", xgb.XGBRegressor(n_estimators=50, max_depth=4, learning_rate=0.1, random_state=42, n_jobs=-1))
        ],
        final_estimator=Ridge(alpha=1.0),
        n_jobs=-1
    )
    
    models = {
        "Random Forest (Bagging)": rf,
        "Extra Trees (Bagging)": et,
        "Gradient Boosting (Boosting)": gb,
        "XGBoost (Extreme Gradient Boosting)": xgb_reg,
        "Voting Ensemble (RF + ET + XGB)": voting_ensemble,
        "Stacking Ensemble (Meta-Learner)": stacking_ensemble
    }
    
    evaluation_results = []
    trained_models = {}
    
    print("\n================== ENSEMBLE LEARNING COMPARISON (7-Day Price Forecast) ==================")
    best_model_name = None
    best_rmse = float("inf")
    
    for name, model in models.items():
        print(f"--> Training Ensemble: {name} ...")
        model.fit(X_train, y_train_7d)
        y_pred = model.predict(X_test)
        
        mae = float(mean_absolute_error(y_test_7d, y_pred))
        mse = float(mean_squared_error(y_test_7d, y_pred))
        rmse = float(np.sqrt(mse))
        r2 = float(r2_score(y_test_7d, y_pred))
        mape = calculate_mape(y_test_7d, y_pred)
        
        evaluation_results.append({
            "model_name": name,
            "ensemble_type": "Bagging" if "Bagging" in name else ("Boosting" if "Boosting" in name else "Meta-Ensemble"),
            "mae": round(mae, 2),
            "mse": round(mse, 2),
            "rmse": round(rmse, 2),
            "r2": round(r2, 4),
            "mape": round(mape, 2)
        })
        
        trained_models[name] = model
        print(f"    Results: MAE = Rs.{mae:.2f} | RMSE = Rs.{rmse:.2f} | R2 = {r2:.4f} | MAPE = {mape:.2f}%")
        
        if rmse < best_rmse:
            best_rmse = rmse
            best_model_name = name
            
    print(f"\n[WINNER] Selected Best Ensemble: {best_model_name} (Lowest Test RMSE: Rs.{best_rmse:.2f})")
    
    # Train Tomorrow Price Predictor using the best ensemble architecture
    print(f"\n--> Training Tomorrow Predictor using Voting Ensemble...")
    tomorrow_ensemble = VotingRegressor(
        estimators=[
            ("rf", RandomForestRegressor(n_estimators=50, max_depth=12, random_state=42, n_jobs=-1)),
            ("xgb", xgb.XGBRegressor(n_estimators=60, max_depth=5, learning_rate=0.1, random_state=42, n_jobs=-1))
        ],
        n_jobs=-1
    )
    tomorrow_ensemble.fit(X_train, y_train_tomorrow)
    y_pred_tom = tomorrow_ensemble.predict(X_test)
    tom_mae = float(mean_absolute_error(y_test_tomorrow, y_pred_tom))
    tom_rmse = float(np.sqrt(mean_squared_error(y_test_tomorrow, y_pred_tom)))
    tom_r2 = float(r2_score(y_test_tomorrow, y_pred_tom))
    print(f"    Tomorrow Ensemble Performance: MAE=Rs.{tom_mae:.2f}, RMSE=Rs.{tom_rmse:.2f}, R2={tom_r2:.4f}")
    
    # Save artifacts
    artifacts = {
        "preprocessor": preprocessor,
        "model_7d": trained_models[best_model_name],
        "model_tomorrow": tomorrow_ensemble,
        "best_model_name": best_model_name,
        "numeric_features": numeric_features,
        "categorical_features": categorical_features
    }
    
    model_save_path = os.path.join(MODELS_DIR, "price_prediction_model.pkl")
    joblib.dump(artifacts, model_save_path)
    print(f"[SAVED] Ensemble model package saved to: {model_save_path}")
    
    # Save metrics JSON
    metrics_path = os.path.join(MODELS_DIR, "price_model_evaluation.json")
    with open(metrics_path, "w") as f:
        json.dump({
            "target": "modal_price (7-Day Forecast & Tomorrow Forecast)",
            "split": "Chronological (Train: 2021-2024, Test: 2025-2026)",
            "ensemble_paradigm": "Bagging, Boosting, Weighted Voting, and Meta-Stacking Ensembles",
            "best_ensemble_model": best_model_name,
            "models_evaluated": evaluation_results,
            "tomorrow_metrics": {
                "mae": round(tom_mae, 2),
                "rmse": round(tom_rmse, 2),
                "r2": round(tom_r2, 4)
            }
        }, f, indent=2)
    print(f"[SAVED] Price model evaluation JSON saved to: {metrics_path}")
    
    # Save feature configuration
    feat_config_path = os.path.join(MODELS_DIR, "feature_config.json")
    with open(feat_config_path, "w") as f:
        json.dump({
            "numeric_features": numeric_features,
            "categorical_features": categorical_features,
            "target_tomorrow": target_tomorrow,
            "target_7d": target_7d
        }, f, indent=2)
    print(f"[SAVED] Feature config saved to: {feat_config_path}")
    
    return evaluation_results

if __name__ == "__main__":
    train_price_models()
