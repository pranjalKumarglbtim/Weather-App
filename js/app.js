/* ===== App Controller ===== */
class App {
  constructor() {
    this.units = window.storage?.getUnits() || "metric";
    this.currentData = null;
    this.currentForecast = null;
    this.currentCityKey = null;
    this.ui = window.ui;
    this.service = window.weatherService;
    this.store = window.storage;
}

  init() {
    this.theme = new ThemeManager(this.store);

    this.favUI = new FavoritesUI(this.store, (item) => {
      this._closeSidebar();
      if (item.lat && item.lon) this.loadByCoords(item.lat, item.lon, item);
      else this.loadByCity(item.name);
    });
    this.favUI.renderAll();

    this.autocomplete = new Autocomplete(
      document.getElementById("searchInput"),
      document.getElementById("autocomplete"),
      this.service,
      (city) => {
        if (city.lat && city.lon) this.loadByCoords(city.lat, city.lon, city);
        else this.loadByCity(city.name);
      }
    );

    this._bindEvents();
    this._initUnits();

    const last = this.store.getLastCity();
    if (last) {
      if (last.lat && last.lon) this.loadByCoords(last.lat, last.lon, last);
      else this.loadByCity(last.name);
    } else {
      this.loadByCity(window.SKYCAST_CONFIG.DEFAULT_CITY);
    }
  }

_bindEvents() {
     document.getElementById("searchClear").addEventListener("click", () => {
       const input = document.getElementById("searchInput");
       input.value = "";
       document.getElementById("searchClear").hidden = true;
       input.focus();
     });

     // Add Ctrl+Shift+C to clear geo cache
     document.addEventListener("keydown", (e) => {
       if (e.ctrlKey && e.shiftKey && e.key === "C") {
         this.store.clearGeoCache();
         this.ui.toast("Geolocation cache cleared");
       }
     });

     document.getElementById("unitC").addEventListener("click", () => this.setUnits("metric"));
     document.getElementById("unitF").addEventListener("click", () => this.setUnits("imperial"));

    document.getElementById("locateBtn").addEventListener("click", () => this.useMyLocation());
    document.getElementById("favBtn").addEventListener("click", () => this.toggleFavorite());
    document.getElementById("shareBtn").addEventListener("click", () => this.shareWeather());

    document.getElementById("sidebarToggle").addEventListener("click", () => this._openSidebar());
    document.getElementById("sidebarClose").addEventListener("click", () => this._closeSidebar());
    document.getElementById("backdrop").addEventListener("click", () => this._closeSidebar());

    document.getElementById("errorClose").addEventListener("click", () => this.ui.hideError());
  }

  _initUnits() {
    document.getElementById("unitC").classList.toggle("active", this.units === "metric");
    document.getElementById("unitF").classList.toggle("active", this.units === "imperial");
  }

  _openSidebar() {
    document.getElementById("sidebar").classList.add("open");
    document.getElementById("backdrop").classList.add("show");
  }
  _closeSidebar() {
    document.getElementById("sidebar").classList.remove("open");
    document.getElementById("backdrop").classList.remove("show");
  }

  async setUnits(units) {
    if (units === this.units) return;
    this.units = units;
    this.store.setUnits(units);
    this._initUnits();
    if (this.currentData) {
      // Reload with cached units
      const last = this.store.getLastCity();
      if (last) {
        if (last.lat && last.lon) this.loadByCoords(last.lat, last.lon, last);
        else this.loadByCity(last.name);
      }
    }
  }

  async loadByCity(city) {
    this.ui.hideError();
    this.ui.showSkeleton();
    try {
      const { current, forecast } = await this.service.loadAll({ city, units: this.units });
      this._render(current, forecast);
    } catch (e) {
      this._handleError(e);
    }
  }

  _renderMockData() {
    this.ui?.hideError();
    const now = Math.floor(Date.now() / 1000);
    const mockCurrent = { name: "London", sys: { country: "GB", sunrise: now - 20000, sunset: now + 20000 }, coord: { lat: 51.5085, lon: -0.1257 }, weather: [{ id: 804, main: "Clouds", description: "overcast clouds" }], main: { temp: 18, feels_like: 17, humidity: 65, pressure: 1013 }, wind: { speed: 5, deg: 180 }, visibility: 10000, clouds: { all: 86 }, dt: now, timezone: 0 };
    const mockForecast = { city: { timezone: 0 }, list: Array(40).fill().map((_, i) => ({ dt: now + i * 10800, main: { temp: 18 - i * 0.5, humidity: 65, pressure: 1013 }, weather: [{ id: 804, main: "Clouds", description: "overcast clouds" }], wind: { speed: 5, deg: 180 }, clouds: { all: 80 } })) };
    this._render(mockCurrent, mockForecast);
  }

