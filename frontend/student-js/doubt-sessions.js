
/* =========================================
   CLARIQ STUDENT DOUBT SESSIONS
   PYTHON BACKEND INTEGRATION
========================================= */

const API_BASE_URL = "http://127.0.0.1:8000";

let sessions = [];
let currentDrawerSessionId = null;
let editingDoubtId = null;


/* =========================================
   AUTHENTICATION & API
========================================= */

function getAuthToken() {
    return (
        localStorage.getItem("access_token") ||
        localStorage.getItem("clariq_access_token") ||
        localStorage.getItem("token") ||
        ""
    );
}


async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();

    if (!token) {
        throw new Error("Login session not found. Please log in again.");
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            ...options.headers
        }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data.detail || `Request failed (${response.status})`
        );
    }

    return data;
}


/* =========================================
   HTML ESCAPING
========================================= */

function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = value ?? "";
    return div.innerHTML;
}


/* =========================================
   DATE HELPERS
========================================= */

function parseDate(value) {
    if (!value) return null;

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
}


function formatDate(value) {
    const date = parseDate(value);

    if (!date) return "Not scheduled";

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


function formatTime(value) {
    const date = parseDate(value);

    if (!date) return "";

    return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });
}


function getSubmissionState(session) {
    const now = new Date();

    const opens = parseDate(session.submissionOpensAt);
    const closes = parseDate(session.submissionClosesAt);

    if (!opens || !closes) {
        return session.submissionStatus || "closed";
    }

    if (now < opens) return "upcoming";
    if (now <= closes) return "accepting";

    return "closed";
}


function isSubmissionOpen(session) {
    return getSubmissionState(session) === "accepting";
}


function getSessionType(session) {
    const now = new Date();
    const sessionDate = parseDate(session.sessionDate);

    if (sessionDate && sessionDate < now) {
        return "completed";
    }

    if (getSubmissionState(session) === "upcoming") {
        return "upcoming";
    }

    return "active";
}


/* =========================================
   NORMALIZE BACKEND DATA
========================================= */

function normalizeTopics(topics = []) {
    return topics.map(unit => ({
        unitId: unit.id,
        unitName: unit.unit_name,
        unitNumber: unit.unit_number,

        topics: (unit.topics || []).map(topic => topic.name),

        // Preserve actual syllabus_topics.id values.
        topicRecords: (unit.topics || []).map(topic => ({
            id: topic.id,
            name: topic.name,
            displayOrder: topic.display_order
        }))
    }));
}


function normalizeDoubt(doubt) {
    return {
        id: doubt.id,
        sessionId: doubt.session_id,
        topicId: doubt.topic_id,

        question: doubt.question,
        topic: doubt.topic || "",

        unitId: String(doubt.unit_id ?? ""),
        unitName: doubt.unit_name || "",

        createdAt: doubt.created_at,
        updatedAt: doubt.updated_at,

        isEdited: doubt.is_edited
    };
}


function normalizeSession(session) {
    const normalized = {
        id: session.id,
        title: session.title,
        description: session.description || "",

        subject: session.subject?.name || "Subject",
        subjectId: session.subject?.id,

        teacher: session.teacher?.name || "Teacher",
        teacherId: session.teacher?.id,

        submissionOpensAt: session.submission_opens_at,
        submissionClosesAt: session.submission_closes_at,

        sessionDate: session.session_date,
        startsAt: session.starts_at,
        endsAt: session.ends_at,

        submissionStatus: session.submission_status,

        syllabus: normalizeTopics(session.topics || []),

        myDoubts: (session.my_doubts || []).map(normalizeDoubt)
    };

    // Display-ready date and time values.
    normalized.submissionStart = formatDate(
        normalized.submissionOpensAt
    );

    normalized.submissionEnd = formatDate(
        normalized.submissionClosesAt
    );

    normalized.sessionDateDisplay = formatDate(
        normalized.sessionDate
    );

    normalized.sessionTime = [
        formatTime(normalized.startsAt),
        formatTime(normalized.endsAt)
    ].filter(Boolean).join(" – ");

    normalized.type = getSessionType(normalized);

    return normalized;
}


/* =========================================
   LOAD STUDENT SESSIONS
========================================= */

