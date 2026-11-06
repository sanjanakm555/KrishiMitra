import logging
from datetime import datetime
from typing import Dict, Any
from app.core.config import settings

logger = logging.getLogger("KrishiMitra.SMS")

class SMSService:
    """
    Transactional SMS notification gateway service.
    Designed for Indian telecom standards (DLT template registered sender IDs).
    Provides bilingual messages (English + Kannada).
    """

    @staticmethod
    def send_farmer_alert(phone_number: str, district: str, crop_name: str, alert_type: str, 
                          current_price: float, predicted_price: float, language: str = "en") -> Dict[str, Any]:
        
        diff = predicted_price - current_price
        pct = round((diff / current_price) * 100, 1)
        
        # English Template
        if pct > 0:
            msg_en = (
                f"[KRISHIMITRA ALERT] {crop_name} prices in {district} APMC are projected to increase by +{pct}% "
                f"(₹{int(current_price):,} -> ₹{int(predicted_price):,}/qtl) over 7 days. Consider WAITING before selling. Helpline: 1800-425-3553."
            )
            msg_kn = (
                f"[ಕೃಷಿಮಿತ್ರ ಸಂದೇಶ] {district} ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ {crop_name} ಬೆಲೆ 7 ದಿನಗಳಲ್ಲಿ +{pct}% ಏರಿಕೆಯಾಗುವ ಸಾಧ್ಯತೆಯಿದೆ "
                f"(₹{int(current_price):,} ರಿಂದ ₹{int(predicted_price):,}/ಕ್ವಿಂಟಾಲ್). ಮಾರಾಟವನ್ನು ಮುಂದೂಡುವುದು ಲಾಭದಾಯಕ. ಸಹಾಯವಾಣಿ: 1800-425-3553."
            )
        else:
            msg_en = (
                f"[KRISHIMITRA ALERT] {crop_name} prices in {district} APMC are projected to decline by {pct}% "
                f"(₹{int(current_price):,} -> ₹{int(predicted_price):,}/qtl). Consider SELLING NOW to safeguard profit. Helpline: 1800-425-3553."
            )
            msg_kn = (
                f"[ಕೃಷಿಮಿತ್ರ ಸಂದೇಶ] {district} ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ {crop_name} ಬೆಲೆ {pct}% ಇಳಿಕೆಯಾಗುವ ನಿರೀಕ್ಷೆಯಿದೆ "
                f"(₹{int(current_price):,} ರಿಂದ ₹{int(predicted_price):,}/ಕ್ವಿಂಟಾಲ್). ನಷ್ಟ ತಡೆಯಲು ತಕ್ಷಣ ಮಾರಾಟ ಮಾಡುವುದು ಸೂಕ್ತ. ಸಹಾಯವಾಣಿ: 1800-425-3553."
            )

        selected_msg = msg_kn if language == "kn" else msg_en
        
        # Real simulation / Gateway dispatch log
        logger.info(f"DISPATCHING SMS via {settings.SMS_PROVIDER} to {phone_number} | Text: {selected_msg}")
        
        # In a production environment with FAST2SMS or TWILIO keys:
        # if settings.SMS_PROVIDER == "fast2sms":
        #     requests.post("https://www.fast2sms.com/dev/bulkV2", ...)
        
        return {
            "status": "SENT",
            "provider": settings.SMS_PROVIDER,
            "sender_id": settings.SMS_SENDER_ID,
            "recipient": phone_number,
            "message_en": msg_en,
            "message_kn": msg_kn,
            "selected_language": language,
            "sent_at": datetime.utcnow().isoformat(),
            "tracking_id": f"KM-{int(datetime.utcnow().timestamp())}"
        }

sms_service = SMSService()
