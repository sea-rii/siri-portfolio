const API_BASE_URL = "http://localhost:5001/api";

function saveToken(token) {
  localStorage.setItem("adminToken", token);
}

function getToken() {
  return localStorage.getItem("adminToken");
}

function clearToken() {
  localStorage.removeItem("adminToken");
}

function getPageName() {
  return window.location.pathname.split("/").pop();
}

function isLoginPage() {
  return getPageName() === "login.html";
}

function isProtectedPage() {
  return !isLoginPage();
}

function redirectToLogin() {
  window.location.href = "./login.html";
}

function redirectToDashboard() {
  window.location.href = "./dashboard.html";
}

function authHeaders(json = true) {
  const headers = {
    Authorization: `Bearer ${getToken()}`
  };

  if (json) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

function showMessage(elementId, message, isError = false) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.classList.toggle("success-message", !isError);
  el.style.color = isError ? "#ff9aa2" : "#a8ffbf";
}

function formatEventLabel(eventType) {
  if (!eventType) return "Activity";
  return eventType.replaceAll("_", " ");
}

async function login(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  saveToken(data.token);
  return data;
}

async function fetchProjects() {
  const response = await fetch(`${API_BASE_URL}/projects`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to load projects");
  return data;
}

async function createProject(projectData) {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(projectData)
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to create project");
  return data;
}

async function updateProject(id, projectData) {
  const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(projectData)
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update project");
  return data;
}

async function deleteProject(id) {
  const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: "DELETE",
    headers: authHeaders()
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to delete project");
  return data;
}

async function fetchAnalyticsOverview() {
  const response = await fetch(`${API_BASE_URL}/analytics/overview`, {
    headers: authHeaders(false)
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to load analytics");
  return data;
}

async function fetchAnalyticsRecent() {
  const response = await fetch(`${API_BASE_URL}/analytics/recent`, {
    headers: authHeaders(false)
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to load recent activity");
  return data;
}

async function fetchAnalyticsPages() {
  const response = await fetch(`${API_BASE_URL}/analytics/pages`, {
    headers: authHeaders(false)
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to load page analytics");
  return data;
}

async function fetchSettings() {
  const response = await fetch(`${API_BASE_URL}/site-settings`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to load settings");
  return data;
}

async function saveSettings(payload) {
  const response = await fetch(`${API_BASE_URL}/site-settings`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to save settings");
  return data;
}

async function fetchUploads() {
  const response = await fetch(`${API_BASE_URL}/uploads`, {
    headers: authHeaders(false)
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to load uploads");
  return data;
}

async function uploadFile(file, category) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category);

  const response = await fetch(`${API_BASE_URL}/uploads`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`
    },
    body: formData
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Upload failed");
  return data;
}

async function removeUpload(id) {
  const response = await fetch(`${API_BASE_URL}/uploads/${id}`, {
    method: "DELETE",
    headers: authHeaders(false)
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to delete upload");
  return data;
}

function renderStats(analytics, projects) {
  const totalViews = document.getElementById("total-views");
  const resumeDownloads = document.getElementById("resume-downloads");
  const projectClicks = document.getElementById("project-clicks");
  const totalProjects = document.getElementById("total-projects");

  if (totalViews) totalViews.textContent = analytics.totalViews ?? 0;
  if (resumeDownloads) resumeDownloads.textContent = analytics.resumeDownloads ?? 0;
  if (projectClicks) projectClicks.textContent = analytics.projectClicks ?? 0;
  if (totalProjects) totalProjects.textContent = projects.length;
}

function renderTopProjects(analytics, projects) {
  const target = document.getElementById("top-projects-list");
  if (!target) return;

  const topProjects = analytics.topProjects || [];

  if (!topProjects.length) {
    target.innerHTML = `<div class="empty-state-card">No project click data yet.</div>`;
    return;
  }

  target.innerHTML = topProjects.map((item, index) => {
    const project = projects.find((p) => Number(p.id) === Number(item.projectId));
    const title = project ? project.title : `Project #${item.projectId}`;

    return `
      <div class="rank-item">
        <div class="rank-item-left">
          <div class="rank-number">${index + 1}</div>
          <div>
            <p class="rank-title">${title}</p>
            <p class="rank-sub">Project engagement</p>
          </div>
        </div>
        <div class="rank-value">${item.clicks} clicks</div>
      </div>
    `;
  }).join("");
}

function renderRecentActivity(events) {
  const target = document.getElementById("recent-activity-list");
  if (!target) return;

  if (!events.length) {
    target.innerHTML = `<div class="empty-state-card">No recent activity yet.</div>`;
    return;
  }

  target.innerHTML = events.map((event) => `
    <div class="activity-item">
      <div class="activity-item-left">
        <div class="activity-badge">•</div>
        <div>
          <p class="activity-title">${formatEventLabel(event.eventType)}</p>
          <p class="activity-sub">${event.page || "No page"} · ${event.createdAt}</p>
        </div>
      </div>
    </div>
  `).join("");
}

function renderTopPages(pages) {
  const target = document.getElementById("top-pages-list");
  if (!target) return;

  if (!pages.length) {
    target.innerHTML = `<div class="empty-state-card">No page view data yet.</div>`;
    return;
  }

  target.innerHTML = pages.map((item, index) => `
    <div class="rank-item">
      <div class="rank-item-left">
        <div class="rank-number">${index + 1}</div>
        <div>
          <p class="rank-title">${item.page || "Unknown page"}</p>
          <p class="rank-sub">Page traffic</p>
        </div>
      </div>
      <div class="rank-value">${item.views} views</div>
    </div>
  `).join("");
}

function renderProjectsGrid(projects) {
  const grid = document.getElementById("projects-grid");
  if (!grid) return;

  if (!projects.length) {
    grid.innerHTML = `<div class="empty-state-card">No projects added yet.</div>`;
    return;
  }

  grid.innerHTML = projects.map((project) => {
    const image = project.imageUrl?.trim()
      ? project.imageUrl
      : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80";

    return `
      <article class="project-poster">
        <img class="poster-image" src="${image}" alt="${project.title}" />
        <div class="poster-body">
          <div class="poster-title-row">
            <h3 class="poster-title">${project.title}</h3>
            ${project.featured ? `<span class="featured-badge">Featured</span>` : ""}
          </div>

          <p class="poster-description">${project.description}</p>

          <div class="poster-tech"><strong>Tech:</strong> ${project.techStack || "Not added"}</div>

          <div class="poster-links">
            ${project.githubUrl ? `<a class="poster-link" href="${project.githubUrl}" target="_blank" rel="noopener noreferrer">GitHub</a>` : ""}
            ${project.liveUrl ? `<a class="poster-link" href="${project.liveUrl}" target="_blank" rel="noopener noreferrer">Live</a>` : ""}
          </div>

          <div class="poster-actions" style="margin-top: 0.9rem;">
            <button class="small-ghost-btn edit-project-btn" data-id="${project.id}">Edit</button>
            <button class="small-danger-btn delete-project-btn" data-id="${project.id}">Delete</button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  grid.querySelectorAll(".edit-project-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const allProjects = await fetchProjects();
      const project = allProjects.find((p) => Number(p.id) === Number(btn.dataset.id));
      if (!project) return;
      fillProjectForm(project);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  grid.querySelectorAll(".delete-project-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const confirmed = window.confirm("Delete this project?");
      if (!confirmed) return;

      try {
        await deleteProject(btn.dataset.id);
        await loadProjectsPage();
      } catch (error) {
        alert(error.message);
      }
    });
  });
}

function fillProjectForm(project) {
  const id = document.getElementById("project-id");
  if (!id) return;

  document.getElementById("project-id").value = project.id || "";
  document.getElementById("title").value = project.title || "";
  document.getElementById("description").value = project.description || "";
  document.getElementById("techStack").value = project.techStack || "";
  document.getElementById("githubUrl").value = project.githubUrl || "";
  document.getElementById("liveUrl").value = project.liveUrl || "";
  document.getElementById("imageUrl").value = project.imageUrl || "";
  document.getElementById("displayOrder").value = project.displayOrder || 0;
  document.getElementById("featured").checked = !!project.featured;

  updateImagePreview();
}

function resetProjectForm() {
  const form = document.getElementById("project-form");
  if (form) form.reset();
  const id = document.getElementById("project-id");
  if (id) id.value = "";
  updateImagePreview();
}

function updateImagePreview() {
  const imageInput = document.getElementById("imageUrl");
  const previewBox = document.getElementById("image-preview-box");
  if (!imageInput || !previewBox) return;

  const value = imageInput.value.trim();

  if (!value) {
    previewBox.innerHTML = `Add an image URL to preview it here.`;
    return;
  }

  previewBox.innerHTML = `
    <img src="${value}" alt="Preview" style="width:100%; max-height:220px; object-fit:cover; border-radius:14px;" />
  `;
}

function populateSettingsForm(settings) {
  const map = {
    "settings-email": settings.email || "",
    "settings-resumeUrl": settings.resumeUrl || "",
    "settings-linkedinUrl": settings.linkedinUrl || "",
    "settings-githubUrl": settings.githubUrl || "",
    "settings-profileImageUrl": settings.profileImageUrl || "",
    "settings-aboutText": settings.aboutText || ""
  };

  Object.entries(map).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.value = value;
  });
}

function renderUploads(files) {
  const target = document.getElementById("uploads-grid");
  if (!target) return;

  if (!files.length) {
    target.innerHTML = `<div class="empty-state-card">No uploads yet.</div>`;
    return;
  }

  target.innerHTML = files.map((file) => `
    <div class="upload-card">
      <div class="upload-card-left">
        <div class="activity-badge">↑</div>
        <div>
          <p class="upload-title">${file.fileName}</p>
          <p class="upload-sub">${file.category} · ${file.fileType || "file"} · ${file.createdAt}</p>
        </div>
      </div>

      <div style="display:flex; gap:0.7rem; flex-wrap:wrap;">
        <a class="poster-link" href="${file.fileUrl}" target="_blank" rel="noopener noreferrer">Preview</a>
        <button class="small-danger-btn delete-upload-btn" data-id="${file.id}">Delete</button>
      </div>
    </div>
  `).join("");

  target.querySelectorAll(".delete-upload-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const confirmed = window.confirm("Delete this upload record?");
      if (!confirmed) return;

      try {
        await removeUpload(btn.dataset.id);
        await loadUploadsPage();
      } catch (error) {
        alert(error.message);
      }
    });
  });
}

async function loadDashboardPage() {
  const [projects, overview, recent] = await Promise.all([
    fetchProjects(),
    fetchAnalyticsOverview(),
    fetchAnalyticsRecent()
  ]);

  renderStats(overview, projects);
  renderTopProjects(overview, projects);
  renderRecentActivity(recent);
}

async function loadProjectsPage() {
  const projects = await fetchProjects();
  renderProjectsGrid(projects);
}

async function loadSettingsPage() {
  const settings = await fetchSettings();
  populateSettingsForm(settings);
}

async function loadUploadsPage() {
  const files = await fetchUploads();
  renderUploads(files);
}

async function loadAnalyticsPage() {
  const [projects, overview, recent, pages] = await Promise.all([
    fetchProjects(),
    fetchAnalyticsOverview(),
    fetchAnalyticsRecent(),
    fetchAnalyticsPages()
  ]);

  renderStats(overview, projects);
  renderTopProjects(overview, projects);
  renderRecentActivity(recent);
  renderTopPages(pages);
}

function setupLoginForm() {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      showMessage("login-message", "Signing in...");
      await login(email, password);
      showMessage("login-message", "Login successful.");
      setTimeout(() => redirectToDashboard(), 500);
    } catch (error) {
      showMessage("login-message", error.message, true);
    }
  });
}

function setupProjectForm() {
  const form = document.getElementById("project-form");
  if (!form) return;

  const resetBtn = document.getElementById("reset-project-form");
  const imageUrlInput = document.getElementById("imageUrl");

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      resetProjectForm();
      showMessage("project-message", "");
    });
  }

  if (imageUrlInput) {
    imageUrlInput.addEventListener("input", updateImagePreview);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const projectId = document.getElementById("project-id").value.trim();
    const projectData = {
      title: document.getElementById("title").value.trim(),
      description: document.getElementById("description").value.trim(),
      techStack: document.getElementById("techStack").value.trim(),
      githubUrl: document.getElementById("githubUrl").value.trim(),
      liveUrl: document.getElementById("liveUrl").value.trim(),
      imageUrl: document.getElementById("imageUrl").value.trim(),
      displayOrder: Number(document.getElementById("displayOrder").value || 0),
      featured: document.getElementById("featured").checked
    };

    try {
      showMessage("project-message", projectId ? "Updating project..." : "Saving project...");
      if (projectId) {
        await updateProject(projectId, projectData);
        showMessage("project-message", "Project updated successfully.");
      } else {
        await createProject(projectData);
        showMessage("project-message", "Project created successfully.");
      }

      resetProjectForm();
      await loadProjectsPage();
    } catch (error) {
      showMessage("project-message", error.message, true);
    }
  });
}

function setupSettingsForm() {
  const form = document.getElementById("settings-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      email: document.getElementById("settings-email").value.trim(),
      resumeUrl: document.getElementById("settings-resumeUrl").value.trim(),
      linkedinUrl: document.getElementById("settings-linkedinUrl").value.trim(),
      githubUrl: document.getElementById("settings-githubUrl").value.trim(),
      profileImageUrl: document.getElementById("settings-profileImageUrl").value.trim(),
      aboutText: document.getElementById("settings-aboutText").value.trim()
    };

    try {
      showMessage("settings-message", "Saving settings...");
      await saveSettings(payload);
      showMessage("settings-message", "Settings saved successfully.");
    } catch (error) {
      showMessage("settings-message", error.message, true);
    }
  });
}

function setupUploadForm() {
  const form = document.getElementById("upload-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById("upload-file");
    const category = document.getElementById("upload-category").value;

    const file = fileInput.files?.[0];
    if (!file) {
      showMessage("upload-message", "Please choose a file.", true);
      return;
    }

    try {
      showMessage("upload-message", "Uploading...");
      await uploadFile(file, category);
      showMessage("upload-message", "Upload successful.");
      form.reset();
      await loadUploadsPage();
    } catch (error) {
      showMessage("upload-message", error.message, true);
    }
  });
}

function setupLogout() {
  const logoutBtn = document.getElementById("logout-btn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", () => {
    clearToken();
    redirectToLogin();
  });
}

function protectPages() {
  if (isProtectedPage() && !getToken()) {
    redirectToLogin();
    return false;
  }

  if (isLoginPage() && getToken()) {
    redirectToDashboard();
    return false;
  }

  return true;
}

async function loadPageByName() {
  const page = getPageName();

  try {
    if (page === "dashboard.html") {
      await loadDashboardPage();
    } else if (page === "projects.html") {
      await loadProjectsPage();
    } else if (page === "settings.html") {
      await loadSettingsPage();
    } else if (page === "uploads.html") {
      await loadUploadsPage();
    } else if (page === "analytics.html") {
      await loadAnalyticsPage();
    }
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const canProceed = protectPages();
  if (!canProceed) return;

  setupLoginForm();
  setupProjectForm();
  setupSettingsForm();
  setupUploadForm();
  setupLogout();

  await loadPageByName();
});