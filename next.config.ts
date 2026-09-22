import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

/**
 * Sentry's build step uploads source maps so a production stack trace names
 * real files instead of minified bundles. It needs SENTRY_ORG, SENTRY_PROJECT
 * and SENTRY_AUTH_TOKEN at build time; without them the upload is skipped and
 * the build still succeeds, which is what keeps local builds and CI working
 * before Sentry is set up.
 */
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  // Strip uploaded maps from the client bundle: they name every source file
  // and there is no reason to serve them to a browser.
  sourcemaps: { deleteSourcemapsAfterUpload: true },
  disableLogger: true,
});
