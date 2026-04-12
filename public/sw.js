// Service Worker for Saku Maku PWA
// Caches the app shell and handles fetch events for offline functionality

const CACHE_NAME = 'saku-maku-v1';
const APP_SHELL_CACHE = 'saku-maku-shell-v1';
const DYNAMIC_CACHE = 'saku-maku-dynamic-v1';

// App shell files to cache on install
const APP_SHELL_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
  '/favicon.png',
  '/icon.svg'
];

// Install event - cache the app shell
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(APP_SHELL_CACHE)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(APP_SHELL_FILES);
      })
      .then(() => {
        // Force the waiting service worker to become active
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Install failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old caches that don't match our current cache names
            if (cacheName !== APP_SHELL_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Take control of all pages immediately
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('[Service Worker] Activation failed:', error);
      })
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests and non-GET requests
  if (!event.request.url.startsWith(self.location.origin) || event.request.method !== 'GET') {
    return;
  }

  // Skip Chrome Extension requests
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Cache hit - return the cached response
        if (cachedResponse) {
          // For HTML files, try to fetch from network in background to update cache
          if (event.request.headers.get('accept')?.includes('text/html')) {
            fetchAndCache(event.request);
          }
          return cachedResponse;
        }

        // Cache miss - fetch from network
        return fetchAndCache(event.request);
      })
      .catch((error) => {
        console.error('[Service Worker] Fetch failed:', error);
        
        // If it's a navigation request and we're offline, serve the cached index.html
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        
        // Otherwise, return a basic offline response
        return new Response('Offline - No cached data available', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      })
  );
});

// Helper function to fetch from network and cache the response
function fetchAndCache(request) {
  return fetch(request)
    .then((response) => {
      // Check if we received a valid response
      if (!response || response.status !== 200 || response.type !== 'basic') {
        return response;
      }

      // Clone the response since we can only consume it once
      const responseToCache = response.clone();

      // Cache the fetched resource
      caches.open(DYNAMIC_CACHE)
        .then((cache) => {
          // Only cache same-origin resources
          if (request.url.startsWith(self.location.origin)) {
            cache.put(request, responseToCache);
          }
        })
        .catch((error) => {
          console.error('[Service Worker] Cache put failed:', error);
        });

      return response;
    })
    .catch((error) => {
      console.error('[Service Worker] Network fetch failed:', error);
      throw error;
    });
}

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
