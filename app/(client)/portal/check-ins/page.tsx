"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import clientApi from "@/lib/client-api";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import { ClipboardList } from "lucide-react";

interface CheckIn {
  id: string;
  checkInDate: string;
  adherencePercent: number | null;
  clientNotes: string | null;
  coachNotes: string | null;
  mealPlanId: string | null;
}

export default function ClientCheckInsPage() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientApi.get("/api/v1/portal/check-ins")
      .then((r) => setCheckIns(r.data.data))
      .catch(() => toast.error("Failed to load check-ins"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner className="w-8 h-8" /></div>;
  }

  function adherenceColor(pct: number | null): string {
    if (pct == null) return "text-slate-400";
    if (pct >= 80) return "text-indigo-600";
    if (pct >= 60) return "text-amber-600";
    return "text-red-500";
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-slate-900">Check-ins</h1>

      {checkIns.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No check-ins recorded yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <p className="text-sm font-semibold text-slate-900">
              {checkIns.length} check-in{checkIns.length !== 1 ? "s" : ""}
            </p>
          </CardHeader>
          <CardContent className="py-0 divide-y divide-slate-100">
            {checkIns.map((ci) => (
              <div key={ci.id} className="py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-800">{formatDate(ci.checkInDate)}</p>
                  {ci.adherencePercent != null && (
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Adherence</p>
                      <p className={`text-sm font-semibold ${adherenceColor(ci.adherencePercent)}`}>
                        {ci.adherencePercent}%
                      </p>
                    </div>
                  )}
                </div>
                {ci.clientNotes && (
                  <p className="text-xs text-slate-500 mt-1.5 bg-slate-50 rounded-lg px-3 py-2">
                    <span className="font-medium">Your note:</span> {ci.clientNotes}
                  </p>
                )}
                {ci.coachNotes && (
                  <p className="text-xs text-indigo-700 mt-1 bg-indigo-50 rounded-lg px-3 py-2">
                    <span className="font-medium">Coach:</span> {ci.coachNotes}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
