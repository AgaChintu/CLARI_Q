from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from app.database import Base


class TeacherAssignment(Base):
    """
    Assigns a teacher to a subject, section and semester.
    """

    __tablename__ = "teacher_assignments"

    __table_args__ = (
        UniqueConstraint(
            "teacher_id",
            "semester_id",
            "section_id",
            "subject_id",
            name="uq_teacher_semester_section_subject",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    teacher_id = Column(
        Integer,
        ForeignKey("teachers.id"),
        nullable=False,
    )

    semester_id = Column(
        Integer,
        ForeignKey("semesters.id"),
        nullable=False,
    )

    section_id = Column(
        Integer,
        ForeignKey("sections.id"),
        nullable=False,
    )

    subject_id = Column(
        Integer,
        ForeignKey("subjects.id"),
        nullable=False,
    )