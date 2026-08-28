'use strict';
/* app.js — otak UI: navigasi, draf, proses */
var $=function(id){return document.getElementById(id);};
var busy=false,pickedFiles=[],curPage='input',STATE=null,manualMode=false;
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function toast(m){var t=$('toast');t.textContent=m;t.className='show'+((m.indexOf('❌')>-1||m.indexOf('⚠')>-1)?' err':'');clearTimeout(t._h);t._h=setTimeout(function(){t.className='';},2800);}
function setStatus(s){$('status').textContent=s;$('status2').textContent=s;}
function setBusy(b){busy=b;$('btnProcess').disabled=b;$('btnSave').disabled=b;$('btnShare').disabled=b;$('btnProcess').textContent=b?'⏳ Memproses…':'➡ Proses';}
function showPage(p){curPage=p;['input','preview','more'].forEach(function(x){$('pg-'+x).classList.toggle('active',x===p);$('n-'+x).classList.toggle('active',x===p);});}
function go(p){if(p===curPage)return;try{history.pushState({page:p},'');}catch(e){}showPage(p);}
window.addEventListener('popstate',function(e){showPage((e.state&&e.state.page)||'input');});
try{history.replaceState({page:'input'},'');}catch(e){}
function tab(t){['paste','file'].forEach(function(x){$('t-'+x).classList.toggle('active',x===t);$('p-'+x).classList.toggle('hidden',x!==t);});}
function resetFiles(){pickedFiles=[];renderFiles();}
function rmFile(i){pickedFiles.splice(i,1);renderFiles();}
function renderFiles(){var el=$('flist');if(!pickedFiles.length){el.innerHTML='<em>Belum ada file.</em>';return;}el.innerHTML=pickedFiles.map(function(f,i){return '<div class="fitem"><span>'+(i+1)+'. '+esc(f.name)+'</span><button class="mini" onclick="rmFile('+i+')">✕</button></div>';}).join('');}
$('file').addEventListener('change',function(e){
var ok=0;
Array.from(e.target.files).forEach(function(f){
var isImg=f.type==='image/png'||f.type==='image/jpeg';
var isDocx=/\.docx$/i.test(f.name);
if(isImg||isDocx){pickedFiles.push(f);ok++;}
else toast('⚠ '+f.name+' tidak didukung — foto/.docx saja. Teks lewat tab Teks.');
});
e.target.value='';renderFiles();
if(ok)toast('📁 '+ok+' file diterima');
if(pickedFiles.length===1)$('fnameOut').value=pickedFiles[0].name.replace(/\.[^.]+$/,'');
});
var draftT;function queueDraft(){clearTimeout(draftT);draftT=setTimeout(function(){try{localStorage.setItem('kd-draft',JSON.stringify({code:$('code').value,size:$('size').value,style:$('style').value}));}catch(e){}},600);}
function loadDraft(){try{var d=JSON.parse(localStorage.getItem('kd-draft')||'{}');if(d.code)$('code').value=d.code;if(d.size)$('size').value=d.size;if(d.style)$('style').value=d.style;}catch(e){}}
$('code').addEventListener('input',function(){queueDraft();updCount();autoMode();});
['size','style'].forEach(function(id){$(id).addEventListener('change',queueDraft);});
function updCount(){var v=$('code').value;var w=v.trim()?v.trim().split(/\s+/).length:0;var s=w+' kata • '+v.length+' karakter';$('wcount').textContent=s;$('fsCount').textContent=s;}
function autoMode(){if(manualMode)return;var on=looksHTML($('code').value);$('code').classList.toggle('codemode',on);$('btnMode').textContent=on?'✍️ Mode Tulis':'💻 Mode Kode';}
function toggleMode(){manualMode=true;var on=$('code').classList.toggle('codemode');$('btnMode').textContent=on?'✍️ Mode Tulis':'💻 Mode Kode';}
function fsOn(){document.body.classList.add('fs');updCount();$('code').focus();}
function fsOff(){document.body.classList.remove('fs');}
function clearAll(){STATE=null;resetFiles();$('code').value='';$('fnameOut').value='';try{localStorage.removeItem('kd-draft');}catch(e){}$('pvWrap').innerHTML='<em style="color:#666">Belum ada pratinjau.</em>';$('info').textContent='';setStatus('');updCount();go('input');toast('🧹 Data dibersihkan');}
function hardReload(){toast('🔄 Memuat ulang…');if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(rs){rs.forEach(function(r){r.update();});});}setTimeout(function(){location.reload(true);},900);}
async function process(){
if(busy)return;
var act=document.querySelector('.tabs .active').id.replace('t-','');
setBusy(true);
try{
if(act==='paste'){
var t=$('code').value.trim();
if(!t)throw new Error('Isi dulu teksnya.');
setStatus('⏳ Merapikan naskah…');
var blocks=blocksFromText(t);
if(!blocks.length)throw new Error('Tidak ada isi yang bisa diproses.');
var pages=layoutVector(blocks);
STATE={kind:'vector',blocks:blocks,pages:pages};
$('pvWrap').innerHTML='<div style="font-family:Georgia,serif;font-size:15px;line-height:1.8">'+blocksToHTML(blocks)+'</div>';
$('info').textContent='📖 '+pages.length+' halaman • PDF vektor (tajam untuk cetak & Play Books)';
}else{
if(!pickedFiles.length)throw new Error('Pilih file dulu.');
var pages2=[];
for(var i=0;i<pickedFiles.length;i++){var f=pickedFiles[i];
if(f.type==='image/png'||f.type==='image/jpeg'){setStatus('⏳ Mengompres foto '+(i+1)+'…');pages2.push(await compressImage(f));}
else{var dp=await docxToPages(f);pages2=pages2.concat(dp);}
}
if(!pages2.length)throw new Error('Tidak ada isi yang bisa diproses.');
STATE={kind:'raster',pages:pages2};
$('pvWrap').innerHTML='<div style="text-align:center;color:#666;margin-bottom:8px">'+pages2.length+' halaman siap</div>'+pages2.map(function(im){return '<figure class="pgimg"><img src="'+im.data+'"></figure>';}).join('');
var bytes=pages2.reduce(function(a,im){return a+im.data.length*0.75;},0);
$('info').textContent='🖼 '+pages2.length+' halaman • ±'+(bytes/1048576).toFixed(1)+' MB • gambar DPI tinggi';
resetFiles();
}
go('preview');setStatus('✅ Pratinjau siap.');toast('✅ Pratinjau siap');
}catch(err){setStatus('❌ '+(err&&err.message?err.message:'Gagal memproses.'));toast('❌ Gagal memproses');}
finally{setBusy(false);}
}
loadDraft();updCount();autoMode();tab('paste');
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(function(){});
