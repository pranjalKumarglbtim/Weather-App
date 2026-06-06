/* ===== Autocomplete ===== */
class Autocomplete {
  constructor(input, listEl, service, onSelect) {
    this.input = input;
    this.list = listEl;
    this.service = service;
    this.onSelect = onSelect;
    this.results = [];
    this.idx = -1;
    this._t = null;
    this._abort = null;
    this.lastQuery = "";

    this.input.addEventListener("input", () => this._onInput());
    this.input.addEventListener("keydown", (e) => this._onKey(e));
    document.addEventListener("click", (e) => {
      if (!this.list.contains(e.target) && e.target !== this.input) this.hide();
    });
  }

  _validate(query) {
    const errors = [];
    if (query.length > 0 && query.length < 2) {
      errors.push("Enter at least 2 characters");
    }
    // Check for valid city name characters (letters, spaces, hyphens, apostrophes)
    if (query.length >= 2 && !/^[a-zA-Z\s\-.'()]+$/.test(query)) {
      errors.push("Only letters and spaces allowed");
    }
    return errors;
  }

  _showValidation(errors) {
    if (errors.length > 0) {
      this.input.classList.add("error");
      this.input.setCustomValidity(errors[0]);
    } else {
      this.input.classList.remove("error");
      this.input.setCustomValidity("");
    }
  }

  _onInput() {
    const q = this.input.value.trim();
    document.getElementById("searchClear").hidden = q.length === 0;
    clearTimeout(this._t);
    
    // Instant validation
    const errors = this._validate(q);
    this._showValidation(errors);
    if (errors.length > 0) { this.hide(); this.lastQuery = ""; return; }
    
    if (this._abort) this._abort.abort();
    if (q.length < 2) { this.hide(); this.lastQuery = ""; return; }
    this._t = setTimeout(() => {
      this.lastQuery = q;
      this._search(q);
    }, 150);
  }

  async _search(q) {
    try {
      this._abort = new AbortController();
      const searchTimeout = setTimeout(() => this._abort.abort(), 5000);
      
      const results = await this.service.searchCities(q, 6, this._abort.signal);
      clearTimeout(searchTimeout);
      
      this.results = results || [];
      
      // Sort to prioritize exact matches
      this.results.sort((a, b) => {
        const aName = (a.name || "").toLowerCase();
        const bName = (b.name || "").toLowerCase();
        const qLower = q.toLowerCase();
        if (aName === qLower && bName !== qLower) return -1;
        if (bName === qLower && aName !== qLower) return 1;
        return 0;
      });
      
      this._render();
    } catch (e) { 
      if (e.name !== 'AbortError') this.hide(); 
    }
  }

  _render() {
    if (!this.results.length) { this.hide(); return; }
    this.list.innerHTML = this.results.map((r, i) => `
      <li class="ac-item" role="option" data-i="${i}">
        <span class="ac-name">${this._escape(r.name)}${r.state ? ", " + this._escape(r.state) : ""}</span>
        <span class="ac-region">${this._escape(r.country)}</span>
      </li>
    `).join("");
    this.list.hidden = false;
    this.idx = -1;
    this.list.querySelectorAll(".ac-item").forEach(el => {
      el.addEventListener("click", () => this._select(parseInt(el.dataset.i)));
    });
  }

  _escape(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  _onKey(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      // If there's a highlighted item, select it
      if (this.idx >= 0 && this.results[this.idx]) {
        this._select(this.idx);
      } 
      // Otherwise use the raw input value
      else if (this.input.value.trim()) {
        this.onSelect({ name: this.input.value.trim() });
      }
      this.hide();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      this.idx = Math.min(this.idx + 1, this.results.length - 1);
      this._highlight();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      this.idx = Math.max(this.idx - 1, 0);
      this._highlight();
    } else if (e.key === "Escape") {
      this.hide();
    }
  }

  _highlight() {
    this.list.querySelectorAll(".ac-item").forEach((el, i) =>
      el.classList.toggle("highlighted", i === this.idx)
    );
  }

  _select(i) {
    const r = this.results[i];
    if (!r) return;
    this.input.value = `${r.name}${r.state ? ", " + r.state : ""}`;
    this.hide();
    this.onSelect({ name: r.name, lat: r.lat, lon: r.lon, country: r.country });
  }

  hide() { this.list.hidden = true; this.list.innerHTML = ""; this._abort?.abort(); }
}

window.Autocomplete = Autocomplete;
