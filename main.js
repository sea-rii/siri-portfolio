// Update footer year
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

