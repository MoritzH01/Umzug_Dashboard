import os;os.chdir(os.path.dirname(os.path.abspath(__file__)))  # Pfade relativ zu quellen/, Ausgabe ins Repo-Wurzelverzeichnis
import re,sys
src=open('umzug-dashboard.html',encoding='utf8').read()
def rep(old,new):
    global src
    assert src.count(old)==1,("not unique",old[:60],src.count(old))
    src=src.replace(old,new)

# 1) Supabase-Backend neben dem Artefakt-Backend
rep("var rq=0;function schedule()", r'''function sbBackend(sb,rows){
  COLLS.forEach(function(c){S[c]={}});
  function apply(r){if(!r||!r.coll)return;if(r.coll==="meta"){if(r.id==="settings")S.meta=Object.assign({moveDate:"2026-12-15"},r.data);if(r.id==="plan")S.plan=Object.assign({doors:[],windows:[],fixed:[]},r.data)}else if(S[r.coll])S[r.coll][r.id]=r.data}
  rows.forEach(apply);
  sb.channel("docs").on("postgres_changes",{event:"*",schema:"public",table:"docs"},function(p){if(p.eventType==="DELETE"){var o=p.old||{};if(o.coll&&S[o.coll]&&o.coll!=="meta")delete S[o.coll][o.id]}else apply(p.new);schedule()}).subscribe();
  function chk(res){if(res.error){toast("Speichern hat nicht geklappt. Bitte nochmal versuchen.");throw res.error}}
  function up(c,id,data){return sb.from("docs").upsert({coll:c,id:id,data:data,updated_at:new Date().toISOString()}).then(chk)}
  return {kind:"supabase",
    save:function(c,id,data){S[c][id]=data;schedule();return up(c,id,data)},
    hard:function(c,id){delete S[c][id];schedule();return sb.from("docs").delete().eq("coll",c).eq("id",id).then(chk)},
    saveDoc:function(k,data){S[k]=data;schedule();return up("meta",k==="meta"?"settings":"plan",data)}};
}
var rq=0;function schedule()''')

# 2) Downloads ohne Claude: normaler Browser-Download
rep('function offer(name,text,type){if(downloads){', 'function offer(name,text,type){if(!downloads&&!window.claude){var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type:type}));a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500);toast("Datei wird heruntergeladen");return}if(downloads){')

# 3) Kopfzeile: Anmeldestatus
rep('var m=$("#mode");if(backend&&backend.kind==="local")', 'var m=$("#mode");if(backend&&backend.kind==="supabase"){m.hidden=false;m.innerHTML=esc(window.__sbUser||"Angemeldet")+\' · <a href="#" data-logout style="color:inherit">Abmelden</a>\'}else if(backend&&backend.kind==="local")')

