/* ==========================================
   CLARIQ - DOUBTS INBOX
========================================== */


/* ==========================================
   DOM ELEMENTS
========================================== */

const doubtsList = document.getElementById("doubtsList");

const doubtSearch = document.getElementById("doubtSearch");

const clearSearch = document.getElementById("clearSearch");

const classFilter = document.getElementById("classFilter");

const inboxTabs = document.querySelectorAll(".inbox-tab");

const newCount = document.getElementById("newCount");

const progressCount = document.getElementById("progressCount");

const emptyState = document.getElementById("emptyState");

const emptyTitle = document.getElementById("emptyTitle");

const emptyDescription = document.getElementById("emptyDescription");


/* ==========================================
   SAMPLE DOUBT DATA
========================================== */

const doubts = [

    {
        id: "D001",
        question: "Why does the loop execute one extra time when I use this condition?",
        subject: "PPS",
        className: "1st Year AI & ML",
        topic: "Control Flow",
        subtopic: "While Loops",
        time: "1 hour ago",
        status: "new"
    },

    {
        id: "D002",
        question: "What is the difference between break and continue in a loop?",
        subject: "PPS",
        className: "1st Year AI & ML",
        topic: "Control Flow",
        subtopic: "Break and Continue",
        time: "3 hours ago",
        status: "new"
    },

    {
        id: "D003",
        question: "How do default arguments work in Python functions?",
        subject: "Python",
        className: "2nd Year CS",
        topic: "Functions",
        subtopic: "Default Arguments",
        time: "5 hours ago",
        status: "new"
    },

    {
        id: "D004",
        question: "Why do we use the self parameter inside a Python class?",
        subject: "Python",
        className: "2nd Year CS",
        topic: "Object-Oriented Programming",
        subtopic: "Classes and Objects",
        time: "1 day ago",
        status: "progress"
    },

    {
        id: "D005",
        question: "How does a stack differ from a queue?",
        subject: "DSA",
        className: "2nd Year AI & ML",
        topic: "Linear Data Structures",
        subtopic: "Stack and Queue",
        time: "1 day ago",
        status: "progress"
    },

    {
        id: "D006",
        question: "What is the difference between an array and a linked list?",
        subject: "DSA",
        className: "2nd Year AI & ML",
        topic: "Linear Data Structures",
        subtopic: "Arrays and Linked Lists",
        time: "2 days ago",
        status: "progress"
    }

];


/* ==========================================
   CURRENT FILTER STATE
========================================== */

let activeTab = "new";


