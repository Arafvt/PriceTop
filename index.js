document.querySelector("[data-year]").textContent = new Date().getFullYear();

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

function clearHashAndScrollTop() {
  try {
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  } catch (err) {
  }
  window.scrollTo(0, 0);
}

window.addEventListener('load', clearHashAndScrollTop);
window.addEventListener('pageshow', (e) => { if (e.persisted) clearHashAndScrollTop(); });

const burger = document.querySelector("[data-burger]");
const mobile = document.querySelector("[data-mobile]");
const toggleMobile = () => {
  const open = mobile.classList.toggle("mobile--open");
  burger.classList.toggle("burger--open", open);
  document.body.classList.toggle("no-scroll", open);
};
burger?.addEventListener("click", toggleMobile);
mobile?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
  if (mobile.classList.contains("mobile--open")) toggleMobile();
}));

const reveal = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add("reveal--in");
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll("[data-tilt], .section__head, .facts, .cta").forEach((el) => {
  el.classList.add("reveal");
  reveal.observe(el);
});
// Removed JS-driven tilt/parallax. Subtle hover scale is handled in CSS now.

(function () {
  const viewport = document.querySelector("[data-slider]");
  if (!viewport) return;

  const cards = Array.from(viewport.querySelectorAll("[data-card]"));
  const prev = document.querySelector(".tSlider__nav--prev");
  const next = document.querySelector(".tSlider__nav--next");

  function scrollToIndex(i) {
    const card = cards[Math.max(0, Math.min(cards.length - 1, i))];
    if (!card) return;
    card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  function updateActive() {
    const vpRect = viewport.getBoundingClientRect();
    const vpCenter = vpRect.left + vpRect.width / 2;

    let best = { idx: 0, dist: Infinity };
    cards.forEach((card, idx) => {
      const r = card.getBoundingClientRect();
      const c = r.left + r.width / 2;
      const dist = Math.abs(c - vpCenter);
      if (dist < best.dist) best = { idx, dist };
    });

    cards.forEach((c, idx) => c.classList.toggle("is-active", idx === best.idx));
    viewport.dataset.activeIndex = String(best.idx);
  }

  prev?.addEventListener("click", () => {
    const cur = Number(viewport.dataset.activeIndex || "0");
    scrollToIndex(cur - 1);
  });
  next?.addEventListener("click", () => {
    const cur = Number(viewport.dataset.activeIndex || "0");
    scrollToIndex(cur + 1);
  });

  let isDown = false;
  let startX = 0;
  let startScroll = 0;

  viewport.addEventListener("mousedown", (e) => {
    isDown = true;
    startX = e.pageX;
    startScroll = viewport.scrollLeft;
    viewport.style.cursor = "grabbing";
  });
  window.addEventListener("mouseup", () => {
    isDown = false;
    viewport.style.cursor = "";
  });
  window.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    const dx = e.pageX - startX;
    viewport.scrollLeft = startScroll - dx;
  });

  viewport.addEventListener("scroll", () => requestAnimationFrame(updateActive), { passive: true });
  window.addEventListener("resize", () => requestAnimationFrame(updateActive));

  requestAnimationFrame(() => {
    updateActive();
  });
})();
