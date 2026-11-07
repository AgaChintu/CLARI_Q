
// ==========================================
// 1. GET URL PARAMETERS
// ==========================================

const params = new URLSearchParams(window.location.search);

const doubtId = Number(params.get("id"));
const source = params.get("source") || "my-doubts";

const isLibrarySource = source === "library";


// ==========================================
// 2. GET HTML ELEMENTS
// ==========================================

const detailContent = document.getElementById("detailContent");
const detailSidebar = document.getElementById("detailSidebar");

const followupConversation =
    document.getElementById("followupConversation");

const followupAction =
    document.getElementById("followupAction");

const backBtn = document.getElementById("backBtn");
const backLink = document.getElementById("backLink");


// ==========================================
// 3. STORAGE CONFIGURATION
// ==========================================

const storageKey = isLibrarySource
    ? "clariqLibrary"
    : "clariqDoubts";

const doubts = JSON.parse(
    localStorage.getItem(storageKey) || "[]"
);

const DB_NAME = "ClariQFiles";
const DB_VERSION = 1;
const FILE_STORE = "attachments";


// ==========================================
// 4. FIND SELECTED DOUBT
// ==========================================

const doubt = doubts.find(item => Number(item.id) === doubtId);


// ==========================================
// 5. SIDEBAR ACTIVE STATE
// ==========================================

function setActiveSidebarLink() {

    const activeHref = isLibrarySource
        ? "library.html"
        : "my-doubts.html";

    const sidebarLinks = document.querySelectorAll(".sidebar a");

    sidebarLinks.forEach(link => {

        link.classList.remove("nav-item-active");

        if (link.getAttribute("href") === activeHref) {
            link.classList.add("nav-item-active");
        }

    });

}


// ==========================================
// 6. INDEXEDDB FUNCTIONS
// ==========================================

