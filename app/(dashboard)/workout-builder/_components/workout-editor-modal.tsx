"use client";
import * as React from "react";
import {
  CAT, LIBRARY, LIBRARY_BY_ID, SECTION_LABELS, SECTION_TYPES, SECTION_TEMPLATES,
  type LibraryExercise, type SectionExercise, type SectionType, type Palette, type SavedWorkout,
} from "./data";
import {
  Search, Plus, X, ChevLeft, ChevRight, ChevDown, ChevUp,
  Grip, Edit, Copy, Trash, Tag, Send, MoreH, Dumbbell,
} from "./icons";
import { ExThumb, CatBadge, CustomBadge } from "./shared";

interface SectionState {
  id: string;
  type: SectionType;
  title: string;
  exercises: SectionExercise[];
}

function ParamMini({
  label, value, onChange, suffix, width, text,
}: {
  label: string;
  value: string | number | null;
  onChange: (v: string | number | null) => void;
  suffix?: string;
  width: number;
  text?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <span style={{ fontSize: 8.5, fontWeight: 700, color: "var(--fg4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
      <div style={{ position: "relative" }}>
        <input
          value={value === null || value === undefined ? "" : value}
          onChange={(e) => onChange(text ? e.target.value : (e.target.value === "" ? null : Number(e.target.value)))}
          type={text ? "text" : "number"}
          style={{
            width, padding: "3px 7px", paddingRight: suffix ? 16 : 7,
            border: "1px solid var(--border)", borderRadius: 4,
            fontSize: 11.5, fontFamily: "var(--font-mono)", textAlign: text ? "left" : "right",
            color: "var(--fg1)", background: "#fff", outline: "none",
          }} />
        {suffix && <span style={{
          position: "absolute", right: 5, top: "50%", transform: "translateY(-50%)",
          fontSize: 9, color: "var(--fg4)", fontFamily: "var(--font-mono)", pointerEvents: "none",
        }}>{suffix}</span>}
      </div>
    </div>
  );
}

function CompactExerciseRow({
  ex, libEx, onUpdate, onRemove, onDuplicate,
}: {
  ex: SectionExercise;
  libEx: LibraryExercise;
  onUpdate: (next: SectionExercise) => void;
  onRemove: () => void;
  onDuplicate: () => void;
}) {
  const showWeight = libEx.cat === "strength";
  const showReps = libEx.cat === "strength" || libEx.cat === "bodyweight" || libEx.cat === "amrap";
  const showDuration = libEx.cat === "timed" || libEx.cat === "cardio";
  const [hov, setHov] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", gap: 10, padding: "9px 12px",
        borderTop: "1px solid var(--border-subtle)", background: "#fff",
      }}>
      <Grip size={13} style={{ color: hov ? "var(--fg3)" : "var(--fg5)", cursor: "grab", marginTop: 11 }} />
      <ExThumb ex={libEx} size={36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
          <span style={{ fontWeight: 500, fontSize: 12.5, color: "var(--fg1)" }}>{libEx.name}</span>
          {libEx.custom && <CustomBadge small />}
          <CatBadge cat={libEx.cat} size="sm" />
        </div>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center" }}>
          <ParamMini label="Sets" value={ex.sets} width={42}
            onChange={(v) => onUpdate({ ...ex, sets: typeof v === "number" ? v : 0 })} />
          {showReps && <ParamMini label="Reps" value={ex.reps ?? ""} width={48}
            onChange={(v) => onUpdate({ ...ex, reps: typeof v === "number" ? v : null })} />}
          {showDuration && <ParamMini label="Dur" value={ex.duration ?? ""} suffix="s" width={56}
            onChange={(v) => onUpdate({ ...ex, duration: typeof v === "number" ? v : null })} />}
          {showWeight && <ParamMini label="Load" text value={ex.weight} width={72}
            onChange={(v) => onUpdate({ ...ex, weight: String(v ?? "") })} />}
          <ParamMini label="Rest" value={ex.rest ?? ""} suffix="s" width={48}
            onChange={(v) => onUpdate({ ...ex, rest: typeof v === "number" ? v : null })} />
          <input
            value={ex.note} onChange={(e) => onUpdate({ ...ex, note: e.target.value })}
            placeholder="Coach note…"
            style={{
              flex: 1, minWidth: 90, padding: "4px 8px", borderRadius: 5,
              border: "1px solid transparent", background: ex.note ? "var(--bg)" : "transparent",
              fontSize: 11.5, color: "var(--fg2)", fontFamily: "var(--font-sans)", outline: "none",
            }}
            onFocus={(e) => { e.target.style.background = "#fff"; e.target.style.borderColor = "var(--border)"; }}
            onBlur={(e) => { e.target.style.background = ex.note ? "var(--bg)" : "transparent"; e.target.style.borderColor = "transparent"; }} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 1, opacity: hov ? 1 : 0, transition: "opacity 80ms" }}>
        <button className="btn btn-ghost btn-sm" onClick={onDuplicate}><Copy size={12} /></button>
        <button className="btn btn-ghost btn-sm" style={{ color: "var(--danger)" }} onClick={onRemove}><Trash size={12} /></button>
      </div>
    </div>
  );
}

