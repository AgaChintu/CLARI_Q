
// ==========================================
// 1. URL PARAMETERS
// ==========================================

const params = new URLSearchParams(window.location.search);

const doubtId = Number(params.get("id"));
const source = params.get("source") || "my-doubts";

const isLibrarySource = source === "library";

const returnPage = isLibrarySource
    ? "library.html"
    : "my-doubts.html";


// ==========================================
// 2. HTML ELEMENTS
// ==========================================

const detailContent =
    document.getElementById("detailContent");

const detailSidebar =
    document.getElementById("detailSidebar");

const modalBackdrop =
    document.getElementById("detailModalBackdrop");

const followupConversation =
    document.getElementById("followupConversation");

const followupAction =
    document.getElementById("followupAction");

const backBtn =
    document.getElementById("backBtn");

const backLink =
    document.getElementById("backLink");

const detailMain =
    document.querySelector(".detail-main");


// ==========================================
// 3. STORAGE CONFIGURATION
// ==========================================

const storageKey = isLibrarySource
    ? "clariqLibrary"
    : "clariqDoubts";

let doubts = JSON.parse(
    localStorage.getItem(storageKey) || "[]"
);

if (!Array.isArray(doubts)) {
    doubts = [];
}


// ==========================================
// 4. INDEXEDDB CONFIGURATION
// ==========================================

const DB_NAME = "ClariQFiles";
const DB_VERSION = 1;
const FILE_STORE = "attachments";


// ==========================================
// 5. NORMALIZE TOPIC DATA
// ==========================================

function normalizeTopicItem(item) {

    if (!item) return null;

    if (typeof item === "string") {

        return {
            id: item,
            name: item
        };

    }

    const name =
        item.name ||
        item.topicName ||
        item.subtopicName ||
        "";

    if (!name) return null;

    return {
        id: String(item.id || item.topicId || name),
        name
    };

}


function normalizeSubtopicItem(item) {

    if (!item) return null;

    if (typeof item === "string") {

        return {
            id: item,
            name: item,
            topicId: null,
            topicName: null
        };

    }

    const name =
        item.name ||
        item.subtopicName ||
        "";

    if (!name) return null;

    return {
        id: String(item.id || item.subtopicId || name),
        name,
        topicId: item.topicId || null,
        topicName: item.topicName || null
    };

}


// ==========================================
// 6. MIGRATE OLD DOUBT DATA
// ==========================================

function normalizeDoubtData(record) {

    const doubt = { ...record };


    // SMALL QUESTION

    doubt.title =
        doubt.title ||
        doubt.shortQuestion ||
        "Untitled Doubt";


    // DETAILED EXPLANATION

    doubt.description =
        doubt.description ||
        doubt.question ||
        "";


    // Keep the old question property synchronized
    // because other ClariQ pages may still read it.

    doubt.question = doubt.description;


    // ======================================
    // CURRENT TOPIC STRUCTURE
    // ======================================

    let topics = Array.isArray(doubt.topics)
        ? doubt.topics.map(normalizeTopicItem).filter(Boolean)
        : [];

    let subtopics = Array.isArray(doubt.subtopics)
        ? doubt.subtopics.map(normalizeSubtopicItem).filter(Boolean)
        : [];


    // ======================================
    // MIGRATE OLD SINGLE TOPIC FIELDS
    // ======================================

    if (
        topics.length === 0 &&
        (doubt.topicName || doubt.topic)
    ) {

        const oldTopic = normalizeTopicItem({
            id: doubt.topicId || doubt.topicName || doubt.topic,
            name: doubt.topicName || doubt.topic
        });

        if (oldTopic) {
            topics.push(oldTopic);
        }

    }


    if (
        subtopics.length === 0 &&
        (doubt.subtopicName || doubt.subtopic)
    ) {

        const oldSubtopic = normalizeSubtopicItem({
            id: doubt.subtopicName || doubt.subtopic,
            name: doubt.subtopicName || doubt.subtopic,
            topicId: doubt.topicId || null,
            topicName: doubt.topicName || doubt.topic || null
        });

        if (oldSubtopic) {
            subtopics.push(oldSubtopic);
        }

    }


    // ======================================
    // MIGRATE OLD TAGS
    // ======================================

    if (
        topics.length === 0 &&
        subtopics.length === 0 &&
        Array.isArray(doubt.tags)
    ) {

        topics = doubt.tags
            .map(normalizeTopicItem)
            .filter(Boolean);

    }


    // ======================================
    // BUILD TOPIC SELECTIONS
    // ======================================

    let topicSelections = Array.isArray(doubt.topicSelections)
        ? doubt.topicSelections
        : [];


    if (topicSelections.length === 0) {

        const topicIds = [

            ...new Set([

                ...topics.map(topic => topic.id),

                ...subtopics
                    .map(subtopic => subtopic.topicId)
                    .filter(Boolean)

            ])

        ];


        topicSelections = topicIds.map(topicId => {

            const topic = topics.find(
                item => item.id === topicId
            );

            const relatedSubtopics = subtopics
                .filter(item => item.topicId === topicId)
                .map(item => ({

                    subtopicId: item.id,

                    subtopicName: item.name

                }));


            return {

                topicId,

                topicName:
                    topic?.name ||
                    subtopics.find(
                        item => item.topicId === topicId
                    )?.topicName ||
                    topicId,

                subtopics: relatedSubtopics

            };

        });

    }


    // ======================================
    // NORMALIZE CURRENT TOPIC SELECTIONS
    // ======================================

    topicSelections = topicSelections.map(selection => ({

        topicId: selection.topicId,

        topicName: selection.topicName,

        subtopics: Array.isArray(selection.subtopics)
            ? selection.subtopics.map(item => ({

                subtopicId:
                    item.subtopicId ||
                    item.id ||
                    item.subtopicName,

                subtopicName:
                    item.subtopicName ||
                    item.name ||
                    ""

            })).filter(item => item.subtopicName)
            : []

    }));


    // If the separate arrays are missing,
    // rebuild them from topicSelections.

    if (topics.length === 0) {

        topics = topicSelections.map(selection => ({

            id: selection.topicId,

            name: selection.topicName

        }));

    }


    if (subtopics.length === 0) {

        subtopics = topicSelections.flatMap(selection => {

            return selection.subtopics.map(item => ({

                id: item.subtopicId,

                name: item.subtopicName,

                topicId: selection.topicId,

                topicName: selection.topicName

            }));

        });

    }


    // Store the canonical structure.

    doubt.topics = topics;
    doubt.subtopics = subtopics;
    doubt.topicSelections = topicSelections;


    return doubt;

}


