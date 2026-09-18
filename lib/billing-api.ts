import api from "@/lib/api";
import type { components } from "@/types/api";

export type BillingStatus = components["schemas"]["BillingStatusResponse"];
export type ActiveSubscription = components["schemas"]["ActiveSubscription"];
export type InvoiceSummary = components["schemas"]["InvoiceSummary"];

interface ApiEnvelope<T> { success: boolean; message?: string; data: T }

export async function getBillingStatus(): Promise<BillingStatus> {
  const r = await api.get<ApiEnvelope<BillingStatus>>("/api/v1/billing/status");
  return r.data.data;
}

export async function subscribe(planTier: string): Promise<BillingStatus> {
  const r = await api.post<ApiEnvelope<BillingStatus>>("/api/v1/billing/subscribe", { planTier });
  return r.data.data;
}

export async function cancelSubscription(): Promise<BillingStatus> {
  const r = await api.delete<ApiEnvelope<BillingStatus>>("/api/v1/billing/cancel");
  return r.data.data;
}

/** The public Razorpay key. Safe in the browser; the secret stays server-side. */
export const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";

/**
 * Poll `/billing/status` until the Razorpay webhook has activated the new
 * plan. The webhook is the single source of truth for activation — the
 * browser only learns about it by asking again.
 *
 * Resolves with the updated status, or `null` if it hasn't landed in time
 * (Razorpay webhooks are usually seconds, but are not instantaneous).
 */
export async function pollUntilActive(
  previous: BillingStatus,
  { attempts = 10, intervalMs = 2000 }: { attempts?: number; intervalMs?: number } = {},
): Promise<BillingStatus | null> {
  const before = activationFingerprint(previous);
  for (let i = 0; i < attempts; i++) {
    await new Promise((r) => setTimeout(r, intervalMs));
    try {
      const next = await getBillingStatus();
      if (activationFingerprint(next) !== before) return next;
    } catch {
      // keep polling — a transient failure shouldn't end the wait
    }
  }
  return null;
}

/** What changes when a subscription goes live. */
function activationFingerprint(s: BillingStatus): string {
  return [
    s.status,
    s.tier,
    s.activeSubscription?.subscriptionStatus,
    s.activeSubscription?.planTier,
    s.invoices?.length ?? 0,
  ].join("|");
}
