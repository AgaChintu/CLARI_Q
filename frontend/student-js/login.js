document.addEventListener("DOMContentLoaded", function () {

    const passwordInput = document.getElementById("password");
    const togglePassword = document.getElementById("togglePassword");
    const loginForm = document.querySelector(".login-form");

    // Password Show / Hide Toggle
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", function () {
            const type = passwordInput.type === "password" ? "text" : "password";
            passwordInput.type = type;
        });
    }

    // Login Form Submit Handler
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const studentId = document.getElementById("studentId").value;
            const password = passwordInput.value;

            if (studentId && password) {
                alert("Login successful for Student ID: " + studentId);
            } else {
                alert("Please fill both fields.");
            }
        });
    }

});