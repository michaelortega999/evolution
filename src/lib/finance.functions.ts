import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isFinanceOwner, FINANCE_OWNER_ID } from "./finance-core";

const GENERIC = "Bank data is unavailable right now.";

/** Read model for the owner. Non-owners get { access: "denied" } and no data. Reads go through RLS as the caller. */
export const getFinanceOverview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!isFinanceOwner(context.userId)) return { access: "denied" as const };
    const { plaidConfig } = await import("./finance.server");
    const cfg = plaidConfig();
    const sb = context.supabase;
    const [acc, bal, tx, con] = await Promise.all([
      sb.from("bank_accounts").select("id,name,mask,type,subtype,source,environment").order("name"),
      sb.from("bank_balance_snapshots").select("account_id,current_balance,available_balance,as_of,source,created_at").order("created_at", { ascending: false }).limit(1000),
      sb.from("bank_transactions").select("id,account_id,provider_transaction_id,posted_date,authorized_date,name,merchant_name,amount,pending,category_primary,is_transfer,environment,removed_at").is("removed_at", null).order("posted_date", { ascending: false }).limit(1000),
      sb.from("bank_connections").select("id,institution_name,environment,status,last_synced_at"),
    ]);
    if (acc.error || bal.error || tx.error || con.error) {
      console.error("[bank] overview read failed");
      return { access: "owner" as const, error: GENERIC, configured: !!cfg, env: cfg?.env ?? null, accounts: [], balances: [], transactions: [], connections: [] };
    }
    return {
      access: "owner" as const,
      error: null,
      configured: !!cfg,
      env: cfg?.env ?? null,
      accounts: acc.data,
      balances: bal.data.map((b) => ({ ...b, current_balance: b.current_balance == null ? null : Number(b.current_balance), available_balance: b.available_balance == null ? null : Number(b.available_balance) })),
      transactions: tx.data.map((t) => ({ ...t, amount: Number(t.amount) })),
      connections: con.data,
    };
  });

function denyUnlessOwner(userId: string) {
  if (!isFinanceOwner(userId)) throw new Error("Not available.");
}

export const createBankLinkToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    denyUnlessOwner(context.userId);
    const s = await import("./finance.server");
    if (!s.plaidConfig()) return { ok: false as const, error: "Bank connection setup required." };
    try { return { ok: true as const, linkToken: await s.createLinkToken() }; }
    catch { return { ok: false as const, error: GENERIC }; }
  });

export const exchangeBankPublicToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ publicToken: z.string().min(10).max(500), institutionName: z.string().max(120).optional() }).parse(d))
  .handler(async ({ data, context }) => {
    denyUnlessOwner(context.userId);
    const s = await import("./finance.server");
    const cfg = s.plaidConfig();
    if (!cfg) return { ok: false as const, error: "Bank connection setup required." };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    try {
      const ex = await s.exchangePublicToken(data.publicToken);
      const enc = await s.encryptToken(ex.access_token, cfg.key);
      const { data: conn, error } = await supabaseAdmin.from("bank_connections")
        .upsert({ owner_id: FINANCE_OWNER_ID, provider: "plaid", provider_item_id: ex.item_id, institution_name: data.institutionName ?? null, environment: cfg.env, status: "active" }, { onConflict: "provider_item_id" })
        .select("id").single();
      if (error || !conn) throw new Error("db");
      const { error: e2 } = await supabaseAdmin.from("bank_connection_secrets")
        .upsert({ connection_id: conn.id, access_token_ciphertext: enc.ciphertext, access_token_iv: enc.iv, transactions_cursor: null });
      if (e2) throw new Error("db");
      return { ok: true as const };
    } catch {
      console.error("[bank] exchange failed");
      return { ok: false as const, error: GENERIC };
    }
  });

