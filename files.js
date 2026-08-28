'use strict';
/* files.js — mesin file: kompres foto & render docx */
function compressImage(f){return new Promise(function(res,rej){
var rd=new FileReader();
rd.onload=function(){
var im=new Image();
im.onload=function(){
var max=2000,w=im.naturalWidth||800,h=im.naturalHeight||600;
var r=Math.min(1,max/Math.max(w,h));
var cw=Math.max(1,Math.round(w*r)),ch=Math.max(1,Math.round(h*r));
var cv=document.createElement('canvas');cv.width=cw;cv.height=ch;
var cx=cv.getContext('2d');cx.fillStyle='#fff';cx.fillRect(0,0,cw,ch);cx.drawImage(im,0,0,cw,ch);
res({data:cv.toDataURL('image/jpeg',0.87),w:cw,h:ch,fmt:'JPEG'});
};
im.onerror=function(){rej(new Error('Gambar rusak: '+f.name));};
im.src=rd.result;
};
rd.onerror=function(){rej(new Error('Gagal membaca '+f.name));};
rd.readAsDataURL(f);
});}
async function docxToPages(f){
if(/\.doc$/i.test(f.name))throw new Error('Format .doc lama tidak didukung. Simpan sebagai .docx dulu.');
if(!window.docx||!window.docx.renderAsync)throw new Error('Mesin Word belum termuat — cek internet.');
if(!window.html2canvas)throw new Error('Mesin render belum termuat — cek internet.');
var buf=await f.arrayBuffer();
var host=document.createElement('div');
host.style.cssText='position:absolute;left:-9999px;top:0;width:1200px;background:#fff';
document.body.appendChild(host);
try{
setStatus('⏳ Merender dokumen…');
await window.docx.renderAsync(buf,host,null,{inWrapper:true,renderHeaders:true,renderFooters:true,renderFootnotes:true,renderEndnotes:true,breakPages:true});
var nodes=host.querySelectorAll('.docx');
if(!nodes.length)nodes=[host];
var scale=nodes.length>60?2:3;
var out=[];
for(var i=0;i<nodes.length;i++){
setStatus('⏳ Memotret halaman '+(i+1)+'/'+nodes.length+'…');
var cv=await html2canvas(nodes[i],{scale:scale,backgroundColor:'#ffffff',useCORS:true,logging:false});
out.push({data:cv.toDataURL('image/jpeg',0.9),w:cv.width,h:cv.height,fmt:'JPEG',mmw:cv.width*25.4/(96*scale),mmh:cv.height*25.4/(96*scale)});
}
if(!out.length)throw new Error('Dokumen kosong.');
return out;
}finally{if(host.parentNode)host.parentNode.removeChild(host);}
}
