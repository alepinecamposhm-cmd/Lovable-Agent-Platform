import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

declare global {
  interface Window {
    __MSW_ERROR__?: string;
  }
}

async function startMocks() {
  if (!import.meta.env.DEV) return;
  try {
    const { worker } = await import('./mocks/browser');
    await worker.start();
  } catch (err) {
    console.error('[msw] start failed', err);
    window.__MSW_ERROR__ = 'Mocks no disponibles; usando datos locales.';
  }
}

// Render immediately; start mocks in background
createRoot(document.getElementById('root')!).render(<App />);
startMocks();
