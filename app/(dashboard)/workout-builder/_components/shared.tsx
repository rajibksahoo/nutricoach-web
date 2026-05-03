"use client";
import * as React from "react";
import { CAT, type LibraryExercise, type CategoryKey } from "./data";
import { Sparkles, Edit, Copy, Trash, Send } from "./icons";

export function ExThumb({ ex, size = 40 }: { ex: LibraryExercise; size?: number }) {
  const c = CAT[ex.cat];
  const Icon = c.Icon;
  return (
    <div style={{
      width: size, height: size, borderRadius: 8, background: c.tint,
      border: `1px solid ${c.color}26`, display: "flex", alignItems: "center",
      justifyContent: "center", color: c.color, flexShrink: 0, position: "relative"
    }}>
      <Icon size={Math.round(size * 0.45)} style={{ strokeWidth: 2 }} />
      {ex.custom && (
        <div title="Custom exercise" style={{
          position: "absolute", top: -3, right: -3, width: 14, height: 14, borderRadius: "50%",
          background: "#7C3AED", border: "2px solid #fff", display: "flex",
          alignItems: "center", justifyContent: "center"
        }}>
          <Sparkles size={8} style={{ color: "#fff", strokeWidth: 3 }} />
        </div>
      )}
    </div>
  );
}

export function CatBadge({ cat, size = "md" }: { cat: CategoryKey; size?: "sm" | "md" }) {
  const c = CAT[cat];
  const small = size === "sm";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: c.tint, color: c.color, border: `1px solid ${c.color}33`,
      padding: small ? "1px 6px" : "2px 7px",
      borderRadius: 5, fontSize: small ? 9 : 10, fontWeight: 600,
      textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap"
    }}>
      {c.label}
    </span>
  );
}

export function CustomBadge({ small }: { small?: boolean }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      background: "#FAF5FF", color: "#7C3AED", border: "1px solid #E9D5FF",
      padding: small ? "1px 5px" : "1px 6px",
      borderRadius: 5, fontSize: small ? 9 : 10, fontWeight: 600,
      textTransform: "uppercase", letterSpacing: "0.04em"
    }}>
      <Sparkles size={9} style={{ strokeWidth: 2.5 }} />
      Custom
    </span>
  );
}

export function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  const initial = (name || "?").trim()[0]?.toUpperCase() || "?";
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "var(--brand-primary-50)", color: "#3730A3",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 600, fontSize: Math.round(size * 0.42), flexShrink: 0
    }}>{initial}</div>
  );
}

export function FilterChip({
  active, onClick, color, tint, small, children,
}: {
  active?: boolean; onClick?: () => void; color?: string; tint?: string;
  small?: boolean; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: small ? "3px 9px" : "4px 11px",
      border: "1px solid", borderColor: active ? (color || "var(--brand-primary)") : "var(--border)",
      borderRadius: 999,
      background: active ? (tint || "var(--brand-primary-50)") : "#fff",
      color: active ? (color || "var(--brand-primary)") : "var(--fg2)",
      font: small ? "500 11.5px var(--font-sans)" : "500 12px var(--font-sans)",
      cursor: "pointer", whiteSpace: "nowrap", transition: "all 100ms"
    }}>{children}</button>
  );
}

export function MenuItem({
  Icon, danger, children, onClick,
}: {
  Icon: React.ComponentType<{ size?: number }>; danger?: boolean;
  children: React.ReactNode; onClick?: () => void;
}) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 8, width: "100%",
      padding: "6px 9px", border: "none", background: "transparent",
      borderRadius: 5, font: "500 12.5px var(--font-sans)", textAlign: "left",
      color: danger ? "var(--danger)" : "var(--fg1)", cursor: "pointer"
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = danger ? "#FEF2F2" : "var(--bg)"; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
      <Icon size={13} />{children}
    </button>
  );
}

export function LibrarySubTabs({
  active, onChange, exerciseCount,
}: {
  active: string;
  onChange: (k: string) => void;
  exerciseCount: number;
}) {
  const tabs = [
    { key: "programs", label: "Programs", count: 12 },
    { key: "workouts", label: "Workouts", count: 38 },
    { key: "exercises", label: "Exercises", count: exerciseCount },
  ];
  return (
    <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--border)" }}>
      {tabs.map(t => {
        const on = active === t.key;
        return (
          <button key={t.key} onClick={() => onChange(t.key)} style={{
            padding: "9px 16px 11px", border: "none", background: "transparent",
            borderBottom: on ? "2px solid var(--brand-primary)" : "2px solid transparent",
            marginBottom: -1,
            color: on ? "var(--fg1)" : "var(--fg3)",
            font: `${on ? 600 : 500} 13px var(--font-sans)`,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
          }}>
            {t.label}
            <span style={{
              fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 9,
              background: on ? "var(--brand-primary-50)" : "var(--bg-subtle)",
              color: on ? "#3730A3" : "var(--fg3)",
            }}>{t.count.toLocaleString()}</span>
          </button>
        );
      })}
    </div>
  );
}

export const inputStyle: React.CSSProperties = {
  width: "100%", padding: "7px 11px", border: "1px solid var(--border)",
  borderRadius: 7, fontSize: 13, background: "#fff", color: "var(--fg1)",
  fontFamily: "var(--font-sans)", outline: "none",
};

export const kbdStyle: React.CSSProperties = {
  font: "500 10px var(--font-mono)", background: "#fff",
  border: "1px solid var(--border)", padding: "1px 5px", borderRadius: 4,
};

export function Field({
  label, required, hint, children,
}: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--fg2)", display: "flex", alignItems: "center", gap: 5 }}>
        {label}{required && <span style={{ color: "var(--danger)" }}>*</span>}
      </span>
      {children}
      {hint && <span style={{ fontSize: 11, color: "var(--fg4)" }}>{hint}</span>}
    </label>
  );
}

// Re-export some commonly-used icons in row actions
export { Edit, Copy, Trash, Send };
