CREATE OR REPLACE FUNCTION public.is_finance_owner()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT auth.uid() IS NOT NULL AND auth.uid() = '648da54b-e8ad-47a0-a6b3-fa0b20e7119a'::uuid
$$;
REVOKE ALL ON FUNCTION public.is_finance_owner() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.is_finance_owner() TO authenticated, service_role;

CREATE TABLE public.bank_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  provider text NOT NULL DEFAULT 'plaid',
  provider_item_id text UNIQUE,
  institution_name text,
  environment text NOT NULL DEFAULT 'production',
  status text NOT NULL DEFAULT 'active',
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.bank_connections TO authenticated;
GRANT ALL ON public.bank_connections TO service_role;
ALTER TABLE public.bank_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Finance owner reads own connections" ON public.bank_connections
  FOR SELECT TO authenticated USING (public.is_finance_owner() AND owner_id = auth.uid());

CREATE TABLE public.bank_connection_secrets (
  connection_id uuid PRIMARY KEY REFERENCES public.bank_connections(id) ON DELETE CASCADE,
  access_token_ciphertext text NOT NULL,
  access_token_iv text NOT NULL,
  transactions_cursor text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.bank_connection_secrets FROM anon, authenticated;
GRANT ALL ON public.bank_connection_secrets TO service_role;
ALTER TABLE public.bank_connection_secrets ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  connection_id uuid REFERENCES public.bank_connections(id) ON DELETE SET NULL,
  provider_account_id text UNIQUE,
  name text NOT NULL,
  official_name text,
  mask text,
  type text NOT NULL,
  subtype text,
  iso_currency_code text DEFAULT 'USD',
  source text NOT NULL DEFAULT 'snapshot',
  environment text NOT NULL DEFAULT 'production',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.bank_accounts TO authenticated;
GRANT ALL ON public.bank_accounts TO service_role;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Finance owner reads own accounts" ON public.bank_accounts
  FOR SELECT TO authenticated USING (public.is_finance_owner() AND owner_id = auth.uid());

CREATE TABLE public.bank_balance_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  account_id uuid NOT NULL REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
  current_balance numeric,
  available_balance numeric,
  credit_limit numeric,
  as_of timestamptz,
  source text NOT NULL DEFAULT 'snapshot',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX bank_balance_snapshots_account_idx ON public.bank_balance_snapshots(account_id, created_at DESC);
GRANT SELECT ON public.bank_balance_snapshots TO authenticated;
GRANT ALL ON public.bank_balance_snapshots TO service_role;
ALTER TABLE public.bank_balance_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Finance owner reads own balances" ON public.bank_balance_snapshots
  FOR SELECT TO authenticated USING (public.is_finance_owner() AND owner_id = auth.uid());

CREATE TABLE public.bank_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  account_id uuid NOT NULL REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
  provider_transaction_id text UNIQUE,
  pending_transaction_id text,
  posted_date date,
  authorized_date date,
  name text NOT NULL,
  merchant_name text,
  amount numeric NOT NULL,
  iso_currency_code text DEFAULT 'USD',
  pending boolean NOT NULL DEFAULT false,
  category_primary text,
  category_detailed text,
  is_transfer boolean NOT NULL DEFAULT false,
  source text NOT NULL DEFAULT 'snapshot',
  environment text NOT NULL DEFAULT 'production',
  removed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON COLUMN public.bank_transactions.amount IS 'Provider sign convention: positive = money out of the account, negative = money in';
CREATE INDEX bank_transactions_account_date_idx ON public.bank_transactions(account_id, posted_date DESC);
GRANT SELECT ON public.bank_transactions TO authenticated;
GRANT ALL ON public.bank_transactions TO service_role;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Finance owner reads own transactions" ON public.bank_transactions
  FOR SELECT TO authenticated USING (public.is_finance_owner() AND owner_id = auth.uid());

CREATE TRIGGER update_bank_connections_updated_at BEFORE UPDATE ON public.bank_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON public.bank_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bank_transactions_updated_at BEFORE UPDATE ON public.bank_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();