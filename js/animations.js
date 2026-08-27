/**
 * animations.js — everything that moves in the DOM: masked heading reveals,
 * scroll-triggered fades, the timeline draw, stat counters and nav state.
 */

import { view } from "./scroll.js";

const { gsap, ScrollTrigger } = window;

const lines = (el) => Array.from(el.querySelectorAll(".line-mask > span"));

/* ------------------------------------------------------------- headings */

function initSplitHeadings() {
  gsap.utils.toArray("[data-split]").forEach((heading) => {
    const parts = lines(heading);
    if (!parts.length) return;

    gsap.set(parts, { yPercent: 108 });

    // The hero heading is driven by the intro timeline instead.
    if (heading.closest("#hero")) return;

    gsap.to(parts, {
      yPercent: 0,
      duration: 1.05,
      ease: "power4.out",
      stagger: 0.07,
      // clamp() keeps the start inside the scrollable range, so elements that
      // sit near the very bottom of the page still fire.
      scrollTrigger: { trigger: heading, start: "clamp(top 88%)", once: true }
    });
  });
}

/* -------------------------------------------------------------- reveals */

/**
 * Uses an IntersectionObserver rather than ScrollTrigger so that elements
 * pinned near the document end — which never travel far up the viewport —
 * still reveal. Entries are grouped into a short window so neighbours
 * animate as a stagger instead of one at a time.
 */
function initReveals() {
  const items = gsap.utils.toArray("[data-reveal]").filter((el) => !el.closest("#hero"));

  let queue = [];
  let flushTimer;

  const observer = new IntersectionObserver(
    (entries) => {
      const entered = entries.filter((entry) => entry.isIntersecting).map((entry) => entry.target);
      if (!entered.length) return;

      entered.forEach((el) => observer.unobserve(el));
      queue.push(...entered);

      clearTimeout(flushTimer);
      flushTimer = setTimeout(() => {
        gsap.to(queue, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.09,
          overwrite: true
        });
        queue = [];
      }, 70);
    },
    { rootMargin: "0px 0px -50px 0px", threshold: 0.01 }
  );

  items.forEach((el) => observer.observe(el));
}

/* ------------------------------------------------------------- timeline */

function initTimelineRail() {
  const fill = document.querySelector(".timeline__rail i");
  if (!fill) return;

  gsap.fromTo(
    fill,
    { scaleY: 0 },
    {
      scaleY: 1,
      ease: "none",
      scrollTrigger: {
        trigger: ".timeline",
        start: "top 72%",
        end: "bottom 72%",
        scrub: 0.6
      }
    }
  );
}

/* ------------------------------------------------------------- counters */

function initCounters() {
  gsap.utils.toArray("[data-count]").forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals, 10) || 0;
    const proxy = { value: 0 };

    gsap.to(proxy, {
      value: target,
      duration: 1.8,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "clamp(top 92%)", once: true },
      onUpdate: () => {
        el.textContent = proxy.value.toFixed(decimals);
      }
    });
  });
}

/* ------------------------------------------------------- project cursor */

function initCardGlow() {
  if (window.matchMedia("(pointer: coarse)").matches) return;

  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener(
      "pointermove",
      (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        card.style.setProperty("--my", `${event.clientY - rect.top}px`);
      },
      { passive: true }
    );
  });
}

/* ------------------------------------------------------------------ nav */

function initNav() {
  const nav = document.getElementById("nav");
  const links = Array.from(document.querySelectorAll(".nav__link"));

  ScrollTrigger.create({
    start: "top -60",
    end: 99999,
    onUpdate: (self) => nav.classList.toggle("is-stuck", self.scroll() > 60)
  });

  document.querySelectorAll("[data-stage]").forEach((section) => {
    const link = links.find((a) => a.getAttribute("href") === `#${section.id}`);
    if (!link) return;

    const activate = () => {
      links.forEach((a) => a.classList.remove("is-active"));
      link.classList.add("is-active");
    };

    ScrollTrigger.create({
      trigger: section,
      start: "top 60%",
      end: "bottom 40%",
      onEnter: activate,
      onEnterBack: activate
    });
  });
}

/* ------------------------------------------------------- progress bar */

function initProgressBar() {
  const fill = document.getElementById("scrollbarFill");
  if (!fill) return;

  const set = gsap.quickSetter(fill, "scaleX");
  gsap.ticker.add(() => set(view.progress));
}

/* ------------------------------------------------------------- preload */

export function playIntro() {
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  const heroLines = lines(document.querySelector("#hero [data-split]") ?? document.createElement("div"));
  const heroBits = gsap.utils.toArray("#hero [data-reveal]");

  tl.to("#preloaderBar", { scaleX: 1, duration: 0.55, ease: "power2.inOut" })
    .to("#preloaderLabel", { textContent: "Ready", duration: 0.01 }, ">-0.1")
    .to("#preloader", {
      opacity: 0,
      duration: 0.7,
      ease: "power2.inOut",
      onComplete: () => {
        document.getElementById("preloader")?.remove();
        document.body.classList.remove("is-loading");
        ScrollTrigger.refresh();
      }
    })
    .add("reveal", "-=0.35")
    .to("#webgl", { duration: 0.01, onStart: () => document.getElementById("webgl")?.classList.add("is-ready") }, "reveal")
    .to(heroLines, { yPercent: 0, duration: 1.15, stagger: 0.08 }, "reveal")
    .to(heroBits, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, "reveal+=0.25")
    .from(".nav > *", { opacity: 0, y: -12, duration: 0.7, stagger: 0.08 }, "reveal+=0.1");

  return tl;
}

export function initAnimations() {
  if (view.reducedMotion) {
    document.body.classList.add("no-motion");
    gsap.set("[data-reveal]", { opacity: 1, y: 0 });
    gsap.set(".line-mask > span", { yPercent: 0 });
    initCardGlow();
    initNav();
    initProgressBar();
    return;
  }

  initSplitHeadings();
  initReveals();
  initTimelineRail();
  initCounters();
  initCardGlow();
  initNav();
  initProgressBar();
}
