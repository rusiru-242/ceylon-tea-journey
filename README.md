# CEYLON — From Leaf to Cup
### Immersive Cinematic Scroll-Storytelling Experience

An Apple-level minimalist, Swiss-editorial interactive digital storytelling experience celebrating authentic Ceylon tea manufacturing in Sri Lanka. The project synchronizes 1,649 ultra-smooth, high-definition WebP film frames with scroll-driven GSAP ScrollTrigger animations, guiding viewers from misty highland plantations through authentic artisanal factory craft directly into a pure, luminous white studio showcase.

---

## Technical Stack & Architecture

- **Frontend Core**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS (customized with Google Stitch Design System tokens)
- **Cinematic Engine**: HTML5 Canvas with custom LRU windowed WebP frame loader and DPR support
- **Scroll & Physics**: GSAP & GSAP ScrollTrigger with weighted cumulative timeline and unpin release
- **Audio Experience**: Web Audio API procedural highland altitude breeze ambient generator
- **Icons**: Lucide React & Google Material Symbols
- **100% Client-Side**: No backend, no database, no external paid APIs

---

## Narrative Chapter to Frame Mapping (1,649 WebP Frames)

The 1,649 WebP frames represent the continuous 54-second 30 FPS tea manufacturing film:

| Chapter | Title | Frame Range | Visual Stage & Theme | Card Position |
|:---|:---|:---:|:---|:---:|
| **CH. 01** | **The Origin** | 1 – 90 | Nuwara Eliya misty highland plantations at dawn | **Left** |
| **CH. 02** | **The Leaf** | 91 – 215 | Macro botanics, two leaves and a bud with morning dew | **Right** |
| **CH. 03** | **The Harvest** | 216 – 365 | Skilled artisanal hand-plucking into woven bamboo baskets | **Right** |
| **CH. 04** | **The Factory** | 366 – 520 | Arrival at historic estate factory, weighing, warm industrial lights | **Left** |
| **CH. 05** | **Withering** | 521 – 705 | Wooden withering troughs with ambient airflow reducing moisture | **Left** |
| **CH. 06** | **Rolling** | 706 – 825 | Mechanical circular rolling tables twisting softened leaves | **Left** |
| **CH. 07** | **Oxidation** | 826 – 915 | Enzymatic fermentation trays turning leaves copper-auburn | **Right** |
| **CH. 08** | **Drying & Grading** | 916 – 990 | Orthodox firing ovens locking in 3% moisture & mechanical sieves | **Right** |
| **CH. 09** | **The White Transition** | 991 – 1130 | **The Cut to White**: Finished loose leaves emerge onto pure white studio | **Right** |
| **CH. 10** | **The Tea Experience** | 1131 – 1280 | Golden amber liquor clarity and sensory evaluation in white studio | **Right** |
| **CH. 11** | **Packaging** | 1281 – 1405 | Minimalist airtight ivory canisters sealing in freshness | **Left** |
| **CH. 12** | **Brewing** | 1406 – 1492 | 96°C spring water steeping through crystal glass vessel | **Right** |
| **CH. 13** | **The Pinnacle** | 1493 – 1649 | Tea stream pouring into porcelain cup & completed cup reveal | **Left** |

---

## Weighted Scroll Timeline

- **Normal Scenes (Frames 1–1405):** 7px per frame ($1,404 \times 7 = 9,828\text{px}$)
- **Final Tea Pouring Scene (Frames 1405–1649):** 14px per frame ($244 \times 14 = 3,416\text{px}$)
- **Final Cup Hold (Steaming Cup Reveal):** 1,800px additional scroll
- **Total Scroll Distance:** 15,044px of calm, buttery-smooth cinematic scroll travel

---

## Getting Started

### 1. Development Server
```bash
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

### 2. Production Build
```bash
npm run build
npm run preview
```
Runs the full TypeScript typecheck and builds optimized static assets into `/dist`.
