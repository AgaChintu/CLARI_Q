
// =====================================================
// CLARIQ — CREATE / EDIT DOUBT SESSION
// =====================================================


// =====================================================
// 1. CONFIGURATION
// =====================================================

const STORAGE_KEYS = {
    assignments: "clariqTeacherAssignments",
    sessions: "clariqTeacherDoubtSessions"
};


const DEMO_ASSIGNMENTS = [
    {
        assignmentId: "AS001",
        classId: "1-AIML",
        year: "1st Year",
        section: "AIML",
        subjectId: "PPS",
        subjectName: "Programming for Problem Solving"
    },
    {
        assignmentId: "AS002",
        classId: "2-AIML",
        year: "2nd Year",
        section: "AIML",
        subjectId: "Python",
        subjectName: "Python"
    },
    {
        assignmentId: "AS003",
        classId: "2-CSE",
        year: "2nd Year",
        section: "CSE",
        subjectId: "DSA",
        subjectName: "Data Structure"
    }
];


// =====================================================
// 2. DOM ELEMENTS
// =====================================================

const form = document.getElementById("createSessionForm");

const titleInput = document.getElementById("sessionTitle");

const assignmentSelect = document.getElementById("classSubject");

const unitList = document.getElementById("unitList");

const selectedTopicsSummary = document.getElementById(
    "selectedTopicsSummary"
);

const submissionStart = document.getElementById("submissionStart");

const submissionDeadline = document.getElementById(
    "submissionDeadline"
);

const sessionDate = document.getElementById("sessionDate");

const sessionStartTime = document.getElementById("sessionStartTime");

const submitButton = document.getElementById("sessionSubmitButton");


// =====================================================
// 3. STATE
// =====================================================

let currentAssignment = null;

let currentUnits = [];

let selectedTopics = new Set();

let expandedUnits = new Set();

let editingSession = null;

const editSessionId = new URLSearchParams(
    window.location.search
).get("edit");


// =====================================================
// 4. STORAGE HELPERS
// =====================================================

function getStorageData(key, fallback = null) {

    try {

        const storedData = localStorage.getItem(key);

        if (!storedData) return fallback;

        return JSON.parse(storedData);

    } catch (error) {

        console.error(`Error reading ${key}:`, error);

        return fallback;

    }

}


function saveStorageData(key, data) {

    try {

        localStorage.setItem(key, JSON.stringify(data));

        return true;

    } catch (error) {

        console.error(`Error saving ${key}:`, error);

        alert("Unable to save the data. Please try again.");

        return false;

    }

}


// =====================================================
// 5. INITIALIZATION
// =====================================================

document.addEventListener("DOMContentLoaded", initializePage);


function initializePage() {

    const requiredElements = [
        form,
        titleInput,
        assignmentSelect,
        unitList,
        selectedTopicsSummary,
        submissionStart,
        submissionDeadline,
        sessionDate,
        sessionStartTime
    ];


    if (requiredElements.some(element => !element)) {

        console.error(
            "Create Session: Required HTML elements are missing."
        );

        return;

    }


    if (
        typeof getClariQTopics !== "function" ||
        typeof getClariQSubtopics !== "function"
    ) {

        console.error(
            "Create Session: Central syllabus data has not loaded."
        );

        unitList.innerHTML = `
            <div class="empty-topic-state">
                Syllabus data could not be loaded.
            </div>
        `;

        return;

    }


    seedDemoAssignments();

    loadAssignedCombinations();

    setMinimumDates();


    assignmentSelect.addEventListener(
        "change",
        handleAssignmentChange
    );


    form.addEventListener(
        "submit",
        handleSessionCreation
    );


    sessionDate.addEventListener(
        "change",
        updateDateConstraints
    );


    submissionStart.addEventListener(
        "change",
        updateDateConstraints
    );


    if (editSessionId) {

        loadSessionForEditing(editSessionId);

    }


    if (window.lucide) {
        lucide.createIcons();
    }

}


// =====================================================
// 6. DEMO ASSIGNMENTS
// =====================================================

function seedDemoAssignments() {

    const assignments = getStorageData(
        STORAGE_KEYS.assignments
    );


    if (Array.isArray(assignments) && assignments.length > 0) {
        return;
    }


    saveStorageData(
        STORAGE_KEYS.assignments,
        DEMO_ASSIGNMENTS
    );

}


