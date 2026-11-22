/* IKEA-Küchenplan vom 22.11.2026 (Planungs-ID C48C84A3), eingepasst ins Aufmaß der Küche.
   Wird einmal nach meta/kueche geschrieben (meta/settings.kuSeed), nur wenn dort noch keine Läufe stehen.
   Danach gilt nur die Datenbank; bearbeitet wird im Küchenplaner des Canvas.
   Läufe:
   - „spüle“ an der Flurwand (w): ab 122,8 cm von der Südecke bis zum Kaminvorsprung. Deckseite frei stehend,
     Waschmaschine 60,5 (Lücke 0,7 cm breiter als im IKEA-Plan, Gerät 60 breit), Deckseite, Spülenschrank 80 (Fronten 20/20/40), Deckseite.
   - „kochfeld“ an der Kaminwand (n): ab dem Kaminvorsprung (121 cm). Passleiste 5,8 am Vorsprung, Spülmaschine 59,8 unter der Platte, Deckseite,
     Schubladen 60 (40/40), Kochfeld und Backofen 60, Schubladen 40 (40/40), Deckseite, Kühlschrank 65.
   Spül- und Waschmaschine sind gegenüber dem IKEA-Plan getauscht (Wunsch vom 22.11.2026).
   fronten: von oben nach unten, Zahl = Front dieser Höhe; {h, t:"ofen"|"offen"} für Backofen bzw. offenen Korpus.
   gh: Gerätehöhe als Kopie für die 3D-Ansicht. geraet2/art2: zweites Gerät im selben Schrank (Backofen unter dem Kochfeld).
   boden: Deckseite reicht bis zum Boden. */
var KU_SEED={
  room:"kueche",griff:"holz",
  laeufe:[
    {id:"ku-spuele",name:"spüle",wand:"w",start:122.8,len:144.2,
     raster:{sockel:8,korpus:80,platte:2.7,tiefe:60,platteTiefe:63.5},
     platte:{name:"Arbeitsplatte Eiche geölt 240 × 63,5 × 2,7",preis:179},
     unten:[
       {id:"ku-d1",typ:"blende",b:1.2,dec:"neu",name:"FÖRBÄTTRA Deckseite (frei stehend)",boden:true},
       {id:"ku-wm",typ:"us",b:60.5,dec:"neu",name:"Waschmaschine",geraet:"ku-g-wm",art:"waschm",gh:85},
       {id:"ku-d2",typ:"blende",b:1.2,dec:"neu",name:"FÖRBÄTTRA Deckseite"},
       {id:"ku-sp",typ:"us",b:80,dec:"neu",name:"METOD Spülenschrank 80 · VALLSTENA",geraet:"ku-g-sp",art:"spuele",fronten:[20,20,40]},
       {id:"ku-d3",typ:"blende",b:1.2,dec:"neu",name:"FÖRBÄTTRA Deckseite"}],
     oben:[]},
    {id:"ku-koch",name:"kochfeld",wand:"n",start:121,
     raster:{sockel:8,korpus:80,platte:2.7,tiefe:60,platteTiefe:63.5},
     platte:{name:"Arbeitsplatte Eiche geölt 240 × 63,5 × 2,7",preis:179},
     unten:[
       {id:"ku-pl",typ:"passleiste",b:5.8,dec:"neu",name:"Passleiste am Kaminvorsprung"},
       {id:"ku-gs",typ:"us",b:59.8,dec:"neu",name:"Spülmaschine",geraet:"ku-g-gs",art:"gs",gh:87.5},
       {id:"ku-d4",typ:"blende",b:1.2,dec:"neu",name:"FÖRBÄTTRA Deckseite"},
       {id:"ku-s60",typ:"us",b:60,dec:"neu",name:"METOD 60 mit MAXIMERA · VALLSTENA",fronten:[40,40]},
       {id:"ku-ofen",typ:"us",b:60,dec:"neu",name:"METOD 60 für Kochfeld und Backofen",geraet:"ku-g-kf",art:"kochfeld",geraet2:"ku-g-of",art2:"ofen",fronten:[{h:10,t:"offen"},{h:60,t:"ofen"},10]},
       {id:"ku-s40",typ:"us",b:40,dec:"neu",name:"METOD 40 mit MAXIMERA · VALLSTENA",fronten:[40,40]},
       {id:"ku-d5",typ:"blende",b:1.2,dec:"neu",name:"FÖRBÄTTRA Deckseite"},
       {id:"ku-kue",typ:"hoch",b:65,dec:"neu",name:"Kühlschrank",geraet:"ku-g-kue",art:"kuehl",gh:186}],
     oben:[]}
  ]};
