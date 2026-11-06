import sys
import os
import pytest
from fastapi.testclient import TestClient

# Ensure backend directory is in path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend"))

from main import app

client = TestClient(app)

def test_root_and_health():
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["state_restriction"] == "Karnataka, India ONLY"
    assert data["supported_crops_count"] == 52

    health = client.get("/health")
    assert health.status_code == 200
    assert health.json()["status"] == "healthy"

def test_get_crops():
    res = client.get("/api/crops")
    assert res.status_code == 200
    crops = res.json()
    assert len(crops) >= 50
    crop_names = [c["crop_name"] for c in crops]
    assert "Ragi" in crop_names
    assert "Paddy" in crop_names
    assert "Arecanut" in crop_names

def test_get_markets():
    res = client.get("/api/markets")
    assert res.status_code == 200
    mkts = res.json()
    assert len(mkts) >= 20
    market_names = [m["market_name"] for m in mkts]
    assert any("Mysuru" in m for m in market_names)

def test_latest_prices():
    res = client.get("/api/prices/latest")
    assert res.status_code == 200
    prices = res.json()
    assert len(prices) >= 50
    for p in prices[:5]:
        assert p["modal_price"] > 0
        assert p["unit"] == "₹ / quintal"
        assert "last_updated" in p

def test_price_prediction_ensemble():
    payload = {
        "district": "Mysuru",
        "market": "Mysuru APMC (Bandipalya)",
        "commodity": "Finger Millet",
        "current_modal_price": 3650.0
    }
    res = client.post("/api/predict/price", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "predicted_tomorrow_price" in data
    assert "predicted_7day_price" in data
    assert data["predicted_7day_price"] > 0
    assert data["decision"] in ["SELL", "WAIT", "MONITOR"]
    assert "decision_reason_en" in data
    assert "decision_reason_kn" in data

def test_crop_recommendation_ensemble():
    payload = {
        "district": "Mysuru",
        "soil_type": "Red Loamy",
        "soil_pH": 6.8,
        "nitrogen": 80.0,
        "phosphorus": 50.0,
        "potassium": 60.0,
        "rainfall": 850.0,
        "temperature": 28.0,
        "season": "Kharif",
        "water_availability": "Medium",
        "previous_crop": "Paddy"
    }
    res = client.post("/api/recommend/crop", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert len(data["recommendations"]) > 0
    top_rec = data["recommendations"][0]
    assert "suitability_score" in top_rec
    assert "reasons" in top_rec
    assert len(top_rec["reasons"]) > 0

def test_auth_farmer_login():
    res = client.post("/api/auth/login", json={
        "mobile_number": "9845012345",
        "password": "farmer123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["full_name"] == "Basavaraj Gowda (ಬಸವರಾಜ್ ಗೌಡ)"

def test_alerts_subscribe():
    payload = {
        "mobile_number": "9845012345",
        "district": "Mysuru",
        "crop_name": "Ragi",
        "language": "kn",
        "alert_type": "ALL"
    }
    res = client.post("/api/alerts/subscribe", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "SUCCESS"
    assert "alert" in data

def test_admin_metrics():
    res = client.get("/api/admin/metrics")
    assert res.status_code == 200
    data = res.json()
    assert data["total_crops_supported"] >= 50
    assert data["model_test_r2"] > 0.9