// ==========================================
// 7. MIGRATE STORED RECORDS
// ==========================================

const originalData = JSON.stringify(doubts);

doubts = doubts.map(normalizeDoubtData);

const migratedData = JSON.stringify(doubts);

if (originalData !== migratedData) {

    localStorage.setItem(
        storageKey,
        migratedData
    );

}


const doubt = doubts.find(
    item => Number(item.id) === doubtId
);


// ==========================================
// 8. GET DISPLAY CONTENT
// ==========================================

function getDoubtContent(doubt) {

    return {

        title: doubt.title || "Untitled Doubt",

        description: doubt.description || "",

        topics: Array.isArray(doubt.topics)
            ? doubt.topics
            : [],

        subtopics: Array.isArray(doubt.subtopics)
            ? doubt.subtopics
            : []

    };

}


// ==========================================
// 9. ESCAPE HTML
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
// 10. SIDEBAR ACTIVE STATE
// ==========================================

function setActiveSidebarLink() {

    const activeHref = isLibrarySource
        ? "library.html"
        : "my-doubts.html";

    document.querySelectorAll(".sidebar a").forEach(link => {

        link.classList.remove("nav-item-active");

        if (link.getAttribute("href") === activeHref) {

            link.classList.add("nav-item-active");

        }

    });

}


// ==========================================
// 11. INDEXEDDB FUNCTIONS
// ==========================================

function openAttachmentDB() {

    return new Promise((resolve, reject) => {

        const request = indexedDB.open(
            DB_NAME,
            DB_VERSION
        );

        request.onupgradeneeded = () => {

            const db = request.result;

            if (!db.objectStoreNames.contains(FILE_STORE)) {

                db.createObjectStore(FILE_STORE, {
                    keyPath: "fileId"
                });

            }

        };

        request.onsuccess = () => resolve(request.result);

        request.onerror = () => reject(request.error);

    });

}


async function getAttachment(fileId) {

    const db = await openAttachmentDB();

    return new Promise((resolve, reject) => {

        const transaction = db.transaction(
            FILE_STORE,
            "readonly"
        );

        const store = transaction.objectStore(FILE_STORE);

        const request = store.get(fileId);


        request.onsuccess = () => {

            db.close();

            resolve(request.result || null);

        };


        request.onerror = () => {

            db.close();

            reject(request.error);

        };

    });

}


// ==========================================
// 12. DATE FORMATTING
// ==========================================

function formatDate(dateString) {

    if (!dateString) return "Not available";

    const date = new Date(dateString);

    if (isNaN(date)) return "Not available";

    return date.toLocaleDateString("en-IN", {

        day: "numeric",
        month: "short",
        year: "numeric"

    });

}


function formatRelativeDate(dateString) {

    if (!dateString) return "Date unavailable";

    const date = new Date(dateString);

    if (isNaN(date)) return "Date unavailable";

    const now = new Date();

    const difference = Math.max(0, now - date);

    const days = Math.floor(
        difference / (1000 * 60 * 60 * 24)
    );


    if (days === 0) return "Today";

    if (days === 1) return "1 day ago";

    if (days < 7) {
        return `${days} days ago`;
    }


    const weeks = Math.floor(days / 7);

    if (weeks < 5) {

        return weeks === 1
            ? "1 week ago"
            : `${weeks} weeks ago`;

    }


    const months = Math.floor(days / 30);

    if (months < 12) {

        return months === 1
            ? "1 month ago"
            : `${months} months ago`;

    }


    const years = Math.floor(days / 365);

    return years === 1
        ? "1 year ago"
        : `${years} years ago`;

}


// ==========================================
// 13. FILE SIZE FORMAT
// ==========================================