// =====================================================
// 7. LOAD ASSIGNED CLASS-SUBJECT COMBINATIONS
// =====================================================

function loadAssignedCombinations() {

    const assignments = getStorageData(
        STORAGE_KEYS.assignments,
        []
    );


    assignmentSelect.innerHTML = `
        <option value="" disabled selected>
            Select an assigned class and subject
        </option>
    `;


    if (!Array.isArray(assignments) || assignments.length === 0) {

        assignmentSelect.innerHTML = `
            <option value="" disabled selected>
                No assigned classes or subjects available
            </option>
        `;

        return;

    }


    assignments.forEach(assignment => {

        const option = document.createElement("option");

        option.value = assignment.assignmentId;

        option.textContent =
            `${assignment.year} · ${assignment.section} · ${assignment.subjectName}`;

        assignmentSelect.appendChild(option);

    });

}


// =====================================================
// 8. HANDLE ASSIGNMENT CHANGE
// =====================================================

function handleAssignmentChange() {

    const assignments = getStorageData(
        STORAGE_KEYS.assignments,
        []
    );


    currentAssignment = assignments.find(
        assignment =>
            assignment.assignmentId === assignmentSelect.value
    );


    selectedTopics.clear();

    expandedUnits.clear();

    currentUnits = [];


    updateSelectionSummary();

    unitList.innerHTML = "";


    if (!currentAssignment) return;


    loadSyllabus(
        currentAssignment.classId,
        currentAssignment.subjectId
    );

}


// =====================================================
// 9. CENTRAL SYLLABUS SUBJECT ID
// =====================================================

function getSyllabusSubjectId(subjectId) {

    if (String(subjectId).toUpperCase() === "PYTHON") {
        return "Python";
    }

    return subjectId;

}


// =====================================================
// 10. LOAD CENTRAL SYLLABUS
// =====================================================

function loadSyllabus(classId, subjectId) {

    try {

        const syllabusSubjectId = getSyllabusSubjectId(subjectId);


        const syllabusTopics = getClariQTopics(
            classId,
            syllabusSubjectId
        );


        if (
            !Array.isArray(syllabusTopics) ||
            syllabusTopics.length === 0
        ) {

            showEmptySyllabus();

            return;

        }


        currentUnits = syllabusTopics.map(topic => {

            const subtopics = getClariQSubtopics(
                classId,
                syllabusSubjectId,
                topic.id
            );


            return {

                unitId: String(topic.id),

                unitName: topic.name,

                topics: Array.isArray(subtopics)

                    ? subtopics.map((subtopic, index) => ({

                        topicId: String(index),

                        topicName: String(subtopic)

                    }))

                    : []

            };

        });


        renderUnits();

    } catch (error) {

        console.error("Error loading syllabus:", error);

        showEmptySyllabus();

    }

}


// =====================================================
// 11. EMPTY SYLLABUS
// =====================================================

function showEmptySyllabus() {

    currentUnits = [];

    selectedTopics.clear();

    expandedUnits.clear();


    unitList.innerHTML = `
        <div class="empty-topic-state">
            <p>Syllabus is not available for this subject yet.</p>
        </div>
    `;


    updateSelectionSummary();

}


// =====================================================
// 12. TOPIC IDENTIFIER
// =====================================================

function getTopicKey(unitId, topicId) {

    return `${unitId}::${topicId}`;

}


// =====================================================
// 13. UNIT SELECTION STATE
// =====================================================

function getUnitSelectionState(unit) {

    if (unit.topics.length === 0) {

        const selected = selectedTopics.has(
            getTopicKey(unit.unitId, unit.unitId)
        );


        return {
            selectedCount: selected ? 1 : 0,
            totalTopics: 1,
            allSelected: selected,
            partiallySelected: false
        };

    }


    const selectedCount = unit.topics.filter(topic =>

        selectedTopics.has(
            getTopicKey(unit.unitId, topic.topicId)
        )

    ).length;


    return {

        selectedCount,

        totalTopics: unit.topics.length,

        allSelected:
            selectedCount === unit.topics.length,

        partiallySelected:
            selectedCount > 0 &&
            selectedCount < unit.topics.length

    };

}


// =====================================================
// 14. RENDER UNITS
// =====================================================

