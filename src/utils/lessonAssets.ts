import type { ImageSourcePropType } from 'react-native';

// Bundled images that lesson markdown can reference via an `asset:<key>` src.
// `require` must be a static literal, so this map is the single place that knows
// about bundled lesson images.
const LESSON_ASSETS: Record<string, ImageSourcePropType> = {
  'ds-mind-map': require('../assets/mind-map.png'),
};

const ASSET_PREFIX = 'asset:';

/**
 * Resolves a lesson image markdown src to a bundled image source.
 * Accepts either a raw key (`ds-mind-map`) or a prefixed one (`asset:ds-mind-map`).
 * Returns undefined for anything that isn't a known bundled asset.
 */
export function resolveLessonAsset(src: string): ImageSourcePropType | undefined {
  const key = src.startsWith(ASSET_PREFIX) ? src.slice(ASSET_PREFIX.length) : src;
  return LESSON_ASSETS[key];
}