# 4) Start: Supabase mit Anmeldung, sonst wie bisher
start_old=src[src.index('var cl=window.claude;'):src.index('renderHead();\n})();')]
rep(start_old, r'''var CFG=window.UMZUG_CONFIG||{};
function loginView(msg){var v=$("#view");v.innerHTML='<section class="panel" style="max-width:420px;margin:40px auto"><h2>Anmelden</h2><form id="login" style="display:grid;gap:10px"><input type="email" required id="login-mail" autocomplete="email" placeholder="Mail-Adresse"><button class="btn" id="login-go">Link schicken</button></form><p class="hint" style="margin-top:12px">Du bekommst einen Link per Mail. Tipp ihn auf diesem Gerät an, dann bleibst du hier angemeldet, bis du dich abmeldest.</p><p class="hint" id="login-msg">'+(msg||"")+'</p></section>';
  var say=function(t){$("#login-msg").textContent=t};
  try{var last=localStorage.getItem("umzug-mail");if(last)$("#login-mail").value=last}catch(e){}
  $("#login").addEventListener("submit",function(e){e.preventDefault();var mail=$("#login-mail").value.trim().toLowerCase();if(!mail)return;try{localStorage.setItem("umzug-mail",mail)}catch(x){}
    $("#login-go").disabled=true;say("Wird gesendet …");
    window.__sb.auth.signInWithOtp({email:mail,options:{shouldCreateUser:true,emailRedirectTo:location.origin+location.pathname}}).then(function(r){$("#login-go").disabled=false;
      if(!r.error){say("Schau in dein Postfach ("+mail+") und tipp auf den Link.");return}
      var t=r.error.message||"";say(/database error|nicht erlaubt|not allowed/i.test(t)?"Diese Adresse ist nicht freigegeben.":/rate|seconds|too many/i.test(t)?"Gerade wurden zu viele Links verschickt. Bitte etwas warten und nochmal versuchen.":"Das hat nicht geklappt: "+t)})})}
function startSb(sb,session){if(started)return;window.__sbUser=session.user&&session.user.email;$("#view").innerHTML='<p class="empty">Daten werden geladen …</p>';
  sb.from("docs").select("coll,id,data").then(function(r){if(r.error){$("#view").innerHTML='<p class="empty">Die Datenbank antwortet nicht: '+esc(r.error.message)+'</p>';return}
    started=true;backend=sbBackend(sb,r.data);if(!r.data.length){UI.tab="daten";toast("Noch leer. Unter Sicherung die Datei startdaten.json importieren.")}render()})}
document.addEventListener("click",function(e){var t=e.target.closest&&e.target.closest("[data-logout]");if(t){e.preventDefault();window.__sb.auth.signOut().then(function(){location.reload()})}});
if(CFG.supabaseUrl&&CFG.supabaseKey&&window.supabase){
  var sb=window.__sb=window.supabase.createClient(CFG.supabaseUrl,CFG.supabaseKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  sb.auth.getSession().then(function(r){var s=r.data&&r.data.session;if(s)startSb(sb,s);else loginView()});
  sb.auth.onAuthStateChange(function(ev,s){if(s&&!started)startSb(sb,s)});
}else{
var cl=window.claude;
if(cl&&cl.use){cl.use("db").then(start).catch(function(){start(null)});cl.use("downloads").then(function(d){downloads=d}).catch(function(){});
  cl.use("user").then(function(u){if(u&&u.can)Promise.resolve(u.can("data.write")).then(function(w){if(w===false){readOnly=true;render()}}).catch(function(){})}).catch(function(){});setTimeout(function(){start(null)},11000)}
else start(null);
}
''')

rep('(backend.kind==="db"?', '(backend.kind==="supabase"?\'Die Daten liegen in deiner Supabase-Datenbank. Alle, die angemeldet sind, sehen denselben Stand.\':backend.kind==="db"?')

rep('<div class="logo">Umzug<i>.</i></div>','<div class="logo">Umzug<i>.</i></div><a href="./" style="font:500 14px var(--f-sans,inherit);color:inherit;text-decoration:none;border:1px solid currentColor;border-radius:999px;padding:3px 10px;opacity:.75">zur Tafel</a>')

# 5) Vollständiges Dokument mit Kopf
title=re.search(r'<title>.*?</title>',src).group(0)
src=src.replace(title,'')
head='''<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
'''+title+'''
<meta name="theme-color" content="#e9ebea"><link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%23e9ebea'/><text x='6' y='24' font-size='22' font-family='Arial' font-weight='700' fill='%231d1f20'>U</text><circle cx='25' cy='22' r='3' fill='%23e34a2f'/></svg>">
<script src="config.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js"></script>
<script src="feedback.js"></script>
</head><body>
'''
src=head+src+'\n</body></html>\n'
open('../liste.html','w',encoding='utf8').write(src)
print("ok",len(src))
import shutil;shutil.copy('feedback.js','../feedback.js')  # Feedback-Knopf, gleiche Datei für alle drei Seiten
