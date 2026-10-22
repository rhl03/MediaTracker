export type Version = [number, number, number];

const VERSION_PATTERN = /^v?(\d+)\.(\d+)\.(\d+)(?:-[0-9A-Za-z.-]+)?$/;

/**
 * Parses "1.2.3" or "v1.2.3" (as used in GitHub tags) into its three parts.
 * A pre-release suffix like "-beta.1" is ignored, matching build.gradle.
 * Returns null for anything that is not major.minor.patch.
 */
export function parseVersion(text: string): Version | null {
  const match = VERSION_PATTERN.exec(text.trim());
  if (match === null) {
    return null;
  }

  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);

  if (![major, minor, patch].every(Number.isSafeInteger)) {
    return null;
  }

  return [major, minor, patch];
}

/**
 * Compares two parsed versions part by part, like comparing dates:
 * the first part that differs decides. Returns a negative number if a < b,
 * 0 if equal, and a positive number if a > b.
 */
export function compareVersions(a: Version, b: Version): number {
  for (let i = 0; i < 3; i++) {
    const difference = a[i]! - b[i]!;
    if (difference !== 0) {
      return difference;
    }
  }
  return 0;
}

/**
 * True only when `candidate` is strictly higher than `current`.
 * If either version cannot be parsed, returns false, so a strange
 * tag on GitHub never shows a false update.
 */
export function isNewer(candidate: string, current: string): boolean {
  const a = parseVersion(candidate);
  const b = parseVersion(current);
  if (a === null || b === null) {
    return false;
  }
  return compareVersions(a, b) > 0;
}
