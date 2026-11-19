/**
 * High-Performance Priority-Based Cinematic Frame Manager
 * 
 * Features:
 * - Off-thread asynchronous decoding via createImageBitmap() where supported
 * - Robust fallback to HTMLImageElement with async decode()
 * - Strictly bounded activeLoads counter to eliminate queue deadlocks
 * - Priority queue: Current frame > Lookahead buffer > Lookbehind buffer > Milestone anchors
 * - Request deduplication & AbortController support for stale request cancellation
 * - Memory-aware LRU cache with explicit bitmap.close() to prevent GC pauses
 * - Target nearest-frame fallback to prevent any visual stalling or blank screens
 * - Mobile & low-memory device adaptation via navigator.deviceMemory
 */

import { getFramePath, TOTAL_FRAMES } from '../data/frameManifest';

export type DecodedFrame = ImageBitmap | HTMLImageElement;

export interface FrameManagerConfig {
  maxCacheSize?: number;
  maxConcurrentLoads?: number;
}

interface QueuedTask {
  frame: number;
  priority: number; // Higher number = higher priority
  generation: number;
  controller: AbortController;
  resolve: (frame: DecodedFrame) => void;
  reject: (err: Error) => void;
}

export class FrameManager {
  private cache = new Map<number, DecodedFrame>();
  private accessTimes = new Map<number, number>();
  
  // Track in-flight promises and abort controllers for deduplication and cancellation
  private inFlightPromises = new Map<number, Promise<DecodedFrame>>();
  private inFlightControllers = new Map<number, AbortController>();
  
  private queue: QueuedTask[] = [];
  private activeLoads = 0; // Number of HTTP/decode requests currently executing
  
  private maxCacheSize: number;
  private maxConcurrentLoads: number;
  private currentGeneration = 0;
  private currentTargetFrame = 1;
  private supportsImageBitmap: boolean;
  
  // Chapter milestone frames that should be retained for quick navigation
  private milestoneFrames = new Set<number>([
    1, 91, 216, 366, 521, 706, 826, 916, 991, 1131, 1281, 1406, 1493, 1649
  ]);

  // Callback notified whenever a frame finishes loading and is ready for rendering
  private onFrameLoadedListeners = new Set<(frame: number, img: DecodedFrame) => void>();

  constructor(config: FrameManagerConfig = {}) {
    const deviceMemory = typeof navigator !== 'undefined' && (navigator as unknown as { deviceMemory?: number }).deviceMemory;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    
    // Adaptive cache sizing:
    // 1280x720 RGBA is ~3.68 MB per frame.
    // Desktop: 90 frames (~330 MB) allows seamless scrubbing back and forth.
    // Mobile / Low Memory: 45 frames (~165 MB) to prevent browser memory eviction.
    const defaultCacheSize = deviceMemory && deviceMemory <= 4 ? 40 : isMobile ? 45 : 90;
    
    this.maxCacheSize = config.maxCacheSize ?? defaultCacheSize;
    this.maxConcurrentLoads = config.maxConcurrentLoads ?? (isMobile ? 4 : 6);
    this.supportsImageBitmap = typeof window !== 'undefined' && typeof window.createImageBitmap === 'function';
  }

  /**
   * Register a listener for newly loaded frames
   */
  public onFrameLoaded(callback: (frame: number, img: DecodedFrame) => void): () => void {
    this.onFrameLoadedListeners.add(callback);
    return () => {
      this.onFrameLoadedListeners.delete(callback);
    };
  }

