"use client";

/**
 * Signed change pill. `positiveIsDown` flips the colour semantics for metrics
 * where falling is the goal (weight, body fat).
 */
export default function Delta({
  pct,
  dir = "down",
  positiveIsDown,
}: {
  pct: number;
  dir?: "up" | "down";
  positiveIsDown?: boolean;
}) {
  const isGood = positiveIsDown ? dir === "down" : dir === "up";
  const tone = isGood ? "var(--success-700)" : "var(--danger-700)";
  const bg = isGood ? "var(--success-50)" : "var(--danger-50)";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      background: bg, color: tone,
      padding: "1px 7px", borderRadius: 99,
      fontSize: 11, fontWeight: 600,
      fontVariantNumeric: "tabular-nums",
    }}>
      <span style={{ fontSize: 10 }}>{dir === "down" ? "↓" : "↑"}</span>
      {pct}%
    </span>
  );
}
