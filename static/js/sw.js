const CACHE_NAME = 'abmt-comercial-v57';
const ASSETS = [
    '/',
    '/static/css/style.css',
    '/static/js/app.js',
    '/static/js/forms.js',
    '/manifest.json'
];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(caches.keys().then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )));
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    // API calls: network only
    if (e.request.url.includes('/api/')) {
        e.respondWith(fetch(e.request).catch(() =>
            new Response(JSON.stringify({error: 'Sem conexão — reconecte para continuar'}),
                {headers: {'Content-Type': 'application/json'}})
        ));
        return;
    }
    // CDN assets: cache first, fallback to network and cache
    if (e.request.url.includes('cdn.jsdelivr.net') || e.request.url.includes('fonts.googleapis.com') || e.request.url.includes('fonts.gstatic.com')) {
        e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
            return res;
        })));
        return;
    }
    // Static assets: stale-while-revalidate (serve from cache instantly, update in background)
    e.respondWith(caches.match(e.request).then(cached => {
        const networkFetch = fetch(e.request).then(res => {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
            return res;
        }).catch(() => cached);
        return cached || networkFetch;
    }));
});
