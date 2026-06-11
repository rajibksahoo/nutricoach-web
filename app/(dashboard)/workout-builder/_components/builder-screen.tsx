"use client";
import * as React from "react";
import {
  CAT, CATEGORIES, LIBRARY, LIBRARY_BY_ID, INITIAL_WORKOUT,
  SECTION_LABELS, SECTION_TYPES, SECTION_TEMPLATES,
  type LibraryExercise, type SectionExercise, type SectionType, type Palette,
} from "./data";
import {
  ChevLeft, ChevRight, ChevDown, ChevUp, Plus, Edit, Copy, Trash, Grip,
  Check, Cal, User, Send, Search, Sparkles, LibIcon,
  Layout, Dumbbell, Activity, Clock,
} from "./icons";
import { ExThumb, CatBadge, CustomBadge, Avatar, FilterChip } from "./shared";

export interface SectionState {
  id: string;
  type: SectionType;
  title: string;
  exercises: SectionExercise[];
}

export interface WorkoutState {
  name: string;
  program: string;
  week: number;
  day: number;
  client: string;
  sections: SectionState[];
}

function ParamField({
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
      <span style={{ fontSize: 9, fontWeight: 600, color: "var(--fg4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
      <div style={{ position: "relative" }}>
        <input
          value={value === null || value === undefined ? "" : value}
          onChange={(e) => onChange(text ? e.target.value : (e.target.value === "" ? null : Number(e.target.value)))}
          type={text ? "text" : "number"}
          style={{
            width, padding: "4px 8px", paddingRight: suffix ? 18 : 8,
            border: "1px solid var(--border)", borderRadius: 5,
            fontSize: 12, fontFamily: "var(--font-mono)", textAlign: text ? "left" : "right",
            color: "var(--fg1)", background: "#fff", outline: "none",
          }}
        />
        {suffix && <span style={{
          position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
          fontSize: 10, color: "var(--fg4)", fontFamily: "var(--font-mono)", pointerEvents: "none",
        }}>{suffix}</span>}
      </div>
    </div>
  );
}

function ExerciseRow({
  ex, libEx, onUpdate, onRemove, onDuplicate, isDragging, onDragStart, onDrop,
}: {
  ex: SectionExercise;
  libEx: LibraryExercise;
  onUpdate: (next: SectionExercise) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  const showWeight = libEx.cat === "strength";
  const showReps = libEx.cat === "strength" || libEx.cat === "bodyweight" || libEx.cat === "amrap";
  const showDuration = libEx.cat === "timed" || libEx.cat === "cardio";
  const [hov, setHov] = React.useState(false);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); onDrop(e); }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", gap: 11, padding: "10px 12px",
        background: isDragging ? "var(--bg)" : "#fff",
        borderTop: "1px solid var(--border-subtle)",
        opacity: isDragging ? 0.4 : 1, position: "relative",
      }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, flexShrink: 0, paddingTop: 1 }}>
        <Grip size={14} style={{ color: hov ? "var(--fg3)" : "var(--fg5)", cursor: "grab", marginTop: 11 }} />
        <ExThumb ex={libEx} size={42} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
          <span style={{ fontWeight: 500, fontSize: 13, color: "var(--fg1)" }}>{libEx.name}</span>
          {libEx.custom && <CustomBadge small />}
          <CatBadge cat={libEx.cat} size="sm" />
          <span style={{ fontSize: 11, color: "var(--fg4)" }}>· {libEx.muscle}</span>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <ParamField label="Sets" value={ex.sets} width={48}
            onChange={(v) => onUpdate({ ...ex, sets: (typeof v === "number" ? v : 0) })} />
          {showReps && (
            <ParamField label="Reps" value={ex.reps ?? ""} width={56}
              onChange={(v) => onUpdate({ ...ex, reps: typeof v === "number" ? v : null })} />
          )}
          {showDuration && (
            <ParamField label="Duration" value={ex.duration ?? ""} suffix="s" width={64}
              onChange={(v) => onUpdate({ ...ex, duration: typeof v === "number" ? v : null })} />
          )}
          {showWeight && (
            <ParamField label="Load" value={ex.weight} width={84} text
              onChange={(v) => onUpdate({ ...ex, weight: String(v ?? "") })} />
          )}
          <ParamField label="Rest" value={ex.rest ?? ""} suffix="s" width={56}
            onChange={(v) => onUpdate({ ...ex, rest: typeof v === "number" ? v : null })} />

          <input
            value={ex.note}
            onChange={(e) => onUpdate({ ...ex, note: e.target.value })}
            placeholder="Coach note · cues · tempo…"
            style={{
              flex: 1, minWidth: 120, padding: "5px 9px", borderRadius: 6,
              border: "1px solid transparent", background: ex.note ? "var(--bg)" : "transparent",
              fontSize: 12, color: "var(--fg2)", fontFamily: "var(--font-sans)", outline: "none",
            }}
            onFocus={(e) => { e.target.style.background = "#fff"; e.target.style.borderColor = "var(--border)"; }}
            onBlur={(e) => { e.target.style.background = ex.note ? "var(--bg)" : "transparent"; e.target.style.borderColor = "transparent"; }}
          />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 1, opacity: hov ? 1 : 0, transition: "opacity 80ms" }}>
        <button className="btn btn-ghost btn-sm" title="Duplicate" onClick={onDuplicate}><Copy size={13} /></button>
        <button className="btn btn-ghost btn-sm" style={{ color: "var(--danger)" }} title="Remove" onClick={onRemove}><Trash size={13} /></button>
      </div>
    </div>
  );
}

