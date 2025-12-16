const CACHE_NAME = "gyp-radio-cache-v2"; // **Incrementamos la versión del caché**
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
  "/icons/icon-512x512.png", // Fuente externa: la cachearemos, pero luego aplicaremos una estrategia de actualización.
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css", // Asumiendo que esta es la imagen del fondo del hero
  "/fondo.png",
];

// 1. EVENTO INSTALL: Pre-cacheo de recursos esenciales.
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Instalando. Pre-cacheando App Shell.");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error("Fallo al pre-cachear:", error);
      })
  );
  self.skipWaiting(); // Fuerza la activación inmediata del nuevo SW.
});

// 2. EVENTO ACTIVATE: Limpieza de cachés viejas (Garantiza el "costo cero" en espacio).
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activado. Limpiando cachés viejas.");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return (
              cacheName.startsWith("gyp-radio-cache-") &&
              cacheName !== CACHE_NAME
            );
          })
          .map((cacheName) => {
            return caches.delete(cacheName);
          })
      );
    })
  );
  return self.clients.claim(); // Reclama control de todas las páginas abiertas.
});

// 3. EVENTO FETCH: Estrategias de cacheo mejoradas.
self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url); // a) Estrategia Cache-Only para archivos del App Shell (siempre sirve la caché). // Esta es la estrategia más rápida para archivos locales.

  const isAppShell = urlsToCache.some((url) =>
    requestUrl.pathname.endsWith(url.replace(/^\//, ""))
  );
  if (isAppShell) {
    event.respondWith(caches.match(event.request));
    return;
  } // b) Estrategia Cache-First (incluida la versión original, para recursos externos y no críticos).

  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request)
          .then((networkResponse) => {
            // Si la respuesta de red es válida, la cacheamos para la próxima vez (Runtime Caching)
            if (
              networkResponse &&
              networkResponse.status === 200 &&
              networkResponse.type === "basic"
            ) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch((error) => {
            // Si falla la red, podemos servir una página offline (Opcional, pero recomendado)
            console.error("Fallo de Fetch y caché no encontrada:", error); // Si falla la red y no hay caché, puedes devolver un fallback si lo tienes en urlsToCache // return caches.match('/offline.html');
          })
      );
    })
  );
});
