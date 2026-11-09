// ==========================================
// 1. GET HTML ELEMENTS
// ==========================================

const titleTextarea = document.querySelector(".title-textarea");

const descriptionTextarea =
    document.querySelector(".description-textarea");

const characterCount =
    document.querySelector(".character-count");

const subjectSelect =
    document.querySelector(".select-subj");

const teacherSection =
    document.querySelector(".teacher-section");

const teacherSelect =
    document.querySelector(".select-teacher");


// Topic elements

const topicSearchInput =
    document.querySelector(".topic-search-input");

const topicOptions =
    document.querySelector(".topic-options");

const topicChips =
    document.querySelector(".topic-chips");


const attachmentInput =
    document.getElementById("attachment");

const attachmentPreviewList =
    document.querySelector(".attachment-preview-list");

const submitButton =
    document.querySelector(".submit-button");


// ==========================================
// 2. CURRENT STUDENT INFORMATION
// ==========================================

const CURRENT_STUDENT_ID =
    localStorage.getItem("clariqStudentId") || "S001";

const CURRENT_STUDENT_CLASS_ID =
    localStorage.getItem("clariqStudentClass") || "2-AIML";


const academicContext =
    getClariQAcademicContext(CURRENT_STUDENT_CLASS_ID);


// ==========================================
// 3. TEACHER DATABASE
// ==========================================

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
    },

    {
        id: "T012",
        name: "Assigned PPS Faculty",
        subjects: ["PPS"],
        assignedClasses: ["1-AIML", "1-CSE"]
    }

];


// ==========================================
// 4. CLASS-SUBJECT-TEACHER MAPPING
// ==========================================

