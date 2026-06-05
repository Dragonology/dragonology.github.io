const THEME_KEY = "dragonology-theme";
const toggle = document.querySelector(".theme-toggle");

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);

  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore storage errors */
  }

  if (!toggle) {
    return;
  }

  toggle.querySelectorAll("[data-theme-choice]").forEach((button) => {
    const active = button.dataset.themeChoice === theme;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function initTheme() {
  let saved = "colorful";

  try {
    saved = localStorage.getItem(THEME_KEY) || "colorful";
  } catch {
    saved = "colorful";
  }

  if (!toggle) {
    setTheme(saved);
    return;
  }

  toggle.querySelectorAll("[data-theme-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      setTheme(button.dataset.themeChoice);
    });
  });

  setTheme(saved);
}

initTheme();
