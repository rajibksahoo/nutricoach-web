"use client";

import * as React from "react";
import api from "@/lib/api";
import type { SubscriptionInfo } from "@/lib/dashboard-api";

interface BillingStatus {
  tier: string;
  status: string;
  trialEndsAt: string | null;
}
interface ApiEnvelope<T> { success: boolean; message?: string; data: T }

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  if (Number.isNaN(ms)) return null;
  return Math.max(0, Math.ceil(ms / 86_400_000));
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
    api.get<ApiEnvelope<BillingStatus>>("/api/v1/billing/status")
      .then((r) => {
        if (cancelled) return;
        const d = r.data.data;
        setSub({
          tier: d.tier,
          status: d.status,
          trialEndsAt: d.trialEndsAt ?? null,
          daysLeftInTrial: daysUntil(d.trialEndsAt ?? null),
        });
      })
      .catch(() => { /* a plan chip is not worth a toast */ });
    return () => { cancelled = true; };
  }, []);

  return sub;
}
