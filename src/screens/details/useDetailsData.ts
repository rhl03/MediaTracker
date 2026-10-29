import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import type {
  Episode,
  EpisodeRef,
  LoadedDetails,
  SeasonSummary,
  Status,
  TrackedTitle,
} from '../../domain/types';
import { toNewTitle } from '../../domain/newTitle';
import {
  airedEpisodes,
  episodeKey,
  episodesUpTo,
  isoDate,
  statusAfterMark,
} from '../../domain/progress';
import { getSeason, loadDetails } from '../../tmdb/api';
import { describeTmdbError } from '../../tmdb/client';
import { getAppDb } from '../../db/appDb';
import {
  addTitle,
  getTitle,
  markMovieWatched,
  setStatus,
  updateTotalEpisodes,
} from '../../db/titles';
import { listWatched, markEpisodes, unmarkEpisode } from '../../db/episodes';

type DetailsParams = RootStackParamList['Details'];

const NO_SEASONS: SeasonSummary[] = [];

function sameEpisode(a: EpisodeRef, b: EpisodeRef): boolean {
  return (
    a.seasonNumber === b.seasonNumber && a.episodeNumber === b.episodeNumber
  );
}

function mergeEpisodes(
  previous: readonly EpisodeRef[],
  added: readonly EpisodeRef[],
): EpisodeRef[] {
  const keys = new Set(previous.map(episodeKey));
  return [...previous, ...added.filter(r => !keys.has(episodeKey(r)))];
}

export function useDetailsData({ mediaType, tmdbId }: DetailsParams) {
  const [loaded, setLoaded] = useState<LoadedDetails | null>(null);
  const [tracked, setTracked] = useState<TrackedTitle | null>(null);
  const [watched, setWatched] = useState<EpisodeRef[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    let cancelled = false;

    async function run() {
      setError(null); try {
        const db = await getAppDb();
        const [details, initialLocal] = await Promise.all([
          loadDetails(mediaType, tmdbId),
          getTitle(db, mediaType, tmdbId),
        ]);
        let local = initialLocal;

        if (
          local !== null &&
          details.mediaType === 'tv' &&
          local.totalEpisodes !== details.details.totalEpisodes
        ) {
          await updateTotalEpisodes(
            db,
            local.id,
            details.details.totalEpisodes,
          );
          local = await getTitle(db, mediaType, tmdbId);
        }

        const watchedList =
          local !== null ? await listWatched(db, local.id) : [];

        if (!cancelled) {
          setLoaded(details);
          setTracked(local);
          setWatched(watchedList);
        }
      } catch (e) {
        if (!cancelled) {
          setError(describeTmdbError(e));
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [mediaType, tmdbId]);

  useFocusEffect(load);

  const seasons = useMemo(
    () => (loaded?.mediaType === 'tv' ? loaded.details.seasons : NO_SEASONS),
    [loaded],
  );

  async function reloadLocal() {
    const db = await getAppDb();
    const local = await getTitle(db, mediaType, tmdbId);
    setTracked(local);
    setWatched(local !== null ? await listWatched(db, local.id) : []);
  }

  async function add(status: Status) {
    if (loaded === null) {
      return;
    }
    try {
      const db = await getAppDb();
      await addTitle(db, toNewTitle(loaded, status), Date.now());
      await reloadLocal();
    } catch (e) {
      console.log('Add failed:', e);
    }
  }

  async function changeStatus(status: Status) {
    if (tracked === null || tracked.status === status) {
      return;
    }
    try {
      const db = await getAppDb();
      await setStatus(db, tracked.id, status);
      await reloadLocal();
    } catch (e) {
      console.log('Status change failed:', e);
    }
  }

  // "Mark as Done" for series (ticks every aired episode),
  // "Mark as watched" for movies.
  async function finish() {
    if (tracked === null || loaded === null) {
      return;
    }
    setTracked({ ...tracked, status: 'done' });
    try {
      const db = await getAppDb();
      const now = Date.now();
      if (loaded.mediaType === 'movie') {
        await markMovieWatched(db, tracked.id, now);
      } else {
        const lists = await Promise.all(
          seasons.map(s => getSeason(tmdbId, s.seasonNumber)),
        );
        const aired = airedEpisodes(lists.flat(), isoDate(new Date()));
        setWatched(previous => mergeEpisodes(previous, aired));
        await markEpisodes(db, tracked.id, aired, now);
        await setStatus(db, tracked.id, 'done');
      }
    } catch (e) {
      console.log('Finish failed:', e);
    }
    await reloadLocal();
  }

  async function toggleEpisode(episode: Episode, isWatched: boolean) {
    if (tracked === null) {
      return;
    }
    const ref: EpisodeRef = {
      seasonNumber: episode.seasonNumber,
      episodeNumber: episode.episodeNumber,
    };
    const toMark = episodesUpTo(seasons, ref);
    const nextStatus = statusAfterMark(tracked.status);

    // 1. Update the screen right away.
    if (isWatched) {
      setWatched(previous => previous.filter(r => !sameEpisode(r, ref)));
    } else {
      setWatched(previous => mergeEpisodes(previous, toMark));
      if (nextStatus !== tracked.status) {
        setTracked({ ...tracked, status: nextStatus });
      }
    }

    // 2. Write to the database in the background.
    try {
      const db = await getAppDb();
      if (isWatched) {
        await unmarkEpisode(db, tracked.id, ref);
      } else {
        await markEpisodes(db, tracked.id, toMark, Date.now());
        if (nextStatus !== tracked.status) {
          await setStatus(db, tracked.id, nextStatus);
        }
      }
    } catch (e) {
      console.log('Toggle failed:', e);
    }

    // 3. Reload, so the screen always ends up showing what is stored.
    await reloadLocal();
  }

  // A toggle function that stays the same between renders, so the
  // memoized episode rows do not all redraw on every tap.
  const toggleRef = useRef(toggleEpisode);
  useEffect(() => {
    toggleRef.current = toggleEpisode;
  });
  const onToggleEpisode = useCallback(
    (episode: Episode, isWatched: boolean) => {
      toggleRef.current(episode, isWatched);
    },
    [],
  );

  return {
    loaded,
    tracked,
    watched,
    error,
    seasons,
    add,
    changeStatus,
    finish,
    onToggleEpisode,
  };
}
