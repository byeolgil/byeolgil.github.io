// ============================================================
// 별길상조 - Service Worker
// PWA 오프라인 기능 및 캐싱 지원
// ============================================================

const CACHE_NAME = 'byeolgil-v1';
const OFFLINE_URL = '/offline.html';

// 캐시할 리소스 목록
const CACHE_ASSETS = [
    '/',
    '/index.html',
    '/offline.html',
    '/manifest.json',
    '/images/1.png',
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

// 네트워크 요청 가로채기 (Cache First 전략)
self.addEventListener('fetch', (event) => {
    // Google Analytics, 외부 리소스는 캐시하지 않음
    if (event.request.url.includes('google') || 
        event.request.url.includes('fonts.') ||
        event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // 캐시에 있으면 캐시된 응답 반환
                    return cachedResponse;
                }

                // 캐시에 없으면 네트워크 요청
                return fetch(event.request)
                    .then((networkResponse) => {
                        // 유효한 응답이면 캐시에 저장
                        if (networkResponse && networkResponse.status === 200) {
                            const responseClone = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseClone);
                                });
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        // 네트워크 실패 시 오프라인 페이지 반환 (HTML 요청인 경우)
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match(OFFLINE_URL);
                        }
                    });
            })
    );
});
