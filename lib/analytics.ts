/**
 * Product analytics — PostHog.
 *
 * The question this exists to answer is where activation dies: a coach signs
 * up, and somewhere between the OTP screen and a paid subscription most of
 * them stop. Page views cannot tell you which step lost them, so the events
 * below are deliberately the funnel, not a firehose.
 *
 * **No personal data leaves the app.** A coach is identified by their UUID and
 * nothing else — no phone, name, email or GSTIN. Phone numbers are the login
 * credential here, so shipping them to a third party would be handing out the
 * identity of every coach on the platform. Event properties follow the same
 * rule: counts and enums, never free text a coach typed.
 */
import posthog from "posthog-js";

/**
 * The funnel, in order. A closed union rather than free strings so a typo
 * becomes a build error instead of an event nobody notices is missing.
 */
export type AnalyticsEvent =
  | "signed_up"
  | "onboarding_step_completed"
  | "onboarding_step_skipped"
  | "onboarding_finished"
  | "client_added"
  | "client_invited"
  | "message_sent"
  | "workout_created"
  | "program_created"
  | "checkout_started"
  | "subscription_activated";

type Props = Record<string, string | number | boolean | null>;

/** True only when a real key is configured — see `isEnabled` for why. */
let enabled = false;

/**
 * Analytics runs only in a production build with a key set. Local dev and the
 * e2e suite would otherwise pollute the funnel with hundreds of fake signups,
 * and the numbers you act on have to be real ones.
 */
function isEnabled(): boolean {
  return (
    typeof window !== "undefined" &&
    process.env.NODE_ENV === "production" &&
    !!process.env.NEXT_PUBLIC_POSTHOG_KEY
  );
}

export function initAnalytics(): void {
  if (!isEnabled()) return;
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    // EU cloud: the rest of the stack is in ap-south-1 for DPDP reasons, and
    // US-hosted analytics would be the one thing quietly outside that choice.
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
    // Only build a person profile once a coach is identified. Anonymous
    // visitors on the landing page do not need one.
    person_profiles: "identified_only",
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: false, // the named events below are the contract, not clicks
  });
  enabled = true;
}

/** Ties subsequent events to a coach. UUID only — never phone or name. */
export function identifyCoach(coachId: string): void {
  if (!enabled) return;
  posthog.identify(coachId);
}

/** Call on logout, so the next coach on a shared machine is a new person. */
export function resetAnalytics(): void {
  if (!enabled) return;
  posthog.reset();
}

/**
 * Records a funnel event. Silent no-op when analytics is off, so call sites
 * never need to guard — and a failure here must never break a coach's action.
 */
export function track(event: AnalyticsEvent, props?: Props): void {
  if (!enabled) return;
  try {
    posthog.capture(event, props);
  } catch {
    /* telemetry is never worth an interrupted workflow */
  }
}
