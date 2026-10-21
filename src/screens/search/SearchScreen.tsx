import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import type { SearchResult } from '../../domain/types';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { searchTitles } from '../../tmdb/api';
import { describeTmdbError } from '../../tmdb/client';
import { SearchResultCard } from '../../components/SearchResultCard';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

const NUM_COLUMNS = 3;

export function SearchScreen({ navigation }: Props): React.JSX.Element {
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query, 400);

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setError(null);
      setLoading(true);
      try {
        const found = await searchTitles(debounced);
        if (!cancelled) {
          setResults(found);
        }
      } catch (e) {
        if (!cancelled) {
          setError(describeTmdbError(e));
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [debounced]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.searchBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
        </Pressable>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Search movies, series, anime"
          placeholderTextColor="#9a9ca5"
          autoFocus
          returnKeyType="search"
        />
      </View>

      {loading && <Text style={styles.infoText}>Searching…</Text>}
      {error !== null && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        data={results}
        numColumns={NUM_COLUMNS}
        keyExtractor={item => `${item.mediaType}-${item.tmdbId}`}
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <SearchResultCard
              result={item}
              onPress={() =>
                navigation.navigate('Details', {
                  mediaType: item.mediaType,
                  tmdbId: item.tmdbId,
                })
              }
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  searchBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#24262e',
    borderRadius: 28,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    paddingVertical: 0,
    marginLeft: 12,
  },
  infoText: {
    color: '#9a9ca5',
    marginTop: 16,
  },
  errorText: {
    color: '#f28b82',
    marginTop: 16,
  },
  list: {
    flex: 1,
    marginHorizontal: -5,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  cell: {
    flex: 1,
    maxWidth: `${100 / NUM_COLUMNS}%`,
    paddingHorizontal: 5,
    marginBottom: 10,
  },
});