function renderUnits() {

    unitList.innerHTML = "";


    if (currentUnits.length === 0) {

        showEmptySyllabus();

        return;

    }


    currentUnits.forEach(unit => {

        const state = getUnitSelectionState(unit);

        const isExpanded = expandedUnits.has(unit.unitId);


        const unitElement = document.createElement("div");

        unitElement.className = "unit-item";


        unitElement.innerHTML = `

            <div class="unit-header">

                <label class="unit-checkbox">

                    <input
                        type="checkbox"
                        class="unit-select-checkbox"
                        data-unit-id="${escapeHTML(unit.unitId)}"
                        ${state.allSelected ? "checked" : ""}
                    >

                    <span class="custom-checkbox"></span>

                </label>


                <div class="unit-title">

                    <span>${escapeHTML(unit.unitName)}</span>

                </div>


                <button
                    type="button"
                    class="unit-chevron ${isExpanded ? "expanded" : ""}"
                    aria-label="Toggle ${escapeHTML(unit.unitName)}"
                    aria-expanded="${isExpanded}"
                >
                    <i data-lucide="chevron-down"></i>
                </button>

            </div>


            <div
                class="unit-topics"
                data-unit-topics="${escapeHTML(unit.unitId)}"
                ${isExpanded ? "" : "hidden"}
            >

                ${
                    unit.topics.length > 0

                    ? unit.topics.map(topic => {

                        const topicKey = getTopicKey(
                            unit.unitId,
                            topic.topicId
                        );


                        return `

                            <label class="topic-item">

                                <input
                                    type="checkbox"
                                    class="topic-checkbox"
                                    data-topic-key="${escapeHTML(topicKey)}"
                                    ${selectedTopics.has(topicKey) ? "checked" : ""}
                                >

                                <span class="custom-checkbox"></span>

                                <span class="topic-label">
                                    ${escapeHTML(topic.topicName)}
                                </span>

                            </label>

                        `;

                    }).join("")

                    : `
                        <p class="topic-label">
                            No individual topics available.
                        </p>
                    `
                }

            </div>

        `;


        unitList.appendChild(unitElement);


        const header = unitElement.querySelector(".unit-header");

        const unitCheckbox = unitElement.querySelector(
            ".unit-select-checkbox"
        );

        const topicCheckboxes = unitElement.querySelectorAll(
            ".topic-checkbox"
        );

        const expandButton = unitElement.querySelector(
            ".unit-chevron"
        );

        const topicsContainer = unitElement.querySelector(
            ".unit-topics"
        );


        unitCheckbox.indeterminate = state.partiallySelected;


        unitCheckbox.addEventListener("change", () => {

            if (unit.topics.length === 0) {

                const key = getTopicKey(
                    unit.unitId,
                    unit.unitId
                );


                if (unitCheckbox.checked) {
                    selectedTopics.add(key);
                } else {
                    selectedTopics.delete(key);
                }

            } else {

                unit.topics.forEach(topic => {

                    const key = getTopicKey(
                        unit.unitId,
                        topic.topicId
                    );


                    if (unitCheckbox.checked) {
                        selectedTopics.add(key);
                    } else {
                        selectedTopics.delete(key);
                    }

                });

            }


            topicCheckboxes.forEach(checkbox => {

                checkbox.checked = selectedTopics.has(
                    checkbox.dataset.topicKey
                );

            });


            unitCheckbox.indeterminate = false;

            updateSelectionSummary();

        });


        topicCheckboxes.forEach(checkbox => {

            checkbox.addEventListener("change", () => {

                const topicKey = checkbox.dataset.topicKey;


                if (checkbox.checked) {
                    selectedTopics.add(topicKey);
                } else {
                    selectedTopics.delete(topicKey);
                }


                const updatedState = getUnitSelectionState(unit);


                unitCheckbox.checked = updatedState.allSelected;

                unitCheckbox.indeterminate =
                    updatedState.partiallySelected;


                updateSelectionSummary();

            });

        });


        header.addEventListener("click", event => {

            if (
                event.target.closest(".unit-checkbox") ||
                event.target.closest("input")
            ) {
                return;
            }


            toggleUnit(unit.unitId);

        });


        expandButton.addEventListener("click", event => {

            event.preventDefault();

            event.stopPropagation();

            toggleUnit(unit.unitId);

        });

    });


    if (window.lucide) {
        lucide.createIcons();
    }


    updateSelectionSummary();

}