function EditorSection({
  section, palette, onTitleChange, onTypeChange, onAddExercise,
  onUpdateExercise, onRemoveExercise, onDuplicateExercise,
  onRemoveSection, onDuplicateSection, onDropExternal,
}: {
  section: SectionState;
  palette: Palette;
  onTitleChange: (t: string) => void;
  onTypeChange: (t: SectionType) => void;
  onAddExercise: () => void;
  onUpdateExercise: (eid: string, next: SectionExercise) => void;
  onRemoveExercise: (eid: string) => void;
  onDuplicateExercise: (eid: string) => void;
  onRemoveSection: () => void;
  onDuplicateSection: () => void;
  onDropExternal: (payload: { libId: string }) => void;
}) {
  const p = palette[section.type] || palette.main;
  const meta = SECTION_LABELS[section.type] || SECTION_LABELS.main;
  const Icon = meta.Icon;
  const [editing, setEditing] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const [hover, setHover] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("application/x-library-exercise")) {
      e.preventDefault(); setHover(true);
    }
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setHover(false);
    const lib = e.dataTransfer.getData("application/x-library-exercise");
    if (lib) onDropExternal(JSON.parse(lib));
  };

  const totalSets = section.exercises.reduce((a, e) => a + (e.sets || 0), 0);

  return (
    <div onDragOver={handleDragOver} onDragLeave={() => setHover(false)} onDrop={handleDrop}
      style={{
        background: "#fff", border: `1px solid ${hover ? p.bar : "var(--border)"}`,
        borderRadius: 10, overflow: "hidden",
        boxShadow: hover ? `0 0 0 2px ${p.bar}33` : "var(--shadow-sm)",
        transition: "box-shadow 100ms, border 100ms",
      }}>
      <div style={{ background: p.bg, borderBottom: `1px solid ${p.bar}33`, padding: "8px 14px", display: "flex", alignItems: "center", gap: 9 }}>
        <Grip size={13} style={{ color: p.barText, opacity: 0.5, cursor: "grab" }} />
        <div style={{
          width: 24, height: 24, borderRadius: 6, background: p.bar, color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Icon size={13} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {editing ? (
            <input autoFocus value={section.title}
              onChange={(e) => onTitleChange(e.target.value)}
              onBlur={() => setEditing(false)}
              onKeyDown={(e) => { if (e.key === "Enter") setEditing(false); }}
              style={{
                font: "600 13.5px var(--font-display)", color: p.barText, letterSpacing: "-0.01em",
                background: "#fff", border: `1px solid ${p.bar}`, borderRadius: 5, padding: "2px 7px", outline: "none",
              }} />
          ) : (
            <h3 onDoubleClick={() => setEditing(true)} style={{
              font: "600 13.5px var(--font-display)", color: p.barText, letterSpacing: "-0.01em",
              margin: 0, cursor: "text",
            }}>{section.title}</h3>
          )}
          <div style={{ fontSize: 10, color: p.barText, opacity: 0.75, display: "flex", alignItems: "center", gap: 6 }}>
            <select value={section.type} onChange={(e) => onTypeChange(e.target.value as SectionType)}
              style={{
                font: "500 9.5px var(--font-sans)", color: p.barText, opacity: 0.9,
                background: "transparent", border: "none", padding: 0, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.06em",
              }}>
              {SECTION_TYPES.map(t => <option key={t} value={t}>{SECTION_LABELS[t].label}</option>)}
            </select>
            <span>·</span>
            <span>{section.exercises.length} ex · {totalSets} sets</span>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" style={{ color: p.barText }} onClick={() => setEditing(true)} title="Rename"><Edit size={12} /></button>
        <button className="btn btn-ghost btn-sm" style={{ color: p.barText }} onClick={onDuplicateSection} title="Duplicate"><Copy size={12} /></button>
        <button className="btn btn-ghost btn-sm" style={{ color: p.barText }} onClick={() => setCollapsed(c => !c)} title="Collapse">
          {collapsed ? <ChevDown size={13} /> : <ChevUp size={13} />}
        </button>
        <button className="btn btn-ghost btn-sm" style={{ color: "#9F1239" }} onClick={onRemoveSection} title="Remove"><Trash size={12} /></button>
      </div>

      {!collapsed && (
        <>
          {section.exercises.length === 0 && (
            <div style={{ padding: "22px 14px", textAlign: "center", color: hover ? p.barText : "var(--fg4)", fontSize: 12 }}>
              {hover ? "Drop here to add" : "Drag an exercise here, or click below"}
            </div>
          )}
          {section.exercises.map(ex => {
            const lib = LIBRARY_BY_ID[ex.libId];
            if (!lib) return null;
            return (
              <CompactExerciseRow key={ex.id} ex={ex} libEx={lib}
                onUpdate={(next) => onUpdateExercise(ex.id, next)}
                onRemove={() => onRemoveExercise(ex.id)}
                onDuplicate={() => onDuplicateExercise(ex.id)} />
            );
          })}
          <div style={{
            padding: "8px 12px", display: "flex", justifyContent: "flex-start", gap: 7,
            background: "var(--bg)", borderTop: "1px solid var(--border-subtle)",
          }}>
            <button className="btn-soft-primary btn-sm-soft" onClick={onAddExercise}>
              <Plus size={12} />Add exercise
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function EmptyResult() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "60px 14px 30px", color: "var(--fg4)", gap: 10,
    }}>
      <div style={{ position: "relative", width: 48, height: 48 }}>
        <div style={{ position: "absolute", inset: 6, border: "2px solid var(--border)", borderRadius: 6, transform: "rotate(-6deg)", background: "#fff" }} />
        <div style={{ position: "absolute", inset: 0, border: "2px solid var(--border-strong)", borderRadius: 6, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Search size={18} style={{ color: "var(--fg4)" }} />
        </div>
      </div>
      <span style={{ fontSize: 12 }}>No result found</span>
    </div>
  );
}

function EmptyCanvas({
  onAddExercise, onAddSection, onDropExternal, onDropSection,
}: {
  onAddExercise: () => void;
  onAddSection: () => void;
  onDropExternal: (p: { libId: string }) => void;
  onDropSection: (p: { type: SectionType; title: string }) => void;
}) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setHover(true); }}
      onDragLeave={() => setHover(false)}
      onDrop={(e) => {
        e.preventDefault(); setHover(false);
        const lib = e.dataTransfer.getData("application/x-library-exercise");
        const tpl = e.dataTransfer.getData("application/x-section-template");
        if (lib) onDropExternal(JSON.parse(lib));
        else if (tpl) onDropSection(JSON.parse(tpl));
      }}
      style={{
        border: `2px dashed ${hover ? "var(--brand-primary)" : "var(--border)"}`,
        borderRadius: 10, padding: "34px 22px",
        background: hover ? "var(--brand-primary-50)" : "var(--bg)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
        transition: "all 100ms",
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 46, height: 36, borderRadius: 6,
          border: `1.5px dashed ${hover ? "var(--brand-primary)" : "var(--border-strong)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--brand-primary)",
        }}>
          <Dumbbell size={18} />
        </div>
        <div style={{ fontSize: 13, color: "var(--fg2)", lineHeight: 1.4 }}>
          Drag exercises from<br />the left to add
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, width: "100%" }}>
        <button className="btn-soft-primary" onClick={onAddExercise}><Plus size={14} />Add Exercise</button>
        <button className="btn-soft-primary" onClick={onAddSection}><Plus size={14} />Add Section</button>
      </div>
    </div>
  );
}

function SectionDropZone({
  onDropSection, onAddSection,
}: {
  onDropSection: (p: { type: SectionType; title: string }) => void;
  onAddSection: () => void;
}) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("application/x-section-template")) {
          e.preventDefault(); setHover(true);
        }
      }}
      onDragLeave={() => setHover(false)}
      onDrop={(e) => {
        e.preventDefault(); setHover(false);
        const tpl = e.dataTransfer.getData("application/x-section-template");
        if (tpl) onDropSection(JSON.parse(tpl));
      }}
      onClick={onAddSection}
      style={{
        border: `2px dashed ${hover ? "var(--brand-primary)" : "var(--border)"}`,
        borderRadius: 10, padding: "14px",
        background: hover ? "var(--brand-primary-50)" : "transparent",
        color: hover ? "var(--brand-primary)" : "var(--fg3)",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
        font: "500 12.5px var(--font-sans)", cursor: "pointer", transition: "all 100ms",
      }}>
      <Plus size={13} />{hover ? "Drop section template here" : "Add section"}
    </div>
  );
}

export function WorkoutEditorModal({
  open, workout, palette, onClose, onSave, onSaveClose,
}: {
  open: boolean;
  workout: SavedWorkout | null;
  palette: Palette;
  onClose: () => void;
  onSave: (w: SavedWorkout) => void;
  onSaveClose: (w: SavedWorkout) => void;
}) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [sections, setSections] = React.useState<SectionState[]>([]);
  const [leftTab, setLeftTab] = React.useState<"exercises" | "sections">("exercises");
  const [leftQ, setLeftQ] = React.useState("");
  const [leftCollapsed, setLeftCollapsed] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setName(workout?.name || "");
    setDescription(workout?.description || "");
    setSections(
      (workout?.sections || []).map((s, i) => ({
        id: `s-${i}-${Date.now()}`,
        type: s.type || "main",
        title: s.title || SECTION_LABELS.main.label,
        exercises: s.exercises || Array.from({ length: s.exCount || 0 }, (_, idx) => {
          const candidates = LIBRARY.filter(e => {
            if (s.type === "warmup") return e.tags?.includes("warm-up") || e.cat === "bodyweight";
            if (s.type === "cooldown") return e.tags?.includes("cool-down") || e.cat === "timed";
            if (s.type === "accessory") return e.cat === "strength";
            if (s.type === "finisher") return e.cat === "amrap";
            return e.cat === "strength";
          });
          const lib = candidates[idx % candidates.length] || LIBRARY[idx % LIBRARY.length];
          return {
            id: `e-${i}-${idx}-${Date.now()}`,
            libId: lib.id,
            sets: lib.cat === "timed" ? 1 : 3,
            reps: lib.cat === "strength" || lib.cat === "bodyweight" ? 10 : null,
            duration: lib.cat === "timed" || lib.cat === "cardio" ? 45 : null,
            rest: lib.cat === "timed" || lib.cat === "cardio" ? null : 60,
            weight: "",
            note: "",
          };
        }),
      }))
    );
    setLeftTab("exercises");
    setLeftQ("");
  }, [open, workout?.id]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const onLibDragStart = (e: React.DragEvent, libEx: LibraryExercise) => {
    e.dataTransfer.setData("application/x-library-exercise", JSON.stringify({ libId: libEx.id }));
    e.dataTransfer.effectAllowed = "copy";
  };
  const onSecTemplateDragStart = (e: React.DragEvent, tpl: { type: SectionType; title: string }) => {
    e.dataTransfer.setData("application/x-section-template", JSON.stringify(tpl));
    e.dataTransfer.effectAllowed = "copy";
  };

  const addSection = () => setSections(s => [...s, {
    id: `s-${Date.now()}`, type: "main", title: "New section", exercises: [],
  }]);
  const dropSectionTemplate = (tpl: { type: SectionType; title: string }) =>
    setSections(s => [...s, { id: `s-${Date.now()}`, type: tpl.type, title: tpl.title, exercises: [] }]);
  const removeSection = (sid: string) => setSections(s => s.filter(x => x.id !== sid));
  const renameSection = (sid: string, title: string) =>
    setSections(s => s.map(x => x.id === sid ? { ...x, title } : x));
  const setSectionType = (sid: string, type: SectionType) =>
    setSections(s => s.map(x => x.id === sid ? { ...x, type, title: SECTION_LABELS[type].label } : x));
  const duplicateSection = (sid: string) => setSections(s => {
    const i = s.findIndex(x => x.id === sid);
    if (i < 0) return s;
    const orig = s[i];
    const copy: SectionState = {
      ...orig, id: `s-${Date.now()}`, title: `${orig.title} (copy)`,
      exercises: orig.exercises.map(e => ({ ...e, id: `e-${Date.now()}-${Math.random()}` })),
    };
    return [...s.slice(0, i + 1), copy, ...s.slice(i + 1)];
  });

  const addExerciseToSection = (sid: string, libId = "ex-25") =>
    setSections(s => s.map(x => x.id === sid ? {
      ...x, exercises: [...x.exercises, {
        id: `e-${Date.now()}`, libId, sets: 3, reps: 10, duration: null, rest: 60, weight: "", note: "",
      }],
    } : x));
  const updateExercise = (sid: string, eid: string, next: SectionExercise) =>
    setSections(s => s.map(x => x.id === sid ? {
      ...x, exercises: x.exercises.map(e => e.id === eid ? next : e),
    } : x));
  const removeExercise = (sid: string, eid: string) =>
    setSections(s => s.map(x => x.id === sid ? {
      ...x, exercises: x.exercises.filter(e => e.id !== eid),
    } : x));
  const duplicateExercise = (sid: string, eid: string) =>
    setSections(s => s.map(x => x.id === sid ? {
      ...x, exercises: x.exercises.flatMap(e => e.id === eid ? [e, { ...e, id: `e-${Date.now()}` }] : [e]),
    } : x));

  const buildResult = (): SavedWorkout => ({
    ...(workout || {} as SavedWorkout),
    id: workout?.id || `w-${Date.now()}`,
    name: name || "Untitled workout",
    description,
    sectionCount: sections.length,
    exerciseCount: sections.reduce((a, s) => a + s.exercises.length, 0),
    sections: sections.map(s => ({
      type: s.type,
      title: s.title,
      exCount: s.exercises.length,
      exercises: s.exercises,
    })),
    tags: sections.map(s => `${s.title} (${s.exercises.length})`),
    lastUsed: "just now",
    owner: workout?.owner || "Rajib Sahoo",
  });

  const filteredLib = LIBRARY.filter(e => !leftQ || e.name.toLowerCase().includes(leftQ.toLowerCase()));
  const filteredSections = SECTION_TEMPLATES.filter(s => !leftQ || s.title.toLowerCase().includes(leftQ.toLowerCase()));

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 120, padding: 24,
      animation: "wb-fadeIn 140ms ease",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 12, width: "100%", maxWidth: 1080,
        height: "calc(100vh - 48px)", maxHeight: 760,
        boxShadow: "var(--shadow-xl)",
        display: "grid", gridTemplateColumns: leftCollapsed ? "32px 1fr" : "320px 1fr",
        overflow: "hidden", position: "relative", transition: "grid-template-columns 180ms ease",
        animation: "wb-slideUp 180ms ease",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 14, right: 14, zIndex: 10,
          width: 24, height: 24, borderRadius: "50%",
          background: "transparent", color: "var(--fg2)", border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}><X size={13} /></button>

        {leftCollapsed ? (
          <button onClick={() => setLeftCollapsed(false)} title="Open library"
            style={{
              border: "none", borderRight: "1px solid var(--border)", background: "var(--bg)",
              cursor: "pointer", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 60,
            }}>
            <ChevRight size={14} style={{ color: "var(--fg3)" }} />
          </button>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid var(--border)", overflow: "hidden" }}>
            <div style={{ padding: "16px 14px 0" }}>
              <div style={{ display: "flex", gap: 1, padding: 3, background: "var(--bg)", borderRadius: 9 }}>
                {[{ k: "exercises", l: "Exercises" }, { k: "sections", l: "Sections" }].map(t => {
                  const on = leftTab === t.k;
                  return (
                    <button key={t.k} onClick={() => setLeftTab(t.k as "exercises" | "sections")} style={{
                      flex: 1, padding: "7px 10px", borderRadius: 6, border: "none",
                      background: on ? "var(--brand-primary)" : "transparent",
                      color: on ? "#fff" : "var(--brand-primary)",
                      font: `${on ? 600 : 500} 13px var(--font-sans)`, cursor: "pointer",
                      transition: "all 100ms",
                    }}>{t.l}</button>
                  );
                })}
              </div>
            </div>

            <div style={{ padding: "12px 14px 0" }}>
              <div style={{ position: "relative" }}>
                <Search size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--fg4)" }} />
                <input value={leftQ} onChange={(e) => setLeftQ(e.target.value)}
                  placeholder={leftTab === "exercises" ? "Search for your Exercises" : "Search for your Sections"}
                  style={{
                    width: "100%", padding: "7px 11px 7px 30px",
                    border: "1px solid var(--border)", borderRadius: 8, fontSize: 12.5,
                    background: "var(--bg)", outline: "none",
                  }} />
              </div>
            </div>

            <div style={{ padding: "14px 14px 6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--fg3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Most recent ({leftTab === "exercises" ? filteredLib.length : filteredSections.length})
              </span>
              <button onClick={() => setLeftCollapsed(true)}
                style={{ background: "transparent", border: "none", color: "var(--fg3)", cursor: "pointer", padding: 2 }}>
                <ChevLeft size={14} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 14px" }}>
              {leftTab === "exercises" && (
                filteredLib.length === 0 ? <EmptyResult /> : filteredLib.map(e => (
                  <div key={e.id}
                    draggable
                    onDragStart={(ev) => onLibDragStart(ev, e)}
                    onClick={() => {
                      if (sections.length > 0) addExerciseToSection(sections[sections.length - 1].id, e.id);
                    }}
                    style={{
                      display: "flex", alignItems: "center", gap: 9, padding: "7px 8px",
                      borderRadius: 7, cursor: "grab", marginBottom: 1, transition: "background 80ms",
                    }}
                    onMouseEnter={(ev) => ev.currentTarget.style.background = "var(--bg)"}
                    onMouseLeave={(ev) => ev.currentTarget.style.background = "transparent"}>
                    <ExThumb ex={e} size={32} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--fg1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</div>
                      <div style={{ fontSize: 10.5, color: "var(--fg4)" }}>{CAT[e.cat].label} · {e.muscle}</div>
                    </div>
                  </div>
                ))
              )}
              {leftTab === "sections" && (
                filteredSections.length === 0 ? <EmptyResult /> : filteredSections.map(s => {
                  const meta = SECTION_LABELS[s.type];
                  const SIcon = meta.Icon;
                  return (
                    <div key={s.id}
                      draggable
                      onDragStart={(ev) => onSecTemplateDragStart(ev, { type: s.type, title: s.title })}
                      onClick={() => dropSectionTemplate({ type: s.type, title: s.title })}
                      style={{
                        padding: "10px 11px", border: "1px solid var(--border)", borderRadius: 8,
                        marginBottom: 6, cursor: "grab", background: "#fff", transition: "all 100ms",
                      }}
                      onMouseEnter={(ev) => { ev.currentTarget.style.borderColor = "var(--brand-primary)"; ev.currentTarget.style.background = "var(--brand-primary-50)"; }}
                      onMouseLeave={(ev) => { ev.currentTarget.style.borderColor = "var(--border)"; ev.currentTarget.style.background = "#fff"; }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                        <SIcon size={12} style={{ color: "var(--brand-primary)" }} />
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--fg1)" }}>{s.title}</span>
                      </div>
                      <div style={{ fontSize: 10.5, color: "var(--fg4)" }}>{s.count} exercises · used {s.lastUsed}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", background: "#fff" }}>
          <div style={{ padding: "14px 22px 6px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
            <input
              value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Name your workout"
              style={{
                flex: 1, font: "700 22px var(--font-display-xl)", letterSpacing: "-0.02em",
                color: name ? "var(--fg1)" : "var(--fg5)",
                border: "none", outline: "none", padding: "4px 0", background: "transparent",
                minWidth: 0,
              }} />
            <div style={{ display: "flex", gap: 6, paddingTop: 6, marginRight: 36 }}>
              <button className="btn btn-ghost btn-sm" title="Tags"><Tag size={14} /></button>
              <button className="btn btn-ghost btn-sm" title="Share"><Send size={14} /></button>
              <button className="btn btn-ghost btn-sm" title="More"><MoreH size={14} /></button>
            </div>
          </div>

          <div style={{ padding: "0 22px 14px" }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--fg3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
              Description
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description"
              rows={1}
              style={{
                width: "100%", border: "none", outline: "none", padding: 0, resize: "none",
                fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--fg2)",
                background: "transparent", lineHeight: 1.5,
              }} />
          </div>

          <div style={{
            flex: 1, overflowY: "auto", padding: "0 22px 18px",
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            {sections.length === 0 ? (
              <EmptyCanvas
                onAddExercise={() => {
                  const sid = `s-${Date.now()}`;
                  setSections(s => [...s, { id: sid, type: "main", title: "Main", exercises: [] }]);
                  setTimeout(() => addExerciseToSection(sid), 0);
                }}
                onAddSection={addSection}
                onDropExternal={(payload) => {
                  setSections(s => [...s, {
                    id: `s-${Date.now()}`, type: "main", title: "Main",
                    exercises: [{ id: `e-${Date.now()}`, libId: payload.libId, sets: 3, reps: 10, duration: null, rest: 60, weight: "", note: "" }],
                  }]);
                }}
                onDropSection={dropSectionTemplate} />
            ) : (
              <>
                {sections.map(s => (
                  <EditorSection key={s.id} section={s} palette={palette}
                    onTitleChange={(t) => renameSection(s.id, t)}
                    onTypeChange={(t) => setSectionType(s.id, t)}
                    onAddExercise={() => addExerciseToSection(s.id)}
                    onUpdateExercise={(eid, next) => updateExercise(s.id, eid, next)}
                    onRemoveExercise={(eid) => removeExercise(s.id, eid)}
                    onDuplicateExercise={(eid) => duplicateExercise(s.id, eid)}
                    onRemoveSection={() => removeSection(s.id)}
                    onDuplicateSection={() => duplicateSection(s.id)}
                    onDropExternal={(payload) => addExerciseToSection(s.id, payload.libId)} />
                ))}
                <SectionDropZone onDropSection={dropSectionTemplate} onAddSection={addSection} />
              </>
            )}
          </div>

          <div style={{
            padding: "12px 22px", borderTop: "1px solid var(--border)", background: "var(--bg)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontSize: 11.5, color: "var(--fg4)" }}>
              {sections.length} sections · {sections.reduce((a, s) => a + s.exercises.length, 0)} exercises
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-secondary" onClick={() => onSave(buildResult())}>Save</button>
              <button className="btn btn-primary" onClick={() => onSaveClose(buildResult())}>Save & Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
