// Petit service worker : met le site en cache pour qu'il s'ouvre même sans réseau.
const CACHE_NAME = 'jeanne-site-v3';
const PRECACHE = [
    './',
    './index.html',
    './manifest.webmanifest',
    './css/fonts.css',
    './css/style.css',
    './css/animations.css',
    './css/responsive.css',
    './js/main.js',
    './js/lock.js',
    './js/navigation.js',
    './js/countdown.js',
    './js/music.js',
    './js/timeline.js',
    './js/letters.js',
    './js/gallery.js',
    './js/quiz.js',
    './js/questions.js',
    './js/surprise.js',
    './js/distance.js',
    './js/offlinemap.js',
    './js/tree.js',
    './js/pdf.js',
    './js/features.js',
    './assets/icon.svg',
    './assets/icon-180.png',
    './assets/icon-192.png',
    './assets/icon-512.png',
    './assets/icon-maskable-512.png',
    './assets/earth-blue-marble.jpg',
    './assets/images/jeanne.jpg',
    './assets/audio/musique-de-fond.mp3',
    './assets/audio/voice-message-1.mp3',
    './assets/audio/voice-message-2.mp3',
    './assets/fonts/inter-300-latin.woff2',
    './assets/fonts/inter-400-latin.woff2',
    './assets/fonts/inter-500-latin.woff2',
    './assets/fonts/inter-600-latin.woff2',
    './assets/fonts/inter-700-latin.woff2',
    './assets/fonts/kalam-300-latin.woff2',
    './assets/fonts/kalam-400-latin.woff2',
    './assets/fonts/kalam-700-latin.woff2',
    './assets/fonts/patrick-hand-400-latin.woff2',
    './assets/vendor/html2canvas.min.js',
    './assets/vendor/jspdf.umd.min.js',
    './assets/vendor/three.min.js',
    './assets/vendor/leaflet.min.css',
    './assets/vendor/leaflet.min.js',
    './assets/vendor/topojson-client.min.js',
    './assets/data/land-110m.json',
    './assets/vendor/images/layers.png',
    './assets/vendor/images/layers-2x.png',
    './assets/vendor/images/marker-icon.png',
    './assets/vendor/images/marker-icon-2x.png',
    './assets/vendor/images/marker-shadow.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;

    // Le HTML et le manifest : réseau d'abord, cache en secours
    if (event.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('.webmanifest')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
                    return response;
                })
                .catch(() => caches.match(event.request).then(r => r || caches.match('./index.html')))
        );
        return;
    }

    // Le reste : cache d'abord, réseau en secours
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
                if (response.ok) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
                }
                return response;
            });
        })
    );
});
