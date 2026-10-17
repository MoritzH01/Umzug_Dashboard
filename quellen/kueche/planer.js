/* Küchenplaner-Overlay im Canvas (Variante 1). Braucht kern.js (KK). Der Canvas ruft Kueche.init(api) auf. */
(function(){
var A=null,S={wall:null,sel:null,view:"plan"},NS="http://www.w3.org/2000/svg",root=null;
var $=function(q){return root.querySelector(q)};
var num=function(v){return KK.num(v)};
var esc=function(s){return A.esc(s)};
var ro=function(){return window.matchMedia("(max-width:760px)").matches};
function M(){return KK.model(A.R(),A.P(),A.KD(),A.I())}
function kd(){var d=A.KD();if(!d){var rid=KK.roomId(A.R(),null);d={room:rid,laeufe:[]};A.setKD(d)}d.laeufe=d.laeufe||[];return d}
function commit(){A.saveKD();draw()}
function savePlan(){A.savePlan();draw()}
var fmtE=function(n){return Math.round(n).toLocaleString("de-DE")+" €"};
var m2=function(v){return (v/100).toFixed(2).replace(".",",")};

/* ---------- SVG-Helfer ---------- */
function el(tag,at,p){var n=document.createElementNS(NS,tag);for(var k in at)if(at[k]!=null)n.setAttribute(k,at[k]);if(p)p.appendChild(n);return n}
function tx(p,x,y,s,at){var t=el("text",Object.assign({x:x,y:y},at||{}),p);t.textContent=s;return t}
function tip(n,s){var t=el("title",{},n);t.textContent=s}
function defs(svg){var d=el("defs",{},svg);
  var p=el("pattern",{id:"k-hatch",width:6,height:6,patternUnits:"userSpaceOnUse",patternTransform:"rotate(45)"},d);el("rect",{width:6,height:6,fill:"#fff"},p);el("line",{x1:0,y1:0,x2:0,y2:6,stroke:"#9a958a","stroke-width":1},p);
  var q=el("pattern",{id:"k-rest",width:5,height:5,patternUnits:"userSpaceOnUse",patternTransform:"rotate(-45)"},d);el("rect",{width:5,height:5,fill:"#eef1fd"},q);el("line",{x1:0,y1:0,x2:0,y2:5,stroke:"#2f4ee0","stroke-width":.8,opacity:.5},q)}
function badge(g,x,y,n){var b=el("g",{class:"kbadge"},g);el("circle",{cx:x,cy:y,r:8},b);tx(b,x,y+.5,String(n))}
function ansMark(g,x,y,a,i,r){var c=KK.ANS[a.typ]||["?","#9aa1b3",a.typ],m=el("g",{class:"kanc"},g);el("circle",{cx:x,cy:y,r:r||7,fill:c[1],stroke:"#fff","stroke-width":1.5},m);tx(m,x,y+.5,c[0]);
  tip(m,c[2]+(num(a.hoehe)==null?" · Höhe unbekannt":" · "+a.hoehe+" cm hoch"));if(!ro())m.addEventListener("click",function(ev){ev.stopPropagation();ansForm(i)});return m}
function elCls(M0,e){return "kel "+(e.typ==="regal"?"regal":e.dec==="bestand"?"bestand":"neu")+(S.sel===e.id?" sel":"")}
function warnMap(H){var w={};H.forEach(function(h){if(h.n&&h.id&&!w[h.id])w[h.id]=h.n});return w}
var GL={kuehl:"K",gefrier:"GF",ofen:"BO",mikro:"MW",gs:"GS",waschm:"WM",sonst:"G"};
var SH={kuehl:"kühlen",gefrier:"gefrieren",ofen:"backofen",mikro:"mikrowelle",spuele:"spüle",gs:"spülm.",kochfeld:"kochfeld",waschm:"waschm.",sonst:"gerät",abzug:""};
function wallName(M0,w){if(!w)return "";if(w.indexOf("run:")===0){var l=KK.run(M0,w.slice(4));return l?(l.name||"insel"):"insel"}return "wand "+KK.WAND[w]}
function runsOn(M0,w){if(!w)return [];if(w.indexOf("run:")===0){var l=KK.run(M0,w.slice(4));return l?[l]:[]}return M0.runs.filter(function(l){return l.wand===w})}
function wallOf(l){return l.wand||"run:"+l.id}

/* ---------- Grundriss ---------- */
function drawPlan(M0,svg,H){svg.innerHTML="";defs(svg);var W=M0.W,Hh=M0.H,pad=48,box=svg.getBoundingClientRect(),vw=box.width||400,vh=box.height||500,s=Math.min((vw-2*pad)/W,(vh-2*pad)/Hh);
  svg.setAttribute("viewBox","0 0 "+vw+" "+vh);var g=el("g",{transform:"translate("+((vw-W*s)/2)+","+((vh-Hh*s)/2)+")"},svg),P=function(v){return v*s},wm=warnMap(H);
  el("rect",{x:0,y:0,width:P(W),height:P(Hh),class:"pfloor"},g);
  tx(g,P(W/2),P(Hh/2)-4,(M0.room.name||"küche").toLowerCase(),{"text-anchor":"middle",class:"kmark"});
  tx(g,P(W/2),P(Hh/2)+12,m2(W)+" × "+m2(Hh)+" m",{class:"dimt","text-anchor":"middle",opacity:.6});
  M0.fixed.forEach(function(f,i){var r=el("rect",{x:P(+f.dx),y:P(+f.dy),width:P(+f.w),height:P(+f.h),class:"hatchr"},g);tip(r,f.n||"Vorsprung");
    if(/heiz/i.test(f.n||"")&&!ro()){r.style.cursor="pointer";r.addEventListener("click",function(ev){ev.stopPropagation();heizForm(f)})}
    tx(g,P(+f.dx+(+f.w)/2),P(+f.dy+(+f.h))+11,(f.n||"").toLowerCase(),{class:"dimt","text-anchor":"middle"})});
  M0.runs.forEach(function(l){var L=KK.layout(M0,l);
    KK.boxes(M0,l).forEach(function(x){var e=x.e,r=x.r,eg=el("g",{class:elCls(M0,e),"data-id":e.id},g),b=el("rect",{x:P(r[0]),y:P(r[1]),width:P(r[2]),height:P(r[3]),class:"b"},eg);tip(eg,KK.label(M0,e)+" · "+x.b+" cm");
      if(x.lv==="oben"){b.setAttribute("stroke-dasharray","5 3");b.setAttribute("fill","none");if(S.sel!==e.id)eg.style.pointerEvents="none";return}
      var a=KK.art(M0,e),cx=P(r[0]+r[2]/2),cy=P(r[1]+r[3]/2);
      if(a==="spuele"){el("rect",{x:cx-P(20),y:cy-P(17),width:P(40),height:P(34),rx:P(5),class:"g"},eg);el("circle",{cx:cx,cy:cy,r:P(3),class:"g"},eg)}
      else if(a==="kochfeld")[[-13,-13],[13,-13],[-13,13],[13,13]].forEach(function(q){el("circle",{cx:cx+P(q[0]),cy:cy+P(q[1]),r:P(9),class:"g"},eg)});
      else if(a&&a!=="abzug"){el("line",{x1:P(r[0]),y1:P(r[1]),x2:P(r[0]+r[2]),y2:P(r[1]+r[3]),class:"g"},eg);el("line",{x1:P(r[0]+r[2]),y1:P(r[1]),x2:P(r[0]),y2:P(r[1]+r[3]),class:"g"},eg);
        var t=tx(eg,cx,cy+4,GL[a]||"G",{"text-anchor":"middle"});t.style.font="700 11px var(--sans)";t.style.paintOrder="stroke";t.style.stroke="#fff";t.style.strokeWidth="5"}
      if(wm[e.id])badge(g,P(r[0]+r[2])-2,P(r[1])+2,wm[e.id]);
      eg.addEventListener("click",function(ev){ev.stopPropagation();S.sel=e.id;S.wall=wallOf(l);draw()})});
    if(L.rest>0){var r=KK.rect(M0,l,L.end,L.rest,KK.ras(l).tiefe),rg=el("g",{class:"krest"},g);el("rect",{x:P(r[0]),y:P(r[1]),width:P(r[2]),height:P(r[3])},rg);tip(rg,"Restmaß "+L.rest+" cm")}
    /* Kettenmaß außen bzw. vor der Insel */
    var cuts=[0];L.unten.forEach(function(it){cuts.push(it.off+it.b)});if(L.rest>0)cuts.push(L.len);var st0=num(l.start)||0,off=22,dg=el("g",{},g),vert=l.wand?(l.wand==="e"||l.wand==="w"):l.rot==90;
    var pt=function(a){var v=st0+a;if(!l.wand){var x0=num(l.x)||0,y0=num(l.y)||0,d=KK.ras(l).tiefe;return l.rot==90?[P(x0+d)+off,P(y0+a)]:[P(x0+a),P(y0+d)+off]}
      switch(l.wand){case "n":return [P(v),-off];case "e":return [P(W)+off,P(v)];case "s":return [P(W-v),P(Hh)+off];default:return [-off,P(Hh-v)]}};
    if(cuts.length>1){var p0=pt(0),p1=pt(cuts[cuts.length-1]);el("line",{x1:p0[0],y1:p0[1],x2:p1[0],y2:p1[1],class:"diml"},dg);
      cuts.forEach(function(c,i){var q=pt(c);el("line",{x1:vert?q[0]-4:q[0],y1:vert?q[1]:q[1]-4,x2:vert?q[0]+4:q[0],y2:vert?q[1]:q[1]+4,class:"diml"},dg);
        if(i){var mm=pt((c+cuts[i-1])/2),right=l.wand==="e"||(!l.wand&&l.rot==90),t=tx(dg,mm[0]+(vert?(right?6:-6):0),mm[1]+(vert?3:(l.wand==="n"?-5:12)),String(Math.round((c-cuts[i-1])*10)/10),{class:"dimt","text-anchor":vert?(right?"start":"end"):"middle"});
          if(i===cuts.length-1&&L.rest>0){t.style.fill="var(--blau)";t.style.fontWeight="600"}}})}});
  /* Wände, Öffnungen, Anschlüsse */
  el("rect",{x:0,y:0,width:P(W),height:P(Hh),class:"pwall"},g);
  var at=function(w,o){return w==="n"?[o,0]:w==="s"?[o,Hh]:w==="w"?[0,o]:[W,o]};
  M0.doors.forEach(function(d){var a=at(d.wall,num(d.off)||0),b=at(d.wall,(num(d.off)||0)+(num(d.w)||80));el("line",{x1:P(a[0]),y1:P(a[1]),x2:P(b[0]),y2:P(b[1]),class:"pgap"},g);
    var mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;tx(g,P(mx)+(d.wall==="w"?-8:d.wall==="e"?8:0),P(my)+(d.wall==="s"?16:d.wall==="n"?-8:3),"tür",{class:"dimt","text-anchor":d.wall==="w"?"end":d.wall==="e"?"start":"middle"})});
  M0.windows.forEach(function(d){var a=at(d.wall,num(d.off)||0),b=at(d.wall,(num(d.off)||0)+(num(d.w)||100)),h=d.wall==="n"||d.wall==="s";el("line",{x1:P(a[0]),y1:P(a[1]),x2:P(b[0]),y2:P(b[1]),class:"pgap"},g);
    [-2.5,2.5].forEach(function(o){el("line",{x1:P(a[0])+(h?0:o),y1:P(a[1])+(h?o:0),x2:P(b[0])+(h?0:o),y2:P(b[1])+(h?o:0),class:"pwin"},g)})});
  M0.ans.forEach(function(a){var i=(A.P().anschluesse||[]).indexOf(a),q=at(a.wall,num(a.off)||0);ansMark(g,P(q[0]),P(q[1]),a,i,6)});
  var wl={n:[[0,0],[W,0]],e:[[W,0],[W,Hh]],s:[[W,Hh],[0,Hh]],w:[[0,Hh],[0,0]]};
  ["n","e","s","w"].forEach(function(w){var q=wl[w];if(S.wall===w)el("line",{x1:P(q[0][0]),y1:P(q[0][1]),x2:P(q[1][0]),y2:P(q[1][1]),class:"wallsel"},g);
    var hl=el("line",{x1:P(q[0][0]),y1:P(q[0][1]),x2:P(q[1][0]),y2:P(q[1][1]),class:"wallhit"},g);tip(hl,"Wand "+KK.WAND[w]+" ansehen");hl.addEventListener("click",function(ev){ev.stopPropagation();S.wall=w;S.sel=null;draw()})});
  svg.onclick=function(){S.sel=null;draw()}}

/* ---------- Wandansicht ---------- */
function drawElev(M0,svg,H){svg.innerHTML="";defs(svg);var wall=S.wall,isl=wall&&wall.indexOf("run:")===0,runs=runsOn(M0,wall),C=M0.C;
  var L=isl?(runs[0]?KK.runLen(M0,runs[0])+60:200):KK.wallLen(M0,wall),box=svg.getBoundingClientRect(),vw=box.width||800,vh=box.height||400,padL=24,padR=70,padT=34,padB=74;
  var s=Math.min((vw-padL-padR)/L,(vh-padT-padB)/C);svg.setAttribute("viewBox","0 0 "+vw+" "+vh);
  var g=el("g",{transform:"translate("+(padL+((vw-padL-padR)-L*s)/2)+","+(padT+((vh-padT-padB)-C*s)/2)+")"},svg),X=function(v){return v*s},Y=function(h){return (C-h)*s},wm=warnMap(H);
  el("rect",{x:0,y:0,width:X(L),height:Y(0),fill:isl?"none":"#fff"},g);el("line",{x1:0,y1:0,x2:X(L),y2:0,class:"ceil"},g);tx(g,X(L)+8,4,"decke "+C,{class:"dimt"});
  if(!isl){/* was an der Wand anliegt: Vorsprünge und Seiten anderer Läufe */
    M0.fixed.forEach(function(f){var iv=KK.onWall(M0,wall,[+f.dx,+f.dy,+f.w,+f.h]);if(!iv)return;var kam=/kamin/i.test(f.n||""),z0=num(f.ab)||0,hh=num(f.hoehe),z1=kam?C:hh!=null?z0+hh:C;
      var r=el("rect",{x:X(iv[0]),y:Y(z1),width:X(iv[1]-iv[0]),height:Y(z0)-Y(z1),class:"hatchr"},g);if(!kam&&hh==null)r.setAttribute("stroke-dasharray","4 3");
      var cx=X((iv[0]+iv[1])/2),cy=Y((z0+z1)/2);tx(g,cx,cy,(f.n||"").toLowerCase()+(!kam&&hh==null?" · höhe ?":""),{class:"dimt","text-anchor":"middle",transform:"rotate(-90 "+cx+" "+cy+")"})});
    M0.runs.forEach(function(l){if(l.wand===wall)return;KK.boxes(M0,l).forEach(function(x){var iv=KK.onWall(M0,wall,x.r);if(!iv)return;el("rect",{x:X(iv[0]),y:Y(x.z1),width:X(iv[1]-iv[0]),height:Y(x.z0)-Y(x.z1),class:"kside"},g)})});
    M0.doors.forEach(function(d){if(d.wall!==wall)return;var w=num(d.w)||80,p=KK.viewPos(M0,wall,num(d.off)||0,w),hh=num(d.h),og=el("g",{class:"kop"+(hh==null?" unk":"")},g);
      el("rect",{x:X(p),y:Y(hh||210),width:X(w),height:Y(0)-Y(hh||210)},og);tx(og,X(p+w/2),Y((hh||210)/2),"tür"+(hh==null?" · höhe ?":""),{"text-anchor":"middle"});
      if(!ro())og.addEventListener("click",function(ev){ev.stopPropagation();opForm("doors",d)})});
    M0.windows.forEach(function(d){if(d.wall!==wall)return;var w=num(d.w)||100,p=KK.viewPos(M0,wall,num(d.off)||0,w),br=num(d.brh),hh=num(d.h),unk=br==null||hh==null,z0=br!=null?br:90,z1=z0+(hh!=null?hh:130),og=el("g",{class:"kop"+(unk?" unk":"")},g);
      el("rect",{x:X(p),y:Y(z1),width:X(w),height:Y(z0)-Y(z1)},og);tx(og,X(p+w/2),Y((z0+z1)/2),"fenster"+(unk?" · maße ?":""),{"text-anchor":"middle"});
      if(!ro())og.addEventListener("click",function(ev){ev.stopPropagation();opForm("windows",d)})})}
  if(!runs.length)tx(g,X(L/2),Y(C/2),ro()?"kein lauf an dieser wand":"noch kein lauf an dieser wand · „+ element“ legt einen an",{class:"kemptyt","text-anchor":"middle"});
  runs.forEach(function(l){var Lr=KK.layout(M0,l),R0=KK.ras(l),base=isl?30:(num(l.start)||0),bx=function(o){return X(base+o)},top=+R0.sockel+(+R0.korpus);
    Lr.unten.forEach(function(it){if(it.e.typ==="luecke")return;el("rect",{x:bx(it.off)+1,y:Y(+R0.sockel),width:Math.max(0,X(it.b)-2),height:Y(0)-Y(+R0.sockel),class:"sockel"},g)});
    KK.platte(l).forEach(function(q){el("rect",{x:bx(q[0]),y:Y(top+(+R0.platte)),width:X(q[1]-q[0]),height:Y(top)-Y(top+(+R0.platte)),class:"platte"},g)});
    [["unten",Lr.unten],["oben",Lr.oben]].forEach(function(pair){pair[1].forEach(function(it){var e=it.e;if(e.typ==="luecke"||!it.b)return;var h=KK.hts(l,e,pair[0]),y0=h[0],y1=h[1],x=bx(it.off),w=X(it.b),a=KK.art(M0,e),d=KK.dev(M0,e);
      var eg=el("g",{class:elCls(M0,e),"data-id":e.id},g);tip(eg,KK.label(M0,e)+" · "+it.b+" cm"+(d&&d.name&&e.name?" · "+d.name:""));
      var gl=function(x1,y1,x2,y2){el("line",{x1:x1,y1:y1,x2:x2,y2:y2,class:"g"},eg)};
      if(e.typ==="regal"){el("rect",{x:x,y:Y(y1),width:w,height:Y(y0)-Y(y1),class:"b",fill:"transparent",stroke:"transparent"},eg);[y0,y0+38,y0+76].forEach(function(hh){el("rect",{x:x,y:Y(hh)-2,width:w,height:4,fill:"#c8995f"},eg)})}
      else if(e.typ==="abzug"){el("rect",{x:x+1,y:Y(y1),width:w-2,height:Y(y0)-Y(y1),fill:"transparent"},eg);el("path",{d:"M"+(x+w*.38)+" "+Y(y1)+" L"+(x+w*.62)+" "+Y(y1)+" L"+(x+w*.62)+" "+Y(y0+14)+" L"+(x+w)+" "+Y(y0+6)+" L"+(x+w)+" "+Y(y0)+" L"+x+" "+Y(y0)+" L"+x+" "+Y(y0+6)+" L"+(x+w*.38)+" "+Y(y0+14)+" Z",class:"b"},eg)}
      else if(e.typ==="blende"||e.typ==="passleiste"){el("rect",{x:x+.5,y:Y(y1),width:Math.max(1,w-1),height:Y(y0)-Y(y1),class:"b"},eg)}
      else{el("rect",{x:x+1,y:Y(y1),width:Math.max(1,w-2),height:Y(y0)-Y(y1),class:"b"},eg);
        if(e.typ==="us"){if(a==="gs"||a==="waschm")gl(x+w*.3,Y(y1-6),x+w*.7,Y(y1-6));
          else if(a==="spuele"){gl(x+w/2,Y(y0),x+w/2,Y(y1));var ax=x+w/2,ay=Y(y1+(+R0.platte));el("path",{d:"M"+ax+" "+ay+" L"+ax+" "+(ay-X(26))+" Q"+ax+" "+(ay-X(32))+" "+(ax+X(8))+" "+(ay-X(30)),fill:"none",stroke:"#9aa0a6","stroke-width":2.2,"stroke-linecap":"round"},eg)}
          else if(a==="ofen"){el("rect",{x:x+5,y:Y(y1-8),width:w-10,height:Y(y0+12)-Y(y1-8),class:"g",rx:2},eg)}
          else{[.36,.68].forEach(function(f){gl(x+2,Y(y0+(y1-y0)*f),x+w-2,Y(y0+(y1-y0)*f))});gl(x+w/2-8,Y(y1-6),x+w/2+8,Y(y1-6))}
          if(a==="kochfeld")el("rect",{x:x+w*.12,y:Y(y1+(+R0.platte))-2,width:w*.76,height:2,fill:"#1c2a4b"},eg)}
        else if(e.typ==="hoch"){var ni=num(e.nische),dh=d?num(d.h):null;
          if(a==="ofen"||a==="mikro"){var o0=num(e.ab)||88,o1=o0+(ni||60);el("rect",{x:x+5,y:Y(y0+o1),width:w-10,height:Y(y0+o0)-Y(y0+o1),class:"g",rx:2},eg);gl(x+2,Y(y0+o0),x+w-2,Y(y0+o0));gl(x+2,Y(y0+o1),x+w-2,Y(y0+o1))}
          else if(a==="kuehl"||a==="gefrier"){if(ni){gl(x+2,Y(y0+ni),x+w-2,Y(y0+ni))}gl(x+w-8,Y(y0+100),x+w-8,Y(y0+130));
            if(ni&&dh&&dh>ni)el("rect",{x:x+6,y:Y(y0+dh),width:w-12,height:Y(y0)-Y(y0+dh),fill:"none",stroke:"var(--warn)","stroke-width":1.2,"stroke-dasharray":"4 3"},eg)}
          else gl(x+w/2,Y(y0),x+w/2,Y(y1))}
        else if(e.typ==="hs")gl(x+w/2,Y(y0),x+w/2,Y(y1))}
      var lab=a?SH[a]:"";if(lab){var ly=pair[0]==="oben"?(y0+y1)/2:e.typ==="hoch"?y0+170:y1-20,t=tx(eg,x+w/2,Y(ly)+3,lab,{"text-anchor":"middle"});if(w<52&&lab.length>5)t.setAttribute("transform","rotate(-90 "+(x+w/2)+" "+Y(ly)+")")}
      if(wm[e.id])badge(g,x+w-4,Y(y1)+4,wm[e.id]);
      eg.addEventListener("click",function(ev){ev.stopPropagation();S.sel=S.sel===e.id?null:e.id;draw()})})});
    if(Lr.rest>0){var rg=el("g",{class:"krest"},g),xr=bx(Lr.end);el("rect",{x:xr,y:Y(top+(+R0.platte)),width:X(Lr.rest),height:Y(0)-Y(top+(+R0.platte))},rg);tx(rg,xr+X(Lr.rest)/2,Y(top+(+R0.platte))-8,String(Lr.rest),{"text-anchor":"middle"});tip(rg,"Restmaß "+Lr.rest+" cm")}
    /* Kettenmaß und Laufmaß */
    var cuts=[0];Lr.unten.forEach(function(it){cuts.push(it.off+it.b)});if(Lr.rest>0)cuts.push(Lr.len);var dy=Y(0)+20,dg=el("g",{},g);
    if(cuts.length>1){el("line",{x1:bx(0),y1:dy,x2:bx(cuts[cuts.length-1]),y2:dy,class:"diml"},dg);
      cuts.forEach(function(c,i){var x=bx(c);el("line",{x1:x,y1:dy-4,x2:x,y2:dy+4,class:"diml"},dg);if(i){var t=tx(dg,bx((c+cuts[i-1])/2),dy-5,String(Math.round((c-cuts[i-1])*10)/10),{class:"dimt","text-anchor":"middle"});if(i===cuts.length-1&&Lr.rest>0){t.style.fill="var(--blau)";t.style.fontWeight="600"}}})}
    if(!isl&&base>0){el("line",{x1:X(0),y1:dy,x2:bx(0),y2:dy,class:"diml","stroke-dasharray":"2 2"},dg);tx(dg,X(base/2),dy-5,String(base),{class:"dimt","text-anchor":"middle"})}
    var dy2=dy+22,rgp=el("g",{class:"krun"},g);el("line",{x1:bx(0),y1:dy2,x2:bx(Lr.len),y2:dy2,class:"diml"},rgp);[bx(0),bx(Lr.len)].forEach(function(x){el("line",{x1:x,y1:dy2-4,x2:x,y2:dy2+4,class:"diml"},rgp)});
    el("rect",{x:bx(0),y:dy2-16,width:X(Lr.len),height:22,fill:"transparent"},rgp);tx(rgp,bx(Lr.len/2),dy2-5,(l.name||"lauf")+" · "+Lr.len+(ro()?"":" · bearbeiten"),{class:"dimt","text-anchor":"middle"});
    if(!ro())rgp.addEventListener("click",function(ev){ev.stopPropagation();laufForm(l.id)})});
  if(!isl)M0.ans.forEach(function(a){if(a.wall!==wall)return;var i=(A.P().anschluesse||[]).indexOf(a),x=X(KK.viewPos(M0,wall,num(a.off)||0,0)),h=num(a.hoehe);if(h==null){ansMark(g,x,Y(0)-12,a,i);tx(g,x+11,Y(0)-9,"höhe ?",{class:"unkt"})}else ansMark(g,x,Y(h),a,i)});
  el("line",{x1:-10,y1:Y(0),x2:X(L)+10,y2:Y(0),class:"floorl"},g);
  var R1=KK.ras(runs[0]),t0=+R1.sockel+(+R1.korpus)+(+R1.platte),hs=[+R1.sockel,t0,t0+(+R1.abstand),+R1.sockel+(+R1.hoch)],hx=X(L)+16;
  el("line",{x1:hx,y1:Y(0),x2:hx,y2:Y(C),class:"diml"},g);[0].concat(hs,[C]).forEach(function(h){el("line",{x1:hx-4,y1:Y(h),x2:hx+4,y2:Y(h),class:"diml"},g);if(h&&h!==C)tx(g,hx+7,Y(h)+3,String(h),{class:"dimt"})});
  svg.onclick=function(){if(S.sel){S.sel=null;draw()}}}

/* ---------- Werkzeug an der Auswahl ---------- */
function tool(M0){var host=$("#kep");host.querySelectorAll(".ktool").forEach(function(n){n.remove()});if(!S.sel||ro())return;var f=KK.find(M0,S.sel);if(!f){S.sel=null;return}
  var node=$("#kelev").querySelector('[data-id="'+S.sel+'"]');if(!node)return;var hb=host.getBoundingClientRect(),nb=node.getBoundingClientRect(),e=f.e,t=document.createElement("div");t.className="ktool";
  var x=Math.max(170,Math.min(hb.width-170,nb.left-hb.left+nb.width/2)),y=nb.top-hb.top;if(y<70){t.classList.add("below");y=nb.bottom-hb.top}t.style.left=x+"px";t.style.top=y+"px";
  var chips=(e.typ==="us"||e.typ==="hoch"||e.typ==="hs")?KK.ras(f.run).breiten.map(function(b){return '<button data-b="'+b+'" class="'+(+b===num(e.b)?"on":"")+'">'+b+'</button>'}).join(""):"";
  var hostDev=e.typ!=="blende"&&e.typ!=="passleiste"&&e.typ!=="regal";
  t.innerHTML='<b>'+esc(KK.label(M0,e))+'</b><span class="ksep"></span>'+chips+'<input data-w value="'+esc(e.b)+'" inputmode="decimal" title="Breite in cm"><span class="ksep"></span><button data-a="l" title="Nach links (←)">◂</button><button data-a="r" title="Nach rechts (→)">▸</button>'+
    '<span class="ksep"></span><button data-a="dec" title="Bestand oder neu">'+(e.dec==="bestand"?"bestand":"neu")+'</button>'+(hostDev?'<button data-a="dev">'+(e.geraet&&KK.dev(M0,e)?"gerät":"+ gerät")+'</button>':'')+'<button data-a="edit" title="Bearbeiten">✎</button><button data-a="del" title="Entfernen (Entf)">✕</button>';
  t.addEventListener("click",function(ev){ev.stopPropagation();var b=ev.target.closest("button");if(!b)return;
    if(b.dataset.b){e.b=+b.dataset.b;commit()}else act(b.dataset.a)});
  var inp=t.querySelector("[data-w]");inp.addEventListener("keydown",function(ev){ev.stopPropagation();if(ev.key==="Enter"){var v=num(inp.value);if(v!=null&&v>0){e.b=v;commit()}}else if(ev.key==="Escape"){S.sel=null;draw()}});
  inp.addEventListener("change",function(){var v=num(inp.value);if(v!=null&&v>0&&v!==num(e.b)){e.b=v;commit()}});
  host.appendChild(t)}
function act(a){var M0=M(),f=KK.find(M0,S.sel);if(!f)return;var arr=f.run[f.lv],e=f.e;
  if(a==="l"&&f.i>0){arr.splice(f.i,1);arr.splice(f.i-1,0,e);commit()}
  else if(a==="r"&&f.i<arr.length-1){arr.splice(f.i,1);arr.splice(f.i+1,0,e);commit()}
  else if(a==="dec"){e.dec=e.dec==="bestand"?"neu":"bestand";commit()}
  else if(a==="dev")devForm(e.id);
  else if(a==="edit")elForm(e.id);
  else if(a==="del"){arr.splice(f.i,1);S.sel=null;commit()}}

/* ---------- Hinzufügen ---------- */
var ADD=[["unten",[["us","Unterschrank",60],["hoch","Hochschrank",60],["blende","Blende",5],["passleiste","Passleiste",5],["luecke","Lücke",60]]],["oben",[["hs","Hängeschrank",60],["regal","Regal",80],["abzug","Dunstabzug",60],["luecke","Lücke",60]]]];
function menuHTML(){return ADD.map(function(g){return '<div class="kml">'+g[0]+'</div>'+g[1].map(function(x){return '<button data-lv="'+g[0]+'" data-t="'+x[0]+'">'+x[1]+'<small>'+x[2]+'</small></button>'}).join("")}).join("")}
function addEl(lv,typ){var M0=M(),runs=runsOn(M0,S.wall),f=S.sel&&KK.find(M0,S.sel),l=f&&runs.indexOf(f.run)>=0?f.run:runs[0];
  if(!l){laufForm(null,S.wall&&S.wall.indexOf("run:")<0?S.wall:"n",{lv:lv,typ:typ});return}
  var def=ADD[lv==="oben"?1:0][1].filter(function(x){return x[0]===typ})[0],b=def[2];
  if(typ==="passleiste"){var rs=KK.layout(M0,l).rest;if(rs>0&&rs<20)b=rs}
  var e={id:KK.newId("e"),typ:typ,b:b,dec:"neu",status:"brauchen"},arr=l[lv];
  if(f&&f.run===l&&f.lv===lv)arr.splice(f.i+1,0,e);else arr.push(e);S.sel=typ==="luecke"?null:e.id;commit()}
function applyRest(runId){var M0=M(),l=KK.run(M0,runId);if(!l)return;var v=KK.restVorschlag(l,KK.layout(M0,l).rest);if(!v)return;
  v.teile.forEach(function(p){l.unten.push({id:KK.newId("e"),typ:p[0],b:p[1],dec:"neu",status:"brauchen"})});S.wall=wallOf(l);S.sel=null;commit();A.toast(v.text+" eingesetzt")}

/* ---------- Formulare (im Canvas-Modal) ---------- */
function modal(title,body,onSave,onDel,note){var md=A.modal();
  md.innerHTML='<div class="bg"><form id="kf" autocomplete="off"><h2>'+title+'</h2>'+(note?'<p class="note2">'+note+'</p>':'')+body+'<div class="foot">'+(onDel?'<button type="button" class="btn del" id="kf-del">Löschen</button>':'')+'<button type="button" class="btn ghost" id="kf-x">Abbrechen</button><button class="btn">Speichern</button></div></form></div>';
  var close=function(){md.innerHTML=""};md.querySelector("#kf-x").onclick=close;md.querySelector(".bg").addEventListener("pointerdown",function(e){if(e.target===this)close()});
  if(onDel)md.querySelector("#kf-del").onclick=function(){if(onDel()!==false)close()};
  md.querySelector("#kf").addEventListener("submit",function(e){e.preventDefault();if(onSave(function(id){var n=md.querySelector("#"+id);return n?n.value.trim():""})!==false)close()});
  md.querySelector("#kf").addEventListener("keydown",function(e){e.stopPropagation();if(e.key==="Escape")close()});
  setTimeout(function(){var i=md.querySelector("#kf input,#kf select");if(i)i.focus()},30);return md}
var inp=function(id,lab,v,ph){return '<label>'+lab+'<input id="'+id+'" inputmode="decimal" value="'+esc(v==null?"":v)+'"'+(ph?' placeholder="'+esc(ph)+'"':'')+'></label>'};
var txt=function(id,lab,v,ph){return '<label>'+lab+'<input id="'+id+'" value="'+esc(v==null?"":v)+'"'+(ph?' placeholder="'+esc(ph)+'"':'')+'></label>'};
var sel=function(id,lab,opts,v){return '<label>'+lab+'<select id="'+id+'">'+opts.map(function(o){return '<option value="'+esc(o[0])+'"'+(String(o[0])===String(v)?' selected':'')+'>'+esc(o[1])+'</option>'}).join("")+'</select></label>'};
var WOPTS=[["n","oben"],["e","rechts"],["s","unten"],["w","links"],["","insel (frei)"]];
var nOrNull=function(v){var n=num(v);return n==null?null:n};
function laufForm(id,presetWall,then){var M0=M(),l=id?KK.run(M0,id):null,n=M0?M0.runs.length:0,r=l?KK.ras(l):KK.RASTER,raw=l&&l.raster||{};
  var def={name:"lauf "+String.fromCharCode(97+n),wand:presetWall==null?"n":presetWall,start:0};l=l||def;
  var body='<div class="row">'+txt("k-name","Name",l.name)+sel("k-wand","Wand",WOPTS,l.wand||"")+'</div>'+
    '<div class="g3">'+inp("k-start","Start ab links cm",l.start)+inp("k-len","Länge cm",l.len,"bis Wandende")+sel("k-rot","Insel-Richtung",[["0","waagerecht"],["90","senkrecht"]],l.rot||0)+'</div>'+
    '<div class="g3">'+inp("k-x","Insel x cm",l.x)+inp("k-y","Insel y cm",l.y)+inp("k-tiefe","Tiefe cm",raw.tiefe,r.tiefe)+'</div>'+
    '<p class="note2">Raster (leer = METOD-Vorgabe)</p><div class="g3">'+inp("k-sockel","Sockel",raw.sockel,KK.RASTER.sockel)+inp("k-korpus","Korpus unten",raw.korpus,KK.RASTER.korpus)+inp("k-platte","Platte",raw.platte,KK.RASTER.platte)+'</div>'+
    '<div class="g3">'+inp("k-abstand","Abstand Platte–oben",raw.abstand,KK.RASTER.abstand)+inp("k-hs","Hängeschrank hoch",raw.hs,KK.RASTER.hs)+inp("k-hoch","Hochschrank hoch",raw.hoch,KK.RASTER.hoch)+'</div>'+
    '<div class="row">'+inp("k-hst","Hängeschrank tief",raw.hsTiefe,KK.RASTER.hsTiefe)+txt("k-br","Breiten",raw.breiten?raw.breiten.join(", "):"",KK.RASTER.breiten.join(", "))+'</div>';
  modal(id?"lauf bearbeiten":"neuer lauf",body,function(v){var d=kd(),o=id?KK.run({runs:d.laeufe},id):{id:KK.newId("l"),unten:[],oben:[]};
    o.name=v("k-name")||def.name;o.wand=v("k-wand")||null;o.start=nOrNull(v("k-start"))||0;o.len=nOrNull(v("k-len"));o.rot=+v("k-rot")||0;o.x=nOrNull(v("k-x"));o.y=nOrNull(v("k-y"));
    if(!o.wand&&o.x==null){o.x=60;o.y=Math.round(M0.H/2-30)}
    var ra={};[["tiefe","k-tiefe"],["sockel","k-sockel"],["korpus","k-korpus"],["platte","k-platte"],["abstand","k-abstand"],["hs","k-hs"],["hoch","k-hoch"],["hsTiefe","k-hst"]].forEach(function(p){var x=nOrNull(v(p[1]));if(x!=null)ra[p[0]]=x});
    var br=v("k-br").split(/[,; ]+/).map(num).filter(function(x){return x>0});if(br.length)ra.breiten=br;if(Object.keys(ra).length)o.raster=ra;else delete o.raster;
    if(o.len==null)delete o.len;if(o.wand){delete o.x;delete o.y;delete o.rot}
    if(!id)d.laeufe.push(o);S.wall=wallOf(o);S.sel=null;
    if(then){commit();addEl(then.lv,then.typ);return}commit()},
    id?function(){if(!confirm("Diesen Lauf mit allen Schränken löschen?"))return false;var d=kd();d.laeufe=d.laeufe.filter(function(x){return x.id!==id});S.sel=null;commit()}:null,
    id?null:"Ein Lauf ist eine Schrankzeile an einer Wand. Für L, U oder zweizeilig mehrere Läufe anlegen, eine Insel steht frei im Raum.")}
function elForm(id){var M0=M(),f=KK.find(M0,id);if(!f)return;var e=f.e,lvT=f.lv==="oben"?[["hs","Hängeschrank"],["regal","Regal"],["abzug","Dunstabzug"],["luecke","Lücke"]]:[["us","Unterschrank"],["hoch","Hochschrank"],["blende","Blende"],["passleiste","Passleiste"],["luecke","Lücke"]];
  var body='<div class="row">'+sel("k-typ","Art",lvT,e.typ)+txt("k-name","Name",e.name,KK.ELT[e.typ])+'</div>'+
    '<div class="g3">'+inp("k-b","Breite cm",e.b)+inp("k-ni","Nische hoch cm",e.nische,"unbekannt")+inp("k-ab","Nische ab cm",e.ab,"")+'</div>'+
    '<div class="g3">'+sel("k-dec","Bestand oder neu",[["neu","neu"],["bestand","bestand"]],e.dec==="bestand"?"bestand":"neu")+sel("k-st","Status",KK.ST.map(function(s){return [s,s]}),e.status||"brauchen")+inp("k-preis","Preis €",e.preis)+'</div>'+
    txt("k-link","Shop-Link",e.link,"https://…");
  modal("schrank bearbeiten",body,function(v){e.typ=v("k-typ");e.name=v("k-name")||undefined;var b=num(v("k-b"));if(b>0)e.b=b;e.nische=nOrNull(v("k-ni"));e.ab=nOrNull(v("k-ab"));e.dec=v("k-dec");e.status=v("k-st");e.preis=nOrNull(v("k-preis"));e.link=v("k-link")||undefined;
    ["nische","ab","preis","name","link"].forEach(function(k){if(e[k]==null)delete e[k]});commit()},
    function(){f.run[f.lv].splice(f.i,1);S.sel=null;commit()},"Nische nur bei Schränken mit Einbaugerät (Kühlschrank, Backofen). „ab“ ist die Höhe über dem Sockel.")}
function devForm(elId){var M0=M(),f=KK.find(M0,elId);if(!f)return;var e=f.e,old=KK.dev(M0,e),d=Object.assign({art:e.typ==="abzug"?"abzug":e.typ==="hoch"?"kuehl":"spuele",dec:"kaufen",prio:1},old||{});
  var body='<div class="row"><label>Shop-Link<input id="k-link" type="url" placeholder="https://…" value="'+esc(d.link||"")+'"></label><button type="button" class="btn ghost" id="k-get">Holen</button></div><p class="note2" id="k-msg">Link einfügen und „Holen“ drücken, dann kommen Name, Maße und Preis.</p>'+
    '<div class="row">'+sel("k-art","Gerät",Object.keys(KK.ART).map(function(k){return [k,KK.ART[k]]}),d.art)+txt("k-name","Name",d.name)+'</div>'+
    '<div class="g3">'+inp("k-w","Breite cm",d.w)+inp("k-d","Tiefe cm",d.d)+inp("k-h","Höhe cm",d.h)+'</div>'+
    '<div class="row">'+sel("k-dec","Entscheidung",["kaufen","fest","mitnehmen","uebernehmen"].map(function(k){return [k,A.DECL[k]||k]}),d.dec)+inp("k-preis","Preis €",d.preis)+'</div>';
  var md=modal(old?"gerät bearbeiten":"gerät einsetzen",body,function(v){var I=A.I(),gid=e.geraet&&I[e.geraet]?e.geraet:"m"+Date.now().toString(36),o=Object.assign({},I[gid]||{},{typ:"geraet",art:v("k-art"),name:v("k-name")||KK.ART[v("k-art")],w:nOrNull(v("k-w")),d:nOrNull(v("k-d")),h:nOrNull(v("k-h")),dec:v("k-dec"),preis:nOrNull(v("k-preis")),link:v("k-link"),raum:M0.rid,prio:d.prio||1});
    ["w","d","h","preis"].forEach(function(k){if(o[k]==null)o[k]=""});if(!o.link)delete o.link;A.setItem(gid,o);e.geraet=gid;e.art=o.art;commit()},
    old?function(){var gid=e.geraet;delete e.geraet;delete e.art;if(confirm("Gerät auch aus den Möbeln löschen? (Abbrechen = nur aus dem Schrank nehmen)"))A.delItem(gid);commit()}:null,
    "Geräte stehen auch im Bereich Möbel unter Küche und zählen beim Geld mit.");
  var msg=function(t){md.querySelector("#k-msg").textContent=t};
  md.querySelector("#k-get").onclick=function(){var url=md.querySelector("#k-link").value;if(!url){msg("Bitte zuerst einen Link einfügen.");return}msg("Hole Daten …");
    A.fetchProduct(url).then(function(x){if(!x){msg("Das ist kein gültiger Link.");return}if(x.name)md.querySelector("#k-name").value=x.name;["w","d","h"].forEach(function(k){if(x[k])md.querySelector("#k-"+k).value=x[k]});if(x.preis)md.querySelector("#k-preis").value=x.preis;
      msg(x.err?"Der Shop-Abruf hat nicht geklappt. Bitte Maße von Hand eintragen.":(!x.w||!x.h?"Übernommen, Maße bitte ergänzen.":"Übernommen. Bitte kurz prüfen."))})}}
var ATYP=Object.keys(KK.ANS).map(function(k){return [k,KK.ANS[k][2]]});
function ansForm(i){var P=A.P(),M0=M(),a=i!=null&&i>=0?P.anschluesse[i]:{typ:"wasser",wall:S.wall&&S.wall.length===1?S.wall:"n",off:""},view=a.off!==""&&a.off!=null?KK.viewPos(M0,a.wall,num(a.off)||0,0):"";
  var body='<div class="row">'+sel("k-typ","Art",ATYP.concat([["heiz","Heizkörper"]]),a.typ)+sel("k-wall","Wand",WOPTS.slice(0,4),a.wall)+'</div>'+
    '<div class="g3">'+inp("k-off","Ab links cm",view)+inp("k-h","Höhe cm",a.hoehe,"unbekannt")+'<span></span></div>'+
    '<div class="g3" id="k-hz" hidden>'+inp("k-hw","Breite cm","")+inp("k-hd","Tiefe cm","")+inp("k-hab","Unterkante cm","","unbekannt")+'</div>';
  var md=modal(i!=null&&i>=0?"anschluss":"anschluss eintragen",body,function(v){var P2=A.P(),w=v("k-wall"),off=num(v("k-off"));if(off==null){A.toast("Bitte den Abstand von links eintragen.");return false}
    if(v("k-typ")==="heiz"){var hw=num(v("k-hw")),hd=num(v("k-hd"))||10;if(!hw){A.toast("Bitte die Breite des Heizkörpers eintragen.");return false}
      var p=KK.planOff(M0,w,off,hw),f={room:M0.rid,n:"Heizkörper",w:w==="n"||w==="s"?hw:hd,h:w==="n"||w==="s"?hd:hw,dx:w==="w"?0:w==="e"?M0.W-hd:p,dy:w==="n"?0:w==="s"?M0.H-hd:p};
      var ho=nOrNull(v("k-h")),ab=nOrNull(v("k-hab"));if(ho!=null)f.hoehe=ho;if(ab!=null)f.ab=ab;(P2.fixed=P2.fixed||[]).push(f);if(i!=null&&i>=0)P2.anschluesse.splice(i,1);savePlan();return}
    var o={room:M0.rid,wall:w,off:KK.planOff(M0,w,off,0),hoehe:nOrNull(v("k-h")),typ:v("k-typ")};P2.anschluesse=P2.anschluesse||[];if(i!=null&&i>=0)P2.anschluesse[i]=o;else P2.anschluesse.push(o);savePlan()},
    i!=null&&i>=0?function(){A.P().anschluesse.splice(i,1);savePlan()}:null,"Abstand von links, so wie man von innen auf die Wand schaut. Höhe leer lassen, wenn sie noch nicht gemessen ist.");
  var ty=md.querySelector("#k-typ"),sync=function(){md.querySelector("#k-hz").hidden=ty.value!=="heiz"};ty.onchange=sync;sync()}
function heizForm(f){var body='<div class="g3">'+inp("k-h","Höhe cm",f.hoehe,"unbekannt")+inp("k-ab","Unterkante cm",f.ab,"unbekannt")+'<span></span></div>';
  modal("heizkörper",body,function(v){var h=nOrNull(v("k-h")),ab=nOrNull(v("k-ab"));if(h==null)delete f.hoehe;else f.hoehe=h;if(ab==null)delete f.ab;else f.ab=ab;savePlan()},
    function(){var P=A.P();P.fixed=(P.fixed||[]).filter(function(x){return x!==f});savePlan()})}
function opForm(kind,o){var win=kind==="windows",body='<div class="g3">'+(win?inp("k-brh","Brüstung cm",o.brh,"unbekannt"):'')+inp("k-h","Höhe cm",o.h,"unbekannt")+'<span></span></div>';
  modal(win?"fenster":"tür",body,function(v){if(win){var b=nOrNull(v("k-brh"));if(b==null)delete o.brh;else o.brh=b}var h=nOrNull(v("k-h"));if(h==null)delete o.h;else o.h=h;savePlan()},null,"Lage und Breite stehen im Grundriss fest. Hier nur die Höhen.")}
function platteForm(runId){var M0=M(),l=KK.run(M0,runId);if(!l)return;var p=l.platte||{};
  var body='<div class="row">'+txt("k-name","Name",p.name,"Arbeitsplatte")+inp("k-preis","Preis € gesamt",p.preis)+'</div><div class="row">'+sel("k-dec","Bestand oder neu",[["neu","neu"],["bestand","bestand"]],p.dec||"neu")+sel("k-st","Status",KK.ST.map(function(s){return [s,s]}),p.status||"brauchen")+'</div>'+txt("k-link","Shop-Link",p.link,"https://…");
  modal("arbeitsplatte · "+esc(l.name||"lauf"),body,function(v){var o={name:v("k-name")||undefined,preis:nOrNull(v("k-preis")),dec:v("k-dec"),status:v("k-st"),link:v("k-link")||undefined};Object.keys(o).forEach(function(k){if(o[k]==null)delete o[k]});l.platte=o;commit()},null,"Länge und Stücke ergeben sich aus dem Lauf; Hochschränke teilen die Platte.")}

/* ---------- Stückliste ---------- */
function bomHTML(M0,B){if(!B.rows.length)return '<p class="kempty">Noch nichts geplant. Unter „planen“ einen Lauf anlegen.</p>';
  var stc=function(s,list){var i=list.indexOf(s);return i<=0?"":i>=list.length-1?"s2":"s1"};
  return '<table><thead><tr><th>Teil</th><th>Lauf</th><th>Breite</th><th>Status</th><th class="kr">Preis</th></tr></thead><tbody>'+B.rows.map(function(r){var list=r.kind==="dev"?(A.IST[(A.I()[r.id]||{}).dec]||[]):KK.ST,s=r.status||(list[0]||"");
    return '<tr><td>'+(r.kind==="dev"?'<span class="kmut">↳ </span>':'')+'<span class="kdot '+r.dec+'"></span><span class="kname" data-k="'+r.kind+'" data-id="'+esc(r.id)+'">'+esc(r.name)+'</span>'+(r.link?' <a href="'+esc(r.link)+'" target="_blank" rel="noopener" class="kmut">↗</a>':'')+'</td><td class="kn">'+esc(String(r.run).replace(/^lauf /,""))+'</td><td class="kn">'+(r.b?r.b+" cm":"")+'</td>'+
      '<td>'+(ro()?'<span class="kst '+stc(s,list)+'">'+esc(s||"–")+'</span>':'<button class="kst '+stc(s,list)+'" data-cyc="'+r.kind+'" data-id="'+esc(r.id)+'" title="Status weiterschalten">'+esc(s||"–")+'</button>')+'</td>'+
      '<td class="kr">'+(r.dec==="bestand"?'<span class="kmut">bestand</span>':r.preis==null?'<span class="kmut">offen</span>':fmtE(r.preis))+'</td></tr>'}).join("")+
    '<tr class="ktot"><td colspan="4">Summe neu'+(B.offen?' <span class="kmut">('+B.offen+' Preis offen)</span>':'')+'</td><td class="kr">'+fmtE(B.sum)+'</td></tr></tbody></table>'}
function cycle(kind,id){var M0=M();
  if(kind==="dev"){var I=A.I(),it=I[id];if(!it)return;var list=A.IST[it.dec]||[],i=list.indexOf(it.status);var o=Object.assign({},it,{status:list[(i+1)%list.length]});A.setItem(id,o);draw();return}
  var tgt=kind==="platte"?(KK.run(M0,id)||{}).platte||(KK.run(M0,id).platte={}):(KK.find(M0,id)||{}).e;if(!tgt)return;var j=KK.ST.indexOf(tgt.status||"brauchen");tgt.status=KK.ST[(j+1)%KK.ST.length];commit()}

/* ---------- Aufbau und Zeichnen ---------- */
function build(){root=document.createElement("div");root.id="kp";
  root.innerHTML='<div class="kback"></div><div class="kwin"><div class="ktop"><h1>küche</h1><span class="ksub" id="ksub"></span><span class="ksp"></span><div class="kseg" id="kview"><button data-v="plan" class="on">planen</button><button data-v="bom">stückliste</button></div><span class="ksum" id="ksum"></span><button class="kicon" id="kx" title="Schließen (Esc)" aria-label="Schließen">✕</button></div>'+
  '<div class="kbody"><div class="kpane" id="kpp"><div class="kph"><span class="kh2">grundriss</span><span class="ksp"></span><button class="kghost" data-a="lauf">+ lauf</button><button class="kghost" data-a="ans">+ anschluss</button></div><svg class="kfill" id="kplan"></svg>'+
  '<div class="klegend"><span><i class="kdot neu"></i>neu</span><span><i class="kdot bestand"></i>bestand</span><span style="color:var(--blau)">▨ restmaß</span><span>- - oben</span></div></div>'+
  '<div class="kpane" id="kep"><div class="kph"><span class="kh2" id="kwt"></span><div class="kseg" id="kwalls"></div><span class="ksp"></span><div class="kadd"><button class="kghost" data-a="add">+ element ▾</button><div class="kmenu" id="kmenu" hidden>'+menuHTML()+'</div></div></div><svg class="kfill" id="kelev"></svg></div></div>'+
  '<div class="kbom" id="kbom"></div><div class="kfoot" id="khints"></div></div>';
  document.body.appendChild(root);
  $("#kx").onclick=close;root.querySelector(".kback").onclick=close;
  $("#kview").onclick=function(e){var b=e.target.closest("button");if(!b)return;S.view=b.dataset.v;draw()};
  $("#kwalls").onclick=function(e){var b=e.target.closest("button");if(!b)return;S.wall=b.dataset.w;S.sel=null;draw()};
  root.querySelector('[data-a="lauf"]').onclick=function(){laufForm(null,S.wall&&S.wall.length===1?S.wall:"n")};
  root.querySelector('[data-a="ans"]').onclick=function(){ansForm(null)};
  root.querySelector('[data-a="add"]').onclick=function(e){e.stopPropagation();$("#kmenu").hidden=!$("#kmenu").hidden};
  $("#kmenu").onclick=function(e){var b=e.target.closest("button");if(!b)return;$("#kmenu").hidden=true;addEl(b.dataset.lv,b.dataset.t)};
  root.addEventListener("click",function(e){if(!e.target.closest(".kadd"))$("#kmenu").hidden=true});
  $("#khints").onclick=function(e){var a=e.target.closest("[data-act]");if(a){e.stopPropagation();applyRest(a.dataset.act);return}var h=e.target.closest(".khint");if(!h||!h.dataset.id)return;var M0=M(),f=KK.find(M0,h.dataset.id),l=KK.run(M0,h.dataset.id);
    if(f){S.sel=f.e.id;S.wall=wallOf(f.run)}else if(l){S.sel=null;S.wall=wallOf(l)}S.view="plan";draw()};
  $("#kbom").onclick=function(e){var c=e.target.closest("[data-cyc]");if(c){cycle(c.dataset.cyc,c.dataset.id);return}var n=e.target.closest(".kname");if(!n||ro())return;var k=n.dataset.k,id=n.dataset.id,M0=M();
    if(k==="el")elForm(id);else if(k==="platte")platteForm(id);else if(k==="dev"){var host=null;M0.runs.forEach(function(l){l.unten.concat(l.oben).forEach(function(x){if(x.geraet===id)host=x})});if(host)devForm(host.id)}};
  document.addEventListener("keydown",function(e){if(!root.classList.contains("open")||A.modal().innerHTML)return;var t=e.target;if(t&&/INPUT|TEXTAREA|SELECT/.test(t.tagName))return;
    if(e.key==="Escape"){e.preventDefault();if(S.sel){S.sel=null;draw()}else close()}
    else if((e.key==="Delete"||e.key==="Backspace")&&S.sel&&!ro()){e.preventDefault();act("del")}
    else if(e.key==="ArrowLeft"||e.key==="ArrowRight"){e.preventDefault();if(S.sel&&!ro())act(e.key==="ArrowLeft"?"l":"r");else{var ws=wallKeys(M()),i=ws.indexOf(S.wall);S.wall=ws[(i+(e.key==="ArrowLeft"?ws.length-1:1))%ws.length];draw()}}},true);
  addEventListener("resize",function(){if(root.classList.contains("open"))draw()})}
function wallKeys(M0){return ["n","e","s","w"].concat(M0.runs.filter(function(l){return !l.wand}).map(function(l){return "run:"+l.id}))}
function draw(){if(!root||!root.classList.contains("open"))return;var M0=M();if(!M0){close();A.toast("Kein Raum „Küche“ im Grundriss.");return}
  var ws=wallKeys(M0);if(ws.indexOf(S.wall)<0)S.wall=M0.runs.length?wallOf(M0.runs[0]):"n";if(S.sel&&!KK.find(M0,S.sel))S.sel=null;
  root.classList.toggle("vbom",S.view==="bom");root.querySelector(".kwin").classList.toggle("ro",ro());
  [].forEach.call($("#kview").children,function(b){b.classList.toggle("on",b.dataset.v===S.view)});
  $("#ksub").textContent=m2(M0.W)+" × "+m2(M0.H)+" m · "+M0.runs.length+" "+(M0.runs.length===1?"lauf":"läufe")+" · metod";
  var B=KK.bom(M0);$("#ksum").innerHTML="<b>"+fmtE(B.sum)+"</b> neu"+(B.offen?" · "+B.offen+" preis offen":"");
  $("#kwalls").innerHTML=ws.map(function(w){var n=w.length===1?KK.WAND[w]:(KK.run(M0,w.slice(4))||{}).name||"insel",has=runsOn(M0,w).length;return '<button data-w="'+w+'" class="'+(w===S.wall?"on":"")+'">'+esc(n)+(has&&w.length===1?" ·":"")+'</button>'}).join("");
  $("#kwt").textContent=wallName(M0,S.wall);
  var H=KK.hints(M0),ok=H.filter(function(h){return h.lvl==="ok"});
  $("#khints").innerHTML='<span class="klbl">prüfung</span>'+H.filter(function(h){return h.lvl!=="ok"}).map(function(h){return '<div class="khint '+h.lvl+'" data-id="'+esc(h.id)+'" title="'+esc(h.s)+'"><i>'+(h.n||{info:"i",unk:"?"}[h.lvl])+'</i><span>'+esc(h.t)+'</span>'+(h.act?'<button class="kact" data-act="'+esc(h.act.run)+'">'+h.act.label+'</button>':'')+'</div>'}).join("")+
    (ok.length?'<div class="khint ok" title="'+esc(ok.map(function(h){return h.t}).join(" · "))+'"><i>✓</i><span>'+ok.length+' in ordnung</span></div>':'');
  if(S.view==="bom"){$("#kbom").innerHTML=bomHTML(M0,B);return}
  if(!ro())drawPlan(M0,$("#kplan"),H);drawElev(M0,$("#kelev"),H);tool(M0)}
function open(){if(!root)build();var M0=M();if(!M0){A.toast("Kein Raum „Küche“ im Grundriss.");return}root.classList.add("open");document.body.classList.add("kp-open");S.view="plan";draw()}
function close(){if(!root)return;root.classList.remove("open");document.body.classList.remove("kp-open");S.sel=null;A.render()}

/* ---------- Küche im Canvas-Grundriss (Weltkoordinaten) ---------- */
function planSVG(){var M0=M();if(!M0||!M0.runs.length)return "";var r=M0.room,ox=+r.x,oy=+r.y,s="";
  M0.runs.forEach(function(l){KK.boxes(M0,l).forEach(function(x){var e=x.e,q=x.r,c=e.typ==="regal"?"regal":e.dec==="bestand"?"bestand":"neu",a=KK.art(M0,e),X0=ox+q[0],Y0=oy+q[1];
    s+='<g class="kz '+c+(x.lv==="oben"?" oben":"")+'"><rect class="b" x="'+X0+'" y="'+Y0+'" width="'+q[2]+'" height="'+q[3]+'"/>';
    if(x.lv==="unten"&&a==="spuele")s+='<rect class="g" x="'+(X0+q[2]/2-20)+'" y="'+(Y0+q[3]/2-17)+'" width="40" height="34" rx="5"/>';
    if(x.lv==="unten"&&a==="kochfeld")[[-13,-13],[13,-13],[-13,13],[13,13]].forEach(function(p){s+='<circle class="g" cx="'+(X0+q[2]/2+p[0])+'" cy="'+(Y0+q[3]/2+p[1])+'" r="9"/>'});
    s+='</g>'})});return s}

window.Kueche={init:function(api){A=api},open:open,close:close,refresh:function(){if(root&&root.classList.contains("open")&&!A.modal().innerHTML)draw()},planSVG:planSVG,isOpen:function(){return !!(root&&root.classList.contains("open"))}};
})();