function Section({
  section, palette, onTitleChange, onTypeChange, onAddExercise,
  onUpdateExercise, onRemoveExercise, onDuplicateExercise,
  onRemoveSection, onDuplicateSection, onReorderExercises,
  onSectionDragStart, onSectionDragOver, onSectionDrop,
  isDraggingSection, onDropExternal,
}: {
  section: SectionState;
  palette: Palette;
  onTitleChange: (sid: string, title: string) => void;
  onTypeChange: (sid: string, type: SectionType) => void;
  onAddExercise: (sid: string) => void;
  onUpdateExercise: (sid: string, eid: string, next: SectionExercise) => void;
  onRemoveExercise: (sid: string, eid: string) => void;
  onDuplicateExercise: (sid: string, eid: string) => void;
  onRemoveSection: (sid: string) => void;
  onDuplicateSection: (sid: string) => void;
  onReorderExercises: (sid: string, from: number, to: number) => void;
  onSectionDragStart: (e: React.DragEvent, sid: string) => void;
  onSectionDragOver: (e: React.DragEvent) => void;
  onSectionDrop: (e: React.DragEvent, sid: string) => void;
  isDraggingSection: boolean;
  onDropExternal: (sid: string, payload: { libId: string }) => void;
}) {
  const p = palette[section.type];
  const meta = SECTION_LABELS[section.type];
  const Icon = meta.Icon;
  const [editing, setEditing] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const [draggingExId, setDraggingExId] = React.useState<string | null>(null);
  const [dropZoneActive, setDropZoneActive] = React.useState(false);

  const handleExDragStart = (e: React.DragEvent, idx: number) => {
    e.stopPropagation();
    setDraggingExId(section.exercises[idx].id);
    e.dataTransfer.setData("application/x-exercise-source", JSON.stringify({ sectionId: section.id, idx }));
    e.dataTransfer.effectAllowed = "move";
  };
  const handleExDrop = (e: React.DragEvent, idx: number) => {
    e.stopPropagation();
    const raw = e.dataTransfer.getData("application/x-exercise-source");
    if (raw) {
      const { sectionId, idx: from } = JSON.parse(raw);
      if (sectionId === section.id) onReorderExercises(section.id, from, idx);
    }
    setDraggingExId(null);
  };

  const handleSectionDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes("application/x-library-exercise")) {
      setDropZoneActive(true);
    }
  };
  const handleSectionDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDropZoneActive(false);
    const lib = e.dataTransfer.getData("application/x-library-exercise");
    if (lib) onDropExternal(section.id, JSON.parse(lib));
  };

  const totalSets = section.exercises.reduce((s, e) => s + (e.sets || 0), 0);

  return (
    <div
      draggable={!editing}
      onDragStart={(e) => onSectionDragStart(e, section.id)}
      onDragOver={(e) => { onSectionDragOver(e); handleSectionDragOver(e); }}
      onDragLeave={() => setDropZoneActive(false)}
      onDrop={(e) => { onSectionDrop(e, section.id); handleSectionDrop(e); }}
      style={{
        background: "#fff", border: `1px solid ${dropZoneActive ? p.bar : "var(--border)"}`,
        borderRadius: 10, overflow: "hidden",
        boxShadow: dropZoneActive ? `0 0 0 2px ${p.bar}33` : "var(--shadow-sm)",
        opacity: isDraggingSection ? 0.5 : 1, transition: "box-shadow 100ms, border 100ms",
      }}>
      <div style={{
        background: p.bg, borderBottom: `1px solid ${p.bar}33`,
        padding: "9px 14px", display: "flex", alignItems: "center", gap: 10,
      }}>
        <Grip size={14} style={{ color: p.barText, opacity: 0.5, cursor: "grab" }} />
        <div style={{
          width: 26, height: 26, borderRadius: 7, background: p.bar, color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Icon size={14} />
        </div>

        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 0 }}>
          {editing ? (
            <input autoFocus value={section.title}
              onChange={(e) => onTitleChange(section.id, e.target.value)}
              onBlur={() => setEditing(false)}
              onKeyDown={(e) => { if (e.key === "Enter") setEditing(false); }}
              style={{
                font: "600 14px var(--font-display)", color: p.barText, letterSpacing: "-0.01em",
                background: "#fff", border: `1px solid ${p.bar}`, borderRadius: 5, padding: "2px 8px", outline: "none",
              }} />
          ) : (
            <h3 onDoubleClick={() => setEditing(true)} style={{
              font: "600 14px var(--font-display)", color: p.barText, letterSpacing: "-0.01em",
              margin: 0, cursor: "text",
            }}>{section.title}</h3>
          )}
          <div style={{ fontSize: 10.5, color: p.barText, opacity: 0.75, display: "flex", alignItems: "center", gap: 7 }}>
            <select value={section.type} onChange={(e) => onTypeChange(section.id, e.target.value as SectionType)}
              style={{
                font: "500 10px var(--font-sans)", color: p.barText, opacity: 0.9,
                background: "transparent", border: "none", padding: 0, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.06em",
              }}>
              {SECTION_TYPES.map(t => <option key={t} value={t}>{SECTION_LABELS[t].label}</option>)}
            </select>
            <span>·</span>
            <span>{section.exercises.length} {section.exercises.length === 1 ? "exercise" : "exercises"} · {totalSets} sets</span>
          </div>
        </div>

        <button className="btn btn-ghost btn-sm" style={{ color: p.barText }} onClick={() => setEditing(true)} title="Rename"><Edit size={13} /></button>
        <button className="btn btn-ghost btn-sm" style={{ color: p.barText }} onClick={() => onDuplicateSection(section.id)} title="Duplicate"><Copy size={13} /></button>
        <button className="btn btn-ghost btn-sm" style={{ color: p.barText }} onClick={() => setCollapsed(c => !c)} title="Collapse">
          {collapsed ? <ChevDown size={14} /> : <ChevUp size={14} />}
        </button>
        <button className="btn btn-ghost btn-sm" style={{ color: "#9F1239" }} onClick={() => onRemoveSection(section.id)} title="Remove"><Trash size={13} /></button>
      </div>

      {!collapsed && (
        <>
          {section.exercises.map((ex, i) => {
            const lib = LIBRARY_BY_ID[ex.libId];
            if (!lib) return null;
            return (
              <ExerciseRow key={ex.id}
                ex={ex} libEx={lib}
                isDragging={draggingExId === ex.id}
                onDragStart={(e) => handleExDragStart(e, i)}
                onDrop={(e) => handleExDrop(e, i)}
                onUpdate={(next) => onUpdateExercise(section.id, ex.id, next)}
                onRemove={() => onRemoveExercise(section.id, ex.id)}
                onDuplicate={() => onDuplicateExercise(section.id, ex.id)}
              />
            );
          })}

          <div style={{
            padding: "10px 14px", borderTop: "1px solid var(--border-subtle)",
            background: dropZoneActive ? p.bg : "var(--bg)",
            transition: "background 100ms",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
          }}>
            <div style={{ fontSize: 11.5, color: dropZoneActive ? p.barText : "var(--fg3)", display: "flex", alignItems: "center", gap: 6 }}>
              {dropZoneActive ? <><Plus size={12} />Drop to add to <strong>{section.title}</strong></> : "Drag from library, or"}
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => onAddExercise(section.id)}>
              <Plus size={12} />Add exercise
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function LibrarySidebar({
  open, onToggle, onPickExercise, onNewExercise, dynamicLibrary,
}: {
  open: boolean;
  onToggle: () => void;
  onPickExercise: (e: LibraryExercise) => void;
  onNewExercise: () => void;
  dynamicLibrary?: LibraryExercise[];
}) {
  const [q, setQ] = React.useState("");
  const [activeCat, setActiveCat] = React.useState<string>("all");
  const [activeTab, setActiveTab] = React.useState<"exercises" | "templates">("exercises");
  const lib = dynamicLibrary || LIBRARY;

  const filtered = lib.filter(e =>
    (activeCat === "all" || e.cat === activeCat) &&
    (!q || e.name.toLowerCase().includes(q.toLowerCase()))
  );

  if (!open) {
    return (
      <button onClick={onToggle} title="Open library"
        style={{
          position: "sticky", top: 0, alignSelf: "flex-start", height: "100vh", width: 36,
          background: "var(--bg)", borderLeft: "1px solid var(--border)",
          display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "60px 0",
          cursor: "pointer", flexShrink: 0,
        }}>
        <div style={{
          writingMode: "vertical-rl", transform: "rotate(180deg)", display: "flex", alignItems: "center",
          gap: 8, color: "var(--fg2)", fontSize: 12, fontWeight: 500,
        }}>
          <ChevLeft size={14} />
          Exercise library
          <LibIcon size={14} />
        </div>
      </button>
    );
  }

  return (
    <aside style={{
      width: 312, background: "#fff", borderLeft: "1px solid var(--border)",
      flexShrink: 0, display: "flex", flexDirection: "column",
      position: "sticky", top: 0, alignSelf: "flex-start", height: "100vh",
    }}>
      <div style={{ padding: "13px 14px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
          <h3 style={{ font: "600 13.5px var(--font-display)", letterSpacing: "-0.01em", margin: 0, display: "flex", alignItems: "center", gap: 7 }}>
            <LibIcon size={14} style={{ color: "var(--brand-primary)" }} />Exercise library
          </h3>
          <button className="btn btn-ghost btn-sm" onClick={onToggle}><ChevRight size={13} /></button>
        </div>

        <div style={{ display: "flex", gap: 1, marginBottom: 9 }}>
          {[{ k: "exercises", l: "Exercises" }, { k: "templates", l: "Sections" }].map(t => {
            const on = activeTab === t.k;
            return (
              <button key={t.k} onClick={() => setActiveTab(t.k as "exercises" | "templates")}
                style={{
                  flex: 1, padding: "5px 8px", borderRadius: 6, border: "none",
                  background: on ? "var(--brand-primary-50)" : "transparent",
                  color: on ? "var(--brand-primary)" : "var(--fg3)",
                  font: `${on ? 600 : 500} 12px var(--font-sans)`, cursor: "pointer",
                }}>{t.l}</button>
            );
          })}
        </div>

        {activeTab === "exercises" && (
          <>
            <div style={{ position: "relative", marginBottom: 8 }}>
              <Search size={13} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--fg4)" }} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…"
                style={{ width: "100%", padding: "6px 10px 6px 28px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12, background: "var(--bg)" }} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              <FilterChip active={activeCat === "all"} onClick={() => setActiveCat("all")} small>All</FilterChip>
              {CATEGORIES.map(c => (
                <FilterChip key={c.key} active={activeCat === c.key} onClick={() => setActiveCat(c.key)} color={c.color} tint={c.tint} small>
                  <c.Icon size={11} />{c.label}
                </FilterChip>
              ))}
            </div>
          </>
        )}
      </div>

      {activeTab === "exercises" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "6px 6px 80px" }}>
          {filtered.length === 0 && (
            <div style={{ padding: "24px 14px", textAlign: "center", color: "var(--fg4)", fontSize: 12 }}>
              No matches.
            </div>
          )}
          {filtered.map(e => (
            <div key={e.id}
              draggable
              onDragStart={(ev) => {
                ev.dataTransfer.setData("application/x-library-exercise", JSON.stringify({ libId: e.id }));
                ev.dataTransfer.effectAllowed = "copy";
              }}
              onClick={() => onPickExercise(e)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "7px 8px", borderRadius: 7, cursor: "grab",
                transition: "background 80ms",
              }}
              onMouseEnter={(ev) => ev.currentTarget.style.background = "var(--bg)"}
              onMouseLeave={(ev) => ev.currentTarget.style.background = "transparent"}>
              <ExThumb ex={e} size={32} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--fg1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</span>
                  {e.custom && <Sparkles size={10} style={{ color: "#7C3AED", flexShrink: 0 }} />}
                </div>
                <div style={{ fontSize: 10.5, color: "var(--fg4)" }}>{CAT[e.cat].label} · {e.muscle}</div>
              </div>
              <Plus size={13} style={{ color: "var(--fg4)", flexShrink: 0 }} />
            </div>
          ))}
        </div>
      )}

      {activeTab === "templates" && (
        <div style={{ flex: 1, overflowY: "auto", padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          {SECTION_TEMPLATES.map(t => {
            const meta = SECTION_LABELS[t.type];
            const TIcon = meta.Icon;
            return (
              <div key={t.id}
                draggable
                onDragStart={(ev) => {
                  ev.dataTransfer.setData("application/x-section-template",
                    JSON.stringify({ id: t.id, title: t.title, type: t.type }));
                  ev.dataTransfer.effectAllowed = "copy";
                }}
                style={{
                  padding: 10, border: "1px solid var(--border)", borderRadius: 8,
                  background: "#fff", cursor: "grab",
                }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                  <TIcon size={12} style={{ color: "var(--brand-primary)" }} />
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--fg1)" }}>{t.title}</span>
                </div>
                <div style={{ fontSize: 10.5, color: "var(--fg4)" }}>{t.count} exercises · used {t.lastUsed}</div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ padding: 10, borderTop: "1px solid var(--border)", background: "var(--bg)" }}>
        <button className="btn btn-secondary" style={{ width: "100%" }} onClick={onNewExercise}>
          <Plus size={13} />New custom exercise
        </button>
      </div>
    </aside>
  );
}

function InterSectionSlot({
  onClick, onTemplateDrop,
}: {
  onClick: () => void;
  onTemplateDrop: (e: React.DragEvent) => boolean;
}) {
  const [hot, setHot] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("application/x-section-template")) {
          e.preventDefault();
          setHot(true);
        }
      }}
      onDragLeave={() => setHot(false)}
      onDrop={(e) => { setHot(false); onTemplateDrop(e); }}
      style={{
        height: hot || hover ? 26 : 10, transition: "height 120ms",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
      }}
      onClick={onClick}>
      {(hot || hover) && (
        <div style={{
          flex: 1, height: 2, background: hot ? "var(--brand-primary)" : "var(--border)",
          borderRadius: 99, position: "relative",
        }}>
          <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            background: "#fff", border: `1px solid ${hot ? "var(--brand-primary)" : "var(--border)"}`,
            borderRadius: 999, padding: "1px 8px", fontSize: 10.5,
            color: hot ? "var(--brand-primary)" : "var(--fg3)",
            fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", gap: 4,
          }}>
            <Plus size={10} />{hot ? "Drop section here" : "Add section"}
          </div>
        </div>
      )}
    </div>
  );
}

function useRelativeTime(ts: number): string {
  const [, force] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => {
    const id = setInterval(force, 5000);
    return () => clearInterval(id);
  }, []);
  const sec = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  return `${Math.floor(min / 60)}h ago`;
}

