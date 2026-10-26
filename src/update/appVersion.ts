import { getVersion } from 'react-native-device-info';

// Read from the installed APK (Android's versionName), not from package.json,
// so the app always reports the version that is actually installed.
export const APP_VERSION: string = getVersion();
