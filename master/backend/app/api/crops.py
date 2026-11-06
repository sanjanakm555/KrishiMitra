from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.schema_models import Crop
from app.schemas.schemas import CropResponse

router = APIRouter(prefix="/crops", tags=["Crops"])

@router.get("", response_model=List[CropResponse])
def get_all_crops(
    category: Optional[str] = Query(None, description="Filter by category"),
    season: Optional[str] = Query(None, description="Filter by season"),
    db: Session = Depends(get_db)
):
    query = db.query(Crop)
    if category:
        query = query.filter(Crop.category.ilike(f"%{category}%"))
    if season:
        query = query.filter(Crop.season.ilike(f"%{season}%"))
    return query.order_by(Crop.crop_id if hasattr(Crop, "crop_id") else Crop.id).all()

@router.get("/{crop_id}", response_model=CropResponse)
def get_crop_by_id(crop_id: int, db: Session = Depends(get_db)):
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found in Karnataka catalog")
    return crop
