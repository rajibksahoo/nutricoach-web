"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, Pencil } from "lucide-react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";
import type { ApiEnvelope, Exercise } from "@/lib/library-types";

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Exercise | null>(null);
  const [showForm, setShowForm] = useState(false);

  function load() {
    setLoading(true);
    api
      .get<ApiEnvelope<Exercise[]>>("/api/v1/library/exercises")
      .then((r) => setExercises(r.data.data))
      .catch(() => toast.error("Failed to load exercises"))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function handleDelete(id: string) {
    if (!confirm("Delete this exercise?")) return;
    api
      .delete(`/api/v1/library/exercises/${id}`)
      .then(() => {
        toast.success("Exercise deleted");
        load();
      })
      .catch(() => toast.error("Failed to delete"));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">
          Reusable exercises you can drop into any workout section.
        </p>
        <Button size="sm" onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-1" /> New exercise
        </Button>
      </div>

      {showForm && (
        <ExerciseForm
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); load(); }}
        />
      )}

      {loading ? (
        <div className="py-12 flex justify-center"><Spinner /></div>
      ) : exercises.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-slate-500">
            No exercises yet. Create your first one above.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercises.map((ex) => (
            <Card key={ex.id}>
              <CardHeader className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-900">{ex.name}</h3>
                  {ex.muscleGroup && <p className="text-xs text-slate-500 mt-0.5">{ex.muscleGroup}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => { setEditing(ex); setShowForm(true); }}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ex.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 space-y-1">
                {ex.equipment && <div><span className="text-slate-400">Equipment:</span> {ex.equipment}</div>}
                {ex.description && <p className="line-clamp-3">{ex.description}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ExerciseForm({
  initial,
  onClose,
  onSaved,
}: {
  initial: Exercise | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    muscleGroup: initial?.muscleGroup ?? "",
    equipment: initial?.equipment ?? "",
    videoUrl: initial?.videoUrl ?? "",
    description: initial?.description ?? "",
  });
  const [saving, setSaving] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");
    setSaving(true);
    const req = initial
      ? api.put(`/api/v1/library/exercises/${initial.id}`, form)
      : api.post("/api/v1/library/exercises", form);
    req
      .then(() => {
        toast.success(initial ? "Exercise updated" : "Exercise created");
        onSaved();
      })
      .catch((err) =>
        toast.error(err.response?.data?.message ?? "Failed to save exercise")
      )
      .finally(() => setSaving(false));
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <h3 className="font-semibold text-slate-900">
          {initial ? "Edit exercise" : "New exercise"}
        </h3>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-3">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Barbell Squat"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Muscle group"
              value={form.muscleGroup}
              onChange={(e) => setForm({ ...form, muscleGroup: e.target.value })}
              placeholder="Quads, Back…"
            />
            <Input
              label="Equipment"
              value={form.equipment}
              onChange={(e) => setForm({ ...form, equipment: e.target.value })}
              placeholder="Barbell, Dumbbell…"
            />
          </div>
          <Input
            label="Video URL"
            value={form.videoUrl}
            onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
            placeholder="https://…"
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" loading={saving}>
              {initial ? "Save changes" : "Create"}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
