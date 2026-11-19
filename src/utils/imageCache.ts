/**
 * Legacy ImageCache Compatibility Layer
 * Wraps the high-performance priority-based FrameManager.
 */

import { frameManager, DecodedFrame } from './frameManager';

class ImageCacheAdapter {
  public getImage(frameNumber: number): HTMLImageElement | null {
    const frame = frameManager.getFrame(frameNumber);
    if (frame && 'naturalWidth' in frame) {
      return frame as HTMLImageElement;
    }
    return null;
  }

  public getFrame(frameNumber: number): DecodedFrame | null {
    return frameManager.getFrame(frameNumber);
  }

  public isFrameLoaded(frameNumber: number): boolean {
    return frameManager.isFrameLoaded(frameNumber);
  }

  public loadFrame(frameNumber: number, highPriority = false): Promise<DecodedFrame> {
    return frameManager.requestFrame(frameNumber, highPriority);
  }

  public preloadWindow(currentFrame: number, direction: 'down' | 'up' | 'idle' = 'idle') {
    frameManager.updatePreloadWindow(currentFrame, direction);
  }

  public getLoadedCount(): number {
    return frameManager.getCacheSize();
  }
}

export const imageCache = new ImageCacheAdapter();
