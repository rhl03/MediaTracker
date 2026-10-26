import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PagerView from 'react-native-pager-view';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import type { Status, TrackedTitle } from '../../domain/types';
import { STATUS_TABS, StatusFilter } from '../../components/StatusFilter';
import { TitleGrid } from '../../components/TitleGrid';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { usePrefetchTracked } from '../../hooks/usePrefetchTracked';
import { useUpdateCheck } from '../../update/useUpdateCheck';
import { downloadAndInstall } from '../../update/installUpdate';
import { getAppDb } from '../../db/appDb';
import { removeTitle } from '../../db/titles';
import { resetProgress } from '../../db/episodes';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

type PendingAction = 'remove' | 'reset' | 'update';

export function HomeScreen({ navigation }: Props): React.JSX.Element {
  const pagerRef = useRef<PagerView>(null);
  const progress = useRef(new Animated.Value(0)).current;
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<number>>(
    new Set(),
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const [confirming, setConfirming] = useState<PendingAction | null>(null);
  // null = not downloading, otherwise 0..1
  const [downloadProgress, setDownloadProgress] = useState<number | null>(
    null,
  );

  usePrefetchTracked();
  const update = useUpdateCheck();

  const selecting = selectedIds.size > 0;
  const downloading = downloadProgress !== null;

  // While selecting, the phone's back button ends the selection
  // instead of leaving the app.
  useEffect(() => {
    if (!selecting) {
      return;
    }
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        setSelectedIds(new Set());
        return true;
      },
    );
    return () => subscription.remove();
  }, [selecting]);

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function toggleSelected(title: TrackedTitle) {
    setSelectedIds(previous => {
      const next = new Set(previous);
      if (next.has(title.id)) {
        next.delete(title.id);
      } else {
        next.add(title.id);
      }
      return next;
    });
  }

  function onPosterPress(title: TrackedTitle) {
    if (selecting) {
      toggleSelected(title);
      return;
    }
    navigation.navigate('Details', {
      mediaType: title.mediaType,
      tmdbId: title.tmdbId,
    });
  }

  function selectTab(next: Status) {
    clearSelection();
    const index = STATUS_TABS.findIndex(tab => tab.status === next);
    pagerRef.current?.setPage(index);
  }

  async function forEachSelected(action: (id: number) => Promise<void>) {
    try {
      for (const id of selectedIds) {
        await action(id);
      }
    } catch (e) {
      console.log('Action failed:', e);
    }
    clearSelection();
    setRefreshKey(key => key + 1);
  }

  async function startUpdate() {
    if (update === null || downloading) {
      return;
    }
    setDownloadProgress(0);
    try {
      await downloadAndInstall(update.apkUrl, setDownloadProgress);
    } catch (e) {
      console.log('Update failed:', e);
    } finally {
      setDownloadProgress(null);
    }
  }

  function runConfirmed() {
    const action = confirming;
    setConfirming(null);
    if (action === 'remove') {
      forEachSelected(async id => {
        const db = await getAppDb();
        await removeTitle(db, id);
      });
    } else if (action === 'reset') {
      forEachSelected(async id => {
        const db = await getAppDb();
        await resetProgress(db, id);
      });
    } else if (action === 'update') {
      startUpdate();
    }
  }

  const count = selectedIds.size;
  const titles = count === 1 ? '1 title' : `${count} titles`;

  const dialog =
    confirming === 'update'
      ? {
        icon: 'system-update' as const,
        title: `Update to ${update?.version ?? 'the new version'}?`,
        message:
          'The update downloads in the app, then Android asks you to install it. Your lists and progress are kept.',
        confirmLabel: 'Update',
      }
      : confirming === 'reset'
        ? {
          icon: 'restart-alt' as const,
          title: `Reset progress of ${titles}?`,
          message:
            'All watched episodes will be unmarked. Finished titles move back to Watching.',
          confirmLabel: 'Reset',
        }
        : {
          icon: 'delete-outline' as const,
          title: `Remove ${titles}?`,
          message:
            "Your watched episodes will be deleted too. This can't be undone.",
          confirmLabel: 'Remove',
        };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        {selecting ? (
          <View style={[styles.bar, styles.selectionBar]}>
            <Pressable onPress={clearSelection} hitSlop={12}>
              <MaterialIcons name="close" size={24} color="#ffffff" />
            </Pressable>
            <Text style={styles.selectionText}>{count} selected</Text>
            <Pressable
              onPress={() => setConfirming('reset')}
              hitSlop={12}
              style={styles.barIcon}
            >
              <MaterialIcons name="restart-alt" size={24} color="#ffffff" />
            </Pressable>
            <Pressable
              onPress={() => setConfirming('remove')}
              hitSlop={12}
              style={styles.barIcon}
            >
              <MaterialIcons name="delete-outline" size={24} color="#f28b82" />
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={styles.bar}
            onPress={() => navigation.navigate('Search')}
          >
            <MaterialIcons name="search" size={24} color="#9a9ca5" />
            <Text style={styles.searchText}>Search movies, series, anime</Text>
            {downloading ? (
              <Text style={styles.downloadText}>
                {Math.round(downloadProgress * 100)}%
              </Text>
            ) : (
              update !== null && (
                <Pressable
                  onPress={() => setConfirming('update')}
                  hitSlop={12}
                  style={styles.updateIcon}
                  accessibilityLabel={`Update to version ${update.version}`}
                >
                  <MaterialIcons
                    name="system-update"
                    size={24}
                    color="#a8c7fa"
                  />
                </Pressable>
              )
            )}
            <Pressable
              onPress={() => navigation.navigate('About')}
              hitSlop={12}
            >
              <MaterialIcons name="more-vert" size={24} color="#ffffff" />
            </Pressable>
          </Pressable>
        )}

        <StatusFilter onChange={selectTab} progress={progress} />
      </View>

      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        scrollEnabled={!selecting}
        onPageScroll={e =>
          progress.setValue(e.nativeEvent.position + e.nativeEvent.offset)
        }
      >
        {STATUS_TABS.map(tab => (
          <View key={tab.status} style={styles.page}>
            <TitleGrid
              status={tab.status}
              refreshKey={refreshKey}
              selectedIds={selectedIds}
              onPress={onPosterPress}
              onLongPress={toggleSelected}
            />
          </View>
        ))}
      </PagerView>

      <ConfirmDialog
        visible={confirming !== null}
        icon={dialog.icon}
        title={dialog.title}
        message={dialog.message}
        confirmLabel={dialog.confirmLabel}
        onConfirm={runConfirmed}
        onCancel={() => setConfirming(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  header: {
    paddingHorizontal: 16,
  },
  bar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#24262e',
    borderRadius: 28,
    paddingHorizontal: 16,
  },
  selectionBar: {
    backgroundColor: '#2a3550',
  },
  searchText: {
    flex: 1,
    color: '#9a9ca5',
    fontSize: 16,
    marginLeft: 12,
  },
  selectionText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  barIcon: {
    marginLeft: 20,
  },
  updateIcon: {
    marginRight: 16,
  },
  downloadText: {
    color: '#a8c7fa',
    fontWeight: 'bold',
    marginRight: 16,
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
});
