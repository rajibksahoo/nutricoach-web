"use client";

import * as React from "react";

/**
 * Shared primitives for the client-detail pane. These lived inside
 * `ClientsScreen.tsx` until the Training tab moved to its own file and needed
 * them too. They are deliberately separate from `components/ui/Card` — that one
 * is class-based and part of the general design system, while these are the
 * detail pane's inline-styled variants.
 */

export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid var(--border)",
      borderRadius: 12, boxShadow: "var(--shadow-sm)",
      padding: "16px 18px",
      ...style,
    }}>{children}</div>
  );
}

export function CardTitle({ children, inline }: { children: React.ReactNode; inline?: boolean }) {
  return (
    <div style={{
      fontSize: 14.5, fontWeight: 600, color: "var(--fg1)",
      marginBottom: inline ? 0 : 14,
      letterSpacing: "-0.005em",
    }}>{children}</div>
  );
}

export const iconBtnStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  width: 30, height: 30, padding: 0, border: "none", borderRadius: 7,
  background: "transparent", color: "var(--fg2)", cursor: "pointer",
};
