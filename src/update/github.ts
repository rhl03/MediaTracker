import { isNewer, parseVersion } from './version';

export const RELEASES_REPO = 'rhl03/MediaTracker';
const LATEST_RELEASE_URL = `https://api.github.com/repos/${RELEASES_REPO}/releases/latest`;
const APK_CONTENT_TYPE = 'application/vnd.android.package-archive';
const TIMEOUT_MS = 10_000;

export type AvailableUpdate = {
  version: string;
  apkUrl: string;
  pageUrl: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Turns GitHub's JSON for one release into an AvailableUpdate.
 * Returns null if the shape is unexpected, the tag is not a version,
 * or the release has no APK attached.
 */
export function parseRelease(json: unknown): AvailableUpdate | null {
  if (!isRecord(json)) {
    return null;
  }

  const tag = json.tag_name;
  const pageUrl = json.html_url;
  const assets = json.assets;

  if (typeof tag !== 'string' || typeof pageUrl !== 'string' || !Array.isArray(assets)) {
    return null;
  }
  if (parseVersion(tag) === null) {
    return null;
  }

  const apk = assets.find(
    (asset): asset is Record<string, unknown> =>
      isRecord(asset) &&
      typeof asset.browser_download_url === 'string' &&
      (asset.content_type === APK_CONTENT_TYPE ||
        (typeof asset.name === 'string' && asset.name.toLowerCase().endsWith('.apk'))),
  );
  if (apk === undefined) {
    return null;
  }

  return {
    version: tag.replace(/^v/, ''),
    apkUrl: apk.browser_download_url as string,
    pageUrl,
  };
}

async function requestLatestRelease(
  fetchImpl: typeof fetch,
): Promise<AvailableUpdate | null> {
  const response = await fetchImpl(LATEST_RELEASE_URL, {
    headers: { Accept: 'application/vnd.github+json' },
  });
  if (!response.ok) {
    return null;
  }
  return parseRelease(await response.json());
}

/**
 * Asks GitHub for the latest published release (drafts and pre-releases
 * are excluded by GitHub itself). Returns null on any network or format
 * problem, or after the timeout, so a failed check simply means "no update".
 */
export async function fetchLatestRelease(
  fetchImpl: typeof fetch = fetch,
): Promise<AvailableUpdate | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<null>(resolve => {
    timer = setTimeout(() => resolve(null), TIMEOUT_MS);
  });

  try {
    return await Promise.race([requestLatestRelease(fetchImpl), timeout]);
  } catch {
    return null;
  } finally {
    // Stop the timer whoever won the race, so nothing keeps running afterwards.
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  }
}

/**
 * Returns the update if GitHub has a version newer than `currentVersion`,
 * otherwise null.
 */
export async function checkForUpdate(
  currentVersion: string,
  fetchImpl: typeof fetch = fetch,
): Promise<AvailableUpdate | null> {
  const latest = await fetchLatestRelease(fetchImpl);
  if (latest === null || !isNewer(latest.version, currentVersion)) {
    return null;
  }
  return latest;
}
