"use client";

import { useParams } from "next/navigation";

export default function MealPlanPage() {
  const { id } = useParams();
  return (
    <div className="text-slate-500 text-sm py-10 text-center">
      Meal plan builder — coming soon (Plan ID: {id})
    </div>
  );
}
