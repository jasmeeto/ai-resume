const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

function formatMonth(yyyyMm) {
  const [y, m] = yyyyMm.split("-");
  return `${MONTHS[parseInt(m, 10) - 1]} ${y}`;
}

function dateRange(start, end) {
  const startLabel = start ? formatMonth(start) : "";
  const endLabel = end ? formatMonth(end) : "Present";
  return `${startLabel} - ${endLabel}`;
}

function renderContact(basics) {
  const items = [];
  if (basics.url) {
    items.push(`<a href="${escapeHtml(basics.url)}">${escapeHtml(basics.url.replace(/^https?:\/\//, ""))}</a>`);
  }
  for (const profile of basics.profiles || []) {
    const label = profile.username ? `${profile.network}/${profile.username}` : profile.network;
    items.push(`<a href="${escapeHtml(profile.url)}">${escapeHtml(label)}</a>`);
  }
  if (basics.email) {
    items.push(`<a href="mailto:${escapeHtml(basics.email)}">${escapeHtml(basics.email)}</a>`);
  }
  if (basics.phone) {
    items.push(escapeHtml(basics.phone));
  }
  return items.join('<span class="sep">&bull;</span>');
}

function renderSkills(skills = []) {
  if (!skills.length) return "";
  const items = skills
    .map(
      (s) =>
        `<li><span class="category">${escapeHtml(s.category)}:</span> ${escapeHtml((s.keywords || []).join(", "))}</li>`
    )
    .join("");
  return `
    <section id="skills">
      <h2>Skills Summary</h2>
      <ul class="skills-list">${items}</ul>
    </section>
  `;
}

function renderWork(work = []) {
  if (!work.length) return "";
  const items = work
    .map(
      (job) => `
      <div class="entry">
        <div class="entry-header">
          <span class="org">${escapeHtml(job.name)}</span>
          <span class="location">${escapeHtml(job.location || "")}</span>
        </div>
        <div class="entry-subheader">
          <span class="position">${escapeHtml(job.position)}</span>
          <span class="dates">${dateRange(job.startDate, job.endDate)}</span>
        </div>
        ${
          job.highlights && job.highlights.length
            ? `<ul class="highlights">${job.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join("")}</ul>`
            : ""
        }
        ${
          job.keywords && job.keywords.length
            ? `<div class="keywords">Tools/Frameworks Used: ${escapeHtml(job.keywords.join(", "))}</div>`
            : ""
        }
      </div>
    `
    )
    .join("");
  return `
    <section id="experience">
      <h2>Experience</h2>
      ${items}
    </section>
  `;
}

function renderProjects(projects = [], projectsUrl) {
  if (!projects.length) return "";
  const items = projects
    .map(
      (p) => `
      <div class="project-item">
        ${p.url ? `<a class="name" href="${escapeHtml(p.url)}">${escapeHtml(p.name)}</a>` : `<span class="name">${escapeHtml(p.name)}</span>`}: ${escapeHtml(p.description)}
      </div>
    `
    )
    .join("");
  return `
    <section id="projects">
      <h2>Personal Projects</h2>
      ${projectsUrl ? `<div class="projects-intro"><a href="${escapeHtml(projectsUrl)}">${escapeHtml(projectsUrl)}</a></div>` : ""}
      ${items}
    </section>
  `;
}

function renderEducation(education = []) {
  if (!education.length) return "";
  const items = education
    .map(
      (school) => `
      <div class="entry">
        <div class="entry-header">
          <span class="org">${escapeHtml(school.institution)}</span>
          <span class="location">${escapeHtml(school.location || "")}</span>
        </div>
        <div class="entry-subheader">
          <span class="position">${escapeHtml(school.studyType)}</span>
          <span class="dates">${dateRange(school.startDate, school.endDate)}</span>
        </div>
        ${
          school.courses && school.courses.length
            ? `<div class="courses"><span class="label">Relevant Courses:</span> ${escapeHtml(school.courses.join(", "))}</div>`
            : ""
        }
      </div>
    `
    )
    .join("");
  return `
    <section id="education">
      <h2>Education</h2>
      ${items}
    </section>
  `;
}

function render(data) {
  const root = document.getElementById("resume");
  const basics = data.basics || {};
  root.innerHTML = `
    <div class="header">
      <h1>${escapeHtml(basics.name || "")}</h1>
      ${basics.label ? `<div class="label">${escapeHtml(basics.label)}</div>` : ""}
      <div class="contact">${renderContact(basics)}</div>
    </div>
    ${renderSkills(data.skills)}
    ${renderWork(data.work)}
    ${renderProjects(data.projects, data.projectsUrl)}
    ${renderEducation(data.education)}
  `;
  document.title = `Resume - ${basics.name || ""}`;
}

async function init() {
  try {
    const res = await fetch("resume.json");
    if (!res.ok) throw new Error(`Failed to load resume.json: ${res.status}`);
    const data = await res.json();
    render(data);
  } catch (err) {
    document.getElementById("resume").innerHTML = `
      <p style="color:#a00">Could not load resume.json (${escapeHtml(err.message)}).
      If you opened this file directly (file://), serve it over HTTP instead,
      e.g. <code>npx serve .</code> or <code>python3 -m http.server</code>, then open the printed URL.</p>
    `;
  }
}

init();
