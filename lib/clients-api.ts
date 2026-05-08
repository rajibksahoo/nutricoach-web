import api from "@/lib/api";
import {
  CLIENT_DETAILS, type ClientDetail, type StatusKey,
} from "@/components/clients/data";

// ─── Backend types ─────────────────────────────────────────────────────
// Mirror the Spring Boot ClientResponse / ProgressLogResponse shapes.

export interface BackendClient {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  whatsappNumber: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  heightCm: number | null;
  weightKg: string | null;
  goal: string | null;
  dietaryPref: string | null;
  activityLevel: string | null;
  healthConditions: string[] | null;
  allergies: string[] | null;
  status: "ACTIVE" | "ONBOARDING" | "PAUSED" | "INACTIVE";
  createdAt: string;
}

export interface BackendProgressLog {
  id: string;
  clientId: string;
  loggedDate: string;
  weightKg: string | null;
  bodyFatPercent: string | null;
  waistCm: string | null;
  chestCm: string | null;
  hipCm: string | null;
  adherencePercent: number | null;
  notes: string | null;
}

interface ApiEnvelope<T> { success: boolean; message?: string; data: T }

// ─── Fetch helpers ─────────────────────────────────────────────────────
export async function listClients(): Promise<BackendClient[]> {
  const r = await api.get<ApiEnvelope<BackendClient[]>>("/api/v1/clients");
  return r.data.data;
}

export async function getClientChart(clientId: string, days = 60): Promise<BackendProgressLog[]> {
  const r = await api.get<ApiEnvelope<BackendProgressLog[]>>(
    `/api/v1/clients/${clientId}/progress/chart`,
    { params: { days } },
  );
  return r.data.data;
}

// ─── Mapping ───────────────────────────────────────────────────────────
const STATUS_MAP: Record<BackendClient["status"], StatusKey> = {
  ACTIVE:     "Connected",
  ONBOARDING: "Pending",
  PAUSED:     "Offline",
  INACTIVE:   "Archived",
};

const GOAL_LABEL: Record<string, string> = {
  WEIGHT_LOSS:  "Weight loss",
  WEIGHT_GAIN:  "Weight gain",
  MUSCLE_GAIN:  "Muscle gain",
  MAINTENANCE:  "Maintenance",
};

// Pleasant deterministic hue per client id — used for the avatar tone
// in the absence of a backend "tone" field.
const TONE_PALETTE = [
  "#4F46E5", "#0D9488", "#F59E0B", "#A855F7", "#DC2626",
  "#22C55E", "#0EA5E9", "#EC4899", "#F97316", "#14B8A6",
];
function toneFromId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return TONE_PALETTE[h % TONE_PALETTE.length];
}

function fmtJoined(iso: string): string {
  // "Mar 12, 2025"
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  } catch { return iso; }
}

function relAge(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms) || ms < 0) return "—";
  const min = ms / 60_000;
  if (min < 1) return "just now";
  if (min < 60) return `${Math.floor(min)}m ago`;
  const hrs = min / 60;
  if (hrs < 24) return `${Math.floor(hrs)}h ago`;
  const days = hrs / 24;
  if (days < 7) return `${Math.floor(days)}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return fmtJoined(iso);
}

const HOURS_24_TZ = "Asia/Kolkata";
function nowInIst(): string {
  const t = new Date().toLocaleTimeString("en-US", {
    timeZone: HOURS_24_TZ, hour: "numeric", minute: "2-digit",
  });
  return `${t} · ${HOURS_24_TZ}`;
}

export function toClientDetail(c: BackendClient, progress: BackendProgressLog[] = []): ClientDetail {
  const sortedAsc = [...progress].sort((a, b) => a.loggedDate.localeCompare(b.loggedDate));
  const weight = sortedAsc.map((p) => p.weightKg).filter((v): v is string => !!v).map(Number);
  const bf = sortedAsc.map((p) => p.bodyFatPercent).filter((v): v is string => !!v).map(Number);
  const goalLabel = c.goal ? GOAL_LABEL[c.goal] || c.goal : "—";
  const currentWeight = weight[weight.length - 1];
  const startWeight = weight[0];
  return {
    id: c.id,
    name: c.name,
    goal: goalLabel,
    phone: c.phone,
    email: c.email || "—",
    category: c.activityLevel === "VERY_ACTIVE" || c.activityLevel === "ACTIVE" ? "In-Person" : "Online",
    status: STATUS_MAP[c.status] || "Offline",
    segment: STATUS_MAP[c.status]?.toLowerCase() || "offline",
    joined: fmtJoined(c.createdAt),
    lastActive: relAge(c.createdAt),
    coach: "Rajib K.",
    program: c.goal ? `${goalLabel} program` : "— not assigned",
    pkg: "—",
    pkgEnd: "—",
    age: 0,
    sex: c.gender === "MALE" ? "M" : "F",
    height: c.heightCm ? `${c.heightCm} cm` : "—",
    weight: currentWeight ? `${currentWeight} kg` : (c.weightKg ? `${c.weightKg} kg` : "—"),
    startWeight: startWeight ? `${startWeight} kg` : (c.weightKg ? `${c.weightKg} kg` : "—"),
    bf: bf.length ? `${bf[bf.length - 1]}%` : "—",
    restingHR: 0,
    train7: 0, train30: 0, tasks7: 0, nutr7: 0, streak: 0, sessions: 0,
    nextSession: "Not scheduled",
    avatarTone: toneFromId(c.id),
    timezone: nowInIst(),
    train7d: { done: 0, total: 0 },
    train30d: { done: 0, total: 0 },
    nextWeek: { done: 0, total: 0 },
    lastWorkout: { name: "—", days: 0 },
    metrics: { weight, bf, steps: [] },
    goalDesc: c.goal ? `Working towards: ${goalLabel}.` : "",
    notes: [],
    limitations: (c.healthConditions || []).map((h) => ({ text: h, date: fmtJoined(c.createdAt) })),
    photos: [],
    updates: [],
  };
}

// Dev-time fallback: when there's no API URL configured, or the API
// returns an empty list, fall back to the design's static fixture so
// the screen still demos.
export function isMockFallbackEnv(): boolean {
  return !process.env.NEXT_PUBLIC_API_URL;
}

export function mockFallbackClients(): ClientDetail[] {
  return CLIENT_DETAILS;
}
