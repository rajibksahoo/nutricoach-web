import api from "./api";
import type {
  CategoryKey, LibraryExercise, SavedWorkout, WorkoutSection,
  SectionExercise, SectionType, WorkoutTemplate, ThumbCat, Client,
} from "@/app/(dashboard)/workout-builder/_components/data";

// ── Backend response shapes ──────────────────────────────────────────────────
type ApiResp<T> = { success: boolean; message?: string; data: T };

interface ApiExercise {
  id: string; name: string; description?: string;
  muscleGroup?: string; equipment?: string; videoUrl?: string; notes?: string;
  category: CategoryKey; movementPattern?: string;
  tags?: string[]; custom: boolean;
  createdAt: string; updatedAt: string;
}

interface ApiSectionExercise {
  id: string; exerciseId: string; exerciseName: string;
  position: number; sets?: number | null; reps?: number | null;
  durationSeconds?: number | null; restSeconds?: number | null;
  weight?: string; notes?: string;
}

interface ApiSection {
  id: string; assignmentId?: string; name: string;
  sectionType: "WARM_UP" | "MAIN" | "ACCESSORY" | "COOL_DOWN" | "FINISHER";
  description?: string;
  exercises: ApiSectionExercise[];
  createdAt: string; updatedAt: string;
}

interface ApiWorkout {
  id: string; name: string; description?: string;
  estimatedDurationMinutes?: number; tags?: string[];
  sections: ApiSection[];
  createdAt: string; updatedAt: string;
}

interface ApiWorkoutSummary {
  id: string; name: string; description?: string;
  estimatedDurationMinutes?: number; tags?: string[];
  createdAt: string; updatedAt: string;
}

interface ApiTemplate {
  id: string; name: string; description?: string;
  coverGradient?: string; equipment?: string[];
  sections: { title: string; style: string; items: { name: string; thumb: string; reps: string; note: string }[] }[];
}

interface ApiClient { id: string; name: string; phone: string; goal?: string; status: string; }

// ── Mappers (backend ↔ frontend) ──────────────────────────────────────────────
const SECTION_TYPE_TO_FE: Record<ApiSection["sectionType"], SectionType> = {
  WARM_UP: "warmup", MAIN: "main", ACCESSORY: "accessory", COOL_DOWN: "cooldown", FINISHER: "finisher",
};
const SECTION_TYPE_TO_BE: Record<SectionType, ApiSection["sectionType"]> = {
  warmup: "WARM_UP", main: "MAIN", accessory: "ACCESSORY", cooldown: "COOL_DOWN", finisher: "FINISHER",
};

export function mapExercise(e: ApiExercise): LibraryExercise {
  return {
    id: e.id, name: e.name,
    cat: e.category,
    muscle: e.muscleGroup ?? "",
    equip: e.equipment ?? "",
    pattern: e.movementPattern ?? "",
    custom: e.custom,
    tags: e.tags ?? [],
    videoUrl: e.videoUrl,
    instructions: e.notes,
  };
}

export function mapWorkoutFromSummary(w: ApiWorkoutSummary): SavedWorkout {
  return {
    id: w.id, name: w.name, description: w.description ?? "",
    sectionCount: 0, exerciseCount: 0,
    sections: [],
    tags: w.tags ?? [],
    lastUsed: new Date(w.updatedAt).toLocaleDateString(),
    owner: "you",
  };
}

export function mapWorkoutFromFull(w: ApiWorkout): SavedWorkout {
  const sections: WorkoutSection[] = w.sections.map(s => mapSection(s));
  const exerciseCount = sections.reduce((sum, s) => sum + (s.exercises?.length ?? 0), 0);
  return {
    id: w.id, name: w.name, description: w.description ?? "",
    sectionCount: sections.length, exerciseCount,
    sections,
    tags: w.tags ?? [],
    lastUsed: new Date(w.updatedAt).toLocaleDateString(),
    owner: "you",
  };
}

