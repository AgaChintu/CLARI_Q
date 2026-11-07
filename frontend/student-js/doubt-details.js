// ==========================================
// 1. GET URL PARAMETERS
// ==========================================

const params = new URLSearchParams(window.location.search);

const doubtId = Number(params.get("id"));

const source = params.get("source") || "my-doubts";


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

const storageKey = source === "library"
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

const doubt = doubts.find(function(item) {

    return Number(item.id) === doubtId;

});


// ==========================================
// 5. INDEXEDDB FUNCTIONS
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
// 6. FORMAT DATE
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
// 7. RELATIVE DATE
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
// 8. ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, function(character) {

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
// 9. DISPLAY DOUBT HEADER
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

                <div class="detail-status"
                    style="
                        background: ${status.background};
                        color: ${status.color};
                    "
                >

                    <i data-lucide="${status.icon}"></i>

                    ${status.label}

                </div>

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
// 10. DISPLAY TAGS
// ==========================================

function displayTags() {
    if (!doubt.tags || doubt.tags.length === 0) return;

    const tagsHTML = `
        <div class="doubt-tags">
            ${doubt.tags.map(tag => `
                <span class="doubt-tag">${escapeHTML(tag)}</span>
            `).join("")}
        </div>
    `;

    const questionSection = detailContent.querySelector(".question-section");

    if (questionSection) {
        questionSection.insertAdjacentHTML("afterend", tagsHTML);
    }
}


// ==========================================
// 11. DISPLAY ATTACHMENTS
// ==========================================

