
- Phones (<768px, except /auth) render the hand-built Evolution OS prototype from public/evolution-mobile/ in a full-screen frame (MobileApp in __root); src/lib/mobile-bridge.ts syncs its tasks/events with desktop evoTasks/calendar (desktop→phone on load, phone→desktop by polling). Why: keeps the mobile design pixel-exact while sharing data through the desktop store and cloud sync.