function mapSection(s: ApiSection): WorkoutSection {
  const exercises: SectionExercise[] = s.exercises.map(e => ({
    id: e.id, libId: e.exerciseId,
    sets: e.sets ?? 1,
    reps: e.reps ?? null,
    duration: e.durationSeconds ?? null,
    rest: e.restSeconds ?? null,
    weight: e.weight ?? "",
    note: e.notes ?? "",
  }));
  return {
    id: s.id,
    type: SECTION_TYPE_TO_FE[s.sectionType] ?? "main",
    title: s.name,
    exCount: exercises.length,
    exercises,
  };
}

export function mapTemplate(t: ApiTemplate): WorkoutTemplate {
  const sections = t.sections.map(s => ({
    title: s.title, style: s.style,
    items: s.items.map(it => ({
      name: it.name,
      thumb: (["bodyweight", "strength", "timed", "cardio", "amrap"].includes(it.thumb) ? it.thumb : "strength") as ThumbCat,
      reps: it.reps, note: it.note,
    })),
  }));
  const exerciseCount = sections.reduce((sum, s) => sum + s.items.length, 0);
  return {
    id: t.id, name: t.name, description: t.description ?? "",
    exerciseCount, sectionCount: sections.length,
    equipment: t.equipment ?? [],
    cover: t.coverGradient ?? "linear-gradient(135deg,#475569 0%,#64748B 100%)",
    sections,
  };
}

export function mapClient(c: ApiClient): Client {
  return {
    id: c.id, name: c.name, phone: c.phone,
    goal: c.goal ?? "—", status: c.status,
  };
}

// ── Endpoints ────────────────────────────────────────────────────────────────
export async function listExercises(): Promise<LibraryExercise[]> {
  const { data } = await api.get<ApiResp<ApiExercise[]>>("/api/v1/library/exercises");
  return data.data.map(mapExercise);
}

export async function createExercise(ex: Omit<LibraryExercise, "id" | "custom">): Promise<LibraryExercise> {
  const { data } = await api.post<ApiResp<ApiExercise>>("/api/v1/library/exercises", {
    name: ex.name,
    muscleGroup: ex.muscle || null,
    equipment: ex.equip || null,
    category: ex.cat,
    movementPattern: ex.pattern || null,
    tags: ex.tags ?? [],
    videoUrl: ex.videoUrl || null,
    notes: ex.instructions || null,
  });
  return mapExercise(data.data);
}

export async function updateExercise(id: string, ex: Partial<Omit<LibraryExercise, "id">>): Promise<LibraryExercise> {
  const { data } = await api.put<ApiResp<ApiExercise>>(`/api/v1/library/exercises/${id}`, {
    name: ex.name,
    muscleGroup: ex.muscle ?? null,
    equipment: ex.equip ?? null,
    category: ex.cat,
    movementPattern: ex.pattern ?? null,
    tags: ex.tags ?? [],
    videoUrl: ex.videoUrl ?? null,
    notes: ex.instructions ?? null,
  });
  return mapExercise(data.data);
}

export async function deleteExercise(id: string): Promise<void> {
  await api.delete(`/api/v1/library/exercises/${id}`);
}

export async function listWorkouts(): Promise<SavedWorkout[]> {
  const { data } = await api.get<ApiResp<ApiWorkoutSummary[]>>("/api/v1/library/workouts");
  return data.data.map(mapWorkoutFromSummary);
}

export async function getWorkout(id: string): Promise<SavedWorkout> {
  const { data } = await api.get<ApiResp<ApiWorkout>>(`/api/v1/library/workouts/${id}`);
  return mapWorkoutFromFull(data.data);
}

export async function createWorkout(w: Pick<SavedWorkout, "name" | "description" | "tags">): Promise<SavedWorkout> {
  const { data } = await api.post<ApiResp<ApiWorkoutSummary>>("/api/v1/library/workouts", {
    name: w.name, description: w.description, tags: w.tags ?? [],
  });
  return mapWorkoutFromSummary(data.data);
}

export async function updateWorkout(id: string, w: Partial<Pick<SavedWorkout, "name" | "description" | "tags">>): Promise<SavedWorkout> {
  const { data } = await api.put<ApiResp<ApiWorkoutSummary>>(`/api/v1/library/workouts/${id}`, w);
  return mapWorkoutFromSummary(data.data);
}

