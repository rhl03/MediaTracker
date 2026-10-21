import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import type { Status, TrackedTitle } from '../../domain/types';
import { STATUS_TABS } from '../../components/StatusFilter';

function statusIndex(status: Status): number {
  return STATUS_TABS.findIndex(tab => tab.status === status);
}

// Moves the status tab underline when the stored status changes.
export function useStatusProgress(tracked: TrackedTitle | null) {
  const statusProgress = useRef(new Animated.Value(0)).current;
  const shownStatus = useRef<Status | null>(null);

  useEffect(() => {
    if (tracked === null) {
      return;
    }
    const target = statusIndex(tracked.status);
    if (shownStatus.current === null) {
      statusProgress.setValue(target);
    } else if (shownStatus.current !== tracked.status) {
      Animated.timing(statusProgress, {
        toValue: target,
        duration: 220,
        useNativeDriver: false,
      }).start();
    }
    shownStatus.current = tracked.status;
  }, [tracked, statusProgress]);

  return statusProgress;
}
