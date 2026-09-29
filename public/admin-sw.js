self.addEventListener('push', (event) => {
  let payload = {};
  try { payload = event.data?.json() || {}; } catch { payload = {}; }
  const href = typeof payload.href === 'string' &&
    (payload.href.startsWith('/deliveries/') || payload.href.startsWith('/general/customer-support/'))
    ? payload.href : '/general/operational-notifications';
  event.waitUntil(self.registration.showNotification(payload.title || 'Sipp admin', {
    body: payload.body || 'You have a new update.',
    icon: '/sipp-favicon.png',
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
