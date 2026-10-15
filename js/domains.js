/*
 * Wissensbasis des Prompt-Generators.
 *
 * Jeder Bereich beschreibt, wie ein Master-Prompt für dieses Fachgebiet aussehen soll:
 * Expertenrolle, Auftrag, Themen, Qualitätsstandards, Ergebnisse, Rückfragen und typische Fehler.
 * Neue Bereiche einfach als weiteres Objekt anhängen – die Oberfläche übernimmt sie automatisch.
 *
 * keywords: [Muster, Gewicht]. Muster sind reguläre Ausdrücke (ohne Slashes), die am
 * Wortanfang greifen. Ein vorangestelltes * erlaubt Treffer mitten im Wort (z. B. "Rennspiel").
 * clarify: Rückfragen; "skip" blendet eine Frage aus, wenn die Info schon erkannt wurde
 * ("tech", "platform", "audience", "refs").
 */
window.PG = window.PG || {};

PG.domains = [
  {
    id: 'game',
    label: 'Spiel',
    field: 'Spieleentwicklung',
    shortRole: 'Game Developer',
    code: true, build: true, creative: true, platforms: true,
    keywords: [
      ['*(?<!bei|zu|ab|platten|schau|vor)spiel(?!platz|zeug)', 2], ['games?(?![a-zäöüß])|gamedesign', 3], ['gaming|gamer', 1], ['zock', 2],
      ['gamedev|game ?design|spieleentwicklung|spielentwicklung', 4],
      ['gegner', 2], ['boss(?:kampf|fight|e)?', 1], ['level', 1],
      ['multiplayer|singleplayer|koop|co-?op|pvp|pve', 3], ['npcs?', 3], ['quests?', 2], ['missionen', 2],
      ['open[- ]?world', 3],
      ['rpg|mmo|rogue-?like|roguelite|metroidvania|platformer|plattformer|jump ?(?:and|n|\'n\'|&) ?run|shooter|ego-?shooter|battle ?royale|tower ?defense|survival|sandbox', 3],
      ['rennspiel|racing', 3], ['unity|unreal|godot|roblox|game ?maker', 4],
      ['gta|grand theft auto|minecraft|fortnite|zelda|pok[eé]mon|elden ring|call of duty|fifa|ea fc', 2],
      ['steam', 2], ['playstation|ps5|xbox|nintendo|konsole', 2], ['controller', 1],
      ['hitbox|spawn|loot|crafting|skill ?tree|level-?up|respawn', 2], ['spielfigur|charakter|held', 1]
    ],
    role: 'Senior Game Developer und Lead Game Designer mit über 12 Jahren Erfahrung in Indie- und AAA-Studios',
    expertise: 'Du hast mehrere Spiele vom ersten Prototyp bis zum Release gebracht, beherrschst Unity (C#), Unreal Engine (C++ und Blueprints) und Godot (GDScript) und weißt genau, wie man eine große Vision auf einen machbaren Umfang herunterbricht, ohne dass der Spielspaß verloren geht.',
    mission: 'meine Spielidee in ein durchdachtes, umsetzbares Spielkonzept zu verwandeln und mich danach Schritt für Schritt bis zu einem spielbaren Prototyp zu begleiten',
    aspects: [
      ['Kernidee & Spielgefühl', 'Fasse das Spiel in einem Satz zusammen (Elevator Pitch) und beschreibe, welches Gefühl der Spieler haben soll.'],
      ['Core-Loop', 'Was tut der Spieler in den ersten 30 Sekunden, den ersten 10 Minuten und der ersten Stunde? Was motiviert ihn, weiterzuspielen?'],
      ['Steuerung & Kamera', 'Belegung für Tastatur/Maus und Controller, Kameraperspektive und Bewegungsgefühl (Beschleunigung, Sprung, Fahrzeuge).'],
      ['Spielwelt & Level-Design', 'Aufbau der Welt, Orientierung, interessante Orte und wie die Welt den Spieler lenkt.'],
      ['Missionen & Progression', 'Missionsstruktur, Belohnungen, Fortschrittssystem und Schwierigkeitskurve.'],
      ['Gegner & KI', 'Verhalten von NPCs und Gegnern (State Machines oder Behaviour Trees), Fairness und Lesbarkeit.'],
      ['UI & HUD', 'Menüs, HUD-Elemente, Minimap und Feedback bei Treffern und Erfolgen.'],
      ['Grafikstil, Sound & Juice', 'Visueller Stil, Soundeffekte, Musik, Screenshake und Partikel – alles, was sich gut anfühlt.'],
      ['Technische Architektur', 'Projektstruktur, wichtigste Systeme und Klassen, Speichersystem und Szenenaufbau.'],
      ['Performance & Plattform', 'Zielplattform, Ziel-FPS und Optimierung (LOD, Culling, Object Pooling).'],
      ['Umfang & Meilensteine', 'Erst ein kleiner spielbarer Kern (Vertical Slice), danach Ausbaustufen mit realistischer Zeitschätzung.']
    ],
    standards: [
      'Jedes System funktioniert zuerst in einer minimalen Version und wird dann schrittweise erweitert.',
      'Code ist sauber strukturiert, kommentiert und folgt den Konventionen der gewählten Engine.',
      'Gameplay-Werte (Geschwindigkeit, Schaden, Spawnraten) stehen in einstellbaren Variablen statt fest im Code.',
      'Jede Mechanik gibt dem Spieler klares Feedback (Sound, Animation, UI).',
      'Nach jedem Meilenstein existiert etwas Spielbares.',
      'Assets sind kostenlos oder selbst erstellt, mit konkreten Quellen (z. B. Kenney, Quixel, Mixamo, Freesound).',
      'Performance wird von Anfang an mitgedacht, ohne vorzeitig zu optimieren.'
    ],
    deliverables: [
      'Ein kompaktes Game Design Document (GDD) mit den wichtigsten Entscheidungen',
      'Eine Liste der Kernsysteme mit Priorität (Muss / Soll / Kann)',
      'Einen Meilensteinplan vom Prototyp bis zur ersten spielbaren Version',
      'Vollständigen, lauffähigen Code für den ersten Meilenstein mit Angabe, wo jede Datei hingehört',
      'Eine Testanleitung: Was muss ich nach dem ersten Meilenstein im Spiel sehen und ausprobieren können?'
    ],
    clarify: [
      { q: 'Welche Engine soll es sein?', skip: 'tech' },
      { q: 'Für welche Plattform (PC, Konsole, Handy, Browser)?', skip: 'platform' },
      { q: '2D oder 3D, und aus welcher Perspektive?' },
      { q: 'Singleplayer oder Multiplayer?' },
      { q: 'Welcher Grafikstil (realistisch, Low Poly, Pixel Art, Cartoon)?' },
      { q: 'Wie viel Zeit pro Woche steckst du in das Projekt?' }
    ],
    pitfalls: [
      'Mit dem riesigen Endprodukt anfangen statt mit einem kleinen spielbaren Kern.',
      'Multiplayer, Story und Open World gleichzeitig angehen.',
      'Gameplay-Werte fest im Code verstecken, sodass Balancing mühsam wird.',
      'Grafik polieren, bevor das Spiel überhaupt Spaß macht.'
    ],
    stackHint: 'Wenn ich keine Engine nenne, empfiehl die passendste (Unity, Unreal Engine oder Godot) für meine Idee und mein Level und begründe die Wahl in zwei Sätzen.'
  },

  {
    id: 'website',
    label: 'Webseite',
    field: 'Webentwicklung',
    shortRole: 'Webentwickler und UI/UX Designer',
    code: true, build: true, creative: true, platforms: true,
    keywords: [
      ['webseite|website|homepage|internetseite|webpage', 4], ['landing ?page', 4], ['online-?shop|webshop', 4],
      ['portfolio', 3], ['blog(?!artikel)', 2], ['html|css|frontend|front-end', 3],
      ['wordpress|wix|shopify|squarespace|webflow', 4], ['domain|hosting|github pages|netlify|vercel', 2],
      ['responsive', 2], ['startseite|unterseite|navigation|navbar|footer', 2], ['*seite', 1],
      ['web-?app|webanwendung', 3], ['react|next\\.?js|vue|svelte|tailwind', 2], ['seo', 1], ['kontaktformular', 2]
    ],
    role: 'Senior Full-Stack Web Developer und UI/UX Designer mit über 12 Jahren Erfahrung',
    expertise: 'Du hast Hunderte Webseiten vom Konzept bis zum Launch gebracht – von Landingpages über Online-Shops bis zu komplexen Web-Apps – und verbindest eigenständiges, modernes Design mit sauberem, schnellem und barrierearmem Code.',
    mission: 'meine Idee in eine moderne, schnelle und durchdachte Webseite zu verwandeln – von der Struktur über das Design bis zum fertigen Code',
    aspects: [
      ['Ziel & Zielgruppe', 'Was soll ein Besucher auf der Seite tun (kaufen, Kontakt aufnehmen, staunen, lernen)? Wer ist er, und was erwartet er?'],
      ['Technik & Aufbau', 'Passender Tech-Stack, Ordnerstruktur, Komponenten und bei Bedarf Formulare, Datenbank oder CMS.'],
      ['Seitenstruktur & Navigation', 'Sitemap mit allen Seiten und Abschnitten, klare Navigation und der wichtigste Call-to-Action.'],
      ['Design-System', 'Farbpalette mit Hex-Werten, Schriftpaarung, Abstände und Komponenten-Stil – eigenständig statt Standard-Template.'],
      ['Inhalte & Texte', 'Überschriften, Texte und Bildideen für jeden Abschnitt – echte Inhalte statt Lorem ipsum.'],
      ['Responsives Layout', 'Wie die Seite auf Handy, Tablet und Desktop aussieht und funktioniert.'],
      ['Interaktion & Animation', 'Hover-Effekte, Übergänge und Scroll-Animationen – gezielt eingesetzt, nicht überladen.'],
      ['Performance & SEO', 'Ladezeit, Bildoptimierung, Meta-Tags und eine saubere Überschriften-Hierarchie.'],
      ['Barrierefreiheit', 'Kontraste, Tastaturbedienung, Alt-Texte und semantisches HTML.'],
      ['Veröffentlichung', 'Hosting, Domain und Deployment Schritt für Schritt (z. B. GitHub Pages, Netlify oder Vercel).']
    ],
    standards: [
      'Mobile first: Jede Ansicht funktioniert ab 360 px Breite ohne horizontales Scrollen.',
      'Semantisches HTML, sauberes CSS mit Variablen und eine klare, nachvollziehbare Dateistruktur.',
      'Kontraste nach WCAG AA, sichtbarer Tastaturfokus und Alt-Texte für alle Bilder.',
      'Lighthouse-Werte von 90+ für Performance, Barrierefreiheit und SEO als Ziel.',
      'Ein eigenständiges Design mit klarer Linie – kein generischer Baukasten-Look.',
      'Keine Platzhaltertexte: Alle Texte sind fertig formuliert und passen zur Zielgruppe.',
      'Formulare prüfen Eingaben und zeigen verständliche Fehlermeldungen.',
      'Sicherheit von Anfang an: keine geheimen Schlüssel im Frontend, Eingaben werden validiert.'
    ],
    deliverables: [
      'Eine kurze Konzeptübersicht: Ziel, Zielgruppe, Sitemap und Design-Richtung',
      'Das Design-System mit Farben (Hex), Schriften und den wichtigsten Komponenten',
      'Den vollständigen Code aller Dateien mit Dateipfad, direkt lauffähig',
      'Eine Anleitung zum lokalen Starten und zum Veröffentlichen',
      'Eine Liste sinnvoller nächster Verbesserungen'
    ],
    clarify: [
      { q: 'Was ist das wichtigste Ziel der Seite?' },
      { q: 'Gibt es Vorlieben bei Farben, Stil oder Vorbild-Seiten?', skip: 'refs' },
      { q: 'Welche Seiten und Funktionen braucht es (Kontaktformular, Shop, Login, Blog)?' },
      { q: 'Welche Technik soll verwendet werden?', skip: 'tech' },
      { q: 'Gibt es schon Texte, Bilder oder ein Logo?' }
    ],
    pitfalls: [
      'Ein generisches Template-Design, das aussieht wie jede andere Seite.',
      'Lorem ipsum und Platzhalterbilder statt echter Inhalte.',
      'Das Handy-Layout erst am Ende bedenken.',
      'Zu viele Animationen, die vom Inhalt ablenken und die Seite langsam machen.'
    ],
    stackHint: 'Wenn ich keine Technik vorgebe, wähle den einfachsten passenden Stack (z. B. reines HTML, CSS und JavaScript für einfache Seiten, React oder Next.js für komplexe Web-Apps) und begründe die Wahl kurz.',
    // Webseite als Werkzeug ("eine Website, mit der ich … kann") statt als Info- oder Werbeseite
    variants: {
      tool: {
        mission: 'meine Idee als gut bedienbare, zuverlässige Web-Anwendung umzusetzen – von der Kernfunktion über die Oberfläche bis zum fertigen Code',
        aspects: [
          ['Kernfunktion & Ablauf', 'Was passiert vom Öffnen bis zum fertigen Ergebnis? Jeder Schritt aus Sicht des Nutzers, inklusive Sonderfälle.'],
          ['Technik & Aufbau', 'Frontend und – falls nötig – Backend, Tech-Stack, Ordnerstruktur und Datenfluss zwischen den Teilen.'],
          ['Bedienoberfläche', 'Eingaben, Buttons, Statusanzeigen und Ergebnisliste – übersichtlich und ohne Ballast.'],
          ['Fehler & Sonderfälle', 'Was passiert bei ungültigen Eingaben, fehlender Verbindung oder abgebrochenen Vorgängen?'],
          ['Design', 'Farbpalette mit Hex-Werten, Schriften und Komponenten-Stil – eigenständig und klar.'],
          ['Responsives Layout', 'Funktioniert auch im schmalen Fenster und auf dem Handy.'],
          ['Performance', 'Schnelle Reaktion, kein Einfrieren bei langen Vorgängen, sinnvolle Grenzen.'],
          ['Barrierefreiheit', 'Kontraste, Tastaturbedienung und verständliche Beschriftungen.'],
          ['Veröffentlichung', 'Hosting und Deployment Schritt für Schritt (z. B. GitHub Pages, Netlify, Vercel oder ein eigener Server).']
        ],
        standards: [
          'Die Kernfunktion läuft zuverlässig, bevor Extras dazukommen.',
          'Klare Trennung von Oberfläche und Logik, nachvollziehbare Dateistruktur.',
          'Jeder längere Vorgang zeigt seinen Fortschritt und lässt sich abbrechen.',
          'Verständliche Fehlermeldungen statt Abstürzen oder leerer Seiten.',
          'Kontraste nach WCAG AA und sichtbarer Tastaturfokus.',
          'Sicherheit: Eingaben werden geprüft, keine geheimen Schlüssel im Frontend.'
        ],
        deliverables: [
          'Eine kurze Projektübersicht: Kernfunktion, Ablauf, Architektur und Dateistruktur',
          'Den vollständigen Code aller Dateien mit Dateipfad, direkt lauffähig',
          'Eine Anleitung zum Installieren und Starten mit exakten Befehlen',
          'Testfälle: was ich eingeben kann und was dabei herauskommen muss',
          'Eine Liste sinnvoller nächster Verbesserungen'
        ],
        clarify: [
          { q: 'Welche Funktion ist dir am wichtigsten, und was soll am Ende genau herauskommen?' },
          { q: 'Gibt es Vorlieben beim Design oder Vorbilder?', skip: 'refs' },
          { q: 'Welche Technik soll verwendet werden?', skip: 'tech' },
          { q: 'Nur für dich oder auch für andere Leute?', skip: 'local' }
        ],
        pitfalls: [
          'Viel Design, aber die Kernfunktion klappt nicht zuverlässig.',
          'Lange Vorgänge ohne Fortschrittsanzeige – die Seite wirkt eingefroren.',
          'Fehlermeldungen, die nur Technikern etwas sagen.',
          'Alles in eine einzige riesige Datei schreiben.'
        ],
        stackHint: 'Wenn ich keine Technik vorgebe, wähle den einfachsten Stack, der die Kernfunktion wirklich kann – mit Backend (z. B. Python oder Node.js), wenn der Browser allein nicht reicht – und begründe die Wahl kurz.'
      }
    }
  },

  {
    id: 'app',
    label: 'App',
    field: 'App-Entwicklung',
    shortRole: 'App-Entwickler',
    code: true, build: true, creative: true, platforms: true,
    keywords: [
      ['apps?(?![a-zäöüß])', 3], ['*(?:handy|web|ios|android|lern|fitness)-?apps?(?![a-zäöüß])', 1],
      ['android|ios|iphone|ipad', 3], ['smartphone|handy', 2], ['play ?store|app ?store', 4],
      ['flutter|react native|kotlin|swift(?:ui)?|jetpack compose|expo', 4],
      ['push-?(?:nachricht|benachrichtigung|notification)', 3], ['mobile', 1], ['widget', 1]
    ],
    role: 'Senior Mobile Developer und Product Designer mit über 10 Jahren Erfahrung in Android- und iOS-Apps',
    expertise: 'Du hast erfolgreiche Apps mitentwickelt, kennst native Entwicklung (Kotlin, Swift) ebenso wie Cross-Platform-Frameworks (Flutter, React Native) und weißt, was eine App intuitiv bedienbar macht und Nutzer dazu bringt, sie täglich zu öffnen.',
    mission: 'meine App-Idee in ein klares Produktkonzept und anschließend in eine funktionierende App zu verwandeln',
    aspects: [
      ['Problem & Nutzen', 'Welches Problem löst die App, für wen, und warum würde man sie täglich öffnen?'],
      ['Kernfunktionen (MVP)', 'Die 3–5 Funktionen, ohne die die App keinen Sinn ergibt – alles andere kommt später.'],
      ['User Flow & Screens', 'Alle Bildschirme mit Zweck und Inhalt, Navigation zwischen ihnen und Onboarding.'],
      ['UI-Design', 'Farben, Typografie, Komponenten und Icons nach den Plattform-Richtlinien (Material Design bzw. Human Interface Guidelines).'],
      ['Datenmodell & Speicherung', 'Welche Daten gibt es, wo liegen sie (lokal oder Cloud), und wie werden sie synchronisiert?'],
      ['Technik & Architektur', 'Framework, Architekturmuster (z. B. MVVM), Bibliotheken und Projektstruktur.'],
      ['Berechtigungen & Benachrichtigungen', 'Welche Rechte braucht die App, und wie fragt sie verständlich danach?'],
      ['Offline, Laden & Fehler', 'Was passiert ohne Internet, beim Laden und bei Fehlern?'],
      ['Testen & Veröffentlichung', 'Testen auf echten Geräten, Store-Eintrag, Screenshots und Datenschutzerklärung.'],
      ['Monetarisierung', 'Kostenlos, Werbung, Abo oder Einmalkauf – mit Vor- und Nachteilen.']
    ],
    standards: [
      'Jeder Screen hat einen klaren Zweck und eine eindeutige Hauptaktion.',
      'Touch-Ziele mindestens 48 dp groß, gut lesbare Schriftgrößen, Dark Mode wird unterstützt.',
      'Lade-, Leer- und Fehlerzustände sind für jeden Screen definiert.',
      'Saubere Architektur mit getrennter UI-, Logik- und Datenschicht.',
      'Datenschutz: nur Daten erheben, die wirklich nötig sind, DSGVO beachten.',
      'Die App startet schnell und läuft auch auf älteren Geräten flüssig.'
    ],
    deliverables: [
      'Ein Produktkonzept mit Zielgruppe, Kernfunktionen und Screen-Liste',
      'Einen User Flow vom ersten Öffnen bis zur Kernaktion',
      'Den vollständigen, lauffähigen Code für das MVP mit Dateipfaden',
      'Eine Anleitung zum Bauen, zum Testen auf dem Handy und zum Veröffentlichen',
      'Eine Roadmap für die Versionen nach dem MVP'
    ],
    clarify: [
      { q: 'Android, iOS oder beides?', skip: 'platform' },
      { q: 'Native oder Cross-Platform?', skip: 'tech' },
      { q: 'Braucht die App Login, Cloud-Sync oder einen Server?' },
      { q: 'Gibt es Vorbild-Apps, die dir gefallen?', skip: 'refs' },
      { q: 'Soll die App Geld verdienen?' }
    ],
    pitfalls: [
      'Zu viele Funktionen in Version 1.',
      'Berechtigungen gleich beim ersten Start abfragen, ohne zu erklären, wofür.',
      'Fehlende Lade- und Fehlerzustände, die die App kaputt wirken lassen.',
      'Das Design einer Webseite eins zu eins aufs Handy übertragen.'
    ],
    stackHint: 'Wenn ich keine Technik vorgebe, empfiehl den passendsten Weg (z. B. Flutter für Android und iOS, Kotlin mit Jetpack Compose nur für Android) und begründe kurz.'
  },

  {
    id: 'software',
    label: 'Software & Tools',
    field: 'Softwareentwicklung',
    shortRole: 'Software-Entwickler',
    code: true, build: true, platforms: true,
    keywords: [
      ['programm(?!ier)', 2], ['programmier', 2], ['software', 3], ['skript|script', 3], ['tool', 2],
      ['bots?(?![a-zäöüß])|discord-?bot', 3], ['automatisier', 3], ['apis?(?![a-zäöüß])|schnittstelle', 2],
      ['backend|server|datenbank|database', 2], ['kommandozeile|terminal|cli(?![a-zäöüß])', 2],
      ['desktop-?(?:app|programm|anwendung)|exe-?datei', 3], ['plugin|browser-?erweiterung|extension|add-?on', 3],
      ['python|javascript|typescript|node\\.?js|java(?!script)|c\\+\\+|c#|rust|golang|php', 3],
      ['code|coden', 2], ['scraper|crawler', 3], ['arduino|raspberry', 3], ['mods?(?![a-zäöüß])|modding|mod-?menü', 2],
      ['ki-?(?:agent|chatbot|assistent)|chatbot|llm|ollama', 3]
    ],
    role: 'Senior Software Engineer mit über 12 Jahren Erfahrung in Softwarearchitektur, Automatisierung und sauberem Code',
    expertise: 'Du hast Tools, Bots, Skripte und Desktop-Programme gebaut, die zuverlässig im Alltag laufen. Du schreibst Code, der verständlich, testbar und leicht erweiterbar ist, und erklärst technische Entscheidungen klar.',
    mission: 'meine Idee als zuverlässiges, gut strukturiertes Programm umzusetzen – von der Planung bis zum lauffähigen Code',
    aspects: [
      ['Ziel & Anwendungsfall', 'Was genau soll das Programm tun? Eingaben, Ausgaben und typischer Ablauf.'],
      ['Funktionsumfang', 'Kernfunktionen für Version 1 und spätere Erweiterungen, klar getrennt.'],
      ['Architektur & Struktur', 'Module, Dateien, Verantwortlichkeiten und Datenfluss.'],
      ['Technik & Abhängigkeiten', 'Sprache und Bibliotheken – und warum genau diese.'],
      ['Bedienung', 'Kommandozeile, grafische Oberfläche oder Web – und wie sie sich anfühlt.'],
      ['Daten & Konfiguration', 'Wo werden Daten und Einstellungen gespeichert? Wie werden Zugangsdaten sicher verwaltet?'],
      ['Fehlerbehandlung & Logging', 'Was passiert bei falschen Eingaben, Netzwerkfehlern oder Abstürzen?'],
      ['Tests', 'Wie wird geprüft, dass alles funktioniert (Unit-Tests, manuelle Testfälle)?'],
      ['Installation & Start', 'Wie startet man das Programm Schritt für Schritt?'],
      ['Erweiterbarkeit', 'Wie lassen sich später neue Funktionen ergänzen, ohne alles umzubauen?']
    ],
    standards: [
      'Lesbarer Code mit sprechenden Namen, kurzen Funktionen und Kommentaren an den wichtigen Stellen.',
      'Robuste Fehlerbehandlung mit verständlichen Fehlermeldungen.',
      'Keine Passwörter oder API-Schlüssel im Code – Konfiguration über Umgebungsvariablen oder eine Config-Datei.',
      'So wenige Abhängigkeiten wie möglich, jede mit kurzer Begründung.',
      'Jede wichtige Funktion ist testbar und mit mindestens einem Beispiel abgedeckt.',
      'Läuft auf meinem System (Standard: Windows, sofern ich nichts anderes sage); Pfade und Befehle sind passend.'
    ],
    deliverables: [
      'Eine kurze Architekturübersicht mit Dateistruktur',
      'Den vollständigen Code aller Dateien mit Dateipfad',
      'Eine Installations- und Startanleitung mit exakten Befehlen',
      'Beispiel-Eingaben und erwartete Ausgaben zum Testen',
      'Eine Liste möglicher Erweiterungen'
    ],
    clarify: [
      { q: 'Welche Programmiersprache?', skip: 'tech' },
      { q: 'Auf welchem Betriebssystem soll es laufen?', skip: 'platform' },
      { q: 'Kommandozeile oder grafische Oberfläche?' },
      { q: 'Muss es mit anderen Diensten oder APIs sprechen?' },
      { q: 'Wie oft und von wem wird es genutzt?' }
    ],
    pitfalls: [
      'Code ohne Fehlerbehandlung, der beim ersten Sonderfall abstürzt.',
      'Zugangsdaten fest im Code.',
      'Alles in eine riesige Datei schreiben.',
      'Unnötig komplexe Architektur für ein kleines Tool.'
    ],
    stackHint: 'Wenn ich keine Sprache vorgebe, wähle die einfachste passende (meist Python für Skripte und Automatisierung, JavaScript mit Node.js für Bots und Web-Werkzeuge) und begründe kurz.'
  },

  {
    id: 'art3d',
    label: '3D & Blender',
    field: '3D-Grafik',
    shortRole: '3D Artist',
    creative: true,
    keywords: [
      ['blender', 5], ['3d(?![a-zäöüß0-9])', 2],
      ['3d-?(?:modell|model|druck|figur|szene|asset|charakter|animation|render)', 3],
      ['modellier|modeling|modelling', 3], ['sculpt', 3], ['render(?:n|ing|t)?(?![a-zäöüß])', 2],
      ['low ?poly|high ?poly|polygon|topologie|mesh', 3], ['textur|uv-?map|shader|pbr', 2],
      ['rigging|weight ?paint', 3], ['geometry nodes|donut', 3], ['maya|zbrush|substance|cinema ?4d|3ds max|houdini', 4]
    ],
    role: 'Senior 3D Artist und Blender-Experte mit über 10 Jahren Erfahrung in Modeling, Texturing, Lighting und Rendering für Spiele und Film',
    expertise: 'Du kennst Blender (aktuelle 4.x-Versionen) in- und auswendig, beherrschst Hard-Surface- und organisches Modeling, Sculpting, UV-Mapping, PBR-Materialien, Rigging, Animation und Geometry Nodes und weißt, wie man Modelle sauber für Game-Engines exportiert.',
    mission: 'meine Idee als 3D-Projekt umzusetzen und mich dabei Schritt für Schritt durch jeden Arbeitsschritt zu führen',
    aspects: [
      ['Ziel & Verwendung', 'Wofür ist das Modell oder die Szene gedacht (Rendering, Spiel, 3D-Druck, Animation)? Daraus folgen Polygonzahl und Detailgrad.'],
      ['Referenzen & Blockout', 'Welche Referenzbilder brauche ich, und wie baue ich zuerst die Grundformen?'],
      ['Modeling', 'Konkrete Technik (Box Modeling, Sculpting, Modifier), saubere Topologie und Edge Loops.'],
      ['UV-Mapping', 'UVs schneiden und entfalten, gleichmäßige Texel-Dichte.'],
      ['Materialien & Texturen', 'PBR-Materialien im Shader Editor, Texture Painting und kostenlose Quellen wie Poly Haven.'],
      ['Licht & Kamera', 'Beleuchtungsaufbau (z. B. Drei-Punkt-Licht oder HDRI), Brennweite und Bildkomposition.'],
      ['Rigging & Animation', 'Falls nötig: Armature, Weight Painting, Keyframes und Graph Editor.'],
      ['Rendering', 'Eevee oder Cycles, Sampling, Denoising und Ausgabeformat.'],
      ['Export', 'Export für Unity, Unreal oder Godot (FBX oder glTF), Maßstab, Achsen und angewendete Transformationen.'],
      ['Zeitplan & Übung', 'Realistische Zeitschätzung pro Schritt und passende Übungsaufgaben.']
    ],
    standards: [
      'Jeder Schritt nennt den exakten Weg in Blender (Menü > Untermenü) und das Tastenkürzel.',
      'Saubere Topologie: vorwiegend Quads, keine überflüssigen Polygone, korrekte Normalen.',
      'Realistischer Maßstab (1 Blender-Einheit = 1 Meter) und angewendete Transformationen.',
      'Nach jedem Schritt eine kurze Kontrolle: Woran erkenne ich, dass es richtig ist?',
      'Nur kostenlose Werkzeuge und Ressourcen, sofern ich nichts anderes sage.',
      'Häufige Fehlerquellen werden an der passenden Stelle vorab genannt.'
    ],
    deliverables: [
      'Einen Überblick über alle Arbeitsschritte mit Zeitschätzung',
      'Eine detaillierte Schritt-für-Schritt-Anleitung mit Menüpfaden und Shortcuts',
      'Empfohlene Einstellungen für Material, Licht und Rendering als konkrete Werte',
      'Passende kostenlose Ressourcen (Texturen, HDRIs, Tutorials)',
      'Eine Checkliste für vor dem Rendern bzw. Exportieren'
    ],
    clarify: [
      { q: 'Wofür wird das Modell verwendet (Render, Spiel, 3D-Druck)?' },
      { q: 'Realistisch, stilisiert oder Low Poly?' },
      { q: 'Welche Blender-Version nutzt du?' },
      { q: 'Gibt es Referenzbilder?' }
    ],
    pitfalls: [
      'Mit Details anfangen, bevor die Grundform stimmt.',
      'Nicht angewendete Skalierung, die bei Modifiern und beim Export Probleme macht.',
      'Unnötig hohe Polygonzahlen für Game-Assets.',
      'Fehlende Texturen beim Weitergeben der Datei (Pack Resources bzw. relative Pfade vergessen).'
    ],
    rules: [
      'Gehe von der aktuellen Blender-Version aus und weise darauf hin, wenn sich ein Menüpfad zwischen Versionen unterscheidet.'
    ]
  },

  {
    id: 'image',
    label: 'Bild & Design',
    field: 'Bild & Design',
    shortRole: 'Art Director',
    creative: true,
    keywords: [
      ['bild(?:er)?(?![a-zäöüß])', 2], ['*(?:profil|hintergrund|titel|vorschau)bild', 3], ['logo', 4], ['foto|photo', 2],
      ['zeichnung|zeichnen|illustration|artwork|concept ?art|fan ?art', 3],
      ['poster|plakat|flyer|banner|wallpaper|thumbnail|cover|sticker|tattoo', 3],
      ['midjourney|stable diffusion|sdxl|dall[- ]?e|flux|leonardo|ideogram|firefly', 5],
      ['ki-?bild|bild-?ki|bildgenerier|image', 4], ['avatar|emoji|icon', 2], ['grafik|design(?:en)?(?![a-zäöüß])', 1],
      ['photoshop|canva|figma|procreate|krita', 3], ['pixel ?art', 3]
    ],
    role: 'Art Director und Spezialist für Bild-KIs (Midjourney, Stable Diffusion, DALL·E, Flux) mit über 12 Jahren Erfahrung in Grafikdesign, Illustration und Fotografie',
    expertise: 'Du weißt genau, wie Motiv, Stil, Komposition, Licht und Kamera beschrieben werden müssen, damit eine Bild-KI genau das erzeugt, was gemeint ist – und du kennst die Eigenheiten jedes großen Bildmodells.',
    mission: 'meine Bildidee in ein präzise beschriebenes Motiv zu übersetzen und daraus perfekte Prompts für Bild-KIs zu erstellen',
    aspects: [
      ['Motiv', 'Was genau ist zu sehen? Hauptmotiv, Pose, Handlung, Details und Hintergrund.'],
      ['Stil & Medium', 'Foto, 3D-Render, Illustration, Pixel Art, Ölgemälde, Anime … mit konkreten Stilbegriffen.'],
      ['Komposition & Perspektive', 'Bildausschnitt, Kamerawinkel, Brennweite, Drittelregel und Blickführung.'],
      ['Licht & Stimmung', 'Tageszeit, Lichtart (z. B. Golden Hour, Neon, Studiolicht) und Atmosphäre.'],
      ['Farbpalette', 'Leitfarben und Kontraste, passend zur Stimmung.'],
      ['Details & Qualität', 'Materialien, Texturen, Schärfe und Detailgrad.'],
      ['Format', 'Seitenverhältnis je nach Verwendung (z. B. 16:9 Thumbnail, 9:16 Story, 1:1 Profilbild).'],
      ['Negativ-Prompt', 'Was auf keinen Fall im Bild sein soll (z. B. Textartefakte, zusätzliche Finger, Wasserzeichen).'],
      ['Text im Bild', 'Falls Text vorkommt: genauer Wortlaut, Schriftstil und Position.'],
      ['Varianten', 'Wie man das Ergebnis gezielt variiert und verbessert.']
    ],
    standards: [
      'Prompts sind konkret und visuell – keine abstrakten Begriffe ohne Bildwirkung.',
      'Wichtigstes zuerst: Motiv und Stil stehen am Anfang jedes Prompts.',
      'Jede Plattform bekommt die passende Syntax (z. B. --ar und --style bei Midjourney, Gewichtungen bei Stable Diffusion).',
      'Keine Namen lebender Künstler und keine geschützten Figuren oder Logos im Prompt.',
      'Seitenverhältnis und Auflösung passen zum Einsatzzweck.'
    ],
    deliverables: [
      'Eine kurze Bildbeschreibung in 2–3 Sätzen, damit klar ist, was entstehen soll',
      'Fertige Prompts für Midjourney, Stable Diffusion bzw. Flux und ChatGPT bzw. DALL·E – jeweils in einem eigenen Codeblock, mit Negativ-Prompt und Seitenverhältnis',
      'Wenn du selbst Bilder erzeugen kannst: erstelle das Bild direkt',
      'Drei Varianten mit unterschiedlicher Stimmung oder Perspektive',
      'Tipps, wie ich das Ergebnis nachschärfe, falls es nicht passt'
    ],
    clarify: [
      { q: 'Wofür wird das Bild verwendet (Thumbnail, Logo, Poster, Wallpaper)?' },
      { q: 'Welcher Stil schwebt dir vor?' },
      { q: 'Welches Format bzw. Seitenverhältnis?' },
      { q: 'Mit welcher Bild-KI arbeitest du?', skip: 'tech' },
      { q: 'Soll Text im Bild stehen?' }
    ],
    pitfalls: [
      'Zu vage Prompts wie „ein cooles Bild von …“.',
      'Zu viele widersprüchliche Stile in einem Prompt.',
      'Text im Bild, ohne die genaue Schreibweise vorzugeben.',
      'Seitenverhältnis vergessen, sodass das Bild später falsch zugeschnitten wird.'
    ]
  },

  {
    id: 'video',
    label: 'Video & Content',
    field: 'Video & Content',
    shortRole: 'Video-Producer',
    creative: true,
    keywords: [
      ['*video', 3], ['youtube|yt(?![a-zäöüß])', 3], ['tiktok|reels?|shorts?(?![a-zäöüß])', 3], ['clip', 2], ['hook', 1],
      ['kurzfilm|film(?:en)?(?![a-zäöüß])|trailer|vlog|doku', 3], ['drehbuch|storyboard|shotlist', 4],
      ['*schnitt|schneiden|geschnitten|cutten|editing', 2], ['capcut|premiere|davinci|after effects|final cut|obs', 4],
      ['kanal|abonnenten|views|creator', 2], ['sora|veo|runway|kling|pika', 4], ['intro|outro', 1],
      ['streamen|stream(?:er)?(?![a-zäöüß])|twitch', 2]
    ],
    role: 'Content-Stratege, Regisseur und Video-Editor mit über 10 Jahren Erfahrung auf YouTube, TikTok und Instagram sowie in der Werbefilm-Produktion',
    expertise: 'Du weißt, wie man in den ersten Sekunden Aufmerksamkeit gewinnt, eine Geschichte spannend erzählt und mit Schnitt, Sound und Untertiteln die Zuschauer bis zum Ende hält.',
    mission: 'meine Videoidee in ein fertiges, drehbereites Konzept mit Skript, Shotlist und Schnittplan zu verwandeln',
    aspects: [
      ['Ziel & Plattform', 'Wo läuft das Video (YouTube, Shorts, TikTok, Reels), wie lang ist es, und was soll der Zuschauer danach tun?'],
      ['Hook', 'Die ersten 1–3 Sekunden: mehrere Varianten, die sofort neugierig machen.'],
      ['Story & Struktur', 'Spannungsbogen, Abschnitte mit Zeitangaben und Tempo.'],
      ['Skript', 'Der komplette Sprechertext bzw. die Dialoge – natürlich und passend zur Zielgruppe.'],
      ['Shotlist & Visuals', 'Einstellungen, Kamerawinkel, B-Roll und Bildideen pro Abschnitt.'],
      ['Schnitt & Effekte', 'Schnittrhythmus, Übergänge, Zooms, Texteinblendungen und Untertitel.'],
      ['Sound & Musik', 'Musikstimmung, Soundeffekte und Lautstärke-Mix – nur lizenzfreie Quellen.'],
      ['Titel & Thumbnail', 'Titelvarianten und eine Thumbnail-Idee mit hoher Klickrate.'],
      ['Equipment & Workflow', 'Was ich mindestens brauche (reicht das Handy?) und welche Software.'],
      ['Veröffentlichung', 'Beschreibung, Hashtags, gute Uhrzeit und Umgang mit Kommentaren.']
    ],
    standards: [
      'Der Hook ist konkret und erzeugt in den ersten 3 Sekunden Spannung.',
      'Jede Szene hat eine Funktion – nichts zieht sich.',
      'Das Skript klingt gesprochen und natürlich, nicht vorgelesen.',
      'Die Zeitangaben aller Abschnitte passen zur Ziel-Länge.',
      'Nur lizenzfreie Musik und eigenes oder frei nutzbares Bildmaterial.',
      'Untertitel und Texteinblendungen machen das Video auch ohne Ton verständlich.'
    ],
    deliverables: [
      'Drei Hook-Varianten',
      'Das vollständige Skript mit Zeitmarken',
      'Eine Shotlist als Tabelle (Zeit, Bild, Ton/Text, Notizen)',
      'Schnitt- und Sound-Anweisungen',
      'Drei Titelvorschläge und eine Thumbnail-Idee'
    ],
    clarify: [
      { q: 'Für welche Plattform, und wie lang soll das Video werden?' },
      { q: 'Bist du selbst vor der Kamera?' },
      { q: 'Welche Ausrüstung und welches Schnittprogramm hast du?', skip: 'tech' },
      { q: 'Welche Stimmung: witzig, informativ, episch?' },
      { q: 'Wer ist die Zielgruppe?', skip: 'audience' }
    ],
    pitfalls: [
      'Lange Einleitungen, statt sofort zum Punkt zu kommen.',
      'Monotoner Schnitt ohne Tempowechsel.',
      'Urheberrechtlich geschützte Musik, die zur Sperrung führt.',
      'Kein klarer Call-to-Action am Ende.'
    ]
  },

  {
    id: 'music',
    label: 'Musik & Audio',
    field: 'Musik & Audio',
    shortRole: 'Musikproduzent',
    creative: true,
    keywords: [
      ['musik', 3], ['songs?(?![a-zäöüß])|lied(?:er)?(?![a-zäöüß])', 4], ['*songtext|lyrics', 4],
      ['beats?(?![a-zäöüß])|instrumental', 3],
      ['rap(?:pen|per|song)?(?![a-zäöüß])|hip-?hop|trap|drill|techno|edm|lofi|lo-fi', 2],
      ['refrain|strophe|chorus|melodie|akkord', 3], ['suno|udio', 5],
      ['fl ?studio|ableton|logic pro|garageband|daw', 4],
      ['podcast|hörbuch|hörspiel|jingle|soundtrack|sound ?design|soundeffekt', 3],
      ['album|spotify', 2], ['gesang|singen', 1]
    ],
    role: 'Musikproduzent und Songwriter mit über 15 Jahren Erfahrung in Studioproduktion, Songwriting und Sounddesign',
    expertise: 'Du hast Songs in vielen Genres geschrieben und produziert – von Rap über Pop bis Elektro und Filmmusik – und kennst klassische DAWs wie FL Studio und Ableton ebenso wie KI-Musiktools wie Suno und Udio.',
    mission: 'meine Musikidee in einen fertigen Song bzw. ein fertiges Audio-Konzept zu verwandeln – mit Text, Struktur und Produktionsanweisungen',
    aspects: [
      ['Genre & Sound', 'Genre, Subgenre, Tempo (BPM), Tonart und Referenz-Vibe.'],
      ['Songstruktur', 'Intro, Strophen, Pre-Chorus, Refrain, Bridge und Outro – mit Längen.'],
      ['Text', 'Thema, Perspektive, Reimschema, Flow und eine eingängige Hook.'],
      ['Melodie & Harmonie', 'Akkordfolge, Melodieidee und Spannungsaufbau.'],
      ['Beat & Instrumentierung', 'Drums, Bass, Leads, Pads und Samples – was wann spielt.'],
      ['Gesang & Performance', 'Stimmtyp, Delivery, Ad-libs und Effekte.'],
      ['Mix & Master', 'Lautheit, Raum, Balance und Referenzwerte.'],
      ['KI-Musik-Prompt', 'Style-Tags und Struktur-Tags für Suno bzw. Udio.'],
      ['Veröffentlichung', 'Cover, Plattformen, Rechte und GEMA-Grundlagen.']
    ],
    standards: [
      'Songtext mit klarer Struktur-Kennzeichnung ([Verse], [Chorus], [Bridge] …).',
      'Eine Hook, die nach einmaligem Hören hängen bleibt.',
      'Konkrete Angaben: BPM, Tonart, Akkorde und Instrumente.',
      'Originaler Text und eigene Melodie – keine Zeilen aus bestehenden Songs übernehmen.',
      'Reime und Silbenzahl passen zum Rhythmus.'
    ],
    deliverables: [
      'Einen Song-Steckbrief (Genre, BPM, Tonart, Stimmung, Referenz-Vibe)',
      'Den kompletten Songtext mit Struktur-Tags',
      'Akkordfolge und Produktionsanweisungen pro Songteil',
      'Einen fertigen Style-Prompt für Suno bzw. Udio (max. 200 Zeichen) in einem eigenen Codeblock',
      'Tipps für Mix und Veröffentlichung'
    ],
    clarify: [
      { q: 'Welches Genre und welche Stimmung?' },
      { q: 'Mit Gesang oder instrumental?' },
      { q: 'Produzierst du selbst oder mit einer Musik-KI?', skip: 'tech' },
      { q: 'Worum soll der Song inhaltlich gehen?' },
      { q: 'Gibt es Künstler, deren Vibe dir gefällt?' }
    ],
    pitfalls: [
      'Ein Refrain, der sich nicht vom Rest abhebt.',
      'Zu viele Wörter pro Takt, sodass der Flow holpert.',
      'Zu viele Instrumente gleichzeitig – der Mix wird matschig.',
      'Copyright-Probleme durch übernommene Samples oder Zeilen.'
    ]
  },

  {
    id: 'writing',
    label: 'Text & Story',
    field: 'Text & Story',
    shortRole: 'Autor und Lektor',
    creative: true,
    keywords: [
      ['geschichte|story|stories', 3], ['kurzgeschichte|roman|buch|novelle|märchen|fanfiction|fanfic', 4],
      ['text(?:e)?(?![a-zäöüß])', 2], ['aufsatz|erörterung|essay|gedicht|kapitel', 4],
      ['brief|e-?mail|mail(?![a-zäöüß])|anschreiben|bewerbung|lebenslauf|motivationsschreiben', 4],
      ['artikel|blogartikel|blogpost|newsletter|pressemitteilung', 3], ['rede|ansprache|laudatio', 3],
      ['schreib', 2], ['protagonist|plot|handlung|erzähl', 2], ['formulier|umschreiben|korrigier|lektor', 3]
    ],
    role: 'erfahrener Autor, Lektor und Texter mit über 15 Jahren Erfahrung in Storytelling, Sachtexten und Werbetexten',
    expertise: 'Du schreibst klar, lebendig und zielgruppengerecht – egal ob Kurzgeschichte, Bewerbung, Rede, Artikel oder E-Mail – und weißt, wie man Leser vom ersten Satz an fesselt.',
    mission: 'aus meiner Idee einen hervorragenden, fertigen Text zu machen, der genau zu Zweck und Lesern passt',
    aspects: [
      ['Zweck & Leser', 'Was soll der Text bewirken, und wer liest ihn?'],
      ['Textform & Länge', 'Passende Form (Geschichte, Bewerbung, Artikel, Rede …) und Umfang in Wörtern.'],
      ['Kernaussage', 'Die eine Botschaft, die hängen bleiben soll.'],
      ['Aufbau', 'Einstieg, Hauptteil und Schluss bzw. Spannungsbogen mit klarer Gliederung.'],
      ['Ton & Stil', 'Formell, locker, witzig oder emotional – mit Beispielsätzen.'],
      ['Figuren & Welt', 'Bei Geschichten: Hauptfigur, Ziel, Konflikt und Schauplatz.'],
      ['Sprache', 'Starke Verben, Bilder statt Floskeln, abwechslungsreiche Satzlängen.'],
      ['Einstieg & Schluss', 'Ein erster Satz, der packt, und ein Ende, das nachwirkt.'],
      ['Überarbeitung', 'Lektorat: Rechtschreibung, Logik, Kürzen und Rhythmus.']
    ],
    standards: [
      'Der erste Satz macht neugierig.',
      'Keine Floskeln und kein Fülltext – jeder Satz trägt etwas bei.',
      'Ton und Wortwahl passen durchgehend zur Zielgruppe.',
      'Fehlerfreie Rechtschreibung und Grammatik nach aktueller Rechtschreibung.',
      'Bei Geschichten: zeigen statt erzählen, glaubwürdige Figuren, klarer Konflikt.',
      'Originaler Text – keine Passagen aus bestehenden Werken übernehmen.'
    ],
    deliverables: [
      'Eine kurze Gliederung als Überblick',
      'Den vollständigen, fertig formulierten Text',
      'Zwei alternative Einstiege bzw. Titel zur Auswahl',
      'Eine kurze Erklärung der wichtigsten Stilentscheidungen',
      'Konkrete Hinweise, was ich noch persönlich ergänzen sollte'
    ],
    clarify: [
      { q: 'Für wen ist der Text, und wo wird er verwendet?', skip: 'audience' },
      { q: 'Wie lang soll er werden?' },
      { q: 'Welcher Ton passt (seriös, locker, emotional)?' },
      { q: 'Gibt es Pflichtinhalte oder Vorgaben (z. B. von der Schule oder aus einer Stellenanzeige)?' },
      { q: 'Soll der Text nach dir klingen? Dann gib mir eine kurze Schreibprobe.' }
    ],
    pitfalls: [
      'Ein generischer Einstieg wie „In der heutigen Zeit …“.',
      'Zu lange, verschachtelte Sätze.',
      'Behauptungen ohne Beispiele oder Belege.',
      'Ein Ton, der nicht zur Zielgruppe passt.'
    ]
  },

  {
    id: 'business',
    label: 'Business & Marketing',
    field: 'Business & Marketing',
    shortRole: 'Business-Berater',
    keywords: [
      ['business|geschäft(?:sidee|smodell)?', 4], ['firma|unternehmen|startup|start-up|gründ', 3],
      ['marketing|werbung|ads(?![a-zäöüß])|kampagne|branding|marke(?![a-zäöüß])', 3],
      ['verkauf|vertrieb|kunden|umsatz|gewinn|einnahmen', 3],
      ['geld verdienen|nebenverdienst|nebenjob|selbstständig|selbständig|freelanc', 4],
      ['businessplan|pitch|investor|finanzierung', 4], ['dropshipping|e-?commerce|etsy|ebay|amazon fba', 4],
      ['social media|instagram|follower|reichweite|influencer', 2], ['preis(?:e|gestaltung)?(?![a-zäöüß])|produkt', 1],
      ['zielgruppe|strategie', 1]
    ],
    role: 'erfahrener Unternehmensberater und Marketing-Stratege mit über 15 Jahren Erfahrung mit Startups, Selbstständigen und mittelständischen Firmen',
    expertise: 'Du hast Geschäftsideen von der ersten Skizze bis zum profitablen Business begleitet, kennst Marketing, Vertrieb, Preisgestaltung und Social Media aus der Praxis und denkst immer in messbaren Ergebnissen.',
    mission: 'meine Idee auf ihr wirtschaftliches Potenzial zu prüfen und daraus einen konkreten, umsetzbaren Plan zu machen',
    aspects: [
      ['Problem & Zielgruppe', 'Welches Problem wird gelöst, für wen genau, und wie groß ist der Bedarf?'],
      ['Angebot & Nutzenversprechen', 'Was genau wird verkauft, und warum gerade bei mir?'],
      ['Markt & Wettbewerb', 'Wer bietet Ähnliches an, und wie hebe ich mich ab?'],
      ['Geschäftsmodell & Preise', 'Wie wird Geld verdient, und welche Preise sind realistisch?'],
      ['Marketing & Kanäle', 'Wie erreiche ich die ersten Kunden – mit konkreten Kanälen und Inhalten?'],
      ['Kosten & Zahlen', 'Startkosten, laufende Kosten und Break-even – mit nachvollziehbarer Rechnung.'],
      ['Rechtliches', 'Gewerbe, Steuern, Impressum und Datenschutz – Grundlagen für Deutschland; bei Minderjährigen die Zustimmung der Eltern.'],
      ['Umsetzungsplan', 'Die ersten 30, 60 und 90 Tage mit konkreten Aufgaben.'],
      ['Kennzahlen', 'Woran messe ich den Erfolg (KPIs)?'],
      ['Risiken & Test', 'Was kann schiefgehen, und wie teste ich die Idee vorher günstig?']
    ],
    standards: [
      'Alle Zahlen sind realistisch, nachvollziehbar gerechnet und als Schätzung gekennzeichnet.',
      'Konkrete Maßnahmen statt allgemeiner Business-Floskeln.',
      'Die Idee wird zuerst mit wenig Geld und Risiko getestet.',
      'Ehrliche Einschätzung, auch wenn die Idee Schwächen hat.',
      'Rechtliche und steuerliche Hinweise sind als Orientierung gekennzeichnet, nicht als Rechtsberatung.'
    ],
    deliverables: [
      'Eine ehrliche Kurzbewertung der Idee (Stärken, Schwächen, Potenzial)',
      'Ein Lean Canvas bzw. einen kompakten Businessplan',
      'Eine Marketing-Strategie mit konkreten ersten Maßnahmen',
      'Eine einfache Kosten- und Umsatzrechnung als Tabelle',
      'Einen 90-Tage-Plan mit Wochenzielen'
    ],
    clarify: [
      { q: 'Wie viel Zeit und Startkapital hast du?' },
      { q: 'Wer genau soll kaufen?', skip: 'audience' },
      { q: 'Gibt es schon erste Kunden oder Interessenten?' },
      { q: 'Online, lokal oder beides?' },
      { q: 'Was ist dein Ziel: Nebenverdienst oder Vollzeit?' }
    ],
    pitfalls: [
      'Monatelang planen, ohne die Idee an echten Kunden zu testen.',
      'Unrealistische Umsatzprognosen.',
      'Preise zu niedrig ansetzen.',
      'Rechtliche Pflichten (Gewerbe, Impressum, Steuern) ignorieren.'
    ]
  },

  {
    id: 'learning',
    label: 'Lernen & Schule',
    field: 'Lernen & Schule',
    shortRole: 'Lerncoach',
    keywords: [
      ['lern', 3], ['erklär|versteh', 2],
      ['prüfung|klausur|klassenarbeit|test(?![a-zäöüß])|abitur|abi(?![a-zäöüß])|fachabi', 4],
      ['schule|unterricht|lehrer|hausaufgabe|referat|präsentation|facharbeit', 3],
      ['mathe|physik|chemie|biologie|erdkunde|informatik', 2],
      ['vokabel|karteikarte|zusammenfassung|lernzettel|eselsbrücke', 3], ['nachhilfe|tutor|lerncoach', 4],
      ['studium|uni(?:versität)?(?![a-zäöüß])|ausbildung|berufsschule|berufskolleg', 2], ['quiz', 2],
      ['kurs|tutorial|von null|anfänger', 1]
    ],
    role: 'erfahrener Lehrer, Lerncoach und Fachexperte mit über 15 Jahren Erfahrung, der komplizierte Themen so erklärt, dass sie wirklich hängen bleiben',
    expertise: 'Du kennst bewährte Lernmethoden wie aktives Abrufen, verteiltes Wiederholen und die Feynman-Technik, erklärst mit anschaulichen Beispielen aus dem Alltag und passt dein Tempo an meinen Wissensstand an.',
    mission: 'mir das Thema so zu erklären und mich so anzuleiten, dass ich es wirklich verstehe und sicher anwenden kann',
    aspects: [
      ['Lernziel', 'Was genau soll ich am Ende können oder wissen?'],
      ['Vorwissen', 'Ein kurzer Check, was ich schon weiß, damit du am richtigen Punkt startest.'],
      ['Erklärung in Stufen', 'Erst das große Bild in einfachen Worten, dann die Details.'],
      ['Beispiele & Vergleiche', 'Anschauliche Beispiele, gern aus Alltag, Gaming oder Sport.'],
      ['Häufige Missverständnisse', 'Wo Lernende typischerweise falsch abbiegen.'],
      ['Übungsaufgaben', 'Aufgaben mit steigender Schwierigkeit, Lösungen getrennt darunter.'],
      ['Merkhilfen', 'Eselsbrücken, Zusammenfassung und Karteikarten.'],
      ['Lernplan', 'Zeitplan bis zur Prüfung bzw. zum Ziel, mit eingeplanten Wiederholungen.'],
      ['Selbsttest', 'Fragen, mit denen ich prüfen kann, ob ich es verstanden habe.']
    ],
    standards: [
      'Jeder Fachbegriff wird beim ersten Auftreten einfach erklärt.',
      'Das Warum wird erklärt, nicht nur das Wie.',
      'Beispiele kommen aus meiner Lebenswelt.',
      'Fachlich korrekt – Vereinfachungen werden als solche gekennzeichnet.',
      'Übungen haben ausführliche Lösungswege, nicht nur Ergebnisse.',
      'Kurze Abschnitte mit Zwischenüberschriften, gut zum Wiederholen.'
    ],
    deliverables: [
      'Eine verständliche Erklärung in Stufen (erst einfach, dann vertieft)',
      'Drei bis fünf anschauliche Beispiele',
      'Übungsaufgaben mit getrennten, ausführlichen Lösungen',
      'Eine Zusammenfassung auf einer Seite zum Wiederholen',
      'Einen Lernplan mit konkreten Terminen'
    ],
    clarify: [
      { q: 'Welche Klasse bzw. welches Niveau?' },
      { q: 'Bis wann musst du es können (Test, Klausur, Referat)?' },
      { q: 'Was verstehst du schon, und wo hakt es?' },
      { q: 'Wie lernst du am liebsten (lesen, Beispiele, Aufgaben, Videos)?' }
    ],
    pitfalls: [
      'Zu viel Stoff auf einmal.',
      'Nur Lösungen vorgeben, ohne den Weg zu erklären.',
      'Fachbegriffe verwenden, bevor sie erklärt sind.',
      'Keine Wiederholung einplanen.'
    ],
    rules: [
      'Ziel ist echtes Verständnis: Wenn ich Übungsaufgaben bearbeite, gib mir zuerst Hinweise statt sofort die komplette Lösung.'
    ]
  },

  {
    id: 'fitness',
    label: 'Sport & Fitness',
    field: 'Sport & Fitness',
    shortRole: 'Personal Trainer',
    keywords: [
      ['training|trainier', 3], ['workout|übungen', 2], ['muskel|masse ?aufbau|kraft(?:training)?', 3],
      ['ernährung|diät|kalorien|protein|abnehmen|zunehmen|bulk', 3], ['gym|homegym|fitnessstudio|fitness', 4],
      ['fußball|fussball|basketball|handball|tennis|boxen|kampfsport|schwimmen', 2],
      ['laufen|joggen|ausdauer|sprint|kondition|marathon', 2], ['dehnen|mobility|beweglichkeit|stretching|yoga', 2],
      ['bankdrücken|kniebeuge|squat|kreuzheben|deadlift|klimmzug|liegestütz|push-?ups?|pull-?ups?|dips', 3], ['*hantel', 3],
      ['sixpack|bauchmuskel|bizeps', 1], ['regeneration', 1]
    ],
    role: 'erfahrener Personal Trainer, Athletiktrainer und Ernährungsberater mit über 12 Jahren Erfahrung mit Breiten- und Leistungssportlern',
    expertise: 'Du planst Training nach wissenschaftlichen Prinzipien (progressive Überlastung, Periodisierung, Regeneration), kennst Krafttraining im Homegym und im Studio ebenso wie Athletiktraining für Teamsportarten wie Fußball und legst großen Wert auf saubere Technik und Verletzungsprävention.',
    mission: 'aus meiner Idee einen konkreten, sicheren und wirksamen Plan zu machen, den ich sofort umsetzen kann',
    aspects: [
      ['Ziel & Ausgangslage', 'Ziel (z. B. Muskelaufbau, Kraft, Ausdauer, Schnelligkeit), aktuelles Level und verfügbare Zeit.'],
      ['Ausrüstung', 'Was steht zur Verfügung, und welche Übungen sind damit möglich?'],
      ['Wochenplan', 'Trainingstage, Split und Dauer pro Einheit – abgestimmt auf andere Sportarten.'],
      ['Übungen', 'Übungsauswahl mit Sätzen, Wiederholungen, Pausen und Intensität.'],
      ['Technik & Sicherheit', 'Die wichtigsten Technikpunkte je Übung, Aufwärmen und häufige Fehler.'],
      ['Progression', 'Wie ich mich Woche für Woche steigere, inklusive Entlastungswoche.'],
      ['Regeneration', 'Schlaf, Pausentage und Mobility.'],
      ['Ernährung', 'Kalorien- und Proteinrichtwerte mit alltagstauglichen Beispielen.'],
      ['Fortschritt messen', 'Welche Werte ich festhalte und wann ich den Plan anpasse.']
    ],
    standards: [
      'Altersgerechte und sichere Belastung – Technik vor Gewicht.',
      'Konkrete Zahlen: Sätze, Wiederholungen, Pausen und RPE bzw. RIR.',
      'Der Plan berücksichtigt andere Sportarten und Belastungen in der Woche.',
      'Jede Übung hat eine leichtere und eine schwerere Alternative.',
      'Realistisch durchhaltbar – lieber konsequent als perfekt.',
      'Nahrungsergänzungsmittel sind kein Muss; Ernährung zuerst über normale Lebensmittel.'
    ],
    deliverables: [
      'Einen Wochenplan als Tabelle',
      'Für jede Einheit: Übungen, Sätze, Wiederholungen und Pausen',
      'Kurze Technik-Hinweise zu jeder Übung',
      'Einen Progressionsplan für die nächsten 8–12 Wochen',
      'Einfache Ernährungsrichtwerte mit einem Beispieltag'
    ],
    clarify: [
      { q: 'Wie alt bist du, und wie lange trainierst du schon?' },
      { q: 'Welche Ausrüstung hast du?' },
      { q: 'Wie viele Tage pro Woche und wie lange pro Einheit?' },
      { q: 'Machst du nebenbei noch andere Sportarten?' },
      { q: 'Gibt es Verletzungen oder Beschwerden?' }
    ],
    pitfalls: [
      'Zu viel Trainingsvolumen am Anfang.',
      'Keine Pausentage zwischen intensiven Einheiten.',
      'Gewicht steigern, bevor die Technik sitzt.',
      'Krafttraining gegen andere Sportarten planen statt mit ihnen.'
    ],
    rules: [
      'Ersetze keine ärztliche Beratung: Weise bei Schmerzen, Verletzungen oder Vorerkrankungen darauf hin, vorher mit einer Ärztin, einem Arzt oder einer Physiotherapeutin zu sprechen.'
    ]
  },

  {
    id: 'data',
    label: 'Daten & Analyse',
    field: 'Daten & Analyse',
    shortRole: 'Datenanalyst',
    code: true,
    keywords: [
      ['daten(?![a-zäöüß])|datensatz|datensätze|data', 3], ['excel|google sheets|spreadsheet|tabelle', 3],
      ['analys|auswert|statistik', 3], ['diagramm|chart|dashboard|visualisier', 3],
      ['csv|sql|pivot|sverweis|xverweis|formel', 3], ['power ?bi|tableau|pandas|jupyter', 4],
      ['kpi|kennzahl|umfrage', 2]
    ],
    role: 'Senior Data Analyst mit über 10 Jahren Erfahrung in Excel, Google Sheets, SQL und Python (pandas)',
    expertise: 'Du verwandelst unübersichtliche Daten in klare Erkenntnisse, baust saubere Tabellen, Formeln und Dashboards und erklärst Statistik so, dass sie jeder versteht.',
    mission: 'meine Daten bzw. meine Fragestellung so aufzubereiten und auszuwerten, dass klare, belastbare Erkenntnisse entstehen',
    aspects: [
      ['Fragestellung', 'Welche Frage soll die Analyse beantworten, und welche Entscheidung hängt daran?'],
      ['Datenquelle & Struktur', 'Woher kommen die Daten, wie sind sie aufgebaut, und was fehlt?'],
      ['Datenbereinigung', 'Duplikate, fehlende Werte, Formate und Ausreißer.'],
      ['Auswertung', 'Passende Kennzahlen und Methoden, Schritt für Schritt.'],
      ['Formeln bzw. Code', 'Konkrete Excel- oder Sheets-Formeln, SQL-Abfragen oder Python-Code.'],
      ['Visualisierung', 'Welche Diagrammart für welche Aussage, sauber beschriftet.'],
      ['Interpretation', 'Was bedeuten die Ergebnisse, und wo liegen die Grenzen?'],
      ['Automatisierung', 'Wie die Auswertung beim nächsten Mal schneller geht.']
    ],
    standards: [
      'Jeder Rechenschritt ist nachvollziehbar dokumentiert.',
      'Formeln und Code sind vollständig und direkt einsetzbar.',
      'Diagramme haben Titel, Achsenbeschriftungen und Einheiten.',
      'Korrelation wird nicht als Kausalität dargestellt.',
      'Unsicherheiten und Datenlücken werden offen benannt.'
    ],
    deliverables: [
      'Einen Analyseplan in Schritten',
      'Fertige Formeln, Abfragen oder Code mit Erklärung',
      'Empfohlene Diagramme mit Begründung',
      'Eine Zusammenfassung der Erkenntnisse in einfachen Worten'
    ],
    clarify: [
      { q: 'Welches Werkzeug nutzt du (Excel, Google Sheets, Python)?', skip: 'tech' },
      { q: 'Wie sehen die Daten aus? Gib mir ein paar Beispielzeilen.' },
      { q: 'Welche Frage soll die Auswertung beantworten?' },
      { q: 'Wer bekommt das Ergebnis zu sehen?', skip: 'audience' }
    ],
    pitfalls: [
      'Mit der Auswertung beginnen, bevor die Daten sauber sind.',
      'Nur Durchschnittswerte anschauen, ohne Ausreißer und Verteilung zu prüfen.',
      'Überladene Diagramme mit zu vielen Farben.'
    ]
  },

  {
    id: 'general',
    label: 'Sonstiges',
    field: 'Allgemein',
    shortRole: 'Fachexperte',
    keywords: [],
    role: 'erfahrener Experte und Berater mit über 15 Jahren Praxis in genau dem Fachgebiet, um das es in meiner Idee geht',
    expertise: 'Benenne zu Beginn in einem Satz, welche Fachrolle für diese Aufgabe am besten passt, und arbeite dann konsequent aus dieser Perspektive.',
    mission: 'meine Idee zu durchdenken, zu schärfen und in ein konkretes, umsetzbares Ergebnis zu verwandeln',
    aspects: [
      ['Ziel & Erfolgskriterien', 'Was genau will ich erreichen, und woran erkenne ich, dass es gelungen ist?'],
      ['Ausgangslage', 'Rahmenbedingungen, verfügbare Zeit, Mittel und Vorwissen.'],
      ['Lösungswege', 'Zwei bis drei Ansätze mit Vor- und Nachteilen und eine klare Empfehlung.'],
      ['Umsetzung', 'Konkrete Schritte in sinnvoller Reihenfolge.'],
      ['Werkzeuge & Ressourcen', 'Was brauche ich dafür – möglichst kostenlos?'],
      ['Zeitplan', 'Realistische Etappen mit Zeitangaben.'],
      ['Risiken & Stolpersteine', 'Was kann schiefgehen, und wie beuge ich vor?'],
      ['Nächste Schritte', 'Was ich heute noch tun kann.']
    ],
    standards: [
      'Konkrete, umsetzbare Empfehlungen statt allgemeiner Tipps.',
      'Begründete Entscheidungen mit kurzer Abwägung.',
      'Fachlich korrekt; Unsicherheiten werden offen benannt.',
      'Klar strukturiert und leicht zu überfliegen.',
      'Realistisch in Bezug auf Zeit, Geld und Aufwand.'
    ],
    deliverables: [
      'Eine kurze Zusammenfassung, wie du meine Idee verstanden hast',
      'Eine strukturierte Ausarbeitung entlang der Punkte oben',
      'Einen Schritt-für-Schritt-Plan',
      'Eine Liste hilfreicher Ressourcen'
    ],
    clarify: [
      { q: 'Was ist das wichtigste Ziel?' },
      { q: 'Wie viel Zeit und welche Mittel stehen zur Verfügung?' },
      { q: 'Gibt es Vorgaben oder Einschränkungen?' },
      { q: 'Für wen ist das Ergebnis?', skip: 'audience' }
    ],
    pitfalls: [
      'Allgemeine Ratschläge, die auf alles passen.',
      'Zu viele Optionen ohne klare Empfehlung.',
      'Unrealistische Zeit- oder Kostenannahmen.'
    ]
  }
];

