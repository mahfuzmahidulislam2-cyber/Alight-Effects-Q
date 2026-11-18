// Network-first (so updates show up while developing), cache fallback for offline.
const V='aeq-v0.1.0';
const FILES=['./','./index.html','./manifest.webmanifest','./assets/logo.png','./assets/icon-192.png','./assets/icon-512.png',
'./app/main.js','./core/events.js','./core/project.js','./core/samples.js','./core/transport.js','./render/compositor.js',
'./ui/dom.js','./ui/icons.js','./ui/home.js','./ui/editor.js','./ui/timelineView.js','./ui/styles/theme.css','./ui/styles/app.css'];
self.addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;
e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(V).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)))});
