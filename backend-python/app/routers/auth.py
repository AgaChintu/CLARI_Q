from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import Student, Teacher
from app.auth_schemas import LoginRequest, LoginResponse
from app.security import (
    verify_password,
    create_access_token,
    decode_access_token
)

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)

security = HTTPBearer()


# ==========================================
# LOGIN
# ==========================================

@router.post("/login", response_model=LoginResponse)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):

    college_id = request.college_id.strip()

    student = db.query(Student).filter(
        Student.student_code == college_id
    ).first()

    teacher = db.query(Teacher).filter(
        Teacher.teacher_code == college_id
    ).first()

    # Reject ambiguous IDs rather than guessing the account type.
    if student and teacher:
        raise HTTPException(
            status_code=409,
            detail="Duplicate College ID. Contact the administrator."
        )

    if student:
        user = student
        role = "STUDENT"
        account_code = user.student_code

    elif teacher:
        user = teacher
        role = "TEACHER"
        account_code = user.teacher_code

    else:
        raise HTTPException(
            status_code=401,
            detail="Invalid College ID or password."
        )

    if not user.is_active or not user.password_hash:
        raise HTTPException(
            status_code=401,
            detail="Invalid College ID or password."
        )

    if not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid College ID or password."
        )

    token = create_access_token({
        "sub": str(user.id),
        "college_id": account_code,
        "role": role
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "college_id": account_code,
        "name": user.full_name,
        "role": role
    }


# ==========================================
# GET CURRENT LOGGED-IN USER
# ==========================================

@router.get("/me")
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    payload = decode_access_token(credentials.credentials)

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired login session."
        )

    user_id = int(payload["sub"])
    role = payload["role"]

    if role == "STUDENT":

        user = db.query(Student).filter(
            Student.id == user_id
        ).first()

    elif role == "TEACHER":

        user = db.query(Teacher).filter(
            Teacher.id == user_id
        ).first()

    else:
        raise HTTPException(
            status_code=401,
            detail="Invalid account role."
        )

    if not user or not user.is_active:
        raise HTTPException(
            status_code=401,
            detail="Account is inactive or unavailable."
        )

    return {
        "user_id": user.id,
        "college_id": (
            user.student_code
            if role == "STUDENT"
            else user.teacher_code
        ),
        "name": user.full_name,
        "role": role
    }