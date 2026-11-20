// ============================================================
// 별길상조 - Service Worker
// PWA 오프라인 기능 및 캐싱 지원
// ============================================================

const CACHE_NAME = 'byeolgil-v4';
const OFFLINE_URL = '/offline.html';

// 캐시할 정적 리소스 목록
const CACHE_ASSETS = [
    '/offline.html',
    '/manifest.json',
    '/images/hero_main.jpg',
    '/images/2.png',
    '/images/3.png',
    '/images/4.png',
    '/images/6.png',
    '/images/7.png',
    '/images/8.png',
    '/images/9.png'
];

// Service Worker 설치
self.addEventListener('install', (event) => {
    console.log('[SW] 설치 중...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] 리소스 캐싱 중...');
                return cache.addAll(CACHE_ASSETS);
            })
            .then(() => {
                console.log('[SW] 설치 완료');
                return self.skipWaiting();
            })
    );
});

// Service Worker 활성화
self.addEventListener('activate', (event) => {
    console.log('[SW] 활성화 중...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[SW] 이전 캐시 삭제:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] 활성화 완료');
                return self.clients.claim();
            })
    );
});

// 네트워크 요청 가로채기
// - HTML / JSON / version.txt: Network First (항상 최신 콘텐츠 우선 제공)
// - 정적 이미지 등: Cache First
self.addEventListener('fetch', (event) => {
    const url = event.request.url;

    // 외부 리소스(GA, 폰트 등) 및 GET 이외 요청, version.txt는 그대로 통과
    if (url.includes('google') ||
        url.includes('fonts.') ||
        url.includes('version.txt') ||
        event.request.method !== 'GET') {
        return;
    }

    const acceptHeader = event.request.headers.get('accept') || '';
    const isHtmlOrData = event.request.mode === 'navigate' ||
        acceptHeader.includes('text/html') ||
        url.includes('.json');

    if (isHtmlOrData) {
        event.respondWith(
            fetch(event.request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200 && !url.includes('stats.json')) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => {
                    return caches.match(event.request).then((cached) => {
                        if (cached) return cached;
                        if (acceptHeader.includes('text/html')) {
                            return caches.match(OFFLINE_URL);
                        }
                    });
                })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request)
                    .then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            const responseClone = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseClone);
                                });
                        }
                        return networkResponse;
                    });
            })
    );
});
