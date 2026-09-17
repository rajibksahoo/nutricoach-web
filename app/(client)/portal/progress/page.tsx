"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import clientApi from "@/lib/client-api";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import Spark from "@/components/ui/Spark";
import { TrendingUp, TrendingDown, Minus, Plus, X } from "lucide-react";

interface ProgressLog {
  id: string;
  loggedDate: string;
  weightKg: number | null;
  adherencePercent: number | null;
  notes: string | null;
}

interface ApiEnvelope<T> { success: boolean; message?: string; data: T; }

const inputCls =
  "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition";

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function ClientProgressPage() {
  const [logs, setLogs] = useState<ProgressLog[]>([]);
  const [chart, setChart] = useState<ProgressLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    const [history, chartData] = await Promise.all([
      clientApi.get<ApiEnvelope<ProgressLog[]>>("/api/v1/portal/progress"),
      clientApi.get<ApiEnvelope<ProgressLog[]>>("/api/v1/portal/progress/chart?days=30"),
    ]);
    setLogs(history.data.data);
    setChart(chartData.data.data);
  }, []);

  useEffect(() => {
    load()
      .catch(() => toast.error("Failed to load progress"))
      .finally(() => setLoading(false));
  }, [load]);

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

  // Chart comes back ascending; keep only points that actually carry a weight.
  const weightSeries = chart.map((l) => l.weightKg).filter((w): w is number => w != null);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Progress</h1>
        <Button size="sm" variant={showForm ? "secondary" : "primary"} onClick={() => setShowForm((v) => !v)}>
          {showForm
            ? <><X className="w-3.5 h-3.5 mr-1" />Cancel</>
            : <><Plus className="w-3.5 h-3.5 mr-1" />Log weight</>}
        </Button>
      </div>

      {showForm && (
        <LogProgressForm
          onCancel={() => setShowForm(false)}
          onSaved={async () => {
            setShowForm(false);
            try { await load(); } catch { /* refresh is best-effort; the entry is already saved */ }
          }}
        />
      )}

      {logs.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <TrendingUp className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No progress logs yet.</p>
            <p className="text-xs text-slate-400 mt-1">Tap &ldquo;Log weight&rdquo; to record your first entry.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary */}
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

          {weightSeries.length > 1 && (
            <Card>
              <CardHeader>
                <p className="text-sm font-semibold text-slate-900">Weight — last 30 days</p>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Spark data={weightSeries} w={560} h={120} fill axis />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <p className="text-sm font-semibold text-slate-900">History</p>
            </CardHeader>
            <CardContent className="py-0 divide-y divide-slate-100">
              {logs.map((log, idx) => {
                const trend = weightTrend(idx);
                const TrendIcon = trend === "down" ? TrendingDown : trend === "up" ? TrendingUp : Minus;
                const trendColor = trend === "down" ? "text-indigo-500" : trend === "up" ? "text-red-400" : "text-slate-300";

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

/* ── Log form ──────────────────────────────────────────────────── */

const EMPTY = {
  loggedDate: "",
  weightKg: "",
  bodyFatPercent: "",
  waistCm: "",
  chestCm: "",
  hipCm: "",
  notes: "",
};

function LogProgressForm({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ ...EMPTY, loggedDate: todayIso() });
  const [saving, setSaving] = useState(false);

  function set(key: keyof typeof EMPTY, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Ranges mirror LogProgressRequest's server-side @DecimalMin/@DecimalMax.
    const payload: Record<string, unknown> = { loggedDate: form.loggedDate };
    if (form.weightKg) payload.weightKg = parseFloat(form.weightKg);
    if (form.bodyFatPercent) payload.bodyFatPercent = parseFloat(form.bodyFatPercent);
    if (form.waistCm) payload.waistCm = parseFloat(form.waistCm);
    if (form.chestCm) payload.chestCm = parseFloat(form.chestCm);
    if (form.hipCm) payload.hipCm = parseFloat(form.hipCm);
    if (form.notes.trim()) payload.notes = form.notes.trim();

    if (Object.keys(payload).length === 1) {
      toast.error("Enter at least one measurement");
      return;
    }

    setSaving(true);
    try {
      await clientApi.post("/api/v1/portal/progress", payload);
      toast.success("Progress logged");
      onSaved();
    } catch {
      toast.error("Failed to save progress");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader><p className="text-sm font-semibold text-slate-900">Log progress</p></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date" required>
              <input type="date" value={form.loggedDate} max={todayIso()}
                onChange={(e) => set("loggedDate", e.target.value)} required className={inputCls} />
            </Field>
            <Field label="Weight (kg)">
              <input type="number" step="0.1" min="10" max="500" inputMode="decimal" placeholder="e.g. 72.5"
                value={form.weightKg} onChange={(e) => set("weightKg", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Body fat (%)">
              <input type="number" step="0.1" min="0" max="70" inputMode="decimal" placeholder="e.g. 22"
                value={form.bodyFatPercent} onChange={(e) => set("bodyFatPercent", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Waist (cm)">
              <input type="number" step="0.1" min="30" max="300" inputMode="decimal" placeholder="e.g. 80"
                value={form.waistCm} onChange={(e) => set("waistCm", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Chest (cm)">
              <input type="number" step="0.1" min="30" max="300" inputMode="decimal" placeholder="e.g. 95"
                value={form.chestCm} onChange={(e) => set("chestCm", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Hip (cm)">
              <input type="number" step="0.1" min="30" max="300" inputMode="decimal" placeholder="e.g. 92"
                value={form.hipCm} onChange={(e) => set("hipCm", e.target.value)} className={inputCls} />
            </Field>
          </div>
          <Field label="Notes">
            <textarea rows={2} maxLength={1000} placeholder="How are you feeling?" value={form.notes}
              onChange={(e) => set("notes", e.target.value)} className={`${inputCls} resize-none`} />
          </Field>
          <p className="text-xs text-slate-400">
            Logging twice on the same date updates that day&rsquo;s entry.
          </p>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
            <Button type="submit" size="sm" loading={saving}>Save</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-600 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}
