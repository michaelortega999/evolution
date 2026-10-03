// Server-only bank helpers: Plaid HTTP calls + token encryption. Never import from client code.
import { FINANCE_OWNER_ID } from "./finance-core";

export type PlaidEnv = "sandbox" | "production";

export function plaidConfig(): { clientId: string; secret: string; env: PlaidEnv; key: string } | null {
  const clientId = process.env["PLAID_CLIENT_ID"];
  const secret = process.env["PLAID_SECRET"];
  const key = process.env["FINANCE_ENCRYPTION_KEY"];
  const rawEnv = (process.env["PLAID_ENV"] || "").toLowerCase();
  if (!clientId || !secret || !key || (rawEnv !== "sandbox" && rawEnv !== "production")) return null;
  return { clientId, secret, env: rawEnv, key };
}

async function plaid<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const cfg = plaidConfig();
  if (!cfg) throw new Error("not_configured");
  const res = await fetch(`https://${cfg.env}.plaid.com${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: cfg.clientId, secret: cfg.secret, ...body }),
  });
  const json = (await res.json().catch(() => ({}))) as T & { error_code?: string };
  if (!res.ok) {
    // Log only the provider's error code — never request bodies or tokens.
    console.error(`[bank] provider call ${path} failed: ${json.error_code ?? res.status}`);
    const err = new Error("provider_error") as Error & { code?: string };
    err.code = json.error_code;
    throw err;
  }
  return json;
}

// ---- AES-GCM token encryption (key = base64 of 32 random bytes) ----
const b64 = (u: Uint8Array) => btoa(String.fromCharCode(...u));
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
async function aesKey(raw: string) {
  const bytes = unb64(raw);
  if (bytes.length !== 32) throw new Error("bad_key");
  return crypto.subtle.importKey("raw", bytes, "AES-GCM", false, ["encrypt", "decrypt"]);
}
export async function encryptToken(token: string, rawKey: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await aesKey(rawKey), new TextEncoder().encode(token));
  return { ciphertext: b64(new Uint8Array(ct)), iv: b64(iv) };
}
export async function decryptToken(ciphertext: string, iv: string, rawKey: string) {
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(iv) }, await aesKey(rawKey), unb64(ciphertext));
  return new TextDecoder().decode(pt);
}

export async function createLinkToken() {
  const r = await plaid<{ link_token: string }>("/link/token/create", {
    user: { client_user_id: FINANCE_OWNER_ID },
    client_name: "Evolution OS",
    products: ["transactions"],
    country_codes: ["US"],
    language: "en",
  });
  return r.link_token;
}

export async function exchangePublicToken(publicToken: string) {
  return plaid<{ access_token: string; item_id: string }>("/item/public_token/exchange", { public_token: publicToken });
}

interface PlaidAccount {
  account_id: string; name: string; official_name: string | null; mask: string | null;
  type: string; subtype: string | null;
  balances: { current: number | null; available: number | null; limit: number | null; iso_currency_code: string | null; last_updated_datetime?: string | null };
}
interface PlaidTx {
  transaction_id: string; account_id: string; pending_transaction_id: string | null;
  date: string | null; authorized_date: string | null; name: string; merchant_name: string | null;
  amount: number; iso_currency_code: string | null; pending: boolean;
  personal_finance_category?: { primary?: string; detailed?: string } | null;
}

export async function getAccounts(accessToken: string) {
  return plaid<{ accounts: PlaidAccount[]; item: { institution_id?: string | null } }>("/accounts/get", { access_token: accessToken });
}

/** Full cursor pagination; restarts from the original cursor if the provider reports a mutation mid-pagination. */
export async function syncTransactions(accessToken: string, startCursor: string | null) {
  for (let attempt = 0; attempt < 3; attempt++) {
    let cursor = startCursor ?? undefined;
    const added: PlaidTx[] = [], modified: PlaidTx[] = [], removed: string[] = [];
    try {
      for (let page = 0; page < 50; page++) {
        const r = await plaid<{ added: PlaidTx[]; modified: PlaidTx[]; removed: { transaction_id: string }[]; next_cursor: string; has_more: boolean }>(
          "/transactions/sync", { access_token: accessToken, cursor, count: 500 },
        );
        added.push(...r.added); modified.push(...r.modified); removed.push(...r.removed.map((x) => x.transaction_id));
        cursor = r.next_cursor;
        if (!r.has_more) return { added, modified, removed, nextCursor: cursor ?? null };
      }
      throw new Error("too_many_pages");
    } catch (e) {
      if ((e as { code?: string }).code !== "TRANSACTIONS_SYNC_MUTATION_DURING_PAGINATION") throw e;
    }
  }
  throw new Error("sync_unstable");
}

export type { PlaidAccount, PlaidTx };
