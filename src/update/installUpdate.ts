import ReactNativeBlobUtil from 'react-native-blob-util';

const APK_MIME = 'application/vnd.android.package-archive';

/**
 * Downloads the APK into the app's own cache folder and opens Android's
 * installer on it. No browser is involved. `onProgress` gets a value from 0 to 1.
 */
export async function downloadAndInstall(
  apkUrl: string,
  onProgress: (fraction: number) => void,
): Promise<void> {
  const path = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/update.apk`;

  // Remove a leftover file from an earlier attempt.
  if (await ReactNativeBlobUtil.fs.exists(path)) {
    await ReactNativeBlobUtil.fs.unlink(path);
  }

  const response = await ReactNativeBlobUtil.config({ path })
    .fetch('GET', apkUrl)
    .progress({ interval: 250 }, (received, total) => {
      const r = Number(received);
      const t = Number(total);
      if (t > 0) {
        onProgress(r / t);
      }
    });

  const status = response.info().status;
  if (status !== 200) {
    throw new Error(`Download failed with HTTP ${status}`);
  }

  await ReactNativeBlobUtil.android.actionViewIntent(path, APK_MIME);
}
