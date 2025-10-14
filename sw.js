// Service Worker

// 1. Nombre y archivos a cachear
const CACHE_NAME = "mi-pwa-cache-v1";
const BASE_PATH = "/pwa-ejemploPro/";
const urlsToCache = [
    `${BASE_PATH}`,
    `${BASE_PATH}index.html`,
    `${BASE_PATH}manifest.json`,
    `${BASE_PATH}offline.html`,
    `${BASE_PATH}icons/icon-192x192.png`,
    `${BASE_PATH}icons/icon-512x512.png`,
];

// 2. INSTALL -> Se ejecuta cuando se instala el SW
self.addEventListener("install", event => {
    console.log('[SW] Instalando Service Worker');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Cacheando archivos');
                return cache.addAll(urlsToCache);
            })
    );
});

// 3. ACTIVATE -> Se ejecuta cuando se activa el SW
self.addEventListener("activate", event => {
    console.log('[SW] Activando Service Worker');
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => {
                        console.log('[SW] Eliminando cache antiguo:', key);
                        return caches.delete(key);
                    })
            )
        )
    );
    return self.clients.claim();
});

// 4. FETCH -> Interceptar las peticiones
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request)
                    .catch(() => caches.match(`${BASE_PATH}offline.html`));
            })
    );
});

// 5. PUSH -> Notificaciones (Opcional)
self.addEventListener("push", event => {
    const data = event.data ? event.data.text() : "Notificación sin datos";
    event.waitUntil(
        self.registration.showNotification("Mi PWA", { 
            body: data,
            icon: `${BASE_PATH}icons/icon-192x192.png`
        })
    );
});