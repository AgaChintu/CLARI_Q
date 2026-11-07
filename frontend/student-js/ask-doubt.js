// ==========================================
// 1. GET HTML ELEMENTS
// ==========================================

const doubtTextarea = document.querySelector(".type-doubt textarea");
const characterCount = document.querySelector(".character-count");

const topicInput = document.querySelector(".topic-input input");

const subjectSelect = document.querySelector(".select-subj");

const teacherSection = document.querySelector(".teacher-section");
const teacherSelect = document.querySelector(".select-teacher");

const tagInput = document.querySelector(".tag-input input");
const selectedTags = document.querySelector(".selected-tags");

const attachmentInput = document.getElementById("attachment");
const attachmentPreviewList = document.querySelector(".attachment-preview-list");

const submitButton = document.querySelector(".submit-button");


// ==========================================
// 2. CURRENT STUDENT INFORMATION
// ==========================================

// Temporary prototype values.
// Later, these will come from the logged-in student's profile.

const CURRENT_STUDENT_ID =
    localStorage.getItem("clariqStudentId") || "S001";

const CURRENT_STUDENT_CLASS_ID =
    localStorage.getItem("clariqStudentClass") || "2-AIML";


// ==========================================
// 3. TEACHER DATABASE
// ==========================================

// Each teacher has:
// - Unique ID
// - Name
// - Subjects taught
// - Classes assigned to them

const teachers = [

    {
        id: "T001",
        name: "Dr. Dhaka",
        subjects: ["DSA"],
        assignedClasses: ["2-AIML"]
    },

    {
        id: "T002",
        name: "Prof. Vivek Shukla",
        subjects: ["Python"],
        assignedClasses: ["2-AIML", "2-CSE"]
    },

    {
        id: "T003",
        name: "Prof. Juhi",
        subjects: ["Python"],
        assignedClasses: ["1-AIML", "2-CSE"]
    },

    {
        id: "T004",
        name: "Prof. Kamlendra",
        subjects: ["DSTL"],
        assignedClasses: ["2-AIML"]
    },

    {
        id: "T005",
        name: "Dr. Rohan Mehta",
        subjects: ["DSTL"],
        assignedClasses: ["2-CSE"]
    },

    {
        id: "T006",
        name: "Prof. Kamran",
        subjects: ["COA"],
        assignedClasses: ["2-AIML"]
    },

    {
        id: "T007",
        name: "Prof. Nurmesh",
        subjects: ["COA"],
        assignedClasses: ["2-CSE"]
    },

    {
        id: "T008",
        name: "Dr. Ruchi Shah",
        subjects: ["TC"],
        assignedClasses: ["2-AIML"]
    },

    {
        id: "T009",
        name: "Prof. Neha Kapoor",
        subjects: ["TC"],
        assignedClasses: ["2-CSE"]
    },

    {
        id: "T010",
        name: "Prof. Nipun Pande",
        subjects: ["DE"],
        assignedClasses: ["2-AIML"]
    },

    {
        id: "T011",
        name: "Prof. Arvind Rao",
        subjects: ["DE"],
        assignedClasses: ["2-CSE"]
    }

];


// ==========================================
// 4. CLASS-SUBJECT-TEACHER MAPPING
// ==========================================

// Determines the regular teacher for each
// subject in a particular class.

const classSubjectTeachers = {

    "2-AIML": {
        DSA: "T001",
        Python: "T002",
        DSTL: "T004",
        COA: "T006",
        TC: "T008",
        DE: "T010"
    },

    "2-CSE": {
        Python: "T002"
    }

};


// ==========================================
// 5. SUBJECT MAPPING
// ==========================================

const subjectMap = {

    "Data Structure (DS)": "DSA",

    "Computer Organization and Architecture (COA)": "COA",

    "Discrete Structure & Theory of Logic (DSTL)": "DSTL",

    "Digital Electronics(DE)": "DE",

    "Python": "Python",

    "Technical Communication(TC)": "TC"

};


// ==========================================
// 6. CHARACTER COUNT
// ==========================================

