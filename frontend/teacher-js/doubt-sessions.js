document.addEventListener("DOMContentLoaded", () => {


    // =====================================
    // MOCK DATA
    // =====================================

    const upcomingSessions = [

        {
            id: "session-101",
            title: "DSTL Doubt Clearing",

            className: "2nd Year AI & ML",
            subject: "DSTL",

            date: "12 November 2026",
            time: "11:00 AM – 12:00 PM",

            doubts: 8
        },

        {
            id: "session-102",
            title: "DSTL Revision Session",

            className: "2nd Year CSE",
            subject: "DSTL",

            date: "15 November 2026",
            time: "01:00 PM – 02:00 PM",

            doubts: 6
        },

        {
            id: "session-103",
            title: "Engineering Maths Doubt Session",

            className: "1st Year AI & ML",
            subject: "Engineering Mathematics I",

            date: "18 November 2026",
            time: "10:00 AM – 11:00 AM",

            doubts: 5
        }

    ];


    const sessionDrafts = [

        {
            id: "draft-101",
            title: "DSTL – Doubt Collection",

            className: "2nd Year AI & ML",
            subject: "DSTL",

            doubts: 8,
            updated: "10 November 2026"
        },

        {
            id: "draft-102",
            title: "Engineering Maths – Session Draft",

            className: "1st Year AI & ML",
            subject: "Engineering Mathematics I",

            doubts: 6,
            updated: "09 November 2026"
        }

    ];


    const pastSessions = [

        {
            id: "past-101",
            title: "Boolean Algebra Doubt Session",

            className: "2nd Year CSE",
            subject: "DSTL",

            date: "28 October 2026",
            doubts: 7,

            summaryAvailable: true
        },

        {
            id: "past-102",
            title: "Engineering Mathematics Revision",

            className: "1st Year AI & ML",
            subject: "Engineering Mathematics I",

            date: "22 October 2026",
            doubts: 5,

            summaryAvailable: true
        }

    ];


    // =====================================
    // ELEMENTS
    // =====================================

    const upcomingList = document.getElementById("upcoming-list");

    const draftList = document.getElementById("draft-list");

    const pastList = document.getElementById("past-list");


    // =====================================
    // UPDATE STATISTICS
    // =====================================

    document.getElementById("upcoming-count").textContent =
        String(upcomingSessions.length).padStart(2, "0");

    document.getElementById("draft-count").textContent =
        String(sessionDrafts.length).padStart(2, "0");

    document.getElementById("completed-count").textContent = "08";

    const totalDraftDoubts = sessionDrafts.reduce(
        (total, draft) => total + draft.doubts,
        0
    );

    document.getElementById("draft-doubts-count").textContent =
        String(totalDraftDoubts).padStart(2, "0");


    // =====================================
    // RENDER UPCOMING SESSIONS
    // =====================================

    function renderUpcomingSessions() {

        upcomingList.innerHTML = "";

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

            card.className = "upcoming-card";

            card.innerHTML = `

                <div class="session-icon">
                    <i data-lucide="calendar-days"></i>
                </div>


                <div class="upcoming-details">

                    <div class="upcoming-title-row">

                        <h3>${session.title}</h3>

                        <span class="session-status">
                            Upcoming
                        </span>

                    </div>


                    <div class="assignment-tags">

                        <span>${session.className}</span>
                        <span>${session.subject}</span>

                    </div>


                    <div class="session-info">

                        <span>
                            <i data-lucide="calendar"></i>
                            ${session.date}
                        </span>

                        <span>
                            <i data-lucide="clock"></i>
                            ${session.time}
                        </span>

                        <span>
                            <i data-lucide="message-circle"></i>
                            ${String(session.doubts).padStart(2, "0")} doubts included
                        </span>

                    </div>

                </div>


                <button
                    class="card-arrow"
                    data-action="open-session"
                    data-id="${session.id}"
                    aria-label="View session">

                    <i data-lucide="arrow-right"></i>

                </button>

            `;


            upcomingList.appendChild(card);

        });

    }


    // =====================================
    // RENDER SESSION DRAFTS
    // =====================================

    function renderDrafts() {

        draftList.innerHTML = "";

        if (sessionDrafts.length === 0) {

            draftList.innerHTML = `
                <p class="section-empty">
                    No active session drafts.
                </p>
            `;

            return;
        }


        sessionDrafts.forEach(draft => {

            const card = document.createElement("article");

            card.className = "draft-card";

            card.innerHTML = `

                <div class="draft-icon">
                    <i data-lucide="file-text"></i>
                </div>


                <div class="draft-content">

                    <div class="draft-title-row">

                        <h3>${draft.title}</h3>

                        <span class="draft-status">
                            Draft
                        </span>

                    </div>


                    <div class="assignment-tags">

                        <span>${draft.className}</span>
                        <span>${draft.subject}</span>

                    </div>


                    <p class="draft-meta">

                        ${String(draft.doubts).padStart(2, "0")} doubts collected

                        &nbsp;•&nbsp;

                        Last updated: ${draft.updated}

                    </p>


                    <div class="draft-actions">

                        <button
                            class="secondary-btn"
                            data-action="edit-draft"
                            data-id="${draft.id}">

                            Edit Draft

                        </button>


                        <button
                            class="schedule-btn"
                            data-action="schedule-draft"
                            data-id="${draft.id}">

                            Schedule Session

                        </button>

                    </div>

                </div>

            `;


            draftList.appendChild(card);

        });

    }


    // =====================================
    // RENDER PAST SESSIONS
    // =====================================

    function renderPastSessions() {

        pastList.innerHTML = "";

        if (pastSessions.length === 0) {

            pastList.innerHTML = `
                <p class="section-empty">
                    No previously conducted sessions.
                </p>
            `;

            return;
        }


        pastSessions.forEach(session => {

            const card = document.createElement("article");

            card.className = "past-card";

            card.innerHTML = `

                <div class="past-title">

                    <div class="past-icon">
                        <i data-lucide="calendar-days"></i>
                    </div>

                    <div>

                        <h3>${session.title}</h3>

                        <div class="past-tags">

                            <span>${session.className}</span>
                            <span>${session.subject}</span>

                        </div>

                    </div>

                </div>


                <div class="past-detail">

                    <i data-lucide="calendar"></i>

                    <span>
                        Conducted: ${session.date}
                    </span>

                </div>


                <div class="past-detail">

                    <i data-lucide="message-circle"></i>

                    <span>
                        ${String(session.doubts).padStart(2, "0")} doubts covered
                    </span>

                </div>


                <div class="past-summary">

                    <span class="summary-status">

                        <i data-lucide="check-circle"></i>

                        Summary Available

                    </span>

                </div>


                <button
                    class="summary-btn"
                    data-action="view-summary"
                    data-id="${session.id}">

                    View Summary

                    <i data-lucide="arrow-right"></i>

                </button>

            `;


            pastList.appendChild(card);

        });

    }


    // =====================================
    // BUTTON ACTIONS
    // =====================================

    document.addEventListener("click", event => {

        const button = event.target.closest("[data-action]");

        if (!button) return;


        const action = button.dataset.action;

        const id = button.dataset.id;


        switch (action) {


            case "open-session":

                console.log("Open upcoming session:", id);

                // Later: Navigate to the session details page.

                break;


            case "edit-draft":

                console.log("Edit session draft:", id);

                // Later: Open the draft editing page.

                break;


            case "schedule-draft":

                console.log("Schedule session:", id);

                // Later: Open the scheduling form.

                break;


            case "view-summary":

                console.log("View session summary:", id);

                // Later: Open the session summary page.

                break;


            case "view-all-upcoming":

                console.log("View all upcoming sessions");

                break;


            case "view-all-drafts":

                console.log("View all session drafts");

                break;


            case "view-all-past":

                console.log("View past sessions archive");

                break;

        }

    });


    // =====================================
    // CREATE SESSION
    // =====================================

    document.getElementById("create-session-btn")
        .addEventListener("click", () => {

            console.log("Create a new doubt session");

            // Later: Open the Create Session page.

        });


    // =====================================
    // INITIALIZE PAGE
    // =====================================

    renderUpcomingSessions();

    renderDrafts();

    renderPastSessions();


    if (window.lucide) {
        lucide.createIcons();
    }

});