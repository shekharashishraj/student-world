import { readStoredSession } from './api';

type LogLevel = 'info' | 'warn' | 'error';

export async function logClientEvent(level: LogLevel, event: string, message: string, metadata: Record<string, unknown> = {}) {
  if (import.meta.env.DEV) {
    const consoleMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    consoleMethod(`[${event}] ${message}`, metadata);
  }

  try {
    const session = readStoredSession();
    await fetch('/api/client-log', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'content-type': 'application/json',
        'x-lti-user-id': session.ltiUserId,
        'x-display-name': session.displayName,
        'x-country-hint': session.countryHint,
        'x-lti-locale': session.locale,
      },
      body: JSON.stringify({
        level,
        event,
        message,
        metadata,
      }),
    });
  } catch {
    // Do not recurse on client logging failures.
  }
}
