"use client";

import { useEffect, useState } from "react";
import { Search, X, Check, Send } from "lucide-react";
import type { Client } from "@/app/(dashboard)/workout-builder/_components/data";

function initialsOf(name: string): string {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
}

export default function AssignProgramModal({
  open, onClose, onAssign, programName, clients, saving = false,
}: {
  open: boolean;
  onClose: () => void;
  onAssign: (clientIds: string[], opts: { startDate?: string; notes: string }) => void;
  programName?: string;
  clients: Client[];
  saving?: boolean;
}) {
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [startDate, setStartDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) { setQ(""); setPicked(new Set()); setStartDate(""); setNotes(""); }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const filtered = clients.filter((c) =>
    !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.goal.toLowerCase().includes(q.toLowerCase()));

  const toggle = (id: string) => setPicked((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "8px 11px", border: "1px solid var(--border)",
    borderRadius: 8, fontSize: 13, background: "#fff", color: "var(--fg1)", outline: "none",
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24,
    }}>
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Assign program" style={{
        background: "#fff", borderRadius: 12, width: "100%", maxWidth: 560,
        maxHeight: "calc(100vh - 48px)", display: "flex", flexDirection: "column",
        boxShadow: "var(--shadow-xl)",
      }}>
        <div style={{
          padding: "15px 22px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <h2 style={{ font: "600 17px var(--font-display)", letterSpacing: "-0.01em", margin: 0 }}>
              Assign program
            </h2>
            <p style={{ fontSize: 12, color: "var(--fg3)", margin: "3px 0 0" }}>
              Assign <strong>{programName ?? "this program"}</strong> to one or more clients.
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" style={{
            width: 28, height: 28, border: "none", borderRadius: 6, background: "transparent",
            cursor: "pointer", color: "var(--fg3)", display: "flex", alignItems: "center", justifyContent: "center",
          }}><X size={15} /></button>
        </div>

        <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", gap: 14, overflow: "hidden", flex: 1 }}>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--fg4)" }} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search clients by name or goal…"
              style={{ ...inputStyle, paddingLeft: 32 }} />
          </div>

          <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "auto", maxHeight: 260 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "26px 12px", textAlign: "center", color: "var(--fg3)", fontSize: 13 }}>
                No clients match.
              </div>
            ) : filtered.map((c, idx) => {
              const on = picked.has(c.id);
              return (
                <button key={c.id} type="button" onClick={() => toggle(c.id)} style={{
                  width: "100%", padding: "9px 12px", border: "none",
                  borderTop: idx === 0 ? "none" : "1px solid var(--border-subtle)",
                  background: on ? "var(--brand-primary-50)" : "#fff",
                  display: "flex", alignItems: "center", gap: 10, cursor: "pointer", textAlign: "left",
                }}>
                  <span style={{
                    width: 32, height: 32, borderRadius: "50%", background: "#E0E7FF",
                    color: "var(--brand-primary)", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0,
                  }}>{initialsOf(c.name)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: on ? "var(--brand-primary)" : "var(--fg1)" }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: "var(--fg3)" }}>{c.goal} · {c.phone}</div>
                  </div>
                  {on && <Check size={15} style={{ color: "var(--brand-primary)" }} />}
                </button>
              );
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 12 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--fg2)" }}>Start date (optional)</span>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--fg2)" }}>Note (optional)</span>
              <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Begin after deload week" style={inputStyle} />
            </label>
          </div>
        </div>

        <div style={{
          padding: "13px 22px", borderTop: "1px solid var(--border)", background: "var(--bg)",
          display: "flex", justifyContent: "flex-end", gap: 8, alignItems: "center",
        }}>
          <button onClick={onClose} style={{
            padding: "8px 14px", borderRadius: 7, border: "1px solid var(--border)",
            background: "#fff", color: "var(--fg1)", fontSize: 12.5, fontWeight: 500, cursor: "pointer",
          }}>Cancel</button>
          <button disabled={picked.size === 0 || saving}
            onClick={() => onAssign(Array.from(picked), { startDate: startDate || undefined, notes })}
            style={{
              padding: "8px 16px", borderRadius: 7, border: "none",
              background: "var(--brand-primary)", color: "#fff", fontSize: 12.5, fontWeight: 600,
              cursor: picked.size === 0 || saving ? "not-allowed" : "pointer",
              opacity: picked.size === 0 || saving ? 0.5 : 1,
              display: "inline-flex", alignItems: "center", gap: 7,
            }}>
            <Send size={13} />{saving ? "Assigning…" : `Assign${picked.size ? ` (${picked.size})` : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}
