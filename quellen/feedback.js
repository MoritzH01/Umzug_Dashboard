// Feedback aus der App: kleiner Knopf unten links auf Tafel, Liste und 3D.
// Einträge landen in Supabase docs (coll "feedback"), Claude liest sie mit quellen/feedback.py.
(function(){
var errs=[];
function keep(m){errs.push({am:new Date().toISOString(),text:String(m).slice(0,400)});if(errs.length>8)errs.shift()}
window.addEventListener("error",function(e){keep((e.message||"Fehler")+(e.filename?" @ "+e.filename.split("/").pop()+":"+e.lineno:""))});
window.addEventListener("unhandledrejection",function(e){var r=e.reason;keep("Promise: "+(r&&r.message||r))});

var ARTEN=[["fehler","Fehler"],["funktion","Funktion"],["bedienung","Bedienung"]];
var STAT={offen:"offen","in arbeit":"in arbeit",erledigt:"erledigt"};
var sb=null,user=null,list={},ui={tab:"neu",art:"fehler",bild:null,ctx:true},root,panel;

function client(){if(sb)return sb;var C=window.UMZUG_CONFIG||{};if(window.__sb)return sb=window.__sb;
  if(!C.supabaseUrl||!window.supabase)return null;
  return sb=window.supabase.createClient(C.supabaseUrl,C.supabaseKey,{auth:{persistSession:true,autoRefreshToken:true}})}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function seite(){var p=location.pathname.split("/").pop()||"index.html";return p==="index.html"?"tafel":p==="liste.html"?"liste":p==="3d.html"?"3d":p}
function datum(s){var d=new Date(s);return isNaN(d)?"":d.toLocaleDateString("de-DE",{day:"numeric",month:"numeric"})+" "+d.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})}

var css='#fb-btn{position:fixed;left:14px;bottom:14px;z-index:70;font:500 13px/1 system-ui,sans-serif;color:#1c2a4b;background:#fff;border:1px solid #1c2a4b;border-radius:999px;padding:7px 12px;cursor:pointer;box-shadow:0 1px 4px rgba(28,42,75,.15)}'
+'#fb-btn.fb-nav{position:static;border:0;box-shadow:none;background:none;padding:8px 12px;font:500 14px var(--sans,system-ui);cursor:pointer}body.fb-top #fb-p{left:auto;right:14px;top:76px;bottom:auto}'
+'#fb-btn b{display:inline-block;min-width:16px;margin-left:6px;padding:1px 4px;border-radius:8px;background:#1c2a4b;color:#fff;font-size:11px}'
+'#fb-p{position:fixed;left:14px;bottom:56px;z-index:71;width:min(380px,calc(100vw - 28px));max-height:min(620px,calc(100vh - 80px));overflow:auto;background:#fffdf8;color:#1c2a4b;border:1px solid #1c2a4b;font:14px/1.4 system-ui,sans-serif;box-shadow:0 8px 30px rgba(28,42,75,.18)}'
+'#fb-p header{display:flex;gap:4px;align-items:center;padding:10px 12px 0}#fb-p header h3{margin:0 auto 0 0;font-size:16px;font-weight:600;text-transform:lowercase}'
+'#fb-p .tb{border:0;background:none;color:inherit;font:inherit;padding:4px 8px;cursor:pointer;opacity:.6;border-bottom:2px solid transparent}#fb-p .tb.on{opacity:1;border-color:#1c2a4b}'
+'#fb-p .x{border:0;background:none;font-size:20px;line-height:1;color:inherit;cursor:pointer;padding:2px 4px}'
+'#fb-p .bd{padding:12px;display:grid;gap:10px}#fb-p .chips{display:flex;gap:6px}#fb-p .chip{flex:1;border:1px solid #c9cfdb;background:#fff;color:inherit;font:inherit;padding:6px;cursor:pointer;border-radius:4px}#fb-p .chip.on{border-color:#1c2a4b;background:#1c2a4b;color:#fff}'
+'#fb-p textarea{width:100%;box-sizing:border-box;min-height:110px;font:inherit;color:inherit;border:1px solid #c9cfdb;padding:8px;resize:vertical;background:#fff}'
+'#fb-p .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}#fb-p .lk{border:1px dashed #8a93a8;background:none;color:inherit;font:inherit;font-size:13px;padding:5px 9px;cursor:pointer;border-radius:4px}'
+'#fb-p .go{border:0;background:#1c2a4b;color:#fff;font:inherit;font-weight:600;padding:8px 14px;cursor:pointer;border-radius:4px;margin-left:auto}#fb-p .go:disabled{opacity:.4}'
+'#fb-p .mut{font-size:12px;opacity:.65}#fb-p label.ck{display:flex;gap:6px;align-items:center;font-size:13px}'
+'#fb-p .th{position:relative;display:inline-block}#fb-p .th img{max-width:120px;max-height:80px;border:1px solid #c9cfdb;display:block}#fb-p .th button{position:absolute;top:-8px;right:-8px;border:0;border-radius:50%;width:20px;height:20px;background:#1c2a4b;color:#fff;cursor:pointer;line-height:20px;padding:0}'
+'#fb-p .it{border-top:1px solid #e4e1d8;padding:10px 0;display:grid;gap:4px}#fb-p .it:first-child{border-top:0}#fb-p .it p{margin:0;white-space:pre-wrap}#fb-p .it img{max-width:100%;max-height:160px;border:1px solid #c9cfdb}'
+'#fb-p .st{font-size:11px;padding:1px 6px;border-radius:8px;border:1px solid currentColor}#fb-p .st.offen{color:#c2410c}#fb-p .st.arbeit{color:#2f4ee0}#fb-p .st.erledigt{color:#3f7d4e}'
+'#fb-p .an{background:#eef1f8;padding:6px 8px;font-size:13px}#fb-p .ac{display:flex;gap:10px;font-size:12px}#fb-p .ac a{color:inherit}';

