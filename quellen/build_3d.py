# Baut die 3D-Ansicht der Wohnung (3d.html im Repo-Wurzelverzeichnis). Liest Räume und Grundriss live aus Supabase.
# Mit Argument "vorschau <seed.json> <ziel.html>" entsteht eine eigenständige Vorschau mit eingebettetem Datenstand.
import re,sys,os
sys.argv[2:]=[os.path.abspath(a) for a in sys.argv[2:]];os.chdir(os.path.dirname(os.path.abspath(__file__)))  # Pfade relativ zu quellen/
s=open('3d/wohnung3d.tpl.html',encoding='utf8').read()
title=re.search(r'<title>.*?</title>',s).group(0);s=s.replace(title,'')
if len(sys.argv)>3 and sys.argv[1]=='vorschau':
  seed=open(sys.argv[2],encoding='utf8').read()
  out=title+s.replace('<!--BOOT-->','<script>window.W3D('+seed+');</script>')
  open(sys.argv[3],'w',encoding='utf8').write(out);print('vorschau ok');sys.exit()
boot=r'''<script>
(function(){
var CFG=window.UMZUG_CONFIG||{},msg=document.getElementById("msg");
function say(h,t){msg.firstElementChild.innerHTML="<h2>"+h+"</h2><p>"+t+"</p>";msg.classList.add("open")}
if(!CFG.supabaseUrl||!window.supabase){say("keine datenbank","In config.js fehlt der Supabase-Zugang.");return}
if(!window.THREE){say("3d lädt nicht","Die 3D-Bibliothek konnte nicht geladen werden. Bitte Seite neu laden.");return}
var sb=window.__sb=window.supabase.createClient(CFG.supabaseUrl,CFG.supabaseKey,{auth:{persistSession:true,autoRefreshToken:true}});
document.getElementById("back").hidden=false;
function load(){return sb.from("docs").select("coll,id,data").or("coll.eq.rooms,and(coll.eq.meta,id.eq.plan)").then(function(r){
  if(r.error)throw r.error;var S={rooms:{},plan:null};
  r.data.forEach(function(x){if(x.coll==="rooms")S.rooms[x.id]=x.data;else S.plan=x.data});return S})}
sb.auth.getSession().then(function(r){
  if(!r.data||!r.data.session){say("bitte anmelden",'Die 3D-Ansicht nutzt die Anmeldung des Canvas. <a href="index.html">Zum Canvas</a>');return}
  load().then(function(S){var view=window.W3D(S),t=null;
    sb.channel("w3d").on("postgres_changes",{event:"*",schema:"public",table:"docs"},function(p){var row=p.new&&p.new.coll?p.new:p.old;
      if(!row||(row.coll!=="rooms"&&!(row.coll==="meta"&&row.id==="plan")))return;clearTimeout(t);t=setTimeout(function(){load().then(view.update)},400)}).subscribe();
  }).catch(function(e){say("datenbank antwortet nicht",String(e&&e.message||e))})});
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
open('../3d.html','w',encoding='utf8').write(head+s.replace('<!--BOOT-->',boot)+'\n</body></html>\n')
print('ok')
import shutil;shutil.copy('feedback.js','../feedback.js')  # Feedback-Knopf, gleiche Datei für alle drei Seiten
