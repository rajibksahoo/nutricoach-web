// Shared workout/exercise shapes used by the API layer (`lib/workout-builder-api.ts`)
// and the Library screens. Extracted from the deleted `/workout-builder` route's
// `_components/data.ts`, which mixed these real types in with design fixtures.

export type CategoryKey = "strength" | "bodyweight" | "timed" | "cardio" | "amrap";
export type SectionType = "warmup" | "main" | "accessory" | "cooldown" | "finisher";
export type ThumbCat = "bodyweight" | "strength" | "timed" | "cardio" | "amrap";

export interface LibraryExercise {
  id: string;
  name: string;
  cat: CategoryKey;
  muscle: string;
  equip: string;
  pattern: string;
  custom: boolean;
  tags: string[];
  videoUrl?: string;
  instructions?: string;
}

export interface SectionExercise {
  id: string;
  libId: string;
  sets: number;
  reps: number | null;
  duration: number | null;
  rest: number | null;
  weight: string;
  note: string;
}

export interface WorkoutSection {
  id?: string;
  type: SectionType;
  title: string;
  exCount?: number;
  exercises?: SectionExercise[];
}

export interface SavedWorkout {
  id: string;
  name: string;
  description: string;
  sectionCount: number;
  exerciseCount: number;
  sections: WorkoutSection[];
  tags: string[];
  lastUsed: string;
  owner: string;
}

export interface TemplateItem { name: string; thumb: ThumbCat; reps: string; note: string }

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  exerciseCount: number;
  sectionCount: number;
  equipment: string[];
  cover: string;
  sections: { title: string; style: string; items: TemplateItem[] }[];
}

/** A client as the assign/schedule pickers need them. */
export interface Client {
  id: string;
  name: string;
  goal: string;
  phone: string;
  status: string;
}
