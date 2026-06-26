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
}

interface ApiEnvelope<T> { success: boolean; message?: string; data: T; }

export async function listUpcomingWorkouts(): Promise<ClientScheduledWorkout[]> {
  const { data } = await clientApi.get<ApiEnvelope<ClientScheduledWorkout[]>>("/api/v1/portal/workouts");
  return data.data;
}
