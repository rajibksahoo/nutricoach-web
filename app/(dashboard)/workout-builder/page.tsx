"use client";
import * as React from "react";
import {
  SECTION_PALETTES, SAVED_WORKOUTS, LIBRARY, type SavedWorkout, type LibraryExercise,
} from "./_components/data";
import { LibraryScreen } from "./_components/library-screen";

type Screen = "library" | "builder";

export default function WorkoutBuilderPage() {
  const [screen, setScreen] = React.useState<Screen>("library");
  const [initialTab, setInitialTab] = React.useState<string>("exercises");
  const [workouts, setWorkouts] = React.useState<SavedWorkout[]>(SAVED_WORKOUTS);
  const [library] = React.useState<LibraryExercise[]>(LIBRARY);
  const palette = SECTION_PALETTES.cool;

  if (screen === "builder") {
    return (
      <div style={{ padding: "60px 28px", textAlign: "center", color: "var(--fg3)", fontFamily: "var(--font-sans)" }}>
        <h2 style={{ fontFamily: "var(--font-display)", color: "var(--fg1)" }}>Builder coming soon</h2>
        <p style={{ marginTop: 8 }}>The full builder + workout editor are part of the next implementation pass.</p>
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setScreen("library")}>
          Back to library
        </button>
      </div>
    );
  }

  return (
    <LibraryScreen
      initialTab={initialTab}
      onOpenBuilder={() => setScreen("builder")}
      onNewExercise={() => alert("Exercise modal coming soon")}
      onEditExercise={() => alert("Exercise modal coming soon")}
      dynamicLibrary={library}
      workouts={workouts}
      palette={palette}
      onCreateWorkout={() => { setInitialTab("workouts"); setScreen("builder"); }}
      onOpenWorkout={() => setScreen("builder")}
      onDuplicateWorkout={(w) => {
        setWorkouts([{ ...w, id: `${w.id}-copy-${Date.now()}`, name: `${w.name} (copy)` }, ...workouts]);
      }}
      onDeleteWorkout={(w) => setWorkouts(workouts.filter(x => x.id !== w.id))}
    />
  );
}
