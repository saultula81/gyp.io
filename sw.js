const CACHE_NAME = "gyp-radio-cache-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./favicon.ico",
  "./libros.html",
  "./resumidos.html",
  "./predicaciones.html",
  "./devocional-dia.html",
  "./cancionero.html",
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
      return response || fetch(event.request);
    })
  );
});
