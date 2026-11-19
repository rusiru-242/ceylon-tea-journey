export const TOTAL_FRAMES = 1649;
export const FRAME_WIDTH = 1280;
export const FRAME_HEIGHT = 720;

/**
 * Returns the public URL path for a 1-indexed frame number (1 to 1649).
 * WebP files are formatted as frame-00001.webp through frame-01649.webp.
 */
export function getFramePath(frameNumber: number): string {
  const clamped = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(frameNumber)));
  const padded = String(clamped).padStart(5, '0');
  return `/frames/frame-${padded}.webp`;
}

/**
 * Array of all frame paths in chronological order.
 */
export const FRAME_PATHS: string[] = Array.from(
  { length: TOTAL_FRAMES },
  (_, i) => getFramePath(i + 1)
);