// =====================================================
// 15. TOGGLE UNIT
// =====================================================

function toggleUnit(unitId) {

    const topicsContainer = unitList.querySelector(
        `[data-unit-topics="${CSS.escape(unitId)}"]`
    );


    if (!topicsContainer) return;


    const unitElement = topicsContainer.closest(".unit-item");

    const expandButton = unitElement?.querySelector(
        ".unit-chevron"
    );


    const shouldExpand = topicsContainer.hidden;


    if (shouldExpand) {

        expandedUnits.add(unitId);

        topicsContainer.hidden = false;

        topicsContainer.style.removeProperty("display");

    } else {

        expandedUnits.delete(unitId);

        topicsContainer.hidden = true;

        topicsContainer.style.setProperty(
            "display",
            "none",
            "important"
        );

    }


    if (expandButton) {

        expandButton.classList.toggle(
            "expanded",
            shouldExpand
        );

        expandButton.setAttribute(
            "aria-expanded",
            String(shouldExpand)
        );

    }

}


// =====================================================
// 16. SELECTED TOPICS SUMMARY
// =====================================================

function updateSelectionSummary() {

    const selectedItems = [];


    currentUnits.forEach(unit => {

        const state = getUnitSelectionState(unit);


        if (state.selectedCount === 0) {
            return;
        }


        if (state.allSelected) {

            selectedItems.push(unit.unitName);

            return;

        }


        unit.topics.forEach(topic => {

            const topicKey = getTopicKey(
                unit.unitId,
                topic.topicId
            );


            if (selectedTopics.has(topicKey)) {

                selectedItems.push(topic.topicName);

            }

        });

    });


    if (selectedItems.length === 0) {

        selectedTopicsSummary.innerHTML = `
            <span class="summary-placeholder">
                No topics selected yet.
            </span>
        `;

        return;

    }


    selectedTopicsSummary.innerHTML = selectedItems.map(item => `

        <span class="selected-unit-tag">
            ${escapeHTML(item)}
        </span>

    `).join("");

}


// =====================================================
// 17. EDIT MODE — DATE NORMALIZATION
// =====================================================

function normalizeDateInput(value) {

    if (!value) return "";


    const match = String(value).match(
        /^(\d{4})-(\d{2})-(\d{2})/
    );


    if (match) {
        return `${match[1]}-${match[2]}-${match[3]}`;
    }


    const parsed = new Date(value);


    if (Number.isNaN(parsed.getTime())) {
        return "";
    }


    const year = parsed.getFullYear();

    const month = String(parsed.getMonth() + 1).padStart(2, "0");

    const day = String(parsed.getDate()).padStart(2, "0");


    return `${year}-${month}-${day}`;

}


// =====================================================
// 18. EDIT MODE — TIME NORMALIZATION
// =====================================================

function normalizeTimeInput(value) {

    if (!value) return "";


    const time = String(value).trim();


    if (/^\d{2}:\d{2}$/.test(time)) {
        return time;
    }


    const match = time.match(
        /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
    );


    if (!match) return "";


    let hours = Number(match[1]);

    const minutes = match[2];

    const period = match[3].toUpperCase();


    if (period === "PM" && hours !== 12) {
        hours += 12;
    }


    if (period === "AM" && hours === 12) {
        hours = 0;
    }


    return `${String(hours).padStart(2, "0")}:${minutes}`;

}


// =====================================================
// 19. EDIT MODE — FIND SESSION
// =====================================================

