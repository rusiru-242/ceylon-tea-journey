import { FRAME_WIDTH, FRAME_HEIGHT } from '../data/frameManifest';
import { DecodedFrame } from './frameManager';

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private lastRenderedAsset: DecodedFrame | null = null;
  private lastRenderedIndex: number = -1;

  // Cached layout dimensions
  private cw = 0;
  private ch = 0;
  private nw = 0;
  private nh = 0;
  private nx = 0;
  private ny = 0;
  private scale = 1;
  private isMobilePortrait = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', {
      alpha: false,
    });
    
    if (!context) {
      throw new Error('Could not obtain 2D rendering context');
    }
    this.ctx = context;
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'medium';
  }

  /**
   * Resizes canvas buffer with device pixel ratio (capped at 2 on desktop, 1.5 on mobile).
   */
  public resize(width: number, height: number, dpr = window.devicePixelRatio || 1): void {
    const rawW = width > 0 ? width : (this.canvas.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 1280));
    const rawH = height > 0 ? height : (this.canvas.clientHeight || (typeof window !== 'undefined' ? window.innerHeight : 720));
    
    const isMobile = rawW < 768;
    this.isMobilePortrait = isMobile && rawH > rawW;
    const maxDpr = isMobile ? 1.5 : 2.0;
    const cappedDpr = Math.min(maxDpr, Math.max(1, dpr));
    
    const targetWidth = Math.max(320, Math.round(rawW * cappedDpr));
    const targetHeight = Math.max(240, Math.round(rawH * cappedDpr));

    if (this.canvas.width !== targetWidth || this.canvas.height !== targetHeight) {
      this.canvas.width = targetWidth;
      this.canvas.height = targetHeight;
    }

    this.cw = targetWidth;
    this.ch = targetHeight;

    // Precalculate cover geometry
    const iw = FRAME_WIDTH;
    const ih = FRAME_HEIGHT;
    this.scale = Math.max(this.cw / iw, this.ch / ih);
    this.nw = iw * this.scale;
    this.nh = ih * this.scale;
    this.nx = (this.cw - this.nw) / 2;
    this.ny = (this.ch - this.nh) / 2;

    if (this.ch > this.cw) {
      this.nx = (this.cw - this.nw) * 0.5;
    }

    // Re-draw last frame if available
    if (this.lastRenderedAsset) {
      this.drawDirect(this.lastRenderedAsset, this.lastRenderedIndex);
    }
  }

  /**
   * High-frequency render call: draws DecodedFrame directly to canvas.
   */
  public draw(asset: DecodedFrame | null, frameIndex: number): boolean {
    if (!asset) {
      return false;
    }

    // Skip if already displaying this exact frame asset
    if (this.lastRenderedIndex === frameIndex && this.lastRenderedAsset === asset) {
      return true;
    }

    return this.drawDirect(asset, frameIndex);
  }

  private drawDirect(asset: DecodedFrame, frameIndex: number): boolean {
    if (this.cw <= 0 || this.ch <= 0) {
      this.resize(this.canvas.clientWidth, this.canvas.clientHeight);
    }

    // Pure white studio scenes (frame 985 onwards): clear with crisp white background
    if (frameIndex >= 985) {
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillRect(0, 0, this.cw, this.ch);
    }

    let dx = this.nx;
    let dy = this.ny;
    let dw = this.nw;
    let dh = this.nh;

    // Mobile Portrait ONLY: In the final scene (Chapter 13 tea cup presentation),
    // center the finished porcelain tea cup and saucer so it's fully, beautifully visible.
    if (this.isMobilePortrait && frameIndex >= 1460) {
      const t = Math.min(1, Math.max(0, (frameIndex - 1460) / 45));
      const easeT = t * t * (3 - 2 * t);

      // In the 1280x720 video frame, the tea cup & saucer center is at:
      // X = 855px (approx 66.8% of frame width)
      // Y = 475px (approx 66.0% of frame height)
      const cupCenterXRatio = 0.668;
      const cupCenterYRatio = 0.660;

      // Fit the entire saucer & cup comfortably within mobile width with balanced margins
      const targetScale = Math.min(this.scale, (this.cw * 0.85) / 440);
      const targetW = FRAME_WIDTH * targetScale;
      const targetH = FRAME_HEIGHT * targetScale;

      // Perfectly center the tea cup horizontally on mobile screen
      const targetDx = (this.cw * 0.5) - (cupCenterXRatio * targetW);

      // Position cup vertically in the golden ratio of the visible upper screen above the bottom card
      const targetDy = (this.ch * 0.40) - (cupCenterYRatio * targetH);

      dx = this.nx + (targetDx - this.nx) * easeT;
      dy = this.ny + (targetDy - this.ny) * easeT;
      dw = this.nw + (targetW - this.nw) * easeT;
      dh = this.nh + (targetH - this.nh) * easeT;
    }

    // Direct draw with geometry
    this.ctx.drawImage(asset, dx, dy, dw, dh);

    this.lastRenderedAsset = asset;
    this.lastRenderedIndex = frameIndex;
    return true;
  }

  public getLastRenderedIndex(): number {
    return this.lastRenderedIndex;
  }

  public clear() {
    this.lastRenderedAsset = null;
    this.lastRenderedIndex = -1;
  }
}
