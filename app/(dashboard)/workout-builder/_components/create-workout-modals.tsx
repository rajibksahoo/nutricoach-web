"use client";
import * as React from "react";
import {
  WORKOUT_TEMPLATES, TEMPLATE_THUMB_COLOR, LIBRARY, type WorkoutTemplate,
  type SectionType, type SectionExercise, type CategoryKey,
} from "./data";
import { X, Search, Plus, Dumbbell } from "./icons";

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

function pickLibForName(name: string, thumb: string): string {
  const n = name.toLowerCase().trim();
  const exact = LIBRARY.find(e => e.name.toLowerCase() === n);
  if (exact) return exact.id;
  const partial = LIBRARY.find(e => e.name.toLowerCase().includes(n) || n.includes(e.name.toLowerCase()));
  if (partial) return partial.id;
  const cat: CategoryKey =
    thumb === "bodyweight" ? "bodyweight" :
    thumb === "timed" ? "timed" :
    thumb === "cardio" ? "cardio" :
    thumb === "amrap" ? "amrap" :
    "strength";
  const fallback = LIBRARY.find(e => e.cat === cat);
  return (fallback ?? LIBRARY[0]).id;
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

export function templateToWorkoutState(t: WorkoutTemplate): BuilderInitialWorkout {
  const sections: BuilderSection[] = t.sections.map((s, si) => ({
    id: `s-${Date.now()}-${si}`,
    type: detectSectionType(s.title),
    title: s.title,
    exercises: s.items.map((item, ii) => {
      const { reps, duration } = parseRepsOrDuration(item.reps);
      return {
        id: `e-${Date.now()}-${si}-${ii}`,
        libId: pickLibForName(item.name, item.thumb),
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

function ModalShell({
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
    <div
      role="dialog"
      aria-label={ariaLabel}
      aria-modal="true"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 24, fontFamily: "var(--font-sans)",
      }}>
      <div
        onMouseDown={(e) => e.stopPropagation()}
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

function ModalHeader({ title, subtitle, onClose }: { title: string; subtitle?: string; onClose: () => void }) {
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
        {subtitle && <p style={{
          margin: "4px 0 0", fontSize: 13, color: "var(--fg3)",
        }}>{subtitle}</p>}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        style={{
          background: "transparent", border: "none", cursor: "pointer",
          padding: 6, borderRadius: 6, color: "var(--fg3)", display: "flex",
        }}>
        <X size={16} />
      </button>
    </div>
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
  const cards: { key: "blank" | "template"; title: string; desc: string; icon: React.ReactNode; onClick: () => void }[] = [
    {
      key: "blank", title: "Start blank",
      desc: "Build a workout from scratch. Add sections and drag exercises in.",
      icon: <Plus size={20} />, onClick: () => { onStartBlank(); onClose(); },
    },
    {
      key: "template", title: "From template",
      desc: "Pick a starting point from our library of workout templates.",
      icon: <Dumbbell size={20} />, onClick: () => { onPickTemplate(); },
    },
  ];

  return (
    <ModalShell open={open} onClose={onClose} width={560} ariaLabel="Create workout">
      <ModalHeader title="Create a workout" subtitle="Choose how you want to start." onClose={onClose} />
      <div style={{ padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {cards.map(c => (
          <button
            key={c.key}
            type="button"
            onClick={c.onClick}
            style={{
              textAlign: "left", padding: "18px 16px", borderRadius: 10,
              border: "1px solid var(--border)", background: "#fff", cursor: "pointer",
              display: "flex", flexDirection: "column", gap: 8, transition: "all 120ms",
              fontFamily: "var(--font-sans)",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "var(--bg-soft)", color: "var(--fg1)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{c.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg1)" }}>{c.title}</div>
            <div style={{ fontSize: 12.5, color: "var(--fg3)", lineHeight: 1.45 }}>{c.desc}</div>
          </button>
        ))}
      </div>
    </ModalShell>
  );
}

export function ChooseTemplateModal({
  open, onClose, onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (t: WorkoutTemplate) => void;
}) {
  const [q, setQ] = React.useState("");
  const [equip, setEquip] = React.useState<string>("All");

  React.useEffect(() => { if (open) { setQ(""); setEquip("All"); } }, [open]);

  const allEquip = React.useMemo(() => {
    const set = new Set<string>();
    WORKOUT_TEMPLATES.forEach(t => t.equipment.forEach(e => set.add(e)));
    return ["All", ...Array.from(set).sort()];
  }, []);

  const filtered = WORKOUT_TEMPLATES.filter(t => {
    if (equip !== "All" && !t.equipment.includes(equip)) return false;
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      if (!t.name.toLowerCase().includes(needle) && !t.description.toLowerCase().includes(needle)) return false;
    }
    return true;
  });

  return (
    <ModalShell open={open} onClose={onClose} width={920} ariaLabel="Choose template">
      <ModalHeader title="Choose a template" subtitle="Start your workout from a curated template. You can edit everything afterwards." onClose={onClose} />

      <div style={{
        padding: "12px 22px", borderBottom: "1px solid var(--border-subtle)",
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
      }}>
        <div style={{ position: "relative", flex: "1 1 240px", minWidth: 220 }}>
          <Search size={14} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search templates"
            style={{
              width: "100%", padding: "7px 10px 7px 30px",
              border: "1px solid var(--border)", borderRadius: 6,
              fontSize: 13, fontFamily: "var(--font-sans)", outline: "none",
              background: "#fff", color: "var(--fg1)",
            }} />
          <div style={{
            position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)",
            color: "var(--fg4)", pointerEvents: "none", display: "flex",
          }}>
            <Search size={13} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {allEquip.map(e => (
            <button
              key={e}
              type="button"
              onClick={() => setEquip(e)}
              style={{
                padding: "5px 10px", borderRadius: 999,
                border: "1px solid " + (equip === e ? "var(--fg1)" : "var(--border)"),
                background: equip === e ? "var(--fg1)" : "#fff",
                color: equip === e ? "#fff" : "var(--fg2)",
                fontSize: 11.5, fontWeight: 500, cursor: "pointer",
                fontFamily: "var(--font-sans)",
              }}>
              {e}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 18, overflowY: "auto", flex: 1 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "40px 12px", textAlign: "center", color: "var(--fg3)", fontSize: 13 }}>
            No templates match your filters.
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 14,
          }}>
            {filtered.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelect(t)}
                style={{
                  textAlign: "left", padding: 0, borderRadius: 10,
                  border: "1px solid var(--border)", background: "#fff",
                  cursor: "pointer", overflow: "hidden", display: "flex", flexDirection: "column",
                  transition: "all 120ms", fontFamily: "var(--font-sans)",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div style={{
                  height: 96, background: t.cover,
                  display: "flex", alignItems: "flex-end", justifyContent: "flex-start",
                  padding: 10, position: "relative",
                }}>
                  <div style={{
                    display: "flex", gap: 4, flexWrap: "wrap",
                  }}>
                    {t.equipment.map(eq => (
                      <span key={eq} style={{
                        padding: "2px 7px", borderRadius: 999,
                        background: "rgba(255,255,255,0.85)", color: "#0f172a",
                        fontSize: 10, fontWeight: 600,
                      }}>{eq}</span>
                    ))}
                  </div>
                </div>
                <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg1)" }}>{t.name}</div>
                  <div style={{
                    fontSize: 12, color: "var(--fg3)", lineHeight: 1.4,
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}>{t.description}</div>
                  <div style={{
                    display: "flex", gap: 8, marginTop: 4,
                    fontSize: 11, color: "var(--fg4)", fontFamily: "var(--font-mono)",
                  }}>
                    <span>{t.sectionCount} sections</span>
                    <span>·</span>
                    <span>{t.exerciseCount} exercises</span>
                  </div>
                  <div style={{
                    display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap",
                  }}>
                    {Array.from(new Set(t.sections.flatMap(s => s.items.map(i => i.thumb)))).slice(0, 5).map(c => (
                      <span key={c} style={{
                        width: 10, height: 10, borderRadius: 3,
                        background: TEMPLATE_THUMB_COLOR[c],
                      }} />
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </ModalShell>
  );
}
