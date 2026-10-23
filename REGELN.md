# Regeln

Was für das Umzugs-Dashboard schon entschieden ist. Wer etwas ändert (Mensch oder Claude), hält sich daran. Neue Entscheidungen kommen hier dazu, mit Datum.

## Grundsätze

- Alles, was geplant wird, lebt im Dashboard und ist dort von Hand bearbeitbar. Die App funktioniert komplett ohne KI; Claude ergänzt nur, ersetzt nichts. (16.10.2026)
- Vor einem endgültigen Umbau der Gestaltung erst mehrere Varianten zeigen und wählen lassen.
- Sprache der Oberfläche ist Deutsch.

## Namen

- Die Startseite heißt **Canvas**, nie „Tafel“, in der Oberfläche wie in Nachrichten. (17.10.2026) Dateinamen wie `tafel.tpl.html` oder `build_tafel.py` bleiben aus historischen Gründen so.
- Seiten: `index.html` = Canvas, `3d.html` = 3D-Ansicht. `liste.html` leitet nur noch auf den Canvas weiter. (17.10.2026)

## Alles auf dem Canvas (17.10.2026)

- Alles findet auf dem Canvas statt. Die Listenansicht ist aufgelöst; was sie konnte, ist im Canvas: Möbel-Status, Herkunft, Notiz, Wandmontage, erzielter Preis, Ablöse, Abholtermin im Möbelformular; Wer und Notiz bei Aufgaben; Abhaken in „Jetzt dran“ und im Raumblatt; Google-Kalender-Link am Termin.
- Menü „daten“ in der Leiste: Umzugsdatum und Deckenhöhe (`meta/settings.moveDate`, `ceiling`), Sicherung als Datei (Export/Import), Papierkorb mit Zurückholen und endgültig Löschen.
- Konfliktprüfung im Grundriss, Umschalter „prüfen“ (Standard an): Möbel mit Konflikt rot gestrichelt (überlappt, ragt in die Wand, Türschwenk, Kaminvorsprung, zu hoch für die Decke), Abstände unter 60 cm orange, Türschwenk rot getönt. Hinweise stehen in der Leiste des ausgewählten Möbels. Wandansicht im Raumblatt.
- Ideen aus der alten Liste (Collection `ideas`) sind einmalig ins Moodboard gewandert und dort als gelöscht markiert. Neue Ideen kommen als Bild oder Post-it ins Moodboard.
- Bereiche schneiden nichts ab und scrollen nicht in sich (17.10.2026): Bereiche mit Inhalt (Jetzt dran, Möbel, Pflanzen, Verkaufen, Utensilien, Verträge, Geld) wachsen nach dem Zeichnen auf die Höhe ihres Inhalts; was darunter liegt (Bereiche, Grundriss, Post-its darin), rückt nach unten. Sie wachsen nur, schrumpfen nicht von selbst; von Hand kleiner ziehen geht nur bis zur Inhaltshöhe. Verträge brechen in Zeilen um statt seitlich zu scrollen.
- Bereiche verschieben (22.10.2026): Alles, was auf einem Bereich liegt (Post-its, Texte, Bilder, deren linke obere Ecke im Bereich sitzt), ist dort verankert und wandert mit, wenn man den Bereich an der Überschrift zieht.
- Post-its (22.10.2026): Größe am Griff unten rechts änderbar (`w`, `h` im Element, Standard 190 × 170). Die Schrift wächst mit dem Zettel und wird kleiner, bis der Text ganz hineinpasst; nichts steht über den Rand.
- Handy: Knopf „bereiche“ und Antippen einer Bereichsüberschrift öffnen den Bereich als Vollbild; der Zeitplan erscheint dort als Liste.

## Gestaltung

- Canvas im Stil „Zeichentisch“: Schrift dunkelblau `#1c2a4b`, Akzent Kobalt `#2f4ee0`, Überschriften klein geschrieben in Inter Tight, Post-its in Courier Prime, helle schwebende Werkzeugleiste.
- Immer hell, kein Dunkelmodus.
- Möbelfarben auf dem Grundriss wie im Bauantrag: Bestand grau, neu rot, weg gelb gestrichelt.
- Bedienung Touchpad: zwei Finger schieben, Kneifen zoomt.
- Der Knopf „3d“ ist als Rahmen hervorgehoben und auf dem Handy sichtbar.
- Wohnungsstil als Richtschnur für Vorschläge: Altbau, Fischgrät-Parkett, hohe Decken, viele Pflanzen und Bücher, weiße Wände, Eiche, Edelstahl, Akzente Tomatenrot, Orange, Kobalt, Senfgelb.

