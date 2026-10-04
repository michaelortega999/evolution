import { describe, it, expect, beforeAll } from "vitest";
let L: any;
// @ts-expect-error plain browser script without types
beforeAll(async () => { await import("../../public/evolution-mobile/inv-ledger.js"); L = (globalThis as any).EvoInvLedger; });
const row = (id: number, acct: number, pl: number | null) => ({ id, acct, pl, symbol: "X", type: "Buy", qty: 1, price: 0, date: "2026-10-04" });
const bals = (inv: any) => inv.accounts.map((a: any) => a.bal);
describe("phone manual investing ledger", () => {
  it("add +100 → 1100, edit to +40 → 1040, delete → 1000, repeated delete harmless", () => {
    let inv = L.addAccount({ accounts: [], trades: [] }, { name: "Main", tag: "MN", bal: 1000, chg: 0 });
    inv = L.addTrade(inv, row(1, 0, 100)); expect(bals(inv)).toEqual([1100]);
    inv = L.editTrade(inv, 1, { pl: 40 }); expect(bals(inv)).toEqual([1040]);
    inv = L.deleteTrade(inv, 1); expect(bals(inv)).toEqual([1000]);
    inv = L.deleteTrade(inv, 1); expect(bals(inv)).toEqual([1000]);
  });
  it("loss, zero balance and open trades", () => {
    let inv = L.addAccount({ accounts: [], trades: [] }, { name: "Z", bal: 0, chg: 0 });
    inv = L.addTrade(inv, row(1, 0, 50)); inv = L.addTrade(inv, row(2, 0, -20)); inv = L.addTrade(inv, row(3, 0, null));
    expect(bals(inv)).toEqual([30]);
    inv = L.deleteTrade(inv, 1); expect(bals(inv)).toEqual([-20]); // signed ledger value, never silently clamped
    inv = L.deleteTrade(inv, 2); expect(bals(inv)).toEqual([0]);
  });
  it("legacy store: visible balances unchanged, provenance + raw kept, deleting an old trade reverses it", () => {
    const legacy = { accounts: [{ name: "A", bal: 1100, chg: 0 }, { name: "B", bal: 500, chg: 0 }], trades: [row(1, 0, 100), row(2, 9, 7)], custom: 1 };
    let inv = L.migrate(legacy);
    expect(bals(inv)).toEqual([1100, 500]);
    expect(inv.accounts[0]).toMatchObject({ open: 1000, openSrc: "derived-v1", legacyBal: 1100 });
    expect(inv.trades.find((t: any) => t.id === 2).acctId).toBeNull(); // unlinkable, kept, moves nothing
    expect(inv.custom).toBe(1);
    expect(L.migrate(inv)).toEqual(inv); // idempotent (reload)
    expect(L.migrate(JSON.parse(JSON.stringify(legacy))).accounts.map((a: any) => a.id)).toEqual(inv.accounts.map((a: any) => a.id)); // deterministic ids
    inv = L.deleteTrade(inv, 1); expect(bals(inv)).toEqual([1000, 500]);
  });
  it("negative legacy balances and losses beyond opening survive reload without changing provenance", () => {
    const legacy = { accounts: [{ name: "Negative", bal: -25, extra: "keep" }], trades: [] };
    const migrated = L.migrate(legacy);
    expect(migrated.accounts[0]).toMatchObject({ bal: -25, open: -25, legacyBal: -25, openSrc: "derived-v1", extra: "keep" });
    expect(L.migrate(JSON.parse(JSON.stringify(migrated)))).toEqual(migrated);
    let inv = L.addAccount({ accounts: [], trades: [] }, { name: "Loss", bal: 1000 });
    inv = L.addTrade(inv, row(1, 0, -1500)); expect(bals(inv)).toEqual([-500]);
    inv = L.migrate(JSON.parse(JSON.stringify(inv))); expect(bals(inv)).toEqual([-500]);
    inv = L.deleteTrade(inv, 1); expect(bals(inv)).toEqual([1000]);
  });
  it("account delete never reassigns another account's trades", () => {
    let inv = { accounts: [], trades: [] } as any;
    inv = L.addAccount(inv, { name: "A", bal: 100 }); inv = L.addAccount(inv, { name: "B", bal: 200 }); inv = L.addAccount(inv, { name: "C", bal: 300 });
    inv = L.addTrade(inv, row(1, 0, 10)); inv = L.addTrade(inv, row(2, 1, 20)); inv = L.addTrade(inv, row(3, 2, 30));
    inv = L.deleteAccount(inv, 0);
    expect(bals(inv)).toEqual([220, 330]);
    expect(inv.trades.map((t: any) => [t.id, t.acct])).toEqual([[3, 1], [2, 0]]);
    inv = L.deleteTrade(inv, 2); expect(bals(inv)).toEqual([200, 330]);
  });
});