export async function deleteWorkout(id: string): Promise<void> {
  await api.delete(`/api/v1/library/workouts/${id}`);
}

export async function duplicateWorkout(id: string): Promise<SavedWorkout> {
  const { data } = await api.post<ApiResp<ApiWorkout>>(`/api/v1/library/workouts/${id}/duplicate`);
  return mapWorkoutFromFull(data.data);
}

export async function listWorkoutTemplates(): Promise<WorkoutTemplate[]> {
  const { data } = await api.get<ApiResp<ApiTemplate[]>>("/api/v1/library/workout-templates");
  return data.data.map(mapTemplate);
}

export async function instantiateTemplate(id: string): Promise<SavedWorkout> {
  const { data } = await api.post<ApiResp<ApiWorkout>>(`/api/v1/library/workout-templates/${id}/instantiate`);
  return mapWorkoutFromFull(data.data);
}

export async function listClients(): Promise<Client[]> {
  const { data } = await api.get<ApiResp<ApiClient[]>>("/api/v1/clients");
  return data.data.map(mapClient);
}

export async function assignWorkout(workoutId: string, clientIds: string[], notes?: string): Promise<void> {
  await api.post(`/api/v1/library/workouts/${workoutId}/assignments`, { clientIds, notes });
}

export async function scheduleWorkout(workoutId: string, clientId: string, date: string, notes?: string): Promise<void> {
  await api.post(`/api/v1/library/workouts/${workoutId}/schedules`, { clientId, date, notes });
}

export interface WorkoutAssignment {
  id: string; clientId: string; workoutId: string;
  assignedAt: string; notes?: string | null;
}

export interface WorkoutScheduleEntry {
  id: string; clientId: string; workoutId: string;
  date: string; notes?: string | null;
}

export async function listAssignments(workoutId: string): Promise<WorkoutAssignment[]> {
  const { data } = await api.get<ApiResp<WorkoutAssignment[]>>(`/api/v1/library/workouts/${workoutId}/assignments`);
  return data.data;
}

export async function unassignWorkout(workoutId: string, assignmentId: string): Promise<void> {
  await api.delete(`/api/v1/library/workouts/${workoutId}/assignments/${assignmentId}`);
}

export async function listClientSchedules(clientId: string): Promise<WorkoutScheduleEntry[]> {
  const { data } = await api.get<ApiResp<WorkoutScheduleEntry[]>>(`/api/v1/library/clients/${clientId}/schedules`);
  return data.data;
}

export async function unscheduleWorkout(scheduleId: string): Promise<void> {
  await api.delete(`/api/v1/library/schedules/${scheduleId}`);
}

export interface BuilderSectionPayload {
  title: string;
  type: SectionType;
  exercises: {
    exerciseId: string;
    sets: number | null;
    reps: number | null;
    duration: number | null;
    rest: number | null;
    weight: string;
    note: string;
  }[];
}

// Persists a builder composition: create the workout, then create + attach
// each section and add its exercises. Returns the full saved workout.
export async function saveBuilderWorkout(
  name: string, sections: BuilderSectionPayload[], description?: string,
): Promise<SavedWorkout> {
  const { data: w } = await api.post<ApiResp<ApiWorkoutSummary>>("/api/v1/library/workouts", {
    name, description: description || null, tags: [],
  });
  const workoutId = w.data.id;
  for (const [i, s] of sections.entries()) {
    const { data: sec } = await api.post<ApiResp<{ id: string }>>("/api/v1/library/workout-sections", {
      name: s.title, sectionType: SECTION_TYPE_TO_BE[s.type],
    });
    await api.post(`/api/v1/library/workouts/${workoutId}/sections`, {
      sectionId: sec.data.id, position: i,
    });
    for (const [j, e] of s.exercises.entries()) {
      await api.post(`/api/v1/library/workout-sections/${sec.data.id}/exercises`, {
        exerciseId: e.exerciseId, position: j,
        sets: e.sets, reps: e.reps,
        durationSeconds: e.duration, restSeconds: e.rest,
        weight: e.weight || null, notes: e.note || null,
      });
    }
  }
  return getWorkout(workoutId);
}
