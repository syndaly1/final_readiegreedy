(() => {
  const input = document.getElementById("subjectsSearch");
  if (!input) return;

  const links = Array.from(document.querySelectorAll("[data-subject-link]"));
  const rows = links.map(a => ({ a, txt: a.textContent.trim().toLowerCase() }));

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    rows.forEach(({a, txt}) => {
      a.style.display = (!q || txt.includes(q)) ? "" : "none";
    });
  });
})();