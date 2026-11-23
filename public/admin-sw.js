const OFFLINE_CACHE = 'offline-v2';
const OFFLINE_URL = '/offline.html';

// Only page navigations are handled: they go to the network first, and the
// offline page is served only when the network cannot be reached at all.
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(OFFLINE_CACHE).then((cache) => cache.add(new Request(OFFLINE_URL, { cache: 'reload' }))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith('offline-') && key !== OFFLINE_CACHE).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.mode !== 'navigate' || request.method !== 'GET') return;
  event.respondWith(fetch(request).catch(async () => (await caches.match(OFFLINE_URL)) || Response.error()));
});

self.addEventListener('push', (event) => {
  let payload = {};
  try { payload = event.data?.json() || {}; } catch { payload = {}; }
  const href = typeof payload.href === 'string' &&
    (payload.href.startsWith('/deliveries/') || payload.href.startsWith('/general/customer-support/'))
    ? payload.href : '/general/operational-notifications';
  event.waitUntil(self.registration.showNotification(payload.title || 'Pohanch Admin', {
    body: payload.body || 'You have a new update.',
    icon: '/pohanch-favicon.png',
    tag: payload.id || undefined,
    data: { href },
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const href = event.notification.data?.href || '/general/operational-notifications';
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (clients) => {
    const existing = clients.find((client) => new URL(client.url).origin === self.location.origin);
    if (existing) {
      await existing.focus();
      return existing.navigate(href);
    }
    return self.clients.openWindow(href);
  }));
});
