"use client";
import * as React from "react";
import {
  CATEGORIES, LIBRARY, type LibraryExercise, type SavedWorkout, type Palette,
} from "./data";
import {
  Search, Filter, Plus, ChevDown, ChevRight, ChevLeft, X, MoreH, MoreV,
  Tag, Sparkles, Dumbbell, Utensils, Check, Layout, Clock, Activity, User,
  ArrowR,
} from "./icons";
import {
  ExThumb, CatBadge, CustomBadge, Avatar, FilterChip, MenuItem, Edit, Copy, Trash, Send,
} from "./shared";

const th: React.CSSProperties = {
  padding: "9px 13px", textAlign: "left", fontSize: 10.5, fontWeight: 600,
  color: "var(--fg3)", textTransform: "uppercase", letterSpacing: "0.05em",
};
const td: React.CSSProperties = { padding: "10px 13px", verticalAlign: "middle" };
const tdTop: React.CSSProperties = { padding: "12px 13px", verticalAlign: "top" };

function LibrarySubTabs({
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

function WorkoutsTab({
  workouts, palette, onOpenWorkout, onDuplicateWorkout, onDeleteWorkout, onAssignWorkout,
}: {
  workouts: SavedWorkout[];
  palette: Palette;
  onCreateWorkout?: () => void;
  onOpenWorkout: (w: SavedWorkout) => void;
  onDuplicateWorkout: (w: SavedWorkout) => void;
  onDeleteWorkout: (w: SavedWorkout) => void;
  onAssignWorkout?: (w: SavedWorkout) => void;
}) {
  const [q, setQ] = React.useState("");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [hovered, setHovered] = React.useState<string | null>(null);
  const [menuFor, setMenuFor] = React.useState<string | null>(null);

  const filtered = workouts.filter(w =>
    !q || w.name.toLowerCase().includes(q.toLowerCase()) ||
    w.description.toLowerCase().includes(q.toLowerCase())
  );

  const toggle = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };
  const allChecked = filtered.length > 0 && filtered.every(f => selected.has(f.id));

  React.useEffect(() => {
    const fn = () => setMenuFor(null);
    if (menuFor) document.addEventListener("click", fn);
    return () => document.removeEventListener("click", fn);
  }, [menuFor]);

  return (
    <>
      <div className="card" style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 280px", minWidth: 240 }}>
          <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--fg4)" }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search workout name…"
            style={{ width: "100%", padding: "7px 12px 7px 32px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12.5, background: "#fff", outline: "none" }} />
        </div>
        <button className="btn btn-secondary btn-sm"><Filter size={12} />Filter</button>
      </div>

      <div className="card" style={{ overflow: "hidden", padding: 0 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
              <th style={{ ...th, width: 36 }}>
                <input type="checkbox" checked={allChecked}
                  onChange={(e) => setSelected(e.target.checked ? new Set(filtered.map(x => x.id)) : new Set())} />
              </th>
              <th style={th}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <ArrowR size={11} style={{ transform: "rotate(90deg)", opacity: 0.5 }} />
                  Workouts <span style={{ color: "var(--fg4)", fontWeight: 500 }}>({filtered.length})</span>
                  <ChevDown size={11} style={{ marginLeft: 2 }} />
                </span>
              </th>
              <th style={th}><Tag size={11} style={{ display: "inline", marginRight: 4, verticalAlign: "-1px" }} />Tags</th>
              <th style={{ ...th, width: 120 }}>
                <Activity size={11} style={{ display: "inline", marginRight: 4, verticalAlign: "-1px" }} />Exercises
              </th>
              <th style={{ ...th, width: 140 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--brand-primary)" }}>
                  <Clock size={11} />Most recent <ChevDown size={11} />
                </span>
              </th>
              <th style={{ ...th, width: 160 }}>
                <User size={11} style={{ display: "inline", marginRight: 4, verticalAlign: "-1px" }} />Owner
              </th>
              <th style={{ ...th, width: 36 }} />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: "40px 16px", textAlign: "center", color: "var(--fg3)" }}>
                No workouts match. <button onClick={() => setQ("")} style={{ background: "none", border: "none", color: "var(--brand-primary)", fontWeight: 500, cursor: "pointer" }}>Clear search</button>
              </td></tr>
            )}
            {filtered.map(w => {
              const on = selected.has(w.id);
              const hov = hovered === w.id;
              return (
                <tr key={w.id}
                  onMouseEnter={() => setHovered(w.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => onOpenWorkout(w)}
                  style={{
                    borderTop: "1px solid var(--border-subtle)",
                    background: on ? "var(--brand-primary-50)" : (hov ? "var(--bg)" : "#fff"),
                    cursor: "pointer", transition: "background 80ms", verticalAlign: "top",
                  }}>
                  <td style={tdTop} onClick={(e) => { e.stopPropagation(); toggle(w.id); }}>
                    <input type="checkbox" checked={on} onChange={() => {}} />
                  </td>
                  <td style={tdTop}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--fg1)", marginBottom: 3 }}>{w.name}</div>
                    <div style={{ fontSize: 12, color: "var(--fg3)", lineHeight: 1.45, marginBottom: 8, maxWidth: 520, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {w.description}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {w.sections.map((s, i) => {
                        const p = palette[s.type] || palette.main;
                        return (
                          <span key={i} style={{
                            fontSize: 10.5, padding: "2px 8px", borderRadius: 99,
                            background: p.bg, color: p.barText, border: `1px solid ${p.bar}33`,
                            fontWeight: 500, whiteSpace: "nowrap",
                          }}>{s.title} ({s.exCount})</span>
                        );
                      })}
                    </div>
                  </td>
                  <td style={tdTop}><span style={{ color: "var(--fg4)", fontSize: 12 }}>—</span></td>
                  <td style={tdTop}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--fg1)", display: "flex", alignItems: "center", gap: 5 }}>
                        <ArrowR size={11} style={{ color: "var(--fg4)", transform: "rotate(90deg)" }} />
                        {w.exerciseCount}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--fg4)" }}>exercises · {w.sectionCount} sections</span>
                    </div>
                  </td>
                  <td style={tdTop}><span style={{ fontSize: 12.5, color: "var(--fg2)" }}>{w.lastUsed}</span></td>
                  <td style={tdTop}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <Avatar name={w.owner} size={24} />
                      <div style={{ fontSize: 12, color: "var(--fg2)", lineHeight: 1.2 }}>
                        <div>{w.owner.split(" ")[0]}</div>
                        <div style={{ color: "var(--fg4)" }}>{w.owner.split(" ").slice(1).join(" ")}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ ...tdTop, position: "relative", whiteSpace: "nowrap", textAlign: "right" }}
                    onClick={(e) => e.stopPropagation()}>
                    <button className="btn btn-ghost btn-sm"
                      onClick={(e) => { e.stopPropagation(); setMenuFor(menuFor === w.id ? null : w.id); }}>
                      <MoreV size={14} />
                    </button>
                    {menuFor === w.id && (
                      <div style={{
                        position: "absolute", top: 30, right: 8, zIndex: 30,
                        background: "#fff", border: "1px solid var(--border)", borderRadius: 8,
                        boxShadow: "var(--shadow-lg)", minWidth: 160, padding: 5,
                      }}>
                        <MenuItem Icon={Edit} onClick={() => { setMenuFor(null); onOpenWorkout(w); }}>Edit</MenuItem>
                        <MenuItem Icon={Copy} onClick={() => { setMenuFor(null); onDuplicateWorkout(w); }}>Duplicate</MenuItem>
                        <MenuItem Icon={Send} onClick={() => { setMenuFor(null); onAssignWorkout?.(w); }}>Assign to client</MenuItem>
                        <div style={{ height: 1, background: "var(--border-subtle)", margin: "4px 0" }} />
                        <MenuItem Icon={Trash} danger onClick={() => { setMenuFor(null); onDeleteWorkout(w); }}>Delete</MenuItem>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 14px", borderTop: "1px solid var(--border-subtle)",
          fontSize: 11.5, color: "var(--fg3)", background: "var(--bg)",
        }}>
          <span>{selected.size > 0 ? `${selected.size} selected` : `Showing 1–${filtered.length} of ${filtered.length}`}</span>
          <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
            <button className="btn btn-ghost btn-sm" disabled style={{ opacity: 0.5 }}><ChevLeft size={13} /></button>
            <span style={{ padding: "4px 10px", fontWeight: 600, color: "var(--fg2)", background: "#fff", border: "1px solid var(--border)", borderRadius: 5 }}>1</span>
            <button className="btn btn-ghost btn-sm"><ChevRight size={13} /></button>
          </div>
        </div>
      </div>

      {selected.size > 0 && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "var(--sidebar)", color: "#fff", padding: "9px 14px", borderRadius: 11,
          boxShadow: "var(--shadow-lg)", display: "flex", alignItems: "center", gap: 12, zIndex: 50,
        }}>
          <span style={{ fontSize: 12.5, fontWeight: 500 }}>{selected.size} selected</span>
          <div style={{ width: 1, height: 18, background: "#334155" }} />
          <button className="btn btn-ghost btn-sm" style={{ color: "#E0E7FF" }}><Copy size={12} />Duplicate</button>
          <button className="btn btn-ghost btn-sm" style={{ color: "#E0E7FF" }}><Tag size={12} />Tag</button>
          <button className="btn btn-ghost btn-sm" style={{ color: "#FCA5A5" }}><Trash size={12} />Delete</button>
          <button className="btn btn-ghost btn-sm" style={{ color: "#94A3B8" }} onClick={() => setSelected(new Set())}><X size={12} /></button>
        </div>
      )}
    </>
  );
}