function formatFileSize(bytes) {

    if (!bytes) return "File";

    if (bytes < 1024 * 1024) {

        return `${(bytes / 1024).toFixed(1)} KB`;

    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

}


// ==========================================
// 14. DISPLAY MAIN DOUBT CARD
// ==========================================

function displayHeader() {

    const status = statusStyles[doubt.status];

    const content = getDoubtContent(doubt);


    detailContent.innerHTML = `

        <div class="detail-header">

            <div class="detail-heading">

                <span class="subject-badge">
                    ${escapeHTML(doubt.subject || "Subject")}
                </span>

                <h2 class="detail-title">
                    ${escapeHTML(content.title)}
                </h2>

            </div>


            <div class="detail-status-area">

                ${!isLibrarySource ? `

                    <div
                        class="detail-status"
                        style="
                            background: ${status.background};
                            color: ${status.color};
                        "
                    >
                        ${status.label}
                    </div>

                ` : ""}

            </div>

        </div>


        <div class="question-section">

            <p class="question-text">
                ${escapeHTML(content.description)}
            </p>

        </div>


        ${content.topics.length || content.subtopics.length ? `

            <div class="selected-topic-tags">

                ${content.topics.map(topic => `

                    <span class="selected-topic-tag">
                        ${escapeHTML(topic.name)}
                    </span>

                `).join("")}


                ${content.subtopics.map(subtopic => `

                    <span class="selected-topic-tag">
                        ${escapeHTML(subtopic.name)}
                    </span>

                `).join("")}

            </div>

        ` : ""}

    `;

}


// ==========================================
// 15. DISPLAY DOUBT DATE
// ==========================================

function displayDoubtDate() {

    const date = document.createElement("p");

    date.className = "detail-date";

    date.textContent = formatRelativeDate(doubt.createdAt);

    detailContent.appendChild(date);

}


// ==========================================
// 16. DISPLAY ATTACHMENTS
// ==========================================

async function displayAttachments(
    attachments,
    container = detailContent
) {

    if (!attachments || attachments.length === 0) return;


    const section = document.createElement("div");

    section.className = "doubt-attachments";


    const content = document.createElement("div");

    content.className = "attachment-content";

    section.appendChild(content);

    container.appendChild(section);


    const images = [];


    for (const attachment of attachments) {

        try {

            const storedFile = await getAttachment(
                attachment.fileId
            );

            if (!storedFile || !storedFile.blob) {

                console.warn(
                    "Attachment not found:",
                    attachment.fileId
                );

                continue;

            }


            const fileURL = URL.createObjectURL(
                storedFile.blob
            );


            const fileType =
                storedFile.type ||
                attachment.type ||
                "";

            const fileName =
                storedFile.name ||
                attachment.name ||
                "Attachment";

            const fileSize = formatFileSize(
                storedFile.size ||
                attachment.size
            );


            if (fileType.startsWith("image/")) {

                images.push({

                    url: fileURL,

                    name: fileName

                });

            }

            else if (fileType === "application/pdf") {

                const pdfCard = document.createElement("div");

                pdfCard.className = "pdf-preview";

                pdfCard.innerHTML = `

                    <div class="resource-icon">
                        <i data-lucide="file-text"></i>
                    </div>

                    <div class="pdf-file-info">

                        <p class="attachment-name">
                            ${escapeHTML(fileName)}
                        </p>

                        <p class="attachment-size">
                            ${fileSize}
                        </p>

                    </div>

                    <a
                        class="download-btn"
                        href="${fileURL}"
                        target="_blank"
                        rel="noopener"
                    >
                        <i data-lucide="eye"></i>
                        View PDF
                    </a>

                `;

                content.appendChild(pdfCard);

            }

        } catch (error) {

            console.error(
                "Attachment loading failed:",
                error
            );

        }

    }


    // IMAGE CAROUSEL

    if (images.length > 0) {

        const carousel = document.createElement("div");

        carousel.className = "image-carousel";

        carousel.innerHTML = `

            <div class="image-carousel-stage">

                <img
                    class="carousel-image"
                    src="${images[0].url}"
                    alt="${escapeHTML(images[0].name)}"
                >

                ${images.length > 1 ? `

                    <button
                        type="button"
                        class="carousel-arrow carousel-prev"
                        aria-label="Previous image"
                    >
                        <i data-lucide="chevron-left"></i>
                    </button>

                    <button
                        type="button"
                        class="carousel-arrow carousel-next"
                        aria-label="Next image"
                    >
                        <i data-lucide="chevron-right"></i>
                    </button>

                ` : ""}

            </div>


            ${images.length > 1 ? `

                <div class="image-carousel-footer">

                    <span class="carousel-counter">
                        1 / ${images.length}
                    </span>

                </div>

            ` : ""}

        `;


        const imageElement =
            carousel.querySelector(".carousel-image");

        let currentIndex = 0;


        function updateCarousel() {

            const currentImage = images[currentIndex];

            imageElement.src = currentImage.url;

            imageElement.alt = currentImage.name;


            const counter =
                carousel.querySelector(".carousel-counter");

            if (counter) {

                counter.textContent =
                    `${currentIndex + 1} / ${images.length}`;

            }

        }


        const previousButton =
            carousel.querySelector(".carousel-prev");

        if (previousButton) {

            previousButton.addEventListener("click", () => {

                currentIndex =
                    (currentIndex - 1 + images.length) %
                    images.length;

                updateCarousel();

            });

        }


        const nextButton =
            carousel.querySelector(".carousel-next");

        if (nextButton) {

            nextButton.addEventListener("click", () => {

                currentIndex =
                    (currentIndex + 1) % images.length;

                updateCarousel();

            });

        }


        imageElement.addEventListener("click", () => {

            openImageLightbox(images[currentIndex].url);

        });


        content.insertBefore(
            carousel,
            content.firstChild
        );

    }


    lucide.createIcons();

}


// ==========================================
// 17. IMAGE LIGHTBOX
// ==========================================

function openImageLightbox(imageURL) {

    const overlay = document.createElement("div");

    overlay.className = "image-lightbox";

    overlay.innerHTML = `

        <button
            type="button"
            class="lightbox-close"
            aria-label="Close image preview"
        >
            <i data-lucide="x"></i>
        </button>

        <img
            src="${imageURL}"
            alt="Attachment preview"
        >

    `;

    document.body.appendChild(overlay);

    lucide.createIcons();


    overlay.addEventListener("click", event => {

        if (
            event.target === overlay ||
            event.target.closest(".lightbox-close")
        ) {

            overlay.remove();

        }

    });

}


// ==========================================
// 18. DISPLAY TEACHER ANSWER
// ==========================================

function displayAnswer() {

    if (doubt.status !== "resolved") return;


    const answerSection = document.createElement("div");

    answerSection.className = "answer-section";

    answerSection.innerHTML = `

        <h3 class="section-heading">
            <i data-lucide="circle-check"></i>
            Teacher's Answer
        </h3>

        <p class="answer-text">
            ${escapeHTML(
                doubt.teacherResponse ||
                "Your doubt has been resolved."
            )}
        </p>

    `;

    detailContent.appendChild(answerSection);

}


// ==========================================
// 19. DISPLAY TEACHER ATTACHMENTS
// ==========================================

async function displayTeacherAttachments() {

    if (doubt.status !== "resolved") return;

    const attachments =
        doubt.teacherAttachments ||
        doubt.answerAttachments ||
        [];

    await displayAttachments(attachments);

}


// ==========================================
// 20. DISPLAY LEGACY RESOURCES
// ==========================================

function displayResources() {

    if (!doubt.resources || doubt.resources.length === 0) {
        return;
    }


    const section = document.createElement("div");

    section.className = "resources-section";


    doubt.resources.forEach(resource => {

        const item = document.createElement("div");

        item.className = "resource-item";

        item.innerHTML = `

            <div class="resource-info">

                <div class="resource-icon">
                    <i data-lucide="file-text"></i>
                </div>

                <div>

                    <p class="resource-name">
                        ${escapeHTML(resource.name)}
                    </p>

                    <p class="resource-size">
                        ${escapeHTML(resource.size || "Resource")}
                    </p>

                </div>

            </div>


            ${resource.url ? `

                <a
                    href="${escapeHTML(resource.url)}"
                    class="download-btn"
                    target="_blank"
                    rel="noopener"
                    download
                >
                    <i data-lucide="download"></i>
                    Download
                </a>

            ` : ""}

        `;

        section.appendChild(item);

    });


    detailContent.appendChild(section);

}


// ==========================================
// 21. DISPLAY FOLLOW-UP DISCUSSION
// ==========================================

function displayFollowUps() {

    followupConversation.innerHTML = "";

    if (isLibrarySource) return;

    if (doubt.status !== "resolved") return;


    if (!Array.isArray(doubt.followUps)) {
        doubt.followUps = [];
    }

    if (doubt.followUps.length === 0) return;


    const heading = document.createElement("div");

    heading.className = "followup-section-heading";

    heading.innerHTML = `

        <div>

            <h3>Follow-up Discussion</h3>

            <p>
                Continue the conversation about your doubt.
            </p>

        </div>

    `;

    followupConversation.appendChild(heading);


    const section = document.createElement("div");

    section.className = "followup-list";

    section.id = "followupList";

    followupConversation.appendChild(section);

    renderFollowUpList();

}


// ==========================================
// 22. CHECK FOLLOW-UP PERMISSION
// ==========================================

function canAskFollowUp() {

    if (isLibrarySource) return false;

    if (doubt.status !== "resolved") return false;


    const followUps = doubt.followUps || [];

    if (followUps.length === 0) return true;


    const latestFollowUp =
        followUps[followUps.length - 1];

    return (

        latestFollowUp.status === "answered" ||

        Boolean(latestFollowUp.teacherResponse)

    );

}


// ==========================================
// 23. OPEN FOLLOW-UP FORM
// ==========================================

function openFollowUpForm() {

    if (isLibrarySource) return;

    if (document.getElementById("followupFormSection")) return;

    if (!canAskFollowUp()) return;


    const sidebarButton =
        document.getElementById("sidebarFollowupBtn");

    if (sidebarButton) {
        sidebarButton.remove();
    }


    const formSection = document.createElement("div");

    formSection.className = "followup-form-section";

    formSection.id = "followupFormSection";

    formSection.innerHTML = `

        <div class="followup-form-heading">

            <h3>
                <i data-lucide="message-circle-question"></i>
                Follow-up Question
            </h3>

            <button
                type="button"
                class="followup-cancel-btn"
                id="cancelFollowup"
                aria-label="Cancel follow-up"
            >
                <i data-lucide="x"></i>
            </button>

        </div>


        <form id="followupForm">

            <textarea
                id="followupInput"
                maxlength="1000"
                placeholder="Ask your follow-up question..."
                required
            ></textarea>

            <button
                type="submit"
                class="followup-submit"
            >
                <i data-lucide="send"></i>
                Submit Follow-up
            </button>

        </form>

    `;


    followupConversation.insertBefore(
        formSection,
        followupConversation.firstChild
    );


    document.getElementById("followupForm")
        .addEventListener("submit", submitFollowUp);

    document.getElementById("cancelFollowup")
        .addEventListener("click", cancelFollowUp);


    lucide.createIcons();

    document.getElementById("followupInput").focus();

}


// ==========================================
// 24. CANCEL FOLLOW-UP FORM
// ==========================================

function cancelFollowUp() {

    const formSection =
        document.getElementById("followupFormSection");

    if (formSection) {
        formSection.remove();
    }

    displaySidebarFollowupButton();

}


// ==========================================
// 25. SUBMIT FOLLOW-UP
// ==========================================

function submitFollowUp(event) {

    event.preventDefault();

    if (isLibrarySource) return;


    const input =
        document.getElementById("followupInput");

    const question = input.value.trim();


    if (!question) {

        alert("Please enter your follow-up question.");

        return;

    }


    if (!Array.isArray(doubt.followUps)) {
        doubt.followUps = [];
    }


    doubt.followUps.push({

        id: Date.now(),

        question,

        createdAt: new Date().toISOString(),

        status: "awaiting-response",

        teacherResponse: "",

        respondedAt: null,

        reason: ""

    });


    saveDoubtData();

    document.getElementById("followupFormSection").remove();

    displayFollowUps();

    alert("Your follow-up question has been submitted!");

}


// ==========================================
// 26. RENDER FOLLOW-UP LIST
// ==========================================

function renderFollowUpList() {

    if (isLibrarySource) return;


    const list = document.getElementById("followupList");

    if (!list) return;


    const followUps = doubt.followUps || [];


    if (followUps.length === 0) {

        list.innerHTML = "";

        return;

    }


    list.innerHTML = followUps.map(followUp => {

        const isAnswered =
            followUp.status === "answered" ||
            Boolean(followUp.teacherResponse);

        const isNotRequired =
            followUp.status === "not-required";


        return `

            <div
                class="followup-item"
                data-followup-id="${followUp.id}"
            >

                <div class="followup-card-heading">

                    <h3>
                        <i data-lucide="message-circle-question"></i>
                        Follow-up Question
                    </h3>

                    <div class="followup-menu-wrapper">

                        <button
                            class="followup-menu-btn"
                            type="button"
                            aria-label="Follow-up options"
                            data-menu-id="${followUp.id}"
                        >
                            <i data-lucide="ellipsis"></i>
                        </button>

                        <div
                            class="followup-dropdown"
                            id="followupMenu-${followUp.id}"
                        >

                            <button
                                type="button"
                                data-action="edit"
                                data-id="${followUp.id}"
                            >
                                <i data-lucide="pencil"></i>
                                Edit
                            </button>

                            <button
                                type="button"
                                data-action="delete"
                                data-id="${followUp.id}"
                            >
                                <i data-lucide="trash-2"></i>
                                Delete
                            </button>

                        </div>

                    </div>

                </div>


                <div
                    class="followup-question-content"
                    id="followupQuestion-${followUp.id}"
                >

                    <p class="followup-question">
                        ${escapeHTML(followUp.question)}
                    </p>

                    <span class="followup-date">
                        ${formatDate(followUp.createdAt)}
                    </span>

                </div>


                ${isAnswered ? `

                    <div class="followup-response">

                        <div class="followup-response-heading">

                            <i data-lucide="user-round"></i>

                            <strong>Teacher's Response</strong>

                            <span>
                                ${formatDate(
                                    followUp.respondedAt ||
                                    followUp.createdAt
                                )}
                            </span>

                        </div>

                        <p>
                            ${escapeHTML(followUp.teacherResponse)}
                        </p>

                    </div>

                ` : ""}


                ${isNotRequired && followUp.reason ? `

                    <p class="followup-reason">
                        Reason: ${escapeHTML(followUp.reason)}
                    </p>

                ` : ""}

            </div>

        `;

    }).join("");


    list.querySelectorAll(".followup-menu-btn")
        .forEach(button => {

            button.addEventListener("click", event => {

                event.stopPropagation();

                const id = button.dataset.menuId;

                const menu =
                    document.getElementById(`followupMenu-${id}`);


                document.querySelectorAll(".followup-dropdown")
                    .forEach(item => {

                        if (item !== menu) {
                            item.classList.remove("show");
                        }

                    });


                menu.classList.toggle("show");

            });

        });


    list.querySelectorAll(".followup-dropdown button")
        .forEach(button => {

            button.addEventListener("click", () => {

                const id = Number(button.dataset.id);

                const action = button.dataset.action;


                if (action === "edit") {
                    editFollowUp(id);
                }

                if (action === "delete") {
                    deleteFollowUp(id);
                }

            });

        });


    lucide.createIcons();

}


// ==========================================
// 27. EDIT FOLLOW-UP
// ==========================================

function editFollowUp(id) {

    if (isLibrarySource) return;


    const followUp = doubt.followUps.find(item => {

        return Number(item.id) === Number(id);

    });

    if (!followUp) return;


    const questionContainer =
        document.getElementById(`followupQuestion-${id}`);

    if (!questionContainer) return;


    questionContainer.innerHTML = `

        <textarea
            class="followup-edit-input"
            id="editFollowup-${id}"
            maxlength="1000"
        >${escapeHTML(followUp.question)}</textarea>

        <div class="followup-edit-actions">

            <button
                type="button"
                class="followup-edit-cancel"
                id="cancelFollowupEdit-${id}"
            >
                Cancel
            </button>

            <button
                type="button"
                class="followup-edit-save"
                id="saveFollowupEdit-${id}"
            >
                Save Changes
            </button>

        </div>

    `;


    document.getElementById(`cancelFollowupEdit-${id}`)
        .addEventListener("click", renderFollowUpList);


    document.getElementById(`saveFollowupEdit-${id}`)
        .addEventListener("click", () => {

            const newQuestion = document
                .getElementById(`editFollowup-${id}`)
                .value.trim();


            if (!newQuestion) {

                alert("Please enter your follow-up question.");

                return;

            }


            followUp.question = newQuestion;

            saveDoubtData();

            renderFollowUpList();

        });

}


// ==========================================
// 28. DELETE FOLLOW-UP
// ==========================================

function deleteFollowUp(id) {

    if (isLibrarySource) return;


    const confirmDelete = confirm(
        "Are you sure you want to delete this follow-up question?"
    );

    if (!confirmDelete) return;


    doubt.followUps = doubt.followUps.filter(item => {

        return Number(item.id) !== Number(id);

    });


    saveDoubtData();

    renderFollowUpList();

    displaySidebarFollowupButton();

}


// ==========================================
// 29. FOLLOW-UP ACTION BUTTON
// ==========================================

function displaySidebarFollowupButton() {

    followupAction.innerHTML = "";

    if (isLibrarySource) return;

    if (!canAskFollowUp()) return;

    if (document.getElementById("followupFormSection")) return;


    const button = document.createElement("button");

    button.type = "button";

    button.id = "sidebarFollowupBtn";

    button.className = "sidebar-followup-btn";

    button.innerHTML = `

        <i data-lucide="message-circle"></i>
        Ask a Follow-up Question

    `;


    followupAction.appendChild(button);

    button.addEventListener("click", openFollowUpForm);

    lucide.createIcons();

}


// ==========================================
// 30. SAVE DOUBT DATA
// ==========================================

function saveDoubtData() {

    const index = doubts.findIndex(item => {

        return Number(item.id) === doubtId;

    });

    if (index === -1) return;


    // Always save using the current data structure.

    doubt.description = doubt.description || "";

    doubt.question = doubt.description;

    doubt.topics = Array.isArray(doubt.topics)
        ? doubt.topics
        : [];

    doubt.subtopics = Array.isArray(doubt.subtopics)
        ? doubt.subtopics
        : [];

    doubt.topicSelections = Array.isArray(doubt.topicSelections)
        ? doubt.topicSelections
        : [];


    doubts[index] = doubt;


    localStorage.setItem(
        storageKey,
        JSON.stringify(doubts)
    );

}


// ==========================================
// 31. THREE-DOT ACTION MENU
// ==========================================

function displayActions() {

    const actionRow = document.createElement("div");

    actionRow.className = "detail-actions";


    const canEditDelete =
        source === "my-doubts" &&
        doubt.status === "pending";


    actionRow.innerHTML = `

        ${isLibrarySource ? `

            <button
                type="button"
                class="save-library-btn"
                id="saveBtn"
            >
                <i data-lucide="bookmark"></i>
                Save to Saves
            </button>

        ` : ""}


        <div class="doubt-menu-wrapper">

            <button
                type="button"
                class="doubt-menu-btn"
                id="doubtMenuBtn"
                aria-label="Doubt options"
                aria-expanded="false"
            >
                <i data-lucide="ellipsis"></i>
            </button>


            <div class="doubt-dropdown" id="doubtDropdown">

                ${canEditDelete ? `

                    <button
                        type="button"
                        data-action="edit"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        data-action="delete"
                    >
                        Delete
                    </button>

                ` : ""}


                <button
                    type="button"
                    data-action="info"
                >
                    Info
                </button>

            </div>

        </div>

    `;


    // Keep the existing three-dot menu.
    // Move it to the bottom-right corner.

    actionRow.style.display = "flex";

    actionRow.style.width = "100%";

    actionRow.style.justifyContent = "flex-end";

    actionRow.style.alignItems = "center";

    actionRow.style.boxSizing = "border-box";


    detailContent.insertAdjacentElement(
        "afterend",
        actionRow
    );


    const menuButton =
        actionRow.querySelector("#doubtMenuBtn");

    const dropdown =
        actionRow.querySelector("#doubtDropdown");


    menuButton.addEventListener("click", event => {

        event.stopPropagation();

        dropdown.classList.toggle("show");

        menuButton.setAttribute(
            "aria-expanded",
            dropdown.classList.contains("show")
        );

    });


    dropdown.querySelectorAll("button")
        .forEach(button => {

            button.addEventListener("click", () => {

                const action = button.dataset.action;

                dropdown.classList.remove("show");

                menuButton.setAttribute(
                    "aria-expanded",
                    "false"
                );


                if (action === "edit") {
                    displayEditForm();
                }

                if (action === "delete") {
                    deleteDoubt();
                }

                if (action === "info") {
                    openDoubtInformation();
                }

            });

        });


    const saveBtn =
        actionRow.querySelector("#saveBtn");

    if (saveBtn) {
        saveBtn.addEventListener("click", saveToSaves);
    }


    lucide.createIcons();

}


// ==========================================
// 32. EDIT DOUBT
// ==========================================

function displayEditForm() {

    if (
        source !== "my-doubts" ||
        doubt.status !== "pending"
    ) {
        return;
    }


    if (document.getElementById("editForm")) return;


    const form = document.createElement("div");

    form.id = "editForm";

    form.className = "edit-form";

    form.innerHTML = `

        <h3 class="section-heading">
            Edit Your Doubt
        </h3>


        <label for="editTitle">
            Small Question
        </label>

        <input
            type="text"
            id="editTitle"
            maxlength="60"
            required
        >


        <label for="editDescription">
            Explanation
        </label>

        <textarea
            id="editDescription"
            required
        ></textarea>


        <div class="edit-form-actions">

            <button
                type="button"
                class="cancel-edit-btn"
                id="cancelEdit"
            >
                Cancel
            </button>

            <button
                type="button"
                class="save-edit-btn"
                id="saveEdit"
            >
                Save Changes
            </button>

        </div>

    `;


    detailContent.appendChild(form);


    document.getElementById("editTitle").value =
        doubt.title || "";


    document.getElementById("editDescription").value =
        doubt.description || "";


    document.getElementById("cancelEdit")
        .addEventListener("click", () => {

            form.remove();

        });


    document.getElementById("saveEdit")
        .addEventListener("click", saveEdit);

}


// ==========================================
// 33. SAVE EDITED DOUBT
// ==========================================

function saveEdit() {

    const newTitle =
        document.getElementById("editTitle")
            .value.trim();

    const newDescription =
        document.getElementById("editDescription")
            .value.trim();


    if (!newTitle || !newDescription) {

        alert(
            "Please fill in both the small question and explanation."
        );

        return;

    }


    doubt.title = newTitle;

    doubt.description = newDescription;

    doubt.question = newDescription;


    saveDoubtData();


    alert("Your doubt has been updated!");

    renderDetails();

}


// ==========================================
// 34. DELETE DOUBT
// ==========================================

function deleteDoubt() {

    const confirmDelete = confirm(
        "Are you sure you want to delete this doubt?"
    );

    if (!confirmDelete) return;


    const updatedDoubts = doubts.filter(item => {

        return Number(item.id) !== doubtId;

    });


    localStorage.setItem(
        storageKey,
        JSON.stringify(updatedDoubts)
    );


    alert("Your doubt has been deleted!");

    window.location.href = returnPage;

}


// ==========================================
// 35. SAVE TO SAVES
// ==========================================

function saveToSaves() {

    const savedItems = JSON.parse(
        localStorage.getItem("clariqSaves") || "[]"
    );


    const alreadySaved = savedItems.some(item => {

        return (

            Number(item.id) === doubtId &&

            item.source === "library"

        );

    });


    if (alreadySaved) {

        alert("This doubt is already saved!");

        return;

    }


    savedItems.push({

        ...doubt,

        source: "library"

    });


    localStorage.setItem(
        "clariqSaves",
        JSON.stringify(savedItems)
    );


    alert("Doubt saved successfully!");

}


// ==========================================
// 36. DISPLAY INFORMATION MODAL
// ==========================================

function displayInformation() {

    const status = statusStyles[doubt.status];


    detailSidebar.innerHTML = `

        <div class="info-popup-heading">

            <h3 class="info-heading" id="infoModalTitle">
                <i data-lucide="info"></i>
                Doubt Information
            </h3>

            <button
                type="button"
                class="info-close-btn"
                id="infoCloseBtn"
                aria-label="Close information"
            >
                <i data-lucide="x"></i>
            </button>

        </div>


        <div class="info-row">

            <span class="info-label">
                <i data-lucide="book-open"></i>
                Subject
            </span>

            <span class="info-value">
                ${escapeHTML(doubt.subject || "Not available")}
            </span>

        </div>


        ${!isLibrarySource ? `

            <div class="info-row">

                <span class="info-label">
                    <i data-lucide="tag"></i>
                    Status
                </span>

                <span
                    class="detail-status"
                    style="
                        background: ${status.background};
                        color: ${status.color};
                    "
                >
                    ${status.label}
                </span>

            </div>

        ` : ""}


        <div class="info-row">

            <span class="info-label">
                <i data-lucide="calendar"></i>
                Submitted On
            </span>

            <span class="info-value">
                ${formatDate(doubt.createdAt)}
            </span>

        </div>


        ${doubt.status === "resolved" ? `

            <div class="info-row">

                <span class="info-label">
                    <i data-lucide="calendar-check"></i>
                    Resolved On
                </span>

                <span class="info-value">
                    ${formatDate(
                        doubt.resolvedAt || doubt.createdAt
                    )}
                </span>

            </div>


            <div class="info-row teacher-info">

                <span class="info-label">
                    <i data-lucide="user"></i>
                    Answered By
                </span>

                <span class="info-value">
                    ${escapeHTML(
                        doubt.answeredBy ||
                        doubt.teacherName ||
                        "Subject Teacher"
                    )}
                </span>

            </div>

        ` : ""}

    `;


    document.getElementById("infoCloseBtn")
        .addEventListener(
            "click",
            closeDoubtInformation
        );


    lucide.createIcons();

}


// ==========================================
// 37. POSITION INFORMATION MODAL
// ==========================================

function positionInformationModal() {

    if (!detailSidebar || !detailMain) return;


    const mainRect = detailMain.getBoundingClientRect();


    // Calculate the centre of the main content area.
    // The sidebar is outside this area.

    const centreX =
        mainRect.left + (mainRect.width / 2);

    const centreY =
        window.innerHeight / 2;


    detailSidebar.style.position = "fixed";

    detailSidebar.style.left = `${centreX}px`;

    detailSidebar.style.top = `${centreY}px`;

    detailSidebar.style.right = "auto";

    detailSidebar.style.bottom = "auto";

    detailSidebar.style.transform =
        "translate(-50%, -50%)";

}


function openDoubtInformation() {

    positionInformationModal();

    detailSidebar.classList.add("show");


    if (modalBackdrop) {
        modalBackdrop.classList.add("show");
    }


    document.body.classList.add("modal-open");

}


function closeDoubtInformation() {

    detailSidebar.classList.remove("show");


    if (modalBackdrop) {
        modalBackdrop.classList.remove("show");
    }


    document.body.classList.remove("modal-open");

}


// ==========================================
// 38. MODAL EVENT LISTENERS
// ==========================================

if (modalBackdrop) {

    modalBackdrop.addEventListener(
        "click",
        closeDoubtInformation
    );

}


document.addEventListener("keydown", event => {

    if (event.key === "Escape") {

        closeDoubtInformation();

    }

});


window.addEventListener("resize", () => {

    if (detailSidebar.classList.contains("show")) {

        positionInformationModal();

    }

});


// ==========================================
// 39. BACK NAVIGATION
// ==========================================

if (backBtn) {

    backBtn.addEventListener("click", () => {

        if (
            document.referrer &&
            new URL(document.referrer).origin === window.location.origin
        ) {

            window.history.back();

        } else {

            window.location.href = returnPage;

        }

    });

}


if (backLink) {

    backLink.href = returnPage;

    backLink.textContent = isLibrarySource
        ? "Library"
        : "My Doubts";

}


if (backBtn) {

    backBtn.innerHTML = `

        <i data-lucide="arrow-left"></i>

        Back to ${isLibrarySource ? "Library" : "My Doubts"}

    `;

}


// ==========================================
// 40. CLOSE MENUS WHEN CLICKING OUTSIDE
// ==========================================

document.addEventListener("click", event => {

    if (!event.target.closest(".followup-menu-wrapper")) {

        document.querySelectorAll(".followup-dropdown")
            .forEach(menu => {

                menu.classList.remove("show");

            });

    }


    if (!event.target.closest(".doubt-menu-wrapper")) {

        document.querySelectorAll(".doubt-dropdown")
            .forEach(menu => {

                menu.classList.remove("show");

            });


        document.querySelectorAll(".doubt-menu-btn")
            .forEach(button => {

                button.setAttribute(
                    "aria-expanded",
                    "false"
                );

            });

    }

});


// ==========================================
// 41. MAIN RENDER FUNCTION
// ==========================================

async function renderDetails() {


    // DOUBT NOT FOUND

    if (!doubt) {

        detailContent.innerHTML = `

            <div class="detail-error">

                <i data-lucide="file-question"></i>

                <h3>Doubt not found</h3>

                <p>
                    The requested doubt could not be found.
                </p>

            </div>

        `;


        detailSidebar.innerHTML = "";

        followupConversation.innerHTML = "";

        followupAction.innerHTML = "";


        lucide.createIcons();

        return;

    }


    // INVALID STATUS

    if (!statusStyles[doubt.status]) {

        detailContent.innerHTML = `

            <div class="detail-error">

                <h3>Invalid doubt status</h3>

                <p>
                    Please check the doubt information.
                </p>

            </div>

        `;


        detailSidebar.innerHTML = "";

        followupConversation.innerHTML = "";

        followupAction.innerHTML = "";


        lucide.createIcons();

        return;

    }


    // RESET PAGE

    detailContent.innerHTML = "";

    detailSidebar.innerHTML = "";

    followupConversation.innerHTML = "";

    followupAction.innerHTML = "";


    const previousActionRow =
        document.querySelector(".detail-actions");

    if (previousActionRow) {
        previousActionRow.remove();
    }


    // INITIALISE

    setActiveSidebarLink();

    displayHeader();


    // STUDENT ATTACHMENTS

    await displayAttachments(doubt.attachments);


    // DATE

    displayDoubtDate();


    // TEACHER RESPONSE

    displayAnswer();

    await displayTeacherAttachments();

    displayResources();


    // ACTION MENU BELOW THE CARD

    displayActions();


    // FOLLOW-UP DISCUSSION

    displayFollowUps();

    displaySidebarFollowupButton();


    // INFORMATION MODAL CONTENT

    displayInformation();


    lucide.createIcons();

}


// ==========================================
// 42. INITIALISE PAGE
// ==========================================

renderDetails();