function mount(){if(root)return;var s=document.createElement("style");s.textContent=css;document.head.appendChild(s);
  root=document.createElement("button");root.id="fb-btn";root.type="button";root.title="Fehler, Wünsche oder Verbesserungen melden";root.onclick=function(){panel?close():open()};
  var nav=document.getElementById("to-3d")||document.getElementById("to-list");
  if(nav){root.className="navl fb-nav";nav.parentNode.insertBefore(root,nav.nextSibling);document.body.classList.add("fb-top")}else document.body.appendChild(root);count()}
function count(){if(!root)return;var n=Object.keys(list).filter(function(k){return list[k].status!=="erledigt"}).length;root.innerHTML="feedback"+(n?"<b>"+n+"</b>":"")}
function close(){if(panel){panel.remove();panel=null}}
function open(){panel=document.createElement("div");panel.id="fb-p";document.body.appendChild(panel);render();load()}
function load(){var c=client();if(!c)return;c.from("docs").select("id,data").eq("coll","feedback").then(function(r){if(r.error)return;list={};r.data.forEach(function(x){list[x.id]=x.data});count();if(panel&&ui.tab==="bisher")render()})}

function render(){if(!panel)return;var n=Object.keys(list).filter(function(k){return list[k].status!=="erledigt"}).length;
  panel.innerHTML='<header><h3>feedback</h3><button class="tb'+(ui.tab==="neu"?" on":"")+'" data-t="neu">neu</button><button class="tb'+(ui.tab==="bisher"?" on":"")+'" data-t="bisher">bisher'+(n?" ("+n+")":"")+'</button><button class="x" title="schließen">×</button></header><div class="bd">'+(ui.tab==="neu"?neu():bisher())+'</div>';
  panel.querySelector(".x").onclick=close;
  [].forEach.call(panel.querySelectorAll(".tb"),function(b){b.onclick=function(){ui.tab=b.dataset.t;render()}});
  if(ui.tab==="neu")wireNeu();else wireBisher()}

function neu(){return '<div class="chips">'+ARTEN.map(function(a){return '<button class="chip'+(ui.art===a[0]?" on":"")+'" data-a="'+a[0]+'">'+a[1]+'</button>'}).join("")+'</div>'
  +'<textarea id="fb-t" placeholder="Was ist passiert, was fehlt, was nervt? Bild einfügen geht auch mit Strg+V.">'+esc(ui.text||"")+'</textarea>'
  +'<div class="row"><button class="lk" id="fb-f">Bild anhängen</button>'+(navigator.mediaDevices&&navigator.mediaDevices.getDisplayMedia?'<button class="lk" id="fb-s">Bildschirmfoto</button>':"")
  +(ui.bild?'<span class="th"><img src="'+ui.bild+'" alt=""><button id="fb-rm" title="Bild entfernen">×</button></span>':"")+'<input type="file" id="fb-i" accept="image/*" hidden></div>'
  +'<label class="ck"><input type="checkbox" id="fb-c"'+(ui.ctx?" checked":"")+'> Seite, Gerät und letzte Fehlermeldungen mitschicken</label>'
  +'<div class="row"><span class="mut" id="fb-m">'+esc(ui.msg||"")+'</span><button class="go" id="fb-go">Senden</button></div>'}

