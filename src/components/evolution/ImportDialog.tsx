import { useRef, useState } from "react";
import { Upload, X, CheckCircle2, AlertCircle, RotateCcw } from "lucide-react";
import { parseImport, type DatasetKey, useEvolutionData } from "@/lib/evolution-data";

const DATASETS: { key: DatasetKey; label: string; fields: string }[] = [
  { key: "nutrition", label: "Nutrition", fields: "date, calories, protein, carbs, fats" },
  { key: "fitness", label: "Fitness", fields: "date, workouts, label" },
  { key: "investing", label: "Investing", fields: "date, value" },
];

export function ImportDialog() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<DatasetKey>("nutrition");
  const [status, setStatus] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { update, reset } = useEvolutionData();

  const handleFile = async (file: File) => {
    setStatus(null);
    try {
      const text = await file.text();
      const rows = parseImport(text, file.name, active);
      if (!rows.length) throw new Error("No valid rows detected. Check your columns.");
      update(active, rows);
      setStatus({ type: "ok", msg: `Imported ${rows.length} ${active} rows.` });
    } catch (e) {
      setStatus({ type: "err", msg: e instanceof Error ? e.message : "Failed to parse file" });
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="h-10 px-4 rounded-md border border-border bg-primary/5 hover:bg-primary/10 transition-colors flex items-center gap-2 text-primary hud-label text-xs"
      >
        <Upload className="h-4 w-4" /> Import Data
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="hud-card hud-scan max-w-xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="hud-label text-sm text-primary hud-glow">Import Dataset</div>
                <div className="text-xs text-muted-foreground mt-1">Upload CSV or JSON to update charts.</div>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {DATASETS.map((d) => (
                <button
                  key={d.key}
                  onClick={() => { setActive(d.key); setStatus(null); }}
                  className={`p-3 rounded-md border text-left transition-colors ${active === d.key ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                >
                  <div className="hud-label text-xs text-foreground">{d.label}</div>
                  <div className="text-[10px] text-muted-foreground mt-1 font-mono">{d.fields}</div>
                </button>
              ))}
            </div>

            <input
              ref={inputRef}
              type="file"
              accept=".csv,.json,text/csv,application/json"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            <button
              onClick={() => inputRef.current?.click()}
              className="w-full py-8 rounded-md border border-dashed border-border hover:border-primary/60 hover:bg-primary/5 transition-colors flex flex-col items-center gap-2"
            >
              <Upload className="h-6 w-6 text-primary" />
              <div className="hud-label text-xs text-foreground">Click to select .csv or .json</div>
              <div className="text-[10px] text-muted-foreground">Expected columns: {DATASETS.find(d => d.key === active)!.fields}</div>
            </button>

            {status && (
              <div className={`mt-4 flex items-start gap-2 p-3 rounded-md border ${status.type === "ok" ? "border-primary/40 bg-primary/5 text-primary" : "border-destructive/40 bg-destructive/5 text-destructive"}`}>
                {status.type === "ok" ? <CheckCircle2 className="h-4 w-4 mt-0.5" /> : <AlertCircle className="h-4 w-4 mt-0.5" />}
                <div className="text-xs">{status.msg}</div>
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
              <button
                onClick={() => { reset(); setStatus({ type: "ok", msg: "Reset to default sample data." }); }}
                className="flex items-center gap-1.5 text-[11px] hud-label text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3 w-3" /> Reset to defaults
              </button>
              <div className="text-[10px] text-muted-foreground">Stored locally in your browser</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
