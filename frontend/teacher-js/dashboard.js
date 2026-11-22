/* ==========================================
   CLARIQ — TEACHER DASHBOARD
========================================== */


/* ==========================================
   STORAGE KEYS
========================================== */

const DASHBOARD_SESSION_KEY = "clariqTeacherDoubtSessions";
const DASHBOARD_DOUBT_KEY = "clariqDoubts";


/* ==========================================
   DOM ELEMENTS
========================================== */

const statsGrid = document.getElementById("stats-grid");

const attentionList = document.getElementById("attention-list");
const activeSessionsList = document.getElementById("active-sessions-list");
const upcomingList = document.getElementById("upcoming-list");
const activityList = document.getElementById("activity-list");

const welcomeHeading = document.getElementById("welcome-heading");


/* ==========================================
   HELPERS
========================================== */

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, character => {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];

    });

}


function readStorage(key, fallback) {

    try {

        const stored = localStorage.getItem(key);

        return stored
            ? JSON.parse(stored)
            : fallback;

    } catch (error) {

        console.error(`Unable to read ${key}:`, error);

        return fallback;

    }

}


function formatDate(dateValue) {

    if (!dateValue) return "Date not specified";

    const date = new Date(`${dateValue}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

}


function formatTime(timeValue) {

    if (!timeValue) return "";

    const [hours, minutes] = timeValue.split(":");

    const date = new Date();

    date.setHours(Number(hours), Number(minutes));

    return date.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });

}


function getSessionDate(session) {

    return (
        session.schedule?.date ||
        session.sessionDate ||
        ""
    );

}


function getSessionTime(session) {

    return (
        session.schedule?.startTime ||
        session.sessionTime ||
        ""
    );

}


function getSubmissionDeadline(session) {

    return (
        session.submissionPeriod?.deadline ||
        session.submissionDeadline ||
        ""
    );

}


function getSubject(session) {

    return (
        session.subjectName ||
        session.subjectId ||
        session.subject ||
        "Subject not specified"
    );

}


function getClassName(session) {

    return [
        session.year,
        session.section
    ].filter(Boolean).join(" · ") || "Class not specified";

}


function getSessionUrl(session) {

    return `view-session.html?id=${encodeURIComponent(session.id)}`;

}


/* ==========================================
   WELCOME HEADER
========================================== */

function renderWelcome() {

    const hour = new Date().getHours();

    let greeting = "Good evening";

    if (hour < 12) {
        greeting = "Good morning";
    } else if (hour < 17) {
        greeting = "Good afternoon";
    }

    /*
       Replace the fallback with the authenticated teacher's
       name when the login flow exposes it.
    */

    const teacherName =
        localStorage.getItem("teacherName") ||
        "Teacher";

    welcomeHeading.textContent =
        `${greeting}, ${teacherName}!`;

}


/* ==========================================
   GET DASHBOARD DATA
========================================== */

function getDashboardSessions() {

    const data = readStorage(
        DASHBOARD_SESSION_KEY,
        {
            active: [],
            upcoming: []
        }
    );

    return {
        active: Array.isArray(data.active)
            ? data.active
            : [],

        upcoming: Array.isArray(data.upcoming)
            ? data.upcoming
            : []
    };

}


function getDashboardDoubts() {

    const doubts = readStorage(
        DASHBOARD_DOUBT_KEY,
        []
    );

    return Array.isArray(doubts)
        ? doubts
        : [];

}


/* ==========================================
   STATISTICS
========================================== */

function renderStatistics(sessions, doubts) {

    const newDoubts = doubts.filter(doubt => {

        const status = String(doubt.status || "").toLowerCase();

        return [
            "new",
            "pending"
        ].includes(status);

    }).length;


    const inProgressDoubts = doubts.filter(doubt => {

        const status = String(doubt.status || "").toLowerCase();

        return [
            "progress",
            "in-progress",
            "in_progress"
        ].includes(status);

    }).length;


    const stats = [

        {
            title: "New Doubts",
            value: newDoubts,
            description: "Awaiting review",
            icon: "message-circle",
            color: "blue"
        },

        {
            title: "In Progress",
            value: inProgressDoubts,
            description: "Currently being addressed",
            icon: "clock",
            color: "purple"
        },

        {
            title: "Active Sessions",
            value: sessions.active.length,
            description: "Currently collecting doubts",
            icon: "calendar-check",
            color: "green"
        },

        {
            title: "Upcoming Sessions",
            value: sessions.upcoming.length,
            description: "Scheduled sessions",
            icon: "calendar-clock",
            color: "orange"
        }

    ];


    statsGrid.innerHTML = stats.map(stat => `

        <article class="stat-card">

            <div class="stat-icon ${stat.color}">
                <i data-lucide="${stat.icon}"></i>
            </div>

            <div class="stat-info">

                <span>${stat.title}</span>

                <strong>${stat.value}</strong>

                <small>${stat.description}</small>

            </div>

        </article>

    `).join("");

}


/* ==========================================
   DOUBTS REQUIRING ATTENTION
========================================== */

function renderAttentionDoubts(doubts) {

    const attentionDoubts = doubts
        .filter(doubt => {

            const status = String(doubt.status || "").toLowerCase();

            return [
                "new",
                "pending",
                "progress",
                "in-progress",
                "in_progress"
            ].includes(status);

        })
        .slice(0, 4);


    if (!attentionDoubts.length) {

        attentionList.innerHTML = `
            <div class="dashboard-empty">

                <i data-lucide="check-circle"></i>

                <p>
                    No doubts currently require attention.
                </p>

            </div>
        `;

        return;

    }


    attentionList.innerHTML = attentionDoubts.map(doubt => {

        const status = String(doubt.status || "").toLowerCase();

        const isNew = [
            "new",
            "pending"
        ].includes(status);

        const statusLabel = isNew
            ? "New"
            : "In Progress";

        const statusClass = isNew
            ? "new"
            : "progress";

        const question =
            doubt.question ||
            doubt.doubtText ||
            doubt.text ||
            "Question unavailable";

        const subject =
            doubt.subjectName ||
            doubt.subject ||
            doubt.subjectId ||
            "Subject";

        const topic =
            doubt.topic ||
            doubt.topicName ||
            doubt.subtopic ||
            "Academic Doubt";

        const className =
            doubt.className ||
            doubt.classId ||
            doubt.year ||
            "Assigned Class";


        return `

            <a
                href="doubt-detail.html?id=${encodeURIComponent(doubt.id || doubt.doubtId || "")}"
                class="attention-item">

                <div class="attention-academic">

                    <strong>
                        ${escapeHTML(subject)}
                    </strong>

                    <span>
                        ${escapeHTML(className)}
                    </span>

                </div>


                <div class="attention-question">

                    <p>
                        ${escapeHTML(question)}
                    </p>

                    <span>
                        ${escapeHTML(topic)}
                    </span>

                </div>


                <span class="attention-status ${statusClass}">
                    ${statusLabel}
                </span>

                <i
                    data-lucide="chevron-right"
                    class="attention-arrow">
                </i>

            </a>

        `;

    }).join("");

}


/* ==========================================
   ACTIVE SESSIONS
========================================== */

function renderActiveSessions(sessions) {

    if (!sessions.length) {

        activeSessionsList.innerHTML = `
            <div class="dashboard-empty">

                <i data-lucide="calendar-days"></i>

                <p>
                    You don't have any active doubt sessions right now.
                </p>

            </div>
        `;

        return;

    }


    activeSessionsList.innerHTML = sessions
        .slice(0, 3)
        .map(session => {

            return `

                <article class="active-session-item">

                    <div class="active-session-top">

                        <h3>
                            ${escapeHTML(session.title || "Untitled Session")}
                        </h3>

                    </div>


                    <p class="active-session-meta">
                        ${escapeHTML(getClassName(session))}
                        ·
                        ${escapeHTML(getSubject(session))}
                    </p>


                    <div class="session-live-status">
                        <span></span>
                        Collecting Doubts
                    </div>


                    <div class="session-deadline">

                        <i data-lucide="calendar"></i>

                        Deadline:
                        ${escapeHTML(formatDate(getSubmissionDeadline(session)))}

                    </div>


                    <a
                        href="${getSessionUrl(session)}"
                        class="session-view-button">

                        View Session
                        <i data-lucide="arrow-right"></i>

                    </a>

                </article>

            `;

        }).join("");

}


/* ==========================================
   UPCOMING SESSIONS
========================================== */

function renderUpcomingSessions(sessions) {

    if (!sessions.length) {

        upcomingList.innerHTML = `
            <div class="dashboard-empty">

                <i data-lucide="calendar-check"></i>

                <p>
                    No upcoming doubt-solving sessions scheduled.
                </p>

            </div>
        `;

        return;

    }


    upcomingList.innerHTML = sessions
        .slice(0, 3)
        .map(session => {

            const date = getSessionDate(session);
            const time = getSessionTime(session);

            return `

                <article class="upcoming-session-item">

                    <div class="upcoming-session-info">

                        <h3>
                            ${escapeHTML(session.title || "Untitled Session")}
                        </h3>

                        <p>
                            ${escapeHTML(getClassName(session))}
                            ·
                            ${escapeHTML(getSubject(session))}
                        </p>


                        <div class="upcoming-session-date">

                            <i data-lucide="calendar"></i>

                            ${escapeHTML(formatDate(date))}

                            ${time
                                ? ` · ${escapeHTML(formatTime(time))}`
                                : ""
                            }

                        </div>

                    </div>


                    <a
                        href="doubt-sessions.html"
                        class="upcoming-view-button">

                        View Details
                        <i data-lucide="arrow-right"></i>

                    </a>

                </article>

            `;

        }).join("");

}


/* ==========================================
   RECENT ACTIVITY
========================================== */

function renderRecentActivity(doubts) {

    const activities = doubts
        .filter(doubt => doubt.createdAt || doubt.timestamp)
        .sort((a, b) => {

            const dateA = new Date(a.createdAt || a.timestamp);
            const dateB = new Date(b.createdAt || b.timestamp);

            return dateB - dateA;

        })
        .slice(0, 5);


    if (!activities.length) {

        activityList.innerHTML = `
            <div class="dashboard-empty">

                <i data-lucide="activity"></i>

                <p>
                    Recent activity will appear here as students submit doubts.
                </p>

            </div>
        `;

        return;

    }


    activityList.innerHTML = activities.map(doubt => {

        const subject =
            doubt.subjectName ||
            doubt.subject ||
            doubt.subjectId ||
            "a subject";

        const question =
            doubt.question ||
            doubt.doubtText ||
            doubt.text ||
            "a new doubt";

        const status = String(doubt.status || "").toLowerCase();

        let message = `New doubt submitted in ${subject}`;

        let color = "";

        if ([
            "resolved",
            "published"
        ].includes(status)) {

            message = `Doubt resolved in ${subject}`;
            color = "green";

        } else if ([
            "progress",
            "in-progress",
            "in_progress"
        ].includes(status)) {

            message = `Doubt moved to in progress in ${subject}`;
            color = "purple";

        }


        return `

            <div class="activity-item">

                <span class="activity-dot ${color}"></span>

                <p class="activity-text">
                    ${escapeHTML(message)}
                    — "${escapeHTML(question)}"
                </p>

                <span class="activity-time">
                    ${escapeHTML(formatDate(
                        (doubt.createdAt || doubt.timestamp).split("T")[0]
                    ))}
                </span>

            </div>

        `;

    }).join("");

}


/* ==========================================
   INITIALIZE DASHBOARD
========================================== */

function initializeDashboard() {

    renderWelcome();

    const sessions = getDashboardSessions();

    const doubts = getDashboardDoubts();


    renderStatistics(sessions, doubts);

    renderAttentionDoubts(doubts);

    renderActiveSessions(sessions.active);

    renderUpcomingSessions(sessions.upcoming);

    renderRecentActivity(doubts);


    if (window.lucide) {
        lucide.createIcons();
    }

}


document.addEventListener("DOMContentLoaded", initializeDashboard);