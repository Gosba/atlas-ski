// Atlas des stations alpines · cache hors connexion
const VERSION = "atlas-2026-10-30b";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png", "./icons/favicon-32.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    // page : réseau d'abord (pour recevoir les mises à jour), cache si hors connexion
    if (req.mode === "navigate") { e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(VERSION).then(x => x.put("./index.html", c)); return r; }).catch(() => caches.match("./index.html"))); return; }
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(n => { const c = n.clone(); caches.open(VERSION).then(x => x.put(req, c)); return n; })));
  } else if (url.hostname.endsWith("fonts.googleapis.com") || url.hostname.endsWith("fonts.gstatic.com")) {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(n => { const c = n.clone(); caches.open(VERSION).then(x => x.put(req, c)); return n; }).catch(() => r)));
  }
});
