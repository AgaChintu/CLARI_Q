from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, UniqueConstraint
from app.database import Base


class AcademicYear(Base):
    __tablename__ = "academic_years"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(30), nullable=False, unique=True)  # e.g. First Year
    year_number = Column(Integer, nullable=False, unique=True)  # 1, 2


class Semester(Base):
    __tablename__ = "semesters"
    __table_args__ = (UniqueConstraint("academic_year_id", "semester_number", name="uq_year_semester"),)

    id = Column(Integer, primary_key=True, index=True)
    academic_year_id = Column(Integer, ForeignKey("academic_years.id"), nullable=False)
    semester_number = Column(Integer, nullable=False)  # 1 to 4
    name = Column(String(30), nullable=False)  # Semester I, etc.


class SectionGroup(Base):
    __tablename__ = "section_groups"

    id = Column(Integer, primary_key=True, index=True)
    academic_year_id = Column(Integer, ForeignKey("academic_years.id"), nullable=False)
    code = Column(String(50), nullable=False, unique=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)


class Section(Base):
    __tablename__ = "sections"
    __table_args__ = (UniqueConstraint("academic_year_id", "code", name="uq_year_section"),)

    id = Column(Integer, primary_key=True, index=True)
    academic_year_id = Column(Integer, ForeignKey("academic_years.id"), nullable=False)
    code = Column(String(30), nullable=False)  # AIML, CS1, 2-AIML, etc.
    name = Column(String(100), nullable=False)


class SectionGroupMember(Base):
    __tablename__ = "section_group_members"
    __table_args__ = (UniqueConstraint("section_group_id", "section_id", name="uq_group_section"),)

    id = Column(Integer, primary_key=True, index=True)
    section_group_id = Column(Integer, ForeignKey("section_groups.id"), nullable=False)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=False)


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(30), nullable=True, unique=True)
    name = Column(String(150), nullable=False)
    subject_type = Column(String(30), nullable=True)  # theory, lab, etc.
    description = Column(Text, nullable=True)


class SubjectOffering(Base):
    """
    Connects a subject to a semester and a section group.
    Use a shared group for subjects common to multiple branches.
    """
    __tablename__ = "subject_offerings"
    __table_args__ = (
        UniqueConstraint("semester_id", "section_group_id", "subject_id", name="uq_subject_offering"),
    )

    id = Column(Integer, primary_key=True, index=True)
    semester_id = Column(Integer, ForeignKey("semesters.id"), nullable=False)
    section_group_id = Column(Integer, ForeignKey("section_groups.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    lecture_hours = Column(Integer, nullable=True)
    tutorial_hours = Column(Integer, nullable=True)
    practical_hours = Column(Integer, nullable=True)


class SyllabusUnit(Base):
    __tablename__ = "syllabus_units"
    __table_args__ = (UniqueConstraint("subject_id", "unit_number", name="uq_subject_unit"),)

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    unit_number = Column(Integer, nullable=False)
    unit_name = Column(String(255), nullable=False)
    proposed_lectures = Column(Integer, nullable=True)


class SyllabusTopic(Base):
    __tablename__ = "syllabus_topics"

    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("syllabus_units.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    display_order = Column(Integer, nullable=False, default=1)


class SyllabusSubtopic(Base):
    __tablename__ = "syllabus_subtopics"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("syllabus_topics.id"), nullable=False)
    name = Column(String(255), nullable=False)
    display_order = Column(Integer, nullable=False, default=1)


class CourseOutcome(Base):
    __tablename__ = "course_outcomes"
    __table_args__ = (UniqueConstraint("subject_id", "co_number", name="uq_subject_co"),)

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    co_number = Column(Integer, nullable=False)
    description = Column(Text, nullable=False)
    bloom_levels = Column(String(50), nullable=True)


class Textbook(Base):
    __tablename__ = "textbooks"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    title = Column(String(500), nullable=False)
    authors = Column(String(500), nullable=True)
    publisher = Column(String(255), nullable=True)
    edition = Column(String(100), nullable=True)
    book_type = Column(String(30), nullable=True)  # textbook / reference
    display_order = Column(Integer, nullable=False, default=1)