function BuilderHeader({
  workout, onNameChange, onBack, onSave, onAssign, onSchedule, savedAt,
}: {
  workout: WorkoutState;
  onNameChange: (n: string) => void;
  onBack: () => void;
  onSave: () => void;
  onAssign: () => void;
  onSchedule: () => void;
  savedAt: number;
}) {
  const [editingName, setEditingName] = React.useState(false);
  const rel = useRelativeTime(savedAt);
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 5,
      background: "#fff", borderBottom: "1px solid var(--border)",
      padding: "12px 24px", display: "flex", alignItems: "center", gap: 14,
    }}>
      <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ flexShrink: 0 }}>
        <ChevLeft size={14} />Library
      </button>
      <div style={{ width: 1, height: 22, background: "var(--border)", flexShrink: 0 }} />

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, color: "var(--fg4)" }}>
          <span>{workout.program}</span>
          <ChevRight size={10} />
          <span>Week {workout.week}</span>
          <ChevRight size={10} />
          <span>Day {workout.day}</span>
        </div>
        {editingName ? (
          <input autoFocus value={workout.name} onChange={(e) => onNameChange(e.target.value)}
            onBlur={() => setEditingName(false)}
            onKeyDown={(e) => { if (e.key === "Enter") setEditingName(false); }}
            style={{
              font: "700 18px var(--font-display-xl)", letterSpacing: "-0.02em", color: "var(--fg1)",
              border: "1px solid var(--border)", borderRadius: 5, padding: "2px 8px", outline: "none",
            }} />
        ) : (
          <h1 onClick={() => setEditingName(true)} style={{
            font: "700 19px var(--font-display-xl)", letterSpacing: "-0.02em",
            margin: 0, color: "var(--fg1)", cursor: "text", display: "inline-flex", alignItems: "center", gap: 6,
          }}>
            {workout.name}
            <Edit size={13} style={{ color: "var(--fg5)" }} />
          </h1>
        )}
      </div>

      <span style={{ fontSize: 11, color: "var(--fg4)", display: "flex", alignItems: "center", gap: 4 }}>
        <Check size={12} style={{ color: "#10B981" }} />Auto-saved · {rel}
      </span>

      <div style={{ width: 1, height: 22, background: "var(--border)" }} />

      <button className="btn btn-secondary btn-sm" onClick={onSchedule}><Cal size={13} />Schedule</button>
      <button className="btn btn-secondary btn-sm" onClick={onAssign}><User size={13} />Assign client</button>
      <button className="btn btn-primary btn-sm" onClick={onSave}><Send size={13} />Send to client</button>
    </header>
  );
}

