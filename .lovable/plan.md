# Bring your finished mobile design into the app

## What you need to send
1. **The code** — attach the HTML/React files (a .zip of the project folder is easiest), or paste them in chat.
2. **A screenshot of each finished screen** (home plus every other page you designed). These become the exact backgrounds, and they show me what each page should look like.
3. A short list matching each screenshot to its page (for example: "screen 3 = Wealth").

## How it will work (same method as your current mobile home)
- Each finished screen is placed in the app exactly as you designed it, untouched.
- Invisible tap zones go over every button and icon so they take you to the right page.
- Live parts sit on top of the picture: date and time, the focus timer (Pause / Start / Restart), month bar, and the bottom bar.
- Any animations from your code (spinning rings, pulses, glows) are copied over and placed on top.
- Only phone screens change. The laptop/desktop version stays exactly as it is.

## Steps
1. Read your code and screenshots, and list every screen, button and animation.
2. Add each screen picture to the app.
3. Build the mobile version of each page: picture plus tap zones plus live parts, reusing what already works (timer, date, month bar).
4. Keep the shared bottom bar consistent on every page, unless your design has its own.
5. Test every page at phone size: every tap goes to the right place, the timer works, nothing overlaps, and no laptop page changed.

## Technical details
- Screen images are stored as CDN assets. Each page gets a mobile-only layer (under 768px) using the same percentage-positioned overlay system as `MobileDashboard.tsx`.
- Styles and animations from the uploaded code are ported into `styles.css` with a prefix per page. `prefers-reduced-motion` is respected.
- Live features use the existing hooks (`useFocusTimer`, `useSelectedMonth`, and the evolution data store), so the data stays in sync with desktop.
- Any of your code that can be used directly as React (not just a picture) is kept as real, editable components.
