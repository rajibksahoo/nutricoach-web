import * as React from "react";
import { Coffee, Sun, Moon, Apple, Zap } from "lucide-react";

export interface MealItem {
  id: string;
  /** Null when the item names a food outside the curated list. */
  foodItemId: string | null;
  foodItemName: string;
  /** True when the macros came with the item rather than from our food data. */
  custom: boolean;
  quantityGrams: number;
  quantityUnit: string;
  calories: number | null;
  proteinG: string | null;
  carbsG: string | null;
  fatG: string | null;
}

export interface Meal {
  id: string;
  mealType: string;
  name: string;
  timeOfDay: string | null;
  sequenceOrder: number;
  items: MealItem[];
}

export interface PlanDay {
  id: string;
  dayNumber: number;
  totalCalories: number | null;
  totalProteinG: string | null;
  totalCarbsG: string | null;
  totalFatG: string | null;
  meals: Meal[];
}

export interface MealPlan {
  id: string;
  clientId: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
  aiGenerated: boolean;
  totalCaloriesTarget: number | null;
  days: PlanDay[];
}

export interface FoodItem {
  id: string;
  name: string;
  nameHindi: string | null;
  category: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

export type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK" | "PRE_WORKOUT" | "POST_WORKOUT";

export const MEAL_TYPES: MealType[] = ["BREAKFAST", "LUNCH", "DINNER", "SNACK", "PRE_WORKOUT", "POST_WORKOUT"];

export const MEAL_TYPE_LABELS: Record<string, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
  SNACK: "Snack",
  PRE_WORKOUT: "Pre-Workout",
  POST_WORKOUT: "Post-Workout",
};

export const MEAL_TYPE_ICONS: Record<string, React.ReactNode> = {
  BREAKFAST: <Coffee size={15} />,
  LUNCH: <Sun size={15} />,
  DINNER: <Moon size={15} />,
  SNACK: <Apple size={15} />,
  PRE_WORKOUT: <Zap size={15} />,
  POST_WORKOUT: <Zap size={15} />,
};

/** Includes COMPLETED, which the list-screen variant does not have. */
export const STATUS_VARIANT: Record<string, "green" | "yellow" | "blue" | "slate"> = {
  ACTIVE: "green",
  DRAFT: "yellow",
  COMPLETED: "blue",
  ARCHIVED: "slate",
};

export const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Macro colours — protein/carbs/fat keep their semantic hues. */
export const MACRO_COLORS = {
  kcal: "var(--fg1)",
  protein: "var(--info)",
  carbs: "var(--warning-700)",
  fat: "var(--danger)",
};

export function calcDayTotals(day: PlanDay) {
  let kcal = 0, prot = 0, carbs = 0, fat = 0;
  for (const meal of day.meals) {
    for (const item of meal.items) {
      kcal += item.calories ?? 0;
      prot += parseFloat(item.proteinG ?? "0");
      carbs += parseFloat(item.carbsG ?? "0");
      fat += parseFloat(item.fatG ?? "0");
    }
  }
  return { kcal, prot: prot.toFixed(1), carbs: carbs.toFixed(1), fat: fat.toFixed(1) };
}
