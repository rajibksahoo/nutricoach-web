"use client";
import * as React from "react";
import toast from "react-hot-toast";
import {
  SECTION_PALETTES, SAVED_WORKOUTS, LIBRARY, WORKOUT_TEMPLATES, CLIENTS,
  type SavedWorkout, type LibraryExercise, type WorkoutTemplate, type Client,
} from "./_components/data";
import { LibraryScreen } from "./_components/library-screen";
import { BuilderScreen, type WorkoutState as BuilderWorkoutState } from "./_components/builder-screen";
import { WorkoutEditorModal } from "./_components/workout-editor-modal";
import {
  CreateWorkoutChooserModal, ChooseTemplateModal, templateToWorkoutState,
  type BuilderInitialWorkout,
} from "./_components/create-workout-modals";
import {
  AssignWorkoutModal, ScheduleWorkoutModal,
} from "./_components/assign-schedule-modals";
import { ExerciseModal } from "./_components/exercise-modal";
import {
  listExercises, createExercise, updateExercise, deleteExercise,
  listWorkouts, deleteWorkout, duplicateWorkout,
  listWorkoutTemplates, instantiateTemplate,
  listClients, assignWorkout, scheduleWorkout, saveBuilderWorkout,
} from "@/lib/workout-builder-api";

type Screen = "library" | "builder";

const useMockFallback = !process.env.NEXT_PUBLIC_API_URL;

