"use client";

import React from "react";
import { Card, EmptyState } from "@/components/dashboard/primitives";
import { TrendingUp, TrendingDown, Minus, Scale } from "lucide-react";
import { Metric, formatDate } from "./ui";
import type { ProgressLog } from "./types";

// Flex, not auto-fit grid: a log often has only two metrics, and stretched
// grid columns strand them at opposite ends of a full-bleed card.
const metricRow: React.CSSProperties = {
  display: "flex", flexWrap: "wrap", gap: "12px 36px",
};

function deltaTint(delta: number) {
  if (delta < 0) return { bg: "var(--brand-primary-50)", fg: "var(--brand-primary)" };
  if (delta > 0) return { bg: "var(--danger-50)", fg: "var(--danger-700)" };
  return { bg: "var(--bg-subtle)", fg: "var(--fg3)" };
}

export default function ProgressLogList({ logs }: { logs: ProgressLog[] }) {
  if (logs.length === 0) {
    return (
      <EmptyState
        icon={<Scale size={22} />}
        title="No progress logged yet"
        hint={'Click "Log Progress" to add the first entry.'}
      />
    );
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {logs.map((log, i) => {
        const prev = logs[i + 1];
        const weightDelta = log.weightKg != null && prev?.weightKg != null
          ? log.weightKg - prev.weightKg : null;
        const tint = weightDelta !== null ? deltaTint(weightDelta) : null;

        return (
          <Card key={log.id}>
            <div style={{
              display: "flex", alignItems: "flex-start", justifyContent: "space-between",
              gap: 10, marginBottom: 12,
            }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--fg1)" }}>
                {formatDate(log.loggedDate)}
              </div>
              {weightDelta !== null && tint && (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
                  background: tint.bg, color: tint.fg, fontVariantNumeric: "tabular-nums",
                }}>
                  {weightDelta < 0 ? <TrendingDown size={12} /> :
                   weightDelta > 0 ? <TrendingUp size={12} /> : <Minus size={12} />}
                  {weightDelta > 0 ? "+" : ""}{weightDelta.toFixed(1)} kg
                </span>
              )}
            </div>

            <div style={metricRow}>
              <Metric icon={<Scale size={14} />} label="Weight" value={log.weightKg} unit="kg" />
              <Metric label="Body Fat" value={log.bodyFatPercent} unit="%" />
              <Metric label="Waist" value={log.waistCm} unit="cm" />
              <Metric label="Adherence" value={log.adherencePercent} unit="%" highlight />
            </div>

            {(log.chestCm != null || log.hipCm != null) && (
              <div style={{ ...metricRow, marginTop: 12 }}>
                <Metric label="Chest" value={log.chestCm} unit="cm" />
                <Metric label="Hip" value={log.hipCm} unit="cm" />
              </div>
            )}

            {log.notes && (
              <p style={{
                marginTop: 12, marginBottom: 0, fontSize: 11.5, color: "var(--fg3)",
                background: "var(--surface-alt)", borderRadius: 8, padding: "8px 12px",
              }}>{log.notes}</p>
            )}
          </Card>
        );
      })}
    </div>
  );
}
