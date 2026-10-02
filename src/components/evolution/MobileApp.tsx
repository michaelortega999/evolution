import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { cloudReady } from "@/lib/evolution-data";
import { pullMobileIntoDesktop, pushDesktopIntoMobile } from "@/lib/mobile-bridge";

/**
 * Phone-only experience: renders the user's finished Evolution OS mobile
 * design (public/evolution-mobile) full-screen. Tasks + calendar stay in
 * sync with the desktop version (and the user's account) via mobile-bridge.
 */
export function useIsPhone() {
  const [isPhone, setIsPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsPhone(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isPhone;
}

export function MobileApp() {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(true);

  useEffect(() => {
    let alive = true;
    const timeout = new Promise((r) => setTimeout(r, 4000));
    Promise.race([cloudReady, timeout]).then(() => {
      if (!alive) return;
      pushDesktopIntoMobile();
      setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => alive && setSignedIn(!!data.session));
    const t = setInterval(pullMobileIntoDesktop, 1500);
    const flush = () => pullMobileIntoDesktop();
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", flush);
    return () => {
      alive = false;
      clearInterval(t);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", flush);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[1000] bg-background">
      {ready && (
        <iframe
          src="/evolution-mobile/index.html"
          title="Evolution OS"
          className="h-[100dvh] w-full border-0"
          allow="autoplay"
        />
      )}
      {!signedIn && (
        <Link
          to="/auth"
          className="absolute left-1/2 top-2 -translate-x-1/2 rounded-full border border-primary/60 bg-background/90 px-3 py-1 text-[11px] tracking-widest text-primary"
        >
          SIGN IN TO SYNC
        </Link>
      )}
    </div>
  );
}
