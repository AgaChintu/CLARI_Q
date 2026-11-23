
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database import engine, Base
import app.models  # noqa: F401 - registers all models with Base.metadata

from app.routers.auth import router as auth_router
from app.routers.student_sessions import router as student_sessions_router


app = FastAPI(title="ClariQ API")


# ==========================================
# CORS CONFIGURATION
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:5501",
        "http://localhost:5501"
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# ROUTERS
# ==========================================

app.include_router(auth_router)
app.include_router(student_sessions_router)


# ==========================================
# DATABASE TABLE CREATION
# ==========================================

@app.on_event("startup")
def create_database_tables():
    Base.metadata.create_all(bind=engine)


# ==========================================
# HOME
# ==========================================

@app.get("/")
def home():
    return {"message": "ClariQ Backend is running!"}


# ==========================================
# DATABASE CONNECTION TEST
# ==========================================

@app.get("/db-test")
def test_database():
    try:
        with engine.connect() as connection:
            database_name = connection.execute(
                text("SELECT DATABASE()")
            ).scalar()

        return {
            "status": "success",
            "message": "MySQL connected successfully!",
            "database": database_name
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


# ==========================================
# LIST DATABASE TABLES
# ==========================================

@app.get("/tables")
def list_tables():
    return {
        "tables": sorted(Base.metadata.tables.keys())
    }


# ==========================================
# ACADEMIC STRUCTURE
# ==========================================

@app.get("/academic-structure")
def get_academic_structure():

    query = text("""
        SELECT
            ay.id AS year_id,
            ay.name AS year_name,
            ay.year_number,
            sem.id AS semester_id,
            sem.semester_number,
            sem.name AS semester_name,
            sec.id AS section_id,
            sec.code AS section_code,
            sec.name AS section_name,
            sub.id AS subject_id,
            sub.code AS subject_code,
            sub.name AS subject_name,
            sub.subject_type
        FROM academic_years ay
        LEFT JOIN semesters sem
            ON sem.academic_year_id = ay.id
        LEFT JOIN section_groups sg
            ON sg.academic_year_id = ay.id
        LEFT JOIN section_group_members sgm
            ON sgm.section_group_id = sg.id
        LEFT JOIN sections sec
            ON sec.id = sgm.section_id
        LEFT JOIN subject_offerings so
            ON so.semester_id = sem.id
            AND so.section_group_id = sg.id
        LEFT JOIN subjects sub
            ON sub.id = so.subject_id
        ORDER BY
            ay.year_number,
            sem.semester_number,
            sec.code,
            sub.name
    """)

    with engine.connect() as connection:
        rows = connection.execute(query).mappings().all()

    academic_years = {}

    for row in rows:

        year_id = row["year_id"]

        if year_id not in academic_years:
            academic_years[year_id] = {
                "id": year_id,
                "name": row["year_name"],
                "year_number": row["year_number"],
                "semesters": {}
            }

        if row["semester_id"] is None:
            continue

        year = academic_years[year_id]
        semester_id = row["semester_id"]

        if semester_id not in year["semesters"]:
            year["semesters"][semester_id] = {
                "id": semester_id,
                "semester_number": row["semester_number"],
                "name": row["semester_name"],
                "sections": {}
            }

        semester = year["semesters"][semester_id]
        section_id = row["section_id"]

        if section_id is None:
            continue

        if section_id not in semester["sections"]:
            semester["sections"][section_id] = {
                "id": section_id,
                "code": row["section_code"],
                "name": row["section_name"],
                "subjects": {}
            }

        section = semester["sections"][section_id]

        if row["subject_id"] is not None:

            subject_id = row["subject_id"]

            section["subjects"][subject_id] = {
                "id": subject_id,
                "code": row["subject_code"],
                "name": row["subject_name"],
                "subject_type": row["subject_type"]
            }

    result = []

    for year in academic_years.values():

        semesters = []

        for semester in year["semesters"].values():

            sections = []

            for section in semester["sections"].values():

                section["subjects"] = list(
                    section["subjects"].values()
                )

                sections.append(section)

            semester["sections"] = sections
            semesters.append(semester)

        year["semesters"] = semesters
        result.append(year)

    return {
        "academic_years": result
    }
