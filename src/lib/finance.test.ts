import { describe, it, expect } from "vitest";
import { flowCoverage, dedupeById, matchSnapshotAccount, isFinanceOwner, FINANCE_OWNER_ID, summarizeBalances, summarizeFlows, applySyncPage, type BankAccount, type BankTx, type BalanceSnapshot } from "./finance-core";
import { createBankStore } from "./finance-store";

const acct = (id: string, type: string, environment = "production"): BankAccount => ({ id, name: id, mask: null, type, subtype: null, source: "snapshot", environment });
const snap = (account_id: string, bal: number | null, as_of: string | null = "2026-10-01T00:00:00Z", created_at = "2026-10-01"): BalanceSnapshot => ({ account_id, current_balance: bal, available_balance: null, as_of, source: "snapshot", created_at });
const tx = (p: Partial<BankTx> & { amount: number }): BankTx => ({ id: Math.random().toString(), account_id: "chk", provider_transaction_id: null, posted_date: "2026-10-02", authorized_date: null, name: "x", merchant_name: null, pending: false, category_primary: "GENERAL_MERCHANDISE", is_transfer: false, environment: "production", removed_at: null, ...p });

describe("owner access", () => {
  it("denies anonymous and non-owner users", () => {
    expect(isFinanceOwner(null)).toBe(false);
    expect(isFinanceOwner(undefined)).toBe(false);
    expect(isFinanceOwner("00000000-0000-0000-0000-000000000000")).toBe(false);
    expect(isFinanceOwner(FINANCE_OWNER_ID)).toBe(true);
  });
});

describe("balances", () => {
  it("uses only the latest snapshot and never adds transactions on top", () => {
    const s = summarizeBalances([acct("chk", "depository")], [snap("chk", 100, "2026-09-01T00:00:00Z", "a"), snap("chk", 250, "2026-10-01T00:00:00Z", "b")]);
    expect(s.assets).toBe(250);
    expect(s.cash).toBe(250);
  });
  it("prefers the most recently retrieved snapshot even when its balance date is unknown", () => {
    const s = summarizeBalances([acct("chk", "depository")], [snap("chk", 100, "2026-09-01T00:00:00Z", "2026-09-02"), snap("chk", 300, null, "2026-10-03")]);
    expect(s.assets).toBe(300);
    expect(s.anyDateUnknown).toBe(true);
  });
  it("repeat refreshes add snapshots but never duplicate the counted balance", () => {
    const s = summarizeBalances([acct("chk", "depository")], [snap("chk", 300, null, "a"), snap("chk", 300, null, "b"), snap("chk", 300, null, "c")]);
    expect(s.assets).toBe(300);
  });
  it("seed snapshot superseded by a linked account is not double counted; needs_review excluded", () => {
    const seed = { ...acct("seed", "depository"), link_status: "superseded" };
    const linked = { ...acct("lnk", "depository"), source: "plaid" };
    const dup = { ...acct("dup", "depository"), link_status: "needs_review" };
    const s = summarizeBalances([seed, linked, dup], [snap("seed", 300), snap("lnk", 310), snap("dup", 310)]);
    expect(s.assets).toBe(310);
    expect(s.needsReview).toBe(1);
  });
  it("treats missing balances as unavailable, not zero", () => {
    const s = summarizeBalances([acct("chk", "depository")], []);
    expect(s.assets).toBeNull();
    expect(s.accountsWithoutBalance).toBe(1);
  });
  it("separates known liabilities and flags unknown balance dates", () => {
    const s = summarizeBalances([acct("chk", "depository"), acct("cc", "credit")], [snap("chk", 500, null), snap("cc", 120)]);
    expect(s.knownLiabilities).toBe(120);
    expect(s.assets).toBe(500);
    expect(s.anyDateUnknown).toBe(true);
    expect(s.oldestAsOf).toBeNull();
  });
  it("never counts sandbox accounts", () => {
    const s = summarizeBalances([acct("sb", "depository", "sandbox")], [snap("sb", 9999)]);
    expect(s.assets).toBeNull();
    expect(s.sandbox).toBe(true);
  });
});

describe("flows", () => {
  it("excludes pending and transfers from spend and income", () => {
    const f = summarizeFlows([
      tx({ amount: 40 }),
      tx({ amount: 30, pending: true }),
      tx({ amount: 500, category_primary: "TRANSFER_OUT" }),
      tx({ amount: -500, category_primary: "TRANSFER_IN" }),
      tx({ amount: -1000, category_primary: "INCOME" }),
      tx({ amount: -2000, category_primary: "INCOME", pending: true }),
    ], "2026-10");
    expect(f.spend).toBe(40);
    expect(f.income).toBe(1000);
  });
  it("only explicit refund evidence reduces spend; never below zero", () => {
    const f = summarizeFlows([
      tx({ amount: 80 }),
      tx({ amount: -30, category_detailed: "GENERAL_MERCHANDISE_REFUND" }),
      tx({ amount: -50, category_primary: "TRAVEL", refund_of_transaction_id: "t9" }),
    ], "2026-10");
    expect(f.spend).toBe(50);
    expect(f.refunds).toBe(80);
    expect(f.income).toBe(0);
  });
  it("unclassified deposits are unknown inflows, not refunds or income", () => {
    const f = summarizeFlows([tx({ amount: 80 }), tx({ amount: -30 }), tx({ amount: -25, category_primary: null })], "2026-10");
    expect(f.spend).toBe(80);
    expect(f.income).toBe(0);
    expect(f.unknownInflow).toBe(55);
  });
  it("skips transactions of accounts excluded from totals", () => {
    const f = summarizeFlows([tx({ amount: 20, account_id: "dup" }), tx({ amount: 5 })], "2026-10", new Set(["chk"]));
    expect(f.spend).toBe(5);
  });
  it("ignores removed rows and other months", () => {
    const f = summarizeFlows([tx({ amount: 10, removed_at: "2026-10-03" }), tx({ amount: 10, posted_date: "2026-09-30" })], "2026-10");
    expect(f.spend).toBe(0);
  });
});

