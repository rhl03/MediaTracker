import type {
  Badge,
  Episode,
  EpisodeRef,
  NextEpisode,
  SeasonSummary,
  Status,
  TrackedTitle,
} from './types';

// ---- Milestone 3 ----

export function progressPercent(watched: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  const percent = Math.round((watched / total) * 100);
  return Math.min(percent, 100);
}

export function latestEpisode(
  watched: readonly EpisodeRef[],
): EpisodeRef | null {
  let best: EpisodeRef | null = null;
  for (const ref of watched) {
    if (
      best === null ||
      ref.seasonNumber > best.seasonNumber ||
      (ref.seasonNumber === best.seasonNumber &&
        ref.episodeNumber > best.episodeNumber)
    ) {
      best = ref;
    }
  }
  return best;
}

export function progressLabel(latest: EpisodeRef | null): string {
  if (latest === null) {
    return 'Not started';
  }
  return `S${latest.seasonNumber} E${latest.episodeNumber}`;
}

export function progressBadge(title: TrackedTitle): Badge {
  if (title.status === 'done') {
    return { kind: 'check' };
  }
  if (title.mediaType === 'movie') {
    return { kind: 'none' };
  }
  if (title.status === 'watchlist') {
    return { kind: 'none' };
  }
  return {
    kind: 'percent',
    value: progressPercent(title.watchedCount, title.totalEpisodes),
  };
}


export function episodeKey(ref: EpisodeRef): string {
  return `${ref.seasonNumber}:${ref.episodeNumber}`;
}

export function episodesUpTo(
  seasons: readonly SeasonSummary[],
  target: EpisodeRef,
): EpisodeRef[] {
  const refs: EpisodeRef[] = [];
  for (const season of seasons) {
    if (season.seasonNumber > target.seasonNumber) {
      continue;
    }
    const last =
      season.seasonNumber === target.seasonNumber
        ? target.episodeNumber
        : season.episodeCount;
    for (let episode = 1; episode <= last; episode++) {
      refs.push({ seasonNumber: season.seasonNumber, episodeNumber: episode });
    }
  }
  return refs;
}

export function statusAfterMark(current: Status): Status {
  return current === 'watchlist' ? 'watching' : current;
}

export function nextToWatch(
  seasons: readonly SeasonSummary[],
  watched: readonly EpisodeRef[],
): EpisodeRef | null {
  const first = seasons[0];
  const latest = latestEpisode(watched);

  if (latest === null) {
    return first !== undefined
      ? { seasonNumber: first.seasonNumber, episodeNumber: 1 }
      : null;
  }

  const index = seasons.findIndex(s => s.seasonNumber === latest.seasonNumber);
  const current = seasons[index];
  if (current !== undefined && latest.episodeNumber < current.episodeCount) {
    return {
      seasonNumber: latest.seasonNumber,
      episodeNumber: latest.episodeNumber + 1,
    };
  }

  const following = seasons[index + 1];
  return following !== undefined
    ? { seasonNumber: following.seasonNumber, episodeNumber: 1 }
    : null;
}

// ---- Dates ----

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function isoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function shortDate(iso: string): string | null {
  const [, month, day] = iso.split('-');
  const monthName = MONTHS[Number(month) - 1];
  if (monthName === undefined || day === undefined) {
    return null;
  }
  return `${Number(day)} ${monthName}`;
}

export function isAired(airDate: string | null, today: string): boolean {
  return airDate !== null && airDate < today;
}

export function formatNextEpisode(
  next: NextEpisode | null,
  today: string,
): string | null {
  if (next === null || next.airDate < today) {
    return null;
  }
  const date = shortDate(next.airDate);
  if (date === null) {
    return null;
  }
  return `Next: S${next.seasonNumber} E${next.episodeNumber} · ${date}`;
}

export function airedEpisodes(
  episodes: readonly Episode[],
  today: string,
): EpisodeRef[] {
  return episodes
    .filter(episode => isAired(episode.airDate, today))
    .map(episode => ({
      seasonNumber: episode.seasonNumber,
      episodeNumber: episode.episodeNumber,
    }));
}
