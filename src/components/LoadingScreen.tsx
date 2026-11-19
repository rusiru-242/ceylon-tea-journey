import { useEffect, useState } from 'react';
import { RotateCcw, ArrowRight } from 'lucide-react';

interface LoadingScreenProps {
  isReady: boolean;
  progress: number;
  error?: string | null;
  onRetry?: () => void;
  onBypass?: () => void;
}

export function LoadingScreen({
  isReady,
  progress,
  error,
  onRetry,
  onBypass,
}: LoadingScreenProps) {
  const [shouldRender, setShouldRender] = useState(true);
  const [fadeComplete, setFadeComplete] = useState(false);

  useEffect(() => {
    if (isReady) {
      const timer = setTimeout(() => {
        setFadeComplete(true);
        setTimeout(() => setShouldRender(false), 600);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isReady]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-pure-white transition-opacity duration-700 pointer-events-auto ${
        fadeComplete ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="max-w-md w-full px-8 text-center flex flex-col items-center">
        {/* Brand Mark */}
        <h1 className="font-display text-display-xl lg:text-display-2xl text-forest-green tracking-widest font-normal mb-2">
          CEYLON.
        </h1>
        <p className="font-label text-label-xs text-deep-gold tracking-widest uppercase mb-10">
          From Leaf to Cup — Pure Heritage
        </p>

        {error ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="font-body text-body-md text-charcoal/80 max-w-sm mb-2">
              {error}
            </p>
            <div className="flex items-center gap-4">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-forest-green text-pure-white font-label text-label-xs tracking-widest uppercase hover:bg-forest-green/90 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              )}
              {onBypass && (
                <button
                  type="button"
                  onClick={onBypass}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-forest-green/30 text-forest-green font-label text-label-xs tracking-widest uppercase hover:bg-forest-green/5 transition-all"
                >
                  <span>Enter Website</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Minimal Progress Bar */}
            <div className="w-48 h-0.5 bg-forest-green/15 relative overflow-hidden mb-4">
              <div
                className="absolute top-0 left-0 h-full bg-deep-gold transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Status text */}
            <div className="flex items-center justify-between w-48 text-muted-slate font-label text-label-xs">
              <span>{progress >= 100 ? 'READY' : 'INITIALIZING'}</span>
              <span>{progress}%</span>
            </div>

            <p className="font-body text-body-md text-charcoal/60 mt-8 font-light italic">
              {progress >= 100
                ? 'Welcome to the highland journey...'
                : 'Preparing high-definition cinematic film...'}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
