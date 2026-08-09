import api from "./api";
import type { components } from "@/types/api";

// Contract types come straight from the generated OpenAPI schema so a backend
// change surfaces here as a type error rather than a runtime surprise.
type ApiOverview = components["schemas"]["DashboardOverviewResponse"];

/** Everything springdoc marks optional, normalised into something the UI can render without guards. */
export interface DashboardCounts {
  totalClients: number;
  activeClients: number;
  onboardingClients: number;
  inactiveClients: number;
  unansweredMessages: number;
  overdueCheckIns: number;
  clientsNeedingPlan: number;
  plansExpiringSoon: number;
}

export type ActionType =
  | "UNANSWERED_MESSAGE"
  | "OVERDUE_CHECKIN"
  | "PLAN_EXPIRING"
  | "NO_MEAL_PLAN"
  | "NEW_CLIENT";

export interface ActionItem {
  type: ActionType;
  priority: number;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientStatus: string;
  title: string;
  detail: string;
  occurredAt: string | null;
}

export interface ScheduledSession {
  clientId: string;
  clientName: string;
  workoutId: string;
  workoutName: string;
  source: "SCHEDULE" | "PROGRAM";
}

export interface CheckInToday {
  clientId: string;
  clientName: string;
  adherencePercent: number | null;
}

export interface RecentClient {
  id: string;
  name: string;
  phone: string;
  status: string;
  createdAt: string | null;
}

export interface SubscriptionInfo {
  tier: string;
  status: string;
  trialEndsAt: string | null;
  daysLeftInTrial: number | null;
}

export type ActivityType = "MESSAGE" | "CHECK_IN" | "PROGRESS_LOG" | "CLIENT_JOINED";

export interface ActivityItem {
  type: ActivityType;
  clientId: string;
  clientName: string;
  summary: string;
  occurredAt: string | null;
}

export interface DashboardOverview {
  counts: DashboardCounts;
  actionQueue: ActionItem[];
  today: { sessions: ScheduledSession[]; checkIns: CheckInToday[] };
  roster: { clientLimit: number; recentClients: RecentClient[] };
  subscription: SubscriptionInfo;
  activity: ActivityItem[];
}

interface ApiEnvelope<T> { success: boolean; message?: string; data: T }

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const r = await api.get<ApiEnvelope<ApiOverview>>("/api/v1/coach/dashboard/overview");
  return normalize(r.data.data);
}

function normalize(d: ApiOverview): DashboardOverview {
  return {
    counts: {
      totalClients: d.counts?.totalClients ?? 0,
      activeClients: d.counts?.activeClients ?? 0,
      onboardingClients: d.counts?.onboardingClients ?? 0,
      inactiveClients: d.counts?.inactiveClients ?? 0,
      unansweredMessages: d.counts?.unansweredMessages ?? 0,
      overdueCheckIns: d.counts?.overdueCheckIns ?? 0,
      clientsNeedingPlan: d.counts?.clientsNeedingPlan ?? 0,
      plansExpiringSoon: d.counts?.plansExpiringSoon ?? 0,
    },
    actionQueue: (d.actionQueue ?? []).map((a) => ({
      type: (a.type ?? "NEW_CLIENT") as ActionType,
      priority: a.priority ?? 99,
      clientId: a.clientId ?? "",
      clientName: a.clientName ?? "Client",
      clientPhone: a.clientPhone ?? "",
      clientStatus: a.clientStatus ?? "",
      title: a.title ?? "",
      detail: a.detail ?? "",
      occurredAt: a.occurredAt ?? null,
    })),
    today: {
      sessions: (d.today?.sessions ?? []).map((s) => ({
        clientId: s.clientId ?? "",
        clientName: s.clientName ?? "Client",
        workoutId: s.workoutId ?? "",
        workoutName: s.workoutName ?? "Workout",
        source: (s.source ?? "SCHEDULE") as ScheduledSession["source"],
      })),
      checkIns: (d.today?.checkIns ?? []).map((c) => ({
        clientId: c.clientId ?? "",
        clientName: c.clientName ?? "Client",
        adherencePercent: c.adherencePercent ?? null,
      })),
    },
    roster: {
      clientLimit: d.roster?.clientLimit ?? -1,
      recentClients: (d.roster?.recentClients ?? []).map((c) => ({
        id: c.id ?? "",
        name: c.name ?? "Client",
        phone: c.phone ?? "",
        status: c.status ?? "",
        createdAt: c.createdAt ?? null,
      })),
    },
    subscription: {
      tier: d.subscription?.tier ?? "",
      status: d.subscription?.status ?? "",
      trialEndsAt: d.subscription?.trialEndsAt ?? null,
      daysLeftInTrial: d.subscription?.daysLeftInTrial ?? null,
    },
    activity: (d.activity ?? []).map((a) => ({
      type: (a.type ?? "MESSAGE") as ActivityType,
      clientId: a.clientId ?? "",
      clientName: a.clientName ?? "Client",
      summary: a.summary ?? "",
      occurredAt: a.occurredAt ?? null,
    })),
  };
}

// ─── Presentation helpers ──────────────────────────────────────────────

/** Deterministic avatar tone, mirroring the Clients and Inbox screens. */
const TONE_PALETTE = [
  "#4F46E5", "#0D9488", "#F59E0B", "#A855F7", "#DC2626",
  "#22C55E", "#0EA5E9", "#EC4899", "#F97316", "#14B8A6",
];
export function toneFromId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return TONE_PALETTE[h % TONE_PALETTE.length];
}

export function fmtRelative(iso: string | null): string {
  if (!iso) return "—";
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms)) return "—";
  if (ms < 0) return "just now";
  const min = ms / 60_000;
  if (min < 1) return "just now";
  if (min < 60) return `${Math.floor(min)}m ago`;
  const hrs = min / 60;
  if (hrs < 24) return `${Math.floor(hrs)}h ago`;
  const days = hrs / 24;
  if (days < 7) return `${Math.floor(days)}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/** Where a queue row should take the coach. */
export function actionHref(a: ActionItem): string {
  switch (a.type) {
    case "UNANSWERED_MESSAGE": return "/messages";
    case "NO_MEAL_PLAN":
    case "PLAN_EXPIRING":      return "/meal-plans";
    default:                   return `/clients/${a.clientId}`;
  }
}

/** Verb shown on the row's action button. */
export function actionLabel(type: ActionType): string {
  switch (type) {
    case "UNANSWERED_MESSAGE": return "Reply";
    case "OVERDUE_CHECKIN":    return "Nudge";
    case "PLAN_EXPIRING":      return "Renew";
    case "NO_MEAL_PLAN":       return "Create plan";
    case "NEW_CLIENT":         return "Onboard";
  }
}
