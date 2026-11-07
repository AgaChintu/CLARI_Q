// ==========================================
// 1. SAMPLE LIBRARY DATA
// ==========================================

const sampleLibraryDoubts = [

    {
        id: 101,
        title: "Understanding Binary Search Trees",
        question: "How does insertion work in a Binary Search Tree, and what happens when we insert duplicate values?",
        subject: "DSA",
        teacherName: "Dr. Dhaka",
        status: "resolved",
        publishedToLibrary: true,
        isDemo: true,
        tags: ["Trees", "BST", "Data Structures"],
        teacherResources: [
            {
                name: "BST Notes.pdf",
                size: "1.2 MB",
                url: "#"
            },
            {
                name: "Binary Trees Reference",
                url: "https://example.com"
            }
        ],
        createdAt: "2026-11-05",
        resolvedAt: "2026-11-07"
    },

    {
        id: 102,
        title: "Understanding Cache Memory",
        question: "What is the difference between direct mapping and associative mapping in cache memory?",
        subject: "COA",
        teacherName: "Prof. Kamran",
        status: "resolved",
        publishedToLibrary: true,
        isDemo: true,
        tags: ["Cache Memory", "Mapping"],
        teacherResources: [],
        createdAt: "2026-11-04",
        resolvedAt: "2026-11-06"
    },

    {
        id: 103,
        title: "First Order Differential Equations",
        question: "How do we identify whether a differential equation is exact or linear, and which method should we apply?",
        subject: "DSTL",
        teacherName: "Prof. Kamlendra",
        status: "resolved",
        publishedToLibrary: true,
        isDemo: true,
        tags: ["Differential Equations", "Mathematics"],
        teacherResources: [
            {
                name: "Differential Equations Notes.pdf",
                size: "850 KB",
                url: "#"
            }
        ],
        createdAt: "2026-11-03",
        resolvedAt: "2026-11-05"
    },

    {
        id: 104,
        title: "Python Decorators Explained",
        question: "What exactly happens when a decorator is applied to a function, and how does the wrapper function work?",
        subject: "Python",
        teacherName: "Prof. Vivek Shukla",
        status: "resolved",
        publishedToLibrary: true,
        isDemo: true,
        tags: ["Decorators", "Functions", "Python"],
        teacherResources: [
            {
                name: "Python Decorators Guide.pdf",
                size: "1.5 MB",
                url: "#"
            },
            {
                name: "Official Python Documentation",
                url: "https://docs.python.org/3/"
            }
        ],
        createdAt: "2026-11-02",
        resolvedAt: "2026-11-04"
    },

    {
        id: 105,
        title: "Introduction to Database Normalization",
        question: "Why do we use normalization in relational databases, and how do 1NF, 2NF and 3NF differ?",
        subject: "DE",
        teacherName: "Prof. Nipun Pande",
        status: "resolved",
        publishedToLibrary: true,
        isDemo: true,
        tags: ["Normalization", "DBMS", "SQL"],
        teacherResources: [],
        createdAt: "2026-11-01",
        resolvedAt: "2026-11-03"
    },

    {
        id: 106,
        title: "Understanding Context-Free Grammars",
        question: "How can we determine whether a grammar is ambiguous, and what role do parse trees play in this?",
        subject: "TC",
        teacherName: "Dr. Ruchi Shah",
        status: "resolved",
        publishedToLibrary: true,
        isDemo: true,
        tags: ["CFG", "Grammars", "Parse Trees"],
        teacherResources: [
            {
                name: "CFG Reference Notes.pdf",
                size: "920 KB",
                url: "#"
            }
        ],
        createdAt: "2026-10-30",
        resolvedAt: "2026-11-02"
    }

];


// ==========================================
// 2. INITIALIZE SAMPLE LIBRARY
// ==========================================

function initializeSampleLibrary() {

    const existingLibrary =
        localStorage.getItem("clariqLibrary");

    if (existingLibrary === null) {

        localStorage.setItem(
            "clariqLibrary",
            JSON.stringify(sampleLibraryDoubts)
        );

    }

}


// ==========================================
// 3. LOAD LIBRARY DATA
// ==========================================

function loadLibraryData() {

    let library = JSON.parse(
        localStorage.getItem("clariqLibrary") || "[]"
    );

    if (!Array.isArray(library)) {
        library = [];
    }

    return library.filter(doubt => {

        return (
            doubt.status === "resolved" &&
            (
                doubt.publishedToLibrary === true ||
                doubt.isPublished === true ||
                doubt.libraryPublished === true ||
                doubt.published === true ||
                doubt.visibility === "published"
            )
        );

    });

}


// ==========================================
// 4. GET HTML ELEMENTS
// ==========================================

const searchInput = document.getElementById("searchInput");

const subjectFilter = document.getElementById("subjectSelect");

const libraryList = document.getElementById("libraryList");

const noResults = document.getElementById("noResults");


// ==========================================
// 5. INITIALIZE
// ==========================================

initializeSampleLibrary();

let allLibraryDoubts = loadLibraryData();


// ==========================================
// 6. FORMAT RELATIVE DATE
// ==========================================

