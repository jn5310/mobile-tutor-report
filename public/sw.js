// 오프라인 지원용 서비스 워커
// 학생 집처럼 인터넷이 약한 곳에서도 홈 화면 앱이 열리도록 앱 파일을 폰에 보관합니다.
// - 화면(HTML): 인터넷 먼저, 안 되면 보관본
// - /assets/ 의 JS/CSS: 파일 이름에 해시가 붙어 있어 보관본 먼저
// - 그 밖의 파일(아이콘 등): 보관본을 먼저 보여 주고 뒤에서 새로 받아 둠
// 학생 데이터는 LocalStorage 에 있으며 서비스 워커와 관계없습니다.

const CACHE = 'tutor-report-v3'
// 앱이 올라간 경로. Vercel 은 '/', GitHub Pages 는 '/mobile-tutor-report/'.
const BASE = new URL(self.registration.scope).pathname
const INDEX = `${BASE}index.html`
const SHELL = ['', 'index.html', 'manifest.json', 'favicon.svg', 'icons/icon-192.png', 'icons/icon-512.png'].map(
  (p) => BASE + p,
)

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') {
    return
  }
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) {
    return
  }

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(INDEX, copy))
          return res
        })
        .catch(() => caches.match(INDEX).then((r) => r || caches.match(BASE))),
    )
    return
  }

  if (url.pathname.startsWith(`${BASE}assets/`)) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone()
              caches.open(CACHE).then((c) => c.put(req, copy))
            }
            return res
          }),
      ),
    )
    return
  }

  event.respondWith(
    caches.match(req).then((hit) => {
      const network = fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(req, copy))
          }
          return res
        })
        .catch(() => hit)
      return hit || network
    }),
  )
})