/* Geräte als Möbel (items, typ geraet). Maße aus den Produktdatenblättern, wo vorhanden. */
var KU_ITEMS={
  "ku-g-kf":{name:"AEG TO64IC0FIT Induktionskochfeld",typ:"geraet",art:"kochfeld",w:58,d:52,h:"",link:"https://www.mediamarkt.de/de/product/_aeg-to64ic0fit-induktionskochfeld-580-mm-breit-4-kochzonen-2997527.html"},
  "ku-g-of":{name:"AEG TS6PB51ZAB Einbaubackofen",typ:"geraet",art:"ofen",w:59.5,d:"",h:"",link:"https://www.mediamarkt.de/de/product/_aeg-ts-6-pb-51-zab-einbauherdbackofen-einbaugerat-71-l-595-mm-breit-6000-2960634.html"},
  "ku-g-wm":{name:"AEG LR6F5E485 Waschmaschine",typ:"geraet",art:"waschm",w:60,d:58,h:85,link:"https://www.mediamarkt.de/de/product/_aeg-lr6f5e485-6000-waschmaschine-80-kg-1351-umin-a-ja-3039494.html"},
  "ku-g-gs":{name:"Bosch SMU4ECS32E Spülmaschine",typ:"geraet",art:"gs",w:60,d:57,h:82,link:"https://www.mediamarkt.de/de/product/_bosch-smu4ecs32e-serie-4-geschirrspuler-unterbaufahig-598-mm-breit-42-db-a-a-2960355.html",notiz:"Höhe 82 cm laut Datenblatt, mit den Füßen bis unter die Platte (88 cm) anpassen."},
  "ku-g-sp":{name:"Primagran Sydney 780.60 Ergo Multilevel, Schwarz metallic",typ:"geraet",art:"spuele",w:78,d:50,h:20,preis:249.99,link:"https://primagran.de/kuechenspuele/kchensple-aus-granit-mit-abtropfflche-und-breitem-becken-sydney-780-60-ergo-multilevel-gratisgeschenk.html#/schneidebrett-schneidbrett-aus-eiche/abtropfschale-abtropfschale-workstation-stahl/aufrollbare-abtropfflache-aufrollbare-abtropfflache-stahl/wahlen-sie-die-ausrichtung-der-abtropfflache-abtropfflache-auf-der-linken-seite/wahlen-sie-eine-farbe-schwarz-metallic",
    notiz:"Granit, 78 × 50 cm, Abtropffläche links (21 cm), Becken 54 × 40 × 20 cm, Armatur mittig hinter dem Becken, für Unterschrank ab 60 cm (primagran.de, 22.11.2026). Preis 249,99 € mit Buchenbrett; Schneidebrett Eiche 24,99 € und Abtropfschale Workstation Stahl 14,99 € extra, aufrollbare Abtropffläche Stahl gratis. Armatur nicht dabei."},
  "ku-g-kue":{name:"Liebherr Kühl-Gefrier-Kombination grau",typ:"geraet",art:"kuehl",w:60,d:"",h:186,notiz:"Modell noch offen. Höhe 186 cm aus dem Platz im IKEA-Plan (65 cm breit)."}
};
