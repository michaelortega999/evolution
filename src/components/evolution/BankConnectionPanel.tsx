import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Landmark } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { BankAccountsView } from "@/components/evolution/BankAccountsView";
import { Panel } from "@/components/evolution/ModuleLayout";
import { Button } from "@/components/ui/button";
import { useBank, loadOverview } from "@/lib/use-bank";
import { bankStore } from "@/lib/finance-store";
import { createBankLinkToken, exchangeBankPublicToken, refreshBankData } from "@/lib/finance.functions";

type PlaidHandler = { open: () => void };
declare global { interface Window { Plaid?: { create: (o: Record<string, unknown>) => PlaidHandler } } }

function loadPlaidScript(): Promise<void> {
  if (window.Plaid) return Promise.resolve();
  return new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = "https://cdn.plaid.com/link/v2/stable/link-initialize.js";
    s.onload = () => res(); s.onerror = () => rej(new Error("load"));
    document.head.appendChild(s);
  });
}

/** Owner-only. Renders nothing for anyone the server did not confirm as the finance owner. */
export function BankConnectionPanel() {
  const bank = useBank();
  const linkFn = useServerFn(createBankLinkToken);
  const exchangeFn = useServerFn(exchangeBankPublicToken);
  const refreshFn = useServerFn(refreshBankData);
  const [busy, setBusy] = useState(false);
  const owner = bank.status === "ready" || bank.status === "error";
  const resumed = useRef(false);

  const openLink = async (token: string, receivedRedirectUri?: string) => {
    await loadPlaidScript();
    // Link token kept only for the OAuth round trip (short-lived, not a bank credential).
    sessionStorage.setItem("evo:plaid-link-token", token);
    window.Plaid!.create({
      token,
      ...(receivedRedirectUri ? { receivedRedirectUri } : {}),
      onSuccess: async (publicToken: string, meta: { institution?: { name?: string } }) => {
        sessionStorage.removeItem("evo:plaid-link-token");
        const ex = await exchangeFn({ data: { publicToken, institutionName: meta?.institution?.name } });
        if (!ex.ok) { toast.error(ex.error); setBusy(false); return; }
        await refresh();
      },
      onExit: () => { sessionStorage.removeItem("evo:plaid-link-token"); setBusy(false); },
    }).open();
  };

  // Returning from a bank's own sign-in page (OAuth): resume Link once, owner only.
  useEffect(() => {
    if (!owner || resumed.current) return;
    const token = sessionStorage.getItem("evo:plaid-link-token");
    if (!token || !new URLSearchParams(window.location.search).has("oauth_state_id")) return;
    resumed.current = true;
    setBusy(true);
    openLink(token, window.location.href).catch(() => { toast.error("Bank data is unavailable right now."); setBusy(false); });
  }, [owner]);

  if (bank.status !== "ready" && bank.status !== "error") return null;

  const refresh = async () => {
    setBusy(true);
    try {
      const r = await refreshFn();
      if (r.ok) toast.success(r.flagged ? "Refreshed. Some accounts need your confirmation." : "Bank data refreshed."); else toast.error(r.error);
      await bankStore.reload(loadOverview);
    } catch { toast.error("Bank data is unavailable right now."); }
    finally { setBusy(false); }
  };

  const connect = async () => {
    setBusy(true);
    try {
      const r = await linkFn();
      if (!r.ok) { toast.error(r.error); setBusy(false); return; }
      await openLink(r.linkToken);
    } catch { toast.error("Bank data is unavailable right now."); setBusy(false); }
  };

  const sandbox = bank.env === "sandbox";
  return (
    <Panel title="BANK CONNECTION">
      <div className="flex items-center gap-2 mb-3 text-muted-foreground text-xs">
        <Landmark className="h-4 w-4" /> Private, read-only. Only visible on your account.
      </div>
      <div className="mb-4"><BankAccountsView /></div>
      {!bank.configured ? (
        <p className="text-xs text-foreground">Bank connection setup required.</p>
      ) : (
        <div className="space-y-3">
          {!bank.oauthRedirect && <p className="text-xs text-muted-foreground">Banks that sign in on their own website (OAuth) also need a redirect address set up.</p>}
          {sandbox && <p className="text-xs text-destructive">TEST MODE — sandbox records are test data and are never counted in Wealth.</p>}
          <ul className="text-xs space-y-1">
            {bank.connections.length === 0 && <li className="text-muted-foreground">No bank connected.</li>}
            {bank.connections.map((c) => (
              <li key={c.id} className="flex justify-between gap-2">
                <span>{c.institution_name ?? "Bank"}{c.environment === "sandbox" ? " (test)" : ""}</span>
                <span className="text-muted-foreground">{c.last_synced_at ? `Refreshed ${new Date(c.last_synced_at).toLocaleString()}` : "Not refreshed yet"}</span>
              </li>
            ))}
          </ul>
          <div className="flex gap-3">
            <Button onClick={connect} disabled={busy} variant="outline" className="hud-label text-[10px]">Connect bank</Button>
            {bank.connections.length > 0 && <Button onClick={refresh} disabled={busy} variant="outline" className="hud-label text-[10px]">Refresh</Button>}
          </div>
        </div>
      )}
      {bank.error && <p className="mt-2 text-xs text-destructive">{bank.error}</p>}
    </Panel>
  );
}
