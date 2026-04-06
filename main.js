// Update footer year
const API_BASE_URL = "http://localhost:5001/api";

const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", () => {
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  const logo = document.getElementById("siriflix-logo");
  const intro = document.getElementById("siriflix-intro");
  const profiles = document.getElementById("profiles");

  if (logo && intro && profiles) {
    logo.addEventListener("click", (e) => {
      e.preventDefault();

      // if it's already playing, ignore extra clicks
      if (intro.classList.contains("active")) return;

      // show the full-screen SiriFlix logo
      intro.classList.add("active");

      // after 2 seconds, hide intro and scroll to profiles
      setTimeout(() => {
        intro.classList.remove("active");
        profiles.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 2000);
    });
  }
});

function getSessionId() {
  let sessionId = localStorage.getItem("portfolioSessionId");

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("portfolioSessionId", sessionId);
  }

  return sessionId;
}

async function trackEvent(eventType, extraData = {}) {
  try {
    await fetch(`${API_BASE_URL}/analytics/event`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        eventType,
        page: window.location.pathname,
        sessionId: getSessionId(),
        ...extraData
      })
    });
  } catch (error) {
    console.error("Analytics tracking failed:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  trackEvent("page_view");
});

const resumeLink = document.getElementById("resume-link");

if (resumeLink) {
  resumeLink.addEventListener("click", () => {
    trackEvent("resume_download");
  });
}

async function loadSiteSettings() {
  try {
    const response = await fetch(`${API_BASE_URL}/site-settings`);
    const settings = await response.json();

    const resumeLink = document.getElementById("resume-link");
    if (resumeLink && settings.resumeUrl) {
      resumeLink.href = settings.resumeUrl;
    }

    const aboutText = document.getElementById("about-text");
    if (aboutText && settings.aboutText) {
      aboutText.textContent = settings.aboutText;
    }
  } catch (error) {
    console.error("Failed to load site settings:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadSiteSettings();
});

async function loadProjects() {
  const container = document.getElementById("projects-container");
  if (!container) return;

  try {
    const response = await fetch(`${API_BASE_URL}/projects`);
    const projects = await response.json();

    container.innerHTML = projects.map(project => `
      <div class="project-card">
        <img src="${project.imageUrl}" alt="${project.title}" />
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <p><strong>Tech:</strong> ${project.techStack || ""}</p>
        <div class="project-links">
          ${project.githubUrl ? `<a href="${project.githubUrl}" target="_blank">GitHub</a>` : ""}
          ${project.liveUrl ? `<a href="${project.liveUrl}" target="_blank">Live</a>` : ""}
        </div>
      </div>
    `).join("");

    container.querySelectorAll(".project-card").forEach((card, index) => {
      card.addEventListener("click", () => {
        trackEvent("project_click", { projectId: projects[index].id });
      });
    });
  } catch (error) {
    console.error("Failed to load projects:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadProjects();
});

