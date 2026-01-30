import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

async function enableMocking() {
  if (import.meta.env.DEV) {
    try {
      const { worker } = await import('./mocks/browser');
      await worker.start();
    } catch (e) {
      // Don't let MSW errors block the app mount in development
      // eslint-disable-next-line no-console
      console.warn('MSW failed to start, continuing without mocks', e);
    }
  }
}

// Ensure the app mounts even if mocking setup fails
enableMocking().finally(() => {
  createRoot(document.getElementById('root')!).render(<App />);
});
