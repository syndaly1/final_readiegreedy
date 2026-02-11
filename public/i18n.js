(function () {
  const LANGS = ["en", "ru", "kk"];

  function getLang() {
    const stored = localStorage.getItem("lang");
    if (stored && LANGS.includes(stored)) return stored;
    const nav = (navigator.language || "en").slice(0, 2).toLowerCase();
    return LANGS.includes(nav) ? nav : "en";
  }

  async function loadDict(lang) {
    const res = await fetch(`/i18n/${lang}.json`, { cache: "no-store" });
    if (!res.ok) throw new Error("i18n load failed");
    return res.json();
  }

  function apply(dict) {
    document.documentElement.lang = dict.__lang || localStorage.getItem("lang") || "en";
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const val = dict[key];
      if (typeof val !== "string") return;
      const attr = el.getAttribute("data-i18n-attr");
      if (attr) el.setAttribute(attr, val);
      else el.textContent = val;
    });
  }

  function wireSwitchers(current) {
    const select = document.getElementById("langSelect");
    if (select) {
      select.value = current;
      select.addEventListener("change", () => {
        localStorage.setItem("lang", select.value);
        window.location.reload();
      });
    }

    document.querySelectorAll("[data-lang]").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const lang = a.getAttribute("data-lang");
        if (!lang) return;
        localStorage.setItem("lang", lang);
        window.location.reload();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const lang = getLang();
    localStorage.setItem("lang", lang);

    try {
      const dict = await loadDict(lang);
      dict.__lang = lang;
      apply(dict);
      wireSwitchers(lang);
    } catch (e) {
      // If translations fail, don't brick the UI.
      wireSwitchers(lang);
    }
  });
})();