async function loadStudentSessions() {
    const activeContainer = document.getElementById("activeSessions");
    const upcomingContainer = document.getElementById("upcomingSessions");

    try {
        const data = await apiRequest("/api/student/sessions");

        const sessionList = Array.isArray(data)
            ? data
            : data.sessions || [];

        sessions = sessionList.map(normalizeSession);

        console.log("Student sessions loaded:", sessions);

        renderHero();
        renderActiveSessions();
        renderUpcomingSessions();

        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }

    } catch (error) {
        console.error("Unable to load sessions:", error);

        activeContainer.innerHTML = `
            <div class="empty-sessions">
                Unable to load sessions: ${escapeHTML(error.message)}
            </div>
        `;

        upcomingContainer.innerHTML = `
            <div class="empty-sessions">
                Please refresh the page or log in again.
            </div>
        `;
    }
}


/* =========================================
   LOAD SESSION DETAILS
========================================= */

async function loadSessionDetails(sessionId) {
    const data = await apiRequest(
        `/api/student/sessions/${sessionId}`
    );

    const sessionData = data.session || data;

    return normalizeSession(sessionData);
}


/* =========================================
   UPDATE SESSION IN LOCAL ARRAY
========================================= */

function updateSessionInList(updatedSession) {
    const index = sessions.findIndex(item => {
        return Number(item.id) === Number(updatedSession.id);
    });

    if (index !== -1) {
        sessions[index] = updatedSession;
    } else {
        sessions.push(updatedSession);
    }

    renderHero();
    renderActiveSessions();
    renderUpcomingSessions();

    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }
}


/* =========================================
   DOUBT DATA
========================================= */

function getSessionDoubts(sessionId) {
    const session = sessions.find(item => {
        return Number(item.id) === Number(sessionId);
    });

    return session ? session.myDoubts : [];
}


/* =========================================
   TOPIC HELPERS
========================================= */

function getAllTopics(session) {
    return session.syllabus.flatMap(unit => unit.topics);
}


function generateTopicPills(session) {
    return getAllTopics(session).map(topic => `
        <span class="topic-pill">
            ${escapeHTML(topic)}
        </span>
    `).join("");
}


/* =========================================
   STATUS
========================================= */

function getStatus(status) {
    if (status === "closed") {
        return `
            <span class="status-pill status-closed">
                Submission Closed
            </span>
        `;
    }

    if (status === "upcoming") {
        return `
            <span class="status-pill status-closed">
                Submission Upcoming
            </span>
        `;
    }

    return `
        <span class="status-pill status-accepting">
            Accepting Doubts
        </span>
    `;
}


/* =========================================
   DATE ROWS
========================================= */

function generateDateRows(session) {
    return `
        <div class="session-dates">

            <div class="session-date-row">
                <i data-lucide="message-circle-question"></i>

                <span class="submission-label">
                    Submission window
                </span>

                <span class="submission-value">
                    ${escapeHTML(session.submissionStart)}
                    –
                    ${escapeHTML(session.submissionEnd)}
                </span>
            </div>

            <div class="session-date-row">
                <i data-lucide="calendar-days"></i>

                <span class="session-date-value">
                    ${escapeHTML(session.sessionDateDisplay)}
                </span>

                <span class="date-separator">•</span>

                <span class="session-date-value">
                    ${escapeHTML(session.sessionTime || "Time not scheduled")}
                </span>
            </div>

        </div>
    `;
}


/* =========================================
   HERO CARD
========================================= */

function renderHero() {
    const futureSessions = sessions
        .filter(session => session.type !== "completed")
        .sort((a, b) => {
            return (
                (parseDate(a.sessionDate)?.getTime() || 0) -
                (parseDate(b.sessionDate)?.getTime() || 0)
            );
        });

    const hero = futureSessions[0];

    const heroElement = document.getElementById("heroSession");

    if (!heroElement) return;

    if (!hero) {
        heroElement.style.display = "none";
        return;
    }

    heroElement.style.display = "";

    document.getElementById("heroTitle").textContent = hero.title;

    document.getElementById("heroTeacher").textContent = hero.teacher;

    document.getElementById("heroDate").textContent =
        `${hero.sessionDateDisplay} · ${hero.sessionTime || "Time not scheduled"}`;

    document.getElementById("heroTopics").innerHTML =
        generateTopicPills(hero);

    document.getElementById("heroViewButton").dataset.sessionId =
        hero.id;
}


/* =========================================
   ACTIVE SESSION CARDS
========================================= */

