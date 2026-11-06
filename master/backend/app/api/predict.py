from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.db.session import get_db
from app.models.schema_models import MarketPrice, PredictionRecord, Crop
from app.schemas.schemas import PredictionRequest, PredictionResponse
from app.services.ml_service import ml_service

router = APIRouter(prefix="/predict", tags=["AI Price Prediction"])

@router.post("/price", response_model=PredictionResponse)
def predict_crop_price(req: PredictionRequest, db: Session = Depends(get_db)):
    """
    Predicts next-day and 7-day market prices using the trained Stacking/Voting Ensemble model.
    Returns trend forecast, confidence signals, sell/wait decision, and chart data.
    """
    # 1. Fetch recent price series from database
    records = db.query(MarketPrice).filter(
        MarketPrice.commodity.ilike(f"%{req.commodity}%")
    ).order_by(desc(MarketPrice.date)).limit(14).all()
    
    if req.current_modal_price and req.current_modal_price > 0:
        current_price = req.current_modal_price
    elif records:
        current_price = records[0].modal_price
    else:
        # Check crop master base price
        crop = db.query(Crop).filter(Crop.commodity_name.ilike(f"%{req.commodity}%")).first()
        current_price = crop.base_price if crop else 3200.0
        
    recent_prices = [r.modal_price for r in reversed(records)] if records else [current_price]
    
    # 2. Execute ML Ensemble inference
    pred_result = ml_service.predict_price(
        commodity=req.commodity,
        district=req.district,
        market=req.market,
        current_modal_price=current_price,
        recent_prices=recent_prices
    )
    
    # 3. Save to database log
    pred_record = PredictionRecord(
        district=req.district,
        market=req.market,
        commodity=req.commodity,
        current_price=current_price,
        predicted_tomorrow_price=pred_result["predicted_tomorrow_price"],
        predicted_7day_price=pred_result["predicted_7day_price"],
        expected_change_pct=pred_result["expected_change_pct"],
        trend=pred_result["trend"],
        decision=pred_result["decision"],
        model_version=pred_result["model_version"]
    )
    db.add(pred_record)
    db.commit()
    
    # 4. Generate mini chart data for frontend visualization
    chart_data = []
    for r in records[:7]:
        chart_data.append({
            "date": r.date.strftime("%d %b"),
            "actual_price": r.modal_price,
            "predicted_price": None
        })
    chart_data.reverse()
    chart_data.append({
        "date": "Today",
        "actual_price": current_price,
        "predicted_price": current_price
    })
    chart_data.append({
        "date": "Tomorrow",
        "actual_price": None,
        "predicted_price": pred_result["predicted_tomorrow_price"]
    })
    chart_data.append({
        "date": "+7 Days",
        "actual_price": None,
        "predicted_price": pred_result["predicted_7day_price"]
    })
    
    return {
        "district": req.district,
        "market": req.market,
        "commodity": req.commodity,
        "current_modal_price": current_price,
        "predicted_tomorrow_price": pred_result["predicted_tomorrow_price"],
        "predicted_7day_price": pred_result["predicted_7day_price"],
        "expected_change_pct": pred_result["expected_change_pct"],
        "trend": pred_result["trend"],
        "decision": pred_result["decision"],
        "decision_reason_en": pred_result["decision_reason_en"],
        "decision_reason_kn": pred_result["decision_reason_kn"],
        "model_version": pred_result["model_version"],
        "historical_chart_data": chart_data
    }
