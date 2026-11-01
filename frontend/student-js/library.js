
document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("searchInput");
    const subjectFilter = document.getElementById("subjectFilter");
    const libraryList = document.getElementById("libraryList");
    const noResults = document.getElementById("noResults");

    const cards = Array.from(
        libraryList.querySelectorAll(".library-card")
    );

    function filterLibrary() {
        const searchText = searchInput.value.toLowerCase().trim();
        const selectedSubject = subjectFilter.value;

        let visibleCount = 0;

        cards.forEach(function (card) {
            const cardText = card.textContent.toLowerCase();
            const cardSubject = card.dataset.subject;

            const matchesSearch = cardText.includes(searchText);
            const matchesSubject =
                selectedSubject === "all" ||
                cardSubject === selectedSubject;

            if (matchesSearch && matchesSubject) {
                card.style.display = "grid";
                visibleCount++;
            } else {
                card.style.display = "none";
            }
        });

        noResults.hidden = visibleCount !== 0;
    }

    searchInput.addEventListener("input", filterLibrary);
    subjectFilter.addEventListener("change", filterLibrary);

    // Lucide icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // Initial filtering
    filterLibrary();
});