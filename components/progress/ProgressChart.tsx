"use client";

import { Card, CardTitle, EmptyState } from "@/components/dashboard/primitives";
import { TrendingUp } from "lucide-react";
import type { ProgressLog } from "./types";

export default function ProgressChart({ logs }: { logs: ProgressLog[] }) {
  const withWeight = logs.filter((l) => l.weightKg != null);

  if (withWeight.length < 2) {
    return (
      <EmptyState
        icon={<TrendingUp size={22} />}
        title={withWeight.length === 0 ? "No weight data yet" : "Not enough data yet"}
        hint={withWeight.length === 0
          ? "Log progress with weight to see a chart."
          : "Need at least 2 data points to draw a chart."}
      />
    );
  }

  const W = 600, H = 200, PAD = { top: 16, right: 16, bottom: 32, left: 44 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const weights = withWeight.map((l) => l.weightKg as number);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW || 1;

  function x(i: number) {
    return PAD.left + (i / (withWeight.length - 1)) * innerW;
  }
  function y(w: number) {
    return PAD.top + innerH - ((w - minW) / range) * innerH;
  }

  const points = withWeight.map((l, i) => `${x(i)},${y(l.weightKg as number)}`).join(" ");

  // Y-axis ticks (3 lines)
  const ticks = [minW, minW + range / 2, maxW];

  const first = withWeight[0].weightKg!;
  const last = withWeight[withWeight.length - 1].weightKg!;
  const change = last - first;

  return (
    <Card>
      <CardTitle>Weight trend (last 60 days)</CardTitle>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: "auto", display: "block" }}
        aria-label="Weight progress chart"
      >
        {/* Grid lines + Y ticks */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left} y1={y(t)} x2={W - PAD.right} y2={y(t)}
              stroke="var(--border-subtle)" strokeWidth="1"
            />
            <text x={PAD.left - 6} y={y(t) + 4} textAnchor="end" fontSize="10" fill="var(--fg4)">
              {t.toFixed(1)}
            </text>
          </g>
        ))}

        {/* Area fill — brand tint, matching the line above it */}
        <polygon
          points={`${PAD.left},${PAD.top + innerH} ${points} ${W - PAD.right},${PAD.top + innerH}`}
          fill="var(--brand-primary)" opacity="0.08"
        />

        {/* Line */}
        <polyline
          points={points} fill="none"
          stroke="var(--brand-primary)" strokeWidth="2" strokeLinejoin="round"
        />

        {/* Data points */}
        {withWeight.map((l, i) => (
          <circle key={l.id} cx={x(i)} cy={y(l.weightKg as number)} r="4" fill="var(--brand-primary)" />
        ))}

        {/* X-axis labels — first, middle, last */}
        {[0, Math.floor((withWeight.length - 1) / 2), withWeight.length - 1].map((i) => (
          <text key={i} x={x(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="var(--fg4)">
            {new Date(withWeight[i].loggedDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </text>
        ))}
      </svg>

      {/* Summary row */}
      <div style={{
        marginTop: 14, display: "flex", alignItems: "center", flexWrap: "wrap",
        gap: 24, fontSize: 11.5, color: "var(--fg3)",
      }}>
        <span>
          <span style={{ fontWeight: 700, color: "var(--fg1)", fontVariantNumeric: "tabular-nums" }}>
            {first} kg
          </span> start
        </span>
        <span>
          <span style={{ fontWeight: 700, color: "var(--fg1)", fontVariantNumeric: "tabular-nums" }}>
            {last} kg
          </span> latest
        </span>
        <span style={{
          fontWeight: 700, fontVariantNumeric: "tabular-nums",
          color: change < 0 ? "var(--brand-primary)" : "var(--danger)",
        }}>
          {change > 0 ? "+" : ""}{change.toFixed(1)} kg change
        </span>
      </div>
    </Card>
  );
}
