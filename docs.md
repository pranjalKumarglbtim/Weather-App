# Skycast Documentation

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage Guide](#usage-guide)
- [API Reference](#api-reference)
- [Architecture](#architecture)
- [Troubleshooting](#troubleshooting)

## Overview

Skycast is a premium weather dashboard built with pure HTML, CSS, and Vanilla JavaScript. No frameworks or build tools required. It fetches real-time weather data from OpenWeatherMap API and presents it in a beautiful glassmorphism UI with dynamic backgrounds.

![Skycast Dashboard](https://raw.githubusercontent.com/pranjalKumarglbtim/Weather-App/main/Screenshot%202026-06-06%20155733.png)

## Features

- **Current Weather**: Temperature, feels-like, humidity, wind, pressure, visibility, sunrise/sunset
- **5-Day Forecast**: Daily high/low temperatures and conditions
- **24-Hour Forecast**: 3-hour interval forecasts with horizontal scrolling
- **Smart Search**: Autocomplete with keyboard navigation (up/down/enter/esc)
- **Favorites & History**: Stored in localStorage
- **Geolocation**: Auto-detect your location on load
- **Temperature Units**: Celsius/Fahrenheit toggle with instant conversion
- **Themes**: Light, dark, or system preference
- **Weather Alerts**: Extreme conditions notifications
- **Visual Design**: Glassmorphism UI, premium animations, skeleton loaders

![Search & Autocomplete](https://raw.githubusercontent.com/pranjalKumarglbtim/Weather-App/main/Screenshot%202026-06-06%20155659.png)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/pranjalKumarglbtim/Weather-App.git
   cd Weather-App
   ```

2. Get your free OpenWeatherMap API key from https://openweathermap.org/api

3. Edit `js/config.js` and add your API key:
   ```js
   const CONFIG = {
     API_KEY: "your_api_key_here",
     // ...
   };
   ```

4. Serve the application:
   ```bash
   # Python
   python3 -m http.server 8080

   # Or Node.js
   npx serve .
   ```

5. Open `http://localhost:8080` in your browser

## Configuration

All settings are in `js/config.js`:

| Option | Default | Description |
|--------|---------|-------------|
| `API_KEY` | required | OpenWeatherMap API key |
| `CACHE_TTL_MS` | 600000 | Cache duration (10 minutes) |
| `DEFAULT_CITY` | "London" | Initial city on load |
| `REQUEST_TIMEOUT_MS` | 12000 | API request timeout |
| `RETRY_COUNT` | 2 | Retry attempts on failure |

## Usage Guide

### Search Weather
Type in the search box and select from autocomplete suggestions. Use ↑↓ arrow keys to navigate and Enter to select.

### Geolocation
Click the location button to auto-detect your position. Allow location access when prompted.

### Save Favorites
Click the star icon on any city to save it to favorites for quick access.

### Theme Switching
Click the moon/sun icon to toggle between light and dark modes.

![Dark Theme & Forecast](https://raw.githubusercontent.com/pranjalKumarglbtim/Weather-App/main/Screenshot%202026-06-06%20155632.png)

## API Reference

### WeatherService Methods
- `getCurrentWeather(city)` - Get current weather for a city
- `getForecast(city)` - Get 5-day forecast
- `clearCache()` - Clear cached data

### Autocomplete
- Fetches city suggestions from OpenWeatherMap geocoding API
- Results limited to prevent excessive API calls

![Hourly Forecast View](https://raw.githubusercontent.com/pranjalKumarglbtim/Weather-App/main/Screenshot%202026-06-06%20155602.png)

## Architecture

```
js/
├── app.js          # Main controller, orchestrates all modules
├── weatherService.js # API calls, caching, error handling
├── ui.js           # DOM rendering, animations
├── storage.js      # LocalStorage with TTL support
├── config.js       # Configuration constants
├── autocomplete.js # Search suggestions
├── favorites.js    # Favorites/history management
├── theme.js        # Light/dark theme toggle
└── location.js     # Geolocation wrapper
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Geolocation not working | Serve via http:// not file:// |
| No search results | Check API key is valid |
| Slow loading | Check network connection |

## License

MIT License - Open source and free to use.