function wireNeu(){var t=panel.querySelector("#fb-t");t.oninput=function(){ui.text=t.value};
  t.onpaste=function(e){var f=[].filter.call((e.clipboardData||{}).files||[],function(f){return /^image\//.test(f.type)})[0];if(f){e.preventDefault();bild(f)}};
  [].forEach.call(panel.querySelectorAll(".chip"),function(b){b.onclick=function(){ui.art=b.dataset.a;render()}});
  var i=panel.querySelector("#fb-i");panel.querySelector("#fb-f").onclick=function(){i.click()};i.onchange=function(){if(i.files[0])bild(i.files[0])};
  var s=panel.querySelector("#fb-s");if(s)s.onclick=shot;
  var rm=panel.querySelector("#fb-rm");if(rm)rm.onclick=function(){ui.bild=null;render()};
  panel.querySelector("#fb-c").onchange=function(e){ui.ctx=e.target.checked};
  panel.querySelector("#fb-go").onclick=send;t.focus()}

function shrink(src,cb){var im=new Image();im.onload=function(){var k=Math.min(1,1400/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext("2d").drawImage(im,0,0,c.width,c.height);cb(c.toDataURL("image/jpeg",.78))};im.src=src}
function bild(f){var r=new FileReader();r.onload=function(){shrink(r.result,function(d){ui.bild=d;render()})};r.readAsDataURL(f)}
function shot(){navigator.mediaDevices.getDisplayMedia({video:{displaySurface:"browser"},preferCurrentTab:true}).then(function(st){
  var v=document.createElement("video");v.muted=true;v.srcObject=st;panel.style.visibility="hidden";root.style.visibility="hidden";
  v.play().then(function(){setTimeout(function(){var c=document.createElement("canvas");c.width=v.videoWidth;c.height=v.videoHeight;c.getContext("2d").drawImage(v,0,0);
    st.getTracks().forEach(function(t){t.stop()});panel.style.visibility="";root.style.visibility="";shrink(c.toDataURL("image/png"),function(d){ui.bild=d;render()})},400)})
}).catch(function(){})}

function send(){var c=client(),text=(ui.text||"").trim();if(!text&&!ui.bild){ui.msg="Bitte kurz beschreiben.";render();return}
  if(!c){ui.msg="Keine Datenbank erreichbar.";render();return}
  var id=new Date().toISOString().replace(/\D/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,6),
    d={art:ui.art,text:text,seite:seite(),url:location.pathname.split("/").pop()+location.search+location.hash,von:user&&user.email||"",am:new Date().toISOString(),status:"offen",antwort:""};
  if(ui.bild)d.bild=ui.bild;
  if(ui.ctx)d.kontext={fenster:innerWidth+"×"+innerHeight,dpr:devicePixelRatio,geraet:navigator.userAgent,titel:document.title,fehler:errs.slice()};
  var b=panel.querySelector("#fb-go");b.disabled=true;b.textContent="Sende …";
  c.from("docs").upsert({coll:"feedback",id:id,data:d,updated_at:new Date().toISOString()}).then(function(r){
    if(r.error){ui.msg="Das hat nicht geklappt: "+r.error.message;render();return}
    list[id]=d;ui.text="";ui.bild=null;ui.msg="";ui.tab="bisher";count();render()})}

function bisher(){var ks=Object.keys(list).sort().reverse();if(!ks.length)return '<p class="mut">Noch kein Feedback.</p>';
  return '<div>'+ks.map(function(k){var d=list[k],st=d.status||"offen",a=ARTEN.filter(function(x){return x[0]===d.art})[0];
    return '<div class="it"><div class="row"><span class="st '+(st==="in arbeit"?"arbeit":st)+'">'+esc(STAT[st]||st)+'</span><b>'+esc(a?a[1]:d.art)+'</b><span class="mut">'+esc(d.seite)+' · '+datum(d.am)+(d.von?" · "+esc(d.von.split("@")[0]):"")+'</span></div>'
      +(d.text?'<p>'+esc(d.text)+'</p>':"")+(d.bild?'<img src="'+d.bild+'" alt="">':"")+(d.antwort?'<div class="an">'+esc(d.antwort)+'</div>':"")
      +'<div class="ac"><a href="#" data-s="'+k+'">'+(st==="erledigt"?"wieder öffnen":"als erledigt markieren")+'</a><a href="#" data-d="'+k+'">löschen</a></div></div>'}).join("")+'</div>'}
function wireBisher(){var c=client();
  [].forEach.call(panel.querySelectorAll("[data-s]"),function(a){a.onclick=function(e){e.preventDefault();var k=a.dataset.s,d=Object.assign({},list[k]);d.status=d.status==="erledigt"?"offen":"erledigt";list[k]=d;count();render();
    c.from("docs").upsert({coll:"feedback",id:k,data:d,updated_at:new Date().toISOString()}).then(function(){})}});
  [].forEach.call(panel.querySelectorAll("[data-d]"),function(a){a.onclick=function(e){e.preventDefault();var k=a.dataset.d;if(a.dataset.ok!=="1"){a.dataset.ok="1";a.textContent="wirklich löschen?";return}
    delete list[k];count();render();c.from("docs").delete().eq("coll","feedback").eq("id",k).then(function(){})}})}

function boot(){var c=client();if(!c)return;
  c.auth.getSession().then(function(r){var s=r.data&&r.data.session;if(s){user=s.user;mount();load()}});
  c.auth.onAuthStateChange(function(ev,s){if(s){user=s.user;mount();load()}else if(root){close();root.remove();root=null}})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(boot,0)});else setTimeout(boot,0);
})();
