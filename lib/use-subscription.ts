"use client";

import * as React from "react";
import { getBillingStatus } from "@/lib/billing-api";
import type { SubscriptionInfo } from "@/lib/dashboard-api";

/**
 * Whole days from now until `iso`, floored and clamped at zero.
 *
 * Must match `DashboardOverviewService`, which uses `ChronoUnit.DAYS.between`
 * (truncating). Rounding up here instead would make the dashboard and the
 * Programs views disagree by a day for the same coach.
 */
function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  if (Number.isNaN(ms)) return null;
  return Math.max(0, Math.floor(ms / 86_400_000));
}

/**
 * Real subscription state for screens outside the dashboard, which is the
 * only place `GET /coach/dashboard/overview` is fetched. Lets `TrialChip`
 * replace the hardcoded "29 days left" copy in the Programs views.
 *
 * Returns `null` until loaded, and stays `null` on failure — callers render
 * nothing rather than inventing a trial state.
 */
export function useSubscription(): SubscriptionInfo | null {
  const [sub, setSub] = React.useState<SubscriptionInfo | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    getBillingStatus()
      .then((d) => {
        if (cancelled) return;
        const trialEndsAt = d.trialEndsAt ?? null;
        setSub({
          tier: d.tier ?? "",
          status: d.status ?? "",
          // Only a live trial has a countdown, matching the backend.
          daysLeftInTrial: d.status === "TRIAL" ? daysUntil(trialEndsAt) : null,
          trialEndsAt,
        });
      })
      .catch(() => { /* a plan chip is not worth a toast */ });
    return () => { cancelled = true; };
  }, []);

  return sub;
}
