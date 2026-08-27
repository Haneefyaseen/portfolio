/**
 * render.js — turns the objects in data.js into DOM.
 * Every section body is built here so content edits stay in one file.
 */

import { profile, sections } from "./data.js";

const esc = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const ARROW = `<svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M3.2 8.8 8.8 3.2M8.8 3.2H4.4M8.8 3.2v4.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const slot = (name) => document.querySelector(`[data-content="${name}"]`);

/** Splits a title on newlines into individually maskable lines. */
const titleLines = (title) =>
  title
    .split("\n")
    .map((line) => `<span class="line-mask"><span>${esc(line)}</span></span>`)
    .join("");

const sectionHead = (id) => {
  const meta = sections.find((s) => s.id === id);
  if (!meta || !meta.title) return "";
  return `
    <header class="head" data-reveal>
      <p class="mono head__eyebrow"><span class="head__num">${esc(meta.num)}</span> ${esc(meta.eyebrow)}</p>
      <h2 class="h-section" data-split>${titleLines(meta.title)}</h2>
    </header>`;
};

const tagList = (tags = []) =>
  tags.length ? `<ul class="tags">${tags.map((t) => `<li class="tag">${esc(t)}</li>`).join("")}</ul>` : "";

/* ---------------------------------------------------------------- nav */

function renderNav() {
  const host = document.getElementById("navLinks");
  host.innerHTML = sections
    .filter((s) => s.id !== "hero")
    .map((s) => `<a class="nav__link" href="#${s.id}" data-nav-link>${esc(s.nav)}</a>`)
    .join("");
}

/* --------------------------------------------------------------- hero */

function renderHero() {
  const nameParts = profile.name.split(" ");
  const words = nameParts
    .map(
      (word, i) =>
        `<span class="line-mask"><span>${esc(word)}${
          i === nameParts.length - 1 ? '<span class="accent">.</span>' : ""
        }</span></span>`
    )
    .join(" ");

  const roles = profile.roles
    .map((role) => `<span class="hero__role">${esc(role)}</span>`)
    .join('<span class="hero__role hero__role--sep">/</span>');

  slot("hero").innerHTML = `
    <div class="hero">
      <p class="mono hero__eyebrow" data-reveal>
        <span class="hero__pulse"></span>
        ${esc(profile.available)} &nbsp;&middot;&nbsp; ${esc(profile.location)}
      </p>

      <h1 class="h-display hero__title" data-split>${words}</h1>

      <div class="hero__roles" data-reveal>${roles}</div>

      <p class="lede hero__lede" data-reveal>${esc(profile.lede)}</p>

      <div class="hero__actions" data-reveal>
        <a class="btn btn--primary" href="#projects">See the work</a>
        <a class="btn btn--ghost" href="${esc(profile.links.linkedin)}" target="_blank" rel="noopener noreferrer">
          LinkedIn <span class="btn__arrow">${ARROW}</span>
        </a>
      </div>
    </div>

    <div class="hero__scroll mono" aria-hidden="true">
      <span class="hero__scroll-line"></span> Scroll
    </div>`;
}

/* -------------------------------------------------------------- about */

function renderAbout() {
  const paragraphs = profile.about.map((p) => `<p>${p}</p>`).join("");

  const stats = profile.stats
    .map(
      (stat) => `
      <div class="stat">
        <p class="stat__value">
          <span data-count="${stat.value}" data-decimals="${stat.decimals}">0</span><span class="stat__suffix">${esc(
        stat.suffix
      )}</span>
        </p>
        <p class="mono stat__label">${esc(stat.label)}</p>
      </div>`
    )
    .join("");

  slot("about").innerHTML = `
    ${sectionHead("about")}
    <div class="about">
      <div class="about__body" data-reveal>${paragraphs}</div>
      <div class="stats" data-reveal>${stats}</div>
    </div>`;
}

/* --------------------------------------------------------- experience */

function renderExperience() {
  const roles = profile.experience
    .map(
      (role) => `
      <article class="role" data-reveal>
        <div class="role__meta">
          <p class="mono role__period">${esc(role.period)}</p>
          <p class="role__location">${esc(role.location)}</p>
        </div>
        <div class="role__main">
          <h3 class="role__title">
            ${esc(role.title)}
            ${role.alias ? `<span class="role__alias">/ ${esc(role.alias)}</span>` : ""}
            <span class="role__org">@ ${esc(role.org)}</span>
            ${role.current ? '<span class="role__badge">Current</span>' : ""}
          </h3>
          <ul class="role__points">
            ${role.points.map((point) => `<li>${esc(point)}</li>`).join("")}
          </ul>
          ${tagList(role.tags)}
        </div>
      </article>`
    )
    .join("");

  slot("experience").innerHTML = `
    ${sectionHead("experience")}
    <div class="timeline">
      <span class="timeline__rail" aria-hidden="true"><i></i></span>
      ${roles}
    </div>`;
}

/* ------------------------------------------------------------- skills */

function renderSkills() {
  const sets = profile.skills
    .map(
      (set, i) => `
      <article class="skillset" data-reveal>
        <div class="skillset__head">
          <p class="mono skillset__num">${String(i + 1).padStart(2, "0")}</p>
          <h3 class="skillset__title">${esc(set.title)}</h3>
        </div>
        <ul class="skillset__list">
          ${set.items.map((item) => `<li>${esc(item)}</li>`).join("")}
        </ul>
      </article>`
    )
    .join("");

  slot("skills").innerHTML = `
    ${sectionHead("skills")}
    <div class="skills">${sets}</div>`;
}

/* ----------------------------------------------------------- projects */

function renderProjects() {
  const cards = profile.projects
    .map(
      (project, i) => `
      <article class="project" data-reveal data-tilt>
        <div class="project__top">
          <p class="mono project__index">${String(i + 1).padStart(2, "0")}</p>
          ${
            project.live
              ? `<p class="project__live"><span class="project__live-dot"></span> Live</p>`
              : `<p class="mono project__index">Source</p>`
          }
        </div>

        <h3 class="project__title">${esc(project.name)}</h3>
        <p class="project__desc">${esc(project.description)}</p>
        ${tagList(project.tags)}

        <div class="project__links">
          ${
            project.live
              ? `<a class="project__link" href="${esc(
                  project.live
                )}" target="_blank" rel="noopener noreferrer">Visit ${ARROW}</a>`
              : ""
          }
          <a class="project__link" href="${esc(
            project.source
          )}" target="_blank" rel="noopener noreferrer">GitHub ${ARROW}</a>
        </div>
      </article>`
    )
    .join("");

  slot("projects").innerHTML = `
    ${sectionHead("projects")}
    <div class="projects">${cards}</div>`;
}

/* ------------------------------------------------------------ venture */

function renderVenture() {
  const { venture } = profile;

  const points = venture.points
    .map(
      (point) => `
      <div class="venture__point">
        <dt>${esc(point.term)}</dt>
        <dd>${esc(point.detail)}</dd>
      </div>`
    )
    .join("");

  slot("venture").innerHTML = `
    ${sectionHead("venture")}
    <div class="venture" data-reveal>
      <div class="venture__body">
        <p class="mono head__num">${esc(venture.role)} &nbsp;&middot;&nbsp; ${esc(venture.since)}</p>
        <h3 class="venture__name">${esc(venture.name)}</h3>
        <p class="venture__desc">${esc(venture.description)}</p>
        <div>
          <a class="btn btn--ghost" href="${esc(
            venture.href
          )}" target="_blank" rel="noopener noreferrer">Visit Stocks Way <span class="btn__arrow">${ARROW}</span></a>
        </div>
      </div>
      <dl class="venture__points">${points}</dl>
    </div>`;
}

/* ---------------------------------------------------------- education */

function renderEducation() {
  const items = profile.education
    .map(
      (edu) => `
      <article class="edu" data-reveal>
        <p class="mono edu__period">${esc(edu.period)}</p>
        <div class="edu__main">
          <h3 class="edu__degree">${esc(edu.degree)}</h3>
          <p class="edu__org">${esc(edu.org)}</p>
        </div>
        <p class="edu__score">${esc(edu.score)}</p>
      </article>`
    )
    .join("");

  slot("education").innerHTML = `
    ${sectionHead("education")}
    <div class="education">${items}</div>`;
}

/* ------------------------------------------------------------ contact */

function renderContact() {
  const { contact, links } = profile;

  const channels = [
    { label: "LinkedIn", value: "in/mohamed-haneef-yaseen", href: links.linkedin },
    { label: "GitHub", value: "@Haneefyaseen", href: links.github },
    { label: "X", value: "@haneef12", href: links.x }
  ];

  if (contact.email) {
    channels.unshift({ label: "Email", value: contact.email, href: `mailto:${contact.email}` });
  } else {
    channels.push({ label: "Based in", value: profile.location, href: null });
  }

  const channelMarkup = channels
    .map((channel) => {
      const inner = `
        <p class="mono channel__label">${esc(channel.label)}</p>
        <p class="channel__value">${esc(channel.value)}${channel.href ? ARROW : ""}</p>`;
      return channel.href
        ? `<a class="channel" href="${esc(channel.href)}"${
            channel.href.startsWith("http") ? ' target="_blank" rel="noopener noreferrer"' : ""
          }>${inner}</a>`
        : `<div class="channel">${inner}</div>`;
    })
    .join("");

  const primary = contact.email ? `mailto:${contact.email}` : links.linkedin;

  slot("contact").innerHTML = `
    <div class="contact">
      <p class="mono head__eyebrow" data-reveal><span class="head__num">07</span> Contact</p>

      <h2 class="contact__title gradient-text" data-reveal>${esc(contact.title)}</h2>
      <p class="lede contact__lede" data-reveal>${esc(contact.lede)}</p>

      <div class="contact__actions" data-reveal>
        <a class="btn btn--primary" href="${esc(primary)}"${
    primary.startsWith("http") ? ' target="_blank" rel="noopener noreferrer"' : ""
  }>${contact.email ? "Send an email" : "Message me on LinkedIn"}</a>
        <a class="btn btn--ghost" href="${esc(
          links.github
        )}" target="_blank" rel="noopener noreferrer">Browse GitHub <span class="btn__arrow">${ARROW}</span></a>
      </div>

      <div class="channels" data-reveal>${channelMarkup}</div>

      <div class="mono colophon" data-reveal>
        <span>&copy; ${new Date().getFullYear()} ${esc(profile.name)}</span>
        <span class="colophon__stack">
          <span class="colophon__dot"></span> Three.js &middot; GSAP &middot; Lenis
        </span>
      </div>
    </div>`;
}

export function renderAll() {
  renderNav();
  renderHero();
  renderAbout();
  renderExperience();
  renderSkills();
  renderProjects();
  renderVenture();
  renderEducation();
  renderContact();
}
