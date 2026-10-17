# Regeln

Was für das Umzugs-Dashboard schon entschieden ist. Wer etwas ändert (Mensch oder Claude), hält sich daran. Neue Entscheidungen kommen hier dazu, mit Datum.

## Grundsätze

- Alles, was geplant wird, lebt im Dashboard und ist dort von Hand bearbeitbar. Die App funktioniert komplett ohne KI; Claude ergänzt nur, ersetzt nichts. (16.10.2026)
- Vor einem endgültigen Umbau der Gestaltung erst mehrere Varianten zeigen und wählen lassen.
- Sprache der Oberfläche ist Deutsch.

## Namen

- Die Startseite heißt **Canvas**, nie „Tafel“, in der Oberfläche wie in Nachrichten. (17.10.2026) Dateinamen wie `tafel.tpl.html` oder `build_tafel.py` bleiben aus historischen Gründen so.
- Seiten: `index.html` = Canvas, `liste.html` = Listenansicht (fürs Handy), `3d.html` = 3D-Ansicht.

## Gestaltung

- Canvas im Stil „Zeichentisch“: Schrift dunkelblau `#1c2a4b`, Akzent Kobalt `#2f4ee0`, Überschriften klein geschrieben in Inter Tight, Post-its in Courier Prime, helle schwebende Werkzeugleiste.
- Immer hell, kein Dunkelmodus.
- Möbelfarben auf dem Grundriss wie im Bauantrag: Bestand grau, neu rot, weg gelb gestrichelt.
- Bedienung Touchpad: zwei Finger schieben, Kneifen zoomt.
- Der Knopf „3d“ ist als Rahmen hervorgehoben und auf dem Handy sichtbar.
- Wohnungsstil als Richtschnur für Vorschläge: Altbau, Fischgrät-Parkett, hohe Decken, viele Pflanzen und Bücher, weiße Wände, Eiche, Edelstahl, Akzente Tomatenrot, Orange, Kobalt, Senfgelb.

## Grundriss und Räume

- Der Grundriss stammt aus dem Originalplan (16.10.2026). Räume liegen fest; auf dem Canvas werden sie nicht nebenbei verschoben, in der Liste nur nach Rückfrage geändert.
- Kompass: Plan-rechts ist Nordost (`meta/plan.north = 45`).
- Räume werden einzeln nach Plan und Fotos überarbeitet, ohne Einrichtung. Wo der Plan unklar ist, gelten die Fotos. (17.10.2026)
- Wohnzimmer: ein Fenster, keine Tür zum Schlafzimmer, kein Kaminvorsprung. Schlafzimmer: ein Fenster, Kaminvorsprung in der Ecke. Flur: Eingangstür in der Längswand, Einbauschrank in die Stirnwand eingelassen (ragt nicht in den Flur). Bad: kein Fenster. Küche: Kaminvorsprung an der Ecke Brandwand/Flur, kein Fenster, nur die Balkontür; die Küchenzeile gehört nicht in den Grundriss. Büro: ein Fenster, Tür mit Scharnier im Süden. Klo: ein schmales Fenster, Tür mit Scharnier im Süden, Vorsprung bis zur Decke in der Ecke neben dem Fenster. (17.10.2026)
- Türen haben eine Anschlagseite: ohne Angabe sitzt das Scharnier am Anfang der Öffnung (bei `off`), mit `hinge: "end"` am Ende. In der Liste schaltet der Knopf ⟳/⟲ um. (17.10.2026)

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
- Umsetzung (17.10.2026): Quellen in `quellen/kueche/` (`kern.js` rechnet, `planer.js` und `planer.css` sind das Overlay, Variante 1: Grundriss links, Wandansicht rechts, Prüfung unten). Geöffnet wird der Planer im Raumblatt der Küche mit „Küche planen“. `start` und Positionen eines Laufs zählen von links, so wie man von innen auf die Wand schaut; Anschlüsse zählen wie Türen ab oben/links im Plan. Hochschränke stehen in der unteren Reihe, die obere Reihe springt über sie. Geräte sind `items` mit `typ: "geraet"` und `art`, das Element merkt sich `art` für die 3D-Ansicht. Schränke und Arbeitsplatte stehen nur in der Stückliste, nicht im Bereich Geld; Geräte zählen dort als Möbel mit.

