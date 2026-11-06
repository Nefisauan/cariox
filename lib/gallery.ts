import { fallbackContent } from './content/fallback';
export const photos = fallbackContent.photos;
export const photoPath = (index: number) => photos[index].url;