## Grundriss und Räume

- Der Grundriss stammt aus dem Originalplan (16.10.2026). Räume liegen fest und werden nicht nebenbei verschoben. Geändert werden sie nur im Raumblatt nach „Grundriss entsperren“ mit Rückfrage: Name, Maße, Lage, Türen und Fenster, neuer Raum, Raum löschen (in den Papierkorb). (17.10.2026)
- Kompass: Plan-rechts ist Nordost (`meta/plan.north = 45`).
- Räume werden einzeln nach Plan und Fotos überarbeitet, ohne Einrichtung. Wo der Plan unklar ist, gelten die Fotos. (17.10.2026)
- Wohnzimmer: ein Fenster, keine Tür zum Schlafzimmer, kein Kaminvorsprung, aber ein Vorsprung 103 × 33 in der Ecke zum Bad (22.10.2026). Schlafzimmer: ein Fenster, Kaminvorsprung in der Ecke. Flur: Eingangstür in der Längswand, Einbauschrank in die Stirnwand eingelassen (ragt nicht in den Flur). Bad: kein Fenster. Küche: Kaminvorsprung an der Ecke Brandwand/Flur, kein Fenster, nur die Balkontür; die Küchenzeile gehört nicht in den Grundriss. Büro: ein Fenster, Tür mit Scharnier im Süden. Klo: ein schmales Fenster, Tür mit Scharnier im Süden, Vorsprung bis zur Decke in der Ecke neben dem Fenster. (17.10.2026)
- Türen haben eine Anschlagseite: ohne Angabe sitzt das Scharnier am Anfang der Öffnung (bei `off`), mit `hinge: "end"` am Ende. Im entsperrten Raumblatt schaltet der Knopf ⟳/⟲ um. (17.10.2026)
- Aufmaß (22.10.2026): Maße von Wohnzimmer, Schlafzimmer, Küche, Büro (Kammer), Bad-Breite und Flur-Breite sind gemessen; die Skizzen hängen als Foto im jeweiligen Raum. Decke überall 300 cm. Nicht gemessen: Bad-Tiefe, Flur-Länge, Klo. Türen: `w` ist die Öffnung in der Wand nach den gemessenen Wandlängen (wegen der dicken Altbauwände teils breit, Wohnzimmer 153 cm), `blatt` das Türblatt (Standard 86 cm); es sitzt mittig in der Öffnung, Schwenk und Prüfung rechnen mit dem Blatt. Im entsperrten Raumblatt sind beide Felder editierbar. Wohnzimmer- und Schlafzimmertür haben das Scharnier im Süden. Fenster, Heizkörper (`fixed` „Heizkörper“), Steckdosen, Internet und Wasser (`anschluesse`, Typ `internet` neu) sind nur ungefähr eingetragen und tragen `ca: true`. Vorsprünge („Vorsprung“ im Namen) gehen in der 3D-Ansicht wie Kamine bis zur Decke. Im Grundriss des Canvas stehen die Anschlüsse als kleine Marken an der Wand.

## 3D-Ansicht

- Geometrie strikt nur aus dem Grundriss des Canvas (`rooms`, `meta/plan`). Nichts erfinden.
- Oberflächen nur nach den Raumfotos (Tabelle `LOOK` je Raum in `quellen/3d/wohnung3d.tpl.html`); Räume ohne Foto bleiben neutral.
- Hohe Wände fest, kein Umschalter. Vorerst keine Möbel. Ausnahme: die Küchenläufe aus dem Küchenplaner als schlichte Körper (Korpus, Platte, Hängeschrank); Fliesenspiegel und Schieferfeld folgen dem Lauf mit Kochfeld. (17.10.2026)
- Kaminvorsprünge (`meta/plan.fixed` mit „Kamin“ im Namen) gehen bis zur Decke. (17.10.2026)
- Ansichten Puppenhaus, Draufsicht und Rundgang bleiben.

## Küchenplaner (17.10.2026)

