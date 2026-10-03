import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useBank, loadOverview } from "@/lib/use-bank";
import { bankStore } from "@/lib/finance-store";
import { latestBalances, fmtCents } from "@/lib/finance-core";
import { resolveBankDuplicate } from "@/lib/finance.functions";

const STATUS: Record<string, string> = {
  no_connection: "Transactions: none imported — spending and income unavailable.",
  initial_sync: "Transactions: first import not finished — totals unavailable.",
  truncated: "Transactions: more than the loaded limit — totals unavailable.",
  ok: "Transactions: fully imported.",
};

/** Read-only, owner-only list of real bank accounts with cents-precise balances. Renders nothing for others. */
export function BankAccountsView() {
  const bank = useBank();
  const resolveFn = useServerFn(resolveBankDuplicate);
  if (bank.status !== "ready" && bank.status !== "error") return null;
  const latest = latestBalances(bank.balances);
  const snapshotIds = bank.accounts.filter((a) => a.source === "snapshot" && (a.link_status ?? "active") === "active");

  const resolve = async (linkedId: string, snapshotId: string | null, same: boolean) => {
    const r = await resolveFn({ data: { linkedId, snapshotId, same } });
    if (r.ok) toast.success("Saved."); else toast.error(r.error);
    await bankStore.reload(loadOverview);
  };

  return (
    <div className="space-y-3 text-xs">
      <p className="hud-label text-[10px] tracking-widest text-primary">YOUR REAL BANK DATA — READ-ONLY</p>
      {bank.accounts.length === 0 && <p className="text-muted-foreground">No bank accounts stored.</p>}
      <ul className="divide-y divide-border">
        {bank.accounts.map((a) => {
          const s = latest.get(a.id);
          const status = a.environment === "sandbox" ? "Test data — not counted"
            : a.link_status === "superseded" ? "Replaced by linked account — not counted"
            : a.link_status === "needs_review" ? "Possible duplicate — not counted until confirmed"
            : a.source === "snapshot" ? "Imported snapshot, not live" : "Linked account";
          return (
            <li key={a.id} className="py-2 space-y-1">
              <div className="flex justify-between gap-2">
                <span className="text-foreground truncate">{a.institution_name ? `${a.institution_name} · ` : ""}{a.name}{a.mask ? ` ••${a.mask}` : ""}</span>
                <span className="tabular-nums text-primary whitespace-nowrap">{fmtCents(s?.current_balance)}</span>
              </div>
              <div className="flex justify-between gap-2 text-muted-foreground text-[10px]">
                <span>{a.type}{a.subtype ? ` / ${a.subtype}` : ""} · {status}</span>
                <span>{s ? (s.as_of ? `Balance as of ${new Date(s.as_of).toLocaleString()}` : "Balance date unknown") : "No balance"}</span>
              </div>
              {s?.available_balance != null && <div className="text-[10px] text-muted-foreground">Available {fmtCents(s.available_balance)}</div>}
              {a.link_status === "needs_review" && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {snapshotIds.map((x) => (
                    <button key={x.id} className="rounded border border-primary/50 px-2 py-0.5 text-[10px] text-primary" onClick={() => resolve(a.id, x.id, true)}>
                      Same as {x.name}{x.mask ? ` ••${x.mask}` : ""}
                    </button>
                  ))}
                  <button className="rounded border border-border px-2 py-0.5 text-[10px]" onClick={() => resolve(a.id, null, false)}>Different account</button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <p className="text-muted-foreground">{STATUS[bank.coverage.reason]}</p>
      <p className="text-muted-foreground">Debts not linked here are not included.</p>
    </div>
  );
}
