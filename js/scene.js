/**
 * scene.js — renderer, camera, lighting, bloom and the single RAF loop.
 * The loop eases the shared scroll state, then hands it to every object.
 */

import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

import { Cluster, ParticleField } from "./objects.js";
import { view, updateView, onStageChange } from "./scroll.js";

/** Coarse capability tiers so phones do less work. */
function detectQuality() {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 820;
  const weak = (navigator.hardwareConcurrency || 8) <= 4;
  const hi = !(coarse && narrow) && !weak;

  return { hi, bloom: hi, dpr: hi ? 2 : 1.5 };
}

export function initScene(canvas) {
  const quality = detectQuality();

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: quality.hi,
    alpha: true,
    powerPreference: "high-performance"
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality.dpr));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05060a, 0.026);

  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 120);
  camera.position.set(0, 0, 8.4);

  /* ---------------------------------------------------------- lights */

  scene.add(new THREE.AmbientLight(0x334466, 1.15));

  const key = new THREE.DirectionalLight(0xffffff, 1.9);
  key.position.set(5, 8, 6);
  scene.add(key);

  const cyan = new THREE.PointLight(0x22e3ff, 45, 34, 2);
  cyan.position.set(-4.5, 1.8, 3.2);
  scene.add(cyan);

  const violet = new THREE.PointLight(0x7c5cff, 45, 34, 2);
  violet.position.set(5, -2.4, -1.8);
  scene.add(violet);

  /* ---------------------------------------------------------- objects */

  const cluster = new Cluster(quality);
  const particles = new ParticleField(quality);
  scene.add(cluster.group, particles.points);

  onStageChange((index) => cluster.setStage(index));

  /* -------------------------------------------------- post-processing */

  let composer = null;

  if (quality.bloom) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.48, // strength
      0.7, // radius
      0.68 // threshold
    );
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  }

  /* --------------------------------------------------------- layout */

  /**
   * Keeps the cluster clear of the text column: far right on wide screens,
   * pushed well back on phones where content spans the full width.
   */
  function layoutCluster() {
    const w = window.innerWidth;

    if (w >= 1440) {
      cluster.group.position.set(3.9, 0, -0.6);
      cluster.group.scale.setScalar(0.92);
    } else if (w >= 1180) {
      cluster.group.position.set(3.5, 0, -1.4);
      cluster.group.scale.setScalar(0.84);
    } else if (w >= 860) {
      cluster.group.position.set(2.8, 0, -2.4);
      cluster.group.scale.setScalar(0.74);
    } else {
      cluster.group.position.set(0, 0.3, -6);
      cluster.group.scale.setScalar(0.62);
    }
  }
  layoutCluster();

  let resizeTimer;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality.dpr));
      renderer.setSize(w, h);
      composer?.setSize(w, h);
      layoutCluster();
    }, 140);
  }
  window.addEventListener("resize", onResize, { passive: true });

  /* ----------------------------------------------------------- loop */

  const lookAt = new THREE.Vector3();
  let running = true;
  let frameId = 0;
  let last = performance.now();
  let time = 0;

  function frame() {
    frameId = requestAnimationFrame(frame);
    if (!running) return;

    const now = performance.now();
    // Clamped so a stalled tab does not produce one enormous step.
    const delta = Math.min((now - last) / 1000, 0.05);
    last = now;
    time += delta;

    updateView(delta);

    // Camera drifts down and pulls back through the middle of the page.
    camera.position.x = view.pointerX * 0.55;
    camera.position.y = -view.progress * 1.35 - view.pointerY * 0.4;
    camera.position.z = 8.4 - Math.sin(view.progress * Math.PI) * 1.4;

    // Only a slight bias toward the cluster, so it stays out of the text column.
    lookAt.set(cluster.group.position.x * 0.12, cluster.group.position.y - view.progress * 0.8, 0);
    camera.lookAt(lookAt);

    cluster.update(delta, time, view);
    particles.update(delta, time, view);

    cyan.intensity = 45 + Math.sin(time * 0.8) * 8;
    violet.intensity = 45 + Math.cos(time * 0.6) * 8;

    if (composer) composer.render();
    else renderer.render(scene, camera);
  }

  frame();

  // Stop burning frames when the tab is in the background.
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) last = performance.now();
  });

  return {
    quality,
    dispose() {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      cluster.dispose();
      particles.dispose();
      composer?.dispose();
      renderer.dispose();
    }
  };
}
