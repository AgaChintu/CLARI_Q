# ClariQ Python API

This folder contains the Python FastAPI service. The Java backend is intentionally untouched.

## Environment

1. Create a MySQL database named `clariq`.
2. Copy `.env.example` to `.env` and set the database credentials and a private JWT secret.
3. Install dependencies from `requirements.txt`.
4. From this directory, run the existing seed script after the database is reachable.
5. Start the API with Uvicorn using the application import path shown in the project setup.

The API creates SQLAlchemy tables at startup. Existing schema changes are not automatically migrated; use a migration plan before deploying changes to an existing database.

## Security notes

- Do not commit `.env`, passwords, database dumps, or uploaded student files.
- Replace the development JWT secret before sharing a deployment.
- Keep uploaded files on private storage and expose them only through authenticated endpoints.
- Student identity must remain hidden from teacher-facing doubt responses.

## Current API areas

- Authentication: `/api/auth`
- Student doubts: `/api/student/doubts`
- Student doubt sessions: `/api/student/sessions`

Teacher workflows, student doubt history/follow-ups, library, saves, and notifications still require implementation and frontend integration. This README does not claim those modules are complete.