## Möbel, Utensilien, Verkauf

- Möbel-Wichtigkeit (`items.prio`): 1 essenziell, 2 später, 3 Spinnerei. `items.raum` ist der Raum für noch nicht platzierte Möbel. Pflanzen sind `items` mit `typ: "pflanze"`, `round: true`.
- Möbel per Shop-Link anlegen; Maße bleiben editierbar. Die Edge Function `produkt` liest Name, Maße, Preis und Foto.
- Utensilien (Bereich „utensilien“) sind eine Checkliste nach Kategorie in der Collection `utensils`, getrennt von Möbeln. Status: brauchen, bestellt, haben.
- Verkauf läuft über Kleinanzeigen. Es gibt keine Anbindung, das Dashboard verfolgt nur den Stand.
- Umzugstermin: 15.12.2026.

## Geld (17.10.2026)

- Gerechnet wird pro Person, nur auf dem Canvas (Bereich „Geld“). Namen in `meta/settings.namen` (`m`, `h`), im Repo nur „Moritz“ und „Person 2“.
- Standard-Anteil: Käufe (kaufen, fest, aufarbeiten), Ablöse an den Vormieter, Utensilien und sonstige Kosten halbe-halbe. Verkauf und Ablöse vom Nachmieter gehören ganz der Person, aus deren Wohnung das Stück kommt (`items.von`, Standard Moritz).
- Der Anteil ist je Eintrag änderbar (`anteil` = Prozent für Moritz, nur gespeichert, wenn er vom Standard abweicht). Dazu `zahler` (`m`/`h`): wer gezahlt bzw. das Geld bekommen hat.
- Der Ausgleich („wer schuldet wem“) zählt nur Bestätigtes: Kauf und fest ab „Bestellt“, aufarbeiten ab „In Arbeit“, Ablösen bei „Bezahlt“, Verkauf ab „Verkauft“, Utensilien ab „bestellt“, sonstige Kosten, wenn „erledigt“. Geplante Beträge stehen nur in den Summen je Person.
- Beim Bestätigen fragt die App, wer gezahlt hat. „ausgeglichen“ legt eine Ausgleichszahlung in der Collection `ausgleich` an; sonstige Kosten liegen in `costs`.
- Keine Anbindung an Splitwise (die API braucht ein Pro-Konto). Die Ausgaben werden nur im Dashboard dokumentiert.

## Anmeldung und Zugang

- Anmeldung nur per Mail-Link, kein Passwort. Man bleibt angemeldet, bis man sich abmeldet. (17.10.2026)
- Nur zwei freigegebene Mailadressen dürfen sich anmelden und Daten lesen (Tabelle `public.erlaubt`, Regeln in `zugang-beschraenken.sql`).

## Daten und Datenschutz

- Das Repository ist öffentlich. Nie hinein: echte Mailadressen, Wohnungsfotos, Startdaten (`startdaten.json`), Datenexporte, Schlüssel außer dem öffentlichen anon-Schlüssel in `config.js`.
- `zugang-beschraenken.sql` steht hier nur mit Platzhaltern; die ausgefüllte Fassung liegt außerhalb des Repos.
- Alle Daten liegen in Supabase in der Tabelle `docs(coll, id, data)`. Fotos sind verkleinerte data-URLs in den Datensätzen.
- Tests und Beispiele nutzen nur erfundene Daten.

## Feedback aus der App

- Der Knopf „feedback“ ist auf Canvas, Liste und 3D. Einträge landen in `docs` mit `coll = "feedback"`.
- „Feedback abarbeiten“ heißt: offene Einträge lesen, Status auf „in arbeit“, beheben, dann „erledigt“ mit einer kurzen Antwort auf Deutsch. Die Antwort sieht man in der App unter „bisher“. Werkzeug: `quellen/feedback.py`.
