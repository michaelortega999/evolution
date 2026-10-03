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
  institution_name?: string | null;
  link_status?: string; // active | superseded | needs_review
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
  category_detailed?: string | null;
  refund_of_transaction_id?: string | null;
  is_transfer: boolean;
  environment: string;
  removed_at: string | null;
}

const TRANSFER_CATS = new Set(["TRANSFER_IN", "TRANSFER_OUT", "LOAN_PAYMENTS", "CREDIT_CARD_PAYMENT"]);
const LIABILITY_TYPES = new Set(["credit", "loan"]);

export function isTransfer(t: Pick<BankTx, "is_transfer" | "category_primary">) {
  return t.is_transfer || (!!t.category_primary && TRANSFER_CATS.has(t.category_primary.toUpperCase()));
}

/** Accounts that count in totals: real (non-sandbox) and not superseded / awaiting duplicate review. */
export function countsInTotals(a: BankAccount) {
  return a.environment !== "sandbox" && (a.link_status ?? "active") === "active";
}

/** Latest retrieved snapshot per account (by created_at). Source freshness (as_of) is reported separately. */
export function latestBalances(snaps: BalanceSnapshot[]): Map<string, BalanceSnapshot> {
  const out = new Map<string, BalanceSnapshot>();
  for (const s of snaps) {
    const prev = out.get(s.account_id);
    if (!prev || s.created_at > prev.created_at) out.set(s.account_id, s);
  }
  return out;
}

export interface BalanceSummary {
  /** null = no known balances (unavailable, not zero) */
  assets: number | null;
  cash: number | null;
  knownLiabilities: number | null;
  accountsWithoutBalance: number;
  oldestAsOf: string | null;
  anyDateUnknown: boolean;
  allSnapshot: boolean;
  sandbox: boolean;
  needsReview: number;
  /** distinct retrieval times across counted accounts — >1 means some history exists */
  snapshotTimes: number;
}

/** Balances come ONLY from provider snapshots — transactions are never added on top. */
export function summarizeBalances(accounts: BankAccount[], snaps: BalanceSnapshot[]): BalanceSummary {
  const latest = latestBalances(snaps);
  let assets: number | null = null, cash: number | null = null, liab: number | null = null;
  let missing = 0, anyUnknown = false, oldest: string | null = null, allSnapshot = true, sandbox = false, review = 0;
  const counted = new Set<string>();
  for (const a of accounts) {
    if (a.environment === "sandbox") { sandbox = true; continue; }
    if (a.link_status === "needs_review") review++;
    if (!countsInTotals(a)) continue;
    counted.add(a.id);
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
  const times = new Set(snaps.filter((s) => counted.has(s.account_id)).map((s) => s.as_of ?? s.created_at));
  return { assets, cash, knownLiabilities: liab, accountsWithoutBalance: missing, oldestAsOf: anyUnknown ? null : oldest, anyDateUnknown: anyUnknown, allSnapshot, sandbox, needsReview: review, snapshotTimes: times.size };
}

export function isRefund(t: Pick<BankTx, "category_detailed" | "refund_of_transaction_id">) {
  return !!t.refund_of_transaction_id || /REFUND/i.test(t.category_detailed ?? "");
}

export interface FlowSummary {
  income: number;
  spend: number;
  refunds: number;
  /** inflows with no income/refund/transfer evidence — not counted as income or refund */
  unknownInflow: number;
  spendByCategory: Map<string, number>;
  counted: number;
}

/** Income/spend for YYYY-MM. Pending, transfers, removed, sandbox and excluded accounts are skipped.
 *  Only explicit refund evidence reduces spend; other inflows without INCOME category are unknown. */
export function summarizeFlows(txs: BankTx[], month: string, countedAccountIds?: Set<string>): FlowSummary {
  let income = 0, refunds = 0, unknown = 0, counted = 0;
  const byCat = new Map<string, number>();
  for (const t of txs) {
    if (t.removed_at || t.pending || t.environment === "sandbox" || isTransfer(t)) continue;
    if (countedAccountIds && !countedAccountIds.has(t.account_id)) continue;
    const d = t.posted_date ?? t.authorized_date;
    if (!d || d.slice(0, 7) !== month) continue;
    const amt = Number(t.amount);
    if (!Number.isFinite(amt) || amt === 0) continue;
    counted++;
    const cat = (t.category_primary ?? "OTHER").toUpperCase();
    if (amt > 0) { byCat.set(cat, (byCat.get(cat) ?? 0) + amt); continue; }
    if (cat === "INCOME") income += -amt;
    else if (isRefund(t)) { refunds += -amt; byCat.set(cat, (byCat.get(cat) ?? 0) + amt); }
    else unknown += -amt;
  }
  let spend = 0;
  for (const [k, v] of [...byCat]) { const n = Math.max(0, v); if (n === 0) byCat.delete(k); else byCat.set(k, n); spend += n; }
  return { income, spend, refunds, unknownInflow: unknown, spendByCategory: byCat, counted };
}

export interface Coverage { complete: boolean; reason: "ok" | "no_connection" | "initial_sync" | "truncated" }

/** Flows are reportable only with a linked connection that finished its first full sync and an uncapped row set. */
export function flowCoverage(connections: { initial_sync_complete?: boolean; environment: string }[], truncated: boolean): Coverage {
  const real = connections.filter((c) => c.environment !== "sandbox");
  if (!real.length) return { complete: false, reason: "no_connection" };
  if (real.some((c) => !c.initial_sync_complete)) return { complete: false, reason: "initial_sync" };
  if (truncated) return { complete: false, reason: "truncated" };
  return { complete: true, reason: "ok" };
}

/** Deduplicate added+modified provider rows by id (last write wins) so one upsert never touches a row twice. */
export function dedupeById<T extends { transaction_id: string }>(rows: T[]): T[] {
  const m = new Map<string, T>();
  for (const r of rows) m.set(r.transaction_id, r);
  return [...m.values()];
}

/** Match a newly linked account to an imported snapshot account. Unique match only; anything else needs owner review. */
export function matchSnapshotAccount(
  linked: { type: string; subtype: string | null; mask: string | null; institution_name: string | null },
  snapshotAccounts: BankAccount[],
): { kind: "match"; id: string } | { kind: "none" } | { kind: "ambiguous"; ids: string[] } {
  const norm = (s: string | null | undefined) => (s ?? "").trim().toLowerCase();
  const pool = snapshotAccounts.filter((a) => a.source === "snapshot" && (a.link_status ?? "active") === "active");
  const sameKind = pool.filter((a) => a.type === linked.type && norm(a.subtype) === norm(linked.subtype));
  if (!sameKind.length) return { kind: "none" };
  const exact = sameKind.filter((a) =>
    !!linked.mask && a.mask === linked.mask && !!linked.institution_name && norm(a.institution_name) === norm(linked.institution_name));
  if (exact.length === 1) return { kind: "match", id: exact[0].id };
  // Same type exists but evidence is missing or not unique → never conflate silently.
  return { kind: "ambiguous", ids: sameKind.map((a) => a.id) };
}

/** Idempotent application of a provider sync page to a keyed store (used by tests to model the server upsert). */
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

/** Cents-precise currency for account views. */
export function fmtCents(n: number | null | undefined) {
  if (n == null || !Number.isFinite(Number(n))) return "Unavailable";
  return Number(n).toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
