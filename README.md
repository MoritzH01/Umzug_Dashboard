# Umzug-Dashboard

Eigenständige Version des Umzugs-Dashboards. Läuft als statische Seite (GitHub Pages) mit einer Supabase-Datenbank. Alles läuft über den Canvas (Grundriss, Möbel, Zeitplan, Post-its, Geld, Verträge). Auf dem Handy öffnet „bereiche“ einen Bereich als Vollbild.

## Einrichten

1. **Supabase:** Im SQL Editor den Inhalt von `datenbank-einrichten.sql` ausführen.
2. **Zugang eintragen:** Unter Project Settings → API die „Project URL“ und den „anon public“ Schlüssel in `config.js` eintragen.
3. **Anmelde-Link:** Unter Authentication → URL Configuration die Adresse der Seite als „Site URL“ eintragen.
4. **GitHub Pages:** Settings → Pages „Deploy from a branch“, Branch `main`, Ordner `/ (root)`.
5. **Zugang beschränken:** In `zugang-beschraenken.sql` die erlaubten Mailadressen eintragen und im SQL Editor ausführen. Danach kann niemand sonst ein Konto anlegen oder Daten lesen. Die letzte Abfrage muss leer sein.
6. **Shop-Links (Maße und Foto):** Edge Functions → „Deploy a new function“ → „Via Editor“, Name `produkt`, Inhalt von `supabase/functions/produkt/index.ts` einfügen, „Deploy“. „Verify JWT“ bleibt an. Ohne diese Funktion rät der Canvas Name und Maße nur aus dem Link.
7. **Erste Daten:** Auf dem Canvas oben unter „daten“ → Importieren `startdaten.json` wählen. Die Datei liegt bewusst nicht im Repository.

Die Anmeldung bleibt im Browser gespeichert, bis man sich abmeldet.

## Mitarbeiten

`index.html`, `3d.html`, `feedback.js` und die Weiterleitung `liste.html` sind gebaut. Geändert wird in `quellen/`, danach `python3 quellen/bauen.py`. Aufbau, Tests und Ablauf stehen in [CLAUDE.md](CLAUDE.md), die festgelegten Regeln in [REGELN.md](REGELN.md).

## Dateien

- `index.html`: der Canvas, `3d.html`: die 3D-Ansicht
- `liste.html`: leitet auf den Canvas weiter (die Listenansicht ist aufgelöst)
- `config.js`: Zugang zur Datenbank (der anon-Schlüssel ist öffentlich gedacht, die Daten schützen die Regeln in der Datenbank)
- `datenbank-einrichten.sql`, `zugang-beschraenken.sql`: Tabelle, Zugriffsregeln, Live-Abgleich
- `feedback.js`: Knopf „feedback“ auf allen Seiten. Fehler, Wünsche und Bedienungsprobleme mit Bild und Seiteninfo landen in der Tabelle `docs` (`coll = feedback`), Claude liest und beantwortet sie mit `quellen/feedback.py`
- `supabase/functions/produkt/index.ts`: liest Maße, Preis und Foto aus Shop-Links
- `quellen/`: Quellen und Build-Skripte, `quellen/tests/`: Rauchtest
