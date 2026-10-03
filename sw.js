// sw.js - Service Worker de PocketStore
const cache_shell = 'pocketstore-shell-v1';   // App Shell (estático)
const cache_datos = 'pocketstore-datos-v1';   // Datos de la API (dinámico)
const API_URL = 'https://jsonplaceholder.typicode.com';

// Archivos que forman el App Shell
const archivos_shell = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// I. Install: precachear el App Shell
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando…');
  event.waitUntil(
    caches.open(cache_shell)
      .then((cache) => cache.addAll(archivos_shell))
      .then(() => self.skipWaiting())
  );
});

// II. Activate: limpiar cachés antiguas
self.addEventListener('activate', (event) => {
  console.log('[SW] Activado');
  const vigentes = [cache_shell, cache_datos];
  event.waitUntil(
    caches.keys()
      .then((nombres) =>
        Promise.all(
          nombres
            .filter((n) => !vigentes.includes(n))
            .map((n) => caches.delete(n))
        )
      )
      .then(() => self.clients.claim())
  );
});

//  III. Fetch: recuperar información
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // a) Datos de la API: Network First (red y, si falla, caché)
  if (request.url.startsWith(API_URL)) {
    event.respondWith(networkFirst(request));
    return;
  }

  // b) App Shell y demás recursos propios: Cache First
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request));
  }
});

async function cacheFirst(request) {
  const enCache = await caches.match(request);
  if (enCache) return enCache;
  try {
    const respuesta = await fetch(request);
    const cache = await caches.open(cache_shell);
    cache.put(request, respuesta.clone());
    return respuesta;
  } catch (err) {
    // Sin red y sin caché: devolver la página principal
    return caches.match('./index.html');
  }
}

async function networkFirst(request) {
  const cache = await caches.open(cache_datos);
  try {
    const respuesta = await fetch(request);
    cache.put(request, respuesta.clone());   // guardar copia
    return respuesta;
  } catch (err) {
    const enCache = await cache.match(request);
    if (enCache) return enCache;
    return new Response(JSON.stringify([]), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
