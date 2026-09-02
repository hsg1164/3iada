/**
 * Tiny pub/sub bus for clinic suspension events.
 * Any layer (fetch interceptor, polling, websocket later) can trigger it;
 * the SuspensionProvider listens and shows the suspension screen instantly.
 */

type Listener = () => void;

const listeners = new Set<Listener>();

export const suspensionBus = {
  trigger() {
    listeners.forEach((l) => {
      try { l(); } catch { /* ignore */ }
    });
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => { listeners.delete(l); };
  },
};
