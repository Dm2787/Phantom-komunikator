const CACHE_NAME = 'phantom-cache-v21'; // ZMIEŃ TEN NUMER przy każdej aktualizacji (np. v2, v3)
const assetsToCache = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assetsToCache);
    })
  );
  // Czeka na sygnał od użytkownika (kliknięcie w banner), nie wymusza restartu w trakcie pisania
});

// Nasłuchiwanie komendy "REBOOT" z pliku index.html
self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

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

self.addEventListener('fetch', (e) => {
  if (e.request.url.includes('supabase.co')) return;
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});

// Obsługa powiadomień Web Push w tle
self.addEventListener('push', function(event) {
    const options = {
        body: '[!] Zarejestrowano nową transmisję...',
        icon: 'icon-192.png',
        badge: 'icon-192.png', 
        vibrate: [200, 100, 200]
    };
    
    event.waitUntil(
        self.registration.showNotification('Phantom Terminal', options)
    );
});

// Akcja po kliknięciu w powiadomienie (przejście do aplikacji)
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    // NAPRAWA BŁĘDU 404: Używamy scope, czyli dokładnej ścieżki repozytorium na Githubie
    const targetUrl = self.registration.scope;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if (client.url === targetUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
      
