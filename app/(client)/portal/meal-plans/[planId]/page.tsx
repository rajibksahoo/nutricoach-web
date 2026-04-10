"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import clientApi from "@/lib/client-api";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import { ArrowLeft, UtensilsCrossed, Coffee, Sun, Moon, Apple, Zap } from "lucide-react";

interface MealItem {
  id: string;
  foodItemName: string;
  quantityGrams: number;
  quantityUnit: string;
  calories: number | null;
  proteinG: string | null;
  carbsG: string | null;
  fatG: string | null;
}

interface Meal {
  id: string;
  mealType: string;
  name: string;
  timeOfDay: string | null;
  sequenceOrder: number;
  items: MealItem[];
}

interface PlanDay {
  id: string;
  dayNumber: number;
  totalCalories: number | null;
  totalProteinG: string | null;
  totalCarbsG: string | null;
  totalFatG: string | null;
  meals: Meal[];
}

interface MealPlan {
  id: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
  totalCaloriesTarget: number | null;
  days: PlanDay[];
}

const STATUS_VARIANT: Record<string, "green" | "yellow" | "slate"> = {
  ACTIVE: "green",
  DRAFT: "yellow",
  ARCHIVED: "slate",
  COMPLETED: "slate",
};

const MEAL_ICONS: Record<string, React.ElementType> = {
  BREAKFAST: Coffee,
  LUNCH: Sun,
  DINNER: Moon,
  SNACK: Apple,
  PRE_WORKOUT: Zap,
  POST_WORKOUT: Zap,
};

const MEAL_TYPE_LABELS: Record<string, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
  SNACK: "Snack",
  PRE_WORKOUT: "Pre-workout",
  POST_WORKOUT: "Post-workout",
};

export default function ClientMealPlanDetailPage() {
  const { planId } = useParams<{ planId: string }>();
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(1);

  useEffect(() => {
    clientApi.get(`/api/v1/portal/meal-plans/${planId}`)
      .then((r) => setPlan(r.data.data))
      .catch(() => toast.error("Failed to load meal plan"))
      .finally(() => setLoading(false));
  }, [planId]);

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner className="w-8 h-8" /></div>;
  }

  if (!plan) {
    return (
      <div className="text-center py-20">
        <UtensilsCrossed className="w-8 h-8 text-slate-300 mx-auto mb-3" />
        <p className="text-sm text-slate-400">Meal plan not found.</p>
        <Link href="/portal/meal-plans" className="text-sm text-emerald-600 hover:underline mt-2 inline-block">
          ← Back to meal plans
        </Link>
      </div>
    );
  }

  const currentDay = plan.days.find((d) => d.dayNumber === selectedDay);
  const sortedMeals = [...(currentDay?.meals ?? [])].sort((a, b) => a.sequenceOrder - b.sequenceOrder);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/portal/meal-plans" className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base font-semibold text-slate-900 truncate">{plan.name}</h1>
            <Badge variant={STATUS_VARIANT[plan.status] ?? "slate"}>{plan.status}</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {plan.days.length} day{plan.days.length !== 1 ? "s" : ""}
            {plan.startDate && ` · ${formatDate(plan.startDate)}`}
            {plan.endDate && ` – ${formatDate(plan.endDate)}`}
            {plan.totalCaloriesTarget && ` · ${plan.totalCaloriesTarget} kcal/day target`}
          </p>
        </div>
      </div>

      {plan.description && (
        <p className="text-sm text-slate-500 bg-white border border-slate-100 rounded-xl px-4 py-3">
          {plan.description}
        </p>
      )}

      {plan.days.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UtensilsCrossed className="w-7 h-7 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No days added to this plan yet.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Day selector */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {plan.days.map((d) => (
              <button
                key={d.dayNumber}
                onClick={() => setSelectedDay(d.dayNumber)}
                className={`shrink-0 w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${
                  selectedDay === d.dayNumber
                    ? "bg-emerald-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-emerald-300"
                }`}
              >
                {d.dayNumber}
              </button>
            ))}
          </div>

          {/* Day summary */}
          {currentDay && (
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Calories", value: currentDay.totalCalories != null ? `${currentDay.totalCalories}` : "—" },
                { label: "Protein", value: currentDay.totalProteinG != null ? `${parseFloat(currentDay.totalProteinG).toFixed(0)}g` : "—" },
                { label: "Carbs", value: currentDay.totalCarbsG != null ? `${parseFloat(currentDay.totalCarbsG).toFixed(0)}g` : "—" },
                { label: "Fat", value: currentDay.totalFatG != null ? `${parseFloat(currentDay.totalFatG).toFixed(0)}g` : "—" },
              ].map(({ label, value }) => (
                <Card key={label}>
                  <CardContent className="py-3 text-center">
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5">{value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Meals */}
          {sortedMeals.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-sm text-slate-400">No meals for Day {selectedDay}.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sortedMeals.map((meal) => {
                const Icon = MEAL_ICONS[meal.mealType] ?? UtensilsCrossed;
                return (
                  <Card key={meal.id}>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-emerald-600 shrink-0" />
                        <p className="text-sm font-semibold text-slate-900">
                          {meal.name || MEAL_TYPE_LABELS[meal.mealType] || meal.mealType}
                        </p>
                        {meal.timeOfDay && (
                          <span className="text-xs text-slate-400 ml-auto">{meal.timeOfDay}</span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="py-3">
                      {meal.items.length === 0 ? (
                        <p className="text-xs text-slate-400">No items added.</p>
                      ) : (
                        <div className="space-y-2">
                          {meal.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-slate-800">{item.foodItemName}</p>
                                <p className="text-xs text-slate-400">
                                  {item.quantityGrams}g
                                  {item.calories != null && ` · ${item.calories} kcal`}
                                </p>
                              </div>
                              {(item.proteinG || item.carbsG || item.fatG) && (
                                <p className="text-xs text-slate-400 shrink-0 ml-3">
                                  P:{item.proteinG ? parseFloat(item.proteinG).toFixed(0) : "—"}g
                                  {" "}C:{item.carbsG ? parseFloat(item.carbsG).toFixed(0) : "—"}g
                                  {" "}F:{item.fatG ? parseFloat(item.fatG).toFixed(0) : "—"}g
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
