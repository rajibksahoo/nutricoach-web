export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  errorCode?: string;
}

export interface Exercise {
  id: string;
  name: string;
  description?: string | null;
  muscleGroup?: string | null;
  equipment?: string | null;
  videoUrl?: string | null;
  notes?: string | null;
  tags?: string[] | null;
  modality?: string | null;
  movementPattern?: string | null;
  category?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type WorkoutSectionType = "WARM_UP" | "MAIN" | "COOL_DOWN";

export interface SectionExerciseEntry {
  id: string;
  exerciseId: string;
  exerciseName: string;
  position: number;
  sets?: number | null;
  reps?: number | null;
  durationSeconds?: number | null;
  restSeconds?: number | null;
  notes?: string | null;
}

export interface WorkoutSection {
  id: string;
  assignmentId?: string | null;
  name: string;
  sectionType: WorkoutSectionType;
  description?: string | null;
  exercises: SectionExerciseEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutSummary {
  id: string;
  name: string;
  description?: string | null;
  estimatedDurationMinutes?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Workout extends WorkoutSummary {
  sections: WorkoutSection[];
}

export interface ProgramSummary {
  id: string;
  name: string;
  description?: string | null;
  durationDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProgramDay {
  id: string;
  dayNumber: number;
  workoutId?: string | null;
  workoutName?: string | null;
  notes?: string | null;
}

export interface Program extends ProgramSummary {
  days: ProgramDay[];
}
