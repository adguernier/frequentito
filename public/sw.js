/* eslint-disable no-restricted-globals */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (_) {}

  const title = payload.title || 'Frequentito';
  const options = {
    body: payload.body || 'Presence updated',
    icon: '/favicon.ico',
    data: payload.data || {},
    badge: '/favicon.ico',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      const hadWindow = clientsArr.some((win) => {
        if (win.url === url) {
          win.focus();
          return true;
        }
        return false;
      });
      if (!hadWindow) return self.clients.openWindow(url);
    })
  );
});