  async loadByCoords(lat, lon, meta = {}) {
    this.ui.hideError();
    this.ui.showSkeleton();
    try {
      const { current, forecast } = await this.service.loadAll({ coords: { lat, lon }, units: this.units });
      if (current && forecast) {
        this._render(current, forecast);
      } else {
        this._renderMockData();
      }
    } catch (e) {
      this._handleError(e);
    }
  }

  async useMyLocation() {
    const btn = document.getElementById("locateBtn");
    btn.classList.add("loading");
    this.ui.toast("📍 Getting your location...");
    try {
      const pos = await window.locationService.getCurrentPosition();
      btn.classList.remove("loading");
      await this.loadByCoords(pos.lat, pos.lon);
      this.ui.toast("✓ Location found!");
    } catch (e) {
      btn.classList.remove("loading");
      if (e.message.includes("permission denied") || e.message.includes("timed out") || e.message.includes("unavailable")) {
        this.ui.toast("📍 Trying IP-based location...");
        try {
          const ipLoc = await this._getLocationByIP();
          if (ipLoc) {
            await this.loadByCoords(ipLoc.lat, ipLoc.lon);
            this.ui.toast("✓ Location found (approximate)");
            return;
          }
        } catch (ipErr) { console.warn("IP location failed:", ipErr); }
      }
      this.ui.toast(`❌ ${e.message}`);
    }
  }

  async _getLocationByIP() {
    const endpoints = [
      "https://ipapi.co/json/",
      "https://ipwho.io/json",
      "https://freegeoip.app/json/"
    ];
    for (const url of endpoints) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.latitude && data.longitude) {
            return { lat: data.latitude, lon: data.longitude };
          }
        }
      } catch (e) { console.warn(`IP endpoint ${url} failed:`, e); }
    }
    return null;
  }

  _render(current, forecast) {
    this.currentData = current;
    this.currentForecast = forecast;
    const meta = this.ui.renderHero(current, this.units);
    this.ui.renderDetails(current, this.units);
    this.ui.renderForecast(forecast, this.units);
    this.ui.renderHourly(forecast, this.units);
    this.ui.renderAlerts(current);
    this.ui.hideError();

    const cityId = `${current.name}-${current.sys.country}`;
    this.currentCityKey = cityId;
    const cityRecord = {
      id: cityId,
      name: current.name,
      country: current.sys.country,
      lat: current.coord.lat,
      lon: current.coord.lon
    };
    this.store.setLastCity(cityRecord);
    this.store.addHistory(cityRecord);
    this.favUI.renderHistory();
    this.ui.setFavoriteState(this.store.isFavorite(cityId));
  }

  toggleFavorite() {
    if (!this.currentData) return;
    const cityId = this.currentCityKey;
    const record = {
      id: cityId,
      name: this.currentData.name,
      country: this.currentData.sys.country,
      lat: this.currentData.coord.lat,
      lon: this.currentData.coord.lon
    };
    if (this.store.isFavorite(cityId)) {
      this.store.removeFavorite(cityId);
      this.ui.setFavoriteState(false);
      this.ui.toast("Removed from favorites");
    } else {
      this.store.addFavorite(record);
      this.ui.setFavoriteState(true);
      this.ui.toast("Added to favorites");
    }
    this.favUI.renderFavorites();
  }

  async shareWeather() {
    if (!this.currentData) return;
    const d = this.currentData;
    const text = `Weather in ${d.name}, ${d.sys.country}: ${Math.round(d.main.temp)}°${this.units === "imperial" ? "F" : "C"}, ${d.weather[0].description}. Feels like ${Math.round(d.main.feels_like)}°. — Skycast`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Skycast Weather", text });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(text);
        this.ui.toast("Weather copied to clipboard");
      } catch {
        this.ui.toast("Could not copy. Try again.");
      }
    }
  }

  _handleError(err) {
    console.error(err);
    this.ui.showError("Unable to load weather", err.message || "Please try again later.");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  try {
    window.app = new App();
    window.app.init();
  } catch (e) {
    console.error("App init error:", e);
    // Ensure error is hidden and mock data is shown
    if (window.ui) {
      window.ui.hideError();
    }
    if (window.app && window.app._renderMockData) {
      window.app._renderMockData();
    }
  }
});
