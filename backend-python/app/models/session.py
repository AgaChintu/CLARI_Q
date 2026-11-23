from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from app.database import Base


class DoubtSession(Base):
    __tablename__ = "doubt_sessions"

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=False)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    session_date = Column(DateTime, nullable=True)
    starts_at = Column(DateTime, nullable=True)
    ends_at = Column(DateTime, nullable=True)
    submission_opens_at = Column(DateTime, nullable=False)
    submission_closes_at = Column(DateTime, nullable=False)
    status = Column(String(30), nullable=False, default="upcoming")
    is_active = Column(Boolean, nullable=False, default=True)


class SessionTopic(Base):
    __tablename__ = "session_topics"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("doubt_sessions.id"), nullable=False)
    topic_id = Column(Integer, ForeignKey("syllabus_topics.id"), nullable=False)


class SessionDoubt(Base):
    __tablename__ = "session_doubts"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("doubt_sessions.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    topic_id = Column(Integer, ForeignKey("syllabus_topics.id"), nullable=False)
    question = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=True)
    is_edited = Column(Boolean, nullable=False, default=False)
