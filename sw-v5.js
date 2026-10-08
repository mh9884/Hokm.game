/* ============================================
   Service Worker جدید — نسخه‌ی پاک‌کننده
   این نسخه همه‌ی کش‌های قدیمی رو پاک می‌کنه
   ============================================ */

const CACHE_NAME = 'hokm-2026-v8';

/* نصب: پاک کردن تمام کش‌های قدیمی */
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.skipWaiting())
  );
});

/* فعال‌سازی: تمیزکاری نهایی */
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* دریافت: اول از شبکه، بعد از کش (network-first) */
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request).then(response => {
      if (response && response.status === 200 && response.type !== 'opaque') {
        const clone = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => cache.put(e.request, clone))
          .catch(() => {});
      }
      return response;
    }).catch(() => {
      return caches.match(e.request).then(res => {
        if (res) return res;
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