doubtTextarea.addEventListener("input", () => {

    characterCount.textContent =
        `${doubtTextarea.value.length}/1000`;

});


// ==========================================
// 7. TEACHER SELECTION
// ==========================================

let defaultTeacherId = null;


// Get regular teacher for the student's class

function getDefaultTeacher(subject) {

    const classTeachers =
        classSubjectTeachers[CURRENT_STUDENT_CLASS_ID];

    if (!classTeachers) return null;

    const teacherId = classTeachers[subject];

    return teachers.find(teacher => teacher.id === teacherId) || null;

}


// Get all other teachers who teach the selected subject

function getAlternativeTeachers(subject, defaultTeacher) {

    return teachers.filter(teacher => {

        return (
            teacher.subjects.includes(subject) &&
            teacher.id !== defaultTeacher.id
        );

    });

}


// Populate teacher dropdown

function updateTeacherDropdown(subject) {

    const defaultTeacher = getDefaultTeacher(subject);

    teacherSelect.innerHTML = "";

    defaultTeacherId = null;


    // No regular teacher found

    if (!defaultTeacher) {

        teacherSection.hidden = true;

        alert("No regular teacher is currently assigned to this subject.");

        return;

    }


    defaultTeacherId = defaultTeacher.id;


    // Add default teacher

    const defaultOption = document.createElement("option");

    defaultOption.value = defaultTeacher.id;
    defaultOption.textContent = defaultTeacher.name;

    teacherSelect.appendChild(defaultOption);


    // Add alternative teachers

    const alternativeTeachers =
        getAlternativeTeachers(subject, defaultTeacher);

    alternativeTeachers.forEach(teacher => {

        const option = document.createElement("option");

        option.value = teacher.id;
        option.textContent = teacher.name;

        teacherSelect.appendChild(option);

    });


    // Automatically select regular teacher

    teacherSelect.value = defaultTeacher.id;


    // Show teacher section

    teacherSection.hidden = false;

}


// Update teacher list whenever subject changes

subjectSelect.addEventListener("change", () => {

    const selectedSubject = subjectMap[subjectSelect.value];

    if (!selectedSubject) {

        teacherSection.hidden = true;

        return;

    }

    updateTeacherDropdown(selectedSubject);

});


// ==========================================
// 8. TAG FUNCTIONALITY
// ==========================================

let tags = [];


function addTag(value) {

    const tag = value.trim().replace(/,$/, "");

    if (!tag) return;


    // Prevent duplicate tags

    const alreadyExists = tags.some(
        existingTag => existingTag.toLowerCase() === tag.toLowerCase()
    );

    if (alreadyExists) {

        tagInput.value = "";

        return;

    }


    tags.push(tag);

    renderTags();

    tagInput.value = "";

}


function renderTags() {

    selectedTags.innerHTML = "";

    tags.forEach((tag, index) => {

        const tagElement = document.createElement("span");
        tagElement.className = "tag";


        // Tag text

        const tagText = document.createElement("span");
        tagText.textContent = tag;


        // Remove button

        const removeButton = document.createElement("button");

        removeButton.type = "button";
        removeButton.className = "remove-tag";
        removeButton.setAttribute("aria-label", `Remove ${tag}`);

        removeButton.innerHTML = `<i data-lucide="x"></i>`;


        removeButton.addEventListener("click", () => {

            tagElement.classList.add("tag-removing");

            setTimeout(() => {

                tags.splice(index, 1);

                renderTags();

            }, 200);

        });


        tagElement.appendChild(tagText);
        tagElement.appendChild(removeButton);

        selectedTags.appendChild(tagElement);

    });

    lucide.createIcons();

}


// Add tag on Enter or comma

tagInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter" || event.key === ",") {

        event.preventDefault();

        addTag(tagInput.value);

    }

});


// ==========================================
// 9. ATTACHMENT FUNCTIONALITY
// ==========================================

let selectedFiles = [];

const allowedTypes = [
    "image/png",
    "image/jpeg",
    "application/pdf"
];

const maxSize = 10 * 1024 * 1024;


// Format file size

