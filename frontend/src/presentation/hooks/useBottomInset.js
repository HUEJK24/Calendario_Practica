import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ANDROID_NAV_BAR = 48;

export function useBottomInset() {
  const insets = useSafeAreaInsets();
  if (Platform.OS !== 'android') return insets.bottom;
  return Math.max(insets.bottom, ANDROID_NAV_BAR);
}