function formatRelativeDate(dateString) {

    if (!dateString) return "";

    const doubtDate = new Date(dateString);

    if (isNaN(doubtDate.getTime())) return "";

    doubtDate.setHours(0, 0, 0, 0);

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const difference = Math.floor(
        (today - doubtDate) / (1000 * 60 * 60 * 24)
    );

    if (difference === 0) return "Today";

    if (difference === 1) return "Yesterday";

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
// 7. ESCAPE HTML
// ==========================================

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


// ==========================================
// 8. GET RESOURCE COUNT
// ==========================================

function getResourceCount(doubt) {

    const resources = [

        ...(Array.isArray(doubt.teacherResources) ? doubt.teacherResources : []),

        ...(Array.isArray(doubt.teacherAttachments) ? doubt.teacherAttachments : []),

        ...(Array.isArray(doubt.answerAttachments) ? doubt.answerAttachments : []),

        ...(Array.isArray(doubt.resources) ? doubt.resources : [])

    ];

    const uniqueResources = new Map();

    resources.forEach(resource => {

        const identifier =
            resource.fileId ||
            resource.url ||
            resource.name;

        if (identifier) {
            uniqueResources.set(identifier, resource);
        }

    });

    return uniqueResources.size;

}


// ==========================================
// 9. CREATE LIBRARY CARD
// ==========================================

function createLibraryCard(doubt) {

    const card = document.createElement("article");

    card.className = "library-card";

    const subject = subjectStyles[doubt.subject] || {};

    const subjectIcon = subject.icon || "";

    const resourceCount = getResourceCount(doubt);

    const tags = Array.isArray(doubt.tags)
        ? doubt.tags
        : [];

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


    // Teacher information

    const teacherHTML = `

        <div class="teacher-meta">

            <i data-lucide="user-round"></i>

            <span class="teacher-name">
                ${escapeHTML(
                    doubt.answeredBy ||
                    doubt.teacherName ||
                    "Teacher"
                )}
            </span>

            <span class="doubt-date">
                ${formatRelativeDate(
                    doubt.resolvedAt ||
                    doubt.createdAt
                )}
            </span>

        </div>

    `;


    // Resource indicator

    const resourceHTML = resourceCount > 0

        ? `
            <div class="resource-indicator">

                <i data-lucide="link"></i>

                <span>${resourceCount}</span>

            </div>
        `

        : "";


    // Card HTML

    card.innerHTML = `

        <div class="doubt-icon">

            ${subjectIcon
                ? `<img src="${escapeHTML(subjectIcon)}"
                        alt="${escapeHTML(doubt.subject)}">`
                : `<span>${escapeHTML(doubt.subject)}</span>`
            }

        </div>


        <div class="doubt-info">

            <div class="doubt-meta">

                <span class="doubt-title">
                    ${escapeHTML(doubt.title || "Untitled Doubt")}
                </span>

                <span class="separator">•</span>

                <span class="doubt-subject">
                    ${escapeHTML(doubt.subject)}
                </span>

            </div>


            <p class="doubt-ques">
                ${escapeHTML(doubt.question)}
            </p>


            ${tagsHTML}

            ${teacherHTML}

        </div>


        ${resourceHTML}

    `;


    // Open doubt details

    card.addEventListener("click", function() {

        window.location.href =
            `doubt-details.html?source=library&id=${encodeURIComponent(doubt.id)}`;

    });


    return card;

}


// ==========================================
// 10. DISPLAY LIBRARY CARDS
// ==========================================

function displayLibrary(doubtsToDisplay) {

    libraryList.innerHTML = "";

    if (doubtsToDisplay.length === 0) {

        noResults.hidden = false;

        return;

    }

    noResults.hidden = true;

    doubtsToDisplay.forEach(doubt => {

        libraryList.appendChild(
            createLibraryCard(doubt)
        );

    });

    if (window.lucide) {
        lucide.createIcons();
    }

}


// ==========================================
// 11. SEARCH + SUBJECT FILTER
// ==========================================

function filterLibrary() {

    const searchText =
        searchInput.value.toLowerCase().trim();

    const selectedSubject =
        subjectFilter.value;


    const filteredDoubts = allLibraryDoubts.filter(doubt => {

        const tags = Array.isArray(doubt.tags)
            ? doubt.tags
            : [];

        const searchableContent = [

            doubt.title,
            doubt.question,
            doubt.topic,
            doubt.subject,
            doubt.teacherName,
            doubt.answeredBy,
            ...tags

        ].join(" ").toLowerCase();


        const matchesSearch =
            searchableContent.includes(searchText);


        const matchesSubject =
            selectedSubject === "all" ||
            doubt.subject === selectedSubject;


        return matchesSearch && matchesSubject;

    });


    displayLibrary(filteredDoubts);

}


// ==========================================
// 12. SEARCH EVENT
// ==========================================

searchInput.addEventListener("input", filterLibrary);


// ==========================================
// 13. SUBJECT FILTER EVENT
// ==========================================

subjectFilter.addEventListener("change", filterLibrary);


// ==========================================
// 14. INITIAL DISPLAY
// ==========================================

displayLibrary(allLibraryDoubts);


// ==========================================
// 15. REFRESH WHEN RETURNING TO LIBRARY
// ==========================================

window.addEventListener("pageshow", function() {

    allLibraryDoubts = loadLibraryData();

    filterLibrary();

});