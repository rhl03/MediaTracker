import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, ScrollView } from 'react-native';
import PagerView from 'react-native-pager-view';
import type { Episode, EpisodeRef, SeasonSummary } from '../../domain/types';
import { latestEpisode, nextToWatch } from '../../domain/progress';
import { getSeason } from '../../tmdb/api';

export type ChipLayout = { x: number; width: number };

function chipCenter(chip: ChipLayout): number {
  return chip.x + chip.width / 2;
}

export function useSeasonPager(
  seasons: SeasonSummary[],
  tmdbId: number,
  watched: EpisodeRef[],
) {
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [episodesBySeason, setEpisodesBySeason] = useState<
    Record<number, Episode[]>
  >({});
  const [pageHeights, setPageHeights] = useState<Record<number, number>>({});

  // The pager writes these two values on the native thread.
  const pagePosition = useRef(new Animated.Value(0)).current;
  const pageOffset = useRef(new Animated.Value(0)).current;
  const seasonProgress = useMemo(
    () => Animated.add(pagePosition, pageOffset),
    [pagePosition, pageOffset],
  );
  const onPageScroll = useMemo(
    () =>
      Animated.event(
        [{ nativeEvent: { position: pagePosition, offset: pageOffset } }],
        { useNativeDriver: true },
      ),
    [pagePosition, pageOffset],
  );
  const seasonProgressReady = useRef(false);

  const pagerRef = useRef<PagerView>(null);
  const chipRowRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const chipLayouts = useRef<Record<number, ChipLayout>>({});
  const chipRowWidth = useRef(0);
  const chipsPositioned = useRef(false);
  const requestedSeasons = useRef(new Set<number>());

  // Pick the starting season once, when the details have loaded:
  // the next episode to watch, else the latest watched, else the first.
  useEffect(() => {
    if (selectedSeason !== null || seasons.length === 0) {
      return;
    }
    const start =
      nextToWatch(seasons, watched)?.seasonNumber ??
      latestEpisode(watched)?.seasonNumber ??
      seasons[0]?.seasonNumber ??
      1;
    setSelectedSeason(start);
  }, [selectedSeason, seasons, watched]);

  // Start the chip highlight on the starting season (only once).
  useEffect(() => {
    if (selectedSeason === null || seasonProgressReady.current) {
      return;
    }
    const index = seasons.findIndex(s => s.seasonNumber === selectedSeason);
    if (index >= 0) {
      pagePosition.setValue(index);
      pageOffset.setValue(0);
      seasonProgressReady.current = true;
    }
  }, [selectedSeason, seasons, pagePosition, pageOffset]);

  // Load every season of this show in the background, the ones closest
  // to the selected season first. Each season is requested only once.
  useEffect(() => {
    if (selectedSeason === null || seasons.length === 0) {
      return;
    }
    const byDistance = [...seasons].sort(
      (a, b) =>
        Math.abs(a.seasonNumber - selectedSeason) -
        Math.abs(b.seasonNumber - selectedSeason),
    );
    for (const { seasonNumber } of byDistance) {
      if (requestedSeasons.current.has(seasonNumber)) {
        continue;
      }
      requestedSeasons.current.add(seasonNumber);
      getSeason(tmdbId, seasonNumber)
        .then(found =>
          setEpisodesBySeason(previous => ({
            ...previous,
            [seasonNumber]: found,
          })),
        )
        .catch(() => {
          // Allow a retry the next time this season is selected.
          requestedSeasons.current.delete(seasonNumber);
        });
    }
  }, [selectedSeason, seasons, tmdbId]);

  // Scroll the chip row so this season's chip is in the middle.
  function centerChip(seasonNumber: number, animated: boolean) {
    const chip = chipLayouts.current[seasonNumber];
    if (chip === undefined || chipRowWidth.current === 0) {
      return;
    }
    chipRowRef.current?.scrollTo({
      x: Math.max(0, chipCenter(chip) - chipRowWidth.current / 2),
      animated,
    });
  }

  function onChipRowLayout(width: number) {
    chipRowWidth.current = width;
  }

  // Put the starting chip in the middle once its size is known.
  function onChipLayout(seasonNumber: number, layout: ChipLayout) {
    chipLayouts.current[seasonNumber] = layout;
    if (
      !chipsPositioned.current &&
      seasonNumber === selectedSeason &&
      chipRowWidth.current > 0
    ) {
      chipsPositioned.current = true;
      centerChip(seasonNumber, false);
    }
  }

  // Tap on a chip: one smooth scroll to the middle.
  function selectSeason(seasonNumber: number) {
    const index = seasons.findIndex(s => s.seasonNumber === seasonNumber);
    if (index >= 0) {
      centerChip(seasonNumber, true);
      pagerRef.current?.setPage(index);
    }
  }

  // Swipe: jump straight to the middle, so fast swipes do not stack up.
  function onPageSelected(position: number) {
    const season = seasons[position];
    if (season === undefined) {
      return;
    }
    centerChip(season.seasonNumber, false);
    setSelectedSeason(season.seasonNumber);
  }

  function onPageLayout(seasonNumber: number, height: number) {
    setPageHeights(previous =>
      previous[seasonNumber] === height
        ? previous
        : { ...previous, [seasonNumber]: height },
    );
  }

  const pagerHeight =
    selectedSeason !== null ? pageHeights[selectedSeason] ?? 200 : 200;

  return {
    selectedSeason,
    episodesBySeason,
    pagerHeight,
    seasonProgress,
    onPageScroll,
    pagerRef,
    chipRowRef,
    onChipRowLayout,
    onChipLayout,
    selectSeason,
    onPageSelected,
    onPageLayout,
  };
}
