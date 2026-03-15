/// <reference types="vite/client" />

interface Window {
  io?: (path?: string, options?: Record<string, unknown>) => {
    emit: (event: string, payload?: unknown) => void;
    on: (event: string, callback: (payload: unknown) => void) => void;
    disconnect: () => void;
  };
}
