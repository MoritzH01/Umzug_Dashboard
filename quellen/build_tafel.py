# Baut den Canvas als Startseite der Web-App (Supabase, Anmeldung, Live-Abgleich).
import os;os.chdir(os.path.dirname(os.path.abspath(__file__)))  # Pfade relativ zu quellen/, Ausgabe ins Repo-Wurzelverzeichnis
import re
s=open('canvas/tafel.tpl.html',encoding='utf8').read()
title=re.search(r'<title>.*?</title>',s).group(0);s=s.replace(title,'')
s=s.replace('/*DATA*/','window.TAFEL_DEFER=true;window.SEED={};')
boot=r'''
<script>
(function(){
var CFG=window.UMZUG_CONFIG||{},$=function(q){return document.querySelector(q)};
if(!CFG.supabaseUrl||!window.supabase){document.getElementById("modal").innerHTML='<div class="bg"><form><h2>keine datenbank</h2><p class="note2">In config.js fehlt der Supabase-Zugang.</p></form></div>';return}
var sb=window.__sb=window.supabase.createClient(CFG.supabaseUrl,CFG.supabaseKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}),started=false;
function msg(t){var m=$("#lg-msg");if(m)m.textContent=t}
function login(){$("#modal").innerHTML='<div class="bg"><form id="lg"><h2>anmelden</h2><label>Mail-Adresse<input type="email" id="lg-mail" autocomplete="email" required></label><div class="foot"><button class="btn" id="lg-go">Link schicken</button></div><p class="note2">Du bekommst einen Link per Mail. Tipp ihn auf diesem Gerät an, dann bleibst du hier angemeldet, bis du dich abmeldest.</p><p class="note2" id="lg-msg"></p></form></div>';
  try{var last=localStorage.getItem("umzug-mail");if(last)$("#lg-mail").value=last}catch(e){}
  $("#lg").addEventListener("submit",function(e){e.preventDefault();var m=$("#lg-mail").value.trim().toLowerCase();if(!m)return;try{localStorage.setItem("umzug-mail",m)}catch(x){}
    $("#lg-go").disabled=true;msg("Wird gesendet …");
    sb.auth.signInWithOtp({email:m,options:{shouldCreateUser:true,emailRedirectTo:location.origin+location.pathname}}).then(function(r){$("#lg-go").disabled=false;
      if(!r.error){msg("Schau in dein Postfach ("+m+") und tipp auf den Link.");return}
      var t=r.error.message||"";msg(/database error|nicht erlaubt|not allowed/i.test(t)?"Diese Adresse ist nicht freigegeben.":/rate|seconds|too many/i.test(t)?"Gerade wurden zu viele Links verschickt. Bitte etwas warten und nochmal versuchen.":"Das hat nicht geklappt: "+t)})})}
function toast(t){var e=$("#toast");e.textContent=t;e.style.display="block";clearTimeout(toast.t);toast.t=setTimeout(function(){e.style.display="none"},3000)}
function load(session){if(started)return;started=true;$("#modal").innerHTML='<div class="bg"><form><h2>lade tafel …</h2></form></div>';
  sb.from("docs").select("coll,id,data").then(function(r){if(r.error){$("#modal").innerHTML='<div class="bg"><form><h2>datenbank antwortet nicht</h2><p class="note2">'+r.error.message+'</p></form></div>';return}
    var S={rooms:{},items:{},tasks:{},contracts:{},events:{},utensils:{},plan:null,board:[],layout:null};
    r.data.forEach(function(x){if(x.coll==="rooms"||x.coll==="items"||x.coll==="tasks"||x.coll==="contracts"||x.coll==="events"||x.coll==="utensils")S[x.coll][x.id]=x.data;else if(x.coll==="board")S.board.push(x.data);else if(x.coll==="meta"&&x.id==="plan")S.plan=x.data;else if(x.coll==="meta"&&x.id==="board")S.layout=x.data});
    window.SEED=S;
    window.TAFEL_STORE={
      put:function(c,id,data){return sb.from("docs").upsert({coll:c,id:id,data:data,updated_at:new Date().toISOString()}).then(function(x){if(x.error)toast("Speichern hat nicht geklappt: "+x.error.message)})},
      del:function(c,id){return sb.from("docs").delete().eq("coll",c).eq("id",id).then(function(x){if(x.error)toast("Löschen hat nicht geklappt.")})}};
    window.UMZUG_LINK_FN=function(url){return sb.functions.invoke("produkt",{body:{url:url}}).then(function(x){if(x.error){var c=x.error.context;return (c&&c.json?c.json().catch(function(){return {}}):Promise.resolve({})).then(function(j){throw new Error(j.error||(c&&c.status?"Status "+c.status:x.error.message))})}if(!x.data||x.data.error)throw new Error((x.data&&x.data.error)||"keine Antwort");return x.data})};
    $("#modal").innerHTML="";window.startTafel();
    var acct=$("#acct");acct.hidden=false;acct.innerHTML=(session.user.email||"")+' · <a href="#" id="logout">abmelden</a>';$("#to-list").hidden=false;$("#to-3d").hidden=false;
    $("#logout").onclick=function(e){e.preventDefault();sb.auth.signOut().then(function(){location.reload()})};
    if(!Object.keys(S.rooms).length)toast("Noch keine Daten. In der Liste unter Daten kannst du deinen Export importieren.");
    sb.channel("tafel").on("postgres_changes",{event:"*",schema:"public",table:"docs"},function(p){var row=p.eventType==="DELETE"?p.old:p.new;if(row&&row.coll)window.TAFEL_APPLY(row.coll,row.id,p.eventType==="DELETE"?null:row.data)}).subscribe();
  })}
sb.auth.getSession().then(function(r){var s=r.data&&r.data.session;if(s)load(s);else login()});
sb.auth.onAuthStateChange(function(ev,s){if(s&&!started)load(s)});
})();
</script>'''
head='''<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
'''+title+'''
<meta name="theme-color" content="#f5f2ec">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'><path d='M9.6 1.8c5.2-.6 8.6 3.1 8.3 8.4-.3 5-3.4 8.3-7.6 8-4.6-.3-8.4-3.4-8.3-8.1.1-4.6 3.2-7.8 7.6-8.3z' fill='%232f4ee0'/></svg>">
<script src="config.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js"></script>
<script src="feedback.js"></script>
</head><body>
'''
open('../index.html','w',encoding='utf8').write(head+s+boot+'\n</body></html>\n')
print('ok')
import shutil;shutil.copy('feedback.js','../feedback.js')  # Feedback-Knopf, gleiche Datei für alle drei Seiten
