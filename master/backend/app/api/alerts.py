from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.db.session import get_db
from app.models.schema_models import AlertRecord, Crop
from app.schemas.schemas import AlertSubscribeRequest, AlertRecordResponse
from app.services.sms_service import sms_service

router = APIRouter(prefix="/alerts", tags=["Farmer Alerts & SMS"])

@router.get("", response_model=List[AlertRecordResponse])
def get_recent_alerts(limit: int = 20, db: Session = Depends(get_db)):
    return db.query(AlertRecord).order_by(desc(AlertRecord.sent_at)).limit(limit).all()

@router.post("/subscribe")
def subscribe_to_alerts(sub: AlertSubscribeRequest, db: Session = Depends(get_db)):
    crop = db.query(Crop).filter(Crop.crop_name.ilike(f"%{sub.crop_name}%")).first()
    curr_price = crop.base_price if crop else 3500.0
    pred_price = curr_price * 1.05
    
    # Send transactional SMS welcome alert
    sms_res = sms_service.send_farmer_alert(
        phone_number=sub.mobile_number,
        district=sub.district,
        crop_name=sub.crop_name,
        alert_type="PRICE_UPDATE",
        current_price=curr_price,
        predicted_price=pred_price,
        language=sub.language
    )
    
    # Log alert in database
    new_alert = AlertRecord(
        phone_number=sub.mobile_number,
        district=sub.district,
        crop_name=sub.crop_name,
        alert_type=sub.alert_type,
        message_en=sms_res["message_en"],
        message_kn=sms_res["message_kn"],
        status=sms_res["status"],
        provider_response=f"GATEWAY_ACK_{sms_res['tracking_id']}"
    )
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)
    
    return {
        "status": "SUCCESS",
        "message": "Subscription activated successfully. Confirmation SMS dispatched.",
        "alert": new_alert
    }
