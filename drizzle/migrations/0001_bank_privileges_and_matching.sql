REVOKE ALL PRIVILEGES ON public.bank_connections, public.bank_connection_secrets, public.bank_accounts, public.bank_balance_snapshots, public.bank_transactions FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.bank_connections, public.bank_accounts, public.bank_balance_snapshots, public.bank_transactions TO authenticated;
GRANT ALL ON public.bank_connections, public.bank_connection_secrets, public.bank_accounts, public.bank_balance_snapshots, public.bank_transactions TO service_role;

ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS institution_name text;
ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS link_status text NOT NULL DEFAULT 'active';
ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS superseded_by uuid REFERENCES public.bank_accounts(id) ON DELETE SET NULL;
ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS review_note text;
COMMENT ON COLUMN public.bank_accounts.link_status IS 'active | superseded (replaced by a linked account, excluded from totals) | needs_review (possible duplicate, excluded until owner confirms)';

ALTER TABLE public.bank_transactions ADD COLUMN IF NOT EXISTS refund_of_transaction_id text;

ALTER TABLE public.bank_connections ADD COLUMN IF NOT EXISTS initial_sync_complete boolean NOT NULL DEFAULT false;