"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  Dumbbell,
  GripVertical,
  Heart,
  MoreHorizontal,
  Move,
  Pencil,
  Plus,
  Search,
  Send,
  Sparkles,
  Tag as TagIcon,
  Target,
  Trash2,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import api from "@/lib/api";
import Spinner from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";
import { getCategory } from "@/lib/library-categories";
import type {
  ApiEnvelope,
  Exercise,
  SectionExerciseEntry,
  Workout,
  WorkoutSection,
  WorkoutSectionType,
} from "@/lib/library-types";

type LeftTab = "exercises" | "sections";

interface SectionPaletteEntry {
  bg: string;
  border: string;
  badgeBg: string;
  text: string;
  Icon: LucideIcon;
  label: string;
}

const SECTION_TYPES: WorkoutSectionType[] = ["WARM_UP", "MAIN", "COOL_DOWN"];

const SECTION_META: Record<WorkoutSectionType, SectionPaletteEntry> = {
  WARM_UP: {
    label: "Warm up",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badgeBg: "bg-amber-500",
    text: "text-amber-800",
    Icon: Heart,
  },
  MAIN: {
    label: "Main",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badgeBg: "bg-emerald-600",
    text: "text-emerald-800",
    Icon: Dumbbell,
  },
  COOL_DOWN: {
    label: "Cool down",
    bg: "bg-sky-50",
    border: "border-sky-200",
    badgeBg: "bg-sky-500",
    text: "text-sky-800",
    Icon: Move,
  },
};

function exerciseTileColor(ex: Exercise): { bg: string; border: string; fg: string } {
  const cat = (ex.category ?? "").toLowerCase();
  switch (cat) {
    case "cardio":     return { bg: "#FEF2F2", border: "#FECACA", fg: "#DC2626" };
    case "mobility":   return { bg: "#F0F9FF", border: "#BAE6FD", fg: "#0284C7" };
    case "plyometric": return { bg: "#FFFBEB", border: "#FDE68A", fg: "#D97706" };
    case "skill":      return { bg: "#F5F3FF", border: "#DDD6FE", fg: "#7C3AED" };
    default:           return { bg: "#ECFDF5", border: "#A7F3D0", fg: "#047857" };
  }
}

function ExerciseThumb({ ex, size = 32 }: { ex: Exercise; size?: number }) {
  const c = exerciseTileColor(ex);
  return (
    <div
      className="flex items-center justify-center rounded-md shrink-0"
      style={{
        width: size,
        height: size,
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.fg,
      }}
    >
      <Dumbbell style={{ width: size * 0.45, height: size * 0.45 }} />
    </div>
  );
}

