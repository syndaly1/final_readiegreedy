(function () {
  function qs(id) {
    return document.getElementById(id);
  }

  const loginLink = qs("loginLink");
  const signupLink = qs("signupLink");
  const logoutBtn = qs("logoutBtn");

  async function fetchMe() {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      return data;
    } catch (_) {
      return { authenticated: false };
    }
  }

  async function updateNav() {
    const me = await fetchMe();
    const authed = !!me.authenticated;

    if (logoutBtn) logoutBtn.classList.toggle("hidden", !authed);
    if (loginLink) loginLink.classList.toggle("hidden", authed);
    if (signupLink) signupLink.classList.toggle("hidden", authed);

    if (authed) {
      if (loginLink) loginLink.setAttribute("aria-disabled", "true");
      if (signupLink) signupLink.setAttribute("aria-disabled", "true");
    }
    return me;
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      window.location.href = "/";
    });
  }

  window.auth = {
    me: null,
    refresh: async function () {
      const m = await updateNav();
      window.auth.me = m;
      return m;
    },
    isAuthed: function () {
      return !!(window.auth.me && window.auth.me.authenticated);
    }
  };

  window.auth.refresh();
})();
