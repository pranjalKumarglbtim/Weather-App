/* ===== WeatherService ===== */
class WeatherService {
  constructor(cfg, store) {
    this.cfg = cfg || window.SKYCAST_CONFIG;
    this.store = store;
  }

  async _fetch(url, signal) {
    try {
      const controller = new AbortController();
      if (signal) {
        signal.addEventListener('abort', () => controller.abort());
      }
      const timeoutId = setTimeout(() => controller.abort(), this.cfg.REQUEST_TIMEOUT_MS);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Request failed (${res.status})`);
      }
      return data;
    } catch (err) {
      throw err;
    }
  }

  async _cached(cacheKey, fetcher, ttl) {
    const c = this.store?.getCache(cacheKey);
    if (c) return c;
    try {
      const data = await fetcher();
      if (data && !data.cod) {
        this.store?.setCache(cacheKey, data, ttl);
      }
      return data;
    } catch (err) {
      throw err;
    }
  }

  async getCurrentByCity(city, units = "metric") {
    const url = `${this.cfg.BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${this.cfg.API_KEY}&units=${units}`;
    return this._cached(`cur:${city}:${units}`, () => this._fetch(url));
  }
  async getForecastByCity(city, units = "metric") {
    const url = `${this.cfg.BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${this.cfg.API_KEY}&units=${units}`;
    return this._cached(`fc:${city}:${units}`, () => this._fetch(url));
  }
  async getCurrentByCoords(lat, lon, units = "metric") {
    const url = `${this.cfg.BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${this.cfg.API_KEY}&units=${units}`;
    return this._cached(`cur:${lat},${lon}:${units}`, () => this._fetch(url));
  }
  async getForecastByCoords(lat, lon, units = "metric") {
    const url = `${this.cfg.BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${this.cfg.API_KEY}&units=${units}`;
    return this._cached(`fc:${lat},${lon}:${units}`, () => this._fetch(url));
  }
  async searchCities(query, limit = 5, signal) {
    if (!query || query.length < 2) return [];
    const cacheKey = `geo:${query}:${limit}`;
    const cached = this.store?.getCache(cacheKey);
    if (cached) return cached;
    const url = `${this.cfg.GEO_URL}/direct?q=${encodeURIComponent(query)}&limit=${limit}&appid=${this.cfg.API_KEY}`;
    try {
      const data = await this._fetch(url, signal);
      if (data) this.store?.setCache(cacheKey, data, 30000);
      return data;
    } catch (err) {
      throw err;
    }
  }

  async loadAll({ city, coords, units }) {
    try {
      if (city) {
        const [current, forecast] = await Promise.all([
          this.getCurrentByCity(city, units),
          this.getForecastByCity(city, units)
        ]);
        return { current, forecast };
      } else if (coords) {
        const [current, forecast] = await Promise.all([
          this.getCurrentByCoords(coords.lat, coords.lon, units),
          this.getForecastByCoords(coords.lat, coords.lon, units)
        ]);
        return { current, forecast };
      }
    } catch (err) {
      console.error("Error loading weather data:", err);
      throw err;
    }
    return { current: null, forecast: null };
  }
}

window.weatherService = new WeatherService(window.SKYCAST_CONFIG, window.storage || {});