/* ==========================================
   ESCAPE HTML
========================================== */

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, character => {

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


/* ==========================================
   CREATE DOUBT CARD
========================================== */

function createDoubtCard(doubt) {

    const card = document.createElement("article");

    card.className = "doubt-card";

    card.dataset.id = doubt.id;

    card.tabIndex = 0;

    card.setAttribute("role", "button");

    card.setAttribute(
        "aria-label",
        `Open doubt: ${doubt.question}`
    );


    card.innerHTML = `

        <div class="doubt-card-meta">

            <span class="subject-badge">
                ${escapeHTML(doubt.subject)}
            </span>

            <span class="doubt-class">

                <i data-lucide="graduation-cap"></i>

                ${escapeHTML(doubt.className)}

            </span>

        </div>


        <p class="doubt-question">
            ${escapeHTML(doubt.question)}
        </p>


        <div class="doubt-card-footer">

            <div class="doubt-tags">

                <span class="doubt-tag">
                    ${escapeHTML(doubt.topic)}
                </span>

                <span class="doubt-tag">
                    ${escapeHTML(doubt.subtopic)}
                </span>

            </div>


            <span class="doubt-time">
                ${escapeHTML(doubt.time)}
            </span>

        </div>

    `;


    /* CARD CLICK */

    card.addEventListener("click", () => {

        openDoubt(doubt.id);

    });


    /* KEYBOARD ACCESSIBILITY */

    card.addEventListener("keydown", event => {

        if (event.key === "Enter" || event.key === " ") {

            event.preventDefault();

            openDoubt(doubt.id);

        }

    });


    return card;

}


/* ==========================================
   OPEN DOUBT DETAIL
========================================== */

function openDoubt(doubtId) {

    window.location.href =
        `doubt-detail.html?id=${encodeURIComponent(doubtId)}`;

}


/* ==========================================
   GET FILTERED DOUBTS
========================================== */

function getFilteredDoubts() {

    const searchValue = doubtSearch.value
        .trim()
        .toLowerCase();

    const selectedClass = classFilter.value;


    return doubts.filter(doubt => {

        const matchesTab =
            doubt.status === activeTab;


        const matchesClass =
            selectedClass === "all" ||
            doubt.className === selectedClass;


        const searchableContent = [

            doubt.question,
            doubt.subject,
            doubt.className,
            doubt.topic,
            doubt.subtopic

        ].join(" ").toLowerCase();


        const matchesSearch =
            searchableContent.includes(searchValue);


        return matchesTab && matchesClass && matchesSearch;

    });

}


/* ==========================================
   UPDATE TAB COUNTS
========================================== */

function updateCounts() {

    const selectedClass = classFilter.value;

    const searchValue = doubtSearch.value
        .trim()
        .toLowerCase();


    const filteredDoubts = doubts.filter(doubt => {

        const matchesClass =
            selectedClass === "all" ||
            doubt.className === selectedClass;


        const searchableContent = [

            doubt.question,
            doubt.subject,
            doubt.className,
            doubt.topic,
            doubt.subtopic

        ].join(" ").toLowerCase();


        const matchesSearch =
            searchableContent.includes(searchValue);


        return matchesClass && matchesSearch;

    });


    const newTotal = filteredDoubts.filter(
        doubt => doubt.status === "new"
    ).length;


    const progressTotal = filteredDoubts.filter(
        doubt => doubt.status === "progress"
    ).length;


    newCount.textContent = newTotal;

    progressCount.textContent = progressTotal;

}


/* ==========================================
   EMPTY STATE
========================================== */

function showEmptyState() {

    emptyState.classList.remove("hidden");


    if (doubtSearch.value.trim() !== "") {

        emptyTitle.textContent = "No matching doubts";

        emptyDescription.textContent =
            "Try adjusting your search or selecting a different class.";

    }

    else {

        emptyTitle.textContent =
            activeTab === "new"
                ? "No new doubts"
                : "No doubts in progress";


        emptyDescription.textContent =
            activeTab === "new"
                ? "New student doubts will appear here when submitted."
                : "Doubts you start working on will appear here.";

    }

}


function hideEmptyState() {

    emptyState.classList.add("hidden");

}


/* ==========================================
   RENDER DOUBTS
========================================== */

function renderDoubts() {

    const filteredDoubts = getFilteredDoubts();

    doubtsList.innerHTML = "";


    if (filteredDoubts.length === 0) {

        showEmptyState();

    }

    else {

        hideEmptyState();

        filteredDoubts.forEach(doubt => {

            doubtsList.appendChild(
                createDoubtCard(doubt)
            );

        });

    }


    updateCounts();


    /* REINITIALIZE LUCIDE ICONS */

    if (window.lucide) {

        lucide.createIcons();

    }

}


/* ==========================================
   TAB SWITCHING
========================================== */

inboxTabs.forEach(tab => {

    tab.addEventListener("click", () => {

        inboxTabs.forEach(item => {

            item.classList.remove("active");

        });


        tab.classList.add("active");

        activeTab = tab.dataset.tab;


        renderDoubts();

    });

});


/* ==========================================
   SEARCH
========================================== */

doubtSearch.addEventListener("input", () => {

    clearSearch.classList.toggle(
        "visible",
        doubtSearch.value.length > 0
    );

    renderDoubts();

});


/* ==========================================
   CLEAR SEARCH
========================================== */

clearSearch.addEventListener("click", () => {

    doubtSearch.value = "";

    clearSearch.classList.remove("visible");

    renderDoubts();

    doubtSearch.focus();

});


/* ==========================================
   CLASS FILTER
========================================== */

classFilter.addEventListener("change", () => {

    renderDoubts();

});


/* ==========================================
   INITIALIZE PAGE
========================================== */

renderDoubts();