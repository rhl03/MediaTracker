import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { LoadedDetails } from '../../../domain/types';
import { posterUrl } from '../../../tmdb/images';

type Props = {
  loaded: LoadedDetails;
};

function metaLine(loaded: LoadedDetails): string {
  if (loaded.mediaType === 'tv') {
    const seasons = loaded.details.seasons.length;
    const episodes = loaded.details.totalEpisodes;
    return `Series · ${seasons} ${
      seasons === 1 ? 'season' : 'seasons'
    } · ${episodes} episodes`;
  }
  const year = loaded.details.releaseDate?.slice(0, 4);
  return year !== undefined ? `Movie · ${year}` : 'Movie';
}

export function DetailsHero({ loaded }: Props): React.JSX.Element {
  const uri = posterUrl(loaded.details.posterPath, 'w342');
  const blurUri = posterUrl(loaded.details.posterPath, 'w185');

  return (
    <View style={styles.hero}>
      {blurUri !== null && (
        <Image
          source={{ uri: blurUri }}
          style={StyleSheet.absoluteFill}
          blurRadius={12}
        />
      )}
      <View style={styles.shade} />

      <View style={styles.row}>
        {uri !== null ? (
          <Image source={{ uri }} style={styles.poster} />
        ) : (
          <View style={[styles.poster, styles.placeholder]} />
        )}
        <View style={styles.texts}>
          <Text style={styles.name} numberOfLines={3}>
            {loaded.details.name}
          </Text>
          <Text style={styles.meta}>{metaLine(loaded)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    overflow: 'hidden',
  },
  shade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(18, 19, 24, 0.7)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 24,
  },
  poster: {
    width: 110,
    aspectRatio: 2 / 3,
    borderRadius: 10,
  },
  placeholder: {
    backgroundColor: '#2c2e36',
  },
  texts: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  meta: {
    color: '#c4c6d0',
    fontSize: 13,
    marginTop: 6,
  },
});
