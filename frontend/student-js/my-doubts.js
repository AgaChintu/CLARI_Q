
// ==========================================
// 1. GET HTML ELEMENTS
// ==========================================

const doubtContainer = document.getElementById("doubtContainer");

const searchInput = document.getElementById("searchInput");

const subjectSelect = document.getElementById("subjectSelect");

const sortSelect = document.getElementById("sort-doubts");

const statusTabs = document.querySelectorAll(
    ".status-tab, .status-tab-active"
);


// ==========================================
// 2. CURRENT STUDENT
// ==========================================

const CURRENT_STUDENT_ID =
    localStorage.getItem("clariqStudentId") || "S001";


// ==========================================
// 3. LOAD DOUBTS
// ==========================================

function getStoredDoubts() {

    let doubts = JSON.parse(
        localStorage.getItem("clariqDoubts") || "[]"
    );

    if (!Array.isArray(doubts)) {
        return [];
    }

    return doubts.filter(doubt => {

        return (
            !doubt.studentId ||
            doubt.studentId === CURRENT_STUDENT_ID
        );

    });

}


// ==========================================
// 4. FILTER STATE
// ==========================================

let selectedStatus = "all";

let selectedSubject = "all";

let selectedSort = "latest";


// ==========================================
// 5. ESCAPE HTML
// ==========================================

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


// ==========================================
// 6. FORMAT RELATIVE DATE
// ==========================================

function formatRelativeDate(dateString) {

    if (!dateString) return "";

    const date = new Date(dateString);

    if (isNaN(date.getTime())) return "";

    const difference = Date.now() - date.getTime();

    const minutes = Math.floor(difference / 60000);

    if (minutes < 1) return "Just now";

    if (minutes < 60) {
        return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
        return `${days} ${days === 1 ? "day" : "days"} ago`;
    }

    const weeks = Math.floor(days / 7);

    if (weeks < 5) {
        return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
    }

    const months = Math.floor(days / 30);

    if (months < 12) {
        return `${months} ${months === 1 ? "month" : "months"} ago`;
    }

    const years = Math.floor(months / 12);

    return `${years} ${years === 1 ? "year" : "years"} ago`;

}


// ==========================================
// 7. GET TOPICS AND SUBTOPICS
// ==========================================

function getDoubtTags(doubt) {

    const tags = [];

    // Topics array

    if (Array.isArray(doubt.topics)) {

        doubt.topics.forEach(topic => {

            const name =
                typeof topic === "string"
                    ? topic
                    : topic?.name;

            if (name) tags.push(name);

        });

    }


    // Subtopics array

    if (Array.isArray(doubt.subtopics)) {

        doubt.subtopics.forEach(subtopic => {

            const name =
                typeof subtopic === "string"
                    ? subtopic
                    : subtopic?.name;

            if (name) tags.push(name);

        });

    }


    // Legacy format

    if (!tags.length) {

        if (doubt.topic) {
            tags.push(doubt.topic);
        }

        if (doubt.subtopic) {
            tags.push(doubt.subtopic);
        }

        if (Array.isArray(doubt.tags)) {
            tags.push(...doubt.tags);
        }

    }

    return [...new Set(tags)];

}


// ==========================================
// 8. STATUS CONFIGURATION
// ==========================================

const statusConfig = {

    pending: {
        label: "Pending",
        className: "pending"
    },

    "in-progress": {
        label: "In Progress",
        className: "in-progress"
    },

    resolved: {
        label: "Resolved",
        className: "resolved"
    }

};


// ==========================================
// 9. CREATE DOUBT CARD
// ==========================================

