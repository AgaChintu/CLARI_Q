// LOAD SIDEBAR

fetch("../components/teacher-sidebar.html")
.then(response => response.text())
.then(data => {

    const container = document.getElementById("sidebar-container");

    container.innerHTML = data;

    initializeSidebar();

    lucide.createIcons();

});


// ACTIVE PAGE HIGHLIGHTING

function initializeSidebar() {

    const currentPage = window.location.pathname.split("/").pop();

    const navLinks = document.querySelectorAll(".sidebar a");

    navLinks.forEach(link => {

        const linkPage = link.getAttribute("href");

        if (linkPage === currentPage) {
            link.classList.add("nav-item-active");
        }

    });

}


// LOAD TOPBAR

fetch("../components/teacher-topbar.html")
.then(response => response.text())
.then(data => {

    const container = document.getElementById("topbar-container");

    container.innerHTML = data;

    lucide.createIcons();

});