from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from app.database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    student_code = Column(String(50), nullable=False, unique=True)  # college/student ID
    full_name = Column(String(150), nullable=False)
    email = Column(String(255), nullable=True, unique=True)
    password_hash = Column(String(255), nullable=True)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)


class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    teacher_code = Column(String(50), nullable=False, unique=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(255), nullable=True, unique=True)
    password_hash = Column(String(255), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
