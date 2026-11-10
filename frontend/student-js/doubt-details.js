/* ==========================================
   CLARIQ - STUDENT DOUBT DETAILS
========================================== */


/* ==========================================
   1. DOM ELEMENTS
========================================== */

const doubtSubject = document.getElementById("doubtSubject");
const doubtClass = document.getElementById("doubtClass");
const doubtQuestion = document.getElementById("doubtQuestion");
const doubtTags = document.getElementById("doubtTags");
const doubtDescription = document.getElementById("doubtDescription");

const studentAttachments = document.getElementById("studentAttachments");
const studentPhotoGallery = document.getElementById("studentPhotoGallery");
const studentFileList = document.getElementById("studentFileList");
const photoCounter = document.getElementById("photoCounter");

const editDoubtBtn = document.querySelector(".edit-doubt-btn");
const deleteDoubtBtn = document.querySelector(".delete-doubt-btn");


/* ==========================================
   2. CURRENT STUDENT
========================================== */

const CURRENT_STUDENT_ID =
    localStorage.getItem("clariqStudentId") || "S001";


/* ==========================================
   3. GET DOUBT ID FROM URL
========================================== */

const params = new URLSearchParams(window.location.search);
const doubtId = params.get("id");


/* ==========================================
   4. LOAD DOUBTS FROM LOCAL STORAGE
========================================== */

function getStoredDoubts() {
    try {
        const doubts = JSON.parse(
            localStorage.getItem("clariqDoubts") || "[]"
        );

        if (!Array.isArray(doubts)) return [];

        return doubts.filter(doubt => {
            return (
                !doubt.studentId ||
                doubt.studentId === CURRENT_STUDENT_ID
            );
        });
    } catch (error) {
        console.error("Error loading doubts:", error);
        return [];
    }
}


/* ==========================================
   5. GET THE SELECTED DOUBT
========================================== */

function getCurrentDoubt() {
    const doubts = getStoredDoubts();

    return doubts.find(item => {
        return String(item.id) === String(doubtId);
    }) || null;
}

let doubt = getCurrentDoubt();


/* ==========================================
   6. SAVE DOUBTS TO LOCAL STORAGE
========================================== */

function saveStoredDoubts(doubts) {
    localStorage.setItem(
        "clariqDoubts",
        JSON.stringify(doubts)
    );
}


/* ==========================================
   7. ESCAPE HTML
========================================== */

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


/* ==========================================
   8. GET TOPICS AND SUBTOPICS
========================================== */

function getDoubtTags(doubt) {
    const tags = [];

    if (Array.isArray(doubt.topics)) {
        doubt.topics.forEach(topic => {
            const name =
                typeof topic === "string"
                    ? topic
                    : topic?.name;

            if (name) tags.push(name);
        });
    }

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
        if (doubt.topic) tags.push(doubt.topic);
        if (doubt.subtopic) tags.push(doubt.subtopic);

        if (Array.isArray(doubt.tags)) {
            tags.push(...doubt.tags);
        }
    }

    return [...new Set(tags)];
}


/* ==========================================
   9. RENDER DOUBT DETAILS
========================================== */

function renderDoubtDetails() {
    if (!doubt) {
        showNotFound();
        return;
    }

    if (doubtSubject) {
        doubtSubject.textContent = doubt.subject || "General";
    }



    if (doubtQuestion) {
        doubtQuestion.textContent =
            doubt.question ||
            doubt.title ||
            "No question provided.";
    }

    if (doubtDescription) {
        doubtDescription.textContent = doubt.description || "";
    }

    renderDoubtTags();
    renderDoubtMeta();
    
    renderStudentAttachments();

    if (window.lucide) {
        window.lucide.createIcons();
    }
}

/* ==========================================
   DOUBT STATUS AND POSTED TIME
========================================== */

