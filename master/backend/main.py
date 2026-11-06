import os
import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.db.session import engine, Base, SessionLocal
from app.models.schema_models import (
    User, FarmerProfile, Crop, Market, MarketPrice,
    PredictionRecord, CropRecommendationRecord, AlertRecord,
    WeatherRecord, DataSourceLog
)
from app.services.db_seed_service import seed_database

# Import routers
from app.api.auth import router as auth_router
from app.api.crops import router as crops_router
from app.api.markets import router as markets_router
from app.api.prices import router as prices_router
from app.api.predict import router as predict_router
from app.api.recommend import router as recommend_router
from app.api.alerts import router as alerts_router
from app.api.weather import router as weather_router
from app.api.admin import router as admin_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables and seed data
    print("[INIT] Creating database tables if not existing...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("[INIT] Seeding Karnataka master datasets and demo records...")
        seed_database(db)
    except Exception as e:
        print(f"[ERROR] Database seeding warning: {e}")
    finally:
        db.close()
    yield
    print("[SHUTDOWN] KrishiMitra backend shutting down...")

app = FastAPI(
    title="🌾 KrishiMitra API",
    description="AI-Powered Karnataka Crop Advisor, Market Price Prediction & Farmer Alert System",
    version="2.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development allow all; in production use settings.CORS_ORIGINS
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(crops_router, prefix=settings.API_V1_STR)
app.include_router(markets_router, prefix=settings.API_V1_STR)
app.include_router(prices_router, prefix=settings.API_V1_STR)
app.include_router(predict_router, prefix=settings.API_V1_STR)
app.include_router(recommend_router, prefix=settings.API_V1_STR)
app.include_router(alerts_router, prefix=settings.API_V1_STR)
app.include_router(weather_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "project": "🌾 KrishiMitra - AI Karnataka Agricultural Platform",
        "status": "ONLINE",
        "state_restriction": "Karnataka, India ONLY",
        "version": "2.0.0",
        "api_docs": "/docs",
        "supported_crops_count": 52,
        "tracked_apmcs_count": 33,
        "models_loaded": True
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "KrishiMitra Backend"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
