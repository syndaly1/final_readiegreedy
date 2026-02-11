(() => {
  const track = document.querySelector("[data-track]");
  const btn = document.getElementById("reroll");
  const note = document.getElementById("randomNote");

  if (!track) return;

  function card(title, author) {
    const el = document.createElement("article");
    el.className = "book-card";
    el.innerHTML = `
      <div class="book-cover">
        <div style="height:180px;border-radius:14px;background:rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;">
          <img src="/logo.svg" alt="" style="width:54px;opacity:.85" />
        </div>
      </div>
      <div class="book-card-title"></div>
      <div class="book-card-sub muted-text"></div>
    `;
    el.querySelector(".book-card-title").textContent = title || "Untitled";
    el.querySelector(".book-card-sub").textContent = author || "Unknown author";
    return el;
  }

  async function load() {
    track.innerHTML = "";
    try {
      const res = await fetch("/api/books?sort=createdAt:desc");
      const data = await res.json();
      const books = Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []);
      if (!books.length) {
        note.textContent = "No books yet. Add a few first, then come back for your 'random' destiny.";
        return;
      }
      const now = new Date();
      const onejan = new Date(now.getFullYear(),0,1);
      const week = Math.floor((((now - onejan) / 86400000) + onejan.getDay()+1)/7);
      let seed = (now.getFullYear()*100 + week) >>> 0;
      function rand() {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
      }
      const picked = [];
      const maxPick = Math.min(3, books.length);
      while (picked.length < maxPick) {
        const idx = Math.floor(rand() * books.length);
        const b = books[idx];
        if (picked.some(p => String(p._id) === String(b._id))) continue;
        picked.push(b);
      }
      picked.forEach(b => track.appendChild(card(b.title, b.author)));
      note.textContent = "Three random-ish picks of the week. Blame math if you hate them.";
    } catch (e) {
      note.textContent = "Could not load books. Server issues or the universe is punishing you.";
    }
  }

  if (btn) btn.addEventListener("click", load);
  load();
})();