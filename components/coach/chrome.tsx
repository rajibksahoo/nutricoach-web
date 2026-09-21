"use client";

import * as React from "react";
import { ArrowLeft } from "lucide-react";

/** Body padding under a screen header — matches DashboardScreen. */
export const SCREEN_BODY: React.CSSProperties = {
  padding: "20px 28px 60px", display: "grid", gap: 20,
};

export const primaryBtn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "8px 13px", borderRadius: 8, border: "none",
  background: "var(--brand-primary)", color: "var(--fg-inverse)",
  fontSize: 12.5, fontWeight: 600, cursor: "pointer",
};

export const secondaryBtn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "8px 13px", borderRadius: 8,
  border: "1px solid var(--border)", background: "var(--surface)",
  color: "var(--fg2)", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
};

export const ghostBtn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "6px 10px", borderRadius: 7, border: "none",
  background: "transparent", color: "var(--fg3)",
  fontSize: 12.5, fontWeight: 500, cursor: "pointer",
};

export const inputStyle: React.CSSProperties = {
  width: "100%", padding: "7px 12px", borderRadius: 8,
  border: "1px solid var(--border)", background: "var(--surface)",
  fontSize: 12.5, color: "var(--fg1)", outline: "none",
};

/** Label + control, replacing the per-page `Field` helpers. */
export function Field({ label, required, children }: {
  label: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <label style={{ display: "block" }}>
      <span style={{
        display: "block", marginBottom: 4,
        fontSize: 11.5, fontWeight: 600, color: "var(--fg2)",
      }}>
        {label}{required && <span style={{ color: "var(--danger)" }}> *</span>}
      </span>
      {children}
    </label>
  );
}

/**
 * Underline tab strip — the Clients-detail idiom. Buttons carry the tab label
 * as their only text so `getByRole("button", { name })` keeps working.
 */
export function UnderlineTabs<T extends string>({ tabs, value, onChange }: {
  tabs: readonly T[]; value: T; onChange: (t: T) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 0, marginTop: 6 }}>
      {tabs.map((t) => {
        const on = value === t;
        return (
          <button key={t} onClick={() => onChange(t)} style={{
            padding: "10px 14px 12px", border: "none", background: "transparent",
            borderBottom: on ? "2px solid var(--brand-primary)" : "2px solid transparent",
            marginBottom: -1,
            color: on ? "var(--brand-primary)" : "var(--fg3)",
            fontWeight: on ? 600 : 500, fontSize: 13.5,
            cursor: "pointer", letterSpacing: "-0.005em",
          }}>{t}</button>
        );
      })}
    </div>
  );
}

/** Slim back strip above a detail screen — the workout-editor idiom. */
export function BackBar({ label, onClick, right }: {
  label: string; onClick: () => void; right?: React.ReactNode;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 28px", background: "var(--surface)",
      borderBottom: "1px solid var(--border)",
    }}>
      <button type="button" onClick={onClick} style={ghostBtn}>
        <ArrowLeft size={14} />{label}
      </button>
      {right && <div style={{ display: "flex", alignItems: "center", gap: 6 }}>{right}</div>}
    </div>
  );
}
