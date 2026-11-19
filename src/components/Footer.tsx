import { memo } from 'react';

interface FooterProps {
  onNavigate: (chapterId: string) => void;
}

export const Footer = memo(function Footer({ onNavigate }: FooterProps) {
  return (
    <footer
      id="footer-section"
      className="relative z-30 bg-pure-white border-t border-forest-green/10 py-16 sm:py-24 px-5 sm:px-8 lg:px-16"
    >
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-12 sm:pb-16 border-b border-forest-green/10 gap-8">
          <div>
            <h2 className="font-display text-display-xl lg:text-display-2xl text-forest-green tracking-tight font-normal leading-none mb-3">
              CEYLON.
            </h2>
            <p className="font-body text-body-md sm:text-body-lg text-muted-slate font-light">
              From Leaf to Cup. The Art of Sri Lankan Tea Manufacturing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 sm:gap-8 lg:gap-12">
            <button
              onClick={() => onNavigate('chapter-1')}
              className="font-label text-label-xs tracking-widest uppercase text-forest-green hover:text-deep-gold transition-colors text-left"
            >
              The Journey
            </button>
            <button
              onClick={() => onNavigate('chapter-4')}
              className="font-label text-label-xs tracking-widest uppercase text-forest-green hover:text-deep-gold transition-colors text-left"
            >
              The Process
            </button>
            <button
              onClick={() => onNavigate('chapter-9')}
              className="font-label text-label-xs tracking-widest uppercase text-forest-green hover:text-deep-gold transition-colors text-left"
            >
              Our Heritage
            </button>
            <button
              onClick={() => onNavigate('chapter-13')}
              className="font-label text-label-xs tracking-widest uppercase text-forest-green hover:text-deep-gold transition-colors text-left"
            >
              The Perfect Cup
            </button>
          </div>
        </div>

        {/* 3-Column Editorial Monograph */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 py-12 sm:py-16 border-b border-forest-green/10 text-charcoal text-body-md leading-relaxed">
          <div>
            <span className="font-label text-label-sm text-forest-green uppercase tracking-widest block mb-2 font-medium">
              01 / High Altitude Terroir
            </span>
            <p className="font-light">
              Grown in the misty, cloud-kissed ridges of Nuwara Eliya and Dimbula, where cool nights and crisp morning air impart unmatched floral notes to every harvest.
            </p>
          </div>
          <div>
            <span className="font-label text-label-sm text-forest-green uppercase tracking-widest block mb-2 font-medium">
              02 / Orthodox Mastery
            </span>
            <p className="font-light">
              Hand-picked with dedication, withered over gentle ambient air, and rolled on century-old tables to unleash the prized ruby-amber liquor of Ceylon.
            </p>
          </div>
          <div>
            <span className="font-label text-label-sm text-forest-green uppercase tracking-widest block mb-2 font-medium">
              03 / Modern Purity
            </span>
            <p className="font-light">
              From the lush green mountain contours into a pristine porcelain cup. A singular journey of botanical excellence preserved in every infusion.
            </p>
          </div>
        </div>

        {/* Bottom Metadata & Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-muted-slate font-label text-label-xs tracking-wider gap-4 text-center sm:text-left">
          <p>© 2026 CEYLON STORYTELLING INITIATIVE. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
            <span>SRI LANKA TEA HERITAGE</span>
            <span>•</span>
            <span>PORTFOLIO EDITORIAL EXPERIENCE</span>
          </div>
        </div>
      </div>
    </footer>
  );
});
