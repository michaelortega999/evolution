import { createFileRoute } from "@tanstack/react-router";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Database,
  Palette,
  Trash2,
  Download,
  Timer,
  Check,
  Layers,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEvolutionData, useCloudStatus, type ThemeKey } from "@/lib/evolution-data";
import { THEME_OPTIONS, applyTheme } from "@/lib/use-theme";
import { cn, localISO, CARD_STYLES, normalizeCardStyle } from "@/lib/utils";
import { BankConnectionPanel } from "@/components/evolution/BankConnectionPanel";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Evolution" },
      { name: "description", content: "Profile, theme, focus timer and data settings for Evolution OS." },
      { property: "og:title", content: "Settings — Evolution" },
      { property: "og:description", content: "Profile, theme, focus timer and data settings for Evolution OS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { data, mutate, updateProfile, reset } = useEvolutionData();
  const settings = data.settings;
  const fs = data.focusSettings;
  const [name, setName] = useState(data.profile.name);
  // Saved data loads after first render: show the stored name unless the user is already typing.
  const nameTouched = useRef(false);
  useEffect(() => {
    if (!nameTouched.current) setName(data.profile.name);
  }, [data.profile.name]);
  const [confirmClear, setConfirmClear] = useState(false);

  const setTheme = (theme: ThemeKey) => {
    applyTheme(theme);
    mutate({ settings: { ...settings, theme } });
  };

  const toggleNotif = (key: keyof typeof settings.notifications) => {
    mutate({
      settings: { ...settings, notifications: { ...settings.notifications, [key]: !settings.notifications[key] } },
    });
  };

  const updateFocusSettings = (patch: Partial<typeof fs>) => mutate({ focusSettings: { ...fs, ...patch } });

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evolution-data-${localISO(new Date())}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success("Export downloaded.");
  };

  return (
    <ModuleLayout number="" title="Settings" subtitle="Customize your operating system" icon={SettingsIcon}>
      <CardAppearance />
      <Panel title="PROFILE">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="h-20 w-20 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center text-primary">
            <User className="h-8 w-8" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="hud-label text-[10px] text-muted-foreground">Name</label>
            <Input
              value={name}
              onChange={(e) => {
                nameTouched.current = true;
                setName(e.target.value);
              }}
              maxLength={60}
              className="mt-1"
            />
            <Button
              onClick={() => {
                if (!name.trim()) {
                  toast.error("Name can't be empty.");
                  return;
                }
                updateProfile({ name: name.trim() });
                nameTouched.current = false;
                toast.success("Profile saved.");
              }}
              className="mt-3 hud-label text-[10px]"
            >
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
              <button
                key={opt.key}
                onClick={() => setTheme(opt.key)}
                className={cn(
                  "p-3 border rounded flex flex-col items-center gap-2 transition-all",
                  active ? "border-primary bg-primary/15 hud-glow" : "border-border hover:bg-primary/5",
                )}
              >
                <span
                  className="h-10 w-10 rounded-full border border-border"
                  style={{ background: opt.swatch, boxShadow: `0 0 12px ${opt.swatch}` }}
                />
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
            <Input
              type="number"
              value={fs.focusMin}
              onChange={(e) => updateFocusSettings({ focusMin: Math.max(1, Number(e.target.value) || 1) })}
              className="h-9 text-xs mt-1"
            />
          </label>
          <label className="block">
            <span className="hud-label text-[10px] text-muted-foreground">Short break (min)</span>
            <Input
              type="number"
              value={fs.shortMin}
              onChange={(e) => updateFocusSettings({ shortMin: Math.max(1, Number(e.target.value) || 1) })}
              className="h-9 text-xs mt-1"
            />
          </label>
          <label className="block">
            <span className="hud-label text-[10px] text-muted-foreground">Long break (min)</span>
            <Input
              type="number"
              value={fs.longMin}
              onChange={(e) => updateFocusSettings({ longMin: Math.max(1, Number(e.target.value) || 1) })}
              className="h-9 text-xs mt-1"
            />
          </label>
          <label className="block">
            <span className="hud-label text-[10px] text-muted-foreground">Long every (rounds)</span>
            <Input
              type="number"
              value={fs.longEvery}
              onChange={(e) => updateFocusSettings({ longEvery: Math.max(1, Number(e.target.value) || 1) })}
              className="h-9 text-xs mt-1"
            />
          </label>
        </div>
      </Panel>

      <Panel title="NOTIFICATIONS">
        <p className="mb-3 text-xs text-muted-foreground">
          Your choices are saved. Reminder delivery isn't set up yet, so no alerts are sent.
        </p>
        <div className="flex flex-col gap-2">
          {(
            [
              ["daily", "Daily progress reminders"],
              ["goals", "Goal milestone alerts"],
              ["journal", "Journal prompts"],
            ] as const
          ).map(([key, label]) => (
            <label
              key={key}
              className="flex items-center justify-between p-3 border border-border rounded bg-primary/5 cursor-pointer"
            >
              <span className="flex items-center gap-2 text-sm text-foreground">
                <Bell className="h-4 w-4 text-primary" /> {label}
              </span>
              <button
                onClick={() => toggleNotif(key)}
                type="button"
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  settings.notifications[key] ? "bg-primary" : "bg-secondary",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-5 w-5 rounded-full bg-background transition-all",
                    settings.notifications[key] ? "left-5" : "left-0.5",
                  )}
                />
              </button>
            </label>
          ))}
        </div>
      </Panel>

      <BankConnectionPanel />

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
              <Button
                onClick={() => {
                  reset();
                  nameTouched.current = false;
                  setConfirmClear(false);
                  toast.success("All data cleared, including phone tasks and calendar.");
                }}
                variant="destructive"
                className="hud-label text-[10px]"
              >
                Confirm Clear
              </Button>
              <Button onClick={() => setConfirmClear(false)} variant="outline" className="hud-label text-[10px]">
                Cancel
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setConfirmClear(true)}
              variant="outline"
              className="hud-label text-[10px] border-destructive text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Clear All Data
            </Button>
          )}
        </div>
      </Panel>
    </ModuleLayout>
  );
}

