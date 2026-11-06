from fastapi import APIRouter, Query
from app.schemas.schemas import WeatherResponse
from app.services.weather_service import weather_service

router = APIRouter(prefix="/weather", tags=["Agro-Meteorology"])

@router.get("", response_model=WeatherResponse)
def get_district_weather(district: str = Query("Mysuru", description="Karnataka District")):
    data = weather_service.get_weather_for_district(district)
    return data