- Overlay im Canvas für den Raum Küche, so gebaut, dass es später für andere Räume taugt. Geplant werden Bestand und Neues zusammen, Farben wie im Bauantrag.
- Schlank, funktional, schick: Werkzeuge erscheinen erst, wenn etwas ausgewählt ist; trotzdem bleiben alle Funktionen erreichbar.
- Datenmodell: Läufe in `meta/kueche`, je Lauf `{wand | frei, start, höhen, raster, elemente[]}` mit drei Ebenen (unten, oben, hoch). Positionen werden aus der Reihe berechnet, nicht frei gespeichert. Geräte sind `items` (mit Shop-Link über `produkt`) und liegen in Schrankfeldern; die Passung prüft das Nischenmaß.
- Raster: Vorlage IKEA METOD (Breiten 20/30/40/60/80, Korpus 80, Füße 8, Hängeschrank 37 tief), pro Lauf editierbar.
- Formen: Zeile, L, U, zweizeilig, Insel (Lauf ohne Wand). Ecken als Blende, kein eigenes Eckmodul.
- Maße zentimetergenau mit Kettenmaß und Restmaß je Lauf. Unbekannte Werte bleiben leer und sind als „unbekannt“ markiert, nichts wird geraten.
- Plan-Erweiterung für alle Räume: `meta/plan.anschluesse[]` `{room, wall, off, hoehe, typ}` (Wasser, Abfluss, Steckdose, Starkstrom, Abluft, Gas), Brüstung und Höhe je Fenster, Heizkörper als `fixed`.
- Ansichten: Grundriss, Wandansicht je Wand, Stückliste mit Summe und Status (brauchen, bestellt, haben). Bearbeiten in Grundriss und Wandansicht.
- Prüfungen nur als Hinweis, nie blockierend: Restmaß (Vorschlag Passleiste oder Schrank), Durchgang ≥ 120 cm, Spülmaschine neben Spüle, Kochfeld ≥ 20 cm zur Wand oder zum Hochschrank mit Ablage daneben, Gerät passt nicht in Nische, Schrank vor Fenster, Spüle oder Kochfeld weit vom Anschluss. Kein Arbeitsdreieck.
- Die feste Küchenzeile aus `meta/plan.fixed` entfällt; die Küche wird frei geplant.
- Handy: nur ansehen (Stückliste, Wandansicht). Bearbeiten am Laptop.
- Umsetzung (17.10.2026): Quellen in `quellen/kueche/` (`kern.js` rechnet, `planer.js` und `planer.css` sind das Overlay, Variante 1: Grundriss links, Wandansicht rechts, Prüfung unten). Geöffnet wird der Planer im Raumblatt der Küche mit „Küche planen“. `start` und Positionen eines Laufs zählen von links, so wie man von innen auf die Wand schaut; Anschlüsse zählen wie Türen ab oben/links im Plan. Hochschränke stehen in der unteren Reihe, die obere Reihe springt über sie. Geräte sind `items` mit `typ: "geraet"` und `art`; das Element merkt sich `art`, damit die 3D-Ansicht keine Möbel laden muss. Schränke und Arbeitsplatte stehen nur in der Stückliste, nicht im Bereich Geld; Geräte zählen dort als Möbel mit. Gespeichert wird entprellt nur `meta/kueche`.

## Möbel, Utensilien, Verkauf