const classSubjectTeachers = {

    "1-AIML": {
        PPS: "T012"
    },

    "1-CSE": {
        PPS: "T012"
    },

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

let subjectMap = {};


function populateSubjectDropdown() {

    const availableSubjects =
        getClariQSubjects(CURRENT_STUDENT_CLASS_ID);

    subjectSelect.innerHTML = `
        <option value="" disabled selected>
            Select subject
        </option>
    `;

    availableSubjects.forEach(subject => {

        const option = document.createElement("option");

        option.value = subject.id;

        option.textContent = subject.name;

        subjectSelect.appendChild(option);

        subjectMap[subject.id] = subject.id;

    });

}


populateSubjectDropdown();


// ==========================================
// 6. CHARACTER COUNT
// ==========================================

descriptionTextarea.addEventListener("input", () => {

    characterCount.textContent =
        `${descriptionTextarea.value.length}/1000`;

});


// ==========================================
// 7. TEACHER SELECTION
// ==========================================

let defaultTeacherId = null;


function getDefaultTeacher(subject) {

    const classTeachers =
        classSubjectTeachers[CURRENT_STUDENT_CLASS_ID];

    if (!classTeachers) return null;

    const teacherId = classTeachers[subject];

    return teachers.find(
        teacher => teacher.id === teacherId
    ) || null;

}


function getAlternativeTeachers(subject, defaultTeacher) {

    return teachers.filter(teacher => {

        return (
            teacher.subjects.includes(subject) &&
            teacher.id !== defaultTeacher.id
        );

    });

}


function updateTeacherDropdown(subject) {

    const defaultTeacher = getDefaultTeacher(subject);

    teacherSelect.innerHTML = "";

    defaultTeacherId = null;


    if (!defaultTeacher) {

        teacherSection.hidden = true;

        alert(
            "No regular teacher is currently assigned to this subject."
        );

        return;

    }


    defaultTeacherId = defaultTeacher.id;


    const defaultOption = document.createElement("option");

    defaultOption.value = defaultTeacher.id;

    defaultOption.textContent = defaultTeacher.name;

    teacherSelect.appendChild(defaultOption);


    const alternativeTeachers =
        getAlternativeTeachers(subject, defaultTeacher);

    alternativeTeachers.forEach(teacher => {

        const option = document.createElement("option");

        option.value = teacher.id;

        option.textContent = teacher.name;

        teacherSelect.appendChild(option);

    });


    teacherSelect.value = defaultTeacher.id;

    teacherSection.hidden = false;

}


// ==========================================
// 8. UNIFIED TOPIC SELECTION STATE
// ==========================================

let availableTopicItems = [];

let selectedTopicItems = [];


// ==========================================
// 9. NORMALIZE TOPIC DATA
// ==========================================

function normalizeTopic(topic) {

    if (typeof topic === "string") {

        return {
            id: topic,
            name: topic
        };

    }

    return {
        id: String(topic.id),
        name: topic.name
    };

}


// ==========================================
// 10. BUILD UNIFIED SEARCHABLE COLLECTION
// ==========================================

function buildTopicItems(topics) {

    const items = [];

    topics.forEach(rawTopic => {

        const topic = normalizeTopic(rawTopic);


        // Add main topic.

        items.push({

            id: topic.id,

            name: topic.name,

            type: "topic",

            topicId: topic.id,

            topicName: topic.name

        });


        // Get its subtopics.

        const subtopics = getClariQSubtopics(
            CURRENT_STUDENT_CLASS_ID,
            subjectSelect.value,
            topic.id
        );


        subtopics.forEach(rawSubtopic => {

            const subtopic = normalizeTopic(rawSubtopic);


            items.push({

                id: subtopic.id,

                name: subtopic.name,

                type: "subtopic",

                topicId: topic.id,

                topicName: topic.name

            });

        });

    });


    return items;

}


// ==========================================
// 11. DROPDOWN HELPERS
// ==========================================

function closeTopicDropdown() {

    topicOptions.hidden = true;

}


function openTopicDropdown() {

    if (topicSearchInput.disabled) return;

    topicOptions.hidden = false;

    renderTopicOptions();

}


// ==========================================
// 12. TOPIC SEARCH INPUT
// ==========================================

function updateTopicPlaceholder() {

    if (selectedTopicItems.length > 0) {

        topicSearchInput.placeholder = "";

    } else {

        topicSearchInput.placeholder = "Search topics...";

    }

}


topicSearchInput.addEventListener("focus", () => {

    openTopicDropdown();

});


topicSearchInput.addEventListener("input", () => {

    updateTopicPlaceholder();

    openTopicDropdown();

});


// Close dropdown when clicking outside.

document.addEventListener("click", event => {

    if (!event.target.closest(".topic-search-wrapper")) {

        closeTopicDropdown();

    }

});


// ==========================================
// 13. RESET TOPIC SELECTION
// ==========================================

function resetTopicSelection() {

    availableTopicItems = [];

    selectedTopicItems = [];


    topicOptions.innerHTML = "";

    topicChips.innerHTML = "";


    topicSearchInput.value = "";

    topicSearchInput.disabled = true;

    topicSearchInput.placeholder = "Select a subject first";


    closeTopicDropdown();

}


// ==========================================
// 14. UPDATE TOPIC COLLECTION
// ==========================================

function updateTopicDropdown(subjectId) {

    resetTopicSelection();


    const topics = getClariQTopics(
        CURRENT_STUDENT_CLASS_ID,
        subjectId
    );


    availableTopicItems = buildTopicItems(topics);


    if (!availableTopicItems.length) {

        topicSearchInput.placeholder = "No topics available";

        return;

    }


    topicSearchInput.disabled = false;

    topicSearchInput.placeholder = "Search topics...";

}


// ==========================================
// 15. RENDER SEARCH RESULTS
// ==========================================

function renderTopicOptions() {

    topicOptions.innerHTML = "";


    const searchTerm =
        topicSearchInput.value.trim().toLowerCase();


    const filteredItems = availableTopicItems.filter(item => {

        const alreadySelected = selectedTopicItems.some(
            selected =>
                selected.type === item.type &&
                selected.id === item.id &&
                selected.topicId === item.topicId
        );


        return (
            !alreadySelected &&
            item.name.toLowerCase().includes(searchTerm)
        );

    });


    if (!filteredItems.length) {

        const emptyMessage = document.createElement("div");

        emptyMessage.className = "multi-select-empty";

        emptyMessage.textContent =
            searchTerm
                ? "No matching topics found."
                : "All available topics have been selected.";


        topicOptions.appendChild(emptyMessage);

        return;

    }


    filteredItems.forEach(item => {

        const option = document.createElement("button");

        option.type = "button";

        option.className = "multi-select-option";


        const label = document.createElement("span");

        label.textContent = item.name;


        option.appendChild(label);


        option.addEventListener("click", () => {

            selectTopicItem(item);

        });


        topicOptions.appendChild(option);

    });

}


// ==========================================
// 16. SELECT TOPIC OR SUBTOPIC
// ==========================================

function selectTopicItem(item) {

    const alreadySelected = selectedTopicItems.some(selected => {

        return (
            selected.type === item.type &&
            selected.id === item.id &&
            selected.topicId === item.topicId
        );

    });


    if (alreadySelected) return;


    selectedTopicItems.push({

        id: item.id,

        name: item.name,

        type: item.type,

        topicId: item.topicId,

        topicName: item.topicName

    });


    topicSearchInput.value = "";

    updateTopicPlaceholder();

    renderTopicChips();

    renderTopicOptions();


    // Keep dropdown open after selection.

    topicOptions.hidden = false;

}


// ==========================================
// 17. REMOVE SELECTED ITEM
// ==========================================

function removeTopicItem(item) {

    selectedTopicItems = selectedTopicItems.filter(selected => {

        return !(
            selected.type === item.type &&
            selected.id === item.id &&
            selected.topicId === item.topicId
        );

    });


    renderTopicChips();

    updateTopicPlaceholder();

    renderTopicOptions();

}


// ==========================================
// 18. RENDER SELECTED CHIPS
// ==========================================

function renderTopicChips() {

    topicChips.innerHTML = "";


    selectedTopicItems.forEach(item => {

        const chip = document.createElement("div");

        chip.className = "selection-chip";


        const label = document.createElement("span");

        label.className = "selection-chip-text";

        label.textContent = item.name;


        const removeButton = document.createElement("button");

        removeButton.type = "button";

        removeButton.className = "remove-selection";

        removeButton.setAttribute(
            "aria-label",
            `Remove ${item.name}`
        );

        removeButton.innerHTML = `<i data-lucide="x"></i>`;


        removeButton.addEventListener("click", () => {

            removeTopicItem(item);

        });


        chip.appendChild(label);

        chip.appendChild(removeButton);

        topicChips.appendChild(chip);

    });


    lucide.createIcons();

}


// ==========================================
// 19. SUBJECT CHANGE
// ==========================================

subjectSelect.addEventListener("change", () => {

    const selectedSubject = subjectSelect.value;

    updateTeacherDropdown(selectedSubject);

    updateTopicDropdown(selectedSubject);

});


// Initial dropdown state.

resetTopicSelection();


// ==========================================
// 20. ATTACHMENT FUNCTIONALITY
// ==========================================

let selectedFiles = [];

const allowedTypes = [
    "image/png",
    "image/jpeg",
    "application/pdf"
];

const maxSize = 10 * 1024 * 1024;


function formatFileSize(bytes) {

    if (bytes < 1024 * 1024) {

        return `${(bytes / 1024).toFixed(1)} KB`;

    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

}


// ==========================================
// 21. STORE ACTUAL FILES IN INDEXEDDB
// ==========================================

const DB_NAME = "ClariQFiles";

const DB_VERSION = 1;

const FILE_STORE = "attachments";


function openAttachmentDB() {

    return new Promise((resolve, reject) => {

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {

            const db = request.result;

            if (!db.objectStoreNames.contains(FILE_STORE)) {

                db.createObjectStore(FILE_STORE, {
                    keyPath: "fileId"
                });

            }

        };

        request.onsuccess = () => resolve(request.result);

        request.onerror = () => reject(request.error);

    });

}


async function saveAttachment(fileId, file, doubtId) {

    const db = await openAttachmentDB();

    return new Promise((resolve, reject) => {

        const transaction =
            db.transaction(FILE_STORE, "readwrite");

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

            reject(
                transaction.error ||
                new Error("File storage was interrupted.")
            );

        };

    });

}


// ==========================================
// 22. HANDLE FILE SELECTION
// ==========================================

attachmentInput.addEventListener("change", () => {

    const files = Array.from(attachmentInput.files);


    files.forEach(file => {

        if (!allowedTypes.includes(file.type)) {

            alert(
                `${file.name} is not supported. Please select PNG, JPG or PDF.`
            );

            return;

        }


        if (file.size > maxSize) {

            alert(`${file.name} exceeds the 10 MB limit.`);

            return;

        }


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

    attachmentInput.value = "";

});


// ==========================================
// 23. RENDER ATTACHMENT CAPSULES
// ==========================================

function renderAttachments() {

    attachmentPreviewList.innerHTML = "";


    selectedFiles.forEach(file => {

        const capsule = document.createElement("div");

        capsule.className = "attachment-preview";


        const icon = document.createElement("span");

        icon.className = "attachment-icon";

        const iconName = file.type === "application/pdf"
            ? "file-text"
            : "image";

        icon.innerHTML = `<i data-lucide="${iconName}"></i>`;


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


        const removeButton = document.createElement("button");

        removeButton.type = "button";

        removeButton.className = "remove-attachment";

        removeButton.setAttribute(
            "aria-label",
            `Remove ${file.name}`
        );

        removeButton.innerHTML = `<i data-lucide="x"></i>`;


        removeButton.addEventListener("click", () => {

            capsule.classList.add("attachment-removing");

            setTimeout(() => {

                selectedFiles = selectedFiles.filter(
                    selectedFile => selectedFile !== file
                );

                renderAttachments();

            }, 200);

        });


        capsule.appendChild(icon);

        capsule.appendChild(details);

        capsule.appendChild(removeButton);

        attachmentPreviewList.appendChild(capsule);

    });


    lucide.createIcons();

}


// ==========================================
// 24. GENERATE DOUBT ID
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
// 25. SUBMIT DOUBT
// ==========================================

submitButton.addEventListener("click", async (event) => {

    event.preventDefault();


    // ======================================
    // GET INPUT VALUES
    // ======================================

    const title = titleTextarea.value.trim();

    const description = descriptionTextarea.value.trim();

    const selectedSubject = subjectSelect.value;

    const subject = subjectMap[selectedSubject];

    const selectedTeacherId = teacherSelect.value;


    // ======================================
    // VALIDATE TITLE
    // ======================================

    if (!title) {

        alert("Please give your doubt a short title.");

        titleTextarea.focus();

        return;

    }


    // ======================================
    // VALIDATE DESCRIPTION
    // ======================================

    if (!description) {

        alert("Please explain your doubt in detail.");

        descriptionTextarea.focus();

        return;

    }


    // ======================================
    // VALIDATE SUBJECT
    // ======================================

    if (!subject) {

        alert("Please select a subject.");

        subjectSelect.focus();

        return;

    }


    // ======================================
    // VALIDATE TEACHER
    // ======================================

    const selectedTeacher = teachers.find(
        teacher => teacher.id === selectedTeacherId
    );


    if (!selectedTeacher) {

        alert("Please select a teacher.");

        teacherSelect.focus();

        return;

    }


    // ======================================
    // GET SELECTED TOPIC DATA
    // ======================================

    const selectedTopics = selectedTopicItems.filter(
        item => item.type === "topic"
    );

    const selectedSubtopics = selectedTopicItems.filter(
        item => item.type === "subtopic"
    );


    const relatedTopicIds = [

        ...new Set([

            ...selectedTopics.map(topic => topic.id),

            ...selectedSubtopics.map(subtopic => subtopic.topicId)

        ])

    ];


    const topicSelections = relatedTopicIds.map(topicId => {

        const parentTopic = availableTopicItems.find(item => {

            return (
                item.type === "topic" &&
                item.id === topicId
            );

        });


        const relatedSubtopics = selectedSubtopics

            .filter(subtopic => subtopic.topicId === topicId)

            .map(subtopic => ({

                subtopicId: subtopic.id,

                subtopicName: subtopic.name

            }));


        return {

            topicId: topicId,

            topicName: parentTopic
                ? parentTopic.name
                : selectedSubtopics.find(
                    item => item.topicId === topicId
                ).topicName,

            subtopics: relatedSubtopics

        };

    });


    const topics = selectedTopics.map(topic => ({

        id: topic.id,

        name: topic.name

    }));


    const subtopics = selectedSubtopics.map(subtopic => ({

        id: subtopic.id,

        name: subtopic.name,

        topicId: subtopic.topicId,

        topicName: subtopic.topicName

    }));


    const firstTopic = selectedTopics[0] || null;

    const firstSubtopic = selectedSubtopics[0] || null;


    // ======================================
    // LOAD EXISTING DOUBTS
    // ======================================

    let doubts = JSON.parse(
        localStorage.getItem("clariqDoubts") || "[]"
    );


    if (!Array.isArray(doubts)) {

        doubts = [];

    }


    // ======================================
    // DETERMINE TEACHER ROUTE
    // ======================================

    const teacherRoute =
        selectedTeacherId === defaultTeacherId
            ? "regular"
            : "alternative";


    // ======================================
    // CREATE NEW DOUBT
    // ======================================

    const doubtId = generateDoubtId(doubts);

    const createdAt = new Date().toISOString();


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

        academicYear: academicContext.academicYear,

        semester: academicContext.semester,

        branch: academicContext.branch,


        title: title,

        description: description,

        question: description,


        subject: subject,

        subjectId: subject,


        topicSelections: topicSelections,

        topics: topics,

        subtopics: subtopics,


        topicId: firstTopic ? firstTopic.id : null,

        topic: firstTopic ? firstTopic.name : null,

        topicName: firstTopic ? firstTopic.name : null,

        subtopic: firstSubtopic ? firstSubtopic.name : null,

        subtopicName: firstSubtopic ? firstSubtopic.name : null,


        teacherId: selectedTeacher.id,

        teacherName: selectedTeacher.name,

        teacherRoute: teacherRoute,


        status: "pending",

        createdAt: createdAt,

        attachments: attachmentRecords

    };


    // ======================================
    // SAVE ACTUAL FILES FIRST
    // ======================================

    submitButton.disabled = true;


    try {

        for (let index = 0; index < selectedFiles.length; index++) {

            await saveAttachment(
                attachmentRecords[index].fileId,
                selectedFiles[index],
                doubtId
            );

        }


        doubts.push(newDoubt);

        localStorage.setItem(
            "clariqDoubts",
            JSON.stringify(doubts)
        );

    } catch (error) {

        console.error(
            "Could not save doubt attachments:",
            error
        );


        alert(
            "Your files could not be saved. Please try again."
        );


        submitButton.disabled = false;

        return;

    }


    // ======================================
    // SUCCESS
    // ======================================

    alert("Your doubt has been submitted successfully!");

    window.location.href = "my-doubts.html";

});s