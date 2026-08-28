'use strict';
/* book.js — mesin buku vektor: blok -> halaman PDF kualitas cetak */
var MM=function(pt){return pt*0.352778;};
var ST={
p:{fam:'times',sty:'normal',sz:11,lh:1.62,sa:2.4,align:'J'},
c:{fam:'times',sty:'normal',sz:11,lh:1.62,sa:2.4,align:'C'},
h1:{fam:'times',sty:'bold',sz:15,lh:1.5,sa:6,sb:2,align:'C',chap:true},
h2:{fam:'times',sty:'bold',sz:13,lh:1.5,sa:4,sb:3,align:'L',keep:true},
h3:{fam:'times',sty:'bold',sz:11.5,lh:1.5,sa:3,sb:2,align:'L',keep:true},
q:{fam:'times',sty:'italic',sz:10.5,lh:1.6,sa:2.8,align:'J',ind:7},
li:{fam:'times',sty:'normal',sz:11,lh:1.6,sa:1.6,align:'J',ind:5,bul:true},
v:{fam:'times',sty:'normal',sz:11,lh:1.7,sa:3,align:'C'},
pre:{fam:'courier',sty:'normal',sz:9,lh:1.5,sa:3,align:'L'}
};
function geo(){var f=$('size').value==='a4';var book=$('style').value==='book';return{W:f?210:148,H:f?297:210,book:book,gut:book?18:15,out:book?14:12,top:book?18:16,bot:book?20:16};}
function makeLines(doc,text,maxW){
var words=String(text).split(/\s+/).filter(Boolean);
var lines=[],cur=[],curW=0,spW=doc.getTextWidth(' ');
words.forEach(function(w){
var ww=doc.getTextWidth(w);
if(ww>maxW){
if(cur.length){lines.push({words:cur,last:false});cur=[];curW=0;}
var part='';
for(var i=0;i<w.length;i++){var t2=part+w[i];if(part&&doc.getTextWidth(t2)>maxW){lines.push({words:[part],last:false});part=w[i];}else part=t2;}
if(part){cur=[part];curW=doc.getTextWidth(part);}
return;
}
var add=cur.length?spW+ww:ww;
if(cur.length&&curW+add>maxW){lines.push({words:cur,last:false});cur=[w];curW=ww;}
else{cur.push(w);curW+=add;}
});
if(cur.length)lines.push({words:cur,last:false});
if(lines.length)lines[lines.length-1].last=true;
return lines;
}
function layoutVector(blocks){
var g=geo();
var doc=new window.jspdf.jsPDF({unit:'mm',format:[g.W,g.H]});
var pages=[],ops=[],y=g.top;
function left(){return g.H-g.bot-y;}
function newPage(){if(ops.length)pages.push({ops:ops});ops=[];y=g.top;}
blocks.forEach(function(b){
var st=ST[b.type]||ST.p;
var lh=MM(st.sz)*st.lh;
doc.setFont(st.fam,st.sty);doc.setFontSize(st.sz);
var cw=g.W-g.gut-g.out-(st.ind||0);
if(b.type==='hr'){if(ops.length&&left()<12)newPage();ops.push({rule:true,y:y+2});y+=6;return;}
var lines=[];
if(b.type==='v')b.lines.forEach(function(ln){lines=lines.concat(makeLines(doc,ln,cw));});
else if(b.type==='pre')b.text.split(/\n/).forEach(function(ln){lines=lines.concat(makeLines(doc,ln||' ',cw));});
else lines=makeLines(doc,b.text,cw);
if(!lines.length)return;
if(st.chap&&ops.length)newPage();
if(st.keep&&ops.length&&left()<((st.sb||0)+lh+12))newPage();
if(st.sb){if(ops.length&&left()<st.sb+lh)newPage();y+=st.sb;}
if(ops.length&&left()<lh)newPage();
if(ops.length&&lines.length>1&&left()<lh*2)newPage();
var i=0;
while(i<lines.length){
var avail=Math.max(1,Math.floor(left()/lh+0.001));
var take=Math.min(avail,lines.length-i);
if(take>1&&lines.length-i-take===1)take--;
for(var k=0;k<take;k++){
var L=lines[i+k];
var op={fam:st.fam,sty:st.sty,sz:st.sz,y:y+lh*0.8,ind:st.ind||0};
if(st.bul)op.bul=true;
if(st.align==='C'){op.s=L.words.join(' ');op.align='C';}
else if(st.align==='J'&&!L.last){op.just=L.words;op.cw=cw;}
else{op.s=L.words.join(' ');op.align='L';}
ops.push(op);y+=lh;
}
i+=take;
if(i<lines.length)newPage();
}
y+=st.sa||0;
});
if(ops.length)pages.push({ops:ops});
return pages;
}
function drawVector(doc,pages){
var g=geo();
pages.forEach(function(pg,idx){
if(idx)doc.addPage([g.W,g.H],'portrait');
var Lm=(idx%2===0)?g.gut:g.out;
var cw=g.W-g.gut-g.out;
pg.ops.forEach(function(op){
if(op.rule){doc.setDrawColor(150,150,150);doc.setLineWidth(0.3);doc.line(Lm+cw*0.35,op.y,Lm+cw*0.65,op.y);return;}
doc.setFont(op.fam,op.sty);doc.setFontSize(op.sz);doc.setTextColor(30,30,30);
if(op.bul)doc.text('•',Lm+1,op.y);
if(op.just){
var spW=doc.getTextWidth(' ');
var ws=op.just.map(function(w){return{t:w,tw:doc.getTextWidth(w)};});
var total=ws.reduce(function(a,x){return a+x.tw;},0);
var seps=ws.length-1;
var gap=seps>0?spW+(op.cw-total)/seps:spW;
var x=Lm+op.ind;
ws.forEach(function(wd,i2){if(i2)x+=gap;doc.text(wd.t,x,op.y);x+=wd.tw;});
}else if(op.align==='C'){doc.text(op.s,g.W/2,op.y,{align:'center'});}
else{doc.text(op.s,Lm+op.ind,op.y);}
});
if(g.book){doc.setFont('times','normal');doc.setFontSize(9);doc.setTextColor(140,140,140);doc.text(String(idx+1),g.W/2,g.H-8,{align:'center'});}
});
}
function blocksToHTML(blocks){return blocks.map(function(b){
if(b.type==='h'){var l=Math.min(b.level,3);return '<h'+l+' style="text-align:center">'+esc(b.text)+'</h'+l+'>';}
if(b.type==='q')return '<blockquote style="margin:8px 24px;font-style:italic">'+esc(b.text)+'</blockquote>';
if(b.type==='v')return '<p style="text-align:center;line-height:1.5">'+b.lines.map(esc).join('<br>')+'</p>';
if(b.type==='c')return '<p style="text-align:center">'+esc(b.text)+'</p>';
if(b.type==='li')return '<div style="margin:2px 0 2px 18px">• '+esc(b.text)+'</div>';
if(b.type==='pre')return '<pre style="white-space:pre-wrap;font-size:12px">'+esc(b.text)+'</pre>';
if(b.type==='hr')return '<hr>';
return '<p style="text-align:justify">'+esc(b.text)+'</p>';
}).join('');}
