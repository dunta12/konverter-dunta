/* ═══ Konverter Dunta v3.0.0 ═══ */
var kodeEl=document.getElementById('kode'),bookEl=document.getElementById('book'),frameEl=document.getElementById('frame');
var mode='html',lang='id',lastFiles='',deferredPrompt=null,frameHtml='',frameBase='';

var T={
  id:{
    tagline:'Ubah HTML, teks, Markdown, foto, atau halaman web menjadi PDF yang cantik.',
    navHome:'Beranda',navInput:'Input',navPreview:'Pratinjau',navMore:'Lainnya',
    inputTitle:'Input',previewTitle:'Pratinjau & PDF',
    steps:'Alur: 1) Input → 2) Pratinjau → 3) Simpan PDF',
    cardCode:'Tempel Kode',cardCodeDesc:'HTML / Markdown / teks',
    cardFile:'Upload File',cardFileDesc:'HTML • TXT • MD • SVG • foto',
    cardUrl:'Dari URL',cardUrlDesc:'Artikel & halaman web',
    tabCode:'Tempel Kode',tabFile:'Upload File',tabUrl:'Dari URL',
    ph:'Tempel kode HTML di sini...',
    fileLabel:'PILIH FILE',fileHint:'HTML • TXT • Markdown • SVG • JPG/PNG',
    urlBtn:'Ambil',urlPh:'https://contoh.com/artikel',
    proses:'➡ Proses',pdf:'📄 PDF',editBack:'✏ Kembali Edit',
    emptyPrev:'Belum ada pratinjau. Proses dulu dari layar Input.',
    errEmpty:'Belum ada isi untuk diproses.',
    optA5:'📏 A5 (Buku)',optA4:'📏 A4 (Dokumen)',optLetter:'📏 Letter',
    gayaBuku:'📖 Gaya Buku',gayaAsli:'🎨 Gaya Asli',
    terpilih:'Terpilih: ',install:'⬇ Install Aplikasi',
    loading:'⏳ Memuat halaman...',errUrl:'Gagal memuat halaman. Periksa alamat / koneksi.',okUrl:'✅ Halaman dimuat.',
    moreLang:'Bahasa',mPrivasi:'🔒 Kebijakan Privasi',mTentang:'ℹ️ Tentang',mBagikan:'📤 Bagikan Aplikasi',
    version:'Versi 3.0.0',
    privTitle:'Kebijakan Privasi',
    priv1:'Konverter Dunta memproses semua file langsung di perangkat Anda. Kode, dokumen, dan foto Anda tidak diunggah ke server mana pun.',
    priv2:'Aplikasi tidak mengumpulkan atau membagikan data pribadi. Jika iklan diaktifkan di kemudian hari, penyedia iklan (mis. Google AdSense) dapat menggunakan cookie sesuai kebijakan mereka sendiri.',
    aboutTitle:'Tentang',
    about1:'Konverter Dunta v3.0.0\nMengubah HTML, teks, Markdown, foto, dan halaman web menjadi PDF yang cantik.\nDibuat dengan ❤ oleh Dunta.',
    close:'Tutup',copied:'Link disalin!',installed:'Aplikasi terpasang ✅',
    shareText:'Konverter Dunta - ubah HTML jadi PDF cantik, gratis & privat.'
  },
  en:{
    tagline:'Turn HTML, text, Markdown, photos, or web pages into a beautiful PDF.',
    navHome:'Home',navInput:'Input',navPreview:'Preview',navMore:'More',
    inputTitle:'Input',previewTitle:'Preview & PDF',
    steps:'Flow: 1) Input → 2) Preview → 3) Save PDF',
    cardCode:'Paste Code',cardCodeDesc:'HTML / Markdown / text',
    cardFile:'Upload File',cardFileDesc:'HTML • TXT • MD • SVG • photos',
    cardUrl:'From URL',cardUrlDesc:'Articles & web pages',
    tabCode:'Paste Code',tabFile:'Upload File',tabUrl:'From URL',
    ph:'Paste your HTML code here...',
    fileLabel:'CHOOSE FILE',fileHint:'HTML • TXT • Markdown • SVG • JPG/PNG',
    urlBtn:'Fetch',urlPh:'https://example.com/article',
    proses:'➡ Process',pdf:'📄 PDF',editBack:'✏ Back to Edit',
    emptyPrev:'No preview yet. Process something from the Input screen first.',
    errEmpty:'Nothing to process yet.',
    optA5:'📏 A5 (Book)',optA4:'📏 A4 (Document)',optLetter:'📏 Letter',
    gayaBuku:'📖 Book Style',gayaAsli:'🎨 Original Style',
    terpilih:'Selected: ',install:'⬇ Install App',
    loading:'⏳ Loading page...',errUrl:'Failed to load page. Check address / connection.',okUrl:'✅ Page loaded.',
    moreLang:'Language',mPrivasi:'🔒 Privacy Policy',mTentang:'ℹ️ About',mBagikan:'📤 Share App',
    version:'Version 3.0.0',
    privTitle:'Privacy Policy',
    priv1:'Konverter Dunta processes all files directly on your device. Your code, documents, and photos are never uploaded to any server.',
    priv2:'The app does not collect or share personal data. If ads are enabled in the future, the ad provider (e.g. Google AdSense) may use cookies under its own policy.',
    aboutTitle:'About',
    about1:'Konverter Dunta v3.0.0\nTurns HTML, text, Markdown, photos, and web pages into beautiful PDFs.\nMade with ❤ by Dunta.',
    close:'Close',copied:'Link copied!',installed:'App installed ✅',
    shareText:'Konverter Dunta - turn HTML into beautiful PDFs, free & private.'
  }
};
function setLang(l){
  lang=l;
  try{localStorage.setItem('duntaLang',l);}catch(e){}
  var els=document.querySelectorAll('[data-i18n]');
  for(var i=0;i<els.length;i++){
    var k=els[i].getAttribute('data-i18n');
    if(T[l][k]!==undefined)els[i].textContent=T[l][k];
  }
  var phs=document.querySelectorAll('[data-i18n-ph]');
  for(var j=0;j<phs.length;j++){
    var k2=phs[j].getAttribute('data-i18n-ph');
    if(T[l][k2]!==undefined)phs[j].placeholder=T[l][k2];
  }
  document.getElementById('btnID').className='langbtn'+(l==='id'?' active':'');
  document.getElementById('btnEN').className='langbtn'+(l==='en'?' active':'');
  document.documentElement.lang=l;
  if(lastFiles){document.getElementById('namaFile').textContent=T[l].terpilih+lastFiles;}
}

