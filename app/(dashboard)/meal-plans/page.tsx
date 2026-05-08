"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import { Plus, UtensilsCrossed, Sparkles, ChevronRight, X } from "lucide-react";

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
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [selected, setSelected] = useState<Client | null>(null);
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

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
      {showAiModal && selected && (
        <AiGenerateModal
          client={selected}
          onClose={() => setShowAiModal(false)}
          onGenerated={(planId) => {
            setShowAiModal(false);
            router.push(`/meal-plans/${planId}`);
          }}
        />
      )}

      {loadingClients ? (
        <div className="flex justify-center py-16"><Spinner className="w-8 h-8" /></div>
      ) : clients.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16 text-slate-400 text-sm">
            No clients yet.{" "}
            <Link href="/clients/new" className="text-indigo-600 font-medium hover:underline">
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
                    ? "bg-indigo-600 text-white font-medium"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <p className="font-medium truncate">{c.name}</p>
                <p className={`text-xs truncate ${selected?.id === c.id ? "text-indigo-100" : "text-slate-400"}`}>
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
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setShowAiModal(true)}>
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-violet-500" /> AI Generate
                  </Button>
                  <Button size="sm" onClick={() => setShowForm(true)}>
                    <Plus className="w-4 h-4 mr-1" /> New Plan
                  </Button>
                </div>
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

// ─── AI Generate Modal ────────────────────────────────────────────────────────

type AiJobStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

interface AiJobResponse {
  id: string;
  clientId: string;
  status: AiJobStatus;
  jobType: string;
  createdAt: string;
  completedAt: string | null;
  errorMessage: string | null;
  generatedMealPlanId: string | null;
}

const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 90_000;

function AiGenerateModal({ client, onClose, onGenerated }: {
  client: Client;
  onClose: () => void;
  onGenerated: (planId: string) => void;
}) {
  const [status, setStatus] = useState<AiJobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    return () => { cancelledRef.current = true; };
  }, []);

  const isWorking = status === "PENDING" || status === "PROCESSING";

  async function startGenerate() {
    setError(null);
    setStatus("PENDING");
    try {
      const res = await api.post("/api/v1/ai/meal-plans/generate", { clientId: client.id });
      const job: AiJobResponse = res.data.data;
      await pollJob(job.id);
    } catch (e: unknown) {
      if (cancelledRef.current) return;
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to start AI generation";
      setError(msg);
      setStatus("FAILED");
    }
  }

  async function pollJob(jobId: string) {
    const deadline = Date.now() + POLL_TIMEOUT_MS;
    while (!cancelledRef.current && Date.now() < deadline) {
      try {
        const res = await api.get(`/api/v1/ai/jobs/${jobId}`);
        const job: AiJobResponse = res.data.data;
        if (cancelledRef.current) return;
        setStatus(job.status);

        if (job.status === "COMPLETED" && job.generatedMealPlanId) {
          toast.success("Meal plan generated");
          onGenerated(job.generatedMealPlanId);
          return;
        }
        if (job.status === "FAILED") {
          setError(job.errorMessage ?? "AI generation failed");
          return;
        }
      } catch {
        if (!cancelledRef.current) {
          setError("Lost connection while polling job");
          setStatus("FAILED");
        }
        return;
      }
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
    if (!cancelledRef.current) {
      setError("Generation timed out — check again later");
      setStatus("FAILED");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-500" />
            <h2 className="text-base font-bold text-slate-900">AI Meal Plan</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isWorking}
            className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-50 rounded-xl px-4 py-3">
          <p className="text-xs text-slate-500 mb-0.5">Client</p>
          <p className="text-sm font-semibold text-slate-900">{client.name}</p>
          <p className="text-xs text-slate-400">{client.phone}</p>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          GPT-4o will generate a 7-day Indian meal plan tailored to this client&apos;s dietary preferences, goal, and activity level. This takes 30–60 seconds.
        </p>

        {isWorking && (
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-violet-50 border border-violet-100 rounded-lg px-3 py-2">
            <Spinner className="w-4 h-4 text-violet-500" />
            {status === "PENDING" ? "Submitting job…" : "Generating plan…"}
          </div>
        )}

        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <Button className="w-full" onClick={startGenerate} loading={isWorking} disabled={isWorking}>
          <Sparkles className="w-4 h-4 mr-2 text-violet-200" />
          {error ? "Try Again" : "Generate Meal Plan"}
        </Button>
      </div>
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
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