function renderActiveSessions() {
    const container = document.getElementById("activeSessions");

    const activeSessions = sessions.filter(session => {
        return session.type === "active";
    });

    if (activeSessions.length === 0) {
        container.innerHTML = `
            <div class="empty-sessions">
                No active sessions at the moment.
            </div>
        `;
        return;
    }

    container.innerHTML = activeSessions.map(session => {
        const status = getSubmissionState(session);

        return `
            <article class="active-session-card"
                     id="session-${session.id}">

                <div class="active-card-top">

                    <span class="subject-pill">
                        ${escapeHTML(session.subject)}
                    </span>

                    ${getStatus(status)}

                </div>

                <h3 class="active-card-title">
                    ${escapeHTML(session.title)}
                </h3>

                ${generateDateRows(session)}

                <div class="session-topics">
                    ${generateTopicPills(session)}
                </div>

                <div class="active-card-bottom">

                    <div class="session-teacher">
                        <i data-lucide="user-round"></i>
                        <span>${escapeHTML(session.teacher)}</span>
                    </div>

                    <a href="#"
                       class="view-session-btn"
                       data-session-id="${session.id}">

                        View Session
                        <i data-lucide="arrow-right"></i>

                    </a>

                </div>

            </article>
        `;
    }).join("");
}


/* =========================================
   UPCOMING SESSION CARDS
========================================= */

function renderUpcomingSessions() {
    const container = document.getElementById("upcomingSessions");

    const upcomingSessions = sessions.filter(session => {
        return session.type === "upcoming";
    });

    if (upcomingSessions.length === 0) {
        container.innerHTML = `
            <div class="empty-sessions">
                No upcoming sessions at the moment.
            </div>
        `;
        return;
    }

    container.innerHTML = upcomingSessions.map(session => {
        return `
            <article class="upcoming-session-card"
                     id="upcoming-${session.id}">

                <span class="subject-pill">
                    ${escapeHTML(session.subject)}
                </span>

                <div class="upcoming-session-content">

                    <h3 class="upcoming-session-title">
                        ${escapeHTML(session.title)}
                    </h3>

                    ${generateDateRows(session)}

                    <div class="session-topics">
                        ${generateTopicPills(session)}
                    </div>

                    <div class="session-teacher">
                        <i data-lucide="user-round"></i>
                        <span>${escapeHTML(session.teacher)}</span>
                    </div>

                </div>

                <button class="reminder-btn"
                        data-session-id="${session.id}">

                    <i data-lucide="bell"></i>
                    <span>Set Reminder</span>

                </button>

            </article>
        `;
    }).join("");
}


/* =========================================
   REMINDERS
========================================= */

function setupReminders() {
    document.addEventListener("click", function(event) {
        const button = event.target.closest(".reminder-btn");

        if (!button) return;

        button.classList.toggle("reminder-set");

        if (button.classList.contains("reminder-set")) {
            button.innerHTML = `
                <i data-lucide="bell-ring"></i>
                <span>Reminder Set</span>
            `;
        } else {
            button.innerHTML = `
                <i data-lucide="bell"></i>
                <span>Set Reminder</span>
            `;
        }

        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }
    });
}


/* =========================================
   VIEW SESSION BUTTONS
========================================= */

function setupViewButtons() {
    document.addEventListener("click", function(event) {
        const button = event.target.closest(
            ".view-session-btn, #heroViewButton"
        );

        if (!button) return;

        event.preventDefault();

        openSessionDrawer(Number(button.dataset.sessionId));
    });
}


/* =========================================
   DRAWER ELEMENTS
========================================= */

const drawerOverlay = document.getElementById("sessionDrawerOverlay");
const drawerContent = document.getElementById("sessionDrawer");

const questionOverlay = document.getElementById("questionModalOverlay");
const questionContent = document.getElementById("questionModal");


/* =========================================
   OPEN SESSION DRAWER
========================================= */

async function openSessionDrawer(sessionId) {
    try {
        const session = await loadSessionDetails(sessionId);

        updateSessionInList(session);

        currentDrawerSessionId = session.id;

        renderSessionDrawer(session);

        drawerOverlay.classList.add("active");
        drawerOverlay.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";

        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }

    } catch (error) {
        console.error("Unable to load session details:", error);
        alert(error.message);
    }
}


/* =========================================
   CLOSE SESSION DRAWER
========================================= */

