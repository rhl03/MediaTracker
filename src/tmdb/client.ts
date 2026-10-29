
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export class TmdbError extends Error {
  status: number;

  constructor(status: number) {
    super(`TMDB request failed with status ${status}`);
    this.name = 'TmdbError';
    this.status = status;
    Object.setPrototypeOf(this, TmdbError.prototype);
  }
}

// The user's own token, loaded from SQLite at start.
let token: string | null = null;

export function setTmdbToken(value: string | null): void {
  token = value;
}

export function getTmdbToken(): string | null {
  return token;
}

export function hasTmdbToken(): boolean {
  return token !== null;
}

export async function tmdbGet(
  path: string,
  params: Record<string, string> = {},
  authToken: string | null = token,
): Promise<unknown> {
  if (authToken === null) {
    throw new TmdbError(401);
  }

  const query = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

  const url = `${TMDB_BASE_URL}${path}${query !== '' ? `?${query}` : ''}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new TmdbError(response.status);
  }

  return response.json();
}

export function describeTmdbError(error: unknown): string {
  if (error instanceof TmdbError) {
    if (error.status === 401) {
      return 'No valid TMDB token. Add yours in About (⋮ on the home screen).';
    }

    return `TMDB had a problem (${error.status}). Try again later.`;
  }

  return 'Could not reach TMDB. Check your connection.';
}

