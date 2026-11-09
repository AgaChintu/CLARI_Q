/* ==========================================
   CLARIQ - TEACHER DOUBT DETAILS
========================================== */


/* ==========================================
   SAMPLE DOUBT DATA
========================================== */

const doubts = [

    {
        id: "D001",
        question: "Why does the loop execute one extra time when I use this condition?",
        subject: "PPS",
        className: "1st Year AIML",
        topic: "Loops",
        subtopic: "For Loop",
        time: "2 hours ago",
        status: "pending",

        explanation: "I am confused about how the loop condition is evaluated. When I use i <= 5, the loop seems to execute one extra time compared to what I expected.",

        photos: 2,

        documents: [
            {
                name: "loop-code.pdf",
                type: "PDF",
                size: "245 KB"
            },
            {
                name: "notes.pdf",
                type: "PDF",
                size: "180 KB"
            }
        ]
    },

    {
        id: "D002",
        question: "How does memory allocation work in a linked list?",
        subject: "DSA",
        className: "2nd Year AIML",
        topic: "Linked Lists",
        subtopic: "Dynamic Memory Allocation",
        time: "5 hours ago",
        status: "in-progress",

        explanation: "I understand how nodes are connected using pointers, but I am confused about how memory is allocated dynamically when a new node is created.",

        photos: 1,

        documents: []
    },

    {
        id: "D003",
        question: "What is the difference between logical and physical addresses?",
        subject: "COA",
        className: "2nd Year AIML",
        topic: "Memory Organization",
        subtopic: "Addressing",
        time: "Yesterday",
        status: "pending",

        explanation: "I am unable to understand how a logical address gets converted into a physical address.",

        photos: 0,

        documents: [
            {
                name: "addressing-notes.pdf",
                type: "PDF",
                size: "320 KB"
            }
        ]
    },

    {
        id: "D004",
        question: "Can someone explain the concept of normalization?",
        subject: "DBMS",
        className: "2nd Year CSE",
        topic: "Database Design",
        subtopic: "Normalization",
        time: "Yesterday",
        status: "resolved",

        explanation: "I want to understand how normalization helps reduce redundancy in relational databases.",

        photos: 0,

        documents: []
    },

    {
        id: "D005",
        question: "How do we calculate the time complexity of nested loops?",
        subject: "DSA",
        className: "2nd Year AIML",
        topic: "Time Complexity",
        subtopic: "Asymptotic Analysis",
        time: "2 days ago",
        status: "pending",

        explanation: "I am confused about how to calculate the time complexity when one loop is nested inside another.",

        photos: 0,

        documents: []
    },

    {
        id: "D006",
        question: "What is the difference between stack and heap memory?",
        subject: "PPS",
        className: "1st Year AIML",
        topic: "Memory Management",
        subtopic: "Memory Allocation",
        time: "3 days ago",
        status: "resolved",

        explanation: "I want to understand the difference between stack and heap memory allocation.",

        photos: 0,

        documents: []
    }

];


/* ==========================================
   GET DOUBT FROM URL
========================================== */

const params = new URLSearchParams(window.location.search);
const doubtId = params.get("id");

const doubt = doubts.find(item => item.id === doubtId);


/* ==========================================
   DOM ELEMENTS
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

const responseEditor = document.getElementById("responseEditor");
const responseFileInput = document.getElementById("responseFileInput");
const responseFileList = document.getElementById("responseFileList");

const saveDraftBtn = document.getElementById("saveDraftBtn");
const submitResponseBtn = document.getElementById("submitResponseBtn");


/* ==========================================
   STORAGE CONFIGURATION
========================================== */

const DRAFT_STORAGE_KEY = "clariqTeacherDrafts";
const STATUS_STORAGE_KEY = "clariqTeacherDoubtStatuses";
const RESPONSE_STORAGE_KEY = "clariqTeacherResponses";

const FILE_DB_NAME = "ClariQFiles";
const FILE_STORE_NAME = "attachments";

