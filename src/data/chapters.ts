export interface Chapter {
  id: string;
  ch: number;
  startFrame: number;
  endFrame: number;
  name: string;
  eyebrow: string;
  title: string;
  description: string;
  mobileDescription?: string;
  meta: string[];
  theme: 'dark' | 'warm' | 'white';
  align: 'left' | 'right' | 'hero' | 'pinnacle';
  cardPosition: 'left' | 'right';
}

/**
 * Recalibrated Scroll Timeline Configuration for 1,649 WebP Frames
 * - Normal scenes (plantations, harvesting, factory): 14px per frame (Slow, immersive cinematic pacing)
 * - Final tea pouring scene (brewing & cup pouring): 28px per frame (Ultra-slow cinematic cadence)
 * - Final cup hold (completed cup reveal before footer): 2,400px
 */
export const NORMAL_SCROLL_PX_PER_FRAME = 14;
export const FINAL_POURING_SCROLL_PX_PER_FRAME = 28;
export const FINAL_CUP_HOLD_PX = 2400;

// The frame where the slow cinematic pouring begins (Chapter 12 Brewing & Pouring)
export const SLOW_SCENE_START_FRAME = 1405;

// Cumulative scroll distances for 1,649 frames
export const DIST_NORMAL = (SLOW_SCENE_START_FRAME - 1) * NORMAL_SCROLL_PX_PER_FRAME; // 1,404 * 14 = 19,656px
export const DIST_FINAL_SCENE = (1649 - SLOW_SCENE_START_FRAME) * FINAL_POURING_SCROLL_PX_PER_FRAME; // 244 * 28 = 6,832px
export const DIST_FINAL_HOLD = FINAL_CUP_HOLD_PX; // 2,400px
export const TOTAL_SCROLL_DISTANCE = DIST_NORMAL + DIST_FINAL_SCENE + DIST_FINAL_HOLD; // 28,888px

/**
 * Maps normalized ScrollTrigger progress (0.0 to 1.0) to frame index (1 to 1649)
 * using the weighted scroll timeline.
 */
export function progressToFrame(progress: number): number {
  const currentDist = Math.max(0, Math.min(1, progress)) * TOTAL_SCROLL_DISTANCE;

  if (currentDist <= DIST_NORMAL) {
    return 1 + (currentDist / NORMAL_SCROLL_PX_PER_FRAME);
  }

  if (currentDist <= DIST_NORMAL + DIST_FINAL_SCENE) {
    const distInSlow = currentDist - DIST_NORMAL;
    return SLOW_SCENE_START_FRAME + (distInSlow / FINAL_POURING_SCROLL_PX_PER_FRAME);
  }

  // During final hold (currentDist > 13244px): lock at frame 1649
  return 1649;
}

/**
 * Maps a frame number to its target scroll distance in pixels.
 */
export function frameToScrollDistance(frameNumber: number): number {
  const clamped = Math.max(1, Math.min(1649, frameNumber));
  if (clamped <= SLOW_SCENE_START_FRAME) {
    return (clamped - 1) * NORMAL_SCROLL_PX_PER_FRAME;
  }
  return DIST_NORMAL + (clamped - SLOW_SCENE_START_FRAME) * FINAL_POURING_SCROLL_PX_PER_FRAME;
}

/**
 * Returns whether the scroll progress is currently in the final cup hold phase.
 */
export function isFinalCupHold(progress: number): boolean {
  return progress * TOTAL_SCROLL_DISTANCE >= (DIST_NORMAL + DIST_FINAL_SCENE);
}

/**
 * Normalized progress within the final cup hold (0.0 to 1.0).
 */
export function getFinalHoldProgress(progress: number): number {
  const currentDist = progress * TOTAL_SCROLL_DISTANCE;
  const holdStart = DIST_NORMAL + DIST_FINAL_SCENE;
  if (currentDist <= holdStart) return 0;
  return Math.min(1, Math.max(0, (currentDist - holdStart) / DIST_FINAL_HOLD));
}

