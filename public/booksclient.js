const grid = document.getElementById("grid");
const q = document.getElementById("q");
const tag = document.getElementById("tag");
const sort = document.getElementById("sort");
const reloadBtn = document.getElementById("reload");

const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");

const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");

const createForm = document.getElementById("createForm");
const formMsg = document.getElementById("formMsg");
const adminHint = document.getElementById("adminHint");

let currentPage = 1;
let totalPages = 1;
let isAdmin = false;

function requireLogin() {
  alert("You need to log in first.");
  window.location.href = "/login";
}

function esc(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function openModal(html) {
  modalBody.innerHTML = html;
  modal.classList.remove("hidden");
}

function hideModal() {
  modal.classList.add("hidden");
  modalBody.innerHTML = "";
}

closeModal.addEventListener("click", hideModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) hideModal();
});

async function fetchMe() {
  try {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    const data = await res.json();
    if (data?.authenticated && data?.user?.role === "admin") {
      isAdmin = true;
    } else {
      isAdmin = false;
    }
  } catch {
    isAdmin = false;
  }

  if (!isAdmin) {
    if (createForm) createForm.style.display = "none";
    if (adminHint) adminHint.style.display = "block";
  } else {
    if (createForm) createForm.style.display = "";
    if (adminHint) adminHint.style.display = "none";
  }
}

function updatePager() {
  if (!pageInfo) return;
  pageInfo.textContent = `Page ${currentPage} / ${totalPages}`;
  if (prevPageBtn) prevPageBtn.disabled = currentPage <= 1;
  if (nextPageBtn) nextPageBtn.disabled = currentPage >= totalPages;
}

async function loadBooks() {
  const params = new URLSearchParams();
  params.set("limit", "24");
  params.set("page", String(currentPage));
  params.set("sort", sort.value);
  if (tag.value) params.set("tag", tag.value);

  const res = await fetch(`/api/books?${params.toString()}`);
  const data = await res.json();

  if (!res.ok) {
    grid.innerHTML = `<div class="card">Failed: ${esc(data.error || "error")}</div>`;
    return;
  }

  const items = Array.isArray(data) ? data : (data.items || []);
  const meta = data.meta || null;

  if (meta) {
    totalPages = meta.pages || 1;
    currentPage = Math.min(currentPage, totalPages);
  } else {
    totalPages = 1;
    currentPage = 1;
  }

  updatePager();

  const needle = q.value.trim().toLowerCase();
  const filtered = needle
    ? items.filter(
        (b) =>
          (b.title || "").toLowerCase().includes(needle) ||
          (b.author || "").toLowerCase().includes(needle)
      )
    : items;

  renderGrid(filtered);
}

function renderGrid(items) {
  if (!items.length) {
    grid.innerHTML = `<div class="card">No books found.</div>`;
    return;
  }

  grid.innerHTML = items
    .map((b) => {
      const title = esc(b.title);
      const author = esc(b.author);
      const year = b.year ? `· ${esc(b.year)}` : "";
      const rating =
        (b.rating ?? null) !== null ? `★ ${esc(b.rating)}` : "★ —";
      const tags = Array.isArray(b.tags)
        ? b.tags
            .slice(0, 4)
            .map((t) => `<span class="pill">${esc(t)}</span>`)
            .join("")
        : "";

      const adminButtons = isAdmin
        ? `
            <button class="btn btn--tiny" data-action="edit">Edit</button>
            <button class="btn btn--tiny btn--danger" data-action="delete">Delete</button>
          `
        : "";

      return `
      <article class="book" data-id="${esc(b._id)}">
        <div class="cover"></div>
        <div class="book-body">
          <div class="book-top">
            <h3 class="book-title">${title}</h3>
            <div class="book-meta">${rating} <span class="muted"> ${year}</span></div>
          </div>
          <div class="book-author">${author}</div>
          <div class="book-tags">${tags}</div>
          <div class="book-actions">
            <button class="btn btn--tiny" data-action="details">Details</button>
            ${adminButtons}
            <button class="btn btn--tiny" data-action="favorite">❤️</button>
          </div>
        </div>
      </article>
    `;
    })
    .join("");

  grid.querySelectorAll(".book").forEach((card) => {
    card.addEventListener("click", async (e) => {
      const action = e.target?.dataset?.action;
      if (!action) return;

      const id = card.dataset.id;
      if (action === "details") return showDetails(id);
      if (action === "edit") return openEditForm(id);
      if (action === "delete") return deleteBook(id);
      if (action === "favorite") return toggleFavorite(id, e.target);
    });
  });
}

