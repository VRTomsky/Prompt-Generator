/*
 * Lokale Spracherkennung mit Whisper (läuft im Browser, kein Server).
 * Das Modell wird beim ersten Mal heruntergeladen und danach aus dem Browser-Cache geladen.
 */
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';

env.allowLocalModels = false;
if (env.backends && env.backends.onnx) env.backends.onnx.logLevel = 'error';

const MODELS = {
  base: 'onnx-community/whisper-base',
  small: 'onnx-community/whisper-small'
};

let asr = null;
let loadedKey = '';

async function pickDevice() {
  try {
    if (!navigator.gpu) return { device: 'wasm', f16: false };
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) return { device: 'wasm', f16: false };
    return { device: 'webgpu', f16: adapter.features.has('shader-f16') };
  } catch (_) {
    return { device: 'wasm', f16: false };
  }
}

function dtypeFor(model, device, f16) {
  if (device !== 'webgpu') return 'q8';
  if (model === 'small') return { encoder_model: f16 ? 'fp16' : 'fp32', decoder_model_merged: 'q4' };
  return { encoder_model: 'fp32', decoder_model_merged: 'q4' };
}

async function create(model, device, f16) {
  return pipeline('automatic-speech-recognition', MODELS[model], {
    device,
    dtype: dtypeFor(model, device, f16),
    progress_callback: (p) => self.postMessage({ type: 'progress', data: p })
  });
}

async function load(model) {
  const key = model;
  if (asr && loadedKey === key) return;
  const { device, f16 } = await pickDevice();
  try {
    asr = await create(model, device, f16);
    // Einmal kurz mit Stille laufen lassen, damit die erste echte Erkennung schnell ist
    await asr(new Float32Array(16000), { language: 'german', task: 'transcribe' });
    loadedKey = key;
    self.postMessage({ type: 'ready', device });
  } catch (err) {
    if (device === 'webgpu') {
      // Grafikkarte macht Probleme – auf CPU ausweichen
      asr = await create(model, 'wasm', false);
      loadedKey = key;
      self.postMessage({ type: 'ready', device: 'wasm' });
    } else {
      throw err;
    }
  }
}

self.onmessage = async (event) => {
  const msg = event.data;
  try {
    if (msg.type === 'load') {
      await load(msg.model);
    } else if (msg.type === 'transcribe') {
      const out = await asr(msg.audio, { language: msg.language, task: 'transcribe' });
      self.postMessage({ type: 'result', id: msg.id, text: (out && out.text) || '' });
    }
  } catch (err) {
    self.postMessage({ type: 'error', id: msg.id, message: String((err && err.message) || err) });
  }
};
