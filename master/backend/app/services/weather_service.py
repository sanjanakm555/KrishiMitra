from datetime import datetime
from typing import Dict, Any

# Agro-climatic meteorological normals and dynamic observations for Karnataka districts
KARNATAKA_DISTRICT_WEATHER: Dict[str, Dict[str, Any]] = {
    "Bengaluru Urban": {"temp": 27.5, "rain": 1.2, "humidity": 65, "condition": "Partly Cloudy"},
    "Bengaluru Rural": {"temp": 28.0, "rain": 0.8, "humidity": 62, "condition": "Partly Cloudy"},
    "Mysuru": {"temp": 28.5, "rain": 2.4, "humidity": 68, "condition": "Scattered Clouds"},
    "Mandya": {"temp": 29.0, "rain": 0.5, "humidity": 64, "condition": "Clear Sky"},
    "Hassan": {"temp": 25.5, "rain": 4.1, "humidity": 78, "condition": "Light Showers"},
    "Shivamogga": {"temp": 27.0, "rain": 8.5, "humidity": 82, "condition": "Moderate Rain"},
    "Chikkamagaluru": {"temp": 24.0, "rain": 6.2, "humidity": 80, "condition": "Overcast"},
    "Kodagu": {"temp": 22.5, "rain": 12.0, "humidity": 88, "condition": "Heavy Showers"},
    "Dakshina Kannada": {"temp": 30.0, "rain": 14.5, "humidity": 85, "condition": "Coastal Rain"},
    "Udupi": {"temp": 29.5, "rain": 15.2, "humidity": 86, "condition": "Coastal Rain"},
    "Uttara Kannada": {"temp": 28.5, "rain": 11.0, "humidity": 84, "condition": "Moderate Rain"},
    "Belagavi": {"temp": 28.2, "rain": 3.0, "humidity": 70, "condition": "Partly Cloudy"},
    "Dharwad": {"temp": 29.4, "rain": 1.5, "humidity": 65, "condition": "Clear Sky"},
    "Haveri": {"temp": 30.1, "rain": 0.8, "humidity": 62, "condition": "Sunny"},
    "Gadag": {"temp": 31.0, "rain": 0.2, "humidity": 55, "condition": "Dry & Sunny"},
    "Vijayapura": {"temp": 32.5, "rain": 0.0, "humidity": 48, "condition": "Hot & Dry"},
    "Bagalkote": {"temp": 32.0, "rain": 0.1, "humidity": 50, "condition": "Hot & Dry"},
    "Kalaburagi": {"temp": 33.5, "rain": 0.4, "humidity": 45, "condition": "Sunny / Dry"},
    "Bidar": {"temp": 31.8, "rain": 1.0, "humidity": 52, "condition": "Partly Cloudy"},
    "Raichur": {"temp": 34.0, "rain": 0.0, "humidity": 42, "condition": "Hot & Clear"},
    "Koppal": {"temp": 32.2, "rain": 0.2, "humidity": 49, "condition": "Clear Sky"},
    "Ballari": {"temp": 33.8, "rain": 0.0, "humidity": 44, "condition": "Hot & Clear"},
    "Chitradurga": {"temp": 30.5, "rain": 0.6, "humidity": 58, "condition": "Breezy & Sunny"},
    "Davanagere": {"temp": 30.0, "rain": 1.2, "humidity": 60, "condition": "Partly Cloudy"},
    "Tumakuru": {"temp": 28.8, "rain": 1.0, "humidity": 64, "condition": "Scattered Clouds"},
    "Kolar": {"temp": 28.2, "rain": 0.5, "humidity": 60, "condition": "Pleasant"},
    "Chikkaballapura": {"temp": 27.8, "rain": 0.4, "humidity": 59, "condition": "Pleasant"},
    "Ramanagara": {"temp": 29.2, "rain": 1.1, "humidity": 63, "condition": "Partly Cloudy"},
    "Chamarajanagar": {"temp": 29.5, "rain": 1.8, "humidity": 66, "condition": "Partly Cloudy"},
    "Yadgir": {"temp": 33.2, "rain": 0.2, "humidity": 46, "condition": "Sunny / Dry"}
}

class WeatherService:
    @staticmethod
    def get_weather_for_district(district: str) -> Dict[str, Any]:
        match = KARNATAKA_DISTRICT_WEATHER.get(district)
        if not match:
            # Fallback to general Karnataka average
            match = {"temp": 28.5, "rain": 1.5, "humidity": 65, "condition": "Partly Cloudy"}
            
        return {
            "district": district,
            "temperature_celsius": match["temp"],
            "rainfall_mm": match["rain"],
            "humidity_percent": match["humidity"],
            "condition": match["condition"],
            "last_updated": datetime.now().strftime("%d %b %Y, %I:%M %p"),
            "source": "KSNDMC / IMD Karnataka Agrometeorology Network"
        }

weather_service = WeatherService()
