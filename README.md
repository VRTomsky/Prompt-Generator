# Prompt-Generator

Aus einer Idee wird ein ausführlicher **Master-Prompt** für ChatGPT, Claude, Gemini und Co.
Idee eintippen oder einfach reinsprechen – eine echte KI liest sie, versteht den Kern und baut daraus
einen detaillierten Prompt.

## So versteht die Seite deine Idee

Die KI bekommt deine Idee und liefert zuerst eine Analyse: Was ist der **Kern** und was nur das **Mittel**
(bei „eine Webseite, auf der ich meine Sprintzeiten tracke, um in die erste Mannschaft zu kommen“ ist Fußballtraining
der Kern und die Webseite nur das Werkzeug). Daraus entstehen eine passende Rolle, eine ausführliche
Projektbeschreibung, konkrete Anforderungen, Rahmenbedingungen, Lösungsweg, Qualitätskriterien, typische Fehler
und Rückfragen. Die Seite setzt das zu einem sauber gegliederten Master-Prompt zusammen und hängt deine
Einstellungen (Level, Vorgehen, Antwortsprache …) an.

Welche KI das macht, wählst du beim ersten Erstellen (später unter „Feinschliff“). Alle Wege sind kostenlos:

| Weg | Qualität | Voraussetzung |
| --- | --- | --- |
| **Cloud-KI** über [Puter.js](https://developer.puter.com) (Gemini, Claude, GPT) | am besten | kostenloses Puter-Konto mit monatlichem Freikontingent; die Idee geht an den KI-Anbieter |
| **KI im Browser** (Qwen 3.5 über [WebLLM](https://github.com/mlc-ai/web-llm)) | gut, aber ungenauer | WebGPU-fähige Grafikkarte, einmalig ca. 6 GB (9B) bzw. 3 GB (4B) Download; nichts verlässt den PC |
| **Ollama** | je nach Modell | lokal laufendes Ollama; von GitHub Pages aus nur mit `OLLAMA_ORIGINS`, über `start.bat` direkt |
| **Ohne KI** | Vorlage | nichts – füllt aber nur eine Bereichsvorlage und versteht die Idee nicht |

## Funktionen

- **Spracheingabe** in jedem modernen Browser: lokal mit Whisper oder über den Erkennungsdienst von
  Chrome/Edge (siehe unten). Füllwörter wie „äh“ und „ähm“ werden entfernt.
- **Feinschliff**: welche KI schreibt, Erfahrungslevel, Detailgrad, Chat-KI oder Coding-Agent, Markdown oder XML-Tags,
  Antwortsprache, Rückfragen, Plan, Selbstcheck sowie Felder für Technik, Zielgruppe, Stil, Pflicht- und Ausschlusspunkte.
- Live-Ansicht, während die KI arbeitet (Kern, Rolle, Anzahl Anforderungen), Abbrechen jederzeit.
- Kopieren mit einem Klick, Speichern als `.txt`, Verlauf der letzten 25 Prompts (nur im eigenen Browser).

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
| `js/domains.js` | Vorlagen für „Ohne KI“: Rollen, Themen, Standards und Erkennungswörter je Bereich, dazu Querschnittsthemen (Download, MP3, „nur lokal“, Login, KI …) |
| `js/ai.js` | KI-Analyse der Idee (Cloud, Browser, Ollama) und Zusammenbau des Master-Prompts |
| `js/llm-worker.js` | Hintergrund-Worker für die KI im Browser |
| `js/engine.js` | Vorlagen-Modus „Ohne KI“ (erst *was* gebaut wird, dann das Thema) |
| `js/speech.js` | Spracheingabe über den Browser-Dienst |
| `js/speech-local.js`, `js/whisper-worker.js` | Lokale Spracheingabe mit Whisper (Pausenerkennung, Modell im Hintergrund) |
| `js/app.js` | Bedienung, Einstellungen, Verlauf |
| `server.js`, `start.bat` | Mini-Webserver für die lokale Nutzung mit Mikrofon |

**Anweisung an die KI anpassen:** `systemPrompt()` in `js/ai.js`. **Aufbau des fertigen Prompts:** `assemble()` in `js/ai.js`.
