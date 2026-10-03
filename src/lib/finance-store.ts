// In-memory only bank state (never localStorage, never the mobile bridge or cloud payload).
// A generation counter bumps on every sign-in/out/account switch; responses from older generations are dropped.
import type { BankAccount, BalanceSnapshot, BankTx } from "./finance-core";

export interface BankState {
  status: "idle" | "loading" | "ready" | "denied" | "error";
  userId: string | null;
  configured: boolean;
  env: string | null;
  accounts: BankAccount[];
  balances: BalanceSnapshot[];
  transactions: BankTx[];
  connections: { id: string; institution_name: string | null; environment: string; status: string; last_synced_at: string | null }[];
  error: string | null;
}

export const EMPTY_BANK: BankState = { status: "idle", userId: null, configured: false, env: null, accounts: [], balances: [], transactions: [], connections: [], error: null };

export type Loader = () => Promise<unknown>;

export function createBankStore() {
  let state: BankState = EMPTY_BANK;
  let gen = 0;
  const subs = new Set<(s: BankState) => void>();
  const set = (s: BankState) => { state = s; subs.forEach((f) => f(s)); };
  return {
    get: () => state,
    generation: () => gen,
    subscribe(f: (s: BankState) => void) { subs.add(f); return () => { subs.delete(f); }; },
    /** Call on every auth change. Clears immediately; loads only for a signed-in user. */
    async setUser(userId: string | null, load: Loader) {
      const my = ++gen;
      set({ ...EMPTY_BANK, userId, status: userId ? "loading" : "idle" });
      if (!userId) return;
      await this.reload(load, my);
    },
    async reload(load: Loader, expectGen = gen) {
      const uid = state.userId;
      if (!uid) return;
      try {
        const r = (await load()) as Partial<BankState> & { access?: string; error?: string | null };
        if (expectGen !== gen || state.userId !== uid) return; // late response for a previous account
        if (r.access !== "owner") { set({ ...EMPTY_BANK, userId: uid, status: "denied" }); return; }
        set({ ...EMPTY_BANK, ...r, userId: uid, status: r.error ? "error" : "ready", error: r.error ?? null } as BankState);
      } catch {
        if (expectGen !== gen || state.userId !== uid) return;
        set({ ...EMPTY_BANK, userId: uid, status: "denied" });
      }
    },
  };
}

export const bankStore = createBankStore();
