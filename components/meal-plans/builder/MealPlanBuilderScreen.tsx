"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";
import ScreenHeader from "@/components/coach/ScreenHeader";
import { BackBar, SCREEN_BODY, ghostBtn, primaryBtn, secondaryBtn } from "@/components/coach/chrome";
import { EmptyState } from "@/components/dashboard/primitives";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import { MessageCircle, Plus, UtensilsCrossed } from "lucide-react";
import DayView from "./DayView";
import { DAY_NAMES, STATUS_VARIANT, type MealPlan, type PlanDay } from "./types";

export default function MealPlanBuilderScreen({ planId }: { planId: string }) {
  const router = useRouter();
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const [addingDay, setAddingDay] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.get(`/api/v1/meal-plans/${planId}`)
      .then((res) => {
        if (cancelled) return;
        const data: MealPlan = res.data.data;
        setPlan(data);
        if (data.days.length > 0) setActiveDayId(data.days[0].id);
      })
      .catch(() => { if (!cancelled) toast.error("Failed to load meal plan"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [planId]);

  async function addDay() {
    if (!plan) return;
    const existing = plan.days.map((d) => d.dayNumber);
    const next = [1, 2, 3, 4, 5, 6, 7].find((n) => !existing.includes(n));
    if (!next) { toast.error("All 7 days already added"); return; }
    setAddingDay(true);
    try {
      const res = await api.post(`/api/v1/meal-plans/${planId}/days?dayNumber=${next}`);
      const newDay: PlanDay = res.data.data;
      setPlan((p) => p ? {
        ...p,
        days: [...p.days, newDay].sort((a, b) => a.dayNumber - b.dayNumber),
      } : p);
      setActiveDayId(newDay.id);
      toast.success(`Day ${next} added`);
    } catch {
      toast.error("Failed to add day");
    } finally {
      setAddingDay(false);
    }
  }

  async function deleteDay(dayId: string, dayNumber: number) {
    if (!confirm(`Delete Day ${dayNumber} and all its meals?`)) return;
    try {
      await api.delete(`/api/v1/meal-plans/${planId}/days/${dayId}`);
      const remaining = (plan?.days ?? []).filter((d) => d.id !== dayId);
      setPlan((p) => p ? { ...p, days: remaining } : p);
      if (activeDayId === dayId) setActiveDayId(remaining[0]?.id ?? null);
      toast.success("Day deleted");
    } catch {
      toast.error("Failed to delete day");
    }
  }

  async function changeStatus(status: string) {
    try {
      const res = await api.patch(`/api/v1/meal-plans/${planId}/status?status=${status}`);
      setPlan((p) => p ? { ...p, status: res.data.data.status } : p);
      toast.success(`Marked as ${status.toLowerCase()}`);
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function shareWhatsApp() {
    try {
      await api.post(`/api/v1/meal-plans/${planId}/share/whatsapp`);
      toast.success("Meal plan shared via WhatsApp");
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to share via WhatsApp";
      toast.error(msg);
    }
  }

  function updateDay(updated: PlanDay) {
    setPlan((p) => p ? { ...p, days: p.days.map((d) => d.id === updated.id ? updated : d) } : p);
  }

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "var(--bg)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
        <BackBar label="Back to meal plans" onClick={() => router.push("/meal-plans")} />
        <div style={SCREEN_BODY}>
          <EmptyState
            icon={<UtensilsCrossed size={22} />}
            title="Meal plan not found"
            hint="It may have been deleted."
          />
        </div>
      </div>
    );
  }

  const activeDay = plan.days.find((d) => d.id === activeDayId) ?? null;

  const statusActions = (
    <>
      {plan.status === "ACTIVE" && (
        <button style={secondaryBtn} onClick={shareWhatsApp}>
          <MessageCircle size={14} /> Share
        </button>
      )}
      {plan.status === "DRAFT" && (
        <button style={primaryBtn} onClick={() => changeStatus("ACTIVE")}>Mark Active</button>
      )}
      {plan.status === "ACTIVE" && (
        <>
          <button style={secondaryBtn} onClick={() => changeStatus("COMPLETED")}>Complete</button>
          <button style={ghostBtn} onClick={() => changeStatus("ARCHIVED")}>Archive</button>
        </>
      )}
    </>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <BackBar label="Back to meal plans" onClick={() => router.push("/meal-plans")} />

      <ScreenHeader
        eyebrow="Meal plan"
        title={plan.name}
        subtitle={plan.totalCaloriesTarget ? `Target: ${plan.totalCaloriesTarget} kcal/day` : undefined}
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <Badge variant={STATUS_VARIANT[plan.status] ?? "slate"}>{plan.status}</Badge>
            {plan.aiGenerated && <Badge variant="blue">AI</Badge>}
            {statusActions}
          </div>
        }
      >
        {/* Day tabs — underline idiom, with the add affordance trailing the strip */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, marginTop: 6, flexWrap: "wrap" }}>
          {plan.days.map((day) => {
            const on = activeDayId === day.id;
            return (
              <button
                key={day.id}
                onClick={() => setActiveDayId(day.id)}
                style={{
                  padding: "10px 14px 12px", border: "none", background: "transparent",
                  borderBottom: on ? "2px solid var(--brand-primary)" : "2px solid transparent",
                  marginBottom: -1,
                  color: on ? "var(--brand-primary)" : "var(--fg3)",
                  fontWeight: on ? 600 : 500, fontSize: 13.5,
                  cursor: "pointer", letterSpacing: "-0.005em",
                }}
              >
                Day {day.dayNumber}
                <span style={{
                  marginLeft: 5, fontSize: 11.5,
                  color: on ? "var(--brand-primary-500)" : "var(--fg4)",
                }}>{DAY_NAMES[day.dayNumber - 1]}</span>
              </button>
            );
          })}
          {plan.days.length < 7 && (
            <button
              onClick={addDay}
              disabled={addingDay}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5, marginLeft: 8,
                padding: "5px 10px", borderRadius: 7, alignSelf: "center",
                background: "var(--brand-primary-50)", color: "var(--brand-primary)",
                border: "1px dashed var(--brand-primary-200)",
                fontSize: 11.5, fontWeight: 600,
                cursor: addingDay ? "not-allowed" : "pointer",
                opacity: addingDay ? 0.6 : 1,
              }}
            >
              <Plus size={12} /> Add Day
            </button>
          )}
        </div>
      </ScreenHeader>

      <div style={SCREEN_BODY}>
        {!activeDay ? (
          <EmptyState
            icon={<UtensilsCrossed size={22} />}
            title="No days added yet"
            hint="Add Day 1 to start building this plan."
          />
        ) : (
          <DayView
            planId={planId}
            day={activeDay}
            onDeleteDay={() => deleteDay(activeDay.id, activeDay.dayNumber)}
            onDayUpdated={updateDay}
          />
        )}
      </div>
    </div>
  );
}
