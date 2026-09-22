/**
 * Server-side instrumentation. Catches errors thrown in server components,
 * route handlers and middleware — the ones that never reach the browser and
 * would otherwise only exist in a log nobody reads.
 */
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (!process.env.SENTRY_DSN || process.env.NODE_ENV !== "production") return;

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
  });
}

export const onRequestError = Sentry.captureRequestError;
