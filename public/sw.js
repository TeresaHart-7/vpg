const CACHE = "vpg-event-v1";
const OFFLINE_URLS = [
  "/event",
  "/event/schedule",
  "/event/map",
  "/event/agreements",
  "/event/announcements",
  "/camp-map.svg",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(OFFLINE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isEventPage = url.pathname.startsWith("/event");
  const isStaticAsset =
    url.pathname === "/camp-map.svg" || url.pathname === "/manifest.json";

  if (!isEventPage && !isStaticAsset) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => cached || caches.match("/event"))
      )
  );
});
