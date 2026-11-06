from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr

# Auth Schemas
class UserRegister(BaseModel):
    full_name: str
    mobile_number: str
    password: str
    email: Optional[str] = None
    district: str = "Mysuru"
    taluk: Optional[str] = None
    village: Optional[str] = None
    preferred_language: str = "en"
    primary_crop: Optional[str] = "Ragi"
    land_area_acres: Optional[float] = 2.5
    soil_type: Optional[str] = "Red Loamy"
    irrigation_type: Optional[str] = "Borewell"
    previous_crop: Optional[str] = "None / Fallow"

class UserLogin(BaseModel):
    mobile_number: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    full_name: str
    role: str
    district: str
    preferred_language: str

class FarmerProfileResponse(BaseModel):
    district: str
    taluk: Optional[str]
    village: Optional[str]
    primary_crop: Optional[str]
    land_area_acres: Optional[float]
    soil_type: Optional[str]
    irrigation_type: Optional[str]
    previous_crop: Optional[str]

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    full_name: str
    mobile_number: str
    email: Optional[str]
    role: str
    preferred_language: str
    profile: Optional[FarmerProfileResponse] = None

    class Config:
        from_attributes = True

# Crop & Market Schemas
class CropResponse(BaseModel):
    id: int
    crop_name: str
    commodity_name: str
    variety_name: Optional[str]
    category: str
    season: str
    soil_type: str
    water_requirement: str
    major_districts: str
    kannada_name: str
    image_url: Optional[str]
    description: Optional[str]
    base_price: float

    class Config:
        from_attributes = True

class MarketResponse(BaseModel):
    id: int
    market_name: str
    district: str
    division: Optional[str]
    state: str

    class Config:
        from_attributes = True

class MarketPriceResponse(BaseModel):
    id: int
    date: datetime
    district: str
    market: str
    commodity: str
    variety: Optional[str]
    grade: str
    min_price: float
    max_price: float
    modal_price: float
    arrival_quantity: float

    class Config:
        from_attributes = True

# Price Prediction Schemas
class PredictionRequest(BaseModel):
    district: str
    market: str
    commodity: str
    current_modal_price: Optional[float] = None

class PredictionResponse(BaseModel):
    district: str
    market: str
    commodity: str
    current_modal_price: float
    predicted_tomorrow_price: float
    predicted_7day_price: float
    expected_change_pct: float
    trend: str # UP, DOWN, STABLE
    decision: str # SELL, WAIT, MONITOR
    decision_reason_en: str
    decision_reason_kn: str
    model_version: str
    historical_chart_data: List[Dict[str, Any]]

# Crop Recommendation Schemas
class RecommendationRequest(BaseModel):
    district: str
    soil_type: str
    soil_pH: Optional[float] = 6.8
    nitrogen: Optional[float] = 70.0
    phosphorus: Optional[float] = 45.0
    potassium: Optional[float] = 50.0
    rainfall: Optional[float] = 850.0
    temperature: Optional[float] = 27.0
    season: str = "Kharif"
    water_availability: str = "Medium"
    previous_crop: Optional[str] = "None / Fallow"

class RecommendedCropItem(BaseModel):
    crop_name: str
    kannada_name: str
    suitability_score: float # percentage 0-100%
    category: str
    water_requirement: str
    expected_price_range: str
    reasons: List[str]
    crop_image: str

class RecommendationResponse(BaseModel):
    district: str
    soil_type: str
    season: str
    previous_crop: str
    recommendations: List[RecommendedCropItem]
    crop_rotation_advice: str

# Sell/Delay Decision Schemas
class SellDelayRequest(BaseModel):
    crop_name: str
    district: str
    market: str
    current_price: float

class SellDelayResponse(BaseModel):
    crop_name: str
    district: str
    market: str
    current_price: float
    predicted_7day_price: float
    price_change_pct: float
    recommendation: str # SELL NOW, WAIT / DELAY, MONITOR
    confidence_pct: float
    explanation_en: str
    explanation_kn: str

# Alerts & SMS Schemas
class AlertSubscribeRequest(BaseModel):
    mobile_number: str
    district: str
    crop_name: str
    language: str = "en"
    alert_type: str = "ALL" # ALL, PRICE_CHANGE, SELL_ADVICE

class AlertRecordResponse(BaseModel):
    id: int
    phone_number: str
    district: str
    crop_name: str
    alert_type: str
    message_en: str
    message_kn: str
    status: str
    sent_at: datetime

    class Config:
        from_attributes = True

# Weather Schema
class WeatherResponse(BaseModel):
    district: str
    temperature_celsius: float
    rainfall_mm: float
    humidity_percent: float
    condition: str
    last_updated: str
    source: str = "KSNDMC / IMD Agro-Meteorology Service"

# Admin Schemas
class AdminMetricsResponse(BaseModel):
    total_farmers: int
    active_users: int
    total_crops_supported: int
    total_markets_tracked: int
    total_price_records: int
    total_predictions_generated: int
    total_sms_alerts_dispatched: int
    data_pipeline_last_run: str
    best_model_name: str
    model_test_rmse: float
    model_test_r2: float

class PipelineStatusResponse(BaseModel):
    data_sources: List[Dict[str, Any]]
    model_metadata: Dict[str, Any]
    ingestion_healthy: bool
    last_sync_timestamp: str