function WorkoutSummary({ workout }: { workout: WorkoutState }) {
  const totalSections = workout.sections.length;
  const totalExercises = workout.sections.reduce((s, sec) => s + sec.exercises.length, 0);
  const totalSets = workout.sections.reduce((s, sec) => s + sec.exercises.reduce((a, e) => a + (e.sets || 0), 0), 0);
  const totalRest = workout.sections.reduce((s, sec) => s + sec.exercises.reduce((a, e) => a + ((e.sets || 0) * (e.rest || 0)), 0), 0);
  const estMin = Math.round((totalSets * 45 + totalRest) / 60);

  const items: { label: string; value: string | number; Icon: React.ComponentType<{ size?: number }> }[] = [
    { label: "Sections", value: totalSections, Icon: Layout },
    { label: "Exercises", value: totalExercises, Icon: Dumbbell },
    { label: "Total sets", value: totalSets, Icon: Activity },
    { label: "Est. duration", value: `${estMin} min`, Icon: Clock },
  ];
  return (
    <div style={{
      background: "#fff", border: "1px solid var(--border)", borderRadius: 10,
      padding: "10px 14px", display: "flex", gap: 24, alignItems: "center",
    }}>
      {items.map((it, i) => (
        <React.Fragment key={it.label}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7, background: "var(--brand-primary-50)",
              color: "var(--brand-primary)", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <it.Icon size={14} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: "var(--fg4)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{it.label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--fg1)" }}>{it.value}</div>
            </div>
          </div>
          {i < items.length - 1 && <div style={{ width: 1, height: 24, background: "var(--border)" }} />}
        </React.Fragment>
      ))}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 11.5, color: "var(--fg3)" }}>Assigned to</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 9px 3px 3px", background: "var(--bg)", borderRadius: 99, border: "1px solid var(--border)" }}>
          <Avatar name={workout.client} size={22} />
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--fg1)" }}>{workout.client}</span>
        </div>
      </div>
    </div>
  );
}

