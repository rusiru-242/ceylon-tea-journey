import { useMemo, memo } from 'react';
import { ArrowDown, RotateCcw } from 'lucide-react';
import { Chapter } from '../data/chapters';
import { TOTAL_FRAMES } from '../data/frameManifest';

interface ChapterOverlayProps {
  activeChapter: Chapter;
  chapterProgress: number; // 0.0 to 1.0
  currentFrame: number;
  isFinalHold?: boolean;
  finalHoldProgress?: number;
  isRewinding?: boolean;
  onReplay: () => void;
  onNavigate: (chapterId: string) => void;
}

export const ChapterOverlay = memo(function ChapterOverlay({
  activeChapter,
  chapterProgress,
  currentFrame,
  isFinalHold = false,
  isRewinding = false,
  onReplay,
  onNavigate,
}: ChapterOverlayProps) {
  const p = chapterProgress;

  // Calculate card entrance, hold, and exit values
  const {
    cardOpacity,
    cardTranslateY,
    labelOpacity,
    labelTranslateY,
    headingOpacity,
    headingTranslateY,
    descOpacity,
    descTranslateY,
    metaOpacity,
    metaTranslateY,
  } = useMemo(() => {
    // CHAPTER 1 (Hero): Starts visible, holds, exits at end
    if (activeChapter.ch === 1) {
      if (p <= 0.70) {
        return {
          cardOpacity: 1,
          cardTranslateY: 0,
          labelOpacity: 1,
          labelTranslateY: 0,
          headingOpacity: 1,
          headingTranslateY: 0,
          descOpacity: 1,
          descTranslateY: 0,
          metaOpacity: 1,
          metaTranslateY: 0,
        };
      }
      const tExit = Math.min(1, Math.max(0, (p - 0.70) / 0.30));
      return {
        cardOpacity: 1 - tExit,
        cardTranslateY: -25 * tExit,
        labelOpacity: 1 - tExit,
        labelTranslateY: -15 * tExit,
        headingOpacity: 1 - tExit,
        headingTranslateY: -20 * tExit,
        descOpacity: 1 - tExit,
        descTranslateY: -20 * tExit,
        metaOpacity: 1 - tExit,
        metaTranslateY: -15 * tExit,
      };
    }

    // CHAPTER 13 (The Pinnacle & Final Cup Hold):
    // Enters as pouring finishes, holds through the entire 1,500px final hold
    if (activeChapter.ch === 13 || isFinalHold) {
      if (isFinalHold) {
        // In the 1500px hold phase: keep the final card rock-solid and fully readable
        return {
          cardOpacity: 1,
          cardTranslateY: 0,
          labelOpacity: 1,
          labelTranslateY: 0,
          headingOpacity: 1,
          headingTranslateY: 0,
          descOpacity: 1,
          descTranslateY: 0,
          metaOpacity: 1,
          metaTranslateY: 0,
        };
      }

      // During frames 1493–1649: smooth entrance
      const tEnter = Math.min(1, Math.max(0, p / 0.25));
      return {
        cardOpacity: tEnter,
        cardTranslateY: 35 * (1 - tEnter),
        labelOpacity: Math.min(1, p / 0.12),
        labelTranslateY: 15 * (1 - Math.min(1, p / 0.12)),
        headingOpacity: Math.min(1, Math.max(0, (p - 0.04) / 0.14)),
        headingTranslateY: 20 * (1 - Math.min(1, Math.max(0, (p - 0.04) / 0.14))),
        descOpacity: Math.min(1, Math.max(0, (p - 0.08) / 0.14)),
        descTranslateY: 20 * (1 - Math.min(1, Math.max(0, (p - 0.08) / 0.14))),
        metaOpacity: Math.min(1, Math.max(0, (p - 0.12) / 0.12)),
        metaTranslateY: 15 * (1 - Math.min(1, Math.max(0, (p - 0.12) / 0.12))),
      };
    }

    // CHAPTERS 2 THROUGH 12: Entrance (0-0.16) -> Hold (0.16-0.82) -> Exit (0.82-1.0)
    if (p <= 0.16) {
      const tEnter = Math.min(1, Math.max(0, p / 0.16));
      return {
        cardOpacity: tEnter,
        cardTranslateY: 35 * (1 - tEnter),
        labelOpacity: Math.min(1, p / 0.08),
        labelTranslateY: 15 * (1 - Math.min(1, p / 0.08)),
        headingOpacity: Math.min(1, Math.max(0, (p - 0.03) / 0.09)),
        headingTranslateY: 20 * (1 - Math.min(1, Math.max(0, (p - 0.03) / 0.09))),
        descOpacity: Math.min(1, Math.max(0, (p - 0.06) / 0.09)),
        descTranslateY: 20 * (1 - Math.min(1, Math.max(0, (p - 0.06) / 0.09))),
        metaOpacity: Math.min(1, Math.max(0, (p - 0.08) / 0.08)),
        metaTranslateY: 15 * (1 - Math.min(1, Math.max(0, (p - 0.08) / 0.08))),
      };
    }

    if (p >= 0.82) {
      const tExit = Math.min(1, Math.max(0, (p - 0.82) / 0.18));
      return {
        cardOpacity: 1 - tExit,
        cardTranslateY: -25 * tExit,
        labelOpacity: 1 - tExit,
        labelTranslateY: -15 * tExit,
        headingOpacity: 1 - tExit,
        headingTranslateY: -20 * tExit,
        descOpacity: 1 - tExit,
        descTranslateY: -20 * tExit,
        metaOpacity: 1 - tExit,
        metaTranslateY: -15 * tExit,
      };
    }

    // Hold Phase (0.16 to 0.82)
    return {
      cardOpacity: 1,
      cardTranslateY: 0,
      labelOpacity: 1,
      labelTranslateY: 0,
      headingOpacity: 1,
      headingTranslateY: 0,
      descOpacity: 1,
      descTranslateY: 0,
      metaOpacity: 1,
      metaTranslateY: 0,
    };
  }, [activeChapter.ch, p, isFinalHold]);

  const isLeft = activeChapter.cardPosition === 'left';
  const isWhite = activeChapter.theme === 'white';
  const isBottom = activeChapter.verticalPosition === 'bottom' || activeChapter.ch === 12;
  const isHero = activeChapter.ch === 1;

  return (
    <div
      className={`absolute inset-0 z-20 w-full h-full pointer-events-none flex flex-col px-4 sm:px-8 md:px-10 lg:px-16 xl:px-20 transition-all duration-300 ${
        isBottom
          ? isHero
            ? 'justify-end pb-16 sm:pb-14 md:pb-12 lg:pb-36 xl:pb-40'
            : 'justify-end pb-16 sm:pb-14 md:pb-12 lg:pb-14'
          : 'justify-end pb-16 sm:pb-14 md:pb-12 lg:justify-center lg:py-16'
      }`}
    >
      <div
        className={`w-full flex items-center ${
          isLeft
            ? 'justify-center sm:justify-start'
            : 'justify-center sm:justify-end sm:pr-4 md:pr-8 lg:pr-20 xl:pr-24'
        }`}
      >
        
        {/* CHAPTER 01 — HERO COMPOSITION */}
        {activeChapter.align === 'hero' ? (
          <div
            style={{
              opacity: isRewinding ? 0 : cardOpacity,
              transform: `translate3d(0, ${cardTranslateY}px, 0)`,
              willChange: 'opacity, transform',
              transition: isRewinding ? 'opacity 0.2s ease-out' : undefined,
            }}
            className={`w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl text-left bg-pure-white/92 sm:bg-pure-white/95 backdrop-blur-md ${
              isBottom ? 'p-4 sm:p-6 md:p-8 lg:p-10' : 'p-4 sm:p-6 md:p-8 lg:p-12'
            } rounded-sm border-l-4 border-deep-gold shadow-[0_8px_30px_rgb(24,57,43,0.06)] pointer-events-auto`}
          >
            {/* Staggered Eyebrow */}
            <div
              style={{
                opacity: labelOpacity,
                transform: `translate3d(0, ${labelTranslateY}px, 0)`,
              }}
              className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 lg:mb-4"
            >
              <span className="w-5 sm:w-8 h-0.5 bg-deep-gold" />
              <span className="font-label text-[10px] sm:text-label-xs sm:text-label-sm text-deep-gold uppercase tracking-widest font-medium">
                THE ART OF CEYLON TEA
              </span>
              <span className="font-label text-label-xs text-forest-green uppercase tracking-widest hidden sm:inline font-medium">
                • CHAPTER 01
              </span>
            </div>

            {/* Staggered Heading */}
            <h1
              style={{
                opacity: headingOpacity,
                transform: `translate3d(0, ${headingTranslateY}px, 0)`,
              }}
              className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-display-2xl text-forest-green tracking-tight font-normal mb-2 sm:mb-3 lg:mb-5 leading-tight sm:leading-none"
            >
              {activeChapter.title}
            </h1>

            {/* Staggered Description */}
            <p
              style={{
                opacity: descOpacity,
                transform: `translate3d(0, ${descTranslateY}px, 0)`,
              }}
              className="font-body text-xs sm:text-sm lg:text-body-lg text-charcoal max-w-lg mb-3 sm:mb-5 lg:mb-8 leading-relaxed font-light line-clamp-3 sm:line-clamp-none"
            >
              {activeChapter.description}
            </p>

            {/* Staggered Metadata & Scroll Prompt */}
            <div
              style={{
                opacity: metaOpacity,
                transform: `translate3d(0, ${metaTranslateY}px, 0)`,
              }}
              className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6 pt-2.5 sm:pt-3 lg:pt-4 border-t border-forest-green/10"
            >
              <div className="flex items-center gap-2 sm:gap-3 text-forest-green">
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-forest-green/40 flex items-center justify-center animate-bounce">
                  <ArrowDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </span>
                <span className="font-label text-[10px] sm:text-label-xs sm:text-label-sm uppercase tracking-widest font-medium">
                  Scroll to unfold film
                </span>
              </div>
              <span className="font-label text-[9px] sm:text-label-xs text-muted-slate uppercase tracking-widest hidden sm:inline">
                Nuwara Eliya Highlands • 1,890m
              </span>
            </div>
          </div>
        ) : (activeChapter.align === 'pinnacle' || isFinalHold) ? (
          /* CHAPTER 13 — THE PINNACLE & FINAL CUP HOLD */
          <div
            style={{
              opacity: isRewinding ? 0 : cardOpacity,
              transform: `translate3d(0, ${cardTranslateY}px, 0)`,
              willChange: 'opacity, transform',
              transition: isRewinding ? 'opacity 0.2s ease-out' : undefined,
            }}
            className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-xl text-left bg-pure-white/92 sm:bg-pure-white/95 backdrop-blur-md p-4 sm:p-6 md:p-8 lg:p-14 rounded-sm border-l-4 border-forest-green shadow-[0_8px_30px_rgb(24,57,43,0.06)] pointer-events-auto"
          >
            <div
              style={{
                opacity: labelOpacity,
                transform: `translate3d(0, ${labelTranslateY}px, 0)`,
              }}
              className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 lg:mb-4"
            >
              <span className="w-5 sm:w-8 h-0.5 bg-deep-gold" />
              <span className="font-label text-[10px] sm:text-label-xs sm:text-label-sm text-forest-green uppercase tracking-widest font-medium">
                CHAPTER 13 — THE PINNACLE
              </span>
            </div>

            <h2
              style={{
                opacity: headingOpacity,
                transform: `translate3d(0, ${headingTranslateY}px, 0)`,
              }}
              className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-display-2xl text-forest-green font-normal tracking-tight mb-2 sm:mb-3 lg:mb-4 leading-tight sm:leading-none"
            >
              {activeChapter.title}
            </h2>

            <p
              style={{
                opacity: descOpacity,
                transform: `translate3d(0, ${descTranslateY}px, 0)`,
              }}
              className="font-body text-xs sm:text-sm lg:text-body-lg text-charcoal leading-relaxed font-light mb-3 sm:mb-5 lg:mb-8 line-clamp-3 sm:line-clamp-none"
            >
              {activeChapter.description}
            </p>

            <div
              style={{
                opacity: metaOpacity,
                transform: `translate3d(0, ${metaTranslateY}px, 0)`,
              }}
              className="flex flex-wrap items-center gap-2.5 sm:gap-4 lg:gap-6 pt-3 sm:pt-4 lg:pt-6 border-t border-forest-green/15"
            >
              <button
                type="button"
                id="replay-btn"
                onClick={onReplay}
                className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-full bg-forest-green text-pure-white hover:bg-forest-green/90 transition-all duration-frame-scrub font-label text-[10px] sm:text-label-xs tracking-widest uppercase shadow-sm cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Experience Again</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('footer-section')}
                className="font-label text-[10px] sm:text-label-xs tracking-widest uppercase text-forest-green hover:underline cursor-pointer"
              >
                View Heritage &amp; Details
              </button>
            </div>
          </div>
        ) : (
          /* CHAPTERS 02 THROUGH 12 — EDITORIAL WHITE CARDS */
          <div
            style={{
              opacity: isRewinding ? 0 : cardOpacity,
              transform: `translate3d(0, ${cardTranslateY}px, 0)`,
              willChange: 'opacity, transform',
              transition: isRewinding ? 'opacity 0.2s ease-out' : undefined,
            }}
            className={`w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl text-left bg-pure-white/92 sm:bg-pure-white/95 backdrop-blur-md ${
              isBottom
                ? 'p-3.5 sm:p-5 lg:p-7'
                : 'p-3.5 sm:p-5 md:p-6 lg:p-10'
            } rounded-sm shadow-[0_8px_30px_rgb(24,57,43,0.06)] pointer-events-auto ${
              isLeft
                ? isWhite ? 'border-l-4 border-forest-green' : 'border-l-4 border-deep-gold'
                : 'border-r-4 border-forest-green'
            }`}
          >
            {/* Staggered Eyebrow */}
            <div
              style={{
                opacity: labelOpacity,
                transform: `translate3d(0, ${labelTranslateY}px, 0)`,
              }}
              className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2 lg:mb-3"
            >
              {isWhite && <span className="w-4 sm:w-6 h-0.5 bg-forest-green" />}
              <span
                className={`font-label text-[10px] sm:text-label-xs sm:text-label-sm uppercase tracking-widest font-medium ${
                  isWhite ? 'text-forest-green' : 'text-deep-gold'
                }`}
              >
                {activeChapter.eyebrow}
              </span>
            </div>

            {/* Staggered Heading */}
            <h2
              style={{
                opacity: headingOpacity,
                transform: `translate3d(0, ${headingTranslateY}px, 0)`,
              }}
              className="font-display text-xl sm:text-2xl md:text-3xl lg:text-display-xl text-forest-green mb-1 sm:mb-2 lg:mb-4 font-normal leading-tight"
            >
              {activeChapter.title}
            </h2>

            {/* Staggered Description */}
            <p
              style={{
                opacity: descOpacity,
                transform: `translate3d(0, ${descTranslateY}px, 0)`,
              }}
              className="font-body text-xs sm:text-sm lg:text-body-lg text-charcoal leading-relaxed font-light mb-2.5 sm:mb-3.5 lg:mb-6 line-clamp-2 sm:line-clamp-3 lg:line-clamp-none"
            >
              {activeChapter.description}
            </p>

            {/* Staggered Metadata */}
            <div
              style={{
                opacity: metaOpacity,
                transform: `translate3d(0, ${metaTranslateY}px, 0)`,
              }}
              className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 text-[9px] sm:text-label-xs font-label uppercase tracking-widest text-muted-slate pt-2 sm:pt-2.5 lg:pt-3 border-t border-forest-green/10"
            >
              {activeChapter.meta.map((m, idx) => (
                <span key={idx} className="flex items-center gap-2 sm:gap-4">
                  {idx > 0 && <span>•</span>}
                  <span>{m}</span>
                </span>
              ))}
              <span className="ml-auto font-label text-[9px] sm:text-[10px] text-muted-slate/60">
                FRAME {String(currentFrame).padStart(4, '0')} / {TOTAL_FRAMES}
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
});
