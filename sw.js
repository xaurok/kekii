// Service worker mínimo para que la app se pueda instalar.
// Guarda la página para que abra rápido; el stream y el chat siempre van por internet.
const CACHE = 'kekii-v128';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', 'manifest.json', 'icon-192.png', 'icon-512.png'])));
  // La versión nueva espera a que el usuario toque "Actualizar" en el aviso de la app
});
self.addEventListener('message', e => { if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // Primero internet (para tener siempre la última versión), si falla usa la copia guardada
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' }).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./')))
  );
});