- Möbel-Wichtigkeit (`items.prio`): 1 essenziell, 2 später, 3 Spinnerei. `items.raum` ist der Raum für noch nicht platzierte Möbel. Pflanzen sind `items` mit `typ: "pflanze"`, `round: true`.
- Möbelkacheln (17.10.2026): Foto oben im Format 4:3, darunter Name, Maße, Preis; Fußzeile mit der Hauptentscheidung (Farbquadrat in Bauantrag-Farbe) und „shop ↗“. Weitere Labels nur als graue Zeile „auch: …“, „im plan“ als kleine Marke auf dem Foto. Farbe nur für die Entscheidung. Die Wichtigkeit steht nicht auf der Kachel, sondern als Zwischenüberschrift je Raum (essenziell, später, Spinnerei) und wird im Möbelformular geändert.
- Möbel per Shop-Link anlegen; Maße bleiben editierbar. Die Edge Function `produkt` liest Name, Maße, Preis und Foto.
- Utensilien (Bereich „utensilien“) sind eine Checkliste nach Kategorie in der Collection `utensils`, getrennt von Möbeln. Status: brauchen, bestellt, haben.
- Verkauf läuft über Kleinanzeigen. Es gibt keine Anbindung, das Dashboard verfolgt nur den Stand.
- Bereich „Verkaufen und weggeben“ (17.10.2026): Spalten für den Verkauf, dazu „Nachmieter“ (Übergabe an den Nachmieter) und „Verschenken / Sperrmüll“. Über „+ verkaufen“, „+ nachmieter“, „+ verschenken“ und „+ sperrmüll“ legt man dort direkt Stücke an.
- Mehrere Labels je Möbel (17.10.2026): `items.dec` bleibt die Hauptentscheidung (Farbe, Status, Geld), `items.auch[]` ist der Plan B. Ein Stück erscheint in jeder passenden Spalte. Kommt es anders, wird die Hauptentscheidung umgestellt.
- Sechs Entscheidungen (23.10.2026): Offen, Behalten (`mitnehmen`), Übernehmen, Kaufen, Verkaufen, Weggeben. Weggeben ist im Datensatz `nachmieter`, `verschenken` oder `entsorgen` (Feld „an wen“), damit die Spalten im Bereich Verkaufen bleiben. „Neu, fest“ ist in Kaufen aufgegangen. Aufarbeiten ist ein Häkchen bei Behalten (`auf`, Kosten im Preis, `aufOk` = bezahlt). Plan B heißt „sonst“, gibt es nur beim Verkaufen und Weggeben und hat höchstens einen Eintrag in `auch[]`. Die Herkunft entfällt; stattdessen „gehört“ (`items.von`: `m`, `h`, `b` = beiden, Standard Moritz), nur bei Behalten, Verkaufen, Weggeben und Offen. Alte Einträge stellt der Canvas beim Laden einmal um (fest → Kaufen, Aufarbeiten → Behalten mit Häkchen, Bleibt vom Vormieter → Übernehmen).
- Links sind anklickbar und öffnen in einem neuen Tab: Shop-Link (`items.link`) an Möbelkarten, Kleinanzeigen-Link (`items.anzeige`) an Verkaufskarten, Angebotslink und Links in der Notiz an Vertragskarten. (17.10.2026)
- Umzugstermin: 15.12.2026 (änderbar unter „daten“).

## Geld (17.10.2026)

- Gerechnet wird pro Person, nur auf dem Canvas (Bereich „Geld“). Namen in `meta/settings.namen` (`m`, `h`), im Repo nur „Moritz“ und „Person 2“.
- Standard-Anteil: Käufe, Aufarbeiten, Ablöse an den Vormieter, Utensilien und sonstige Kosten halbe-halbe. Verkauf und Ablöse vom Nachmieter gehören der Person, der das Stück gehört (`items.von`, Standard Moritz; „beiden“ = halbe-halbe).
- Der Anteil ist je Eintrag änderbar (`anteil` = Prozent für Moritz, nur gespeichert, wenn er vom Standard abweicht). Dazu `zahler` (`m`/`h`): wer gezahlt bzw. das Geld bekommen hat.
- Bestätigt ist: Kauf ab „Bestellt“, Aufarbeiten mit „Aufarbeiten bezahlt“, Ablösen bei „Bezahlt“, Verkauf ab „Verkauft“, Utensilien ab „bestellt“, sonstige Kosten, wenn „erledigt“.
- Aufteilung nur, wenn es wirklich gekauft ist (23.10.2026): Wer gezahlt hat und wie aufgeteilt wird, erscheint im Formular erst, wenn der Eintrag bestätigt ist; vorher steht dort nur ein Hinweis. Wird außerhalb eines Formulars bestätigt (Utensil abhaken, Gerät in der Küchen-Stückliste), fragt ein kleines Fenster beides. Aufteilung: halbe-halbe, nur Moritz, nur Person 2, anders (Prozent).
- Bereich Geld (23.10.2026): je Person nur Bestätigtes, als „gezahlt“, „bekommen“ und „Anteil“ (Kosten minus Einnahmen), darunter der Ausgleich. Geplantes wird nicht aufgeteilt und steht nur als eine Summe „noch geplant“. „ausgeglichen“ legt eine Ausgleichszahlung in der Collection `ausgleich` an; sonstige Kosten liegen in `costs`.
- Keine Anbindung an Splitwise (die API braucht ein Pro-Konto). Die Ausgaben werden nur im Dashboard dokumentiert.

## Verträge: Strom (17.10.2026)

