/**
 * scroll.js — Lenis smooth scrolling wired into GSAP's ticker, plus the
 * shared, frame-eased state object that the 3D scene reads from.
 */

const { gsap, ScrollTrigger } = window;

/** Shared state. Everything else reads this rather than touching scroll directly. */
export const view = {
  /** Eased 0..1 progress through the whole document. */
  progress: 0,
  progressTarget: 0,
  /** Signed scroll velocity, normalised and decaying. */
  velocity: 0,
  /** Index of the section currently in view. */
  stage: 0,
  /** Pointer position in -1..1, eased. */
  pointerX: 0,
  pointerY: 0,
  pointerTargetX: 0,
  pointerTargetY: 0,
  reducedMotion: false,
  sectionCount: 1
};

let lenis = null;
const stageListeners = new Set();

export const onStageChange = (fn) => stageListeners.add(fn);

function setStage(index) {
  if (view.stage === index) return;
  view.stage = index;
  stageListeners.forEach((fn) => fn(index));
}

export function scrollTo(target) {
  if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.2 });
  else document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
}

export function initScroll() {
  view.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  gsap.registerPlugin(ScrollTrigger);

  if (!view.reducedMotion) {
    // The UMD bundle exposes either the constructor or a module namespace.
    const Lenis = window.Lenis?.default ?? window.Lenis;

    if (typeof Lenis === "function") {
      lenis = new Lenis({
        duration: 1.05,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.6
      });

      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }

  const sections = Array.from(document.querySelectorAll("[data-stage]"));
  view.sectionCount = sections.length;

  sections.forEach((section, index) => {
    ScrollTrigger.create({
      trigger: section,
      start: "top 60%",
      end: "bottom 40%",
      onEnter: () => setStage(index),
      onEnterBack: () => setStage(index)
    });
  });

  // Document progress, scrubbed so it survives fast flings and anchor jumps.
  ScrollTrigger.create({
    trigger: document.documentElement,
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => {
      view.progressTarget = self.progress;
      view.velocity = gsap.utils.clamp(-1, 1, self.getVelocity() / 4000);
    }
  });

  window.addEventListener(
    "pointermove",
    (event) => {
      view.pointerTargetX = (event.clientX / window.innerWidth) * 2 - 1;
      view.pointerTargetY = (event.clientY / window.innerHeight) * 2 - 1;
    },
    { passive: true }
  );

  // Anchor links route through Lenis so they inherit the same easing.
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute("href");
    if (!id || id === "#" || !document.querySelector(id)) return;
    event.preventDefault();
    scrollTo(id);
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
  if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
}

/** Called once per frame from the render loop to ease the shared values. */
export function updateView(delta) {
  const k = view.reducedMotion ? 1 : 1 - Math.pow(0.0015, delta);

  view.progress += (view.progressTarget - view.progress) * k;
  view.pointerX += (view.pointerTargetX - view.pointerX) * k;
  view.pointerY += (view.pointerTargetY - view.pointerY) * k;
  view.velocity *= 1 - Math.min(1, delta * 4);
}
