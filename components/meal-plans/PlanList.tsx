"use client";

import Link from "next/link";
import { formatDate, planDayCount } from "@/lib/utils";
import { EmptyState, Shimmer } from "@/components/dashboard/primitives";
import Badge from "@/components/ui/Badge";
import { UtensilsCrossed, Sparkles, ChevronRight } from "lucide-react";
import { type MealPlan, STATUS_VARIANT } from "./types";

const AI_ACCENT = "#8B5CF6";

function planMeta(plan: MealPlan) {
  const days = planDayCount(plan.startDate, plan.endDate);
  const parts: string[] = [];
  if (days != null) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
  if (plan.startDate) {
    parts.push(plan.endDate
      ? `${formatDate(plan.startDate)} – ${formatDate(plan.endDate)}`
      : formatDate(plan.startDate));
  }
  if (plan.aiGenerated) parts.push("AI generated");
  return parts.join(" · ");
}

export default function PlanList({ plans, loading }: { plans: MealPlan[]; loading: boolean }) {
  if (loading) {
    return (
      <div style={{ display: "grid", gap: 10 }}>
        {[0, 1, 2].map((i) => <Shimmer key={i} h={62} radius={12} />)}
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <EmptyState
        icon={<UtensilsCrossed size={22} />}
        title="No meal plans yet"
        hint="Create one manually, or let AI draft a 7-day plan for this client."
      />
    );
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {plans.map((plan) => (
        <Link key={plan.id} href={`/meal-plans/${plan.id}`} style={{ textDecoration: "none" }}>
          <div
            style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 12, boxShadow: "var(--shadow-sm)",
              padding: "14px 18px", display: "flex", alignItems: "center",
              justifyContent: "space-between", gap: 14, cursor: "pointer",
              transition: "border-color 100ms, box-shadow 100ms",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--brand-primary-200)";
              e.currentTarget.style.boxShadow = "var(--shadow-md)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.boxShadow = "var(--shadow-sm)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: "var(--brand-primary-50)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {plan.aiGenerated
                  ? <Sparkles size={15} style={{ color: AI_ACCENT }} />
                  : <UtensilsCrossed size={15} style={{ color: "var(--brand-primary)" }} />}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: 13.5, fontWeight: 600, color: "var(--fg1)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{plan.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--fg3)", marginTop: 2 }}>
                  {planMeta(plan)}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
              <Badge variant={STATUS_VARIANT[plan.status] ?? "slate"}>{plan.status}</Badge>
              <ChevronRight size={16} style={{ color: "var(--fg5)" }} />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