function closeSessionDrawer() {
    if (questionOverlay.classList.contains("active")) {
        closeQuestionModal();
    }

    drawerOverlay.classList.remove("active");
    drawerOverlay.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";

    currentDrawerSessionId = null;
}


/* =========================================
   RENDER SESSION DRAWER
========================================= */

function renderSessionDrawer(session) {
    const status = getSubmissionState(session);
    const doubts = getSessionDoubts(session.id);
    const submissionOpen = isSubmissionOpen(session);

    drawerContent.innerHTML = `

        <div class="drawer-header">

            <div>
                <span class="drawer-eyebrow">
                    SESSION DETAILS
                </span>

                <h3>Session Summary</h3>
            </div>

            <button class="drawer-close-btn"
                    id="drawerCloseButton"
                    aria-label="Close session details">

                <i data-lucide="x"></i>

            </button>

        </div>


        <div class="drawer-session-intro">

            <div class="drawer-session-pills">

                <span class="subject-pill">
                    ${escapeHTML(session.subject)}
                </span>

                ${getStatus(status)}

            </div>

            <h2 id="drawerSessionTitle">
                ${escapeHTML(session.title)}
            </h2>

            <div class="drawer-teacher">
                <i data-lucide="user-round"></i>
                <span>${escapeHTML(session.teacher)}</span>
            </div>

        </div>


        <div class="drawer-divider"></div>


        <section class="drawer-section">

            <h4 class="drawer-section-heading">
                SESSION SCHEDULE
            </h4>

            <div class="drawer-schedule-item">

                <div class="drawer-schedule-icon">
                    <i data-lucide="message-circle-question"></i>
                </div>

                <div>
                    <span>Submission window</span>

                    <strong>
                        ${escapeHTML(session.submissionStart)}
                        –
                        ${escapeHTML(session.submissionEnd)}
                    </strong>
                </div>

            </div>

            <div class="drawer-schedule-item">

                <div class="drawer-schedule-icon">
                    <i data-lucide="calendar-days"></i>
                </div>

                <div>
                    <span>Session date and time</span>

                    <strong>
                        ${escapeHTML(session.sessionDateDisplay)}
                        ·
                        ${escapeHTML(session.sessionTime || "Time not scheduled")}
                    </strong>
                </div>

            </div>

        </section>


        <div class="drawer-divider"></div>


        <section class="drawer-section">

            <h4 class="drawer-section-heading">
                SESSION SYLLABUS
            </h4>

            <div class="drawer-syllabus">
                ${renderDrawerSyllabus(session)}
            </div>

        </section>


        <div class="drawer-divider"></div>


        <section class="drawer-section">

            <div class="drawer-doubts-heading">

                <h4 class="drawer-section-heading">
                    MY SUBMITTED DOUBTS
                </h4>

                <span class="drawer-doubt-count">
                    ${String(doubts.length).padStart(2, "0")}
                </span>

            </div>

            <div class="drawer-doubt-list" id="drawerDoubtList">
                ${renderDoubtCards(doubts, submissionOpen)}
            </div>

        </section>


        ${submissionOpen ? `

            <button class="drawer-ask-btn"
                    id="drawerAskButton">

                <i data-lucide="plus"></i>
                Ask a Doubt

            </button>

        ` : `

            <div class="drawer-closed-message">

                <i data-lucide="lock"></i>

                The submission window for this session is closed.

            </div>

        `}

    `;


    document.getElementById("drawerCloseButton")
        .addEventListener("click", closeSessionDrawer);


    const askButton = document.getElementById("drawerAskButton");

    if (askButton) {
        askButton.addEventListener("click", function() {
            openQuestionModal(session);
        });
    }

    setupDoubtMenus(session);

    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }
}


/* =========================================
   DRAWER SYLLABUS
========================================= */

function renderDrawerSyllabus(session) {
    if (!session.syllabus.length) {
        return `
            <p class="drawer-empty-doubts">
                No syllabus topics available.
            </p>
        `;
    }

    return session.syllabus.map(unit => `
        <div class="drawer-syllabus-unit">

            <div class="drawer-unit-heading">

                <span class="drawer-unit-dot"></span>

                <strong>
                    ${escapeHTML(unit.unitName)}
                </strong>

            </div>

            <div class="drawer-unit-topics">

                ${unit.topics.map(topic => `
                    <span>${escapeHTML(topic)}</span>
                `).join("")}

            </div>

        </div>
    `).join("");
}


/* =========================================
   DOUBT CARDS
========================================= */

