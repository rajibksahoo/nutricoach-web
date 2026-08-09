"use client";

import Link from "next/link";
import type { SubscriptionInfo } from "@/lib/dashboard-api";

/**
 * Real trial state from the coach's subscription — replaces the hardcoded
 * "29 days left" copy that used to sit in the Programs views.
 */
export default function TrialChip({ subscription }: { subscription: SubscriptionInfo }) {
  const { status, tier, daysLeftInTrial } = subscription;

  if (status !== "TRIAL" || daysLeftInTrial == null) {
    if (!tier) return null;
    return (
      <span style={{
        ...base,
        background: "var(--bg-subtle)", color: "var(--fg2)",
        border: "1px solid var(--border)",
      }}>
        <span style={{ fontWeight: 600, textTransform: "capitalize" }}>{tier.toLowerCase()}</span>
        <span style={{ color: "var(--fg4)" }}>plan</span>
      </span>
    );
  }

  const urgent = daysLeftInTrial <= 3;
  return (
    <span style={{
      ...base,
      background: urgent ? "var(--danger-50)" : "var(--warning-50)",
      color: urgent ? "var(--danger-700)" : "var(--warning-700)",
      border: `1px solid ${urgent ? "var(--danger-700)" : "var(--warning-700)"}22`,
    }}>
      <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
        {daysLeftInTrial === 0 ? "Trial ends today" : `${daysLeftInTrial} days left`}
      </span>
      <Link href="/billing" style={{
        color: "inherit", fontWeight: 700, textDecoration: "underline",
        textUnderlineOffset: 2,
      }}>Upgrade</Link>
    </span>
  );
}

const base: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 7,
  padding: "5px 11px", borderRadius: 99,
  fontSize: 11.5, whiteSpace: "nowrap",
};