describe("refresh idempotency", () => {
  it("repeating the same sync page leaves the same records", () => {
    const page = { added: [{ provider_transaction_id: "t1", amount: 5 }, { provider_transaction_id: "t2", amount: 7 }], modified: [{ provider_transaction_id: "t1", amount: 6 }], removed: ["t2"] };
    const a = applySyncPage(new Map(), page);
    const once = JSON.stringify([...a]);
    applySyncPage(a, page);
    expect(JSON.stringify([...a])).toBe(once);
    expect(a.size).toBe(2);
    expect(a.get("t1")!.amount).toBe(6);
    expect(a.get("t2")!.removed).toBe(true);
  });
});

describe("bank store account switch", () => {
  it("drops a late response from the previous account and clears at once", async () => {
    const store = createBankStore();
    let releaseA!: (v: unknown) => void;
    const slowA = () => new Promise((r) => { releaseA = r; });
    const pA = store.setUser("A", slowA);
    expect(store.get().status).toBe("loading");
    const pB = store.setUser("B", async () => ({ access: "denied" }));
    expect(store.get().userId).toBe("B");
    await pB;
    releaseA({ access: "owner", accounts: [acct("chk", "depository")], balances: [], transactions: [], connections: [] });
    await pA;
    expect(store.get().userId).toBe("B");
    expect(store.get().status).toBe("denied");
    expect(store.get().accounts).toHaveLength(0);
  });
  it("sign-out wipes bank data", async () => {
    const store = createBankStore();
    await store.setUser(FINANCE_OWNER_ID, async () => ({ access: "owner", accounts: [acct("chk", "depository")], balances: [], transactions: [], connections: [] }));
    expect(store.get().accounts).toHaveLength(1);
    await store.setUser(null, async () => ({}));
    expect(store.get().accounts).toHaveLength(0);
    expect(store.get().status).toBe("idle");
  });
});

describe("coverage and refresh safety", () => {
  it("flows are unavailable without a connection, before first sync, or when capped", () => {
    expect(flowCoverage([], false).complete).toBe(false);
    expect(flowCoverage([{ environment: "production", initial_sync_complete: false }], false).reason).toBe("initial_sync");
    expect(flowCoverage([{ environment: "production", initial_sync_complete: true }], true).reason).toBe("truncated");
    expect(flowCoverage([{ environment: "sandbox", initial_sync_complete: true }], false).complete).toBe(false);
    expect(flowCoverage([{ environment: "production", initial_sync_complete: true }], false).complete).toBe(true);
  });
  it("dedupes added+modified rows so one upsert never touches a row twice", () => {
    const rows = dedupeById([{ transaction_id: "a", v: 1 }, { transaction_id: "b", v: 1 }, { transaction_id: "a", v: 2 }]);
    expect(rows).toHaveLength(2);
    expect(rows.find((r) => r.transaction_id === "a")!.v).toBe(2);
  });
  it("matches a linked account to a snapshot only on a unique exact match", () => {
    const a = { ...acct("s1", "depository"), subtype: "checking", mask: "1234", institution_name: "Chime" };
    const b = { ...acct("s2", "depository"), subtype: "savings", mask: "9876", institution_name: "Chime" };
    expect(matchSnapshotAccount({ type: "depository", subtype: "checking", mask: "1234", institution_name: "Chime" }, [a, b])).toEqual({ kind: "match", id: "s1" });
    expect(matchSnapshotAccount({ type: "depository", subtype: "checking", mask: "1234", institution_name: "Other Bank" }, [a, b]).kind).toBe("ambiguous");
    expect(matchSnapshotAccount({ type: "depository", subtype: "checking", mask: null, institution_name: "Chime" }, [a, b]).kind).toBe("ambiguous");
    expect(matchSnapshotAccount({ type: "credit", subtype: "credit card", mask: "1111", institution_name: "Chime" }, [a, b]).kind).toBe("none");
    const twin = { ...a, id: "s3" };
    expect(matchSnapshotAccount({ type: "depository", subtype: "checking", mask: "1234", institution_name: "Chime" }, [a, twin]).kind).toBe("ambiguous");
  });
});
