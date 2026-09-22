"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";
import ClientRail from "@/components/coach/ClientRail";
import ScreenHeader from "@/components/coach/ScreenHeader";
import { SCREEN_BODY, primaryBtn, secondaryBtn } from "@/components/coach/chrome";
import Spinner from "@/components/ui/Spinner";
import { Plus, Sparkles } from "lucide-react";
import AiGenerateModal from "./AiGenerateModal";
import NewPlanForm from "./NewPlanForm";
import PlanList from "./PlanList";
import type { Client, MealPlan } from "./types";

const AI_ACCENT = "#8B5CF6";

export default function MealPlansScreen() {
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

  if (loadingClients) {
    return (
      <div style={{
        minHeight: "100vh", background: "var(--bg)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
        <ScreenHeader eyebrow="Coaching" title="Meal Plans" />
        <div style={SCREEN_BODY}>
          <div style={{
            padding: "40px 20px", textAlign: "center",
            border: "1px dashed var(--border)", borderRadius: 10,
            color: "var(--fg3)", fontSize: 12.5,
          }}>
            <div style={{ fontWeight: 600, color: "var(--fg2)", marginBottom: 4 }}>No clients yet</div>
            <Link href="/clients/new" style={{ color: "var(--brand-primary)", fontWeight: 600 }}>
              Add a client first →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const planCount = plans.length;

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "280px 1fr",
      minHeight: "100vh", background: "var(--bg)",
    }}>
      <ClientRail
        clients={clients}
        selectedId={selected?.id ?? null}
        onSelect={(c) => { setSelected(c); setShowForm(false); }}
        eyebrow="Meal plans"
        title="All Clients"
      />

      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <ScreenHeader
          eyebrow="Coaching"
          title="Meal Plans"
          subtitle={selected && !loadingPlans
            ? `${planCount} plan${planCount !== 1 ? "s" : ""} for this client`
            : undefined}
          actions={!showForm && (
            <>
              <button style={secondaryBtn} onClick={() => setShowAiModal(true)}>
                <Sparkles size={14} style={{ color: AI_ACCENT }} /> AI Generate
              </button>
              <button style={primaryBtn} onClick={() => setShowForm(true)}>
                <Plus size={14} /> New Plan
              </button>
            </>
          )}
        />

        <div style={SCREEN_BODY}>
          {showForm && (
            <NewPlanForm
              onSubmit={createPlan}
              onCancel={() => setShowForm(false)}
              loading={creating}
            />
          )}
          <PlanList plans={plans} loading={loadingPlans} />
        </div>
      </div>

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
    </div>
  );
}
