export interface Client {
  id: string;
  name: string;
  phone: string;
  status: string;
}

export interface MealPlan {
  id: string;
  name: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  startDate: string | null;
  endDate: string | null;
  aiGenerated: boolean;
}

export const STATUS_VARIANT: Record<string, "green" | "yellow" | "slate"> = {
  ACTIVE: "green",
  DRAFT: "yellow",
  ARCHIVED: "slate",
};

export type AiJobStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface AiJobResponse {
  id: string;
  clientId: string;
  status: AiJobStatus;
  jobType: string;
  createdAt: string;
  completedAt: string | null;
  errorMessage: string | null;
  generatedMealPlanId: string | null;
  dayCount: number | null;
  mealCount: number | null;
  itemCount: number | null;
  /** Items naming a food outside the curated list — their macros came from the model. */
  unmatchedCount: number | null;
}

export const POLL_INTERVAL_MS = 1500;
export const POLL_TIMEOUT_MS = 90_000;
