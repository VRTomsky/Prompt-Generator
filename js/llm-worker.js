/*
 * Hintergrund-Worker für die KI im Browser (WebLLM).
 * Die eigentliche Rechenarbeit läuft hier, damit die Seite flüssig bleibt.
 */
import { WebWorkerMLCEngineHandler } from 'https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.85/+esm';

const handler = new WebWorkerMLCEngineHandler();
self.onmessage = (msg) => handler.onmessage(msg);
