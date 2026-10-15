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

  /*
   * Was soll entstehen? Gesucht wird ein Ding-Wort mit Artikel davor ("eine Website",
   * "ein Open-World-Spiel", "einen Discord Bot"). Das schlägt alle Stichwörter:
   * Bei "eine Website, auf der ich Songs herunterlade" geht es um eine Website, nicht um einen Song.
   * Reihenfolge zählt: speziellere Wörter zuerst ("Trainingsprogramm" vor "Programm").
   */
  const ARTICLES = new Set(['ein', 'eine', 'einen', 'einem', 'einer', 'eines', 'mein', 'meine', 'meinen', 'meinem', 'meiner',
    'unser', 'unsere', 'unseren', 'unserem', 'das', 'die', 'den', 'dem', 'der', 'ne', 'nen', 'son']);
  const ARTIFACTS = [
    ['fitness', /(?:trainings|ernährungs|workout|fitness|lauf)-?(?:plan|programm|routine)$|^workout$/],
    ['learning', /^(?:lernplan|lernzettel|zusammenfassung|referat|karteikarten?|spickzettel)$/],
    ['business', /(?:business|geschäfts|marketing|content|social-media)-?(?:plan|strategie|idee|konzept|modell)$|^(?:startup|start-up|firma|marke|online-business)$/],
    ['data', /(?:tabelle|auswertung|dashboard|statistik|diagramm)$/],
    ['website', /(?:webseite|website|homepage|internetseite|landingpage|landing-page|onlineshop|online-shop|webshop|webapp|web-app|webanwendung|portfolio|blog)$/],
    ['app', /^(?:[a-zäöüß0-9]+-)?app$|^(?:handy|lern|fitness|web|ios|android|smartphone|iphone)app$/],
    ['game', /(?:spiel|game|rpg|shooter|platformer|plattformer|jump'?n'?run)$/, /^(?:beispiel|zuspiel|vorspiel|schauspiel|abspiel|zusammenspiel)$/],
    ['software', /(?:programm|tool|bot|skript|script|software|plugin|extension|addon|add-on|mod|modmenü|mod-menü|scraper|crawler|chatbot|assistent)$/, /(?:angebot|verbot|gebot|aufgebot)$/],
    ['art3d', /^3d-[a-zäöüß-]+$/],
    ['music', /(?:song|lied|beat|track|songtext|album|jingle|soundtrack|podcast|hörspiel|hörbuch|remix)$/, /(?:mitglied|glied)$/],
    ['video', /(?:video|short|reel|clip|film|trailer|vlog|doku|montage)$/],
    ['image', /(?:logo|bild|poster|plakat|flyer|banner|wallpaper|thumbnail|cover|illustration|zeichnung|avatar|sticker|tattoo|grafik|icon|emote|meme)$/, /(?:vorbild|leitbild|weltbild|abbild|sinnbild)$/],
    ['writing', /(?:text|geschichte|story|buch|roman|aufsatz|gedicht|brief|e-mail|email|bewerbung|anschreiben|lebenslauf|rede|artikel|essay|erörterung|newsletter|fanfiction|kapitel)$/, /^(?:kontext|subtext)$/]
  ];
  const CREATE_VERB = /^(?:erstell\w*|bau(?:e|en|st|t)?|programmier\w*|mach(?:e|en|st|t)?|entwickel\w*|entwickl\w*|coden?|codest|gestalt\w*|design\w*|schreib\w*|produzier\w*|hab(?:e|en)?|hätte)[,.]?$/i;

  const tokenOf = (w) => w.toLowerCase().replace(/^[^a-zäöüß0-9]+|[^a-zäöüß0-9]+$/g, '');

  function artifactDomain(token) {
    for (const [id, re, not] of ARTIFACTS) {
      if (re.test(token) && !(not && not.test(token))) return id;
    }
    return null;
  }

  function findArtifact(idea) {
    const sentences = idea.split(/(?<=[.!?\n])\s+/);
    for (let si = 0; si < sentences.length; si++) {
      const words = sentences[si].split(/\s+/).filter(Boolean);
      const tokens = words.map(tokenOf);
      for (let i = 0; i < tokens.length; i++) {
        const domain = artifactDomain(tokens[i]);
        if (!domain) continue;
        let start = -1;
        for (let j = i - 1; j >= Math.max(0, i - 4); j--) {
          if (/[,;:!?]$/.test(words[j])) break;
          if (ARTICLES.has(tokens[j])) { start = j; break; }
        }
        // Am Anfang der Idee geht es auch ohne Artikel ("Logo für meinen Clan")
        if (start === -1 && si === 0 && i <= 1) start = 0;
        if (start === -1) continue;
        return { domain, words, start, noun: i };
      }
    }
    return null;
  }

  // "Worum es geht" in den Worten der Nutzerin bzw. des Nutzers, ohne Füllwörter davor
  function projectPhrase(art) {
    const rest = art.words.slice(art.noun + 1);
    while (rest.length && CREATE_VERB.test(rest[0])) rest.shift();
    let phrase = art.words.slice(art.start, art.noun + 1).concat(rest).join(' ');
    phrase = phrase.replace(/\s+(?:zu\s+)?(?:bauen|erstellen|programmieren|machen|entwickeln|coden|haben|schreiben|designen|gestalten|produzieren)\s*$/i, '');
    phrase = phrase.replace(/[\s.!?,;:]+$/, '');
    phrase = phrase.replace(/([^,])\s+((?:in|mit|auf|bei|über|durch|für)\s+(?:der|dem|denen|welcher|welchem)\s|wo(?:mit)?\s+(?:ich|man|wir)\s)/i, '$1, $2');
    if (phrase.length > 200) phrase = phrase.slice(0, 200).replace(/\s+\S*$/, '') + ' …';
    return phrase.charAt(0).toLowerCase() + phrase.slice(1);
  }

  function keywordScores(text) {
    const t = String(text || '').toLowerCase();
    return DOMAINS.filter((d) => d.id !== 'general').map((d) => {
      let score = 0;
      d._kw.forEach(([re, w]) => { if (re.test(t)) score += w; });
      return { domain: d, score };
    });
  }

  function detect(text) {
    const artifact = findArtifact(String(text || ''));
    const scores = keywordScores(text);
    if (artifact) scores.find((x) => x.domain.id === artifact.domain).score += 10;
    scores.sort((a, b) => b.score - a.score);
    const top = scores[0];
    if (!top || top.score < 4) return { primary: byId('general'), secondary: top && top.score >= 3 ? top.domain : null, score: 0, artifact: null };
    const second = scores[1];
    const secondary = second && second.score >= 3 ? second.domain : null;
    return { primary: top.domain, secondary, score: top.score, artifact };
  }

  function uniq(list) { return [...new Set(list)]; }

  const SERVICES = [
    ['spotify', 'Spotify'], ['youtube(?: music)?', 'YouTube'], ['soundcloud', 'SoundCloud'], ['deezer', 'Deezer'],
    ['apple music', 'Apple Music'], ['instagram', 'Instagram'], ['tiktok', 'TikTok'], ['twitch', 'Twitch'],
    ['discord', 'Discord'], ['steam', 'Steam'], ['reddit', 'Reddit'], ['whatsapp', 'WhatsApp'], ['telegram', 'Telegram'],
    ['google drive', 'Google Drive'], ['google sheets', 'Google Sheets']
  ].map(([p, label]) => [word(p), label]);

  function extract(idea) {
    const tech = uniq(TECH.filter(([re]) => re.test(idea)).map(([, l]) => l));
    const platforms = uniq(PLATFORMS.filter(([re]) => re.test(idea)).map(([, l]) => l));
    const services = uniq(SERVICES.filter(([re]) => re.test(idea)).map(([, l]) => l));
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
    return { tech, platforms, services, refs: uniq(refs.filter((r) => !services.includes(r))), audience, scope };
  }

  // Querschnittsthemen (Download, MP3, nur lokal, Login …) aus PG.topics
  const TOPICS = (PG.topics || []).map((t) => Object.assign({}, t, {
    _res: t.patterns.map(compile),
    _req: t.requires ? new RegExp(t.requires, 'i') : null
  }));

  function detectTopics(idea, domainId) {
    const t = idea.toLowerCase();
    const found = TOPICS.filter((topic) => {
      if (topic.onlyFor && !topic.onlyFor.includes(domainId)) return false;
      if (topic.skipFor && topic.skipFor.includes(domainId)) return false;
      if (!topic._res.some((re) => re.test(t))) return false;
      return !topic._req || topic._req.test(t);
    });
    const ids = found.map((x) => x.id);
    return found.filter((topic) => !(topic.excludes || []).some((id) => ids.includes(id)));
  }

  // Ein Werkzeug ("…, mit der ich … kann") statt einer reinen Info-Seite?
  const TOOL_HINT = /(?:in|mit|auf|bei|über|durch)\s+(?:der|dem|denen|welcher|welchem)\s+(?:ich|man|wir|nutzer|leute|user|jeder)\s|(?<![a-zäöüß])(?:rechner|generator|konverter|converter|downloader|planer|tracker|manager|editor|tool)(?![a-zäöüß])/i;

  /* ---------- Bausteine ---------- */

  function joinList(items) {
    if (items.length <= 1) return items.join('');
    return items.slice(0, -1).join(', ') + ' und ' + items[items.length - 1];
  }
  const bullets = (items) => items.map((i) => `- ${i}`).join('\n');
  const numbered = (items) => items.map((i, n) => `${n + 1}. ${i}`).join('\n');
  const ensureDot = (s) => (/[.!?…]$/.test(s) ? s : s + '.');

  function roleText(d, ctx) {
    const article = /^[a-zäöü]/.test(d.role) ? 'ein ' : '';
    const parts = [`Du bist ${article}${d.role}. ${d.expertise}`];
    if (ctx.facts.tech.length) parts.push(`Du bist besonders sicher im Umgang mit ${joinList(ctx.facts.tech)}.`);
    const extra = ctx.topics.map((t) => t.expertise).filter(Boolean);
    if (!extra.length && ctx.second && ctx.second.topicExpertise) extra.push(ctx.second.topicExpertise);
    if (extra.length) parts.push(`Zusätzliches Fachwissen, das du für genau dieses Projekt mitbringst: ${extra.join('; ')}.`);
    parts.push('Du arbeitest wie ein erfahrener Mentor: strukturiert, ehrlich und lösungsorientiert.');
    return parts.join(' ');
  }

  function ideaText(idea, d, ctx, s, xml) {
    const out = [];
    if (ctx.phrase) out.push(`Worum es geht: „${ctx.phrase}“`);
    const label = s.dictated ? 'Meine Idee in meinen eigenen Worten (diktiert – einzelne Wörter können falsch erkannt sein):' : 'Meine Idee in meinen eigenen Worten:';
    out.push(`${label}\n\n${xml ? `<beschreibung>\n${idea}\n</beschreibung>` : `"""\n${idea}\n"""`}`);

    const conditions = ctx.topics.map((t) => t.condition).filter(Boolean);
    if (conditions.length) out.push(`Rahmenbedingungen:\n${bullets(conditions)}`);

    const rows = [`Bereich: ${d.field}`];
    if (ctx.second) rows.push(`Thema: ${ctx.second.label}`);
    if (d.platforms && ctx.facts.platforms.length) rows.push(`Plattform: ${joinList(ctx.facts.platforms)}`);
    if (ctx.facts.tech.length) rows.push(`Technik & Tools: ${joinList(ctx.facts.tech)}`);
    if (ctx.facts.services.length) rows.push(`Beteiligte Dienste: ${joinList(ctx.facts.services)}`);
    if (ctx.facts.refs.length) rows.push(`Bezug / Inspiration: ${joinList(ctx.facts.refs)}`);
    if (ctx.facts.audience) rows.push(`Zielgruppe: ${ctx.facts.audience}`);
    if (s.tone.trim()) rows.push(`Stil & Ton: ${s.tone.trim()}`);
    if (ctx.facts.scope === 'large') rows.push('Umfang: groß angelegt – bitte mit einem kleinen ersten Meilenstein starten');
    if (ctx.facts.scope === 'small') rows.push('Umfang: bewusst klein und schnell umsetzbar');
    rows.push(`Mein Erfahrungsstand: ${LEVEL[s.level].label}`);
    out.push(`Eckdaten:\n${bullets(rows)}`);
    return out.join('\n\n');
  }

  function missionText(d, ctx, agent) {
    const parts = [`Deine Aufgabe ist es, ${d.mission}.`];
    if (ctx.phrase) {
      parts.push(`Im Mittelpunkt steht genau mein Projekt: ${ctx.phrase}. Bleib eng an meiner Idee – ergänze sinnvolle Details, aber ändere weder das Ziel noch die Kernfunktion.`);
    } else {
      parts.push('Bleib eng an meiner Idee – ergänze sinnvolle Details, aber ändere nicht ihr Ziel.');
    }
    parts.push(agent
      ? 'Du arbeitest direkt in meinem Projektordner: Lege Dateien selbst an, führe Befehle aus und teste das Ergebnis, bevor du mir Bescheid gibst.'
      : 'Das Ergebnis soll so konkret und vollständig sein, dass ich sofort damit loslegen kann.');
    if (ctx.facts.scope === 'large' && d.build) {
      parts.push('Meine Idee ist groß. Definiere zuerst einen realistischen ersten Meilenstein (MVP bzw. Vertical Slice), der schnell funktioniert, und plane die weiteren Ausbaustufen darauf auf.');
    } else if (ctx.facts.scope === 'small') {
      parts.push('Halte den Umfang bewusst klein, damit schnell ein fertiges Ergebnis entsteht.');
    }
    if (d.stackHint && !ctx.facts.tech.length) parts.push(d.stackHint);
    return parts.join(' ');
  }

  // Themen der Idee zuerst, danach die passenden Standardpunkte des Bereichs
  function aspectList(d, ctx, n) {
    const fromTopics = [];
    ctx.topics.forEach((t) => (t.aspects || []).forEach((a) => fromTopics.push(a)));
    const drop = ctx.topics.map((t) => t.dropAspects).filter(Boolean);
    const base = d.aspects.filter(([title]) => !drop.some((re) => re.test(title)));
    const count = n.aspects >= 99 ? base.length : Math.max(4, n.aspects - Math.floor(fromTopics.length / 2));
    return fromTopics.concat(base.slice(0, count));
  }

  function standardList(d, ctx, n) {
    const drop = ctx.topics.map((t) => t.dropStandards).filter(Boolean);
    const base = d.standards.filter((x) => !drop.some((re) => re.test(x))).slice(0, n.standards);
    ctx.topics.forEach((t) => (t.standards || []).forEach((x) => base.push(x)));
    return base;
  }

  function workflow(d, s, agent) {
    const brief = 'Fasse meine Idee zuerst als kurze Projektbeschreibung zusammen (Ziel, Kernfunktionen, Rahmenbedingungen), damit wir sicher dasselbe meinen.';
    if (agent) {
      const steps = [
        brief,
        'Verschaffe dir einen Überblick über das bestehende Projekt (Dateien, Abhängigkeiten). Ist der Ordner leer, lege eine saubere Grundstruktur an.',
        'Schreibe einen kurzen Umsetzungsplan und arbeite ihn danach selbstständig ab.',
        'Setze alles in kleinen, überprüfbaren Schritten um und teste nach jedem Schritt (starten, bauen, Tests ausführen).',
        'Behebe auftretende Fehler selbst, bevor du weitermachst.'
      ];
      if (s.selfcheck) steps.push('Prüfe das Ergebnis am Ende gegen meine Idee und die Qualitätsstandards und bessere Lücken nach.');
      steps.push('Fasse zum Schluss zusammen: was gebaut wurde, wie man es startet und was noch offen ist.');
      return steps;
    }
    const steps = [brief];
    if (s.clarify) steps.push('Stelle mir deine Rückfragen (siehe unten) und warte auf meine Antworten.');
    if (s.plan) steps.push('Erstelle einen klaren Plan mit nummerierten Schritten, bevor du ins Detail gehst.');
    steps.push('Arbeite die Punkte aus „Was du abdecken musst“ der Reihe nach ab.');
    if (d.build) steps.push('Liefere die Umsetzung in sinnvollen Etappen. Jede Etappe endet mit etwas, das ich ausprobieren kann.');
    if (s.selfcheck) steps.push('Prüfe dein Ergebnis vor dem Absenden gegen meine Idee und die Qualitätsstandards und schließe Lücken.');
    steps.push('Schließe mit dem konkreten nächsten Schritt, den ich sofort machen kann.');
    return steps;
  }

  function outputList(d, ctx, s, n) {
    const local = ctx.topics.some((t) => t.localOnly);
    let out = d.deliverables.slice(0, n.deliver);
    if (local) {
      out = out.map((x) => x.replace(/,? und zum Veröffentlichen| und Veröffentlichen/g, '').replace(/zum lokalen Starten$/, 'zum lokalen Starten (am besten per Doppelklick)'));
    }
    out.push('Gliedere die Antwort mit klaren Überschriften, nummerierten Schritten und kurzen Absätzen.');
    if (d.code) out.push('Code steht in Codeblöcken mit Sprachangabe; über jedem Block steht der Dateipfad.');
    if (s.detail === 'maximal') out.push('Beende jede größere Etappe mit einer kurzen Checkliste zum Abhaken.');
    if (s.detail === 'kompakt') out.push('Halte dich kurz: so ausführlich wie nötig, so knapp wie möglich.');
    return out;
  }

  function rulesList(d, ctx, s) {
    const facts = ctx.facts;
    const rules = [ANSWER_LANG[s.answerLang], LEVEL[s.level].rule];
    if (s.dictated) rules.push('Meine Idee ist diktiert. Interpretiere offensichtlich falsch erkannte Wörter sinnvoll, statt sie wörtlich zu nehmen.');
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

  function clarifyText(d, ctx) {
    const facts = ctx.facts;
    const known = {
      tech: facts.tech.length > 0, platform: facts.platforms.length > 0, audience: !!facts.audience,
      refs: facts.refs.length > 0, local: ctx.topics.some((t) => t.localOnly)
    };
    const all = [];
    ctx.topics.forEach((t) => (t.clarify || []).forEach((c) => all.push(c)));
    d.clarify.forEach((c) => all.push(c));
    const qs = all.filter((c) => !c.skip || !known[c.skip]).map((c) => c.q).slice(0, 6);
    return 'Stelle mir zuerst 3–5 kurze, gezielte Rückfragen zu den Punkten, die das Ergebnis am stärksten beeinflussen. Gute Kandidaten:\n'
      + bullets(qs)
      + '\n\nWarte auf meine Antworten, bevor du mit der eigentlichen Arbeit beginnst. Wenn ich „Leg los“ schreibe, triff die offenen Entscheidungen selbst.';
  }

  function startText(s, agent) {
    if (s.clarify) return 'Beginne jetzt mit deiner kurzen Projektbeschreibung und deinen Rückfragen.';
    if (agent) return 'Beginne jetzt mit der Projektbeschreibung und der Bestandsaufnahme des Projekts.';
    if (s.plan) return 'Beginne jetzt mit deiner Projektbeschreibung und dem Plan.';
    return 'Beginne jetzt mit deiner Projektbeschreibung und dann direkt mit der Umsetzung.';
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
    const base = forced ? byId(s.domain) : det.primary;
    let second = forced
      ? (det.primary.id !== base.id && det.primary.id !== 'general' ? det.primary : det.secondary)
      : det.secondary;
    if (second && second.id === base.id) second = null;

    const facts = extract(idea);
    const topics = detectTopics(idea, base.id);
    const tool = TOOL_HINT.test(idea) || topics.some((t) => t.tool);
    const d = tool && base.variants && base.variants.tool ? Object.assign({}, base, base.variants.tool) : base;
    if (!facts.scope && d.id === 'game' && facts.refs.some((r) => BIG_GAMES.test(r))) facts.scope = 'large';
    if (s.tech.trim()) facts.tech = uniq([s.tech.trim(), ...facts.tech]);
    if (s.audience.trim()) facts.audience = s.audience.trim();

    // Die Projektzeile nur verwenden, wenn sie zum gewählten Bereich passt
    const phrase = det.artifact && det.artifact.domain === d.id ? projectPhrase(det.artifact) : '';
    const ctx = { facts, second, topics, phrase };

    const n = DETAIL[s.detail];
    const agent = s.target === 'agent' && !!d.code;
    const xml = s.format === 'xml';

    const sections = [
      { tag: 'rolle', title: 'Deine Rolle', body: roleText(d, ctx) },
      { tag: 'projekt', title: 'Mein Projekt', body: ideaText(idea, d, ctx, s, xml) },
      { tag: 'auftrag', title: 'Dein Auftrag', body: missionText(d, ctx, agent) },
      { tag: 'inhalte', title: 'Was du abdecken musst', body: numbered(aspectList(d, ctx, n).map(([title, text]) => `**${title}:** ${text}`)) },
      { tag: 'qualitaet', title: 'Qualitätsstandards', body: bullets(standardList(d, ctx, n)) },
      { tag: 'vorgehen', title: 'Vorgehen', body: numbered(workflow(d, s, agent)) },
      { tag: 'ausgabe', title: 'Ausgabeformat', body: bullets(outputList(d, ctx, s, n)) },
      { tag: 'regeln', title: 'Regeln', body: bullets(rulesList(d, ctx, s)) }
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
    if (s.clarify) sections.push({ tag: 'rueckfragen', title: 'Bevor du startest', body: clarifyText(d, ctx) });
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
