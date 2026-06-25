// FastTrackerPro / EuroTransit Web Push service worker.
// Dedicated messaging worker — NOT an app-shell/offline cache.
self.addEventListener('push', (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch { payload = { body: event.data && event.data.text() }; }
  const title = payload.title || 'EuroTransit';
  const options = {
    body: payload.body || 'Vous avez un nouveau message.',
    icon: payload.icon || '/favicon.ico',
    badge: '/favicon.ico',
    tag: payload.tag || 'eurotransit-chat',
    data: { url: payload.url || '/' },
    vibrate: [120, 60, 120],
    renotify: true,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ('focus' in c) { c.navigate(url); return c.focus(); }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    }),
  );
});