- Nur das Thema „Strom“ hat eigene Preisfelder, alle anderen Verträge bleiben bei Preis pro Monat und Einmalig.
- Felder: Grundpreis in €/Monat brutto (`grundpreis`; eine Jahresangabe rechnet das Formular um), Arbeitspreis in ct/kWh brutto (`arbeitspreis`), Boni als eine positive Summe in € (`boni`, die Arten stehen in der Notiz), Preisgarantie in Monaten (`garantie`), Kündigungsfrist als Zahl mit Einheit (`kfrist`, `kfristE` = Wochen oder Monate). `laufzeit` heißt bei Strom „Mindestlaufzeit“. `einmal` bleibt für echte Einmalkosten; ein alter negativer Wert zählt beim Anzeigen als Bonus.
- Verbrauch: Standard 2500 kWh im Jahr, änderbar oben in der Strom-Spalte. Gespeichert wird `meta/settings.verbrauchStrom` nur, wenn er vom Standard abweicht.
- Rechnung, nie gespeichert: Monatspreis ab Jahr 2 = Grundpreis + Verbrauch × Arbeitspreis, ohne Boni. Das ist der Hauptwert und entscheidet „günstigstes“. Ø 1. Jahr = Monatspreis ab Jahr 2 + (Einmalkosten − Boni) / 12; ist dort ein anderes Angebot günstiger, bekommt es die Zusatzmarke „günstigstes 1. Jahr“. Dazu jeweils der effektive Preis in ct/kWh. Alte Angebote nur mit `preis` rechnen damit weiter; sind Grund- und Arbeitspreis da, wird `preis` geleert.
- Ansicht: am Laptop eine Vergleichstabelle in der Strom-Spalte, auf dem Handy immer Karten. Nicht im Bereich Geld, keine Erinnerung an die Kündigungsfrist im Zeitplan.
- „Preise holen“ im Formular ruft die Edge Function `produkt` mit `art: "tarif"` auf. Sie gibt nur Seitentext, Anbieter und Tarifname zurück; ausgewertet wird im Canvas, allgemein und ohne Code für einzelne Anbieter. PLZ und Verbrauch kommen aus dem Link. Gefüllt werden nur leere Felder, geprüft wird vor dem Speichern, kein automatischer Neuabruf.
- „Seitentext einfügen“ (17.10.2026): Die meisten Anbieter zeigen Preise erst nach Eingabe der PLZ, die Function sieht sie dann nicht. Deshalb kann man den Text der Tarifseite im Browser kopieren (Strg+A, Strg+C) und ins Formular einfügen; er wird im Browser ausgewertet und nicht gespeichert. Stehen mehrere Tarife darin, wählt man einen aus; ein anderer Tarif ersetzt die Werte, die von dort kamen. Findet „Preise holen“ keine Preise, sagt es das und öffnet das Textfeld.

## Zeitplan (22.10.2026)

- Der Bereich „Zeitplan“ zeigt alle Aufgaben, Termine, Vertragsdaten und Post-its mit Datum. Abgeleitete Einträge nur, wenn sie ein echtes Datum haben; nichts davon wird zusätzlich gespeichert.
- Form: Kalender, in dem man den Tag sofort erkennt, durchgehend über den ganzen Zeitraum. Zeitraum: 1 Woche vor heute bis 4 Wochen nach dem Umzug, erweitert bis zum frühesten bzw. spätesten Eintrag.
- Pro Tag höchstens 3 Chips, sonst „+N weitere“ (öffnet die Liste des Tages). Links die Spalte „ohne datum“; Ziehen auf einen Tag plant, Zurückziehen entfernt das Datum. Chips ziehen verschiebt, Ende eines Zeitraum-Balkens ziehen ändert das Ende, Doppelklick auf einen Tag legt Termin oder Aufgabe an.
- Unterschieden wird nach Art: Termine gefüllt Kobalt, Aufgaben weiß mit Kästchen zum Abhaken, Verträge mit §, Post-its in ihrer Farbe, Überfälliges rot. Heute umrandet, Umzugstag tomatenrot, Wochenende leicht getönt.
- Filter Wer (Moritz, Person 2, alle) und Art; die Auswahl merkt sich nur der Browser. Erledigtes und Vergangenes ausgeblendet, Umschalter „erledigte zeigen“; Überfälliges immer sichtbar.
- Aufgaben: optional `von` (Anfang), `due` bleibt Fälligkeit bzw. Ende. Unteraufgaben als `sub: [{t, done}]` in der Aufgabe, bearbeitet im Formular, am Chip „2/5“. Sind alle abgehakt, fragt die App, ob die Aufgabe auch erledigt ist. Termine bekommen optional `wer`; leer heißt beide.
- Kalenderdatei enthält auch Aufgaben mit Datum (ganztägig, „☐“ vor dem Titel, Zeitraum mehrtägig).
- Handy: Agenda nach Tagen mit Monatsstreifen zum Springen; Unteraufgaben aufklappbar. „Jetzt dran“ bleibt ein kurzer Auszug mit derselben Sortierung.
- Bereich wächst nach der Regel „Bereiche wachsen mit dem Inhalt“, Tagesspalten teilen sich die Breite (mindestens etwa 90 px).
- Umsetzung (22.10.2026): Variante A, durchgehender Wochenkalender (eine Zeile pro Woche, Mo bis So, Kalenderwoche links). Aufgaben mit Zeitraum laufen als Balken über die Tage. Die Filterauswahl liegt im Browser unter `zeitFilter`. Wer ist freier Text; der Filter erkennt die Namen aus `meta/settings.namen`, leer oder „beide“ zählt für beide.