function toast(msg){
  var t=document.getElementById('toast');
  t.textContent=msg;
  t.classList.add('show');
  setTimeout(function(){t.classList.remove('show');},2500);
}

function bukaLayar(n){
  var map={home:'screenHome',input:'screenInput',preview:'screenPreview',more:'screenMore'};
  var nav={home:'navHome',input:'navInput',preview:'navPreview',more:'navMore'};
  for(var k in map){
    document.getElementById(map[k]).classList.toggle('active',k===n);
    document.getElementById(nav[k]).classList.toggle('active',k===n);
  }
  if(n==='preview'){
    var ada=!!(bookEl.innerHTML)||!frameEl.hidden;
    document.getElementById('emptyPrev').style.display=ada?'none':'block';
  }
  window.scrollTo(0,0);
}
function masuk(t){pilihTab(t);bukaLayar('input');}

function bukaModal(id){document.getElementById(id).style.display='flex';}
function tutupModal(id){document.getElementById(id).style.display='none';}
function bagikan(){
  var url=location.href;
  if(navigator.share){navigator.share({title:'Konverter Dunta',text:T[lang].shareText,url:url}).catch(function(){});}
  else if(navigator.clipboard){navigator.clipboard.writeText(url).then(function(){toast(T[lang].copied);});}
  else{toast(url);}
}

function pilihTab(t){
  document.getElementById('tabCode').className=(t==='code'?'active':'');
  document.getElementById('tabFile').className=(t==='file'?'active':'');
  document.getElementById('tabUrl').className=(t==='url'?'active':'');
  document.getElementById('panelCode').style.display=(t==='code'?'block':'none');
  document.getElementById('panelFile').style.display=(t==='file'?'block':'none');
  document.getElementById('panelUrl').style.display=(t==='url'?'block':'none');
  if(t==='code')mode='html';
  if(t==='url')mode='url';
}
function ukuranNow(){return document.getElementById('ukuran').value;}
function gayaNow(){return document.getElementById('gaya').value;}
function gantiUkuran(){
  document.getElementById('pageStyle').textContent='@page{size:'+ukuranNow()+';margin:16mm 14mm 18mm}';
  if(frameHtml)setFrame();
}
function setStatus(s){document.getElementById('statusUrl').textContent=s;}
function hapusPratinjau(){
  bookEl.innerHTML='';
  bookEl.style.display='none';
  frameEl.hidden=true;
}

