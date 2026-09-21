"use client";

import * as React from "react";

/** Header band matching the Dashboard / Clients strip: eyebrow + title, actions right. */
export default function ScreenHeader({
  eyebrow, title, subtitle, actions, children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  /** Optional tab strip, rendered flush with the band's bottom border. */
  children?: React.ReactNode;
}) {
  return (
    <header style={{
      padding: children ? "24px 28px 0" : "24px 28px 18px",
      borderBottom: "1px solid var(--border)",
      background: "var(--surface)",
    }}>
      <div style={{
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        gap: 16, flexWrap: "wrap",
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: "var(--fg4)",
            textTransform: "uppercase", letterSpacing: "0.10em",
          }}>{eyebrow}</div>
          <h1 style={{
            fontFamily: "var(--font-display-xl)", fontSize: 22, fontWeight: 700,
            letterSpacing: "-0.02em", margin: "4px 0 0", color: "var(--fg1)",
          }}>{title}</h1>
          {subtitle && (
            <div style={{ fontSize: 12.5, color: "var(--fg3)", marginTop: 4 }}>{subtitle}</div>
          )}
        </div>
        {actions && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>{actions}</div>
        )}
      </div>
      {children}
    </header>
  );
}
