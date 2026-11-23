import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database import engine, Base
import app.models

from app.routers.auth import router as auth_router
from app.routers.student_sessions import router as student_sessions_router
from app.routers.student_doubts import router as student_doubts_router

app = FastAPI(
    title="ClariQ API",
    description="Identity-protected academic doubt resolution API.",
    version="1.0.0",
)

origins = [
    item.strip()
    for item in os.getenv(
        "CORS_ORIGINS",
        "http://127.0.0.1:5500,http://localhost:5500,http://127.0.0.1:5501,http://localhost:5501",
    ).split(",")
    if item.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(student_sessions_router)
app.include_router(student_doubts_router)


@app.on_event("startup")
def create_database_tables():
    # Model imports above register all mapped tables before create_all.
    Base.metadata.create_all(bind=engine)


@app.get("/", tags=["System"])
def home():
    return {"message": "ClariQ Backend is running!", "docs": "/docs"}


@app.get("/health", tags=["System"])
def health():
    return {"status": "ok", "service": "clariq-api"}


@app.get("/db-test", tags=["System"])
def test_database():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return {"status": "success", "message": "Database connection successful."}


@app.get("/tables", tags=["System"])
def list_tables():
    return {"tables": sorted(Base.metadata.tables.keys())}


@app.get("/academic-structure", tags=["Academic"])
def get_academic_structure():
    query = text("""
        SELECT
            ay.id AS year_id, ay.name AS year_name, ay.year_number,
            sem.id AS semester_id, sem.semester_number, sem.name AS semester_name,
            sec.id AS section_id, sec.code AS section_code, sec.name AS section_name,
            sub.id AS subject_id, sub.code AS subject_code, sub.name AS subject_name,
            sub.subject_type
        FROM academic_years ay
        LEFT JOIN semesters sem ON sem.academic_year_id = ay.id
        LEFT JOIN section_groups sg ON sg.academic_year_id = ay.id
        LEFT JOIN section_group_members sgm ON sgm.section_group_id = sg.id
        LEFT JOIN sections sec ON sec.id = sgm.section_id
        LEFT JOIN subject_offerings so
            ON so.semester_id = sem.id AND so.section_group_id = sg.id
        LEFT JOIN subjects sub ON sub.id = so.subject_id
        ORDER BY ay.year_number, sem.semester_number, sec.code, sub.name
    """)
    with engine.connect() as connection:
        rows = connection.execute(query).mappings().all()

    years = {}
    for row in rows:
        year_id = row["year_id"]
        year = years.setdefault(year_id, {
            "id": year_id,
            "name": row["year_name"],
            "year_number": row["year_number"],
            "semesters": {},
        })
        if row["semester_id"] is None:
            continue
        semester_id = row["semester_id"]
        semester = year["semesters"].setdefault(semester_id, {
            "id": semester_id,
            "semester_number": row["semester_number"],
            "name": row["semester_name"],
            "sections": {},
        })
        if row["section_id"] is None:
            continue
        section_id = row["section_id"]
        section = semester["sections"].setdefault(section_id, {
            "id": section_id,
            "code": row["section_code"],
            "name": row["section_name"],
            "subjects": {},
        })
        if row["subject_id"] is not None:
            section["subjects"][row["subject_id"]] = {
                "id": row["subject_id"],
                "code": row["subject_code"],
                "name": row["subject_name"],
                "subject_type": row["subject_type"],
            }

    result = []
    for year in years.values():
        semesters = []
        for semester in year["semesters"].values():
            sections = []
            for section in semester["sections"].values():
                section["subjects"] = list(section["subjects"].values())
                sections.append(section)
            semester["sections"] = sections
            semesters.append(semester)
        year["semesters"] = semesters
        result.append(year)
    return {"academic_years": result}