function renderDoubtCards(doubts, submissionOpen) {
    if (doubts.length === 0) {
        return `
            <div class="drawer-empty-doubts">

                <i data-lucide="message-circle"></i>

                <p>
                    You haven't submitted any doubts for this session yet.
                </p>

            </div>
        `;
    }

    return doubts.map(doubt => `
        <div class="drawer-doubt-card"
             data-doubt-id="${doubt.id}">

            <div class="drawer-doubt-content">

                <p class="drawer-doubt-question">
                    ${escapeHTML(doubt.question)}
                </p>

                <span class="drawer-doubt-topic">
                    ${escapeHTML(doubt.topic)}
                </span>

            </div>

            ${submissionOpen ? `

                <div class="drawer-doubt-menu-wrapper">

                    <button class="drawer-doubt-menu-btn"
                            data-menu-id="${doubt.id}"
                            aria-label="Doubt options">

                        <i data-lucide="more-vertical"></i>

                    </button>

                    <div class="drawer-doubt-dropdown"
                         id="dropdown-${doubt.id}">

                        <button data-action="edit"
                                data-doubt-id="${doubt.id}">

                            <i data-lucide="pencil"></i>
                            Edit Doubt

                        </button>

                        <button class="delete-option"
                                data-action="delete"
                                data-doubt-id="${doubt.id}">

                            <i data-lucide="trash-2"></i>
                            Delete Doubt

                        </button>

                    </div>

                </div>

            ` : ""}

        </div>
    `).join("");
}


/* =========================================
   QUESTION FORM MODAL
========================================= */

function openQuestionModal(session, doubt = null) {
    if (!isSubmissionOpen(session)) {
        alert("The submission window for this session is closed.");
        return;
    }

    editingDoubtId = doubt ? doubt.id : null;

    renderQuestionForm(session, doubt);

    questionOverlay.classList.add("active");
    questionOverlay.setAttribute("aria-hidden", "false");

    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

    document.getElementById("questionText").focus();
}


function closeQuestionModal() {
    questionOverlay.classList.remove("active");
    questionOverlay.setAttribute("aria-hidden", "true");

    editingDoubtId = null;
}


/* =========================================
   RENDER QUESTION FORM
========================================= */

function renderQuestionForm(session, doubt = null) {
    questionContent.innerHTML = `

        <div class="question-modal-header">

            <div>

                <span class="question-modal-eyebrow">
                    ${escapeHTML(session.subject)} · DOUBT SESSION
                </span>

                <h2 id="questionModalTitle">
                    ${doubt ? "Edit Your Doubt" : "Ask a Doubt"}
                </h2>

            </div>

            <button class="question-close-btn"
                    id="questionCloseButton"
                    aria-label="Close form">

                <i data-lucide="x"></i>

            </button>

        </div>


        <form id="sessionQuestionForm">

            <div class="question-form-group">

                <label for="questionText">
                    Describe your doubt
                </label>

                <textarea
                    id="questionText"
                    placeholder="Explain what you're having trouble understanding..."
                    required>${doubt ? escapeHTML(doubt.question) : ""}</textarea>

            </div>


            <div class="question-form-group">

                <label>Select a topic</label>

                <p class="question-form-hint">
                    Expand a unit to explore its available topics.
                </p>

                <div class="unit-selection-list"
                     id="unitSelectionList">

                    ${renderUnitSelection(session, doubt)}

                </div>

                <input type="hidden"
                       id="selectedUnitId"
                       value="${doubt ? escapeHTML(doubt.unitId) : ""}">

                <input type="hidden"
                       id="selectedUnitName"
                       value="${doubt ? escapeHTML(doubt.unitName) : ""}">

                <input type="hidden"
                       id="selectedTopic"
                       value="${doubt ? escapeHTML(doubt.topic) : ""}">

                <input type="hidden"
                       id="selectedTopicId"
                       value="${doubt ? escapeHTML(doubt.topicId) : ""}">

                <p class="topic-selection-error"
                   id="topicSelectionError">

                    Please select a topic before submitting.

                </p>

            </div>


            <div class="question-form-actions">

                <button type="button"
                        class="question-cancel-btn"
                        id="questionCancelButton">

                    Cancel

                </button>

                <button type="submit"
                        class="question-submit-btn">

                    ${doubt ? "Save Changes" : "Submit Doubt"}

                    <i data-lucide="arrow-right"></i>

                </button>

            </div>

        </form>

    `;


    setupUnitSelection(session, doubt);


    document.getElementById("questionCloseButton")
        .addEventListener("click", closeQuestionModal);


    document.getElementById("questionCancelButton")
        .addEventListener("click", closeQuestionModal);


    document.getElementById("sessionQuestionForm")
        .addEventListener("submit", function(event) {
            event.preventDefault();
            submitSessionDoubt(session);
        });
}


