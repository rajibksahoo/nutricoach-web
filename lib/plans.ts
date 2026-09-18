import type { components } from "@/types/api";

export type PlanTier = NonNullable<components["schemas"]["BillingStatusResponse"]["tier"]>;

export interface Plan {
  tier: PlanTier;
  label: string;
  /** Monthly price in rupees, exclusive of GST. */
  priceRupees: number;
  /** Client cap enforced by the backend's SubscriptionGate. */
  clientLimit: number | null;
  clientsLabel: string;
  features: string[];
  popular?: boolean;
}

/**
 * The plan catalogue, in tier order. Single source of truth: the landing page
 * and the billing screen both read this — they used to hardcode their own
 * copies, which could drift from each other and from the backend's tier caps.
 *
 * These mirror `SubscriptionGate.clientLimitFor` on the backend. There is no
 * plans endpoint yet; when one lands, swap this for a fetch.
 */
export const PLANS: Plan[] = [
  {
    tier: "STARTER",
    label: "Starter",
    priceRupees: 999,
    clientLimit: 25,
    clientsLabel: "Up to 25 clients",
    features: ["Up to 25 clients", "Meal plan builder", "WhatsApp sharing", "Email support"],
  },
  {
    tier: "PROFESSIONAL",
    label: "Professional",
    priceRupees: 2499,
    clientLimit: 100,
    clientsLabel: "Up to 100 clients",
    popular: true,
    features: ["Up to 100 clients", "AI meal plan generation", "Progress photos", "Priority support"],
  },
  {
    tier: "ENTERPRISE",
    label: "Enterprise",
    priceRupees: 4999,
    clientLimit: null,
    clientsLabel: "Unlimited clients",
    features: ["Unlimited clients", "Everything in Professional", "Dedicated account manager", "Custom branding"],
  },
];

/** Trial client cap — `SubscriptionGate` allows 5 before any subscription. */
export const TRIAL_CLIENT_LIMIT = 5;

export function planFor(tier: string | undefined | null): Plan | null {
  return PLANS.find((p) => p.tier === tier) ?? null;
}

/** Tier ordering, so the UI can say "upgrade" vs "downgrade" accurately. */
export function tierRank(tier: string | undefined | null): number {
  return PLANS.findIndex((p) => p.tier === tier);
}

export function formatRupees(rupees: number): string {
  return `₹${rupees.toLocaleString("en-IN")}`;
}
