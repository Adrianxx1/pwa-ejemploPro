// Plantilla de Service Worker

//1. Nombre y archivos a cachear
const CACHE_NAME = "mi-pwa-cache-v1";
const BASE_PATH = "/pwa-ejemploPro/"; // Asegúrate de que esta ruta sea correcta
const urlsToCache = [
    `${BASE_PATH}`,
    `${BASE_PATH}index.html`,
    `${BASE_PATH}manifest.json`,
    `${BASE_PATH}offline.html`,
    `${BASE_PATH}icons/icon-192x192.png`,
    `${BASE_PATH}icons/icon-512x512.png`,
];

//2. INSTALL -> El evento que se ejecuta cuando se instala el SW
// Se dispara la primera vez que se registra un ServiceWorker
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
});

//3. ACTIVATE -> El evento que se ejecuta cuando se activa el SW debe limpiar caches viejos
// Se dispara cuando el ServiceWorker de activa (en ejecucion)
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        )
    );
    return self.clients.claim();
});

//4. FETCH -> Interceptar las peticiones de la PWA
// Busca primero en cache 
// Si el recurso no lo encuentra va a la red
//Si falla todo mostrara la pagina offline.html
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).catch(
                () => caches.match(`${BASE_PATH}offline.html`));
        })
    );
});

//5. PUSH -> Notificaciones en segundo plano (Opcional)
self.addEventListener("push", event => {
    const data = event.data ? event.data.text() : "Notificación sin datos";
    event.waitUntil(
        self.registration.showNotification("Mi PWA", { body: data })
    );
});

//opcional:
//6. SYNC -> Sincronización en segundo plano (Opcional) 
//Manejo de eventos de API que el navegador soporta