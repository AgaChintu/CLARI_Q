/* =========================================
   SAMPLE SESSION DATA

   TEMPORARY STRUCTURE

   This will later be replaced with
   teacher-generated session data.
========================================= */

const sessions = [

    {
        id: 1,

        subject: "PPS",

        title: "Programming for Problem Solving in C",

        teacher: "Prof. Dhaka",

        syllabus: [

            {
                unitId: "UNIT_1",

                unitName: "Introduction to Programming",

                topics: [
                    "Programming Basics",
                    "Algorithms",
                    "Flowcharts"
                ]

            },

            {
                unitId: "UNIT_2",

                unitName: "Arrays and Pointers",

                topics: [
                    "Pointers",
                    "Arrays",
                    "Functions"
                ]

            }

        ],

        submissionStart: "20 Nov 2026",

        submissionEnd: "22 Nov 2026",

        sessionDate: "24 Nov 2026",

        sessionTime: "10:00 AM",

        type: "active"

    },


    {
        id: 2,

        subject: "DSTL",

        title: "DSTL Doubt Session",

        teacher: "Prof. Kamlendra",

        syllabus: [

            {
                unitId: "UNIT_1",

                unitName: "Set Theory and Relations",

                topics: [
                    "Sets",
                    "Relations",
                    "Functions"
                ]

            },

            {
                unitId: "UNIT_2",

                unitName: "Graph Theory",

                topics: [
                    "Trees",
                    "Graph Algorithms",
                    "Graph Representation"
                ]

            }

        ],

        submissionStart: "23 Nov 2026",

        submissionEnd: "26 Nov 2026",

        sessionDate: "27 Nov 2026",

        sessionTime: "11:00 AM",

        type: "active"

    },


    {
        id: 3,

        subject: "COA",

        title: "COA Doubt Session",

        teacher: "Prof. Kamran",

        syllabus: [

            {
                unitId: "UNIT_1",

                unitName: "Computer Organization",

                topics: [
                    "Computer Architecture",
                    "Instruction Cycle"
                ]

            },

            {
                unitId: "UNIT_2",

                unitName: "Memory Organization",

                topics: [
                    "Memory Hierarchy",
                    "Cache Memory"
                ]

            }

        ],

        submissionStart: "01 Dec 2026",

        submissionEnd: "03 Dec 2026",

        sessionDate: "05 Dec 2026",

        sessionTime: "10:00 AM",

        type: "upcoming"

    },


    {
        id: 4,

        subject: "Python",

        title: "Python Programming",

        teacher: "Prof. Vivek Shukla",

        syllabus: [

            {
                unitId: "UNIT_1",

                unitName: "Python Fundamentals",

                topics: [
                    "Variables",
                    "Data Types",
                    "Operators"
                ]

            },

            {
                unitId: "UNIT_2",

                unitName: "Data Structures",

                topics: [
                    "Lists",
                    "Dictionaries",
                    "Tuples"
                ]

            }

        ],

        submissionStart: "05 Dec 2026",

        submissionEnd: "08 Dec 2026",

        sessionDate: "10 Dec 2026",

        sessionTime: "11:00 AM",

        type: "upcoming"

    }

];



/* =========================================
   CURRENT STUDENT
========================================= */

const currentStudentId = "S001";

const DOUBTS_STORAGE_KEY = "clariqSessionDoubts";



/* =========================================
   INITIAL SAMPLE DOUBTS
========================================= */

function initializeSampleDoubts() {

    const existingData = localStorage.getItem(DOUBTS_STORAGE_KEY);

    if (existingData !== null) return;


    const sampleDoubts = [

        {
            id: "SD001",

            sessionId: 1,

            studentId: currentStudentId,

            question: "How do pointers work when passed as arguments to a function?",

            topic: "Pointers",

            unitId: "UNIT_2",

            unitName: "Arrays and Pointers",

            createdAt: new Date().toISOString()

        }

    ];


    localStorage.setItem(
        DOUBTS_STORAGE_KEY,
        JSON.stringify(sampleDoubts)
    );

}



/* =========================================
   DOUBT STORAGE FUNCTIONS
========================================= */

