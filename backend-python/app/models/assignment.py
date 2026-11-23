from sqlalchemy import Column, Integer, Boolean, ForeignKey, UniqueConstraint
from app.database import Base


class TeacherAssignment(Base):
    __tablename__ = "teacher_assignments"
    __table_args__ = (
        UniqueConstraint("teacher_id", "section_id", "subject_id", name="uq_teacher_section_subject"),
    )

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=False)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    is_primary = Column(Boolean, nullable=False, default=True)