kodeEl.addEventListener('input',function(){
  mode='html';
  if(!kodeEl.value.trim())hapusPratinjau();
});

document.getElementById('file').addEventListener('change',function(){
  var files=this.files;
  if(!files||!files.length)return;
  var nama=[];
  for(var i=0;i<files.length;i++){nama.push(files[i].name);}
  lastFiles=nama.join(', ');
  document.getElementById('namaFile').textContent=T[lang].terpilih+lastFiles;
  var ext=(files[0].name.split('.').pop()||'').toLowerCase();
  if(ext==='jpg'||ext==='jpeg'||ext==='png'){
    mode='gambar';
    gambarKeHtml(files,function(html){tampil(html);});
    return;
  }
  var r=new FileReader();
  r.onload=function(e){
    kodeEl.value=e.target.result;
    mode=(ext==='md'||ext==='markdown')?'md':'html';
    pratinjau();
  };
  r.readAsText(files[0]);
});

function gambarKeHtml(files,selesai){
  var html='',arr=Array.prototype.slice.call(files);
  (function next(){
    var f=arr.shift();
    if(!f){selesai(html);return;}
    var r=new FileReader();
    r.onload=function(e){
      html+='<div class="hal-gambar"><img src="'+e.target.result+'"></div>';
      next();
    };
    r.readAsDataURL(f);
  })();
}
function ambilUrl(){
  var u=document.getElementById('url').value.trim();
  if(!u)return;
  if(!/^https?:\/\//i.test(u)){u='https://'+u;document.getElementById('url').value=u;}
  mode='url';
  setStatus(T[lang].loading);
  coba(u,0);
}
function coba(u,i){
  var P=[
    'https://api.allorigins.win/raw?url='+encodeURIComponent(u),
    'https://api.codetabs.com/v1/proxy?quest='+encodeURIComponent(u)
  ];
  if(i>=P.length){setStatus(T[lang].errUrl);toast(T[lang].errUrl);return;}
  fetch(P[i]).then(function(r){if(!r.ok)throw 0;return r.text();}).then(function(html){
    lastFiles=u;
    document.getElementById('namaFile').textContent=T[lang].terpilih+u;
    frameHtml=html.replace(/<script[\s\S]*?<\/script>/gi,'');
    frameBase=u;
    setFrame();
    setStatus(T[lang].okUrl);
  }).catch(function(){coba(u,i+1);});
}

function setFrame(){
  if(!frameHtml)return;
  var inj='<style>@page{size:'+ukuranNow()+';margin:16mm 14mm 18mm}</style>';
  if(frameBase)inj+='<base href="'+frameBase+'">';
  var s=frameHtml;
  if(/<head[^>]*>/i.test(s)){s=s.replace(/<head[^>]*>/i,function(m){return m+inj;});}
  else{s=inj+s;}
  frameEl.srcdoc=s;
  bookEl.style.display='none';
  frameEl.hidden=false;
}

function renderAsli(src){
  frameHtml=src.replace(/<script[\s\S]*?<\/script>/gi,'');
  frameBase='';
  setFrame();
}

function inline(s){
  return s.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\*([^*]+)\*/g,'<em>$1</em>');
}

