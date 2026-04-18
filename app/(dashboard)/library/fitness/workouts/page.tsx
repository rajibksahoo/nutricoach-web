"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Plus, Clock, ChevronRight, Trash2 } from "lucide-react";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";
import type { ApiEnvelope, WorkoutSummary } from "@/lib/library-types";

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  function load() {
    setLoading(true);
    api
      .get<ApiEnvelope<WorkoutSummary[]>>("/api/v1/library/workouts")
      .then((r) => setWorkouts(r.data.data))
      .catch(() => toast.error("Failed to load workouts"))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function handleDelete(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this workout?")) return;
    api
      .delete(`/api/v1/library/workouts/${id}`)
      .then(() => {
        toast.success("Workout deleted");
        load();
      })
      .catch(() => toast.error("Failed to delete"));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">
          Build a workout from reusable warm-up, main, and cool-down sections.
        </p>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-1" /> New workout
        </Button>
      </div>

      {showForm && (
        <WorkoutForm
          onClose={() => setShowForm(false)}
          onSaved={(id) => {
            setShowForm(false);
            load();
            if (id) window.location.href = `/library/fitness/workouts/${id}`;
          }}
        />
      )}

      {loading ? (
        <div className="py-12 flex justify-center"><Spinner /></div>
      ) : workouts.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-slate-500">
            No workouts yet. Create your first one above.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {workouts.map((w) => (
            <Link key={w.id} href={`/library/fitness/workouts/${w.id}`}>
              <Card className="hover:border-emerald-300 hover:shadow transition cursor-pointer">
                <CardContent className="flex items-center gap-3 py-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{w.name}</h3>
                    {w.description && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{w.description}</p>
                    )}
                  </div>
                  {w.estimatedDurationMinutes != null && (
                    <div className="flex items-center text-xs text-slate-500 shrink-0">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {w.estimatedDurationMinutes} min
                    </div>
                  )}
                  <button
                    onClick={(e) => handleDelete(w.id, e)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function WorkoutForm({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (id?: string) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [saving, setSaving] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name is required");
    setSaving(true);
    api
      .post<ApiEnvelope<WorkoutSummary>>("/api/v1/library/workouts", {
        name,
        description: description || null,
        estimatedDurationMinutes: duration ? Number(duration) : null,
      })
      .then((r) => {
        toast.success("Workout created");
        onSaved(r.data.data.id);
      })
      .catch((err) =>
        toast.error(err.response?.data?.message ?? "Failed to save workout")
      )
      .finally(() => setSaving(false));
  }

  return (
    <Card className="mb-4">
      <CardContent>
        <form onSubmit={submit} className="space-y-3">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Upper-body Strength Day"
            required
          />
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional"
          />
          <Input
            label="Estimated duration (minutes)"
            type="number"
            min={1}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g. 60"
          />
          <div className="flex gap-2 pt-1">
            <Button type="submit" loading={saving}>Create</Button>
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