/* =========================================
   UNIT ACCORDION
========================================= */

function renderUnitSelection(session, doubt) {
    return session.syllabus.map(unit => {
        const selectedUnit = doubt &&
            String(doubt.unitId) === String(unit.unitId);

        return `
            <div class="unit-selection-item">

                <button type="button"
                        class="unit-selection-heading ${selectedUnit ? "expanded" : ""}"
                        data-unit-id="${escapeHTML(unit.unitId)}">

                    <span class="unit-heading-left">

                        <span class="unit-selection-dot"></span>

                        <span>
                            ${escapeHTML(unit.unitName)}
                        </span>

                    </span>

                    <i data-lucide="chevron-down"
                       class="unit-chevron"></i>

                </button>

                <div class="unit-topic-options ${selectedUnit ? "expanded" : ""}"
                     data-topics-for="${escapeHTML(unit.unitId)}">

                    ${unit.topicRecords.map(topic => {
                        const selectedTopic = selectedUnit &&
                            Number(doubt.topicId) === Number(topic.id);

                        return `
                            <button type="button"
                                    class="topic-option ${selectedTopic ? "selected" : ""}"
                                    data-unit-id="${escapeHTML(unit.unitId)}"
                                    data-unit-name="${escapeHTML(unit.unitName)}"
                                    data-topic="${escapeHTML(topic.name)}"
                                    data-topic-id="${escapeHTML(topic.id)}">

                                <span class="topic-radio"></span>

                                <span>${escapeHTML(topic.name)}</span>

                            </button>
                        `;
                    }).join("")}

                </div>

            </div>
        `;
    }).join("");
}


/* =========================================
   UNIT SELECTION INTERACTIONS
========================================= */

function setupUnitSelection(session, doubt) {
    const unitList = document.getElementById("unitSelectionList");

    unitList.addEventListener("click", function(event) {

        const unitButton = event.target.closest(
            ".unit-selection-heading"
        );

        if (unitButton) {
            const unitId = unitButton.dataset.unitId;

            const topicsContainer = unitList.querySelector(
                `[data-topics-for="${CSS.escape(unitId)}"]`
            );

            unitButton.classList.toggle("expanded");
            topicsContainer.classList.toggle("expanded");

            return;
        }


        const topicButton = event.target.closest(".topic-option");

        if (topicButton) {
            unitList.querySelectorAll(".topic-option").forEach(button => {
                button.classList.remove("selected");
            });

            topicButton.classList.add("selected");

            document.getElementById("selectedUnitId").value =
                topicButton.dataset.unitId;

            document.getElementById("selectedUnitName").value =
                topicButton.dataset.unitName;

            document.getElementById("selectedTopic").value =
                topicButton.dataset.topic;

            // Actual SyllabusTopic.id, not SyllabusUnit.id.
            document.getElementById("selectedTopicId").value =
                topicButton.dataset.topicId;

            document.getElementById("topicSelectionError")
                .classList.remove("show");
        }

    });
}


/* =========================================
   SUBMIT / EDIT DOUBT
========================================= */