function renderDoubtMeta() {
    const card = document.querySelector(".doubt-detail-card");
    if (!card || !doubt) return;

    // STATUS — TOP RIGHT

    let statusBadge = card.querySelector(".detail-status");

    if (!statusBadge) {
        statusBadge = document.createElement("span");
        statusBadge.className = "detail-status";
        card.appendChild(statusBadge);
    }

    const status = (doubt.status || "pending")
        .toLowerCase()
        .replace(/\s+/g, "-");

    const statusLabels = {
        "pending": "Pending",
        "in-progress": "In Progress",
        "resolved": "Resolved"
    };

    statusBadge.textContent =
        statusLabels[status] || status;

    statusBadge.className =
        `detail-status status-${status}`;


    // POSTED TIME — BOTTOM RIGHT

    let dateElement = card.querySelector(".doubt-posted-date");

    if (!dateElement) {
        dateElement = document.createElement("span");
        dateElement.className = "doubt-posted-date";
        card.appendChild(dateElement);
    }

    const dateValue =
        doubt.createdAt ||
        doubt.created_at ||
        doubt.timestamp ||
        doubt.submittedAt ||
        doubt.date;

    if (!dateValue) {
        dateElement.style.display = "none";
        return;
    }

    const postedDate = new Date(dateValue);

    if (isNaN(postedDate.getTime())) {
        dateElement.style.display = "none";
        return;
    }

    const seconds = Math.floor(
        (Date.now() - postedDate.getTime()) / 1000
    );

    let timeAgo;

    if (seconds < 60) {
        timeAgo = "Just now";
    } else if (seconds < 3600) {
        timeAgo = `${Math.floor(seconds / 60)} minutes ago`;
    } else if (seconds < 86400) {
        timeAgo = `${Math.floor(seconds / 3600)} hours ago`;
    } else if (seconds < 604800) {
        timeAgo = `${Math.floor(seconds / 86400)} days ago`;
    } else {
        timeAgo = postedDate.toLocaleDateString();
    }

    dateElement.textContent = `Asked ${timeAgo}`;
    dateElement.style.display = "block";
}

/* ==========================================
   10. RENDER TOPICS AND SUBTOPICS
========================================== */

function renderDoubtTags() {
    if (!doubtTags) return;

    doubtTags.innerHTML = "";

    const tags = getDoubtTags(doubt);

    tags.forEach(tag => {
        const span = document.createElement("span");
        span.className = "doubt-tag";
        span.textContent = tag;
        doubtTags.appendChild(span);
    });
}


/* ==========================================
   11. INDEXED DB CONFIGURATION
========================================== */

const DB_NAME = "ClariQFiles";
const STORE_NAME = "attachments";
const attachmentObjectURLs = new Map();


/* ==========================================
   12. OPEN INDEXED DB
========================================== */

function openFilesDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}


/* ==========================================
   13. GET STORED FILE
========================================== */

async function getStoredAttachment(fileId) {
    if (!fileId) return null;

    try {
        const db = await openFilesDatabase();

        if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.close();
            return null;
        }

        return await new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readonly");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(fileId);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);

            transaction.oncomplete = () => db.close();
            transaction.onerror = () => {
                db.close();
                reject(transaction.error);
            };
        });
    } catch (error) {
        console.error("Attachment retrieval failed:", error);
        return null;
    }
}
/* ==========================================
   14. GET ATTACHMENT URL
========================================== */

async function getAttachmentURL(file) {
    if (!file) return null;

    if (file.url) return file.url;
    if (file.dataUrl) return file.dataUrl;
    if (typeof file.data === "string") return file.data;

    const fileId = file.fileId || file.id;
    if (!fileId) return null;

    if (attachmentObjectURLs.has(fileId)) {
        return attachmentObjectURLs.get(fileId);
    }

    const storedFile = await getStoredAttachment(fileId);
    if (!storedFile) return null;

    const blob =
        storedFile.blob ||
        storedFile.file ||
        storedFile;

    if (!(blob instanceof Blob)) return null;

    const objectURL = URL.createObjectURL(blob);
    attachmentObjectURLs.set(fileId, objectURL);

    return objectURL;
}