function loadSessionForEditing(sessionId) {

    let sessionData;


    try {

        sessionData = getSessionStorage();

    } catch (error) {

        console.error(error);

        alert("Unable to load the selected session.");

        window.location.href = "doubt-sessions.html";

        return;

    }


    const session = sessionData.upcoming.find(item =>

        String(item.id || item.sessionId) === String(sessionId)

    );


    if (!session) {

        alert("The selected upcoming session could not be found.");

        window.location.href = "doubt-sessions.html";

        return;

    }


    editingSession = session;


    const assignments = getStorageData(
        STORAGE_KEYS.assignments,
        []
    );


    // First try the original assignment ID.

    let matchingAssignment = assignments.find(assignment =>

        session.assignmentId &&
        String(assignment.assignmentId) === String(session.assignmentId)

    );


    // Fallback: match class and subject.

    if (!matchingAssignment) {

        matchingAssignment = assignments.find(assignment =>

            String(assignment.classId) === String(session.classId) &&
            String(assignment.subjectId).toUpperCase() ===
            String(session.subjectId || session.subject).toUpperCase()

        );

    }


    // Fallback: match year, section and subject.

    if (!matchingAssignment) {

        matchingAssignment = assignments.find(assignment =>

            String(assignment.year).toLowerCase() ===
            String(session.year).toLowerCase() &&

            String(assignment.section).toLowerCase() ===
            String(session.section).toLowerCase() &&

            String(assignment.subjectId).toUpperCase() ===
            String(session.subjectId || session.subject).toUpperCase()

        );

    }


    if (!matchingAssignment) {

        alert(
            "The original class and subject assignment could not be matched. Please check the teacher assignments."
        );

        window.location.href = "doubt-sessions.html";

        return;

    }


    // Select the assignment and load its syllabus.

    assignmentSelect.value = matchingAssignment.assignmentId;

    handleAssignmentChange();


    if (currentUnits.length === 0) {

        alert("The syllabus for this session could not be loaded.");

        window.location.href = "doubt-sessions.html";

        return;

    }


    // Restore selected topics.

    restoreSelectedTopics(session);


    // Restore form values.

    titleInput.value = session.title || "";


    submissionStart.value = normalizeDateInput(
        session.submissionPeriod?.opensAt ||
        session.submissionsBegin
    );


    submissionDeadline.value = normalizeDateInput(
        session.submissionPeriod?.deadline ||
        session.submissionDeadline
    );


    sessionDate.value = normalizeDateInput(
        session.schedule?.date ||
        session.sessionDate
    );


    sessionStartTime.value = normalizeTimeInput(
        session.schedule?.startTime ||
        session.sessionTime
    );


    updateDateConstraints();


    // Change button text without changing the page heading.

    if (submitButton) {

        submitButton.innerHTML = `
            Save Changes
            <i data-lucide="save"></i>
        `;

    }


    addDeleteSessionButton();


    if (window.lucide) {
        lucide.createIcons();
    }

}


// =====================================================
// 20. EDIT MODE — RESTORE SELECTED TOPICS
// =====================================================

function restoreSelectedTopics(session) {

    selectedTopics.clear();

    expandedUnits.clear();


    const savedTopics =
        session.selectedTopicDetails ||
        session.topics ||
        [];


    if (!Array.isArray(savedTopics)) {
        renderUnits();
        return;
    }


    savedTopics.forEach(savedTopic => {

        const topicName =
            typeof savedTopic === "string"
                ? savedTopic
                : savedTopic.topicName || savedTopic.name || "";


        const savedUnitId =
            typeof savedTopic === "object"
                ? savedTopic.unitId
                : null;


        const savedUnitName =
            typeof savedTopic === "object"
                ? savedTopic.unitName
                : null;


        const savedTopicId =
            typeof savedTopic === "object"
                ? savedTopic.topicId
                : null;


        let unit = currentUnits.find(item =>

            savedUnitId &&
            String(item.unitId) === String(savedUnitId)

        );


        if (!unit && savedUnitName) {

            unit = currentUnits.find(item =>

                item.unitName.toLowerCase() ===
                String(savedUnitName).toLowerCase()

            );

        }


        // Legacy topic strings may only contain the topic name.

        if (!unit && topicName) {

            unit = currentUnits.find(item =>

                item.unitName.toLowerCase() ===
                    topicName.toLowerCase() ||

                item.topics.some(topic =>

                    topic.topicName.toLowerCase() ===
                    topicName.toLowerCase()

                )

            );

        }


        if (!unit) return;


        // Entire unit was selected.

        if (

            topicName.toLowerCase() ===
                unit.unitName.toLowerCase() ||

            (
                savedTopicId &&
                String(savedTopicId) === String(unit.unitId)
            )

        ) {

            if (unit.topics.length === 0) {

                selectedTopics.add(
                    getTopicKey(unit.unitId, unit.unitId)
                );

            } else {

                unit.topics.forEach(topic => {

                    selectedTopics.add(
                        getTopicKey(unit.unitId, topic.topicId)
                    );

                });

            }

            return;

        }


        // Restore individual subtopic.

        const subtopic = unit.topics.find(topic =>

            (
                savedTopicId !== null &&
                String(topic.topicId) === String(savedTopicId)
            ) ||

            (
                topicName &&
                topic.topicName.toLowerCase() ===
                topicName.toLowerCase()
            )

        );


        if (subtopic) {

            selectedTopics.add(
                getTopicKey(unit.unitId, subtopic.topicId)
            );

            expandedUnits.add(unit.unitId);

        }

    });


    renderUnits();

}


