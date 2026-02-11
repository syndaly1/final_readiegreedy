(() => {
  const KEY = "theme";
  const root = document.documentElement;

  function apply(theme) {
    if (!theme) {
      root.removeAttribute("data-theme");
      return;
    }
    root.setAttribute("data-theme", theme);
  }

  try {
    const saved = localStorage.getItem(KEY);
    if (saved) apply(saved);
  } catch (_) {}

  window.theme = {
    get: () => {
      try { return localStorage.getItem(KEY); } catch (_) { return null; }
    },
    set: (t) => {
      try {
        if (t) localStorage.setItem(KEY, t);
        else localStorage.removeItem(KEY);
      } catch (_) {}
      apply(t);
    },
  };
})();