function createDoubtCard(doubt) {

    const card = document.createElement("article");

    card.className = "doubt-card";

    card.tabIndex = 0;

    card.setAttribute("role", "button");


    // SUBJECT

    const subject = escapeHTML(doubt.subject || "General");


    // STATUS

    const status =
        statusConfig[doubt.status] || statusConfig.pending;


    // QUESTION

    const question = escapeHTML(
        doubt.question ||
        doubt.description ||
        doubt.title ||
        "No question provided."
    );


    // TAGS

    const tags = getDoubtTags(doubt);

    const tagsHTML = tags.length
        ? `
            <div class="doubt-tags">

                ${tags.map(tag => `
                    <span class="doubt-tag">
                        ${escapeHTML(tag)}
                    </span>
                `).join("")}

            </div>
        `
        : "";


    // TEACHER NAME

    const teacherHTML = `
        <div class="doubt-teacher">

            <i data-lucide="user-round"></i>

            <span>
                ${escapeHTML(doubt.teacherName || "Not assigned")}
            </span>

        </div>
    `;


    // TIMESTAMP

    const timestamp = formatRelativeDate(doubt.createdAt);


    // CARD HTML

    card.innerHTML = `

        <div class="doubt-card-top">

            <span class="subject-badge">
                ${subject}
            </span>

            <span class="doubt-status ${status.className}">
                ${status.label}
            </span>

        </div>


        <p class="doubt-question">
            ${question}
        </p>


        ${tagsHTML}


        <div class="doubt-card-bottom">

            ${teacherHTML}

            <span class="doubt-time">
                ${escapeHTML(timestamp)}
            </span>

        </div>

    `;


    // OPEN DOUBT DETAILS

    function openDoubt() {

        window.location.href =
            `doubt-details.html?source=my-doubts&id=${encodeURIComponent(doubt.id)}`;

    }

    card.addEventListener("click", openDoubt);

    card.addEventListener("keydown", event => {

        if (event.key === "Enter" || event.key === " ") {

            event.preventDefault();

            openDoubt();

        }

    });


    return card;

}


// ==========================================
// 10. FILTER DOUBTS
// ==========================================

function getFilteredDoubts() {

    let doubts = getStoredDoubts();


    // SUBJECT FILTER

    if (selectedSubject !== "all") {

        doubts = doubts.filter(doubt => {

            return doubt.subject === selectedSubject;

        });

    }


    // STATUS FILTER

    if (selectedStatus !== "all") {

        doubts = doubts.filter(doubt => {

            return doubt.status === selectedStatus;

        });

    }


    // SEARCH

    const searchTerm = searchInput.value.trim().toLowerCase();

    if (searchTerm) {

        doubts = doubts.filter(doubt => {

            const searchableText = [

                doubt.title,
                doubt.question,
                doubt.description,
                doubt.subject,
                doubt.teacherName,

                ...getDoubtTags(doubt)

            ].join(" ").toLowerCase();


            return searchableText.includes(searchTerm);

        });

    }


    // SORT

    doubts.sort((a, b) => {

        const dateA = new Date(a.createdAt).getTime() || 0;

        const dateB = new Date(b.createdAt).getTime() || 0;

        return selectedSort === "latest"
            ? dateB - dateA
            : dateA - dateB;

    });


    return doubts;

}


// ==========================================
// 11. DISPLAY DOUBTS
// ==========================================

function displayDoubts() {

    const doubts = getFilteredDoubts();

    doubtContainer.innerHTML = "";


    if (!doubts.length) {

        doubtContainer.innerHTML = `

            <div class="doubts-empty">

                <i data-lucide="inbox"></i>

                <h3>No doubts found</h3>

                <p>
                    Try changing your filters or ask a new doubt.
                </p>

            </div>

        `;

    }

    else {

        doubts.forEach(doubt => {

            doubtContainer.appendChild(
                createDoubtCard(doubt)
            );

        });

    }


    // RENDER LUCIDE ICONS

    if (window.lucide) {
        window.lucide.createIcons();
    }

}


// ==========================================
// 12. STATUS TABS
// ==========================================

statusTabs.forEach(tab => {

    tab.addEventListener("click", () => {

        selectedStatus = tab.dataset.status;


        statusTabs.forEach(item => {

            item.classList.remove("status-tab-active");

            item.classList.add("status-tab");

        });


        tab.classList.remove("status-tab");

        tab.classList.add("status-tab-active");


        displayDoubts();

    });

});


