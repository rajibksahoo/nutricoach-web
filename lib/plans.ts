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
  /**
   * Whether the tier includes AI meal-plan generation. Mirrors
   * `SubscriptionGate.hasAiMealPlans` on the backend, which returns 402 from
   * POST /api/v1/ai/meal-plans/generate for tiers where this is false.
   * Trials get access regardless of tier, so this is the *paid* rule only.
   */
  hasAiMealPlans: boolean;
  features: string[];
  popular?: boolean;
}

/**
 * The plan catalogue, in tier order. Single source of truth: the landing page
 * and the billing screen both read this — they used to hardcode their own
 * copies, which could drift from each other and from the backend's tier caps.
 *
 * These mirror `SubscriptionGate.clientLimitFor` and `hasAiMealPlans` on the
 * backend. There is no plans endpoint yet; when one lands, swap this for a fetch.
 *
 * Every line in `features` must be something the product actually does today.
 * This list is what the public pricing page renders, so an aspirational entry
 * here is a claim we take money against.
 */
export const PLANS: Plan[] = [
  {
    tier: "STARTER",
    label: "Starter",
    priceRupees: 999,
    clientLimit: 25,
    clientsLabel: "Up to 25 clients",
    hasAiMealPlans: false,
    features: [
      "Up to 25 clients",
      "Meal plan builder",
      "Workout & program builder",
      "Progress tracking with photos",
      "WhatsApp sharing",
      "Email support",
    ],
  },
  {
    tier: "PROFESSIONAL",
    label: "Professional",
    priceRupees: 2499,
    clientLimit: 100,
    clientsLabel: "Up to 100 clients",
    popular: true,
    hasAiMealPlans: true,
    features: [
      "Up to 100 clients",
      "Everything in Starter",
      "AI meal plan generation",
      "Priority support",
    ],
  },
  {
    tier: "ENTERPRISE",
    label: "Enterprise",
    priceRupees: 4999,
    clientLimit: null,
    clientsLabel: "Unlimited clients",
    hasAiMealPlans: true,
    features: [
      "Unlimited clients",
      "Everything in Professional",
    ],
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

/**
 * Whether a coach's current billing state includes AI meal-plan generation.
 * Mirrors `SubscriptionGate.hasAiMealPlans`: trials get it whatever the tier,
 * because a coach who never sees the generator has no reason to upgrade for it.
 */
export function canUseAiMealPlans(
  tier: string | undefined | null,
  status: string | undefined | null,
): boolean {
  if (status === "TRIAL") return true;
  return planFor(tier)?.hasAiMealPlans ?? false;
}

/** The cheapest tier that includes AI meal-plan generation, for upgrade copy. */
export const AI_MIN_PLAN = PLANS.find((p) => p.hasAiMealPlans)!;

export function formatRupees(rupees: number): string {
  return `₹${rupees.toLocaleString("en-IN")}`;
}
