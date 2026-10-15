/*
 * Lokale Spracheingabe: nimmt über das Mikrofon auf, schneidet an Sprechpausen
 * und lässt jeden Abschnitt von Whisper (js/whisper-worker.js) erkennen.
 * Funktioniert in jedem modernen Browser – auch dort, wo die eingebaute
 * Spracherkennung fehlt oder keinen Dienst erreicht (Opera, Brave, Firefox …).
 */
window.PG = window.PG || {};

PG.localSpeech = (function () {
  const supported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.Worker && window.AudioContext);

  // Typische Whisper-Halluzinationen bei Stille oder Rauschen
  const HALLUCINATIONS = [
    /untertitel.*(zdf|amara|auftrag|funk|community)/i,
    /^(vielen )?dank(e)?( schön)? (fürs|für's|für das) zu(sehen|schauen|hören)/i,
    /^(thank you|thanks) for watching/i,
    /^\[?\(?(musik|music|applaus|lachen|stille|silence)\)?\]?$/i,
    /^(bis zum nächsten mal|tschüss)$/i
  ];

  function isHallucination(text) {
    const t = text.trim().replace(/[.!?…\s]+$/, '');
    if (!t || !/[a-zäöüß0-9]/i.test(t)) return true;
    return HALLUCINATIONS.some((re) => re.test(t));
  }

  async function to16k(samples, rate) {
    if (rate === 16000) return samples;
    const length = Math.ceil(samples.length * 16000 / rate);
    const off = new OfflineAudioContext(1, length, 16000);
    const buffer = off.createBuffer(1, samples.length, rate);
    buffer.copyToChannel(samples, 0);
    const src = off.createBufferSource();
    src.buffer = buffer;
    src.connect(off.destination);
    src.start();
    const rendered = await off.startRendering();
    return rendered.getChannelData(0).slice();
  }

  function concat(chunks) {
    const total = chunks.reduce((n, c) => n + c.length, 0);
    const out = new Float32Array(total);
    let offset = 0;
    chunks.forEach((c) => { out.set(c, offset); offset += c.length; });
    return out;
  }

  const CACHED_KEY = 'pg.whisperCached.';

  function create(handlers) {
    if (!supported) return null;

    let worker = null;
    let model = 'base';
    let ready = false;
    let loading = false;
    let readyWaiters = [];
    let language = 'german';
    let wanted = false;

    let stream = null, ctx = null, source = null, proc = null, mute = null;
    let queue = [];
    let working = false;
    let nextId = 1;
    const pending = new Map();
    const files = new Map();
    let shownPct = 0;

    // Sprachabschnitt-Erkennung (Pausen)
    let segment = [], preroll = [], hasSpeech = false, speechMs = 0, silenceMs = 0, segmentMs = 0;
    let noise = 0.004;

    function ensureWorker() {
      if (worker) return;
      worker = new Worker('js/whisper-worker.js', { type: 'module' });
      worker.onmessage = (e) => {
        const msg = e.data;
        if (msg.type === 'progress') {
          const p = msg.data;
          // Nur die großen Modelldateien zählen, und der Balken läuft nie rückwärts
          if (p.status === 'progress' && /\.onnx$/.test(p.file || '')) {
            files.set(p.file, { loaded: p.loaded || 0, total: p.total || 0 });
            let loaded = 0, total = 0;
            files.forEach((f) => { loaded += f.loaded; total += f.total; });
            if (total > 0) {
              shownPct = Math.max(shownPct, Math.min(99, Math.round(loaded / total * 100)));
              handlers.onProgress(shownPct);
            }
          }
        } else if (msg.type === 'ready') {
          ready = true;
          loading = false;
          try { localStorage.setItem(CACHED_KEY + model, '1'); } catch (_) { /* egal */ }
          handlers.onProgress(null);
          readyWaiters.forEach((fn) => fn());
          readyWaiters = [];
          pump();
        } else if (msg.type === 'result' || msg.type === 'error') {
          const done = pending.get(msg.id);
          if (msg.type === 'error' && !done) {
            // Laden fehlgeschlagen
            loading = false;
            handlers.onProgress(null);
            handlers.onState('modelerror', msg.message);
            wanted = false;
            stopAudio();
            return;
          }
          if (done) { pending.delete(msg.id); done(msg.type === 'result' ? msg.text : ''); }
        }
      };
      worker.onerror = () => {
        loading = false;
        handlers.onProgress(null);
        handlers.onState('modelerror');
        wanted = false;
        stopAudio();
      };
    }

    function loadModel() {
      ensureWorker();
      if (ready || loading) return;
      loading = true;
      files.clear();
      shownPct = 0;
      handlers.onProgress(0);
      worker.postMessage({ type: 'load', model });
    }

    function waitReady() {
      return ready ? Promise.resolve() : new Promise((resolve) => readyWaiters.push(resolve));
    }

    function transcribe(audio) {
      return new Promise((resolve) => {
        const id = nextId++;
        pending.set(id, resolve);
        worker.postMessage({ type: 'transcribe', id, audio, language }, [audio.buffer]);
      });
    }

    async function pump() {
      if (working || !ready || !queue.length) return;
      working = true;
      handlers.onBusy(true);
      while (queue.length) {
        const item = queue.shift();
        const audio = await to16k(item.samples, item.rate);
        const text = (await transcribe(audio)).trim();
        if (text && !isHallucination(text)) handlers.onFinal(text);
      }
      working = false;
      handlers.onBusy(false);
      if (!wanted) handlers.onState('idle');
    }

    function flush(rate) {
      if (hasSpeech && speechMs >= 250) {
        queue.push({ samples: concat(segment), rate });
        waitReady().then(pump);
      }
      segment = [];
      hasSpeech = false;
      speechMs = 0;
      silenceMs = 0;
      segmentMs = 0;
    }

    function onAudio(data, rate) {
      const chunk = new Float32Array(data);
      const ms = chunk.length / rate * 1000;
      let sum = 0;
      for (let i = 0; i < chunk.length; i++) sum += chunk[i] * chunk[i];
      const rms = Math.sqrt(sum / chunk.length);
      handlers.onLevel(Math.min(1, rms * 9));

      const threshold = Math.max(0.01, noise * 2.8);
      const loud = rms > threshold;
      if (!loud) noise = noise * 0.96 + rms * 0.04;

      if (!hasSpeech) {
        preroll.push(chunk);
        if (preroll.length > 4) preroll.shift();
        if (loud) {
          hasSpeech = true;
          segment = preroll.slice();
          preroll = [];
          segmentMs = segment.reduce((n, c) => n + c.length / rate * 1000, 0);
          speechMs = ms;
        }
        return;
      }

      segment.push(chunk);
      segmentMs += ms;
      if (loud) { speechMs += ms; silenceMs = 0; } else { silenceMs += ms; }
      // Pause von 0,7 s oder 20 s am Stück: Abschnitt zur Erkennung schicken
      if (silenceMs >= 700 || segmentMs >= 20000) flush(rate);
    }

    function stopAudio() {
      if (proc) { proc.onaudioprocess = null; try { proc.disconnect(); } catch (_) { /* egal */ } }
      if (source) { try { source.disconnect(); } catch (_) { /* egal */ } }
      if (mute) { try { mute.disconnect(); } catch (_) { /* egal */ } }
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (ctx) ctx.close();
      stream = ctx = source = proc = mute = null;
      handlers.onLevel(0);
    }

    return {
      async start() {
        if (wanted) return;
        wanted = true;
        loadModel();
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true }
          });
        } catch (err) {
          wanted = false;
          const name = err && err.name;
          handlers.onState(name === 'NotFoundError' || name === 'OverconstrainedError' ? 'nomic' : 'blocked');
          return;
        }
        if (!wanted) { stream.getTracks().forEach((t) => t.stop()); stream = null; return; }
        ctx = new AudioContext();
        if (ctx.state === 'suspended') await ctx.resume();
        const rate = ctx.sampleRate;
        source = ctx.createMediaStreamSource(stream);
        proc = ctx.createScriptProcessor(4096, 1, 1);
        mute = ctx.createGain();
        mute.gain.value = 0;
        source.connect(proc);
        proc.connect(mute);
        mute.connect(ctx.destination);
        proc.onaudioprocess = (e) => onAudio(e.inputBuffer.getChannelData(0), rate);
        segment = []; preroll = []; hasSpeech = false; speechMs = 0; silenceMs = 0; segmentMs = 0;
        handlers.onState('listening');
      },
      stop() {
        if (!wanted) return;
        wanted = false;
        const rate = ctx ? ctx.sampleRate : 48000;
        flush(rate);
        stopAudio();
        handlers.onState(queue.length || working ? 'processing' : 'idle');
      },
      setLang(value) { language = /^en/i.test(value) ? 'english' : 'german'; },
      setModel(value) {
        if (value === model || wanted || working) return;
        model = value;
        ready = false;
        loading = false;
        if (worker) { worker.terminate(); worker = null; }
        pending.clear();
      },
      // Schon einmal geladenes Modell vorwärmen (kommt dann aus dem Cache, kein Download)
      preload() {
        let cached = false;
        try { cached = !!localStorage.getItem(CACHED_KEY + model); } catch (_) { /* egal */ }
        if (cached) loadModel();
      },
      get active() { return wanted; }
    };
  }

  return { supported, create };
})();
