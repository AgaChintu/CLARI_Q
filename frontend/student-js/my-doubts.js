const doubts = [
    // PENDING — 2
    {
        id: 101,
        title: "Linked List Traversal",
        subject: "DSA",
        question: "Why do we need to traverse a linked list from the head instead of accessing elements directly?",
        status: "pending",
        createdAt: "2026-09-29"
    },

    {
        id: 102,
        title: "JK Flip-Flop",
        subject: "DE",
        question: "Why does a JK flip-flop avoid the invalid state of an SR flip-flop?",
        status: "pending",
        createdAt: "2026-09-25"
    },
    {id: 112,
    title: "Binary Search Tree",
    subject: "DSA",
    question: "How does searching work in a binary search tree?",
    status: "resolved",
    createdAt: "2026-09-21"
    },


    // IN PROGRESS — 2
    {
        id: 103,
        title: "POSets and Hasse Diagram",
        subject: "DSTL",
        question: "How do we construct a Hasse diagram from a given partially ordered set?",
        status: "in-progress",
        createdAt: "2026-09-28"
    },

    {
        id: 104,
        title: "Python List Comprehension",
        subject: "Python",
        question: "When should we use list comprehension instead of a normal for loop?",
        status: "in-progress",
        createdAt: "2026-09-23"
    },


    // RESOLVED — 3
    {
        id: 105,
        title: "Cache Memory",
        subject: "COA",
        question: "Why is cache memory faster than main memory even though both are used by the CPU?",
        status: "resolved",
        createdAt: "2026-09-27"
    },

    {
        id: 106,
        title: "Technical Presentation",
        subject: "TC",
        question: "What are the main elements of an effective technical presentation?",
        status: "resolved",
        createdAt: "2026-09-22"
    },

    {
        id: 107,
        title: "Stack Implementation",
        subject: "DSA",
        question: "How does push and pop work when implementing a stack using a linked list?",
        status: "resolved",
        createdAt: "2026-09-18"
    },


    // SHARED — 2
    {
        id: 108,
        title: "CPU Registers",
        subject: "COA",
        question: "What is the purpose of registers inside the CPU?",
        status: "shared",
        createdAt: "2026-09-25"
    },

    {
        id: 109,
        title: "Group Homomorphism",
        subject: "DSTL",
        question: "How do we determine whether a mapping between two groups is a homomorphism?",
        status: "shared",
        createdAt: "2026-09-20"
    },


    // EXAM — 2
    {
        id: 110,
        title: "Python Functions",
        subject: "Python",
        question: "What is the difference between parameters and arguments in Python functions?",
        status: "exam",
        createdAt: "2026-09-24"
    },

    {
        id: 111,
        title: "Instruction Cycle",
        subject: "COA",
        question: "What are the different steps involved in the instruction cycle?",
        status: "exam",
        createdAt: "2026-09-19"
    }
];
const statusStyles = {

    pending: {
        label: "Pending Review",
        icon: "clock",
        color: "#D98A00",
        background: "#FFF0D6"
    },

    "in-progress": {
        label: "In Progress",
        icon: "loader-circle",
        color: "#4965E8",
        background: "#E3EAFF"
    },

    resolved: {
        label: "Resolved",
        icon: "circle-check",
        color: "#29945A",
        background: "#DCF5E7"
    },

    shared: {
        label: "Shared",
        icon: "star",
        color: "#7655C8",
        background: "#EEE7FF"
    },

    exam: {
        label: "Exam",
        icon: "book-open",
        color: "#C58A00",
        background: "#FFF0C7"
    }

};







const doubtContainer = document.getElementById("doubtContainer");


function createDoubtCard(doubt) {

    const card = document.createElement("div");

    card.className = "doubt-card";


    const subject = subjectStyles[doubt.subject];

    const status = statusStyles[doubt.status];


    card.innerHTML = `
        <div class="doubt-icon">
            <img src="${subject.icon}" alt="${doubt.subject} icon">
        </div>

        <div class="doubt-info">

            <div class="doubt-meta">
                <span class="doubt-title">${doubt.title}</span>
                <span class="separator">•</span>
                <span class="doubt-subject">${doubt.subject}</span>
            </div>

            <p class="doubt-ques">
                ${doubt.question}
            </p>

        </div>

        <div class="doubt-status-meta">

            <div
                class="status"
                style="background-color: ${status.background}; color: ${status.color};"
            >
                <i data-lucide="${status.icon}"></i>
                <p>${status.label}</p>
            </div>

            <p class="asked-time">
                ${doubt.createdAt}
            </p>

        </div>
    `;

    return card;
}


function displayDoubts(doubtsToDisplay) {

    doubtContainer.innerHTML = "";

    doubtsToDisplay.forEach(function(doubt) {

        const card = createDoubtCard(doubt);

        doubtContainer.appendChild(card);

    });

    lucide.createIcons();
}


displayDoubts(doubts);



const statusTabs = document.querySelectorAll(".status-tab, .status-tab-active");
const sortSelect = document.getElementById("sort-doubts");
const subjectSelect = document.querySelector(".select-subj");

let selectedStatus = "all";
let selectedSort = "latest";
let selectedSubject = "all";


function updateDoubts() {

    // Start with ALL doubts
    let filteredDoubts = doubts.slice();


    // -------------------------
    // FILTER BY SUBJECT
    // -------------------------

    if (selectedSubject !== "all") {

        filteredDoubts = filteredDoubts.filter(function(doubt) {
            return doubt.subject === selectedSubject;
        });

    }


    // -------------------------
    // FILTER BY STATUS
    // -------------------------

    if (selectedStatus !== "all") {

        filteredDoubts = filteredDoubts.filter(function(doubt) {
            return doubt.status === selectedStatus;
        });

    }


    // -------------------------
    // SORT
    // -------------------------

    if (selectedSort === "latest") {

        filteredDoubts.sort(function(a, b) {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

    } else if (selectedSort === "oldest") {

        filteredDoubts.sort(function(a, b) {
            return new Date(a.createdAt) - new Date(b.createdAt);
        });

    }


    // -------------------------
    // DISPLAY
    // -------------------------

    displayDoubts(filteredDoubts);
}



// -------------------------
// STATUS TABS
// -------------------------

statusTabs.forEach(function(tab) {

    tab.addEventListener("click", function() {

        selectedStatus = tab.dataset.status;


        // Change active tab
        statusTabs.forEach(function(tab) {

            tab.classList.remove("status-tab-active");
            tab.classList.add("status-tab");

        });


        tab.classList.remove("status-tab");
        tab.classList.add("status-tab-active");


        // Apply all current filters + sort
        updateDoubts();

    });

});



// -------------------------
// SUBJECT DROPDOWN
// -------------------------

subjectSelect.addEventListener("change", function() {

    selectedSubject = subjectSelect.value;

    // Apply current status + subject + sort
    updateDoubts();

});



// -------------------------
// SORT DROPDOWN
// -------------------------

sortSelect.addEventListener("change", function() {

    selectedSort = sortSelect.value;

    // Apply current subject + status + sort
    updateDoubts();

});



// -------------------------
// INITIAL DISPLAY
// -------------------------

updateDoubts();