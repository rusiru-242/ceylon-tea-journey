import { memo } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { CHAPTERS, Chapter } from '../data/chapters';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChapter: (id: string) => void;
  activeChapter: Chapter;
}

export const MobileMenu = memo(function MobileMenu({ isOpen, onClose, onSelectChapter, activeChapter }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-pure-white p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-forest-green/10">
        <div>
          <span className="font-display text-headline-sm text-forest-green tracking-widest font-normal">CEYLON.</span>
          <span className="font-label text-label-xs text-deep-gold tracking-widest uppercase block mt-1">Story Index</span>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full border border-forest-green/20 flex items-center justify-center text-forest-green hover:bg-forest-green/5"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Chapter List */}
      <nav className="flex flex-col divide-y divide-forest-green/10 my-4">
        {CHAPTERS.map((ch) => {
          const isActive = ch.id === activeChapter.id;
          return (
            <button
              key={ch.id}
              onClick={() => {
                onSelectChapter(ch.id);
                onClose();
              }}
              className={`py-4 px-2 flex items-center justify-between text-left transition-colors ${
                isActive ? 'text-forest-green font-medium' : 'text-charcoal hover:text-forest-green'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`font-label text-label-xs ${isActive ? 'text-deep-gold font-bold' : 'text-muted-slate'}`}>
                  {String(ch.ch).padStart(2, '0')}
                </span>
                <span className="font-display text-headline-sm">{ch.name}</span>
              </div>
              {isActive ? (
                <span className="w-2 h-2 rounded-full bg-forest-green" />
              ) : (
                <ArrowRight className="w-4 h-4 text-muted-slate/50" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer links */}
      <div className="mt-auto pt-6 border-t border-forest-green/10 flex flex-col gap-3 font-label text-label-xs text-muted-slate uppercase tracking-wider">
        <a href="#footer-section" onClick={onClose} className="hover:text-forest-green">
          View Heritage & Archives
        </a>
        <p className="text-muted-slate/60 text-[10px]">© 2026 CEYLON STORYTELLING INITIATIVE</p>
      </div>
    </div>
  );
});
