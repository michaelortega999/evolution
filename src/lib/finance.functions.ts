import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isFinanceOwner, FINANCE_OWNER_ID, dedupeById, matchSnapshotAccount, flowCoverage, type BankAccount } from "./finance-core";

const GENERIC = "Bank data is unavailable right now.";
const TX_LIMIT = 1000;

/** Read model for the owner. Non-owners get { access: "denied" } and no data. Reads go through RLS as the caller. */
export const getFinanceOverview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!isFinanceOwner(context.userId)) return { access: "denied" as const };
    const { plaidConfig } = await import("./finance.server");
    const cfg = plaidConfig();
    const sb = context.supabase;
    const [acc, bal, tx, con] = await Promise.all([
      sb.from("bank_accounts").select("id,name,mask,type,subtype,source,environment,institution_name,link_status,review_note").order("name"),
      sb.from("bank_balance_snapshots").select("account_id,current_balance,available_balance,as_of,source,created_at").order("created_at", { ascending: false }).limit(2000),
      sb.from("bank_transactions").select("id,account_id,provider_transaction_id,posted_date,authorized_date,name,merchant_name,amount,pending,category_primary,category_detailed,refund_of_transaction_id,is_transfer,environment,removed_at").is("removed_at", null).order("posted_date", { ascending: false }).limit(TX_LIMIT + 1),
      sb.from("bank_connections").select("id,institution_name,environment,status,last_synced_at,initial_sync_complete"),
    ]);
    const base = { access: "owner" as const, configured: !!cfg, env: cfg?.env ?? null, oauthRedirect: !!cfg?.redirectUri };
    if (acc.error || bal.error || tx.error || con.error) {
      console.error("[bank] overview read failed");
      return { ...base, error: GENERIC, accounts: [], balances: [], transactions: [], connections: [], coverage: { complete: false, reason: "no_connection" as const } };
    }
    const truncated = tx.data.length > TX_LIMIT;
    const rows = tx.data.slice(0, TX_LIMIT);
    return {
      ...base,
      error: null,
      accounts: acc.data,
      balances: bal.data.map((b) => ({ ...b, current_balance: b.current_balance == null ? null : Number(b.current_balance), available_balance: b.available_balance == null ? null : Number(b.available_balance) })),
      transactions: rows.map((t) => ({ ...t, amount: Number(t.amount) })),
      connections: con.data,
      coverage: flowCoverage(con.data, truncated),
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

/** Owner confirms whether a flagged linked account is the same as an imported snapshot account. */
export const resolveBankDuplicate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ linkedId: z.string().uuid(), snapshotId: z.string().uuid().nullable(), same: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    denyUnlessOwner(context.userId);
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const { data: linked } = await db.from("bank_accounts").select("id,source,link_status").eq("id", data.linkedId).eq("owner_id", FINANCE_OWNER_ID).maybeSingle();
    if (!linked || linked.link_status !== "needs_review") return { ok: false as const, error: "Nothing to confirm." };
    if (data.same) {
      if (!data.snapshotId) return { ok: false as const, error: "Pick the matching account." };
      const { error } = await db.from("bank_accounts").update({ link_status: "superseded", superseded_by: data.linkedId })
        .eq("id", data.snapshotId).eq("owner_id", FINANCE_OWNER_ID).eq("source", "snapshot");
      if (error) return { ok: false as const, error: GENERIC };
    }
    const { error } = await db.from("bank_accounts").update({ link_status: "active", review_note: null }).eq("id", data.linkedId).eq("owner_id", FINANCE_OWNER_ID);
    return error ? { ok: false as const, error: GENERIC } : { ok: true as const };
  });