async function submitSessionDoubt(session) {
    if (!isSubmissionOpen(session)) {
        alert("The submission window for this session is closed.");
        closeQuestionModal();
        return;
    }

    const question = document.getElementById("questionText")
        .value.trim();

    const unitId = document.getElementById("selectedUnitId").value;

    const topic = document.getElementById("selectedTopic").value;

    const topicId = document.getElementById("selectedTopicId").value;

    if (!question) return;

    if (!unitId || !topic || !topicId) {
        document.getElementById("topicSelectionError")
            .classList.add("show");
        return;
    }

    const selectedUnit = session.syllabus.find(unit => {
        return String(unit.unitId) === String(unitId);
    });

    const selectedTopicObject = selectedUnit?.topicRecords.find(item => {
        return (
            String(item.id) === String(topicId) &&
            item.name === topic
        );
    });

    if (!selectedTopicObject) {
        alert("Please select a valid topic from the session syllabus.");
        return;
    }

    const submitButton = document.querySelector(
        ".question-submit-btn"
    );

    submitButton.disabled = true;

    try {
        const payload = {
            question: question,
            topic_id: Number(selectedTopicObject.id)
        };

        console.log("Submitting session doubt:", payload);

        if (editingDoubtId) {
            await apiRequest(
                `/api/student/sessions/${session.id}/doubts/${editingDoubtId}`,
                {
                    method: "PUT",
                    body: JSON.stringify(payload)
                }
            );
        } else {
            await apiRequest(
                `/api/student/sessions/${session.id}/doubts`,
                {
                    method: "POST",
                    body: JSON.stringify(payload)
                }
            );
        }

        closeQuestionModal();

        const updatedSession = await loadSessionDetails(session.id);

        updateSessionInList(updatedSession);

        renderSessionDrawer(updatedSession);

    } catch (error) {
        console.error("Doubt submission failed:", error);
        alert(error.message);

        submitButton.disabled = false;
    }
}


/* =========================================
   THREE-DOT MENUS
========================================= */

function setupDoubtMenus(session) {
    const doubtList = document.getElementById("drawerDoubtList");

    doubtList.addEventListener("click", async function(event) {

        const menuButton = event.target.closest(
            ".drawer-doubt-menu-btn"
        );

        if (menuButton) {
            event.stopPropagation();

            const doubtId = menuButton.dataset.menuId;

            const dropdown = document.getElementById(
                `dropdown-${doubtId}`
            );

            document.querySelectorAll(".drawer-doubt-dropdown")
                .forEach(menu => {
                    if (menu !== dropdown) {
                        menu.classList.remove("show");
                    }
                });

            dropdown.classList.toggle("show");

            return;
        }


        const editButton = event.target.closest(
            '[data-action="edit"]'
        );

        if (editButton) {
            const doubtId = editButton.dataset.doubtId;

            const doubt = getSessionDoubts(session.id).find(item => {
                return String(item.id) === String(doubtId);
            });

            if (!doubt || !isSubmissionOpen(session)) return;

            openQuestionModal(session, doubt);

            return;
        }


        const deleteButton = event.target.closest(
            '[data-action="delete"]'
        );

        if (deleteButton) {
            const doubtId = deleteButton.dataset.doubtId;

            if (!isSubmissionOpen(session)) return;

            const confirmed = confirm(
                "Are you sure you want to delete this doubt?"
            );

            if (!confirmed) return;

            deleteButton.disabled = true;

            try {
                await apiRequest(
                    `/api/student/sessions/${session.id}/doubts/${doubtId}`,
                    {
                        method: "DELETE"
                    }
                );

                const updatedSession = await loadSessionDetails(session.id);

                updateSessionInList(updatedSession);

                renderSessionDrawer(updatedSession);

            } catch (error) {
                console.error("Doubt deletion failed:", error);
                alert(error.message);

                deleteButton.disabled = false;
            }
        }

    });
}


/* =========================================
   CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
========================================= */

document.addEventListener("click", function(event) {
    if (!event.target.closest(".drawer-doubt-menu-wrapper")) {
        document.querySelectorAll(".drawer-doubt-dropdown")
            .forEach(menu => {
                menu.classList.remove("show");
            });
    }
});


/* =========================================
   DRAWER CLOSING
========================================= */

function setupDrawerClosing() {
    drawerOverlay.addEventListener("click", function(event) {
        if (event.target === drawerOverlay) {
            closeSessionDrawer();
        }
    });

    document.addEventListener("keydown", function(event) {
        if (event.key !== "Escape") return;

        if (questionOverlay.classList.contains("active")) {
            closeQuestionModal();
            return;
        }

        if (drawerOverlay.classList.contains("active")) {
            closeSessionDrawer();
        }
    });
}


/* =========================================
   QUESTION MODAL CLOSING
========================================= */

function setupQuestionModalClosing() {
    questionOverlay.addEventListener("click", function(event) {
        if (event.target === questionOverlay) {
            closeQuestionModal();
        }
    });
}


/* =========================================
   INITIALIZE PAGE
========================================= */

function initializePage() {
    setupReminders();
    setupViewButtons();
    setupDrawerClosing();
    setupQuestionModalClosing();

    loadStudentSessions();
}


document.addEventListener("DOMContentLoaded", initializePage);
