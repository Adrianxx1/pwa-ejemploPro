// Plantilla de Service Worker

//1. Nombre y archivos a cachear
const CACHE_NAME = "nombe-del-cache"
const urlsToCache = [
    "index.html",
    "offline.html",
];

//2. INSTALL -> El evento que se ejecuta cuando se instala el SW
// Se dispara la primera vez que se registra un ServiceWorker
self.addEventListener("install", event => {
    event.waitUntil(
        cache.open(CACHE_NAME).then(cache.addAll(urlsToCache))
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
});

//4. FETCH -> Interceptar las peticiones de la PWA
// Busca primero en cache 
// Si el recurso no lo encuentra va a la red
//Si falla todo mostrara la pagina offline.html
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).catch(
                () => caches.match("offline.html"));
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