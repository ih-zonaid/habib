// Bump VERSION on each deploy so installed apps pick up new files.
const VERSION = "v9";
const CACHE = "jarif-" + VERSION;
const ASSETS = [
  "./", "index.html", "landing.css", "landing.js", "rates.json",
  "app/", "app/index.html", "app/app.css", "app/app.js", "app/manifest.webmanifest",
  "fonts/fonts.css", "fonts/tiro-bangla-bengali.woff2", "fonts/tiro-bangla-latin.woff2",
  "icons/icon-192.png", "icons/icon-512.png",
  "icons/ui/brick-wall.svg", "icons/ui/download.svg", "icons/ui/gem.svg", "icons/ui/grid-2x2.svg", "icons/ui/hammer.svg", "icons/ui/layers.svg", "icons/ui/lock.svg", "icons/ui/map-pin.svg", "icons/ui/message-circle.svg", "icons/ui/phone.svg", "icons/ui/ruler.svg", "icons/ui/send.svg", "icons/ui/settings.svg", "icons/ui/shield-check.svg", "icons/ui/sparkles.svg", "icons/ui/stairs.svg"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// Network-first: always the newest files when online, cached copy when offline.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(async (c) => {
      try {
        const r = await fetch(e.request, { cache: "no-cache" });
        if (r.ok) c.put(e.request, r.clone());
        return r;
      } catch (err) {
        return (await c.match(e.request, { ignoreSearch: true })) || Response.error();
      }
    })
  );
});
