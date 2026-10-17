# Baut alle Seiten aus den Quellen: index.html (Canvas), 3d.html und feedback.js im Repo-Wurzelverzeichnis.
# liste.html ist abgelöst und leitet nur noch (samt Anmelde-Link im #-Teil) auf den Canvas weiter.
#   python3 quellen/bauen.py
import os,subprocess,sys
d=os.path.dirname(os.path.abspath(__file__))
for s in ('build_tafel.py','build_3d.py'):
  print(s,end=': ',flush=True);subprocess.run([sys.executable,os.path.join(d,s)],check=True)
open(os.path.join(d,'..','liste.html'),'w',encoding='utf8',newline='\n').write('''<!doctype html>
<html lang="de"><head><meta charset="utf-8"><title>Umzug Canvas</title>
<script>location.replace("./"+location.search+location.hash)</script>
<meta http-equiv="refresh" content="0;url=./"></head>
<body><p>Die Liste ist abgelöst. Alles ist jetzt auf dem <a href="./">Canvas</a>.</p></body></html>
''')
print('liste.html: Weiterleitung')
