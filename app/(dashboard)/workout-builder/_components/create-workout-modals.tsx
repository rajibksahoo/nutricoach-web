"use client";
import * as React from "react";
import {
  TEMPLATE_THUMB_COLOR, LIBRARY, type WorkoutTemplate, type LibraryExercise,
  type SectionType, type SectionExercise, type CategoryKey,
} from "./data";
import { X, Search, Dumbbell, ChevLeft } from "./icons";

interface BuilderSection {
  id: string;
  type: SectionType;
  title: string;
  exercises: SectionExercise[];
}
export interface BuilderInitialWorkout {
  name: string;
  program: string;
  week: number;
  day: number;
  client: string;
  sections: BuilderSection[];
}

function detectSectionType(title: string): SectionType {
  const t = title.toLowerCase();
  if (t.includes("warm")) return "warmup";
  if (t.includes("cool")) return "cooldown";
  if (t.includes("finish")) return "finisher";
  if (t.includes("accessor") || t.includes("pump")) return "accessory";
  return "main";
}

function pickLibForName(name: string, thumb: string, lib: LibraryExercise[]): string {
  const pool = lib.length > 0 ? lib : LIBRARY;
  const n = name.toLowerCase().trim();
  const exact = pool.find(e => e.name.toLowerCase() === n);
  if (exact) return exact.id;
  const partial = pool.find(e => e.name.toLowerCase().includes(n) || n.includes(e.name.toLowerCase()));
  if (partial) return partial.id;
  const cat: CategoryKey =
    thumb === "bodyweight" ? "bodyweight" :
    thumb === "timed" ? "timed" :
    thumb === "cardio" ? "cardio" :
    thumb === "amrap" ? "amrap" :
    "strength";
  const fallback = pool.find(e => e.cat === cat);
  return (fallback ?? pool[0]).id;
}

function parseRepsOrDuration(reps: string): { reps: number | null; duration: number | null } {
  const m = reps.match(/(\d+)\s*(sec|min)/i);
  if (m) {
    const n = Number(m[1]);
    return { reps: null, duration: m[2].toLowerCase() === "min" ? n * 60 : n };
  }
  const r = reps.match(/(\d+)/);
  return { reps: r ? Number(r[1]) : null, duration: null };
}

export function templateToWorkoutState(t: WorkoutTemplate, lib: LibraryExercise[] = LIBRARY): BuilderInitialWorkout {
  const sections: BuilderSection[] = t.sections.map((s, si) => ({
    id: `s-${Date.now()}-${si}`,
    type: detectSectionType(s.title),
    title: s.title,
    exercises: s.items.map((item, ii) => {
      const { reps, duration } = parseRepsOrDuration(item.reps);
      return {
        id: `e-${Date.now()}-${si}-${ii}`,
        libId: pickLibForName(item.name, item.thumb, lib),
        sets: 3, reps, duration, rest: 60, weight: "",
        note: item.note || "",
      };
    }),
  }));
  return {
    name: t.name, program: "", week: 1, day: 1, client: "",
    sections,
  };
}

// ── Shared ModalShell + ModalHeader (re-exported) ─────────────────────
export function ModalShell({
  open, onClose, width, children, ariaLabel,
}: {
  open: boolean;
  onClose: () => void;
  width: number;
  children: React.ReactNode;
  ariaLabel: string;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div role="dialog" aria-label={ariaLabel} aria-modal="true"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 24, fontFamily: "var(--font-sans)",
      }}>
      <div onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: width, background: "#fff",
          borderRadius: 12, boxShadow: "var(--shadow-xl)",
          maxHeight: "calc(100vh - 48px)", display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({ title, subtitle, onClose }: { title: string; subtitle?: string; onClose: () => void }) {
  return (
    <div style={{
      padding: "18px 22px", borderBottom: "1px solid var(--border-subtle)",
      display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12,
    }}>
      <div>
        <h2 style={{
          margin: 0, fontFamily: "var(--font-display)", fontSize: 18,
          fontWeight: 600, color: "var(--fg1)", letterSpacing: "-0.01em",
        }}>{title}</h2>
        {subtitle && <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--fg3)" }}>{subtitle}</p>}
      </div>
      <button type="button" onClick={onClose} aria-label="Close"
        style={{
          background: "transparent", border: "none", cursor: "pointer",
          padding: 6, borderRadius: 6, color: "var(--fg3)", display: "flex",
        }}>
        <X size={16} />
      </button>
    </div>
  );
}

