# backend/app/routers/waitlist.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Waitlist
from pydantic import BaseModel, EmailStr

router = APIRouter()

class WaitlistCreate(BaseModel):
    email: EmailStr

@router.post("/", status_code=status.HTTP_201_CREATED)
async def join_waitlist(data: WaitlistCreate, db: Session = Depends(get_db)):
    existing = db.query(Waitlist).filter(Waitlist.email == data.email).first()
    if existing:
        return {"message": "Already on waitlist"}
    
    entry = Waitlist(email=data.email)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return {"message": "Successfully joined waitlist"}

@router.get("/count")
async def get_waitlist_count(db: Session = Depends(get_db)):
    count = db.query(Waitlist).count()
    return {"count": count}
