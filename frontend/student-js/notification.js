document.addEventListener("DOMContentLoaded", function () {


    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }


    const backLink = document.getElementById("backLink");
    const backText = document.getElementById("backText");

    const previousPage = sessionStorage.getItem("previousPage") || "Home";
    const previousUrl = sessionStorage.getItem("previousUrl") || "dashboard.html";

    if (backText && backLink) {
        backText.textContent = `Back to ${previousPage}`;
        backLink.href = previousUrl;
    }


    document.querySelectorAll(".sidebar ul li a").forEach(link => {
        link.addEventListener("click", function () {
            const spanText = this.querySelector("span");
            if (spanText) {
                const pageName = spanText.textContent.trim();
                const pageUrl = this.getAttribute("href");
                sessionStorage.setItem("previousPage", pageName);
                sessionStorage.setItem("previousUrl", pageUrl);
            }
        });
    });


    const markAllBtn = document.getElementById("markAllBtn");
    const badgeCount = document.getElementById("badgeCount");

    if (markAllBtn) {
        markAllBtn.addEventListener("click", function () {
            document.querySelectorAll(".blue-status-dot").forEach(dot => {
                dot.classList.add("hidden-dot");
            });
            document.querySelectorAll(".notif-card.unread").forEach(card => {
                card.classList.remove("unread");
                card.classList.add("read");
            });
            if (badgeCount) {
                badgeCount.style.display = "none";
            }
        });
    }


    const chips = document.querySelectorAll(".chip");
    const cards = document.querySelectorAll(".notif-card");

    chips.forEach(chip => {
        chip.addEventListener("click", function () {
            chips.forEach(c => c.classList.remove("active"));
            this.classList.add("active");

            const filter = this.getAttribute("data-filter");

            cards.forEach(card => {
                const category = card.getAttribute("data-category");
                const isUnread = card.classList.contains("unread");

                if (filter === "all") {
                    card.style.display = "flex";
                } else if (filter === "unread") {
                    card.style.display = isUnread ? "flex" : "none";
                } else if (filter === category) {
                    card.style.display = "flex";
                } else {
                    card.style.display = "none";
                }
            });
        });
    });
});