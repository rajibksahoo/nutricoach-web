import api from "./api";
import type { ApiEnvelope, Program, ProgramSummary } from "./library-types";

// ── Program CRUD ──────────────────────────────────────────────────────────────
export interface ProgramPayload {
  name: string;
  description?: string | null;
  weeks: number;
  modality?: string | null;
  experienceLevel?: string | null;
  tags?: string[];
}

export async function listPrograms(): Promise<ProgramSummary[]> {
  const { data } = await api.get<ApiEnvelope<ProgramSummary[]>>("/api/v1/library/programs");
  return data.data;
}

export async function getProgram(id: string): Promise<Program> {
  const { data } = await api.get<ApiEnvelope<Program>>(`/api/v1/library/programs/${id}`);
  return data.data;
}

export async function createProgram(payload: ProgramPayload): Promise<ProgramSummary> {
  const { data } = await api.post<ApiEnvelope<ProgramSummary>>("/api/v1/library/programs", payload);
  return data.data;
}

export async function updateProgram(id: string, payload: Partial<ProgramPayload>): Promise<ProgramSummary> {
  const { data } = await api.put<ApiEnvelope<ProgramSummary>>(`/api/v1/library/programs/${id}`, payload);
  return data.data;
}

export async function deleteProgram(id: string): Promise<void> {
  await api.delete(`/api/v1/library/programs/${id}`);
}

// ── Day scheduling ────────────────────────────────────────────────────────────
export async function setProgramDay(
  id: string, dayNumber: number, workoutId: string | null, notes?: string | null,
): Promise<Program> {
  const { data } = await api.put<ApiEnvelope<Program>>(
    `/api/v1/library/programs/${id}/days/${dayNumber}`, { workoutId, notes: notes ?? null });
  return data.data;
}

export async function clearProgramDay(id: string, dayNumber: number): Promise<Program> {
  const { data } = await api.delete<ApiEnvelope<Program>>(`/api/v1/library/programs/${id}/days/${dayNumber}`);
  return data.data;
}

// ── Cover image (presigned S3 upload) ─────────────────────────────────────────
interface CoverUploadResponse { uploadUrl: string; s3Key: string; }

export async function uploadProgramCover(id: string, file: File): Promise<void> {
  const { data } = await api.post<ApiEnvelope<CoverUploadResponse>>(
    `/api/v1/library/programs/${id}/cover`, { contentType: file.type || "image/jpeg" });
  // Direct PUT to the presigned URL — no auth header, raw bytes.
  await fetch(data.data.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "image/jpeg" },
    body: file,
  });
}

export async function deleteProgramCover(id: string): Promise<void> {
  await api.delete(`/api/v1/library/programs/${id}/cover`);
}

// ── Assignment ────────────────────────────────────────────────────────────────
export async function assignProgram(
  id: string, clientIds: string[], opts?: { startDate?: string; notes?: string },
): Promise<void> {
  await api.post(`/api/v1/library/programs/${id}/assignments`, {
    clientIds, startDate: opts?.startDate ?? null, notes: opts?.notes ?? null,
  });
}

// ── Workout previews for planner cards ────────────────────────────────────────
export interface WorkoutOption { id: string; name: string; }

export interface WorkoutPreviewLine {
  name: string;
  sets: number | null;
  target: string;
}

export interface WorkoutPreview {
  id: string;
  name: string;
  lines: WorkoutPreviewLine[];
  totalExercises: number;
}

interface ApiSectionExercise {
  exerciseName: string; sets?: number | null; reps?: number | null;
  durationSeconds?: number | null; weight?: string | null;
}
interface ApiSection { exercises: ApiSectionExercise[]; }
interface ApiWorkoutDetail {
  id: string; name: string;
  sections: ApiSection[];
}

function buildTarget(e: ApiSectionExercise): string {
  if (e.weight && e.reps) return `${e.weight} x ${e.reps}`;
  if (e.reps) return `${e.reps} reps`;
  if (e.durationSeconds) return `${e.durationSeconds}s`;
  return "—";
}

export async function listWorkoutOptions(): Promise<WorkoutOption[]> {
  const { data } = await api.get<ApiEnvelope<{ id: string; name: string }[]>>("/api/v1/library/workouts");
  return data.data.map((w) => ({ id: w.id, name: w.name }));
}

export async function getWorkoutPreview(id: string): Promise<WorkoutPreview> {
  const { data } = await api.get<ApiEnvelope<ApiWorkoutDetail>>(`/api/v1/library/workouts/${id}`);
  const w = data.data;
  const lines: WorkoutPreviewLine[] = [];
  for (const s of w.sections ?? []) {
    for (const e of s.exercises ?? []) {
      lines.push({ name: e.exerciseName, sets: e.sets ?? null, target: buildTarget(e) });
    }
  }
  return { id: w.id, name: w.name, lines, totalExercises: lines.length };
}
