/* ==========================================
   CLARIQ - RESOLVED DOUBTS
========================================== */


/* ==========================================
   SAMPLE RESOLVED DOUBT DATA

   Replace this sample data with the actual
   resolved doubts received from the backend.
========================================== */

const resolvedDoubts = [

    {
        id: "D004",

        question: "Why does the loop execute one extra time when I use this condition?",

        subject: "PPS",

        classYear: "1st Year",

        branch: "AIML",

        batch: "2025",

        semester: "1",

        tags: ["Control Flow", "While Loops"],

        time: "2 days ago",

        searchableTime: "2 days ago"

    },

    {
        id: "D006",

        question: "What is the difference between break and continue in a loop?",

        subject: "PPS",

        classYear: "1st Year",

        branch: "AIML",

        batch: "2025",

        semester: "1",

        tags: ["Control Flow", "Break and Continue"],

        time: "3 days ago",

        searchableTime: "3 days ago"

    },

    {
        id: "D007",

        question: "How does binary search reduce the number of comparisons?",

        subject: "DSA",

        classYear: "2nd Year",

        branch: "AIML",

        batch: "2024",

        semester: "3",

        tags: ["Searching", "Binary Search"],

        time: "5 days ago",

        searchableTime: "5 days ago"

    },

    {
        id: "D008",

        question: "Why do we use pointers in linked lists?",

        subject: "DSA",

        classYear: "2nd Year",

        branch: "CS",

        batch: "2024",

        semester: "3",

        tags: ["Linked Lists", "Pointers"],

        time: "1 week ago",

        searchableTime: "1 week ago"

    },

    {
        id: "D009",

        question: "Explain the difference between a process and a thread.",

        subject: "COA",

        classYear: "2nd Year",

        branch: "CS",

        batch: "2024",

        semester: "4",

        tags: ["Operating Systems", "Processes"],

        time: "1 week ago",

        searchableTime: "1 week ago"

    },

    {
        id: "D010",

        question: "How does Python handle mutable and immutable objects?",

        subject: "Python",

        classYear: "2nd Year",

        branch: "AIML",

        batch: "2024",

        semester: "4",

        tags: ["Data Types", "Mutability"],

        time: "2 weeks ago",

        searchableTime: "2 weeks ago"

    }

];


/* ==========================================
   DOM ELEMENTS
========================================== */

const resolvedDoubtsList =
    document.getElementById("resolvedDoubtsList");

const resolvedSearch =
    document.getElementById("resolvedSearch");

const clearResolvedSearch =
    document.getElementById("clearResolvedSearch");

const batchFilter =
    document.getElementById("batchFilter");

const classFilter =
    document.getElementById("classFilter");

const subjectFilter =
    document.getElementById("subjectFilter");

const emptyState =
    document.getElementById("emptyState");

const emptyTitle =
    document.getElementById("emptyTitle");

const emptyDescription =
    document.getElementById("emptyDescription");


/* ==========================================
   FILTER OPTIONS

   Options are generated from the available
   resolved doubts instead of being hardcoded.
========================================== */

function populateFilters() {

    populateBatchFilter();

    populateClassFilter();

    populateSubjectFilter();

}


/* ==========================================
   BATCH FILTER
========================================== */

function populateBatchFilter() {

    const batches = [
        ...new Set(
            resolvedDoubts.map(doubt => doubt.batch)
        )
    ].sort((a, b) => Number(b) - Number(a));

    batchFilter.innerHTML = `
        <option value="all">All Batches</option>
    `;

    batches.forEach(batch => {

        const option = document.createElement("option");

        option.value = batch;
        option.textContent = `Batch ${batch}`;

        batchFilter.appendChild(option);

    });

}


/* ==========================================
   CLASS FILTER
========================================== */

function populateClassFilter() {

    const classYears = [
        ...new Set(
            resolvedDoubts.map(doubt => doubt.classYear)
        )
    ];

    const yearOrder = [
        "1st Year",
        "2nd Year",
        "3rd Year",
        "4th Year"
    ];

    classYears.sort((a, b) => {

        return yearOrder.indexOf(a) - yearOrder.indexOf(b);

    });

    classFilter.innerHTML = `
        <option value="all">All Classes</option>
    `;

    classYears.forEach(classYear => {

        const option = document.createElement("option");

        option.value = classYear;
        option.textContent = classYear;

        classFilter.appendChild(option);

    });

}


/* ==========================================
   SUBJECT FILTER
========================================== */

function populateSubjectFilter() {

    const subjects = [
        ...new Set(
            resolvedDoubts.map(doubt => doubt.subject)
        )
    ].sort();

    subjectFilter.innerHTML = `
        <option value="all">All Subjects</option>
    `;

    subjects.forEach(subject => {

        const option = document.createElement("option");

        option.value = subject;
        option.textContent = subject;

        subjectFilter.appendChild(option);

    });

}


/* ==========================================
   SEARCH
========================================== */

function getSearchableText(doubt) {

    return [

        doubt.id,

        doubt.question,

        doubt.subject,

        doubt.classYear,

        doubt.branch,

        doubt.batch,

        doubt.semester,

        ...doubt.tags

    ].join(" ").toLowerCase();

}