export default function WorkoutBuilderPage() {
  const [screen, setScreen] = React.useState<Screen>("library");
  const [initialTab, setInitialTab] = React.useState<string>("exercises");
  const [workouts, setWorkouts] = React.useState<SavedWorkout[]>(useMockFallback ? SAVED_WORKOUTS : []);
  const [library, setLibrary] = React.useState<LibraryExercise[]>(useMockFallback ? LIBRARY : []);
  const [templates, setTemplates] = React.useState<WorkoutTemplate[]>(useMockFallback ? WORKOUT_TEMPLATES : []);
  const [clients, setClients] = React.useState<Client[]>(useMockFallback ? CLIENTS : []);
  const [exerciseModalOpen, setExerciseModalOpen] = React.useState(false);
  const [exerciseEditing, setExerciseEditing] = React.useState<LibraryExercise | null>(null);
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editorWorkout, setEditorWorkout] = React.useState<SavedWorkout | null>(null);
  const [chooserOpen, setChooserOpen] = React.useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = React.useState(false);
  const [builderSeed, setBuilderSeed] = React.useState<BuilderInitialWorkout | undefined>(undefined);
  const [builderKey, setBuilderKey] = React.useState(0);
  const [assignOpen, setAssignOpen] = React.useState(false);
  const [scheduleOpen, setScheduleOpen] = React.useState(false);
  const [actionWorkout, setActionWorkout] = React.useState<SavedWorkout | null>(null);
  // Backend id of the workout composed in the current builder session, once persisted
  const [builderSavedId, setBuilderSavedId] = React.useState<string | null>(null);
  const palette = SECTION_PALETTES.cool;

  React.useEffect(() => {
    if (useMockFallback) return;
    Promise.all([
      listExercises().then(setLibrary).catch((e) => { toast.error("Failed to load exercises"); console.error(e); }),
      listWorkouts().then(setWorkouts).catch((e) => { toast.error("Failed to load workouts"); console.error(e); }),
      listWorkoutTemplates().then(setTemplates).catch((e) => { toast.error("Failed to load templates"); console.error(e); }),
      listClients().then(setClients).catch((e) => { toast.error("Failed to load clients"); console.error(e); }),
    ]);
  }, []);

  const upsertWorkout = (w: SavedWorkout) => {
    setWorkouts(prev => {
      const idx = prev.findIndex(x => x.id === w.id);
      if (idx === -1) return [w, ...prev];
      const next = prev.slice();
      next[idx] = w;
      return next;
    });
  };

  const startWorkoutFlow = () => {
    setInitialTab("workouts");
    setChooserOpen(true);
  };

  const goToBuilder = (seed?: BuilderInitialWorkout, savedId?: string) => {
    setBuilderSeed(seed);
    setBuilderSavedId(savedId ?? null);
    setBuilderKey(k => k + 1);
    setScreen("builder");
  };

  // The builder composes purely client-side; persist a snapshot the first time
  // the coach assigns/schedules/sends from it, then reuse that workout id for
  // the rest of the session. Demo exercises not in the real library are skipped.
  const ensureBuilderWorkoutSaved = async (w: BuilderWorkoutState): Promise<SavedWorkout> => {
    if (builderSavedId) {
      const existing = workouts.find(x => x.id === builderSavedId);
      if (existing) return existing;
    }
    const realIds = new Set(library.map(x => x.id));
    let skipped = 0;
    const sections = w.sections.map(s => ({
      title: s.title,
      type: s.type,
      exercises: s.exercises.filter(e => {
        if (realIds.has(e.libId)) return true;
        skipped++;
        return false;
      }).map(e => ({
        exerciseId: e.libId, sets: e.sets, reps: e.reps,
        duration: e.duration, rest: e.rest, weight: e.weight, note: e.note,
      })),
    }));
    const saved = await saveBuilderWorkout(w.name || "Untitled workout", sections);
    setWorkouts(prev => [saved, ...prev]);
    setBuilderSavedId(saved.id);
    toast.success(`Saved "${saved.name}" to your workouts${skipped > 0 ? ` (${skipped} demo exercise${skipped === 1 ? "" : "s"} skipped)` : ""}`);
    return saved;
  };

  const openBuilderAction = async (w: BuilderWorkoutState, kind: "assign" | "schedule") => {
    if (useMockFallback) {
      setActionWorkout(null);
      if (kind === "assign") setAssignOpen(true); else setScheduleOpen(true);
      return;
    }
    try {
      const saved = await ensureBuilderWorkoutSaved(w);
      setActionWorkout(saved);
      if (kind === "assign") setAssignOpen(true); else setScheduleOpen(true);
    } catch (e) {
      console.error(e);
      toast.error("Failed to save workout");
    }
  };

  const builderWorkoutName = builderSeed?.name || "Untitled workout";

  const handleSaveExercise = async (ex: LibraryExercise) => {
    setExerciseModalOpen(false);
    if (useMockFallback) {
      setLibrary(prev => {
        const idx = prev.findIndex(x => x.id === ex.id);
        if (idx === -1) return [ex, ...prev];
        const next = prev.slice(); next[idx] = ex; return next;
      });
      toast.success(exerciseEditing ? `Updated "${ex.name}"` : `Added "${ex.name}"`);
      return;
    }
    try {
      if (exerciseEditing) {
        const saved = await updateExercise(ex.id, ex);
        setLibrary(prev => prev.map(x => x.id === saved.id ? saved : x));
        toast.success(`Updated "${saved.name}"`);
      } else {
        const saved = await createExercise(ex);
        setLibrary(prev => [saved, ...prev]);
        toast.success(`Added "${saved.name}"`);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to save exercise");
    }
  };

  const handleDuplicate = async (w: SavedWorkout) => {
    if (useMockFallback) {
      setWorkouts([{ ...w, id: `${w.id}-copy-${Date.now()}`, name: `${w.name} (copy)` }, ...workouts]);
      return;
    }
    try {
      const copy = await duplicateWorkout(w.id);
      setWorkouts(prev => [copy, ...prev]);
      toast.success(`Duplicated "${w.name}"`);
    } catch (e) { console.error(e); toast.error("Failed to duplicate workout"); }
  };

  const handleDelete = async (w: SavedWorkout) => {
    if (useMockFallback) { setWorkouts(workouts.filter(x => x.id !== w.id)); return; }
    try {
      await deleteWorkout(w.id);
      setWorkouts(prev => prev.filter(x => x.id !== w.id));
      toast.success(`Deleted "${w.name}"`);
    } catch (e) { console.error(e); toast.error("Failed to delete workout"); }
  };

  const handleAssign = async (picked: Client[], opts: { message: string }) => {
    setAssignOpen(false);
    const target = actionWorkout;
    if (!target) { toast.error("No workout selected"); return; }
    if (useMockFallback) {
      toast.success(`Assigned to ${picked.length} client${picked.length === 1 ? "" : "s"}`);
      return;
    }
    try {
      await assignWorkout(target.id, picked.map(c => c.id), opts.message || undefined);
      toast.success(`Assigned "${target.name}" to ${picked.length} client${picked.length === 1 ? "" : "s"}`);
    } catch (e) { console.error(e); toast.error("Failed to assign workout"); }
  };

  const handleSchedule = async (date: Date, _opts: { time: string; repeat: string }) => {
    setScheduleOpen(false);
    void _opts;
    const target = actionWorkout;
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    if (useMockFallback || !target) {
      toast.success(`Scheduled for ${date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}`);
      return;
    }
    if (clients.length === 0) { toast.error("No clients available to schedule"); return; }
    try {
      await scheduleWorkout(target.id, clients[0].id, dateStr);
      toast.success(`Scheduled "${target.name}" for ${dateStr}`);
    } catch (e) { console.error(e); toast.error("Failed to schedule workout"); }
  };

  const handlePickTemplate = async (t: WorkoutTemplate) => {
    setTemplatePickerOpen(false);
    if (useMockFallback) {
      goToBuilder(templateToWorkoutState(t, library));
      return;
    }
    try {
      const created = await instantiateTemplate(t.id);
      setWorkouts(prev => [created, ...prev]);
      toast.success(`Created "${created.name}" from template`);
      goToBuilder(templateToWorkoutState(t, library), created.id);
    } catch (e) { console.error(e); toast.error("Failed to create from template"); }
  };

  const handleDeleteExerciseFromList = async (ex: LibraryExercise) => {
    if (useMockFallback) { setLibrary(prev => prev.filter(x => x.id !== ex.id)); return; }
    try {
      await deleteExercise(ex.id);
      setLibrary(prev => prev.filter(x => x.id !== ex.id));
      toast.success(`Removed "${ex.name}"`);
    } catch (e) { console.error(e); toast.error("Failed to delete exercise"); }
  };
  void handleDeleteExerciseFromList;

  return (
    <>
      {screen === "builder" ? (
        <BuilderScreen
          key={builderKey}
          palette={palette}
          initialWorkout={builderSeed}
          onBack={() => setScreen("library")}
          onAssign={(w) => { void openBuilderAction(w, "assign"); }}
          onSchedule={(w) => { void openBuilderAction(w, "schedule"); }}
          onNewExercise={() => { setExerciseEditing(null); setExerciseModalOpen(true); }}
          dynamicLibrary={library}
        />
      ) : (
        <LibraryScreen
          initialTab={initialTab}
          onOpenBuilder={() => goToBuilder(undefined)}
          onNewExercise={(ex) => { setExerciseEditing(ex); setExerciseModalOpen(true); }}
          onEditExercise={(ex) => { setExerciseEditing(ex); setExerciseModalOpen(true); }}
          dynamicLibrary={library}
          workouts={workouts}
          palette={palette}
          onCreateWorkout={startWorkoutFlow}
          onOpenWorkout={(w) => { setEditorWorkout(w); setEditorOpen(true); }}
          onDuplicateWorkout={handleDuplicate}
          onDeleteWorkout={handleDelete}
          onAssignWorkout={(w) => { setActionWorkout(w); setAssignOpen(true); }}
        />
      )}
      <WorkoutEditorModal
        open={editorOpen}
        workout={editorWorkout}
        palette={palette}
        onClose={() => setEditorOpen(false)}
        onSave={(w) => upsertWorkout(w)}
        onSaveClose={(w) => { upsertWorkout(w); setEditorOpen(false); }}
      />
      <CreateWorkoutChooserModal
        open={chooserOpen}
        onClose={() => setChooserOpen(false)}
        onStartBlank={() => { setChooserOpen(false); goToBuilder(undefined); }}
        onPickTemplate={() => { setChooserOpen(false); setTemplatePickerOpen(true); }}
      />
      <ChooseTemplateModal
        open={templatePickerOpen}
        templates={templates}
        onClose={() => setTemplatePickerOpen(false)}
        onBack={() => { setTemplatePickerOpen(false); setChooserOpen(true); }}
        onSelect={handlePickTemplate}
      />
      <AssignWorkoutModal
        open={assignOpen}
        clients={clients}
        workoutName={actionWorkout?.name || builderWorkoutName}
        workoutId={useMockFallback ? null : actionWorkout?.id ?? null}
        onClose={() => setAssignOpen(false)}
        onAssign={handleAssign}
      />
      <ExerciseModal
        open={exerciseModalOpen}
        exercise={exerciseEditing}
        onClose={() => setExerciseModalOpen(false)}
        onSave={handleSaveExercise}
      />
      <ScheduleWorkoutModal
        open={scheduleOpen}
        workoutName={actionWorkout?.name || builderWorkoutName}
        onClose={() => setScheduleOpen(false)}
        onSchedule={handleSchedule}
      />
    </>
  );
}
