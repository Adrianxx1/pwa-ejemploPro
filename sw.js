const CACHE_NAME = "pwa-cache-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./login.html",
  "./offline.html",
  "./manifest.json",
  "./icons/icon-96x96.png",
  "./icons/icon-180x180.png",
  "./icons/icon-192x192.png",
  "./icons/icon-512x512.png"
];

// Instalación del Service Worker y caché inicial
self.addEventListener("install", (event) => {
  console.log("Service Worker: Instalando...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: Archivos cacheados");
      return cache.addAll(urlsToCache);
    })
  );
});

// Activación del Service Worker y limpieza de cachés antiguos
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activado");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log("Service Worker: Caché antiguo eliminado:", name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Intercepción de peticiones de red
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Guardar una copia en caché si la respuesta es válida
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Si no hay conexión, mostrar la página offline
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || caches.match("./offline.html");
        });
      })
  );
});
