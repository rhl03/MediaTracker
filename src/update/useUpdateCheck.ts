import { useEffect, useState } from 'react';
import { APP_VERSION } from './appVersion';
import { checkForUpdate, type AvailableUpdate } from './github';

/**
 * Checks GitHub once when the component mounts.
 * Returns the available update, or null while checking, when offline,
 * or when the app is already up to date.
 */
export function useUpdateCheck(): AvailableUpdate | null {
  const [update, setUpdate] = useState<AvailableUpdate | null>(null);

  useEffect(() => {
    let cancelled = false;

    checkForUpdate(APP_VERSION).then(result => {
      if (!cancelled) {
        setUpdate(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return update;
}