export const refreshBankData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    denyUnlessOwner(context.userId);
    const s = await import("./finance.server");
    const cfg = s.plaidConfig();
    if (!cfg) return { ok: false as const, error: "Bank connection setup required." };
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    // Only connections created in the currently configured environment: never send a sandbox token to production or vice versa.
    const { data: conns, error } = await db.from("bank_connections")
      .select("id,environment,institution_name,bank_connection_secrets(access_token_ciphertext,access_token_iv,transactions_cursor)")
      .eq("owner_id", FINANCE_OWNER_ID).eq("provider", "plaid").eq("status", "active").eq("environment", cfg.env);
    if (error) return { ok: false as const, error: GENERIC };
    let failures = 0, flagged = 0;
    const must = (e: unknown) => { if (e) throw new Error("db"); };
    for (const c of conns ?? []) {
      const sec = Array.isArray(c.bank_connection_secrets) ? c.bank_connection_secrets[0] : c.bank_connection_secrets;
      if (!sec) continue;
      try {
        const token = await s.decryptToken(sec.access_token_ciphertext, sec.access_token_iv, cfg.key);
        const { accounts } = await s.getAccounts(token);

        // Existing rows: keep their link_status; decide matching only for accounts seen the first time.
        const { data: existing, error: ee } = await db.from("bank_accounts").select("id,provider_account_id,link_status").eq("owner_id", FINANCE_OWNER_ID).in("provider_account_id", accounts.map((a) => a.account_id));
        must(ee);
        const known = new Map((existing ?? []).map((r) => [r.provider_account_id!, r]));
        const { data: snapAccts, error: se0 } = await db.from("bank_accounts").select("id,name,mask,type,subtype,source,environment,institution_name,link_status").eq("owner_id", FINANCE_OWNER_ID).eq("source", "snapshot");
        must(se0);

        const pending: { linkedPid: string; snapshotId: string }[] = [];
        const rows = accounts.map((a) => {
          const isNew = !known.has(a.account_id);
          let link_status = known.get(a.account_id)?.link_status ?? "active";
          let review_note: string | null = null;
          if (isNew && c.environment === "production") {
            const m = matchSnapshotAccount({ type: a.type, subtype: a.subtype, mask: a.mask, institution_name: c.institution_name }, (snapAccts ?? []) as BankAccount[]);
            if (m.kind === "match") pending.push({ linkedPid: a.account_id, snapshotId: m.id });
            else if (m.kind === "ambiguous") { link_status = "needs_review"; review_note = "May duplicate an imported snapshot account. Confirm before it counts."; flagged++; }
          }
          return {
            owner_id: FINANCE_OWNER_ID, connection_id: c.id, provider_account_id: a.account_id, name: a.name,
            official_name: a.official_name, mask: a.mask, type: a.type, subtype: a.subtype, institution_name: c.institution_name,
            iso_currency_code: a.balances.iso_currency_code, source: "plaid", environment: c.environment,
            ...(isNew ? { link_status, review_note } : {}),
          };
        });
        const { data: saved, error: ae } = await db.from("bank_accounts").upsert(rows, { onConflict: "provider_account_id" }).select("id,provider_account_id");
        if (ae || !saved) throw new Error("db");
        const idOf = new Map(saved.map((r) => [r.provider_account_id!, r.id]));
        // Unique exact match: the imported snapshot is superseded so the same account is never counted twice.
        for (const p of pending) {
          const { error: pe } = await db.from("bank_accounts").update({ link_status: "superseded", superseded_by: idOf.get(p.linkedPid)! })
            .eq("id", p.snapshotId).eq("owner_id", FINANCE_OWNER_ID).eq("source", "snapshot").eq("link_status", "active");
          must(pe);
        }
        // One new snapshot per refresh; totals only use the latest retrieved snapshot per account.
        const snaps = accounts.filter((a) => idOf.has(a.account_id)).map((a) => ({
          owner_id: FINANCE_OWNER_ID, account_id: idOf.get(a.account_id)!, current_balance: a.balances.current,
          available_balance: a.balances.available, credit_limit: a.balances.limit,
          as_of: a.balances.last_updated_datetime ?? null, source: "plaid",
        }));
        if (snaps.length) { const { error: se } = await db.from("bank_balance_snapshots").insert(snaps); must(se); }

        const page = await s.syncTransactions(token, sec.transactions_cursor ?? null);
        const txRows = dedupeById([...page.added, ...page.modified]).filter((t) => idOf.has(t.account_id)).map((t) => ({
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
          must(te);
        }
        if (page.removed.length) {
          const { error: re } = await db.from("bank_transactions").update({ removed_at: new Date().toISOString() })
            .eq("owner_id", FINANCE_OWNER_ID).in("account_id", [...idOf.values()]).in("provider_transaction_id", page.removed);
          must(re);
        }
        // Cursor advances only after every write succeeded, so a failed refresh is safely repeatable.
        const { error: ce } = await db.from("bank_connection_secrets").update({ transactions_cursor: page.nextCursor, updated_at: new Date().toISOString() }).eq("connection_id", c.id);
        must(ce);
        const { error: ue } = await db.from("bank_connections").update({ last_synced_at: new Date().toISOString(), initial_sync_complete: true }).eq("id", c.id).eq("owner_id", FINANCE_OWNER_ID);
        must(ue);
      } catch {
        failures++;
        console.error("[bank] refresh failed for a connection");
      }
    }
    if (failures) return { ok: false as const, error: GENERIC };
    return { ok: true as const, flagged };
  });
