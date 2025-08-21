const CACHE_NAME = '3sisters-restaurant-v3'; // 相対パス対応
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './restaurants-db.js',
  './sound-effects.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon-180.png'
];

// サービスワーカーのインストール
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('キャッシュを開始');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('すべてのファイルをキャッシュしました');
        return self.skipWaiting();
      })
  );
});

// サービスワーカーのアクティベート
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('古いキャッシュを削除:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('サービスワーカーがアクティブになりました');
      return self.clients.claim();
    })
  );
});

// ネットワークリクエストの処理
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // キャッシュにあれば返す
        if (response) {
          console.log('キャッシュからファイルを取得:', event.request.url);
          return response;
        }
        
        // キャッシュになければネットワークから取得
        console.log('ネットワークからファイルを取得:', event.request.url);
        return fetch(event.request);
      })
  );
});