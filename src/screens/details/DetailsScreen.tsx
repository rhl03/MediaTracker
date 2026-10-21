import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import {
  episodeKey,
  formatNextEpisode,
  isoDate,
  nextToWatch,
  progressLabel,
  progressPercent,
} from '../../domain/progress';
import { StatusFilter } from '../../components/StatusFilter';
import { styles } from './styles';
import { useDetailsData } from './useDetailsData';
import { useSeasonPager } from './useSeasonPager';
import { useStatusProgress } from './useStatusProgress';
import { DetailsHero } from './components/DetailsHero';
import { AddButtons } from './components/AddButtons';
import { WatchProgress } from './components/WatchProgress';
import { NextEpisode } from './components/NextEpisode';
import { FinishButton } from './components/FinishButton';
import { SeasonChips } from './components/SeasonChips';
import { SeasonPager } from './components/SeasonPager';

type Props = NativeStackScreenProps<RootStackParamList, 'Details'>;

export function DetailsScreen({ route }: Props): React.JSX.Element {
  const {
    loaded,
    tracked,
    watched,
    error,
    seasons,
    add,
    changeStatus,
    finish,
    onToggleEpisode,
  } = useDetailsData(route.params);
  const pager = useSeasonPager(seasons, route.params.tmdbId, watched);
  const statusProgress = useStatusProgress(tracked);

  const [shown, setShown] = useState(false);
  const contentOpacity = useRef(new Animated.Value(0)).current;

  // Only the first time: wait until the details and the starting season
  // are loaded. After that the page stays visible.
  const firstLoadDone =
    loaded !== null &&
    (loaded.mediaType === 'movie' ||
      seasons.length === 0 ||
      (pager.selectedSeason !== null &&
        pager.episodesBySeason[pager.selectedSeason] !== undefined));

  useEffect(() => {
    if (firstLoadDone && !shown) {
      setShown(true);
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [firstLoadDone, shown, contentOpacity]);

  if (error !== null) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!shown || loaded === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#a8c7fa" />
      </View>
    );
  }

  const today = isoDate(new Date());
  const watchedKeys = new Set(watched.map(episodeKey));
  const isMovie = loaded.mediaType === 'movie';

  const percent =
    tracked !== null
      ? progressPercent(watched.length, tracked.totalEpisodes)
      : 0;
  const showProgress = tracked !== null && !isMovie;
  const upNext = nextToWatch(seasons, watched);
  const progressText =
    upNext !== null ? `Up next · ${progressLabel(upNext)}` : 'All caught up';
  const nextLine =
    loaded.mediaType === 'tv'
      ? formatNextEpisode(loaded.details.nextEpisode, today)
      : null;
  const showFinish = tracked !== null && tracked.status !== 'done';

  return (
    <Animated.ScrollView
      style={{ opacity: contentOpacity }}
      contentContainerStyle={styles.content}
    >
      <DetailsHero loaded={loaded} />

      <View style={styles.body}>
        {loaded.details.overview !== '' && (
          <Text style={styles.overview} numberOfLines={4}>
            {loaded.details.overview}
          </Text>
        )}

        {tracked === null ? (
          <AddButtons onAdd={add} />
        ) : (
          <StatusFilter onChange={changeStatus} progress={statusProgress} />
        )}

        {showProgress && (
          <WatchProgress label={progressText} percent={percent} />
        )}

        {nextLine !== null && <NextEpisode text={nextLine} />}

        {showFinish && <FinishButton isMovie={isMovie} onPress={finish} />}
      </View>

      {seasons.length > 0 && pager.selectedSeason !== null && (
        <>
          <SeasonChips
            seasons={seasons}
            seasonProgress={pager.seasonProgress}
            rowRef={pager.chipRowRef}
            onRowLayout={pager.onChipRowLayout}
            onChipLayout={pager.onChipLayout}
            onSelect={pager.selectSeason}
          />
          <SeasonPager
            seasons={seasons}
            selectedSeason={pager.selectedSeason}
            height={pager.pagerHeight}
            pagerRef={pager.pagerRef}
            onPageScroll={pager.onPageScroll}
            onPageSelected={pager.onPageSelected}
            onPageLayout={pager.onPageLayout}
            episodesBySeason={pager.episodesBySeason}
            watchedKeys={watchedKeys}
            today={today}
            disabled={tracked === null}
            onToggleEpisode={onToggleEpisode}
          />
        </>
      )}
    </Animated.ScrollView>
  );
}