// ==========================================
// 13. SUBJECT FILTER
// ==========================================

subjectSelect.addEventListener("change", () => {

    selectedSubject = subjectSelect.value;

    displayDoubts();

});


// ==========================================
// 14. SEARCH
// ==========================================

searchInput.addEventListener("input", displayDoubts);


// ==========================================
// 15. SORT
// ==========================================

sortSelect.addEventListener("change", () => {

    selectedSort = sortSelect.value;

    displayDoubts();

});


// ==========================================
// 16. INITIALIZE SAMPLE DOUBTS
// ==========================================

function initializeSampleDoubts() {

    // Only seed when storage has never been initialized.
    if (localStorage.getItem("clariqDoubts") !== null) {
        return;
    }

    const now = Date.now();

    const sampleDoubts = [

        {
            id: "DEMO001",
            studentId: CURRENT_STUDENT_ID,
            classId: "2-AIML",
            className: "2-AIML",

            question: "What is the use of linked list in stack?",

            description: "I can also implement stack using an array. Is there any use of implementing it using a linked list? What is the difference between both approaches?",

            subject: "DSA",
            teacherId: "T001",
            teacherName: "Dr. Dhaka",

            topics: ["Linked Lists"],
            subtopics: ["Stack Implementation"],

            status: "pending",

            attachments: [],

            createdAt: new Date(now - 3600000).toISOString()
        },

        {
            id: "DEMO002",
            studentId: CURRENT_STUDENT_ID,
            classId: "2-AIML",
            className: "2-AIML",

            question: "How does dynamic memory allocation work in C?",

            description: "I understand that malloc and calloc allocate memory dynamically, but I am confused about how the allocated memory is managed and when it should be released.",

            subject: "Python",
            teacherId: "T002",
            teacherName: "Prof. Vivek Shukla",

            topics: ["Memory Management"],
            subtopics: ["Dynamic Allocation"],

            status: "in-progress",

            attachments: [],

            createdAt: new Date(now - 86400000).toISOString()
        },

        {
            id: "DEMO003",
            studentId: CURRENT_STUDENT_ID,
            classId: "2-AIML",
            className: "2-AIML",

            question: "What is the difference between logical and physical addresses?",

            description: "I am confused about how the CPU generates a logical address and how the memory management unit converts it into a physical address.",

            subject: "COA",
            teacherId: "T006",
            teacherName: "Prof. Kamran",

            topics: ["Memory Organization"],
            subtopics: ["Address Translation"],

            status: "resolved",

            attachments: [],

            createdAt: new Date(now - 172800000).toISOString()
        },

        {
            id: "DEMO004",
            studentId: CURRENT_STUDENT_ID,
            classId: "2-AIML",
            className: "2-AIML",

            question: "How do we calculate the time complexity of nested loops?",

            description: "I understand the basic time complexities of individual loops, but I get confused when one loop is placed inside another or when their conditions depend on each other.",

            subject: "DSA",
            teacherId: "T001",
            teacherName: "Dr. Dhaka",

            topics: ["Algorithm Analysis"],
            subtopics: ["Time Complexity"],

            status: "pending",

            attachments: [],

            createdAt: new Date(now - 259200000).toISOString()
        },

        {
            id: "DEMO005",
            studentId: CURRENT_STUDENT_ID,
            classId: "2-AIML",
            className: "2-AIML",

            question: "Why is normalization required in DBMS?",

            description: "I understand that normalization reduces redundancy, but I want to understand how it prevents insertion, deletion and update anomalies in practical database examples.",

            subject: "DBMS",
            teacherId: "T010",
            teacherName: "Prof. Nipun Pande",

            topics: ["Database Design"],
            subtopics: ["Normalization"],

            status: "resolved",

            attachments: [],

            createdAt: new Date(now - 604800000).toISOString()
        }

    ];

    localStorage.setItem(
        "clariqDoubts",
        JSON.stringify(sampleDoubts)
    );

}


// ==========================================
// 17. INITIALIZE
// ==========================================

initializeSampleDoubts();

displayDoubts();