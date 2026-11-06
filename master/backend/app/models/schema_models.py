from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.db.session import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    mobile_number = Column(String(20), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="farmer") # farmer or admin
    preferred_language = Column(String(10), default="en") # en or kn
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    profile = relationship("FarmerProfile", back_populates="user", uselist=False)
    predictions = relationship("PredictionRecord", back_populates="user")
    recommendations = relationship("CropRecommendationRecord", back_populates="user")
    alerts = relationship("AlertRecord", back_populates="user")

class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    district = Column(String(50), nullable=False, default="Mysuru")
    taluk = Column(String(50), nullable=True)
    village = Column(String(100), nullable=True)
    primary_crop = Column(String(50), nullable=True, default="Ragi")
    land_area_acres = Column(Float, nullable=True, default=2.5)
    soil_type = Column(String(50), nullable=True, default="Red Loamy")
    irrigation_type = Column(String(50), nullable=True, default="Borewell")
    previous_crop = Column(String(50), nullable=True, default="None / Fallow")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="profile")

class Crop(Base):
    __tablename__ = "crops"
    
    id = Column(Integer, primary_key=True, index=True)
    crop_name = Column(String(50), unique=True, index=True, nullable=False)
    commodity_name = Column(String(100), nullable=False)
    variety_name = Column(String(100), nullable=True)
    category = Column(String(50), nullable=False)
    season = Column(String(50), nullable=False)
    soil_type = Column(String(100), nullable=False)
    water_requirement = Column(String(50), nullable=False)
    major_districts = Column(String(255), nullable=False)
    kannada_name = Column(String(100), nullable=False)
    image_url = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    base_price = Column(Float, nullable=False)
    volatility = Column(Float, default=0.1)

class Market(Base):
    __tablename__ = "markets"
    
    id = Column(Integer, primary_key=True, index=True)
    market_name = Column(String(100), unique=True, index=True, nullable=False)
    district = Column(String(50), index=True, nullable=False)
    division = Column(String(50), nullable=True)
    state = Column(String(50), default="Karnataka")

class MarketPrice(Base):
    __tablename__ = "market_prices"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, index=True, nullable=False)
    state = Column(String(50), default="Karnataka", nullable=False)
    district = Column(String(50), index=True, nullable=False)
    market = Column(String(100), index=True, nullable=False)
    commodity = Column(String(100), index=True, nullable=False)
    variety = Column(String(100), nullable=True)
    grade = Column(String(20), default="FAQ")
    min_price = Column(Float, nullable=False)
    max_price = Column(Float, nullable=False)
    modal_price = Column(Float, index=True, nullable=False) # INR / Quintal
    arrival_quantity = Column(Float, nullable=False) # Tonnes / Quintals
    created_at = Column(DateTime, default=datetime.utcnow)

class PredictionRecord(Base):
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    district = Column(String(50), nullable=False)
    market = Column(String(100), nullable=False)
    commodity = Column(String(100), nullable=False)
    current_price = Column(Float, nullable=False)
    predicted_tomorrow_price = Column(Float, nullable=False)
    predicted_7day_price = Column(Float, nullable=False)
    expected_change_pct = Column(Float, nullable=False)
    trend = Column(String(20), nullable=False) # UP, DOWN, STABLE
    decision = Column(String(20), nullable=False) # SELL, WAIT, MONITOR
    model_version = Column(String(50), default="Stacking-Ensemble-v1.0")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="predictions")

class CropRecommendationRecord(Base):
    __tablename__ = "recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    district = Column(String(50), nullable=False)
    soil_type = Column(String(50), nullable=False)
    season = Column(String(50), nullable=False)
    previous_crop = Column(String(50), nullable=True)
    recommended_crops_json = Column(JSON, nullable=False) # Ranked list with scores & reasons
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="recommendations")

class AlertRecord(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    phone_number = Column(String(20), nullable=False)
    district = Column(String(50), nullable=False)
    crop_name = Column(String(50), nullable=False)
    alert_type = Column(String(50), nullable=False) # PRICE_SURGE, PRICE_DROP, SELL_ADVICE, DELAY_ADVICE
    message_en = Column(Text, nullable=False)
    message_kn = Column(Text, nullable=False)
    status = Column(String(20), default="SENT") # SENT, QUEUED, FAILED
    provider_response = Column(String(255), default="SUCCESS_SIMULATED_GATEWAY")
    sent_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="alerts")

class WeatherRecord(Base):
    __tablename__ = "weather"
    
    id = Column(Integer, primary_key=True, index=True)
    district = Column(String(50), unique=True, index=True, nullable=False)
    temperature = Column(Float, nullable=False)
    rainfall = Column(Float, default=0.0)
    humidity = Column(Float, nullable=False)
    condition = Column(String(50), nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class DataSourceLog(Base):
    __tablename__ = "data_source_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    source_name = Column(String(100), nullable=False)
    records_imported = Column(Integer, default=0)
    records_rejected = Column(Integer, default=0)
    status = Column(String(50), default="COMPLETED")
    last_run_timestamp = Column(DateTime, default=datetime.utcnow)