function formatFileSize(bytes) {

    if (bytes < 1024 * 1024) {

        return `${(bytes / 1024).toFixed(1)} KB`;

    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

}


// ==========================================
// 10. STORE ACTUAL FILES IN INDEXEDDB
// ==========================================

// localStorage is suitable for doubt information, but not for file contents.
// IndexedDB stores the actual image/PDF files separately.

const DB_NAME = "ClariQFiles";
const DB_VERSION = 1;
const FILE_STORE = "attachments";

function openAttachmentDB() {

    return new Promise((resolve, reject) => {

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {

            const db = request.result;

            if (!db.objectStoreNames.contains(FILE_STORE)) {

                db.createObjectStore(FILE_STORE, { keyPath: "fileId" });

            }

        };

        request.onsuccess = () => resolve(request.result);

        request.onerror = () => reject(request.error);

    });

}


async function saveAttachment(fileId, file, doubtId) {

    const db = await openAttachmentDB();

    return new Promise((resolve, reject) => {

        const transaction = db.transaction(FILE_STORE, "readwrite");

        const store = transaction.objectStore(FILE_STORE);

        store.put({

            fileId,
            doubtId,
            name: file.name,
            type: file.type,
            size: file.size,
            blob: file

        });

        transaction.oncomplete = () => {

            db.close();

            resolve();

        };

        transaction.onerror = () => {

            db.close();

            reject(transaction.error);

        };

        transaction.onabort = () => {

            db.close();

            reject(transaction.error || new Error("File storage was interrupted."));

        };

    });

}


// Handle file selection

attachmentInput.addEventListener("change", () => {

    const files = Array.from(attachmentInput.files);

    files.forEach(file => {


        // Check file type

        if (!allowedTypes.includes(file.type)) {

            alert(`${file.name} is not supported. Please select PNG, JPG or PDF.`);

            return;

        }


        // Check file size

        if (file.size > maxSize) {

            alert(`${file.name} exceeds the 10 MB limit.`);

            return;

        }


        // Prevent duplicates

        const alreadyExists = selectedFiles.some(
            existingFile =>
                existingFile.name === file.name &&
                existingFile.size === file.size &&
                existingFile.lastModified === file.lastModified
        );

        if (alreadyExists) return;


        selectedFiles.push(file);

    });


    renderAttachments();

    // Allows the same file to be selected again after removal

    attachmentInput.value = "";

});


// ==========================================
// 11. RENDER ATTACHMENT CAPSULES
// ==========================================

function renderAttachments() {

    attachmentPreviewList.innerHTML = "";

    selectedFiles.forEach((file, index) => {

        const capsule = document.createElement("div");

        capsule.className = "attachment-preview";


        // File icon

        const icon = document.createElement("span");

        icon.className = "attachment-icon";

        const iconName = file.type === "application/pdf"
            ? "file-text"
            : "image";

        icon.innerHTML = `<i data-lucide="${iconName}"></i>`;


        // File name and size

        const details = document.createElement("div");

        details.className = "attachment-details";

        const fileName = document.createElement("span");

        fileName.className = "attachment-name";

        fileName.textContent = file.name;

        fileName.title = file.name;

        const fileSize = document.createElement("span");

        fileSize.className = "attachment-size";

        fileSize.textContent = formatFileSize(file.size);

        details.appendChild(fileName);

        details.appendChild(fileSize);


        // Remove button

        const removeButton = document.createElement("button");

        removeButton.type = "button";

        removeButton.className = "remove-attachment";

        removeButton.setAttribute("aria-label", `Remove ${file.name}`);

        removeButton.innerHTML = `<i data-lucide="x"></i>`;


        removeButton.addEventListener("click", () => {

            capsule.classList.add("attachment-removing");

            setTimeout(() => {

                selectedFiles.splice(index, 1);

                renderAttachments();

            }, 200);

        });


        // Assemble capsule

        capsule.appendChild(icon);

        capsule.appendChild(details);

        capsule.appendChild(removeButton);

        attachmentPreviewList.appendChild(capsule);

    });

    lucide.createIcons();

}

// ==========================================
// 12. GENERATE DOUBT ID
// ==========================================

function generateDoubtId(doubts) {

    const sampleIds = [
        101, 102, 103, 104, 105,
        106, 107, 108, 109, 112
    ];

    const allIds = [
        ...doubts.map(doubt => Number(doubt.id) || 0),
        ...sampleIds
    ];

    return Math.max(...allIds, 100) + 1;

}


// ==========================================
// 13. SUBMIT DOUBT
// ==========================================

submitButton.addEventListener("click", async (event) => {

    event.preventDefault();


    // Get input values

    const question = doubtTextarea.value.trim();

    const topic = topicInput.value.trim();

    const selectedSubject = subjectSelect.value;

    const subject = subjectMap[selectedSubject];

    const selectedTeacherId = teacherSelect.value;


    // --------------------------------------
    // VALIDATE QUESTION
    // --------------------------------------

    if (!question) {

        alert("Please enter your doubt first.");

        doubtTextarea.focus();

        return;

    }


    // --------------------------------------
    // VALIDATE TOPIC
    // --------------------------------------

    if (!topic) {

        alert("Please enter the topic of your doubt.");

        topicInput.focus();

        return;

    }


    // --------------------------------------
    // VALIDATE SUBJECT
    // --------------------------------------

    if (!subject) {

        alert("Please select a subject.");

        subjectSelect.focus();

        return;

    }


    // --------------------------------------
    // VALIDATE TEACHER
    // --------------------------------------

    const selectedTeacher = teachers.find(
        teacher => teacher.id === selectedTeacherId
    );

    if (!selectedTeacher) {

        alert("Please select a teacher.");

        teacherSelect.focus();

        return;

    }


    // --------------------------------------
    // LOAD EXISTING DOUBTS
    // --------------------------------------

    let doubts = JSON.parse(
        localStorage.getItem("clariqDoubts") || "[]"
    );

    if (!Array.isArray(doubts)) {

        doubts = [];

    }


    // --------------------------------------
    // DETERMINE TEACHER ROUTE
    // --------------------------------------

    const teacherRoute =
        selectedTeacherId === defaultTeacherId
            ? "regular"
            : "alternative";


    // --------------------------------------
    // CREATE NEW DOUBT
    // --------------------------------------

    const doubtId = generateDoubtId(doubts);

    const createdAt = new Date().toISOString();

    // Give every attachment a stable ID so the details page can retrieve
    // the actual file from IndexedDB later.

    const attachmentRecords = selectedFiles.map((file, index) => ({

        fileId: `doubt-${doubtId}-${Date.now()}-${index}`,

        name: file.name,

        type: file.type,

        size: file.size

    }));


    const newDoubt = {

        id: doubtId,

        studentId: CURRENT_STUDENT_ID,

        classId: CURRENT_STUDENT_CLASS_ID,

        title: question
            .replace(/\s+/g, " ")
            .split(/[.!?]/)[0]
            .trim()
            .slice(0, 60) || "Untitled Doubt",

        topic: topic,

        subject: subject,

        question: question,

        teacherId: selectedTeacher.id,

        teacherName: selectedTeacher.name,

        teacherRoute: teacherRoute,

        tags: [...tags],

        status: "pending",

        createdAt: createdAt,

        attachments: attachmentRecords

    };


    // --------------------------------------
    // SAVE ACTUAL FILES FIRST
    // --------------------------------------

    submitButton.disabled = true;

    try {

        for (let index = 0; index < selectedFiles.length; index++) {

            await saveAttachment(
                attachmentRecords[index].fileId,
                selectedFiles[index],
                doubtId
            );

        }


        // Save doubt information only after its files are safely stored.

        doubts.push(newDoubt);

        localStorage.setItem(
            "clariqDoubts",
            JSON.stringify(doubts)
        );

    } catch (error) {

        console.error("Could not save doubt attachments:", error);

        alert("Your files could not be saved. Please try again.");

        submitButton.disabled = false;

        return;

    }


    // --------------------------------------
    // SUCCESS
    // --------------------------------------

    alert("Your doubt has been submitted successfully!");

    window.location.href = "my-doubts.html";

});