"use client";

import * as React from "react";
import ClientAvatar from "@/components/ui/ClientAvatar";

/** Minimum a client needs to appear in the rail. */
export interface RailClient {
  id: string;
  name: string;
  phone: string;
}

/**
 * 280px sub-pane matching the Clients screen, for the screens that pick a
 * client before showing anything (Meal plans, Progress).
 */
export default function ClientRail<T extends RailClient>({
  clients, selectedId, onSelect, eyebrow, title,
}: {
  clients: T[];
  selectedId: string | null;
  onSelect: (client: T) => void;
  eyebrow: string;
  title: string;
}) {
  return (
    <aside style={{
      width: 280, background: "var(--surface)", borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column", flexShrink: 0, minHeight: "100vh",
    }}>
      <div style={{ padding: "22px 22px 14px" }}>
        <div style={{
          fontSize: 10, fontWeight: 700, color: "var(--fg4)",
          textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 4,
        }}>{eyebrow}</div>
        <h2 style={{
          fontFamily: "var(--font-display-xl)", fontSize: 22, fontWeight: 700,
          letterSpacing: "-0.02em", margin: 0, color: "var(--fg1)",
        }}>{title}</h2>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 16px" }}>
        {clients.map((c) => {
          const on = selectedId === c.id;
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 11,
                padding: "9px 12px", borderRadius: 9, border: "none",
                background: on ? "var(--brand-primary-50)" : "transparent",
                cursor: "pointer", textAlign: "left", marginBottom: 2,
                transition: "background 80ms",
              }}
              onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = "var(--bg)"; }}
              onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = "transparent"; }}
            >
              <ClientAvatar name={c.name} size={36} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  fontSize: 13.5, fontWeight: on ? 600 : 500,
                  color: on ? "var(--brand-primary)" : "var(--fg1)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{c.name}</div>
                <div style={{
                  fontSize: 11.5, color: "var(--fg3)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{c.phone}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{
        borderTop: "1px solid var(--border-subtle)", padding: "12px 16px",
        fontSize: 11.5, color: "var(--fg3)",
      }}>
        {clients.length} client{clients.length !== 1 ? "s" : ""}
      </div>
    </aside>
  );
}
