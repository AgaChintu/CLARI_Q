fetch("../Components/teacher-sidebar.html")
.then(response => response.text())
.then(data => {

    const container = document.getElementById("sidebar-container");

    container.innerHTML = data;

    initializeSidebar();

    lucide.createIcons();

});


function initializeSidebar() {

const currentPage = window.location.pathname.split("/").pop();

const navLinks = document.querySelectorAll(".sidebar a");

const doubtsSection = document.querySelector(".nav-dropdown");
const submenu = document.querySelector(".sub-menu");


// ACTIVE PAGE HIGHLIGHTING

navLinks.forEach(link => {

    const linkPage = link.getAttribute("href");

    if (linkPage === currentPage) {

        link.classList.add("nav-item-active");

        // Check whether the current page belongs to Doubts

        if (
            linkPage === "doubts.html" ||
            link.classList.contains("sub-link")
        ) {

            doubtsSection.classList.add("parent-active");
            submenu.hidden = false;

        }

    }

});

}


fetch("../Components/teacher-topbar.html")
.then(response => response.text())
.then(data => {

    const container = document.getElementById("topbar-container");

    container.innerHTML = data;

    lucide.createIcons();

});