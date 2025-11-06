# --- File: backendApp/api/audit_logs.py ---
# This file defines API endpoints for Audit Log resources.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backendApp.schemas.audit_log_schemas import AuditLogCreate, AuditLogResponse
from backendApp.services.audit_service import AuditService
from backendApp.dependencies import get_db  # Import get_db from dependencies
from backendApp.services.clerk_services import get_current_user_claims
from backendApp.services.user_service import UserService

import uuid
from typing import List

router = APIRouter()
audit_service = AuditService()
user_service = UserService()


@router.post("", response_model=AuditLogResponse, status_code=status.HTTP_201_CREATED)
def create_audit_log_api(audit_log: AuditLogCreate, db: Session = Depends(get_db), user_claims=Depends(get_current_user_claims)):
    clerk_user_id = user_claims.get("sub") or user_claims.get("id")
    user = user_service.get_or_create_user_by_clerk_id(db, clerk_user_id)
    audit_log.user_id = user.user_id
    db_audit_log = audit_service.create_audit_log(db, audit_log)
    if not db_audit_log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="User not found for this audit log")
    return db_audit_log


@router.get("/{log_id}", response_model=AuditLogResponse)
def get_audit_log_api(log_id: uuid.UUID, db: Session = Depends(get_db), user_claims=Depends(get_current_user_claims)):
    audit_log = audit_service.get_audit_log(db, log_id)
    if not audit_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Audit log not found")
    return audit_log


@router.get("/me", response_model=List[AuditLogResponse])
def get_current_user_audit_logs_api(db: Session = Depends(get_db), user_claims=Depends(get_current_user_claims)):
    clerk_user_id = user_claims.get("sub") or user_claims.get("id")
    user = user_service.get_or_create_user_by_clerk_id(db, clerk_user_id)
    audit_logs = audit_service.get_user_audit_logs(db, user.user_id)
    return audit_logs
