import { AppBrandBar } from "./AppBrandBar";
import { effectiveCardStyle } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { cloudReady, useCloudStatus, getLocalOwner, useEvolutionData } from "@/lib/evolution-data";
import { createPhoneSignOutHandler } from "@/lib/mobile-auth";
import { pullMobileIntoDesktop, pushDesktopIntoMobile } from "@/lib/mobile-bridge";
import { bankStore } from "@/lib/finance-store";
import { wireBankAuth, useBank } from "@/lib/use-bank";
import { BankConnectionPanel } from "@/components/evolution/BankConnectionPanel";

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
  const searchStr = useRouterState({ select: (s) => s.location.searchStr });
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const requestedPage =
    new URLSearchParams(searchStr).get("mobilePage") ||
    (pathname === "/reports" ? "stats" : pathname === "/notes" ? "tasks" : "");
  const mobilePage = ["home", "stats", "profile", "tasks"].includes(requestedPage) ? requestedPage : "";
  const { data } = useEvolutionData();
  const cardStyle = effectiveCardStyle(data.settings);
  const [ready, setReady] = useState(false);
  const [frameKey, setFrameKey] = useState(0);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const status = useCloudStatus();
  const bank = useBank();
  const bankOwner = bank.status === "ready" || bank.status === "error";
  const [bankOpen, setBankOpen] = useState(false);
  // Sign-out / account switch: the store clears synchronously, so close the drawer with it.
  useEffect(() => {
    if (!bankOwner) setBankOpen(false);
  }, [bankOwner]);
  const readyRef = useRef(false);
  const frameRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    let alive = true;
    let poll: ReturnType<typeof setInterval> | null = null;
    const flush = () => {
      if (readyRef.current) pullMobileIntoDesktop();
    };
    const onPhoneSignOut = createPhoneSignOutHandler({
      origin: window.location.origin,
      getFrame: () => frameRef.current?.contentWindow ?? null,
      getOwner: getLocalOwner,
      flush,
      signOut: () => supabase.auth.signOut({ scope: "local" }),
    });
    window.addEventListener("message", onPhoneSignOut);
    let started = false;
    const start = () => {
      if (!alive) return;
      started = true;
      pushDesktopIntoMobile(); // aligns phone store/base to the current account first
      readyRef.current = true;
      setFrameKey((k) => k + 1);
      setReady(true);
      if (!poll) poll = setInterval(flush, 1500);
    };

    // Start only after the account's data has been loaded (or failed / no session),
    // so the phone never starts from — or overwrites — a half-loaded store.
    cloudReady.then(start);

    // Another account is signing in: save this account's latest phone edits, then stop the
    // phone design immediately (it could otherwise write the old account's data back).
    const onOwnerChanging = () => {
      flush();
      readyRef.current = false;
      if (poll) {
        clearInterval(poll);
        poll = null;
      }
      const f = frameRef.current;
      if (f) {
        try {
          f.src = "about:blank";
        } catch {
          /* ignore */
        }
      }
      setReady(false);
    };
    // Desktop data now belongs to the new account → swap phone stores and restart.
    const onOwnerChanged = () => {
      if (started) start();
    };
    // Cloud data that arrives later (re-login, retry after error): save the phone's
    // latest edits first, merge both ways, then reload the phone design with the result.
    const onCloudLoaded = () => {
      if (!readyRef.current) return;
      pullMobileIntoDesktop();
      start();
    };
    window.addEventListener("evolution:owner-changing", onOwnerChanging);
    window.addEventListener("evolution:owner-changed", onOwnerChanged);
    window.addEventListener("evolution:cloud-loaded", onCloudLoaded);
    // Background refresh merged another device's data: reconcile now (three-way, stale phone memory
    // can't revert it); no frame reload, so open forms keep their input. The phone shows it on next load.
    window.addEventListener("evolution:cloud-refreshed", flush);

    supabase.auth.getSession().then(({ data }) => alive && setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setSignedIn(!!session));

    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", flush);
    return () => {
      alive = false;
      if (poll) clearInterval(poll);
      flush();
      sub.subscription.unsubscribe();
      window.removeEventListener("message", onPhoneSignOut);
      window.removeEventListener("evolution:owner-changing", onOwnerChanging);
      window.removeEventListener("evolution:owner-changed", onOwnerChanged);
      window.removeEventListener("evolution:cloud-loaded", onCloudLoaded);
      window.removeEventListener("evolution:cloud-refreshed", flush);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", flush);
    };
  }, []);

  // Owner-only bank data → phone design via in-memory postMessage (exact origin, generation-guarded).
  // Never written to shared storage or the mobile bridge; cleared at once on sign-out/account switch.
  useEffect(() => {
    wireBankAuth();
    const post = () => {
      const w = frameRef.current?.contentWindow;
      if (!w) return;
      const s = bankStore.get();
      const payload =
        s.status === "ready" && s.accounts.length
          ? {
              accounts: s.accounts.filter((a) => a.environment !== "sandbox"),
              balances: s.balances,
              transactions: s.transactions.filter((t) => t.environment !== "sandbox"),
            }
          : null;
      w.postMessage({ type: "evo:bank", gen: bankStore.generation(), payload }, window.location.origin);
    };
    const unsub = bankStore.subscribe(post);
    const f = frameRef.current;
    f?.addEventListener("load", post);
    post();
    return () => {
      unsub();
      f?.removeEventListener("load", post);
    };
  }, [frameKey, ready, pathname]);

  // Appearance has one canonical owner-scoped value. The frame receives it read-only.
  useEffect(() => {
    if (!ready) return;
    const frame = frameRef.current;
    const post = () => frame?.contentWindow?.postMessage({ type: "evo:appearance", cardStyle }, window.location.origin);
    const onReady = (event: MessageEvent) => {
      if (
        event.origin === window.location.origin &&
        event.source === frame?.contentWindow &&
        event.data?.type === "evo:appearance-ready"
      )
        post();
    };
    frame?.addEventListener("load", post);
    window.addEventListener("message", onReady);
    post();
    return () => {
      frame?.removeEventListener("load", post);
      window.removeEventListener("message", onReady);
    };
  }, [ready, frameKey, cardStyle, pathname]);

  // Navigation-only adapter for the legacy same-origin phone surface. Never edits its store.
  useEffect(() => {
    if (!ready) return;
    const frame = frameRef.current;
    let observer: MutationObserver | undefined;
    let detach: (() => void) | undefined;
    const wire = () => {
      observer?.disconnect();
      detach?.();
      const doc = frame?.contentDocument;
      if (!doc) return;
      const onClick = (event: MouseEvent) => {
        const target = event.target as Element | null;
        const button = target?.closest?.('button[title="sys-06"], button.st-card[aria-label^="Open business."]');
        if (!button) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        if (readyRef.current) pullMobileIntoDesktop();
        window.location.assign("/business");
      };
      doc.addEventListener("click", onClick, true);
      detach = () => doc.removeEventListener("click", onClick, true);
      const routes: Record<string, string> = {
        "/wealth": "sys-01",
        "/fitness": "sys-02",
        "/nutrition": "sys-03",
        "/focus": "sys-04",
        "/investing": "sys-05",
        "/journal": "sys-07",
      };
      const title = routes[pathname];
      if (!title) return;
      const open = () => {
        const button = doc.querySelector<HTMLButtonElement>(`button[title="${title}"]`);
        if (!button) return false;
        observer?.disconnect();
        button.click();
        return true;
      };
      if (!open()) {
        observer = new MutationObserver(open);
        observer.observe(doc.documentElement, { childList: true, subtree: true });
      }
    };
    frame?.addEventListener("load", wire);
    wire();
    return () => {
      frame?.removeEventListener("load", wire);
      observer?.disconnect();
      detach?.();
    };
  }, [ready, frameKey, pathname]);

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-background">
      <div className="shrink-0 px-2 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2">
        <AppBrandBar />
      </div>
      <div className="relative min-h-0 flex-1">
        {ready ? (
          <iframe
            key={`${frameKey}:${pathname}`}
            ref={frameRef}
            src={"/evolution-mobile/index.html" + (mobilePage ? "?evoPage=" + mobilePage : "")}
            title="Evolution OS"
            className="h-full w-full border-0"
            allow="autoplay"
          />
        ) : (
          <div className="flex h-full items-center justify-center hud-label text-xs tracking-widest text-primary">
            LOADING…
          </div>
        )}
        {ready && (
          <a
            href="/?section=evo"
            onClick={() => {
              if (readyRef.current) pullMobileIntoDesktop();
            }}
            className="absolute left-2 top-2 rounded-full border border-primary/60 bg-background/95 px-3 py-1 text-[11px] tracking-widest text-primary"
            aria-label="Open Evo Assistant"
          >
            EVO
          </a>
        )}
        {bankOwner && (
          <button
            type="button"
            onClick={() => setBankOpen(true)}
            className="absolute right-2 top-2 rounded-full border border-primary/60 bg-background/90 px-3 py-1 text-[11px] tracking-widest text-primary"
          >
            BANK ACCOUNTS
          </button>
        )}
        {bankOwner && bankOpen && (
          <div
            className="absolute inset-0 z-10 flex flex-col bg-background/95"
            role="dialog"
            aria-label="Bank accounts"
          >
            <div className="flex items-center justify-between border-b border-primary/40 px-4 py-3">
              <span className="hud-label text-xs tracking-widest text-primary">BANK ACCOUNTS</span>
              <button
                type="button"
                onClick={() => setBankOpen(false)}
                className="text-[11px] tracking-widest text-primary"
              >
                CLOSE
              </button>
            </div>
            <p className="px-4 pt-2 text-[10px] text-muted-foreground">
              Numbers in the app artwork are design samples. These are your real stored bank figures.
            </p>
            <div className="flex-1 overflow-y-auto p-3">
              <BankConnectionPanel />
            </div>
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
    </div>
  );
}
