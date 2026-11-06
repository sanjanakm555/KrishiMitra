import os
import pandas as pd
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.schema_models import (
    User, FarmerProfile, Crop, Market, MarketPrice,
    WeatherRecord, DataSourceLog
)
from app.services.weather_service import KARNATAKA_DISTRICT_WEATHER

def seed_database(db: Session):
    # 1. Seed Admin & Demo Farmer
    existing_admin = db.query(User).filter(User.mobile_number == "9876543210").first()
    if not existing_admin:
        admin_user = User(
            full_name="Dr. H. M. Patil (Agricultural Director)",
            mobile_number="9876543210",
            email="admin@krishimitra.karnataka.gov.in",
            hashed_password=get_password_hash("admin123"),
            role="admin",
            preferred_language="en"
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        print("[SEED] Created default administrator user")

    existing_farmer = db.query(User).filter(User.mobile_number == "9845012345").first()
    if not existing_farmer:
        farmer_user = User(
            full_name="Basavaraj Gowda (ಬಸವರಾಜ್ ಗೌಡ)",
            mobile_number="9845012345",
            email="basavaraj.farmer@krishimitra.in",
            hashed_password=get_password_hash("farmer123"),
            role="farmer",
            preferred_language="kn"
        )
        db.add(farmer_user)
        db.commit()
        db.refresh(farmer_user)
        
        profile = FarmerProfile(
            user_id=farmer_user.id,
            district="Mysuru",
            taluk="Nanjangud",
            village="Hullahalli",
            primary_crop="Ragi",
            land_area_acres=4.5,
            soil_type="Red Loamy",
            irrigation_type="Canal + Borewell",
            previous_crop="Paddy"
        )
        db.add(profile)
        db.commit()
        print("[SEED] Created default demo farmer user with profile")

    # 2. Seed Crops (52 Crops)
    if db.query(Crop).count() == 0:
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        crops_csv = os.path.join(base_dir, "data", "raw", "karnataka_crops_master.csv")
        if os.path.exists(crops_csv):
            df_crops = pd.read_csv(crops_csv)
            for _, row in df_crops.iterrows():
                crop_obj = Crop(
                    crop_name=row["crop_name"],
                    commodity_name=row["commodity_name"],
                    variety_name=str(row["variety_name"]) if pd.notna(row["variety_name"]) else None,
                    category=row["category"],
                    season=row["season"],
                    soil_type=row["soil_type"],
                    water_requirement=row["water_requirement"],
                    major_districts=row["major_districts"],
                    kannada_name=row["kannada_name"],
                    image_url=row["image_url"],
                    description=row["description"],
                    base_price=float(row["base_price"]),
                    volatility=float(row.get("volatility", 0.1))
                )
                db.add(crop_obj)
            db.commit()
            print(f"[SEED] Seeded {len(df_crops)} Karnataka crops into database")

    # 3. Seed Markets (33 APMCs)
    if db.query(Market).count() == 0:
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        markets_csv = os.path.join(base_dir, "data", "raw", "karnataka_markets.csv")
        if os.path.exists(markets_csv):
            df_mkts = pd.read_csv(markets_csv)
            for _, row in df_mkts.iterrows():
                mkt_obj = Market(
                    market_name=row["market_name"],
                    district=row["district"],
                    division=str(row.get("division", "Karnataka")),
                    state="Karnataka"
                )
                db.add(mkt_obj)
            db.commit()
            print(f"[SEED] Seeded {len(df_mkts)} Karnataka APMC markets into database")

    # 4. Seed Recent Market Prices
    if db.query(MarketPrice).count() == 0:
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        prices_csv = os.path.join(base_dir, "data", "raw", "karnataka_agmarknet_historical_2021_2026.csv")
        if os.path.exists(prices_csv):
            print("[SEED] Loading initial market prices from Agmarknet dataset...")
            # Load last 10,000 records for fast SQLite response
            df_prices = pd.read_csv(prices_csv).tail(10000)
            price_objs = []
            for _, r in df_prices.iterrows():
                price_objs.append(MarketPrice(
                    date=pd.to_datetime(r["date"]).to_pydatetime(),
                    state="Karnataka",
                    district=r["district"],
                    market=r["market"],
                    commodity=r["commodity"],
                    variety=str(r["variety"]) if pd.notna(r["variety"]) else None,
                    grade=str(r.get("grade", "FAQ")),
                    min_price=float(r["min_price"]),
                    max_price=float(r["max_price"]),
                    modal_price=float(r["modal_price"]),
                    arrival_quantity=float(r["arrival_quantity"])
                ))
            db.bulk_save_objects(price_objs)
            db.commit()
            print(f"[SEED] Seeded {len(price_objs)} market price records into database")

    # 5. Seed Weather Records
    if db.query(WeatherRecord).count() == 0:
        for dist, w in KARNATAKA_DISTRICT_WEATHER.items():
            db.add(WeatherRecord(
                district=dist,
                temperature=w["temp"],
                rainfall=w["rain"],
                humidity=w["humidity"],
                condition=w["condition"]
            ))
        db.commit()
        print(f"[SEED] Seeded weather normals for {len(KARNATAKA_DISTRICT_WEATHER)} Karnataka districts")

    # 6. Seed Data Source Logs
    if db.query(DataSourceLog).count() == 0:
        db.add(DataSourceLog(
            source_name="AGMARKNET - Directorate of Marketing & Inspection",
            records_imported=66456,
            records_rejected=0,
            status="SUCCESS"
        ))
        db.commit()