export const refreshBankData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    denyUnlessOwner(context.userId);
    const s = await import("./finance.server");
    const cfg = s.plaidConfig();
    if (!cfg) return { ok: false as const, error: "Bank connection setup required." };
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const { data: conns, error } = await db.from("bank_connections")
      .select("id,environment,bank_connection_secrets(access_token_ciphertext,access_token_iv,transactions_cursor)")
      .eq("owner_id", FINANCE_OWNER_ID).eq("provider", "plaid").eq("status", "active");
    if (error) return { ok: false as const, error: GENERIC };
    let failures = 0;
    for (const c of conns ?? []) {
      const sec = Array.isArray(c.bank_connection_secrets) ? c.bank_connection_secrets[0] : c.bank_connection_secrets;
      if (!sec) continue;
      try {
        const token = await s.decryptToken(sec.access_token_ciphertext, sec.access_token_iv, cfg.key);
        const { accounts } = await s.getAccounts(token);
        const rows = accounts.map((a) => ({
          owner_id: FINANCE_OWNER_ID, connection_id: c.id, provider_account_id: a.account_id, name: a.name,
          official_name: a.official_name, mask: a.mask, type: a.type, subtype: a.subtype,
          iso_currency_code: a.balances.iso_currency_code, source: "plaid", environment: c.environment,
        }));
        const { data: saved, error: ae } = await db.from("bank_accounts").upsert(rows, { onConflict: "provider_account_id" }).select("id,provider_account_id");
        if (ae || !saved) throw new Error("db");
        const idOf = new Map(saved.map((r) => [r.provider_account_id!, r.id]));
        const snaps = accounts.filter((a) => idOf.has(a.account_id)).map((a) => ({
          owner_id: FINANCE_OWNER_ID, account_id: idOf.get(a.account_id)!, current_balance: a.balances.current,
          available_balance: a.balances.available, credit_limit: a.balances.limit,
          as_of: a.balances.last_updated_datetime ?? null, source: "plaid",
        }));
        if (snaps.length) { const { error: se } = await db.from("bank_balance_snapshots").insert(snaps); if (se) throw new Error("db"); }

        const page = await s.syncTransactions(token, sec.transactions_cursor ?? null);
        const txRows = [...page.added, ...page.modified].filter((t) => idOf.has(t.account_id)).map((t) => ({
          owner_id: FINANCE_OWNER_ID, account_id: idOf.get(t.account_id)!, provider_transaction_id: t.transaction_id,
          pending_transaction_id: t.pending_transaction_id, posted_date: t.date, authorized_date: t.authorized_date,
          name: t.name, merchant_name: t.merchant_name, amount: t.amount, iso_currency_code: t.iso_currency_code,
          pending: t.pending, category_primary: t.personal_finance_category?.primary ?? null,
          category_detailed: t.personal_finance_category?.detailed ?? null,
          is_transfer: /^TRANSFER_/.test(t.personal_finance_category?.primary ?? ""),
          source: "plaid", environment: c.environment, removed_at: null,
        }));
        for (let i = 0; i < txRows.length; i += 500) {
          const { error: te } = await db.from("bank_transactions").upsert(txRows.slice(i, i + 500), { onConflict: "provider_transaction_id" });
          if (te) throw new Error("db");
        }
        if (page.removed.length) {
          const { error: re } = await db.from("bank_transactions").update({ removed_at: new Date().toISOString() }).in("provider_transaction_id", page.removed);
          if (re) throw new Error("db");
        }
        // Cursor advances only after every write succeeded, so a failed refresh is safely repeatable.
        await db.from("bank_connection_secrets").update({ transactions_cursor: page.nextCursor, updated_at: new Date().toISOString() }).eq("connection_id", c.id);
        await db.from("bank_connections").update({ last_synced_at: new Date().toISOString() }).eq("id", c.id);
      } catch {
        failures++;
        console.error("[bank] refresh failed for a connection");
      }
    }
    return failures ? { ok: false as const, error: GENERIC } : { ok: true as const };
  });
