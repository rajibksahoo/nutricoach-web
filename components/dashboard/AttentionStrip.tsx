"use client";

import * as React from "react";
import { MessageCircle, CalendarClock, CalendarX, UtensilsCrossed, UserPlus } from "lucide-react";
import type { ActionType, DashboardCounts } from "@/lib/dashboard-api";
import { ACTION_META, ACTION_ORDER } from "./action-meta";

const ICONS: Record<ActionType, React.ComponentType<{ size?: number }>> = {
  UNANSWERED_MESSAGE: MessageCircle,
  OVERDUE_CHECKIN: CalendarClock,
  PLAN_EXPIRING: CalendarX,
  NO_MEAL_PLAN: UtensilsCrossed,
  NEW_CLIENT: UserPlus,
};

function countFor(type: ActionType, c: DashboardCounts): number {
  switch (type) {
    case "UNANSWERED_MESSAGE": return c.unansweredMessages;
    case "OVERDUE_CHECKIN":    return c.overdueCheckIns;
    case "PLAN_EXPIRING":      return c.plansExpiringSoon;
    case "NO_MEAL_PLAN":       return c.clientsNeedingPlan;
    case "NEW_CLIENT":         return c.onboardingClients;
  }
}

/**
 * Five counters that double as filters for the queue below. Clicking a tile
 * narrows the queue; clicking the active tile clears the filter.
 */
export default function AttentionStrip({
  counts, active, onToggle,
}: {
  counts: DashboardCounts;
  active: ActionType | null;
  onToggle: (t: ActionType | null) => void;
}) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(168px, 1fr))",
      gap: 12,
    }}>
      {ACTION_ORDER.map((type) => {
        const meta = ACTION_META[type];
        const n = countFor(type, counts);
        const on = active === type;
        const Icon = ICONS[type];
        const quiet = n === 0;

        return (
          <button
            key={type}
            type="button"
            onClick={() => onToggle(on ? null : type)}
            disabled={quiet}
            aria-pressed={on}
            style={{
              display: "flex", alignItems: "center", gap: 11,
              padding: "13px 14px", textAlign: "left",
              background: on ? meta.bg : "var(--surface)",
              border: `1px solid ${on ? meta.border : "var(--border)"}`,
              borderRadius: 12,
              boxShadow: on ? "none" : "var(--shadow-sm)",
              cursor: quiet ? "default" : "pointer",
              opacity: quiet ? 0.55 : 1,
              transition: `background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)`,
            }}
          >
            <span style={{
              width: 32, height: 32, borderRadius: 9, flexShrink: 0,
              background: meta.bg, color: meta.fg,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon size={15} />
            </span>
            <span style={{ minWidth: 0 }}>
              <span style={{
                display: "block",
                fontFamily: "var(--font-display-xl)",
                fontSize: 22, fontWeight: 700, lineHeight: 1,
                letterSpacing: "-0.02em",
                fontVariantNumeric: "tabular-nums",
                color: quiet ? "var(--fg3)" : "var(--fg1)",
              }}>{n}</span>
              <span style={{
                display: "block", marginTop: 4,
                fontSize: 11.5, color: "var(--fg3)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{meta.tile}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
