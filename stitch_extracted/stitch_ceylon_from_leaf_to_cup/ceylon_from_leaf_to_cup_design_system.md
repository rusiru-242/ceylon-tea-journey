---
name: "Ceylon — From Leaf to Cup"
description: "Apple-level minimalism meets premium Swiss editorial design and luxury Ceylon tea storytelling."
---

## Overview

Ceylon — From Leaf to Cup is an immersive, scroll-driven interactive digital storytelling experience celebrating authentic Ceylon tea manufacturing in Sri Lanka. Blending Apple-level minimalism, Swiss editorial precision, and luxury cinematic art direction, the experience guides viewers from high-altitude misty plantations through artisanal factory craft directly into a pure, luminous white studio product showcase.

The visual tone is white-dominant, calm, architectural, and deeply refined. Typography plays a leading role: oversized editorial serif headlines paired with airy, disciplined humanist sans-serif metadata and body text. The interface avoids dark themes, neon gradients, bloated floating cards, and SaaS clutter—letting the authentic film frames command the viewport while pure white surroundings expand infinitely.

## Colors

The palette is anchored in pure white with rich botanical accents drawn directly from Sri Lankan tea heritage: deep forest green for primary editorial text, crisp charcoal for secondary copy, muted granite gray for subtle micro-labels, soft sage for organic accents, and muted gold for luxury detail.

