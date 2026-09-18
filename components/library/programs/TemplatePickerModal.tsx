"use client";

import { useEffect, useState } from "react";
import { X, Calendar, Layers } from "lucide-react";
import type { ProgramSummary } from "@/lib/library-types";

/**
 * Start a new program from one of the coach's own templates.
 *
 * Templates here are the coach's own programs flagged reusable — not a curated
 * NutriCoach catalogue. That keeps one editing surface (the planner) and means
 * the feature is useful without anyone authoring content first.
 *
 * `templates` is null while loading, so an empty list reads as "you have none"
 * rather than flashing that message before the fetch lands.
 */
export default function TemplatePickerModal({ templates, busy, onClose, onPick }: {
  templates: ProgramSummary[] | null;
  busy: boolean;
  onClose: () => void;
  onPick: (template: ProgramSummary, name: string) => void;
}) {
  const [selected, setSelected] = useState<ProgramSummary | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !busy) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, busy]);

  const choose = (t: ProgramSummary) => {
    setSelected(t);
    setName(`${t.name} (copy)`);
  };

  return (
    <div onClick={() => !busy && onClose()} style={{
      position: "fixed", inset: 0, zIndex: 85, background: "rgba(15,23,42,.45)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Start from a template" style={{
        width: 560, maxWidth: "100%", maxHeight: "calc(100vh - 48px)",
        background: "#fff", borderRadius: 14,
        boxShadow: "0 30px 80px rgba(15,23,42,.32)",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <div style={{
          padding: "18px 22px 14px", borderBottom: "1px solid var(--border-subtle)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <h2 style={{
              font: "700 17px var(--font-display-xl)", margin: 0,
              letterSpacing: "-0.02em", color: "var(--fg1)",
            }}>Start from a template</h2>
            <p style={{ fontSize: 12, color: "var(--fg3)", margin: "3px 0 0" }}>
              Copies the template&rsquo;s weeks, days and notes into a new program.
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" disabled={busy} style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 30, height: 30, padding: 0, border: "none", borderRadius: 7,
            background: "transparent", color: "var(--fg2)",
            cursor: busy ? "not-allowed" : "pointer",
          }}><X size={15} /></button>
        </div>

        <div style={{ overflowY: "auto", padding: "14px 22px", flex: 1 }}>
          {templates === null ? (
            <div style={{ padding: "30px 0", textAlign: "center", color: "var(--fg3)", fontSize: 12.5 }}>
              Loading templates…
            </div>
          ) : templates.length === 0 ? (
            <div style={{
              padding: "34px 20px", textAlign: "center",
              border: "1px dashed var(--border)", borderRadius: 10,
              color: "var(--fg3)", fontSize: 12.5,
            }}>
              <Layers size={20} style={{ color: "var(--fg4)", marginBottom: 8 }} />
              <div style={{ fontWeight: 600, color: "var(--fg2)", marginBottom: 3 }}>No templates yet</div>
              <div>Open a program&rsquo;s ••• menu and choose <strong>Save as template</strong>.</div>
            </div>
          ) : (
            <div style={{ border: "1px solid var(--border)", borderRadius: 9, overflow: "hidden" }}>
              {templates.map((t, i) => {
                const active = selected?.id === t.id;
                return (
                  <button key={t.id} onClick={() => choose(t)}
                    aria-pressed={active}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, width: "100%",
                      padding: "11px 14px", textAlign: "left", cursor: "pointer",
                      border: "none", borderTop: i === 0 ? "none" : "1px solid var(--border-subtle)",
                      background: active ? "var(--bg-subtle)" : "#fff",
                    }}>
                    <Calendar size={15} style={{ color: "var(--brand-primary)", flexShrink: 0 }} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{
                        display: "block", fontSize: 13, fontWeight: 500, color: "var(--fg1)",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>{t.name}</span>
                      <span style={{ display: "block", fontSize: 11.5, color: "var(--fg3)" }}>
                        {t.weeks ?? Math.max(1, Math.ceil(t.durationDays / 7))} weeks
                        {t.modality ? ` · ${t.modality}` : ""}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {selected && (
            <div style={{ marginTop: 16 }}>
              <label htmlFor="new-program-name" style={{
                display: "block", fontSize: 11, fontWeight: 700, color: "var(--fg3)",
                textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7,
              }}>New program name</label>
              <input id="new-program-name" value={name} onChange={(e) => setName(e.target.value)}
                style={{
                  width: "100%", padding: "10px 12px", border: "1px solid var(--border)",
                  borderRadius: 8, fontSize: 13, background: "#fff", color: "var(--fg1)",
                  outline: "none", fontFamily: "var(--font-sans)",
                }} />
            </div>
          )}
        </div>

        <div style={{
          padding: "14px 22px", borderTop: "1px solid var(--border-subtle)",
          display: "flex", justifyContent: "flex-end", gap: 8,
        }}>
          <button onClick={onClose} disabled={busy} style={{
            padding: "9px 16px", borderRadius: 8, border: "1px solid var(--border)",
            background: "#fff", fontSize: 12.5, color: "var(--fg2)",
            cursor: busy ? "not-allowed" : "pointer",
          }}>Cancel</button>
          <button
            onClick={() => selected && onPick(selected, name.trim())}
            disabled={!selected || !name.trim() || busy}
            style={{
              padding: "9px 18px", borderRadius: 8, border: "none",
              background: selected && name.trim() && !busy ? "var(--brand-primary)" : "var(--bg-subtle)",
              color: selected && name.trim() && !busy ? "#fff" : "var(--fg4)",
              fontSize: 12.5, fontWeight: 600,
              cursor: selected && name.trim() && !busy ? "pointer" : "not-allowed",
            }}>{busy ? "Creating…" : "Create program"}</button>
        </div>
      </div>
    </div>
  );
}
