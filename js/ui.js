/* ===== WeatherUI ===== */
class WeatherUI {
  constructor() {
    this.el = {
      body: document.body,
      heroSkeleton: document.getElementById("heroSkeleton"),
      heroContent: document.getElementById("heroContent"),
      cityName: document.getElementById("cityName"),
      countryName: document.getElementById("countryName"),
      dateTime: document.getElementById("dateTime"),
      heroIcon: document.getElementById("heroIcon"),
      tempValue: document.getElementById("tempValue"),
      tempUnit: document.getElementById("tempUnit"),
      weatherDesc: document.getElementById("weatherDesc"),
      feelsLike: document.getElementById("feelsLike"),
      detailsGrid: document.getElementById("detailsGrid"),
      forecastGrid: document.getElementById("forecastGrid"),
      hourlyScroll: document.getElementById("hourlyScroll"),
      alertsContainer: document.getElementById("alertsContainer"),
      errorCard: document.getElementById("errorCard"),
      errorTitle: document.getElementById("errorTitle"),
      errorMessage: document.getElementById("errorMessage"),
      toast: document.getElementById("toast"),
      favBtn: document.getElementById("favBtn"),
      favIcon: document.getElementById("favIcon")
    };
    this._clockTimer = null;
  }

  /* === Weather icons (emoji) === */
  iconFor(main, id, isNight = false) {
    const m = (main || "").toLowerCase();
    if (id >= 200 && id < 300) return "wi-thunder";
    if (id >= 300 && id < 400) return "wi-drizzle";
    if (id >= 500 && id < 600) return "wi-rain";
    if (id >= 600 && id < 700) return "wi-snow";
    if (id >= 700 && id < 800) return "wi-mist";
    if (id === 800) return isNight ? "wi-clear-night" : "wi-clear-day";
    if (id === 801 || id === 802) return isNight ? "wi-partly-night" : "wi-partly-day";
    if (id === 803 || id === 804) return "wi-cloudy";
    if (m.includes("rain")) return "wi-rain";
    if (m.includes("cloud")) return "wi-cloudy";
    return "wi-clear-day";
  }

  weatherCategory(id) {
    if (id >= 200 && id < 300) return "thunderstorm";
    if (id >= 300 && id < 600) return id < 500 ? "drizzle" : "rain";
    if (id >= 600 && id < 700) return "snow";
    if (id >= 700 && id < 800) return "mist";
    if (id === 800) return "clear";
    return "clouds";
  }

  setWeatherBackground(id, isNight) {
    let cat = this.weatherCategory(id);
    if (isNight && cat === "clear") cat = "night";
    this.el.body.dataset.weather = cat;
  }

  /* === Loading === */
  showSkeleton() {
    this.el.heroSkeleton.hidden = false;
    this.el.heroContent.hidden = true;
    this.el.detailsGrid.innerHTML = this._skeletonDetails();
    this.el.forecastGrid.innerHTML = this._skeletonForecast();
    this.el.hourlyScroll.innerHTML = this._skeletonHourly();
  }
  _skeletonDetails() {
    return Array.from({ length: 6 }).map(() =>
      `<div class="detail-card"><div class="sk sk-line w-60"></div><div class="sk sk-line w-40" style="height:24px;margin-top:8px"></div></div>`
    ).join("");
  }
  _skeletonForecast() {
    return Array.from({ length: 5 }).map(() =>
      `<div class="forecast-card"><div class="sk sk-line w-60"></div><div class="sk sk-line w-40" style="height:40px;width:50px"></div><div class="sk sk-line w-60"></div></div>`
    ).join("");
  }
  _skeletonHourly() {
    return Array.from({ length: 8 }).map(() =>
      `<div class="hour-card"><div class="sk sk-line w-60"></div><div class="sk sk-line" style="height:30px;width:30px;border-radius:50%"></div><div class="sk sk-line w-60"></div></div>`
    ).join("");
  }

