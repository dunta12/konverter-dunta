'use strict';
/* text.js — mesin naskah: teks/Markdown/HTML -> blok buku */
function charSafe(s){return String(s).replace(/[\u2018\u2019]/g,"'").replace(/[\u201C\u201D]/g,'"').replace(/[\u2013\u2014]/g,'-').replace(/\u2026/g,'...').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{2190}-\u{21FF}]/gu,'');}
function cleanText(s){return charSafe(String(s||'').replace(/\u00a0/g,' ')).replace(/\r\n?/g,'\n').replace(/[ \t]+\n/g,'\n').replace(/\n[ \t]+/g,'\n').replace(/[ \t]+/g,' ').trim();}
function cleanPre(s){return charSafe(String(s||'')).replace(/\r\n?/g,'\n').replace(/[ \t]+/g,' ').trim();}
function looksHTML(t){return /<([a-z][^>]*)>/i.test(t);}
function looksMD(t){return /(^|\n)#{1,3}\s|\*\*[^*]+\*\*|(^|\n)\s*[-*]\s/.test(t);}
function chapterLike(t){return /^(bab|chapter|bagian)\s+\d+/i.test(t)||/^(prolog|epilog|pendahuluan|penutup|daftar\s+isi|kata\s+(pengantar|sambutan|penutup))$/i.test(t);}
function leafText(el){
var s='';
(function rec(n){
Array.from(n.childNodes).forEach(function(c){
if(c.nodeType===3)s+=c.textContent;
else if(c.nodeType===1){var t=c.tagName.toLowerCase();if(t==='br')s+='\n';else if(t!=='script'&&t!=='style')rec(c);}
});
})(el);
return s;
}
function pushLeaf(blocks,t,center){
if(!t)return;
if(chapterLike(t)&&t.length<=60){blocks.push({type:'h',level:1,text:t});return;}
if(t.indexOf('\n')>-1){
var ls=t.split(/\n/).map(function(x){return x.trim();}).filter(Boolean);
if(!ls.length)return;
if(ls.every(function(x){return x.length<=60;})){
var vs=[];
ls.forEach(function(x){if(chapterLike(x)&&x.length<=60){if(vs.length){blocks.push({type:'v',lines:vs});vs=[];}blocks.push({type:'h',level:1,text:x});}else vs.push(x);});
if(vs.length)blocks.push({type:'v',lines:vs});
return;
}
blocks.push({type:'p',text:ls.join(' ')});
return;
}
if(center&&t.length<=80){blocks.push({type:'c',text:t});return;}
blocks.push({type:'p',text:t});
}
function blocksFromHTML(html){
var doc=new DOMParser().parseFromString(html,'text/html');
var root=doc.body||doc.documentElement;
var blocks=[];
function isC(el){var st=el.getAttribute('style')||'';return /text-align\s*:\s*center/i.test(st)||(el.getAttribute('align')||'').toLowerCase()==='center';}
function walk(node){
Array.from(node.childNodes).forEach(function(n){
if(n.nodeType===3){pushLeaf(blocks,cleanText(n.textContent),false);return;}
if(n.nodeType!==1)return;
var tag=n.tagName.toLowerCase();
if(['script','style','head','meta','link','title','img','svg','button','nav','iframe'].indexOf(tag)>-1)return;
if(tag==='h1')blocks.push({type:'h',level:1,text:cleanText(n.textContent)});
else if(tag==='h2')blocks.push({type:'h',level:2,text:cleanText(n.textContent)});
else if(/^h[3-6]$/.test(tag))blocks.push({type:'h',level:3,text:cleanText(n.textContent)});
else if(tag==='blockquote'){var q=cleanText(n.textContent);if(q)blocks.push({type:'q',text:q});}
else if(tag==='ul'||tag==='ol'){Array.from(n.querySelectorAll('li')).forEach(function(li){var t=cleanText(li.textContent);if(t)blocks.push({type:'li',text:t});});}
else if(tag==='pre'){var p=cleanPre(n.textContent);if(p)blocks.push({type:'pre',text:p});}
else if(tag==='hr')blocks.push({type:'hr'});
else if(tag==='table'){Array.from(n.querySelectorAll('tr')).forEach(function(tr){var t=cleanText(Array.from(tr.cells||[]).map(function(c){return c.textContent;}).join(' - '));if(t)blocks.push({type:'li',text:t});});}
else if(/^(p|div|section|article|header|footer|figure|figcaption)$/.test(tag)){
var hasBlock=Array.from(n.children).some(function(c){return /^(p|div|h[1-6]|ul|ol|table|blockquote|pre|hr|section|article)$/i.test(c.tagName);});
if(hasBlock)walk(n);
else pushLeaf(blocks,cleanText(leafText(n)),isC(n));
}
else walk(n);
});
}
walk(root);
return blocks;
}
function blocksFromPlain(text){
var blocks=[];
text.split(/\n{2,}/).forEach(function(par){
var lines=par.split(/\n/).map(function(l){return l.trim();}).filter(Boolean);
if(!lines.length)return;
if(lines.length===1){pushLeaf(blocks,lines[0],false);return;}
var allShort=lines.every(function(l){return l.length<=60;});
if(allShort){
var vs=[];
lines.forEach(function(l){if(chapterLike(l)&&l.length<=60){if(vs.length){blocks.push({type:'v',lines:vs});vs=[];}blocks.push({type:'h',level:1,text:l});}else vs.push(l);});
if(vs.length)blocks.push({type:'v',lines:vs});
}else blocks.push({type:'p',text:lines.join(' ')});
});
return blocks;
}
function blocksFromText(t){if(looksHTML(t))return blocksFromHTML(t);if(looksMD(t)&&window.marked){try{return blocksFromHTML(marked.parse(t));}catch(e){}}return blocksFromPlain(t);}
