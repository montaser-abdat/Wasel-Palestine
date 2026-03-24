// const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

// function ensureScript(src) {
//   const existingScript = document.querySelector(`script[src="${src}"]`);
//   if (existingScript) {
//     return Promise.resolve(existingScript);
//   }

//   const script = document.createElement("script");
//   script.src = src;

//   return new Promise((resolve, reject) => {
//     script.onload = () => resolve(script);
//     script.onerror = () => reject(new Error(`Unable to load script: ${src}`));
//     document.body.appendChild(script);
//   });
// }

// async function initMapAndWeatherWidgets() {
//   try {
//     await ensureScript(LEAFLET_JS);
//     await ensureScript("/api/Weather.js");
//     await ensureScript("/api/map.js");

//     if (typeof window.initWeatherWidget === "function") {
//       window.initWeatherWidget();
//     }
//     if (typeof window.initMapWidget === "function") {
//       window.initMapWidget();
//     }
//   } catch (error) {
//     console.error(error);
//   }
// }

// function initHomePage() {
//   document.body.style.overflowY = "hidden";

//   const ready = new Promise((resolve) => {
//     requestAnimationFrame(async () => {
//       await initMapAndWeatherWidgets();
//       resolve();
//     });
//   });

//   return {
//     ready,
//     cleanup: () => {
//       if (typeof window.destroyMapWidget === "function") {
//         window.destroyMapWidget();
//       }
//     },
//   };
// }

// window.initHomePage = initHomePage;