async function showDetails(id) {
  const res = await fetch(`/api/books/${id}`);
  const b = await res.json();
  if (!res.ok)
    return openModal(`<h2>Error</h2><p>${esc(b.error || "Failed")}</p>`);

  const tags = Array.isArray(b.tags)
    ? b.tags.map((t) => `<span class="pill">${esc(t)}</span>`).join("")
    : "";

  openModal(`
    <h2>${esc(b.title)}</h2>
    <p class="muted-text">by ${esc(b.author)} ${b.year ? `· ${esc(b.year)}` : ""}</p>
    <div class="book-tags">${tags}</div>
    <p>${esc(b.description || "No description.")}</p>
  `);
}

async function deleteBook(id) {
  if (!isAdmin) return alert("Admins only.");
  if (!confirm("Delete this book?")) return;

  const res = await fetch(`/api/books/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (res.status === 401) return requireLogin();
  if (res.status === 403) return alert("Admins only.");
  if (!res.ok) return alert("Delete failed");

  await loadBooks();
}

async function toggleFavorite(bookId, btn) {
  const added = btn.textContent === "💛";

  const res = await fetch(`/api/favorites/${bookId}`, {
    method: added ? "DELETE" : "POST",
    credentials: "include",
  });

  if (res.status === 401) return requireLogin();
  if (!res.ok) return alert("Favorites action failed");

  btn.textContent = added ? "❤️" : "💛";
}

async function openEditForm(id) {
  if (!isAdmin) return alert("Admins only.");

  const res = await fetch(`/api/books/${id}`);
  const b = await res.json();
  if (!res.ok) return alert("Failed to load book");

  openModal(`
    <h2>Edit Book</h2>
    <form id="editForm" class="form">
      <input name="title" value="${esc(b.title)}" required />
      <input name="author" value="${esc(b.author)}" required />
      <input name="year" type="number" value="${b.year ?? ""}" />
      <input name="rating" type="number" step="0.1" value="${b.rating ?? ""}" />
      <input name="tags" value="${(b.tags || []).join(", ")}" />
      <textarea name="description">${esc(b.description || "")}</textarea>
      <button class="btn">Save</button>
    </form>
  `);

  document.getElementById("editForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = Object.fromEntries(fd.entries());

    payload.year = payload.year ? Number(payload.year) : null;
    payload.rating = payload.rating ? Number(payload.rating) : null;
    payload.tags = payload.tags
      ? payload.tags.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const r = await fetch(`/api/books/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (r.status === 401) return requireLogin();
    if (r.status === 403) return alert("Admins only.");
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      return alert(err.error || "Update failed");
    }

    hideModal();
    await loadBooks();
  });
}

reloadBtn.addEventListener("click", () => loadBooks());
q.addEventListener("input", () => loadBooks());
tag.addEventListener("change", () => {
  currentPage = 1;
  loadBooks();
});
sort.addEventListener("change", () => {
  currentPage = 1;
  loadBooks();
});

if (prevPageBtn) {
  prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage -= 1;
      loadBooks();
    }
  });
}
if (nextPageBtn) {
  nextPageBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage += 1;
      loadBooks();
    }
  });
}

createForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  formMsg.textContent = "";

  if (!isAdmin) return alert("Admins only.");

  const fd = new FormData(createForm);
  const payload = Object.fromEntries(fd.entries());
  payload.year = payload.year ? Number(payload.year) : null;
  payload.rating = payload.rating ? Number(payload.rating) : null;
  payload.seriesNumber = payload.seriesNumber ? Number(payload.seriesNumber) : null;
  payload.tags = payload.tags
    ? payload.tags.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const res = await fetch("/api/books", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.status === 401) return requireLogin();
  if (res.status === 403) return alert("Admins only.");
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return alert(err.error || "Create failed");
  }

  createForm.reset();
  currentPage = 1;
  await loadBooks();
});

(async () => {
  await fetchMe();
  await loadBooks();
})();
