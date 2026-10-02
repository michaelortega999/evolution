import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { cloudReady, useCloudStatus } from "@/lib/evolution-data";
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
  const [frameKey, setFrameKey] = useState(0);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const status = useCloudStatus();
  const readyRef = useRef(false);

  useEffect(() => {
    let alive = true;
    let poll: ReturnType<typeof setInterval> | null = null;
    const flush = () => { if (readyRef.current) pullMobileIntoDesktop(); };

    // Start only after the account's data has been loaded (or failed / no session),
    // so the phone never starts from — or overwrites — a half-loaded store.
    cloudReady.then(() => {
      if (!alive) return;
      pushDesktopIntoMobile();
      readyRef.current = true;
      setReady(true);
      poll = setInterval(flush, 1500);
    });

    // Cloud data that arrives later (re-login, retry after error): save the phone's
    // latest edits first, merge both ways, then reload the phone design with the result.
    const onCloudLoaded = () => {
      if (!readyRef.current) return;
      pullMobileIntoDesktop();
      pushDesktopIntoMobile();
      setFrameKey((k) => k + 1);
    };
    window.addEventListener("evolution:cloud-loaded", onCloudLoaded);

    supabase.auth.getSession().then(({ data }) => alive && setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setSignedIn(!!session));

    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", flush);
    return () => {
      alive = false;
      if (poll) clearInterval(poll);
      flush();
      sub.subscription.unsubscribe();
      window.removeEventListener("evolution:cloud-loaded", onCloudLoaded);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", flush);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[1000] bg-background">
      {ready ? (
        <iframe
          key={frameKey}
          src="/evolution-mobile/index.html"
          title="Evolution OS"
          className="h-[100dvh] w-full border-0"
          allow="autoplay"
        />
      ) : (
        <div className="flex h-full items-center justify-center hud-label text-xs tracking-widest text-primary">
          LOADING…
        </div>
      )}
      {signedIn === false && (
        <Link
          to="/auth"
          className="absolute left-1/2 top-2 -translate-x-1/2 rounded-full border border-primary/60 bg-background/90 px-3 py-1 text-[11px] tracking-widest text-primary"
        >
          SIGN IN TO SYNC
        </Link>
      )}
      {signedIn && status === "error" && (
        <div className="absolute left-1/2 top-2 -translate-x-1/2 rounded-full border border-destructive/60 bg-background/90 px-3 py-1 text-[11px] tracking-widest text-destructive">
          OFFLINE · SAVED ON DEVICE
        </div>
      )}
    </div>
  );
}