// ── Chooser SVGs ──────────────────────────────────────────────────────
const CardsStack = ({ size = 40 }: { size?: number }) => (
  <svg viewBox="0 0 48 48" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="9" y="13" width="22" height="26" rx="2" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.5" />
    <rect x="13" y="9" width="22" height="26" rx="2" fill="#fff" stroke="#475569" strokeWidth="1.5" />
    <rect x="17" y="14" width="14" height="1.5" rx="0.7" fill="#94A3B8" />
    <rect x="17" y="18" width="10" height="1.5" rx="0.7" fill="#CBD5E1" />
    <rect x="17" y="22" width="12" height="1.5" rx="0.7" fill="#CBD5E1" />
    <rect x="17" y="26" width="9" height="1.5" rx="0.7" fill="#CBD5E1" />
  </svg>
);

const DocOutline = ({ size = 40 }: { size?: number }) => (
  <svg viewBox="0 0 48 48" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="11" y="10" width="26" height="28" rx="2" fill="#fff" stroke="#475569" strokeWidth="1.5" />
    <rect x="15" y="14" width="18" height="3" rx="1" fill="#3730A3" />
    <rect x="15" y="20" width="18" height="1.5" rx="0.7" fill="#CBD5E1" />
    <rect x="15" y="24" width="14" height="1.5" rx="0.7" fill="#CBD5E1" />
    <rect x="15" y="28" width="16" height="1.5" rx="0.7" fill="#CBD5E1" />
    <rect x="15" y="32" width="10" height="1.5" rx="0.7" fill="#CBD5E1" />
  </svg>
);

function ChoiceCard({
  Icon, title, subtitle, onClick,
}: {
  Icon: React.ComponentType<{ size?: number }>;
  title: string; subtitle: string; onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} style={{
      padding: "24px 16px 20px", borderRadius: 9,
      border: "1px solid var(--border)", background: "#fff",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
      cursor: "pointer", transition: "all 100ms", textAlign: "center",
    }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--brand-primary)"; e.currentTarget.style.background = "var(--brand-primary-50)"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
      <Icon size={40} />
      <div>
        <div style={{ font: "600 14.5px var(--font-display)", color: "var(--fg1)", marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 11.5, color: "var(--fg3)", lineHeight: 1.4 }}>{subtitle}</div>
      </div>
    </button>
  );
}

export function CreateWorkoutChooserModal({
  open, onClose, onStartBlank, onPickTemplate,
}: {
  open: boolean;
  onClose: () => void;
  onStartBlank: () => void;
  onPickTemplate: () => void;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, padding: 24, animation: "wb-fadeIn 140ms ease",
    }}>
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Create workout"
        style={{
          background: "#fff", borderRadius: 12, width: "100%", maxWidth: 560,
          boxShadow: "var(--shadow-xl)", animation: "wb-slideUp 180ms ease",
          position: "relative", padding: "22px 24px 24px",
        }}>
        <button onClick={onClose} aria-label="Close"
          style={{
            position: "absolute", top: 11, right: 11,
            width: 24, height: 24, borderRadius: "50%",
            background: "var(--fg1)", color: "#fff", border: "none",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}>
          <X size={13} />
        </button>

        <h2 style={{ font: "600 18px var(--font-display)", letterSpacing: "-0.01em", margin: 0 }}>
          Create workout
        </h2>
        <p style={{ fontSize: 13, color: "var(--fg3)", margin: "4px 0 18px" }}>
          Please select how you would like to start.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <ChoiceCard Icon={CardsStack} title="Create from Template"
            subtitle="Choose from our list of workout templates"
            onClick={onPickTemplate} />
          <ChoiceCard Icon={DocOutline} title="New Workout"
            subtitle="Create your own"
            onClick={() => { onStartBlank(); onClose(); }} />
        </div>
      </div>
    </div>
  );
}

