const input = document.getElementById("savesSearch");

input.addEventListener("input", function () {
  const query = this.value.toLowerCase();

  document.querySelectorAll(
    ".saved-doubt-card, .saved-resource-card"
  ).forEach(card => {
    const text = (
      card.textContent + " " + card.getAttribute("data-search")
    ).toLowerCase();

    card.style.setProperty(
      "display",
      text.includes(query) ? "block" : "none",
      "important"
    );
  });
});
document.querySelectorAll(".filter-btn").forEach(button => {
  button.addEventListener("click", function () {
    document.querySelectorAll(".filter-btn").forEach(btn => {
      btn.classList.remove("active");
    });

    this.classList.add("active");

    const filter = this.dataset.filter;

    document.querySelectorAll(
      ".saved-doubt-card, .saved-resource-card"
    ).forEach(card => {
      const show =
        filter === "all" || card.dataset.type === filter;

      card.style.setProperty(
        "display",
        show ? "block" : "none",
        "important"
      );
    });
  });
});