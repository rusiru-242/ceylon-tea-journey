import { useState, useEffect, useCallback, useRef } from 'react';
import { frameManager, DecodedFrame } from '../utils/frameManager';

export interface UseFrameLoaderReturn {
  isReady: boolean;
  loadProgress: number;
  error: string | null;
  retry: () => void;
  bypassError: () => void;
  preloadAround: (frameIndex: number, direction?: 'down' | 'up' | 'idle') => void;
  getFrameImage: (frameIndex: number) => DecodedFrame | null;
  requestFrame: (frameIndex: number, isHighPriority?: boolean) => Promise<DecodedFrame>;
}

export function useFrameLoader(): UseFrameLoaderReturn {
  const [isReady, setIsReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState(25);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const isMounted = useRef(true);

  const startInitialLoad = useCallback(() => {
    setError(null);
    setLoadProgress(40);

    // 1. Load Frame 1 as the primary critical asset with highest priority
    frameManager.requestFrame(1, true)
      .then(() => {
        if (!isMounted.current) return;
        setLoadProgress(100);
        setIsReady(true);

        // 2. Preload immediate initial buffer (frames 2 to 15) in the background
        frameManager.updatePreloadWindow(1, 'down');

        // 3. Preload key chapter anchor frames in background with low priority
        const milestones = [91, 216, 366, 521, 706, 826, 916, 991, 1131, 1281, 1406, 1493, 1649];
        for (const m of milestones) {
          frameManager.requestFrame(m, false).catch(() => {});
        }
      })
      .catch((err) => {
        if (!isMounted.current) return;
        console.error('[useFrameLoader] Initial frame load failed:', err);
        setError('Unable to load initial cinematic film frame. Please check your network connection.');
      });
  }, []);

  useEffect(() => {
    isMounted.current = true;
    startInitialLoad();

    return () => {
      isMounted.current = false;
    };
  }, [startInitialLoad, attempt]);

  const retry = useCallback(() => {
    setAttempt((prev) => prev + 1);
  }, []);

  const bypassError = useCallback(() => {
    setIsReady(true);
  }, []);

  const preloadAround = useCallback((frameIndex: number, direction: 'down' | 'up' | 'idle' = 'idle') => {
    frameManager.updatePreloadWindow(frameIndex, direction);
  }, []);

  const getFrameImage = useCallback((frameIndex: number): DecodedFrame | null => {
    // Check direct or fallback to nearest available decoded frame to avoid blanks
    const result = frameManager.getNearestFrame(frameIndex, 6);
    return result ? result.img : null;
  }, []);

  const requestFrame = useCallback((frameIndex: number, isHighPriority = false) => {
    return frameManager.requestFrame(frameIndex, isHighPriority);
  }, []);

  return {
    isReady,
    loadProgress,
    error,
    retry,
    bypassError,
    preloadAround,
    getFrameImage,
    requestFrame,
  };
}
