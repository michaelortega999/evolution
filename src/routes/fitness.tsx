import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  Dumbbell,
  Trash2,
  Plus,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  PlayCircle,
  BookOpen,
  Layers,
  Heart,
  Pencil,
  Activity,
} from "lucide-react";
import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
import { BarChart } from "@/components/evolution/BarChart";
import { Sparkline } from "@/components/evolution/Sparkline";
import { RingProgress } from "@/components/evolution/RingProgress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  useEvolutionData,
  fitnessWeek,
  newLoggedWorkout,
  todayDate,
  uid,
  workoutCount,
  fitnessAfterWorkoutDelete,
  type WorkoutType,
  type StressLevel,
  type PRLift,
  type TrainingSlot,
  type CalendarEvent,
} from "@/lib/evolution-data";
export const Route = createFileRoute("/fitness")({
  head: () => ({
    meta: [
      { title: "Fitness — Evolution" },
      { property: "og:title", content: "Fitness — Evolution" },
      { property: "og:description", content: "Workouts, PRs, recovery, and progress charts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "description", content: "Workouts, PRs, recovery, and progress charts." },
    ],
  }),
  component: FitnessPage,
});
const WORKOUT_TYPES: WorkoutType[] = ["Push", "Pull", "Legs", "Cardio", "Full Body"];
const STRESS: StressLevel[] = ["Low", "Medium", "High"];
function LegacyFitness({ section }: { section: string }) {
  const { data, mutate, updateProfile } = useEvolutionData();
  const fit = fitnessWeek(data.fitness, data.workouts, data.profile.gymSessionsTarget);
  const total = workoutCount(data.fitness, data.workouts, () => true);
  const [legacyError, setLegacyError] = useState("");
  const [legacyNotice, setLegacyNotice] = useState("");
  const [logOpen, setLogOpen] = useState(false);
  const [wType, setWType] = useState<WorkoutType>("Push");
  const [wDur, setWDur] = useState("60");
  const [wNotes, setWNotes] = useState("");
  const submitSession = () => {
    const duration = Number(wDur);
    if (!wDur.trim() || !Number.isFinite(duration) || duration <= 0 || duration > 1440) {
      setLegacyError("Enter a duration from 1 to 1,440 minutes.");
      return;
    }
    setLegacyError("");
    const today = todayDate();
    mutate((prev) => ({
      workouts: [...prev.workouts, newLoggedWorkout(uid(), today, wType, duration, wNotes.trim() || undefined)],
    }));
    setWDur("60");
    setWNotes("");
    setLogOpen(false);
  };
  const deleteWorkout = (id: string) => {
    mutate((prev) => {
      const gone = prev.workouts.find((w) => w.id === id);
      if (!gone) return {};
      return {
        workouts: prev.workouts.filter((w) => w.id !== id),
        fitness: fitnessAfterWorkoutDelete(prev.fitness, prev.workouts, gone),
      };
    });
  };
  const liftLabel = (l: string) => (l === "backrow" ? "Back Row" : l.charAt(0).toUpperCase() + l.slice(1));
  const [prDraft, setPrDraft] = useState({ bench: "", squat: "", backrow: "" });
  const updatePR = (lift: PRLift) => {
    const v = Number(prDraft[lift]);
    if (!prDraft[lift].trim() || !Number.isFinite(v) || v <= 0) {
      setLegacyError("Enter a positive, finite PR weight.");
      return;
    }
    setLegacyError("");
    mutate((prev) => ({
      profile: { ...prev.profile, [lift]: v },
      prHistory: [...prev.prHistory, { id: uid(), date: todayDate(), lift, weight: v }],
    }));
    setPrDraft((p) => ({ ...p, [lift]: "" }));
  };
  const [sleep, setSleep] = useState("7.5");
  const [stress, setStress] = useState<StressLevel>("Low");
  const lastRecovery = data.recovery.at(-1);
  const recoveryScore = useMemo(() => {
    if (!lastRecovery) return 0;
    const sleepScore = Math.min(100, (lastRecovery.sleepHours / 8) * 60);
    const stressScore = lastRecovery.stress === "Low" ? 40 : lastRecovery.stress === "Medium" ? 25 : 10;
    return Math.max(0, Math.min(100, Math.round(sleepScore + stressScore)));
  }, [lastRecovery]);
  const logRecovery = () => {
    const hours = Number(sleep);
    if (!sleep.trim() || !Number.isFinite(hours) || hours < 0 || hours > 24) {
      setLegacyError("Sleep must be between 0 and 24 hours.");
      return;
    }
    setLegacyError("");
    setLegacyNotice("Recovery entry saved.");
    mutate((prev) => ({ recovery: [...prev.recovery, { id: uid(), date: todayDate(), sleepHours: hours, stress }] }));
  };
  const prSeries = (lift: PRLift) => {
    const arr = data.prHistory.filter((p) => p.lift === lift).map((p) => p.weight);
    if (arr.length < 2) return [data.profile[lift], data.profile[lift]];
    return arr;
  };
  const schedule = data.trainingSchedule ?? [];
  const [slotDraft, setSlotDraft] = useState<{
    dayOfWeek: number;
    time: string;
    endTime: string;
    title: string;
    type: WorkoutType;
  }>({ dayOfWeek: 0, time: "07:00", endTime: "08:00", title: "", type: "Push" });
  const addSlot = () => {
    if (
      !slotDraft.title.trim() ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(slotDraft.time) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(slotDraft.endTime) ||
      slotDraft.endTime <= slotDraft.time
    ) {
      setLegacyError("Add a title and valid start/end times, with end after start.");
      return;
    }
    setLegacyError("");
    const slot: TrainingSlot = { id: uid(), ...slotDraft, title: slotDraft.title.trim() };
    mutate((prev) => ({ trainingSchedule: [...(prev.trainingSchedule ?? []), slot] }));
    setSlotDraft((d) => ({ ...d, title: "" }));
  };
  const removeSlot = (id: string) => {
    mutate((prev) => ({ trainingSchedule: (prev.trainingSchedule ?? []).filter((s) => s.id !== id) }));
  };
  const syncToCalendar = () => {
    const now = new Date();
    const day = now.getDay();
    const mondayOffset = (day + 6) % 7;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset);
    const ymd = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${dd}`;
    };
    mutate((prev) => {
      const existing = prev.calendar ?? [];
      const seen = new Set(existing.map((event) => event.id));
      const newEvents: CalendarEvent[] = (prev.trainingSchedule ?? []).flatMap((slot) => {
        if (!Number.isInteger(slot.dayOfWeek) || slot.dayOfWeek < 0 || slot.dayOfWeek > 6) return [];
        const date = ymd(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + slot.dayOfWeek));
        const id = `train-${slot.id}-${date}`;
        if (seen.has(id)) return [];
        seen.add(id);
        return [{ id, date, time: slot.time, endTime: slot.endTime, title: `🏋 ${slot.title}`, reminder: 30 }];
      });
      return { calendar: [...existing, ...newEvents] };
    });
    setLegacyNotice(
      "Missing sessions added to this week’s Planning calendar. Existing calendar entries were preserved.",
    );
  };
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const slotsByDay = useMemo(() => {
    const m: TrainingSlot[][] = [[], [], [], [], [], [], []];
    schedule.forEach((s) => {
      if (m[s.dayOfWeek]) m[s.dayOfWeek].push(s);
    });
    m.forEach((arr) => arr.sort((a, b) => a.time.localeCompare(b.time)));
    return m;
  }, [schedule]);
  return (
    <>
      {" "}
      <div className="space-y-6" data-fitness-legacy={section}>
        {" "}
        {legacyError && (
          <p role="alert" className="text-sm text-red-300">
            {" "}
            {legacyError}{" "}
          </p>
        )}{" "}
        {legacyNotice && (
          <p role="status" className="text-sm text-sky-200">
            {" "}
            {legacyNotice}{" "}
          </p>
        )}{" "}
        {section === "Workouts" && (
          <>
            {" "}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {" "}
              <Panel title="This Week">
                {" "}
                <div className="hud-label text-3xl text-primary hud-glow">
                  {" "}
                  {fit.sessions} / {fit.target}{" "}
                </div>{" "}
                <div className="hud-label text-[10px] text-muted-foreground mt-2"> Sessions completed </div>{" "}
              </Panel>{" "}
              <Panel title="All-Time">
                {" "}
                <div className="hud-label text-3xl text-primary hud-glow">{total}</div>{" "}
                <div className="hud-label text-[10px] text-muted-foreground mt-2"> Total workouts </div>{" "}
              </Panel>{" "}
              <Panel title="Log">
                {" "}
                <Button onClick={() => setLogOpen(true)} className="w-full hud-label text-[10px]">
                  {" "}
                  + Log Session{" "}
                </Button>{" "}
              </Panel>{" "}
            </div>{" "}
          </>
        )}{" "}
        {section === "Settings" && (
          <>
            {" "}
            <Panel title="Weekly Training Schedule">
              {" "}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                {" "}
                <span className="hud-label text-[10px] text-muted-foreground">
                  {" "}
                  Add missing sessions to this week’s calendar. Existing events remain unchanged.{" "}
                </span>{" "}
                <Button onClick={syncToCalendar} size="sm" className="hud-label text-[10px]">
                  {" "}
                  <CalendarPlus className="h-3 w-3 mr-1" /> Sync to Calendar{" "}
                </Button>{" "}
              </div>{" "}
              <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
                {" "}
                {DAYS.map((d, i) => (
                  <div key={d} className="evo-surface border border-border rounded p-2 min-h-[120px] bg-primary/5">
                    {" "}
                    <div className="hud-label text-[10px] text-primary mb-2 text-center">{d}</div>{" "}
                    <div className="space-y-2">
                      {" "}
                      {slotsByDay[i].map((s) => (
                        <div
                          key={s.id}
                          className="evo-surface bg-background/60 border border-border rounded p-2 group relative"
                        >
                          {" "}
                          <div className="hud-label text-[10px] text-primary">
                            {" "}
                            {s.time}–{s.endTime}{" "}
                          </div>{" "}
                          <div className="text-xs text-foreground/90 mt-1 truncate">{s.title}</div>{" "}
                          <div className="hud-label text-[9px] text-muted-foreground mt-0.5"> {s.type} </div>{" "}
                          <button
                            onClick={() => removeSlot(s.id)}
                            className="absolute top-1 right-1 opacity-70 hover:opacity-100 text-muted-foreground hover:text-destructive"
                            aria-label="Remove"
                          >
                            {" "}
                            <Trash2 className="h-3 w-3" />{" "}
                          </button>{" "}
                        </div>
                      ))}{" "}
                      {slotsByDay[i].length === 0 && (
                        <div className="hud-label text-[9px] text-muted-foreground/60 text-center py-2"> Rest </div>
                      )}{" "}
                    </div>{" "}
                  </div>
                ))}{" "}
              </div>{" "}
              <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[1fr_100px_100px_100px_120px_auto] gap-2 items-end">
                {" "}
                <label className="block">
                  {" "}
                  <span className="hud-label text-[10px] text-muted-foreground">Title</span>{" "}
                  <Input
                    value={slotDraft.title}
                    onChange={(e) => setSlotDraft({ ...slotDraft, title: e.target.value })}
                    placeholder="e.g. Push Day"
                    className="h-9 text-xs mt-1"
                  />{" "}
                </label>{" "}
                <label className="block">
                  {" "}
                  <span className="hud-label text-[10px] text-muted-foreground">Day</span>{" "}
                  <select
                    value={slotDraft.dayOfWeek}
                    onChange={(e) => setSlotDraft({ ...slotDraft, dayOfWeek: Number(e.target.value) })}
                    className="w-full h-9 text-xs mt-1 bg-transparent border border-input rounded px-2"
                  >
                    {" "}
                    {DAYS.map((d, i) => (
                      <option key={d} value={i}>
                        {" "}
                        {d}{" "}
                      </option>
                    ))}{" "}
                  </select>{" "}
                </label>{" "}
                <label className="block">
                  {" "}
                  <span className="hud-label text-[10px] text-muted-foreground">Start</span>{" "}
                  <Input
                    type="time"
                    value={slotDraft.time}
                    onChange={(e) => setSlotDraft({ ...slotDraft, time: e.target.value })}
                    className="h-9 text-xs mt-1"
                  />{" "}
                </label>{" "}
                <label className="block">
                  {" "}
                  <span className="hud-label text-[10px] text-muted-foreground">End</span>{" "}
                  <Input
                    type="time"
                    value={slotDraft.endTime}
                    onChange={(e) => setSlotDraft({ ...slotDraft, endTime: e.target.value })}
                    className="h-9 text-xs mt-1"
                  />{" "}
                </label>{" "}
                <label className="block">
                  {" "}
                  <span className="hud-label text-[10px] text-muted-foreground">Type</span>{" "}
                  <select
                    value={slotDraft.type}
                    onChange={(e) => setSlotDraft({ ...slotDraft, type: e.target.value as WorkoutType })}
                    className="w-full h-9 text-xs mt-1 bg-transparent border border-input rounded px-2"
                  >
                    {" "}
                    {WORKOUT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {" "}
                        {t}{" "}
                      </option>
                    ))}{" "}
                  </select>{" "}
                </label>{" "}
                <Button onClick={addSlot} size="sm" className="hud-label text-[10px] h-9">
                  {" "}
                  <Plus className="h-3 w-3 mr-1" /> Add{" "}
                </Button>{" "}
              </div>{" "}
            </Panel>{" "}
            <Panel title="Personal Records">
              {" "}
              <div className="space-y-4">
                {" "}
                {(["bench", "squat", "backrow"] as const).map((lift) => (
                  <div key={lift} className="grid grid-cols-2 sm:grid-cols-[100px_1fr_auto_auto] items-center gap-3">
                    {" "}
                    <span className="hud-label text-xs text-muted-foreground capitalize"> {liftLabel(lift)} </span>{" "}
                    <span className="hud-label text-2xl text-primary hud-glow"> {data.profile[lift]} lb </span>{" "}
                    <Input
                      type="number"
                      placeholder="New PR"
                      value={prDraft[lift]}
                      onChange={(e) => setPrDraft((p) => ({ ...p, [lift]: e.target.value }))}
                      className="h-9 text-xs w-28"
                    />{" "}
                    <Button size="sm" onClick={() => updatePR(lift)} className="hud-label text-[10px]">
                      {" "}
                      Update PR{" "}
                    </Button>{" "}
                  </div>
                ))}{" "}
              </div>{" "}
              <div className="mt-4 pt-4 border-t border-border">
                {" "}
                <label className="block">
                  {" "}
                  <span className="hud-label text-[10px] text-muted-foreground"> Weekly target sessions </span>{" "}
                  <Input
                    type="number"
                    value={data.profile.gymSessionsTarget}
                    min="0"
                    step="1"
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      if (e.target.value.trim() && Number.isInteger(n) && n >= 0) {
                        updateProfile({ gymSessionsTarget: n });
                        setLegacyError("");
                      } else setLegacyError("Weekly target must be a nonnegative whole number.");
                    }}
                    className="h-9 text-xs mt-1 w-32"
                  />{" "}
                </label>{" "}
              </div>{" "}
            </Panel>{" "}
          </>
        )}{" "}
        {section === "Progress" && (
          <>
            {" "}
            <Panel title="Weekly Activity">
              {" "}
              <BarChart data={fit.data.length ? fit.data : [0]} labels={fit.labels} height={200} />{" "}
            </Panel>{" "}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {" "}
              {(["bench", "squat", "backrow"] as const).map((lift) => (
                <Panel key={lift} title={`${liftLabel(lift)} Progress`}>
                  {" "}
                  <Sparkline data={prSeries(lift)} height={140} />{" "}
                  <div className="hud-label text-[10px] text-muted-foreground mt-2">
                    {" "}
                    Current: <span className="text-primary">{data.profile[lift]} lb</span>{" "}
                  </div>{" "}
                </Panel>
              ))}{" "}
            </div>{" "}
            <Panel title={`PR History (${data.prHistory.length})`}>
              {" "}
              <ul className="divide-y divide-border max-h-[300px] overflow-y-auto">
                {" "}
                {[...data.prHistory].reverse().map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-2 text-xs">
                    {" "}
                    <span className="hud-label text-muted-foreground">{p.date}</span>{" "}
                    <span className="hud-label capitalize text-foreground/80"> {liftLabel(p.lift)} </span>{" "}
                    <span className="hud-label text-primary">{p.weight} lb</span>{" "}
                  </li>
                ))}{" "}
                {!data.prHistory.length && (
                  <li className="text-xs text-muted-foreground py-4 text-center"> No PRs logged yet. </li>
                )}{" "}
              </ul>{" "}
            </Panel>{" "}
          </>
        )}{" "}
        {section === "Workouts" && (
          <>
            {" "}
            <Panel title={`All Workouts (${data.workouts.length})`}>
              {" "}
              <Button onClick={() => setLogOpen(true)} size="sm" className="hud-label text-[10px] mb-4">
                {" "}
                <Plus className="h-3 w-3 mr-1" /> Add Workout{" "}
              </Button>{" "}
              <ul className="divide-y divide-border max-h-[500px] overflow-y-auto">
                {" "}
                {[...data.workouts].reverse().map((w) => (
                  <li key={w.id} className="py-3 flex items-center gap-3 group">
                    {" "}
                    <div className="flex-1 min-w-0">
                      {" "}
                      <div className="flex items-center gap-3">
                        {" "}
                        <span className="hud-label text-[10px] text-muted-foreground"> {w.date} </span>{" "}
                        <span className="hud-label text-xs text-primary">{w.type}</span>{" "}
                        <span className="hud-label text-[10px] text-foreground/70"> {w.durationMin} min </span>{" "}
                      </div>{" "}
                      {w.notes && <div className="text-[11px] text-foreground/70 mt-1">{w.notes}</div>}{" "}
                    </div>{" "}
                    <button
                      aria-label={`Delete ${w.type} workout on ${w.date}`}
                      onClick={() => deleteWorkout(w.id)}
                      className="opacity-70 hover:opacity-100 text-muted-foreground hover:text-destructive"
                    >
                      {" "}
                      <Trash2 className="h-3.5 w-3.5" />{" "}
                    </button>{" "}
                  </li>
                ))}{" "}
                {!data.workouts.length && (
                  <li className="text-xs text-muted-foreground py-6 text-center"> No workouts logged. </li>
                )}{" "}
              </ul>{" "}
            </Panel>{" "}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6">
              {" "}
              <Panel title="Log Recovery">
                {" "}
                <div className="space-y-3">
                  {" "}
                  <label className="block">
                    {" "}
                    <span className="hud-label text-[10px] text-muted-foreground"> Sleep (hours) </span>{" "}
                    <Input
                      type="number"
                      step="0.1"
                      value={sleep}
                      onChange={(e) => setSleep(e.target.value)}
                      className="h-9 text-xs mt-1"
                    />{" "}
                  </label>{" "}
                  <div>
                    {" "}
                    <span className="hud-label text-[10px] text-muted-foreground"> Stress level </span>{" "}
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      {" "}
                      {STRESS.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStress(s)}
                          className={`hud-label text-[10px] py-2 rounded border ${stress === s ? "border-primary bg-primary/15 text-primary" : "border-border text-foreground/70 hover:border-primary/40"}`}
                        >
                          {" "}
                          {s}{" "}
                        </button>
                      ))}{" "}
                    </div>{" "}
                  </div>{" "}
                  <Button onClick={logRecovery} className="w-full hud-label text-[10px]">
                    {" "}
                    Save Recovery{" "}
                  </Button>{" "}
                </div>{" "}
              </Panel>{" "}
              <Panel title="Recovery journal score">
                {" "}
                <div className="flex justify-center">
                  {" "}
                  <RingProgress
                    value={recoveryScore}
                    size={160}
                    label={`${recoveryScore}`}
                    sublabel="journal estimate"
                  />{" "}
                </div>{" "}
                <div className="text-center hud-label text-[10px] text-muted-foreground mt-3">
                  {" "}
                  {lastRecovery
                    ? `Last: ${lastRecovery.sleepHours}h sleep · ${lastRecovery.stress} stress`
                    : "No data yet"}{" "}
                </div>{" "}
              </Panel>{" "}
            </div>{" "}
            <Panel title={`Recovery History (${data.recovery.length})`}>
              {" "}
              <ul className="divide-y divide-border max-h-[260px] overflow-y-auto">
                {" "}
                {[...data.recovery].reverse().map((r) => (
                  <li key={r.id} className="py-2 flex justify-between text-xs">
                    {" "}
                    <span className="hud-label text-muted-foreground">{r.date}</span>{" "}
                    <span className="hud-label text-foreground/80">{r.sleepHours}h sleep</span>{" "}
                    <span className="hud-label text-primary">{r.stress}</span>{" "}
                  </li>
                ))}{" "}
                {!data.recovery.length && (
                  <li className="text-xs text-muted-foreground py-4 text-center"> No entries yet. </li>
                )}{" "}
              </ul>{" "}
            </Panel>{" "}
          </>
        )}{" "}
      </div>{" "}
      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        {" "}
        <DialogContent className="hud-card border-primary/40 max-h-[90dvh] overflow-y-auto">
          {" "}
          <DialogHeader>
            {" "}
            <DialogTitle className="hud-label text-primary hud-glow"> Log Workout Session </DialogTitle>{" "}
          </DialogHeader>{" "}
          {legacyError && (
            <p role="alert" className="text-sm text-red-300">
              {" "}
              {legacyError}{" "}
            </p>
          )}{" "}
          <div className="space-y-4">
            {" "}
            <div>
              {" "}
              <span className="hud-label text-[10px] text-muted-foreground">Type</span>{" "}
              <div className="grid grid-cols-3 gap-2 mt-1">
                {" "}
                {WORKOUT_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setWType(t)}
                    className={`hud-label text-[10px] py-2 rounded border ${wType === t ? "border-primary bg-primary/15 text-primary" : "border-border text-foreground/70 hover:border-primary/40"}`}
                  >
                    {" "}
                    {t}{" "}
                  </button>
                ))}{" "}
              </div>{" "}
            </div>{" "}
            <label className="block">
              {" "}
              <span className="hud-label text-[10px] text-muted-foreground"> Duration (minutes) </span>{" "}
              <Input
                type="number"
                value={wDur}
                onChange={(e) => setWDur(e.target.value)}
                className="h-9 text-xs mt-1"
              />{" "}
            </label>{" "}
            <label className="block">
              {" "}
              <span className="hud-label text-[10px] text-muted-foreground">Notes</span>{" "}
              <textarea
                value={wNotes}
                onChange={(e) => setWNotes(e.target.value)}
                rows={3}
                className="w-full bg-transparent border border-border rounded p-2 text-xs mt-1 focus:outline-none focus:border-primary/50"
              />{" "}
            </label>{" "}
          </div>{" "}
          <DialogFooter>
            {" "}
            <Button variant="outline" onClick={() => setLogOpen(false)} className="hud-label text-[10px]">
              {" "}
              Cancel{" "}
            </Button>{" "}
            <Button onClick={submitSession} className="hud-label text-[10px]">
              {" "}
              Confirm{" "}
            </Button>{" "}
          </DialogFooter>{" "}
        </DialogContent>{" "}
      </Dialog>{" "}
    </>
  );
}
const FBTN =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-sky-400/25 bg-sky-400/5 px-3 py-2 text-xs text-sky-100 hover:bg-sky-400/15 focus-visible:ring-2 focus-visible:ring-sky-300 min-h-10";
const FACTIVE = "border-sky-300/70 bg-sky-500/25 shadow-[inset_0_0_18px_#0284c755,0_0_12px_#0284c733]";
const FFIELD = "w-full rounded-lg border border-sky-400/25 bg-[#071522] p-2.5 text-sm text-white mt-1";
const FDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
type FExercise = { name: string; sets: number; reps: string; muscle: string };
const FLIB: Record<WorkoutType, FExercise[]> = {
  Push: [
    { name: "Barbell Bench Press", sets: 4, reps: "6–8", muscle: "Chest" },
    { name: "Incline Dumbbell Press", sets: 3, reps: "8–10", muscle: "Chest" },
    { name: "Shoulder Press", sets: 3, reps: "8–10", muscle: "Shoulders" },
    { name: "Lateral Raises", sets: 3, reps: "12–15", muscle: "Shoulders" },
    { name: "Triceps Pushdown", sets: 3, reps: "10–12", muscle: "Triceps" },
  ],
  Pull: [
    { name: "Lat Pulldown", sets: 3, reps: "8–12", muscle: "Back" },
    { name: "Seated Cable Row", sets: 3, reps: "8–12", muscle: "Back" },
    { name: "Face Pull", sets: 3, reps: "12–15", muscle: "Rear delts" },
    { name: "Dumbbell Curl", sets: 3, reps: "10–12", muscle: "Biceps" },
  ],
  Legs: [
    { name: "Squat", sets: 3, reps: "6–10", muscle: "Quads" },
    { name: "Romanian Deadlift", sets: 3, reps: "8–10", muscle: "Hamstrings" },
    { name: "Leg Curl", sets: 3, reps: "10–12", muscle: "Hamstrings" },
    { name: "Calf Raise", sets: 3, reps: "12–15", muscle: "Calves" },
  ],
  Cardio: [{ name: "Easy walk or cycle", sets: 1, reps: "Choose duration", muscle: "Cardio" }],
  "Full Body": [
    { name: "Goblet Squat", sets: 3, reps: "8–12", muscle: "Quads" },
    { name: "Dumbbell Press", sets: 3, reps: "8–12", muscle: "Chest" },
    { name: "Cable Row", sets: 3, reps: "8–12", muscle: "Back" },
  ],
};
const FMUSCLES: Record<string, string[]> = {
  Push: ["Chest", "Shoulders", "Triceps"],
  Pull: ["Back", "Biceps", "Rear delts"],
  Legs: ["Quads", "Hamstrings", "Glutes", "Calves"],
  Cardio: ["Endurance", "Conditioning"],
  "Full Body": ["Chest", "Back", "Quads"],
  Rest: ["Recovery", "Mobility", "Stretching"],
};
function fdate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function fValidDate(key: string) {
  const d = new Date(key + "T12:00:00");
  return /^\d{4}-\d{2}-\d{2}$/.test(key) && Number.isFinite(d.getTime()) && fdate(d) === key;
}
function fdays(cursor: Date) {
  const d = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - ((cursor.getDay() + 6) % 7));
  return FDAYS.map((_, i) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + i));
}
function MuscleFigure({
  type = "Rest",
  back = false,
  large = false,
}: {
  type?: string;
  back?: boolean;
  large?: boolean;
}) {
  const color = type === "Pull" ? "#2dd4bf" : type === "Legs" ? "#a78bfa" : "#38bdf8";
  const hit = (parts: string[]) => (parts.includes(type) ? color : "#0b263c");
  return (
    <svg
      viewBox="0 0 160 230"
      className={`w-full ${large ? "h-[260px]" : "h-[140px]"}`}
      style={{ filter: "drop-shadow(0 0 3px #0ea5e955)" }}
      role="img"
      aria-label={`${type} muscle focus illustration${back ? ", back view" : ""}`}
    >
      {" "}
      <ellipse cx="80" cy="218" rx="63" ry="9" fill="none" stroke={color} opacity=".25" />{" "}
      <ellipse cx="80" cy="218" rx="50" ry="5" fill="none" stroke={color} opacity=".5" />{" "}
      <g fill="#0d2c45" stroke="#59bbed" strokeWidth=".8" strokeLinejoin="round">
        {" "}
        <path d="M68 12 Q80 4 92 12 L96 26 92 42 86 49 87 58 101 63 112 75 119 101 126 130 129 156 123 160 116 137 108 118 101 98 99 129 97 147 100 168 95 192 91 213 99 219 83 219 80 192 77 166 73 191 71 219 56 219 64 212 60 190 57 166 62 145 60 128 60 98 52 118 45 138 38 160 31 156 35 130 41 103 48 77 59 65 73 58 74 49 68 42 64 26 Z" />{" "}
        <path d="M69 17 Q80 10 91 17 L92 33 86 44 75 44 68 33 Z" />{" "}
        <path d="M73 25 L78 24 M84 24 L89 25 M80 26 L78 33 83 33 M75 38 L86 38" fill="none" />{" "}
        <path d="M72 58 L80 66 87 58 M80 66 V137 M64 119 L80 129 97 119 M62 143 Q80 152 98 143" fill="none" />{" "}
        <path
          d="M58 68 Q65 63 77 68 L77 90 Q64 94 54 83Z"
          fill={hit(back ? ["Pull", "Full Body"] : ["Push", "Full Body"])}
        />{" "}
        <path
          d="M84 68 Q96 63 103 71 L107 83 Q96 94 83 90Z"
          fill={hit(back ? ["Pull", "Full Body"] : ["Push", "Full Body"])}
        />{" "}
        <path d="M50 76 Q52 66 61 67 L54 86 44 94Z M105 68 Q116 75 116 95 L106 86Z" fill={hit(["Push", "Full Body"])} />{" "}
        <path
          d="M44 96 L53 89 54 108 46 124 39 123Z M107 91 L116 99 122 124 114 123 106 109Z"
          fill={hit(back ? ["Push"] : ["Pull", "Full Body"])}
        />{" "}
        <path
          d="M61 93 L77 95 76 120 66 113Z M83 95 L99 93 94 113 84 120Z"
          fill={hit(back ? ["Pull"] : ["Full Body"])}
        />{" "}
        <path d="M68 123 L77 126 77 139 67 135Z M84 126 L93 123 95 135 84 139Z" />{" "}
        <path
          d="M62 148 L77 151 75 175 69 191 60 177Z M83 151 L98 148 100 177 91 191 85 175Z"
          fill={hit(["Legs", "Full Body"])}
        />{" "}
        <path d="M63 188 L72 190 70 209 65 208Z M90 190 L96 188 93 209 88 208Z" fill={hit(["Legs", "Cardio"])} />{" "}
        <path d="M36 134 L43 131 39 150 34 154 M118 132 L125 135 128 154 123 151" />{" "}
        <path
          d="M65 74 L75 79 M86 79 L98 74 M67 101 L74 103 M86 103 L94 101 M68 108 L75 110 M85 110 L93 108"
          fill="none"
          stroke="#80d7ff"
          opacity=".5"
        />{" "}
      </g>{" "}
      <path
        d="M23 65 H38 M122 65 H137 M23 65 V196 H42 M137 65 V196 H119"
        stroke={color}
        opacity=".15"
        fill="none"
      />{" "}
    </svg>
  );
}
function FitnessPage() {
  const { data, mutate } = useEvolutionData();
  const [tab, setTab] = useState("Plan"),
    [cursor, setCursor] = useState(() => new Date()),
    [selected, setSelected] = useState(() => (new Date().getDay() + 6) % 7),
    [focus, setFocus] = useState("Weight Training"),
    [secondary, setSecondary] = useState(false),
    [libType, setLibType] = useState<WorkoutType>("Push"),
    [query, setQuery] = useState("");
  const [slot, setSlot] = useState<TrainingSlot | null>(null),
    [baseline, setBaseline] = useState<TrainingSlot | null>(null),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [deleteId, setDeleteId] = useState<string | null>(null);
  const [session, setSession] = useState<{
    date: string;
    type: WorkoutType;
    duration: string;
    notes: string;
    checks: string[];
    exercises: FExercise[];
  } | null>(null);
  const [ownerEpoch, setOwnerEpoch] = useState(0);
  useEffect(() => {
    const reset = () => {
      setSlot(null);
      setBaseline(null);
      setSession(null);
      setDeleteId(null);
      setError("");
      setMessage("");
      setQuery("");
      setFocus("Weight Training");
      setOwnerEpoch((v) => v + 1);
    };
    window.addEventListener("evolution:owner-changing", reset);
    return () => window.removeEventListener("evolution:owner-changing", reset);
  }, []);
  const days = fdays(cursor),
    date = fdate(days[selected]),
    schedule = data.trainingSchedule ?? [],
    daySlots = schedule.filter((s) => s.dayOfWeek === selected).sort((a, b) => a.time.localeCompare(b.time)),
    type: WorkoutType | "Rest" = daySlots.length ? daySlots[0].type : "Rest",
    exercises = type === "Rest" ? [] : FLIB[type];
  const range = days.map(fdate),
    weekCount = workoutCount(data.fitness, data.workouts, (d) => range.includes(d)),
    duration = data.workouts.filter((w) => range.includes(w.date)).reduce((n, w) => n + w.durationMin, 0),
    weights = data.weightTracker?.weights ?? [],
    latestWeight = [...weights].sort((a, b) => a.date.localeCompare(b.date)).at(-1);
  const createSlot = (t: WorkoutType = "Push") => {
    setError("");
    setBaseline(null);
    setSlot({ id: uid(), dayOfWeek: selected, time: "07:00", endTime: "08:00", title: `${t} day`, type: t });
  };
  const saveSlot = () => {
    if (!slot) return;
    if (
      !slot.title.trim() ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(slot.time) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(slot.endTime) ||
      slot.endTime <= slot.time
    ) {
      setError("Add a title and an end time after the start time.");
      return;
    }
    let saved = false;
    mutate((prev) => {
      const existing = prev.trainingSchedule ?? [];
      if (baseline && !existing.some((s) => s.id === slot.id)) return {};
      saved = true;
      return {
        trainingSchedule: baseline
          ? existing.map((s) =>
              s.id === slot.id
                ? {
                    ...s,
                    ...Object.fromEntries(
                      Object.entries(slot).filter(([k, v]) => v !== baseline[k as keyof TrainingSlot]),
                    ),
                    title: slot.title !== baseline.title ? slot.title.trim() : s.title,
                  }
                : s,
            )
          : [...existing, { ...slot, title: slot.title.trim() }],
      };
    });
    if (saved) {
      setSlot(null);
      setMessage("Weekly session saved.");
    } else setError("This session was removed elsewhere. Close and add a new one.");
  };
  const begin = (t: WorkoutType = type === "Rest" ? "Full Body" : type) => {
    setError("");
    setSession({ date, type: t, duration: "60", notes: "", checks: [], exercises: FLIB[t].map((e) => ({ ...e })) });
  };
  const saveSession = () => {
    if (!session) return;
    const n = Number(session.duration);
    if (!Number.isFinite(n) || n < 1 || n > 1440 || !fValidDate(session.date)) {
      setError("Enter a valid date and duration between 1 and 1,440 minutes.");
      return;
    }
    if (session.exercises.some((e) => !Number.isInteger(e.sets) || e.sets < 1 || e.sets > 50 || !e.reps.trim())) {
      setError("Use whole-number sets from 1 to 50 and enter reps for each exercise.");
      return;
    }
    const checked = session.exercises.filter((e) => session.checks.includes(e.name));
    const notes = [
      session.notes.trim(),
      checked.length
        ? `Exercises marked complete: ${checked.map((e) => `${e.name} (${e.sets} × ${e.reps})`).join("; ")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
    mutate((prev) => ({
      workouts: [...prev.workouts, newLoggedWorkout(uid(), session.date, session.type, n, notes || undefined)],
    }));
    setSession(null);
    setMessage("Workout logged. Your history and totals are updated.");
  };
  const navigateWeek = (n: number) => {
    const d = new Date(cursor);
    d.setDate(d.getDate() + n * 7);
    setCursor(d);
  };
  const focusCopy: Record<string, string> = {
    "Weight Training": "Explore resistance exercises and plan sessions at your own pace.",
    Strength: "Use the library to organize strength-focused sessions. Adjust every example to your ability.",
    Hypertrophy: "Group exercises by muscle focus; the sample sets are editable, not a prescribed program.",
    Endurance: "Plan cardio sessions and track their duration.",
    Athletic: "Build a balanced mix of sessions around your sport.",
    "General Fitness": "Keep a sustainable mix of movement and recovery.",
  };
  return (
    <ModuleLayout number="03" title="Fitness" subtitle="Train. Improve. Evolve." icon={Dumbbell}>
      {" "}
      <div data-fitness-plan="v1" className="space-y-4 pb-24 lg:pb-0">
        {" "}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {" "}
          <nav
            aria-label="Fitness sections"
            className="flex flex-wrap gap-1 rounded-xl border border-sky-400/20 bg-[#05111c] p-1"
          >
            {" "}
            {["Plan", "Workouts", "Progress", "Vault", "Sports", "Settings"].map((t) => (
              <button
                key={t}
                aria-pressed={tab === t}
                className={`${FBTN} ${tab === t ? FACTIVE : "border-transparent"}`}
                onClick={() => {
                  setTab(t);
                  setMessage("");
                }}
              >
                {" "}
                {t}{" "}
              </button>
            ))}{" "}
          </nav>{" "}
          <div className="flex items-center gap-2">
            {" "}
            <button className={FBTN} aria-label="Previous training week" onClick={() => navigateWeek(-1)}>
              {" "}
              <ChevronLeft size={15} />{" "}
            </button>{" "}
            <span className="text-sm text-sky-100">
              {" "}
              {days[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} –{" "}
              {days[6].toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}{" "}
            </span>{" "}
            <button className={FBTN} aria-label="Next training week" onClick={() => navigateWeek(1)}>
              {" "}
              <ChevronRight size={15} />{" "}
            </button>{" "}
            <button
              className={FBTN}
              onClick={() => {
                setCursor(new Date());
                setSelected((new Date().getDay() + 6) % 7);
              }}
            >
              {" "}
              Today{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
        {message && (
          <p
            role="status"
            className="rounded-lg border border-emerald-400/20 bg-emerald-400/5 p-3 text-sm text-emerald-200"
          >
            {" "}
            {message}{" "}
          </p>
        )}{" "}
        {tab === "Plan" && (
          <>
            {" "}
            <div className="grid lg:grid-cols-[minmax(0,1fr)_200px] gap-4">
              {" "}
              <section className="rounded-xl border border-sky-400/30 bg-[#04111ddd] p-4 min-w-0">
                {" "}
                <h2 className="text-xl tracking-[.16em] text-white">FITNESS PLAN</h2>{" "}
                <p className="text-[10px] tracking-[.2em] text-sky-300 mt-2"> YOUR WEEKLY TRAINING RHYTHM </p>{" "}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mt-4">
                  {" "}
                  {days.map((d, i) => {
                    const ss = schedule.filter((s) => s.dayOfWeek === i);
                    const t: WorkoutType | "Rest" = ss.length ? ss[0].type : "Rest";
                    const done = workoutCount(data.fitness, data.workouts, (v) => v === fdate(d));
                    return (
                      <button
                        key={i}
                        className={`text-left min-w-0 rounded-xl border p-2 transition ${selected === i ? "border-sky-300 bg-sky-500/10 shadow-[0_0_18px_#0ea5e929]" : "border-sky-800/50 bg-[#04101c] hover:border-sky-400"}`}
                        aria-pressed={selected === i}
                        onClick={() => setSelected(i)}
                      >
                        {" "}
                        <span className="text-[10px] text-slate-400">
                          {" "}
                          {FDAYS[i].toUpperCase()} · {d.getDate()}{" "}
                        </span>{" "}
                        <MuscleFigure type={t} /> <strong className="block text-sm uppercase text-white">{t}</strong>{" "}
                        <div className="mt-2 min-h-[55px] text-[10px] leading-5 text-slate-300">
                          {" "}
                          {FMUSCLES[t].slice(0, 3).map((m) => (
                            <div key={m}>• {m}</div>
                          ))}{" "}
                        </div>{" "}
                        <div className="mt-3 flex justify-between text-[10px] text-sky-300">
                          {" "}
                          <span>{ss.length ? `${ss.length} planned` : "Unscheduled"}</span>{" "}
                          {done > 0 ? <CheckCircle2 size={16} /> : <Circle size={16} />}{" "}
                        </div>{" "}
                      </button>
                    );
                  })}{" "}
                </div>{" "}
                <p className="text-[10px] text-slate-500 mt-3">
                  {" "}
                  Rest means no recurring session is planned. Completion comes from logged workouts, not from selecting
                  a card.{" "}
                </p>{" "}
              </section>{" "}
              <aside className="space-y-3">
                {" "}
                <button className={`${FBTN} ${FACTIVE} w-full py-4 text-sm`} onClick={() => begin()}>
                  {" "}
                  <PlayCircle size={21} /> Begin Workout{" "}
                </button>{" "}
                {[
                  ["Workout Vault", Dumbbell],
                  ["Exercise Library", BookOpen],
                  ["Training Styles", Layers],
                ].map(([label, Icon]) => {
                  const I = Icon as typeof Dumbbell;
                  return (
                    <button
                      key={String(label)}
                      className={`${FBTN} w-full py-3`}
                      onClick={() => {
                        setTab("Vault");
                        setQuery("");
                      }}
                    >
                      {" "}
                      <I size={20} /> {String(label)}{" "}
                    </button>
                  );
                })}{" "}
                <section className="rounded-xl border border-sky-400/25 bg-[#04111d] p-3">
                  {" "}
                  <h3 className="text-xs text-sky-200 mb-3">TRAINING FOCUS</h3>{" "}
                  <div className="grid grid-cols-2 gap-2">
                    {" "}
                    {Object.keys(focusCopy).map((f, i) => (
                      <button
                        key={f}
                        className={`${FBTN} flex-col text-[10px] px-1 ${focus === f ? FACTIVE : ""}`}
                        aria-pressed={focus === f}
                        onClick={() => setFocus(f)}
                      >
                        {" "}
                        {i < 3 ? <Dumbbell size={19} /> : <Heart size={19} />} {f}{" "}
                      </button>
                    ))}{" "}
                  </div>{" "}
                  <p className="text-[10px] text-slate-400 leading-4 mt-3">{focusCopy[focus]}</p>{" "}
                </section>{" "}
              </aside>{" "}
            </div>{" "}
            <div className="grid lg:grid-cols-[1fr_1fr_.9fr] gap-4">
              {" "}
              <Panel title={`${FDAYS[selected]} — ${type}`}>
                {" "}
                <div className="flex justify-between gap-2">
                  {" "}
                  <span className="text-[10px] text-sky-300 tracking-widest"> {FMUSCLES[type].join(" · ")} </span>{" "}
                  <button className={FBTN} onClick={() => createSlot()} aria-label="Plan selected day">
                    {" "}
                    <Plus size={15} />{" "}
                  </button>{" "}
                </div>{" "}
                <MuscleFigure type={type} large />{" "}
                <div className="space-y-2">
                  {" "}
                  {daySlots.map((s) => (
                    <div
                      key={s.id}
                      className="flex justify-between gap-2 items-center border-t border-sky-400/15 pt-2 text-xs"
                    >
                      {" "}
                      <span className="min-w-0 break-words">
                        {" "}
                        {s.time}–{s.endTime} · {s.title}{" "}
                      </span>{" "}
                      <button
                        className={FBTN}
                        aria-label={`Edit ${s.title}`}
                        onClick={() => {
                          setBaseline({ ...s });
                          setSlot({ ...s });
                          setError("");
                        }}
                      >
                        {" "}
                        <Pencil size={13} />{" "}
                      </button>{" "}
                      <button className={FBTN} aria-label={`Remove ${s.title}`} onClick={() => setDeleteId(s.id)}>
                        {" "}
                        <Trash2 size={13} />{" "}
                      </button>{" "}
                    </div>
                  ))}{" "}
                  {!daySlots.length && (
                    <button className={`${FBTN} w-full`} onClick={() => createSlot()}>
                      {" "}
                      Plan this day{" "}
                    </button>
                  )}{" "}
                </div>{" "}
              </Panel>{" "}
              <Panel title="Workout outline">
                {" "}
                <p className="text-[10px] text-slate-400 mb-3">
                  {" "}
                  {exercises.length
                    ? "Illustrative template. Adjust sets and reps when you begin; nothing is logged automatically."
                    : "Your recovery day. Plan a session or choose a template from the vault."}{" "}
                </p>{" "}
                <div className="space-y-2">
                  {" "}
                  {exercises.map((e, i) => (
                    <div
                      key={e.name}
                      className="flex items-center gap-3 p-3 rounded-lg border border-sky-700/30 bg-sky-500/5"
                    >
                      {" "}
                      <span className="text-sky-400 text-xs">{i + 1}</span>{" "}
                      <Dumbbell size={22} className="text-sky-500 shrink-0" />{" "}
                      <div className="flex-1 min-w-0">
                        {" "}
                        <div className="text-xs text-white">{e.name}</div>{" "}
                        <div className="text-[10px] text-slate-400 mt-1">
                          {" "}
                          {e.sets} × {e.reps} · {e.muscle}{" "}
                        </div>{" "}
                      </div>{" "}
                    </div>
                  ))}{" "}
                </div>{" "}
                <button className={`${FBTN} w-full mt-4`} onClick={() => setTab("Vault")}>
                  {" "}
                  Browse workout vault{" "}
                </button>{" "}
              </Panel>{" "}
              <Panel title="Muscle focus">
                {" "}
                <div className="flex gap-2 mb-1">
                  {" "}
                  {[false, true].map((v) => (
                    <button
                      key={String(v)}
                      className={`${FBTN} flex-1 ${secondary === v ? FACTIVE : ""}`}
                      aria-pressed={secondary === v}
                      onClick={() => setSecondary(v)}
                    >
                      {" "}
                      {v ? "Secondary" : "Primary"}{" "}
                    </button>
                  ))}{" "}
                </div>{" "}
                <MuscleFigure type={type} back={secondary} large />{" "}
                <div className="flex flex-wrap gap-2">
                  {" "}
                  {(secondary
                    ? type === "Push"
                      ? ["Triceps", "Front delts"]
                      : type === "Pull"
                        ? ["Biceps", "Rear delts"]
                        : ["Core", "Stabilizers"]
                    : FMUSCLES[type]
                  ).map((m) => (
                    <span
                      key={m}
                      className="rounded border border-sky-500/25 bg-sky-500/10 px-2 py-1 text-[10px] text-sky-200"
                    >
                      {" "}
                      {m}{" "}
                    </span>
                  ))}{" "}
                </div>{" "}
                <p className="text-[9px] text-slate-500 mt-2">
                  {" "}
                  Stylized training illustration, not an anatomical assessment.{" "}
                </p>{" "}
              </Panel>{" "}
            </div>{" "}
            <div className="grid md:grid-cols-3 gap-4">
              {" "}
              <Panel title="Weekly progress">
                {" "}
                <div className="text-2xl text-sky-300">
                  {" "}
                  {weekCount} <span className="text-xs text-slate-400"> sessions</span>{" "}
                </div>{" "}
                <BarChart
                  data={range.map((k) => workoutCount(data.fitness, data.workouts, (v) => v === k))}
                  labels={FDAYS}
                  height={130}
                />{" "}
              </Panel>{" "}
              <Panel title="Training activity">
                {" "}
                <div className="grid grid-cols-2 gap-4">
                  {" "}
                  <div>
                    {" "}
                    <span className="text-2xl text-sky-300">{duration}</span>{" "}
                    <p className="text-xs text-slate-400">Logged minutes this week</p>{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <span className="text-2xl text-teal-300">{schedule.length}</span>{" "}
                    <p className="text-xs text-slate-400">Recurring sessions</p>{" "}
                  </div>{" "}
                </div>{" "}
                <p className="text-xs text-slate-500 mt-6">
                  {" "}
                  Volume and intensity are unavailable without set weights and RPE logs. No estimates are
                  substituted.{" "}
                </p>{" "}
              </Panel>{" "}
              <Panel title="Body composition">
                {" "}
                <div className="flex items-center gap-3">
                  {" "}
                  <div className="w-20">
                    {" "}
                    <MuscleFigure />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <p className="text-xs text-slate-400">Latest logged weight</p>{" "}
                    <p className="text-2xl text-sky-200"> {latestWeight ? `${latestWeight.lbs} lb` : "—"} </p>{" "}
                    <p className="text-[10px] text-slate-500"> {latestWeight?.date ?? "Log weight in Nutrition"} </p>{" "}
                    <p className="text-xs text-slate-500 mt-3">
                      {" "}
                      Body fat · Not recorded <br /> Muscle mass · Not recorded{" "}
                    </p>{" "}
                    <Link to="/nutrition" className="text-xs text-sky-300 underline mt-2 inline-block">
                      {" "}
                      Open weight tracker{" "}
                    </Link>{" "}
                  </div>{" "}
                </div>{" "}
              </Panel>{" "}
            </div>{" "}
          </>
        )}{" "}
        {tab === "Vault" && (
          <section className="space-y-4">
            {" "}
            <div className="flex flex-wrap gap-2">
              {" "}
              {WORKOUT_TYPES.map((t) => (
                <button key={t} className={`${FBTN} ${libType === t ? FACTIVE : ""}`} onClick={() => setLibType(t)}>
                  {" "}
                  {t}{" "}
                </button>
              ))}{" "}
              <input
                className={`${FFIELD} sm:max-w-xs !mt-0`}
                aria-label="Search exercises"
                placeholder="Search exercises…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />{" "}
            </div>{" "}
            <div className="grid md:grid-cols-[240px_1fr] gap-4">
              {" "}
              <Panel title={`${libType} template`}>
                {" "}
                <MuscleFigure type={libType} large />{" "}
                <button className={`${FBTN} w-full`} onClick={() => createSlot(libType)}>
                  {" "}
                  Add to weekly plan{" "}
                </button>{" "}
                <button className={`${FBTN} w-full mt-2`} onClick={() => begin(libType)}>
                  {" "}
                  Begin with this template{" "}
                </button>{" "}
              </Panel>{" "}
              <Panel title="Exercise library">
                {" "}
                <p className="text-xs text-slate-400 mb-4">
                  {" "}
                  Examples for organizing your own routine, not a personalized prescription. Edit them before
                  logging.{" "}
                </p>{" "}
                {FLIB[libType]
                  .filter((e) => `${e.name} ${e.muscle}`.toLowerCase().includes(query.toLowerCase()))
                  .map((e) => (
                    <div
                      key={e.name}
                      className="flex items-center justify-between gap-4 border-b border-sky-400/15 py-4"
                    >
                      {" "}
                      <span className="text-sm text-sky-100">
                        {" "}
                        {e.name} <small className="block text-slate-400 mt-1">{e.muscle}</small>{" "}
                      </span>{" "}
                      <span className="text-xs text-slate-300">
                        {" "}
                        {e.sets} × {e.reps}{" "}
                      </span>{" "}
                    </div>
                  ))}{" "}
              </Panel>{" "}
            </div>{" "}
          </section>
        )}{" "}
        {tab === "Sports" && (
          <Panel title="Sports & conditioning">
            {" "}
            <p className="text-sm text-slate-400 mb-4">
              {" "}
              Plan a conditioning session and name it for your sport. It stays in your existing training schedule.{" "}
            </p>{" "}
            <div className="grid sm:grid-cols-3 gap-3">
              {" "}
              {["Running", "Cycling", "Sport practice"].map((s) => (
                <button
                  key={s}
                  className={`${FBTN} flex-col p-6`}
                  onClick={() => {
                    setBaseline(null);
                    setSlot({
                      id: uid(),
                      dayOfWeek: selected,
                      time: "07:00",
                      endTime: "08:00",
                      title: s,
                      type: "Cardio",
                    });
                  }}
                >
                  {" "}
                  <Activity size={28} /> {s} <span className="text-[10px]">Plan session</span>{" "}
                </button>
              ))}{" "}
            </div>{" "}
          </Panel>
        )}{" "}
        {["Workouts", "Progress", "Settings"].includes(tab) && <LegacyFitness key={ownerEpoch} section={tab} />}{" "}
        <Dialog
          open={!!slot}
          onOpenChange={(v) => {
            if (!v) {
              setSlot(null);
              setError("");
            }
          }}
        >
          {" "}
          <DialogContent className="max-h-[90dvh] overflow-y-auto bg-[#04111d] border-sky-400/30">
            {" "}
            <DialogHeader>
              {" "}
              <DialogTitle> {baseline ? "Edit weekly session" : "Plan a weekly session"} </DialogTitle>{" "}
              <DialogDescription>
                {" "}
                Recurring schedule only. This does not log a completed workout.{" "}
              </DialogDescription>{" "}
            </DialogHeader>{" "}
            {slot && (
              <div className="space-y-3">
                {" "}
                <label className="block text-xs">
                  {" "}
                  Session title{" "}
                  <input
                    className={FFIELD}
                    value={slot.title}
                    onChange={(e) => setSlot({ ...slot, title: e.target.value })}
                  />{" "}
                </label>{" "}
                <div className="grid grid-cols-2 gap-3">
                  {" "}
                  <label className="text-xs">
                    {" "}
                    Day{" "}
                    <select
                      className={FFIELD}
                      value={slot.dayOfWeek}
                      onChange={(e) => setSlot({ ...slot, dayOfWeek: Number(e.target.value) })}
                    >
                      {" "}
                      {FDAYS.map((d, i) => (
                        <option value={i} key={d}>
                          {" "}
                          {d}{" "}
                        </option>
                      ))}{" "}
                    </select>{" "}
                  </label>{" "}
                  <label className="text-xs">
                    {" "}
                    Workout type{" "}
                    <select
                      className={FFIELD}
                      value={slot.type}
                      onChange={(e) => setSlot({ ...slot, type: e.target.value as WorkoutType })}
                    >
                      {" "}
                      {WORKOUT_TYPES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}{" "}
                    </select>{" "}
                  </label>{" "}
                  <label className="text-xs">
                    {" "}
                    Start{" "}
                    <input
                      className={FFIELD}
                      type="time"
                      value={slot.time}
                      onChange={(e) => setSlot({ ...slot, time: e.target.value })}
                    />{" "}
                  </label>{" "}
                  <label className="text-xs">
                    {" "}
                    End{" "}
                    <input
                      className={FFIELD}
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => setSlot({ ...slot, endTime: e.target.value })}
                    />{" "}
                  </label>{" "}
                </div>{" "}
                {error && (
                  <p role="alert" className="text-sm text-red-300">
                    {" "}
                    {error}{" "}
                  </p>
                )}{" "}
                <div className="flex justify-end gap-2">
                  {" "}
                  <button className={FBTN} onClick={() => setSlot(null)}>
                    {" "}
                    Cancel{" "}
                  </button>{" "}
                  <button className={`${FBTN} ${FACTIVE}`} onClick={saveSlot}>
                    {" "}
                    Save session{" "}
                  </button>{" "}
                </div>{" "}
              </div>
            )}{" "}
          </DialogContent>{" "}
        </Dialog>{" "}
        <Dialog
          open={!!session}
          onOpenChange={(v) => {
            if (!v) setSession(null);
          }}
        >
          {" "}
          <DialogContent className="max-h-[90dvh] overflow-y-auto bg-[#04111d] border-sky-400/30 sm:max-w-xl">
            {" "}
            <DialogHeader>
              {" "}
              <DialogTitle>{session?.type} workout</DialogTitle>{" "}
              <DialogDescription>
                {" "}
                Check completed exercises, adjust the template, then explicitly save your session.{" "}
              </DialogDescription>{" "}
            </DialogHeader>{" "}
            {session && (
              <div className="space-y-3">
                {" "}
                <div className="grid grid-cols-2 gap-3">
                  {" "}
                  <label className="text-xs">
                    {" "}
                    Workout date{" "}
                    <input
                      type="date"
                      className={FFIELD}
                      value={session.date}
                      onChange={(e) => setSession({ ...session, date: e.target.value })}
                    />{" "}
                  </label>{" "}
                  <label className="text-xs">
                    {" "}
                    Duration (minutes){" "}
                    <input
                      type="number"
                      min="1"
                      max="1440"
                      className={FFIELD}
                      value={session.duration}
                      onChange={(e) => setSession({ ...session, duration: e.target.value })}
                    />{" "}
                  </label>{" "}
                </div>{" "}
                {session.exercises.map((e, i) => (
                  <div key={i} className="flex flex-wrap gap-2 items-center border-b border-sky-400/15 pb-3">
                    {" "}
                    <input
                      type="checkbox"
                      aria-label={`Complete ${e.name}`}
                      checked={session.checks.includes(e.name)}
                      onChange={(ev) =>
                        setSession({
                          ...session,
                          checks: ev.target.checked
                            ? [...session.checks, e.name]
                            : session.checks.filter((n) => n !== e.name),
                        })
                      }
                    />{" "}
                    <span className="text-sm flex-1 min-w-[140px]">{e.name}</span>{" "}
                    <label className="text-[10px] text-slate-400">
                      {" "}
                      Sets{" "}
                      <input
                        aria-label={`Sets for ${e.name}`}
                        className={`${FFIELD} !w-16`}
                        type="number"
                        min="1"
                        max="50"
                        value={e.sets}
                        onChange={(ev) =>
                          setSession({
                            ...session,
                            exercises: session.exercises.map((x, j) =>
                              j === i ? { ...x, sets: Math.max(1, Math.min(50, Number(ev.target.value) || 1)) } : x,
                            ),
                          })
                        }
                      />{" "}
                    </label>{" "}
                    <label className="text-[10px] text-slate-400">
                      {" "}
                      Reps{" "}
                      <input
                        aria-label={`Reps for ${e.name}`}
                        className={`${FFIELD} !w-24`}
                        value={e.reps}
                        onChange={(ev) =>
                          setSession({
                            ...session,
                            exercises: session.exercises.map((x, j) => (j === i ? { ...x, reps: ev.target.value } : x)),
                          })
                        }
                      />{" "}
                    </label>{" "}
                  </div>
                ))}{" "}
                <label className="block text-xs">
                  {" "}
                  Workout notes{" "}
                  <textarea
                    className={FFIELD}
                    rows={3}
                    value={session.notes}
                    onChange={(e) => setSession({ ...session, notes: e.target.value })}
                  />{" "}
                </label>{" "}
                {error && (
                  <p role="alert" className="text-sm text-red-300">
                    {" "}
                    {error}{" "}
                  </p>
                )}{" "}
                <div className="flex justify-end gap-2">
                  {" "}
                  <button className={FBTN} onClick={() => setSession(null)}>
                    {" "}
                    Cancel{" "}
                  </button>{" "}
                  <button className={`${FBTN} ${FACTIVE}`} onClick={saveSession}>
                    {" "}
                    Save completed workout{" "}
                  </button>{" "}
                </div>{" "}
              </div>
            )}{" "}
          </DialogContent>{" "}
        </Dialog>{" "}
        <Dialog
          open={!!deleteId}
          onOpenChange={(v) => {
            if (!v) setDeleteId(null);
          }}
        >
          {" "}
          <DialogContent>
            {" "}
            <DialogHeader>
              {" "}
              <DialogTitle>Remove this planned session?</DialogTitle>{" "}
              <DialogDescription>
                {" "}
                Your completed workouts and calendar events will stay intact.{" "}
              </DialogDescription>{" "}
            </DialogHeader>{" "}
            <DialogFooter>
              {" "}
              <button className={FBTN} onClick={() => setDeleteId(null)}>
                {" "}
                Cancel{" "}
              </button>{" "}
              <button
                className={FBTN}
                onClick={() => {
                  mutate((prev) => ({
                    trainingSchedule: (prev.trainingSchedule ?? []).filter((s) => s.id !== deleteId),
                  }));
                  setDeleteId(null);
                }}
              >
                {" "}
                Remove session{" "}
              </button>{" "}
            </DialogFooter>{" "}
          </DialogContent>{" "}
        </Dialog>{" "}
      </div>{" "}
    </ModuleLayout>
  );
}
