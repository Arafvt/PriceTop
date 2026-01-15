document.querySelector("[data-year]").textContent = new Date().getFullYear();

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

const canHover = matchMedia("(hover:hover) and (pointer:fine)").matches;
if (canHover) {
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    let raf = null;
    const reset = () => {
      card.style.transform = "";
      card.style.setProperty("--mx", "0px");
      card.style.setProperty("--my", "0px");
    };

    const onMove = (ev) => {
      const r = card.getBoundingClientRect();
      const px = (ev.clientX - r.left) / r.width;
      const py = (ev.clientY - r.top) / r.height;
      const rx = (py - 0.5) * -8;
      const ry = (px - 0.5) * 10;
      const mx = (px - 0.5) * 18;
      const my = (py - 0.5) * 18;

      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translate3d(${mx}px, ${my}px, 0)`;
        card.style.setProperty("--mx", `${mx}px`);
        card.style.setProperty("--my", `${my}px`);
      });
    };

    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", reset);
  });
}

const par = document.querySelector("[data-parallax]");
if (canHover && par) {
  window.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 16;
    const y = (e.clientY / window.innerHeight - 0.5) * 12;
    par.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  });
}

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
    scrollToIndex(0);
  });
})();
