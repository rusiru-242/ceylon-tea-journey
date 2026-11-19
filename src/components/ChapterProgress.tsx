import { memo } from 'react';
import { CHAPTERS, Chapter } from '../data/chapters';

interface ChapterProgressProps {
  activeChapter: Chapter;
  progress: number; // 0 to 1
  onNavigate: (chapterId: string) => void;
}

export const ChapterProgress = memo(function ChapterProgress({ activeChapter, progress, onNavigate }: ChapterProgressProps) {
  const percentage = Math.round(progress * 100);

  return (
    <>
      {/* ========================================================================= */}
      {/* DESKTOP VERTICAL PROGRESS (Right-hand Swiss Editorial) */}
      {/* ========================================================================= */}
      <aside
        aria-label="Story progression"
        className="fixed right-6 lg:right-10 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col items-end gap-3 pointer-events-auto select-none"
      >
        <div className="text-right mb-2">
          <span className="font-label text-label-sm text-forest-green font-medium block">
            CH. {String(activeChapter.ch).padStart(2, '0')} / 13
          </span>
          <span className="font-display text-body-md tracking-wider text-charcoal block uppercase">
            {activeChapter.name}
          </span>
        </div>

        {/* Vertical Timeline Track */}
        <div className="relative w-4 flex flex-col items-center py-2" id="nav-dots-container">
          {/* Background Track Line */}
          <div className="absolute top-0 bottom-0 w-px bg-forest-green/20" />
          
          {/* Active Fill Line */}
          <div
            className="absolute top-0 w-0.5 bg-forest-green transition-all duration-150"
            style={{ height: `${percentage}%` }}
          />

          {/* 13 Nav Dots */}
          <div className="flex flex-col gap-4 relative z-10 py-1">
            {CHAPTERS.map((ch) => {
              const isActive = ch.id === activeChapter.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => onNavigate(ch.id)}
                  aria-label={`Jump to ${ch.name}`}
                  title={`${String(ch.ch).padStart(2, '0')} — ${ch.name}`}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-forest-green scale-150 shadow-xs'
                      : 'bg-forest-green/40 hover:bg-forest-green hover:scale-125'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Scroll Percentage */}
        <span className="font-label text-label-xs text-muted-slate tracking-wider mt-1">
          {percentage}%
        </span>
      </aside>

      {/* ========================================================================= */}
      {/* MOBILE COMPACT BOTTOM PROGRESS BAR */}
      {/* ========================================================================= */}
      <div className="fixed bottom-0 left-0 w-full z-30 bg-pure-white/95 backdrop-blur-sm px-5 py-3 border-t border-forest-green/10 flex items-center justify-between md:hidden pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-forest-green animate-pulse" />
          <span className="font-display text-body-md uppercase tracking-wider text-forest-green font-medium truncate max-w-[180px]">
            {activeChapter.name}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-24 h-1 bg-forest-green/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-forest-green transition-all duration-150"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="font-label text-label-xs text-muted-slate w-8 text-right">
            {percentage}%
          </span>
        </div>
      </div>
    </>
  );
});
