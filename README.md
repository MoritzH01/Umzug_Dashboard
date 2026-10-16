# Umzug-Dashboard

Eigenständige Version des Umzugs-Dashboards. Läuft als statische Seite (GitHub Pages) mit einer Supabase-Datenbank und Anmeldung per Mail-Link.

## Einrichten

1. **Supabase:** Auf supabase.com ein Projekt anlegen. Im SQL Editor den Inhalt von `datenbank-einrichten.sql` ausführen.
2. **Zugang eintragen:** Unter Project Settings → API die „Project URL“ und den „anon public“ Schlüssel in `config.js` eintragen.
3. **Anmelde-Link:** Unter Authentication → URL Configuration die Adresse der Seite als „Site URL“ eintragen, also `https://moritzh01.github.io/Umzug_Dashboard/`.
4. **GitHub Pages:** Im Repository unter Settings → Pages „Deploy from a branch“, Branch `main`, Ordner `/ (root)` wählen.
5. **Erste Anmeldung:** Seite öffnen, Mail eingeben, Link im Postfach antippen. Dann unter Daten → Sicherung die Datei `startdaten.json` importieren. Sie liegt bewusst nicht im Repository, weil sie Wohnungsfotos enthält.
6. **Absichern:** Wenn alle, die mitplanen sollen, sich einmal angemeldet haben, unter Authentication → Sign In / Providers „Allow new users to sign up“ ausschalten. Danach kommt niemand Neues mehr rein.

## Dateien

- `index.html`: das Dashboard
- `config.js`: Zugang zur Datenbank
- `datenbank-einrichten.sql`: Tabelle, Zugriffsregeln und Live-Abgleich
