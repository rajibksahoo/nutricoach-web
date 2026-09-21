"use client";

import { useParams } from "next/navigation";
import MealPlanBuilderScreen from "@/components/meal-plans/builder/MealPlanBuilderScreen";

export default function MealPlanBuilderPage() {
  const params = useParams();
  return <MealPlanBuilderScreen planId={params.id as string} />;
}
