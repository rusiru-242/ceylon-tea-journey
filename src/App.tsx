import { useState, useRef, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
import { useFrameLoader } from './hooks/useFrameLoader';
import { useScrollSequence } from './hooks/useScrollSequence';
import { LoadingScreen } from './components/LoadingScreen';
import { Navbar } from './components/Navbar';
import { CinematicCanvas, CinematicCanvasHandle } from './components/CinematicCanvas';
import { ChapterOverlay } from './components/ChapterOverlay';
import { ChapterProgress } from './components/ChapterProgress';
import { Footer } from './components/Footer';
import { MobileMenu } from './components/MobileMenu';

export default function App() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasHandleRef = useRef<CinematicCanvasHandle | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Progressive frame loader with off-thread decoding & priority queues
  const {
    isReady,
    loadProgress,
    error,
    retry,
    bypassError,
  } = useFrameLoader();

  // High-performance 60fps direct frame render callback decoupled from React state
  const handleDirectFrameRender = useCallback(
    (frameIndex: number) => {
      canvasHandleRef.current?.renderFrame(frameIndex);
    },
    []
  );

  // Master GSAP ScrollTrigger sequence hook with weighted timeline & final cup hold
  const {
    currentFrame,
    progress,
    activeChapter,
    chapterProgress,
    isFinalHold,
    finalHoldProgress,
    isWhiteStudio,
    isRewinding,
    rewindBlur,
    rewindScale,
    scrollToChapter,
    scrollToTop,
  } = useScrollSequence({
    stageRef,
    onDirectFrameRender: handleDirectFrameRender,
  });

  return (
    <div className="relative min-h-screen bg-pure-white text-forest-green selection:bg-forest-green selection:text-pure-white antialiased">
      {/* 1. Minimal Luxury Loading Screen */}
      <LoadingScreen
        isReady={isReady}
        progress={loadProgress}
        error={error}
        onRetry={retry}
        onBypass={bypassError}
      />

      {/* 2. Top Navigation Bar */}
      <Navbar
        activeChapter={activeChapter}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onNavigate={scrollToChapter}
      />

      {/* 3. Timeline Progress Track (Desktop Right & Mobile Bottom) */}
      <ChapterProgress
        activeChapter={activeChapter}
        progress={progress}
        onNavigate={scrollToChapter}
      />

      {/* 4. PINNED CINEMATIC STORYTELLING STAGE */}
      {/* GSAP ScrollTrigger pins this stage for 27,188px with automatic pinSpacing so the footer cannot overlap */}
      <div
        ref={stageRef}
        id="pinned-story-stage"
        className="w-full h-screen overflow-hidden relative bg-pure-white"
      >
        {/* Pinned Cinematic Canvas with direct imperative 60fps render handle */}
        <CinematicCanvas
          ref={canvasHandleRef}
          currentFrame={currentFrame}
          isReady={isReady}
          isWhiteStudio={isWhiteStudio}
          isRewinding={isRewinding}
          rewindBlur={rewindBlur}
          rewindScale={rewindScale}
        />

        {/* Synchronized Chapter Overlay Card */}
        <ChapterOverlay
          activeChapter={activeChapter}
          chapterProgress={chapterProgress}
          currentFrame={currentFrame}
          isFinalHold={isFinalHold}
          finalHoldProgress={finalHoldProgress}
          isRewinding={isRewinding}
          onReplay={scrollToTop}
          onNavigate={scrollToChapter}
        />
      </div>

      {/* 5. Minimalist White Monograph Footer (in normal document flow directly below pin-spacer) */}
      <Footer onNavigate={scrollToChapter} onReplay={scrollToTop} />

      {/* 6. Mobile Drawer Navigation */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onSelectChapter={scrollToChapter}
        activeChapter={activeChapter}
      />

      {/* 7. Cinematic Rewind Motion Indicator HUD */}
      {isRewinding && (
        <div className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-center">
          <div
            className="flex items-center gap-3.5 px-7 py-3 rounded-full bg-forest-green/95 text-pure-white backdrop-blur-md border border-deep-gold/40 shadow-2xl transition-all"
            style={{
              opacity: Math.min(1, Math.max(0, rewindBlur / 4)),
              transform: `scale(${0.92 + Math.min(0.08, rewindBlur / 200)})`,
            }}
          >
            <RotateCcw className="w-4 h-4 animate-spin text-deep-gold" />
            <span className="font-label text-label-xs tracking-widest uppercase font-medium">
              Rewinding to Origin
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
