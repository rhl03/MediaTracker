import { checkForUpdate, parseRelease } from '../github';

const release = {
  tag_name: 'v1.2.0',
  html_url: 'https://github.com/rhl03/MediaTracker/releases/tag/v1.2.0',
  assets: [
    {
      name: 'MediaTracker-1.2.0.apk',
      content_type: 'application/vnd.android.package-archive',
      browser_download_url:
        'https://github.com/rhl03/MediaTracker/releases/download/v1.2.0/MediaTracker-1.2.0.apk',
    },
  ],
};

function fakeFetch(status: number, body: unknown): typeof fetch {
  return (async () =>
    ({
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    }) as Response) as typeof fetch;
}

describe('parseRelease', () => {
  it('reads version, APK link and page link', () => {
    expect(parseRelease(release)).toEqual({
      version: '1.2.0',
      apkUrl:
        'https://github.com/rhl03/MediaTracker/releases/download/v1.2.0/MediaTracker-1.2.0.apk',
      pageUrl: 'https://github.com/rhl03/MediaTracker/releases/tag/v1.2.0',
    });
  });

  it('finds an APK by file name when the content type is generic', () => {
    const generic = {
      ...release,
      assets: [{ ...release.assets[0], content_type: 'application/octet-stream' }],
    };
    expect(parseRelease(generic)?.apkUrl).toContain('.apk');
  });

  it('returns null when there is no APK', () => {
    expect(parseRelease({ ...release, assets: [] })).toBeNull();
  });

  it('returns null for a tag that is not a version', () => {
    expect(parseRelease({ ...release, tag_name: 'latest' })).toBeNull();
  });

  it('returns null for unexpected JSON', () => {
    expect(parseRelease(null)).toBeNull();
    expect(parseRelease('nope')).toBeNull();
    expect(parseRelease({ message: 'Not Found' })).toBeNull();
  });
});

describe('checkForUpdate', () => {
  it('returns the update when GitHub has a newer version', async () => {
    const update = await checkForUpdate('1.1.0', fakeFetch(200, release));
    expect(update?.version).toBe('1.2.0');
  });

  it('returns null when already on the latest version', async () => {
    expect(await checkForUpdate('1.2.0', fakeFetch(200, release))).toBeNull();
  });

  it('returns null when GitHub has no releases (404)', async () => {
    expect(await checkForUpdate('1.1.0', fakeFetch(404, { message: 'Not Found' }))).toBeNull();
  });

  it('returns null when the network fails', async () => {
    const failing = (async () => {
      throw new Error('offline');
    }) as typeof fetch;
    expect(await checkForUpdate('1.1.0', failing)).toBeNull();
  });
});