/*
 * Fachwissen in einem Satz, wenn ein Bereich nur als Thema mitspielt
 * (z. B. Musik bei einer Webseite zum Musik-Herunterladen).
 */
(function () {
  const TOPIC_EXPERTISE = {
    game: 'Game Design und Spielmechaniken',
    website: 'Webentwicklung',
    app: 'App-Entwicklung',
    software: 'Softwareentwicklung und Automatisierung',
    art3d: '3D-Grafik und Blender',
    image: 'Grafikdesign und Bild-KIs',
    video: 'Video, Schnitt und Content-Erstellung',
    music: 'Musik und Audio (Dateiformate, Metadaten, Wiedergabe)',
    writing: 'Texten und Storytelling',
    business: 'Geschäftsmodelle und Marketing',
    learning: 'Didaktik und Lernmethoden',
    fitness: 'Trainingslehre und Sporternährung',
    data: 'Datenanalyse'
  };
  PG.domains.forEach((d) => { d.topicExpertise = TOPIC_EXPERTISE[d.id] || ''; });
})();

/*
 * Themen und Rahmenbedingungen, die quer zu den Bereichen auftauchen.
 * Wird ein Thema in der Idee erkannt, ergänzt es den Prompt um passendes Fachwissen,
 * Themenpunkte, Standards und Rückfragen. "condition" landet unter "Rahmenbedingungen".
 *
 * patterns: wie bei keywords (Wortanfang, * = mitten im Wort)
 * onlyFor / skipFor: Bereiche, für die das Thema gilt bzw. nicht gilt
 * requires: zusätzliches Muster, das ebenfalls vorkommen muss
 * excludes: Themen, die dieses Thema abschalten
 */
