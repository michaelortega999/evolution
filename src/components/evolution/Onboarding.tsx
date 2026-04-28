import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEvolutionData, type Profile } from "@/lib/evolution-data";

const mirrorQs = [
  "What lie have you been telling yourself?",
  "Where are you leaking time and energy?",
  "What would the best version of you do today?",
];

const commitmentQs = [
  "What one goal will you commit to this quarter?",
  "What will you sacrifice to get it?",
  "Who will you become in the process?",
];

export function Onboarding() {
  const { data, updateProfile } = useEvolutionData();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Profile>(data.profile);

  const next = () => setStep((s) => s + 1);
  const patch = (p: Partial<Profile>) => setDraft((d) => ({ ...d, ...p }));

  const finish = () => {
    updateProfile({ ...draft, onboarded: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="hud-card hud-scan p-10 max-w-2xl w-full">
        <div className="hud-label text-[10px] text-muted-foreground mb-6 tracking-[0.4em]">
          STEP {step + 1} / 5
        </div>

        {step === 0 && (
          <div className="flex flex-col items-center text-center gap-6">
            <Bonsai />
            <h1 className="hud-label text-3xl text-primary hud-glow">Evolution</h1>
            <p className="text-foreground/90 text-lg max-w-md leading-relaxed italic">
              "You are the sum of your decisions.<br />
              Today, you stop drifting. Today, you evolve."
            </p>
            <div className="hud-label text-[10px] text-muted-foreground tracking-[0.4em]">
              DISCIPLINE · FOCUS · CONSISTENCY · FREEDOM
            </div>
            <Button onClick={next} className="mt-4 hud-label">Begin</Button>
          </div>
        )}

        {step === 1 && (
          <StepForm
            title="Mirror"
            subtitle="Face yourself. Answer honestly."
            questions={mirrorQs}
            values={draft.mirror}
            onChange={(i, v) => {
              const copy = [...draft.mirror] as Profile["mirror"];
              copy[i] = v;
              patch({ mirror: copy });
            }}
            onNext={next}
          />
        )}

        {step === 2 && (
          <StepForm
            title="Commitment"
            subtitle="Words bind. Write them."
            questions={commitmentQs}
            values={draft.commitment}
            onChange={(i, v) => {
              const copy = [...draft.commitment] as Profile["commitment"];
              copy[i] = v;
              patch({ commitment: copy });
            }}
            onNext={next}
          />
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="hud-label text-2xl text-primary hud-glow">Setup</h2>
              <p className="text-sm text-muted-foreground mt-1">Calibrate your system.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Name">
                <Input value={draft.name} onChange={(e) => patch({ name: e.target.value })} placeholder="Your name" />
              </Field>
              <Field label="Trading Balance ($)">
                <Input type="number" value={draft.tradingBalance} onChange={(e) => patch({ tradingBalance: +e.target.value })} />
              </Field>
              <Field label="Goal ($)">
                <Input type="number" value={draft.goal} onChange={(e) => patch({ goal: +e.target.value })} />
              </Field>
              <Field label="Calorie Target">
                <Input type="number" value={draft.calorieTarget} onChange={(e) => patch({ calorieTarget: +e.target.value })} />
              </Field>
              <Field label="Gym Sessions / wk">
                <Input type="number" value={draft.gymSessionsTarget} onChange={(e) => patch({ gymSessionsTarget: +e.target.value })} />
              </Field>
              <Field label="Protein (g)">
                <Input type="number" value={draft.proteinTarget} onChange={(e) => patch({ proteinTarget: +e.target.value })} />
              </Field>
              <Field label="Bench (lb)">
                <Input type="number" value={draft.bench} onChange={(e) => patch({ bench: +e.target.value })} />
              </Field>
              <Field label="Squat (lb)">
                <Input type="number" value={draft.squat} onChange={(e) => patch({ squat: +e.target.value })} />
              </Field>
              <Field label="Deadlift (lb)">
                <Input type="number" value={draft.deadlift} onChange={(e) => patch({ deadlift: +e.target.value })} />
              </Field>
            </div>
            <div className="flex justify-end">
              <Button onClick={next} className="hud-label" disabled={!draft.name.trim()}>Continue</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center text-center gap-6">
            <Bonsai />
            <h1 className="hud-label text-3xl text-primary hud-glow">
              Good morning, {draft.name || "Operator"}.
            </h1>
            <p className="text-foreground/80 max-w-md">
              Your system is online. The pillars stand.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg">
              {["Discipline", "Focus", "Consistency", "Freedom"].map((p) => (
                <div key={p} className="border border-primary/40 rounded-md py-3 bg-primary/5">
                  <div className="hud-label text-xs text-primary hud-glow">{p}</div>
                </div>
              ))}
            </div>
            <Button onClick={finish} className="mt-4 hud-label">Activate</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="hud-label text-[10px] text-muted-foreground mb-1.5">{label}</div>
      {children}
    </label>
  );
}

function StepForm({
  title, subtitle, questions, values, onChange, onNext,
}: {
  title: string; subtitle: string; questions: string[]; values: readonly string[];
  onChange: (i: number, v: string) => void; onNext: () => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="hud-label text-2xl text-primary hud-glow">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>
      <div className="space-y-4">
        {questions.map((q, i) => (
          <div key={i}>
            <div className="hud-label text-[10px] text-muted-foreground mb-1.5">{q}</div>
            <Input value={values[i] ?? ""} onChange={(e) => onChange(i, e.target.value)} />
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button onClick={onNext} className="hud-label">Continue</Button>
      </div>
    </div>
  );
}

function Bonsai() {
  const [effectsReady, setEffectsReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setEffectsReady(true), 150);
    return () => window.clearTimeout(timer);
  }, []);

  // 6 particles with deterministic offsets so SSR/CSR match
  const particles = Array.from({ length: 6 }, (_, i) => {
    const left = 15 + ((i * 37) % 70); // 15% - 85%
    const delay = (i * 0.45) % 6;
    const duration = 5 + ((i * 1.3) % 4);
    const size = 2 + (i % 3);
    return { left, delay, duration, size, i };
  });

  return (
    <div className="holo-stage relative h-72 w-72 flex items-center justify-center">
      {effectsReady && (
        <>
          {/* Vertical projector beam */}
          <div className="holo-beam" aria-hidden />

          {/* Ground ring (pulsing base) */}
          <div className="holo-base" aria-hidden>
            <div className="holo-base-ring" />
            <div className="holo-base-ring holo-base-ring--inner" />
          </div>

          {/* Concentric orbital rings (armillary) */}
          <div className="holo-orbit holo-orbit--1" aria-hidden />
          <div className="holo-orbit holo-orbit--2" aria-hidden />
          <div className="holo-orbit holo-orbit--3" aria-hidden />
        </>
      )}

      <div className="holo-bonsai-wrap" aria-label="Bonsai emblem" role="img">
        <svg className="holo-bonsai bonsai-emblem h-48 w-48" viewBox="0 0 512 512" aria-hidden="true">
          <circle className="bonsai-emblem__halo" cx="256" cy="256" r="206" />
          <circle className="bonsai-emblem__ring" cx="256" cy="256" r="190" />
          {Array.from({ length: 16 }, (_, i) => {
            const angle = (i * 22.5 * Math.PI) / 180;
            const x1 = 256 + Math.cos(angle) * 174;
            const y1 = 256 + Math.sin(angle) * 174;
            const x2 = 256 + Math.cos(angle) * 190;
            const y2 = 256 + Math.sin(angle) * 190;
            return <line key={i} className="bonsai-emblem__tick" x1={x1} y1={y1} x2={x2} y2={y2} />;
          })}
          <ellipse className="bonsai-emblem__bowl" cx="256" cy="342" rx="88" ry="28" />
          <path className="bonsai-emblem__bowl" d="M174 342h164l-20 58H194z" />
          <path className="bonsai-emblem__trunk" d="M250 344c38-42-20-72 25-118 22-22 53-29 66-60-42 19-83 14-112 37-34 27-27 61-2 86 18 19 15 35 5 55" />
          <path className="bonsai-emblem__root" d="M210 372c18-18 34-25 52-31m-8 35c17-24 36-38 62-50m-85 51c-11-16-22-28-41-36" />
          <g className="bonsai-emblem__canopy">
            <path d="M176 201c-19-10-19-39 3-48 3-31 47-36 61-12 17-33 72-22 73 17 33-7 54 31 31 55 19 14 6 45-18 45H187c-34 0-43-42-11-57Z" />
            <path d="M151 244c-16-7-16-31 1-38 4-24 36-25 45-7 13-17 42-13 48 8 20-5 38 17 25 34 12 11 3 33-15 33h-91c-25 0-33-25-13-30Z" />
          </g>
        </svg>
      </div>

      {/* Floating particles */}
      {effectsReady && (
        <div className="holo-particles" aria-hidden>
          {particles.map((p) => (
            <span
              key={p.i}
              className="holo-particle"
              style={{
                left: `${p.left}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
