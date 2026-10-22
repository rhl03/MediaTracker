import { compareVersions, isNewer, parseVersion } from '../version';

describe('parseVersion', () => {
  it('parses a plain version', () => {
    expect(parseVersion('1.2.3')).toEqual([1, 2, 3]);
  });

  it('accepts a leading v, as in GitHub tags', () => {
    expect(parseVersion('v1.2.3')).toEqual([1, 2, 3]);
  });

  it('ignores surrounding whitespace', () => {
    expect(parseVersion('  v1.2.3\n')).toEqual([1, 2, 3]);
  });

  it('ignores a pre-release suffix', () => {
    expect(parseVersion('1.2.0-beta.1')).toEqual([1, 2, 0]);
  });

  it('handles multi-digit parts', () => {
    expect(parseVersion('1.10.0')).toEqual([1, 10, 0]);
  });

  it('rejects anything that is not major.minor.patch', () => {
    expect(parseVersion('banana')).toBeNull();
    expect(parseVersion('1.2')).toBeNull();
    expect(parseVersion('1.2.3.4')).toBeNull();
    expect(parseVersion('')).toBeNull();
    expect(parseVersion('vv1.2.3')).toBeNull();
  });
});

describe('compareVersions', () => {
  it('returns 0 for equal versions', () => {
    expect(compareVersions([1, 2, 3], [1, 2, 3])).toBe(0);
  });

  it('lets the first differing part decide', () => {
    expect(compareVersions([2, 0, 0], [1, 9, 9])).toBeGreaterThan(0);
    expect(compareVersions([1, 1, 0], [1, 0, 9])).toBeGreaterThan(0);
    expect(compareVersions([1, 0, 1], [1, 0, 2])).toBeLessThan(0);
  });
});

describe('isNewer', () => {
  it('detects a newer minor version with a v prefix', () => {
    expect(isNewer('v1.2.0', '1.1.0')).toBe(true);
  });

  it('is false for the same version', () => {
    expect(isNewer('1.1.0', '1.1.0')).toBe(false);
    expect(isNewer('v1.1.0', '1.1.0')).toBe(false);
  });

  it('compares numbers, not text', () => {
    expect(isNewer('1.10.0', '1.9.0')).toBe(true);
  });

  it('is false for an older version', () => {
    expect(isNewer('1.0.9', '1.1.0')).toBe(false);
  });

  it('is false when either version cannot be parsed', () => {
    expect(isNewer('banana', '1.0.0')).toBe(false);
    expect(isNewer('2.0.0', 'banana')).toBe(false);
  });
});
