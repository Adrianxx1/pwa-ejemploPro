// Nombre y versión del caché
const CACHE_NAME = "mi-pwa-cache-v2";
const BASE_PATH = "./"; // Usa "./" para funcionar localmente o en subcarpetas

// Archivos a cachear
const urlsToCache = [
  `${BASE_PATH}`,
  `${BASE_PATH}index.html`,
  `${BASE_PATH}login.html`,
  `${BASE_PATH}manifest.json`,
  `${BASE_PATH}offline.html`,
  `${BASE_PATH}icons/icon-96x96.png`,
  `${BASE_PATH}icons/icon-180x180.png`,
  `${BASE_PATH}icons/icon-192x192.png`,
  `${BASE_PATH}icons/icon-512x512.png`
];

// 🧱 INSTALL – Se ejecuta cuando el SW se instala por primera vez
self.addEventListener("install", (event) => {
  console.log("🟢 Service Worker: Instalando...");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("📦 Archivos agregados al caché");
        return cache.addAll(urlsToCache);
      })
  );
});

// 🧹 ACTIVATE – Limpia cachés viejos
self.addEventListener("activate", (event) => {
  console.log("⚙️ Service Worker: Activado");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log("🗑️ Borrando caché antiguo:", key);
            return caches.delete(key);
          })
      )
    )
  );
  return self.clients.claim();
});

// 🌐 FETCH – Intercepta peticiones de red
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la respuesta es válida, guarda una copia en caché
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
        // Si no hay conexión, busca en caché o muestra offline.html
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || caches.match(`${BASE_PATH}offline.html`);
        });
      })
  );
});

// 🔔 PUSH – Notificaciones en segundo plano (opcional)
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.text() : "Notificación sin datos";
  event.waitUntil(
    self.registration.showNotification("Mi PWA", {
      body: data,
      icon: `${BASE_PATH}icons/icon-192x192.png`
    })
  );
});

// 🔁 (Opcional) Sincronización en segundo plano
self.addEventListener("sync", (event) => {
  console.log("🔁 Evento de sincronización:", event.tag);
});