- **Primary:** Forest Green (#18392B), representing rich tea foliage and heritage craftsmanship.
- **Secondary:** Charcoal (#202522), for clean, high-legibility editorial text.
- **Muted Neutral:** Muted Slate (#4E5E55), for chapter numbering, technical metadata, and rule lines with full WCAG AA contrast.
- **Accent:** Soft Sage (#5E735B), for delicate nature markers and active indicators.
- **Luxury Detail:** Deep Gold (#8A6A2C), calibrated for high contrast on pure white.
- **Surface:** Pure White (#FFFFFF) and Soft Ivory (#FAF9F6).

```yaml
colors:
  forest-green: "#18392B"
  charcoal: "#202522"
  muted-slate: "#4E5E55"
  soft-sage: "#5E735B"
  deep-gold: "#8A6A2C"
  soft-ivory: "#FAF9F6"
  pure-white: "#FFFFFF"
  light:
    primary: "#18392B"
    on-primary: "#FFFFFF"
    secondary: "#202522"
    on-secondary: "#FFFFFF"
    surface: "#FFFFFF"
    on-surface: "#18392B"
    surface-container: "#FAF9F6"
    on-surface-container: "#202522"
    outline: "#4E5E55"
```

## Typography

The typography system pairs **Cormorant Garamond**, an exquisite high-contrast Old Style editorial serif, with **Inter**, an ultra-clean geometric/humanist sans-serif, and **Spline Sans Mono** for chapter counters and technical precision.

Every headline larger than 32px includes a carefully calibrated mobile alternative for flawless responsive storytelling.

```yaml
typography:
  display-2xl:
    fontFamily: "Cormorant Garamond"
    fontSize: 72px
    fontWeight: 400
    lineHeight: 76px
    letterSpacing: -1px
  display-2xl-mobile:
    fontFamily: "Cormorant Garamond"
    fontSize: 32px
    fontWeight: 400
    lineHeight: 38px
    letterSpacing: -0.5px
  display-xl:
    fontFamily: "Cormorant Garamond"
    fontSize: 56px
    fontWeight: 400
    lineHeight: 62px
    letterSpacing: -0.75px
  display-xl-mobile:
    fontFamily: "Cormorant Garamond"
    fontSize: 30px
    fontWeight: 400
    lineHeight: 36px
    letterSpacing: -0.5px
  display-lg:
    fontFamily: "Cormorant Garamond"
    fontSize: 44px
    fontWeight: 400
    lineHeight: 50px
    letterSpacing: -0.5px
  display-lg-mobile:
    fontFamily: "Cormorant Garamond"
    fontSize: 28px
    fontWeight: 400
    lineHeight: 34px
    letterSpacing: -0.25px
  headline-lg:
    fontFamily: "Cormorant Garamond"
    fontSize: 36px
    fontWeight: 500
    lineHeight: 42px
    letterSpacing: -0.25px
  headline-lg-mobile:
    fontFamily: "Cormorant Garamond"
    fontSize: 24px
    fontWeight: 500
    lineHeight: 30px
    letterSpacing: 0px
  headline-md:
    fontFamily: "Cormorant Garamond"
    fontSize: 28px
    fontWeight: 500
    lineHeight: 34px
    letterSpacing: 0px
  headline-sm:
    fontFamily: "Cormorant Garamond"
    fontSize: 22px
    fontWeight: 500
    lineHeight: 28px
    letterSpacing: 0px
  title-lg:
    fontFamily: "Inter"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 24px
    letterSpacing: -0.1px
  body-lg:
    fontFamily: "Inter"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 26px
    letterSpacing: 0px
  body-md:
    fontFamily: "Inter"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 22px
    letterSpacing: 0px
  label-lg:
    fontFamily: "Inter"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 18px
    letterSpacing: 1px
  label-sm:
    fontFamily: "Spline Sans Mono"
    fontSize: 11px
    fontWeight: 500
    lineHeight: 16px
    letterSpacing: 1.5px
  label-xs:
    fontFamily: "Spline Sans Mono"
    fontSize: 10px
    fontWeight: 500
    lineHeight: 14px
    letterSpacing: 1.5px
```

## Layout & Spacing

The layout is built upon a cinematic full-viewport canvas pinned during scrolling, flanked by Swiss editorial margins and asymmetrical negative space. Text reveals are positioned into natural negative zones of the film frames (lower thirds, upper corners, and left columns) to respect the visual subject.

Spacing follows an 8px architectural scale with a 4px sub-step.

```yaml
spacing:
  gutter-xs: 4px
  gutter-sm: 8px
  gutter-md: 16px
  gutter-lg: 24px
  gutter-xl: 32px
  gutter-2xl: 48px
  section-gap: 64px
  viewport-pad: 40px
```

## Elevation & Depth

No artificial drop shadows, no bubbly 3D cards, and no glassmorphic blurs are permitted. Depth is established exclusively through:
1. Cinematic photographic depth of field present in the authentic video frames.
2. Crisp layered typography floating over negative space.
3. Pure white spatial infinity in the studio transition scenes.
4. Subtle border strokes for architectural containment.

## Shapes

Shapes are strictly geometric, architectural, and restrained. Rectangles use razor-sharp or subtle 2px to 4px corners; circular indicators and pill buttons are reserved for refined interactive controls and timeline scrub markers.

```yaml
rounded:
  none: 0px
  sm: 2px
  md: 4px
  lg: 8px
  full: 9999px
```

## Motion & Micro-interaction

Interactivity is driven by buttery smooth continuous scroll physics (GSAP ScrollTrigger / requestAnimationFrame lerp) controlling video frame scrubbing. Scrolling forward advances the tea journey from misty dawn to porcelain cup; scrolling in reverse unwinds time. Text transitions use elegant staggered vertical drifts and opacity fades.

```yaml
motion:
  frame-scrub:
    duration: 120ms
    delay: 0ms
    timingFunction: cubic-bezier(0.16, 1, 0.3, 1)
  text-fade:
    duration: 400ms
    delay: 50ms
    timingFunction: cubic-bezier(0.25, 1, 0.5, 1)
  subtle-drift:
    duration: 600ms
    delay: 0ms
    timingFunction: cubic-bezier(0.16, 1, 0.3, 1)
```

## Voice & Content Strategy

The voice is understated, poetic, authoritative, and evocative. We speak with the quiet confidence of a heritage tea house and the crisp modern clarity of an architectural monograph. 

- Headings use title case or poetic sentence phrasing with deliberate line breaks.
- Eyebrows are restrained uppercase with generous letter-spacing (e.g. `CHAPTER 01 — THE ORIGIN`).
- Narrative descriptions are concise (15–25 words), avoiding retail buzzwords and marketing hyperbole.

## Components

- `components/button.html`
- `components/typography.html`
- `components/card.html`
