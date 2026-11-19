import { memo } from 'react';
import { Menu, ArrowDown } from 'lucide-react';
import { AmbientAudio } from './AmbientAudio';
import { Chapter } from '../data/chapters';

interface NavbarProps {
  activeChapter: Chapter;
  onOpenMobileMenu: () => void;
  onNavigate: (chapterId: string) => void;
}

export const Navbar = memo(function Navbar({ activeChapter, onOpenMobileMenu, onNavigate }: NavbarProps) {
  return (
    <header
      id="main-nav"
      className="fixed top-0 left-0 w-full z-40 px-5 sm:px-8 lg:px-12 py-4 lg:py-6 flex items-center justify-between pointer-events-auto bg-pure-white/95 backdrop-blur-sm border-b border-forest-green/10 transition-all duration-frame-scrub"
    >
      {/* Brand Mark */}
      <div className="flex items-center gap-3">
        <a
          href="#chapter-1"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('chapter-1');
          }}
          className="group flex items-center gap-3"
        >
          <span className="font-display text-headline-sm sm:text-headline-md tracking-widest font-normal text-forest-green">
            CEYLON.
          </span>
          <span className="font-label text-label-xs text-deep-gold tracking-widest uppercase hidden sm:inline-block pl-3 border-l border-forest-green/20">
            Pure Heritage
          </span>
        </a>
      </div>

      {/* Desktop Navigation Links */}
      <nav className="hidden md:flex items-center gap-8">
        <a
          href="#chapter-1"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('chapter-1');
          }}
          className="font-label text-label-sm tracking-widest uppercase text-forest-green hover:text-deep-gold transition-colors py-1 relative group"
        >
          <span>The Journey</span>
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-forest-green transition-all duration-frame-scrub group-hover:w-full" />
        </a>

        <a
          href="#chapter-4"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('chapter-4');
          }}
          className="font-label text-label-sm tracking-widest uppercase text-forest-green hover:text-deep-gold transition-colors py-1 relative group"
        >
          <span>The Process</span>
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-forest-green transition-all duration-frame-scrub group-hover:w-full" />
        </a>

        <a
          href="#chapter-9"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('chapter-9');
          }}
          className="font-label text-label-sm tracking-widest uppercase text-forest-green hover:text-deep-gold transition-colors py-1 relative group"
        >
          <span>Our Heritage</span>
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-forest-green transition-all duration-frame-scrub group-hover:w-full" />
        </a>
      </nav>

      {/* Actions (Audio & Explore on Desktop / Pill & Menu on Mobile) */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile Chapter Pill */}
        <span className="md:hidden font-label text-label-xs tracking-wider uppercase px-2.5 py-1 rounded-full bg-forest-green/10 text-forest-green font-medium">
          CH. {String(activeChapter.ch).padStart(2, '0')} / 13
        </span>

        {/* Ambient Sound Generator */}
        <AmbientAudio />

        {/* Desktop Explore Button */}
        <a
          href="#chapter-1"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('chapter-1');
          }}
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-forest-green/30 text-forest-green hover:border-forest-green hover:bg-forest-green/5 transition-all duration-frame-scrub"
        >
          <span className="font-label text-label-xs tracking-widest uppercase">Explore</span>
          <ArrowDown className="w-3.5 h-3.5" />
        </a>

        {/* Mobile Menu Button */}
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden w-8 h-8 rounded-full border border-forest-green/30 flex items-center justify-center text-forest-green hover:border-forest-green hover:bg-forest-green/5 transition-colors"
          aria-label="Open chapter navigation"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
});
