# --- File: backendApp/api/users.py ---
# This file defines API endpoints for User and Quota resources.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backendApp.schemas.user_schemas import UserCreate, UserBase, UserResponse
from backendApp.schemas.quota_schemas import QuotaBase, QuotaResponse
from backendApp.services.user_service import UserService
from backendApp.services.quota_service import QuotaService
from backendApp.dependencies import get_db  # Import get_db from dependencies
from backendApp.services.clerk_services import get_current_user_claims

router = APIRouter()
user_service = UserService()
quota_service = QuotaService()


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user_api(db: Session = Depends(get_db), user_claims=Depends(get_current_user_claims)):
    clerk_user_id = user_claims.get("sub") or user_claims.get("id")
    clerk_email = user_claims.get("email")
    clerk_name = user_claims.get("first_name")
    clerk_role = user_claims.get("role", "user")
    db_user = user_service.get_or_create_user_by_clerk_id(
        db, clerk_user_id, clerk_email, clerk_name, clerk_role)
    return db_user


@router.get("/me", response_model=UserResponse)
def get_current_user_api(db: Session = Depends(get_db), user_claims=Depends(get_current_user_claims)):
    clerk_user_id = user_claims.get("sub") or user_claims.get("id")
    user = user_service.get_or_create_user_by_clerk_id(db, clerk_user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.put("/me", response_model=UserResponse)
def update_current_user_api(user_update: UserBase, db: Session = Depends(get_db), user_claims=Depends(get_current_user_claims)):
    clerk_user_id = user_claims.get("sub") or user_claims.get("id")
    user = user_service.get_or_create_user_by_clerk_id(db, clerk_user_id)
    user = user_service.update_user(db, user.user_id, user_update)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_current_user_api(db: Session = Depends(get_db), user_claims=Depends(get_current_user_claims)):
    clerk_user_id = user_claims.get("sub") or user_claims.get("id")
    user = user_service.get_or_create_user_by_clerk_id(db, clerk_user_id)
    if not user_service.delete_user(db, user.user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {"message": "User deleted successfully"}


@router.get("/me/quota", response_model=QuotaResponse)
def get_current_user_quota_api(db: Session = Depends(get_db), user_claims=Depends(get_current_user_claims)):
    clerk_user_id = user_claims.get("sub") or user_claims.get("id")
    user = user_service.get_or_create_user_by_clerk_id(db, clerk_user_id)
    quota = quota_service.get_user_quota(db, user.user_id)
    if not quota:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Quota not found for this user")
    return quota


@router.put("/me/quota", response_model=QuotaResponse)
def update_current_user_quota_api(quota_update: QuotaBase, db: Session = Depends(get_db), user_claims=Depends(get_current_user_claims)):
    clerk_user_id = user_claims.get("sub") or user_claims.get("id")
    user = user_service.get_or_create_user_by_clerk_id(db, clerk_user_id)
    quota = quota_service.update_user_quota(db, user.user_id, quota_update)
    if not quota:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Quota not found for this user")
    return quota
