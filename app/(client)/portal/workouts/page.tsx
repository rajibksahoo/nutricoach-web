"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Dumbbell, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import { listUpcomingWorkouts, completeWorkout, type ClientScheduledWorkout } from "@/lib/client-workouts-api";

function dateLabel(iso: string): string {
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowIso = tomorrow.toISOString().slice(0, 10);
  if (iso === todayIso) return "Today";
  if (iso === tomorrowIso) return "Tomorrow";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" });
}

export default function ClientWorkoutsPage() {
  const [workouts, setWorkouts] = useState<ClientScheduledWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    listUpcomingWorkouts()
      .then(setWorkouts)
      .catch(() => toast.error("Failed to load workouts"))
      .finally(() => setLoading(false));
  }, []);

  // Optimistic mark-done with rollback, matching the coach-side TrainingTab pattern.
  async function markDone(w: ClientScheduledWorkout) {
    const key = `${w.workoutId}-${w.date}`;
    const matches = (x: ClientScheduledWorkout) => x.workoutId === w.workoutId && x.date === w.date;
    setSaving(key);
    setWorkouts((prev) => prev.map((x) => (matches(x) ? { ...x, completed: true } : x)));
    try {
      await completeWorkout(w.workoutId, w.date);
      toast.success("Nice work — logged!");
    } catch {
      setWorkouts((prev) => prev.map((x) => (matches(x) ? { ...x, completed: false } : x)));
      toast.error("Could not save that. Try again.");
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner className="w-8 h-8" /></div>;
  }

  // Group by date, preserving the server's ascending order.
  const groups: { date: string; items: ClientScheduledWorkout[] }[] = [];
  for (const w of workouts) {
    const last = groups[groups.length - 1];
    if (last && last.date === w.date) last.items.push(w);
    else groups.push({ date: w.date, items: [w] });
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-slate-900">Workouts</h1>

      {workouts.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Dumbbell className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No upcoming workouts. Your coach will assign a program soon.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <div key={g.date} className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{dateLabel(g.date)}</p>
              <div className="space-y-3">
                {g.items.map((w, i) => (
                  <Card key={`${w.workoutId}-${i}`} className={w.completed ? "border-teal-200 bg-teal-50/30" : undefined}>
                    <CardContent className="py-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${w.completed ? "bg-teal-100" : "bg-indigo-50"}`}>
                          {w.completed
                            ? <Check className="w-4 h-4 text-teal-600" />
                            : <Dumbbell className="w-4 h-4 text-indigo-600" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900 truncate">{w.workoutName}</p>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">
                            {w.programName} · {w.exerciseCount} exercise{w.exerciseCount !== 1 ? "s" : ""}
                          </p>
                        </div>
                        {w.completed ? (
                          <span className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-100 rounded-full px-2.5 py-1">
                            <Check className="w-3 h-3" />Done
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => markDone(w)}
                            disabled={saving === `${w.workoutId}-${w.date}`}
                            className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-white bg-indigo-600 rounded-full px-3 py-1.5 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Check className="w-3 h-3" />
                            {saving === `${w.workoutId}-${w.date}` ? "Saving…" : "Mark done"}
                          </button>
                        )}
                      </div>
                      {w.exercises.length > 0 && (
                        <ul className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
                          {w.exercises.map((ex, j) => (
                            <li key={j} className="flex items-center gap-3 px-3 py-2">
                              <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 rounded px-1.5 py-0.5 min-w-[28px] text-center shrink-0">
                                {ex.sets ? `${ex.sets}x` : "•"}
                              </span>
                              <span className="text-sm text-slate-700 flex-1 min-w-0 truncate">{ex.name}</span>
                              <span className="text-xs text-slate-400 shrink-0">{ex.target}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
