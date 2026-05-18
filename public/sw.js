// sw.js — Service Worker de FitManager
// Mantiene la app funcionando sin conexión y protege los datos del localStorage

const CACHE_NAME = "fitmanager-v1";
const ASSETS = [
  "/",
  "/index.html",
];

// Instalación — guarda los assets en caché
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activación — limpia cachés antiguas
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — responde con caché si no hay red
self.addEventListener("fetch", (event) => {
  // Solo intercepta peticiones GET
  if (event.request.method !== "GET") return;

  // Las peticiones a la API siempre van a la red
  if (event.request.url.includes("/api/")) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Guarda en caché la respuesta fresca
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => {
        // Si no hay red, sirve desde caché
        return caches.match(event.request).then((cached) => cached || caches.match("/"));
      })
  );
});