export default function WorkoutEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [savedSections, setSavedSections] = useState<WorkoutSection[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [leftTab, setLeftTab] = useState<LeftTab>("exercises");
  const [leftQ, setLeftQ] = useState("");
  const [leftCollapsed, setLeftCollapsed] = useState(false);

  const initialName = useRef("");
  const initialDescription = useRef("");

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get<ApiEnvelope<Workout>>(`/api/v1/library/workouts/${id}`),
      api.get<ApiEnvelope<Exercise[]>>("/api/v1/library/exercises"),
      api.get<ApiEnvelope<WorkoutSection[]>>("/api/v1/library/workout-sections"),
    ])
      .then(([w, ex, secs]) => {
        const ws = w.data.data;
        setWorkout(ws);
        setExercises(ex.data.data);
        setSavedSections(secs.data.data);
        setName(ws.name);
        setDescription(ws.description ?? "");
        initialName.current = ws.name;
        initialDescription.current = ws.description ?? "";
      })
      .catch(() => toast.error("Failed to load workout"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // Auto-save name/description on blur
  function persistMeta() {
    if (
      name === initialName.current &&
      description === initialDescription.current
    ) return;
    api
      .put(`/api/v1/library/workouts/${id}`, {
        name: name || initialName.current,
        description: description || null,
        estimatedDurationMinutes: workout?.estimatedDurationMinutes ?? null,
        tags: null,
      })
      .then(() => {
        initialName.current = name;
        initialDescription.current = description;
        toast.success("Saved");
      })
      .catch(() => toast.error("Failed to save"));
  }

  const filteredExercises = useMemo(() => {
    const q = leftQ.trim().toLowerCase();
    if (!q) return exercises;
    return exercises.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        (e.muscleGroup ?? "").toLowerCase().includes(q),
    );
  }, [exercises, leftQ]);

  const filteredSavedSections = useMemo(() => {
    const q = leftQ.trim().toLowerCase();
    if (!q) return savedSections;
    return savedSections.filter((s) => s.name.toLowerCase().includes(q));
  }, [savedSections, leftQ]);

  function attachSection(sectionId: string) {
    api
      .post(`/api/v1/library/workouts/${id}/sections`, { sectionId })
      .then(() => { toast.success("Section attached"); load(); })
      .catch((err) =>
        toast.error(err.response?.data?.message ?? "Failed to attach section"),
      );
  }

  function createNewSection(sectionType: WorkoutSectionType, alsoAttach = true) {
    const label = SECTION_META[sectionType].label;
    return api
      .post<ApiEnvelope<WorkoutSection>>("/api/v1/library/workout-sections", {
        name: label,
        sectionType,
      })
      .then((r) => {
        if (alsoAttach) {
          return api
            .post(`/api/v1/library/workouts/${id}/sections`, {
              sectionId: r.data.data.id,
            })
            .then(() => r.data.data);
        }
        return r.data.data;
      })
      .then((sec) => { toast.success("Section added"); load(); return sec; })
      .catch(() => toast.error("Failed to create section"));
  }

  function detachSection(assignmentId: string) {
    if (!confirm("Remove this section from the workout?")) return;
    api
      .delete(`/api/v1/library/workouts/${id}/sections/${assignmentId}`)
      .then(() => { toast.success("Section removed"); load(); })
      .catch(() => toast.error("Failed to remove section"));
  }

  function renameSection(section: WorkoutSection, name: string, sectionType: WorkoutSectionType) {
    api
      .put(`/api/v1/library/workout-sections/${section.id}`, {
        name,
        sectionType,
        description: section.description ?? null,
      })
      .then(() => { toast.success("Section updated"); load(); })
      .catch(() => toast.error("Failed to update section"));
  }

  function addExercise(sectionId: string, payload: AddExercisePayload) {
    return api
      .post(`/api/v1/library/workout-sections/${sectionId}/exercises`, payload)
      .then(() => { toast.success("Exercise added"); load(); })
      .catch((err) =>
        toast.error(err.response?.data?.message ?? "Failed to add exercise"),
      );
  }

  function removeEntry(sectionId: string, entryId: string) {
    if (!confirm("Remove this exercise?")) return;
    api
      .delete(`/api/v1/library/workout-sections/${sectionId}/exercises/${entryId}`)
      .then(() => { toast.success("Exercise removed"); load(); })
      .catch(() => toast.error("Failed to remove exercise"));
  }

  function patchEntry(sectionId: string, entryId: string, patch: Partial<AddExercisePayload>) {
    return api
      .patch(`/api/v1/library/workout-sections/${sectionId}/exercises/${entryId}`, patch)
      .then(() => load())
      .catch(() => toast.error("Failed to update exercise"));
  }

  function reorderEntries(sectionId: string, orderedIds: string[]) {
    return api
      .put(`/api/v1/library/workout-sections/${sectionId}/exercises/order`, { orderedIds })
      .then(() => load())
      .catch(() => toast.error("Failed to reorder"));
  }

  function reorderSections(orderedAssignmentIds: string[]) {
    return api
      .put(`/api/v1/library/workouts/${id}/sections/order`, { orderedIds: orderedAssignmentIds })
      .then(() => load())
      .catch(() => toast.error("Failed to reorder sections"));
  }

  function quickAddFromLibrary(libExercise: Exercise) {
    const target = workout?.sections[workout.sections.length - 1];
    if (!target) {
      toast("Add a section first");
      return;
    }
    const cat = (libExercise.category ?? "").toLowerCase();
    const isTimed = cat === "cardio" || cat === "mobility";
    addExercise(target.id, {
      exerciseId: libExercise.id,
      sets: isTimed ? 1 : 3,
      reps: isTimed ? null : 10,
      durationSeconds: isTimed ? 45 : null,
      restSeconds: isTimed ? null : 60,
      weight: null,
      notes: null,
    });
  }

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <Spinner />
      </div>
    );
  }
  if (!workout) {
    return <p className="text-sm text-slate-500 p-6">Workout not found.</p>;
  }

  const totalExercises = workout.sections.reduce(
    (sum, s) => sum + (s.exercises?.length ?? 0),
    0,
  );

  return (
    <div className="flex flex-col" style={{ height: "100vh" }}>
      {/* Top bar with back link */}
      <div
        className="flex items-center justify-between border-b border-slate-200 bg-white"
        style={{ padding: "10px 22px" }}
      >
        <button
          type="button"
          onClick={() => router.push("/library/workouts")}
          className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800"
          style={{ fontSize: 12.5, fontWeight: 500 }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to workouts
        </button>
        <div className="flex items-center gap-1.5">
          <IconBtn title="Tags" Icon={TagIcon} onClick={() => toast("Tag browser coming soon")} />
          <IconBtn title="Share" Icon={Send} onClick={() => toast("Share coming soon")} />
          <IconBtn title="More" Icon={MoreHorizontal} onClick={() => toast("More coming soon")} />
        </div>
      </div>

      {/* Two-column body */}
      <div
        className="flex-1 grid overflow-hidden"
        style={{ gridTemplateColumns: leftCollapsed ? "32px 1fr" : "320px 1fr" }}
      >
        {/* ─── Left rail ─────────────────────────────── */}
        {leftCollapsed ? (
          <button
            type="button"
            title="Open library"
            onClick={() => setLeftCollapsed(false)}
            className="border-r border-slate-200 bg-slate-50 flex justify-center"
            style={{ paddingTop: 60 }}
          >
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
        ) : (
          <div className="flex flex-col border-r border-slate-200 overflow-hidden bg-white">
            {/* Tabs */}
            <div style={{ padding: "16px 14px 0" }}>
              <div
                className="flex bg-slate-100 rounded-lg"
                style={{ padding: 3, gap: 1 }}
              >
                {([
                  { k: "exercises" as const, l: "Exercises" },
                  { k: "sections"  as const, l: "Sections" },
                ]).map((t) => {
                  const on = leftTab === t.k;
                  return (
                    <button
                      key={t.k}
                      onClick={() => setLeftTab(t.k)}
                      className={cn(
                        "flex-1 rounded-md transition-all",
                        on
                          ? "bg-emerald-600 text-white"
                          : "text-emerald-700 hover:text-emerald-800",
                      )}
                      style={{
                        padding: "7px 10px",
                        fontSize: 13,
                        fontWeight: on ? 600 : 500,
                      }}
                    >
                      {t.l}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search */}
            <div style={{ padding: "12px 14px 0" }}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  value={leftQ}
                  onChange={(e) => setLeftQ(e.target.value)}
                  placeholder={
                    leftTab === "exercises"
                      ? "Search for your Exercises"
                      : "Search for your Sections"
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  style={{ padding: "7px 11px 7px 30px", fontSize: 12.5 }}
                />
              </div>
            </div>

            {/* List header */}
            <div
              className="flex items-center justify-between"
              style={{ padding: "14px 14px 6px" }}
            >
              <span
                className="text-slate-500 uppercase"
                style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em" }}
              >
                Most recent (
                {leftTab === "exercises"
                  ? filteredExercises.length
                  : filteredSavedSections.length}
                )
              </span>
              <button
                type="button"
                onClick={() => setLeftCollapsed(true)}
                className="text-slate-400 hover:text-slate-700 p-0.5"
                title="Collapse"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Scrollable list */}
            <div
              className="flex-1 overflow-y-auto"
              style={{ padding: "0 8px 14px" }}
            >
              {leftTab === "exercises" ? (
                filteredExercises.length === 0 ? (
                  <EmptyResult />
                ) : (
                  filteredExercises.map((e) => {
                    const c = getCategory(e.category);
                    return (
                      <button
                        key={e.id}
                        onClick={() => quickAddFromLibrary(e)}
                        draggable
                        onDragStart={(ev) => {
                          ev.dataTransfer.setData(
                            "application/x-library-exercise",
                            JSON.stringify({ exerciseId: e.id }),
                          );
                          ev.dataTransfer.effectAllowed = "copy";
                        }}
                        title="Drag onto a section, or click to add to last section"
                        className="w-full flex items-center gap-2.5 rounded-md hover:bg-slate-50 text-left cursor-grab active:cursor-grabbing"
                        style={{ padding: "7px 8px", marginBottom: 1 }}
                      >
                        <ExerciseThumb ex={e} size={32} />
                        <div className="flex-1 min-w-0">
                          <div
                            className="text-slate-900 truncate"
                            style={{ fontSize: 12.5, fontWeight: 500 }}
                          >
                            {e.name}
                          </div>
                          <div
                            className="text-slate-400 truncate"
                            style={{ fontSize: 10.5 }}
                          >
                            {(c?.label ?? "—")} · {e.muscleGroup ?? "—"}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )
              ) : filteredSavedSections.length === 0 ? (
                <EmptyResult />
              ) : (
                filteredSavedSections.map((s) => {
                  const m = SECTION_META[s.sectionType];
                  const M = m.Icon;
                  return (
                    <button
                      key={s.id}
                      onClick={() => attachSection(s.id)}
                      title="Attach to workout"
                      className="w-full text-left bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 rounded-md transition-all"
                      style={{ padding: "10px 11px", marginBottom: 6 }}
                    >
                      <div className="flex items-center gap-1.5" style={{ marginBottom: 2 }}>
                        <M className="w-3 h-3 text-emerald-600" />
                        <span
                          className="text-slate-900"
                          style={{ fontSize: 12.5, fontWeight: 600 }}
                        >
                          {s.name}
                        </span>
                      </div>
                      <div className="text-slate-400" style={{ fontSize: 10.5 }}>
                        {s.exercises?.length ?? 0} exercises · {m.label}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ─── Right canvas ──────────────────────────── */}
        <div className="flex flex-col overflow-hidden bg-white">
          {/* Title + description */}
          <div style={{ padding: "14px 22px 6px" }}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={persistMeta}
              placeholder="Name your workout"
              className="w-full bg-transparent border-0 outline-none text-slate-900"
              style={{
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                padding: "4px 0",
              }}
            />
          </div>
          <div style={{ padding: "0 22px 14px" }}>
            <div
              className="text-slate-500 uppercase"
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: "0.06em",
                marginBottom: 4,
              }}
            >
              Description
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={persistMeta}
              placeholder="Add a description"
              rows={1}
              className="w-full bg-transparent border-0 outline-none text-slate-700 resize-none"
              style={{ fontSize: 13, lineHeight: 1.5, padding: 0 }}
            />
          </div>

          {/* Sections canvas */}
          <div
            className="flex-1 overflow-y-auto flex flex-col"
            style={{ padding: "0 22px 18px", gap: 12 }}
          >
            {workout.sections.length === 0 ? (
              <EmptyCanvas
                onAddSection={() => createNewSection("MAIN")}
              />
            ) : (
              <>
                {workout.sections.map((section, idx) => (
                  <EditorSection
                    key={section.assignmentId ?? section.id}
                    section={section}
                    sectionIndex={idx}
                    allSections={workout.sections}
                    exercises={exercises}
                    onRename={(n, t) => renameSection(section, n, t)}
                    onDetach={() =>
                      section.assignmentId && detachSection(section.assignmentId)
                    }
                    onAddExercise={(payload) => addExercise(section.id, payload)}
                    onRemoveEntry={(eid) => removeEntry(section.id, eid)}
                    onPatchEntry={(eid, patch) => patchEntry(section.id, eid, patch)}
                    onReorderEntries={(orderedIds) => reorderEntries(section.id, orderedIds)}
                    onReorderSections={reorderSections}
                    onDropLibraryExercise={(exerciseId) => {
                      const lib = exercises.find((x) => x.id === exerciseId);
                      if (!lib) return;
                      const c = (lib.category ?? "").toLowerCase();
                      const isTimed = c === "cardio" || c === "mobility";
                      addExercise(section.id, {
                        exerciseId,
                        sets: isTimed ? 1 : 3,
                        reps: isTimed ? null : 10,
                        durationSeconds: isTimed ? 45 : null,
                        restSeconds: isTimed ? null : 60,
                        weight: null,
                        notes: null,
                      });
                    }}
                  />
                ))}
                <SectionAddButton onClick={() => createNewSection("MAIN")} />
              </>
            )}
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between border-t border-slate-200 bg-slate-50"
            style={{ padding: "10px 22px" }}
          >
            <span className="text-slate-500" style={{ fontSize: 11.5 }}>
              {workout.sections.length} sections · {totalExercises} exercises
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toast("AI suggestions coming soon")}
                className="inline-flex items-center gap-1.5 px-3 py-[7px] text-[12.5px] font-semibold rounded-md shadow-sm text-amber-900 border border-amber-500"
                style={{ background: "linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)" }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Suggest with AI
              </button>
              <button
                type="button"
                onClick={() => router.push("/library/workouts")}
                className="bg-white border border-slate-200 text-slate-700 rounded-md hover:bg-slate-50"
                style={{ padding: "7px 14px", fontSize: 12.5, fontWeight: 500 }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────── helpers + sub-components ───────────── */

interface AddExercisePayload {
  exerciseId: string;
  sets: number | null;
  reps: number | null;
  durationSeconds: number | null;
  restSeconds: number | null;
  weight: string | null;
  notes: string | null;
}

function IconBtn({
  Icon,
  title,
  onClick,
}: {
  Icon: LucideIcon;
  title: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}

function EmptyResult() {
  return (
    <div
      className="flex flex-col items-center justify-center text-slate-400"
      style={{ padding: "60px 14px 30px", gap: 10 }}
    >
      <div className="relative" style={{ width: 48, height: 48 }}>
        <div
          className="absolute bg-white border-2 border-slate-200 rounded-md"
          style={{ inset: 6, transform: "rotate(-6deg)" }}
        />
        <div
          className="absolute bg-white border-2 border-slate-300 rounded-md flex items-center justify-center"
          style={{ inset: 0 }}
        >
          <Search className="w-4 h-4 text-slate-400" />
        </div>
      </div>
      <span style={{ fontSize: 12 }}>No result found</span>
    </div>
  );
}

function EmptyCanvas({ onAddSection }: { onAddSection: () => void }) {
  return (
    <div
      className="border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center"
      style={{ padding: "34px 22px", gap: 14 }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="rounded-md border-[1.5px] border-dashed border-slate-300 flex items-center justify-center text-emerald-600"
          style={{ width: 46, height: 36 }}
        >
          <Dumbbell className="w-4 h-4" />
        </div>
        <div className="text-slate-600" style={{ fontSize: 13, lineHeight: 1.4 }}>
          Click an exercise on the left to add,
          <br />
          or start by adding a section.
        </div>
      </div>
      <button
        type="button"
        onClick={onAddSection}
        className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-md"
        style={{ padding: "7px 14px", fontSize: 12.5, fontWeight: 600 }}
      >
        <Plus className="w-3.5 h-3.5" />
        Add Section
      </button>
    </div>
  );
}

function SectionAddButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-2 border-dashed border-slate-200 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50/50 text-slate-400 rounded-xl flex items-center justify-center gap-2 transition-all"
      style={{ padding: 14, fontSize: 12.5, fontWeight: 500 }}
    >
      <Plus className="w-3.5 h-3.5" />
      Add section
    </button>
  );
}

/* ───────────── EditorSection ───────────── */
function EditorSection({
  section,
  sectionIndex,
  allSections,
  exercises,
  onRename,
  onDetach,
  onAddExercise,
  onRemoveEntry,
  onPatchEntry,
  onReorderEntries,
  onReorderSections,
  onDropLibraryExercise,
}: {
  section: WorkoutSection;
  sectionIndex: number;
  allSections: WorkoutSection[];
  exercises: Exercise[];
  onRename: (name: string, type: WorkoutSectionType) => void;
  onDetach: () => void;
  onAddExercise: (payload: AddExercisePayload) => Promise<unknown> | void;
  onRemoveEntry: (entryId: string) => void;
  onPatchEntry: (entryId: string, patch: Partial<AddExercisePayload>) => Promise<unknown> | void;
  onReorderEntries: (orderedIds: string[]) => Promise<unknown> | void;
  onReorderSections: (orderedAssignmentIds: string[]) => Promise<unknown> | void;
  onDropLibraryExercise: (exerciseId: string) => void;
}) {
  const meta = SECTION_META[section.sectionType] ?? SECTION_META.MAIN;
  const Icon = meta.Icon;
  const [editing, setEditing] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [titleDraft, setTitleDraft] = useState(section.name);
  const [adding, setAdding] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  function handleSectionDrop(ev: DragEvent) {
    ev.preventDefault();
    setDragOver(false);
    const lib = ev.dataTransfer.getData("application/x-library-exercise");
    if (lib) {
      try {
        const { exerciseId } = JSON.parse(lib);
        if (exerciseId) onDropLibraryExercise(exerciseId);
      } catch {}
      return;
    }
    const sec = ev.dataTransfer.getData("application/x-workout-section");
    if (sec) {
      try {
        const { assignmentId: dragged } = JSON.parse(sec);
        const target = section.assignmentId;
        if (!dragged || !target || dragged === target) return;
        const ids = allSections.map((s) => s.assignmentId).filter(Boolean) as string[];
        const from = ids.indexOf(dragged);
        const to = ids.indexOf(target);
        if (from < 0 || to < 0) return;
        const next = ids.slice();
        next.splice(from, 1);
        next.splice(to, 0, dragged);
        onReorderSections(next);
      } catch {}
    }
  }

  function handleEntryDropOnRow(targetEntryId: string, ev: DragEvent) {
    ev.preventDefault();
    const raw = ev.dataTransfer.getData("application/x-section-entry");
    if (!raw) return;
    try {
      const { sectionId: srcSection, entryId: dragged } = JSON.parse(raw);
      if (srcSection !== section.id || !dragged || dragged === targetEntryId) return;
      const ids = section.exercises.map((e) => e.id);
      const from = ids.indexOf(dragged);
      const to = ids.indexOf(targetEntryId);
      if (from < 0 || to < 0) return;
      const next = ids.slice();
      next.splice(from, 1);
      next.splice(to, 0, dragged);
      onReorderEntries(next);
    } catch {}
  }

  useEffect(() => setTitleDraft(section.name), [section.name]);

  const totalSets = section.exercises.reduce(
    (a, e) => a + (e.sets ?? 0),
    0,
  );

  function commitTitle() {
    setEditing(false);
    if (titleDraft.trim() && titleDraft !== section.name) {
      onRename(titleDraft.trim(), section.sectionType);
    }
  }

  return (
    <div
      className={cn(
        "bg-white border rounded-xl overflow-hidden shadow-sm transition-colors",
        dragOver ? "border-emerald-400 ring-2 ring-emerald-200" : "border-slate-200",
      )}
      onDragOver={(ev) => {
        if (
          ev.dataTransfer.types.includes("application/x-library-exercise") ||
          ev.dataTransfer.types.includes("application/x-workout-section")
        ) {
          ev.preventDefault();
          ev.dataTransfer.dropEffect = "copy";
          setDragOver(true);
        }
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleSectionDrop}
    >
      {/* Header */}
      <div
        className={cn("flex items-center gap-2.5 border-b", meta.bg, meta.border)}
        style={{ padding: "8px 14px" }}
        draggable
        onDragStart={(ev) => {
          if (!section.assignmentId) { ev.preventDefault(); return; }
          ev.dataTransfer.setData(
            "application/x-workout-section",
            JSON.stringify({ assignmentId: section.assignmentId }),
          );
          ev.dataTransfer.effectAllowed = "move";
        }}
      >
        <GripVertical className={cn("w-3 h-3 opacity-50 cursor-grab", meta.text)} />
        <div
          className={cn(
            "flex items-center justify-center rounded-md text-white shrink-0",
            meta.badgeBg,
          )}
          style={{ width: 24, height: 24 }}
        >
          <Icon className="w-3 h-3" />
        </div>

        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => { if (e.key === "Enter") commitTitle(); }}
              className={cn(
                "bg-white border rounded outline-none",
                meta.text,
                meta.border,
              )}
              style={{
                fontSize: 13.5,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                padding: "2px 7px",
              }}
            />
          ) : (
            <h3
              onDoubleClick={() => setEditing(true)}
              className={cn("m-0 cursor-text", meta.text)}
              style={{
                fontSize: 13.5,
                fontWeight: 600,
                letterSpacing: "-0.01em",
              }}
            >
              {section.name}
            </h3>
          )}
          <div
            className={cn("flex items-center gap-1.5 opacity-80", meta.text)}
            style={{ fontSize: 10 }}
          >
            <select
              value={section.sectionType}
              onChange={(e) =>
                onRename(section.name, e.target.value as WorkoutSectionType)
              }
              className={cn(
                "bg-transparent border-0 outline-none cursor-pointer uppercase",
                meta.text,
              )}
              style={{
                fontSize: 9.5,
                fontWeight: 500,
                letterSpacing: "0.06em",
                padding: 0,
              }}
            >
              {SECTION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {SECTION_META[t].label}
                </option>
              ))}
            </select>
            <span>·</span>
            <span>
              {section.exercises.length} ex · {totalSets} sets
            </span>
          </div>
        </div>

        <button
          type="button"
          title="Rename"
          onClick={() => setEditing(true)}
          className={cn("p-1 rounded hover:bg-white/50", meta.text)}
        >
          <Pencil className="w-3 h-3" />
        </button>
        <button
          type="button"
          title="Collapse"
          onClick={() => setCollapsed((c) => !c)}
          className={cn("p-1 rounded hover:bg-white/50", meta.text)}
        >
          {collapsed ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronUp className="w-3 h-3" />
          )}
        </button>
        <button
          type="button"
          title="Remove section"
          onClick={onDetach}
          className="p-1 rounded text-rose-700 hover:bg-rose-100"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {!collapsed && (
        <>
          {section.exercises.length === 0 && !adding && (
            <div
              className="text-slate-400 text-center"
              style={{ padding: "22px 14px", fontSize: 12 }}
            >
              Click an exercise on the left, or use “Add exercise” below.
            </div>
          )}
          {section.exercises.map((entry) => {
            const lib = exercises.find((x) => x.id === entry.exerciseId);
            return (
              <ExerciseRow
                key={entry.id}
                entry={entry}
                sectionId={section.id}
                lib={lib}
                onRemove={() => onRemoveEntry(entry.id)}
                onPatch={(patch) => onPatchEntry(entry.id, patch)}
                onDropOnRow={(ev) => handleEntryDropOnRow(entry.id, ev)}
              />
            );
          })}

          {adding ? (
            <AddExerciseInline
              exercises={exercises}
              onCancel={() => setAdding(false)}
              onAdd={(payload) => {
                Promise.resolve(onAddExercise(payload)).finally(() => setAdding(false));
              }}
            />
          ) : (
            <div
              className="flex items-center gap-2 bg-slate-50 border-t border-slate-100"
              style={{ padding: "8px 12px" }}
            >
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-md"
                style={{ padding: "5px 10px", fontSize: 12, fontWeight: 600 }}
              >
                <Plus className="w-3 h-3" />
                Add exercise
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ───────────── ExerciseRow (read-only display) ───────────── */
function ExerciseRow({
  entry,
  sectionId,
  lib,
  onRemove,
  onPatch,
  onDropOnRow,
}: {
  entry: SectionExerciseEntry;
  sectionId: string;
  lib?: Exercise;
  onRemove: () => void;
  onPatch: (patch: Partial<AddExercisePayload>) => Promise<unknown> | void;
  onDropOnRow: (ev: DragEvent) => void;
}) {
  const cat = getCategory(lib?.category);
  return (
    <div
      className="flex items-start gap-2.5 bg-white border-t border-slate-100 hover:bg-slate-50 group"
      style={{ padding: "9px 12px" }}
      draggable
      onDragStart={(ev) => {
        ev.dataTransfer.setData(
          "application/x-section-entry",
          JSON.stringify({ sectionId, entryId: entry.id }),
        );
        ev.dataTransfer.effectAllowed = "move";
        ev.stopPropagation();
      }}
      onDragOver={(ev) => {
        if (ev.dataTransfer.types.includes("application/x-section-entry")) {
          ev.preventDefault();
          ev.dataTransfer.dropEffect = "move";
          ev.stopPropagation();
        }
      }}
      onDrop={onDropOnRow}
    >
      <GripVertical className="w-3 h-3 text-slate-300 cursor-grab" style={{ marginTop: 11 }} />
      {lib ? (
        <ExerciseThumb ex={lib} size={36} />
      ) : (
        <div
          className="flex items-center justify-center rounded-md bg-slate-100 text-slate-400 shrink-0"
          style={{ width: 36, height: 36 }}
        >
          <Dumbbell className="w-3.5 h-3.5" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5" style={{ marginBottom: 4 }}>
          <span
            className="text-slate-900"
            style={{ fontSize: 12.5, fontWeight: 500 }}
          >
            {entry.exerciseName}
          </span>
          {cat && (
            <span
              className={cn(
                "rounded text-[10px] inline-flex items-center gap-0.5",
                cat.tint,
                cat.color,
              )}
              style={{ padding: "1px 5px", fontWeight: 500 }}
            >
              <cat.Icon className="w-2.5 h-2.5" />
              {cat.label}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <EditableParamPill
            label="Sets"
            value={entry.sets ?? null}
            onSave={(v) => onPatch({ sets: v as number | null })}
          />
          <EditableParamPill
            label="Reps"
            value={entry.reps ?? null}
            onSave={(v) => onPatch({ reps: v as number | null })}
          />
          <EditableParamPill
            label="Dur"
            value={entry.durationSeconds ?? null}
            suffix="s"
            onSave={(v) => onPatch({ durationSeconds: v as number | null })}
          />
          <EditableParamPill
            label="Load"
            text
            value={entry.weight ?? null}
            onSave={(v) => onPatch({ weight: v as string | null })}
          />
          <EditableParamPill
            label="Rest"
            value={entry.restSeconds ?? null}
            suffix="s"
            onSave={(v) => onPatch({ restSeconds: v as number | null })}
          />
          {entry.notes && (
            <span
              className="bg-slate-50 text-slate-600 border border-slate-200 rounded"
              style={{ padding: "2px 7px", fontSize: 11 }}
            >
              {entry.notes}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-start gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={onRemove}
          title="Remove"
          className="p-1 rounded text-rose-600 hover:bg-rose-50"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

function EditableParamPill({
  label,
  value,
  suffix,
  text,
  onSave,
}: {
  label: string;
  value: number | string | null;
  suffix?: string;
  text?: boolean;
  onSave: (v: number | string | null) => Promise<unknown> | void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string>(value == null ? "" : String(value));

  useEffect(() => {
    setDraft(value == null ? "" : String(value));
  }, [value]);

  function commit() {
    setEditing(false);
    const trimmed = draft.trim();
    const next: number | string | null = trimmed === ""
      ? null
      : text ? trimmed : Number(trimmed);
    if (!text && typeof next === "number" && Number.isNaN(next)) return;
    const same =
      (value == null && next == null) ||
      (value != null && next != null && String(value) === String(next));
    if (same) return;
    onSave(next);
  }

  if (!editing) {
    const empty = value == null || value === "";
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className={cn(
          "inline-flex items-baseline gap-1 border rounded text-left transition-colors",
          empty
            ? "bg-white border-dashed border-slate-200 text-slate-300 hover:text-slate-500 hover:border-slate-300"
            : "bg-slate-50 border-slate-200 text-slate-700 hover:border-emerald-400",
        )}
        style={{ padding: "2px 7px", fontSize: 11, fontFamily: "ui-monospace, monospace" }}
        title="Click to edit"
      >
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.05em" }} className="text-slate-400">
          {label.toUpperCase()}
        </span>
        <span style={{ fontWeight: 500 }}>
          {empty ? "—" : `${value}${suffix ?? ""}`}
        </span>
      </button>
    );
  }

  return (
    <span
      className="inline-flex items-baseline gap-1 bg-white border border-emerald-400 rounded ring-2 ring-emerald-200"
      style={{ padding: "1px 5px", fontSize: 11, fontFamily: "ui-monospace, monospace" }}
    >
      <span className="text-slate-400" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.05em" }}>
        {label.toUpperCase()}
      </span>
      <input
        autoFocus
        type={text ? "text" : "number"}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setDraft(value == null ? "" : String(value));
            setEditing(false);
          }
        }}
        className="bg-transparent outline-none"
        style={{
          width: text ? 56 : 38,
          fontSize: 11,
          fontFamily: "ui-monospace, monospace",
          textAlign: text ? "left" : "right",
          fontWeight: 500,
        }}
      />
      {suffix && (
        <span className="text-slate-400" style={{ fontSize: 9 }}>{suffix}</span>
      )}
    </span>
  );
}

/* ───────────── AddExerciseInline ───────────── */
function AddExerciseInline({
  exercises,
  onCancel,
  onAdd,
}: {
  exercises: Exercise[];
  onCancel: () => void;
  onAdd: (payload: AddExercisePayload) => void;
}) {
  const [exerciseId, setExerciseId] = useState("");
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");
  const [duration, setDuration] = useState("");
  const [rest, setRest] = useState("60");
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");

  const lib = exercises.find((e) => e.id === exerciseId);
  const cat = (lib?.category ?? "").toLowerCase();
  const isTimed = cat === "cardio" || cat === "mobility";
  const showWeight = cat === "strength";

  return (
    <div
      className="bg-slate-50 border-t border-slate-200 flex flex-col"
      style={{ padding: "10px 12px", gap: 8 }}
    >
      <select
        value={exerciseId}
        onChange={(e) => setExerciseId(e.target.value)}
        className="w-full bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
        style={{ padding: "6px 10px", fontSize: 12.5 }}
        autoFocus
      >
        <option value="">Select an exercise…</option>
        {exercises.map((ex) => (
          <option key={ex.id} value={ex.id}>
            {ex.name}
          </option>
        ))}
      </select>
      <div className="flex flex-wrap items-end gap-2">
        <MiniField label="Sets" value={sets} onChange={setSets} width={48} />
        {!isTimed && (
          <MiniField label="Reps" value={reps} onChange={setReps} width={56} />
        )}
        {isTimed && (
          <MiniField
            label="Dur"
            value={duration}
            onChange={setDuration}
            width={56}
            suffix="s"
          />
        )}
        {showWeight && (
          <MiniField label="Load" value={weight} onChange={setWeight} width={72} text />
        )}
        <MiniField label="Rest" value={rest} onChange={setRest} width={56} suffix="s" />
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Coach note…"
          className="flex-1 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          style={{ padding: "5px 9px", fontSize: 11.5, minWidth: 120 }}
        />
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-500 hover:text-slate-700 px-2"
          style={{ fontSize: 12, fontWeight: 500 }}
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!exerciseId}
          onClick={() =>
            onAdd({
              exerciseId,
              sets: sets ? Number(sets) : null,
              reps: !isTimed && reps ? Number(reps) : null,
              durationSeconds: isTimed && duration ? Number(duration) : null,
              restSeconds: rest ? Number(rest) : null,
              weight: showWeight && weight ? weight : null,
              notes: notes || null,
            })
          }
          className="bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
          style={{ padding: "6px 14px", fontSize: 12, fontWeight: 600 }}
        >
          Add
        </button>
      </div>
    </div>
  );
}

function MiniField({
  label,
  value,
  onChange,
  width,
  suffix,
  text,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  width: number;
  suffix?: string;
  text?: boolean;
}) {
  return (
    <div className="flex flex-col" style={{ gap: 1 }}>
      <span
        className="text-slate-400 uppercase"
        style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.05em" }}
      >
        {label}
      </span>
      <div className="relative">
        <input
          type={text ? "text" : "number"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-white border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
          style={{
            width,
            padding: suffix ? "3px 14px 3px 7px" : "3px 7px",
            fontSize: 11.5,
            fontFamily: "ui-monospace, monospace",
            textAlign: text ? "left" : "right",
          }}
        />
        {suffix && (
          <span
            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            style={{ fontSize: 9, fontFamily: "ui-monospace, monospace" }}
          >
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
