import { useEffect, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { bankStore, EMPTY_BANK } from "./finance-store";
import { getFinanceOverview } from "./finance.functions";

let wired = false;
export const loadOverview = () => getFinanceOverview();

/** Wire auth → bank store once per page. Bank data is cleared at once on sign-out or account switch. */
export function wireBankAuth() {
  if (wired || typeof window === "undefined") return;
  wired = true;
  let current: string | null | undefined;
  const apply = (uid: string | null) => {
    if (uid === current) return;
    current = uid;
    void bankStore.setUser(uid, loadOverview);
  };
  supabase.auth.getSession().then(({ data }) => apply(data.session?.user.id ?? null));
  supabase.auth.onAuthStateChange((_e, session) => apply(session?.user.id ?? null));
}

export function useBank() {
  useEffect(() => { wireBankAuth(); }, []);
  return useSyncExternalStore(bankStore.subscribe, bankStore.get, () => EMPTY_BANK);
}
