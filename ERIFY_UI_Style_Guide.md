# ERIFY™ UI Style Guide 💎🔥

**Version:** 1.0  
**Owner:** ERIFY Design Team  
**Status:** LIVE · Last updated: 2025-09-04

---

> **ERIFY™ stands for cinematic luxury, powered by next-gen AI.**  
> Use this guide to keep every pixel in sync with our brand—from quick MVPs to flagship features.

---

## 🧬 1. Brand DNA

- **Luxury, modern, cinematic.** Deep black canvas, neon glows: diamond blue & flame orange.
- **Clarity over clutter.** Focus on few, strong elements; generous spacing.
- **Accessible, always.** Contrast ≥ 4.5:1, readable everywhere.
- **Delight through motion.** Animations are purposeful, subtle, and never overwhelming.

---

## 🎨 2. Color Palette

| Name          | Token                   | Hex     | Usage                  |
| ------------- | ----------------------- | ------- | ---------------------- |
| Diamond Blue  | `--erify-blue`          | #19CCFA | Primary accent, glow   |
| Blue Electric | `--erify-blue-electric` | #11C9FF | Focus ring, inner halo |
| Flame Orange  | `--erify-orange`        | #DE760B | Secondary accent, CTA  |
| Orange Warm   | `--erify-orange-warm`   | #FF8A1A | CTA glow, play halo    |
| Black         | `--erify-black`         | #0A0B0C | App background         |
| Elevation 1   | `--erify-elev-1`        | #111315 | Card/surfaces          |
| Elevation 2   | `--erify-elev-2`        | #171A1D | Hovered/card overlay   |
| Text          | `--erify-text`          | #EEF2F6 | Main text              |
| Muted Text    | `--erify-text-muted`    | #9BA7B4 | Secondary text         |
| Success       | `--erify-success`       | #2ECC71 | Success state          |
| Warning       | `--erify-warning`       | #F39C12 | Warning                |
| Danger        | `--erify-danger`        | #E63946 | Error/destructive      |

**Gradients**

- Diamond edge: `linear-gradient(135deg, #0AA0D1 0%, #19CCFA 50%, #3DE6FF 100%)`
- Flame edge: `linear-gradient(135deg, #DE760B 0%, #FF8A1A 60%, #FFC06A 100%)`

---

## ✨ 3. Glow System

- **L1 (Subtle):** `0 0 10px 2px var(--erify-blue)`
- **L2 (CTA):** `0 0 18px 4px var(--erify-blue), 0 0 28px 10px var(--erify-orange-warm)`
- **L3 (Hero):** `0 0 30px 6px var(--erify-blue-electric), 0 0 60px 24px var(--erify-orange-warm)`

Use glows to draw attention (buttons, play CTA, focus), never as a background.

---

## 🅰️ 4. Typography

- **Primary:** Neue Haas Grotesk Display / Gilroy (web license).
- **Fallback:** Inter, system-ui
- **Scale:**
  - Display: 34–42px / 700
  - H1: 28px / 700
  - H2: 22px / 600
  - H3: 18px / 600
  - Body: 16px / 400
  - Caption: 13px / 400
  - Button: 16px / 700 (uppercase opt, +0.5px tracking)
- **Tracking:** +0.5–1.0px for uppercase.

---

## 🟦 5. Spacing & Radius

- **Base unit:** 8px (4px for compact)
- **Radius:** 4 / 8 / 12 / 16 / 24 / 999px (pill/circle)
- **Cards:** 12–16px; buttons: 999px (pill)

---

## 🛠️ 6. Components

### Buttons

- **Primary Glow:** `.btn.btn--glow`
- **Ghost:** `.btn.btn--ghost`
- **Danger:** `.btn.btn--danger`
- **Icon:** `.btn-icon`
- **Play CTA:** `.btn-play` (marquee, glowing)

### Cards

- `.card` (surface), `.card--glow` (featured)
- Media card: cover, title, subtitle, progress

### Bottom Nav

- `.nav-bottom` (5 slots, L1 glow on active)

### Inputs

- `.field` (focus ring: L1 blue)

---

## 🌈 7. Motion

- **Hover:** scale 1.03, soft shadow
- **Press:** scale 0.98
- **Pulse:** `erify-pulse` keyframe on new/hero
- **Reduce motion:** respects `prefers-reduced-motion`

---

## ♿ 8. Accessibility

- Tap: ≥ 44×44px
- Focus ring: 2px solid `--erify-blue-electric` + glow
- Body text contrast ≥ 4.5:1
- Never use color only for meaning

---

## 🏷️ 9. GitHub Label Colors

- feature: `#19CCFA`
- bug: `#E63946`
- design: `#FF8A1A`
- docs: `#9BA7B4`
- good first issue: `#2ECC71`

---

## 🧩 10. Usage Examples

### Play button

```html
<button class="btn-play" aria-label="Play">
  <svg width="22" height="22"><path fill="currentColor" d="M8 5v14l11-7z" /></svg>
</button>
```

### Glow primary button

```html
<button class="btn btn--glow">Post</button>
```

### Media card

```html
<article class="card card--glow">
  <img class="card__cover" src="cover.jpg" alt="Album cover" />
  <div class="card__body">
    <h3 class="card__title">Exclusive Drop – Luxury Playlist</h3>
    <p class="card__subtitle">by ARTIST</p>
  </div>
</article>
```

---

## 📦 11. Code Kits

- `/styles/erify-glow-kit.css` – Drop-in, production ready
- `/styles/erify-glow-kit.scss` – Variables, mixins for custom builds

---

**💎🔥 ERIFY — Luxury, at the speed of light.**
