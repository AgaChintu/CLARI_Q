
const searchInput = document.getElementById("searchInput");
const subjectFilter = document.getElementById("subjectFilter");
const cards = document.querySelectorAll(".library-card");
const noResults = document.getElementById("noResults");

function filterLibrary() {
    const searchText = searchInput.value.toLowerCase().trim();
    const selectedSubject = subjectFilter.value;
    let visibleCards = 0;

    cards.forEach(card => {
        const cardText = card.innerText.toLowerCase();
        const cardSubject = card.dataset.subject;

        const matchesSearch = cardText.includes(searchText);
        const matchesSubject =
            selectedSubject === "all" ||
            cardSubject === selectedSubject;

        if (matchesSearch && matchesSubject) {
            card.style.display = "grid";
            visibleCards++;
        } else {
            card.style.display = "none";
        }
    });

    noResults.hidden = visibleCards !== 0;
}

searchInput.addEventListener("input", filterLibrary);
subjectFilter.addEventListener("change", filterLibrary);

lucide.createIcons();


