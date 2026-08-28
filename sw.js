/* sw.js — Konverter Dunta v6: network-first, cache hanya offline */
var CACHE='kd-v6';
var CORE=['./','index.html','text.js','book.js','files.js','save.js','app.js','manifest.json','icon.svg','icon-192.png','icon-512.png'];
self.addEventListener('install',function(e){
e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(CORE);}).then(function(){return self.skipWaiting();}));
});
self.addEventListener('activate',function(e){
e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));
});
self.addEventListener('fetch',function(e){
var req=e.request;
if(req.method!=='GET')return;
var url=new URL(req.url);
if(url.origin!==location.origin)return;
if(req.mode==='navigate'){
e.respondWith(fetch(req).then(function(res){var cp=res.clone();caches.open(CACHE).then(function(c){c.put(req,cp);});return res;}).catch(function(){return caches.match(req).then(function(r){return r||caches.match('index.html');});}));
return;
}
e.respondWith(fetch(req).then(function(res){var cp=res.clone();caches.open(CACHE).then(function(c){c.put(req,cp);});return res;}).catch(function(){return caches.match(req);}));
});
