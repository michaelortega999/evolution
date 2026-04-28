import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon, User, Bell, Database, Palette, Trash2 } from "lucide-react";
import { useState } from "react";
import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
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
  const [name, setName] = useState(data.profile.name);

  function setTheme(theme: ThemeKey) {
    applyTheme(theme);
    mutate({ settings: { ...settings, theme } });
  }

  function toggleNotif(key: keyof typeof settings.notifications) {
    mutate({ settings: { ...settings, notifications: { ...settings.notifications, [key]: !settings.notifications[key] } } });
  }

  return (
    <ModuleLayout number="" title="Settings" subtitle="Customize your operating system" icon={SettingsIcon}>
      <Panel title="PROFILE">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="h-20 w-20 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center hud-label text-2xl text-primary hud-glow">
            <User className="h-8 w-8" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="hud-label text-[10px] text-muted-foreground">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60}
              className="w-full mt-1 bg-input border border-border rounded px-3 py-2 text-sm text-foreground" />
            <button onClick={() => updateProfile({ name: name.trim() })}
              className="mt-3 px-4 py-2 bg-primary/15 border border-primary text-primary hud-label text-[10px] rounded hover:bg-primary/25">
              Save Profile
            </button>
          </div>
        </div>
      </Panel>

      <Panel title="THEME">
        <div className="flex items-center gap-2 mb-3 text-muted-foreground text-xs">
          <Palette className="h-4 w-4" /> Choose your accent color.
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {THEME_OPTIONS.map((opt) => {
            const active = settings.theme === opt.key;
            return (
              <button key={opt.key} onClick={() => setTheme(opt.key)}
                className={cn(
                  "p-3 border rounded flex flex-col items-center gap-2 transition-all",
                  active ? "border-primary bg-primary/15 hud-glow" : "border-border hover:bg-primary/5"
                )}>
                <span className="h-10 w-10 rounded-full border border-border" style={{ background: opt.swatch, boxShadow: `0 0 12px ${opt.swatch}` }} />
                <span className="hud-label text-[10px] text-foreground">{opt.label}</span>
              </button>
            );
          })}
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
              <button
                onClick={() => toggleNotif(key)}
                type="button"
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  settings.notifications[key] ? "bg-primary" : "bg-secondary"
                )}>
                <span className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-background transition-all",
                  settings.notifications[key] ? "left-5" : "left-0.5"
                )} />
              </button>
            </label>
          ))}
        </div>
      </Panel>

      <Panel title="DATA MANAGEMENT">
        <div className="flex items-center gap-2 mb-3 text-muted-foreground text-xs">
          <Database className="h-4 w-4" /> Local storage data
        </div>
        <button
          onClick={() => { if (confirm("Clear ALL data and reset onboarding?")) reset(); }}
          className="flex items-center gap-2 px-4 py-2 border border-destructive text-destructive hud-label text-[10px] rounded hover:bg-destructive/10">
          <Trash2 className="h-4 w-4" /> Clear All Data
        </button>
      </Panel>
    </ModuleLayout>
  );
}
