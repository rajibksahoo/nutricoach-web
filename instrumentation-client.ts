/**
 * Client-side instrumentation — runs before the app becomes interactive.
 *
 * Next 16 runs this file automatically; it replaces the provider component
 * this would otherwise need. Both tools are configured to stay silent unless
 * a key is set, so local dev and the e2e suite send nothing.
 */
import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";
import { initAnalytics } from "@/lib/analytics";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN && process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: SENTRY_DSN,
    // A solo founder reads every issue; there is no volume problem to sample
    // away yet, and a missed error costs more than the quota.
    tracesSampleRate: 0.1,
    // Never record what a coach typed. Replays and breadcrumbs can carry
    // client names, phone numbers and health notes straight out of the DOM.
    sendDefaultPii: false,
  });
}

try {
  initAnalytics();
} catch {
  /* analytics must never stop the app from booting */
}

/** Next calls this on client-side navigations so Sentry can time them. */
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

/**
 * PostHog's SPA pageview capture needs a nudge from the App Router, which does
 * not emit a browser navigation event.
 */
export function onRouterTransitionComplete() {
  try {
    posthog.capture("$pageview");
  } catch {
    /* no-op */
  }
}
