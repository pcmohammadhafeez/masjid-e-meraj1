/*
 * Prayer-time push notifications.
 *
 * Loaded by the generated offline worker via importScripts, so notification
 * behaviour stays exactly as before while offline caching is added alongside.
 */

self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {
      title: "Masjid-e-Meraj",
      body: "Prayer time is approaching.",
    };
  }

  const title = data.title || "Masjid-e-Meraj";

  const options = {
    body: data.body || "Prayer time is approaching.",
    icon: data.icon || "/favicon.ico",
    badge: data.badge || "/favicon.ico",
    tag: data.tag || "masjid-e-meraj-prayer",
    requireInteraction: true,
    data: { url: data.url || "/" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }

        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      }),
  );
});
