/*
 * Oberfläche: Eingabe, Spracheingabe, Einstellungen, Ausgabe und Verlauf.
 */
(function () {
  const $ = (id) => document.getElementById(id);
  const { engine, speech, domains } = PG;

  const STORE = { settings: 'pg.settings', draft: 'pg.draft', history: 'pg.history', nativeFailed: 'pg.nativeSpeechFailed' };
  const DEFAULTS = {
    domain: 'auto', level: 'anfaenger', detail: 'ausfuehrlich', target: 'chat', format: 'markdown',
    answerLang: 'de', clarify: true, plan: true, selfcheck: true,
    tech: '', audience: '', tone: '', must: '', avoid: '',
    speechLang: 'de-DE', spokenPunct: false, speechEngine: 'auto', localModel: 'base',
    aiEngine: '', cloudModel: 'balanced', browserSize: 'large'
  };
  const EXAMPLES = [
    ['Open-World-Spiel', 'Ich will ein Open-World-Spiel wie GTA 6 bauen. Man fährt durch eine große Stadt, erledigt Missionen für verschiedene Auftraggeber und kann Autos klauen und tunen. Am liebsten in Unity für den PC.'],
    ['Portfolio-Webseite', 'Eine Portfolio-Webseite für meine Blender-Renders und Spieleprojekte. Modern und dunkel, mit Galerie, kurzer Über-mich-Seite und Kontaktformular.'],
    ['Homegym-Plan', 'Ein Trainingsplan für mein Homegym mit Kurzhanteln, Klimmzugstange und Hantelbank. Viermal pro Woche, Ziel Muskelaufbau, und ich spiele nebenbei Fußball im Verein.'],
    ['Blender lernen', 'Ich will Blender von null lernen, um eigene 3D-Modelle für meine Spiele zu bauen. Ich habe ungefähr fünf Stunden pro Woche Zeit.'],
    ['YouTube-Short', 'Ein YouTube-Short über mein Gaming-Setup, witzig und schnell geschnitten, mit einem Hook, der sofort neugierig macht.']
  ];

  const el = {
    idea: $('idea'), interim: $('interim'), ideaCount: $('ideaCount'), clearIdea: $('clearIdea'),
    micBtn: $('micBtn'), micLabel: $('micLabel'), micStatus: $('micStatus'), micMeter: $('micMeter'),
    micMsg: $('micMsg'), micProgress: $('micProgress'), micOptions: $('micOptions'), micSettingsBtn: $('micSettingsBtn'),
    speechLang: $('speechLang'), speechEngine: $('speechEngine'), localModel: $('localModel'),
    modelField: $('modelField'), punctField: $('punctField'), engineHint: $('engineHint'),
    spokenPunct: $('spokenPunct'), examples: $('examples'),
    chips: $('domainChips'), tune: $('tune'), generate: $('generateBtn'),
    sheet: $('sheet'), sheetBody: $('sheetBody'), empty: $('sheetEmpty'), output: $('output'),
    copy: $('copyBtn'), download: $('downloadBtn'), stale: $('staleBtn'),
    tbDomain: $('tbDomain'), tbRole: $('tbRole'), tbDetail: $('tbDetail'), tbSize: $('tbSize'), tbDate: $('tbDate'),
    historyBtn: $('historyBtn'), historyCount: $('historyCount'), historyDialog: $('historyDialog'),
    historyList: $('historyList'), clearHistory: $('clearHistory'), toast: $('toast'),
    generateLabel: $('generateLabel'), domainStep: $('domainStep'), tuneNo: $('tuneNo'),
    aiEngine: $('aiEngine'), aiModel: $('aiModel'), aiHint: $('aiHint'), tbFirstLabel: $('tbFirstLabel'),
    aiStatus: $('aiStatus'), aiPhase: $('aiPhase'), aiBar: $('aiBar'), aiStop: $('aiStop'),
    aiChoose: $('aiChoose'), chooseBrowser: $('chooseBrowser'), chooseBrowserNote: $('chooseBrowserNote'),
    revealOllama: $('revealOllama'), ollamaName: $('ollamaName'),
    aiSignin: $('aiSignin'), aiSigninBtn: $('aiSigninBtn'),
    aiMsg: $('aiMsg'), aiMsgText: $('aiMsgText'), aiMsgHint: $('aiMsgHint'), aiRetry: $('aiRetry'), aiOther: $('aiOther'),
    aiLive: $('aiLive'), liveKern: $('liveKern'), liveRolle: $('liveRolle'), liveReq: $('liveReq')
  };

  /* ---------- Speicher (fehlertolerant) ---------- */
  function load(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (_) { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) { /* privater Modus o. ä. */ }
  }

  let settings = Object.assign({}, DEFAULTS, load(STORE.settings, {}));
  let history = load(STORE.history, []);
  let current = null;        // { text, meta, idea, date }
  let dictated = load('pg.draftDictated', false); // Idee (teilweise) gesprochen?
  let generatedFrom = null;  // Idee, aus der der aktuelle Prompt stammt

  /* ---------- Hilfen ---------- */
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const fmt = new Intl.NumberFormat('de-DE');
  const countWords = (t) => (t.trim().match(/\S+/g) || []).length;

  let toastTimer = 0;
  function toast(msg) {
    el.toast.textContent = msg;
    el.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.toast.classList.remove('show'), 2600);
  }

  /* ---------- Bereichs-Chips ---------- */
  function renderChips() {
    const items = [{ id: 'auto', label: 'Automatisch' }].concat(domains.map((d) => ({ id: d.id, label: d.label })));
    el.chips.innerHTML = items.map((d) => `
      <button type="button" class="chip${d.id === 'auto' ? ' chip-auto' : ''}" role="radio" data-domain="${d.id}"
        aria-checked="${settings.domain === d.id}" tabindex="${settings.domain === d.id ? 0 : -1}">
        ${esc(d.label)}${d.id === 'auto' ? '<span class="guess" id="autoGuess"></span>' : ''}
      </button>`).join('');
    updateGuess();
  }

  function selectDomain(id, focus) {
    settings.domain = id;
    el.chips.querySelectorAll('.chip').forEach((c) => {
      const on = c.dataset.domain === id;
      c.setAttribute('aria-checked', on);
      c.tabIndex = on ? 0 : -1;
      if (on && focus) c.focus();
    });
    persist();
    refreshIfShown();
  }

  el.chips.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (chip) selectDomain(chip.dataset.domain);
  });
  el.chips.addEventListener('keydown', (e) => {
    const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const chips = [...el.chips.querySelectorAll('.chip')];
    const i = chips.findIndex((c) => c.dataset.domain === settings.domain);
    const next = (i + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1) + chips.length) % chips.length;
    selectDomain(chips[next].dataset.domain, true);
  });

  let guessTimer = 0;
  function updateGuess() {
    const guess = $('autoGuess');
    if (!guess) return;
    const text = el.idea.value.trim();
    if (countWords(text) < 3) { guess.textContent = ''; return; }
    const det = engine.detect(text);
    guess.textContent = det.primary.id === 'general' ? '' : ` · ${det.primary.label}`;
  }

  /* ---------- Einstellungen ---------- */
  function applySettingsToForm() {
    ['level', 'detail', 'target', 'format', 'answerLang'].forEach((name) => {
      const input = document.querySelector(`input[name="${name}"][value="${settings[name]}"]`);
      if (input) input.checked = true;
    });
    ['clarify', 'plan', 'selfcheck'].forEach((name) => { document.querySelector(`input[name="${name}"]`).checked = !!settings[name]; });
    ['tech', 'audience', 'tone', 'must', 'avoid'].forEach((name) => { document.querySelector(`input[name="${name}"]`).value = settings[name] || ''; });
    el.speechLang.value = settings.speechLang;
    el.speechEngine.value = settings.speechEngine;
    el.localModel.value = settings.localModel;
    el.spokenPunct.checked = !!settings.spokenPunct;
    const filled = ['tech', 'audience', 'tone', 'must', 'avoid'].some((k) => (settings[k] || '').trim());
    if (filled) el.tune.open = true;
  }

  function persist() { save(STORE.settings, settings); }

  /* ---------- KI-Auswahl im Feinschliff ---------- */
  const MODEL_OPTIONS = {
    cloud: [['balanced', 'Gemini 3.5 Flash – schnell und gut'], ['best', 'Claude Sonnet 5.5 – beste Qualität, braucht mehr Kontingent'], ['light', 'GPT-5.4 nano – sparsam']],
    browser: [['large', 'Qwen 3.5 9B – genauer (einmalig ca. 6 GB)'], ['medium', 'Qwen 3.5 4B – kleiner (einmalig ca. 3 GB)']]
  };
  const ENGINE_HINTS = {
    '': 'Beim ersten Erstellen fragt dich die Seite, welche KI deine Idee lesen soll.',
    cloud: 'Läuft über Puter.js mit kostenlosem Puter-Konto (monatliches Freikontingent). Deine Idee wird dafür an den KI-Anbieter geschickt.',
    browser: 'Läuft komplett auf deiner Grafikkarte – kein Konto, nichts verlässt deinen PC. Das Modell wird beim ersten Mal geladen. Kleiner als die Cloud-KI, daher etwas ungenauer.',
    ollama: 'Nutzt das größte Modell in deinem lokal installierten Ollama.',
    template: 'Sofort fertig, versteht deine Idee aber nicht wirklich – die Seite füllt nur eine Vorlage für den erkannten Bereich.'
  };

  function applyEngineUI() {
    const eng = settings.aiEngine || '';
    el.aiEngine.value = eng;
    const opts = MODEL_OPTIONS[eng];
    el.aiModel.hidden = !opts;
    if (opts) {
      const key = eng === 'cloud' ? 'cloudModel' : 'browserSize';
      el.aiModel.innerHTML = opts.map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join('');
      el.aiModel.value = settings[key];
    }
    el.aiHint.textContent = ENGINE_HINTS[eng] || '';
    const template = eng === 'template';
    el.domainStep.hidden = !template;
    el.tuneNo.textContent = template ? '3' : '2';
  }

  el.aiEngine.addEventListener('change', () => {
    setEngine(el.aiEngine.value);
    if (current && el.idea.value.trim()) el.stale.hidden = false;
  });
  el.aiModel.addEventListener('change', () => {
    settings[settings.aiEngine === 'cloud' ? 'cloudModel' : 'browserSize'] = el.aiModel.value;
    persist();
    if (current && current.meta.source === 'ai') el.stale.hidden = false;
  });

  el.tune.addEventListener('input', (e) => {
    const t = e.target;
    if (!t.name) return;
    settings[t.name] = t.type === 'checkbox' ? t.checked : t.value;
    persist();
    refreshIfShown(t.type === 'text' ? 300 : 0);
  });
  el.spokenPunct.addEventListener('change', () => { settings.spokenPunct = el.spokenPunct.checked; persist(); });

  /* ---------- Idee-Feld ---------- */
  function onIdeaChange() {
    const words = countWords(el.idea.value);
    el.ideaCount.textContent = `${fmt.format(words)} ${words === 1 ? 'Wort' : 'Wörter'}`;
    save(STORE.draft, el.idea.value);
    if (!el.idea.value.trim() && dictated) { dictated = false; save('pg.draftDictated', false); }
    clearTimeout(guessTimer);
    guessTimer = setTimeout(updateGuess, 250);
    el.stale.hidden = !current || el.idea.value.trim() === generatedFrom;
  }
  el.idea.addEventListener('input', onIdeaChange);

  el.clearIdea.addEventListener('click', () => {
    if (!el.idea.value) return;
    el.idea.value = '';
    onIdeaChange();
    el.idea.focus();
  });

  EXAMPLES.forEach(([label, text]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'example';
    b.textContent = label;
    b.addEventListener('click', () => {
      el.idea.value = text;
      dictated = false;
      save('pg.draftDictated', false);
      onIdeaChange();
      updateGuess();
      el.idea.focus();
    });
    el.examples.appendChild(b);
  });

  /* ---------- Spracheingabe ---------- */
  // Zwei Wege: der Erkennungsdienst des Browsers (live, nur echtes Chrome/Edge/Safari)
  // oder Whisper lokal im Browser (funktioniert überall, Modell wird einmal geladen).
  const MIC_MSG = {
    blocked: 'Mikrofon blockiert. Erlaube den Zugriff über das Symbol links in der Adressleiste und versuch es erneut.',
    nomic: 'Kein Mikrofon gefunden. Schließ eins an und versuch es erneut.',
    network: 'Der Erkennungsdienst deines Browsers ist nicht erreichbar. Stell die Erkennung über das Regler-Symbol auf „Lokal mit Whisper“.',
    lang: 'Diese Sprache erkennt dein Browser nicht. Wähl eine andere oder stell die Erkennung auf „Lokal mit Whisper“.',
    modelerror: 'Das Sprachmodell konnte nicht geladen werden. Prüf deine Verbindung und versuch es erneut.',
    unsupported: 'Dein Browser unterstützt keine Spracheingabe. Tipp: Windows-Taste + H startet die Windows-Diktierfunktion in jedem Textfeld.',
    file: 'Fürs Mikrofon die Seite über start.bat oder GitHub Pages öffnen – als lokale Datei blockiert der Browser den Zugriff.'
  };
  const ENGINE_HINT = {
    local: 'Whisper läuft direkt auf deinem Gerät, die Aufnahme verlässt den Browser nicht. Das Sprachmodell wird nur beim ersten Mal geladen, danach geht es sofort.',
    browser: 'Live-Mitschrift über den Erkennungsdienst deines Browsers (Google bzw. Microsoft). Klappt nur in echtem Chrome und Edge und braucht Internet.'
  };

  // Nur diese Browser liefern die eingebaute Erkennung auch wirklich aus.
  // Opera, Brave, Vivaldi & Co. haben die Schnittstelle, aber keinen Dienst dahinter.
  function trustedNativeBrowser() {
    const data = navigator.userAgentData;
    if (data && data.brands && data.brands.length) {
      return data.brands.some((b) => b.brand === 'Google Chrome' || b.brand === 'Microsoft Edge');
    }
    const ua = navigator.userAgent;
    if (navigator.brave || /OPR\/|Opera|Vivaldi|YaBrowser|SamsungBrowser/i.test(ua)) return false;
    if (/Edg\//.test(ua)) return true;
    return /Safari\//.test(ua) && !/Chrome|Chromium|Android/.test(ua);
  }

  function resolveEngine() {
    const native = speech.supported;
    const local = PG.localSpeech.supported;
    if (settings.speechEngine === 'browser' && native) return 'browser';
    if (settings.speechEngine === 'local' && local) return 'local';
    if (native && trustedNativeBrowser() && !load(STORE.nativeFailed, false)) return 'browser';
    return local ? 'local' : native ? 'browser' : null;
  }

  let micEngine = null;
  let listening = false;
  let busy = false;
  let modelPct = null;
  let recStart = 0;
  let clock = 0;

  const fmtTime = (ms) => {
    const sec = Math.floor(ms / 1000);
    return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
  };

  function showMsg(text) {
    el.micMsg.textContent = text || '';
    el.micMsg.hidden = !text;
  }

  function renderMicStatus() {
    const parts = [];
    if (listening) parts.push(fmtTime(Date.now() - recStart));
    if (modelPct != null) parts.push(`Sprachmodell lädt (einmalig) ${modelPct} %`);
    else if (busy) parts.push('Erkenne Text …');
    el.micStatus.textContent = parts.join(' · ');
    el.micProgress.hidden = modelPct == null;
    if (modelPct != null) el.micProgress.firstElementChild.style.width = `${modelPct}%`;
  }

  function setListening(on) {
    listening = on;
    el.micBtn.classList.toggle('live', on);
    el.micBtn.setAttribute('aria-pressed', on);
    el.micLabel.textContent = on ? 'Stopp' : 'Reinsprechen';
    el.micMeter.hidden = !on;
    clearInterval(clock);
    if (on) {
      recStart = Date.now();
      clock = setInterval(renderMicStatus, 500);
    } else {
      el.interim.textContent = '';
    }
    renderMicStatus();
  }

  function onMicState(state) {
    if (state === 'listening') { showMsg(''); setListening(true); return; }
    setListening(false);
    if (state === 'idle' || state === 'processing') return;
    // Browser-Dienst nicht erreichbar: automatisch auf Whisper umschalten und weiter aufnehmen
    if ((state === 'network' || state === 'lang') && micEngine === 'browser' && settings.speechEngine === 'auto' && localMic) {
      save(STORE.nativeFailed, true);
      switchEngine('local');
      toast('Browser-Erkennung nicht erreichbar – ich nutze jetzt die lokale Erkennung.');
      startMic();
      return;
    }
    showMsg(MIC_MSG[state] || MIC_MSG.modelerror);
  }

  function appendSpoken(raw) {
    let text = raw.trim();
    if (!text) return;
    if (settings.spokenPunct && micEngine === 'browser') text = speech.applySpokenPunctuation(text);
    const cur = el.idea.value;
    const sentenceStart = !cur.trim() || /[.!?]\s*$|\n\s*$/.test(cur);
    if (sentenceStart) text = text.charAt(0).toUpperCase() + text.slice(1);
    const glue = cur && !/\s$/.test(cur) && !/^[.,!?;:\n]/.test(text) ? ' ' : '';
    el.idea.value = cur + glue + text;
    dictated = true;
    save('pg.draftDictated', true);
    el.idea.scrollTop = el.idea.scrollHeight;
    onIdeaChange();
  }

  const micHandlers = (engine) => ({
    onFinal: appendSpoken,
    onInterim: (t) => { if (micEngine === engine) el.interim.textContent = t; },
    onState: (state) => { if (micEngine === engine) onMicState(state); },
    onLevel: (v) => el.micMeter.style.setProperty('--lvl', v.toFixed(3)),
    onProgress: (p) => { modelPct = p; renderMicStatus(); },
    onBusy: (b) => { busy = b; renderMicStatus(); }
  });
  const nativeMic = speech.create(micHandlers('browser'));
  const localMic = PG.localSpeech.create(micHandlers('local'));
  const activeMic = () => (micEngine === 'local' ? localMic : micEngine === 'browser' ? nativeMic : null);

  function switchEngine(engine) {
    const old = activeMic();
    if (old && old.active) old.stop();
    micEngine = engine;
    el.micBtn.disabled = !engine;
    el.punctField.hidden = engine !== 'browser';
    el.modelField.hidden = engine !== 'local';
    el.engineHint.textContent = ENGINE_HINT[engine] || '';
    if (!engine) showMsg(MIC_MSG.unsupported);
  }

  function startMic() {
    const mic = activeMic();
    if (!mic) return;
    showMsg('');
    mic.setLang(settings.speechLang);
    if (micEngine === 'local') mic.setModel(settings.localModel);
    mic.start();
  }

  el.micBtn.addEventListener('click', () => {
    const mic = activeMic();
    if (!mic) return;
    if (mic.active) mic.stop();
    else startMic();
  });

  // Wer schon einmal gesprochen hat, bekommt das Modell beim Zeigen auf den Knopf vorgewärmt
  const warmUp = () => {
    if (micEngine !== 'local' || !localMic) return;
    localMic.setModel(settings.localModel);
    localMic.preload();
  };
  el.micBtn.addEventListener('pointerenter', warmUp);
  el.micBtn.addEventListener('focus', warmUp);

  el.micSettingsBtn.addEventListener('click', () => {
    const open = el.micOptions.hidden;
    el.micOptions.hidden = !open;
    el.micSettingsBtn.setAttribute('aria-expanded', open);
  });
  el.speechLang.addEventListener('change', () => {
    settings.speechLang = el.speechLang.value;
    persist();
    const mic = activeMic();
    if (mic) mic.setLang(settings.speechLang);
  });
  el.speechEngine.addEventListener('change', () => {
    settings.speechEngine = el.speechEngine.value;
    persist();
    showMsg('');
    switchEngine(resolveEngine());
  });
  el.localModel.addEventListener('change', () => {
    settings.localModel = el.localModel.value;
    persist();
    if (localMic) localMic.setModel(settings.localModel);
  });

  switchEngine(resolveEngine());
  if (location.protocol === 'file:') showMsg(MIC_MSG.file);

  /* ---------- Erzeugen & Anzeigen ---------- */
  function renderOutput(text, animate) {
    const lines = text.split('\n');
    el.output.innerHTML = lines.map((line, i) => {
      let cls = 'ln';
      let html;
      if (/^# /.test(line)) {
        cls += ' h';
        html = '<span class="mk">#</span> ' + esc(line.slice(2));
      } else if (/^<\/?[a-z_]+>$/.test(line)) {
        cls += ' tag';
        html = esc(line);
      } else if (line === '"""') {
        cls += ' quote';
        html = esc(line);
      } else {
        html = esc(line);
        const list = html.match(/^(\d+\.|-) /);
        if (list) {
          cls += list[1] === '-' ? ' li' : ' li num';
          html = `<span class="mk">${list[1]}</span> ` + html.slice(list[0].length);
        }
        html = html.replace(/\*\*(.+?)\*\*/g, '<span class="mk">**</span><b>$1</b><span class="mk">**</span>');
      }
      return `<span class="${cls}" style="--i:${Math.min(i, 60)}">${html}</span>`;
    }).join('');
    el.output.classList.toggle('plot', !!animate);
    el.output.hidden = false;
    el.empty.hidden = true;
    el.copy.disabled = false;
    el.download.disabled = false;
  }

  function renderMeta(meta, date) {
    el.tbFirstLabel.textContent = meta.firstLabel;
    el.tbDomain.textContent = meta.first;
    el.tbRole.textContent = meta.role;
    el.tbDetail.textContent = meta.detail;
    el.tbSize.textContent = `${fmt.format(meta.words)} Wörter · ≈ ${fmt.format(meta.tokens)} Tokens`;
    el.tbDate.textContent = new Date(date).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  const DETAIL_LABEL = { kompakt: 'Kompakt', ausfuehrlich: 'Ausführlich', maximal: 'Maximal' };
  const stats = (text) => ({ words: (text.match(/\S+/g) || []).length, tokens: Math.round(text.length / 3.6) });

  // Aus "Du bist Expertin für X und Y …" wird "Expertin für X"
  function shortRole(rolle) {
    const r = rolle.replace(/^du bist\s+(?:ein(?:e|en)?\s+)?/i, '').split(/[.;,]|\sund\s|\ssowie\s/)[0].trim();
    return r.length > 60 ? r.slice(0, 58).replace(/\s+\S*$/, '') + ' …' : r;
  }

  function nudgeIdea() {
    toast('Schreib oder sprich zuerst deine Idee.');
    el.idea.focus();
    el.idea.parentElement.classList.remove('nudge');
    void el.idea.parentElement.offsetWidth;
    el.idea.parentElement.classList.add('nudge');
  }

  function showResult(text, meta, idea, date, animate) {
    current = { text, meta, idea, date };
    generatedFrom = idea;
    renderOutput(text, animate);
    renderMeta(meta, date);
    el.stale.hidden = true;
  }

  function generate(opts) {
    const options = opts || {};
    const idea = (options.idea != null ? options.idea : el.idea.value).trim();
    if (!idea) { if (!options.silent) nudgeIdea(); return; }
    if (options.silent || settings.aiEngine === 'template') return generateTemplate(idea, options);
    if (!settings.aiEngine) return showChooser();
    generateAI(idea);
  }

  /* ---------- Ohne KI: Vorlagen-Engine ---------- */
  function generateTemplate(idea, options) {
    const result = engine.build(idea, Object.assign({}, settings, { dictated }));
    const m = result.meta;
    const meta = {
      source: 'template', firstLabel: 'Bereich',
      first: m.domain.field + (m.secondary ? ` + ${m.secondary.label}` : ''),
      role: m.role, detail: m.detail, words: m.words, tokens: m.tokens, slug: m.domain.id, tag: m.domain.label
    };
    const date = options.keepDate && current ? current.date : Date.now();
    hideSheetPanels();
    showResult(result.text, meta, idea, date, !options.silent);
    if (!options.silent) {
      addHistory(current);
      if (countWords(idea) < 6) toast('Tipp: Je mehr Details du nennst, desto genauer wird der Prompt.');
      revealSheet();
    }
  }

  function revealSheet() {
    if (window.matchMedia('(max-width: 999px)').matches) el.sheet.scrollIntoView({ behavior: 'smooth', block: 'start' });
    el.sheetBody.scrollTop = 0;
  }

  /* ---------- Mit KI ---------- */
  let aiRun = null;

  function hideSheetPanels() {
    el.aiChoose.hidden = true;
    el.aiMsg.hidden = true;
    el.aiLive.hidden = true;
    el.aiStatus.hidden = true;
  }

  function showEmptyOr(panel) {
    el.output.hidden = true;
    el.empty.hidden = true;
    panel.hidden = false;
  }

  function setPhase(info) {
    el.aiStatus.hidden = false;
    const bar = el.aiBar.firstElementChild;
    if (info.phase === 'load') {
      const pct = Math.round((info.progress || 0) * 100);
      el.aiPhase.textContent = `KI-Modell wird geladen (einmalig ${info.size}) · ${pct} %`;
      el.aiBar.classList.remove('busy');
      bar.style.width = pct + '%';
    } else {
      if (info.label) aiRun.label = info.label;
      el.aiPhase.textContent = `${aiRun.label || 'Die KI'} liest deine Idee und schreibt den Prompt …`;
      el.aiBar.classList.add('busy');
      bar.style.width = '';
    }
  }

  function setPeek(p) {
    el.liveKern.textContent = p.kern || '…';
    el.liveRolle.textContent = p.rolle || '…';
    el.liveReq.textContent = p.anforderungen ? `${p.anforderungen} erkannt` : '…';
  }

  async function generateAI(idea) {
    if (aiRun) return;
    const ctrl = new AbortController();
    aiRun = { ctrl, label: '' };
    const runSettings = Object.assign({}, settings, { dictated });
    el.generate.disabled = true;
    el.generateLabel.textContent = 'KI arbeitet …';
    hideSheetPanels();
    setPeek({});
    showEmptyOr(el.aiLive);
    el.aiStatus.hidden = false;
    el.aiPhase.textContent = 'Startet …';
    el.aiBar.classList.add('busy');
    revealSheet();
    try {
      const res = await PG.ai.generate(idea, runSettings, {
        engine: settings.aiEngine, size: settings.browserSize, cloudModel: settings.cloudModel,
        signal: ctrl.signal, onStatus: setPhase, onPeek: setPeek
      });
      const s = stats(res.text);
      const meta = {
        source: 'ai', firstLabel: 'Erstellt mit', first: res.model, role: shortRole(res.analysis.rolle),
        detail: DETAIL_LABEL[settings.detail], words: s.words, tokens: s.tokens, slug: 'ki', tag: 'KI · ' + res.model
      };
      hideSheetPanels();
      showResult(res.text, meta, idea, Date.now(), true);
      addHistory(current);
      el.sheetBody.scrollTop = 0;
    } catch (err) {
      hideSheetPanels();
      if (ctrl.signal.aborted || (err && err.name === 'AbortError')) {
        restoreAfterStop();
      } else if (err && err.code === 'signin') {
        showEmptyOr(el.aiSignin);
      } else {
        showAiError(err && err.message ? err.message : String(err), err && err.code);
      }
    } finally {
      aiRun = null;
      el.generate.disabled = false;
      el.generateLabel.textContent = 'Master-Prompt erstellen';
    }
  }

  function restoreAfterStop() {
    if (current) { renderOutput(current.text, false); el.output.hidden = false; }
    else el.empty.hidden = false;
    toast('Abgebrochen.');
  }

  function showAiError(message, code) {
    el.aiMsgText.textContent = message;
    el.aiMsgHint.textContent = code === 'nogpu' || code === 'ollama'
      ? 'Wähl eine andere KI – die Cloud-KI läuft in jedem Browser.'
      : 'Versuch es nochmal oder wähl eine andere KI.';
    showEmptyOr(el.aiMsg);
  }

  el.aiStop.addEventListener('click', () => { if (aiRun) aiRun.ctrl.abort(); });
  el.aiRetry.addEventListener('click', () => generate());
  el.aiOther.addEventListener('click', () => showChooser());

  el.aiSigninBtn.addEventListener('click', async () => {
    try {
      const ok = await PG.ai.puterSignIn();
      if (ok) generate();
    } catch (_) {
      toast('Anmeldung abgebrochen.');
    }
  });

  // Erste Wahl: Welche KI soll den Prompt schreiben?
  async function showChooser() {
    hideSheetPanels();
    showEmptyOr(el.aiChoose);
    el.revealOllama.hidden = true;
    const gpu = await PG.ai.webgpuInfo();
    el.chooseBrowser.disabled = !gpu;
    el.chooseBrowserNote.textContent = gpu ? '' : 'Dein Browser unterstützt kein WebGPU.';
    const models = await PG.ai.ollamaModels();
    if (models && models.length) {
      el.revealOllama.hidden = false;
      el.ollamaName.textContent = models.slice().sort((a, b) => b.size - a.size)[0].name;
    }
  }

  el.aiChoose.addEventListener('click', (e) => {
    const card = e.target.closest('[data-engine]');
    if (!card || card.disabled) return;
    setEngine(card.dataset.engine);
    el.aiChoose.hidden = true;
    generate();
  });

  function setEngine(engineId) {
    settings.aiEngine = engineId;
    persist();
    applyEngineUI();
    if (engineId === 'cloud') PG.ai.ensurePuter().catch(() => { /* Fehler zeigt später generate() */ });
  }

  let refreshTimer = 0;
  function refreshIfShown(delay) {
    if (!current) return;
    // Mit KI wird nicht automatisch neu erzeugt – das kostet Zeit bzw. Kontingent
    if (current.meta.source === 'ai') { el.stale.hidden = false; return; }
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      // Optionen geändert: Prompt mit der Idee neu bauen, aus der er stammt
      const scroll = el.sheetBody.scrollTop;
      generate({ silent: true, keepDate: true, idea: generatedFrom });
      el.stale.hidden = el.idea.value.trim() === generatedFrom;
      el.sheetBody.scrollTop = scroll;
      if (history[0] && history[0].date === current.date) {
        history[0] = snapshot(current);
        save(STORE.history, history);
      }
    }, delay || 0);
  }

  el.generate.addEventListener('click', () => generate());
  el.stale.addEventListener('click', () => generate());
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); generate(); }
  });

  /* ---------- Kopieren & Speichern ---------- */
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (__) { ok = false; }
      ta.remove();
      return ok;
    }
  }

  el.copy.addEventListener('click', async () => {
    if (!current) return;
    const ok = await copyText(current.text);
    if (ok) {
      el.copy.textContent = 'Kopiert';
      el.copy.classList.add('done');
      setTimeout(() => { el.copy.textContent = 'Kopieren'; el.copy.classList.remove('done'); }, 1800);
      toast('Kopiert – jetzt in deine KI einfügen.');
    } else {
      toast('Kopieren hat nicht geklappt. Markier den Text und drück Strg + C.');
    }
  });

  el.download.addEventListener('click', () => {
    if (!current) return;
    const day = new Date(current.date).toISOString().slice(0, 10);
    const blob = new Blob([current.text], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `master-prompt-${current.meta.slug}-${day}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast('Gespeichert als Textdatei.');
  });

  /* ---------- Verlauf ---------- */
  function snapshot(entry) {
    return { date: entry.date, idea: entry.idea, text: entry.text, meta: entry.meta, settings: Object.assign({}, settings) };
  }

  // Ältere Verlaufseinträge hatten noch keine fertigen Metadaten
  function entryMeta(h) {
    if (h.meta) return h.meta;
    const d = engine.byId(h.domainId);
    const sec = h.secondaryId ? engine.byId(h.secondaryId) : null;
    return {
      source: 'template', firstLabel: 'Bereich', first: d.field + (sec ? ` + ${sec.label}` : ''),
      role: h.role, detail: h.detail, words: h.words, tokens: h.tokens, slug: d.id, tag: d.label
    };
  }

  function addHistory(entry) {
    if (history[0] && history[0].idea === entry.idea) history.shift();
    history.unshift(snapshot(entry));
    history = history.slice(0, 25);
    save(STORE.history, history);
    renderHistoryCount();
  }

  function renderHistoryCount() {
    el.historyCount.textContent = history.length ? history.length : '';
  }

  function renderHistory() {
    if (!history.length) {
      el.historyList.innerHTML = '<li class="history-empty">Noch nichts gespeichert. Jeder erstellte Prompt landet automatisch hier.</li>';
      el.clearHistory.hidden = true;
      return;
    }
    el.clearHistory.hidden = false;
    el.historyList.innerHTML = history.map((h, i) => {
      const tag = entryMeta(h).tag;
      const when = new Date(h.date).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
      return `<li><button type="button" class="history-item" data-index="${i}">
        <span class="hi-meta">${esc(when)} · ${esc(tag)}</span>
        <span class="hi-idea">${esc(h.idea.length > 140 ? h.idea.slice(0, 140) + ' …' : h.idea)}</span>
      </button></li>`;
    }).join('');
  }

  el.historyBtn.addEventListener('click', () => {
    renderHistory();
    el.historyDialog.showModal();
  });
  el.historyDialog.addEventListener('click', (e) => {
    if (e.target === el.historyDialog || e.target.closest('[data-close]')) el.historyDialog.close();
    const item = e.target.closest('.history-item');
    if (!item) return;
    const h = history[Number(item.dataset.index)];
    if (!h) return;
    settings = Object.assign({}, DEFAULTS, h.settings, {
      speechLang: settings.speechLang, spokenPunct: settings.spokenPunct,
      speechEngine: settings.speechEngine, localModel: settings.localModel,
      aiEngine: settings.aiEngine, cloudModel: settings.cloudModel, browserSize: settings.browserSize
    });
    persist();
    applySettingsToForm();
    renderChips();
    el.idea.value = h.idea;
    onIdeaChange();
    hideSheetPanels();
    showResult(h.text, entryMeta(h), h.idea, h.date, true);
    el.historyDialog.close();
    toast('Prompt aus dem Verlauf geladen.');
  });
  el.clearHistory.addEventListener('click', () => {
    if (!confirm('Den gesamten Verlauf löschen? Das lässt sich nicht rückgängig machen.')) return;
    history = [];
    save(STORE.history, history);
    renderHistory();
    renderHistoryCount();
  });

  /* ---------- Start ---------- */
  applySettingsToForm();
  applyEngineUI();
  if (settings.aiEngine === 'cloud') PG.ai.ensurePuter().catch(() => { /* später erneut */ });
  renderChips();
  renderHistoryCount();
  el.idea.value = load(STORE.draft, '');
  onIdeaChange();
  if (speech.isMobile) document.documentElement.classList.add('touch');
})();
