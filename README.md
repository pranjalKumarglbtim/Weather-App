# Skycast — Premium Weather Dashboard

A production-quality, portfolio-worthy weather application built with **pure HTML, CSS, and Vanilla JavaScript** — no frameworks, no build step. Powered by the OpenWeatherMap API.

![Skycast](https://raw.githubusercontent.com/pranjalKumarglbtim/Weather-App/main/Screenshot%202026-06-06%20155733.png)

## ✨ Features

- 🌤 **Current weather** — temperature, feels like, humidity, wind, pressure, visibility, sunrise/sunset, cloud cover
- 📅 **5-day forecast** with daily high/low and conditions
- ⏰ **24-hour forecast** (3-hour intervals) with smooth horizontal scrolling
- 🔍 **Smart search** with autocomplete, debouncing, and keyboard navigation
- ⭐ **Favorites & history** stored in localStorage
- 📍 **Geolocation** detection with permission handling
- 🌡 **Celsius / Fahrenheit** instant conversion
- 🌗 **Light / dark / system** theme
- 💾 **10-minute data cache** for performance
- 🎨 **Dynamic weather backgrounds** (sun, clouds, rain, snow, thunder, night)
- ⚠️ **Smart weather alerts** (extreme heat/cold, wind, thunderstorms)
- 📤 **Share** via Web Share API or clipboard
- 💎 **Glassmorphism UI**, smooth animations, skeleton loaders, responsive

## 📁 Project Structure

```
weather-app/
├── index.html
├── css/
│   ├── style.css
│   ├── weather-icons.css
│   └── responsive.css
├── js/
│   ├── app.js              # App controller
│   ├── weatherService.js   # API + caching
│   ├── ui.js               # Rendering
│   ├── storage.js          # localStorage manager
│   ├── config.js           # API key + settings
│   ├── autocomplete.js     # Search suggestions
│   ├── favorites.js        # Favorites/history UI
│   ├── theme.js            # Light/dark
│   └── location.js         # Geolocation
├── assets/
│   ├── icons/
│   └── images/
├── README.md
├── .env.example
└── .gitignore
```

## 🚀 Installation

1. Clone or download this project.
2. Open `js/config.js` and confirm your API key:
   ```js
   API_KEY: "your_openweathermap_api_key"
   ```
3. Serve the folder (any static server works):
   ```bash
   # Python
   python3 -m http.server 8080

   # Node
   npx serve .
   ```
4. Open `http://localhost:8080` in your browser.

> Tip: opening `index.html` directly works too, but geolocation may require `http://` or `https://`.

## ⚙️ Configuration

All settings live in `js/config.js`:

| Option | Default | Description |
|---|---|---|
| `API_KEY` | required | Your OpenWeatherMap API key |
| `CACHE_TTL_MS` | 600000 | Cache duration (10 min) |
| `DEFAULT_CITY` | "London" | Initial city |
| `REQUEST_TIMEOUT_MS` | 12000 | Per-request timeout |
| `RETRY_COUNT` | 2 | Retries on network failure |

## 🔑 API Setup

1. Create a free account at https://openweathermap.org/api
2. Copy your API key
3. Paste it into `js/config.js`

## 🧠 Architecture

| Class | File | Responsibility |
|---|---|---|
| `WeatherService` | `weatherService.js` | API calls, retries, caching, timeouts |
| `StorageManager` | `storage.js` | localStorage with namespaced keys + TTL |
| `WeatherUI` | `ui.js` | DOM rendering, animations, skeleton, icons |
| `Autocomplete` | `autocomplete.js` | Debounced search + keyboard nav |
| `FavoritesUI` | `favorites.js` | Sidebar list rendering |
| `ThemeManager` | `theme.js` | Light/dark + system preference |
| `LocationService` | `location.js` | Geolocation wrapper |
| `App` | `app.js` | Orchestration + state |

## 🎯 Future Improvements

- Air quality index
- Pollen and UV data
- Animated SVG weather icons
- Multi-city comparison view
- Hourly precipitation chart
- PWA installable + offline mode

## 🌐 Deployment

Deploy the folder to any static host:

- **Vercel** — `vercel deploy`
- **Netlify** — drag & drop the folder
- **GitHub Pages** — push to `gh-pages` branch
- **Cloudflare Pages** — connect repo

## 📄 License

MIT — Built with ☀️ for portfolios and learning.