function CardAppearance() {
  const { data, mutate } = useEvolutionData();
  const cloud = useCloudStatus();
  const selected = normalizeCardStyle(data.settings.cardStyle);
  const all = data.settings.applyCardStyleGlobally !== false;
  return (
    <section id="appearance" className="appearance-section" aria-labelledby="appearance-heading">
      <div className="appearance-heading">
        <div>
          <p className="hud-label text-xs text-primary">SETTINGS / APPEARANCE</p>
          <h2 id="appearance-heading">Design Cards</h2>
          <p>Choose the look and feel of your cards. Change it anytime.</p>
        </div>
        <span className="appearance-motto">
          SAME GOALS.
          <br />
          DIFFERENT STYLE.
          <br />
          MAKE IT YOURS.
        </span>
      </div>
      <div className="appearance-options" role="group" aria-label="Card style">
        {CARD_STYLES.map((style, i) => (
          <button
            key={style.id}
            type="button"
            aria-pressed={selected === style.id}
            disabled={cloud === "loading"}
            className={`appearance-choice ${selected === style.id ? "is-selected" : ""}`}
            onClick={() => mutate((p) => ({ settings: { ...p.settings, cardStyle: style.id } }))}
          >
            <div className={`appearance-preview card-surface card-style-${style.id}`} aria-hidden="true">
              <div className="appearance-preview-title">
                <Sparkles size={22} />
                <span>
                  FOCUS<small>Deep work</small>
                </span>
              </div>
              <div className="appearance-ring">
                <span>
                  YOUR
                  <br />
                  SPACE
                </span>
              </div>
              <div className="appearance-preview-footer">
                PLAN <span>•</span> BUILD <span>•</span> EVOLVE
              </div>
            </div>
            <span className="appearance-choice-title">
              <span>{String(i + 1).padStart(2, "0")}</span>
              {style.name}
            </span>
            <span className="appearance-description">{style.description}</span>
            <span className="appearance-select">
              {selected === style.id && <Check size={17} />} {selected === style.id ? "Selected" : "Select"}
            </span>
          </button>
        ))}
      </div>
      <label className="appearance-apply">
        <Layers aria-hidden="true" />
        <span>
          <strong>Apply to All Pages</strong>
          <small>
            {all
              ? "Your selected style is used across app card panels."
              : "Preview only. App cards keep the signature Jarvis style."}
          </small>
        </span>
        <input
          type="checkbox"
          checked={all}
          disabled={cloud === "loading"}
          onChange={(e) => mutate((p) => ({ settings: { ...p.settings, applyCardStyleGlobally: e.target.checked } }))}
        />
      </label>
      <p className="appearance-save-note" role="status">
        {cloud === "loading"
          ? "Loading your saved appearance…"
          : cloud === "error"
            ? "Saved on this device. Account sync is currently unavailable."
            : "Saved automatically with your app preferences."}{" "}
        Card style changes borders and surfaces; artwork and charts keep their original design.
      </p>
    </section>
  );
}