// =====================================================
// 21. EDIT MODE — DELETE BUTTON
// =====================================================

function addDeleteSessionButton() {

    if (!editingSession) return;


    const existingButton = document.getElementById(
        "deleteSessionButton"
    );


    if (existingButton) return;


    const deleteButton = document.createElement("button");

    deleteButton.type = "button";

    deleteButton.id = "deleteSessionButton";

    deleteButton.className = "delete-session-btn";

    deleteButton.innerHTML = `
        <i data-lucide="trash-2"></i>
        Delete Session
    `;

const formActions = form.querySelector(".form-actions");

if (formActions) {
    formActions.insertBefore(
        deleteButton,
        formActions.querySelector(".create-button")
    );
}

    deleteButton.addEventListener("click", deleteCurrentSession);


    if (window.lucide) {
        lucide.createIcons();
    }

}


// =====================================================
// 22. EDIT MODE — DELETE CURRENT SESSION
// =====================================================

function deleteCurrentSession() {

    if (!editingSession) return;


    const confirmed = confirm(
        "Are you sure you want to delete this doubt session? This action cannot be undone."
    );


    if (!confirmed) return;


    let sessionData;


    try {

        sessionData = getSessionStorage();

    } catch (error) {

        console.error(error);

        alert("Unable to access saved sessions.");

        return;

    }


    const index = sessionData.upcoming.findIndex(session =>

        String(session.id || session.sessionId) ===
        String(editingSession.id || editingSession.sessionId)

    );


    if (index === -1) {

        alert("This session could not be found.");

        return;

    }


    sessionData.upcoming.splice(index, 1);


    if (!saveStorageData(STORAGE_KEYS.sessions, sessionData)) {
        return;
    }


    alert("Doubt session deleted successfully!");

    window.location.href = "doubt-sessions.html";

}


// =====================================================
// 23. DATE HELPERS
// =====================================================

function getLocalDateValue(date = new Date()) {

    const offset = date.getTimezoneOffset();

    return new Date(
        date.getTime() - offset * 60000
    ).toISOString().slice(0, 10);

}


function getSessionStartDateTime() {

    if (!sessionDate.value || !sessionStartTime.value) {
        return null;
    }


    return new Date(
        `${sessionDate.value}T${sessionStartTime.value}`
    );

}


function getPreviousDate(dateString) {

    const date = new Date(`${dateString}T00:00:00`);

    date.setDate(date.getDate() - 1);

    return getLocalDateValue(date);

}

// =====================================================
// 24. MINIMUM DATES
// =====================================================

function setMinimumDates() {

    const today = getLocalDateValue();

    sessionDate.min = today;
    submissionStart.min = today;
    submissionDeadline.min = today;

    updateDateConstraints();

}

// =====================================================
// 25. DATE CONSTRAINTS
// =====================================================

function updateDateConstraints() {

    const today = getLocalDateValue();

    submissionStart.min = today;

    submissionDeadline.min =
        submissionStart.value || today;

    // No maximum submission duration.
    submissionDeadline.removeAttribute("max");

    // The live session itself must be scheduled in the future.
    if (sessionDate.value === today) {

        const now = new Date();

        const hours = String(now.getHours()).padStart(2, "0");

        const minutes = String(now.getMinutes()).padStart(2, "0");

        sessionStartTime.min = `${hours}:${minutes}`;

    } else {

        sessionStartTime.removeAttribute("min");

    }

}
// =====================================================
// SESSION STATUS — BASED ON SUBMISSION OPENING DATE
// =====================================================

function getSessionStatus(openingDate) {

    const today = getLocalDateValue();

    return openingDate <= today
        ? "active"
        : "upcoming";

}

