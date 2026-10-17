const CACHE="lp-v8.2.1";
const SHELL=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png",
 "./vendor/leaflet.js","./vendor/leaflet.css","./vendor/leaflet.markercluster.js","./vendor/MarkerCluster.css","./vendor/MarkerCluster.Default.css","./vendor/xlsx.full.min.js"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request;
  if(r.method!=="GET")return;
  const u=new URL(r.url);
  if(u.origin!==location.origin)return; // mapas e APIs seguem direto pela rede
  // bibliotecas (vendor/) não mudam dentro de uma versão: usa o cache primeiro
  if(u.pathname.includes("/vendor/")){e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res})));return}
  e.respondWith(fetch(r,{cache:"no-cache"}).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res})
    .catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match("./index.html")).then(m=>m||new Response("Sem conexão e sem cópia salva.",{status:503,headers:{"Content-Type":"text/plain; charset=utf-8"}}))));
});