const MAX_FILE_SIZE = 10 * 1024 * 1024;


/* ==========================================
   PHOTO GALLERY STATE
========================================== */

let currentPhotoIndex = 0;
let currentPhotoURLs = [];


/* ==========================================
   TEACHER RESPONSE STATE
========================================== */

let responseFiles = [];


/* ==========================================
   SAMPLE IMAGE GENERATOR
========================================== */

function createSampleImage(number) {

    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg"
             width="900"
             height="600"
             viewBox="0 0 900 600">

            <rect width="900" height="600" fill="#edf3ff"/>

            <rect x="80"
                  y="70"
                  width="740"
                  height="460"
                  rx="18"
                  fill="#ffffff"
                  stroke="#d7e2f5"
                  stroke-width="3"/>

            <text x="450"
                  y="280"
                  text-anchor="middle"
                  font-size="34"
                  font-family="Arial"
                  fill="#5274a8">
                Sample Photo ${number}
            </text>

            <text x="450"
                  y="330"
                  text-anchor="middle"
                  font-size="20"
                  font-family="Arial"
                  fill="#8498b8">
                Student attachment preview
            </text>

        </svg>
    `;

    const blob = new Blob([svg], {
        type: "image/svg+xml"
    });

    return URL.createObjectURL(blob);

}


/* ==========================================
   LOCAL STORAGE HELPERS
========================================== */

function getStoredData(key) {

    try {

        return JSON.parse(localStorage.getItem(key) || "{}");

    } catch (error) {

        console.error(`Could not read ${key}:`, error);

        return {};

    }

}


function saveStoredData(key, data) {

    localStorage.setItem(key, JSON.stringify(data));

}


function saveStoredStatus(doubtId, status) {

    const statuses = getStoredData(STATUS_STORAGE_KEY);

    statuses[doubtId] = status;

    saveStoredData(STATUS_STORAGE_KEY, statuses);

    doubt.status = status;

}


/* ==========================================
   STUDENT DOUBT STATUS
========================================== */

function getDoubtStatus() {

    if (!doubt) return "pending";

    const statuses = getStoredData(STATUS_STORAGE_KEY);

    return statuses[doubt.id] || doubt.status;

}


/* ==========================================
   RENDER DOUBT DETAILS
========================================== */

function renderDoubtDetails() {

    if (!doubt) {

        showNotFound();
        return;

    }

    doubtSubject.textContent = doubt.subject;
    doubtClass.textContent = doubt.className;

    doubtQuestion.textContent = doubt.question;
    doubtDescription.textContent = doubt.explanation;

    renderDoubtTags();
    renderStudentAttachments();

    lucide.createIcons();

}


/* ==========================================
   RENDER DOUBT TAGS
========================================== */

function renderDoubtTags() {

    doubtTags.innerHTML = "";

    const tags = [];

    if (doubt.topic) {
        tags.push(doubt.topic);
    }

    if (doubt.subtopic) {
        tags.push(doubt.subtopic);
    }

    tags.forEach(tag => {

        const span = document.createElement("span");

        span.className = "doubt-tag";
        span.textContent = tag;

        doubtTags.appendChild(span);

    });

}


/* ==========================================
   STUDENT ATTACHMENTS
========================================== */

function renderStudentAttachments() {

    const photoCount = Array.isArray(doubt.photos)
        ? doubt.photos.length
        : Number(doubt.photos) || 0;

    const documentCount = Array.isArray(doubt.documents)
        ? doubt.documents.length
        : 0;

    const hasPhotos = photoCount > 0;
    const hasDocuments = documentCount > 0;

    if (!hasPhotos && !hasDocuments) {

        studentAttachments.style.display = "none";
        return;

    }

    studentAttachments.style.display = "flex";

    if (hasPhotos) {

        renderStudentPhotos();

    } else {

        studentPhotoGallery.innerHTML = "";

        if (photoCounter) {
            photoCounter.style.display = "none";
        }

    }

    if (hasDocuments) {

        renderStudentDocuments();

    } else {

        studentFileList.innerHTML = "";

    }

}


/* ==========================================
   RENDER STUDENT PHOTOS
========================================== */

function renderStudentPhotos() {

    studentPhotoGallery.innerHTML = "";

    currentPhotoIndex = 0;

    if (Array.isArray(doubt.photos)) {

        currentPhotoURLs = doubt.photos.map(photo => {

            if (typeof photo === "string") {
                return photo;
            }

            return photo.url;

        }).filter(Boolean);

    } else {

        const photoCount = Number(doubt.photos) || 0;

        currentPhotoURLs = [];

        for (let i = 1; i <= photoCount; i++) {

            currentPhotoURLs.push(createSampleImage(i));

        }

    }

    if (currentPhotoURLs.length === 0) {

        if (photoCounter) {
            photoCounter.style.display = "none";
        }

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

        previousButton.addEventListener("click", () => {

            changePhoto(-1);

        });


        const nextButton = document.createElement("button");

        nextButton.className =
            "photo-gallery-arrow photo-gallery-next";

        nextButton.type = "button";

        nextButton.innerHTML =
            `<i data-lucide="chevron-right"></i>`;

        nextButton.setAttribute("aria-label", "Next photo");

        nextButton.addEventListener("click", () => {

            changePhoto(1);

        });


        studentPhotoGallery.appendChild(previousButton);
        studentPhotoGallery.appendChild(nextButton);

    }

    updatePhotoCounter();

    lucide.createIcons();

}


/* ==========================================
   CHANGE PHOTO
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

    image.src = currentPhotoURLs[currentPhotoIndex];

    updatePhotoCounter();

}


/* ==========================================
   UPDATE PHOTO COUNTER
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
   PHOTO LIGHTBOX
========================================== */

function openPhotoLightbox(imageURL) {

    const existingLightbox =
        document.querySelector(".photo-lightbox");

    if (existingLightbox) {
        existingLightbox.remove();
    }

    const lightbox = document.createElement("div");

    lightbox.className = "photo-lightbox";

    lightbox.innerHTML = `
        <button class="photo-lightbox-close"
                type="button"
                aria-label="Close image">

            <i data-lucide="x"></i>

        </button>

        <img src="${imageURL}" alt="Full-size student attachment">
    `;

    document.body.appendChild(lightbox);

    lucide.createIcons();

    const closeButton =
        lightbox.querySelector(".photo-lightbox-close");


    function closeLightbox() {

        lightbox.remove();

        document.removeEventListener("keydown", handleEscape);

    }


    closeButton.addEventListener("click", closeLightbox);


    lightbox.addEventListener("click", event => {

        if (event.target === lightbox) {

            closeLightbox();

        }

    });


    function handleEscape(event) {

        if (event.key === "Escape") {

            closeLightbox();

        }

    }

    document.addEventListener("keydown", handleEscape);

}


/* ==========================================
   RENDER STUDENT DOCUMENTS
========================================== */

function renderStudentDocuments() {

    studentFileList.innerHTML = "";

    doubt.documents.forEach(documentFile => {

        const fileLink = document.createElement("a");

        fileLink.className = "attachment-file";

        if (documentFile.url) {

            fileLink.href = documentFile.url;

            fileLink.target = "_blank";

            fileLink.rel = "noopener noreferrer";

        } else {

            fileLink.href = "#";

            fileLink.addEventListener("click", event => {

                event.preventDefault();

                alert(
                    "This is a sample document. Its actual PDF file is not available yet."
                );

            });

        }


        const icon = document.createElement("i");

        icon.setAttribute("data-lucide", "file-text");


        const fileInfo = document.createElement("div");

        fileInfo.className = "attachment-file-info";


        const fileName = document.createElement("span");

        fileName.className = "attachment-file-name";

        fileName.textContent = documentFile.name;


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

    });

    lucide.createIcons();

}


/* ==========================================
   TEACHER RESPONSE EDITOR
========================================== */

if (responseEditor) {

    document.querySelectorAll(".toolbar-btn").forEach(button => {

        button.addEventListener("click", () => {

            const command = button.dataset.command;

            if (!command) return;

            responseEditor.focus();

            switch (command) {

                case "bold":
                case "italic":
                case "underline":
                case "insertUnorderedList":
                case "insertOrderedList":
                case "undo":
                case "redo":

                    document.execCommand(command, false, null);

                    break;


                case "createLink": {

                    const url = prompt("Enter the link URL:");

                    if (url) {

                        document.execCommand("createLink", false, url);

                    }

                    break;

                }


                case "code":

                    insertCodeBlock();

                    break;

            }

        });

    });

}


/* ==========================================
   INSERT CODE BLOCK
========================================== */

function insertCodeBlock() {

    const codeBlock = document.createElement("pre");

    const code = document.createElement("code");

    code.textContent = "Write your code here...";

    codeBlock.appendChild(code);

    responseEditor.appendChild(codeBlock);

    responseEditor.focus();

}


/* ==========================================
   OPEN FILE DATABASE
========================================== */

function openFilesDatabase() {

    return new Promise((resolve, reject) => {

        const request = indexedDB.open(FILE_DB_NAME);

        request.onsuccess = () => {

            const db = request.result;

            if (db.objectStoreNames.contains(FILE_STORE_NAME)) {

                resolve(db);
                return;

            }

            // The database exists but the required store does not.
            // Upgrade its version to create the store.

            const nextVersion = db.version + 1;

            db.close();

            const upgradeRequest = indexedDB.open(
                FILE_DB_NAME,
                nextVersion
            );

            upgradeRequest.onupgradeneeded = event => {

                const upgradedDB = event.target.result;

                if (!upgradedDB.objectStoreNames.contains(FILE_STORE_NAME)) {

                    upgradedDB.createObjectStore(FILE_STORE_NAME, {
                        keyPath: "fileId"
                    });

                }

            };

            upgradeRequest.onsuccess = () => {

                resolve(upgradeRequest.result);

            };

            upgradeRequest.onerror = () => {

                reject(upgradeRequest.error);

            };

        };

        request.onerror = () => {

            reject(request.error);

        };

    });

}


/* ==========================================
   STORE FILE IN INDEXEDDB
========================================== */

async function storeTeacherFile(file) {

    const db = await openFilesDatabase();

    return new Promise((resolve, reject) => {

        const fileId = crypto.randomUUID();

        const transaction = db.transaction(
            FILE_STORE_NAME,
            "readwrite"
        );

        const store = transaction.objectStore(FILE_STORE_NAME);

        store.put({

            fileId: fileId,

            blob: file,

            name: file.name,

            type: file.type,

            size: file.size

        });

        transaction.oncomplete = () => {

            db.close();

            resolve({

                fileId: fileId,

                name: file.name,

                type: file.type,

                size: file.size

            });

        };

        transaction.onerror = () => {

            db.close();

            reject(transaction.error);

        };

    });

}


/* ==========================================
   GET FILE FROM INDEXEDDB
========================================== */

async function getTeacherFile(fileId) {

    const db = await openFilesDatabase();

    return new Promise((resolve, reject) => {

        const transaction = db.transaction(
            FILE_STORE_NAME,
            "readonly"
        );

        const store = transaction.objectStore(FILE_STORE_NAME);

        const request = store.get(fileId);

        request.onsuccess = () => {

            const record = request.result;

            db.close();

            if (!record) {

                resolve(null);
                return;

            }

            const file = new File(
                [record.blob],
                record.name,
                {
                    type: record.type
                }
            );

            resolve(file);

        };

        request.onerror = () => {

            db.close();

            reject(request.error);

        };

    });

}


/* ==========================================
   DELETE FILE FROM INDEXEDDB
========================================== */

async function deleteTeacherFile(fileId) {

    if (!fileId) return;

    const db = await openFilesDatabase();

    return new Promise((resolve, reject) => {

        const transaction = db.transaction(
            FILE_STORE_NAME,
            "readwrite"
        );

        transaction.objectStore(FILE_STORE_NAME).delete(fileId);

        transaction.oncomplete = () => {

            db.close();

            resolve();

        };

        transaction.onerror = () => {

            db.close();

            reject(transaction.error);

        };

    });

}


/* ==========================================
   TEACHER RESPONSE FILE UPLOAD
========================================== */

if (responseFileInput) {

    responseFileInput.addEventListener("change", event => {

        const selectedFiles = Array.from(event.target.files);

        selectedFiles.forEach(file => {

            if (file.size > MAX_FILE_SIZE) {

                alert(`${file.name} exceeds the 10 MB file limit.`);

                return;

            }

            responseFiles.push(file);

        });

        renderResponseFiles();

        responseFileInput.value = "";

    });

}


/* ==========================================
   RENDER TEACHER RESPONSE FILES
========================================== */

function renderResponseFiles() {

    if (!responseFileList) return;

    responseFileList.innerHTML = "";

    responseFiles.forEach((file, index) => {

        // Main capsule

        const fileItem = document.createElement("div");

        fileItem.className = "attachment-preview";


        // File type icon

        const fileIcon = document.createElement("div");

        fileIcon.className = "attachment-icon";

        const isImage = file.type.startsWith("image/");

        fileIcon.innerHTML = isImage
            ? `<i data-lucide="image"></i>`
            : `<i data-lucide="file-text"></i>`;


        // File details

        const fileDetails = document.createElement("div");

        fileDetails.className = "attachment-details";


        // File name

        const fileName = document.createElement("span");

        fileName.className = "attachment-name";

        fileName.textContent = file.name;

        fileName.title = file.name;


        // File size

        const fileSize = document.createElement("span");

        fileSize.className = "attachment-size";

        fileSize.textContent = file.size >= 1024 * 1024
            ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
            : `${(file.size / 1024).toFixed(0)} KB`;


        fileDetails.appendChild(fileName);
        fileDetails.appendChild(fileSize);


        // Remove button

        const removeButton = document.createElement("button");

        removeButton.type = "button";

        removeButton.className = "remove-attachment";

        removeButton.setAttribute("aria-label", "Remove file");

        removeButton.innerHTML = `<i data-lucide="x"></i>`;

        removeButton.addEventListener("click", async () => {

            const fileToRemove = responseFiles[index];

            if (fileToRemove.fileId) {

                try {

                    await deleteTeacherFile(fileToRemove.fileId);

                } catch (error) {

                    console.error("Could not delete attachment:", error);

                }

            }

            responseFiles.splice(index, 1);

            renderResponseFiles();

        });


        // Assemble capsule

        fileItem.appendChild(fileIcon);
        fileItem.appendChild(fileDetails);
        fileItem.appendChild(removeButton);

        responseFileList.appendChild(fileItem);

    });

    lucide.createIcons();

}


/* ==========================================
   PREPARE FILES FOR STORAGE
========================================== */

async function prepareFilesForStorage() {

    const storedFiles = [];

    for (const file of responseFiles) {

        if (file.fileId) {

            storedFiles.push({

                fileId: file.fileId,

                name: file.name,

                type: file.type,

                size: file.size

            });

            continue;

        }

        const storedFile = await storeTeacherFile(file);

        file.fileId = storedFile.fileId;

        storedFiles.push(storedFile);

    }

    return storedFiles;

}


/* ==========================================
   SAVE AS DRAFT
========================================== */

if (saveDraftBtn) {

    saveDraftBtn.addEventListener("click", async () => {

        if (!doubt) return;

        const response = responseEditor.innerHTML.trim();

        const hasResponse =
            response &&
            response !== "<br>" &&
            response !== "<div><br></div>";

        if (!hasResponse && responseFiles.length === 0) {

            alert(
                "Write a response or attach a file before saving your draft."
            );

            return;

        }

        saveDraftBtn.disabled = true;

        try {

            // Save actual file contents in IndexedDB.

            const storedFiles = await prepareFilesForStorage();


            // Save response and file references in localStorage.

            const drafts = getStoredData(DRAFT_STORAGE_KEY);

            drafts[doubt.id] = {

                doubtId: doubt.id,

                response: response,

                files: storedFiles,

                updatedAt: new Date().toISOString()

            };

            saveStoredData(DRAFT_STORAGE_KEY, drafts);


            // Update doubt status.

            saveStoredStatus(doubt.id, "in-progress");


            alert("Your response has been saved as a draft!");

        } catch (error) {

            console.error("Draft saving failed:", error);

            alert("Could not save your draft. Please try again.");

        } finally {

            saveDraftBtn.disabled = false;

        }

    });

}


/* ==========================================
   RESTORE SAVED DRAFT
========================================== */

async function restoreDraft() {

    if (!doubt || !responseEditor) return;

    const drafts = getStoredData(DRAFT_STORAGE_KEY);

    const draft = drafts[doubt.id];

    if (!draft) return;


    // Restore response text.

    responseEditor.innerHTML = draft.response || "";


    // Restore uploaded files.

    responseFiles = [];

    for (const fileData of draft.files || []) {

        try {

            const file = await getTeacherFile(fileData.fileId);

            if (file) {

                file.fileId = fileData.fileId;

                responseFiles.push(file);

            }

        } catch (error) {

            console.error("Could not restore attachment:", error);

        }

    }

    renderResponseFiles();

}


/* ==========================================
   SUBMIT TEACHER RESPONSE
========================================== */

if (submitResponseBtn) {

    submitResponseBtn.addEventListener("click", async () => {

        if (!doubt) return;

        const response = responseEditor.innerHTML.trim();

        const hasResponse =
            response &&
            response !== "<br>" &&
            response !== "<div><br></div>";

        if (!hasResponse) {

            alert("Please write a response before submitting.");

            return;

        }

        submitResponseBtn.disabled = true;

        try {

            // Store actual file contents.

            const storedFiles = await prepareFilesForStorage();


            // Create submitted response.

            const responseData = {

                doubtId: doubt.id,

                response: response,

                files: storedFiles,

                submittedAt: new Date().toISOString()

            };


            // Store submitted response.

            const submittedResponses =
                getStoredData(RESPONSE_STORAGE_KEY);

            submittedResponses[doubt.id] = responseData;

            saveStoredData(
                RESPONSE_STORAGE_KEY,
                submittedResponses
            );


            // Remove saved draft.

            const drafts = getStoredData(DRAFT_STORAGE_KEY);

            delete drafts[doubt.id];

            saveStoredData(DRAFT_STORAGE_KEY, drafts);


            // Update status.

            saveStoredStatus(doubt.id, "resolved");


            console.log(
                "Teacher response submitted:",
                responseData
            );

            alert("Your response has been submitted successfully!");

            window.location.href = "doubt-inbox.html";

        } catch (error) {

            console.error("Response submission failed:", error);

            alert("Could not submit your response. Please try again.");

        } finally {

            submitResponseBtn.disabled = false;

        }

    });

}


/* ==========================================
   NOT FOUND STATE
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

            <a href="doubt-inbox.html" class="back-btn">
                <i data-lucide="arrow-left"></i>
                Back to Doubts Inbox
            </a>

        </div>

    `;

    lucide.createIcons();

}


/* ==========================================
   INITIALIZE PAGE
========================================== */

async function initializePage() {

    if (!doubt) {

        showNotFound();
        return;

    }

    // Restore saved status.

    doubt.status = getDoubtStatus();


    // Render student doubt.

    renderDoubtDetails();


    // Restore teacher's saved draft.

    try {

        await restoreDraft();

    } catch (error) {

        console.error("Could not restore draft:", error);

    }

}


initializePage();