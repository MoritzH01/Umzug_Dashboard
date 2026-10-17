# Baut alle Seiten aus den Quellen: index.html (Canvas), liste.html, 3d.html und feedback.js im Repo-Wurzelverzeichnis.
#   python3 quellen/bauen.py
import os,subprocess,sys
d=os.path.dirname(os.path.abspath(__file__))
for s in ('build_tafel.py','build_web.py','build_3d.py'):
  print(s,end=': ',flush=True);subprocess.run([sys.executable,os.path.join(d,s)],check=True)
