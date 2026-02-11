(() => {
  const btn = document.getElementById("menuBtn");
  const menu = document.getElementById("menu");

  function openMenu() {
    if (!menu || !btn) return;
    menu.classList.add("open");
    btn.setAttribute("aria-expanded", "true");
    menu.setAttribute("aria-hidden", "false");
  }

  function closeMenu() {
    if (!menu || !btn) return;
    menu.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-hidden", "true");
  }

  if (btn && menu) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (menu.classList.contains("open")) closeMenu();
      else openMenu();
    });

    document.addEventListener("click", (e) => {
      if (!menu.classList.contains("open")) return;
      if (menu.contains(e.target) || btn.contains(e.target)) return;
      closeMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  document.querySelectorAll('a[aria-disabled="true"]').forEach((a) => {
    a.addEventListener("click", (e) => e.preventDefault());
  });

  const ROUTES = [
    { label: "Subjects", href: "/subjects" },
    { label: "Trending", href: "/explore" },
    { label: "Library Explorer", href: "/about" },
    { label: "Lists", href: "/lists" },
    { label: "Collections", href: "/explore" },
    { label: "K-12 Student Library", href: "/k12" },
    { label: "Book Talks", href: "/contact" },
    { label: "Random Book", href: "/random" },
    { label: "Advanced Search", href: "/books" },

    { label: "Add a Book", href: "/books#add" },
    { label: "Recent Community Edits", href: "/contact" },

    { label: "Help & Support", href: "/contact" },
    { label: "Developer Center", href: "/contact" },
    { label: "Librarians Portal", href: "/contact" },

    { label: "Vision", href: "/vision" },
    { label: "Books", href: "/books" },
    { label: "Explore", href: "/explore" },
    { label: "Contact", href: "/contact" },
  ];

  function norm(s) {
    return String(s || "").trim().toLowerCase();
  }

  function findMatches(q) {
    const n = norm(q);
    if (!n) return [];
    return ROUTES.filter((r) => norm(r.label).includes(n)).slice(0, 8);
  }

  const form = document.querySelector(".nav-search");
  const input = form ? form.querySelector(".nav-search-input") : null;

  let resultsBox = null;

  function ensureResultsBox() {
    if (!form) return null;
    if (resultsBox) return resultsBox;
    resultsBox = document.createElement("div");
    resultsBox.className = "search-results hidden";
    form.appendChild(resultsBox);
    return resultsBox;
  }

  function render(matches) {
    const box = ensureResultsBox();
    if (!box) return;
    if (!matches.length) {
      box.classList.add("hidden");
      box.innerHTML = "";
      return;
    }
    box.classList.remove("hidden");
    box.innerHTML = matches
      .map((m) => `<a href="${m.href}">${m.label}</a>`)
      .join("");
  }

  function hide() {
    if (!resultsBox) return;
    resultsBox.classList.add("hidden");
  }

  if (form && input) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = input.value;
      const matches = findMatches(q);

      if (matches.length === 1) {
        window.location.href = matches[0].href;
        return;
      }
      if (matches.length > 1) {
        render(matches);
        openMenu(); 
        return;
      }

      window.location.href = "/books";
    });

    input.addEventListener("input", () => {
      render(findMatches(input.value));
    });

    document.addEventListener("click", (e) => {
      if (!resultsBox) return;
      if (form.contains(e.target)) return;
      hide();
    });
  }
})();