from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.schema_models import Crop, CropRecommendationRecord
from app.schemas.schemas import RecommendationRequest, RecommendationResponse
from app.services.ml_service import ml_service

router = APIRouter(prefix="/recommend", tags=["AI Crop Recommendation"])

@router.post("/crop", response_model=RecommendationResponse)
def recommend_crops(req: RecommendationRequest, db: Session = Depends(get_db)):
    """
    Evaluates soil suitability, N-P-K nutrient status, rainfall normals, season,
    and previous crop to recommend top suitable crops using Soft-Voting Ensemble Classifier.
    Enforces Crop Rotation principles (e.g. alternating legumes with cereals).
    """
    # Load all crops metadata from database
    crops = db.query(Crop).all()
    crops_catalog = [
        {
            "crop_name": c.crop_name,
            "kannada_name": c.kannada_name,
            "category": c.category,
            "soil_type": c.soil_type,
            "water_requirement": c.water_requirement,
            "major_districts": c.major_districts,
            "base_price": c.base_price,
            "image_url": c.image_url
        }
        for c in crops
    ]
    
    top_recs, rotation_advice = ml_service.recommend_crops(
        district=req.district,
        soil_type=req.soil_type,
        soil_pH=req.soil_pH or 6.8,
        n=req.nitrogen or 70.0,
        p=req.phosphorus or 45.0,
        k=req.potassium or 50.0,
        rainfall=req.rainfall or 850.0,
        temperature=req.temperature or 27.0,
        season=req.season,
        water=req.water_availability,
        prev_crop=req.previous_crop or "None / Fallow",
        crops_catalog=crops_catalog
    )
    
    # Save recommendation history
    rec_record = CropRecommendationRecord(
        district=req.district,
        soil_type=req.soil_type,
        season=req.season,
        previous_crop=req.previous_crop,
        recommended_crops_json=top_recs
    )
    db.add(rec_record)
    db.commit()
    
    return {
        "district": req.district,
        "soil_type": req.soil_type,
        "season": req.season,
        "previous_crop": req.previous_crop or "None / Fallow",
        "recommendations": top_recs,
        "crop_rotation_advice": rotation_advice
    }
