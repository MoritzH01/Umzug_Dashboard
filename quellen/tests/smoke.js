// Rauchtest: lädt Canvas und 3D mit nachgebauter Datenbank (fake-sb.js) und erfundenen Testdaten.
//   NODE_PATH=$(npm root -g) node quellen/tests/smoke.js
// Prüft: Seiten starten ohne JS-Fehler, Notiz auf dem Canvas wird gespeichert, Knopf „feedback“ ist überall da,
// Konfliktprüfung, Ideen ins Moodboard, Menü „daten“, Raumblatt entsperren, Handy-Vollbild, liste.html leitet weiter.
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const R=path.join(__dirname,'..','..'),fake=fs.readFileSync(path.join(__dirname,'fake-sb.js'),'utf8');
const rows=[
 {coll:'rooms',id:'wohnen',data:{name:'Wohnzimmer',x:0,y:0,w:290,h:420,order:1,photos:[]}},
 {coll:'rooms',id:'kueche',data:{name:'Küche',x:290,y:0,w:280,h:420,order:2,photos:[]}},
 {coll:'items',id:'sofa',data:{name:'Sofa',raum:'wohnen',prio:1,dec:'mitnehmen',w:200,d:90,h:80,x:40,y:40}},
 {coll:'items',id:'tisch',data:{name:'Tisch',raum:'wohnen',prio:1,dec:'kaufen',w:80,d:80,h:75,x:100,y:60}},
 {coll:'items',id:'regal',data:{name:'Regal',prio:2,dec:'verkaufen',auch:['nachmieter'],status:'Online',preis:40,anzeige:'https://www.kleinanzeigen.de/s-anzeige/test/1',w:80,d:30,h:180}},
 {coll:'contracts',id:'c1',data:{kat:'Strom',anbieter:'Teststrom',status:'vergleich',link:'https://strom.example.org/tarif'}},
 {coll:'tasks',id:'t1',data:{title:'Kartons besorgen',due:'2026-11-01',bereich:'orga',done:false}},
 {coll:'ideas',id:'i1',data:{title:'Leuchte aus Messing',notiz:'über dem Tisch'}},
 {coll:'meta',id:'settings',data:{moveDate:'2026-12-15'}},
 {coll:'meta',id:'plan',data:{doors:[],windows:[],fixed:[{room:'kueche',n:'Küchenzeile',dx:0,dy:0,w:60,h:200}]}},
 {coll:'meta',id:'kueche',data:{room:'kueche',laeufe:[{id:'la',name:'lauf a',wand:'e',start:0,unten:[{id:'a1',typ:'us',b:60,dec:'neu'}],oben:[]}]}}];
