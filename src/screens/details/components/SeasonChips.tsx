import React from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { SeasonSummary } from '../../../domain/types';
import type { ChipLayout } from '../useSeasonPager';

type Props = {
  seasons: SeasonSummary[];
  seasonProgress: Animated.AnimatedAddition;
  rowRef: React.RefObject<React.ComponentRef<typeof ScrollView> | null>;
  onRowLayout: (width: number) => void;
  onChipLayout: (seasonNumber: number, layout: ChipLayout) => void;
  onSelect: (seasonNumber: number) => void;
};

export function SeasonChips({
  seasons,
  seasonProgress,
  rowRef,
  onRowLayout,
  onChipLayout,
  onSelect,
}: Props): React.JSX.Element {
  return (
    <ScrollView
      ref={rowRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.row}
      contentContainerStyle={styles.rowContent}
      onLayout={e => onRowLayout(e.nativeEvent.layout.width)}
    >
      {seasons.map((season, i) => {
        const activeOpacity = seasonProgress.interpolate({
          inputRange: [i - 1, i, i + 1],
          outputRange: [0, 1, 0],
          extrapolate: 'clamp',
        });
        return (
          <Pressable
            key={season.seasonNumber}
            onLayout={e => {
              const { x, width } = e.nativeEvent.layout;
              onChipLayout(season.seasonNumber, { x, width });
            }}
            onPress={() => onSelect(season.seasonNumber)}
          >
            <View style={styles.chip}>
              <Text style={styles.text}>Season {season.seasonNumber}</Text>
              <Animated.View
                style={[styles.active, { opacity: activeOpacity }]}
              >
                <Text style={[styles.text, styles.activeText]}>
                  Season {season.seasonNumber}
                </Text>
              </Animated.View>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: 20,
    marginBottom: 12,
  },
  rowContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: '#24262e',
    overflow: 'hidden',
  },
  active: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 18,
    backgroundColor: '#a8c7fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#9a9ca5',
    fontWeight: 'bold',
  },
  activeText: {
    color: '#121318',
  },
});
