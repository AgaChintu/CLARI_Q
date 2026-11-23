"""
ClariQ initial database seeder

Run from: backend-python/
Command: python seed_data.py

Seeds:
- Academic years and semesters
- Year 1 and Year 2 sections
- Section groups and memberships
- Year 1 theory subjects and offerings
- Year 2 theory subjects and offerings
- Teacher records
- Teacher assignments

Digital Electronics:
- AKTU Subject Code: BOE310
- Semester: 3

Safe to run more than once.
Does not delete existing records.
"""

from app.database import SessionLocal

from app.models import (
    AcademicYear,
    Semester,
    SectionGroup,
    Section,
    SectionGroupMember,
    Subject,
    SubjectOffering,
    Teacher,
    TeacherAssignment,
)


def get_or_create(db, model, lookup, defaults=None):
    item = db.query(model).filter_by(**lookup).first()

    if item:
        return item, False

    values = dict(lookup)

    if defaults:
        values.update(defaults)

    item = model(**values)
    db.add(item)
    db.flush()

    return item, True


def seed():
    db = SessionLocal()
    counts = {}

    try:

        # ==================================================
        # 1. ACADEMIC YEARS
        # ==================================================

        counts["academic_years"] = 0
        years = {}

        for number in (1, 2):
            year, created = get_or_create(
                db,
                AcademicYear,
                {"year_number": number},
                {"name": f"Year {number}"},
            )

            years[number] = year
            counts["academic_years"] += int(created)

        # ==================================================
        # 2. SEMESTERS
        # ==================================================

        counts["semesters"] = 0
        semesters = {}

        semester_map = {
            1: (1, 2),
            2: (3, 4),
        }

        for year_number, semester_numbers in semester_map.items():

            for number in semester_numbers:
                semester, created = get_or_create(
                    db,
                    Semester,
                    {
                        "academic_year_id": years[year_number].id,
                        "semester_number": number,
                    },
                    {"name": f"Semester {number}"},
                )

                semesters[number] = semester
                counts["semesters"] += int(created)

        # ==================================================
        # 3. SECTIONS
        # ==================================================

        counts["sections"] = 0
        section_records = {}

        section_codes_by_year = {
            1: ("AIML", "CS1", "CS2", "CS3", "IT", "DS"),
            2: ("AIML", "CS1", "CS2", "CS3", "IT", "DS"),
        }

        for year_number, codes in section_codes_by_year.items():

            for code in codes:
                section, created = get_or_create(
                    db,
                    Section,
                    {
                        "academic_year_id": years[year_number].id,
                        "code": code,
                    },
                    {"name": code},
                )

                section_records[(year_number, code)] = section
                counts["sections"] += int(created)

        # ==================================================
        # 4. SECTION GROUPS
        # ==================================================

        counts["section_groups"] = 0
        group_records = {}

        group_definitions = [
            (
                1,
                "Y1_CS",
                "First Year - Computer Science Group",
                ("CS1", "CS2", "CS3"),
            ),
            (
                1,
                "Y1_AIML_IT_DS",
                "First Year - AIML, IT and DS Group",
                ("AIML", "IT", "DS"),
            ),
            (
                2,
                "Y2_COMMON",
                "Second Year - Common Group",
                ("AIML", "CS1", "CS2", "CS3", "IT", "DS"),
            ),
        ]

        for year_number, code, name, members in group_definitions:

            group, created = get_or_create(
                db,
                SectionGroup,
                {"code": code},
                {
                    "academic_year_id": years[year_number].id,
                    "name": name,
                    "description": (
                        "Shared subject group for the listed sections."
                    ),
                },
            )

            group_records[code] = group
            counts["section_groups"] += int(created)

            for section_code in members:

                get_or_create(
                    db,
                    SectionGroupMember,
                    {
                        "section_group_id": group.id,
                        "section_id": section_records[
                            (year_number, section_code)
                        ].id,
                    },
                )

        # ==================================================
        # 5. SUBJECTS
        # ==================================================

        # Only theory subjects. No lab subjects are included.

        first_year_names = [
            "Applied Physics",
            "Applied Mathematics-I",
            "Fundamentals of Electrical Engineering",
            "Programming Languages",
            "Introduction to Indian Knowledge System",
            "Introduction to AI & Prompt Engineering",
            "Applied Chemistry",
            "Fundamentals of Electronics Engineering",
            "Professional Communication & Technical Writing",
            "Fundamentals of Mechanical Engineering",
        ]

        coded_subjects = [
            ("BCS301", "Data Structure", "theory"),
            (
                "BCS302",
                "Computer Organization and Architecture",
                "theory",
            ),
            (
                "BCS303",
                "Discrete Structures & Theory of Logic",
                "theory",
            ),
            ("BOE310", "Digital Electronics", "theory"),
            ("BCC302", "Python Programming", "theory"),
            ("BAS301", "Technical Communication", "theory"),
            ("BCS401", "Operating System", "theory"),
            (
                "BCS402",
                "Theory of Automata and Formal Languages",
                "theory",
            ),
            (
                "BCS403",
                "Object Oriented Programming with Java",
                "theory",
            ),
        ]

        counts["subjects"] = 0
        subjects = {}

        # First-year subjects
        for name in first_year_names:

            subject, created = get_or_create(
                db,
                Subject,
                {"name": name},
                {
                    "code": None,
                    "subject_type": "theory",
                },
            )

            subjects[name] = subject
            counts["subjects"] += int(created)

        # Convert an existing old DE subject code to BOE310.
        # This prevents creating a duplicate Digital Electronics subject.

        old_de_subject = (
            db.query(Subject)
            .filter_by(code="DE")
            .first()
        )

        boe310_subject = (
            db.query(Subject)
            .filter_by(code="BOE310")
            .first()
        )

        if old_de_subject and not boe310_subject:
            old_de_subject.code = "BOE310"
            db.flush()

        # Year 2 subjects with actual subject codes
        for code, name, subject_type in coded_subjects:

            subject, created = get_or_create(
                db,
                Subject,
                {"code": code},
                {
                    "name": name,
                    "subject_type": subject_type,
                },
            )

            subjects[code] = subject
            counts["subjects"] += int(created)

        # ==================================================
        # 6. SUBJECT OFFERINGS
        # ==================================================

        # Semester 1:
        # CS sections receive Physics/Electrical combination.
        # AIML/IT/DS receive Chemistry/Electronics combination.
        #
        # Semester 2:
        # The combinations switch between the two groups.
        #
        # Semester 3:
        # All Year 2 sections share the same subjects.
        # BOE310 Digital Electronics is included here.

        cs_sem1 = (
            "Applied Physics",
            "Applied Mathematics-I",
            "Fundamentals of Electrical Engineering",
            "Programming Languages",
            "Introduction to Indian Knowledge System",
            "Introduction to AI & Prompt Engineering",
        )

        aiml_sem1 = (
            "Applied Chemistry",
            "Applied Mathematics-I",
            "Fundamentals of Electronics Engineering",
            "Programming Languages",
            "Professional Communication & Technical Writing",
            "Fundamentals of Mechanical Engineering",
        )

        cs_sem2 = aiml_sem1
        aiml_sem2 = cs_sem1

        counts["subject_offerings"] = 0

        offering_definitions = [
            ("Y1_CS", 1, cs_sem1),
            ("Y1_AIML_IT_DS", 1, aiml_sem1),

            ("Y1_CS", 2, cs_sem2),
            ("Y1_AIML_IT_DS", 2, aiml_sem2),

            (
                "Y2_COMMON",
                3,
                (
                    "BCS301",
                    "BCS302",
                    "BCS303",
                    "BOE310",
                    "BCC302",
                    "BAS301",
                ),
            ),

            (
                "Y2_COMMON",
                4,
                (
                    "BCS401",
                    "BCS402",
                    "BCS403",
                ),
            ),
        ]

        for group_code, semester_number, subject_keys in offering_definitions:

            group = group_records[group_code]
            semester = semesters[semester_number]

            for subject_key in subject_keys:

                _, created = get_or_create(
                    db,
                    SubjectOffering,
                    {
                        "semester_id": semester.id,
                        "section_group_id": group.id,
                        "subject_id": subjects[subject_key].id,
                    },
                    {},
                )

                counts["subject_offerings"] += int(created)

        # ==================================================
        # 7. TEACHERS
        # ==================================================

        teacher_data = {
            "T001": "Dr. Dhaka",
            "T002": "Prof. Vivek Shukla",
            "T003": "Prof. Juhi",
            "T004": "Prof. Kamlendra",
            "T005": "Dr. Rohan Mehta",
            "T006": "Prof. Kamran",
            "T007": "Prof. Nurmesh",
            "T008": "Dr. Ruchi Shah",
            "T009": "Prof. Neha Kapoor",
            "T010": "Prof. Nipun Pande",
            "T011": "Prof. Arvind Rao",
        }

        counts["teachers"] = 0
        teachers = {}

        for code, full_name in teacher_data.items():

            teacher, created = get_or_create(
                db,
                Teacher,
                {"teacher_code": code},
                {
                    "full_name": full_name,
                    "is_active": True,
                },
            )

            teachers[code] = teacher
            counts["teachers"] += int(created)

        # ==================================================
        # 8. TEACHER ASSIGNMENTS
        # ==================================================

        # Assignments are for Year 2, Semester 3, AIML.
        #
        # There is no primary/alternative teacher distinction.
        # Each assignment represents:
        # teacher + semester + section + subject.

        aiml_year2 = section_records[(2, "AIML")]
        semester_3 = semesters[3]

        assignment_map = [
            ("T001", "BCS301"),
            ("T002", "BCC302"),
            ("T003", "BCC302"),
            ("T004", "BCS303"),
            ("T005", "BCS303"),
            ("T006", "BCS302"),
            ("T007", "BCS302"),
            ("T008", "BAS301"),
            ("T009", "BAS301"),
            ("T010", "BOE310"),
            ("T011", "BOE310"),
        ]

        counts["teacher_assignments"] = 0

        for teacher_code, subject_code in assignment_map:

            _, created = get_or_create(
                db,
                TeacherAssignment,
                {
                    "teacher_id": teachers[teacher_code].id,
                    "semester_id": semester_3.id,
                    "section_id": aiml_year2.id,
                    "subject_id": subjects[subject_code].id,
                },
                {},
            )

            counts["teacher_assignments"] += int(created)

        # ==================================================
        # 9. COMMIT
        # ==================================================

        db.commit()

        print("\nClariQ seed completed successfully!")
        print("\nNew records inserted:")

        for table, count in counts.items():
            print(f"  {table}: {count}")

        print("\nSemester 3 subjects:")

        for code in (
            "BCS301",
            "BCS302",
            "BCS303",
            "BOE310",
            "BCC302",
            "BAS301",
        ):
            print(f"  {code}: {subjects[code].name}")

        print(
            "\nExisting records were kept. "
            "No rows were deleted."
        )

        print(
            "\nSyllabus units/topics and student accounts "
            "have not been fabricated."
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed()