"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  ChevronLeft, ChevronRight, Calendar, Plus, SlidersHorizontal, ArrowRight,
  Pencil, X, MoreHorizontal, Search,
} from "lucide-react";
import type { Program, ProgramSummary } from "@/lib/library-types";
import {
  clearProgramDay, getProgram, getWorkoutPreview, listWorkoutOptions,
  setProgramDay, updateProgram, type WorkoutOption, type WorkoutPreview,
} from "@/lib/programs-api";

interface DayEntry { workoutId: string; workoutName: string; }

export default function ProgramPlannerView({
  program: initialProgram, onBack, onEditInfo, onAssign,
}: {
  program: Program;
  onBack: () => void;
  onEditInfo: (p: ProgramSummary) => void;
  onAssign: (p: ProgramSummary) => void;
}) {
  const [program, setProgram] = useState<Program>(initialProgram);
  const [weeks, setWeeks] = useState(program.weeks ?? Math.max(1, Math.ceil(program.durationDays / 7)));
  const [days, setDays] = useState<Map<number, DayEntry>>(() => buildDays(initialProgram));
  const [weekView, setWeekView] = useState<1 | 2 | 4>(4);
  const [weekOffset, setWeekOffset] = useState(0);
  const [liveSync, setLiveSync] = useState(false);
  const [toastInfo, setToastInfo] = useState(false);
  const [dragging, setDragging] = useState<number | null>(null);
  const [previews, setPreviews] = useState<Map<string, WorkoutPreview>>(new Map());
  const [pickFor, setPickFor] = useState<number | null>(null);
  const [options, setOptions] = useState<WorkoutOption[]>([]);

  useEffect(() => { setProgram(initialProgram); setDays(buildDays(initialProgram)); }, [initialProgram]);

  // Load workout previews for distinct assigned workouts
  useEffect(() => {
    const ids = Array.from(new Set(Array.from(days.values()).map((d) => d.workoutId)));
    const missing = ids.filter((id) => !previews.has(id));
    if (missing.length === 0) return;
    let cancelled = false;
    Promise.all(missing.map((id) => getWorkoutPreview(id).catch(() => null)))
      .then((results) => {
        if (cancelled) return;
        setPreviews((prev) => {
          const next = new Map(prev);
          results.forEach((r) => { if (r) next.set(r.id, r); });
          return next;
        });
      });
    return () => { cancelled = true; };
  }, [days, previews]);

  useEffect(() => {
    if (pickFor === null || options.length > 0) return;
    listWorkoutOptions().then(setOptions).catch(() => toast.error("Failed to load workouts"));
  }, [pickFor, options.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setToastInfo(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const maxOffset = Math.max(0, weeks - weekView);
  const start = Math.min(weekOffset, maxOffset);
  const end = Math.min(start + weekView, weeks);

  const refresh = useCallback(async () => {
    try {
      const fresh = await getProgram(program.id);
      setProgram(fresh);
      setDays(buildDays(fresh));
    } catch { /* keep optimistic state */ }
  }, [program.id]);

  const placeWorkout = async (sourceDay: number, targetDay: number, copy: boolean) => {
    const src = days.get(sourceDay);
    if (!src) return;
    setDays((prev) => {
      const next = new Map(prev);
      next.set(targetDay, src);
      if (!copy) next.delete(sourceDay);
      return next;
    });
    setToastInfo(true);
    try {
      await setProgramDay(program.id, targetDay, src.workoutId);
      if (!copy) await clearProgramDay(program.id, sourceDay);
    } catch {
      toast.error("Failed to move workout");
      refresh();
    }
  };

  const pickWorkout = async (day: number, opt: WorkoutOption) => {
    setPickFor(null);
    setDays((prev) => new Map(prev).set(day, { workoutId: opt.id, workoutName: opt.name }));
    try {
      await setProgramDay(program.id, day, opt.id);
    } catch {
      toast.error("Failed to assign workout");
      refresh();
    }
  };

  const removeDay = async (day: number) => {
    setDays((prev) => { const next = new Map(prev); next.delete(day); return next; });
    try {
      await clearProgramDay(program.id, day);
    } catch {
      toast.error("Failed to clear day");
      refresh();
    }
  };

  const addWeek = async () => {
    const next = weeks + 1;
    setWeeks(next);
    try {
      await updateProgram(program.id, { weeks: next });
    } catch {
      toast.error("Failed to add week");
      setWeeks(weeks);
    }
  };

  const summary: ProgramSummary = program;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "20px 28px 80px", position: "relative" }}>
      {/* Context header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} style={ghostBtn}><ChevronLeft size={14} />Programs</button>
        <div style={{ width: 1, height: 18, background: "var(--border)" }} />
        <h1 style={{ font: "700 22px var(--font-display-xl)", letterSpacing: "-0.02em", margin: 0, color: "var(--fg1)" }}>
          {program.name}
        </h1>
        <button onClick={() => onEditInfo(summary)} style={{ ...secBtn, padding: "6px 12px", marginLeft: 4 }}>
          <Pencil size={12} />Edit Info
        </button>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12.5, color: "var(--fg3)" }}>
          <span style={{ color: "var(--fg1)", fontWeight: 600 }}>29 days left</span> until trial ends
        </span>
        <button style={{
          background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)", border: "none", color: "#fff",
          padding: "8px 22px", borderRadius: 8, fontWeight: 700, fontSize: 12.5, cursor: "pointer",
        }}>Upgrade</button>
      </div>

      {/* Control bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
        padding: "10px 14px", background: "#fff", border: "1px solid var(--border)",
        borderRadius: 12, boxShadow: "var(--shadow-sm)",
      }}>
        <button onClick={() => setWeekOffset(Math.max(0, start - weekView))} disabled={start === 0} style={navBtn(start === 0)}>
          <ChevronLeft size={14} />
        </button>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px",
          border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg)",
          fontSize: 12.5, color: "var(--fg1)", fontWeight: 600,
        }}>
          <Calendar size={13} style={{ color: "var(--fg3)" }} />
          {weekView === 1 ? `Week ${start + 1} of ${weeks}` : `Week ${start + 1} - ${end} of ${weeks}`}
        </div>
        <button onClick={() => setWeekOffset(Math.min(maxOffset, start + weekView))} disabled={start >= maxOffset} style={navBtn(start >= maxOffset)}>
          <ChevronRight size={14} />
        </button>
        <button onClick={addWeek} style={{
          ...navBtn(false), padding: "6px 14px", width: "auto", color: "var(--fg4)",
          border: "1px dashed var(--border-strong)", marginLeft: 4, fontSize: 12.5, fontWeight: 500,
          display: "inline-flex", alignItems: "center", gap: 5,
        }}><Plus size={12} /> Add Week</button>

        <div style={{ flex: 1 }} />

        <button onClick={() => toast("Master Planner coming soon")} style={{
          background: "linear-gradient(135deg,#8B5CF6 0%, #7C3AED 100%)", color: "#fff", border: "none",
          padding: "8px 16px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
          display: "inline-flex", alignItems: "center", gap: 7,
        }}><SlidersHorizontal size={13} />Master Planner</button>
        <button onClick={() => onAssign(summary)} style={{
          background: "var(--brand-primary)", color: "#fff", border: "none",
          padding: "8px 16px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
          display: "inline-flex", alignItems: "center", gap: 7,
        }}><ArrowRight size={13} />Assign Program</button>

        <div style={{ flex: 1 }} />

        <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <span onClick={() => setLiveSync((s) => !s)} style={{
            position: "relative", width: 36, height: 20, borderRadius: 99,
            background: liveSync ? "var(--brand-primary)" : "#CBD5E1", transition: "background 150ms",
          }}>
            <span style={{
              position: "absolute", top: 2, left: liveSync ? 18 : 2, width: 16, height: 16,
              borderRadius: "50%", background: "#fff", transition: "left 150ms", boxShadow: "0 1px 2px rgba(0,0,0,.2)",
            }} />
          </span>
          <span style={{ fontSize: 9.5, fontWeight: 700, color: "var(--fg2)", textTransform: "uppercase", letterSpacing: "0.08em", lineHeight: 1.1 }}>
            ENABLE<br />LIVE SYNC
          </span>
        </label>

        <div style={{ display: "inline-flex", gap: 0, padding: 3, background: "var(--bg)", borderRadius: 9, border: "1px solid var(--border)" }}>
          {([1, 2, 4] as const).map((v) => {
            const on = weekView === v;
            return (
              <button key={v} onClick={() => { setWeekView(v); setWeekOffset((o) => Math.min(o, Math.max(0, weeks - v))); }} style={{
                padding: "6px 16px", border: "none", borderRadius: 7,
                background: on ? "#0F172A" : "transparent", color: on ? "#fff" : "var(--fg2)",
                font: `${on ? 600 : 500} 12.5px var(--font-sans)`, cursor: "pointer",
              }}>{v} Week</button>
            );
          })}
        </div>
      </div>

      {/* Calendar */}
      <div style={{
        background: "#fff", border: "1px solid var(--border)", borderRadius: 12,
        boxShadow: "var(--shadow-sm)", padding: "16px 18px 22px",
      }}>
        {Array.from({ length: end - start }, (_, i) => start + i).map((weekIdx) => (
          <WeekRow key={weekIdx} weekIdx={weekIdx} days={days} previews={previews} weekView={weekView}
            onDragStart={setDragging} onDragEnd={() => setDragging(null)}
            onDrop={(targetDay, shift) => {
              if (dragging != null) { placeWorkout(dragging, targetDay, shift); setDragging(null); }
            }}
            onPick={(day) => setPickFor(day)} onRemove={removeDay} />
        ))}
      </div>

      {/* Copy/paste toast */}
      {toastInfo && (
        <div style={{
          position: "fixed", left: "calc(50% + 116px)", bottom: 24, transform: "translateX(-50%)", zIndex: 60,
          display: "flex", alignItems: "center", background: "#fff", border: "1px solid var(--border)",
          borderRadius: 99, boxShadow: "0 8px 24px rgba(15,23,42,.12)", padding: "6px 10px 6px 18px",
        }}>
          <span style={{ padding: "5px 14px", borderRadius: 99, background: "#E2E8F0", color: "var(--fg2)", fontSize: 11.5, fontWeight: 600 }}>
            Workout placed
          </span>
          <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 14px" }} />
          <span style={{ fontSize: 12.5, color: "var(--fg2)", display: "inline-flex", alignItems: "center", gap: 6 }}>
            Hold
            <kbd style={{ padding: "3px 10px", borderRadius: 6, background: "#0F172A", color: "#fff", font: "600 11.5px var(--font-mono)" }}>Shift</kbd>
            while dragging to copy
          </span>
          <button onClick={() => setToastInfo(false)} title="Dismiss" style={{
            marginLeft: 12, width: 28, height: 28, border: "none", borderRadius: 6, background: "transparent",
            cursor: "pointer", color: "var(--fg3)", display: "flex", alignItems: "center", justifyContent: "center",
          }}><X size={14} /></button>
        </div>
      )}

      {pickFor !== null && (
        <WorkoutPickerModal day={pickFor} options={options} onClose={() => setPickFor(null)} onPick={pickWorkout} />
      )}
    </div>
  );
}

function buildDays(p: Program): Map<number, DayEntry> {
  const m = new Map<number, DayEntry>();
  for (const d of p.days ?? []) {
    if (d.workoutId) m.set(d.dayNumber, { workoutId: d.workoutId, workoutName: d.workoutName || "Workout" });
  }
  return m;
}

function WeekRow({
  weekIdx, days, previews, weekView, onDragStart, onDragEnd, onDrop, onPick, onRemove,
}: {
  weekIdx: number; days: Map<number, DayEntry>; previews: Map<string, WorkoutPreview>; weekView: 1 | 2 | 4;
  onDragStart: (day: number) => void; onDragEnd: () => void;
  onDrop: (targetDay: number, shift: boolean) => void;
  onPick: (day: number) => void; onRemove: (day: number) => void;
}) {
  const weekNum = weekIdx + 1;
  const dayStart = weekIdx * 7 + 1;
  const cellMinH = weekView === 1 ? 360 : weekView === 2 ? 280 : 220;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "32px repeat(7, 1fr)", gap: 8, alignItems: "stretch", marginBottom: 14 }}>
      <div style={{
        writingMode: "vertical-rl", transform: "rotate(180deg)", font: "600 10px var(--font-mono)",
        letterSpacing: "0.16em", color: "var(--fg4)", textTransform: "uppercase",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>WEEK {weekNum}</div>
      {Array.from({ length: 7 }, (_, i) => {
        const day = dayStart + i;
        const entry = days.get(day);
        return (
          <DayCell key={day} day={day} entry={entry} preview={entry ? previews.get(entry.workoutId) : undefined}
            minH={cellMinH} weekView={weekView} onDragStart={onDragStart} onDragEnd={onDragEnd}
            onDrop={(shift) => onDrop(day, shift)} onPick={() => onPick(day)} onRemove={() => onRemove(day)} />
        );
      })}
    </div>
  );
}

