import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TOTAL_FRAMES } from '../data/frameManifest';
import {
  CHAPTERS,
  Chapter,
  getChapterForFrame,
  getChapterProgress,
  progressToFrame,
  frameToScrollDistance,
  isFinalCupHold,
  getFinalHoldProgress,
  TOTAL_SCROLL_DISTANCE,
} from '../data/chapters';
import { frameManager } from '../utils/frameManager';

gsap.registerPlugin(ScrollTrigger);

export interface ScrollSequenceState {
  currentFrame: number;
  progress: number;
  activeChapter: Chapter;
  chapterProgress: number;
  isFinalHold: boolean;
  finalHoldProgress: number;
  isWhiteStudio: boolean;
  scrollDirection: 'down' | 'up' | 'idle';
}

export interface UseScrollSequenceProps {
  stageRef: React.RefObject<HTMLDivElement | null>;
  onDirectFrameRender?: (frameIndex: number, direction: 'down' | 'up' | 'idle') => void;
}

export function useScrollSequence({
  stageRef,
  onDirectFrameRender,
}: UseScrollSequenceProps) {
  const [sequenceState, setSequenceState] = useState<ScrollSequenceState>({
    currentFrame: 1,
    progress: 0,
    activeChapter: CHAPTERS[0],
    chapterProgress: 0,
    isFinalHold: false,
    finalHoldProgress: 0,
    isWhiteStudio: false,
    scrollDirection: 'idle',
  });

  const triggerRef = useRef<ScrollTrigger | null>(null);
  const targetFrameRef = useRef<number>(1);
  const currentRenderedFrameRef = useRef<number>(1);
  const lastScrollYRef = useRef<number>(0);
  const directionRef = useRef<'down' | 'up' | 'idle'>('idle');
  const animFrameIdRef = useRef<number | null>(null);
  
  // State change throttle tracking
  const activeChapterIdRef = useRef<string>(CHAPTERS[0].id);
  const isWhiteStudioRef = useRef<boolean>(false);
  const isHoldRef = useRef<boolean>(false);
  const lastPctRef = useRef<number>(0);
  const lastChProgRef = useRef<number>(0);
  const lastStateUpdateRef = useRef<number>(0);

  // High-performance 60fps/120fps direct rendering loop decoupled from React
  useEffect(() => {
    let isRunning = true;
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderLoop = () => {
      if (!isRunning) return;

      const target = targetFrameRef.current;
      const current = currentRenderedFrameRef.current;
      const diff = target - current;

      if (prefersReducedMotion) {
        if (Math.round(current) !== Math.round(target)) {
          currentRenderedFrameRef.current = target;
          const rounded = Math.round(target);
          if (onDirectFrameRender) {
            onDirectFrameRender(rounded, directionRef.current);
          }
        }
      } else if (Math.abs(diff) >= 0.1) {
        // Dynamic step: gentle cinematic easing
        const step = Math.abs(diff) > 20 ? 0.35 : 0.22;
        currentRenderedFrameRef.current += diff * step;

        const rounded = Math.min(TOTAL_FRAMES, Math.max(1, Math.round(currentRenderedFrameRef.current)));
        if (onDirectFrameRender) {
          onDirectFrameRender(rounded, directionRef.current);
        }
      } else if (Math.round(current) !== Math.round(target)) {
        currentRenderedFrameRef.current = target;
        const rounded = Math.round(target);
        if (onDirectFrameRender) {
          onDirectFrameRender(rounded, directionRef.current);
        }
      }

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [onDirectFrameRender]);

  // Master GSAP ScrollTrigger
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      const trigger = ScrollTrigger.create({
        trigger: stage,
        start: 'top top',
        end: () => `+=${TOTAL_SCROLL_DISTANCE}`,
        pin: true,
        pinSpacing: true, // Creates pin spacing below stage to prevent footer overlap
        scrub: prefersReducedMotion ? false : 0.65, // Rich, weighted cinematic scrub
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress;
          const target = progressToFrame(progress);
          const clampedTarget = Math.min(TOTAL_FRAMES, Math.max(1, target));
          targetFrameRef.current = clampedTarget;

          // Detect scroll direction
          const currentScrollY = self.scroll();
          if (currentScrollY > lastScrollYRef.current) {
            directionRef.current = 'down';
          } else if (currentScrollY < lastScrollYRef.current) {
            directionRef.current = 'up';
          }
          lastScrollYRef.current = currentScrollY;

          // Intelligent directional preloading
          frameManager.updatePreloadWindow(clampedTarget, directionRef.current);

          // Fast direct render if user stopped or at boundary
          const currentIntFrame = Math.round(clampedTarget);
          const chapter = getChapterForFrame(currentIntFrame);
          const chProg = getChapterProgress(currentIntFrame, chapter);
          const inHold = isFinalCupHold(progress);
          const holdProg = getFinalHoldProgress(progress);
          const isWhite = currentIntFrame >= 985;
          const currentPct = Math.round(progress * 100);

          // Throttled React state update for typography and cards (max ~40 updates/sec)
          const now = performance.now();
          const shouldUpdateState =
            chapter.id !== activeChapterIdRef.current ||
            isWhite !== isWhiteStudioRef.current ||
            inHold !== isHoldRef.current ||
            currentPct !== lastPctRef.current ||
            (Math.abs(chProg - lastChProgRef.current) >= 0.015 && now - lastStateUpdateRef.current > 25);

          if (shouldUpdateState) {
            activeChapterIdRef.current = chapter.id;
            isWhiteStudioRef.current = isWhite;
            isHoldRef.current = inHold;
            lastPctRef.current = currentPct;
            lastChProgRef.current = chProg;
            lastStateUpdateRef.current = now;

            setSequenceState({
              currentFrame: currentIntFrame,
              progress,
              activeChapter: chapter,
              chapterProgress: chProg,
              isFinalHold: inHold,
              finalHoldProgress: holdProg,
              isWhiteStudio: isWhite,
              scrollDirection: directionRef.current,
            });
          }
        },
      });

      triggerRef.current = trigger;
    });

    return () => {
      ctx.revert();
    };
  }, [stageRef]);

  /**
   * Programmatic navigation to a chapter with prefetching
   */
  const scrollToChapter = useCallback((chapterId: string) => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    if (chapterId === 'footer-section') {
      const targetY = trigger.start + TOTAL_SCROLL_DISTANCE + 60;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
      return;
    }

    const chapter = CHAPTERS.find((c) => c.id === chapterId);
    if (chapter) {
      // High-priority prefetch target chapter frame so it's ready on arrival
      frameManager.requestFrame(chapter.startFrame, true).catch(() => {});
      
      const targetDist = frameToScrollDistance(chapter.startFrame);
      const targetY = trigger.start + targetDist;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
  }, []);

  const scrollToTop = useCallback(() => {
    frameManager.requestFrame(1, true).catch(() => {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return {
    ...sequenceState,
    targetFrameRef,
    scrollToChapter,
    scrollToTop,
  };
}
