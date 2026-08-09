"use client";

import * as React from "react";

/** Panel surface — matches the card used across Clients / Inbox / Library. */
export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 12, boxShadow: "var(--shadow-sm)",
      padding: "16px 18px",
      ...style,
    }}>{children}</div>
  );
}

export function CardTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 10, marginBottom: 14,
    }}>
      <div style={{
        fontSize: 14.5, fontWeight: 600, color: "var(--fg1)",
        letterSpacing: "-0.005em",
      }}>{children}</div>
      {right}
    </div>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, color: "var(--fg4)",
      textTransform: "uppercase", letterSpacing: "0.10em",
    }}>{children}</div>
  );
}

export function EmptyState({ icon, title, hint }: { icon?: React.ReactNode; title: string; hint?: string }) {
  return (
    <div style={{
      padding: "34px 20px", textAlign: "center",
      border: "1px dashed var(--border)", borderRadius: 10,
      color: "var(--fg3)", fontSize: 12.5,
    }}>
      {icon && <div style={{ color: "var(--fg4)", marginBottom: 8 }}>{icon}</div>}
      <div style={{ fontWeight: 600, color: "var(--fg2)", marginBottom: 3 }}>{title}</div>
      {hint && <div>{hint}</div>}
    </div>
  );
}

/** Skeleton block used while the single overview request is in flight. */
export function Shimmer({ h = 14, w = "100%", radius = 6 }: { h?: number; w?: number | string; radius?: number }) {
  return (
    <div style={{
      height: h, width: w, borderRadius: radius,
      background: "var(--bg-subtle)",
      animation: "dashPulse 1.4s var(--ease-in-out) infinite",
    }} />
  );
}
