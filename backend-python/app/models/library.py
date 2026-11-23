from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint
from app.database import Base


class LibraryEntry(Base):
    __tablename__ = "library_entries"

    id = Column(Integer, primary_key=True, index=True)
    doubt_id = Column(Integer, ForeignKey("doubts.id"), nullable=False, unique=True)
    published_by_teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=False)
    published_at = Column(DateTime, nullable=False)


class SavedEntry(Base):
    __tablename__ = "saved_entries"
    __table_args__ = (UniqueConstraint("student_id", "library_entry_id", name="uq_student_saved_entry"),)

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    library_entry_id = Column(Integer, ForeignKey("library_entries.id"), nullable=False)
    saved_at = Column(DateTime, nullable=False)
