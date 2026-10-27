// Notifies screens that server data changed (something was created), so the
// dashboard and reference lists can reload without a manual pull to refresh.
// When the change is a new record, its entity and id travel along so a form
// that sent the user to create it can select it on return.

export type CreatedRecord = {
  entity: 'transaction' | 'category' | 'card' | 'account' | 'savingsBox' | 'member' | 'budget';
  id: string | null;
};

type Listener = (created?: CreatedRecord) => void;

const listeners = new Set<Listener>();

export function onDataChanged(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitDataChanged(created?: CreatedRecord): void {
  listeners.forEach((listener) => listener(created));
}
