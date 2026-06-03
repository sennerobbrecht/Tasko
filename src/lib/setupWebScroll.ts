import { Platform } from 'react-native';

/** Expo web export zet body overflow:hidden — hier scroll op kleine schermen mogelijk maken */
export function setupWebScroll() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return;
  }

  document.body.style.overflow = 'auto';
  document.documentElement.style.overflow = 'auto';

  const root = document.getElementById('root');
  if (root) {
    root.style.overflow = 'auto';
    root.style.height = 'auto';
    root.style.minHeight = '100vh';
  }
}