/* ==========================================
   FILTER DOUBTS
========================================== */

function getFilteredDoubts() {

    const searchValue =
        resolvedSearch.value.trim().toLowerCase();

    const selectedBatch =
        batchFilter.value;

    const selectedClass =
        classFilter.value;

    const selectedSubject =
        subjectFilter.value;


    return resolvedDoubts.filter(doubt => {

        const matchesSearch =
            !searchValue ||
            getSearchableText(doubt).includes(searchValue);


        const matchesBatch =
            selectedBatch === "all" ||
            doubt.batch === selectedBatch;


        const matchesClass =
            selectedClass === "all" ||
            doubt.classYear === selectedClass;


        const matchesSubject =
            selectedSubject === "all" ||
            doubt.subject === selectedSubject;


        return (
            matchesSearch &&
            matchesBatch &&
            matchesClass &&
            matchesSubject
        );

    });

}


/* ==========================================
   RENDER DOUBT CARDS
========================================== */

function renderResolvedDoubts() {

    const filteredDoubts = getFilteredDoubts();

    resolvedDoubtsList.innerHTML = "";


    if (filteredDoubts.length === 0) {

        resolvedDoubtsList.style.display = "none";

        emptyState.classList.remove("hidden");

        emptyTitle.textContent = "No resolved doubts found";

        emptyDescription.textContent =
            "There are no resolved doubts matching your current filters.";

        return;

    }


    resolvedDoubtsList.style.display = "flex";

    emptyState.classList.add("hidden");


    filteredDoubts.forEach(doubt => {

        const card = document.createElement("div");

        card.className = "doubt-card";

        card.setAttribute("tabindex", "0");

        card.setAttribute("role", "button");

        card.setAttribute(
            "aria-label",
            `Open resolved doubt: ${doubt.question}`
        );


        card.innerHTML = `

            <!-- SUBJECT -->

            <div class="doubt-card-meta">

                <span class="subject-badge">
                    ${escapeHTML(doubt.subject)}
                </span>

            </div>


            <!-- QUESTION -->

            <h3 class="doubt-question">

                ${escapeHTML(doubt.question)}

            </h3>


            <!-- TAGS + TIMESTAMP -->

            <div class="doubt-card-footer">

                <div class="doubt-tags">

                    ${doubt.tags.map(tag => `

                        <span class="doubt-tag">
                            ${escapeHTML(tag)}
                        </span>

                    `).join("")}

                </div>


                <span class="doubt-time">

                    ${escapeHTML(doubt.time)}

                </span>

            </div>


            <!-- CLASS + BATCH + SEMESTER -->

            <div class="doubt-academic-info">

                <span>
                    ${escapeHTML(doubt.classYear)}
                </span>

                <span class="academic-separator">·</span>

                <span>
                    ${escapeHTML(doubt.branch)}-${escapeHTML(doubt.batch.slice(-2))}
                </span>

                <span class="academic-separator">·</span>

                <span>
                    Semester ${escapeHTML(doubt.semester)}
                </span>

            </div>

        `;


        /* ==========================================
           CARD CLICK
        ========================================== */

        card.addEventListener("click", () => {

            openDoubt(doubt.id);

        });


        card.addEventListener("keydown", event => {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                openDoubt(doubt.id);

            }

        });


        resolvedDoubtsList.appendChild(card);

    });


    refreshIcons();

}


/* ==========================================
   OPEN DOUBT DETAILS
========================================== */

function openDoubt(doubtId) {

    window.location.href =
        `doubt-detail.html?id=${encodeURIComponent(doubtId)}`;

}


/* ==========================================
   CLEAR SEARCH
========================================== */

function updateClearSearchButton() {

    if (resolvedSearch.value.trim() !== "") {

        clearResolvedSearch.classList.add("visible");

    } else {

        clearResolvedSearch.classList.remove("visible");

    }

}


clearResolvedSearch.addEventListener("click", () => {

    resolvedSearch.value = "";

    updateClearSearchButton();

    renderResolvedDoubts();

    resolvedSearch.focus();

});


/* ==========================================
   SEARCH EVENT
========================================== */

resolvedSearch.addEventListener("input", () => {

    updateClearSearchButton();

    renderResolvedDoubts();

});


/* ==========================================
   FILTER EVENTS
========================================== */

batchFilter.addEventListener("change", renderResolvedDoubts);

classFilter.addEventListener("change", renderResolvedDoubts);

subjectFilter.addEventListener("change", renderResolvedDoubts);


/* ==========================================
   HTML ESCAPE

   Prevents text from being interpreted as HTML.
========================================== */

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


/* ==========================================
   REFRESH LUCIDE ICONS
========================================== */

function refreshIcons() {

    if (window.lucide) {

        lucide.createIcons();

    }

}


/* ==========================================
   INITIALIZE PAGE
========================================== */

function initializeResolvedDoubts() {

    populateFilters();

    renderResolvedDoubts();

    updateClearSearchButton();

    refreshIcons();

}


initializeResolvedDoubts();