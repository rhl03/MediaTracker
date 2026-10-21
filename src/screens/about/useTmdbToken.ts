import { useState } from 'react';
import { getAppDb } from '../../db/appDb';
import { deleteSetting, setSetting } from '../../db/settings';
import {
  describeTmdbError,
  getTmdbToken,
  hasTmdbToken,
  setTmdbToken,
  tmdbGet,
} from '../../tmdb/client';
import { clearCache } from '../../tmdb/cache';

export type TokenState =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'saved' }
  | { kind: 'removed' }
  | { kind: 'error'; message: string };

export function useTmdbToken() {
  const [input, setInput] = useState('');
  const [hasToken, setHasToken] = useState(hasTmdbToken());
  const [state, setState] = useState<TokenState>({ kind: 'idle' });

  async function saveToken(): Promise<void> {
    const value = input.trim();
    if (value === '') {
      return;
    }
    setState({ kind: 'checking' });

    const previousToken = getTmdbToken();
    setTmdbToken(value);
    clearCache();

    try {
      await tmdbGet('/authentication');
      const db = await getAppDb();
      await setSetting(db, 'tmdbToken', value);
      setInput('');
      setHasToken(true);
      setState({ kind: 'saved' });
    } catch (e) {
      // Keep the old token working if the new one is wrong.
      setTmdbToken(previousToken);
      clearCache();
      setState({ kind: 'error', message: describeTmdbError(e) });
    }
  }

  async function removeToken(): Promise<void> {
    try {
      const db = await getAppDb();
      await deleteSetting(db, 'tmdbToken');
      setTmdbToken(null);
      clearCache();
      setHasToken(false);
      setState({ kind: 'removed' });
    } catch (e) {
      console.log('Could not remove token:', e);
    }
  }

  const saveDisabled = input.trim() === '' || state.kind === 'checking';

  return {
    input,
    setInput,
    hasToken,
    state,
    saveToken,
    removeToken,
    saveDisabled,
  };
}