const types={html:'text/html',js:'application/javascript'};
(async()=>{const b=await chromium.launch({executablePath:fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined});
 let fail=0;const ok=(c,t)=>{console.log((c?'ok   ':'FEHLER ')+t);if(!c)fail++};
 const errs=[];
 async function page(vp){const p=await b.newPage({viewport:vp});p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
  await p.route('**/*',r=>{const u=new URL(r.request().url());
   if(u.href.includes('supabase-js'))return r.fulfill({body:fake,contentType:types.js});
   if(u.host==='app.test'){let f=u.pathname==='/'?'index.html':u.pathname.slice(1);
    if(f==='config.js')return r.fulfill({body:'window.UMZUG_CONFIG={supabaseUrl:"https://x.supabase.co",supabaseKey:"k"}',contentType:types.js});
    const fp=path.join(R,f);if(fs.existsSync(fp))return r.fulfill({body:fs.readFileSync(fp,'utf8'),contentType:types[f.split('.').pop()]||'text/plain'})}
   if(u.host==='cdn.jsdelivr.net'&&u.pathname.includes('three'))return r.continue();
   return r.abort()});
  await p.addInitScript(r=>{localStorage.setItem('fake-session','1');if(!localStorage.getItem('fake-rows'))localStorage.setItem('fake-rows',r)},JSON.stringify(rows));return p}
 const dbOf=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('fake-rows')));
 const p=await page({width:1440,height:900});
 await p.goto('http://app.test/');await p.waitForTimeout(1200);
 ok(!(await p.$('#modal .bg')),'canvas startet nach Anmeldung');
 ok(/test@example.org/.test(await p.textContent('#acct')),'canvas zeigt Konto');
 ok(!(await p.$('#to-list')),'kein Knopf mehr zur Liste');
 ok(/1 möbel mit konflikt|2 möbel mit konflikt/.test(await p.textContent('.sheethead')),'prüfung meldet überlappende möbel');
 let db=await dbOf(p);
 ok(db.some(r=>r.coll==='board'&&r.id==='idea-i1')&&db.some(r=>r.coll==='ideas'&&r.data.deleted),'idee liegt im moodboard');
 await p.mouse.dblclick(700,600);await p.keyboard.type('Notiz aus dem Test');await p.mouse.click(1000,880);await p.waitForTimeout(800);
 db=await dbOf(p);
 ok(db.some(r=>r.coll==='board'&&/Notiz aus dem Test/.test(JSON.stringify(r.data))),'notiz wird in docs gespeichert');
 ok(await p.evaluate(()=>{const f=document.querySelector('[data-frame="verkauf"]'),c=[...f.querySelectorAll('.col')].filter(x=>x.querySelector('[data-sell="regal"]')).map(x=>x.querySelector('h4').firstChild.textContent);return c.join()==='Online,Nachmieter'}),'verkauf: regal unter online und nachmieter');
 ok(await p.evaluate(()=>!!document.querySelector('[data-sell="regal"] a[href^="https://www.kleinanzeigen.de"][target="_blank"]')&&!!document.querySelector('[data-vtr="c1"] a[href="https://strom.example.org/tarif"]')),'links an anzeige und vertrag anklickbar');
 const sr=await p.evaluate(()=>{const b=document.querySelector('[data-sell="regal"] b').getBoundingClientRect();return {x:b.x,y:b.y}});
 await p.mouse.move(720,450);await p.mouse.wheel(sr.x-720,sr.y-450);await p.waitForTimeout(200);
 await p.mouse.click(725,455);await p.waitForTimeout(300);
 ok(await p.evaluate(()=>!!document.querySelector('#itf')&&!document.querySelector('#f-anzo').hidden&&document.querySelector('#f-auch input[value="nachmieter"]').checked),'verkaufskarte öffnet formular mit labels und anzeige-link');
 await p.click('#f-x');
 await p.evaluate(()=>document.querySelector('[data-addweg="nachmieter"]').click());await p.waitForTimeout(200);
 await p.fill('#f-name','Lampe aus dem Test');await p.check('#f-auch input[value="verkaufen"]');await p.click('#itf button:not([type])');await p.waitForTimeout(800);
 db=await dbOf(p);
 ok(db.some(r=>r.coll==='items'&&r.data.name==='Lampe aus dem Test'&&r.data.dec==='nachmieter'&&r.data.auch.join()==='verkaufen'),'verkauf: neues stück mit zwei labels gespeichert');
 await p.evaluate(()=>{document.querySelector('[data-z="plan"]').click()});await p.waitForTimeout(300);
 ok(await p.evaluate(()=>!!document.querySelector('#world .kz')&&!document.querySelector('#world .fixed')),'küchenlauf im grundriss, feste küchenzeile entfällt');
 await p.evaluate(()=>Kueche.open());await p.waitForTimeout(300);
 ok(await p.evaluate(()=>document.querySelectorAll('#kelev .kel').length===1),'küchenplaner zeigt den lauf');
 await p.evaluate(()=>document.querySelector('#kmenu [data-t="us"]').click());await p.waitForTimeout(800);
 db=await dbOf(p);const kd=db.find(r=>r.coll==='meta'&&r.id==='kueche');
 ok(kd&&kd.data.laeufe[0].unten.length===2,'küchenplaner speichert in meta/kueche');
 await p.evaluate(()=>Kueche.close());
 await p.keyboard.press('Escape');await p.waitForTimeout(300);
 await p.click('[data-daten]');await p.fill('#d-move','2026-12-18');await p.click('#dtf button:not([type])');await p.waitForTimeout(600);
 db=await dbOf(p);
 ok(db.some(r=>r.coll==='meta'&&r.id==='settings'&&r.data.moveDate==='2026-12-18'),'daten: umzugsdatum gespeichert');
 const room=await p.$('rect.room-floor[data-room="kueche"]');const bx=await room.boundingBox();
 await p.mouse.click(bx.x+bx.width/2,bx.y+bx.height/3);await p.waitForTimeout(400);
 ok(await p.isVisible('#rb.open'),'raumblatt öffnet');
 await p.click('[data-rbunlock]');await p.click('[data-opadd="doors"]');await p.waitForTimeout(600);
 db=await dbOf(p);
 ok(db.some(r=>r.coll==='meta'&&r.id==='plan'&&r.data.doors.length===1&&r.data.doors[0].room==='kueche'),'raumblatt: tür angelegt und plan gespeichert');
 for(const [u,name] of [['http://app.test/','canvas'],['http://app.test/3d.html','3d']]){
  await p.goto(u);await p.waitForTimeout(name==='3d'?2500:1200);
  ok(!!(await p.evaluate(()=>[...document.querySelectorAll('button,a')].some(e=>/feedback/i.test(e.textContent)))),name+': knopf feedback da')}
 await p.goto('http://app.test/liste.html');await p.waitForTimeout(800);
 ok(new URL(p.url()).pathname==='/','liste.html leitet auf den canvas');
 const m=await page({width:375,height:812});
 await m.goto('http://app.test/');await m.waitForTimeout(1200);
 await m.click('[data-areas]');await m.click('[data-fullopen="zeit"]');await m.waitForTimeout(300);
 ok(await m.isVisible('#full.open')&&/Kartons besorgen/.test(await m.textContent('#full-b')),'handy: zeitplan als vollbild');
 await m.click('[data-fullx]');await m.click('[data-areas]');await m.click('[data-fullopen="moebel"]');await m.click('#full [data-card="tisch"]');await m.waitForTimeout(300);
 ok(await m.isVisible('#f-st')&&(await m.innerHTML('#f-geld')).trim().length>0,'möbelformular: status und geld-felder da');
 ok(!errs.length,'keine JS-Fehler'+(errs.length?':\n  '+errs.join('\n  '):''));
 await b.close();process.exit(fail?1:0)})();
