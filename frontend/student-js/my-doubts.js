
// ==========================================
// SAMPLE DOUBTS
// ==========================================

const doubts = [

    // PENDING
    {
        id: 101,
        title: "Linked List Traversal",
        subject: "DSA",
        question: "Why do we need to traverse a linked list from the head instead of accessing elements directly?",
        tags: ["Linked List", "Traversal"],
        teacherName: "Dr. Dhaka",
        status: "pending",
        createdAt: "2026-09-29",
        teacherResources: []
    },

    {
        id: 102,
        title: "JK Flip-Flop",
        subject: "DE",
        question: "Why does a JK flip-flop avoid the invalid state of an SR flip-flop?",
        tags: ["Flip-Flops", "Digital Logic"],
        teacherName: "Prof. Nipun Pande",
        status: "pending",
        createdAt: "2026-09-25",
        teacherResources: []
    },

    {
        id: 112,
        title: "Binary Search Tree",
        subject: "DSA",
        question: "How does searching work in a binary search tree?",
        tags: ["Trees", "BST"],
        teacherName: "Dr. Dhaka",
        status: "resolved",
        createdAt: "2026-09-21",
        teacherResources: [
            { name: "BST Notes.pdf", type: "application/pdf" },
            { name: "BST Examples.pdf", type: "application/pdf" }
        ]
    },

    // IN PROGRESS
    {
        id: 103,
        title: "POSets and Hasse Diagram",
        subject: "DSTL",
        question: "How do we construct a Hasse diagram from a given partially ordered set?",
        tags: ["POSets", "Hasse Diagram"],
        teacherName: "Prof. Kamlendra",
        status: "in-progress",
        createdAt: "2026-09-28",
        teacherResources: []
    },

    {
        id: 104,
        title: "Python List Comprehension",
        subject: "Python",
        question: "When should we use list comprehension instead of a normal for loop?",
        tags: ["Python", "Lists"],
        teacherName: "Prof. Vivek Shukla",
        status: "in-progress",
        createdAt: "2026-09-23",
        teacherResources: []
    },

    // RESOLVED
    {
        id: 105,
        title: "Cache Memory",
        subject: "COA",
        question: "Why is cache memory faster than main memory even though both are used by the CPU?",
        tags: ["Cache Memory", "Memory Hierarchy"],
        teacherName: "Prof. Kamran",
        status: "resolved",
        createdAt: "2026-09-27",
        teacherResources: [
            { name: "Cache Memory Notes.pdf", type: "application/pdf" }
        ]
    },

    {
        id: 106,
        title: "Technical Presentation",
        subject: "TC",
        question: "What are the main elements of an effective technical presentation?",
        tags: ["Presentation", "Communication"],
        teacherName: "Dr. Ruchi Shah",
        status: "resolved",
        createdAt: "2026-09-22",
        teacherResources: []
    },

    {
        id: 107,
        title: "Stack Implementation",
        subject: "DSA",
        question: "How does push and pop work when implementing a stack using a linked list?",
        tags: ["Stack", "Linked List"],
        teacherName: "Dr. Dhaka",
        status: "resolved",
        createdAt: "2026-09-18",
        teacherResources: [
            { name: "Stack Implementation.pdf", type: "application/pdf" },
            { name: "Stack Examples.pdf", type: "application/pdf" },
            { name: "Practice Questions.pdf", type: "application/pdf" }
        ]
    },

    {
        id: 108,
        title: "CPU Registers",
        subject: "COA",
        question: "What is the purpose of registers inside the CPU?",
        tags: ["CPU", "Registers"],
        teacherName: "Prof. Kamran",
        status: "resolved",
        createdAt: "2026-09-25",
        teacherResources: [
            { name: "CPU Registers Notes.pdf", type: "application/pdf" }
        ]
    },

    {
        id: 109,
        title: "Group Homomorphism",
        subject: "DSTL",
        question: "How do we determine whether a mapping between two groups is a homomorphism?",
        tags: ["Groups", "Homomorphism"],
        teacherName: "Prof. Kamlendra",
        status: "in-progress",
        createdAt: "2026-09-20",
        teacherResources: []
    }

];
// =====================================
// INITIALIZE DOUBTS IN LOCAL STORAGE
// =====================================

let storedDoubts = JSON.parse(
    localStorage.getItem("clariqDoubts") || "[]"
);

if (!Array.isArray(storedDoubts)) {
    storedDoubts = [];
}

// Identify sample doubts that aren't already stored
const storedIds = new Set(
    storedDoubts.map(doubt => Number(doubt.id))
);

const missingSampleDoubts = doubts.filter(
    doubt => !storedIds.has(Number(doubt.id))
);

// Combine stored and missing sample doubts
let allDoubts = [
    ...storedDoubts,
    ...missingSampleDoubts
];

// Save the combined array
localStorage.setItem(
    "clariqDoubts",
    JSON.stringify(allDoubts)
);


// ==========================================
// GET HTML ELEMENTS
// ==========================================

const doubtContainer = document.getElementById("doubtContainer");


// ==========================================
// FORMAT DATE
// ==========================================

// ==========================================
// FORMAT DATE
// ==========================================