export function BuilderScreen({
  palette, onBack, onAssign, onSchedule, onNewExercise, dynamicLibrary, initialWorkout,
}: {
  palette: Palette;
  onBack: () => void;
  onAssign: (w: WorkoutState) => void;
  onSchedule: (w: WorkoutState) => void;
  onNewExercise: () => void;
  dynamicLibrary?: LibraryExercise[];
  initialWorkout?: WorkoutState;
}) {
  const [workout, setWorkout] = React.useState<WorkoutState>(initialWorkout ?? (INITIAL_WORKOUT as WorkoutState));
  const [librarySidebarOpen, setLibrarySidebarOpen] = React.useState(true);
  const [draggingSectionId, setDraggingSectionId] = React.useState<string | null>(null);
  const [savedAt, setSavedAt] = React.useState<number>(() => Date.now());
  const firstRunRef = React.useRef(true);

  React.useEffect(() => {
    if (firstRunRef.current) { firstRunRef.current = false; return; }
    const id = setTimeout(() => setSavedAt(Date.now()), 1500);
    return () => clearTimeout(id);
  }, [workout]);

  const setSections = (fn: (secs: SectionState[]) => SectionState[]) =>
    setWorkout(w => ({ ...w, sections: fn(w.sections) }));

  const insertSectionAt = (idx: number, partial: Partial<SectionState>) =>
    setSections(secs => {
      const s: SectionState = {
        id: `s-${Date.now()}`, type: "main", title: "New section", exercises: [],
        ...partial,
      };
      const next = [...secs];
      next.splice(idx, 0, s);
      return next;
    });

  const handleSectionTemplateDrop = (e: React.DragEvent, idx: number) => {
    const raw = e.dataTransfer.getData("application/x-section-template");
    if (!raw) return false;
    e.preventDefault();
    try {
      const t = JSON.parse(raw) as { title: string; type: SectionType };
      insertSectionAt(idx, { title: t.title, type: t.type });
    } catch { /* ignore */ }
    return true;
  };

  const onTitleChange = (sid: string, title: string) =>
    setSections(secs => secs.map(s => s.id === sid ? { ...s, title } : s));
  const onTypeChange = (sid: string, type: SectionType) =>
    setSections(secs => secs.map(s => s.id === sid ? { ...s, type, title: SECTION_LABELS[type].label } : s));
  const onAddSection = () =>
    setSections(secs => [...secs, { id: `s-${Date.now()}`, type: "main", title: "New section", exercises: [] }]);
  const onRemoveSection = (sid: string) =>
    setSections(secs => secs.filter(s => s.id !== sid));
  const onDuplicateSection = (sid: string) => setSections(secs => {
    const i = secs.findIndex(s => s.id === sid);
    if (i < 0) return secs;
    const orig = secs[i];
    const copy: SectionState = {
      ...orig, id: `s-${Date.now()}`, title: `${orig.title} (copy)`,
      exercises: orig.exercises.map(e => ({ ...e, id: `e-${Date.now()}-${Math.random()}` })),
    };
    return [...secs.slice(0, i + 1), copy, ...secs.slice(i + 1)];
  });

  const onAddExercise = (sid: string) => setSections(secs => secs.map(s => s.id === sid ? {
    ...s, exercises: [...s.exercises, {
      id: `e-${Date.now()}`, libId: "ex-25", sets: 3, reps: 10, duration: null, rest: 60, weight: "", note: "",
    }],
  } : s));
  const onUpdateExercise = (sid: string, eid: string, next: SectionExercise) =>
    setSections(secs => secs.map(s => s.id === sid ? {
      ...s, exercises: s.exercises.map(e => e.id === eid ? next : e),
    } : s));
  const onRemoveExercise = (sid: string, eid: string) =>
    setSections(secs => secs.map(s => s.id === sid ? {
      ...s, exercises: s.exercises.filter(e => e.id !== eid),
    } : s));
  const onDuplicateExercise = (sid: string, eid: string) =>
    setSections(secs => secs.map(s => s.id === sid ? {
      ...s, exercises: s.exercises.flatMap(e => e.id === eid ? [e, { ...e, id: `e-${Date.now()}` }] : [e]),
    } : s));
  const onReorderExercises = (sid: string, from: number, to: number) =>
    setSections(secs => secs.map(s => {
      if (s.id !== sid) return s;
      const arr = [...s.exercises];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return { ...s, exercises: arr };
    }));
  const onDropExternal = (sid: string, payload: { libId: string }) =>
    setSections(secs => secs.map(s => s.id === sid ? {
      ...s, exercises: [...s.exercises, {
        id: `e-${Date.now()}`, libId: payload.libId, sets: 3, reps: 10, duration: null, rest: 60, weight: "", note: "",
      }],
    } : s));
  const onPickExercise = (libEx: LibraryExercise) => {
    if (workout.sections.length === 0) return;
    const last = workout.sections[workout.sections.length - 1];
    onDropExternal(last.id, { libId: libEx.id });
  };

  const onSectionDragStart = (e: React.DragEvent, sid: string) => {
    setDraggingSectionId(sid);
    e.dataTransfer.setData("application/x-section", sid);
    e.dataTransfer.effectAllowed = "move";
  };
  const onSectionDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const onSectionDrop = (e: React.DragEvent, targetSid: string) => {
    const fromSid = e.dataTransfer.getData("application/x-section");
    if (!fromSid || fromSid === targetSid) { setDraggingSectionId(null); return; }
    setSections(secs => {
      const fromIdx = secs.findIndex(s => s.id === fromSid);
      const toIdx = secs.findIndex(s => s.id === targetSid);
      if (fromIdx < 0 || toIdx < 0) return secs;
      const arr = [...secs];
      const [moved] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, moved);
      return arr;
    });
    setDraggingSectionId(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: "100vh" }}>
      <BuilderHeader workout={workout}
        onNameChange={(n) => setWorkout({ ...workout, name: n })}
        onBack={onBack}
        onAssign={() => onAssign(workout)}
        onSchedule={() => onSchedule(workout)}
        onSave={() => onAssign(workout)}
        savedAt={savedAt} />

      <div style={{ display: "flex", flex: 1, alignItems: "flex-start" }}>
        <main style={{ flex: 1, padding: "18px 24px 80px", display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <WorkoutSummary workout={workout} />

          {workout.sections.map((s, idx) => (
            <React.Fragment key={s.id}>
              <InterSectionSlot
                onClick={() => insertSectionAt(idx, {})}
                onTemplateDrop={(e) => handleSectionTemplateDrop(e, idx)} />
              <Section
                section={s} palette={palette}
                isDraggingSection={draggingSectionId === s.id}
                onTitleChange={onTitleChange} onTypeChange={onTypeChange}
                onAddExercise={onAddExercise} onUpdateExercise={onUpdateExercise}
                onRemoveExercise={onRemoveExercise} onDuplicateExercise={onDuplicateExercise}
                onRemoveSection={onRemoveSection} onDuplicateSection={onDuplicateSection}
                onReorderExercises={onReorderExercises}
                onSectionDragStart={onSectionDragStart}
                onSectionDragOver={onSectionDragOver}
                onSectionDrop={onSectionDrop}
                onDropExternal={onDropExternal} />
            </React.Fragment>
          ))}

          <button onClick={onAddSection}
            onDragOver={(e) => {
              if (e.dataTransfer.types.includes("application/x-section-template")) e.preventDefault();
            }}
            onDrop={(e) => handleSectionTemplateDrop(e, workout.sections.length)}
            style={{
              background: "transparent", border: "2px dashed var(--border)", borderRadius: 10,
              padding: "18px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              color: "var(--fg3)", font: "500 13px var(--font-sans)", cursor: "pointer",
              transition: "all 100ms",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--brand-primary)"; e.currentTarget.style.color = "var(--brand-primary)"; e.currentTarget.style.background = "var(--brand-primary-50)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--fg3)"; e.currentTarget.style.background = "transparent"; }}>
            <Plus size={14} />Add section
          </button>
        </main>

        <LibrarySidebar
          open={librarySidebarOpen}
          onToggle={() => setLibrarySidebarOpen(o => !o)}
          onPickExercise={onPickExercise}
          onNewExercise={onNewExercise}
          dynamicLibrary={dynamicLibrary} />
      </div>
    </div>
  );
}
