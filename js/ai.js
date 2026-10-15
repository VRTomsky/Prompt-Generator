/*
 * KI-Prompt-Schreiber: Eine echte KI liest die Idee, versteht sie und liefert eine
 * strukturierte Analyse (Kern, Rolle, Beschreibung, Anforderungen, Rückfragen …).
 * Daraus baut assemble() einen sauber gegliederten Master-Prompt.
 *
 * Drei kostenlose Wege:
 *   cloud   – große Modelle (Gemini, Claude, GPT) über Puter.js, kostenloses Puter-Konto mit Monatskontingent
 *   browser – Qwen 3.5 läuft direkt im Browser über WebGPU (WebLLM), ohne Konto, nichts verlässt den PC
 *   ollama  – lokal installiertes Ollama
 */
window.PG = window.PG || {};

PG.ai = (function () {
  const WEBLLM_URL = 'https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.85/+esm';
  const PUTER_URL = 'https://js.puter.com/v2/';
  const OLLAMA_URL = 'http://localhost:11434';

  const BROWSER_MODELS = {
    large: { f16: 'Qwen3.5-9B-q4f16_1-MLC', f32: 'Qwen3.5-9B-q4f32_1-MLC', label: 'Qwen 3.5 9B', size: 'ca. 6 GB' },
    medium: { f16: 'Qwen3.5-4B-q4f16_1-MLC', f32: 'Qwen3.5-4B-q4f32_1-MLC', label: 'Qwen 3.5 4B', size: 'ca. 3 GB' }
  };
  const CLOUD_MODELS = {
    balanced: { id: 'google/gemini-3.5-flash', label: 'Gemini 3.5 Flash' },
    best: { id: 'anthropic/claude-sonnet-5-5', label: 'Claude Sonnet 5.5' },
    light: { id: 'gpt-5.4-nano', label: 'GPT-5.4 nano' }
  };

  /* ---------- Analyse-Auftrag an die KI ---------- */

  // Feste Feldnamen; gegen Wiederholungsschleifen helfen maxItems und die Wiederholungsstrafe beim Erzeugen.
  // (maxLength bei Texten macht die Grammatik so groß, dass die KI im Browser gar nicht erst startet.)
  const TEXT = () => ({ type: 'string' });
  const LIST = { type: 'array', maxItems: 8, items: TEXT() };
  const SCHEMA = {
    type: 'object',
    properties: {
      ueberlegung: TEXT(),
      kern: TEXT(),
      mittel: TEXT(),
      projekt: TEXT(),
      rolle: TEXT(),
      beschreibung: TEXT(),
      anforderungen: {
        type: 'array',
        maxItems: 18,
        items: { type: 'object', properties: { titel: TEXT(), details: TEXT() }, required: ['titel', 'details'] }
      },
      rahmenbedingungen: LIST,
      loesungsweg: LIST,
      ergebnis: LIST,
      qualitaet: LIST,
      fallstricke: LIST,
      heikel: TEXT(),
      rueckfragen: LIST
    },
    required: ['ueberlegung', 'kern', 'mittel', 'projekt', 'rolle', 'beschreibung', 'anforderungen', 'rahmenbedingungen',
      'loesungsweg', 'ergebnis', 'qualitaet', 'fallstricke', 'heikel', 'rueckfragen']
  };

  const AMOUNT = {
    kompakt: { req: '5 bis 7', list: '2 bis 4', desc: '3 bis 5', det: '1 bis 2' },
    ausfuehrlich: { req: '8 bis 12', list: '3 bis 6', desc: '5 bis 8', det: '1 bis 3' },
    maximal: { req: '12 bis 18', list: '4 bis 8', desc: '7 bis 10', det: '2 bis 4' }
  };

  function systemPrompt(s) {
    const a = AMOUNT[s.detail] || AMOUNT.ausfuehrlich;
    const target = s.target === 'agent'
      ? 'Der Prompt geht an einen Coding-Agenten (z. B. Claude Code oder Cursor), der direkt im Projektordner arbeitet. Richte „loesungsweg“ und „ergebnis“ danach aus.'
      : 'Der Prompt geht an eine Chat-KI wie ChatGPT, Claude oder Gemini.';
    const level = { anfaenger: 'Ich bin Anfänger.', fortgeschritten: 'Ich habe Grundkenntnisse.', profi: 'Ich bin Profi.' }[s.level] || '';
    return `Du bist ein erstklassiger Prompt Engineer und Fachberater. Du bekommst eine grobe, oft diktierte Idee. Verstehe sie wirklich und liefere alle Bausteine für einen sehr detaillierten Master-Prompt, mit dem eine andere KI die Idee umsetzt. ${target} ${level}

Denk so:
- Was will ich am Ende haben oder erreichen? Was ist der Kern – und was nur das Mittel (z. B. eine Webseite als Werkzeug)? Die Rolle richtet sich vor allem nach dem Kern.
- Wer nutzt das Ergebnis, in welcher Situation? Was wünsche ich mir, ohne es zu sagen?
- Was würde eine echte Fachperson sofort ergänzen: Funktionen, Inhalte, Abläufe, Sonderfälle, Lösungswege, Qualitätsmerkmale, Fallstricke?
- Diktierte Texte enthalten Erkennungsfehler und Füllwörter – deute sie sinnvoll.
- Ändere nie das Ziel der Idee und erfinde nichts, was ihr widerspricht.

Antworte ausschließlich mit einem JSON-Objekt mit genau diesen Feldern. Alle Texte auf Deutsch, konkret und auf genau diese Idee bezogen, keine allgemeinen Floskeln:
{
  "ueberlegung": "2 bis 4 Sätze Analyse: Was ist Kern, was Mittel, wer nutzt es, was fehlt noch?",
  "kern": "Der eigentliche Kern der Idee in einem Satz",
  "mittel": "Womit es umgesetzt wird (z. B. Webseite, App, Text, Trainingsplan) – oder leerer Text",
  "projekt": "Ein Satz in Ich-Form: was entstehen soll und wozu",
  "rolle": "2 bis 4 Sätze, beginnt mit 'Du bist': die Fachperson, die die KI spielen soll (nicht ich!) – passend zum Kern, mit konkretem Fachwissen; mehrere Fachgebiete kombinieren, wenn die Idee mehrere berührt",
  "beschreibung": "${a.desc} Sätze in Ich-Form: das Projekt ausführlich erklärt – Ziel, Nutzer, Situation, wie es funktionieren soll",
  "anforderungen": [{"titel": "kurzer Titel", "details": "${a.det} konkrete Sätze"}],
  "rahmenbedingungen": ["Vorgaben und Grenzen aus der Idee"],
  "loesungsweg": ["konkrete Hinweise zum Vorgehen, zu Methoden oder zur Technik"],
  "ergebnis": ["was die KI am Ende konkret liefern soll"],
  "qualitaet": ["woran man ein sehr gutes Ergebnis erkennt"],
  "fallstricke": ["typische Fehler, die die KI vermeiden soll"],
  "heikel": "was technisch, rechtlich oder ethisch heikel ist und wie die KI damit umgehen soll – oder leerer Text",
  "rueckfragen": ["gezielte Rückfragen an mich, die das Ergebnis am meisten verbessern"]
}
"anforderungen" hat ${a.req} Einträge, die anderen Listen je ${a.list} Einträge.

Beispiel nur zur Form (gekürzt, andere Idee: „App, damit meine Oma ihre Tabletten nicht vergisst“):
"rolle": "Du bist Expertin für seniorengerechtes App-Design und Barrierefreiheit und kennst dich mit Medikamentenplänen im Alltag aus. Als erfahrene App-Entwicklerin weißt du, wie man Erinnerungen baut, die auch bei Flugmodus oder Neustart zuverlässig kommen."
"anforderungen": [{"titel": "Große, klare Erinnerung", "details": "Vollbild-Hinweis mit Foto der Tablette, Uhrzeit und einem einzigen großen Knopf „Genommen“."}]`;
  }

  function userPrompt(idea, s) {
    const wishes = [
      ['Technik und Tools', s.tech], ['Zielgruppe', s.audience], ['Stil und Ton', s.tone],
      ['Muss unbedingt rein', s.must], ['Auf keinen Fall', s.avoid]
    ].filter(([, v]) => v && v.trim()).map(([k, v]) => `- ${k}: ${v.trim()}`);
    return `Meine Idee${s.dictated ? ' (diktiert)' : ''}:\n"""\n${idea}\n"""`
      + (wishes.length ? `\n\nMeine Vorgaben, die unbedingt berücksichtigt werden müssen:\n${wishes.join('\n')}` : '');
  }

  /* ---------- Antwort lesen ---------- */

  function stripThink(raw) {
    let t = raw.replace(/<think>[\s\S]*?<\/think>/g, '');
    const open = t.indexOf('<think>');
    if (open !== -1) t = t.slice(0, open);
    const close = t.indexOf('</think>');
    if (close !== -1) t = t.slice(close + 8);
    return t;
  }

  // Offene Texte, Listen und Objekte schließen, damit auch eine abgeschnittene Antwort lesbar bleibt
  function closeOpen(text) {
    const stack = [];
    let inString = false;
    let escaped = false;
    for (const ch of text) {
      if (inString) {
        if (escaped) escaped = false;
        else if (ch === '\\') escaped = true;
        else if (ch === '"') inString = false;
      } else if (ch === '"') inString = true;
      else if (ch === '{' || ch === '[') stack.push(ch === '{' ? '}' : ']');
      else if (ch === '}' || ch === ']') stack.pop();
    }
    let out = text + (inString ? '"' : '');
    out = out.replace(/[\s,:]+$/, '');
    return out + stack.reverse().join('');
  }

  function parseJson(text) {
    try { return JSON.parse(text); } catch (_) { /* reparieren */ }
    try { return JSON.parse(text.replace(/,\s*([}\]])/g, '$1')); } catch (_) { /* weiter kürzen */ }
    // Von hinten bis zum letzten vollständigen Eintrag kürzen und schließen
    let cut = text.length;
    for (let i = 0; i < 40 && cut > 0; i++) {
      try { return JSON.parse(closeOpen(text.slice(0, cut))); } catch (_) { /* weiter */ }
      cut = text.lastIndexOf(',', cut - 1);
    }
    return null;
  }

  function parseAnalysis(raw) {
    let t = stripThink(raw).trim();
    const start = t.indexOf('{');
    if (start === -1) throw new Error('Die KI hat keine verwertbare Antwort geliefert. Versuch es bitte nochmal.');
    t = t.slice(start).replace(/\s+$/, '');
    // Vollständige Antwort (evtl. in ```json … ``` verpackt) zuerst, sonst reparieren
    const end = t.lastIndexOf('}');
    const data = (end > 0 && parseJson(t.slice(0, end + 1))) || parseJson(t.replace(/`+\s*$/, ''));
    if (!data) throw new Error('Die KI hat keine verwertbare Antwort geliefert. Versuch es bitte nochmal.');
    const str = (v) => (typeof v === 'string' ? v.trim() : Array.isArray(v) ? v.join(' ').trim() : '');
    const list = (v) => (Array.isArray(v) ? v : typeof v === 'string' && v.trim() ? [v] : [])
      .map((x) => (typeof x === 'string' ? x : x && (x.text || x.titel || JSON.stringify(x))))
      .map((x) => String(x || '').trim()).filter(Boolean);
    const reqs = (Array.isArray(data.anforderungen) ? data.anforderungen : []).map((r) => (typeof r === 'string'
      ? { titel: '', details: r.trim() }
      : { titel: str(r && r.titel), details: str(r && (r.details || r.beschreibung)) })).filter((r) => r.titel || r.details);
    const out = {
      kern: str(data.kern), mittel: str(data.mittel), projekt: str(data.projekt), rolle: str(data.rolle),
      beschreibung: str(data.beschreibung), anforderungen: reqs,
      rahmenbedingungen: list(data.rahmenbedingungen), loesungsweg: list(data.loesungsweg || data.losungsweg),
      ergebnis: list(data.ergebnis), qualitaet: list(data.qualitaet), fallstricke: list(data.fallstricke),
      heikel: str(data.heikel), rueckfragen: list(data.rueckfragen)
    };
    if (!out.rolle || !out.anforderungen.length) throw new Error('Die Antwort der KI war unvollständig. Versuch es bitte nochmal.');
    if (!/^du bist/i.test(out.rolle)) out.rolle = 'Du bist ' + out.rolle.charAt(0).toLowerCase() + out.rolle.slice(1);
    if (/^(leer|keine?s?|nichts|-|n\/a)\.?$/i.test(out.heikel)) out.heikel = '';
    return out;
  }

  // Zwischenstand für die Live-Anzeige ("Kern erkannt", "Rolle", Anzahl Anforderungen)
  function peek(raw) {
    const t = stripThink(raw);
    const field = (name) => {
      const m = t.match(new RegExp(`"${name}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)`));
      return m ? m[1].replace(/\\n/g, ' ').replace(/\\"/g, '"') : '';
    };
    return {
      kern: field('kern'),
      rolle: field('rolle'),
      anforderungen: (t.match(/"titel"\s*:/g) || []).length,
      fertig: /"rueckfragen"\s*:/.test(t)
    };
  }

  /* ---------- Master-Prompt zusammenbauen ---------- */

  const ANSWER_LANG = {
    de: 'Antworte auf Deutsch. Gängige englische Fachbegriffe darfst du verwenden.',
    en: 'Antworte auf Englisch, auch wenn mein Prompt auf Deutsch ist.'
  };
  const LEVEL_RULE = {
    anfaenger: 'Ich bin Anfänger. Erkläre Fachbegriffe beim ersten Auftreten in einem Satz, gib mir Schritt-für-Schritt-Anleitungen und sag genau, wo ich was eintragen, anklicken oder speichern muss.',
    fortgeschritten: 'Ich habe Grundkenntnisse. Erkläre nur, was nicht offensichtlich ist, und begründe wichtige Entscheidungen kurz.',
    profi: 'Ich bin erfahren. Lass Grundlagen weg, geh direkt in die Tiefe und diskutiere Vor- und Nachteile auf Expertenniveau.'
  };
  const CODE_HINT = /webseite|website|homepage|web-?app|app(?![a-zäöüß])|programm|software|tool|bot|skript|script|spiel|game|code|plugin|extension|erweiterung|mod(?![a-zäöüß])|datenbank|server|api(?![a-zäöüß])/i;

  const bullets = (items) => items.map((i) => `- ${i}`).join('\n');
  const numbered = (items) => items.map((i, n) => `${n + 1}. ${i}`).join('\n');
  const dot = (s) => (/[.!?…:]$/.test(s) ? s : s + '.');

  function assemble(a, idea, s) {
    const agent = s.target === 'agent';
    const code = agent || CODE_HINT.test(`${a.mittel} ${a.projekt} ${a.kern}`);
    const sections = [];
    const add = (tag, title, body) => { if (body && body.trim()) sections.push({ tag, title, body: body.trim() }); };

    add('rolle', 'Deine Rolle', a.rolle);

    const projekt = [a.projekt, a.beschreibung].filter(Boolean).join('\n\n');
    const quote = s.format === 'xml' ? `<urspruengliche_idee>\n${idea}\n</urspruengliche_idee>` : `"""\n${idea}\n"""`;
    add('projekt', 'Mein Projekt', `${projekt}\n\nMeine ursprüngliche Idee${s.dictated ? ' (diktiert – einzelne Wörter können falsch erkannt sein)' : ''}:\n\n${quote}`);

    add('anforderungen', 'Was das Ergebnis können muss',
      numbered(a.anforderungen.map((r) => (r.titel ? `**${r.titel.replace(/[.:]$/, '')}:** ${r.details}` : r.details))));

    const frame = a.rahmenbedingungen.slice();
    if (s.tech && s.tech.trim()) frame.push(`Technik und Tools: ${s.tech.trim()}`);
    if (s.audience && s.audience.trim()) frame.push(`Zielgruppe: ${s.audience.trim()}`);
    if (s.tone && s.tone.trim()) frame.push(`Stil und Ton: ${s.tone.trim()}`);
    add('rahmen', 'Rahmenbedingungen', bullets(frame));

    add('loesungsweg', 'Lösungsweg und Hinweise', bullets(a.loesungsweg));

    const steps = ['Fasse mein Projekt zuerst in 3–5 Sätzen zusammen (Ziel, Kern, wichtigste Anforderungen), damit wir sicher dasselbe meinen.'];
    if (agent) {
      steps.push('Verschaffe dir einen Überblick über den Projektordner. Ist er leer, lege eine saubere Grundstruktur an.');
      if (s.clarify) steps.push('Stelle mir deine Rückfragen (siehe unten) und warte auf meine Antworten.');
      steps.push('Schreibe einen kurzen Umsetzungsplan und arbeite ihn selbstständig ab: Dateien anlegen, Befehle ausführen, nach jedem Schritt testen und Fehler selbst beheben.');
    } else {
      if (s.clarify) steps.push('Stelle mir deine Rückfragen (siehe unten) und warte auf meine Antworten.');
      if (s.plan) steps.push('Erstelle einen klaren Plan mit nummerierten Schritten, bevor du ins Detail gehst.');
      steps.push('Setze das Projekt in sinnvollen Etappen um. Jede Etappe endet mit etwas, das ich ausprobieren oder prüfen kann.');
    }
    if (s.selfcheck) steps.push('Prüfe dein Ergebnis am Ende gegen „Was das Ergebnis können muss“ und die Qualitätskriterien und schließe Lücken.');
    steps.push(agent ? 'Fasse zum Schluss zusammen: was gebaut wurde, wie man es startet und was noch offen ist.' : 'Schließe mit dem konkreten nächsten Schritt, den ich sofort machen kann.');
    add('vorgehen', 'Vorgehen', numbered(steps));

    const deliver = a.ergebnis.slice();
    deliver.push('Gliedere die Antwort mit klaren Überschriften, nummerierten Schritten und kurzen Absätzen.');
    if (code) deliver.push('Code steht vollständig in Codeblöcken mit Sprachangabe; über jedem Block steht der Dateipfad.');
    if (s.detail === 'kompakt') deliver.push('Halte dich kurz: so ausführlich wie nötig, so knapp wie möglich.');
    add('ergebnis', 'Was du mir lieferst', bullets(deliver));

    add('qualitaet', 'Qualitätskriterien', bullets(a.qualitaet));
    if (s.detail !== 'kompakt') add('fehler', 'Typische Fehler, die du vermeiden sollst', bullets(a.fallstricke));

    const rules = [ANSWER_LANG[s.answerLang] || ANSWER_LANG.de, LEVEL_RULE[s.level] || LEVEL_RULE.fortgeschritten];
    if (s.dictated) rules.push('Meine Idee ist diktiert. Interpretiere offensichtlich falsch erkannte Wörter sinnvoll, statt sie wörtlich zu nehmen.');
    rules.push(s.clarify
      ? 'Wenn nach meinen Antworten noch etwas offen ist, triff eine sinnvolle Annahme und markiere sie mit [Annahme].'
      : 'Wenn Informationen fehlen, triff eine sinnvolle Annahme, markiere sie mit [Annahme] und arbeite weiter, statt nachzufragen.');
    if (code) rules.push('Gib Code immer vollständig aus – keine Platzhalter wie „// … Rest bleibt gleich“ und keine ausgelassenen Teile.');
    if (a.heikel) rules.push(`Sprich offen an: ${dot(a.heikel)} Schlag den besten machbaren und legalen Weg vor.`);
    rules.push('Sei ehrlich: Wenn etwas unrealistisch oder problematisch ist, sag es direkt und schlag eine bessere Alternative vor.');
    rules.push('Bleib nah an meiner Idee: Ergänze sinnvolle Details, aber ändere weder das Ziel noch den Kern.');
    if (s.must && s.must.trim()) rules.push(`Muss unbedingt enthalten sein: ${dot(s.must.trim())}`);
    if (s.avoid && s.avoid.trim()) rules.push(`Auf keinen Fall: ${dot(s.avoid.trim())}`);
    add('regeln', 'Regeln', bullets(rules));

    if (s.clarify && a.rueckfragen.length) {
      add('rueckfragen', 'Bevor du startest',
        'Stelle mir zuerst 3–5 kurze, gezielte Rückfragen. Gute Kandidaten:\n' + bullets(a.rueckfragen)
        + '\n\nWarte auf meine Antworten. Wenn ich „Leg los“ schreibe, triff die offenen Entscheidungen selbst.');
    }
    add('start', 'Los geht’s', s.clarify
      ? 'Beginne jetzt mit deiner Zusammenfassung und deinen Rückfragen.'
      : agent ? 'Beginne jetzt mit der Zusammenfassung und dem Blick in den Projektordner.' : 'Beginne jetzt mit deiner Zusammenfassung und dann direkt mit der Umsetzung.');

    if (s.format === 'xml') return sections.map((x) => `<${x.tag}>\n${x.body}\n</${x.tag}>`).join('\n\n');
    return sections.map((x) => `# ${x.title}\n\n${x.body}`).join('\n\n');
  }

  /* ---------- Hilfen ---------- */

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing && existing.dataset.loaded) return resolve();
      const el = existing || document.createElement('script');
      el.addEventListener('load', () => { el.dataset.loaded = '1'; resolve(); }, { once: true });
      el.addEventListener('error', () => reject(new Error('Die Cloud-KI konnte nicht geladen werden. Prüf deine Internetverbindung.')), { once: true });
      if (!existing) { el.src = src; document.head.appendChild(el); }
    });
  }

  async function webgpuInfo() {
    try {
      if (!navigator.gpu) return null;
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) return null;
      return { f16: adapter.features.has('shader-f16') };
    } catch (_) {
      return null;
    }
  }

  function fail(message, code) {
    const err = new Error(message);
    err.code = code;
    return err;
  }

  /* ---------- Weg 1: Cloud-KI über Puter ---------- */

  async function ensurePuter() {
    if (!window.puter) await loadScript(PUTER_URL);
    return window.puter;
  }

  async function puterSignedIn() {
    try {
      const puter = await ensurePuter();
      return !!(puter.auth && puter.auth.isSignedIn());
    } catch (_) {
      return false;
    }
  }

  async function puterSignIn() {
    const puter = await ensurePuter();
    await puter.auth.signIn();
    return puter.auth.isSignedIn();
  }

  async function runCloud(messages, opts) {
    const puter = await ensurePuter();
    if (!puter.auth.isSignedIn()) throw fail('Für die Cloud-KI musst du dich einmal kostenlos bei Puter anmelden.', 'signin');
    const preferred = CLOUD_MODELS[opts.cloudModel] || CLOUD_MODELS.balanced;
    const tryModel = async (model) => {
      opts.onStatus({ phase: 'think', label: model.label });
      const response = await puter.ai.chat(messages, false, { model: model.id, stream: true, signal: opts.signal, temperature: 0.5 });
      for await (const part of response) {
        if (part && part.type === 'error') throw new Error(part.message || 'Die Cloud-KI hat einen Fehler gemeldet.');
        if (part && typeof part.text === 'string' && (!part.type || part.type === 'text')) opts.onToken(part.text);
      }
      return model.label;
    };
    try {
      return await tryModel(preferred);
    } catch (err) {
      if (opts.signal.aborted || opts.received() || preferred === CLOUD_MODELS.light) throw err;
      // Modell gerade nicht verfügbar oder Kontingent dafür aufgebraucht: kleineres Modell versuchen
      return tryModel(CLOUD_MODELS.light);
    }
  }

  /* ---------- Weg 2: KI im Browser (WebLLM) ---------- */

  let webllm = null;
  let browserEngine = null;
  let browserModelId = '';

  async function ensureBrowserEngine(size, onStatus) {
    const gpu = await webgpuInfo();
    if (!gpu) throw fail('Dein Browser oder deine Grafikkarte unterstützt kein WebGPU. Nimm stattdessen die Cloud-KI.', 'nogpu');
    const model = BROWSER_MODELS[size] || BROWSER_MODELS.large;
    const id = gpu.f16 ? model.f16 : model.f32;
    if (browserEngine && browserModelId === id) return model.label;
    onStatus({ phase: 'load', progress: 0, label: model.label, size: model.size });
    if (!webllm) webllm = await import(WEBLLM_URL);
    if (browserEngine) { try { await browserEngine.unload(); } catch (_) { /* egal */ } }
    browserEngine = null;
    browserModelId = '';
    const worker = new Worker('js/llm-worker.js', { type: 'module' });
    browserEngine = await webllm.CreateWebWorkerMLCEngine(worker, id, {
      initProgressCallback: (r) => onStatus({ phase: 'load', progress: r.progress || 0, label: model.label, size: model.size })
    }, { context_window_size: 8192 });
    browserModelId = id;
    return model.label;
  }

  async function runBrowser(messages, opts) {
    const label = await ensureBrowserEngine(opts.size, opts.onStatus);
    opts.onStatus({ phase: 'think', label });
    const stop = () => { try { browserEngine.interruptGenerate(); } catch (_) { /* egal */ } };
    opts.signal.addEventListener('abort', stop, { once: true });
    const stream = await browserEngine.chat.completions.create({
      messages, stream: true, temperature: 0.5, top_p: 0.9, max_tokens: 5000, frequency_penalty: 0.2,
      response_format: { type: 'json_object', schema: JSON.stringify(SCHEMA) },
      extra_body: { enable_thinking: false }
    });
    for await (const chunk of stream) {
      const delta = chunk.choices && chunk.choices[0] && chunk.choices[0].delta && chunk.choices[0].delta.content;
      if (delta) opts.onToken(delta);
    }
    if (opts.userAborted()) throw new DOMException('Abgebrochen', 'AbortError');
    return label;
  }

  /* ---------- Weg 3: Ollama ---------- */

  async function ollamaModels() {
    try {
      const res = await fetch(OLLAMA_URL + '/api/tags', { signal: AbortSignal.timeout(2500) });
      if (!res.ok) return null;
      const data = await res.json();
      return (data.models || []).map((m) => ({ name: m.name, size: m.size || 0 }));
    } catch (_) {
      return null;
    }
  }

  async function runOllama(messages, opts) {
    const models = await ollamaModels();
    if (!models) throw fail('Ollama ist nicht erreichbar. Starte Ollama und versuch es erneut.', 'ollama');
    if (!models.length) throw fail('In Ollama ist noch kein Modell installiert, z. B. mit „ollama pull qwen3:8b“.', 'ollama');
    // Das größte installierte Modell ist meist das beste
    const pick = models.slice().sort((a, b) => b.size - a.size)[0];
    const label = pick.name + ' (Ollama)';
    opts.onStatus({ phase: 'think', label });
    const res = await fetch(OLLAMA_URL + '/api/chat', {
      method: 'POST',
      signal: opts.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: pick.name, messages, stream: true, format: SCHEMA, options: { num_ctx: 8192, temperature: 0.5, repeat_penalty: 1.15 } })
    });
    if (!res.ok || !res.body) throw new Error('Ollama hat die Anfrage abgelehnt (' + res.status + ').');
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let nl;
      while ((nl = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (!line) continue;
        const data = JSON.parse(line);
        if (data.error) throw new Error(data.error);
        if (data.message && data.message.content) opts.onToken(data.message.content);
      }
    }
    return label;
  }

  /* ---------- Gemeinsamer Ablauf ---------- */

  /**
   * Lässt die gewählte KI die Idee analysieren und baut den Master-Prompt.
   * opts: { engine, size, cloudModel, signal, onStatus({phase, progress, label, size}), onPeek({kern, rolle, anforderungen}) }
   * Rückgabe: { text, model, analysis }
   */
  let lastRaw = ''; // letzte Rohantwort, hilft bei der Fehlersuche (PG.ai.lastRaw())

  async function generate(idea, settings, opts) {
    const messages = [
      { role: 'system', content: systemPrompt(settings) },
      { role: 'user', content: userPrompt(idea, settings) }
    ];
    let raw = '';
    let lastPeek = 0;
    let label = '';
    // Eigener Abbruch-Schalter: Nutzer-Stopp ODER weicher Stopp, wenn die KI nur noch Leerraum erzeugt
    const inner = new AbortController();
    let trimmed = false;
    opts.signal.addEventListener('abort', () => inner.abort(), { once: true });
    const onToken = (t) => {
      raw += t;
      lastRaw = raw;
      if (!trimmed && /\s{80,}$/.test(raw)) { trimmed = true; inner.abort(); }
      const now = Date.now();
      if (now - lastPeek > 150) { lastPeek = now; opts.onPeek(peek(raw)); }
    };
    const common = Object.assign({}, opts, {
      onToken,
      signal: inner.signal,
      userAborted: () => opts.signal.aborted,
      received: () => raw.length > 0,
      onStatus: (x) => { if (x.label) label = x.label; opts.onStatus(x); }
    });
    let model;
    try {
      if (opts.engine === 'cloud') model = await runCloud(messages, common);
      else if (opts.engine === 'browser') model = await runBrowser(messages, common);
      else if (opts.engine === 'ollama') model = await runOllama(messages, common);
      else throw new Error('Unbekannte KI: ' + opts.engine);
    } catch (err) {
      if (!trimmed || opts.signal.aborted) throw err;
      model = label;
    }
    opts.onPeek(peek(raw));
    lastRaw = raw;
    const analysis = parseAnalysis(raw);
    return { text: assemble(analysis, idea, settings), model, analysis };
  }

  return {
    generate, assemble, parseAnalysis, lastRaw: () => lastRaw, systemPrompt, userPrompt, SCHEMA,
    webgpuInfo, ollamaModels, puterSignedIn, puterSignIn, ensurePuter,
    BROWSER_MODELS, CLOUD_MODELS
  };
})();