export const CHAPTERS: Chapter[] = [
  {
    id: "chapter-1",
    ch: 1,
    startFrame: 1,
    endFrame: 90,
    name: "The Origin",
    eyebrow: "THE ART OF CEYLON TEA • CHAPTER 01",
    title: "FROM NATURE TO PERFECTION.",
    description: "A journey through the landscapes, craftsmanship, and traditions behind every cup. High above the misty hills of Sri Lanka, nature begins a remarkable journey.",
    mobileDescription: "A journey through the misty landscapes, generational craftsmanship, and traditions behind every cup.",
    meta: ["Nuwara Eliya Highlands • 1,890m", "Camellia Sinensis", "1,649 Ultra-Smooth WebP Frames"],
    theme: "dark",
    align: "hero",
    cardPosition: "left",
  },
  {
    id: "chapter-2",
    ch: 2,
    startFrame: 91,
    endFrame: 215,
    name: "The Leaf",
    eyebrow: "CHAPTER 02 — THE LEAF",
    title: "Nature's Finest Detail.",
    description: "Every exceptional cup begins with the freshness of a tender tea shoot. Two leaves and a bud, kissed by mountain dew and morning sunlight.",
    mobileDescription: "Every exceptional cup begins with the freshness of a tender tea shoot. Two leaves and a bud, kissed by mountain dew.",
    meta: ["Macro Botanics", "Hand-Selected Bud"],
    theme: "dark",
    align: "right",
    cardPosition: "right",
  },
  {
    id: "chapter-3",
    ch: 3,
    startFrame: 216,
    endFrame: 365,
    name: "The Harvest",
    eyebrow: "CHAPTER 03 — THE HARVEST",
    title: "Picked with Purpose.",
    description: "Skilled hands carefully select the youngest leaves and buds. Placed inside woven bamboo baskets to prevent bruising and preserve delicate natural aromatics.",
    mobileDescription: "Skilled hands carefully select the youngest leaves, placed inside woven baskets to protect delicate aromatics.",
    meta: ["Artisanal Hand Plucking", "Woven Bamboo Baskets"],
    theme: "dark",
    align: "left",
    cardPosition: "left",
  },
  {
    id: "chapter-4",
    ch: 4,
    startFrame: 366,
    endFrame: 520,
    name: "The Factory",
    eyebrow: "CHAPTER 04 — THE FACTORY",
    title: "Crafted with Care.",
    description: "Fresh leaves arrive at the historic estate factory. Warm ambient lighting guides generational tea artisans through each stage of orthodox preparation.",
    mobileDescription: "Fresh leaves arrive at the historic factory estate under generational artisan supervision.",
    meta: ["Historic Ceylon Estate", "Generational Masters"],
    theme: "warm",
    align: "left",
    cardPosition: "left",
  },
  {
    id: "chapter-5",
    ch: 5,
    startFrame: 521,
    endFrame: 705,
    name: "Withering",
    eyebrow: "CHAPTER 05 — WITHERING",
    title: "The Art of Transformation.",
    description: "Airflow gradually reduces moisture over long wooden troughs, preparing leaves for rolling. Leaves become supple and pliable, releasing a rich verdant bouquet.",
    mobileDescription: "Gentle ambient airflow reduces moisture, preparing leaves for rolling with supple elasticity.",
    meta: ["Moisture Reduction: 55%", "Controlled Ambient Flow"],
    theme: "warm",
    align: "left",
    cardPosition: "left",
  },
  {
    id: "chapter-6",
    ch: 6,
    startFrame: 706,
    endFrame: 825,
    name: "Rolling",
    eyebrow: "CHAPTER 06 — ROLLING",
    title: "Crafted Through Motion.",
    description: "Circular mechanical rolling tables twist the softened leaves, rupturing delicate cell walls to release the essential botanical oils that define Ceylon character.",
    mobileDescription: "Rolling twists softened leaves, breaking cell walls to release essential botanical oils.",
    meta: ["Circular Mechanical Rolling", "Cellular Rupture"],
    theme: "warm",
    align: "left",
    cardPosition: "left",
  },
  {
    id: "chapter-7",
    ch: 7,
    startFrame: 826,
    endFrame: 915,
    name: "Oxidation",
    eyebrow: "CHAPTER 07 — OXIDATION",
    title: "Where Character Develops.",
    description: "Natural enzymatic oxidation develops the rich color, distinctive aroma, and brisk flavor of black tea as leaves transform toward a deep copper-auburn hue.",
    mobileDescription: "Enzymatic oxidation develops the rich color, aroma, and distinctive body of orthodox black tea.",
    meta: ["Enzymatic Alchemy", "Copper Color Transition"],
    theme: "warm",
    align: "right",
    cardPosition: "right",
  },
  {
    id: "chapter-8",
    ch: 8,
    startFrame: 916,
    endFrame: 990,
    name: "Drying & Grading",
    eyebrow: "CHAPTER 08 — DRYING AND GRADING",
    title: "Precision in Every Leaf.",
    description: "Controlled firing ovens arrest oxidation and lock in moisture at 3%. Mechanical sieves then grade the finished black tea leaves by orthodox leaf size.",
    mobileDescription: "Controlled drying fires the tea to seal in flavor, before mechanical grading separates by leaf grade.",
    meta: ["Moisture Lock: 3%", "Orthodox Leaf Grading"],
    theme: "warm",
    align: "right",
    cardPosition: "right",
  },
  {
    id: "chapter-9",
    ch: 9,
    startFrame: 991,
    endFrame: 1130,
    name: "The White Transition",
    eyebrow: "CHAPTER 09 — THE WHITE TRANSITION",
    title: "From Craft to Excellence.",
    description: "Every carefully processed leaf carries the character of its origin. Here, the finished dark loose leaves emerge onto pure white—isolated like an architectural masterpiece.",
    mobileDescription: "Finished dark loose leaves emerge onto pure luminous white, isolated like modern sculpture.",
    meta: ["Pure White Studio", "Orange Flowery Pekoe"],
    theme: "white",
    align: "left",
    cardPosition: "left",
  },
  {
    id: "chapter-10",
    ch: 10,
    startFrame: 1131,
    endFrame: 1280,
    name: "The Tea Experience",
    eyebrow: "CHAPTER 10 — THE TEA EXPERIENCE",
    title: "A Richer Experience.",
    description: "The finished tea reveals its beautiful amber color and distinctive character. Steeping releases a rich golden hue that captures the highland sunshine of Sri Lanka.",
    mobileDescription: "The finished tea reveals rich golden hues capturing the radiant highland sunshine of Sri Lanka.",
    meta: ["Golden Amber Liquor", "Porcelain Vessel"],
    theme: "white",
    align: "right",
    cardPosition: "right",
  },
  {
    id: "chapter-11",
    ch: 11,
    startFrame: 1281,
    endFrame: 1405,
    name: "Packaging",
    eyebrow: "CHAPTER 11 — PACKAGING",
    title: "Carefully Preserved.",
    description: "Thoughtful packaging protects the freshness and aroma of the finished tea. Encased in minimalist ivory tins designed with airtight precision.",
    mobileDescription: "Minimalist canisters protect freshness, aroma, and delicate botanical notes with airtight seal.",
    meta: ["Airtight Ivory Canister", "Zero Oxidation Seal"],
    theme: "white",
    align: "left",
    cardPosition: "left",
  },
  {
    id: "chapter-12",
    ch: 12,
    startFrame: 1406,
    endFrame: 1492,
    name: "Brewing",
    eyebrow: "CHAPTER 12 — BREWING",
    title: "The Perfect Infusion.",
    description: "Water and tea come together to release a beautiful golden-amber infusion. Watch through crystal glass as the leaves unfurl and surrender their botanical essence.",
    mobileDescription: "Water and tea unite to create a deep amber liquor as orthodox leaves slowly unfurl.",
    meta: ["96°C Spring Water", "3–4 Min Infusion"],
    theme: "white",
    align: "left",
    cardPosition: "left",
  },
  {
    id: "chapter-13",
    ch: 13,
    startFrame: 1493,
    endFrame: 1649,
    name: "The Pinnacle",
    eyebrow: "CHAPTER 13 — THE PINNACLE",
    title: "EVERY CUP HAS A JOURNEY.",
    description: "From the misty highlands of Sri Lanka to a moment of pure perfection. Discover the extraordinary story and timeless heritage behind authentic Ceylon Tea.",
    mobileDescription: "From the misty highlands of Sri Lanka to a moment of pure perfection.",
    meta: ["Highland Elevation", "Orthodox Heritage"],
    theme: "white",
    align: "pinnacle",
    cardPosition: "left",
  },
];

/**
 * Returns the active chapter for a given frame index (1 to 1649).
 */
export function getChapterForFrame(frameIndex: number): Chapter {
  const clamped = Math.max(1, Math.min(1649, Math.round(frameIndex)));
  for (const ch of CHAPTERS) {
    if (clamped >= ch.startFrame && clamped <= ch.endFrame) {
      return ch;
    }
  }
  return CHAPTERS[0];
}

/**
 * Calculates normalized progress (0.0 to 1.0) within a chapter's frame span.
 */
export function getChapterProgress(frameIndex: number, chapter: Chapter): number {
  const span = chapter.endFrame - chapter.startFrame;
  if (span <= 0) return 1;
  const progress = (frameIndex - chapter.startFrame) / span;
  return Math.max(0, Math.min(1, progress));
}
