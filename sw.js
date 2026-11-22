// Service worker: يخلي الموقع يفتح بسرعة وحتى بدون إنترنت
const SHELL = 'emad-shell-v1', IMGS = 'emad-images-v1';
self.addEventListener('install', e => { e.waitUntil(caches.open(SHELL).then(c => c.addAll(['./', 'index.html', 'logo.png', 'manifest.webmanifest']).catch(() => {}))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== SHELL && k !== IMGS).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== location.origin) return;
  if (url.pathname.includes('/data/images/')) {           // الصور: من الكاش أولاً
    e.respondWith(caches.open(IMGS).then(async c => { const hit = await c.match(req); if (hit) return hit; const res = await fetch(req); if (res.ok) c.put(req, res.clone()); return res; }));
    return;
  }
  if (url.pathname.endsWith('.json') || url.pathname.endsWith('.apk')) return; // البيانات: دائماً من الشبكة
  e.respondWith(fetch(req).then(res => { if (res.ok) { const copy = res.clone(); caches.open(SHELL).then(c => c.put(req, copy)); } return res; }).catch(() => caches.match(req).then(r => r || caches.match('index.html'))));
});