function openAttachmentDB() {

    return new Promise((resolve, reject) => {

        const request = indexedDB.open(DB_NAME, DB_VERSION);

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

        const transaction = db.transaction(FILE_STORE, "readonly");

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
// 7. FORMAT DATE
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


// ==========================================
// 8. RELATIVE DATE
// ==========================================

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
    if (days < 7) return `${days} days ago`;

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
// 10. DISPLAY DOUBT HEADER
// ==========================================

function displayHeader() {

    const status = statusStyles[doubt.status];

    const subject = subjectStyles[doubt.subject] || {};

    const icon = subject.icon || "";

    detailContent.innerHTML = `

        <div class="detail-header">

            <div class="detail-heading">

                <div class="detail-subject-icon">

                    ${icon
                        ? `<img src="${escapeHTML(icon)}" alt="${escapeHTML(doubt.subject)}">`
                        : `<span>${escapeHTML(doubt.subject)}</span>`
                    }

                </div>

                <div class="detail-title-info">

                    <h2 class="detail-title">
                        ${escapeHTML(doubt.title)}
                    </h2>

                </div>

            </div>


            <div class="detail-status-area">

                ${!isLibrarySource ? `

                    <div class="detail-status"
                        style="
                            background: ${status.background};
                            color: ${status.color};
                        "
                    >

                        <i data-lucide="${status.icon}"></i>

                        ${status.label}

                    </div>

                ` : ""}

                <p class="detail-date">
                    ${formatRelativeDate(doubt.createdAt)}
                </p>

            </div>

        </div>


        <div class="question-section">

            <h3 class="section-heading">

                <i data-lucide="circle-help"></i>

                Your Question

            </h3>

            <p class="question-text">
                ${escapeHTML(doubt.question)}
            </p>

        </div>

    `;

    displayTags();

}


// ==========================================
// 11. DISPLAY TAGS
// ==========================================

function displayTags() {

    if (!doubt.tags || doubt.tags.length === 0) return;

    const tagsHTML = `

        <div class="doubt-tags">

            ${doubt.tags.map(tag => `
                <span class="doubt-tag">
                    ${escapeHTML(tag)}
                </span>
            `).join("")}

        </div>

    `;

    const questionSection =
        detailContent.querySelector(".question-section");

    if (questionSection) {
        questionSection.insertAdjacentHTML("afterend", tagsHTML);
    }

}


// ==========================================
// 12. DISPLAY ATTACHMENTS
// ==========================================

async function displayAttachments(attachments) {

    if (!attachments || attachments.length === 0) return;

    const section = document.createElement("div");
    section.className = "doubt-attachments";

    const content = document.createElement("div");
    content.className = "attachment-content";

    section.appendChild(content);
    detailContent.appendChild(section);

    const images = [];

    for (const attachment of attachments) {

        try {

            const storedFile = await getAttachment(attachment.fileId);

            if (!storedFile || !storedFile.blob) {
                console.warn("Attachment not found:", attachment.fileId);
                continue;
            }

            const fileURL = URL.createObjectURL(storedFile.blob);

            const fileType = storedFile.type || attachment.type;
            const fileName = storedFile.name || attachment.name;

            const fileSize = formatFileSize(
                storedFile.size || attachment.size
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

                    <a class="download-btn"
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

            console.error("Attachment loading failed:", error);

        }

    }


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

                    <button type="button"
                        class="carousel-arrow carousel-prev"
                        aria-label="Previous image"
                    >
                        <i data-lucide="chevron-left"></i>
                    </button>

                    <button type="button"
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

            previousButton.addEventListener("click", function() {

                currentIndex =
                    (currentIndex - 1 + images.length) % images.length;

                updateCarousel();

            });

        }


        const nextButton =
            carousel.querySelector(".carousel-next");

        if (nextButton) {

            nextButton.addEventListener("click", function() {

                currentIndex =
                    (currentIndex + 1) % images.length;

                updateCarousel();

            });

        }


        imageElement.addEventListener("click", function() {

            openImageLightbox(images[currentIndex].url);

        });


        content.insertBefore(carousel, content.firstChild);

    }

    lucide.createIcons();

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
// 14. IMAGE LIGHTBOX
// ==========================================

function openImageLightbox(imageURL) {

    const overlay = document.createElement("div");

    overlay.className = "image-lightbox";

    overlay.innerHTML = `

        <button class="lightbox-close">
            <i data-lucide="x"></i>
        </button>

        <img src="${imageURL}" alt="Attachment preview">

    `;

    document.body.appendChild(overlay);

    lucide.createIcons();

    overlay.addEventListener("click", function(event) {

        if (
            event.target === overlay ||
            event.target.closest(".lightbox-close")
        ) {
            overlay.remove();
        }

    });

}


// ==========================================
// 15. DISPLAY TEACHER ANSWER
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
// 16. DISPLAY TEACHER ATTACHMENTS
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
// 17. DISPLAY LEGACY RESOURCES
// ==========================================

function displayResources() {

    if (!doubt.resources || doubt.resources.length === 0) return;

    const section = document.createElement("div");

    section.className = "resources-section";

    section.innerHTML = `
        <div class="attachment-content"></div>
    `;

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

                <a href="${escapeHTML(resource.url)}"
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
// 18. FOLLOW-UP QUESTIONS
// ==========================================

function displayFollowUps() {

    followupConversation.innerHTML = "";

    // Library doubts never show follow-up discussions.

    if (isLibrarySource) return;

    if (doubt.status !== "resolved") return;

    if (!Array.isArray(doubt.followUps)) {
        doubt.followUps = [];
    }

    if (doubt.followUps.length === 0) return;

    detailContent.appendChild(followupConversation);

    const heading = document.createElement("div");

    heading.className = "followup-section-heading";

    heading.innerHTML = `

        <div>
            <h3>Follow-up Discussion</h3>
            <p>Continue the conversation about your doubt.</p>
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
// 19. CHECK IF FOLLOW-UP IS ALLOWED
// ==========================================

function canAskFollowUp() {

    if (isLibrarySource) return false;

    if (doubt.status !== "resolved") return false;

    const followUps = doubt.followUps || [];

    if (followUps.length === 0) return true;

    const latestFollowUp = followUps[followUps.length - 1];

    return (
        latestFollowUp.status === "answered" ||
        Boolean(latestFollowUp.teacherResponse)
    );

}


// ==========================================
// 20. OPEN FOLLOW-UP FORM
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

            <button type="submit" class="followup-submit">

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
// 21. CANCEL FOLLOW-UP FORM
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
// 22. SUBMIT FOLLOW-UP
// ==========================================

function submitFollowUp(event) {

    event.preventDefault();

    if (isLibrarySource) return;

    const input = document.getElementById("followupInput");

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
        question: question,
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
// 23. RENDER FOLLOW-UP LIST
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

            <div class="followup-item"
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

                        <div class="followup-dropdown"
                             id="followupMenu-${followUp.id}"
                        >

                            <button type="button"
                                data-action="edit"
                                data-id="${followUp.id}"
                            >
                                <i data-lucide="pencil"></i>
                                Edit
                            </button>

                            <button type="button"
                                data-action="delete"
                                data-id="${followUp.id}"
                            >
                                <i data-lucide="trash-2"></i>
                                Delete
                            </button>

                        </div>

                    </div>

                </div>


                <div class="followup-question-content"
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


    list.querySelectorAll(".followup-menu-btn").forEach(button => {

        button.addEventListener("click", function(event) {

            event.stopPropagation();

            const id = this.dataset.menuId;

            const menu =
                document.getElementById(`followupMenu-${id}`);

            document.querySelectorAll(".followup-dropdown").forEach(item => {

                if (item !== menu) {
                    item.classList.remove("show");
                }

            });

            menu.classList.toggle("show");

        });

    });


    list.querySelectorAll(".followup-dropdown button").forEach(button => {

        button.addEventListener("click", function() {

            const id = Number(this.dataset.id);
            const action = this.dataset.action;

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
// 24. EDIT FOLLOW-UP
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
        .addEventListener("click", function() {

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
// 25. DELETE FOLLOW-UP
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
// 26. SIDEBAR FOLLOW-UP BUTTON
// ==========================================

function displaySidebarFollowupButton() {

    followupAction.innerHTML = "";

    // Library never displays a follow-up action.

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
// 27. SAVE DOUBT DATA
// ==========================================

function saveDoubtData() {

    const index = doubts.findIndex(item => {
        return Number(item.id) === doubtId;
    });

    if (index === -1) return;

    doubts[index] = doubt;

    localStorage.setItem(
        storageKey,
        JSON.stringify(doubts)
    );

}


// ==========================================
// 28. DISPLAY ACTION BUTTONS
// ==========================================

function displayActions() {

    let actionHTML = "";


    // MY DOUBTS: PENDING

    if (source === "my-doubts" && doubt.status === "pending") {

        actionHTML = `

            <div class="detail-actions">

                <button class="edit-btn" id="editBtn">
                    <i data-lucide="pencil"></i>
                    Edit Doubt
                </button>

                <button class="delete-btn" id="deleteBtn">
                    <i data-lucide="trash-2"></i>
                    Delete Doubt
                </button>

            </div>

        `;

    }


    // LIBRARY: SAVE OPTION

    if (isLibrarySource) {

        actionHTML = `

            <div class="detail-actions">

                <button class="save-library-btn" id="saveBtn">
                    <i data-lucide="bookmark"></i>
                    Save to Saves
                </button>

            </div>

        `;

    }


    detailContent.insertAdjacentHTML("beforeend", actionHTML);


    const editBtn = document.getElementById("editBtn");

    if (editBtn) {
        editBtn.addEventListener("click", displayEditForm);
    }


    const deleteBtn = document.getElementById("deleteBtn");

    if (deleteBtn) {
        deleteBtn.addEventListener("click", deleteDoubt);
    }


    const saveBtn = document.getElementById("saveBtn");

    if (saveBtn) {
        saveBtn.addEventListener("click", saveToSaves);
    }

}


// ==========================================
// 29. EDIT DOUBT
// ==========================================

function displayEditForm() {

    const existingForm = document.getElementById("editForm");

    if (existingForm) return;

    const form = document.createElement("div");

    form.id = "editForm";
    form.className = "edit-form";

    form.innerHTML = `

        <h3 class="section-heading">
            Edit Your Doubt
        </h3>

        <label for="editTitle">
            Doubt Title
        </label>

        <input type="text" id="editTitle" required>

        <label for="editQuestion">
            Your Question
        </label>

        <textarea id="editQuestion" required></textarea>

        <div class="edit-form-actions">

            <button class="cancel-edit-btn" id="cancelEdit">
                Cancel
            </button>

            <button class="save-edit-btn" id="saveEdit">
                Save Changes
            </button>

        </div>

    `;

    detailContent.appendChild(form);

    document.getElementById("editTitle").value = doubt.title;
    document.getElementById("editQuestion").value = doubt.question;

    document.getElementById("cancelEdit")
        .addEventListener("click", () => form.remove());

    document.getElementById("saveEdit")
        .addEventListener("click", saveEdit);

}


// ==========================================
// 30. SAVE EDITED DOUBT
// ==========================================

function saveEdit() {

    const newTitle =
        document.getElementById("editTitle").value.trim();

    const newQuestion =
        document.getElementById("editQuestion").value.trim();

    if (!newTitle || !newQuestion) {
        alert("Please fill in both fields.");
        return;
    }

    doubt.title = newTitle;
    doubt.question = newQuestion;

    saveDoubtData();

    alert("Your doubt has been updated!");

    renderDetails();

}


// ==========================================
// 31. DELETE DOUBT
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
// 32. SAVE TO SAVES
// ==========================================

function saveToSaves() {

    let savedItems = JSON.parse(
        localStorage.getItem("clariqSaves") || "[]"
    );

    const alreadySaved = savedItems.some(item => {

        return Number(item.id) === doubtId &&
               item.source === "library";

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
// 33. DISPLAY INFORMATION SIDEBAR
// ==========================================

function displayInformation() {

    const status = statusStyles[doubt.status];

    detailSidebar.innerHTML = `

        <h3 class="info-heading">

            <i data-lucide="info"></i>

            Doubt Information

        </h3>


        <div class="info-row">

            <span class="info-label">
                <i data-lucide="book-open"></i>
                Subject
            </span>

            <span class="info-value">
                ${escapeHTML(doubt.subject)}
            </span>

        </div>


        ${!isLibrarySource ? `

            <div class="info-row">

                <span class="info-label">
                    <i data-lucide="tag"></i>
                    Status
                </span>

                <span class="detail-status"
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
                    ${formatDate(doubt.resolvedAt || doubt.createdAt)}
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

    displaySidebarFollowupButton();

}


// ==========================================
// 34. BACK NAVIGATION
// ==========================================

const returnPage = isLibrarySource
    ? "library.html"
    : "my-doubts.html";


backBtn.addEventListener("click", function() {

    if (
        document.referrer &&
        new URL(document.referrer).origin === window.location.origin
    ) {

        window.history.back();

    } else {

        window.location.href = returnPage;

    }

});


backLink.href = returnPage;

backLink.textContent = isLibrarySource
    ? "Library"
    : "My Doubts";


backBtn.innerHTML = `

    <i data-lucide="arrow-left"></i>

    Back to ${isLibrarySource ? "Library" : "My Doubts"}

`;


// ==========================================
// 35. CLOSE MENUS WHEN CLICKING OUTSIDE
// ==========================================

document.addEventListener("click", function(event) {

    if (!event.target.closest(".followup-menu-wrapper")) {

        document.querySelectorAll(".followup-dropdown").forEach(menu => {
            menu.classList.remove("show");
        });

    }

});


// ==========================================
// 36. MAIN RENDER FUNCTION
// ==========================================

async function renderDetails() {

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


    if (!statusStyles[doubt.status]) {

        detailContent.innerHTML = `

            <div class="detail-error">

                <h3>Invalid doubt status</h3>

                <p>Please check the doubt information.</p>

            </div>

        `;

        detailSidebar.innerHTML = "";
        followupConversation.innerHTML = "";
        followupAction.innerHTML = "";

        lucide.createIcons();

        return;

    }


    detailContent.innerHTML = "";
    detailSidebar.innerHTML = "";
    followupConversation.innerHTML = "";
    followupAction.innerHTML = "";


    setActiveSidebarLink();

    displayHeader();

    await displayAttachments(doubt.attachments);

    displayAnswer();

    await displayTeacherAttachments();

    displayResources();

    displayFollowUps();

    displayActions();

    displayInformation();

    lucide.createIcons();

}


// ==========================================
// 37. INITIALISE PAGE
// ==========================================

renderDetails();
