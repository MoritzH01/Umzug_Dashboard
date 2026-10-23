# CLAUDE.md

Umzugs-Dashboard von Moritz: statische Web-App (GitHub Pages) mit Supabase als Datenbank. Mit Claude Code und mit Moritz auf Deutsch arbeiten.

Die festgelegten Regeln für Inhalt, Gestaltung und Datenschutz stehen in REGELN.md und gelten immer:

@REGELN.md

## Aufbau

Die HTML-Dateien im Wurzelverzeichnis sind **gebaut**. Nie direkt bearbeiten, sonst ist die Änderung beim nächsten Bauen weg.

| Quelle (bearbeiten)                | gebaut nach   | Seite      |
|------------------------------------|---------------|------------|
| `quellen/canvas/tafel.tpl.html`    | `index.html`  | Canvas     |
| `quellen/3d/wohnung3d.tpl.html`    | `3d.html`     | 3D         |
| `quellen/feedback.js`              | `feedback.js` | beide      |

- `quellen/build_tafel.py` und `build_3d.py` hängen an die Vorlagen Kopf, Supabase-Anmeldung und Live-Abgleich an. Die Vorlage des Canvas enthält `/*DATA*/`, die 3D-Vorlage `<!--BOOT-->`.
- Die frühere Listenansicht ist aufgelöst, alles läuft über den Canvas. `quellen/bauen.py` schreibt `liste.html` nur als Weiterleitung auf den Canvas (alte Lesezeichen und Anmelde-Links).
- Direkt bearbeitet werden: `config.js` (Supabase-URL und öffentlicher anon-Schlüssel), `datenbank-einrichten.sql`, `zugang-beschraenken.sql` (nur Platzhalter), `supabase/functions/produkt/index.ts` (Edge Function für Shop-Links).
- `quellen/feedback.py` liest und beantwortet das Feedback aus der App.

## Bauen und testen

```sh
python3 quellen/bauen.py                                   # baut alle Seiten
NODE_PATH=$(npm root -g) node quellen/tests/smoke.js       # Rauchtest, braucht Playwright
```

- Der Rauchtest lädt Canvas (auch in Handybreite) und 3D mit einer nachgebauten Datenbank (`quellen/tests/fake-sb.js`) und erfundenen Daten. Er muss vor jedem Push grün sein.
- Gebaute Dateien gehören mit in den Commit. Die Prüfung in `.github/workflows/pruefen.yml` baut neu und schlägt fehl, wenn die gebauten Dateien nicht zu den Quellen passen.
- 3D-Vorschau mit eigenem Datenstand: `python3 quellen/build_3d.py vorschau seed.json ziel.html` (Seed nicht committen).

## Veröffentlichen

- Push auf `main` veröffentlicht sofort über GitHub Pages: https://moritzh01.github.io/Umzug_Dashboard/
- Mehrere Sitzungen pushen auf `main`. Vor dem Arbeiten und vor dem Push immer `git pull` und neu bauen, wenn die Quellen sich geändert haben.
- Commit-Nachrichten auf Deutsch, beginnend mit der Seite, z. B. „Canvas: …“, „3D: …“.

## Supabase

- Projekt `hexbxjcnlpwrcolefrrk`, Tabelle `docs(coll, id, data)`. Collections: `rooms`, `items`, `tasks`, `contracts`, `events`, `utensils`, `geraete` (Küchengeräte), `ideas`, `board` (Post-its), `feedback`, `meta` (`settings`, `plan`, `board`).
- Die Seiten lesen und schreiben mit dem öffentlichen anon-Schlüssel; geschützt wird über die Zugriffsregeln (RLS) und die Freigabeliste.
- Skripte mit vollem Zugriff (z. B. `feedback.py`) brauchen die Umgebungsvariable `SUPABASE_SERVICE_KEY`. Sie ist in Moritz' Cloud-Umgebung gesetzt; lokal selbst setzen. Nie committen, nie ausgeben.
- Datenbank-Änderungen (SQL, Edge Function) führt Moritz im Supabase-Dashboard aus. Claude schreibt nur die Datei und sagt, was auszuführen ist.

## Arbeitsweise

- Bei Gestaltungsfragen erst Varianten zeigen (z. B. als Vorschau-Datei oder Screenshot), dann bauen.
- Nichts erfinden, was Moritz nicht festgelegt hat (Maße, Fotos, Möbel). Bei Lücken fragen.
- Neue Entscheidungen von Moritz in REGELN.md nachtragen.
