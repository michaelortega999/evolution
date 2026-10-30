# Evo conversational input — inspection findings and safe plan

Baseline preserved: `6c25b1c` (AI Workflow + Settings preview). This plan changes no files until approved.

## Findings (read-only)

1. **No model backend is connected to Evo today.** `EvoAssistantPage` (`src/routes/__root.tsx`) answers with keyword/regex rules (`add task:`, `routine … on/off`, `goal`, `focus`, `plan`, `trade`). It makes no network or model call, and no AI SDK package is installed.
2. **Config variable names:** `LOVABLE_API_KEY` exists as a server secret (presence checked only, value not read). It is not used anywhere in app code. Other server variables are for the backend (`SUPABASE_*`) and banking (`PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ENV`, `PLAID_REDIRECT_URI`, `FINANCE_ENCRYPTION_KEY`). No `OPENAI_API_KEY`.
3. **What Evo can do now:** add a task, build an on/off routine schedule, and give canned guidance replies for goals, focus, plans and trades. Chat history is saved in `EvolutionData.assistantMessages` (`{id, role, text, createdAt}`).
4. **Saved data that belongs to the owner:** `EvolutionData` (tasks, notes/journal, `assets: {id,name,value,category,date?}`, `transactions: {id,date,description,amount,type,category}`) syncs per account through the cloud with record merges, compare-and-swap writes and owner archiving. Bank data stays separate in `bank_*` tables and is read-only. Evo must never write to it.
5. **Cost:** normal model calls would run through Lovable AI using the existing key. You don't need a new service or a new secret, but **each call uses workspace credits**. That is the cost being activated.

## Gaps for the Wealth-first goal

- Assets have only `value` and `date`, with no history of past values. Replacing a balance today overwrites it.
- No Undo for actions taken through Evo, and no "last updated" per card.
- The Home Wealth card and the Wealth page read the same `assets` and `transactions`, so a single write path updates both.

## Proposed implementation (after approval)

Phase A — deterministic, labeled honestly (no credits):
- Add optional `valueHistory: {value, at, source:"manual"|"evo", actionId}[]` and `updatedAt` to `Asset`. This adds fields only and never rewrites old records. The merge treats history as an append-only set keyed by id.
- Add an Evo action log `evoActions: {id, kind, before, after, at, undone?}` so Undo can reverse exactly one action: restore the previous value, or remove the appended expense by id.
- Balance update: replace `value` on the matched manual asset, append to its history, and leave other fields untouched. Expense: append one `Transaction` and never change any asset balance, so nothing is counted twice.
- Clarification: if the amount, the account or the expense-vs-balance choice is unclear, Evo asks instead of guessing. A confirm card appears before anything is saved.
- Show "Last updated" on the Home Wealth card and the Wealth rows. Add an Undo button in chat and a toast.
- Reply text says "Understood with built-in rules", not AI.

Phase B — real AI (requires approval below):
- A server function using `requireSupabaseAuth` calls Lovable AI (`openai/gpt-6-astra`, Responses API, streaming). It uses strict structured output that returns *proposed* actions only: `update_balance`, `add_expense`, `add_task`, `add_note`, `clarify`.
- The server never writes data. The browser checks the proposal and runs it through the same Phase A confirm, save and Undo path.
- Errors: 402/403/429 show the real message and are never retried immediately.
- Global chat stays in AI Workflow, with history kept in `assistantMessages`. Then extend to Tasks and Notes.

## Tests
- Balance replace keeps history and leaves untouched fields alone. Expense append does not change balances. Undo works for each kind. Two devices merging history keeps both entries. A missing account leads to clarify.

## Approvals needed before live AI
1. Spending workspace credits on Evo model calls, and whether to set a monthly cap.
2. Sending your typed messages, plus the names of your manual Wealth accounts, to the model. Bank balances and transactions would not be sent.
3. Model choice: the default `openai/gpt-6-astra`, or another.
4. Whether Phase A ships first, ahead of the AI.
