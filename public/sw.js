const CACHE_NAME = 'pohonlink-pwa-v1';
const OFFLINE_URL = '/offline';

const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
  '/logo.png',
  '/logo.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png',
  '/screenshots/desktop.png',
  '/screenshots/mobile.png'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[PWA Service Worker] Pre-cache warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin analytics/API post requests
  if (request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/')) return;

  // HTML Navigation requests: Network first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(OFFLINE_URL);
        return cachedResponse || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
      })
    );
    return;
  }

  // Static Assets: Cache first with network fallback
  if (
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/screenshots/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Default Network First strategy
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// Background Sync capability
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-clicks' || event.tag === 'pwa-sync') {
    event.waitUntil(
      Promise.resolve().then(() => {
        console.log('[PWA Service Worker] Background sync event triggered:', event.tag);
      })
    );
  }
});

// Periodic Background Sync capability
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-stats' || event.tag === 'pwa-periodic-sync') {
    event.waitUntil(
      Promise.resolve().then(() => {
        console.log('[PWA Service Worker] Periodic sync event triggered:', event.tag);
      })
    );
  }
});

// Push Notifications capability
self.addEventListener('push', (event) => {
  let data = { title: 'Pohonlink', body: 'Ada aktivitas baru di biolink kamu.', icon: '/icon-192.png' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1',
      url: data.url || '/dashboard'
    },
    actions: [
      { action: 'open', title: 'Buka Dashboard' },
      { action: 'close', title: 'Tutup' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification Click Action
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const targetUrl = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Message Listener (skipWaiting, ping)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
