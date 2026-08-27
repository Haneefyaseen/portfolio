/**
 * main.js — entry point. Renders content, wires scrolling and animation,
 * then loads the 3D layer only when the device can actually use it.
 */

import { renderAll } from "./render.js";
import { initScroll, view } from "./scroll.js";
import { initAnimations, playIntro } from "./animations.js";

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (canvas.getContext("webgl2") || canvas.getContext("webgl")));
  } catch {
    return false;
  }
}

/** Shows the finished page with no animation at all. Used if a CDN fails. */
function fallback() {
  document.body.classList.add("no-motion", "no-webgl");
  document.body.classList.remove("is-loading");
  document.getElementById("preloader")?.remove();
  document.getElementById("webgl")?.remove();
}

async function mountScene() {
  const canvas = document.getElementById("webgl");
  if (!canvas) return;

  const reducedMotion = view.reducedMotion;

  if (!hasWebGL() || reducedMotion) {
    canvas.remove();
    document.body.classList.add("no-webgl");
    return;
  }

  try {
    const { initScene } = await import("./scene.js");
    initScene(canvas);
  } catch (error) {
    console.warn("3D scene unavailable, continuing without it.", error);
    canvas.remove();
    document.body.classList.add("no-webgl");
  }
}

function boot() {
  // Tells the inline failsafe in index.html to stand down.
  window.__portfolioBooted = true;

  renderAll();

  if (!window.gsap || !window.ScrollTrigger) {
    console.warn("GSAP failed to load; rendering the static page.");
    fallback();
    return;
  }

  initScroll();
  initAnimations();
  mountScene();
  playIntro();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
