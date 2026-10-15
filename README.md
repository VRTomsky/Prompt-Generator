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
- **Spracheingabe** in jedem modernen Browser: lokal mit Whisper oder über den Erkennungsdienst von
  Chrome/Edge (siehe unten). Füllwörter wie „äh“ und „ähm“ werden entfernt.
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

Zwei Erkennungswege, die Seite wählt automatisch (änderbar über das Regler-Symbol neben „Reinsprechen“):

- **Lokal mit Whisper** – läuft direkt im Browser über WebGPU (sonst CPU), funktioniert in jedem modernen Browser,
  auch in Opera, Brave und Firefox. Die Aufnahme verlässt das Gerät nicht. Das Sprachmodell wird beim ersten Mal
  geladen (Schnell: ca. 80–200 MB, Genau: ca. 250–400 MB) und danach aus dem Browser-Cache genommen.
  Text erscheint jeweils nach einer kurzen Sprechpause, mit Satzzeichen.
- **Browser-Dienst** – Live-Mitschrift über die Web Speech API. Klappt nur in echtem **Chrome** und **Edge**,
  braucht Internet (Chrome schickt die Aufnahme an Google, Edge an Microsoft).

Andere Chromium-Browser (Opera, Brave, Vivaldi …) haben die Web Speech API zwar eingebaut, aber keinen
Erkennungsdienst dahinter – dort kommt sonst nur der Fehler „network“. Meldet der Browser-Dienst diesen Fehler,
schaltet die Seite automatisch auf Whisper um. Beim ersten Klick fragt der Browser nach dem Mikrofon – einmal erlauben.

## Aufbau

| Datei | Inhalt |
| --- | --- |
| `index.html` | Seitenstruktur |
| `css/style.css` | Design („Bauplan“-Look, Hell- und Dunkelmodus) |
| `js/domains.js` | Wissensbasis: Rollen, Themen, Standards und Erkennungswörter je Bereich, dazu Querschnittsthemen (Download, MP3, „nur lokal“, Login, KI …) |
| `js/engine.js` | Analyse der Idee (erst *was* gebaut wird, dann das Thema) und Zusammenbau des Master-Prompts |
| `js/speech.js` | Spracheingabe über den Browser-Dienst |
| `js/speech-local.js`, `js/whisper-worker.js` | Lokale Spracheingabe mit Whisper (Pausenerkennung, Modell im Hintergrund) |
| `js/app.js` | Bedienung, Einstellungen, Verlauf |
| `server.js`, `start.bat` | Mini-Webserver für die lokale Nutzung mit Mikrofon |

**Neuen Bereich hinzufügen:** in `js/domains.js` ein weiteres Objekt nach dem Muster der vorhandenen anlegen –
die Oberfläche zeigt es automatisch als Auswahl an.
