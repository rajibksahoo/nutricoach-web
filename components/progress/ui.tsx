"use client";

import * as React from "react";

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/** Indigo → amber → red, matching the badge thresholds. */
export function adherenceColor(value: number) {
  if (value >= 80) return "var(--brand-primary)";
  if (value >= 60) return "var(--warning-700)";
  return "var(--danger)";
}

function adherenceTint(value: number) {
  if (value >= 80) return { bg: "var(--brand-primary-50)", fg: "var(--brand-primary)" };
  if (value >= 60) return { bg: "var(--warning-50)", fg: "var(--warning-700)" };
  return { bg: "var(--danger-50)", fg: "var(--danger-700)" };
}

export function AdherenceBadge({ value }: { value: number }) {
  const { bg, fg } = adherenceTint(value);
  return (
    <span style={{
      fontSize: 12.5, fontWeight: 700, padding: "3px 11px", borderRadius: 999,
      background: bg, color: fg, fontVariantNumeric: "tabular-nums",
    }}>{value}%</span>
  );
}

export function Metric({ label, value, unit, icon, highlight }: {
  label: string; value: number | null | undefined; unit: string;
  icon?: React.ReactNode; highlight?: boolean;
}) {
  if (value == null) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {icon && <span style={{ color: "var(--fg4)" }}>{icon}</span>}
      <div>
        <div style={{ fontSize: 11, color: "var(--fg4)" }}>{label}</div>
        <div style={{
          fontSize: 13.5, fontWeight: 600,
          color: highlight ? adherenceColor(value) : "var(--fg2)",
          fontVariantNumeric: "tabular-nums",
        }}>{value}{unit}</div>
      </div>
    </div>
  );
}
