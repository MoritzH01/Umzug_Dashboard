// Rauchtest: lädt Canvas, Liste und 3D mit nachgebauter Datenbank (fake-sb.js) und erfundenen Testdaten.
//   NODE_PATH=$(npm root -g) node quellen/tests/smoke.js
// Prüft: Seiten starten ohne JS-Fehler, Notiz auf dem Canvas wird gespeichert, Küchenplaner speichert, Knopf „feedback“ ist überall da.
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const R=path.join(__dirname,'..','..'),fake=fs.readFileSync(path.join(__dirname,'fake-sb.js'),'utf8');
const rows=[
 {coll:'rooms',id:'wohnen',data:{name:'Wohnzimmer',x:0,y:0,w:290,h:420,order:1,photos:[]}},
 {coll:'rooms',id:'kueche',data:{name:'Küche',x:290,y:0,w:280,h:420,order:2,photos:[]}},
 {coll:'items',id:'sofa',data:{name:'Sofa',raum:'wohnen',prio:1}},
 {coll:'meta',id:'plan',data:{doors:[],windows:[],fixed:[{room:'kueche',n:'Küchenzeile',dx:0,dy:0,w:60,h:200}]}},
 {coll:'meta',id:'kueche',data:{room:'kueche',laeufe:[{id:'la',name:'lauf a',wand:'e',start:0,unten:[{id:'a1',typ:'us',b:60,dec:'neu'}],oben:[]}]}},
 {coll:'meta',id:'settings',data:{moveDate:'2026-12-15'}}];
const types={html:'text/html',js:'application/javascript'};
(async()=>{const b=await chromium.launch({executablePath:fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined});
 let fail=0;const ok=(c,t)=>{console.log((c?'ok   ':'FEHLER ')+t);if(!c)fail++};
 const p=await b.newPage({viewport:{width:1440,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.route('**/*',r=>{const u=new URL(r.request().url());
  if(u.href.includes('supabase-js'))return r.fulfill({body:fake,contentType:types.js});
  if(u.host==='app.test'){let f=u.pathname==='/'?'index.html':u.pathname.slice(1);
   if(f==='config.js')return r.fulfill({body:'window.UMZUG_CONFIG={supabaseUrl:"https://x.supabase.co",supabaseKey:"k"}',contentType:types.js});
   const fp=path.join(R,f);if(fs.existsSync(fp))return r.fulfill({body:fs.readFileSync(fp,'utf8'),contentType:types[f.split('.').pop()]||'text/plain'})}
  if(u.host==='cdn.jsdelivr.net'&&u.pathname.includes('three'))return r.continue();
  return r.abort()});
 await p.addInitScript(r=>{localStorage.setItem('fake-session','1');if(!localStorage.getItem('fake-rows'))localStorage.setItem('fake-rows',r)},JSON.stringify(rows));
 await p.goto('http://app.test/');await p.waitForTimeout(1200);
 ok(!(await p.$('#modal .bg')),'canvas startet nach Anmeldung');
 ok(/test@example.org/.test(await p.textContent('#acct')),'canvas zeigt Konto');
 await p.mouse.dblclick(700,600);await p.keyboard.type('Notiz aus dem Test');await p.mouse.click(1000,880);await p.waitForTimeout(800);
 const db=await p.evaluate(()=>JSON.parse(localStorage.getItem('fake-rows')));
 ok(db.some(r=>r.coll==='board'&&/Notiz aus dem Test/.test(JSON.stringify(r.data))),'notiz wird in docs gespeichert');
 await p.evaluate(()=>{document.querySelector('[data-z="plan"]').click()});await p.waitForTimeout(300);
 ok(await p.evaluate(()=>!!document.querySelector('#world .kz')&&!document.querySelector('#world .fixed')),'küchenlauf im grundriss, feste küchenzeile entfällt');
 await p.evaluate(()=>Kueche.open());await p.waitForTimeout(300);
 ok(await p.evaluate(()=>document.querySelectorAll('#kelev .kel').length===1),'küchenplaner zeigt den lauf');
 await p.evaluate(()=>document.querySelector('#kmenu [data-t="us"]').click());await p.waitForTimeout(800);
 const kd=(await p.evaluate(()=>JSON.parse(localStorage.getItem('fake-rows')))).find(r=>r.coll==='meta'&&r.id==='kueche');
 ok(kd&&kd.data.laeufe[0].unten.length===2,'küchenplaner speichert in meta/kueche');
 for(const [u,name] of [['http://app.test/','canvas'],['http://app.test/liste.html','liste'],['http://app.test/3d.html','3d']]){
  await p.goto(u);await p.waitForTimeout(name==='3d'?2500:1200);
  ok(!!(await p.evaluate(()=>[...document.querySelectorAll('button,a')].some(e=>/feedback/i.test(e.textContent)))),name+': knopf feedback da')}
 ok(!errs.length,'keine JS-Fehler'+(errs.length?':\n  '+errs.join('\n  '):''));
 await b.close();process.exit(fail?1:0)})();
