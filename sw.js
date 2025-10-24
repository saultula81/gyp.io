const CACHE_NAME = "gyp-radio-cache-v4"; // Versión incrementada
const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./libros.html",
  "./resumidos.html",
  "./predicaciones.html",
  "./devocional-dia.html",
  "./cancionero.html",
  "./youtube-loader.js",
  "./manifest.json",
  // Nota: favicon.ico y las imágenes se cachearán dinámicamente
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Abriendo caché");
        // Cachea los archivos uno por uno para identificar cuál falla
        return Promise.all(
          urlsToCache.map((url) => {
            return cache.add(url).catch((err) => {
              console.warn(`No se pudo cachear ${url}:`, err);
              // No detiene el proceso si un archivo falla
            });
          })
        );
      })
      .then(() => {
        console.log("Caché inicializada correctamente");
        self.skipWaiting(); // Activa el nuevo service worker inmediatamente
      })
  );
});

// Limpia las cachés antiguas
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              console.log("Eliminando caché antigua:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("Service Worker activado");
        return self.clients.claim(); // Toma control de todas las páginas inmediatamente
      })
  );
});

// Estrategia: Network First, fallback a Cache (ideal para contenido dinámico)
self.addEventListener("fetch", (event) => {
  // Ignora las peticiones a la API de YouTube
  if (
    event.request.url.includes("youtube.com") ||
    event.request.url.includes("googleapis.com")
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la respuesta es válida, la cachea para uso futuro
        if (response && response.status === 200 && response.type === "basic") {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, intenta servir desde caché
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Si no está en caché y es una navegación, muestra página offline
          if (event.request.mode === "navigate") {
            return caches.match("./index.html");
          }
        });
      })
  );
});
