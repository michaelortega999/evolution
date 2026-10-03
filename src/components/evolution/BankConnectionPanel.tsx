import { useState } from "react";
import { toast } from "sonner";
import { Landmark } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
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
  if (bank.status !== "ready" && bank.status !== "error") return null;

  const refresh = async () => {
    setBusy(true);
    try {
      const r = await refreshFn();
      if (r.ok) toast.success("Bank data refreshed."); else toast.error(r.error);
      await bankStore.reload(loadOverview);
    } catch { toast.error("Bank data is unavailable right now."); }
    finally { setBusy(false); }
  };

  const connect = async () => {
    setBusy(true);
    try {
      const r = await linkFn();
      if (!r.ok) { toast.error(r.error); setBusy(false); return; }
      await loadPlaidScript();
      window.Plaid!.create({
        token: r.linkToken,
        onSuccess: async (publicToken: string, meta: { institution?: { name?: string } }) => {
          const ex = await exchangeFn({ data: { publicToken, institutionName: meta?.institution?.name } });
          if (!ex.ok) { toast.error(ex.error); setBusy(false); return; }
          await refresh();
        },
        onExit: () => setBusy(false),
      }).open();
    } catch { toast.error("Bank data is unavailable right now."); setBusy(false); }
  };

  const sandbox = bank.env === "sandbox";
  return (
    <Panel title="BANK CONNECTION">
      <div className="flex items-center gap-2 mb-3 text-muted-foreground text-xs">
        <Landmark className="h-4 w-4" /> Private, read-only. Only visible on your account.
      </div>
      {!bank.configured ? (
        <p className="text-xs text-foreground">Bank connection setup required.</p>
      ) : (
        <div className="space-y-3">
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
