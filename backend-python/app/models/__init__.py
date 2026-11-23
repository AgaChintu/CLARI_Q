# Import every model here so SQLAlchemy registers
# all tables before create_all().

from app.models.academic import (
    AcademicYear,
    Semester,
    SectionGroup,
    Section,
    SectionGroupMember,
    Subject,
    SubjectOffering,
    SyllabusUnit,
    SyllabusTopic,
    SyllabusSubtopic,
    CourseOutcome,
    Textbook,
)

from app.models.user import (
    Student,
    Teacher,
)

from app.models.assignment import (
    TeacherAssignment,
)

from app.models.session import (
    DoubtSession,
    SessionTopic,
    SessionDoubt,
)

from app.models.doubt import (
    Doubt,
    DoubtSubtopic,
    DoubtAnswer,
    Attachment,
)

from app.models.library import (
    LibraryEntry,
    SavedEntry,
)