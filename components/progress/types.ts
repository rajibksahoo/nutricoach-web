export interface Client {
  id: string;
  name: string;
  phone: string;
  status: string;
}

export interface ProgressLog {
  id: string;
  loggedDate: string;
  weightKg: number | null;
  bodyFatPercent: number | null;
  waistCm: number | null;
  chestCm: number | null;
  hipCm: number | null;
  adherencePercent: number | null;
  notes: string | null;
}

export interface CheckIn {
  id: string;
  checkInDate: string;
  adherencePercent: number;
  /** What the client wrote. The old local type called this `notes`, which the
   *  API never returns, so it silently rendered nothing. */
  clientNotes: string | null;
  /** The coach's reply, shown to the client in their portal. */
  coachNotes: string | null;
}

export interface Photo {
  id: string;
  photoType: string;
  downloadUrl: string;
  createdAt: string;
}

export const TABS = ["Progress Logs", "Check-ins", "Photos", "Chart"] as const;
export type Tab = (typeof TABS)[number];
