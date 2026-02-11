(async function () {
  const form = document.getElementById("authForm");
  if (!form) return;

  const mode = form.dataset.mode; 
  const msg = document.getElementById("authMsg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";
    msg.className = "form-msg";

    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());

    const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", 
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      msg.textContent = data.error || "Something went wrong";
      msg.classList.add("error");
      return;
    }

    if (window.auth && window.auth.refresh) {
      await window.auth.refresh();
    }

    window.location.href = "/books";
  });
})();