/* ==========================================
   15. GET ATTACHMENTS
========================================== */

function getDoubtAttachments() {
    if (Array.isArray(doubt.attachments)) return doubt.attachments;
    if (Array.isArray(doubt.files)) return doubt.files;
    return [];
}


/* ==========================================
   16. CHECK IMAGE FILE
========================================== */

function isImageAttachment(file) {
    const type = String(file.type || "").toLowerCase();
    const name = String(file.name || "").toLowerCase();

    return (
        type.startsWith("image/") ||
        /\.(png|jpg|jpeg|gif|webp)$/i.test(name)
    );
}


/* ==========================================
   17. RENDER STUDENT ATTACHMENTS
========================================== */

async function renderStudentAttachments() {
    if (!studentAttachments) return;

    const attachments = getDoubtAttachments();
    const photos = attachments.filter(isImageAttachment);
    const documents = attachments.filter(file => !isImageAttachment(file));

    if (!attachments.length) {
        studentAttachments.style.display = "none";
        return;
    }

    studentAttachments.style.display = "flex";

    if (photos.length) {
        await renderStudentPhotos(photos);
    } else {
        if (studentPhotoGallery) studentPhotoGallery.innerHTML = "";
        if (photoCounter) photoCounter.style.display = "none";
    }

    if (documents.length) {
        await renderStudentDocuments(documents);
    } else if (studentFileList) {
        studentFileList.innerHTML = "";
    }
}


/* ==========================================
   18. PHOTO GALLERY STATE
========================================== */

let currentPhotoIndex = 0;
let currentPhotoURLs = [];


/* ==========================================
   19. RENDER STUDENT PHOTOS
========================================== */

async function renderStudentPhotos(photos) {
    if (!studentPhotoGallery) return;

    studentPhotoGallery.innerHTML = "";
    currentPhotoIndex = 0;
    currentPhotoURLs = [];

    for (const photo of photos) {
        const url = await getAttachmentURL(photo);
        if (url) currentPhotoURLs.push(url);
    }

    if (!currentPhotoURLs.length) {
        if (photoCounter) photoCounter.style.display = "none";
        return;
    }

    const image = document.createElement("img");
    image.className = "photo-item";
    image.src = currentPhotoURLs[0];
    image.alt = "Student uploaded attachment";

    image.addEventListener("click", () => {
        openPhotoLightbox(currentPhotoURLs[currentPhotoIndex]);
    });

    studentPhotoGallery.appendChild(image);

    if (currentPhotoURLs.length > 1) {
        const previousButton = document.createElement("button");
        previousButton.className =
            "photo-gallery-arrow photo-gallery-prev";
        previousButton.type = "button";
        previousButton.innerHTML =
            `<i data-lucide="chevron-left"></i>`;
        previousButton.setAttribute("aria-label", "Previous photo");
        previousButton.addEventListener("click", () => changePhoto(-1));

        const nextButton = document.createElement("button");
        nextButton.className =
            "photo-gallery-arrow photo-gallery-next";
        nextButton.type = "button";
        nextButton.innerHTML =
            `<i data-lucide="chevron-right"></i>`;
        nextButton.setAttribute("aria-label", "Next photo");
        nextButton.addEventListener("click", () => changePhoto(1));

        studentPhotoGallery.appendChild(previousButton);
        studentPhotoGallery.appendChild(nextButton);
    }

    updatePhotoCounter();

    if (window.lucide) {
        window.lucide.createIcons();
    }
}


/* ==========================================
   20. CHANGE PHOTO
========================================== */

function changePhoto(direction) {
    if (currentPhotoURLs.length <= 1) return;

    currentPhotoIndex += direction;

    if (currentPhotoIndex < 0) {
        currentPhotoIndex = currentPhotoURLs.length - 1;
    }

    if (currentPhotoIndex >= currentPhotoURLs.length) {
        currentPhotoIndex = 0;
    }

    const image = studentPhotoGallery.querySelector(".photo-item");

    if (image) {
        image.src = currentPhotoURLs[currentPhotoIndex];
    }

    updatePhotoCounter();
}


