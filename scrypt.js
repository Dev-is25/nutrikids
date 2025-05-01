const CACHE_NAME = 'nutrikids-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/icon-maskable-512x512.png',
  '/styles/main.css',
  '/scripts/app.js',
  '/screenshots/mobile.png',
  '/screenshots/desktop.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting()) // Força o novo SW a ativar imediatamente
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache); // Limpa caches antigos
          }
        })
      );
    }).then(() => self.clients.claim()) // Assume controle de todas as páginas
  );
});

self.addEventListener('fetch', (event) => {
  // Ignora requisições que não são GET ou de outros origens
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Retorna do cache se encontrado
        if (cachedResponse) {
          return cachedResponse;
        }

        // Faz a requisição e cacheia a resposta para chamadas futuras
        return fetch(event.request).then((response) => {
          // Só cacheia respostas válidas
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => cache.put(event.request, responseToCache));

          return response;
        });
      }).catch(() => {
        // Fallback para páginas offline
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/offline.html'); // Crie esta página
        }
      })
  );
});