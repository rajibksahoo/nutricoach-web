"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import clientApi from "@/lib/client-api";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import { ClipboardList, Plus, X } from "lucide-react";

interface CheckIn {
  id: string;
  checkInDate: string;
  adherencePercent: number | null;
  clientNotes: string | null;
  coachNotes: string | null;
  mealPlanId: string | null;
}

interface MealPlanOption {
  id: string;
  name: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
}

interface ApiEnvelope<T> { success: boolean; message?: string; data: T; }

const inputCls =
  "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition";

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function ClientCheckInsPage() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [plans, setPlans] = useState<MealPlanOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadHistory = useCallback(async () => {
    const r = await clientApi.get<ApiEnvelope<CheckIn[]>>("/api/v1/portal/check-ins");
    setCheckIns(r.data.data);
  }, []);

  useEffect(() => {
    // The check-in payload requires a mealPlanId, so the picker options load alongside history.
    Promise.all([
      loadHistory(),
      clientApi
        .get<ApiEnvelope<MealPlanOption[]>>("/api/v1/portal/meal-plans")
        .then((r) => setPlans(r.data.data))
        .catch(() => setPlans([])),
    ])
      .catch(() => toast.error("Failed to load check-ins"))
      .finally(() => setLoading(false));
  }, [loadHistory]);

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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Check-ins</h1>
        <Button size="sm" variant={showForm ? "secondary" : "primary"} onClick={() => setShowForm((v) => !v)}>
          {showForm
            ? <><X className="w-3.5 h-3.5 mr-1" />Cancel</>
            : <><Plus className="w-3.5 h-3.5 mr-1" />New check-in</>}
        </Button>
      </div>

      {showForm && (
        <CheckInForm
          plans={plans}
          onCancel={() => setShowForm(false)}
          onSaved={async () => {
            setShowForm(false);
            try { await loadHistory(); } catch { /* refresh is best-effort; the check-in is already saved */ }
          }}
        />
      )}

      {checkIns.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No check-ins recorded yet.</p>
            <p className="text-xs text-slate-400 mt-1">
              {plans.length === 0
                ? "Your coach needs to share a meal plan before you can check in."
                : "Tap “New check-in” to log how this week went."}
            </p>
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

/* ── Check-in form ─────────────────────────────────────────────── */

function CheckInForm({
  plans, onSaved, onCancel,
}: {
  plans: MealPlanOption[];
  onSaved: () => void;
  onCancel: () => void;
}) {
  // Default to the active plan when there is one — that's what a client is almost always checking in against.
  const defaultPlan = plans.find((p) => p.status === "ACTIVE")?.id ?? plans[0]?.id ?? "";
  const [checkInDate, setCheckInDate] = useState(todayIso());
  const [mealPlanId, setMealPlanId] = useState(defaultPlan);
  const [adherence, setAdherence] = useState(80);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!mealPlanId) {
      toast.error("Pick a meal plan to check in against");
      return;
    }
    setSaving(true);
    try {
      // coachNotes is deliberately omitted — the server strips it for client callers.
      await clientApi.post("/api/v1/portal/check-ins", {
        checkInDate,
        mealPlanId,
        adherencePercent: adherence,
        clientNotes: notes.trim() || null,
      });
      toast.success("Check-in submitted");
      onSaved();
    } catch {
      toast.error("Failed to submit check-in");
    } finally {
      setSaving(false);
    }
  }

  if (plans.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-sm text-slate-500">No meal plan to check in against yet.</p>
          <p className="text-xs text-slate-400 mt-1">Your coach needs to share one first.</p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={onCancel}>Close</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><p className="text-sm font-semibold text-slate-900">New check-in</p></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="block text-xs font-medium text-slate-600 mb-1">
              Date<span className="text-red-500 ml-0.5">*</span>
            </span>
            <input type="date" value={checkInDate} max={todayIso()} required
              onChange={(e) => setCheckInDate(e.target.value)} className={inputCls} />
          </label>

          <label className="block">
            <span className="block text-xs font-medium text-slate-600 mb-1">
              Meal plan<span className="text-red-500 ml-0.5">*</span>
            </span>
            <select value={mealPlanId} onChange={(e) => setMealPlanId(e.target.value)} required className={inputCls}>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}{p.status !== "ACTIVE" ? ` (${p.status.toLowerCase()})` : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="flex items-center justify-between text-xs font-medium text-slate-600 mb-1">
              <span>How closely did you follow it?</span>
              <span className="text-sm font-bold text-indigo-600 tabular-nums">{adherence}%</span>
            </span>
            <input type="range" min={0} max={100} step={5} value={adherence}
              onChange={(e) => setAdherence(Number(e.target.value))}
              className="w-full accent-indigo-600" />
          </label>

          <label className="block">
            <span className="block text-xs font-medium text-slate-600 mb-1">Notes for your coach</span>
            <textarea rows={3} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="What went well? What got in the way?"
              className={`${inputCls} resize-none`} />
          </label>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
            <Button type="submit" size="sm" loading={saving}>Submit</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
