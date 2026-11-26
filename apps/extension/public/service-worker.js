/**
 * Service worker «Кондитерского Рая» (PWA).
 *
 * Стратегии:
 *  - навигация: network-first -> кэш index.html -> offline.html
 *  - статика (js/css/шрифты/картинки): stale-while-revalidate
 *  - запросы к API (/api/): не кэшируем никогда
 *
 * При изменении логики кэша увеличьте CACHE_VERSION — старые кэши удалятся.
 */

const CACHE_VERSION = 'v1';
const PRECACHE = `candys-paradise-precache-${CACHE_VERSION}`;
const RUNTIME = `candys-paradise-runtime-${CACHE_VERSION}`;
const OFFLINE_URL = 'offline.html';

const PRECACHE_URLS = [
  './',
  'index.html',
  OFFLINE_URL,
  'manifest.json',
  'favicon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-512.png',
  'icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PRECACHE);
      // Кэшируем по одному: один недоступный файл не должен ломать установку.
      await Promise.all(
        PRECACHE_URLS.map(async (url) => {
          try {
            await cache.add(new Request(url, { cache: 'reload' }));
          } catch (error) {
            // Игнорируем — ресурс попадёт в кэш при первом обращении.
          }
        }),
      );
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== PRECACHE && key !== RUNTIME)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});

/** Навигация: свежий HTML из сети, при офлайне — кэш или offline.html. */
async function handleNavigation(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(PRECACHE);
      cache.put('index.html', response.clone());
    }
    return response;
  } catch (error) {
    const cache = await caches.open(PRECACHE);
    const cached = (await cache.match('index.html')) || (await cache.match('./'));
    return cached || (await cache.match(OFFLINE_URL)) || Response.error();
  }
}

/** Статика: отдаём из кэша сразу и обновляем в фоне. */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(request);

  const network = fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);

  return cached || network;
}
