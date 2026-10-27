// Notifies screens that server data changed (a transaction was created), so
// the dashboard can reload without a manual pull to refresh.

type Listener = () => void;

const listeners = new Set<Listener>();

export function onDataChanged(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitDataChanged(): void {
  listeners.forEach((listener) => listener());
}