  /**
   * Synchronously returns the decoded frame if present in cache, updating LRU access time.
   */
  public getFrame(frameIndex: number): DecodedFrame | null {
    const frame = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(frameIndex)));
    const cached = this.cache.get(frame);
    if (cached) {
      this.accessTimes.set(frame, Date.now());
      return cached;
    }
    return null;
  }

  /**
   * Returns the nearest available loaded frame in cache to prevent blank canvas or freezing
   */
  public getNearestFrame(frameIndex: number, maxSearchDistance = 15): { frame: number; img: DecodedFrame } | null {
    const target = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(frameIndex)));
    
    // Direct match first
    const direct = this.cache.get(target);
    if (direct) {
      this.accessTimes.set(target, Date.now());
      return { frame: target, img: direct };
    }

    // Outward search prioritizing closer frames
    for (let dist = 1; dist <= maxSearchDistance; dist++) {
      const backward = target - dist;
      if (backward >= 1) {
        const img = this.cache.get(backward);
        if (img) {
          this.accessTimes.set(backward, Date.now());
          return { frame: backward, img };
        }
      }
      
      const forward = target + dist;
      if (forward <= TOTAL_FRAMES) {
        const img = this.cache.get(forward);
        if (img) {
          this.accessTimes.set(forward, Date.now());
          return { frame: forward, img };
        }
      }
    }

    return null;
  }

  public isFrameLoaded(frameIndex: number): boolean {
    return this.cache.has(frameIndex);
  }

  /**
   * Request a specific frame with priority and deduplication
   */
  public requestFrame(frameIndex: number, isHighPriority = false): Promise<DecodedFrame> {
    const frame = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(frameIndex)));
    this.currentTargetFrame = frame;

    // 1. In cache -> Return immediately
    const cached = this.cache.get(frame);
    if (cached) {
      this.accessTimes.set(frame, Date.now());
      return Promise.resolve(cached);
    }

    // 2. Already in-flight -> Return existing promise
    const inFlight = this.inFlightPromises.get(frame);
    if (inFlight) {
      return inFlight;
    }

    // 3. Increment generation on high-priority change to purge stale queued requests
    if (isHighPriority) {
      this.currentGeneration++;
      this.pruneStaleQueue(frame);
    }

    // 4. Create and enqueue task
    const controller = new AbortController();
    const promise = new Promise<DecodedFrame>((resolve, reject) => {
      const task: QueuedTask = {
        frame,
        priority: isHighPriority ? 1000 : 100,
        generation: this.currentGeneration,
        controller,
        resolve,
        reject,
      };

      if (isHighPriority) {
        // High priority frames jump to head of queue
        this.queue.unshift(task);
      } else {
        this.insertByPriority(task);
      }

      this.processQueue();
    });

    this.inFlightPromises.set(frame, promise);
    this.inFlightControllers.set(frame, controller);
    return promise;
  }

  /**
   * Preload a sliding directional window around the current target frame
   */
  public updatePreloadWindow(currentFrame: number, direction: 'down' | 'up' | 'idle' = 'idle') {
    const frame = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(currentFrame)));
    this.currentTargetFrame = frame;

    // Prune queue of items that are far away from current viewport
    this.pruneStaleQueue(frame);

    // Dynamic buffer sizing based on scroll direction
    const forwardCount = direction === 'down' ? 20 : direction === 'up' ? 8 : 12;
    const backwardCount = direction === 'up' ? 20 : direction === 'down' ? 6 : 10;

    // Preload forward buffer (decreasing priority with distance)
    for (let offset = 1; offset <= forwardCount; offset++) {
      const target = frame + offset;
      if (target <= TOTAL_FRAMES && !this.isFrameLoaded(target) && !this.inFlightPromises.has(target)) {
        this.enqueuePreload(target, 500 - offset * 10);
      }
    }

    // Preload backward buffer
    for (let offset = 1; offset <= backwardCount; offset++) {
      const target = frame - offset;
      if (target >= 1 && !this.isFrameLoaded(target) && !this.inFlightPromises.has(target)) {
        this.enqueuePreload(target, 300 - offset * 10);
      }
    }

    this.processQueue();
  }

  private enqueuePreload(frame: number, priority: number) {
    if (this.queue.some((q) => q.frame === frame) || this.inFlightPromises.has(frame)) return;

    const controller = new AbortController();
    const promise = new Promise<DecodedFrame>((resolve, reject) => {
      this.insertByPriority({
        frame,
        priority,
        generation: this.currentGeneration,
        controller,
        resolve,
        reject,
      });
      this.processQueue();
    });

    this.inFlightPromises.set(frame, promise);
    this.inFlightControllers.set(frame, controller);
  }

  private insertByPriority(task: QueuedTask) {
    const idx = this.queue.findIndex((q) => q.priority < task.priority);
    if (idx === -1) {
      this.queue.push(task);
    } else {
      this.queue.splice(idx, 0, task);
    }
  }

  /**
   * Discards queued requests that are no longer relevant to the user's current scroll position
   */
  private pruneStaleQueue(currentFrame: number) {
    const MAX_DISTANCE = 35;
    const keep: QueuedTask[] = [];

    for (const task of this.queue) {
      const distance = Math.abs(task.frame - currentFrame);
      if (distance > MAX_DISTANCE && !this.milestoneFrames.has(task.frame)) {
        task.controller.abort();
        task.reject(new Error(`Pruned stale frame ${task.frame}`));
        this.inFlightPromises.delete(task.frame);
        this.inFlightControllers.delete(task.frame);
      } else {
        keep.push(task);
      }
    }

    this.queue = keep;
  }

  private processQueue() {
    // Only dispatch up to maxConcurrentLoads active loads at once
    while (this.activeLoads < this.maxConcurrentLoads && this.queue.length > 0) {
      const task = this.queue.shift();
      if (!task) break;

      if (task.controller.signal.aborted) {
        continue;
      }

      this.activeLoads++;
      this.executeLoad(task);
    }
  }

  /**
   * Performs the network fetch and decoding with automatic fallback
   */
  private async executeLoad(task: QueuedTask) {
    const { frame, controller, resolve, reject } = task;
    const url = getFramePath(frame);

    try {
      let decoded: DecodedFrame | null = null;

      // 1. Try createImageBitmap if supported
      if (this.supportsImageBitmap) {
        try {
          const response = await fetch(url, { signal: controller.signal });
          if (response.ok) {
            const blob = await response.blob();
            decoded = await createImageBitmap(blob);
          }
        } catch (fetchErr: unknown) {
          if ((fetchErr as Error)?.name === 'AbortError') {
            throw fetchErr;
          }
          // Non-abort error: continue to HTMLImage fallback below
        }
      }

      // 2. Fallback to HTMLImageElement if createImageBitmap didn't produce decoded image
      if (!decoded) {
        decoded = await this.loadHtmlImage(url, controller.signal);
      }

      // Store in LRU cache
      this.cache.set(frame, decoded);
      this.accessTimes.set(frame, Date.now());
      this.inFlightPromises.delete(frame);
      this.inFlightControllers.delete(frame);

      // Perform memory-aware eviction if over capacity
      this.evictIfNecessary(this.currentTargetFrame);

      // Notify listeners
      resolve(decoded);
      for (const listener of this.onFrameLoadedListeners) {
        listener(frame, decoded);
      }
    } catch (err: unknown) {
      this.inFlightPromises.delete(frame);
      this.inFlightControllers.delete(frame);
      if ((err as Error)?.name !== 'AbortError') {
        reject(err as Error);
      }
    } finally {
      this.activeLoads--;
      this.processQueue();
    }
  }

  private loadHtmlImage(url: string, signal: AbortSignal): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = 'async';

      const onAbort = () => {
        img.src = '';
        reject(new Error('Aborted'));
      };

      if (signal.aborted) {
        return onAbort();
      }
      signal.addEventListener('abort', onAbort, { once: true });

      img.onload = () => {
        signal.removeEventListener('abort', onAbort);
        if (typeof img.decode === 'function') {
          img.decode().then(() => resolve(img)).catch(() => resolve(img));
        } else {
          resolve(img);
        }
      };

      img.onerror = () => {
        signal.removeEventListener('abort', onAbort);
        reject(new Error(`Failed to load ${url}`));
      };

      img.src = url;
    });
  }

  /**
   * Memory-aware LRU eviction with explicit ImageBitmap.close() to free GPU VRAM immediately
   */
  private evictIfNecessary(currentFrame: number) {
    if (this.cache.size <= this.maxCacheSize) {
      return;
    }

    const candidates: Array<{ frame: number; score: number }> = [];
    const now = Date.now();

    for (const [frame] of this.cache) {
      if (this.milestoneFrames.has(frame)) continue;
      const dist = Math.abs(frame - currentFrame);
      if (dist <= 15) continue; // Keep immediate safety window

      const lastAccess = this.accessTimes.get(frame) ?? 0;
      const recency = now - lastAccess;

      const score = dist * 2 + recency * 0.001;
      candidates.push({ frame, score });
    }

    candidates.sort((a, b) => b.score - a.score);

    const evictCount = this.cache.size - this.maxCacheSize;
    const toEvict = candidates.slice(0, evictCount);

    for (const item of toEvict) {
      const asset = this.cache.get(item.frame);
      if (asset) {
        if ('close' in asset && typeof asset.close === 'function') {
          asset.close();
        } else if ('src' in asset) {
          asset.src = '';
        }
      }
      this.cache.delete(item.frame);
      this.accessTimes.delete(item.frame);
    }
  }

  public getCacheSize(): number {
    return this.cache.size;
  }

  public clear() {
    for (const asset of this.cache.values()) {
      if ('close' in asset && typeof asset.close === 'function') {
        asset.close();
      }
    }
    this.cache.clear();
    this.accessTimes.clear();
    this.queue = [];
  }
}

// Export singleton instance
export const frameManager = new FrameManager();
