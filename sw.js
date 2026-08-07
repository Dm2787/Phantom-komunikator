const CACHE_NAME = 'phantom-cache-v1';
const assetsToCache = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Instalacja Service Workera i buforowanie plików
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assetsToCache);
    })
  );
  self.skipWaiting();
});

// Aktywacja i czyszczenie starych wersji pamięci podręcznej
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clientsClaim();
});

// Przechwytywanie żądań (pomijamy Supabase, żeby wiadomości szły na żywo z sieci)
self.addEventListener('fetch', (e) => {
  if (e.request.url.includes('supabase.co')) return;

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