function mdKeHtml(md){
  var lines=md.split(/\r?\n/),out=[],para=[],inList=false,inQuote=false,m;
  function tutupPara(){if(para.length){out.push('<p>'+para.join(' ')+'</p>');para=[];}}
  function tutupList(){if(inList){out.push('</ul>');inList=false;}}
  function tutupQuote(){if(inQuote){out.push('</blockquote>');inQuote=false;}}
  for(var i=0;i<lines.length;i++){
    var t=lines[i].trim();
    if(!t){tutupPara();tutupList();tutupQuote();continue;}
    if((m=t.match(/^###\s+(.*)/))){tutupPara();tutupList();tutupQuote();out.push('<h3>'+inline(m[1])+'</h3>');continue;}
    if((m=t.match(/^##\s+(.*)/))){tutupPara();tutupList();tutupQuote();out.push('<h2>'+inline(m[1])+'</h2>');continue;}
    if((m=t.match(/^#\s+(.*)/))){tutupPara();tutupList();tutupQuote();out.push('<h1>'+inline(m[1])+'</h1>');continue;}
    if((m=t.match(/^[-*]\s+(.*)/))){tutupPara();tutupQuote();if(!inList){out.push('<ul>');inList=true;}out.push('<li>'+inline(m[1])+'</li>');continue;}
    if((m=t.match(/^>\s?(.*)/))){tutupPara();tutupList();if(!inQuote){out.push('<blockquote>');inQuote=true;}out.push('<p>'+inline(m[1])+'</p>');continue;}
    tutupList();tutupQuote();para.push(inline(t));
  }
  tutupPara();tutupList();tutupQuote();
  return out.join('\n');
}

function bersihkan(src){
  var s=src.replace(/<script[\s\S]*?<\/script>/gi,'');
  s=s.replace(/<style[\s\S]*?<\/style>/gi,'');
  s=s.replace(/<link[^>]*stylesheet[^>]*>/gi,'');
  var m=s.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if(m)return m[1];
  if(src.indexOf('<')===-1){
    return src.split(/\n\n+/).map(function(t){return '<p>'+t.replace(/\n/g,'<br>')+'</p>';}).join('');
  }
  return s;
}

function tampil(html){
  frameEl.hidden=true;
  bookEl.innerHTML=html;
  bookEl.style.display='block';
}
function pratinjau(){
  if(mode==='md'){
    if(!kodeEl.value.trim()){hapusPratinjau();return;}
    tampil(mdKeHtml(kodeEl.value));return;
  }
  if(mode==='gambar'){
    if(!bookEl.innerHTML)return;
    frameEl.hidden=true;
    bookEl.style.display='block';return;
  }
  if(mode==='url'){
    if(frameHtml){setFrame();}
    else{ambilUrl();}
    return;
  }
  if(!kodeEl.value.trim()){hapusPratinjau();return;}
  if(gayaNow()==='asli'){renderAsli(kodeEl.value);}
  else{tampil(bersihkan(kodeEl.value));}
}

function proses(){
  if(mode==='html'||mode==='md'){
    if(!kodeEl.value.trim()){toast(T[lang].errEmpty);return;}
  }
  if(mode==='gambar'&&!bookEl.innerHTML){toast(T[lang].errEmpty);return;}
  pratinjau();
  bukaLayar('preview');
}

function cetakFrame(){
  try{frameEl.contentWindow.focus();frameEl.contentWindow.print();}
  catch(e){window.print();}
}

function jadikanPdf(){
  gantiUkuran();
  if(mode==='url'){
    if(!frameHtml){toast(T[lang].errEmpty);return;}
    setFrame();
    setTimeout(cetakFrame,600);
    return;
  }
  if(mode==='html'&&gayaNow()==='asli'){
    if(!kodeEl.value.trim()){toast(T[lang].errEmpty);return;}
    renderAsli(kodeEl.value);
    setTimeout(cetakFrame,600);
    return;
  }
  if(mode!=='gambar'&&!kodeEl.value.trim()){toast(T[lang].errEmpty);return;}
  pratinjau();
  setTimeout(function(){window.print();},400);
}

function setInstall(v){
  var els=document.querySelectorAll('.js-install');
  for(var i=0;i<els.length;i++)els[i].hidden=!v;
}
window.addEventListener('beforeinstallprompt',function(e){
  e.preventDefault();
  deferredPrompt=e;
  setInstall(true);
});
function pasang(){
  if(!deferredPrompt)return;
  deferredPrompt.prompt();
  deferredPrompt=null;
  setInstall(false);
}
window.addEventListener('appinstalled',function(){toast(T[lang].installed);});

try{
  var q=new URLSearchParams(location.search).get('mode');
  if(q==='code'||q==='file'||q==='url')masuk(q);
}catch(e){}
if('launchQueue' in window){
  window.launchQueue.setConsumer(function(params){
    if(params.files&&params.files.length){
      params.files[0].getFile(function(f){
        var r=new FileReader();
        r.onload=function(e){
          kodeEl.value=e.target.result;
          mode='html';
          bukaLayar('input');
          pratinjau();
        };
        r.readAsText(f);
      });
    }
  });
}

if('serviceWorker' in navigator){
  window.addEventListener('load',function(){
    navigator.serviceWorker.register('sw.js').catch(function(){});
  });
}

try{var simpan=localStorage.getItem('duntaLang');if(simpan==='en'||simpan==='id'){lang=simpan;}}catch(e){}
setLang(lang);
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  });
}
