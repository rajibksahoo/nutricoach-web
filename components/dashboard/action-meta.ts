import type { ActionType } from "@/lib/dashboard-api";

/**
 * Shared vocabulary for the five action-queue sources: the strip tiles, the
 * queue rows and the filter chips all read from here so a colour or label is
 * defined exactly once.
 */
export interface ActionMeta {
  /** Plural noun for the attention tile. */
  tile: string;
  /** Short label for the reason pill on a queue row. */
  pill: string;
  fg: string;
  bg: string;
  border: string;
}

export const ACTION_META: Record<ActionType, ActionMeta> = {
  UNANSWERED_MESSAGE: {
    tile: "Unanswered",
    pill: "Message",
    fg: "var(--info-700)",
    bg: "var(--info-50)",
    border: "var(--info-700)",
  },
  OVERDUE_CHECKIN: {
    tile: "Check-in overdue",
    pill: "Check-in",
    fg: "var(--danger-700)",
    bg: "var(--danger-50)",
    border: "var(--danger-700)",
  },
  PLAN_EXPIRING: {
    tile: "Plan expiring",
    pill: "Plan ending",
    fg: "var(--warning-700)",
    bg: "var(--warning-50)",
    border: "var(--warning-700)",
  },
  NO_MEAL_PLAN: {
    tile: "No plan",
    pill: "No plan",
    fg: "var(--brand-primary)",
    bg: "var(--brand-primary-50)",
    border: "var(--brand-primary)",
  },
  NEW_CLIENT: {
    tile: "Onboarding",
    pill: "Onboarding",
    fg: "var(--brand-secondary-600)",
    bg: "var(--brand-secondary-50)",
    border: "var(--brand-secondary-600)",
  },
};

/** Tile order across the attention strip — most urgent first. */
export const ACTION_ORDER: ActionType[] = [
  "UNANSWERED_MESSAGE",
  "OVERDUE_CHECKIN",
  "PLAN_EXPIRING",
  "NO_MEAL_PLAN",
  "NEW_CLIENT",
];
