# Feedback aus der App lesen und beantworten (braucht SUPABASE_SERVICE_KEY in der Umgebung).
#   python3 feedback.py                 offene Einträge (offen + in arbeit)
#   python3 feedback.py alle            alle Einträge
#   python3 feedback.py bild <id>       Bild eines Eintrags als feedback-<id>.jpg speichern
#   python3 feedback.py status <id> <offen|in arbeit|erledigt> [antwort]
# Die Antwort erscheint in der App unter "feedback → bisher".
import json,os,sys,base64,urllib.request
URL='https://hexbxjcnlpwrcolefrrk.supabase.co/rest/v1/docs'
K=os.environ['SUPABASE_SERVICE_KEY']
H={'apikey':K,'Authorization':'Bearer '+K,'Content-Type':'application/json'}
def call(q,method='GET',body=None):
  r=urllib.request.Request(URL+q,method=method,headers=H,data=json.dumps(body).encode() if body is not None else None)
  t=urllib.request.urlopen(r).read();return json.loads(t) if t else None
def rows(): return {x['id']:x['data'] for x in call('?coll=eq.feedback&select=id,data')}
a=sys.argv[1:]
if a and a[0]=='status':
  id,st=a[1],a[2];d=rows()[id];d['status']=st
  if len(a)>3:d['antwort']=a[3]
  call('?coll=eq.feedback&id=eq.'+id,'PATCH',{'data':d});print('ok',id,st)
elif a and a[0]=='bild':
  d=rows()[a[1]];open('feedback-%s.jpg'%a[1],'wb').write(base64.b64decode(d['bild'].split(',',1)[1]));print('feedback-%s.jpg'%a[1])
else:
  for id,d in sorted(rows().items()):
    if not a and d.get('status')=='erledigt':continue
    k=d.get('kontext') or {}
    print('## %s  [%s] %s · %s · %s · %s'%(id,d.get('status'),d.get('art'),d.get('seite'),d.get('von'),d.get('am','')[:16]))
    print(d.get('text',''))
    if d.get('bild'):print('(Bild angehängt)')
    if k:print('Kontext: %s · %s · %s'%(d.get('url'),k.get('fenster'),k.get('geraet','')[:90]))
    for f in k.get('fehler') or []:print('  Fehler: '+f['text'])
    if d.get('antwort'):print('Antwort: '+d['antwort'])
    print()
