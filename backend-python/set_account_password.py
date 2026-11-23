from getpass import getpass

from app.database import SessionLocal
from app.models.user import Student, Teacher
from app.security import hash_password


def main():

    db = SessionLocal()

    try:

        print("\nCLARIQ ACCOUNT PASSWORD SETUP")
        print("-----------------------------")

        role = input("Account type (student/teacher): ").strip().lower()

        if role == "student":
            college_id = input("Student College ID: ").strip()

            user = db.query(Student).filter(
                Student.student_code == college_id
            ).first()

        elif role == "teacher":
            college_id = input("Teacher College ID: ").strip()

            user = db.query(Teacher).filter(
                Teacher.teacher_code == college_id
            ).first()

        else:
            print("Invalid account type.")
            return

        if not user:
            print("Account not found.")
            return

        password = getpass("Enter new password: ")
        confirm = getpass("Confirm password: ")

        if len(password) < 8:
            print("Password must contain at least 8 characters.")
            return

        if password != confirm:
            print("Passwords do not match.")
            return

        user.password_hash = hash_password(password)

        db.commit()

        print("\nPassword successfully updated!")
        print("College ID:", college_id)

    except Exception as error:

        db.rollback()
        print("Error:", error)

    finally:

        db.close()


if __name__ == "__main__":
    main()