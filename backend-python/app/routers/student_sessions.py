from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.security import decode_access_token

from app.models.user import Student, Teacher
from app.models.session import DoubtSession, SessionTopic, SessionDoubt
from app.models.academic import (
    Subject,
    SyllabusTopic,
    SyllabusUnit,
)


router = APIRouter(
    prefix="/api/student/sessions",
    tags=["Student Doubt Sessions"],
)

security = HTTPBearer()


# ==========================================
# AUTHENTICATE STUDENT
# ==========================================

def get_current_student(
    credentials: HTTPAuthorizationCredentials,
    db: Session,
):
    try:
        payload = decode_access_token(credentials.credentials)
    except Exception:
        payload = None

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token.",
        )

    role = str(payload.get("role", "")).upper()

    if role != "STUDENT":
        raise HTTPException(
            status_code=403,
            detail="Student access required.",
        )

    # Login JWT uses the database user ID in "sub".
    user_id = payload.get("user_id") or payload.get("sub")

    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=401,
            detail="Invalid student token.",
        )

    student = db.query(Student).filter(
        Student.id == user_id,
        Student.is_active == True,
    ).first()

    if not student:
        raise HTTPException(
            status_code=401,
            detail="Student account unavailable.",
        )

    return student


# ==========================================
# RESPONSE HELPERS
# ==========================================

def get_submission_status(session):
    now = datetime.now()

    if now < session.submission_opens_at:
        return "upcoming"

    if now <= session.submission_closes_at:
        return "accepting"

    return "closed"


def format_datetime(value):
    return value.isoformat() if value else None


def get_session_topics(db, session_id):

    rows = (
        db.query(
            SessionTopic.topic_id,
            SyllabusTopic.name.label("topic_name"),
            SyllabusTopic.display_order,
            SyllabusUnit.id.label("unit_id"),
            SyllabusUnit.unit_number,
            SyllabusUnit.unit_name,
        )
        .join(
            SyllabusTopic,
            SyllabusTopic.id == SessionTopic.topic_id,
        )
        .join(
            SyllabusUnit,
            SyllabusUnit.id == SyllabusTopic.unit_id,
        )
        .filter(
            SessionTopic.session_id == session_id
        )
        .order_by(
            SyllabusUnit.unit_number,
            SyllabusTopic.display_order,
        )
        .all()
    )

    units = {}

    for row in rows:

        if row.unit_id not in units:
            units[row.unit_id] = {
                "id": row.unit_id,
                "unit_number": row.unit_number,
                "unit_name": row.unit_name,
                "topics": [],
            }

        units[row.unit_id]["topics"].append({
            "id": row.topic_id,
            "name": row.topic_name,
            "display_order": row.display_order,
        })

    return list(units.values())


def format_session(db, session):

    subject = db.query(Subject).filter(
        Subject.id == session.subject_id
    ).first()

    teacher = db.query(Teacher).filter(
        Teacher.id == session.teacher_id
    ).first()

    return {
        "id": session.id,
        "title": session.title,
        "description": session.description,

        "subject": {
            "id": subject.id,
            "code": subject.code,
            "name": subject.name,
        } if subject else None,

        "teacher": {
            "id": teacher.id,
            "name": teacher.full_name,
        } if teacher else None,

        "submission_opens_at": format_datetime(
            session.submission_opens_at
        ),

        "submission_closes_at": format_datetime(
            session.submission_closes_at
        ),

        "session_date": format_datetime(
            session.session_date
        ),

        "starts_at": format_datetime(
            session.starts_at
        ),

        "ends_at": format_datetime(
            session.ends_at
        ),

        "submission_status": get_submission_status(session),

        "topics": get_session_topics(db, session.id),
    }


def format_doubt(db, doubt):

    topic = db.query(SyllabusTopic).filter(
        SyllabusTopic.id == doubt.topic_id
    ).first()

    unit = None

    if topic:
        unit = db.query(SyllabusUnit).filter(
            SyllabusUnit.id == topic.unit_id
        ).first()

    return {
        "id": doubt.id,
        "session_id": doubt.session_id,
        "topic_id": doubt.topic_id,

        "topic": topic.name if topic else None,

        "unit_id": unit.id if unit else None,

        "unit_name": unit.unit_name if unit else None,

        "question": doubt.question,

        "created_at": format_datetime(
            doubt.created_at
        ),

        "updated_at": format_datetime(
            doubt.updated_at
        ),

        "is_edited": doubt.is_edited,
    }


# ==========================================
# VALIDATE SESSION ACCESS
# ==========================================

def get_accessible_session(db, session_id, student):

    session = db.query(DoubtSession).filter(
        DoubtSession.id == session_id,
        DoubtSession.section_id == student.section_id,
        DoubtSession.is_active == True,
    ).first()

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found.",
        )

    return session


# ==========================================
# VALIDATE SELECTED TOPIC
# ==========================================

def validate_session_topic(db, session_id, topic_id):

    allowed_topic = db.query(SessionTopic).filter(
        SessionTopic.session_id == session_id,
        SessionTopic.topic_id == topic_id,
    ).first()

    if not allowed_topic:
        raise HTTPException(
            status_code=400,
            detail="Please select a topic included in this session.",
        )


# ==========================================
# REQUEST BODY
# ==========================================

class SessionDoubtRequest(BaseModel):

    question: str = Field(
        min_length=1,
        max_length=10000,
    )

    topic_id: int


# ==========================================
# GET ALL SESSIONS FOR LOGGED-IN STUDENT
# ==========================================

@router.get("")
def get_student_sessions(

    credentials: HTTPAuthorizationCredentials = Depends(security),

    db: Session = Depends(get_db),

):

    student = get_current_student(credentials, db)

    sessions = (
        db.query(DoubtSession)
        .filter(
            DoubtSession.section_id == student.section_id,
            DoubtSession.is_active == True,
        )
        .order_by(
            DoubtSession.session_date.asc(),
            DoubtSession.id.desc(),
        )
        .all()
    )

    return {
        "sessions": [
            format_session(db, session)
            for session in sessions
        ]
    }


# ==========================================
# GET ONE SESSION + STUDENT'S SUBMISSIONS
# ==========================================

@router.get("/{session_id}")
def get_student_session(

    session_id: int,

    credentials: HTTPAuthorizationCredentials = Depends(security),

    db: Session = Depends(get_db),

):

    student = get_current_student(credentials, db)

    session = get_accessible_session(
        db,
        session_id,
        student,
    )

    doubts = (
        db.query(SessionDoubt)
        .filter(
            SessionDoubt.session_id == session.id,
            SessionDoubt.student_id == student.id,
        )
        .order_by(
            SessionDoubt.created_at.desc()
        )
        .all()
    )

    result = format_session(db, session)

    result["my_doubts"] = [
        format_doubt(db, doubt)
        for doubt in doubts
    ]

    return result


# ==========================================
# SUBMIT A DOUBT
# ==========================================

@router.post("/{session_id}/doubts")
def submit_session_doubt(

    session_id: int,

    request: SessionDoubtRequest,

    credentials: HTTPAuthorizationCredentials = Depends(security),

    db: Session = Depends(get_db),

):

    student = get_current_student(credentials, db)

    session = get_accessible_session(
        db,
        session_id,
        student,
    )

    if get_submission_status(session) != "accepting":
        raise HTTPException(
            status_code=400,
            detail="The submission window is not open.",
        )

    question = request.question.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Please enter your doubt.",
        )

    validate_session_topic(
        db,
        session.id,
        request.topic_id,
    )

    doubt = SessionDoubt(
        session_id=session.id,
        student_id=student.id,
        topic_id=request.topic_id,
        question=question,
        created_at=datetime.now(),
        updated_at=None,
        is_edited=False,
    )

    db.add(doubt)
    db.commit()
    db.refresh(doubt)

    return {
        "message": "Doubt submitted successfully.",
        "doubt": format_doubt(db, doubt),
    }


# ==========================================
# EDIT A SUBMITTED DOUBT
# ==========================================

@router.put("/{session_id}/doubts/{doubt_id}")
def edit_session_doubt(

    session_id: int,

    doubt_id: int,

    request: SessionDoubtRequest,

    credentials: HTTPAuthorizationCredentials = Depends(security),

    db: Session = Depends(get_db),

):

    student = get_current_student(credentials, db)

    session = get_accessible_session(
        db,
        session_id,
        student,
    )

    if get_submission_status(session) != "accepting":
        raise HTTPException(
            status_code=400,
            detail="The submission window is closed.",
        )

    doubt = db.query(SessionDoubt).filter(
        SessionDoubt.id == doubt_id,
        SessionDoubt.session_id == session.id,
        SessionDoubt.student_id == student.id,
    ).first()

    if not doubt:
        raise HTTPException(
            status_code=404,
            detail="Doubt not found.",
        )

    question = request.question.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Please enter your doubt.",
        )

    validate_session_topic(
        db,
        session.id,
        request.topic_id,
    )

    doubt.question = question
    doubt.topic_id = request.topic_id
    doubt.updated_at = datetime.now()
    doubt.is_edited = True

    db.commit()
    db.refresh(doubt)

    return {
        "message": "Doubt updated successfully.",
        "doubt": format_doubt(db, doubt),
    }


# ==========================================
# DELETE A SUBMITTED DOUBT
# ==========================================

@router.delete("/{session_id}/doubts/{doubt_id}")
def delete_session_doubt(

    session_id: int,

    doubt_id: int,

    credentials: HTTPAuthorizationCredentials = Depends(security),

    db: Session = Depends(get_db),

):

    student = get_current_student(credentials, db)

    session = get_accessible_session(
        db,
        session_id,
        student,
    )

    if get_submission_status(session) != "accepting":
        raise HTTPException(
            status_code=400,
            detail="The submission window is closed.",
        )

    doubt = db.query(SessionDoubt).filter(
        SessionDoubt.id == doubt_id,
        SessionDoubt.session_id == session.id,
        SessionDoubt.student_id == student.id,
    ).first()

    if not doubt:
        raise HTTPException(
            status_code=404,
            detail="Doubt not found.",
        )

    db.delete(doubt)
    db.commit()

    return {
        "message": "Doubt deleted successfully."
    }