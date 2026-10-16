# Umzug-Dashboard

Eigenständige Version des Umzugs-Dashboards. Läuft als statische Seite (GitHub Pages) mit einer Supabase-Datenbank. Startseite ist die Tafel (Grundriss, Möbel, Zeitleiste, Post-its), `liste.html` ist die Listenansicht fürs Handy.

## Einrichten

1. **Supabase:** Im SQL Editor den Inhalt von `datenbank-einrichten.sql` ausführen.
2. **Zugang eintragen:** Unter Project Settings → API die „Project URL“ und den „anon public“ Schlüssel in `config.js` eintragen.
3. **Anmelde-Link:** Unter Authentication → URL Configuration die Adresse der Seite als „Site URL“ eintragen.
4. **GitHub Pages:** Settings → Pages „Deploy from a branch“, Branch `main`, Ordner `/ (root)`.
5. **Zugang beschränken:** In `zugang-beschraenken.sql` die erlaubten Mailadressen eintragen und im SQL Editor ausführen. Danach kann niemand sonst ein Konto anlegen oder Daten lesen. Die letzte Abfrage muss leer sein.
6. **Shop-Links (Maße und Foto):** Edge Functions → „Deploy a new function“ → „Via Editor“, Name `produkt`, Inhalt von `supabase/functions/produkt/index.ts` einfügen, „Deploy“. „Verify JWT“ bleibt an. Ohne diese Funktion rät die Tafel Name und Maße nur aus dem Link.
7. **Erste Daten:** In der Liste unter Daten → Sicherung `startdaten.json` importieren. Die Datei liegt bewusst nicht im Repository.

Die Anmeldung bleibt im Browser gespeichert, bis man sich abmeldet.

## Dateien

- `index.html`: die Tafel
- `liste.html`: die Listenansicht
- `config.js`: Zugang zur Datenbank (der anon-Schlüssel ist öffentlich gedacht, die Daten schützen die Regeln in der Datenbank)
- `datenbank-einrichten.sql`, `zugang-beschraenken.sql`: Tabelle, Zugriffsregeln, Live-Abgleich
- `supabase/functions/produkt/index.ts`: liest Maße, Preis und Foto aus Shop-Links
