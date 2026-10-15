/*
 * Spracheingabe über die Web Speech API (Chrome und Edge).
 * Hört dauerhaft zu, startet nach Pausen automatisch neu und liefert
 * Zwischenergebnisse (live) und fertige Sätze getrennt zurück.
 */
window.PG = window.PG || {};

PG.speech = (function () {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isMobile = isAndroid || /iPhone|iPad|iPod/i.test(navigator.userAgent);

  function create(handlers) {
    if (!SR) return null;

    let rec = null;
    let wanted = false;
    let failure = null; // letzter harter Fehler, bleibt nach dem Ende sichtbar
    let deadStarts = 0; // Sitzungen, die enden, ohne je gestartet zu sein
    let started = false;
    let lang = 'de-DE';
    let meter = null;

    function setup() {
      rec = new SR();
      rec.lang = lang;
      // Android liefert bei continuous=true doppelte Ergebnisse, deshalb dort Einzelsätze mit Neustart.
      rec.continuous = !isAndroid;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      rec.onstart = () => { started = true; deadStarts = 0; handlers.onState('listening'); };

      rec.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0].transcript;
          if (result.isFinal) handlers.onFinal(text);
          else interim += text;
        }
        handlers.onInterim(interim);
      };

      rec.onerror = (event) => {
        switch (event.error) {
          case 'no-speech':
          case 'aborted':
            return; // Pause beim Sprechen – einfach weiter zuhören
          case 'not-allowed':
          case 'service-not-allowed':
            fail('blocked'); return;
          case 'audio-capture':
            fail('nomic'); return;
          case 'language-not-supported':
            fail('lang'); return;
          case 'network':
            // Browser erreicht seinen Erkennungsdienst nicht (z. B. Opera, Brave) – sofort melden,
            // damit die App auf die lokale Erkennung umschalten kann
            fail('network');
            return;
          default:
            return;
        }
      };

      rec.onend = () => {
        handlers.onInterim('');
        if (wanted && !started && ++deadStarts >= 3) fail('blocked');
        started = false;
        if (wanted) {
          setTimeout(() => {
            if (!wanted) return;
            try { rec.start(); } catch (_) { /* läuft schon */ }
          }, 150);
        } else {
          stopMeter();
          handlers.onState(failure || 'idle');
        }
      };
    }

    function fail(state) {
      wanted = false;
      failure = state;
      stopMeter();
      handlers.onState(state);
    }

    // Pegelanzeige fürs Mikrofon (nur Desktop, auf Handys blockiert ein zweiter Mikrofonzugriff die Erkennung).
    async function startMeter() {
      if (isMobile || !navigator.mediaDevices || !handlers.onLevel) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!wanted) { stream.getTracks().forEach((t) => t.stop()); return; }
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);
        const data = new Uint8Array(analyser.fftSize);
        meter = { stream, ctx, raf: 0 };
        const tick = () => {
          analyser.getByteTimeDomainData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) { const v = (data[i] - 128) / 128; sum += v * v; }
          const rms = Math.sqrt(sum / data.length);
          handlers.onLevel(Math.min(1, rms * 4));
          meter.raf = requestAnimationFrame(tick);
        };
        tick();
      } catch (_) { /* ohne Pegelanzeige weitermachen */ }
    }

    function stopMeter() {
      if (!meter) return;
      cancelAnimationFrame(meter.raf);
      meter.stream.getTracks().forEach((t) => t.stop());
      meter.ctx.close();
      meter = null;
      handlers.onLevel && handlers.onLevel(0);
    }

    return {
      start() {
        if (wanted) return;
        wanted = true;
        failure = null;
        deadStarts = 0;
        setup();
        try { rec.start(); } catch (_) { /* läuft schon */ }
        startMeter();
      },
      stop() {
        wanted = false;
        stopMeter();
        if (rec) { try { rec.stop(); } catch (_) { /* schon gestoppt */ } }
      },
      setLang(value) {
        lang = value;
        if (wanted) { this.stop(); setTimeout(() => this.start(), 250); }
      },
      get active() { return wanted; }
    };
  }

  // Gesprochene Satzzeichen in echte Zeichen umwandeln.
  const SPOKEN = [
    [/\s*\b(?:neuer absatz|new paragraph)\b\s*/gi, '\n\n'],
    [/\s*\b(?:neue zeile|zeilenumbruch|new line)\b\s*/gi, '\n'],
    [/\s*\b(?:fragezeichen|question mark)\b/gi, '?'],
    [/\s*\b(?:ausrufezeichen|exclamation mark)\b/gi, '!'],
    [/\s*\b(?:doppelpunkt|colon)\b/gi, ':'],
    [/\s*\b(?:semikolon|semicolon)\b/gi, ';'],
    [/\s*\b(?:komma|comma)\b/gi, ','],
    [/\s*\b(?:punkt|period|full stop)\b/gi, '.']
  ];

  function applySpokenPunctuation(text) {
    let t = text;
    SPOKEN.forEach(([re, sign]) => { t = t.replace(re, sign); });
    // Nach Satzende großschreiben
    t = t.replace(/([.!?]\s+|\n\s*)([a-zäöü])/g, (m, a, b) => a + b.toUpperCase());
    return t.replace(/[ \t]+\n/g, '\n');
  }

  return { supported: !!SR, isMobile, create, applySpokenPunctuation };
})();