async function displayAttachments(attachments, heading) {

    if (!attachments || attachments.length === 0) return;

    const section = document.createElement("div");

    section.className = "doubt-attachments";

    section.innerHTML = `

        <h3 class="attachment-heading">

            <i data-lucide="paperclip"></i>

            ${escapeHTML(heading)} (${attachments.length})

        </h3>

        <div class="attachment-content"></div>

    `;

    detailContent.appendChild(section);

    const content = section.querySelector(".attachment-content");

    const imageGallery = document.createElement("div");

    imageGallery.className = "image-gallery";

    let hasImages = false;

    for (const attachment of attachments) {

        try {

            const storedFile = await getAttachment(attachment.fileId);

            if (!storedFile || !storedFile.blob) {

                console.warn("Attachment not found:", attachment.fileId);

                continue;

            }

            const fileURL = URL.createObjectURL(storedFile.blob);

            const fileType = storedFile.type || attachment.type;

            const fileName = escapeHTML(
                storedFile.name || attachment.name
            );

            const fileSize = formatFileSize(
                storedFile.size || attachment.size
            );


            // IMAGE

            if (fileType.startsWith("image/")) {

                hasImages = true;

                const image = document.createElement("img");

                image.src = fileURL;

                image.alt = fileName;

                image.className = "image-preview";

                image.addEventListener("click", () => {

                    openImageLightbox(fileURL);

                });

                imageGallery.appendChild(image);

            }


            // PDF

            else if (fileType === "application/pdf") {

                const pdfCard = document.createElement("div");

                pdfCard.className = "pdf-preview";

                pdfCard.innerHTML = `

                    <div class="resource-icon">

                        <i data-lucide="file-text"></i>

                    </div>

                    <div class="pdf-file-info">

                        <p class="attachment-name">${fileName}</p>

                        <p class="attachment-size">${fileSize}</p>

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


    if (hasImages) {

        content.insertBefore(imageGallery, content.firstChild);

    }

    lucide.createIcons();

}


// ==========================================
// 12. FILE SIZE FORMAT
// ==========================================

function formatFileSize(bytes) {

    if (!bytes) return "File";

    if (bytes < 1024 * 1024) {

        return `${(bytes / 1024).toFixed(1)} KB`;

    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

}


// ==========================================
// 13. IMAGE LIGHTBOX
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
// 14. DISPLAY TEACHER ANSWER
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
// 15. DISPLAY TEACHER ATTACHMENTS
// ==========================================

async function displayTeacherAttachments() {

    if (doubt.status !== "resolved") return;

    const attachments =
        doubt.teacherAttachments ||
        doubt.answerAttachments ||
        [];

    await displayAttachments(
        attachments,
        "Teacher's Attachments"
    );

}


// ==========================================
// 16. DISPLAY LEGACY RESOURCES
// ==========================================

function displayResources() {

    if (!doubt.resources || doubt.resources.length === 0) return;

    const section = document.createElement("div");

    section.className = "resources-section";

    section.innerHTML = `

        <h3 class="resource-heading">

            <i data-lucide="paperclip"></i>

            Additional Resources (${doubt.resources.length})

        </h3>

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
// ==========================================
// 17. FOLLOW-UP QUESTIONS
// ==========================================

function displayFollowUps() {

    followupConversation.innerHTML = "";

    if (doubt.status !== "resolved") return;

    if (!Array.isArray(doubt.followUps)) {
        doubt.followUps = [];
    }

    // Don't show the discussion section until a follow-up exists.
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
// 18. CHECK IF ANOTHER FOLLOW-UP IS ALLOWED
// ==========================================

function canAskFollowUp() {

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
// 19. OPEN FOLLOW-UP FORM
// ==========================================

function openFollowUpForm() {

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

    // Form appears in the conversation area,
    // below the main doubt card.

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
// 20. CANCEL FOLLOW-UP FORM
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
// 21. SUBMIT FOLLOW-UP
// ==========================================

function submitFollowUp(event) {

    event.preventDefault();

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

    // The button remains hidden until the teacher responds.

    alert("Your follow-up question has been submitted!");

}


// ==========================================
// 22. RENDER FOLLOW-UP LIST
// ==========================================

function renderFollowUpList() {

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


    // THREE DOT MENUS

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


    // EDIT AND DELETE

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
// 23. EDIT FOLLOW-UP
// ==========================================

function editFollowUp(id) {

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
// 24. DELETE FOLLOW-UP
// ==========================================

function deleteFollowUp(id) {

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
// 25. SIDEBAR FOLLOW-UP BUTTON
// ==========================================

function displaySidebarFollowupButton() {

    // Clear the existing action area first.

    followupAction.innerHTML = "";

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

    // Button is outside the Doubt Information card.

    followupAction.appendChild(button);

    button.addEventListener("click", openFollowUpForm);

    lucide.createIcons();

}


// ==========================================
// 26. SAVE DOUBT DATA
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
// 27. DISPLAY ACTION BUTTONS
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

    if (source === "library") {

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
// 28. EDIT DOUBT
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

        <input type="text"
               id="editTitle"
               required
        >


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
// 29. SAVE EDITED DOUBT
// ==========================================

function saveEdit() {

    const newTitle = document.getElementById("editTitle").value.trim();

    const newQuestion = document.getElementById("editQuestion").value.trim();

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
// 30. DELETE DOUBT
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
// 31. SAVE TO SAVES
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
// 32. DISPLAY INFORMATION SIDEBAR
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


        <div class="info-row">

            <span class="info-label">

                <i data-lucide="calendar"></i>

                Submitted On

            </span>

            <span class="info-value">

                ${formatDate(doubt.createdAt)}

            </span>

        </div>


        ${
            doubt.status === "resolved"
            ? `

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

            ` : ""
        }

    `;

    displaySidebarFollowupButton();

}


// ==========================================
// 33. BACK NAVIGATION
// ==========================================

const returnPage = source === "library"
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

backLink.textContent = source === "library"
    ? "Library"
    : "My Doubts";


backBtn.innerHTML = `

    <i data-lucide="arrow-left"></i>

    Back to ${source === "library" ? "Library" : "My Doubts"}

`;


// ==========================================
// 34. CLOSE MENUS WHEN CLICKING OUTSIDE
// ==========================================

document.addEventListener("click", function(event) {

    if (!event.target.closest(".followup-menu-wrapper")) {

        document.querySelectorAll(".followup-dropdown").forEach(menu => {

            menu.classList.remove("show");

        });

    }

});


// ==========================================
// 35. MAIN RENDER FUNCTION
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


    // Clear old content before rendering again.

    detailContent.innerHTML = "";

    detailSidebar.innerHTML = "";

    followupConversation.innerHTML = "";

    followupAction.innerHTML = "";


    displayHeader();

    await displayAttachments(
        doubt.attachments,
        "Attachments"
    );

    displayAnswer();

    await displayTeacherAttachments();

    displayResources();

    displayFollowUps();

    displayActions();

    displayInformation();

    lucide.createIcons();

}


// ==========================================
// 36. INITIALISE PAGE
// ==========================================

renderDetails();