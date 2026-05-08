import api from "@/lib/api";

// ─── Backend types ─────────────────────────────────────────────────────
// Mirror MessageController's DTO shapes from the Spring Boot module.

export type SenderType = "COACH" | "CLIENT";

export interface ConversationSummary {
  clientId: string;
  clientName: string;
  clientPhone: string;
  lastMessage: string | null;
  lastSenderType: SenderType | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface BackendMessage {
  id: string;
  clientId: string;
  senderType: SenderType;
  content: string;
  read: boolean;
  sentAt: string;
}

interface ApiEnvelope<T> { success: boolean; message?: string; data: T }

// ─── Fetch helpers ─────────────────────────────────────────────────────
export async function listConversations(): Promise<ConversationSummary[]> {
  const r = await api.get<ApiEnvelope<ConversationSummary[]>>("/api/v1/messages/conversations");
  return r.data.data;
}

// Side-effect: server marks all inbound (CLIENT-sent) messages as read
// for this coach + client when this endpoint is called.
export async function getThread(clientId: string): Promise<BackendMessage[]> {
  const r = await api.get<ApiEnvelope<BackendMessage[]>>(`/api/v1/messages/clients/${clientId}`);
  return r.data.data;
}

export async function sendMessage(clientId: string, content: string): Promise<BackendMessage> {
  const r = await api.post<ApiEnvelope<BackendMessage>>(
    `/api/v1/messages/clients/${clientId}`,
    { content },
  );
  return r.data.data;
}

// Dev fallback: when there's no API URL configured, fall back to the
// design's static fixtures so the screen still demos.
export function isMockFallbackEnv(): boolean {
  return !process.env.NEXT_PUBLIC_API_URL;
}

// ─── Helpers shared with ClientsScreen ────────────────────────────────
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
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms) || ms < 0) return "";
  const sec = ms / 1000;
  if (sec < 60) return "Just now";
  const min = sec / 60;
  if (min < 60) return `${Math.floor(min)}m`;
  const hrs = min / 60;
  if (hrs < 24) return `${Math.floor(hrs)}h`;
  const days = hrs / 24;
  if (days < 7) return `${Math.floor(days)}d`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function fmtMessageDate(iso: string): string {
  // "Mon, 27 Nov 2023" — matches the design's date dividers.
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
}

export function fmtMessageTime(iso: string): string {
  // "03:10 PM"
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}
