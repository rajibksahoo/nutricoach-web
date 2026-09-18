/**
 * Whether dev-only affordances (the "OTP is 111111" banner, OTP auto-fill,
 * the client-portal impersonation link) may render.
 *
 * Deliberately requires BOTH a non-production build and the explicit flag.
 * `NEXT_PUBLIC_DEV_MODE` alone used to gate these, which meant one stray env
 * var in the hosting dashboard would ship a "your OTP is 111111" banner to
 * real users. `NODE_ENV` is set to "production" by `next build`, so a
 * production bundle cannot render them whatever the flag says.
 */
export const IS_DEV_MODE =
  process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_DEV_MODE === "true";
