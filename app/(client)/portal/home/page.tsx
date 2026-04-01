"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import clientApi from "@/lib/client-api";
import { getClientUser } from "@/lib/client-auth";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import { UtensilsCrossed, TrendingUp, ClipboardList, ChevronRight, Sparkles } from "lucide-react";

interface MealPlan {
  id: string;
  name: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  startDate: string | null;
  totalDays: number;
  aiGenerated: boolean;
}

interface ProgressLog {
  loggedDate: string;
  weightKg: number | null;
  adherencePercent: number | null;
}

const STATUS_VARIANT: Record<string, "green" | "yellow" | "slate"> = {
  ACTIVE: "green",
  DRAFT: "yellow",
  ARCHIVED: "slate",
};

export default function ClientHomePage() {
  const client = getClientUser();
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [latestLog, setLatestLog] = useState<ProgressLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      clientApi.get("/api/v1/portal/meal-plans").then((r) => setPlans(r.data.data)),
      clientApi.get("/api/v1/portal/progress").then((r) => {
        const logs: ProgressLog[] = r.data.data;
        if (logs.length > 0) setLatestLog(logs[0]);
      }),
    ])
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  const activePlan = plans.find((p) => p.status === "ACTIVE") ?? plans[0] ?? null;

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner className="w-8 h-8" /></div>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Hi, {client?.name?.split(" ")[0] ?? "there"} 👋
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Here's your nutrition overview</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-slate-500 mb-1">Current weight</p>
            <p className="text-xl font-bold text-slate-900">
              {latestLog?.weightKg != null ? `${latestLog.weightKg} kg` : "—"}
            </p>
            {latestLog && (
              <p className="text-xs text-slate-400 mt-0.5">{formatDate(latestLog.loggedDate)}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-slate-500 mb-1">Last adherence</p>
            <p className="text-xl font-bold text-slate-900">
              {latestLog?.adherencePercent != null ? `${latestLog.adherencePercent}%` : "—"}
            </p>
            {latestLog && (
              <p className="text-xs text-slate-400 mt-0.5">{formatDate(latestLog.loggedDate)}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active meal plan */}
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Active Meal Plan</p>
        {activePlan ? (
          <Link href={`/portal/meal-plans/${activePlan.id}`}>
            <Card className="hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer">
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    {activePlan.aiGenerated
                      ? <Sparkles className="w-4 h-4 text-violet-500" />
                      : <UtensilsCrossed className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{activePlan.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {activePlan.totalDays} days
                      {activePlan.startDate && ` · From ${formatDate(activePlan.startDate)}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={STATUS_VARIANT[activePlan.status] ?? "slate"}>{activePlan.status}</Badge>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <UtensilsCrossed className="w-7 h-7 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No meal plan assigned yet</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { href: "/portal/meal-plans", icon: UtensilsCrossed, label: "Meal Plans", count: plans.length },
          { href: "/portal/progress", icon: TrendingUp, label: "Progress", count: null },
          { href: "/portal/check-ins", icon: ClipboardList, label: "Check-ins", count: null },
        ].map(({ href, icon: Icon, label, count }) => (
          <Link key={href} href={href}>
            <Card className="hover:border-emerald-200 hover:shadow-sm transition-all cursor-pointer">
              <CardContent className="flex flex-col items-center py-4 gap-1">
                <Icon className="w-5 h-5 text-emerald-600" />
                <p className="text-xs font-medium text-slate-700">{label}</p>
                {count != null && <p className="text-xs text-slate-400">{count}</p>}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