function getAllDoubts() {

    return JSON.parse(
        localStorage.getItem(DOUBTS_STORAGE_KEY) || "[]"
    );

}


function saveAllDoubts(doubts) {

    localStorage.setItem(
        DOUBTS_STORAGE_KEY,
        JSON.stringify(doubts)
    );

}


function getSessionDoubts(sessionId) {

    return getAllDoubts().filter(doubt => {

        return Number(doubt.sessionId) === Number(sessionId)
            && doubt.studentId === currentStudentId;

    });

}



/* =========================================
   DATE HELPERS
========================================= */

function parseSessionDate(dateString) {

    const months = {

        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11

    };


    const [day, month, year] = dateString.split(" ");

    return new Date(
        Number(year),
        months[month],
        Number(day)
    );

}


function getSubmissionState(session) {

    const today = new Date();

    today.setHours(0, 0, 0, 0);


    const startDate = parseSessionDate(session.submissionStart);

    const endDate = parseSessionDate(session.submissionEnd);

    endDate.setHours(23, 59, 59, 999);


    if (today < startDate) {

        return "upcoming";

    }


    if (today <= endDate) {

        return "accepting";

    }


    return "closed";

}


function isSubmissionOpen(session) {

    return getSubmissionState(session) === "accepting";

}



/* =========================================
   HELPER FUNCTIONS
========================================= */

function getAllTopics(session) {

    return session.syllabus.flatMap(unit => unit.topics);

}


function generateTopicPills(session) {

    return getAllTopics(session).map(topic => {

        return `
            <span class="topic-pill">
                ${escapeHTML(topic)}
            </span>
        `;

    }).join("");

}


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


function generateDateRows(session) {

    return `

        <div class="session-dates">

            <div class="session-date-row">

                <i data-lucide="message-circle-question"></i>

                <span class="submission-label">
                    Submission window
                </span>

                <span class="submission-value">
                    ${session.submissionStart} – ${session.submissionEnd}
                </span>

            </div>


            <div class="session-date-row">

                <i data-lucide="calendar-days"></i>

                <span class="session-date-value">
                    ${session.sessionDate}
                </span>

                <span class="date-separator">•</span>

                <span class="session-date-value">
                    ${session.sessionTime}
                </span>

            </div>

        </div>

    `;

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
   HERO CARD
========================================= */

function renderHero() {

    const futureSessions = sessions
        .filter(session => session.type !== "completed")
        .sort((a, b) => {

            return parseSessionDate(a.sessionDate)
                - parseSessionDate(b.sessionDate);

        });


    const hero = futureSessions[0];


    if (!hero) {

        document.getElementById("heroSession").style.display = "none";

        return;

    }


    document.getElementById("heroTitle").textContent = hero.title;

    document.getElementById("heroTeacher").textContent = hero.teacher;

    document.getElementById("heroDate").textContent =
        `${hero.sessionDate} · ${hero.sessionTime}`;


    document.getElementById("heroTopics").innerHTML =

        generateTopicPills(hero);


    document.getElementById("heroViewButton").dataset.sessionId = hero.id;

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
   REMINDER BUTTON
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


        lucide.createIcons();

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


        openSessionDrawer(
            Number(button.dataset.sessionId)
        );

    });

}



/* =========================================
   SESSION DRAWER
========================================= */

const drawerOverlay = document.getElementById("sessionDrawerOverlay");

const drawerContent = document.getElementById("sessionDrawer");

const questionOverlay = document.getElementById("questionModalOverlay");

const questionContent = document.getElementById("questionModal");


let currentDrawerSessionId = null;

let editingDoubtId = null;