// =====================================================
// 26. FORM VALIDATION
// =====================================================

function validateSessionForm() {

    const title = titleInput.value.trim();

    if (!title) {

        alert("Please enter a session title.");

        titleInput.focus();

        return false;

    }

    if (!currentAssignment) {

        alert("Please select an assigned class and subject.");

        assignmentSelect.focus();

        return false;

    }

    if (selectedTopics.size === 0) {

        alert("Please select at least one topic.");

        return false;

    }

    const openingDate = submissionStart.value;

    const deadlineDate = submissionDeadline.value;

    const date = sessionDate.value;

    const startTime = sessionStartTime.value;

    if (!openingDate || !deadlineDate) {

        alert(
            "Please select the submission opening and deadline dates."
        );

        return false;

    }

    const today = getLocalDateValue();

    if (openingDate < today) {

        alert(
            "The submission opening date cannot be in the past."
        );

        return false;

    }

    if (deadlineDate < openingDate) {

        alert(
            "The submission deadline must be on or after the opening date."
        );

        return false;

    }

    if (!date || !startTime) {

        alert("Please complete the session schedule.");

        return false;

    }

    const scheduledAt = getSessionStartDateTime();

    if (!scheduledAt || scheduledAt <= new Date()) {

        alert(
            "Please choose a future session date and time."
        );

        return false;

    }

    if (deadlineDate >= date) {

        alert(
            "The submission deadline must be before the scheduled doubt session."
        );

        return false;

    }

    return true;

}

// =====================================================
// 27. HANDLE FORM SUBMISSION
// =====================================================

function handleSessionCreation(event) {

    event.preventDefault();


    if (!validateSessionForm()) return;


    if (editingSession) {

        updateExistingSession();

    } else {

        saveNewSession();

    }

}


// =====================================================
// 28. GET SELECTED TOPIC DETAILS
// =====================================================

function getSelectedTopicDetails() {

    const selectedTopicDetails = [];


    currentUnits.forEach(unit => {

        const state = getUnitSelectionState(unit);


        if (state.selectedCount === 0) {
            return;
        }


        if (state.allSelected) {

            selectedTopicDetails.push({

                topicId: unit.unitId,

                topicName: unit.unitName,

                unitId: unit.unitId,

                unitName: unit.unitName

            });

            return;

        }


        unit.topics.forEach(topic => {

            const key = getTopicKey(
                unit.unitId,
                topic.topicId
            );


            if (selectedTopics.has(key)) {

                selectedTopicDetails.push({

                    topicId: topic.topicId,

                    topicName: topic.topicName,

                    unitId: unit.unitId,

                    unitName: unit.unitName

                });

            }

        });

    });


    return selectedTopicDetails;

}


// =====================================================
// 29. GET SESSION STORAGE
// =====================================================

function getSessionStorage() {

    const storedData = getStorageData(
        STORAGE_KEYS.sessions,
        null
    );


    if (storedData === null) {

        return {
            active: [],
            upcoming: []
        };

    }


    if (
        storedData &&
        typeof storedData === "object" &&
        !Array.isArray(storedData) &&
        Array.isArray(storedData.active) &&
        Array.isArray(storedData.upcoming)
    ) {

        return storedData;

    }


    throw new Error(
        "Invalid session storage structure. Existing data was not modified."
    );

}


// =====================================================
// 30. BUILD UPDATED SESSION
// =====================================================

function buildSessionUpdates() {

    const selectedTopicDetails = getSelectedTopicDetails();

    const now = new Date().toISOString();

    const status = getSessionStatus(submissionStart.value);

    return {

        title: titleInput.value.trim(),

        assignmentId: currentAssignment.assignmentId,

        classId: currentAssignment.classId,

        year: currentAssignment.year,

        section: currentAssignment.section,

        subjectId: currentAssignment.subjectId,

        subjectName: currentAssignment.subjectName,

        selectedTopicDetails,

        topics: selectedTopicDetails.map(topic => topic.topicName),

        submissionPeriod: {

            opensAt: submissionStart.value,

            deadline: submissionDeadline.value

        },

        submissionsBegin: submissionStart.value,

        submissionDeadline: submissionDeadline.value,

        schedule: {

            date: sessionDate.value,

            startTime: sessionStartTime.value,

            scheduledAt: `${sessionDate.value}T${sessionStartTime.value}`

        },

        sessionDate: sessionDate.value,

        sessionTime: sessionStartTime.value,

        status,

        updatedAt: now

    };

}


