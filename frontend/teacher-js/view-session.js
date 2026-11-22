/* ==========================================
   VIEW SESSION PAGE
========================================== */

const SESSION_STORAGE_KEY = "clariqTeacherDoubtSessions";

const params = new URLSearchParams(window.location.search);
const sessionId = params.get("id");


/* ==========================================
   DOM ELEMENTS
========================================== */

const sessionTitle = document.getElementById("session-title");
const sessionMeta = document.getElementById("session-meta");
const sessionStatus = document.getElementById("session-status");

const coverageContent = document.getElementById("coverage-content");

const totalDoubtsElement = document.getElementById("total-doubts");
const totalParticipantsElement = document.getElementById("total-participants");
const totalGroupsElement = document.getElementById("total-groups");
const totalTopicsElement = document.getElementById("total-topics");

const doubtGroupsContainer = document.getElementById("doubt-groups");
const summaryBody = document.getElementById("summary-body");


/* ==========================================
   STORAGE
========================================== */

function getStoredSessions() {
    try {
        const stored = JSON.parse(
            localStorage.getItem(SESSION_STORAGE_KEY)
        );

        if (!stored || !Array.isArray(stored.active)) {
            return {
                active: [],
                upcoming: []
            };
        }

        return stored;

    } catch (error) {
        console.error("Unable to read session storage:", error);

        return {
            active: [],
            upcoming: []
        };
    }
}


function getSession() {
    const data = getStoredSessions();

    return data.active.find(
        session => session.id === sessionId
    );
}


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


function formatDate(dateValue) {
    if (!dateValue) return "Not specified";

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
    if (!timeValue) return "Not specified";

    const parts = timeValue.split(":");

    if (parts.length < 2) return timeValue;

    const date = new Date();
    date.setHours(Number(parts[0]), Number(parts[1]));

    return date.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
}


