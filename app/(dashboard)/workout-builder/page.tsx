"use client";
import * as React from "react";
import {
  SECTION_PALETTES, SAVED_WORKOUTS, LIBRARY, type SavedWorkout, type LibraryExercise,
} from "./_components/data";
import { LibraryScreen } from "./_components/library-screen";
import { BuilderScreen } from "./_components/builder-screen";
import { WorkoutEditorModal } from "./_components/workout-editor-modal";

type Screen = "library" | "builder";

export default function WorkoutBuilderPage() {
  const [screen, setScreen] = React.useState<Screen>("library");
  const [initialTab, setInitialTab] = React.useState<string>("exercises");
  const [workouts, setWorkouts] = React.useState<SavedWorkout[]>(SAVED_WORKOUTS);
  const [library] = React.useState<LibraryExercise[]>(LIBRARY);
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editorWorkout, setEditorWorkout] = React.useState<SavedWorkout | null>(null);
  const palette = SECTION_PALETTES.cool;

  const upsertWorkout = (w: SavedWorkout) => {
    setWorkouts(prev => {
      const idx = prev.findIndex(x => x.id === w.id);
      if (idx === -1) return [w, ...prev];
      const next = prev.slice();
      next[idx] = w;
      return next;
    });
  };

  return (
    <>
      {screen === "builder" ? (
        <BuilderScreen
          palette={palette}
          onBack={() => setScreen("library")}
          onAssign={() => alert("Assign modal coming soon")}
          onSchedule={() => alert("Schedule modal coming soon")}
          onNewExercise={() => alert("Exercise modal coming soon")}
          dynamicLibrary={library}
        />
      ) : (
        <LibraryScreen
          initialTab={initialTab}
          onOpenBuilder={() => setScreen("builder")}
          onNewExercise={() => alert("Exercise modal coming soon")}
          onEditExercise={() => alert("Exercise modal coming soon")}
          dynamicLibrary={library}
          workouts={workouts}
          palette={palette}
          onCreateWorkout={() => { setInitialTab("workouts"); setScreen("builder"); }}
          onOpenWorkout={(w) => { setEditorWorkout(w); setEditorOpen(true); }}
          onDuplicateWorkout={(w) => {
            setWorkouts([{ ...w, id: `${w.id}-copy-${Date.now()}`, name: `${w.name} (copy)` }, ...workouts]);
          }}
          onDeleteWorkout={(w) => setWorkouts(workouts.filter(x => x.id !== w.id))}
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
    </>
  );
}