  /* === Format === */
  fmtTemp(t, unit) {
    return `${Math.round(t)}°${unit === "imperial" ? "F" : "C"}`;
  }
  fmtTime(unix, tz = 0) {
    const d = new Date((unix + tz) * 1000);
    return d.toUTCString().slice(17, 22);
  }
  fmtDate(unix, tz = 0) {
    const d = new Date((unix + tz) * 1000);
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
  }
  windDir(deg) {
    const dirs = ["N","NE","E","SE","S","SW","W","NW"];
    return dirs[Math.round(deg / 45) % 8];
  }
  windSpeed(v, unit) {
    return unit === "imperial" ? `${Math.round(v)} mph` : `${(v * 3.6).toFixed(1)} km/h`;
  }

  /* === Render Hero === */
  renderHero(data, units) {
    const { name, sys, weather, main, dt, timezone, coord } = data;
    const w = weather[0];
    const now = Math.floor(Date.now() / 1000);
    const isNight = now < sys.sunrise || now > sys.sunset;

    this.el.cityName.textContent = name;
    this.el.countryName.textContent = sys.country || "";
    this.el.dateTime.innerHTML = `${this.fmtDate(dt, timezone)} · <span id="liveClock">${this.fmtTime(dt, timezone)}</span>`;
    this.el.heroIcon.innerHTML = `<span class="wi ${this.iconFor(w.main, w.id, isNight)}"></span>`;

    this._animateNumber(this.el.tempValue, Math.round(main.temp));
    this.el.tempUnit.textContent = units === "imperial" ? "°F" : "°C";
    this.el.weatherDesc.textContent = w.description;
    this.el.feelsLike.textContent = this.fmtTemp(main.feels_like, units);

    this.setWeatherBackground(w.id, isNight);

    this.el.heroSkeleton.hidden = true;
    this.el.heroContent.hidden = false;
    this.hideError();

    // Live clock
    if (this._clockTimer) clearInterval(this._clockTimer);
    this._clockTimer = setInterval(() => {
      const el = document.getElementById("liveClock");
      if (el) {
        const nowUnix = Math.floor(Date.now() / 1000);
        el.textContent = this.fmtTime(nowUnix, timezone);
      }
    }, 30000);

    return { coord, name, country: sys.country };
  }

