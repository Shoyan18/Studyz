// STUDYZ Service Worker — Reliable Push & Task Reminders
const SW_VERSION = 'studyz-sw-v1.0';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle Push notifications from Web Push server
self.addEventListener('push', (event) => {
  let data = {
    title: 'Time to study 📚',
    body: 'Your scheduled study task is starting now.',
    url: '/tasks',
    tag: 'studyz-task-reminder',
    taskId: null,
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || data.message || 'Your scheduled study task is starting now.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: data.tag || (data.taskId ? `studyz-task-${data.taskId}` : 'studyz-reminder'),
    data: {
      url: data.url || (data.taskId ? `/tasks?taskId=${data.taskId}` : '/tasks'),
      taskId: data.taskId,
      notificationId: data.notificationId,
    },
    vibrate: [200, 100, 200],
    requireInteraction: true,
    actions: [
      { action: 'open', title: 'Open Task 🚀' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Time to study 📚', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/tasks';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and navigate
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client && targetUrl) {
            client.navigate(targetUrl);
          }
          return;
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Handle communication from frontend
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    const notificationOptions = {
      body: options?.body || 'Your scheduled study task is starting now.',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: options?.tag || 'studyz-task-reminder',
      data: options?.data || { url: '/tasks' },
      vibrate: [200, 100, 200],
      requireInteraction: true,
      actions: [
        { action: 'open', title: 'Open Task 🚀' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
      ...options,
    };

    self.registration.showNotification(title || 'Time to study 📚', notificationOptions);
  }
});
