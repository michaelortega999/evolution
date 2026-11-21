import { useState, type ReactNode } from "react";

type Cat = {
  id: string;
  name: string;
  angle: number;
  title: string;
  flow: string[];
  body: () => ReactNode;
};

const Bars = ({ rows }: { rows: [string, number, string?][] }) => (
  <ul className="af-bars">
    {rows.map(([l, v, t]) => (
      <li key={l}>
        <span>{l}</span>
        <i style={{ width: `${v}%` }} />
        <b>{t ?? `${v}%`}</b>
      </li>
    ))}
  </ul>
);
const Timeline = ({ items }: { items: [string, string][] }) => (
  <ol className="af-timeline">
    {items.map(([a, b]) => (
      <li key={a}>
        <b>{a}</b>
        <span>{b}</span>
      </li>
    ))}
  </ol>
);

const cats: Cat[] = [
  {
    id: "business", name: "Business", angle: 0, title: "Projects board",
    flow: ["Idea", "Plan", "Build", "Ship"],
    body: () => (
      <div className="af-kanban">
        {[["To do", ["Landing copy", "Pricing research"]], ["Doing", ["Client brief"]], ["Done", ["Logo v2", "Invoice #014"]]].map(([c, items]) => (
          <div key={c as string}><h5>{c as string}</h5>{(items as string[]).map((i) => <p key={i}>{i}</p>)}</div>
        ))}
      </div>
    ),
  },
  {
    id: "fitness", name: "Fitness", angle: 30, title: "Workout session",
    flow: ["Pick split", "Log sets", "Recover"],
    body: () => (
      <table className="af-table">
        <thead><tr><th>Exercise</th><th>Sets</th><th>Reps</th></tr></thead>
        <tbody>
          {[["Bench press", 4, "8"], ["Pull-ups", 3, "10"], ["Overhead press", 3, "8"]].map(([e, s, r]) => (
            <tr key={e as string}><td>{e}</td><td>{s}</td><td>{r}</td></tr>
          ))}
        </tbody>
      </table>
    ),
  },
  {
    id: "wealth", name: "Wealth", angle: 330, title: "Finances snapshot",
    flow: ["Record", "Allocate", "Review"],
    body: () => <Bars rows={[["Cash", 30], ["Index funds", 45], ["Property", 15], ["Other", 10]]} />,
  },
  {
    id: "investing", name: "Investing", angle: 60, title: "Trade review",
    flow: ["Plan", "Execute", "Journal", "Review"],
    body: () => (
      <div className="af-split">
        <div className="af-candles" aria-hidden="true">
          {[40, 62, 35, 70, 55, 80, 48].map((h, i) => <i key={i} style={{ height: `${h}%` }} data-up={i % 2 === 0 || undefined} />)}
        </div>
        <ul className="af-checks"><li>Followed plan</li><li>Risk within rule</li><li>Note the lesson</li></ul>
      </div>
    ),
  },
  {
    id: "calendar", name: "Calendar", angle: 300, title: "Week plan",
    flow: ["Block", "Schedule", "Adjust"],
    body: () => (
      <div className="af-week">
        {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d, i) => (
          <div key={d}><h5>{d}</h5><p data-k={i % 3}>{["Deep work", "Training", "Review"][i % 3]}</p>{i % 2 === 0 && <p data-k="2">Call</p>}</div>
        ))}
      </div>
    ),
  },
  {
    id: "goals", name: "Goals", angle: 90, title: "Milestones",
    flow: ["Define", "Break down", "Track"],
    body: () => <Timeline items={[["Q1", "Draft the outline ✓"], ["Q2", "First 10 chapters"], ["Q3", "Edit pass"], ["Q4", "Publish book"]]} />,
  },
  {
    id: "nutrition", name: "Nutrition", angle: 270, title: "Meals today",
    flow: ["Plan meals", "Log", "Balance"],
    body: () => (
      <div className="af-split">
        <ul className="af-list"><li>Oats & berries</li><li>Chicken rice bowl</li><li>Salmon & greens</li></ul>
        <Bars rows={[["Protein", 70, "140g"], ["Carbs", 55, "210g"], ["Fat", 40, "60g"]]} />
      </div>
    ),
  },
  {
    id: "focus", name: "Focus", angle: 120, title: "Focus session",
    flow: ["Set intent", "Timer", "Break"],
    body: () => (
      <div className="af-timer">
        <div className="af-ring" aria-hidden="true"><span>25:00</span></div>
        <p>Round 2 of 4 · Intent: “Finish client brief”</p>
      </div>
    ),
  },
  {
    id: "hobby", name: "Hobby", angle: 240, title: "Practice streak",
    flow: ["Practice", "Note", "Repeat"],
    body: () => (
      <div className="af-streak">
        <div aria-hidden="true">{Array.from({ length: 14 }, (_, i) => <i key={i} data-on={[0, 1, 2, 4, 5, 7, 8, 9, 11, 12].includes(i) || undefined} />)}</div>
        <p>Guitar · 20 min sessions · 10 of 14 days</p>
      </div>
    ),
  },
  {
    id: "journal", name: "Journal", angle: 150, title: "Evening reflection",
    flow: ["Mood", "Reflect", "Tag"],
    body: () => (
      <div className="af-journal">
        <p className="af-mood">Mood · Calm</p>
        <blockquote>“What moved me closer to my goals today?”</blockquote>
        <p className="af-tags"><span>#gratitude</span><span>#progress</span></p>
      </div>
    ),
  },
  {
    id: "notes", name: "Notes", angle: 210, title: "Quick capture",
    flow: ["Capture", "Tag", "Link"],
    body: () => (
      <div className="af-notes">
        {[["Project idea", "#business"], ["Book quote", "#reading"], ["Workout tweak", "#fitness"]].map(([t, g]) => (
          <p key={t}><b>{t}</b><span>{g}</span></p>
        ))}
      </div>
    ),
  },
  {
    id: "travel", name: "Travel", angle: 180, title: "Trip itinerary",
    flow: ["Plan", "Pack", "Go"],
    body: () => <Timeline items={[["Day 1", "Arrive · check in"], ["Day 2", "Old town walk"], ["Day 3", "Coast day trip"]]} />,
  },
];

