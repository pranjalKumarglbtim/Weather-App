/* ===== Theme ===== */
class ThemeManager {
  constructor(store) {
    this.store = store;
    this.btn = document.getElementById("themeBtn");
    this.icon = document.getElementById("themeIcon");
    this.btn.addEventListener("click", () => this.toggle());
    this.apply(this.store.getTheme() || this._systemPref());
    if (window.matchMedia) {
      window.matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", e => {
          if (!this.store.getTheme()) this.apply(e.matches ? "dark" : "light");
        });
    }
  }
  _systemPref() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  apply(theme) {
    document.body.dataset.theme = theme;
    this.store.setTheme(theme);
    this._setIcon(theme);
  }
  toggle() {
    const next = document.body.dataset.theme === "dark" ? "light" : "dark";
    this.apply(next);
  }
  _setIcon(theme) {
    if (theme === "dark") {
      this.icon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;
    } else {
      this.icon.innerHTML = `<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>`;
    }
  }
}
window.ThemeManager = ThemeManager;