  _animateNumber(node, target) {
    const start = parseInt(node.textContent) || 0;
    const duration = 700;
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      node.textContent = Math.round(start + (target - start) * eased);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* === Details === */
  renderDetails(data, units) {
    const { main, wind, visibility, clouds, sys, timezone } = data;
    const speedUnit = units === "imperial" ? "mph" : "km/h";
    const cards = [
      {
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`,
        label: "Humidity", value: `${main.humidity}%`, sub: this._humidityDesc(main.humidity)
      },
      {
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>`,
        label: "Wind", value: this.windSpeed(wind.speed, units), sub: `${this.windDir(wind.deg || 0)} direction`
      },
      {
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
        label: "Pressure", value: `${main.pressure}`, sub: "hPa"
      },
      {
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
        label: "Visibility", value: `${(visibility / 1000).toFixed(1)} km`, sub: this._visibilityDesc(visibility)
      },
      {
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><line x1="23" y1="22" x2="1" y2="22"/></svg>`,
        label: "Sunrise", value: this.fmtTime(sys.sunrise, timezone), sub: "AM"
      },
      {
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="9" x2="12" y2="2"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><line x1="23" y1="22" x2="1" y2="22"/></svg>`,
        label: "Sunset", value: this.fmtTime(sys.sunset, timezone), sub: "PM"
      },
      {
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>`,
        label: "Cloud cover", value: `${clouds.all}%`, sub: this._cloudDesc(clouds.all)
      },
      {
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>`,
        label: "Feels like", value: this.fmtTemp(main.feels_like, units), sub: "Body temperature"
      }
    ];
    this.el.detailsGrid.innerHTML = cards.map(c => `
      <article class="detail-card">
        <div class="detail-head">${c.icon}<span>${c.label}</span></div>
        <div class="detail-value">${c.value}</div>
        <div class="detail-sub">${c.sub}</div>
      </article>
    `).join("");
  }

  _humidityDesc(h) { return h < 30 ? "Dry" : h < 60 ? "Comfortable" : h < 80 ? "Humid" : "Very humid"; }
  _visibilityDesc(v) { return v >= 10000 ? "Excellent" : v >= 5000 ? "Good" : v >= 2000 ? "Moderate" : "Poor"; }
  _cloudDesc(c) { return c < 25 ? "Mostly clear" : c < 60 ? "Partly cloudy" : c < 90 ? "Mostly cloudy" : "Overcast"; }

  /* === Forecast === */
  renderForecast(forecast, units) {
    const tz = forecast.city.timezone;
    // Group by date (UTC + tz)
    const byDay = {};
    forecast.list.forEach(item => {
      const d = new Date((item.dt + tz) * 1000);
      const key = d.toISOString().slice(0, 10);
      (byDay[key] = byDay[key] || []).push(item);
    });
    const todayKey = new Date((Math.floor(Date.now()/1000) + tz) * 1000).toISOString().slice(0, 10);
    const days = Object.keys(byDay).filter(k => k !== todayKey).slice(0, 5);

    this.el.forecastGrid.innerHTML = days.map(key => {
      const items = byDay[key];
      const temps = items.map(i => i.main.temp);
      const high = Math.max(...temps);
      const low = Math.min(...temps);
      const mid = items[Math.floor(items.length / 2)];
      const w = mid.weather[0];
      const d = new Date((mid.dt + tz) * 1000);
      const day = d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
      const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
      return `
        <article class="forecast-card">
          <div class="fc-day">${day}</div>
          <div class="fc-date">${date}</div>
          <div class="fc-icon"><span class="wi ${this.iconFor(w.main, w.id, false)}"></span></div>
          <div class="fc-temps"><span class="fc-high">${this.fmtTemp(high, units)}</span><span class="fc-low">${this.fmtTemp(low, units)}</span></div>
          <div class="fc-desc">${w.description}</div>
        </article>
      `;
    }).join("");
  }

  /* === Hourly === */
  renderHourly(forecast, units) {
    const tz = forecast.city.timezone;
    const items = forecast.list.slice(0, 8);
    this.el.hourlyScroll.innerHTML = items.map(item => {
      const d = new Date((item.dt + tz) * 1000);
      const time = d.toUTCString().slice(17, 22);
      const w = item.weather[0];
      return `
        <div class="hour-card">
          <div class="hr-time">${time}</div>
          <div class="hr-icon"><span class="wi ${this.iconFor(w.main, w.id, false)}"></span></div>
          <div class="hr-temp">${this.fmtTemp(item.main.temp, units)}</div>
        </div>
      `;
    }).join("");
  }

  /* === Alerts === */
  renderAlerts(data) {
    this.el.alertsContainer.innerHTML = "";
    const alerts = [];
    const temp = data.main.temp;
    const units = window.app?.units || "metric";
    const hot = units === "metric" ? 35 : 95;
    const cold = units === "metric" ? -5 : 23;
    if (temp >= hot) alerts.push({ title: "Extreme Heat Warning", text: "Stay hydrated and avoid prolonged sun exposure." });
    if (temp <= cold) alerts.push({ title: "Cold Weather Advisory", text: "Dress warmly and limit outdoor exposure." });
    if (data.wind && data.wind.speed > (units === "metric" ? 15 : 33)) {
      alerts.push({ title: "High Wind Notice", text: "Strong winds expected. Secure loose objects." });
    }
    if (data.weather[0].id >= 200 && data.weather[0].id < 300) {
      alerts.push({ title: "Thunderstorm Alert", text: "Seek shelter and avoid open areas." });
    }
    alerts.forEach(a => {
      const div = document.createElement("div");
      div.className = "alert";
      div.innerHTML = `<div class="alert-icon">⚠️</div><div class="alert-body"><div class="alert-title">${a.title}</div><div class="alert-text">${a.text}</div></div>`;
      this.el.alertsContainer.appendChild(div);
    });
  }

  /* === Errors / Toasts === */
  showError(title, message) {
    this.el.errorTitle.textContent = title || "Something went wrong";
    this.el.errorMessage.textContent = message || "Please try again.";
    this.el.errorCard.hidden = false;
  }
  hideError() { 
    this.el.errorCard.hidden = true;
    this.el.errorCard.style.display = 'none';
  }

  toast(message, ms = 2400) {
    this.el.toast.textContent = message;
    this.el.toast.classList.add("show");
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => this.el.toast.classList.remove("show"), ms);
  }

  setFavoriteState(active) {
    this.el.favBtn.classList.toggle("active", active);
  }
}

window.ui = new WeatherUI();
