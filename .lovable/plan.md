## Time Factor for Daily Habits — connected to Focus

Add optional per-habit "time factor" (duration + module category), log time when habits are checked off, and surface aggregated time on the Focus page and Dashboard Focus card. Focus Mode pomodoro sessions feed the same aggregate.

### 1. Data model (`src/lib/evolution-data.ts`)

Extend the store:

- `EvoHabit`: add optional `timeFactor?: { minutes: number; module: ModuleKey }`
  where `ModuleKey = "wealth" | "nutrition" | "tasks" | "focus" | "fitness" | "investing" | "business" | "hobby"`.
- New collection `timeLogs: TimeLog[]` where
  `TimeLog = { id: string; date: string /* YYYY-MM-DD */; minutes: number; module: ModuleKey; habitId?: string; source: "habit" | "focus"; label: string; ts: number }`.
- Migration: leave existing habits intact; the seed function that produces `DEFAULT_HABITS` gets time factors for the four listed defaults (Trade Futures 30/investing, Build Evolution 90/business, Wealth Advancing Activity 20/wealth, Work Out 60/fitness); "Eat in a Deficit" stays untouched.
- Persist `timeLogs` in the same localStorage payload used today.
- Small helpers exported from the module: `addTimeLog`, `removeTimeLog`, `weekLogs(logs, weekStart)`, `groupByModule`, `groupByDay`, `groupByHabit`.

### 2. Add Habit form (`src/routes/notes.tsx`)

In the existing "Add Daily Habit" panel:

- New "Track Time" switch (shadcn `Switch`), off by default.
- When on, reveal two fields:
  - Minutes input (number, min 1).
  - Module selector (Select) with the 8 Evolution modules, each option showing its icon + accent color.
- On save, if the switch is on, attach `timeFactor` to the created habit; otherwise omit.
- Form layout stays inside the current 6-col grid, wrapping to a second row on mobile.

### 3. Habit rows

For each habit row in the tracker:

- If `habit.timeFactor` exists, render a small `Clock` icon (lucide) next to the name, tinted with the module's accent color and a tooltip like "25 min · Hobby".
- Checkbox onChange behavior:
  - If the habit has no time factor: toggle as today (unchanged).
  - If it has a time factor AND the user is checking it ON for today: open a confirmation dialog before flipping the checkbox.
  - Unchecking always just removes the day's log (and the auto-created time log for that day + habit) with no dialog.

### 4. Time confirmation dialog

New tiny component `HabitTimeConfirm` (shadcn `Dialog`) local to `notes.tsx`:

- Title: "Log [Habit Name]".
- Body: "Log [X] minutes for [Habit Name]?" with a number input pre-filled with the default minutes, allowing the user to override for that day ("I only practiced 15 min today").
- Buttons: Cancel (does nothing), Confirm.
- Confirm: check the habit for today AND push a `TimeLog { source: "habit" }` with the chosen minutes and the habit's module.

### 5. Focus page — "Time Invested This Week" (`src/routes/focus.tsx`)

New section rendered inside a `Panel`:

- Week window: Monday → Sunday, based on `new Date()` (respecting the currently selected month only for label display, but the week itself is always the current calendar week for accuracy of "this week").
- Content:
  - Weekly total: combined hours (H:MM) across all logs in the week.
  - Habit list: each tracked habit with total minutes/hours this week, module-tinted.
  - Category bar chart: horizontal bars per module using existing module accent colors from the sidebar (Wealth, Nutrition, Tasks, Focus, Fitness, Investing, Business, Hobby).
  - Daily breakdown: M T W T F S S mini bars sized by that day's total minutes.
- Data source: every `TimeLog` from the store, whether `source: "habit"` or `source: "focus"`.

### 6. Focus Mode → time logs

`src/lib/use-focus-timer.ts` (or wherever focus sessions complete):

- When a work session completes, push a `TimeLog { source: "focus", minutes: sessionMinutes, module, label }`.
- Add a simple "Focus tag" (module selector) on the Focus page near the timer so the user can attribute the session to a module before starting. Persist the last-chosen tag in localStorage. Default to "focus".

### 7. Dashboard Focus card (`src/components/evolution/ModuleCards.tsx` — Focus card block)

Add a mini breakdown at the bottom of the Focus card:

- Top 2–3 habits by total minutes this week with a small horizontal bar.
- Weekly total hours line ("12h 30m this week").
- Reads the same `timeLogs` from the store so it updates the moment a habit is checked off.

### Technical notes

- All new state persists via the existing `useEvolutionData` mutate flow — no new storage keys.
- Realtime updates come free from the existing subscribe-on-mutate hook (all readers already re-render on `data` changes).
- Only frontend changes. No backend, no schema, no new dependencies (shadcn `Switch`, `Dialog`, `Select` are already installed).
- Colors reuse the module accents already used in the sidebar and category chips so nothing new is introduced to the palette.
- Mobile: form fields stack; the Focus page section uses `grid-cols-1 md:grid-cols-2` for the chart + daily strip.