function DayCell({
  day, entry, preview, minH, weekView, onDragStart, onDragEnd, onDrop, onPick, onRemove,
}: {
  day: number; entry?: DayEntry; preview?: WorkoutPreview; minH: number; weekView: 1 | 2 | 4;
  onDragStart: (day: number) => void; onDragEnd: () => void;
  onDrop: (shift: boolean) => void; onPick: () => void; onRemove: () => void;
}) {
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); onDrop(e.shiftKey); }}
      style={{
        minHeight: minH, background: over ? "var(--brand-primary-50)" : "var(--bg)",
        border: over ? "1px dashed var(--brand-primary)" : "1px solid var(--border-subtle)",
        borderRadius: 9, padding: "10px 10px 8px", display: "flex", flexDirection: "column", gap: 8,
        transition: "background 80ms",
      }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ font: "600 11px var(--font-sans)", color: "var(--fg3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>DAY {day}</span>
        {!entry && (
          <button onClick={onPick} title="Add workout" style={{
            width: 20, height: 20, border: "none", borderRadius: 5, background: "transparent",
            cursor: "pointer", color: "var(--fg4)", display: "flex", alignItems: "center", justifyContent: "center",
          }}><Plus size={13} /></button>
        )}
      </div>
      {entry && (
        <WorkoutCard entry={entry} preview={preview} weekView={weekView}
          onDragStart={() => onDragStart(day)} onDragEnd={onDragEnd} onRemove={onRemove} />
      )}
    </div>
  );
}

