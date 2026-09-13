# Rebuild the mobile HUD as editable code

## Goal
Replace the single embedded mobile-dashboard image with a responsive, code-built version that closely matches its composition, proportions, glow, typography, icons, circuitry, panels, and spacing. Preserve the current navigation, live date/time, and working focus timer.

## Implementation
1. **Use the current artwork as a temporary tracing reference**
   - Measure its major regions and anchor points: header, month selector, seven module nodes, central bonsai, Focus panel, and bottom navigation.
   - Establish one fixed design coordinate system that scales proportionally across mobile widths.

2. **Recreate the background and HUD frame in code**
   - Build the dark grid, cyan edge rails, angular corners, divider lines, circuit traces, terminal lights, and panel outlines with CSS and inline SVG.
   - Keep visual layers separate so individual lines, glows, and sections can be edited later.

3. **Rebuild every visible section as a real component**
   - Header: EVOLUTION OS branding, tagline, notification indicator, and existing live date/time.
   - Month bar: January–December labels with the live month highlighted and earlier months muted.
   - Module network: Focus, Nutrition, Wealth, Fitness, Investing, Journal, and Business using editable vector icons, labels, system numbers, rotating rings, and real navigation links.
   - Center: editable bonsai emblem, concentric rings, pulse, and connecting circuit paths.
   - Focus panel: hourglass display, countdown, Deep Work label, and functional Restart, Start, and Pause controls.
   - Bottom navigation: Home, Stats, Tasks, Profile, and the central bonsai action, all as real controls.

4. **Match and refine visually**
   - Compare the coded version against the reference at the current 430px mobile width.
   - Tune coordinates, line weight, glow intensity, icon scale, typography, and vertical rhythm through screenshot comparisons.
   - Verify narrower and wider phone widths without stretching or overlap.

5. **Remove the embedded artwork**
   - Once the coded recreation passes comparison, remove its image import and all image-overlay hotspot positioning.
   - Keep the CDN pointer only if still referenced elsewhere; otherwise remove it through the asset workflow.

6. **Validate behavior**
   - Test every module and bottom-navigation destination.
   - Test timer start, pause, reset, and continued countdown.
   - Confirm date/time and current-month rollover remain automatic.
   - Check reduced-motion behavior and mobile accessibility labels.

## Technical details
- The recreation will use React components, semantic design tokens, CSS, and inline SVG paths; no screenshot will remain behind the interface.
- The current screen already exposes functional navigation and timer behavior through invisible overlays. Those behaviors will move onto the visible coded controls instead.
- “Matching every detail” will be handled as a pixel-comparison pass. Fine photographic glow/noise may not be mathematically identical, but layout, geometry, icons, labels, lighting, and interactions will be independently editable and visually very close.
