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

function buildApiErrorMessage(path: string, status: number, payload?: unknown): string {
  if (payload && typeof payload === 'object' && 'error' in payload) {
    const nested = (payload as { error?: { message?: unknown } }).error;
    if (nested && typeof nested.message === 'string' && nested.message.trim()) {
      return nested.message;
    }
  }

  if (status === 502 || status === 503 || status === 504) {
    return `The API for ${path} is unavailable. Make sure the backend server is running on port 3000.`;
  }

  return `Request failed with ${status}`;
}

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

  let response: Response;
  try {
    response = await fetch(path, {
      ...options,
      headers,
      credentials: 'include',
      body: options.bodyJson !== undefined ? JSON.stringify(options.bodyJson) : options.body,
    });
  } catch {
    throw new Error(`Unable to reach the API for ${path}. Make sure the backend server is running on port 3000.`);
  }

  if (response.status === 204) return undefined as T;

  const rawText = await response.text();
  const contentType = response.headers.get('content-type') || '';
  const trimmedText = rawText.trim();
  let payload: unknown = undefined;

  if (trimmedText.length > 0) {
    if (contentType.includes('application/json')) {
      try {
        payload = JSON.parse(trimmedText);
      } catch {
        throw new Error(`The API for ${path} returned malformed JSON.`);
      }
    } else if (!response.ok) {
      throw new Error(trimmedText);
    } else {
      throw new Error(`The API for ${path} returned an unexpected ${contentType || 'non-JSON'} response.`);
    }
  }

  if (!response.ok) {
    throw new Error(buildApiErrorMessage(path, response.status, payload));
  }

  return payload as T;
}