/* ==========================================
   21. UPDATE PHOTO COUNTER
========================================== */

function updatePhotoCounter() {
    if (!photoCounter) return;

    if (currentPhotoURLs.length <= 1) {
        photoCounter.style.display = "none";
        return;
    }

    photoCounter.style.display = "block";
    photoCounter.textContent =
        `${currentPhotoIndex + 1} / ${currentPhotoURLs.length}`;
}


/* ==========================================
   22. PHOTO LIGHTBOX
========================================== */

function openPhotoLightbox(imageURL) {
    const existingLightbox =
        document.querySelector(".photo-lightbox");

    if (existingLightbox) existingLightbox.remove();

    const lightbox = document.createElement("div");
    lightbox.className = "photo-lightbox";

    const closeButton = document.createElement("button");
    closeButton.className = "photo-lightbox-close";
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "Close image");
    closeButton.innerHTML = `<i data-lucide="x"></i>`;

    const image = document.createElement("img");
    image.src = imageURL;
    image.alt = "Full-size student attachment";

    lightbox.appendChild(closeButton);
    lightbox.appendChild(image);
    document.body.appendChild(lightbox);

    if (window.lucide) {
        window.lucide.createIcons();
    }

    function closeLightbox() {
        lightbox.remove();
        document.removeEventListener("keydown", handleEscape);
    }

    closeButton.addEventListener("click", closeLightbox);

    lightbox.addEventListener("click", event => {
        if (event.target === lightbox) closeLightbox();
    });

    function handleEscape(event) {
        if (event.key === "Escape") closeLightbox();
    }

    document.addEventListener("keydown", handleEscape);
}


/* ==========================================
   23. RENDER STUDENT DOCUMENTS
========================================== */

async function renderStudentDocuments(documents) {
    if (!studentFileList) return;

    studentFileList.innerHTML = "";

    for (const documentFile of documents) {
        const fileURL = await getAttachmentURL(documentFile);

        const fileLink = document.createElement("a");
        fileLink.className = "attachment-file";

        if (fileURL) {
            fileLink.href = fileURL;
            fileLink.target = "_blank";
            fileLink.rel = "noopener noreferrer";
        } else {
            fileLink.href = "#";
            fileLink.addEventListener("click", event => {
                event.preventDefault();
                alert("This attachment could not be opened.");
            });
        }

        const icon = document.createElement("i");
        icon.setAttribute("data-lucide", "file-text");

        const fileInfo = document.createElement("div");
        fileInfo.className = "attachment-file-info";

        const fileName = document.createElement("span");
        fileName.className = "attachment-file-name";
        fileName.textContent = documentFile.name || "Attachment";

        const fileSize = document.createElement("span");
        fileSize.className = "attachment-file-size";
        fileSize.textContent = documentFile.size || "";

        const viewIcon = document.createElement("i");
        viewIcon.setAttribute("data-lucide", "external-link");

        fileInfo.appendChild(fileName);
        fileInfo.appendChild(fileSize);
        fileLink.appendChild(icon);
        fileLink.appendChild(fileInfo);
        fileLink.appendChild(viewIcon);

        studentFileList.appendChild(fileLink);
    }

    if (window.lucide) {
        window.lucide.createIcons();
    }
}
/* ==========================================
   24. EDIT DOUBT FORM
========================================== */