function openSessionDrawer(sessionId) {

    const session = sessions.find(item => {

        return item.id === Number(sessionId);

    });


    if (!session) return;


    currentDrawerSessionId = session.id;


    renderSessionDrawer(session);


    drawerOverlay.classList.add("active");

    drawerOverlay.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";


    lucide.createIcons();

}


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

        <!-- DRAWER HEADER -->

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


        <!-- SESSION INTRO -->

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


        <!-- SESSION SCHEDULE -->

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
                        ${session.submissionStart} – ${session.submissionEnd}
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
                        ${session.sessionDate} · ${session.sessionTime}
                    </strong>

                </div>

            </div>

        </section>


        <div class="drawer-divider"></div>


        <!-- SYLLABUS -->

        <section class="drawer-section">

            <h4 class="drawer-section-heading">
                SESSION SYLLABUS
            </h4>


            <div class="drawer-syllabus">

                ${renderDrawerSyllabus(session)}

            </div>

        </section>


        <div class="drawer-divider"></div>


        <!-- SUBMITTED DOUBTS -->

        <section class="drawer-section">

            <div class="drawer-doubts-heading">

                <h4 class="drawer-section-heading">
                    MY SUBMITTED DOUBTS
                </h4>

                <span class="drawer-doubt-count">
                    ${String(doubts.length).padStart(2, "0")}
                </span>

            </div>


            <div class="drawer-doubt-list"
                 id="drawerDoubtList">

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

    lucide.createIcons();

}



/* =========================================
   DRAWER SYLLABUS
========================================= */

function renderDrawerSyllabus(session) {

    return session.syllabus.map((unit, index) => {

        return `

            <div class="drawer-syllabus-unit">

                <div class="drawer-unit-heading">

                    <span class="drawer-unit-dot"></span>

                    <strong>
                        ${escapeHTML(unit.unitName)}
                    </strong>

                </div>


                <div class="drawer-unit-topics">

                    ${unit.topics.map(topic => {

                        return `
                            <span>
                                ${escapeHTML(topic)}
                            </span>
                        `;

                    }).join("")}

                </div>

            </div>

        `;

    }).join("");

}



/* =========================================
   RENDER DOUBT CARDS
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


    return doubts.map(doubt => {

        return `

            <div class="drawer-doubt-card"
                 data-doubt-id="${doubt.id}">


                <div class="drawer-doubt-content">

                    <p class="drawer-doubt-question">
                        ${escapeHTML(doubt.question)}
                    </p>

                    <span class="drawer-doubt-topic">
                        ${escapeHTML(doubt.topic || "")}
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

        `;

    }).join("");

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


    lucide.createIcons();


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


            <!-- QUESTION -->

            <div class="question-form-group">

                <label for="questionText">
                    Describe your doubt
                </label>

                <textarea
                    id="questionText"
                    placeholder="Explain what you're having trouble understanding..."
                    required>${doubt ? escapeHTML(doubt.question) : ""}</textarea>

            </div>


            <!-- UNIT AND TOPIC SELECTION -->

            <div class="question-form-group">

                <label>
                    Select a topic
                </label>

                <p class="question-form-hint">
                    Expand a unit to explore its available topics.
                </p>


                <div class="unit-selection-list"
                     id="unitSelectionList">

                    ${renderUnitSelection(session, doubt)}

                </div>


                <input type="hidden"
                       id="selectedUnitId"
                       value="${doubt ? escapeHTML(doubt.unitId || "") : ""}">

                <input type="hidden"
                       id="selectedUnitName"
                       value="${doubt ? escapeHTML(doubt.unitName || "") : ""}">

                <input type="hidden"
                       id="selectedTopic"
                       value="${doubt ? escapeHTML(doubt.topic || "") : ""}">

                <p class="topic-selection-error"
                   id="topicSelectionError">

                    Please select a topic before submitting.

                </p>

            </div>


            <!-- FORM ACTIONS -->

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

    return session.syllabus.map((unit, index) => {

        const selectedUnit = doubt
            && doubt.unitId === unit.unitId;


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

                    ${unit.topics.map(topic => {

                        const selectedTopic = selectedUnit
                            && doubt.topic === topic;


                        return `

                            <button type="button"
                                    class="topic-option ${selectedTopic ? "selected" : ""}"
                                    data-unit-id="${escapeHTML(unit.unitId)}"
                                    data-unit-name="${escapeHTML(unit.unitName)}"
                                    data-topic="${escapeHTML(topic)}">

                                <span class="topic-radio"></span>

                                <span>
                                    ${escapeHTML(topic)}
                                </span>

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


        /* EXPAND / COLLAPSE UNIT */

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



        /* SELECT TOPIC */

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


            document.getElementById("topicSelectionError")
                .classList.remove("show");

        }

    });

}