function getSessionOpeningDate(session) {
    return (
        session.submissionPeriod?.opensAt ||
        session.submissionsBegin ||
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


function getScheduledDate(session) {
    return (
        session.schedule?.date ||
        session.sessionDate ||
        ""
    );
}


function getScheduledTime(session) {
    return (
        session.schedule?.startTime ||
        session.sessionTime ||
        ""
    );
}


/* ==========================================
   SESSION HEADER
========================================== */

function renderSessionHeader(session) {

    sessionTitle.textContent =
        session.title || "Untitled Session";

    const className = [
        session.year,
        session.section
    ].filter(Boolean);

    const subjectName =
        session.subjectName ||
        session.subjectId ||
        session.subject ||
        "Subject not specified";

    const openingDate = getSessionOpeningDate(session);
    const deadline = getSubmissionDeadline(session);

    const scheduledDate = getScheduledDate(session);
    const scheduledTime = getScheduledTime(session);

    const academicDetails = [
        ...className,
        subjectName
    ];

    sessionMeta.innerHTML = `

        <div class="session-academic-info">

            ${academicDetails.map((detail, index) => `
                ${index > 0
                    ? `<span class="meta-separator">·</span>`
                    : ""
                }

                <span class="academic-detail">
                    ${escapeHTML(detail)}
                </span>
            `).join("")}

        </div>


        <div class="session-timing-info">

            <div class="timing-row">

                <span class="timing-label">
                    Submission Window
                </span>

                <span class="timing-value">
                    ${escapeHTML(formatDate(openingDate))}
                    <span class="date-separator">–</span>
                    ${escapeHTML(formatDate(deadline))}
                </span>

            </div>


            <div class="timing-row">

                <span class="timing-label">
                    Scheduled Live Session
                </span>

                <span class="timing-value">
                    ${escapeHTML(formatDate(scheduledDate))}
                    <span class="date-separator">·</span>
                    ${escapeHTML(formatTime(scheduledTime))}
                </span>

            </div>

        </div>

    `;

    const statusText = session.status === "active"
        ? "Collecting Doubts"
        : "Upcoming";

    sessionStatus.innerHTML = `
        <span></span>
        ${statusText}
    `;
}


/* ==========================================
   SYLLABUS COVERAGE
========================================== */


/* GET SELECTED SYLLABUS DETAILS */

function getSelectedTopicDetails(session) {

    if (
        Array.isArray(session.selectedTopicDetails) &&
        session.selectedTopicDetails.length
    ) {
        return session.selectedTopicDetails;
    }

    if (
        Array.isArray(session.topics) &&
        session.topics.length
    ) {
        return session.topics.map(topic => {

            if (typeof topic === "string") {
                return {
                    topicName: topic,
                    topicId: null,
                    unitName: topic,
                    unitId: null,
                    isWholeUnit: true
                };
            }

            return topic;

        });
    }

    return [];
}


/* DETERMINE WHETHER AN ITEM REPRESENTS A COMPLETE UNIT */

function isWholeUnitEntry(item, unit) {

    if (!item) return false;

    const topicId = item.topicId;
    const unitId = item.unitId;

    const topicName = item.topicName;
    const unitName = item.unitName || unit.unitName;

    return (

        // Explicit whole-unit selection
        item.isWholeUnit === true ||

        item.wholeUnit === true ||

        item.isComplete === true ||

        item.type === "unit" ||

        item.selectionType === "unit" ||

        // Topic ID matches its parent unit ID
        (
            topicId &&
            unitId &&
            String(topicId) === String(unitId)
        ) ||

        // Topic name matches its parent unit name
        (
            topicName &&
            unitName &&
            String(topicName).trim().toLowerCase() ===
            String(unitName).trim().toLowerCase()
        )

    );
}


/* GROUP SELECTED ITEMS BY UNIT */

function groupTopicsByUnit(topicDetails) {

    const grouped = new Map();

    topicDetails.forEach(item => {

        if (!item) return;

        const unitId =
            item.unitId ||
            item.unitName ||
            item.topicId ||
            item.topicName;

        const unitName =
            item.unitName ||
            item.topicName ||
            "Untitled Unit";

        if (!grouped.has(unitId)) {

            grouped.set(unitId, {
                unitId,
                unitName,
                unitNumber:
                    item.unitNumber ??
                    item.unitNo ??
                    item.unitIndex ??
                    null,
                topics: []
            });

        }

        const unit = grouped.get(unitId);

        // Preserve unit numbering if it appears on another item.
        if (unit.unitNumber === null) {

            unit.unitNumber =
                item.unitNumber ??
                item.unitNo ??
                item.unitIndex ??
                null;

        }

        unit.topics.push(item);

    });

    return Array.from(grouped.values());
}


/* CHECK WHETHER THE ENTIRE UNIT WAS SELECTED */

function isWholeUnitSelected(unit) {

    return unit.topics.some(item =>
        isWholeUnitEntry(item, unit)
    );

}


/* GET UNIT NUMBER */

function getUnitNumber(unit, index) {

    if (
        unit.unitNumber !== null &&
        unit.unitNumber !== undefined &&
        unit.unitNumber !== ""
    ) {
        const number = Number(unit.unitNumber);

        if (Number.isFinite(number)) {
            return number + (
                unit.unitNumber === unit.unitIndex ? 1 : 0
            );
        }

        return unit.unitNumber;
    }

    // Try to extract a number from IDs such as unit1, unit-2, unit_3.
    const unitId = String(unit.unitId || "");

    const match = unitId.match(/unit[\s_-]*(\d+)/i);

    if (match) {
        return Number(match[1]);
    }

    // Fall back to the unit's displayed order.
    return index + 1;
}


/* GET ONLY SELECTED SUBTOPICS */

function getSelectedSubtopics(unit) {

    return unit.topics
        .filter(item => !isWholeUnitEntry(item, unit))
        .map(item => item.topicName)
        .filter(Boolean);
}


/* RENDER SYLLABUS COVERAGE */

function renderSyllabusCoverage(session) {

    const topicDetails = getSelectedTopicDetails(session);

    if (!topicDetails.length) {

        coverageContent.innerHTML = `
            <p class="coverage-empty">
                No syllabus topics were selected for this session.
            </p>
        `;

        totalTopicsElement.textContent = "0";
        return;
    }

    const groupedUnits = groupTopicsByUnit(topicDetails);

    // Count unique selected units/topics for the statistics card.
    totalTopicsElement.textContent = topicDetails.length;

    coverageContent.innerHTML = groupedUnits.map((unit, index) => {

        const unitNumber = getUnitNumber(unit, index);

        const complete = isWholeUnitSelected(unit);

        const unitHeading = `
            <div class="coverage-unit-title">
                UNIT ${escapeHTML(unitNumber)}:
                ${escapeHTML(unit.unitName)}
            </div>
        `;


        /* CASE 1: ENTIRE UNIT SELECTED */

        if (complete) {

            return `
                <div class="coverage-unit">

                    <div class="coverage-unit-title">
                        UNIT ${escapeHTML(unitNumber)}:
                        ${escapeHTML(unit.unitName)}

                        <span class="complete-label">
                            (Complete)
                        </span>
                    </div>

                </div>
            `;

        }


        /* CASE 2: ONLY SELECTED SUBTOPICS */

        const subtopics = getSelectedSubtopics(unit);

        return `
            <div class="coverage-unit">

                ${unitHeading}

                ${subtopics.length ? `

                    <div class="coverage-subtopics">

                        ${subtopics.map(topic => `
                            <span class="coverage-pill">
                                ${escapeHTML(topic)}
                            </span>
                        `).join("")}

                    </div>

                ` : ""}

            </div>
        `;

    }).join("");
}


/* ==========================================
   ANALYSIS DATA
========================================== */

function getAnalysisData() {

    if (
        !window.CLARIQ_SESSION_ANALYSIS ||
        !window.CLARIQ_SESSION_ANALYSIS[sessionId]
    ) {
        return null;
    }

    return window.CLARIQ_SESSION_ANALYSIS[sessionId];
}


function getGroups(analysis) {
    return (
        analysis.groups ||
        analysis.doubtGroups ||
        []
    );
}


function getGroupQuestions(group) {
    return (
        group.questions ||
        group.doubts ||
        group.originalQuestions ||
        []
    );
}


function getQuestionText(question) {

    if (typeof question === "string") {
        return question;
    }

    return (
        question.question ||
        question.text ||
        question.content ||
        question.doubtText ||
        "Question unavailable"
    );
}


/* ==========================================
   STATISTICS
========================================== */

function getUniqueParticipants(groups) {

    const participants = new Set();

    groups.forEach(group => {

        getGroupQuestions(group).forEach(question => {

            if (typeof question === "object" && question !== null) {

                const studentId =
                    question.studentId ||
                    question.userId ||
                    question.participantId;

                if (studentId) {
                    participants.add(studentId);
                }

            }

        });

    });

    return participants.size;
}


function renderStatistics(analysis) {

    const groups = getGroups(analysis);

    const totalDoubts = groups.reduce(
        (total, group) => {
            return total + (
                group.doubtCount ??
                group.count ??
                getGroupQuestions(group).length
            );
        },
        0
    );

    const participants =
        analysis.participantCount ??
        analysis.totalParticipants ??
        getUniqueParticipants(groups);

    totalDoubtsElement.textContent =
        analysis.totalDoubts ?? totalDoubts;

    totalParticipantsElement.textContent = participants;

    totalGroupsElement.textContent = groups.length;
}


/* ==========================================
   DOUBT GROUP CARDS
========================================== */

function renderDoubtGroups(analysis) {

    const groups = getGroups(analysis);

    if (!groups.length) {

        doubtGroupsContainer.innerHTML = `
            <div class="empty-state">
                No doubt groups have been generated yet.
            </div>
        `;

        return;
    }

    doubtGroupsContainer.innerHTML = groups.map((group, index) => {

        const questions = getGroupQuestions(group);

        const title =
            group.title ||
            group.name ||
            group.topic ||
            `Doubt Group ${index + 1}`;

        const description =
            group.description ||
            group.summary ||
            group.overview ||
            "Related student doubts have been grouped together for teacher review.";

        return `
            <article class="group-card">

                <div class="group-top">

                    <div class="group-title-area">

                        <div class="group-number">
                            ${index + 1}
                        </div>

                        <h3 class="group-title">
                            ${escapeHTML(title)}
                        </h3>

                    </div>

                </div>


                <p class="group-description">
                    ${escapeHTML(description)}
                </p>


                <button class="questions-toggle" type="button">

                    <span>
                        View Original Questions (${questions.length})
                    </span>

                    <i data-lucide="chevron-down"></i>

                </button>


                <div class="group-questions">

                    ${questions.length
                        ? questions.map(question => renderQuestion(question)).join("")
                        : `
                            <div class="doubt-item">
                                <p class="doubt-question">
                                    Original questions are not available in this preview.
                                </p>
                            </div>
                        `
                    }

                </div>

            </article>
        `;

    }).join("");

    attachQuestionToggleEvents();
    refreshIcons();
}


function renderQuestion(question) {

    const text = getQuestionText(question);

    return `
        <div class="doubt-item">
            <p class="doubt-question">
                ${escapeHTML(text)}
            </p>
        </div>
    `;
}


/* ==========================================
   EXPAND / COLLAPSE QUESTIONS
========================================== */

function attachQuestionToggleEvents() {

    document.querySelectorAll(".questions-toggle").forEach(button => {

        button.addEventListener("click", () => {

            const card = button.closest(".group-card");

            if (!card) return;

            card.classList.toggle("expanded");

            const expanded = card.classList.contains("expanded");

            const label = button.querySelector("span");

            if (label) {

                const originalCount =
                    label.textContent.match(/\((\d+)\)/)?.[1] || 0;

                label.textContent = expanded
                    ? "Hide Original Questions"
                    : `View Original Questions (${originalCount})`;

            }

        });

    });

}


/* ==========================================
   AI SUMMARY
========================================== */

function renderSummary(analysis) {

    const summary =
        analysis.summary ||
        analysis.aiSummary ||
        analysis.overallSummary ||
        analysis.overview;

    if (!summary) {

        summaryBody.innerHTML = `
            <p>
                The AI-generated session summary is not available yet.
                Once doubt analysis is complete, an overview of the common
                confusion areas will appear here.
            </p>
        `;

        return;
    }

    if (Array.isArray(summary)) {

        summaryBody.innerHTML = summary.map(item => `
            <p>${escapeHTML(item)}</p>
        `).join("");

        return;
    }

    if (typeof summary === "object") {

        summaryBody.innerHTML = Object.entries(summary).map(([heading, text]) => `
            <p>
                <strong>${escapeHTML(heading)}:</strong>
                ${escapeHTML(text)}
            </p>
        `).join("");

        return;
    }

    summaryBody.innerHTML = String(summary)
        .split(/\n+/)
        .filter(Boolean)
        .map(paragraph => `<p>${escapeHTML(paragraph)}</p>`)
        .join("");
}


/* ==========================================
   EMPTY / ERROR STATES
========================================== */

function showMissingSession() {

    sessionTitle.textContent = "Session Not Found";

    sessionMeta.textContent =
        "This session could not be found in the active sessions.";

    sessionStatus.style.display = "none";

    coverageContent.innerHTML = `
        <p class="coverage-empty">
            Session information is unavailable.
        </p>
    `;

    doubtGroupsContainer.innerHTML = `
        <div class="empty-state">
            The requested session could not be found.
            <br><br>
            Return to Doubt Sessions and open an active session.
        </div>
    `;

    summaryBody.innerHTML = `
        <p>Session summary is unavailable.</p>
    `;
}


function showPendingAnalysis(session) {

    renderSessionHeader(session);
    renderSyllabusCoverage(session);

    totalDoubtsElement.textContent =
        session.questionCount ?? 0;

    totalParticipantsElement.textContent = "—";
    totalGroupsElement.textContent = "—";

    doubtGroupsContainer.innerHTML = `
        <div class="empty-state">
            <i data-lucide="clock"></i>
            <p>
                AI doubt analysis is not available yet.
                <br>
                Groups will appear here after doubts have been collected and analysed.
            </p>
        </div>
    `;

    summaryBody.innerHTML = `
        <p>
            The AI-generated session overview will appear here
            once the collected doubts have been analysed.
        </p>
    `;

    refreshIcons();
}


/* ==========================================
   ICONS
========================================== */

function refreshIcons() {

    if (window.lucide) {
        lucide.createIcons();
    }

}


/* ==========================================
   INITIALIZATION
========================================== */

function initializeViewSession() {

    if (!sessionId) {

        showMissingSession();
        refreshIcons();
        return;

    }

    const session = getSession();

    if (!session) {

        showMissingSession();
        refreshIcons();
        return;

    }

    const analysis = getAnalysisData();

    if (!analysis) {

        showPendingAnalysis(session);
        return;

    }

    renderSessionHeader(session);
    renderSyllabusCoverage(session);

    renderStatistics(analysis);
    renderDoubtGroups(analysis);
    renderSummary(analysis);

    refreshIcons();
}


document.addEventListener("DOMContentLoaded", initializeViewSession);