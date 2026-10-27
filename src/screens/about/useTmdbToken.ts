import { useState } from 'react';
import { getAppDb } from '../../db/appDb';
import { deleteSetting, setSetting } from '../../db/settings';
import {
  describeTmdbError,
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

    try {
      // Validate the candidate without changing the active token.
      await tmdbGet('/authentication', {}, value);

      // Persist the token only after validation succeeds.
      const db = await getAppDb();
      await setSetting(db, 'tmdbToken', value);

      // Activate the new token after persistence succeeds.
      setTmdbToken(value);
      clearCache();

      setInput('');
      setHasToken(true);
      setState({ kind: 'saved' });
    } catch (e) {
      // The previous active token remains unchanged on failure.
      setState({
        kind: 'error',
        message: describeTmdbError(e),
      });
    }
  }

  async function removeToken(): Promise<void> {
    try {
      const db = await getAppDb();
      await deleteSetting(db, 'tmdbToken');

      setTmdbToken(null);
      clearCache();

      setHasToken(false);
      setInput('');
      setState({ kind: 'removed' });
    } catch (e) {
      console.log('Could not remove token:', e);
      setState({
        kind: 'error',
        message: 'Could not remove the token. Please try again.',
      });
    }
  }

  const saveDisabled =
    input.trim() === '' || state.kind === 'checking';

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

