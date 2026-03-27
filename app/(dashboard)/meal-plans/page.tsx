"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import { Plus, UtensilsCrossed, Sparkles, ChevronRight } from "lucide-react";

interface Client {
  id: string;
  name: string;
  phone: string;
  status: string;
}

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

export default function MealPlansPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selected, setSelected] = useState<Client | null>(null);
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    api.get("/api/v1/clients")
      .then((res) => {
        const list = res.data.data as Client[];
        setClients(list);
        if (list.length > 0) setSelected(list[0]);
      })
      .catch(() => toast.error("Failed to load clients"))
      .finally(() => setLoadingClients(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoadingPlans(true);
    setPlans([]);
    api.get(`/api/v1/clients/${selected.id}/meal-plans`)
      .then((res) => setPlans(res.data.data))
      .catch(() => toast.error("Failed to load meal plans"))
      .finally(() => setLoadingPlans(false));
  }, [selected]);

  async function createPlan(name: string) {
    if (!selected) return;
    setCreating(true);
    try {
      const res = await api.post(`/api/v1/clients/${selected.id}/meal-plans`, { name });
      setPlans((prev) => [res.data.data, ...prev]);
      setShowForm(false);
      toast.success("Meal plan created");
    } catch {
      toast.error("Failed to create meal plan");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-900">Meal Plans</h1>

      {loadingClients ? (
        <div className="flex justify-center py-16"><Spinner className="w-8 h-8" /></div>
      ) : clients.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16 text-slate-400 text-sm">
            No clients yet.{" "}
            <Link href="/clients/new" className="text-emerald-600 font-medium hover:underline">
              Add a client first →
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="flex gap-5 items-start">
          {/* Client list */}
          <div className="w-56 shrink-0 space-y-1">
            {clients.map((c) => (
              <button
                key={c.id}
                onClick={() => { setSelected(c); setShowForm(false); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  selected?.id === c.id
                    ? "bg-emerald-600 text-white font-medium"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <p className="font-medium truncate">{c.name}</p>
                <p className={`text-xs truncate ${selected?.id === c.id ? "text-emerald-100" : "text-slate-400"}`}>
                  {c.phone}
                </p>
              </button>
            ))}
          </div>

          {/* Plans panel */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                {selected && <span className="font-medium text-slate-700">{selected.name}</span>}
                {plans.length > 0 && <span className="ml-1">· {plans.length} plan{plans.length !== 1 ? "s" : ""}</span>}
              </p>
              {!showForm && (
                <Button size="sm" onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-1" /> New Plan
                </Button>
              )}
            </div>

            {showForm && (
              <NewPlanForm
                onSubmit={createPlan}
                onCancel={() => setShowForm(false)}
                loading={creating}
              />
            )}

            {loadingPlans ? (
              <div className="flex justify-center py-12"><Spinner className="w-6 h-6" /></div>
            ) : plans.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <UtensilsCrossed className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">No meal plans yet for this client.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {plans.map((plan) => (
                  <Link key={plan.id} href={`/meal-plans/${plan.id}`}>
                    <Card className="hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer">
                      <CardContent className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-50 rounded-lg">
                            {plan.aiGenerated
                              ? <Sparkles className="w-4 h-4 text-violet-500" />
                              : <UtensilsCrossed className="w-4 h-4 text-emerald-600" />}
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
                        <div className="flex items-center gap-3">
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
        </div>
      )}
    </div>
  );
}

function NewPlanForm({ onSubmit, onCancel, loading }: {
  onSubmit: (name: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [name, setName] = useState("");

  return (
    <Card>
      <CardHeader><p className="font-semibold text-slate-900 text-sm">New Meal Plan</p></CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) onSubmit(name.trim()); }} className="space-y-3">
          <label className="block space-y-1">
            <span className="text-xs font-medium text-slate-600">Plan name <span className="text-red-500">*</span></span>
            <input
              autoFocus
              type="text"
              placeholder="e.g. Weight Loss — Week 1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </label>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
            <Button type="submit" size="sm" loading={loading} disabled={!name.trim()}>Create</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