// ── Template picker (two-pane with preview) ───────────────────────────
const previewLabel: React.CSSProperties = {
  font: "700 12px/1.3 var(--font-display)", color: "var(--fg1)",
  margin: "0 0 6px", letterSpacing: "-0.01em",
};

function TemplatePreview({ template }: { template: WorkoutTemplate }) {
  return (
    <div style={{
      flex: 1, padding: "18px 22px 6px", overflowY: "auto",
      display: "flex", flexDirection: "column", gap: 14,
    }}>
      <div style={{
        position: "relative", borderRadius: 14, overflow: "hidden",
        background: template.cover, padding: "32px 18px 20px", color: "#fff",
        boxShadow: "0 8px 22px -10px rgba(15, 23, 42, 0.4)",
        minHeight: 120, display: "flex", flexDirection: "column", justifyContent: "flex-end",
      }}>
        <div style={{
          position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)",
          width: 60, height: 5, borderRadius: 99, background: "rgba(255,255,255,0.4)",
        }} />
        <h3 style={{
          font: "700 22px var(--font-display-xl)",
          letterSpacing: "-0.02em", margin: 0, lineHeight: 1.15,
        }}>{template.name}</h3>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
          marginTop: 8, opacity: 0.92,
        }}>
          {template.exerciseCount} EXERCISES • {template.sectionCount} SECTIONS
        </div>
      </div>

      <div>
        <h4 style={previewLabel}>Description</h4>
        <p style={{ fontSize: 12.5, color: "var(--fg2)", margin: 0, lineHeight: 1.5 }}>
          {template.description}
        </p>
      </div>

      <div>
        <h4 style={previewLabel}>Equipment</h4>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {template.equipment.map(e => (
            <span key={e} style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "4px 9px", border: "1px solid var(--border)", borderRadius: 6,
              background: "#fff", fontSize: 11.5, color: "var(--fg2)", fontWeight: 500,
            }}>
              <Dumbbell size={11} />{e}
            </span>
          ))}
        </div>
      </div>

      {template.sections.map((s, idx) => (
        <div key={idx}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10, whiteSpace: "nowrap" }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
              background: idx === 0 || idx === template.sections.length - 1
                ? "var(--fg5)" : "var(--brand-primary)",
            }} />
            <h4 style={{ ...previewLabel, margin: 0, color: "var(--fg1)", fontSize: 13, lineHeight: 1.2 }}>
              {s.title}
            </h4>
          </div>
          <div style={{ paddingLeft: 14, borderLeft: "1.5px dashed var(--border)", marginLeft: 3 }}>
            <div style={{
              fontSize: 9.5, fontWeight: 700, letterSpacing: "0.07em",
              color: "var(--fg4)", textTransform: "uppercase",
              marginBottom: 8, lineHeight: 1.4,
            }}>{s.style}</div>
            {s.items.map((it, i) => {
              const color = TEMPLATE_THUMB_COLOR[it.thumb] || "#475569";
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 9, padding: "5px 0",
                  borderTop: i > 0 ? "1px solid var(--border-subtle)" : "none",
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 6, background: `${color}1A`,
                    border: `1px solid ${color}33`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color,
                  }}>
                    <Dumbbell size={14} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 12.5, fontWeight: 500, color: "var(--fg1)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>{it.name}</div>
                    <div style={{ fontSize: 11, color: "var(--fg4)" }}>{it.reps}</div>
                  </div>
                  {it.note && (
                    <span style={{
                      fontSize: 11, color: "var(--fg3)", fontFamily: "var(--font-mono)",
                      background: "var(--bg)", padding: "1px 7px", borderRadius: 4,
                    }}>{it.note}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChooseTemplateModal({
  open, onClose, onSelect, onBack, templates,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (t: WorkoutTemplate) => void;
  onBack?: () => void;
  templates: WorkoutTemplate[];
}) {
  const [q, setQ] = React.useState("");
  const [pickedId, setPickedId] = React.useState<string | undefined>(templates[0]?.id);

  React.useEffect(() => {
    if (!open) return;
    setQ("");
    setPickedId(templates[0]?.id);
  }, [open, templates]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const filtered = templates.filter(t =>
    !q || t.name.toLowerCase().includes(q.toLowerCase()) ||
    t.description.toLowerCase().includes(q.toLowerCase())
  );
  const picked = templates.find(t => t.id === pickedId) || filtered[0];

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 110, padding: 24, animation: "wb-fadeIn 140ms ease",
    }}>
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Choose template"
        style={{
          background: "#fff", borderRadius: 12, width: "100%", maxWidth: 880,
          height: "calc(100vh - 48px)", maxHeight: 640,
          boxShadow: "var(--shadow-xl)", animation: "wb-slideUp 180ms ease",
          display: "grid", gridTemplateColumns: "1fr 1fr",
          overflow: "hidden", position: "relative",
        }}>
        <button onClick={onClose} aria-label="Close"
          style={{
            position: "absolute", top: 14, right: 14, zIndex: 5,
            width: 24, height: 24, borderRadius: "50%",
            background: "transparent", color: "var(--fg3)", border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}>
          <X size={13} />
        </button>

        {/* Left: list */}
        <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid var(--border)" }}>
          <div style={{ padding: "18px 22px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              {onBack && (
                <button onClick={onBack} aria-label="Back"
                  style={{
                    background: "transparent", border: "none", color: "var(--brand-primary)",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
                    font: "500 13px var(--font-sans)", padding: 0,
                  }}>
                  <ChevLeft size={16} />
                </button>
              )}
              <h2 style={{
                font: "700 18px var(--font-display)", letterSpacing: "-0.01em",
                margin: 0, color: "var(--fg1)",
              }}>
                Choose Workout Template
              </h2>
            </div>

            <div style={{ position: "relative" }}>
              <Search size={14} style={{
                position: "absolute", left: 11, top: "50%",
                transform: "translateY(-50%)", color: "var(--fg4)",
              }} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search workout"
                style={{
                  width: "100%", padding: "8px 12px 8px 32px",
                  border: "1px solid var(--border)", borderRadius: 8, fontSize: 12.5,
                  background: "var(--bg)", outline: "none",
                }} />
            </div>
          </div>

          <div style={{ padding: "0 14px", marginBottom: 8 }}>
            <span style={{
              fontSize: 10.5, fontWeight: 700, color: "var(--fg3)",
              textTransform: "uppercase", letterSpacing: "0.06em", padding: "6px 8px",
            }}>
              Most popular ({filtered.length})
            </span>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 14px" }}>
            {filtered.map(t => {
              const on = picked && t.id === picked.id;
              return (
                <button key={t.id} onClick={() => setPickedId(t.id)} style={{
                  width: "100%", padding: "12px 14px", textAlign: "left",
                  border: "none", borderRadius: 8,
                  background: on ? "var(--brand-primary-50)" : "transparent",
                  cursor: "pointer", marginBottom: 1, transition: "background 80ms",
                }}
                  onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = "var(--bg)"; }}
                  onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = "transparent"; }}>
                  <div style={{
                    fontSize: 14, fontWeight: 600,
                    color: on ? "var(--brand-primary)" : "var(--fg1)",
                    marginBottom: 2,
                  }}>{t.name}</div>
                  <div style={{
                    fontSize: 11.5,
                    color: on ? "var(--brand-primary)" : "var(--fg3)",
                  }}>
                    {t.exerciseCount} Exercises • {t.sectionCount} Sections
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div style={{
                padding: "30px 16px", textAlign: "center",
                color: "var(--fg4)", fontSize: 12,
              }}>
                No templates match.
              </div>
            )}
          </div>
        </div>

        {/* Right: preview */}
        <div style={{
          display: "flex", flexDirection: "column",
          background: "var(--bg)", overflow: "hidden", position: "relative",
        }}>
          {picked && <TemplatePreview template={picked} />}
          <div style={{
            padding: "12px 22px 16px", display: "flex", justifyContent: "flex-end",
            background: "var(--bg)", borderTop: "1px solid var(--border)",
          }}>
            <button className="btn btn-primary" disabled={!picked}
              onClick={() => picked && onSelect(picked)}>
              Select
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