function WorkoutCard({
  entry, preview, weekView, onDragStart, onDragEnd, onRemove,
}: {
  entry: DayEntry; preview?: WorkoutPreview; weekView: 1 | 2 | 4;
  onDragStart: () => void; onDragEnd: () => void; onRemove: () => void;
}) {
  const showCount = weekView === 1 ? 5 : weekView === 2 ? 3 : 0;
  const lines = preview?.lines ?? [];
  const shown = lines.slice(0, showCount);
  const hidden = Math.max(0, (preview?.totalExercises ?? 0) - shown.length);
  return (
    <div draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = "copyMove"; onDragStart(); }}
      onDragEnd={onDragEnd}
      style={{
        background: "#fff", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 10px",
        boxShadow: "var(--shadow-xs)", display: "flex", flexDirection: "column", gap: 8,
        cursor: "grab", userSelect: "none",
      }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 6, borderBottom: "1px solid var(--border-subtle)" }}>
        <span style={{
          font: "700 10.5px var(--font-sans)", color: "#2563EB", letterSpacing: "0.04em",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{(entry.workoutName || "WORKOUT").toUpperCase()}</span>
        <button onClick={(e) => { e.stopPropagation(); onRemove(); }} title="Remove" style={{
          width: 20, height: 20, border: "none", borderRadius: 5, background: "transparent",
          cursor: "pointer", color: "var(--fg3)", display: "flex", alignItems: "center", justifyContent: "center",
        }}><MoreHorizontal size={12} /></button>
      </div>

      {shown.map((ex, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 8, minWidth: 0, padding: "5px 7px",
          borderRadius: 6, border: "1px solid var(--border-subtle)", background: "#FCFCFD",
        }}>
          <span style={{
            flexShrink: 0, font: "700 9.5px var(--font-mono)", color: "var(--fg3)", background: "var(--bg)",
            padding: "2px 6px", borderRadius: 4, minWidth: 22, textAlign: "center",
          }}>{ex.sets ? `${ex.sets}x` : "•"}</span>
          <div style={{ minWidth: 0, flex: 1, textAlign: "right" }}>
            <div style={{ font: "600 10.5px var(--font-sans)", color: "var(--fg1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ex.name}</div>
            <div style={{ font: "500 9.5px var(--font-mono)", color: "var(--fg3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ex.target}</div>
          </div>
        </div>
      ))}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 4, marginTop: "auto" }}>
        <span style={{ fontSize: 10.5, color: "var(--fg4)", fontWeight: 500 }}>
          {hidden > 0 ? `+ ${hidden} more exercises` : `${preview?.totalExercises ?? 0} exercises`}
        </span>
      </div>
    </div>
  );
}

