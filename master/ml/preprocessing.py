"""
KrishiMitra - Data Preprocessing & Cleaning Pipeline
Transforms raw AGMARKNET records into cleaned interim data.
State: Karnataka ONLY. Preserves raw data strictly without mutation.
"""

import os
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
RAW_DIR = os.path.join(BASE_DIR, "data", "raw")
INTERIM_DIR = os.path.join(BASE_DIR, "data", "interim")
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")

os.makedirs(INTERIM_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

def preprocess_market_prices():
    raw_path = os.path.join(RAW_DIR, "karnataka_agmarknet_historical_2021_2026.csv")
    print(f"Loading raw market prices from: {raw_path}")
    df = pd.read_csv(raw_path)
    
    initial_rows = len(df)
    print(f"Initial raw record count: {initial_rows}")
    
    # 1. State verification (Strict Karnataka filtering)
    df = df[df["state"] == "Karnataka"].copy()
    
    # 2. Date conversion
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    
    # 3. Numeric conversions
    numeric_cols = ["min_price", "max_price", "modal_price", "arrival_quantity"]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")
        
    # 4. Handle Missing Values
    # In agricultural mandi reports, if min/max price missing, infer from modal
    df["min_price"] = df["min_price"].fillna(df["modal_price"] * 0.95)
    df["max_price"] = df["max_price"].fillna(df["modal_price"] * 1.05)
    df["arrival_quantity"] = df["arrival_quantity"].fillna(df["arrival_quantity"].median())
    
    # Drop rows where modal_price or date is null
    df = df.dropna(subset=["date", "modal_price", "commodity", "market"])
    
    # 5. Remove Duplicates
    df = df.drop_duplicates(subset=["date", "market", "commodity", "variety"])
    
    # 6. Sanity and Outlier Filtering
    # Agricultural prices cannot be <= 0. Filter erroneous records.
    df = df[df["modal_price"] > 0]
    df = df[df["min_price"] > 0]
    df = df[df["max_price"] >= df["min_price"]]
    df = df[df["arrival_quantity"] > 0]
    
    # Sort chronologically by date and market/commodity
    df = df.sort_values(by=["commodity", "market", "date"]).reset_index(drop=True)
    
    cleaned_rows = len(df)
    print(f"Cleaned record count: {cleaned_rows} (Retained: {cleaned_rows/initial_rows*100:.2f}%)")
    
    interim_path = os.path.join(INTERIM_DIR, "karnataka_prices_cleaned.csv")
    df.to_csv(interim_path, index=False)
    print(f"Saved interim cleaned prices to: {interim_path}")
    return df

if __name__ == "__main__":
    preprocess_market_prices()