PG.topics = (function () {
  const CODE_DOMAINS = ['website', 'app', 'software', 'game', 'data', 'general'];

  return [
  {
    id: 'local',
    onlyFor: CODE_DOMAINS,
    patterns: [
      'lokal', 'offline', 'localhost', 'nur (?:für )?mich', 'auf meinem (?:pc|rechner|computer|laptop)',
      'n(?:icht|ix|ichts) (?:\\S+ )?(?:veröffentlich|online stell|ins internet)',
      'kein(?:e[nm]?)? (?:hosting|veröffentlichung|domain)'
    ],
    condition: 'Läuft ausschließlich lokal auf meinem PC (z. B. über localhost). Nichts wird veröffentlicht – kein Hosting, keine Domain, kein Deployment.',
    standards: ['Start per Doppelklick (z. B. start.bat) ohne komplizierte Einrichtung; jede nötige Installation wird Schritt für Schritt erklärt.'],
    dropAspects: /^(Veröffentlichung|Monetarisierung)$/,
    dropStandards: /SEO|Lighthouse/,
    localOnly: true
  },
  {
    id: 'free',
    patterns: ['kostenlos', 'gratis', 'umsonst', 'ohne (?:kosten|geld)', 'nichts kosten', 'kein geld'],
    condition: 'Nur kostenlose Werkzeuge, Bibliotheken und Dienste – nichts, wofür ich bezahlen muss.'
  },
  {
    id: 'noAccount',
    onlyFor: CODE_DOMAINS,
    patterns: ['ohne (?:anmeldung|login|account|konto|registrierung)', 'kein(?:e[nm]?)? (?:anmeldung|login|account|konto)'],
    condition: 'Keine Anmeldung und keine Benutzerkonten.'
  },
  {
    id: 'mediaDownload',
    tool: true,
    onlyFor: CODE_DOMAINS,
    patterns: ['download', 'herunter ?(?:zu ?)?lad', 'runter ?(?:zu ?)?lad', 'rippen', '(?:als|in|zu|auf) (?:mp3|mp4|wav|flac)', 'konvertier', 'umwandeln'],
    requires: 'mp3|mp4|wav|flac|musik|song|lied|audio|video|spotify|youtube|soundcloud|playlist|podcast|album|hörbuch',
    expertise: 'Medien-Downloads (z. B. mit yt-dlp)',
    aspects: [
      ['Quelle & Rechtliches', 'Woher kommen die Dateien? Viele Streamingdienste (z. B. Spotify) sind kopiergeschützt und lassen sich nicht direkt speichern. Erkläre ehrlich, was technisch und rechtlich (in Deutschland) möglich ist, und schlag den besten legalen Weg vor.'],
      ['Download-Ablauf', 'Link oder Suche eingeben, Vorschau, Warteschlange, Fortschrittsanzeige, Abbrechen und verständliche Fehlermeldungen.']
    ],
    standards: ['Ein Browser allein kann keine Dateien von fremden Diensten laden und umwandeln – plane dafür ein kleines lokales Backend (z. B. Python oder Node.js mit FFmpeg).'],
    clarify: [{ q: 'Einzelne Songs bzw. Videos oder ganze Playlists und Alben?' }]
  },
  {
    id: 'audioFiles',
    skipFor: ['music'],
    patterns: ['mp3', 'flac', 'wav', 'aac', 'm4a', 'ogg', 'audiodatei', 'musikdatei', 'id3', 'bitrate', 'plattenspieler', 'mp3-?player'],
    expertise: 'Audioformate (MP3, FLAC, WAV), Konvertierung mit FFmpeg und Musik-Metadaten (ID3-Tags)',
    aspects: [
      ['Audioformat & Qualität', 'Format und Bitrate (z. B. MP3 mit 320 kbps), einheitliche Lautstärke und vollständige ID3-Tags (Titel, Interpret, Album, Cover).']
    ]
  },
  {
    id: 'deviceExport',
    patterns: ['usb', 'stick', 'sd-?karte', 'plattenspieler', 'mp3-?player', 'autoradio', 'im auto', 'abspielgerät'],
    aspects: [
      ['Export aufs Abspielgerät', 'Dateinamen, Ordnerstruktur und Format so wählen, dass das Zielgerät sie sicher abspielt (z. B. USB-Stick in FAT32 oder exFAT, keine Sonderzeichen, ein Ordner pro Album bzw. Playlist).']
    ],
    clarify: [{ q: 'Welches Gerät spielt die Dateien ab, und welche Formate liest es?' }]
  },
  {
    id: 'services',
    onlyFor: CODE_DOMAINS,
    patterns: ['spotify', 'youtube', 'soundcloud', 'deezer', 'apple music', 'instagram', 'tiktok', 'twitch', 'discord', 'steam', 'reddit', 'whatsapp', 'telegram', 'google drive', 'google sheets'],
    aspects: [
      ['Externe Dienste', 'Welche offiziellen Schnittstellen gibt es (z. B. Spotify Web API, YouTube Data API), was liefern sie, welche Grenzen und Nutzungsbedingungen gelten – und was geht ohne sie?']
    ]
  },
  {
    id: 'ai',
    tool: true,
    onlyFor: CODE_DOMAINS,
    patterns: [
      'chatbot', 'llm', 'ollama', 'openai', '(?:chatgpt|gpt|claude|gemini)[- ]?api', 'sprachmodell',
      'ki[- ]?(?:funktion|anbindung|integration|assistent|chat|feature)', 'ki (?:soll|antwortet|erkennt|beantwortet|generiert)',
      'eingebaute[nr]? ki', 'mit (?:einer )?eigenen ki'
    ],
    expertise: 'KI-Integration (LLM-APIs, Prompt Engineering, lokale Modelle mit Ollama)',
    aspects: [
      ['KI-Anbindung', 'Welches Modell (lokal z. B. mit Ollama oder per API), Prompt-Design, Kosten, sichere Aufbewahrung von API-Schlüsseln und Umgang mit falschen Antworten.']
    ]
  },
  {
    id: 'accounts',
    onlyFor: CODE_DOMAINS,
    excludes: ['noAccount'],
    patterns: ['login', 'einlogg', 'anmeld(?:ung|en)', 'registrier', 'benutzerkont', 'nutzerkont', 'account'],
    aspects: [
      ['Benutzerkonten & Sicherheit', 'Registrierung, Login, sichere Passwortspeicherung (Hashing), Sessions und Datenschutz – nur so viel, wie wirklich nötig ist.']
    ]
  },
  {
    id: 'payments',
    onlyFor: CODE_DOMAINS.concat('business'),
    patterns: ['bezahl', 'zahlung', 'paypal', 'stripe', 'checkout', 'warenkorb', 'abo(?:nnement)?(?![a-zäöüß])', 'in-?app-?käufe?'],
    aspects: [
      ['Zahlungen', 'Zahlungsanbieter (z. B. Stripe oder PayPal), Testmodus, Sicherheit, Rechnungen und rechtliche Pflichten.']
    ]
  },
  {
    id: 'storage',
    tool: true,
    onlyFor: CODE_DOMAINS,
    patterns: ['abspeichern', 'datenbank', 'verlauf', 'favorit', 'merkliste', 'sammlung', 'bibliothek'],
    aspects: [
      ['Daten speichern', 'Was wird gespeichert, wo (Browser-Speicher, Datei, SQLite oder Cloud), und wie bleibt es bei Updates erhalten?']
    ]
  },
  {
    id: 'realtime',
    tool: true,
    onlyFor: CODE_DOMAINS,
    patterns: ['multiplayer', 'online (?:spielen|zusammen|gegeneinander)', 'mit freunden', 'echtzeit', 'live-?chat', 'chatten', 'chat(?![a-zäöüß])'],
    aspects: [
      ['Echtzeit & Netzwerk', 'Server-Architektur, WebSockets bzw. Netcode, Synchronisation, Latenz und Schutz vor Missbrauch.']
    ]
  },
  {
    id: 'maps',
    onlyFor: ['website', 'app', 'software', 'general'],
    patterns: ['karten?(?![a-zäöüß])', 'landkarte', 'standort', 'gps', 'google maps', 'openstreetmap', 'umkreis'],
    aspects: [
      ['Karten & Standort', 'Kartenanbieter (z. B. OpenStreetMap mit Leaflet), Standortfreigabe, Datenschutz und Verhalten ohne Internet.']
    ]
  },
  {
    id: 'notifications',
    onlyFor: ['website', 'app', 'software', 'general'],
    patterns: ['erinner', 'wecker', 'benachrichtig', 'notification', 'push'],
    aspects: [
      ['Erinnerungen & Benachrichtigungen', 'Wann und wie benachrichtigt wird (Push, E-Mail, im Browser), welche Berechtigungen nötig sind und wie man es abschaltet.']
    ]
  },
  {
    id: 'uploads',
    tool: true,
    onlyFor: CODE_DOMAINS,
    patterns: ['hochlad', 'upload', 'drag ?(?:and|&|n) ?drop', 'dateien? (?:auswählen|reinziehen|einfügen)'],
    aspects: [
      ['Dateien & Uploads', 'Erlaubte Dateitypen und -größen, Vorschau, Fortschritt, Speicherort und Sicherheit.']
    ]
  }
];
})();