export function LibraryScreen({
  onOpenBuilder, onNewExercise, onEditExercise, dynamicLibrary, workouts,
  onCreateWorkout, onOpenWorkout, onDuplicateWorkout, onDeleteWorkout, onAssignWorkout, palette, initialTab,
}: {
  onOpenBuilder: () => void;
  onNewExercise: (ex: LibraryExercise | null) => void;
  onEditExercise: (ex: LibraryExercise) => void;
  dynamicLibrary?: LibraryExercise[];
  workouts: SavedWorkout[];
  onCreateWorkout: () => void;
  onOpenWorkout: (w: SavedWorkout) => void;
  onDuplicateWorkout: (w: SavedWorkout) => void;
  onDeleteWorkout: (w: SavedWorkout) => void;
  onAssignWorkout?: (w: SavedWorkout) => void;
  palette: Palette;
  initialTab?: string;
}) {
  const [activeTab, setActiveTab] = React.useState<string>(initialTab || "exercises");
  React.useEffect(() => { if (initialTab) setActiveTab(initialTab); }, [initialTab]);
  const [q, setQ] = React.useState("");
  const [activeCat, setActiveCat] = React.useState<string>("all");
  const [activeMuscle, setActiveMuscle] = React.useState<string>("all");
  const [activeEquip, setActiveEquip] = React.useState<string>("all");
  const [showCustomOnly, setShowCustomOnly] = React.useState(false);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [hovered, setHovered] = React.useState<string | null>(null);

  const lib = dynamicLibrary || LIBRARY;
  const muscles = ["all", ...Array.from(new Set(lib.map(e => e.muscle)))];

  const filtered = lib.filter(e =>
    (activeCat === "all" || e.cat === activeCat) &&
    (activeMuscle === "all" || e.muscle === activeMuscle) &&
    (activeEquip === "all" || e.equip === activeEquip) &&
    (!showCustomOnly || e.custom) &&
    (!q || e.name.toLowerCase().includes(q.toLowerCase()))
  );

  const toggle = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };
  const toggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(e.target.checked ? new Set(filtered.map(x => x.id)) : new Set());
  };
  const allChecked = filtered.length > 0 && filtered.every(f => selected.has(f.id));

  return (
    <div style={{ padding: "20px 28px 80px", display: "flex", flexDirection: "column", gap: 16, minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <span style={{ fontSize: 11, color: "var(--fg4)" }}>Library</span>
            <ChevRight size={11} style={{ color: "var(--fg4)" }} />
            <span style={{ fontSize: 11, color: "var(--fg2)", fontWeight: 500 }}>Fitness</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-display-xl)", fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>Library</h1>
          <p style={{ fontSize: 13, color: "var(--fg3)", margin: "3px 0 0" }}>Reusable templates — fitness, nutrition, habits, and forms.</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {(activeTab === "workouts" || activeTab === "exercises") && (
            <>
              <button className="btn btn-secondary"><Tag size={13} />Tags</button>
              <button className="btn" style={{
                background: "linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)",
                border: "1px solid #F59E0B", color: "#78350F", fontWeight: 600,
              }}>
                <Sparkles size={13} />NutriCoach AI
              </button>
              <div style={{ width: 1, height: 22, background: "var(--border)", margin: "0 2px" }} />
            </>
          )}
          {activeTab === "workouts" ? (
            <button className="btn btn-primary" onClick={onCreateWorkout}>
              <Plus size={14} />New workout
            </button>
          ) : activeTab === "exercises" ? (
            <button className="btn btn-primary" onClick={() => onNewExercise(null)}>
              <Plus size={14} />New exercise
            </button>
          ) : (
            <button className="btn btn-primary" disabled style={{ opacity: 0.5 }}>
              <Plus size={14} />New
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--border)" }}>
        {[
          { key: "fitness", label: "Fitness", active: true, Icon: Dumbbell },
          { key: "nutrition", label: "Nutrition", Icon: Utensils },
          { key: "habits", label: "Habits", Icon: Check },
          { key: "forms", label: "Forms", Icon: Layout },
        ].map(t => {
          const on = !!t.active;
          return (
            <button key={t.key} style={{
              padding: "8px 16px 10px", border: "none", background: "transparent",
              borderBottom: on ? "2px solid var(--brand-primary)" : "2px solid transparent",
              marginBottom: -1,
              color: on ? "var(--brand-primary)" : "var(--fg3)",
              font: `${on ? 600 : 500} 13px var(--font-sans)`,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
            }}>
              <t.Icon size={14} />{t.label}
            </button>
          );
        })}
      </div>

      <LibrarySubTabs active={activeTab} onChange={setActiveTab} exerciseCount={lib.length} />

      {activeTab === "exercises" && (
        <>
          <div className="card" style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ position: "relative", flex: "1 1 280px", minWidth: 240 }}>
                <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--fg4)" }} />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search exercise name…"
                  style={{ width: "100%", padding: "7px 12px 7px 32px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12.5, background: "#fff", outline: "none" }} />
                <span style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  font: "500 10px var(--font-mono)", background: "var(--bg)",
                  border: "1px solid var(--border)", padding: "1px 5px", borderRadius: 4, color: "var(--fg3)",
                }}>⌘K</span>
              </div>
              <button className="btn btn-secondary btn-sm"><Filter size={12} />More filters</button>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--fg2)", cursor: "pointer", marginLeft: 4 }}>
                <input type="checkbox" checked={showCustomOnly} onChange={(e) => setShowCustomOnly(e.target.checked)}
                  style={{ accentColor: "#7C3AED" }} />
                Custom only
              </label>
              <div style={{ marginLeft: "auto", fontSize: 11.5, color: "var(--fg3)" }}>
                {filtered.length.toLocaleString()} of {lib.length.toLocaleString()} exercises
              </div>
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <FilterChip active={activeCat === "all"} onClick={() => setActiveCat("all")} small>All categories</FilterChip>
              {CATEGORIES.map(c => (
                <FilterChip key={c.key} active={activeCat === c.key} onClick={() => setActiveCat(c.key)} color={c.color} tint={c.tint} small>
                  <c.Icon size={12} />{c.label}
                </FilterChip>
              ))}
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "var(--fg4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginRight: 4 }}>Muscle</span>
              {muscles.slice(0, 9).map(m => (
                <FilterChip key={m} active={activeMuscle === m} onClick={() => setActiveMuscle(m)} small>
                  {m === "all" ? "All" : m}
                </FilterChip>
              ))}
              {muscles.length > 9 && (
                <FilterChip small>+{muscles.length - 9} more <ChevDown size={11} /></FilterChip>
              )}
            </div>
          </div>

          <div className="card" style={{ overflow: "hidden", padding: 0 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
                  <th style={{ ...th, width: 36 }}><input type="checkbox" checked={allChecked} onChange={toggleAll} /></th>
                  <th style={th}>
                    Exercise <span style={{ color: "var(--fg4)", fontWeight: 500 }}>({filtered.length})</span>
                    <ChevDown size={11} style={{ display: "inline", verticalAlign: "middle", marginLeft: 3 }} />
                  </th>
                  <th style={th}>Source</th>
                  <th style={th}>Category <ChevDown size={11} style={{ display: "inline", verticalAlign: "middle", marginLeft: 3 }} /></th>
                  <th style={th}>Muscle group <ChevDown size={11} style={{ display: "inline", verticalAlign: "middle", marginLeft: 3 }} /></th>
                  <th style={th}>Movement pattern</th>
                  <th style={th}>Equipment</th>
                  <th style={{ ...th, textAlign: "right" }} />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: "40px 16px", textAlign: "center", color: "var(--fg3)" }}>
                    No exercises match. <button onClick={() => { setQ(""); setActiveCat("all"); setActiveMuscle("all"); setShowCustomOnly(false); }} style={{ background: "none", border: "none", color: "var(--brand-primary)", fontWeight: 500, cursor: "pointer" }}>Clear filters</button>
                  </td></tr>
                )}
                {filtered.map(ex => {
                  const on = selected.has(ex.id);
                  const hov = hovered === ex.id;
                  return (
                    <tr key={ex.id}
                      onMouseEnter={() => setHovered(ex.id)}
                      onMouseLeave={() => setHovered(null)}
                      style={{
                        borderTop: "1px solid var(--border-subtle)",
                        background: on ? "var(--brand-primary-50)" : (hov ? "var(--bg)" : "#fff"),
                        cursor: "pointer", transition: "background 80ms",
                      }}>
                      <td style={td} onClick={(e) => { e.stopPropagation(); toggle(ex.id); }}>
                        <input type="checkbox" checked={on} onChange={() => {}} />
                      </td>
                      <td style={td} onClick={() => onEditExercise(ex)}>
                        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                          <ExThumb ex={ex} size={36} />
                          <span style={{ fontWeight: 500 }}>{ex.name}</span>
                        </div>
                      </td>
                      <td style={td}>
                        {ex.custom ? <CustomBadge small /> : <span style={{ fontSize: 11, color: "var(--fg4)" }}>Pre-seeded</span>}
                      </td>
                      <td style={td}><CatBadge cat={ex.cat} size="sm" /></td>
                      <td style={td}><span style={{ color: "var(--fg2)" }}>{ex.muscle}</span></td>
                      <td style={td}><span style={{ color: "var(--fg3)", fontSize: 12 }}>{ex.pattern}</span></td>
                      <td style={td}><span style={{ color: "var(--fg3)", fontSize: 12 }}>{ex.equip}</span></td>
                      <td style={{ ...td, textAlign: "right", whiteSpace: "nowrap" }}>
                        {hov ? (
                          <div style={{ display: "inline-flex", gap: 2 }}>
                            <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); onEditExercise(ex); }} title="Edit"><Edit size={13} /></button>
                            <button className="btn btn-ghost btn-sm" title="Duplicate"><Copy size={13} /></button>
                            <button className="btn btn-ghost btn-sm" style={{ color: "var(--danger)" }} title="Delete"><Trash size={13} /></button>
                          </div>
                        ) : <span style={{ color: "var(--fg4)", fontSize: 11 }}><MoreH size={14} /></span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 14px", borderTop: "1px solid var(--border-subtle)",
              fontSize: 11.5, color: "var(--fg3)", background: "var(--bg)",
            }}>
              <span>{selected.size > 0 ? `${selected.size} selected` : `Showing 1–${filtered.length} of ${filtered.length}`}</span>
              <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
                <button className="btn btn-ghost btn-sm" disabled style={{ opacity: 0.5 }}><ChevLeft size={13} /></button>
                <span style={{ padding: "4px 10px", fontWeight: 600, color: "var(--fg2)", background: "#fff", border: "1px solid var(--border)", borderRadius: 5 }}>1</span>
                <button className="btn btn-ghost btn-sm"><ChevRight size={13} /></button>
              </div>
            </div>
          </div>

          {selected.size > 0 && (
            <div style={{
              position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
              background: "var(--sidebar)", color: "#fff", padding: "9px 14px", borderRadius: 11,
              boxShadow: "var(--shadow-lg)", display: "flex", alignItems: "center", gap: 12, zIndex: 50,
            }}>
              <span style={{ fontSize: 12.5, fontWeight: 500 }}>{selected.size} selected</span>
              <div style={{ width: 1, height: 18, background: "#334155" }} />
              <button className="btn btn-ghost btn-sm" style={{ color: "#E0E7FF" }} onClick={onOpenBuilder}><Plus size={12} />Add to workout</button>
              <button className="btn btn-ghost btn-sm" style={{ color: "#E0E7FF" }}><Tag size={12} />Tag</button>
              <button className="btn btn-ghost btn-sm" style={{ color: "#FCA5A5" }}><Trash size={12} />Delete</button>
              <button className="btn btn-ghost btn-sm" style={{ color: "#94A3B8" }} onClick={() => setSelected(new Set())}><X size={12} /></button>
            </div>
          )}
        </>
      )}

      {activeTab === "workouts" && (
        <WorkoutsTab
          workouts={workouts}
          palette={palette}
          onCreateWorkout={onCreateWorkout}
          onOpenWorkout={onOpenWorkout}
          onDuplicateWorkout={onDuplicateWorkout}
          onDeleteWorkout={onDeleteWorkout}
          onAssignWorkout={onAssignWorkout}
        />
      )}

      {activeTab === "programs" && (
        <div className="card" style={{ padding: "50px 20px", textAlign: "center", color: "var(--fg3)" }}>
          No programs yet. Create your first one above.
        </div>
      )}
    </div>
  );
}
