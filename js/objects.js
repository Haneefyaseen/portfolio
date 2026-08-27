/**
 * objects.js — the geometry that lives in the scene.
 *
 * Cluster       a central solid + wireframe pair that crossfades to a new
 *               shape on every section change, orbited by an InstancedMesh
 *               whose instances fly between per-section layouts.
 * ParticleField a drifting point cloud that parallaxes against scroll.
 */

import * as THREE from "three";

const { gsap } = window;

/** One entry per section, in document order. */
const STAGES = [
  { geometry: (q) => new THREE.IcosahedronGeometry(1.5, 0), layout: "sphere", color: 0x22e3ff },
  { geometry: (q) => new THREE.TorusKnotGeometry(0.92, 0.32, q.hi ? 128 : 80, q.hi ? 12 : 8), layout: "ring", color: 0x38d8ff },
  { geometry: () => new THREE.OctahedronGeometry(1.55, 0), layout: "stack", color: 0x5cc0ff },
  { geometry: () => new THREE.DodecahedronGeometry(1.35, 0), layout: "orbit", color: 0x7c9cff },
  { geometry: () => new THREE.BoxGeometry(1.85, 1.85, 1.85, 2, 2, 2), layout: "grid", color: 0x8c7cff },
  { geometry: (q) => new THREE.TorusGeometry(1.2, 0.36, q.hi ? 14 : 10, q.hi ? 72 : 40), layout: "helix", color: 0x9a6cff },
  { geometry: (q) => new THREE.IcosahedronGeometry(1.5, q.hi ? 1 : 0), layout: "arc", color: 0x6f8cff },
  { geometry: () => new THREE.IcosahedronGeometry(1.55, 0), layout: "scatter", color: 0x22e3ff }
];

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/* ------------------------------------------------------------------ */
/* Orbiter layouts                                                      */
/* ------------------------------------------------------------------ */

/**
 * Each layout fills `positions` (xyz triples) and `scales` for `count`
 * instances. Instances a layout does not use get scale 0 and are parked
 * at the origin, so they fold away instead of popping.
 */
const LAYOUTS = {
  sphere(count, pos, scl) {
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const radius = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = GOLDEN_ANGLE * i;
      pos[i * 3] = Math.cos(theta) * radius * 3.35;
      pos[i * 3 + 1] = y * 3.35;
      pos[i * 3 + 2] = Math.sin(theta) * radius * 3.35;
      scl[i] = 0.075 + (i % 5) * 0.014;
    }
  },

  ring(count, pos, scl) {
    const used = Math.min(count, 26);
    for (let i = 0; i < count; i++) {
      if (i >= used) {
        scl[i] = 0;
        continue;
      }
      const angle = (i / used) * Math.PI * 2;
      pos[i * 3] = Math.cos(angle) * 3.1;
      pos[i * 3 + 1] = Math.sin(angle * 3) * 0.34;
      pos[i * 3 + 2] = Math.sin(angle) * 3.1;
      scl[i] = 0.1 + (i % 3) * 0.02;
    }
  },

  stack(count, pos, scl) {
    const used = Math.min(count, 4);
    for (let i = 0; i < count; i++) {
      if (i >= used) {
        scl[i] = 0;
        continue;
      }
      pos[i * 3] = (i % 2 === 0 ? -1 : 1) * 1.9;
      pos[i * 3 + 1] = 2.45 - i * 1.6;
      pos[i * 3 + 2] = i * -0.5;
      scl[i] = 0.34;
    }
  },

  orbit(count, pos, scl) {
    for (let i = 0; i < count; i++) {
      const inner = i % 2 === 0;
      const ringIndex = Math.floor(i / 2);
      const perRing = Math.ceil(count / 2);
      const angle = (ringIndex / perRing) * Math.PI * 2 + (inner ? 0 : 0.4);
      const radius = inner ? 2.35 : 3.75;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = (inner ? -1 : 1) * Math.sin(angle * 2) * 0.8;
      pos[i * 3 + 2] = Math.sin(angle) * radius * (inner ? 1 : 0.55);
      scl[i] = inner ? 0.09 : 0.13;
    }
  },

  grid(count, pos, scl) {
    const cols = 4;
    const rows = 4;
    const used = Math.min(count, cols * rows);
    for (let i = 0; i < count; i++) {
      if (i >= used) {
        scl[i] = 0;
        continue;
      }
      const col = i % cols;
      const row = Math.floor(i / cols);
      pos[i * 3] = (col - (cols - 1) / 2) * 1.55;
      pos[i * 3 + 1] = ((rows - 1) / 2 - row) * 1.55;
      pos[i * 3 + 2] = -0.6;
      scl[i] = 0.2;
    }
  },

  helix(count, pos, scl) {
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const angle = t * Math.PI * 6;
      pos[i * 3] = Math.cos(angle) * 2.7;
      pos[i * 3 + 1] = (t - 0.5) * 7.4;
      pos[i * 3 + 2] = Math.sin(angle) * 2.7;
      scl[i] = 0.07 + t * 0.09;
    }
  },

  arc(count, pos, scl) {
    const used = Math.min(count, 20);
    for (let i = 0; i < count; i++) {
      if (i >= used) {
        scl[i] = 0;
        continue;
      }
      const t = i / (used - 1);
      const angle = -Math.PI * 0.15 + t * Math.PI * 1.3;
      pos[i * 3] = Math.cos(angle) * 3.6;
      pos[i * 3 + 1] = Math.sin(angle) * 2.2 - 0.4;
      pos[i * 3 + 2] = Math.cos(angle * 2) * 0.7;
      scl[i] = 0.11;
    }
  },

  scatter(count, pos, scl) {
    for (let i = 0; i < count; i++) {
      const theta = GOLDEN_ANGLE * i * 1.7;
      const radius = 1.9 + ((i * 37) % 100) / 100 * 2.8;
      pos[i * 3] = Math.cos(theta) * radius;
      pos[i * 3 + 1] = (((i * 53) % 100) / 100 - 0.5) * 6.2;
      pos[i * 3 + 2] = Math.sin(theta) * radius;
      scl[i] = 0.06 + (((i * 29) % 100) / 100) * 0.07;
    }
  }
};