function WorkoutPickerModal({
  day, options, onClose, onPick,
}: {
  day: number; options: WorkoutOption[]; onClose: () => void; onPick: (day: number, opt: WorkoutOption) => void;
}) {
  const [q, setQ] = useState("");
  const filtered = options.filter((o) => !q || o.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 90, padding: 24,
    }}>
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-label={`Add workout to day ${day}`} style={{
        background: "#fff", borderRadius: 12, width: "100%", maxWidth: 420, maxHeight: "70vh",
        display: "flex", flexDirection: "column", boxShadow: "var(--shadow-xl)", overflow: "hidden",
      }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ margin: 0, font: "600 15px var(--font-display)" }}>Add workout to Day {day}</h3>
          <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--fg3)" }}><X size={15} /></button>
        </div>
        <div style={{ padding: "12px 18px" }}>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--fg4)" }} />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search workouts…" style={{
              width: "100%", padding: "8px 11px 8px 32px", border: "1px solid var(--border)", borderRadius: 8,
              fontSize: 13, outline: "none",
            }} />
          </div>
        </div>
        <div style={{ overflowY: "auto", padding: "0 12px 12px" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: "var(--fg3)", fontSize: 13 }}>No workouts found.</div>
          ) : filtered.map((o) => (
            <button key={o.id} onClick={() => onPick(day, o)} style={{
              width: "100%", textAlign: "left", padding: "9px 11px", borderRadius: 7, border: "none",
              background: "transparent", cursor: "pointer", fontSize: 13, color: "var(--fg1)", fontWeight: 500,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
              {o.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const ghostBtn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 7,
  border: "none", background: "transparent", color: "var(--fg2)", fontSize: 12.5, fontWeight: 500, cursor: "pointer",
};
const secBtn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 7,
  border: "1px solid var(--border)", background: "#fff", color: "var(--fg1)", fontSize: 12, fontWeight: 500, cursor: "pointer",
};
const navBtn = (disabled: boolean): React.CSSProperties => ({
  width: 32, height: 32, padding: 0, border: "1px solid var(--border)", borderRadius: 8,
  background: "#fff", cursor: disabled ? "not-allowed" : "pointer",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  color: disabled ? "var(--fg5)" : "var(--fg2)", opacity: disabled ? 0.6 : 1,
});
