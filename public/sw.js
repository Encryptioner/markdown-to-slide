const CACHE_NAME = 'markdown-slides-v2';
const isProduction = self.location.hostname !== 'localhost';

// Only cache essential files
const urlsToCache = [
  '/',
  '/manifest.json'
];

// Install event - cache only in production
self.addEventListener('install', (event) => {
  if (isProduction) {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => {
          console.log('Opened cache');
          return cache.addAll(urlsToCache);
        })
        .catch((error) => {
          console.log('Cache add failed:', error);
        })
    );
  }
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

// Fetch event - handle requests carefully
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  
  // Skip all problematic requests
  if (!url.startsWith(self.location.origin) || 
      url.startsWith('chrome-extension://') ||
      url.includes('_next/webpack-hmr') ||
      url.includes('__nextjs_original-stack-frames') ||
      url.includes('hot-reload') ||
      url.includes('.hot-update.') ||
      event.request.method !== 'GET') {
    return;
  }

  // In development, skip caching for most requests
  if (!isProduction) {
    // Only handle offline fallback for navigation requests
    if (event.request.destination === 'document') {
      event.respondWith(
        fetch(event.request).catch(() => {
          return caches.match('/') || new Response('Offline', { 
            status: 503, 
            statusText: 'Service Unavailable' 
          });
        })
      );
    }
    return;
  }

  // Production caching strategy
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then((fetchResponse) => {
          if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
            return fetchResponse;
          }

          const responseToCache = fetchResponse.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            })
            .catch((error) => {
              console.log('Cache put failed:', error);
            });

          return fetchResponse;
        });
      })
      .catch(() => {
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      })
  );
});