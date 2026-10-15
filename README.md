# Prompt-Generator

Aus einer Idee wird ein ausführlicher **Master-Prompt** für ChatGPT, Claude, Gemini und Co.
Idee eintippen oder einfach reinsprechen – die Seite baut daraus einen strukturierten Prompt mit
Expertenrolle, Auftrag, Themenliste, Qualitätsstandards, Vorgehen, Ausgabeformat und Regeln.

Beispiel: *„Ich will ein Open-World-Spiel wie GTA 6 bauen …“* wird zu einem Prompt, der mit
*„Du bist Senior Game Developer und Lead Game Designer mit über 12 Jahren Erfahrung …“* beginnt.

## Funktionen

- **13 Fachbereiche** mit eigener Expertenrolle: Spiel, Webseite, App, Software & Tools, 3D & Blender,
  Bild & Design, Video & Content, Musik & Audio, Text & Story, Business & Marketing, Lernen & Schule,
  Sport & Fitness, Daten & Analyse – plus „Sonstiges“ für alles andere.
- **Automatische Erkennung** von Bereich, Technik (z. B. Unity, React, Blender), Plattform,
  Vorbildern (z. B. GTA, Minecraft), Zielgruppe und Projektgröße.
- **Spracheingabe** mit Live-Mitschrift, automatischem Neustart nach Sprechpausen und optionalen
  gesprochenen Satzzeichen („Komma“, „Punkt“, „neue Zeile“). Füllwörter wie „äh“ und „ähm“ werden entfernt.
- **Feinschliff**: Erfahrungslevel, Detailgrad, Chat-KI oder Coding-Agent, Markdown oder XML-Tags,
  Antwortsprache, Rückfragen, Plan, Selbstcheck sowie Felder für Technik, Zielgruppe, Stil, Pflicht- und Ausschlusspunkte.
- Kopieren mit einem Klick, Speichern als `.txt`, Verlauf der letzten 25 Prompts (nur im eigenen Browser).
- Läuft komplett im Browser – kein Server, kein Konto, kein API-Schlüssel.

## Starten

**Online:** über GitHub Pages (Repository → Settings → Pages → Branch `main`, Ordner `/ (root)`).

**Lokal:** `start.bat` doppelklicken (braucht [Node.js](https://nodejs.org)). Die Seite öffnet sich unter
http://localhost:5190. Direkt als Datei (`index.html` per Doppelklick) funktioniert alles außer dem Mikrofon,
weil Browser den Mikrofonzugriff für lokale Dateien sperren.

## Spracheingabe

- Funktioniert in **Chrome** und **Edge** (Desktop und Android). Firefox unterstützt die Web Speech API nicht –
  dort hilft unter Windows die eingebaute Diktierfunktion mit **Windows-Taste + H**.
- Braucht eine Internetverbindung: Chrome schickt die Aufnahme zur Erkennung an Google, Edge an Microsoft.
- Beim ersten Klick fragt der Browser nach dem Mikrofon – einmal erlauben, fertig.

## Aufbau

| Datei | Inhalt |
| --- | --- |
| `index.html` | Seitenstruktur |
| `css/style.css` | Design („Bauplan“-Look, Hell- und Dunkelmodus) |
| `js/domains.js` | Wissensbasis: Rollen, Themen, Standards und Erkennungswörter je Bereich |
| `js/engine.js` | Analyse der Idee und Zusammenbau des Master-Prompts |
| `js/speech.js` | Spracheingabe |
| `js/app.js` | Bedienung, Einstellungen, Verlauf |
| `server.js`, `start.bat` | Mini-Webserver für die lokale Nutzung mit Mikrofon |

**Neuen Bereich hinzufügen:** in `js/domains.js` ein weiteres Objekt nach dem Muster der vorhandenen anlegen –
die Oberfläche zeigt es automatisch als Auswahl an.
