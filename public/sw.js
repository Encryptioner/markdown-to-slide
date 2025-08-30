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
          console.log('SW: Opened cache');
          return cache.addAll(urlsToCache);
        })
        .catch((error) => {
          console.log('SW: Cache add failed:', error);
        })
    );
  } else {
    console.log('SW: Skipping cache during development');
  }
  self.skipWaiting();
});

// Activate event - clean up old caches (only in production)
self.addEventListener('activate', (event) => {
  if (isProduction) {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  } else {
    console.log('SW: Skipping cache cleanup during development');
  }
  self.clients.claim();
});

// Fetch event - handle requests carefully
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  const request = event.request;
  
  // Skip all problematic requests - more comprehensive filtering
  if (!url.startsWith(self.location.origin) || 
      url.startsWith('chrome-extension://') ||
      url.startsWith('moz-extension://') ||
      url.startsWith('safari-extension://') ||
      url.includes('_next/webpack-hmr') ||
      url.includes('__nextjs_original-stack-frames') ||
      url.includes('hot-reload') ||
      url.includes('.hot-update.') ||
      url.includes('/api/') ||
      request.method !== 'GET') {
    return; // Don't intercept these requests at all
  }

  // In development, completely skip service worker functionality to avoid conflicts
  if (!isProduction) {
    // Let all requests pass through to the network normally
    return;
  }

  // Production caching strategy
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request)
          .then((fetchResponse) => {
            // Only cache successful responses
            if (!fetchResponse || 
                fetchResponse.status !== 200 || 
                fetchResponse.type !== 'basic' ||
                !fetchResponse.ok) {
              return fetchResponse;
            }

            // Clone the response for caching
            const responseToCache = fetchResponse.clone();
            
            // Cache the response (don't await - fire and forget)
            caches.open(CACHE_NAME)
              .then((cache) => {
                try {
                  return cache.put(request, responseToCache);
                } catch (error) {
                  console.warn('Cache put failed:', error.message);
                }
              })
              .catch((error) => {
                console.warn('Cache operation failed:', error.message);
              });

            return fetchResponse;
          })
          .catch((fetchError) => {
            console.warn('Fetch failed:', fetchError.message);
            
            // Provide fallback for navigation requests
            if (request.destination === 'document') {
              return caches.match('/').then(cachedResponse => {
                return cachedResponse || new Response(
                  '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please check your internet connection.</p></body></html>', 
                  { 
                    status: 503, 
                    statusText: 'Service Unavailable',
                    headers: { 'Content-Type': 'text/html' }
                  }
                );
              });
            }
            
            // For other failed requests, return a generic error response
            return new Response('Resource not available offline', { 
              status: 503, 
              statusText: 'Service Unavailable' 
            });
          });
      })
      .catch((error) => {
        console.warn('Cache match failed:', error.message);
        return new Response('Cache error', { 
          status: 503, 
          statusText: 'Service Unavailable' 
        });
      })
  );
});