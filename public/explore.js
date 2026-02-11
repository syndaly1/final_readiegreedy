(() => {
  const carousels = document.querySelectorAll(".carousel");

  carousels.forEach((c) => {
    const track = c.querySelector("[data-track]");
    const left = c.querySelector(".car-btn.left");
    const right = c.querySelector(".car-btn.right");
    if (!track || !left || !right) return;

    const scrollAmount = () => Math.max(260, Math.floor(track.clientWidth * 0.8));

    left.addEventListener("click", () => {
      track.scrollBy({ left: -scrollAmount(), behavior: "smooth" });
    });

    right.addEventListener("click", () => {
      track.scrollBy({ left: scrollAmount(), behavior: "smooth" });
    });
  });

  document.querySelectorAll('a[aria-disabled="true"]').forEach(a => {
    a.addEventListener("click", (e) => e.preventDefault());
  });
  document.querySelectorAll('form[action="#"]').forEach(f => {
    f.addEventListener("submit", (e) => e.preventDefault());
  });
})();
