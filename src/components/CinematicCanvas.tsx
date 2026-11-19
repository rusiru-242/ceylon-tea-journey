import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CanvasRenderer } from '../utils/canvasRenderer';
import { frameManager, DecodedFrame } from '../utils/frameManager';

export interface CinematicCanvasHandle {
  renderFrame: (frameIndex: number) => void;
}

interface CinematicCanvasProps {
  currentFrame: number;
  isReady: boolean;
  isWhiteStudio: boolean;
  isRewinding?: boolean;
  rewindBlur?: number;
  rewindScale?: number;
}

export const CinematicCanvas = forwardRef<CinematicCanvasHandle, CinematicCanvasProps>(
  function CinematicCanvas({ currentFrame, isReady, isWhiteStudio, isRewinding = false, rewindBlur = 0, rewindScale = 1 }, ref) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rendererRef = useRef<CanvasRenderer | null>(null);
    const targetFrameRef = useRef<number>(currentFrame);
    const studioBlendRef = useRef<HTMLDivElement | null>(null);

    // Initialize CanvasRenderer & attach resize handler
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const renderer = new CanvasRenderer(canvas);
      rendererRef.current = renderer;

      const handleResize = () => {
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        renderer.resize(rect.width, rect.height, dpr);
      };

      handleResize();

      let resizeTimer: number;
      const debouncedResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
          handleResize();
          ScrollTrigger.refresh();
        }, 150);
      };

      window.addEventListener('resize', debouncedResize, { passive: true });

      return () => {
        window.removeEventListener('resize', debouncedResize);
        clearTimeout(resizeTimer);
      };
    }, []);

    // Core draw routine: draws target frame or nearest available frame
    const drawTargetFrame = useCallback((frameIndex: number) => {
      const renderer = rendererRef.current;
      if (!renderer) return;

      targetFrameRef.current = frameIndex;

      // 1. Get exact frame or nearest available neighbor from cache
      const match = frameManager.getNearestFrame(frameIndex, 15);
      if (match) {
        renderer.draw(match.img, match.frame);
      }

      // 2. Request exact target frame with high priority if not yet cached
      if (!frameManager.isFrameLoaded(frameIndex)) {
        frameManager.requestFrame(frameIndex, true).catch(() => {});
      }

      // 3. Smoothly update studio blend overlay without React re-render
      if (studioBlendRef.current) {
        if (frameIndex >= 985) {
          const progress = Math.min(1, (frameIndex - 985) / 25);
          studioBlendRef.current.style.opacity = `${progress * 0.18}`;
        } else {
          studioBlendRef.current.style.opacity = '0';
        }
      }
    }, []);

    // Expose imperative renderFrame handle for 60fps rAF rendering
    useImperativeHandle(ref, () => ({
      renderFrame: (frameIndex: number) => {
        drawTargetFrame(frameIndex);
      },
    }), [drawTargetFrame]);

    // Subscribe to background loader: if the frame we are waiting for decodes, paint it immediately
    useEffect(() => {
      const unsubscribe = frameManager.onFrameLoaded((loadedFrame: number, asset: DecodedFrame) => {
        const renderer = rendererRef.current;
        if (!renderer) return;

        const target = targetFrameRef.current;
        // If the loaded frame matches target or is closer than what's currently rendered, repaint
        if (Math.abs(loadedFrame - target) <= 2) {
          renderer.draw(asset, loadedFrame);
        }
      });

      return unsubscribe;
    }, []);

    // Initial render when isReady becomes true
    useEffect(() => {
      if (isReady) {
        drawTargetFrame(currentFrame || 1);
      }
    }, [isReady, currentFrame, drawTargetFrame]);

    // Update if currentFrame prop changes (fallback path)
    useEffect(() => {
      drawTargetFrame(currentFrame);
    }, [currentFrame, drawTargetFrame]);

    return (
      <div
        id="cinematic-viewport"
        className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none bg-pure-white"
        style={{
          filter: rewindBlur > 0.5 ? `blur(${rewindBlur}px)` : undefined,
          transform: rewindScale !== 1 ? `scale(${rewindScale})` : undefined,
          transition: isRewinding ? 'none' : 'filter 0.3s ease-out, transform 0.3s ease-out',
          willChange: isRewinding ? 'filter, transform' : 'auto',
        }}
      >
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className="w-full h-full object-cover pointer-events-none"
        />

        {/* Studio blend layer for seamless white studio transition (hardware accelerated) */}
        <div
          ref={studioBlendRef}
          id="studio-blend"
          className="absolute inset-0 pointer-events-none transition-opacity duration-150 bg-pure-white will-change-[opacity]"
          style={{ opacity: isWhiteStudio ? 0.18 : 0 }}
        />

        {/* Subtle architectural film grain texture from Stitch design */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-5 bg-repeat"
          style={{
            backgroundImage: 'radial-gradient(#18392B 0.75px, transparent 0.75px)',
            backgroundSize: '8px 8px',
          }}
        />

        {/* Cinematic Vertical Motion Blur Speed Streaks Overlay during Rewind */}
        {isRewinding && rewindBlur > 2 && (
          <div
            className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-100"
            style={{
              opacity: Math.min(0.8, rewindBlur / 24),
              background: 'repeating-linear-gradient(to right, transparent 0px, transparent 24px, rgba(24,57,43,0.03) 25px, transparent 26px)',
              backdropFilter: `blur(${Math.round(rewindBlur * 0.4)}px)`,
            }}
          />
        )}
      </div>
    );
  }
);