function formatRelativeDate(dateString) {

    const doubtDate = new Date(dateString);

    if (isNaN(doubtDate.getTime())) {
        return "";
    }

    doubtDate.setHours(0, 0, 0, 0);

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const difference = Math.floor(
        (today - doubtDate) / (1000 * 60 * 60 * 24)
    );

    if (difference === 0) {
        return "Today";
    }

    if (difference === 1) {
        return "Yesterday";
    }

    if (difference < 7) {
        return `${difference} days ago`;
    }

    if (difference < 30) {
        const weeks = Math.floor(difference / 7);
        return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
    }

    const months = Math.floor(difference / 30);

    if (months < 12) {
        return `${months} ${months === 1 ? "month" : "months"} ago`;
    }

    const years = Math.floor(months / 12);

    return `${years} ${years === 1 ? "year" : "years"} ago`;

}


// ==========================================
// CREATE DOUBT CARD
// ==========================================

function createDoubtCard(doubt) {

    const card = document.createElement("div");

    card.className = "doubt-card";


    // OPEN DOUBT DETAILS ON CLICK

    card.addEventListener("click", function () {

        window.location.href =
            `doubt-details.html?source=my-doubts&id=${doubt.id}`;

    });


    const subject = subjectStyles[doubt.subject];
    const status = statusStyles[doubt.status];


    // ======================================
    // RESOURCE COUNT
    // ======================================

    const resourceCount = (doubt.teacherResources || []).length;


    // ======================================
    // TAGS + RESOURCE INDICATOR
    // ======================================

    const tagsHTML = (doubt.tags || []).length || resourceCount > 0

        ? `
            <div class="doubt-tags">

                ${(doubt.tags || []).map(tag => `
                    <span class="doubt-tag">${tag}</span>
                `).join("")}

                ${resourceCount > 0 ? `
                    <span class="resource-indicator">
                        <i data-lucide="link"></i>
                        <span>${resourceCount}</span>
                    </span>
                ` : ""}

            </div>
        `

        : "";


    // ======================================
    // TEACHER INFORMATION + DATE
    // ======================================

    const teacherHTML = `
        <div class="teacher-meta">

            <i data-lucide="user-round"></i>

            <span class="teacher-name">
                ${doubt.teacherName || "Teacher not assigned"}
            </span>

            <span class="doubt-date">
                ${formatRelativeDate(doubt.createdAt)}
            </span>

        </div>
    `;


    // ======================================
    // CARD HTML
    // ======================================

    card.innerHTML = `

        <div class="doubt-icon">

            <img
                src="${subject.icon}"
                alt="${doubt.subject} icon"
            >

        </div>


        <div class="doubt-info">

            <div class="doubt-meta">

                <span class="doubt-title">
                    ${doubt.title}
                </span>

                <span class="separator">•</span>

                <span class="doubt-subject">
                    ${doubt.subject}
                </span>

            </div>


            <p class="doubt-ques">
                ${doubt.question}
            </p>


            ${tagsHTML}


            ${teacherHTML}

        </div>


        <div class="doubt-status-meta">

            <div
                class="status"
                style="
                    background-color: ${status.background};
                    color: ${status.color};
                "
            >

                <i data-lucide="${status.icon}"></i>

                <p>${status.label}</p>

            </div>

        </div>

    `;


    return card;

}


// ==========================================
// DISPLAY DOUBTS
// ==========================================

function displayDoubts(doubtsToDisplay) {

    doubtContainer.innerHTML = "";

    doubtsToDisplay.forEach(function (doubt) {

        const card = createDoubtCard(doubt);

        doubtContainer.appendChild(card);

    });

    lucide.createIcons();

}


// ==========================================
// FILTER AND SORT ELEMENTS
// ==========================================

const statusTabs = document.querySelectorAll(
    ".status-tab, .status-tab-active"
);

const sortSelect = document.getElementById("sort-doubts");

const subjectSelect = document.querySelector(".select-subj");


let selectedStatus = "all";
let selectedSort = "latest";
let selectedSubject = "all";


// ==========================================
// UPDATE DOUBTS
// ==========================================

function updateDoubts() {

    // Start with all stored doubts
    let filteredDoubts = allDoubts.slice();


    // FILTER BY SUBJECT

    if (selectedSubject !== "all") {

        filteredDoubts = filteredDoubts.filter(function (doubt) {

            return doubt.subject === selectedSubject;

        });

    }


    // FILTER BY STATUS

    if (selectedStatus !== "all") {

        filteredDoubts = filteredDoubts.filter(function (doubt) {

            return doubt.status === selectedStatus;

        });

    }


    // SORT DOUBTS

    if (selectedSort === "latest") {

        filteredDoubts.sort(function (a, b) {

            return new Date(b.createdAt) - new Date(a.createdAt);

        });

    }

    else if (selectedSort === "oldest") {

        filteredDoubts.sort(function (a, b) {

            return new Date(a.createdAt) - new Date(b.createdAt);

        });

    }


    // DISPLAY

    displayDoubts(filteredDoubts);

}

// ==========================================
// STATUS TABS
// ==========================================

statusTabs.forEach(function (tab) {

    tab.addEventListener("click", function () {

        selectedStatus = tab.dataset.status;


        statusTabs.forEach(function (tab) {

            tab.classList.remove("status-tab-active");
            tab.classList.add("status-tab");

        });


        tab.classList.remove("status-tab");
        tab.classList.add("status-tab-active");


        updateDoubts();

    });

});


// ==========================================
// SUBJECT DROPDOWN
// ==========================================

subjectSelect.addEventListener("change", function () {

    selectedSubject = subjectSelect.value;

    updateDoubts();

});


// ==========================================
// SORT DROPDOWN
// ==========================================

sortSelect.addEventListener("change", function () {

    selectedSort = sortSelect.value;

    updateDoubts();

});


// ==========================================
// INITIAL DISPLAY
// ==========================================

updateDoubts();