export function AtomicFlow() {
  const [active, setActive] = useState(cats[0].id);
  const cat = cats.find((c) => c.id === active)!;
  return (
    <figure className="af-wrap" aria-labelledby="af-label">
      <p className="af-label" id="af-label">
        Interactive concept · Fictional sample content · No records are saved
      </p>
      <div className="af-atom">
        <svg className="af-orbits" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <ellipse cx="50" cy="50" rx="44" ry="42" />
          <ellipse cx="50" cy="50" rx="44" ry="18" transform="rotate(25 50 50)" />
          <ellipse cx="50" cy="50" rx="44" ry="18" transform="rotate(-25 50 50)" />
        </svg>
        <div className="af-cats" role="group" aria-label="Choose a category">
          {cats.map((c) => {
            const r = (c.angle * Math.PI) / 180;
            return (
              <button
                key={c.id}
                type="button"
                className="af-cat"
                aria-pressed={c.id === active}
                aria-controls="af-center"
                style={{ left: `${50 + 45 * Math.sin(r)}%`, top: `${50 - 44 * Math.cos(r)}%` }}
                onClick={() => setActive(c.id)}
              >
                {c.name}
              </button>
            );
          })}
        </div>
        <section className="af-center" id="af-center" aria-live="polite" key={cat.id} data-cat={cat.id}>
          <p className="af-kicker">{cat.name} · Sample workspace</p>
          <h4>{cat.title}</h4>
          <ol className="af-flow">
            {cat.flow.map((s) => <li key={s}>{s}</li>)}
          </ol>
          <div className="af-body">{cat.body()}</div>
        </section>
      </div>
      <figcaption className="af-caption">
        Select a category to change the centre. The current app’s AI Workflow is a domain map for organizing
        steps; this demo uses fictional content and does not read or save data.
      </figcaption>
    </figure>
  );
}

