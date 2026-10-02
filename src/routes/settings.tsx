import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon, User, Bell, Database, Palette, Trash2, Download, Timer } from "lucide-react";
import { useState } from "react";
import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEvolutionData, type ThemeKey } from "@/lib/evolution-data";
import { THEME_OPTIONS, applyTheme } from "@/lib/use-theme";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Evolution" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { data, mutate, updateProfile, reset } = useEvolutionData();
  const settings = data.settings;
  const fs = data.focusSettings;
  const [name, setName] = useState(data.profile.name);
  const [confirmClear, setConfirmClear] = useState(false);

  const setTheme = (theme: ThemeKey) => {
    applyTheme(theme);
    mutate({ settings: { ...settings, theme } });
  };

  const toggleNotif = (key: keyof typeof settings.notifications) => {
    mutate({ settings: { ...settings, notifications: { ...settings.notifications, [key]: !settings.notifications[key] } } });
  };

  const updateFocusSettings = (patch: Partial<typeof fs>) =>
    mutate({ focusSettings: { ...fs, ...patch } });

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evolution-data-${localISO(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ModuleLayout number="" title="Settings" subtitle="Customize your operating system" icon={SettingsIcon}>
      <Panel title="PROFILE">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="h-20 w-20 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center text-primary">
            <User className="h-8 w-8" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="hud-label text-[10px] text-muted-foreground">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className="mt-1" />
            <Button onClick={() => updateProfile({ name: name.trim() })} className="mt-3 hud-label text-[10px]">
              Save Profile
            </Button>
          </div>
        </div>
      </Panel>

      <Panel title="THEME">
        <div className="flex items-center gap-2 mb-3 text-muted-foreground text-xs">
          <Palette className="h-4 w-4" /> Choose your accent color (instant).
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {THEME_OPTIONS.map((opt) => {
            const active = settings.theme === opt.key;
            return (
              <button key={opt.key} onClick={() => setTheme(opt.key)}
                className={cn("p-3 border rounded flex flex-col items-center gap-2 transition-all",
                  active ? "border-primary bg-primary/15 hud-glow" : "border-border hover:bg-primary/5")}>
                <span className="h-10 w-10 rounded-full border border-border" style={{ background: opt.swatch, boxShadow: `0 0 12px ${opt.swatch}` }} />
                <span className="hud-label text-[10px] text-foreground">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel title="TIMER">
        <div className="flex items-center gap-2 mb-3 text-muted-foreground text-xs">
          <Timer className="h-4 w-4" /> Focus and break durations.
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <label className="block">
            <span className="hud-label text-[10px] text-muted-foreground">Focus (min)</span>
            <Input type="number" value={fs.focusMin} onChange={(e) => updateFocusSettings({ focusMin: Math.max(1, Number(e.target.value) || 1) })} className="h-9 text-xs mt-1" />
          </label>
          <label className="block">
            <span className="hud-label text-[10px] text-muted-foreground">Short break (min)</span>
            <Input type="number" value={fs.shortMin} onChange={(e) => updateFocusSettings({ shortMin: Math.max(1, Number(e.target.value) || 1) })} className="h-9 text-xs mt-1" />
          </label>
          <label className="block">
            <span className="hud-label text-[10px] text-muted-foreground">Long break (min)</span>
            <Input type="number" value={fs.longMin} onChange={(e) => updateFocusSettings({ longMin: Math.max(1, Number(e.target.value) || 1) })} className="h-9 text-xs mt-1" />
          </label>
          <label className="block">
            <span className="hud-label text-[10px] text-muted-foreground">Long every (rounds)</span>
            <Input type="number" value={fs.longEvery} onChange={(e) => updateFocusSettings({ longEvery: Math.max(1, Number(e.target.value) || 1) })} className="h-9 text-xs mt-1" />
          </label>
        </div>
      </Panel>

      <Panel title="NOTIFICATIONS">
        <div className="flex flex-col gap-2">
          {([
            ["daily", "Daily progress reminders"],
            ["goals", "Goal milestone alerts"],
            ["journal", "Journal prompts"],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center justify-between p-3 border border-border rounded bg-primary/5 cursor-pointer">
              <span className="flex items-center gap-2 text-sm text-foreground">
                <Bell className="h-4 w-4 text-primary" /> {label}
              </span>
              <button onClick={() => toggleNotif(key)} type="button"
                className={cn("relative h-6 w-11 rounded-full transition-colors", settings.notifications[key] ? "bg-primary" : "bg-secondary")}>
                <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-background transition-all", settings.notifications[key] ? "left-5" : "left-0.5")} />
              </button>
            </label>
          ))}
        </div>
      </Panel>

      <Panel title="DATA">
        <div className="flex items-center gap-2 mb-3 text-muted-foreground text-xs">
          <Database className="h-4 w-4" /> Export or wipe all local data.
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={exportData} variant="outline" className="hud-label text-[10px]">
            <Download className="h-4 w-4 mr-2" /> Export JSON
          </Button>
          {confirmClear ? (
            <>
              <Button onClick={() => { reset(); setConfirmClear(false); }} variant="destructive" className="hud-label text-[10px]">
                Confirm Clear
              </Button>
              <Button onClick={() => setConfirmClear(false)} variant="outline" className="hud-label text-[10px]">Cancel</Button>
            </>
          ) : (
            <Button onClick={() => setConfirmClear(true)} variant="outline"
              className="hud-label text-[10px] border-destructive text-destructive hover:bg-destructive/10">
              <Trash2 className="h-4 w-4 mr-2" /> Clear All Data
            </Button>
          )}
        </div>
      </Panel>
    </ModuleLayout>
  );
}
