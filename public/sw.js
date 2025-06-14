
const CACHE_NAME = 'gerador-pdf-v1';
const urlsToCache = [
  '/',
  '/vendas',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Tentar adicionar URLs uma por vez para evitar falhas
        return Promise.all(
          urlsToCache.map(url => {
            return cache.add(url).catch(err => {
              console.log('Failed to cache:', url, err);
              return Promise.resolve();
            });
          })
        );
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
          // Se falhar, retornar página offline simples se for navegação
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      }
    )
  );
});
