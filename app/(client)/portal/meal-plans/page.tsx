"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import clientApi from "@/lib/client-api";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import { UtensilsCrossed, Sparkles, ChevronRight } from "lucide-react";

interface MealPlan {
  id: string;
  name: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  startDate: string | null;
  endDate: string | null;
  totalDays: number;
  aiGenerated: boolean;
}

const STATUS_VARIANT: Record<string, "green" | "yellow" | "slate"> = {
  ACTIVE: "green",
  DRAFT: "yellow",
  ARCHIVED: "slate",
};

export default function ClientMealPlansPage() {
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientApi.get("/api/v1/portal/meal-plans")
      .then((r) => setPlans(r.data.data))
      .catch(() => toast.error("Failed to load meal plans"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner className="w-8 h-8" /></div>;
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-slate-900">Meal Plans</h1>

      {plans.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <UtensilsCrossed className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No meal plans yet. Your coach will assign one soon.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <Link key={plan.id} href={`/portal/meal-plans/${plan.id}`}>
              <Card className="hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      {plan.aiGenerated
                        ? <Sparkles className="w-4 h-4 text-violet-500" />
                        : <UtensilsCrossed className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{plan.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {plan.totalDays} day{plan.totalDays !== 1 ? "s" : ""}
                        {plan.startDate && ` · ${formatDate(plan.startDate)}`}
                        {plan.endDate && ` – ${formatDate(plan.endDate)}`}
                        {plan.aiGenerated && " · AI generated"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={STATUS_VARIANT[plan.status] ?? "slate"}>{plan.status}</Badge>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
