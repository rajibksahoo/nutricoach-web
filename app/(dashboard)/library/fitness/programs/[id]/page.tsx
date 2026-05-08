"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, Dumbbell, X } from "lucide-react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import type {
  ApiEnvelope,
  Program,
  ProgramDay,
  WorkoutSummary,
} from "@/lib/library-types";

export default function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [program, setProgram] = useState<Program | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get<ApiEnvelope<Program>>(`/api/v1/library/programs/${id}`),
      api.get<ApiEnvelope<WorkoutSummary[]>>("/api/v1/library/workouts"),
    ])
      .then(([p, w]) => { setProgram(p.data.data); setWorkouts(w.data.data); })
      .catch(() => toast.error("Failed to load program"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  function assignWorkout(dayNumber: number, workoutId: string | null) {
    api
      .put(`/api/v1/library/programs/${id}/days/${dayNumber}`, { workoutId })
      .then(() => { toast.success("Day updated"); setSelectedDay(null); load(); })
      .catch((err) =>
        toast.error(err.response?.data?.message ?? "Failed to update day")
      );
  }

  function clearDay(dayNumber: number) {
    api
      .delete(`/api/v1/library/programs/${id}/days/${dayNumber}`)
      .then(() => { toast.success("Day cleared"); setSelectedDay(null); load(); })
      .catch(() => toast.error("Failed to clear day"));
  }

  if (loading) return <div className="py-12 flex justify-center"><Spinner /></div>;
  if (!program) return <p className="text-sm text-slate-500">Program not found.</p>;

  const dayMap = new Map<number, ProgramDay>();
  program.days.forEach((d) => dayMap.set(d.dayNumber, d));

  return (
    <div className="space-y-4">
      <button
        onClick={() => router.push("/library/fitness/programs")}
        className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to programs
      </button>

      <div>
        <h2 className="text-xl font-semibold text-slate-900">{program.name}</h2>
        {program.description && (
          <p className="text-sm text-slate-500 mt-1">{program.description}</p>
        )}
        <p className="text-xs text-slate-500 mt-1">{program.durationDays} days</p>
      </div>

      <p className="text-xs text-slate-500">
        Click any day to assign a workout. Empty days are rest days.
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-2">
        {Array.from({ length: program.durationDays }, (_, i) => i + 1).map((n) => {
          const d = dayMap.get(n);
          const hasWorkout = !!d?.workoutId;
          return (
            <button
              key={n}
              onClick={() => setSelectedDay(n)}
              className={`p-2 rounded-lg border text-left transition ${
                hasWorkout
                  ? "bg-indigo-50 border-indigo-300 hover:border-indigo-400"
                  : "bg-white border-slate-200 hover:border-slate-400"
              } ${selectedDay === n ? "ring-2 ring-indigo-500" : ""}`}
            >
              <div className="text-[10px] uppercase tracking-wide text-slate-400">Day</div>
              <div className="text-sm font-semibold text-slate-900">{n}</div>
              {hasWorkout ? (
                <div className="text-[11px] text-indigo-700 truncate mt-0.5 flex items-center">
                  <Dumbbell className="w-3 h-3 mr-1 shrink-0" />
                  <span className="truncate">{d?.workoutName}</span>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 mt-0.5">Rest</div>
              )}
            </button>
          );
        })}
      </div>

      {selectedDay !== null && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Day {selectedDay}</h3>
            <button onClick={() => setSelectedDay(null)} className="p-1 hover:bg-slate-100 rounded">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </CardHeader>
          <CardContent className="space-y-2">
            {workouts.length === 0 ? (
              <p className="text-sm text-slate-500">
                You have no workouts yet. Create one in the Workouts tab first.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {workouts.map((w) => {
                  const current = dayMap.get(selectedDay)?.workoutId === w.id;
                  return (
                    <li key={w.id} className="py-2 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{w.name}</p>
                        {w.estimatedDurationMinutes != null && (
                          <p className="text-xs text-slate-500">{w.estimatedDurationMinutes} min</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant={current ? "secondary" : "primary"}
                        onClick={() => assignWorkout(selectedDay, w.id)}
                        disabled={current}
                      >
                        {current ? "Assigned" : "Assign"}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="pt-2 flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => clearDay(selectedDay)}>
                Set as rest day
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
