# Match Mobile Styling to Desktop

## Goal
Keep the current mobile layout and three-tap progression unchanged while making its visual treatment feel native to the laptop dashboard.

## Changes
- Replace rounded mobile panels with the desktop chamfered `hud-card` frame, scanlines, double corner strokes, tabs, and technical edge marks.
- Reuse the desktop hologram system for Tasks, Focus, and every module tile, including projection bases, orbital rings, floating motion, and each module’s desktop accent color.
- Bring the desktop icon hierarchy, title numbering, typography, controls, progress bars, and restrained glow treatment into all three mobile stages.
- Keep all current content, ordering, routes, data, timer behavior, unlock stages, and mobile dimensions intact.

## Technical details
- Refactor shared mobile visual helpers inside `MobileDashboard.tsx` around existing `HoloIcon`, `HologramEmblem`, and semantic HUD classes.
- Add only narrowly scoped mobile hologram sizing and frame styles to `styles.css` where existing desktop classes cannot scale cleanly.
- Verify stage 0, stage 1, and the unlocked dashboard at a 430 × 676 mobile viewport, including text fit and card overlap.
