/* ══════════════════════════════════════════════════════════
   Service Worker — Almanca PWA
   Strateji: NETWORK-FIRST (önce internetten çek, yoksa cache'ten ver)
   Böylece her güncelleme anında görünür, internetsizken de açılır.
   Cache sürümü değişince eski cache otomatik silinir.
   ══════════════════════════════════════════════════════════ */
const CACHE = 'almanca-v1-2026-10-15';

// Çevrimdışı açılış için en gerekli dosyalar (ilk kurulumda cache'lenir)
const TEMEL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(TEMEL))
      .then(() => self.skipWaiting())   // yeni sürüm hemen devreye girsin
      .catch(() => {})                   // bir dosya cache'lenemezse kurulum yine de sürsün
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((adlar) => Promise.all(adlar.filter((a) => a !== CACHE).map((a) => caches.delete(a))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  // Sadece GET ve kendi kaynaklarımız; dış servisleri (Google Fonts vb.) tarayıcıya bırak
  if (req.method !== 'GET') return;

  e.respondWith(
    fetch(req)
      .then((yanit) => {
        // Başarılı yanıtı cache'e yaz (bir sonraki çevrimdışı açılış için)
        if (yanit && yanit.status === 200 && yanit.type === 'basic') {
          const kopya = yanit.clone();
          caches.open(CACHE).then((c) => c.put(req, kopya)).catch(() => {});
        }
        return yanit;
      })
      .catch(() => caches.match(req).then((c) => c || caches.match('./index.html')))
  );
});
