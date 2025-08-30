const CACHE_NAME = 'markdown-slides-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  // Static assets will be cached automatically by Next.js
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests and chrome-extension requests
  if (!event.request.url.startsWith(self.location.origin) || 
      event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Skip caching certain URLs
  if (event.request.url.includes('_next/webpack-hmr') ||
      event.request.url.includes('__nextjs_original-stack-frames')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request).then((fetchResponse) => {
          // Only cache successful responses from same origin
          if (fetchResponse.status === 200 && 
              fetchResponse.type === 'basic' &&
              event.request.url.startsWith(self.location.origin)) {
            const responseToCache = fetchResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              })
              .catch((error) => {
                console.log('Cache put failed:', error);
              });
          }
          return fetchResponse;
        });
      })
      .catch(() => {
        // Return offline page for navigation requests
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
        // Return a simple response for other failed requests
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      })
  );
});