import type { ClientSession } from '../types';

const STORAGE_KEY = 'ogl200-client-session';

function randomId() {
  return globalThis.crypto?.randomUUID?.() || `req-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
}

function normalizeSession(candidate: Partial<ClientSession>): ClientSession {
  return {
    ltiUserId: candidate.ltiUserId || (import.meta.env.DEV ? 'dev-student' : ''),
    displayName: candidate.displayName || 'Student',
    countryHint: candidate.countryHint || '',
    locale: candidate.locale || '',
  };
}

export function readStoredSession(): ClientSession {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return normalizeSession({});

  try {
    return normalizeSession(JSON.parse(raw));
  } catch {
    return normalizeSession({});
  }
}

export function syncSessionFromUrl(): ClientSession {
  const current = readStoredSession();
  const url = new URL(window.location.href);

  const merged = normalizeSession({
    ltiUserId: url.searchParams.get('ltiUserId') || current.ltiUserId,
    displayName: url.searchParams.get('name') || current.displayName,
    countryHint: url.searchParams.get('country') || current.countryHint,
    locale: url.searchParams.get('locale') || current.locale,
  });

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

  ['ltiUserId', 'name', 'country', 'locale', 'lti'].forEach((key) => url.searchParams.delete(key));
  window.history.replaceState({}, document.title, url.toString());

  return merged;
}

export function updateStoredSession(patch: Partial<ClientSession>): ClientSession {
  const merged = normalizeSession({ ...readStoredSession(), ...patch });
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
}

type RequestOptions = RequestInit & {
  bodyJson?: unknown;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const session = readStoredSession();
  const headers = new Headers(options.headers || {});
  const requestId = randomId();

  headers.set('x-request-id', requestId);
  headers.set('x-lti-user-id', session.ltiUserId);
  headers.set('x-display-name', session.displayName);
  headers.set('x-country-hint', session.countryHint);
  headers.set('x-lti-locale', session.locale);

  if (options.bodyJson !== undefined) {
    headers.set('content-type', 'application/json');
  }

  const response = await fetch(path, {
    ...options,
    headers,
    credentials: 'include',
    body: options.bodyJson !== undefined ? JSON.stringify(options.bodyJson) : options.body,
  });

  if (response.status === 204) return undefined as T;

  const payload = await response.json();
  if (!response.ok) {
    const message = payload?.error?.message || `Request failed with ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}
