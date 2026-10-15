/*
 * Prompt-Engine: analysiert die Idee und baut daraus den Master-Prompt.
 * Läuft komplett im Browser, ohne Server und ohne API-Schlüssel.
 */
window.PG = window.PG || {};

PG.engine = (function () {
  const DOMAINS = PG.domains;
  const LETTER = 'a-zäöüß0-9';
  const byId = (id) => DOMAINS.find((d) => d.id === id) || DOMAINS[DOMAINS.length - 1];

  // Muster am Wortanfang; "*" am Anfang erlaubt Treffer mitten im Wort.
  function compile(pattern) {
    const inside = pattern[0] === '*';
    const src = inside ? pattern.slice(1) : pattern;
    return new RegExp((inside ? '' : `(?<![${LETTER}])`) + `(?:${src})`, 'i');
  }
  // Muster als ganzes Wort (für Technik, Plattformen, Marken).
  const word = (src) => new RegExp(`(?<![${LETTER}])(?:${src})(?![${LETTER}])`, 'i');

  DOMAINS.forEach((d) => { d._kw = d.keywords.map(([p, w]) => [compile(p), w]); });

  const TECH = [
    ['unity', 'Unity (C#)'], ['unreal(?: engine)?|ue5', 'Unreal Engine'], ['godot', 'Godot'],
    ['roblox(?: studio)?', 'Roblox Studio (Luau)'], ['game ?maker', 'GameMaker'],
    ['blender', 'Blender'], ['maya', 'Maya'], ['zbrush', 'ZBrush'], ['substance(?: painter)?', 'Substance Painter'],
    ['react native', 'React Native'], ['react', 'React'], ['next\\.?js', 'Next.js'], ['vue(?:\\.?js)?', 'Vue'],
    ['svelte', 'Svelte'], ['angular', 'Angular'], ['tailwind(?: ?css)?', 'Tailwind CSS'], ['three\\.?js', 'three.js'],
    ['html5?', 'HTML'], ['css3?', 'CSS'], ['javascript', 'JavaScript'], ['typescript', 'TypeScript'],
    ['php', 'PHP'], ['wordpress', 'WordPress'], ['shopify', 'Shopify'], ['wix', 'Wix'],
    ['node(?:\\.?js)?', 'Node.js'], ['python', 'Python'], ['java', 'Java'], ['c#|c sharp', 'C#'], ['c\\+\\+', 'C++'],
    ['rust', 'Rust'], ['golang', 'Go'], ['lua', 'Lua'], ['kotlin', 'Kotlin'], ['swift(?:ui)?', 'Swift'], ['flutter', 'Flutter'],
    ['supabase', 'Supabase'], ['firebase', 'Firebase'], ['sql|mysql|postgres(?:ql)?|sqlite', 'SQL'], ['mongo(?:db)?', 'MongoDB'],
    ['excel', 'Excel'], ['google sheets', 'Google Sheets'], ['power ?bi', 'Power BI'], ['pandas', 'pandas'],
    ['midjourney', 'Midjourney'], ['stable diffusion|sdxl', 'Stable Diffusion'], ['dall[- ]?e', 'DALL·E'], ['flux', 'Flux'],
    ['photoshop', 'Photoshop'], ['canva', 'Canva'], ['figma', 'Figma'], ['procreate', 'Procreate'],
    ['suno', 'Suno'], ['udio', 'Udio'], ['fl ?studio', 'FL Studio'], ['ableton(?: live)?', 'Ableton Live'],
    ['capcut', 'CapCut'], ['premiere(?: pro)?', 'Premiere Pro'], ['davinci(?: resolve)?', 'DaVinci Resolve'],
    ['after effects', 'After Effects'], ['obs', 'OBS'],
    ['discord', 'Discord'], ['notion', 'Notion'], ['arduino', 'Arduino'], ['raspberry(?: pi)?', 'Raspberry Pi'],
    ['ollama', 'Ollama']
  ].map(([p, label]) => [word(p), label]);

  const PLATFORMS = [
    ['pc|computer|windows', 'PC'], ['mac(?:book|os)?', 'Mac'], ['linux', 'Linux'],
    ['android', 'Android'], ['ios|iphone|ipad', 'iOS'], ['handy|smartphone|mobil(?:e|geräte?)?', 'Smartphone'],
    ['playstation|ps[45]', 'PlayStation'], ['xbox', 'Xbox'], ['nintendo(?: switch)?', 'Nintendo Switch'],
    ['browser|im web|webbrowser', 'Browser'], ['vr|virtual reality|meta quest', 'VR']
  ].map(([p, label]) => [word(p), label]);

  // Spiele und Marken, die als Bezug erkannt werden. ctx = nur mit "wie …", "im Stil von …" usw.
  const REFS = [
    ['gta|grand theft auto', 'GTA', '\\s?(6|vi|5|v|4|iv|san andreas|vice city)?'], ['minecraft', 'Minecraft'],
    ['fortnite', 'Fortnite'], ['roblox', 'Roblox'], ['zelda', 'Zelda'], ['(?:super )?mario', 'Super Mario'],
    ['pok[eé]mon', 'Pokémon'], ['call of duty', 'Call of Duty'], ['fifa|ea (?:sports )?fc', 'EA Sports FC'],
    ['elden ring', 'Elden Ring'], ['dark souls', 'Dark Souls'], ['red dead(?: redemption)?', 'Red Dead Redemption'],
    ['(?:the )?witcher', 'The Witcher'], ['cyberpunk(?: 2077)?', 'Cyberpunk 2077'], ['valorant', 'Valorant'],
    ['counter[- ]?strike|cs ?2', 'Counter-Strike'], ['among us', 'Among Us'], ['stardew valley', 'Stardew Valley'],
    ['hollow knight', 'Hollow Knight'], ['rocket league', 'Rocket League'], ['clash royale', 'Clash Royale'],
    ['brawl stars', 'Brawl Stars'], ['subway surfers', 'Subway Surfers'], ['geometry dash', 'Geometry Dash'],
    ['tetris', 'Tetris'], ['flappy bird', 'Flappy Bird'], ['the sims|die sims', 'Die Sims'], ['terraria', 'Terraria'],
    ['netflix', 'Netflix', null, true], ['spotify', 'Spotify', null, true], ['airbnb', 'Airbnb', null, true],
    ['uber', 'Uber', null, true], ['amazon', 'Amazon', null, true], ['instagram', 'Instagram', null, true],
    ['tiktok', 'TikTok', null, true], ['whatsapp', 'WhatsApp', null, true], ['duolingo', 'Duolingo', null, true],
    ['youtube', 'YouTube', null, true], ['discord', 'Discord', null, true], ['notion', 'Notion', null, true],
    ['apple', 'Apple', null, true], ['google', 'Google', null, true]
  ].map(([p, label, suffix, ctx]) => ({
    re: ctx
      ? new RegExp(`(?:wie|ähnlich wie|im stil von|à la|a la|so wie|nach dem vorbild von|angelehnt an|inspiriert von|klon von)\\s+(?:${p})(?![${LETTER}])`, 'i')
      : new RegExp(`(?<![${LETTER}])(?:${p})${suffix ? `(?:${suffix})` : ''}(?![${LETTER}])`, 'i'),
    label, suffix: !!suffix
  }));

  const AUDIENCE = /(?:für|an)\s+(kinder|kindern|jugendliche|jugendlichen|teenager|schüler(?:innen)?|studenten|studierende|anfänger(?:innen)?|einsteiger(?:innen)?|profis|senioren|ältere menschen|familien|gamer(?:innen)?|eltern|lehrer(?:innen)?|kunden|unternehmen|firmen|selbstständige|meine (?:freunde|klasse|familie|follower|community|zuschauer)|meinen (?:verein|kanal|freundeskreis)|mein team)(?![a-zäöüß])/i;
  const AUDIENCE_FIELD = /zielgruppe(?:\s+(?:sind|ist|wären|soll(?:en)? sein))?:?\s+([^.,;\n]{3,50})/i;

  const SCOPE_LARGE = word('riesig(?:e[snmr]?)?|aaa|mmo(?:rpg)?|open[- ]?world|komplette[snmr]? (?:spiel|game|app|plattform)|wie gta|wie red dead|wie cyberpunk|wie elden ring');
  const SCOPE_SMALL = word('(?:klein|einfach|simpel|kurz)(?:e[snmr]?)? (?:spiel|game|app|tool|projekt|programm|webseite|seite|skript)|mini-?(?:spiel|game|projekt)');

  // Riesige Vorbilder: dann immer mit kleinem erstem Meilenstein planen
  const BIG_GAMES = /^(GTA|Red Dead|Cyberpunk|Elden Ring|The Witcher|Call of Duty|Minecraft|Fortnite)/;

  const DETAIL = {
    kompakt: { label: 'Kompakt', aspects: 5, standards: 4, deliver: 3, pitfalls: 0 },
    ausfuehrlich: { label: 'Ausführlich', aspects: 8, standards: 6, deliver: 5, pitfalls: 3 },
    maximal: { label: 'Maximal', aspects: 99, standards: 99, deliver: 99, pitfalls: 99 }
  };

  const LEVEL = {
    anfaenger: { label: 'Anfänger', rule: 'Ich bin Anfänger. Erkläre Fachbegriffe beim ersten Auftreten in einem Satz, gib mir Schritt-für-Schritt-Anleitungen und sag genau, wo ich was eintragen, anklicken oder speichern muss.' },
    fortgeschritten: { label: 'Fortgeschritten', rule: 'Ich habe Grundkenntnisse. Erkläre nur, was nicht offensichtlich ist, und begründe wichtige Entscheidungen kurz.' },
    profi: { label: 'Profi', rule: 'Ich bin erfahren. Lass Grundlagen weg, geh direkt in die Tiefe und diskutiere Vor- und Nachteile auf Expertenniveau.' }
  };

  const ANSWER_LANG = {
    de: 'Antworte auf Deutsch. Gängige englische Fachbegriffe darfst du verwenden.',
    en: 'Antworte auf Englisch, auch wenn meine Idee auf Deutsch formuliert ist.'
  };

  /* ---------- Analyse ---------- */

  function cleanIdea(text) {
    let t = String(text || '').replace(/\r/g, '');
    // Füllwörter aus gesprochener Sprache entfernen ("äh", "ähm", "öhm", "hmm")
    t = t.replace(/(^|[\s,.;!?])(?:ä+h+m*|ä+m+|ö+h*m+|e+h+m+|h+m+)(?=[\s,.;!?]|$),?/gi, '$1');
    t = t.split('\n').map((line) => line.replace(/[ \t]{2,}/g, ' ').replace(/ +([,.!?;:])/g, '$1').replace(/,\s*,/g, ',').trim()).join('\n');
    t = t.replace(/\n{3,}/g, '\n\n').trim();
    t = t.replace(/^[,.;:\s]+/, '').replace(/[,;:]\s*$/, '');
    return t ? t.charAt(0).toUpperCase() + t.slice(1) : '';
  }

  function detect(text) {
    const t = String(text || '').toLowerCase();
    const scores = DOMAINS.filter((d) => d.id !== 'general').map((d) => {
      let score = 0;
      d._kw.forEach(([re, w]) => { if (re.test(t)) score += w; });
      return { domain: d, score };
    });
    scores.sort((a, b) => b.score - a.score);
    const top = scores[0];
    if (!top || top.score < 2) return { primary: byId('general'), secondary: null, score: 0 };
    const second = scores[1];
    const secondary = second && second.score >= 3 && second.score >= top.score * 0.5 ? second.domain : null;
    return { primary: top.domain, secondary, score: top.score };
  }

  function uniq(list) { return [...new Set(list)]; }

  function extract(idea) {
    const tech = uniq(TECH.filter(([re]) => re.test(idea)).map(([, l]) => l));
    const platforms = uniq(PLATFORMS.filter(([re]) => re.test(idea)).map(([, l]) => l));
    const refs = [];
    REFS.forEach((r) => {
      const m = idea.match(r.re);
      if (!m) return;
      let label = r.label;
      if (r.suffix && m[0]) {
        const tail = m[0].replace(/^(gta|grand theft auto)\s?/i, '').trim();
        if (tail) label += ' ' + (/^(\d+|i?v|vi)$/i.test(tail) ? tail.toUpperCase() : tail.replace(/\b\w/g, (c) => c.toUpperCase()));
      }
      refs.push(label);
    });
    let audience = '';
    const a1 = idea.match(AUDIENCE_FIELD) || idea.match(AUDIENCE);
    if (a1) audience = a1[1].trim().replace(/^./, (c) => c.toUpperCase());
    const scope = SCOPE_LARGE.test(idea) ? 'large' : SCOPE_SMALL.test(idea) ? 'small' : '';
    return { tech, platforms, refs: uniq(refs), audience, scope };
  }

  /* ---------- Bausteine ---------- */

  function joinList(items) {
    if (items.length <= 1) return items.join('');
    return items.slice(0, -1).join(', ') + ' und ' + items[items.length - 1];
  }
  const bullets = (items) => items.map((i) => `- ${i}`).join('\n');
  const numbered = (items) => items.map((i, n) => `${n + 1}. ${i}`).join('\n');
  const ensureDot = (s) => (/[.!?…]$/.test(s) ? s : s + '.');

  function roleText(d, second, facts) {
    const article = /^[a-zäöü]/.test(d.role) ? 'ein ' : '';
    const parts = [`Du bist ${article}${d.role}. ${d.expertise}`];
    if (facts.tech.length) parts.push(`Du bist besonders sicher im Umgang mit ${joinList(facts.tech)}.`);
    if (second) parts.push(`Außerdem bringst du fundiertes Wissen als ${second.shortRole} mit, weil meine Idee auch diesen Bereich berührt.`);
    parts.push('Du arbeitest wie ein erfahrener Mentor: strukturiert, ehrlich und lösungsorientiert.');
    return parts.join(' ');
  }

  function ideaText(idea, d, second, facts, s, xml) {
    const rows = [];
    rows.push(`Bereich: ${d.field}${second ? ` (mit Bezug zu ${second.field})` : ''}`);
    if (d.platforms && facts.platforms.length) rows.push(`Plattform: ${joinList(facts.platforms)}`);
    if (facts.tech.length) rows.push(`Technik & Tools: ${joinList(facts.tech)}`);
    if (facts.refs.length) rows.push(`Bezug / Inspiration: ${joinList(facts.refs)}`);
    if (facts.audience) rows.push(`Zielgruppe: ${facts.audience}`);
    if (s.tone.trim()) rows.push(`Stil & Ton: ${s.tone.trim()}`);
    if (facts.scope === 'large') rows.push('Umfang: groß angelegt – bitte mit einem kleinen ersten Meilenstein starten');
    if (facts.scope === 'small') rows.push('Umfang: bewusst klein und schnell umsetzbar');
    rows.push(`Mein Erfahrungsstand: ${LEVEL[s.level].label}`);

    const block = xml ? `<beschreibung>\n${idea}\n</beschreibung>` : `"""\n${idea}\n"""`;
    return `Ich möchte folgende Idee umsetzen:\n\n${block}\n\nEckdaten:\n${bullets(rows)}`;
  }

  function missionText(d, facts, s, agent) {
    const parts = [`Deine Aufgabe ist es, ${d.mission}.`];
    parts.push(agent
      ? 'Du arbeitest direkt in meinem Projektordner: Lege Dateien selbst an, führe Befehle aus und teste das Ergebnis, bevor du mir Bescheid gibst.'
      : 'Das Ergebnis soll so konkret und vollständig sein, dass ich sofort damit loslegen kann.');
    if (facts.scope === 'large' && d.build) {
      parts.push('Meine Idee ist groß. Definiere zuerst einen realistischen ersten Meilenstein (MVP bzw. Vertical Slice), der schnell funktioniert, und plane die weiteren Ausbaustufen darauf auf.');
    } else if (facts.scope === 'small') {
      parts.push('Halte den Umfang bewusst klein, damit schnell ein fertiges Ergebnis entsteht.');
    }
    if (d.stackHint && !facts.tech.length) parts.push(d.stackHint);
    return parts.join(' ');
  }

  function aspectsText(d, n) {
    return numbered(d.aspects.slice(0, n).map(([title, text]) => `**${title}:** ${text}`));
  }

  function workflow(d, s, agent) {
    if (agent) {
      const steps = [
        'Verschaffe dir zuerst einen Überblick über das bestehende Projekt (Dateien, Abhängigkeiten). Ist der Ordner leer, lege eine saubere Grundstruktur an.',
        'Schreibe einen kurzen Umsetzungsplan und arbeite ihn danach selbstständig ab.',
        'Setze alles in kleinen, überprüfbaren Schritten um und teste nach jedem Schritt (starten, bauen, Tests ausführen).',
        'Behebe auftretende Fehler selbst, bevor du weitermachst.'
      ];
      if (s.selfcheck) steps.push('Prüfe das Ergebnis am Ende gegen die Qualitätsstandards und bessere Lücken nach.');
      steps.push('Fasse zum Schluss zusammen: was gebaut wurde, wie man es startet und was noch offen ist.');
      return steps;
    }
    const steps = ['Analysiere meine Idee und fasse in 2–3 Sätzen zusammen, wie du sie verstanden hast.'];
    if (s.clarify) steps.push('Stelle mir deine Rückfragen (siehe unten) und warte auf meine Antworten.');
    if (s.plan) steps.push('Erstelle einen klaren Plan mit nummerierten Schritten, bevor du ins Detail gehst.');
    steps.push('Arbeite die Punkte aus „Was du abdecken musst“ der Reihe nach ab.');
    if (d.build) steps.push('Liefere die Umsetzung in sinnvollen Etappen. Jede Etappe endet mit etwas, das ich ausprobieren kann.');
    if (s.selfcheck) steps.push('Prüfe dein Ergebnis vor dem Absenden gegen die Qualitätsstandards und schließe Lücken.');
    steps.push('Schließe mit dem konkreten nächsten Schritt, den ich sofort machen kann.');
    return steps;
  }

  function outputList(d, s, n) {
    const out = d.deliverables.slice(0, n.deliver);
    out.push('Gliedere die Antwort mit klaren Überschriften, nummerierten Schritten und kurzen Absätzen.');
    if (d.code) out.push('Code steht in Codeblöcken mit Sprachangabe; über jedem Block steht der Dateipfad.');
    if (s.detail === 'maximal') out.push('Beende jede größere Etappe mit einer kurzen Checkliste zum Abhaken.');
    if (s.detail === 'kompakt') out.push('Halte dich kurz: so ausführlich wie nötig, so knapp wie möglich.');
    return out;
  }

  function rulesList(d, facts, s) {
    const rules = [ANSWER_LANG[s.answerLang], LEVEL[s.level].rule];
    rules.push(s.clarify
      ? 'Wenn nach meinen Antworten noch etwas offen ist, triff eine sinnvolle Annahme und markiere sie mit [Annahme].'
      : 'Wenn Informationen fehlen, triff eine sinnvolle Annahme, markiere sie mit [Annahme] und arbeite weiter, statt nachzufragen.');
    if (d.code) rules.push('Gib Code immer vollständig aus – keine Platzhalter wie „// … Rest bleibt gleich“ und keine ausgelassenen Teile.');
    rules.push('Sei ehrlich: Wenn etwas unrealistisch, zu aufwendig oder problematisch ist, sag es direkt und schlag eine bessere Alternative vor.');
    rules.push('Sei konkret: echte Werte, Beispiele und Zahlen statt allgemeiner Ratschläge. Kein Fülltext, keine Wiederholungen.');
    if (facts.refs.length && d.creative) {
      rules.push(`Bezüge zu ${joinList(facts.refs)} dienen nur als Inspiration für Stil und Mechaniken. Entwickle eigene Namen, Figuren, Orte und Grafiken und übernimm keine geschützten Inhalte.`);
    }
    (d.rules || []).forEach((r) => rules.push(r));
    if (s.must.trim()) rules.push(`Muss unbedingt enthalten sein: ${ensureDot(s.must.trim())}`);
    if (s.avoid.trim()) rules.push(`Auf keinen Fall: ${ensureDot(s.avoid.trim())}`);
    return rules;
  }

  function clarifyText(d, facts) {
    const known = { tech: facts.tech.length > 0, platform: facts.platforms.length > 0, audience: !!facts.audience, refs: facts.refs.length > 0 };
    const qs = d.clarify.filter((c) => !c.skip || !known[c.skip]).map((c) => c.q);
    return 'Stelle mir zuerst 3–5 kurze, gezielte Rückfragen zu den Punkten, die das Ergebnis am stärksten beeinflussen. Gute Kandidaten:\n'
      + bullets(qs)
      + '\n\nWarte auf meine Antworten, bevor du mit der eigentlichen Arbeit beginnst. Wenn ich „Leg los“ schreibe, triff die offenen Entscheidungen selbst.';
  }

  function startText(s, agent) {
    if (s.clarify) return 'Beginne jetzt mit deiner kurzen Zusammenfassung und deinen Rückfragen.';
    if (agent) return 'Beginne jetzt mit der Bestandsaufnahme des Projekts.';
    if (s.plan) return 'Beginne jetzt mit deiner Zusammenfassung und dem Plan.';
    return 'Beginne jetzt direkt mit der Umsetzung.';
  }

  /* ---------- Zusammenbau ---------- */

  function render(sections, format) {
    if (format === 'xml') {
      return sections.map((sec) => `<${sec.tag}>\n${sec.body}\n</${sec.tag}>`).join('\n\n');
    }
    return sections.map((sec) => `# ${sec.title}\n\n${sec.body}`).join('\n\n');
  }

  function build(rawIdea, settings) {
    const s = settings;
    const idea = cleanIdea(rawIdea);
    const det = detect(idea);
    const forced = s.domain && s.domain !== 'auto';
    const d = forced ? byId(s.domain) : det.primary;
    let second = forced
      ? (det.primary.id !== d.id && det.primary.id !== 'general' && det.score >= 3 ? det.primary : null)
      : det.secondary;
    if (second && second.id === d.id) second = null;

    const facts = extract(idea);
    if (!facts.scope && d.id === 'game' && facts.refs.some((r) => BIG_GAMES.test(r))) facts.scope = 'large';
    if (s.tech.trim()) facts.tech = uniq([s.tech.trim(), ...facts.tech]);
    if (s.audience.trim()) facts.audience = s.audience.trim();

    const n = DETAIL[s.detail];
    const agent = s.target === 'agent' && !!d.code;
    const xml = s.format === 'xml';

    const sections = [
      { tag: 'rolle', title: 'Deine Rolle', body: roleText(d, second, facts) },
      { tag: 'idee', title: 'Meine Idee', body: ideaText(idea, d, second, facts, s, xml) },
      { tag: 'auftrag', title: 'Dein Auftrag', body: missionText(d, facts, s, agent) },
      { tag: 'inhalte', title: 'Was du abdecken musst', body: aspectsText(d, n.aspects) },
      { tag: 'qualitaet', title: 'Qualitätsstandards', body: bullets(d.standards.slice(0, n.standards)) },
      { tag: 'vorgehen', title: 'Vorgehen', body: numbered(workflow(d, s, agent)) },
      { tag: 'ausgabe', title: 'Ausgabeformat', body: bullets(outputList(d, s, n)) },
      { tag: 'regeln', title: 'Regeln', body: bullets(rulesList(d, facts, s)) }
    ];
    if (n.pitfalls) {
      sections.push({ tag: 'fehler', title: 'Typische Fehler, die du vermeiden sollst', body: bullets(d.pitfalls.slice(0, n.pitfalls)) });
    }
    if (s.detail === 'maximal') {
      sections.push({
        tag: 'ausblick', title: 'Zum Abschluss',
        body: 'Schließe deine Antwort mit:\n' + bullets([
          'den drei größten Risiken für dieses Vorhaben und wie ich sie vermeide',
          'drei Ideen, wie man das Ergebnis später ausbauen kann',
          'dem kleinsten sinnvollen nächsten Schritt, den ich heute noch machen kann'
        ])
      });
    }
    if (s.clarify) sections.push({ tag: 'rueckfragen', title: 'Bevor du startest', body: clarifyText(d, facts) });
    sections.push({ tag: 'start', title: 'Los geht’s', body: startText(s, agent) });

    const text = render(sections, s.format);
    const words = (text.match(/\S+/g) || []).length;
    return {
      text,
      meta: {
        domain: d, secondary: second, detected: !forced,
        role: d.shortRole, detail: n.label,
        words, chars: text.length, tokens: Math.round(text.length / 3.6)
      }
    };
  }

  return { build, detect, cleanIdea, extract, byId };
})();
