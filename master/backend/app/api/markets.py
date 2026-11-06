from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.schema_models import Market
from app.schemas.schemas import MarketResponse

router = APIRouter(prefix="/markets", tags=["Markets"])

@router.get("", response_model=List[MarketResponse])
def get_all_markets(
    district: Optional[str] = Query(None, description="Filter by Karnataka district"),
    db: Session = Depends(get_db)
):
    query = db.query(Market)
    if district:
        query = query.filter(Market.district.ilike(f"%{district}%"))
    return query.order_by(Market.district, Market.market_name).all()

@router.get("/{market_id}", response_model=MarketResponse)
def get_market_by_id(market_id: int, db: Session = Depends(get_db)):
    market = db.query(Market).filter(Market.id == market_id).first()
    if not market:
        raise HTTPException(status_code=404, detail="Market not found in Karnataka APMC registry")
    return market
