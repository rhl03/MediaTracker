import React from 'react';
import { ActivityIndicator, Animated, StyleSheet, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import type { Episode, SeasonSummary } from '../../../domain/types';
import { episodeKey, isAired } from '../../../domain/progress';
import { EpisodeRow } from '../../../components/EpisodeRow';

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView);

type Props = {
  seasons: SeasonSummary[];
  selectedSeason: number;
  height: number;
  pagerRef: React.RefObject<PagerView | null>;
  onPageScroll: ReturnType<typeof Animated.event>;
  onPageSelected: (position: number) => void;
  onPageLayout: (seasonNumber: number, height: number) => void;
  episodesBySeason: Record<number, Episode[]>;
  watchedKeys: ReadonlySet<ReturnType<typeof episodeKey>>;
  today: string;
  disabled: boolean;
  onToggleEpisode: (episode: Episode, isWatched: boolean) => void;
};

export function SeasonPager({
  seasons,
  selectedSeason,
  height,
  pagerRef,
  onPageScroll,
  onPageSelected,
  onPageLayout,
  episodesBySeason,
  watchedKeys,
  today,
  disabled,
  onToggleEpisode,
}: Props): React.JSX.Element {
  return (
    <AnimatedPagerView
      ref={pagerRef}
      style={{ height }}
      initialPage={Math.max(
        0,
        seasons.findIndex(s => s.seasonNumber === selectedSeason),
      )}
      onPageScroll={onPageScroll}
      onPageSelected={e => onPageSelected(e.nativeEvent.position)}
    >
      {seasons.map(season => {
        const seasonEpisodes = episodesBySeason[season.seasonNumber];
        return (
          <View key={season.seasonNumber}>
            <View
              onLayout={e =>
                onPageLayout(season.seasonNumber, e.nativeEvent.layout.height)
              }
            >
              {seasonEpisodes === undefined ? (
                <ActivityIndicator style={styles.spinner} color="#a8c7fa" />
              ) : (
                seasonEpisodes.map(episode => (
                  <EpisodeRow
                    key={episode.episodeNumber}
                    episode={episode}
                    watched={watchedKeys.has(episodeKey(episode))}
                    aired={isAired(episode.airDate, today)}
                    disabled={disabled}
                    onToggle={onToggleEpisode}
                  />
                ))
              )}
            </View>
          </View>
        );
      })}
    </AnimatedPagerView>
  );
}

const styles = StyleSheet.create({
  spinner: {
    marginVertical: 24,
  },
});