/* ------------------------------------------------------------------ */
/* Cluster                                                             */
/* ------------------------------------------------------------------ */

export class Cluster {
  constructor(quality) {
    this.quality = quality;
    this.group = new THREE.Group();
    this.stage = -1;
    this.color = new THREE.Color(STAGES[0].color);

    this._buildCore();
    this._buildOrbiters();

    this.setStage(0, true);
  }

  _buildCore() {
    // Two slots so a shape can fade out while its replacement fades in.
    this.slots = [0, 1].map(() => {
      const solid = new THREE.Mesh(
        undefined,
        new THREE.MeshStandardMaterial({
          color: 0x0a0e18,
          metalness: 0.62,
          roughness: 0.22,
          emissive: new THREE.Color(STAGES[0].color),
          emissiveIntensity: 0.22,
          flatShading: true,
          transparent: true,
          opacity: 0
        })
      );

      const wire = new THREE.Mesh(
        undefined,
        new THREE.MeshBasicMaterial({
          color: STAGES[0].color,
          wireframe: true,
          transparent: true,
          opacity: 0
        })
      );
      wire.scale.setScalar(1.055);

      const holder = new THREE.Group();
      holder.add(solid, wire);
      holder.visible = false;
      this.group.add(holder);

      return { holder, solid, wire, geometry: null };
    });

    this.active = 0;
  }

  _buildOrbiters() {
    this.count = this.quality.hi ? 48 : 26;

    this.orbiters = new THREE.InstancedMesh(
      new THREE.OctahedronGeometry(1, 0),
      new THREE.MeshStandardMaterial({
        color: 0x0a0e18,
        metalness: 0.5,
        roughness: 0.3,
        emissive: new THREE.Color(STAGES[0].color),
        emissiveIntensity: 0.45,
        flatShading: true
      }),
      this.count
    );
    this.orbiters.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.orbiters.frustumCulled = false;
    this.group.add(this.orbiters);

    this.pos = new Float32Array(this.count * 3);
    this.posTarget = new Float32Array(this.count * 3);
    this.scale = new Float32Array(this.count);
    this.scaleTarget = new Float32Array(this.count);
    this.seeds = new Float32Array(this.count);

    for (let i = 0; i < this.count; i++) this.seeds[i] = (i * 0.618) % 1;

    this._m4 = new THREE.Matrix4();
    this._q = new THREE.Quaternion();
    this._e = new THREE.Euler();
    this._v = new THREE.Vector3();
    this._s = new THREE.Vector3();
  }

