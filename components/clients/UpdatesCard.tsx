"use client";

import * as React from "react";
import { MessageCircle, ClipboardCheck, TrendingUp, Dumbbell, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { listClientActivity, type ClientActivity } from "@/lib/clients-api";

/**
 * A client's recent activity.
 *
 * Derived server-side by unioning messages, check-ins, progress logs, workout
 * completions and the join event — there is no activity_log table, so no write
 * path has to remember to log. The card was permanently "No recent updates."
 * before this.
 */

const TYPE_META: Record<string, { icon: React.ComponentType<{ size?: number }>; tone: string; label: string }> = {
  MESSAGE:       { icon: MessageCircle,  tone: "#4F46E5", label: "Message" },
  CHECK_IN:      { icon: ClipboardCheck, tone: "#14B8A6", label: "Check-in" },
  PROGRESS_LOG:  { icon: TrendingUp,     tone: "#F59E0B", label: "Progress" },
  WORKOUT_DONE:  { icon: Dumbbell,       tone: "#22C55E", label: "Workout" },
  CLIENT_JOINED: { icon: UserPlus,       tone: "#64748B", label: "Joined" },
};

/** Filters mirror the activity types the feed can actually contain. */
const FILTERS: { key: string; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "MESSAGE", label: "Messages" },
  { key: "CHECK_IN", label: "Check-ins" },
  { key: "PROGRESS_LOG", label: "Progress" },
  { key: "WORKOUT_DONE", label: "Workouts" },
];

function relative(iso: string | undefined): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "";
  const diff = Date.now() - then;
  const min = 60_000, hr = 3_600_000, day = 86_400_000;
  if (diff < min) return "just now";
  if (diff < hr) return `${Math.floor(diff / min)}m ago`;
  if (diff < day) return `${Math.floor(diff / hr)}h ago`;
  const days = Math.floor(diff / day);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export default function UpdatesCard({ clientId }: { clientId: string }) {
  const [items, setItems] = React.useState<ClientActivity[] | null>(null);
  const [filter, setFilter] = React.useState("ALL");
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    setItems(null);
    setFilter("ALL");
    listClientActivity(clientId)
      .then((rows) => { if (!cancelled) setItems(rows); })
      .catch((e) => {
        console.error(e);
        if (cancelled) return;
        toast.error("Failed to load updates");
        setItems([]);
      });
    return () => { cancelled = true; };
  }, [clientId]);

  React.useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    const id = window.setTimeout(() => document.addEventListener("click", close), 0);
    return () => { window.clearTimeout(id); document.removeEventListener("click", close); };
  }, [menuOpen]);

  const rows = items ?? [];
  const shown = filter === "ALL" ? rows : rows.filter((r) => r.type === filter);
  const activeLabel = FILTERS.find((f) => f.key === filter)?.label ?? "All";

  return (
    <>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10,
      }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--fg1)" }}>Updates</div>
        <div style={{ position: "relative" }}>
          <button onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen}
            aria-label="Filter updates" style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "4px 9px", borderRadius: 7, border: "1px solid var(--border)",
              background: "#fff", fontSize: 11.5, color: "var(--fg2)", cursor: "pointer",
            }}>
            Filter: {activeLabel}
          </button>
          {menuOpen && (
            <div onClick={(e) => e.stopPropagation()} role="menu" style={{
              position: "absolute", top: "calc(100% + 5px)", right: 0, zIndex: 40, minWidth: 140,
              background: "#fff", border: "1px solid var(--border)", borderRadius: 8,
              boxShadow: "var(--shadow-lg)", padding: 4,
            }}>
              {FILTERS.map((f) => (
                <button key={f.key} role="menuitem"
                  onClick={() => { setFilter(f.key); setMenuOpen(false); }}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "6px 9px", border: "none", borderRadius: 6, cursor: "pointer",
                    background: filter === f.key ? "var(--bg-subtle)" : "transparent",
                    color: "var(--fg1)", fontSize: 12.5,
                  }}>{f.label}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {items === null ? (
        <div style={{ fontSize: 12, color: "var(--fg4)" }}>Loading updates…</div>
      ) : shown.length === 0 ? (
        <div style={{ fontSize: 12, color: "var(--fg4)" }}>
          {rows.length === 0 ? "No recent updates." : `No ${activeLabel.toLowerCase()} yet.`}
        </div>
      ) : (
        shown.map((u, i) => {
          const meta = TYPE_META[u.type ?? ""] ?? TYPE_META.CLIENT_JOINED;
          const Icon = meta.icon;
          return (
            <div key={`${u.type}-${u.occurredAt}-${i}`} style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "10px 0", borderTop: i > 0 ? "1px solid var(--border-subtle)" : "none",
            }}>
              <span aria-label={meta.label} style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 26, height: 26, borderRadius: 99, flexShrink: 0,
                background: `${meta.tone}1A`, color: meta.tone,
              }}><Icon size={13} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, color: "var(--fg2)", lineHeight: 1.4 }}>{u.summary}</div>
                <div style={{ fontSize: 11, color: "var(--fg4)", marginTop: 2 }}>{relative(u.occurredAt)}</div>
              </div>
            </div>
          );
        })
      )}
    </>
  );
}
