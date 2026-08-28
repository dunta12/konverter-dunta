'use strict';
/* save.js — merakit PDF + simpan / pilih lokasi */
function pdfName(){var nm=$('fnameOut').value.trim().replace(/[\\/:*?"<>|]/g,'-');if(!nm)nm='KonverterDunta-'+new Date().toISOString().slice(0,16).replace(/[-:T]/g,'');if(!/\.pdf$/i.test(nm))nm+='.pdf';return nm;}
function buildDoc(){
if(!window.jspdf)throw new Error('Mesin PDF belum termuat — cek internet.');
if(STATE.kind==='vector'){
var g=geo();
var doc=new window.jspdf.jsPDF({unit:'mm',format:[g.W,g.H],orientation:'portrait'});
drawVector(doc,STATE.pages);
return doc;
}
var first=STATE.pages[0];
var fmt=$('size').value==='a5'?'a5':'a4';
var initFmt=fmt,initOri='portrait';
if(first.mmw){initFmt=[Math.min(first.mmw,first.mmh),Math.max(first.mmw,first.mmh)];initOri=(first.mmw>first.mmh)?'landscape':'portrait';}
var doc2=new window.jspdf.jsPDF({unit:'mm',format:initFmt,orientation:initOri});
STATE.pages.forEach(function(im,i){
if(i){
if(im.mmw)doc2.addPage([Math.min(im.mmw,im.mmh),Math.max(im.mmw,im.mmh)],(im.mmw>im.mmh)?'landscape':'portrait');
else doc2.addPage(fmt,'portrait');
}
var pw=doc2.internal.pageSize.getWidth(),ph=doc2.internal.pageSize.getHeight();
if(im.mmw)doc2.addImage(im.data,im.fmt,0,0,pw,ph);
else{var m=8;var r=Math.min((pw-2*m)/im.w,(ph-2*m)/im.h);var w=im.w*r,h=im.h*r;doc2.addImage(im.data,im.fmt,(pw-w)/2,(ph-h)/2,w,h);}
});
if($('style').value==='book'){var n=doc2.getNumberOfPages();for(var i2=1;i2<=n;i2++){doc2.setPage(i2);doc2.setFontSize(9);doc2.setTextColor(140,140,140);doc2.text(i2+' / '+n,doc2.internal.pageSize.getWidth()/2,doc2.internal.pageSize.getHeight()-4,{align:'center'});}}
return doc2;
}
async function savePDF(share){
if(busy)return;
if(!STATE){toast('⚠ Belum ada pratinjau');return;}
setBusy(true);setStatus('⏳ Menyusun PDF…');
var name=pdfName();
try{
var doc=buildDoc();
if(share){
var blob=doc.output('blob');
var file=new File([blob],name,{type:'application/pdf'});
if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:name});setStatus('✅ PDF dikirim lewat menu berbagi.');toast('✅ PDF dikirim');}
else{doc.save(name);setStatus('✅ Peramban tanpa pilih lokasi → disimpan ke Download/'+name);toast('✅ Download/'+name);}
}else{
doc.save(name);
setStatus('✅ PDF tersimpan: Download/'+name);
toast('✅ Download/'+name);
}
}catch(e){setStatus('❌ '+(e&&e.message?e.message:'Gagal menyimpan PDF.'));toast('❌ Gagal menyimpan PDF');}
finally{setBusy(false);}
}
