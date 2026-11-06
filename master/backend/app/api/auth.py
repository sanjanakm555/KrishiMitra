from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.schema_models import User, FarmerProfile
from app.schemas.schemas import UserRegister, UserLogin, Token, UserResponse
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.mobile_number == user_in.mobile_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Mobile number already registered. Please login.")
    
    new_user = User(
        full_name=user_in.full_name,
        mobile_number=user_in.mobile_number,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role="farmer",
        preferred_language=user_in.preferred_language
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create farmer profile
    profile = FarmerProfile(
        user_id=new_user.id,
        district=user_in.district,
        taluk=user_in.taluk,
        village=user_in.village,
        primary_crop=user_in.primary_crop,
        land_area_acres=user_in.land_area_acres,
        soil_type=user_in.soil_type,
        irrigation_type=user_in.irrigation_type,
        previous_crop=user_in.previous_crop
    )
    db.add(profile)
    db.commit()
    
    token = create_access_token(subject=str(new_user.id))
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": new_user.id,
        "full_name": new_user.full_name,
        "role": new_user.role,
        "district": profile.district,
        "preferred_language": new_user.preferred_language
    }

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.mobile_number == login_data.mobile_number).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid mobile number or password")
    
    district = user.profile.district if user.profile else "Mysuru"
    token = create_access_token(subject=str(user.id))
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "full_name": user.full_name,
        "role": user.role,
        "district": district,
        "preferred_language": user.preferred_language
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(token: str, db: Session = Depends(get_db)):
    user_id = decode_access_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
