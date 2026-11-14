// Bump VERSION on each deploy so installed apps pick up new files.
const VERSION = "v4";
const CACHE = "jarif-" + VERSION;
const ASSETS = [
  "./", "index.html", "landing.css", "landing.js", "rates.json",
  "app/", "app/index.html", "app/app.css", "app/app.js", "app/manifest.webmanifest",
  "fonts/fonts.css", "fonts/tiro-bangla-bengali.woff2", "fonts/tiro-bangla-latin.woff2",
  "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// Stale-while-revalidate: instant offline load, silently refreshes when online.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(async (c) => {
      const hit = await c.match(e.request, { ignoreSearch: true });
      const net = fetch(e.request).then((r) => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    })
  );
});