// =====================================================
// 31. UPDATE EXISTING SESSION
// =====================================================

function updateExistingSession() {

    let sessionData;

    try {

        sessionData = getSessionStorage();

    } catch (error) {

        console.error(error);

        alert("Unable to access saved sessions.");

        return;

    }

    const sessionId = String(
        editingSession.id || editingSession.sessionId
    );

    const upcomingIndex = sessionData.upcoming.findIndex(session =>
        String(session.id || session.sessionId) === sessionId
    );

    const activeIndex = sessionData.active.findIndex(session =>
        String(session.id || session.sessionId) === sessionId
    );

    const oldSession =
        upcomingIndex !== -1
            ? sessionData.upcoming[upcomingIndex]
            : activeIndex !== -1
                ? sessionData.active[activeIndex]
                : null;

    if (!oldSession) {

        alert("This session no longer exists.");

        return;

    }

    const updatedSession = {

        ...oldSession,

        ...buildSessionUpdates(),

        id: oldSession.id || oldSession.sessionId,

        sessionId: oldSession.sessionId || oldSession.id,

        teacherId: oldSession.teacherId ?? null,

        teacherName: oldSession.teacherName ?? null,

        createdAt: oldSession.createdAt || new Date().toISOString()

    };

    // Remove the old record from both collections.

    if (upcomingIndex !== -1) {
        sessionData.upcoming.splice(upcomingIndex, 1);
    }

    if (activeIndex !== -1) {
        sessionData.active.splice(activeIndex, 1);
    }

    // Put it into the correct collection.

    if (updatedSession.status === "active") {

        sessionData.active.push(updatedSession);

    } else {

        sessionData.upcoming.push(updatedSession);

    }

    if (!saveStorageData(STORAGE_KEYS.sessions, sessionData)) {
        return;
    }

    alert("Doubt session updated successfully!");

    window.location.href = "doubt-sessions.html";

}
// =====================================================
// 32. SAVE NEW SESSION
// =====================================================

function saveNewSession() {

    let sessionData;

    try {

        sessionData = getSessionStorage();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to access saved sessions. Existing session data has not been changed."
        );

        return;

    }

    const sessionId = crypto.randomUUID();

    const selectedTopicDetails = getSelectedTopicDetails();

    const status = getSessionStatus(submissionStart.value);

    const newSession = {

        id: sessionId,

        sessionId,

        teacherId: null,

        teacherName: null,

        title: titleInput.value.trim(),

        assignmentId: currentAssignment.assignmentId,

        classId: currentAssignment.classId,

        year: currentAssignment.year,

        section: currentAssignment.section,

        subjectId: currentAssignment.subjectId,

        subjectName: currentAssignment.subjectName,

        selectedTopicDetails,

        topics: selectedTopicDetails.map(topic => topic.topicName),

        submissionPeriod: {

            opensAt: submissionStart.value,

            deadline: submissionDeadline.value

        },

        submissionsBegin: submissionStart.value,

        submissionDeadline: submissionDeadline.value,

        schedule: {

            date: sessionDate.value,

            startTime: sessionStartTime.value,

            scheduledAt: `${sessionDate.value}T${sessionStartTime.value}`

        },

        sessionDate: sessionDate.value,

        sessionTime: sessionStartTime.value,

        status,

        questionCount: 0,

        startedAt: status === "active"
            ? new Date().toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit"
            })
            : null,

        createdAt: new Date().toISOString()

    };

    // Automatically categorize the new session.

    if (status === "active") {

        sessionData.active.push(newSession);

    } else {

        sessionData.upcoming.push(newSession);

    }

    if (!saveStorageData(STORAGE_KEYS.sessions, sessionData)) {
        return;
    }

    alert(
        status === "active"
            ? "Doubt session created and activated successfully!"
            : "Doubt session scheduled successfully!"
    );

    window.location.href = "doubt-sessions.html";

}

// =====================================================
// 33. HTML ESCAPE
// =====================================================

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, char => ({

        "&": "&amp;",

        "<": "&lt;",

        ">": "&gt;",

        '"': "&quot;",

        "'": "&#039;"

    })[char]);

}
