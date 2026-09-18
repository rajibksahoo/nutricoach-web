/**
 * The option lists for a client's profile fields.
 *
 * Shared so the add-client form and the settings editor cannot drift — the two
 * already disagreed on goal labels ("Weight loss" vs "Weight Loss") when each
 * kept its own copy.
 *
 * Every `value` must match the corresponding enum on `Client`
 * (`Goal`, `DietaryPref`, `ActivityLevel`, `Gender`, `Status`) — the backend
 * rejects anything else.
 */

export interface ClientOption {
  value: string;
  label: string;
}

export const GOALS: ClientOption[] = [
  { value: "WEIGHT_LOSS", label: "Weight loss" },
  { value: "WEIGHT_GAIN", label: "Weight gain" },
  { value: "MUSCLE_GAIN", label: "Muscle gain" },
  { value: "MAINTENANCE", label: "Maintenance" },
];

export const DIETARY_PREFS: ClientOption[] = [
  { value: "VEG", label: "Vegetarian" },
  { value: "NON_VEG", label: "Non-Veg" },
  { value: "VEGAN", label: "Vegan" },
  { value: "JAIN", label: "Jain" },
  { value: "EGGETARIAN", label: "Eggetarian" },
];

export const ACTIVITY_LEVELS: ClientOption[] = [
  { value: "SEDENTARY", label: "Sedentary" },
  { value: "LIGHT", label: "Light" },
  { value: "MODERATE", label: "Moderate" },
  { value: "ACTIVE", label: "Active" },
  { value: "VERY_ACTIVE", label: "Very Active" },
];

export const GENDERS: ClientOption[] = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

/** Matches `Client.Status` exactly — there is no PAUSED. */
export const STATUSES: ClientOption[] = [
  { value: "ONBOARDING", label: "Onboarding" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export function optionLabel(options: ClientOption[], value: string | null | undefined): string {
  return options.find((o) => o.value === value)?.label ?? value ?? "—";
}
