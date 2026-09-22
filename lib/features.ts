/**
 * Section visibility — the one place that decides what is shown.
 *
 * Flip a flag in {@link SECTIONS}, redeploy, and the section disappears from
 * every nav that offers it and every URL that serves it. Nothing is deleted:
 * the routes and their pages stay in the codebase, so turning a section back on
 * is a one-word change.
 *
 * **This file holds booleans and route mappings only — no labels, no icons, no
 * JSX.** Nav arrays keep their own presentation and just declare which section
 * they belong to. Pulling labels and icons in here would turn the config into a
 * component file and destroy the thing that makes it useful: that you can read
 * the whole product's visibility in one screen.
 *
 * Not to be confused with {@link ./plans.ts}, which gates features by *paid
 * tier*. That is a different axis: `plans.ts` answers "has this coach paid for
 * it", this file answers "have we shipped it at all". A section can be off here
 * and still be listed there, or vice versa.
 */

/**
 * Every toggleable section. `true` = visible.
 *
 * The defaults reproduce the product as shipped on 2026-09-22, when it was
 * aimed at fitness coaches: the Library's Fitness group is live and the other
 * three groups are stubs. See the launch-persona note at the top of
 * `nutricoach/PROGRESS.md` before turning one on — a group whose pages are
 * still `ComingSoon` puts dead ends back in the nav.
 */
export const SECTIONS = {
  // ── Coach app · main sidebar ────────────────────────────────────────────
  dashboard: true,
  clients: true,
  mealPlans: true,
  library: true,
  progress: true,
  messaging: true,
  billing: true,
  profile: true,

  // ── Library · section pane groups ───────────────────────────────────────
  libraryFitness: true,
  libraryNutrition: false, // pages are ComingSoon stubs
  libraryHabits: false, // pages are ComingSoon stubs
  libraryForms: false, // pages are ComingSoon stubs

  // ── Client detail · tab strip ───────────────────────────────────────────
  clientTabTasks: false, // renders a "PLANNED" placeholder
  clientTabFoodJournal: false, // renders a "PLANNED" placeholder
  clientTabMealPlan: false, // renders a "PLANNED" placeholder

  // ── Client portal · bottom tabs ─────────────────────────────────────────
  portalHome: true,
  portalMealPlans: true,
  portalWorkouts: true,
  portalProgress: true,
  portalCheckIns: true,
  portalChat: true,
  portalProfile: true,
} satisfies Record<string, boolean>;

export type SectionKey = keyof typeof SECTIONS;

/** Whether a section is switched on. */
export function isEnabled(key: SectionKey): boolean {
  return SECTIONS[key];
}

/**
 * Which section owns a URL, for the route guards.
 *
 * Ordered longest-prefix-first because the Library's groups do not share a URL
 * prefix — `/library/recipes` belongs to Nutrition while `/library/exercises`
 * belongs to Fitness, and both sit under `/library`. A shorter prefix listed
 * first would swallow the more specific ones.
 *
 * A path with no entry here is never blocked (see {@link isPathEnabled}), so
 * routes like `/clients/new`, `/onboarding` and the legal pages need no entry.
 */
const ROUTE_SECTIONS: ReadonlyArray<readonly [string, SectionKey]> = [
  // Library — must come before the bare "/library" entry.
  ["/library/exercises", "libraryFitness"],
  ["/library/workouts", "libraryFitness"],
  ["/library/sections", "libraryFitness"],
  ["/library/programs", "libraryFitness"],
  ["/library/meal-plans", "libraryNutrition"],
  ["/library/recipe-books", "libraryNutrition"],
  ["/library/recipes", "libraryNutrition"],
  ["/library/ingredients", "libraryNutrition"],
  // Orphaned stub: no nav entry points here (the Nutrition group links
  // /library/meal-plans instead), but the URL still resolves, so the guard
  // covers it. Worth deleting separately.
  ["/library/nutrition", "libraryNutrition"],
  ["/library/tasks", "libraryHabits"],
  ["/library/metric-groups", "libraryHabits"],
  ["/library/forms", "libraryForms"],

  // Coach app.
  ["/dashboard", "dashboard"],
  ["/clients", "clients"],
  ["/meal-plans", "mealPlans"],
  ["/library", "library"],
  ["/progress", "progress"],
  ["/messages", "messaging"],
  ["/billing", "billing"],
  ["/profile", "profile"],

  // Client portal.
  ["/portal/home", "portalHome"],
  ["/portal/meal-plans", "portalMealPlans"],
  ["/portal/workouts", "portalWorkouts"],
  ["/portal/progress", "portalProgress"],
  ["/portal/check-ins", "portalCheckIns"],
  ["/portal/chat", "portalChat"],
  ["/portal/profile", "portalProfile"],
];

function matches(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

/** The section that owns `pathname`, or null when nothing claims it. */
export function sectionForPath(pathname: string): SectionKey | null {
  for (const [prefix, key] of ROUTE_SECTIONS) {
    if (matches(pathname, prefix)) return key;
  }
  return null;
}

/**
 * Whether a URL may be served. Unclaimed paths are always allowed — the guard
 * exists to hide sections we chose to hide, not to become a second router that
 * blocks anything it was not told about.
 */
export function isPathEnabled(pathname: string): boolean {
  const key = sectionForPath(pathname);
  return key === null || isEnabled(key);
}

/** Ordered fallbacks per area: the first enabled one is where we send people. */
const AREA_FALLBACKS = {
  coach: [
    ["/dashboard", "dashboard"],
    ["/clients", "clients"],
    ["/meal-plans", "mealPlans"],
    ["/library", "library"],
    ["/progress", "progress"],
    ["/messages", "messaging"],
    ["/billing", "billing"],
    ["/profile", "profile"],
  ],
  library: [
    ["/library/exercises", "libraryFitness"],
    ["/library/meal-plans", "libraryNutrition"],
    ["/library/tasks", "libraryHabits"],
    ["/library/forms", "libraryForms"],
  ],
  portal: [
    ["/portal/home", "portalHome"],
    ["/portal/workouts", "portalWorkouts"],
    ["/portal/meal-plans", "portalMealPlans"],
    ["/portal/progress", "portalProgress"],
    ["/portal/check-ins", "portalCheckIns"],
    ["/portal/chat", "portalChat"],
    ["/portal/profile", "portalProfile"],
  ],
} satisfies Record<string, ReadonlyArray<readonly [string, SectionKey]>>;

export type Area = keyof typeof AREA_FALLBACKS;

/**
 * Where to send someone who asked for a disabled section.
 *
 * If every group in the Library is off, defer to the coach area rather than
 * inventing a Library destination — landing on the dashboard reads as "that
 * section is gone", landing on a Library URL that then redirects again does not.
 *
 * The last resort is `/profile`, which has no switch of its own that could send
 * the user straight back here. A redirect loop is worse than a dull landing.
 */
export function firstEnabledPath(area: Area): string {
  const found = AREA_FALLBACKS[area].find(([, key]) => isEnabled(key));
  if (found) return found[0];
  if (area === "library") return firstEnabledPath("coach");
  return area === "portal" ? "/portal/profile" : "/profile";
}
