"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { getCoach } from "@/lib/auth";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Badge, { clientStatusBadge } from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import { Users, UtensilsCrossed, AlertCircle, UserPlus } from "lucide-react";

interface DashboardData {
  totalClients: number;
  activeClients: number;
  onboardingClients: number;
  inactiveClients: number;
  totalMealPlans: number;
  clientsNeedingPlan: number;
  recentClients: { id: string; name: string; phone: string; status: string }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const coach = getCoach();

  useEffect(() => {
    api.get("/api/v1/coach/dashboard")
      .then((res) => setData(res.data.data))
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner className="w-8 h-8" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Good {getGreeting()}, {coach?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Here's what's happening with your clients</p>
        </div>
        <Link href="/clients/new">
          <Button size="sm">
            <UserPlus className="w-4 h-4 mr-1.5" />
            Add Client
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Clients" value={data?.totalClients ?? 0} icon={<Users className="w-5 h-5 text-indigo-600" />} />
        <StatCard label="Active" value={data?.activeClients ?? 0} icon={<Users className="w-5 h-5 text-blue-600" />} />
        <StatCard label="Meal Plans" value={data?.totalMealPlans ?? 0} icon={<UtensilsCrossed className="w-5 h-5 text-violet-600" />} />
        <StatCard label="Need a Plan" value={data?.clientsNeedingPlan ?? 0} icon={<AlertCircle className="w-5 h-5 text-amber-500" />} alert={(data?.clientsNeedingPlan ?? 0) > 0} />
      </div>

      {/* Recent Clients */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Recent Clients</h2>
            <Link href="/clients" className="text-sm text-indigo-600 font-medium hover:underline">
              View all
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!data?.recentClients?.length ? (
            <div className="px-5 py-10 text-center text-slate-400 text-sm">
              No clients yet.{" "}
              <Link href="/clients/new" className="text-indigo-600 font-medium hover:underline">
                Add your first client →
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.recentClients.map((c) => (
                <li key={c.id}>
                  <Link href={`/clients/${c.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.phone}</p>
                    </div>
                    <Badge variant={clientStatusBadge(c.status)}>{c.status}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, icon, alert }: { label: string; value: number; icon: React.ReactNode; alert?: boolean }) {
  return (
    <Card className={alert ? "border-amber-200 bg-amber-50/50" : ""}>
      <CardContent className="flex items-center gap-3 py-4">
        <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm">{icon}</div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
