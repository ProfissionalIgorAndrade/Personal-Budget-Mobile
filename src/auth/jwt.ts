// Reads the user id ("sub" claim) from the access token. Only used to pick
// sensible defaults in the UI (the user's own member profile); the server
// never trusts anything decoded here.
export function userIdFromToken(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(payload.length / 4) * 4, '=');
    const json = JSON.parse(globalThis.atob(base64)) as { sub?: unknown };
    return typeof json.sub === 'string' ? json.sub : null;
  } catch {
    return null;
  }
}
