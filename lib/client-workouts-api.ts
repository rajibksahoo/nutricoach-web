import clientApi from "./client-api";

export interface ClientWorkoutLine {
  name: string;
  sets: number | null;
  target: string;
}

export interface ClientScheduledWorkout {
  date: string; // ISO yyyy-mm-dd
  programId: string;
  programName: string;
  workoutId: string;
  workoutName: string;
  exerciseCount: number;
  exercises: ClientWorkoutLine[];
  completed: boolean;
}

interface ApiEnvelope<T> { success: boolean; message?: string; data: T; }

export async function listUpcomingWorkouts(): Promise<ClientScheduledWorkout[]> {
  const { data } = await clientApi.get<ApiEnvelope<ClientScheduledWorkout[]>>("/api/v1/portal/workouts");
  return data.data;
}

/**
 * Mark one of my derived upcoming/today workouts as done.
 * Idempotent server-side — re-completing the same (workout, date) succeeds without a duplicate row.
 */
export async function completeWorkout(workoutId: string, date: string): Promise<ClientScheduledWorkout> {
  const { data } = await clientApi.post<ApiEnvelope<ClientScheduledWorkout>>(
    "/api/v1/portal/workouts/complete",
    { workoutId, date },
  );
  return data.data;
}
