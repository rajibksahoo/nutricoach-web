"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import clientApi from "@/lib/client-api";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ProgressLog {
  id: string;
  loggedDate: string;
  weightKg: number | null;
  adherencePercent: number | null;
  notes: string | null;
}

export default function ClientProgressPage() {
  const [logs, setLogs] = useState<ProgressLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientApi.get("/api/v1/portal/progress")
      .then((r) => setLogs(r.data.data))
      .catch(() => toast.error("Failed to load progress"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner className="w-8 h-8" /></div>;
  }

  function weightTrend(index: number): "up" | "down" | "same" {
    if (index >= logs.length - 1) return "same";
    const curr = logs[index].weightKg;
    const prev = logs[index + 1].weightKg;
    if (curr == null || prev == null) return "same";
    if (curr < prev) return "down";
    if (curr > prev) return "up";
    return "same";
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-slate-900">Progress</h1>

      {logs.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <TrendingUp className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No progress logs yet.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary */}
          {logs.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="py-4">
                  <p className="text-xs text-slate-500 mb-1">Latest weight</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {logs[0].weightKg != null ? `${logs[0].weightKg} kg` : "—"}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatDate(logs[0].loggedDate)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <p className="text-xs text-slate-500 mb-1">Total logs</p>
                  <p className="text-2xl font-bold text-slate-900">{logs.length}</p>
                  <p className="text-xs text-slate-400 mt-0.5">since {formatDate(logs[logs.length - 1].loggedDate)}</p>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <p className="text-sm font-semibold text-slate-900">History</p>
            </CardHeader>
            <CardContent className="py-0 divide-y divide-slate-100">
              {logs.map((log, idx) => {
                const trend = weightTrend(idx);
                const TrendIcon = trend === "down" ? TrendingDown : trend === "up" ? TrendingUp : Minus;
                const trendColor = trend === "down" ? "text-emerald-500" : trend === "up" ? "text-red-400" : "text-slate-300";

                return (
                  <div key={log.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{formatDate(log.loggedDate)}</p>
                      {log.notes && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{log.notes}</p>}
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      {log.adherencePercent != null && (
                        <div>
                          <p className="text-xs text-slate-400">Adherence</p>
                          <p className="text-sm font-semibold text-slate-800">{log.adherencePercent}%</p>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <TrendIcon className={`w-3.5 h-3.5 ${trendColor}`} />
                        <div>
                          <p className="text-xs text-slate-400">Weight</p>
                          <p className="text-sm font-semibold text-slate-800">
                            {log.weightKg != null ? `${log.weightKg} kg` : "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
