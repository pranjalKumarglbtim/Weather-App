/* ===== StorageManager ===== */
class StorageManager {
  constructor(ns = "skycast") {
    this.ns = ns;
  }
  _k(key) { return `${this.ns}:${key}`; }

  _safeGet(key) {
    try { return JSON.parse(localStorage.getItem(this._k(key))); }
    catch (e) { console.warn("Storage get error:", e); return null; }
  }
  _safeSet(key, value) {
    try { localStorage.setItem(this._k(key), JSON.stringify(value)); }
    catch (e) { console.warn("Storage set error:", e); }
  }
  _remove(key) { localStorage.removeItem(this._k(key)); }

  /* Cache */
  setCache(key, data, ttl) {
    this._safeSet(`cache:${key}`, {
      data,
      expires: Date.now() + (ttl || window.SKYCAST_CONFIG.CACHE_TTL_MS)
    });
  }
  getCache(key) {
    const item = this._safeGet(`cache:${key}`);
    if (!item) return null;
    if (Date.now() > item.expires) {
      this._remove(`cache:${key}`);
      return null;
    }
    return item.data;
  }
  clearCache() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(`${this.ns}:cache:`))
      .forEach(k => localStorage.removeItem(k));
  }

  clearGeoCache() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(`${this.ns}:cache:geo:`))
      .forEach(k => localStorage.removeItem(k));
  }

  /* Favorites */
  getFavorites() { return this._safeGet("favorites") || []; }
  addFavorite(city) {
    const favs = this.getFavorites();
    if (favs.find(f => f.id === city.id)) return false;
    favs.unshift(city);
    this._safeSet("favorites", favs.slice(0, 20));
    return true;
  }
  removeFavorite(id) {
    const favs = this.getFavorites().filter(f => f.id !== id);
    this._safeSet("favorites", favs);
  }
  isFavorite(id) { return !!this.getFavorites().find(f => f.id === id); }

  /* History */
  getHistory() { return this._safeGet("history") || []; }
  addHistory(city) {
    let hist = this.getHistory().filter(h => h.id !== city.id);
    hist.unshift(city);
    this._safeSet("history", hist.slice(0, 8));
  }
  clearHistory() { this._remove("history"); }

  /* Preferences */
  getUnits() { return this._safeGet("units") || "metric"; }
  setUnits(u) { this._safeSet("units", u); }
  getTheme() { return this._safeGet("theme") || "dark"; }
  setTheme(t) { this._safeSet("theme", t); }
  getLastCity() { return this._safeGet("lastCity"); }
  setLastCity(c) { this._safeSet("lastCity", c); }
}

window.storage = new StorageManager();