## Anmeldung und Zugang

- Anmeldung nur per Mail-Link, kein Passwort. Man bleibt angemeldet, bis man sich abmeldet. (17.10.2026)
- Nur zwei freigegebene Mailadressen dürfen sich anmelden und Daten lesen (Tabelle `public.erlaubt`, Regeln in `zugang-beschraenken.sql`).

## Daten und Datenschutz

- Das Repository ist öffentlich. Nie hinein: echte Mailadressen, Wohnungsfotos, Startdaten (`startdaten.json`), Datenexporte, Schlüssel außer dem öffentlichen anon-Schlüssel in `config.js`.
- `zugang-beschraenken.sql` steht hier nur mit Platzhaltern; die ausgefüllte Fassung liegt außerhalb des Repos.
- Alle Daten liegen in Supabase in der Tabelle `docs(coll, id, data)`. Fotos sind verkleinerte data-URLs in den Datensätzen.
- Tests und Beispiele nutzen nur erfundene Daten.

## Sparsam mit Supabase (17.10.2026)

Supabase läuft im kostenlosen Plan. Jede Änderung (Mensch oder Claude) hält Speicher, Datenverkehr, Arbeitsspeicher und Rechenlast so gering wie möglich, ohne dass Bilder verpixelt wirken oder sonst Qualität verloren geht.

- Lesen: nur laden, was die Seite gerade braucht, und nur die nötigen Collections. Keine Abfragen in Schleifen, kein Polling; Änderungen kommen über den Live-Abgleich. Einmal Geladenes im Speicher weiterverwenden statt neu holen.
- Schreiben: nur den geänderten Datensatz, nie ganze Collections neu speichern. Häufige Änderungen (Ziehen, Tippen, Zoomen) bündeln und erst am Ende bzw. entprellt schreiben. Nichts doppelt oder abgeleitet speichern, was sich aus anderen Daten berechnen lässt.
- Fotos: verkleinern auf die größte tatsächliche Anzeigegröße (inkl. hochauflösender Bildschirme) und gut komprimieren, aber nie so weit, dass sichtbare Artefakte oder Unschärfe entstehen. Jedes Bild nur einmal speichern, keine zusätzlichen Kopien in anderen Datensätzen.
- Edge Function `produkt`: nur auf Nutzeraktion aufrufen, Ergebnisse im Datensatz behalten statt erneut abzufragen.
- Arbeitsspeicher im Browser: Listener, Abos und Zeitgeber beim Schließen aufräumen, große Bilder nicht mehrfach dekodieren, 3D-Geometrie und Texturen wiederverwenden und freigeben.
- Neue Funktionen vorher auf ihren Verbrauch prüfen; wenn etwas spürbar mehr Speicher oder Abfragen braucht, erst mit Moritz absprechen.

## Feedback aus der App

- Der Knopf „feedback“ ist auf Canvas und 3D. Einträge landen in `docs` mit `coll = "feedback"`.
- „Feedback abarbeiten“ heißt: offene Einträge lesen, Status auf „in arbeit“, beheben, dann „erledigt“ mit einer kurzen Antwort auf Deutsch. Die Antwort sieht man in der App unter „bisher“. Werkzeug: `quellen/feedback.py`.
