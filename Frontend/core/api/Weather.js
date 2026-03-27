const defaultEnv = {
  WEATHER_API_KEY: "",
  WEATHER_FALLBACK_COORDS: "32.1744,35.2856",
};

let cachedEnv = null;

async function loadEnv() {
  if (cachedEnv) return cachedEnv;

  cachedEnv = { ...defaultEnv };

  try {
    const res = await fetch("/.env", { cache: "no-cache" });
    if (res.ok) {
      const text = await res.text();
      text.split(/\r?\n/).forEach((line) => {
        const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
        if (match && match[1]) {
          cachedEnv[match[1]] = match[2];
        }
      });
    }
  } catch (err) {
    console.warn("Could not load .env, using defaults.", err);
  }

  // Fallback to previously inlined key if none is provided in .env
  if (!cachedEnv.WEATHER_API_KEY) {
    cachedEnv.WEATHER_API_KEY = "51e8b6c810274f0296602528261803";
  }

  return cachedEnv;
}

function getWeatherIcon(conditionText, isNight) {
  const mainWeather = conditionText.toLowerCase();

  if (mainWeather.includes("cloud") || mainWeather.includes("overcast")) {
    return isNight ? "nights_stay" : "cloud";
  }
  if (
    mainWeather.includes("rain") ||
    mainWeather.includes("drizzle") ||
    mainWeather.includes("shower")
  ) {
    return "rainy";
  }
  if (
    mainWeather.includes("snow") ||
    mainWeather.includes("ice") ||
    mainWeather.includes("sleet")
  ) {
    return "ac_unit";
  }
  if (mainWeather.includes("thunder")) {
    return "thunderstorm";
  }

  return isNight ? "dark_mode" : "wb_sunny";
}

function renderWeather(data) {
  const weather = document.querySelector(".weather-widget");
  if (!weather) return;

  if (data.error) {
    weather.innerHTML = `
      <div class="weather-top">
         <span class="material-symbols-outlined weather-icon fill-1" aria-hidden="true" style="color: red;">error</span>
         <span class="weather-temp">N/A</span>
      </div>
      <div class="weather-desc">API Error: ${data.error.message}</div>
    `;
    return;
  }

  const isNight = data.current.is_day === 0;
  const icon = getWeatherIcon(data.current.condition.text, isNight);
  const temp = Math.round(data.current.temp_c);
  const windSpeedKmh = Math.round(data.current.wind_kph);

  weather.innerHTML = `
    <div class="weather-top">
      <span class="material-symbols-outlined weather-icon fill-1" aria-hidden="true">${icon}</span>
      <span class="weather-temp">${temp}°C</span>
    </div>
    <div class="weather-desc">${data.current.condition.text}</div>
    <div class="weather-wind">
      <span class="material-symbols-outlined" aria-hidden="true">air</span>
      <span>${windSpeedKmh} km/h</span>
    </div>
  `;
}

async function fetchWeatherByQuery(query) {
  const env = await loadEnv();
  const key = env.WEATHER_API_KEY;

  if (!key) {
    console.error("Weather API key missing. Set WEATHER_API_KEY in .env");
    const weather = document.querySelector(".weather-widget");
    if (weather) {
      weather.innerHTML = "Weather API key missing.";
    }
    return;
  }

  fetch(`https://api.weatherapi.com/v1/current.json?key=${key}&q=${query}`)
    .then((res) => res.json())
    .then((data) => {
      renderWeather(data);
    })
    .catch((err) => {
      console.error("Weather API Error:", err);
      const weather = document.querySelector(".weather-widget");
      if (weather) {
        weather.innerHTML = "Unable to load weather data.";
      }
    });
}

async function initWeatherWidget() {
  const weather = document.querySelector(".weather-widget");
  if (!weather) return;

  weather.innerHTML = "Detecting your location...";

  const env = await loadEnv();
  const fallbackCoords = env.WEATHER_FALLBACK_COORDS || "32.1744,35.2856";

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByQuery(`${latitude},${longitude}`);
      },
      () => {
        fetchWeatherByQuery(fallbackCoords);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  } else {
    fetchWeatherByQuery(fallbackCoords);
  }
}

window.initWeatherWidget = initWeatherWidget;
initWeatherWidget().catch((err) =>
  console.error("Failed to initialize weather widget", err),
);
