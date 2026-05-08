"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";
import type {
  ApiEnvelope,
  Exercise,
  Workout,
  WorkoutSection,
  WorkoutSectionType,
} from "@/lib/library-types";

const SECTION_TYPE_LABEL: Record<WorkoutSectionType, string> = {
  WARM_UP: "Warm up",
  MAIN: "Main",
  COOL_DOWN: "Cool down",
};

const SECTION_TYPE_COLOR: Record<WorkoutSectionType, string> = {
  WARM_UP: "bg-amber-50 text-amber-700 border-amber-200",
  MAIN: "bg-indigo-50 text-indigo-700 border-indigo-200",
  COOL_DOWN: "bg-sky-50 text-sky-700 border-sky-200",
};

export default function WorkoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [attaching, setAttaching] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<ApiEnvelope<Workout>>(`/api/v1/library/workouts/${id}`)
      .then((r) => setWorkout(r.data.data))
      .catch(() => toast.error("Failed to load workout"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  function detachSection(assignmentId: string) {
    if (!confirm("Remove this section from the workout?")) return;
    api
      .delete(`/api/v1/library/workouts/${id}/sections/${assignmentId}`)
      .then(() => {
        toast.success("Section removed");
        load();
      })
      .catch(() => toast.error("Failed to remove section"));
  }

  if (loading) return <div className="py-12 flex justify-center"><Spinner /></div>;
  if (!workout) return <p className="text-sm text-slate-500">Workout not found.</p>;

  return (
    <div className="space-y-4">
      <button
        onClick={() => router.push("/library/fitness/workouts")}
        className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to workouts
      </button>

      <div>
        <h2 className="text-xl font-semibold text-slate-900">{workout.name}</h2>
        {workout.description && (
          <p className="text-sm text-slate-500 mt-1">{workout.description}</p>
        )}
        {workout.estimatedDurationMinutes != null && (
          <p className="text-xs text-slate-500 mt-1">
            Estimated: {workout.estimatedDurationMinutes} min
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Sections</h3>
        <Button size="sm" variant="secondary" onClick={() => setAttaching(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add section
        </Button>
      </div>

      {attaching && (
        <AttachSectionPanel
          workoutId={id}
          onClose={() => setAttaching(false)}
          onAttached={() => { setAttaching(false); load(); }}
        />
      )}

      {workout.sections.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-slate-500">
            No sections attached yet. Add a warm-up, main, or cool-down section above.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {workout.sections.map((s) => (
            <SectionCard
              key={s.assignmentId ?? s.id}
              section={s}
              onDetach={() => s.assignmentId && detachSection(s.assignmentId)}
              onChanged={load}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SectionCard({
  section,
  onDetach,
  onChanged,
}: {
  section: WorkoutSection;
  onDetach: () => void;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(true);
  const [adding, setAdding] = useState(false);

  function removeEntry(entryId: string) {
    if (!confirm("Remove this exercise?")) return;
    api
      .delete(`/api/v1/library/workout-sections/${section.id}/exercises/${entryId}`)
      .then(() => { toast.success("Exercise removed"); onChanged(); })
      .catch(() => toast.error("Failed to remove exercise"));
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-2">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 flex-1 text-left"
        >
          {open ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          <span className={`text-xs px-2 py-0.5 rounded border ${SECTION_TYPE_COLOR[section.sectionType]}`}>
            {SECTION_TYPE_LABEL[section.sectionType]}
          </span>
          <span className="font-semibold text-slate-900">{section.name}</span>
          <span className="text-xs text-slate-400 ml-2">
            {section.exercises.length} exercise{section.exercises.length === 1 ? "" : "s"}
          </span>
        </button>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setAdding(!adding)}
            className="text-xs text-indigo-600 hover:text-indigo-700 inline-flex items-center"
          >
            <Plus className="w-3.5 h-3.5 mr-0.5" /> Exercise
          </button>
          <button
            onClick={onDetach}
            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
            title="Remove section from workout"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </CardHeader>

      {open && (
        <CardContent className="space-y-3">
          {adding && (
            <AddExerciseForm
              sectionId={section.id}
              onClose={() => setAdding(false)}
              onAdded={() => { setAdding(false); onChanged(); }}
            />
          )}

          {section.exercises.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No exercises yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {section.exercises.map((e) => (
                <li key={e.id} className="py-2 flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-6">{e.position + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{e.exerciseName}</p>
                    <p className="text-xs text-slate-500">
                      {formatExerciseMetrics(e)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeEntry(e.id)}
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      )}
    </Card>
  );
}

function formatExerciseMetrics(e: {
  sets?: number | null;
  reps?: number | null;
  durationSeconds?: number | null;
  restSeconds?: number | null;
}) {
  const bits: string[] = [];
  if (e.sets && e.reps) bits.push(`${e.sets}×${e.reps}`);
  else if (e.sets) bits.push(`${e.sets} sets`);
  else if (e.reps) bits.push(`${e.reps} reps`);
  if (e.durationSeconds) bits.push(`${e.durationSeconds}s`);
  if (e.restSeconds) bits.push(`rest ${e.restSeconds}s`);
  return bits.length ? bits.join(" · ") : "No metrics set";
}

function AddExerciseForm({
  sectionId,
  onClose,
  onAdded,
}: {
  sectionId: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseId, setExerciseId] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [durationSeconds, setDurationSeconds] = useState("");
  const [restSeconds, setRestSeconds] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<ApiEnvelope<Exercise[]>>("/api/v1/library/exercises")
      .then((r) => setExercises(r.data.data))
      .catch(() => toast.error("Failed to load exercises"));
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!exerciseId) return toast.error("Pick an exercise");
    setSaving(true);
    api
      .post(`/api/v1/library/workout-sections/${sectionId}/exercises`, {
        exerciseId,
        sets: sets ? Number(sets) : null,
        reps: reps ? Number(reps) : null,
        durationSeconds: durationSeconds ? Number(durationSeconds) : null,
        restSeconds: restSeconds ? Number(restSeconds) : null,
      })
      .then(() => { toast.success("Exercise added"); onAdded(); })
      .catch((err) =>
        toast.error(err.response?.data?.message ?? "Failed to add exercise")
      )
      .finally(() => setSaving(false));
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
      {exercises.length === 0 ? (
        <p className="text-xs text-slate-500">
          No exercises in your library yet.{" "}
          <Link href="/library/fitness/exercises" className="text-indigo-600 underline">
            Create one first
          </Link>.
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Exercise</label>
          <select
            value={exerciseId}
            onChange={(e) => setExerciseId(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="">Select an exercise…</option>
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Input label="Sets" type="number" min={1} value={sets} onChange={(e) => setSets(e.target.value)} />
        <Input label="Reps" type="number" min={1} value={reps} onChange={(e) => setReps(e.target.value)} />
        <Input label="Duration (s)" type="number" min={1} value={durationSeconds} onChange={(e) => setDurationSeconds(e.target.value)} />
        <Input label="Rest (s)" type="number" min={0} value={restSeconds} onChange={(e) => setRestSeconds(e.target.value)} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm" loading={saving} disabled={!exercises.length}>Add</Button>
        <Button type="button" size="sm" variant="secondary" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  );
}

function AttachSectionPanel({
  workoutId,
  onClose,
  onAttached,
}: {
  workoutId: string;
  onClose: () => void;
  onAttached: () => void;
}) {
  const [sections, setSections] = useState<WorkoutSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const loadSections = useCallback(() => {
    setLoading(true);
    api.get<ApiEnvelope<WorkoutSection[]>>("/api/v1/library/workout-sections")
      .then((r) => setSections(r.data.data))
      .catch(() => toast.error("Failed to load sections"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadSections(); }, [loadSections]);

  function attach(sectionId: string) {
    api
      .post(`/api/v1/library/workouts/${workoutId}/sections`, { sectionId })
      .then(() => { toast.success("Section attached"); onAttached(); })
      .catch((err) =>
        toast.error(err.response?.data?.message ?? "Failed to attach section")
      );
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <h4 className="font-semibold text-slate-900 text-sm">Attach a section</h4>
        <button
          onClick={() => setCreating(!creating)}
          className="text-xs text-indigo-600 hover:text-indigo-700 inline-flex items-center"
        >
          <Plus className="w-3.5 h-3.5 mr-0.5" /> New section
        </button>
      </CardHeader>
      <CardContent className="space-y-3">
        {creating && (
          <NewSectionForm
            onClose={() => setCreating(false)}
            onCreated={() => { setCreating(false); loadSections(); }}
          />
        )}

        {loading ? (
          <div className="py-4 flex justify-center"><Spinner /></div>
        ) : sections.length === 0 ? (
          <p className="text-sm text-slate-500">No sections available. Create one above.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {sections.map((s) => (
              <li key={s.id} className="py-2 flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded border ${SECTION_TYPE_COLOR[s.sectionType]}`}>
                  {SECTION_TYPE_LABEL[s.sectionType]}
                </span>
                <span className="flex-1 text-sm text-slate-900">{s.name}</span>
                <Button size="sm" variant="secondary" onClick={() => attach(s.id)}>Attach</Button>
              </li>
            ))}
          </ul>
        )}

        <div className="pt-1">
          <Button type="button" size="sm" variant="ghost" onClick={onClose}>Done</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function NewSectionForm({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [sectionType, setSectionType] = useState<WorkoutSectionType>("MAIN");
  const [saving, setSaving] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name is required");
    setSaving(true);
    api
      .post("/api/v1/library/workout-sections", { name, sectionType })
      .then(() => { toast.success("Section created"); onCreated(); })
      .catch((err) =>
        toast.error(err.response?.data?.message ?? "Failed to create section")
      )
      .finally(() => setSaving(false));
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
      <Input
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Leg-day warm up"
        required
      />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Type</label>
        <select
          value={sectionType}
          onChange={(e) => setSectionType(e.target.value as WorkoutSectionType)}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="WARM_UP">Warm up</option>
          <option value="MAIN">Main</option>
          <option value="COOL_DOWN">Cool down</option>
        </select>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" loading={saving}>Create</Button>
        <Button type="button" size="sm" variant="secondary" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  );
}
