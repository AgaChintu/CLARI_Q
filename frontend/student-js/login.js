/* ==========================================
   CLARIQ LOGIN
========================================== */


/* ==========================================
   DOM ELEMENTS
========================================== */

const roleSwitchBtn = document.getElementById("roleSwitchBtn");
const roleSwitchText = document.getElementById("roleSwitchText");

const loginHeading = document.getElementById("loginHeading");
const loginSubtitle = document.getElementById("loginSubtitle");

const userId = document.getElementById("userId");
const userIdLabel = document.getElementById("userIdLabel");

const password = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const eyeIcon = document.getElementById("eyeIcon");

const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const loginBtnText = document.getElementById("loginBtnText");


/* ==========================================
   LOGIN STATE
========================================== */

// Student login is selected by default.

let currentRole = "student";

/* ==========================================
   ROLE SWITCHING
========================================== */

roleSwitchBtn.addEventListener("click", function () {

    if (currentRole === "student") {

        currentRole = "teacher";

        roleSwitchBtn.innerHTML =
            'Are you a student? <span id="roleSwitchText">Login as Student →</span>';

        userIdLabel.innerHTML =
            '<i data-lucide="user-round" class="input-icon"></i> Teacher ID';

        userId.placeholder = "Enter your Teacher ID";

        userId.name = "teacherId";

        loginSubtitle.textContent = "Log in with your Teacher ID to continue";

    } else {

        currentRole = "student";

        roleSwitchBtn.innerHTML =
            'Are you a teacher? <span id="roleSwitchText">Login as Teacher →</span>';

        userIdLabel.innerHTML =
            '<i data-lucide="user-round" class="input-icon"></i> Student ID';

        userId.placeholder = "Enter your Student ID";

        userId.name = "studentId";

        loginSubtitle.textContent = "Log in with your Student ID to continue";

    }

    // Refresh Lucide icons after updating HTML.
    lucide.createIcons();

    // Clear previous validation messages.
    clearErrors();

});

/* ==========================================
   PASSWORD VISIBILITY
========================================== */

togglePassword.addEventListener("click", function () {

    const isPasswordHidden = password.type === "password";

    password.type = isPasswordHidden ? "text" : "password";

    // Update the icon
    togglePassword.innerHTML = isPasswordHidden
        ? '<i data-lucide="eye-off"></i>'
        : '<i data-lucide="eye"></i>';

    // Update accessibility label
    togglePassword.setAttribute(
        "aria-label",
        isPasswordHidden ? "Hide password" : "Show password"
    );

    // Re-render Lucide icon
    lucide.createIcons();

});

/* ==========================================
   VALIDATION HELPERS
========================================== */

function showError(input, message) {

    input.classList.add("input-error");

    const error = document.createElement("span");

    error.className = "field-error";
    error.textContent = message;

    input.closest(".form-group").appendChild(error);
}


function clearErrors() {

    document.querySelectorAll(".field-error").forEach(error => {
        error.remove();
    });

    document.querySelectorAll(".input-error").forEach(input => {
        input.classList.remove("input-error");
    });

}


/* ==========================================
   INPUT VALIDATION
========================================== */

function validateForm() {

    clearErrors();

    let isValid = true;

    const enteredId = userId.value.trim();
    const enteredPassword = password.value;

    // Validate Student / Teacher ID.

    if (enteredId === "") {

        showError(userId, `Please enter your ${currentRole} ID.`);

        isValid = false;
    }

    // Validate password.

    if (enteredPassword.trim() === "") {

        showError(password, "Please enter your password.");

        isValid = false;
    }

    return isValid;

}


/* ==========================================
   CLEAR ERRORS WHILE TYPING
========================================== */

userId.addEventListener("input", function () {

    userId.classList.remove("input-error");

    const error = userId.closest(".form-group")
        .querySelector(".field-error");

    if (error) error.remove();

});


password.addEventListener("input", function () {

    password.classList.remove("input-error");

    const error = password.closest(".form-group")
        .querySelector(".field-error");

    if (error) error.remove();

});


/* ==========================================
   LOGIN FORM SUBMISSION
========================================== */

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    // Validate before proceeding.

    if (!validateForm()) {
        return;
    }

    // Disable button while processing.

    loginBtn.disabled = true;

    loginBtnText.textContent = "Signing in...";


    try {

        /*
         * BACKEND AUTHENTICATION WILL BE CONNECTED HERE.
         *
         * Current values:
         * currentRole = student / teacher
         * userId.value = entered ID
         * password.value = entered password
         *
         * We will connect the actual API once its
         * endpoint and response structure are decided.
         */

        console.log("Login details ready:");
        console.log("Role:", currentRole);
        console.log("User ID:", userId.value.trim());

        alert("Frontend validation successful! Backend authentication is not connected yet.");

    }

    catch (error) {

        console.error("Login error:", error);

        alert("Something went wrong. Please try again.");

    }

    finally {

        loginBtn.disabled = false;

        loginBtnText.textContent = "Login";

    }

});