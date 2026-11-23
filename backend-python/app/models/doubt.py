from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    Boolean,
    UniqueConstraint,
)

from app.database import Base


class Doubt(Base):
    __tablename__ = "doubts"

    id = Column(Integer, primary_key=True, index=True)

    doubt_code = Column(
        String(36),
        nullable=False,
        unique=True,
    )

    student_id = Column(
        Integer,
        ForeignKey("students.id"),
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

    teacher_id = Column(
        Integer,
        ForeignKey("teachers.id"),
        nullable=True,
    )

    topic_id = Column(
        Integer,
        ForeignKey("syllabus_topics.id"),
        nullable=True,
    )

    subtopic_id = Column(
        Integer,
        ForeignKey("syllabus_subtopics.id"),
        nullable=True,
    )

    question = Column(
        Text,
        nullable=False,
    )

    status = Column(
        String(30),
        nullable=False,
        default="pending",
    )

    created_at = Column(
        DateTime,
        nullable=False,
    )

    updated_at = Column(
        DateTime,
        nullable=True,
    )

    is_anonymous_to_teacher = Column(
        Boolean,
        nullable=False,
        default=True,
    )


class DoubtSubtopic(Base):

    __tablename__ = "doubt_subtopics"

    __table_args__ = (
        UniqueConstraint(
            "doubt_id",
            "subtopic_id",
            name="uq_doubt_subtopic",
        ),
    )

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    doubt_id = Column(
        Integer,
        ForeignKey("doubts.id"),
        nullable=False,
    )

    subtopic_id = Column(
        Integer,
        ForeignKey("syllabus_subtopics.id"),
        nullable=False,
    )


class DoubtAnswer(Base):

    __tablename__ = "doubt_answers"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    doubt_id = Column(
        Integer,
        ForeignKey("doubts.id"),
        nullable=False,
    )

    teacher_id = Column(
        Integer,
        ForeignKey("teachers.id"),
        nullable=False,
    )

    answer_text = Column(
        Text,
        nullable=False,
    )

    resource_url = Column(
        String(1000),
        nullable=True,
    )

    created_at = Column(
        DateTime,
        nullable=False,
    )


class Attachment(Base):

    __tablename__ = "attachments"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    doubt_id = Column(
        Integer,
        ForeignKey("doubts.id"),
        nullable=False,
    )

    original_filename = Column(
        String(255),
        nullable=False,
    )

    stored_filename = Column(
        String(255),
        nullable=False,
    )

    mime_type = Column(
        String(100),
        nullable=False,
    )

    file_size = Column(
        Integer,
        nullable=False,
    )

    storage_path = Column(
        String(1000),
        nullable=False,
    )

    uploaded_at = Column(
        DateTime,
        nullable=False,
    )