  setStage(index, immediate = false) {
    const stage = STAGES[index % STAGES.length];
    if (!stage || index === this.stage) return;
    this.stage = index;

    /* --- swap the core shape ------------------------------------- */
    const next = this.slots[1 - this.active];
    const current = this.slots[this.active];

    next.geometry?.dispose();
    next.geometry = stage.geometry(this.quality);
    next.solid.geometry = next.geometry;
    next.wire.geometry = next.geometry;
    next.holder.visible = true;

    const color = new THREE.Color(stage.color);
    next.solid.material.emissive.copy(color);
    next.wire.material.color.copy(color);
    this.color.copy(color);

    const duration = immediate ? 0 : 1.15;

    gsap.killTweensOf([next.solid.material, next.wire.material, next.holder.scale, next.holder.rotation]);
    gsap.killTweensOf([current.solid.material, current.wire.material, current.holder.scale]);

    next.holder.scale.setScalar(0.35);
    next.holder.rotation.set(0, -1.4, 0.35);
    gsap.to(next.solid.material, { opacity: 0.88, duration, ease: "power2.out" });
    gsap.to(next.wire.material, { opacity: 0.26, duration, ease: "power2.out" });
    gsap.to(next.holder.scale, { x: 1, y: 1, z: 1, duration: duration * 1.2, ease: "elastic.out(0.7, 0.55)" });
    gsap.to(next.holder.rotation, { y: 0, z: 0, duration: duration * 1.3, ease: "power3.out" });

    if (current.geometry) {
      gsap.to(current.solid.material, { opacity: 0, duration: duration * 0.7, ease: "power2.in" });
      gsap.to(current.wire.material, {
        opacity: 0,
        duration: duration * 0.7,
        ease: "power2.in",
        onComplete: () => {
          current.holder.visible = false;
        }
      });
      gsap.to(current.holder.scale, { x: 1.5, y: 1.5, z: 1.5, duration: duration * 0.7, ease: "power2.in" });
    }

    this.active = 1 - this.active;

    /* --- retarget the orbiters ----------------------------------- */
    const layout = LAYOUTS[stage.layout] ?? LAYOUTS.sphere;
    this.posTarget.fill(0);
    this.scaleTarget.fill(0);
    layout(this.count, this.posTarget, this.scaleTarget);

    gsap.to(this.orbiters.material.emissive, {
      r: color.r,
      g: color.g,
      b: color.b,
      duration: immediate ? 0 : 1.2,
      ease: "power2.out"
    });

    if (immediate) {
      this.pos.set(this.posTarget);
      this.scale.set(this.scaleTarget);
    }
  }

  update(delta, time, view) {
    const holder = this.slots[this.active].holder;

    // Idle rotation, nudged by how fast the page is moving.
    const spin = 0.16 + Math.abs(view.velocity) * 1.4;
    holder.rotation.y += delta * spin;
    holder.rotation.x = Math.sin(time * 0.22) * 0.18 + view.pointerY * 0.14;
    holder.position.y = Math.sin(time * 0.55) * 0.14;

    // Instances chase their layout targets with a critically-damped feel.
    const k = 1 - Math.pow(0.0009, delta);

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;
      this.pos[i3] += (this.posTarget[i3] - this.pos[i3]) * k;
      this.pos[i3 + 1] += (this.posTarget[i3 + 1] - this.pos[i3 + 1]) * k;
      this.pos[i3 + 2] += (this.posTarget[i3 + 2] - this.pos[i3 + 2]) * k;
      this.scale[i] += (this.scaleTarget[i] - this.scale[i]) * k;

      const seed = this.seeds[i];
      const wobble = Math.sin(time * (0.5 + seed) + seed * 9) * 0.14;

      this._v.set(this.pos[i3], this.pos[i3 + 1] + wobble, this.pos[i3 + 2]);
      this._e.set(time * (0.24 + seed * 0.5), time * (0.3 + seed * 0.4), seed * 6.28);
      this._q.setFromEuler(this._e);
      this._s.setScalar(this.scale[i]);

      this._m4.compose(this._v, this._q, this._s);
      this.orbiters.setMatrixAt(i, this._m4);
    }

    this.orbiters.instanceMatrix.needsUpdate = true;
    this.orbiters.rotation.y = view.progress * Math.PI * 0.9 + view.pointerX * 0.12;
  }

  dispose() {
    this.slots.forEach((slot) => {
      slot.geometry?.dispose();
      slot.solid.material.dispose();
      slot.wire.material.dispose();
    });
    this.orbiters.geometry.dispose();
    this.orbiters.material.dispose();
  }
}

/* ------------------------------------------------------------------ */
/* ParticleField                                                       */
/* ------------------------------------------------------------------ */

export class ParticleField {
  constructor(quality) {
    const count = quality.hi ? 3200 : 1100;
    const positions = new Float32Array(count * 3);
    const offsets = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const radius = 6 + Math.random() * 22;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi) * 0.6;
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
      offsets[i] = Math.random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    this.points = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        color: 0x9fd8ff,
        size: quality.hi ? 0.045 : 0.07,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    this.points.frustumCulled = false;
  }

  update(delta, time, view) {
    this.points.rotation.y = time * 0.012 + view.progress * 0.55;
    this.points.rotation.x = view.pointerY * 0.05;
    this.points.position.z = view.progress * 9;
    this.points.material.opacity = 0.34 + Math.abs(view.velocity) * 0.3;
  }

  dispose() {
    this.points.geometry.dispose();
    this.points.material.dispose();
  }
}
