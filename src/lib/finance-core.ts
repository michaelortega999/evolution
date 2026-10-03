// Pure, client-safe finance math for imported bank data. No I/O.
// Provider sign convention: amount > 0 = money out, amount < 0 = money in.

export const FINANCE_OWNER_ID = "648da54b-e8ad-47a0-a6b3-fa0b20e7119a";

export function isFinanceOwner(userId: string | null | undefined): boolean {
  return typeof userId === "string" && userId === FINANCE_OWNER_ID;
}

export interface BankAccount {
  id: string;
  name: string;
  mask: string | null;
  type: string; // depository | credit | loan | investment | other
  subtype: string | null;
  source: string;
  environment: string;
}
export interface BalanceSnapshot {
  account_id: string;
  current_balance: number | null;
  available_balance: number | null;
  as_of: string | null;
  source: string;
  created_at: string;
}
export interface BankTx {
  id: string;
  account_id: string;
  provider_transaction_id: string | null;
  posted_date: string | null;
  authorized_date: string | null;
  name: string;
  merchant_name: string | null;
  amount: number;
  pending: boolean;
  category_primary: string | null;
  is_transfer: boolean;
  environment: string;
  removed_at: string | null;
}

const TRANSFER_CATS = new Set(["TRANSFER_IN", "TRANSFER_OUT", "LOAN_PAYMENTS", "CREDIT_CARD_PAYMENT"]);
const INCOME_CATS = new Set(["INCOME"]);
const LIABILITY_TYPES = new Set(["credit", "loan"]);

export function isTransfer(t: Pick<BankTx, "is_transfer" | "category_primary">) {
  return t.is_transfer || (!!t.category_primary && TRANSFER_CATS.has(t.category_primary.toUpperCase()));
}

/** Latest balance snapshot per account (by as_of, then created_at). Missing = no entry. */
export function latestBalances(snaps: BalanceSnapshot[]): Map<string, BalanceSnapshot> {
  const out = new Map<string, BalanceSnapshot>();
  const key = (s: BalanceSnapshot) => `${s.as_of ?? ""}|${s.created_at}`;
  for (const s of snaps) {
    const prev = out.get(s.account_id);
    if (!prev || key(s) > key(prev)) out.set(s.account_id, s);
  }
  return out;
}

export interface BalanceSummary {
  /** null = no known balances at all (unavailable, not zero) */
  assets: number | null;
  cash: number | null;
  knownLiabilities: number | null;
  accountsWithoutBalance: number;
  /** earliest as_of among used balances; null when any balance date is unknown */
  oldestAsOf: string | null;
  anyDateUnknown: boolean;
  allSnapshot: boolean;
  sandbox: boolean;
}

/** Balances come ONLY from provider snapshots — transactions are never added on top. */
export function summarizeBalances(accounts: BankAccount[], snaps: BalanceSnapshot[]): BalanceSummary {
  const latest = latestBalances(snaps);
  let assets: number | null = null, cash: number | null = null, liab: number | null = null;
  let missing = 0, anyUnknown = false, oldest: string | null = null, allSnapshot = true, sandbox = false;
  for (const a of accounts) {
    if (a.environment === "sandbox") { sandbox = true; continue; } // never count test data
    const s = latest.get(a.id);
    const bal = s?.current_balance;
    if (s == null || bal == null || !Number.isFinite(Number(bal))) { missing++; continue; }
    const v = Number(bal);
    if (s.source !== "snapshot") allSnapshot = false;
    if (!s.as_of) anyUnknown = true; else if (!oldest || s.as_of < oldest) oldest = s.as_of;
    if (LIABILITY_TYPES.has(a.type)) liab = (liab ?? 0) + Math.abs(v);
    else {
      assets = (assets ?? 0) + v;
      if (a.type === "depository") cash = (cash ?? 0) + v;
    }
  }
  return { assets, cash, knownLiabilities: liab, accountsWithoutBalance: missing, oldestAsOf: anyUnknown ? null : oldest, anyDateUnknown: anyUnknown, allSnapshot, sandbox };
}

export interface FlowSummary { income: number; spend: number; spendByCategory: Map<string, number>; counted: number }

/** Income/spend flows for a YYYY-MM month. Pending, transfers, removed and sandbox rows are excluded; refunds reduce spend. */
export function summarizeFlows(txs: BankTx[], month: string): FlowSummary {
  let income = 0, counted = 0;
  const byCat = new Map<string, number>();
  for (const t of txs) {
    if (t.removed_at || t.pending || t.environment === "sandbox" || isTransfer(t)) continue;
    const d = t.posted_date ?? t.authorized_date;
    if (!d || d.slice(0, 7) !== month) continue;
    const amt = Number(t.amount);
    if (!Number.isFinite(amt) || amt === 0) continue;
    counted++;
    const cat = (t.category_primary ?? "OTHER").toUpperCase();
    if (amt < 0 && INCOME_CATS.has(cat)) { income += -amt; continue; }
    // outflow adds to spend; non-income inflow (refund) reconciles spend in its category
    byCat.set(cat, (byCat.get(cat) ?? 0) + amt);
  }
  let spend = 0;
  for (const [k, v] of byCat) { const n = Math.max(0, v); byCat.set(k, n); spend += n; }
  for (const [k, v] of byCat) if (v === 0) byCat.delete(k);
  return { income, spend, spendByCategory: byCat, counted };
}

/** Idempotent application of a provider sync page to a keyed store (used by the server + tests). */
export function applySyncPage<T extends { provider_transaction_id: string }>(
  store: Map<string, T & { removed: boolean }>,
  page: { added: T[]; modified: T[]; removed: string[] },
) {
  for (const t of [...page.added, ...page.modified]) store.set(t.provider_transaction_id, { ...t, removed: false });
  for (const id of page.removed) {
    const prev = store.get(id);
    if (prev) store.set(id, { ...prev, removed: true });
  }
  return store;
}
