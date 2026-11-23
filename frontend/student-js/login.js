/* ==========================================
   CLARIQ LOGIN
========================================== */


/* ==========================================
   DOM ELEMENTS
========================================== */

const collegeId = document.getElementById("collegeId");

const password = document.getElementById("password");

const togglePassword = document.getElementById("togglePassword");

const loginForm = document.getElementById("loginForm");

const loginBtn = document.getElementById("loginBtn");

const loginBtnText = document.getElementById("loginBtnText");


/* ==========================================
   PASSWORD VISIBILITY
========================================== */

togglePassword.addEventListener("click", function () {

    const isPasswordHidden = password.type === "password";

    password.type = isPasswordHidden ? "text" : "password";

    togglePassword.innerHTML = isPasswordHidden
        ? '<i data-lucide="eye-off"></i>'
        : '<i data-lucide="eye"></i>';

    togglePassword.setAttribute(
        "aria-label",
        isPasswordHidden ? "Hide password" : "Show password"
    );

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
   FORM VALIDATION
========================================== */

function validateForm() {

    clearErrors();

    let isValid = true;

    const enteredId = collegeId.value.trim();

    const enteredPassword = password.value;

    if (enteredId === "") {

        showError(collegeId, "Please enter your College ID.");

        isValid = false;

    }

    if (enteredPassword.trim() === "") {

        showError(password, "Please enter your password.");

        isValid = false;

    }

    return isValid;

}


/* ==========================================
   CLEAR ERRORS WHILE TYPING
========================================== */

collegeId.addEventListener("input", function () {

    collegeId.classList.remove("input-error");

    const error = collegeId.closest(".form-group")
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

    if (!validateForm()) {
        return;
    }

    loginBtn.disabled = true;

    loginBtnText.textContent = "Signing in...";

    try {

        /*
         * BACKEND AUTHENTICATION WILL BE CONNECTED HERE.
         *
         * collegeId.value = entered College ID
         * password.value = entered password
         */

        console.log("College ID:", collegeId.value.trim());

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