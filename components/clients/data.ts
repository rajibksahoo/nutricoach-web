// Shared client-detail types and status palette for the Clients screen and
// the Inbox right-pane. The static design fixture that used to live here was
// removed: it rendered as real data whenever the API was empty or errored.

export type StatusKey =
  | "Connected"
  | "Pending"
  | "Offline"
  | "Waiting Activation"
  | "Need Programming"
  | "Archived";

export interface ClientUpdate {
  who: string;
  text: string;
  time: string;
}

export interface ClientNote {
  text: string;
  date: string;
}

export interface ClientDetail {
  id: string;
  name: string;
  goal: string;
  phone: string;
  email: string;
  category: "Online" | "In-Person";
  status: StatusKey;
  segment: string;
  joined: string;
  lastActive: string;
  coach: string;
  program: string;
  pkg: string;
  pkgEnd: string;
  age: number;
  sex: "F" | "M";
  height: string;
  weight: string;
  startWeight: string;
  bf: string;
  restingHR: number;
  train7: number;
  train30: number;
  tasks7: number;
  nutr7: number;
  streak: number;
  sessions: number;
  nextSession: string;
  avatarTone: string;
  timezone: string;
  train7d: { done: number; total: number };
  train30d: { done: number; total: number };
  nextWeek: { done: number; total: number };
  lastWorkout: { name: string; days: number };
  metrics: { weight: number[]; bf: number[]; steps: number[] };
  goalDesc: string;
  notes: ClientNote[];
  limitations: ClientNote[];
  photos: string[];
  updates: ClientUpdate[];
}


export const STATUS_COLORS: Record<StatusKey, { color: string; bg: string; dot: string }> = {
  "Connected":          { color: "#15803D", bg: "#F0FDF4", dot: "#22C55E" },
  "Pending":            { color: "#A16207", bg: "#FEFCE8", dot: "#EAB308" },
  "Offline":            { color: "#475569", bg: "#F1F5F9", dot: "#94A3B8" },
  "Waiting Activation": { color: "#9A3412", bg: "#FFEDD5", dot: "#F97316" },
  "Need Programming":   { color: "#1D4ED8", bg: "#DBEAFE", dot: "#3B82F6" },
  "Archived":           { color: "#64748B", bg: "#F8FAFC", dot: "#CBD5E1" },
};
