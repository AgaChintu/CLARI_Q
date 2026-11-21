
// =====================================================
// CLARIQ — DOUBT SESSIONS DASHBOARD
// =====================================================


document.addEventListener("DOMContentLoaded", () => {


    // =================================================
    // 1. CONFIGURATION
    // =================================================

    const STORAGE_KEY = "clariqTeacherDoubtSessions";


    // =================================================
    // 2. SAMPLE DATA
    // =================================================

    function getSampleData() {

        return {

            active: [

                {
                    id: "active-101",
                    teacherId: null,
                    title: "Programming for Problem Solving in C",
                    assignmentId: null,
                    classId: "1-AIML",
                    year: "1st Year",
                    section: "AIML",
                    subjectId: "PPS",
                    subjectName: "Programming for Problem Solving",

                    topics: [
                        {
                            topicId: "pointers",
                            topicName: "Pointers",
                            unitId: "unit-1",
                            unitName: "Programming"
                        },
                        {
                            topicId: "arrays",
                            topicName: "Arrays",
                            unitId: "unit-1",
                            unitName: "Programming"
                        },
                        {
                            topicId: "functions",
                            topicName: "Functions",
                            unitId: "unit-1",
                            unitName: "Programming"
                        }
                    ],

                    submissionPeriod: {
                        opensAt: null,
                        deadline: null
                    },

                    schedule: {
                        date: null,
                        startTime: null
                    },

                    status: "active",
                    startedAt: "11:00 AM",
                    questionCount: 18,
                    createdAt: null
                },


                {
                    id: "active-102",
                    teacherId: null,
                    title: "Python Programming",
                    assignmentId: null,
                    classId: "2-CSE",
                    year: "2nd Year",
                    section: "CS",
                    subjectId: "Python",
                    subjectName: "Python",

                    topics: [
                        {
                            topicId: "functions",
                            topicName: "Functions",
                            unitId: "unit-1",
                            unitName: "Python"
                        },
                        {
                            topicId: "lists",
                            topicName: "Lists",
                            unitId: "unit-1",
                            unitName: "Python"
                        },
                        {
                            topicId: "dictionaries",
                            topicName: "Dictionaries",
                            unitId: "unit-1",
                            unitName: "Python"
                        }
                    ],

                    submissionPeriod: {
                        opensAt: null,
                        deadline: null
                    },

                    schedule: {
                        date: null,
                        startTime: null
                    },

                    status: "active",
                    startedAt: "12:00 PM",
                    questionCount: 12,
                    createdAt: null
                }

            ],


            upcoming: [

                createSampleUpcomingSession(
                    "upcoming-101",
                    "PPS",
                    "Programming for Problem Solving in C",
                    "1st Year",
                    "AIML",
                    ["Pointers", "Arrays", "Functions"],
                    "2026-11-20",
                    "2026-11-22",
                    "2026-11-24",
                    "10:00"
                ),


                createSampleUpcomingSession(
                    "upcoming-102",
                    "Python",
                    "Python Programming",
                    "2nd Year",
                    "CS",
                    ["Functions", "Lists", "Dictionaries"],
                    "2026-11-23",
                    "2026-11-25",
                    "2026-11-27",
                    "11:00"
                ),


                createSampleUpcomingSession(
                    "upcoming-103",
                    "PPS",
                    "Arrays and Functions in C",
                    "1st Year",
                    "CS",
                    ["Arrays", "Functions", "Pointers"],
                    "2026-11-25",
                    "2026-11-27",
                    "2026-11-29",
                    "10:00"
                )

            ]

        };

    }


    function createSampleUpcomingSession(
        id,
        subjectId,
        title,
        year,
        section,
        topicNames,
        opensAt,
        deadline,
        date,
        startTime
    ) {

        return {

            id,
            teacherId: null,
            title,
            assignmentId: null,
            classId: null,
            year,
            section,
            subjectId,
            subjectName: subjectId,

            topics: topicNames.map((name, index) => ({

                topicId: `sample-topic-${index + 1}`,
                topicName: name,
                unitId: "sample-unit",
                unitName: "Sample Unit"

            })),

            submissionPeriod: {
                opensAt,
                deadline
            },

            schedule: {
                date,
                startTime
            },

            status: "upcoming",
            createdAt: null

        };

    }


    // =================================================
    // 3. DATE NORMALIZATION
    // =================================================

    function normalizeDate(value) {

        if (!value) return null;

        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return value;
        }

        const parsed = new Date(value);

        if (Number.isNaN(parsed.getTime())) {
            return value;
        }

        const year = parsed.getFullYear();

        const month = String(
            parsed.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            parsed.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;

    }


    // =================================================
    // 4. NORMALIZE TOPICS
    // =================================================

    function normalizeTopics(topics) {

        if (!Array.isArray(topics)) {
            return [];
        }

        return topics.map((topic, index) => {

            if (typeof topic === "string") {

                return {
                    topicId: `legacy-topic-${index + 1}`,
                    topicName: topic,
                    unitId: null,
                    unitName: null
                };

            }

            return {
                topicId: topic.topicId || `topic-${index + 1}`,
                topicName: topic.topicName || topic.name || "",
                unitId: topic.unitId || null,
                unitName: topic.unitName || null
            };

        });

    }


    // =================================================
    // 5. NORMALIZE SESSION RECORDS
    // =================================================

    function normalizeSession(session, status) {

        const oldSubmissionPeriod =
            session.submissionPeriod || {};

        const oldSchedule =
            session.schedule || {};

        const oldTopics = normalizeTopics(session.topics);

        const sessionDate = normalizeDate(
            oldSchedule.date || session.sessionDate
        );

        let startTime =
            oldSchedule.startTime || session.sessionTime || null;

        if (startTime && /AM|PM/i.test(startTime)) {

            const parsedTime = new Date(
                `2000-01-01 ${startTime}`
            );

            if (!Number.isNaN(parsedTime.getTime())) {

                startTime = [
                    String(parsedTime.getHours()).padStart(2, "0"),
                    String(parsedTime.getMinutes()).padStart(2, "0")
                ].join(":");

            }

        }

        return {

            id: session.id || session.sessionId || crypto.randomUUID(),
            teacherId: session.teacherId || null,
            title: session.title || "Untitled Session",
            assignmentId: session.assignmentId || null,
            classId: session.classId || null,
            year: session.year || "",
            section: session.section || "",

            subjectId:
                session.subjectId ||
                session.subject ||
                "",

            subjectName:
                session.subjectName ||
                session.subject ||
                "",

            topics: oldTopics,

            submissionPeriod: {

                opensAt: normalizeDate(
                    oldSubmissionPeriod.opensAt ||
                    session.submissionsBegin
                ),

                deadline: normalizeDate(
                    oldSubmissionPeriod.deadline ||
                    session.submissionDeadline
                )

            },

            schedule: {
                date: sessionDate,
                startTime
            },

            status: status || session.status || "upcoming",
            startedAt: session.startedAt || null,
            questionCount: session.questionCount || 0,
            createdAt: session.createdAt || null

        };

    }


    // =================================================
    // 6. INITIALIZE / MIGRATE STORAGE
    // =================================================

    function initializeStorage() {

        const storedData = localStorage.getItem(STORAGE_KEY);

        if (!storedData) {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(getSampleData())
            );

            return;

        }

        let parsedData;

        try {

            parsedData = JSON.parse(storedData);

        } catch (error) {

            console.error(
                "Session storage contains invalid JSON:",
                error
            );

            throw new Error(
                "Saved session data could not be read. It has not been overwritten."
            );

        }

        let activeSessions = [];
        let upcomingSessions = [];

        if (
            parsedData &&
            typeof parsedData === "object" &&
            !Array.isArray(parsedData)
        ) {

            if (
                !Array.isArray(parsedData.active) ||
                !Array.isArray(parsedData.upcoming)
            ) {

                throw new Error(
                    "Session storage has an unexpected structure. Existing data has not been overwritten."
                );

            }

            activeSessions = parsedData.active.map(session =>
                normalizeSession(session, "active")
            );

            upcomingSessions = parsedData.upcoming.map(session =>
                normalizeSession(session, "upcoming")
            );

        }

        else if (Array.isArray(parsedData)) {

            const samples = getSampleData();

            activeSessions = samples.active;
            upcomingSessions = samples.upcoming;

            parsedData.forEach(session => {

                upcomingSessions.push(
                    normalizeSession(session, "upcoming")
                );

            });

        }

        else {

            throw new Error(
                "Unexpected session storage format. Existing data has not been overwritten."
            );

        }

        const normalizedData = {
            active: activeSessions,
            upcoming: upcomingSessions
        };

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(normalizedData)
        );

    }


    // =================================================
    // 7. GET SESSION DATA
    // =================================================

    function getSessionData() {

        const data = JSON.parse(
            localStorage.getItem(STORAGE_KEY)
        );

        if (
            !data ||
            !Array.isArray(data.active) ||
            !Array.isArray(data.upcoming)
        ) {

            throw new Error("Invalid session data.");

        }

        return data;

    }


    // =================================================
    // 8. INITIALIZE DATA
    // =================================================

    let sessionData;

    try {

        initializeStorage();
        sessionData = getSessionData();

    } catch (error) {

        console.error("Session initialization failed:", error);

        alert(
            "Unable to load saved sessions. Your existing data has not been changed."
        );

        return;

    }

    const activeSessions = sessionData.active;
    const upcomingSessions = sessionData.upcoming;


    // =================================================
    // 9. ELEMENTS
    // =================================================

    const activeTrack =
        document.getElementById("active-session-track");

    const carouselIndicators =
        document.getElementById("carousel-indicators");

    const upcomingList =
        document.getElementById("upcoming-list");

    const activeHeading =
        document.getElementById("active-session-heading");

    const upcomingHeading =
        document.getElementById("upcoming-session-heading");

    if (
        !activeTrack ||
        !carouselIndicators ||
        !upcomingList ||
        !activeHeading ||
        !upcomingHeading
    ) {

        console.error(
            "Doubt Sessions: Required dashboard elements are missing."
        );

        return;

    }


    // =================================================
    // 10. HELPER FUNCTIONS
    // =================================================

    function escapeHTML(value) {

        return String(value ?? "").replace(/[&<>"']/g, character => {

            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };

            return entities[character];

        });

    }


    function refreshIcons() {

        if (window.lucide) {
            lucide.createIcons();
        }

    }


    function getSessionTopics(session) {

        if (!Array.isArray(session.topics)) {
            return [];
        }

        return session.topics
            .map(topic => {

                return typeof topic === "string"
                    ? topic
                    : topic.topicName;

            })
            .filter(Boolean);

    }


    function formatShortDate(dateString) {

        if (!dateString) return "";

        const match = String(dateString).match(
            /^(\d{4})-(\d{2})-(\d{2})$/
        );

        if (!match) return dateString;

        const [, year, month, day] = match;

        const date = new Date(
            Number(year),
            Number(month) - 1,
            Number(day)
        );

        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

    }


    function formatSessionTime(time) {

        if (!time) return "Time not set";

        const match = String(time).match(
            /^(\d{2}):(\d{2})$/
        );

        if (!match) return time;

        const [, hours, minutes] = match;

        const date = new Date();

        date.setHours(
            Number(hours),
            Number(minutes),
            0,
            0
        );

        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit"
        });

    }


    function getClassName(session) {

        return [
            session.year,
            session.section
        ].filter(Boolean).join(" · ");

    }


    // =================================================
    // 11. RENDER ACTIVE SESSIONS
    // =================================================

    function renderActiveSessions() {

        activeTrack.innerHTML = "";
        carouselIndicators.innerHTML = "";

        activeHeading.textContent =
            `ACTIVE SESSIONS (${String(activeSessions.length).padStart(2, "0")})`;

        if (activeSessions.length === 0) {

            activeTrack.innerHTML = `
                <p class="section-empty">
                    No active sessions right now.
                </p>
            `;

            return;

        }

        activeSessions.forEach((session, index) => {

            const card = document.createElement("article");

            card.className = "active-session-card";
            card.style.flex = "0 0 100%";
            card.style.scrollSnapAlign = "start";

            const topics = getSessionTopics(session)
                .map(topic => `
                    <span class="topic-tag">
                        ${escapeHTML(topic)}
                    </span>
                `)
                .join("");

            card.innerHTML = `

                <div class="live-badge">
                    <span></span>
                    IN PROGRESS
                </div>

                <div class="active-session-content">

                    <span class="class-label">
                        ${escapeHTML(getClassName(session))}
                    </span>

                    <h3>
                        ${escapeHTML(session.subjectId)}
                        — ${escapeHTML(session.title)}
                    </h3>

                    <div class="topics-row">

                        <span class="topics-label">
                            Topics:
                        </span>

                        ${topics}

                    </div>

                    <div class="active-session-footer">

                        <div class="active-session-meta">

                            <span>
                                <i data-lucide="clock"></i>
                                Started: ${escapeHTML(session.startedAt || "Recently")}
                            </span>

                            <span class="meta-divider"></span>

                            <span>
                                <i data-lucide="messages-square"></i>
                                ${escapeHTML(session.questionCount)}
                                Questions
                            </span>

                        </div>

                        <button
                            class="manage-session-btn"
                            data-action="view-doubts"
                            data-id="${escapeHTML(session.id)}">

                            View Doubts

                            <i data-lucide="arrow-right"></i>

                        </button>

                    </div>

                </div>

            `;

            activeTrack.appendChild(card);

            const indicator = document.createElement("span");

            indicator.className =
                index === 0
                    ? "indicator active"
                    : "indicator";

            indicator.dataset.index = index;

            indicator.setAttribute(
                "aria-label",
                `Go to active session ${index + 1}`
            );

            indicator.setAttribute("role", "button");
            indicator.tabIndex = 0;

            indicator.addEventListener("click", () => {
                goToActiveSession(index);
            });

            indicator.addEventListener("keydown", event => {

                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {

                    event.preventDefault();
                    goToActiveSession(index);

                }

            });

            carouselIndicators.appendChild(indicator);

        });

        refreshIcons();
        updateActiveIndicator();

    }


    // =================================================
    // 12. ACTIVE CAROUSEL
    // =================================================

    function goToActiveSession(index) {

        const cards = activeTrack.querySelectorAll(
            ".active-session-card"
        );

        if (!cards[index]) return;

        cards[index].scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "start"
        });

        updateActiveIndicator();

    }


    function updateActiveIndicator() {

        const cards = [
            ...activeTrack.querySelectorAll(".active-session-card")
        ];

        const indicators = [
            ...carouselIndicators.querySelectorAll(".indicator")
        ];

        if (!cards.length) return;

        const trackPosition = activeTrack.scrollLeft;

        let activeIndex = 0;
        let smallestDifference = Infinity;

        cards.forEach((card, index) => {

            const difference = Math.abs(
                card.offsetLeft -
                activeTrack.offsetLeft -
                trackPosition
            );

            if (difference < smallestDifference) {
                smallestDifference = difference;
                activeIndex = index;
            }

        });

        indicators.forEach((indicator, index) => {

            indicator.classList.toggle(
                "active",
                index === activeIndex
            );

        });

    }


    activeTrack.addEventListener(
        "scroll",
        updateActiveIndicator
    );


    // =================================================
    // 13. SUBJECT THEMES
    // =================================================

    function getSubjectTheme(subject) {

        const themes = {
            pps: "pps",
            python: "python",
            coa: "coa",
            dstl: "dstl",
            de: "de",
            tc: "tc",
            dsa: "dsa"
        };

        return themes[
            String(subject || "").trim().toLowerCase()
        ] || "default";

    }


    // =================================================
    // 14. RENDER UPCOMING SESSIONS
    // =================================================

    function renderUpcomingSessions() {

        upcomingList.innerHTML = "";

        upcomingHeading.textContent =
            `UPCOMING SESSIONS (${String(upcomingSessions.length).padStart(2, "0")})`;

        if (upcomingSessions.length === 0) {

            upcomingList.innerHTML = `
                <p class="section-empty">
                    No upcoming sessions scheduled.
                </p>
            `;

            return;

        }

        upcomingSessions.forEach(session => {

            const card = document.createElement("article");

            card.className = "session-card";

            const theme = getSubjectTheme(session.subjectId);

            const topics = getSessionTopics(session)
                .map(topic => `
                    <span class="topic-pill">
                        ${escapeHTML(topic)}
                    </span>
                `)
                .join("");

            const submissionStart = escapeHTML(
                formatShortDate(session.submissionPeriod?.opensAt)
            );

            const submissionEnd = escapeHTML(
                formatShortDate(session.submissionPeriod?.deadline)
            );

            const submissionWindow =
                submissionStart && submissionEnd
                    ? `${submissionStart} – ${submissionEnd}`
                    : submissionStart || submissionEnd || "Not specified";

            const sessionDate = escapeHTML(
                formatShortDate(session.schedule?.date) || "Date not set"
            );

            const sessionTime = escapeHTML(
                formatSessionTime(session.schedule?.startTime)
            );

            card.innerHTML = `

                <div class="session-card-top">

                    <span class="subject-pill subject-theme-${theme}">
                        ${escapeHTML(session.subjectId)}
                    </span>

                    <span class="class-text">
                        ${escapeHTML(getClassName(session))}
                    </span>

                </div>

                <h3>${escapeHTML(session.title)}</h3>

                <div class="session-topics">

                    <div class="topics-heading">
                        Topics
                    </div>

                    <div class="topic-list theme-${theme} ${topics ? "" : "topic-list-empty"}">

                        ${topics || '<span class="no-topics">Topics not added</span>'}

                    </div>

                </div>

                <div class="session-details">

                    <div class="detail-row submission-window-row">

                        <i data-lucide="calendar-days"></i>

                        <span>

                            <span class="date-label">
                                Submission window
                            </span>

                            <strong class="date-value">
                                ${submissionWindow}
                            </strong>

                        </span>

                    </div>

                    <div class="detail-row session-date-row">

                        <i data-lucide="calendar-clock"></i>

                        <strong class="date-value">

                            ${sessionDate}

                            <span class="date-separator">·</span>

                            ${sessionTime}

                        </strong>

                    </div>

                </div>

                <div class="session-card-actions">

                    <button
                        class="edit-session-btn"
                        data-action="edit-session"
                        data-id="${escapeHTML(session.id)}">

                        <i data-lucide="pencil"></i>

                        Edit Session

                    </button>

                </div>

            `;

            upcomingList.appendChild(card);

        });

        refreshIcons();

    }


    // =================================================
    // 15. BUTTON ACTIONS
    // =================================================

    document.addEventListener("click", event => {

        const button = event.target.closest("[data-action]");

        if (!button) return;

        const action = button.dataset.action;
        const id = button.dataset.id;

        if (!id) return;

        switch (action) {

            // UPDATED: Open the selected active session.

            case "view-doubts":

                window.location.href =
                    `view-session.html?id=${encodeURIComponent(id)}`;

                break;


            case "edit-session":

                window.location.href =
                    `create-session.html?edit=${encodeURIComponent(id)}`;

                break;


            case "delete-session": {

                const confirmed = confirm(
                    "Are you sure you want to delete this upcoming doubt session?"
                );

                if (!confirmed) return;

                const index = upcomingSessions.findIndex(session =>
                    String(session.id || session.sessionId) === String(id)
                );

                if (index === -1) {

                    alert("Session not found.");
                    return;

                }

                upcomingSessions.splice(index, 1);

                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(sessionData)
                );

                renderUpcomingSessions();

                break;

            }

        }

    });


    // =================================================
    // 16. CREATE SESSION BUTTON
    // =================================================

    const createSessionButton = document.getElementById(
        "create-session-btn"
    );

    if (createSessionButton) {

        createSessionButton.addEventListener("click", () => {

            window.location.href = "create-session.html";

        });

    }

    // =====================================================
// AUTOMATICALLY ACTIVATE SCHEDULED SESSIONS
// =====================================================

function activateDueSessions() {

    const today = new Date();

    const todayString = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    const newlyActive = [];

    for (let i = upcomingSessions.length - 1; i >= 0; i--) {

        const session = upcomingSessions[i];

        const openingDate =
            session.submissionPeriod?.opensAt ||
            session.submissionsBegin;

        if (!openingDate || openingDate > todayString) {
            continue;
        }

        const activatedSession = {
            ...session,
            status: "active",
            startedAt: new Date().toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit"
            })
        };

        newlyActive.push(activatedSession);

        upcomingSessions.splice(i, 1);

    }

    if (newlyActive.length > 0) {

        sessionData.active.push(...newlyActive);

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(sessionData)
        );

    }

}


    // =================================================
    // 17. INITIALIZE DASHBOARD
    // =================================================

    renderActiveSessions();

    renderUpcomingSessions();

    refreshIcons();

});
