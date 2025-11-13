const CACHE_NAME = "gyp-radio-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/style.css",
  "/main.js",
  "/youtube-loader.js",
  "/manifest.json",
  "/libros.html",
  "/resumidos.html",
  "/predicaciones.html",
  "/devocional-dia.html",
  "/cancionero.html",
  "/playlist-view.html",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      return response || fetch(event.request);
    })
  );
});
