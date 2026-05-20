const SESSION_STORAGE_KEY = 'femibot_admin_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

export interface AdminSession {
  userId: string;
  expiresAt: number;
  signature: string;
}

function getSessionSecret(): string {
  return (
    import.meta.env.VITE_AUTH_SESSION_SECRET ||
    import.meta.env.VITE_ADMIN_PASSWORD ||
    'femibot-dev-secret-change-me'
  );
}

export function isAdminConfigured(): boolean {
  return Boolean(
    import.meta.env.VITE_ADMIN_USER_ID?.trim() &&
      import.meta.env.VITE_ADMIN_PASSWORD
  );
}

async function sha256Hex(message: string): Promise<string> {
  const data = new TextEncoder().encode(message);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function signSessionPayload(userId: string, expiresAt: number): Promise<string> {
  const secret = getSessionSecret();
  return sha256Hex(`${userId}:${expiresAt}:${secret}`);
}

export async function createSession(userId: string): Promise<void> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const signature = await signSessionPayload(userId, expiresAt);
  const session: AdminSession = { userId, expiresAt, signature };
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function getStoredSession(): AdminSession | null {
  const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminSession;
  } catch {
    return null;
  }
}

export async function validateSession(): Promise<string | null> {
  const session = getStoredSession();
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    clearSession();
    return null;
  }

  const expected = await signSessionPayload(session.userId, session.expiresAt);
  if (expected !== session.signature) {
    clearSession();
    return null;
  }

  return session.userId;
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

export function validateCredentials(userId: string, password: string): boolean {
  if (!isAdminConfigured()) return false;

  const expectedId = import.meta.env.VITE_ADMIN_USER_ID!.trim();
  const expectedPassword = import.meta.env.VITE_ADMIN_PASSWORD!;

  return userId.trim() === expectedId && password === expectedPassword;
}

export function getSessionAuthorizationHeader(): string | null {
  const session = getStoredSession();
  if (!session || Date.now() > session.expiresAt) return null;
  return `Bearer ${btoa(JSON.stringify(session))}`;
}
