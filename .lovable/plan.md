# Replace the Mobile Home Screen with the Uploaded HUD

## What will change
- Use the uploaded `IMG_0956.png` unchanged as the complete mobile home-screen artwork.
- Keep the existing desktop dashboard unchanged.
- Place invisible tap zones over Wealth, Fitness, Nutrition, Focus, Investing, Business, and Journal.
- Add slow cyan rotating ring overlays centered on all seven module icons.
- Add a subtle pulse overlay centered on the bonsai.
- Place invisible tap zones over the image’s bottom navigation: Home, Stats, bonsai, Tasks, and Profile.
- Make the image’s Restart, Start, and Pause areas control the existing persistent focus timer, with a live countdown displayed over the timer readout.
- Keep the existing live date/time behavior by overlaying the current date and time onto the image header.

## Interaction mapping
- Module icons open their matching pages.
- Bottom Home opens the home screen; Stats opens Reports; Tasks opens Tasks; Profile opens Settings; bonsai returns to the top of the mobile home screen.
- Focus controls reset, start/resume, and pause the same timer used by the Focus page.

## Technical details
- Upload the exact source image through the project asset flow without editing or recompressing it.
- Replace the current separately rendered mobile header, month selector, hub, focus card, and bottom bar with one aspect-ratio-locked image stage and transparent overlays.
- Use percentage coordinates so hotspots and animations stay aligned at different mobile widths.
- Add reduced-motion handling for rotating and pulsing overlays.
- Verify at the current 430px mobile viewport that every hotspot is aligned, the countdown updates, and navigation works.
