import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEvolutionData, type Profile } from "@/lib/evolution-data";
import bonsaiImg from "@/assets/bonsai.png";

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
  return (
    <div className="relative h-40 w-40 rounded-full border border-primary/50 flex items-center justify-center bg-primary/5 overflow-hidden">
      <div className="absolute inset-0 rounded-full" style={{ boxShadow: "inset 0 0 30px oklch(0.88 0.28 145 / 0.35)" }} />
      <img
        src={bonsaiImg}
        alt="Bonsai emblem"
        width={512}
        height={512}
        className="h-32 w-32 object-contain"
        style={{ filter: "drop-shadow(0 0 10px oklch(0.88 0.28 145 / 0.7))" }}
      />
    </div>
  );
}