/* =========================================
   SUBMIT / EDIT DOUBT
========================================= */

function submitSessionDoubt(session) {

    if (!isSubmissionOpen(session)) {

        alert("The submission window for this session is closed.");

        closeQuestionModal();

        return;

    }


    const question = document
        .getElementById("questionText")
        .value.trim();


    const unitId = document
        .getElementById("selectedUnitId")
        .value;


    const unitName = document
        .getElementById("selectedUnitName")
        .value;


    const topic = document
        .getElementById("selectedTopic")
        .value;


    if (!question) return;


    if (!unitId || !unitName || !topic) {

        document.getElementById("topicSelectionError")
            .classList.add("show");

        return;

    }


    // Verify the selected topic belongs to the selected unit.

    const selectedUnit = session.syllabus.find(unit => {

        return unit.unitId === unitId
            && unit.unitName === unitName;

    });


    if (!selectedUnit || !selectedUnit.topics.includes(topic)) {

        alert("Please select a valid topic from the session syllabus.");

        return;

    }


    const allDoubts = getAllDoubts();


    if (editingDoubtId) {

        const doubt = allDoubts.find(item => {

            return item.id === editingDoubtId
                && item.studentId === currentStudentId
                && Number(item.sessionId) === session.id;

        });


        if (!doubt) {

            alert("This doubt could not be found.");

            return;

        }


        doubt.question = question;

        doubt.topic = topic;

        doubt.unitId = unitId;

        doubt.unitName = unitName;

        doubt.updatedAt = new Date().toISOString();

    } else {

        allDoubts.push({

            id: "SD" + Date.now(),

            sessionId: session.id,

            studentId: currentStudentId,

            question: question,

            topic: topic,

            unitId: unitId,

            unitName: unitName,

            createdAt: new Date().toISOString()

        });

    }


    saveAllDoubts(allDoubts);


    closeQuestionModal();

    renderSessionDrawer(session);

}



/* =========================================
   THREE-DOT MENUS
========================================= */

function setupDoubtMenus(session) {

    const doubtList = document.getElementById("drawerDoubtList");


    doubtList.addEventListener("click", function(event) {


        /* OPEN / CLOSE DROPDOWN */

        const menuButton = event.target.closest(
            ".drawer-doubt-menu-btn"
        );


        if (menuButton) {

            event.stopPropagation();


            const doubtId = menuButton.dataset.menuId;

            const dropdown = document.getElementById(
                `dropdown-${doubtId}`
            );


            document.querySelectorAll(".drawer-doubt-dropdown").forEach(menu => {

                if (menu !== dropdown) {

                    menu.classList.remove("show");

                }

            });


            dropdown.classList.toggle("show");

            return;

        }



        /* EDIT DOUBT */

        const editButton = event.target.closest(
            '[data-action="edit"]'
        );


        if (editButton) {

            const doubtId = editButton.dataset.doubtId;

            const doubt = getSessionDoubts(session.id).find(item => {

                return item.id === doubtId;

            });


            if (!doubt || !isSubmissionOpen(session)) return;


            openQuestionModal(session, doubt);

            return;

        }



        /* DELETE DOUBT */

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


            const updatedDoubts = getAllDoubts().filter(doubt => {

                return !(
                    doubt.id === doubtId
                    && doubt.studentId === currentStudentId
                    && Number(doubt.sessionId) === session.id
                );

            });


            saveAllDoubts(updatedDoubts);


            renderSessionDrawer(session);

        }

    });

}



/* =========================================
   CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
========================================= */

document.addEventListener("click", function(event) {

    if (!event.target.closest(".drawer-doubt-menu-wrapper")) {

        document.querySelectorAll(".drawer-doubt-dropdown").forEach(menu => {

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

    initializeSampleDoubts();

    renderHero();

    renderActiveSessions();

    renderUpcomingSessions();

    setupReminders();

    setupViewButtons();

    setupDrawerClosing();

    setupQuestionModalClosing();

    lucide.createIcons();

}


document.addEventListener("DOMContentLoaded", initializePage);