/* ===== Favorites & History UI ===== */
class FavoritesUI {
  constructor(store, onSelect) {
    this.store = store;
    this.onSelect = onSelect;
    this.favList = document.getElementById("favList");
    this.favEmpty = document.getElementById("favEmpty");
    this.favCount = document.getElementById("favCount");
    this.historyList = document.getElementById("historyList");
    this.historyEmpty = document.getElementById("historyEmpty");
    document.getElementById("clearHistory").addEventListener("click", () => {
      this.store.clearHistory();
      this.renderHistory();
    });
  }

  renderFavorites() {
    const favs = this.store.getFavorites();
    this.favCount.textContent = favs.length;
    this.favEmpty.style.display = favs.length ? "none" : "block";
    this.favList.innerHTML = favs.map(f => `
      <li class="fav-item" data-id="${f.id}">
        <div class="fav-info">
          <div class="fav-name">${f.name}</div>
          <div class="fav-country">${f.country || ""}</div>
        </div>
        <button class="fav-remove" data-remove="${f.id}" aria-label="Remove">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </li>
    `).join("");
    this.favList.querySelectorAll(".fav-item").forEach(el => {
      el.addEventListener("click", (e) => {
        if (e.target.closest("[data-remove]")) return;
        const f = favs.find(x => x.id === el.dataset.id);
        if (f) this.onSelect(f);
      });
    });
    this.favList.querySelectorAll("[data-remove]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.store.removeFavorite(btn.dataset.remove);
        this.renderFavorites();
      });
    });
  }

  renderHistory() {
    const hist = this.store.getHistory();
    this.historyEmpty.style.display = hist.length ? "none" : "block";
    this.historyList.innerHTML = hist.map(h => `
      <li class="history-item" data-id="${h.id}">
        <div class="fav-info">
          <div class="fav-name">${h.name}</div>
          <div class="fav-country">${h.country || ""}</div>
        </div>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-subtle)"><polyline points="9 18 15 12 9 6"/></svg>
      </li>
    `).join("");
    this.historyList.querySelectorAll(".history-item").forEach(el => {
      el.addEventListener("click", () => {
        const h = hist.find(x => x.id === el.dataset.id);
        if (h) this.onSelect(h);
      });
    });
  }

  renderAll() { this.renderFavorites(); this.renderHistory(); }
}

window.FavoritesUI = FavoritesUI;
