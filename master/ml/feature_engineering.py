"""
KrishiMitra - Feature Engineering Pipeline for Agricultural Time-Series
Constructs temporal, lag, rolling, arrival, and price-trend features.
Avoids target leakage by using strictly backward-looking features for predictions.
"""

import os
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
INTERIM_DIR = os.path.join(BASE_DIR, "data", "interim")
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")

def get_season(month):
    if month in [6, 7, 8, 9]:
        return "Kharif"
    elif month in [10, 11, 12, 1]:
        return "Rabi"
    else:
        return "Summer"

def engineer_features():
    clean_path = os.path.join(INTERIM_DIR, "karnataka_prices_cleaned.csv")
    print(f"Loading cleaned data from: {clean_path}")
    df = pd.read_csv(clean_path)
    df["date"] = pd.to_datetime(df["date"])
    
    # 1. Temporal Features
    df["year"] = df["date"].dt.year
    df["month"] = df["date"].dt.month
    df["day"] = df["date"].dt.day
    df["day_of_week"] = df["date"].dt.dayofweek
    df["quarter"] = df["date"].dt.quarter
    df["week_of_year"] = df["date"].dt.isocalendar().week.astype(int)
    df["season"] = df["month"].apply(get_season)
    
    # 2. Lag & Rolling Features computed per (commodity, market) group
    print("Computing lag, rolling window, and market arrival momentum features...")
    
    grouped_dfs = []
    
    for (comm, mkt), group in df.groupby(["commodity", "market"]):
        group = group.sort_values(by="date").copy()
        
        # Lag features
        group["price_lag_1"] = group["modal_price"].shift(1)
        group["price_lag_3"] = group["modal_price"].shift(2)
        group["price_lag_7"] = group["modal_price"].shift(4)
        group["price_lag_14"] = group["modal_price"].shift(7)
        group["price_lag_30"] = group["modal_price"].shift(10)
        
        # Rolling features (backward looking)
        group["rolling_mean_7"] = group["modal_price"].shift(1).rolling(window=4, min_periods=1).mean()
        group["rolling_mean_14"] = group["modal_price"].shift(1).rolling(window=7, min_periods=1).mean()
        group["rolling_mean_30"] = group["modal_price"].shift(1).rolling(window=10, min_periods=1).mean()
        
        group["rolling_std_7"] = group["modal_price"].shift(1).rolling(window=4, min_periods=1).std().fillna(0)
        group["rolling_std_30"] = group["modal_price"].shift(1).rolling(window=10, min_periods=1).std().fillna(0)
        
        # Arrival momentum features
        group["arrival_lag_7"] = group["arrival_quantity"].shift(4)
        group["arrival_rolling_mean_7"] = group["arrival_quantity"].shift(1).rolling(window=4, min_periods=1).mean()
        group["arrival_change_7"] = (group["arrival_quantity"] - group["arrival_lag_7"]) / (group["arrival_lag_7"] + 1e-5)
        
        # Price trend momentum
        group["price_change_1d"] = (group["modal_price"] - group["price_lag_1"]) / (group["price_lag_1"] + 1e-5)
        group["price_change_7d"] = (group["modal_price"] - group["price_lag_7"]) / (group["price_lag_7"] + 1e-5)
        group["price_change_30d"] = (group["modal_price"] - group["price_lag_30"]) / (group["price_lag_30"] + 1e-5)
        
        # Forward Targets (Strictly for training evaluation)
        # Next observation target (next reporting day ~2-3 days ahead)
        group["target_price_tomorrow"] = group["modal_price"].shift(-1)
        # 7-day forward price (~2-3 steps ahead)
        group["target_price_7d"] = group["modal_price"].shift(-3)
        
        # Sell/Delay Decision Label:
        # If 7-day price increases by > 3% -> DELAY / WAIT
        # If 7-day price drops by > 3% -> SELL NOW
        # Otherwise -> MONITOR
        pct_diff = (group["target_price_7d"] - group["modal_price"]) / (group["modal_price"] + 1e-5)
        group["decision_label"] = np.where(
            pct_diff > 0.03, "WAIT",
            np.where(pct_diff < -0.03, "SELL", "MONITOR")
        )
        
        grouped_dfs.append(group)
        
    df_feat = pd.concat(grouped_dfs, ignore_index=True)
    
    # Fill remaining lag NaNs using current modal_price and arrival
    lag_cols = ["price_lag_1", "price_lag_3", "price_lag_7", "price_lag_14", "price_lag_30",
                "rolling_mean_7", "rolling_mean_14", "rolling_mean_30"]
    for col in lag_cols:
        df_feat[col] = df_feat[col].fillna(df_feat["modal_price"])
        
    df_feat["arrival_lag_7"] = df_feat["arrival_lag_7"].fillna(df_feat["arrival_quantity"])
    df_feat["arrival_rolling_mean_7"] = df_feat["arrival_rolling_mean_7"].fillna(df_feat["arrival_quantity"])
    df_feat["arrival_change_7"] = df_feat["arrival_change_7"].fillna(0)
    df_feat["price_change_1d"] = df_feat["price_change_1d"].fillna(0)
    df_feat["price_change_7d"] = df_feat["price_change_7d"].fillna(0)
    df_feat["price_change_30d"] = df_feat["price_change_30d"].fillna(0)
    
    # Save full feature dataset
    out_feat_path = os.path.join(PROCESSED_DIR, "karnataka_prices_feature_engineered.csv")
    df_feat.to_csv(out_feat_path, index=False)
    print(f"Saved feature-engineered dataset ({len(df_feat)} rows) to: {out_feat_path}")
    
    return df_feat

if __name__ == "__main__":
    engineer_features()
