/* Küchenplaner, Rechenkern (Canvas und 3D). Keine Oberfläche, nur Daten und Geometrie.
   Daten: meta/kueche = {room, laeufe:[lauf]}.
   lauf = {id, name, wand:"n"|"e"|"s"|"w"|null, start, len, x, y, rot, raster:{…}, platte:{…}, unten:[el], oben:[el]}
     wand wie bei Türen: n = oben im Plan, e = rechts, s = unten, w = links; null = Insel (x, y, rot im Raum).
     start und Positionen zählen von links, so wie man von innen auf die Wand schaut. len leer = bis Wandende.
   el = {id, typ, b, name, dec:"neu"|"bestand", status, preis, link, nische, geraet:itemId}
     unten: us (Unterschrank), hoch (Hochschrank, belegt oben mit), blende, passleiste, luecke
     oben:  hs (Hängeschrank), regal, abzug, luecke. Oben springt automatisch über Hochschränke.
   Anschlüsse (meta/plan.anschluesse) zählen wie Türen ab oben/links im Plan. */
(function(){
var KK=window.KK={};
KK.RASTER={breiten:[20,30,40,60,80],sockel:8,korpus:80,platte:4,tiefe:60,abstand:56,hs:80,hsTiefe:37,hoch:220};
KK.ELT={us:"Unterschrank",hoch:"Hochschrank",blende:"Blende",passleiste:"Passleiste",luecke:"Lücke",hs:"Hängeschrank",regal:"Regal",abzug:"Dunstabzug"};
KK.OBEN={hs:1,regal:1,abzug:1};
KK.ART={kuehl:"Kühlschrank",gefrier:"Gefrierschrank",ofen:"Backofen",mikro:"Mikrowelle",spuele:"Spüle",gs:"Geschirrspüler",kochfeld:"Kochfeld",abzug:"Dunstabzug",waschm:"Waschmaschine",sonst:"Gerät"};
KK.EINBAU={kuehl:1,gefrier:1,ofen:1,mikro:1,gs:1,waschm:1};
KK.ANS={wasser:["W","#2f7fe0","Wasser"],abfluss:["A","#5b6580","Abfluss"],steckdose:["S","#c77a1f","Steckdose"],starkstrom:["⚡","#f28c28","Starkstrom"],abluft:["L","#7d8597","Abluft"],gas:["G","#b0413e","Gas"],internet:["@","#2f4ee0","Internet"]};
KK.WAND={n:"oben",e:"rechts",s:"unten",w:"links"};
KK.ST=["brauchen","bestellt","haben"];
KK.DECNEU={kaufen:1,fest:1};
var num=function(v){var n=parseFloat(String(v==null?"":v).replace(",","."));return isNaN(n)?null:n};
KK.num=num;
KK.newId=function(p){return (p||"k")+Date.now().toString(36)+Math.random().toString(36).slice(2,5)};

/* Küche finden und Modell bauen. Alles in Raumkoordinaten (cm, Ursprung oben links). */
KK.roomId=function(R,KD){if(KD&&KD.room&&R[KD.room])return KD.room;var ids=Object.keys(R||{}).filter(function(k){return R[k]&&!R[k].deleted&&/küche/i.test(R[k].name||"")});if(ids.length)return ids[0];return R&&R.kueche?"kueche":null};
KK.isZeile=function(f,rid){return f&&f.room===rid&&/küche/i.test(f.n||"")};
KK.model=function(R,P,KD,I,ceil){var rid=KK.roomId(R,KD);if(!rid)return null;var r=R[rid];P=P||{};
  var mine=function(a){return (a||[]).filter(function(o){return o&&o.room===rid})};
  var M={rid:rid,room:r,W:+r.w,H:+r.h,C:num(r.hoehe)||num(ceil)||320,I:I||{},KD:KD||{room:rid,laeufe:[]},
    doors:mine(P.doors),windows:mine(P.windows),ans:mine(P.anschluesse),
    fixed:mine(P.fixed).filter(function(f){return !KK.isZeile(f,rid)})};
  M.runs=(M.KD.laeufe||[]);M.runs.forEach(function(l){l.unten=l.unten||[];l.oben=l.oben||[]});
  return M};
KK.ras=function(l){var o={},r=l&&l.raster||{};Object.keys(KK.RASTER).forEach(function(k){o[k]=r[k]!=null&&r[k]!==""?r[k]:KK.RASTER[k]});return o};
KK.wallLen=function(M,w){return w==="n"||w==="s"?M.W:M.H};
KK.runLen=function(M,l){var v=num(l.len);if(v!=null)return v;if(!l.wand)return Math.max(60,KK.sum(l.unten));return Math.max(0,KK.wallLen(M,l.wand)-(num(l.start)||0))};
KK.sum=function(a){return (a||[]).reduce(function(s,e){return s+(num(e.b)||0)},0)};
KK.find=function(M,id){for(var i=0;i<M.runs.length;i++){var l=M.runs[i];for(var lv of ["unten","oben"]){var j=l[lv].findIndex(function(e){return e.id===id});if(j>=0)return {run:l,lv:lv,e:l[lv][j],i:j}}}return null};
KK.run=function(M,id){return M.runs.filter(function(l){return l.id===id})[0]||null};
KK.dev=function(M,e){var it=e&&e.geraet&&M.I[e.geraet];return it&&!it.deleted?it:null};
KK.art=function(M,e){var d=KK.dev(M,e);return d?(d.art||"sonst"):e&&e.geraet&&e.art||null};  /* e.art: Kopie für die 3D-Ansicht, die keine Möbel lädt */
KK.label=function(M,e){var d=KK.dev(M,e);return e.name||(d&&d.name)||KK.ELT[e.typ]||e.typ};
KK.depth=function(l,e,lv){var r=KK.ras(l);if(lv==="oben")return e.typ==="regal"?25:+r.hsTiefe;return +r.tiefe};
/* Höhen über Boden [unten, oben] */
KK.hts=function(l,e,lv){var r=KK.ras(l),top=+r.sockel+(+r.korpus);
  if(lv==="oben"){var y0=top+(+r.platte)+(+r.abstand);return [y0,y0+(e.typ==="regal"?76:e.typ==="abzug"?Math.min(+r.hs,40):+r.hs)]}
  if(e.typ==="hoch")return [+r.sockel,+r.sockel+(+r.hoch)];
  if(e.typ==="luecke")return [0,0];
  return [+r.sockel,top]};
KK.hochZones=function(l){var z=[],o=0;l.unten.forEach(function(e){var b=num(e.b)||0;if(e.typ==="hoch")z.push([o,o+b]);o+=b});return z};
KK.layout=function(M,l){var len=KK.runLen(M,l),out={unten:[],oben:[],len:len},o=0;
  l.unten.forEach(function(e){var b=num(e.b)||0;out.unten.push({e:e,off:o,b:b});o+=b});out.end=o;
  var z=KK.hochZones(l),p=0,moved=true;
  l.oben.forEach(function(e){var b=num(e.b)||0;moved=true;while(moved){moved=false;z.forEach(function(q){if(p<q[1]&&p+b>q[0]){p=q[1];moved=true}})}out.oben.push({e:e,off:p,b:b});p+=b});
  out.endO=p;out.rest=len-o;out.restO=len-p;return out};
/* Rechteck im Raum [x,y,w,h] für ein Stück des Laufs ab off, Breite b, Tiefe d */
KK.rect=function(M,l,off,b,d){var a=(num(l.start)||0)+off,W=M.W,H=M.H;
  if(!l.wand){var x=num(l.x)||0,y=num(l.y)||0;return l.rot==90?[x,y+off,d,b]:[x+off,y,b,d]}
  switch(l.wand){case "n":return [a,0,b,d];case "e":return [W-d,a,d,b];case "s":return [W-a-b,H-d,b,d];default:return [0,H-a-b,d,b]}};
/* Plan-Abstand (ab oben/links) einer Öffnung in Wandansicht-Position (ab links von innen) */
KK.viewPos=function(M,wall,off,w){var L=KK.wallLen(M,wall);return wall==="n"||wall==="e"?off:L-off-(w||0)};
KK.planOff=KK.viewPos;
/* Rechteck, das an einer Wand anliegt: Intervall in der Wandansicht oder null */
KK.onWall=function(M,wall,rc){var x=rc[0],y=rc[1],w=rc[2],h=rc[3],t=1.5;
  if(wall==="n"&&y<=t)return [x,x+w];if(wall==="s"&&y+h>=M.H-t)return [M.W-x-w,M.W-x];
  if(wall==="w"&&x<=t)return [M.H-y-h,M.H-y];if(wall==="e"&&x+w>=M.W-t)return [y,y+h];return null};
KK.platte=function(l){var segs=[],o=0,s=null;l.unten.forEach(function(e){var b=num(e.b)||0;if(e.typ==="hoch"||e.typ==="luecke"){if(s!==null){segs.push([s,o]);s=null}}else if(s===null)s=o;o+=b});if(s!==null)segs.push([s,o]);return segs.filter(function(q){return q[1]-q[0]>0})};
KK.restVorschlag=function(l,rest){if(rest<=0)return null;var br=KK.ras(l).breiten.map(Number).sort(function(a,b){return a-b}),fit=br.filter(function(b){return b<=rest}).pop();
  if(!fit)return {text:"Passleiste "+rest,teile:[["passleiste",rest]]};var pl=rest-fit;
  return {text:"Schrank "+fit+(pl?" + Passleiste "+pl:""),teile:[["us",fit]].concat(pl?[["passleiste",pl]]:[])}};
var ov=function(a0,a1,b0,b1){return Math.min(a1,b1)-Math.max(a0,b0)};
var hit=function(a,b){return ov(a[0],a[0]+a[2],b[0],b[0]+b[2])>1&&ov(a[1],a[1]+a[3],b[1],b[1]+b[3])>1};
/* alle Körper eines Laufs im Raum */
KK.boxes=function(M,l){var L=KK.layout(M,l),o=[];
  L.unten.forEach(function(it){if(it.e.typ==="luecke"||!it.b)return;var h=KK.hts(l,it.e,"unten");o.push({run:l,lv:"unten",e:it.e,off:it.off,b:it.b,r:KK.rect(M,l,it.off,it.b,KK.depth(l,it.e,"unten")),z0:h[0],z1:h[1]})});
  L.oben.forEach(function(it){if(it.e.typ==="luecke"||!it.b)return;var h=KK.hts(l,it.e,"oben");o.push({run:l,lv:"oben",e:it.e,off:it.off,b:it.b,r:KK.rect(M,l,it.off,it.b,KK.depth(l,it.e,"oben")),z0:h[0],z1:h[1]})});
  return o};

/* ---------- Prüfungen (nur Hinweise) ---------- */
KK.hints=function(M){var H=[],add=function(lvl,id,t,s,act){H.push({lvl:lvl,id:id,t:t,s:s||"",act:act||null})};
  if(!M.runs.length){add("info","","Noch kein Lauf","Mit „+ lauf“ eine Zeile an eine Wand setzen.");return H}
  var all=[];M.runs.forEach(function(l){all=all.concat(KK.boxes(M,l))});
  var unten=all.filter(function(x){return x.lv==="unten"});
  M.runs.forEach(function(l){var L=KK.layout(M,l),r=KK.ras(l),nm=l.name||"Lauf";
    /* Restmaß */
    if(L.rest>0){var v=KK.restVorschlag(l,L.rest);add("info",l.id,nm+": Restmaß "+L.rest+" cm","Vorschlag: "+v.text+".",{typ:"rest",run:l.id,label:"übernehmen"})}
    else if(L.rest<0)add("warn",l.id,nm+": "+(-L.rest)+" cm zu lang","Die Schränke sind länger als der Lauf.");
    if(L.restO<0)add("warn",l.id,nm+": oben "+(-L.restO)+" cm zu lang","Die Hängeschränke ragen über das Laufende.");
    /* Gerät und Nische */
    l.unten.concat(l.oben).forEach(function(e){var d=KK.dev(M,e);if(!d)return;var a=d.art||"sonst",dw=num(d.w),dh=num(d.h),dd=num(d.d),b=num(e.b)||0,nm2=d.name||KK.ART[a];
      if(KK.EINBAU[a]){var ni=num(e.nische);if(ni==null&&e.typ==="us"&&(a==="gs"||a==="waschm"))ni=+r.sockel+(+r.korpus);
        if(ni==null&&e.typ==="hoch")add("unk",e.id,nm2+": Nischenmaß fehlt","Nischenhöhe am Schrank eintragen.");
        else if(ni!=null&&dh==null)add("unk",e.id,nm2+": Höhe fehlt","Gerätehöhe eintragen, dann wird die Nische geprüft.");
        else if(ni!=null&&dh>ni)add("warn",e.id,nm2+" passt nicht in die Nische","Gerät "+dh+" cm hoch, Nische "+ni+" cm.");
        if(dw!=null&&dw>b)add("warn",e.id,nm2+" ist breiter als der Schrank","Gerät "+dw+" cm, Schrank "+b+" cm.");
        if(dd!=null&&dd>KK.depth(l,e,"unten"))add("warn",e.id,nm2+" ist tiefer als der Korpus","Gerät "+dd+" cm, Korpus "+KK.depth(l,e,"unten")+" cm.")}
      if(a==="spuele"&&dw!=null&&dw>b)add("warn",e.id,"Spüle ist breiter als der Schrank","Spüle "+dw+" cm, Schrank "+b+" cm.")});
    /* Spüle neben Geschirrspüler */
    var ix=function(a){return l.unten.findIndex(function(e){return KK.art(M,e)===a})};
    var sp=ix("spuele"),gs=ix("gs");
    if(sp>=0&&gs>=0){if(Math.abs(sp-gs)===1)add("ok",l.unten[gs].id,"Geschirrspüler neben der Spüle");else add("warn",l.unten[gs].id,"Geschirrspüler nicht neben der Spüle","Direkt neben die Spüle setzen, kurze Wege für Wasser und Abfluss.")}
    /* Kochfeld: Abstand und Ablage */
    var kf=ix("kochfeld");
    if(kf>=0){var li=0,re=0,i,ab=function(e){return e.typ!=="hoch"&&e.typ!=="luecke"};
      for(i=kf-1;i>=0&&ab(l.unten[i]);i--)li+=num(l.unten[i].b)||0;
      for(i=kf+1;i<l.unten.length&&ab(l.unten[i]);i++)re+=num(l.unten[i].b)||0;
      if(Math.min(li,re)>=20&&Math.max(li,re)>=40)add("ok",l.unten[kf].id,"Kochfeld mit Abstand und Ablage","Links "+li+" cm, rechts "+re+" cm.");
      else add("warn",l.unten[kf].id,"Kochfeld zu nah an Wand oder Hochschrank","Links "+li+" cm, rechts "+re+" cm. Mindestens 20 cm, auf einer Seite 40 cm Ablage.")}
    /* Dunstabzug über dem Kochfeld */
    var az=L.oben.filter(function(it){return it.e.typ==="abzug"})[0];
    if(kf>=0&&az){var kc=L.unten[kf].off+L.unten[kf].b/2;if(kc<az.off||kc>az.off+az.b)add("warn",az.e.id,"Dunstabzug hängt nicht über dem Kochfeld","Kochfeld bei "+Math.round(kc)+" cm, Abzug "+az.off+"–"+(az.off+az.b)+" cm. Oben verschieben (◂ ▸).")}
    /* Anschlüsse */
    if(l.wand&&M.ans.length)[["spuele","wasser"],["kochfeld","starkstrom"]].forEach(function(p){var i2=ix(p[0]);if(i2<0)return;var it=L.unten[i2],c=(num(l.start)||0)+it.off+it.b/2,
      an=M.ans.filter(function(a){return a.typ===p[1]&&a.wall===l.wand}).map(function(a){return Math.abs(KK.viewPos(M,a.wall,num(a.off)||0,0)-c)}).sort(function(a,b){return a-b})[0],nm3=KK.label(M,it.e);
      if(an==null)add("warn",it.e.id,nm3+": kein Anschluss an dieser Wand",KK.ANS[p[1]][2]+" liegt an einer anderen Wand oder fehlt.");
      else if(an>100)add("warn",it.e.id,nm3+" weit vom Anschluss",Math.round(an)+" cm bis "+KK.ANS[p[1]][2]+".")});
  });
  if(!M.ans.length)add("unk","","Anschlüsse noch nicht eingetragen","Wasser, Abfluss, Starkstrom mit „+ anschluss“ eintragen, dann werden Spüle und Kochfeld geprüft.");
  M.ans.forEach(function(a){if(num(a.hoehe)==null)add("unk","",(KK.ANS[a.typ]||["","",a.typ])[2]+": Höhe unbekannt","Bei der Besichtigung nachmessen.")});
  /* Überschneidungen */
  var seen={};
  all.forEach(function(x,i){all.slice(i+1).forEach(function(y){if(x.run===y.run||x.lv!==y.lv&&!(x.e.typ==="hoch"||y.e.typ==="hoch"))return;if(!hit(x.r,y.r))return;var k=x.run.id+"|"+y.run.id;if(seen[k])return;seen[k]=1;
    add("warn",y.e.id,(x.run.name||"Lauf")+" und "+(y.run.name||"Lauf")+" überschneiden sich","In der Ecke einen Lauf später beginnen lassen und die Ecke mit einer Blende schließen.")})});
  all.forEach(function(x){M.fixed.forEach(function(f){var fr=[+f.dx,+f.dy,+f.w,+f.h];if(hit(x.r,fr))add("warn",x.e.id,KK.label(M,x.e)+" steht im "+(f.n||"Vorsprung"),"Lauf verschieben oder kürzer machen.")});
    if(!x.run.wand)return;var w=x.run.wand,a=(num(x.run.start)||0)+x.off,b=a+x.b;
    M.doors.forEach(function(d){if(d.wall!==w||x.z0>=(num(d.h)||210))return;var p=KK.viewPos(M,w,num(d.off)||0,num(d.w)||80);if(ov(a,b,p,p+(num(d.w)||80))>1)add("warn",x.e.id,KK.label(M,x.e)+" steht vor der Tür","Tür ist "+(num(d.w)||80)+" cm breit.")});
    M.windows.forEach(function(d){if(d.wall!==w)return;var ww=num(d.w)||100,p=KK.viewPos(M,w,num(d.off)||0,ww);if(ov(a,b,p,p+ww)<=1)return;var br=num(d.brh);
      if(br==null)add("unk",x.e.id,"Fenster: Brüstung unbekannt","Höhe der Brüstung eintragen, dann wird geprüft, ob "+KK.label(M,x.e)+" passt.");
      else if(x.z1+(x.lv==="unten"&&x.e.typ!=="hoch"?+KK.ras(x.run).platte:0)>br)add("warn",x.e.id,KK.label(M,x.e)+" steht vor dem Fenster","Brüstung "+br+" cm, Oberkante "+x.z1+" cm.")})});
  /* Durchgang vor jedem Lauf */
  var ori=function(l){return l.wand?(l.wand==="n"||l.wand==="s"?"h":"v"):(l.rot==90?"v":"h")};
  var obst=unten.map(function(x){return {r:x.r,run:x.run}}).concat(M.fixed.map(function(f){return {r:[+f.dx,+f.dy,+f.w,+f.h],run:null}}));
  var gaps=[];
  M.runs.forEach(function(l){var bx=unten.filter(function(x){return x.run===l});if(!bx.length)return;var ob=obst.filter(function(o){return !o.run||!l.wand||ori(o.run)===ori(l)});  /* an der Wand zählen Läufe über Eck nicht */
    var x0=Math.min.apply(null,bx.map(function(x){return x.r[0]})),y0=Math.min.apply(null,bx.map(function(x){return x.r[1]})),x1=Math.max.apply(null,bx.map(function(x){return x.r[0]+x.r[2]})),y1=Math.max.apply(null,bx.map(function(x){return x.r[1]+x.r[3]}));
    var dirs=l.wand?[{n:"+y",e:"-x",s:"-y",w:"+x"}[l.wand]]:["+y","-y","+x","-x"],lang=l.wand?null:(l.rot==90?"x":"y");  /* Insel: Längsseiten 120, Stirnseiten 90 */
    dirs.forEach(function(dv){var g;
      if(dv==="+y"){g=M.H-y1;ob.forEach(function(o){if(o.run===l)return;if(ov(x0,x1,o.r[0],o.r[0]+o.r[2])>1&&o.r[1]>=y1-1)g=Math.min(g,o.r[1]-y1)})}
      if(dv==="-y"){g=y0;ob.forEach(function(o){if(o.run===l)return;if(ov(x0,x1,o.r[0],o.r[0]+o.r[2])>1&&o.r[1]+o.r[3]<=y0+1)g=Math.min(g,y0-o.r[1]-o.r[3])})}
      if(dv==="+x"){g=M.W-x1;ob.forEach(function(o){if(o.run===l)return;if(ov(y0,y1,o.r[1],o.r[1]+o.r[3])>1&&o.r[0]>=x1-1)g=Math.min(g,o.r[0]-x1)})}
      if(dv==="-x"){g=x0;ob.forEach(function(o){if(o.run===l)return;if(ov(y0,y1,o.r[1],o.r[1]+o.r[3])>1&&o.r[0]+o.r[2]<=x0+1)g=Math.min(g,x0-o.r[0]-o.r[2])})}
      gaps.push({l:l,g:Math.round(g),min:lang&&dv.indexOf(lang)<0?90:120})})});
  gaps.forEach(function(q){if(q.g<q.min)add("warn",q.l.id,"Durchgang "+(q.l.wand?"vor ":"an ")+(q.l.name||"Lauf")+" nur "+q.g+" cm","Mindestens "+q.min+" cm.")});
  var okG=gaps.filter(function(q){return q.g>=q.min});if(okG.length&&okG.length===gaps.length)add("ok","","Durchgang mindestens "+Math.min.apply(null,okG.map(function(q){return q.g}))+" cm");
  /* doppelte Meldungen zusammenfassen */
  var u={},out=[];H.forEach(function(h){var k=h.lvl+h.t;if(u[k])return;u[k]=1;out.push(h)});
  var ord={warn:0,info:1,unk:2,ok:3};out.sort(function(a,b){return ord[a.lvl]-ord[b.lvl]});
  var n=0;out.forEach(function(h){if(h.lvl==="warn")h.n=++n});return out};

/* ---------- Stückliste ---------- */
KK.bom=function(M){var rows=[];
  M.runs.forEach(function(l){var nm=l.name||"Lauf";
    l.unten.concat(l.oben).forEach(function(e){if(e.typ==="luecke")return;
      rows.push({kind:"el",id:e.id,run:nm,name:e.name||KK.ELT[e.typ],b:num(e.b),dec:e.dec==="bestand"?"bestand":"neu",status:e.status||"brauchen",preis:num(e.preis),link:e.link||""});
      var d=KK.dev(M,e);if(d)rows.push({kind:"dev",id:e.geraet,el:e.id,run:nm,name:d.name||KK.ART[d.art||"sonst"],b:num(d.w),dec:KK.DECNEU[d.dec]?"neu":"bestand",status:d.status||"",preis:num(d.preis),link:d.link||""})});
    var segs=KK.platte(l),p=l.platte||{};
    if(segs.length)rows.push({kind:"platte",id:l.id,run:nm,name:(p.name||"Arbeitsplatte")+" "+segs.map(function(q){return q[1]-q[0]}).join(" + ")+" × "+KK.ras(l).tiefe,b:segs.reduce(function(a,q){return a+q[1]-q[0]},0),dec:p.dec==="bestand"?"bestand":"neu",status:p.status||"brauchen",preis:num(p.preis),link:p.link||""})});
  var neu=rows.filter(function(x){return x.dec==="neu"});
  return {rows:rows,sum:neu.reduce(function(a,x){return a+(x.preis||0)},0),offen:neu.filter(function(x){return x.preis==null}).length}};
})();