function displayEditForm() {
    if (document.getElementById("editForm")) return;
    if (!doubt) return;

    const form = document.createElement("div");
    form.id = "editForm";
    form.className = "edit-form";

    form.innerHTML = `
        <h3 class="section-heading">Edit Your Doubt</h3>

        <label for="editQuestion">Question</label>
        <input
            type="text"
            id="editQuestion"
            maxlength="60"
            required
        >

        <label for="editDescription">Explanation</label>
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

    const detailCard = document.querySelector(".doubt-detail-card");

    if (!detailCard) {
        console.error("Could not find .doubt-detail-card.");
        return;
    }

    detailCard.insertAdjacentElement("afterend", form);

    document.getElementById("editQuestion").value =
        doubt.question || doubt.title || "";

    document.getElementById("editDescription").value =
        doubt.description || "";

    document.getElementById("cancelEdit").addEventListener("click", () => {
        form.remove();
    });

    document.getElementById("saveEdit").addEventListener("click", saveEdit);
}


function saveEdit() {
    const questionInput = document.getElementById("editQuestion");
    const descriptionInput = document.getElementById("editDescription");

    if (!questionInput || !descriptionInput) return;

    const newQuestion = questionInput.value.trim();
    const newDescription = descriptionInput.value.trim();

    if (!newQuestion || !newDescription) {
        alert("Please fill in both fields.");
        return;
    }

    // Load the complete array, not the student-filtered subset.
    // This preserves other students' records in localStorage.
    let allDoubts;

    try {
        allDoubts = JSON.parse(
            localStorage.getItem("clariqDoubts") || "[]"
        );
    } catch (error) {
        console.error("Could not read doubts from localStorage:", error);
        alert("Your doubt could not be saved. Please try again.");
        return;
    }

    if (!Array.isArray(allDoubts)) {
        alert("Your doubt data could not be read.");
        return;
    }

    const index = allDoubts.findIndex(item => {
        return String(item.id) === String(doubtId);
    });

    if (index === -1) {
        alert("Could not find this doubt.");
        return;
    }

    // Update only the two editable fields.
    allDoubts[index].question = newQuestion;
    allDoubts[index].description = newDescription;

    saveStoredDoubts(allDoubts);

    // Update the in-memory record and refresh the visible content.
    doubt = allDoubts[index];
    renderDoubtDetails();

    // Close the edit form after saving.
    const form = document.getElementById("editForm");
    if (form) form.remove();

    alert("Your doubt has been updated successfully!");
}


if (editDoubtBtn) {
    editDoubtBtn.addEventListener("click", displayEditForm);
}


/* ==========================================
   25. DELETE DOUBT
========================================== */

if (deleteDoubtBtn) {
    deleteDoubtBtn.addEventListener("click", () => {
        if (!doubt) return;

        const confirmDelete = confirm(
            "Are you sure you want to delete this doubt?"
        );

        if (!confirmDelete) return;

        const allDoubts = JSON.parse(
            localStorage.getItem("clariqDoubts") || "[]"
        );

        const updatedDoubts = allDoubts.filter(item => {
            return String(item.id) !== String(doubtId);
        });

        if (updatedDoubts.length === allDoubts.length) {
            alert("Doubt not found.");
            return;
        }

        saveStoredDoubts(updatedDoubts);

        alert("Doubt deleted successfully!");
        window.location.href = "my-doubts.html";
    });
}


/* ==========================================
   26. NOT FOUND STATE
========================================== */

function showNotFound() {
    const detailPage = document.querySelector(".detail-page");
    if (!detailPage) return;

    detailPage.innerHTML = `
        <div class="not-found-state">
            <div class="not-found-icon">
                <i data-lucide="file-question"></i>
            </div>

            <h2>Doubt Not Found</h2>

            <p>
                The doubt you're looking for doesn't exist
                or may have been removed.
            </p>

            <a href="my-doubts.html" class="back-btn">
                <i data-lucide="arrow-left"></i>
                Back to My Doubts
            </a>
        </div>
    `;

    if (window.lucide) {
        window.lucide.createIcons();
    }
}


/* ==========================================
   27. CLEAN UP OBJECT URLS
========================================== */

window.addEventListener("beforeunload", () => {
    attachmentObjectURLs.forEach(url => {
        URL.revokeObjectURL(url);
    });
});


/* ==========================================
   28. INITIALIZE PAGE
========================================== */

function initializePage() {
    if (!doubtId || !doubt) {
        showNotFound();
        return;
    }

    renderDoubtDetails();
}

initializePage();