type UnauthorizedPayload = {
  status?: number;
  message?: string;
  source?: string;
};

type Listener = (payload?: UnauthorizedPayload) => void;

class SimpleEventBus {
  private unauthorizedListeners: Set<Listener> = new Set();

  onUnauthorized(listener: Listener): () => void {
    this.unauthorizedListeners.add(listener);
    return () => this.offUnauthorized(listener);
  }

  offUnauthorized(listener: Listener): void {
    this.unauthorizedListeners.delete(listener);
  }

  emitUnauthorized(payload?: UnauthorizedPayload): void {
    try {
      for (const listener of Array.from(this.unauthorizedListeners)) {
        try {
          listener(payload);
        } catch {}
      }
    } catch {}
  }
}

export const authEvents = new SimpleEventBus();

export type { UnauthorizedPayload };
