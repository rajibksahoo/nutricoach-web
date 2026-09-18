"use client";

import { useEffect, useState } from "react";
import {
  Calendar, Search, SlidersHorizontal, Tag, Plus, Dumbbell, Activity, Clock,
  ChevronDown, ChevronUp, Send, MoreVertical, Pencil, Trash2, BookmarkPlus,
} from "lucide-react";
import type { ProgramSummary } from "@/lib/library-types";
import TrialChip from "@/components/dashboard/TrialChip";
import { useSubscription } from "@/lib/use-subscription";

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "—";
  const diff = Date.now() - then;
  const day = 86400000;
  if (diff < day) return "today";
  const days = Math.floor(diff / day);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

// Program | Tags | Equipment | Live Sync | Weeks | Most recent | actions.
//
// The fixed columns are deliberately tight. Beside the Library section pane
// this list only gets ~940px, so every pixel spent here comes out of the
// program name — the old widths left it ~144px including the cover tile, which
// wrapped "8-Week Hypertrophy" over three lines. That was invisible while Tags
// and Equipment were always a dash; real values made it obvious. The data cells
// also truncate, so a long value can never spill into the name again.
const GRID = "1fr 120px 150px 80px 60px 90px 84px";

const iconBtn: React.CSSProperties = {
  width: 28, height: 28, padding: 0, border: "none", borderRadius: 6,
  background: "transparent", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg3)",
};

const listCell: React.CSSProperties = {
  color: "var(--fg4)", fontSize: 12,
  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
};

/**
 * Render a narrow list cell: the first two entries, plus a count of whatever is
 * left. The full set is in the cell's title attribute.
 */
function summarise(values: string[] | null | undefined): string {
  if (!values || values.length === 0) return "—";
  const shown = values.slice(0, 2).join(", ");
  return values.length > 2 ? `${shown} +${values.length - 2}` : shown;
}

export default function ProgramListView({
  programs, onOpen, onCreate, onEdit, onAssign, onDelete,
  onExploreTemplates, onToggleTemplate,
}: {
  programs: ProgramSummary[];
  onOpen: (p: ProgramSummary) => void;
  onCreate: () => void;
  onEdit: (p: ProgramSummary) => void;
  onAssign: (p: ProgramSummary) => void;
  onDelete: (p: ProgramSummary) => void;
  onExploreTemplates: () => void;
  onToggleTemplate: (p: ProgramSummary) => void;
}) {
  const [q, setQ] = useState("");
  const [showBanner, setShowBanner] = useState(true);
  const [openPanel, setOpenPanel] = useState<"filter" | "tags" | null>(null);
  const [modality, setModality] = useState<string | null>(null);
  const [experience, setExperience] = useState<string | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const subscription = useSubscription();

  // Every tag in use across the coach's programs, for the Tags checklist.
  const allTags = Array.from(new Set(programs.flatMap((p) => p.tags ?? []))).sort();
  // Modality / experience options come from the data rather than a fixed list,
  // so the panel can never offer a value that matches nothing.
  const allModalities = Array.from(new Set(programs.map((p) => p.modality).filter(Boolean) as string[])).sort();
  const allExperience = Array.from(new Set(programs.map((p) => p.experienceLevel).filter(Boolean) as string[])).sort();

  // Filters compose with the search box: a program must satisfy all of them.
  const filtered = programs.filter((p) => {
    if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (modality && p.modality !== modality) return false;
    if (experience && p.experienceLevel !== experience) return false;
    if (activeTags.length > 0 && !activeTags.every((t) => (p.tags ?? []).includes(t))) return false;
    return true;
  });

  const activeFilterCount = (modality ? 1 : 0) + (experience ? 1 : 0);
  const clearAll = () => { setModality(null); setExperience(null); setActiveTags([]); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "20px 28px 80px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <h1 style={{
          font: "700 22px var(--font-display-xl)", letterSpacing: "-0.02em",
          margin: 0, display: "flex", alignItems: "center", gap: 10, color: "var(--fg1)",
        }}>
          <Calendar size={20} style={{ color: "var(--fg2)" }} />
          Program Library
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {subscription && <TrialChip subscription={subscription} />}
        </div>
      </div>

      {/* Banner */}
      {showBanner && (
        <div style={{
          position: "relative", borderRadius: 14, padding: "22px 28px", overflow: "hidden",
          background: "linear-gradient(115deg, #FFE4D5 0%, #FFEED7 35%, #FFD8E6 70%, #FFE0F0 100%)",
          border: "1px solid #FCD9C2",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
            <div>
              <h2 style={{ font: "700 22px var(--font-display-xl)", letterSpacing: "-0.02em", margin: "0 0 6px", color: "#0F172A" }}>
                Program Templates
              </h2>
              <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.45, maxWidth: 380 }}>
                Save a program you have built as a template, then start new ones from it
                in a click — days, notes and all.
              </div>
            </div>
            <button onClick={onExploreTemplates} style={{
              background: "#0F172A", color: "#fff", border: "none", padding: "12px 22px",
              borderRadius: 9, fontWeight: 600, fontSize: 13, cursor: "pointer",
            }}>Explore Templates</button>
          </div>
          <button onClick={() => setShowBanner(false)} style={{
            position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)",
            background: "none", border: "none", color: "var(--fg3)", fontSize: 11.5,
            cursor: "pointer", padding: "4px 10px", display: "inline-flex", alignItems: "center", gap: 4,
          }}>Hide Banner <ChevronUp size={11} /></button>
        </div>
      )}

      {/* Filter bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 360px", maxWidth: 520 }}>
          <Search size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--fg4)" }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by keyword or name"
            style={{
              width: "100%", padding: "9px 12px 9px 36px", border: "1px solid var(--border)",
              borderRadius: 99, fontSize: 12.5, background: "#fff", outline: "none",
            }} />
        </div>
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setOpenPanel((o) => (o === "filter" ? null : "filter"))}
            aria-expanded={openPanel === "filter"}
            style={{ ...secBtn, ...(activeFilterCount > 0 ? activeBtn : null) }}>
            <SlidersHorizontal size={13} />
            Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </button>
          {openPanel === "filter" && (
            <FilterPanel
              modalities={allModalities} experiences={allExperience}
              modality={modality} experience={experience}
              onModality={setModality} onExperience={setExperience}
              onClose={() => setOpenPanel(null)} />
          )}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setOpenPanel((o) => (o === "tags" ? null : "tags"))}
            aria-expanded={openPanel === "tags"}
            style={{ ...secBtn, ...(activeTags.length > 0 ? activeBtn : null) }}>
            <Tag size={13} />
            Tags{activeTags.length > 0 ? ` (${activeTags.length})` : ""}
          </button>
          {openPanel === "tags" && (
            <TagsPanel
              tags={allTags} active={activeTags}
              onToggle={(t) => setActiveTags((prev) =>
                prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])}
              onClose={() => setOpenPanel(null)} />
          )}
        </div>
        <button onClick={onCreate} style={{
          display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px",
          borderRadius: 9, border: "none", background: "var(--brand-primary)", color: "#fff",
          fontSize: 12.5, fontWeight: 600, cursor: "pointer",
        }}><Plus size={14} />Add New Program</button>
      </div>

      {/* Table */}
      <div style={{
        background: "#fff", border: "1px solid var(--border)", borderRadius: 12,
        boxShadow: "var(--shadow-sm)", overflow: "hidden",
      }}>
        <div style={{
          display: "grid", gridTemplateColumns: GRID, alignItems: "center", gap: 12,
          padding: "11px 18px", borderBottom: "1px solid var(--border-subtle)", background: "#fff",
          fontSize: 10.5, fontWeight: 600, color: "var(--fg3)", textTransform: "uppercase", letterSpacing: "0.06em",
        }}>
          <span style={hdrCell}><SlidersHorizontal size={11} />Program ({filtered.length}) <ChevronDown size={11} /></span>
          <span style={hdrCell}><Tag size={11} />Tags</span>
          <span style={hdrCell}><Dumbbell size={11} />Equipment</span>
          <span style={hdrCell}><Activity size={11} />Live Sync</span>
          <span style={hdrCell}><Calendar size={11} />Weeks</span>
          <span style={{ ...hdrCell, color: "var(--brand-primary)" }}><Clock size={11} />Most Recent <ChevronDown size={11} /></span>
          <span />
        </div>

        {filtered.map((p, i) => (
          <ProgramRow key={p.id} program={p} last={i === filtered.length - 1}
            onOpen={onOpen} onEdit={onEdit} onAssign={onAssign} onDelete={onDelete}
            onToggleTemplate={onToggleTemplate} />
        ))}

        {filtered.length === 0 && (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--fg3)", fontSize: 12.5 }}>
            {programs.length === 0 ? "No programs yet. Create your first one." : "No programs match. "}
            {programs.length > 0 && (
              <button onClick={() => { setQ(""); clearAll(); }} style={{ background: "none", border: "none", color: "var(--brand-primary)", fontWeight: 500, cursor: "pointer" }}>
                Clear search and filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ProgramRow({
  program: p, last, onOpen, onEdit, onAssign, onDelete, onToggleTemplate,
}: {
  program: ProgramSummary; last: boolean;
  onOpen: (p: ProgramSummary) => void;
  onEdit: (p: ProgramSummary) => void;
  onAssign: (p: ProgramSummary) => void;
  onDelete: (p: ProgramSummary) => void;
  onToggleTemplate: (p: ProgramSummary) => void;
}) {
  const [hov, setHov] = useState(false);
  const [menu, setMenu] = useState(false);
  const weeks = p.weeks ?? Math.max(1, Math.ceil(p.durationDays / 7));
  const initial = (p.name || "P").trim()[0]?.toUpperCase() || "P";

  useEffect(() => {
    if (!menu) return;
    const fn = () => setMenu(false);
    document.addEventListener("click", fn);
    return () => document.removeEventListener("click", fn);
  }, [menu]);

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={() => onOpen(p)}
      style={{
        display: "grid", gridTemplateColumns: GRID, alignItems: "center", gap: 12,
        padding: "16px 18px", borderBottom: last ? "none" : "1px solid var(--border-subtle)",
        background: hov ? "var(--bg)" : "#fff", cursor: "pointer", transition: "background 100ms",
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
        <div style={{
          width: 60, height: 60, borderRadius: 10, flexShrink: 0,
          background: p.coverImageUrl ? `center/cover no-repeat url(${p.coverImageUrl})` : (p.coverGradient || "linear-gradient(135deg,#4F46E5,#7C3AED)"),
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "rgba(255,255,255,.9)", font: "700 26px var(--font-display)",
          letterSpacing: "-0.02em", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.2)",
        }}>{p.coverImageUrl ? "" : initial}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ font: "600 14.5px var(--font-sans)", color: "var(--fg1)", lineHeight: 1.3, marginBottom: 4 }}>{p.name}</div>
          <div style={{
            fontSize: 12, color: "var(--fg3)", lineHeight: 1.4,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>{p.description || "—"}</div>
        </div>
      </div>
      <span style={{ ...listCell }} title={p.tags?.join(", ")}>
        {summarise(p.tags)}
      </span>
      <span style={{ ...listCell }} title={p.equipment?.join(", ")}>
        {summarise(p.equipment)}
      </span>
      <span style={{ color: "var(--fg4)", fontSize: 12, textAlign: "center" }}>—</span>
      <span style={{ color: "var(--fg2)", fontWeight: 600, fontSize: 13, fontVariantNumeric: "tabular-nums" }}>{weeks}w</span>
      <span style={{ color: "var(--fg3)", fontSize: 12 }}>{relativeTime(p.updatedAt)}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end", position: "relative" }}>
        <button onClick={(e) => { e.stopPropagation(); onAssign(p); }} title="Assign" style={iconBtn}><Send size={13} /></button>
        <button onClick={(e) => { e.stopPropagation(); setMenu((m) => !m); }} title="More" style={iconBtn}><MoreVertical size={14} /></button>
        {menu && (
          <div onClick={(e) => e.stopPropagation()} style={{
            position: "absolute", top: 30, right: 0, zIndex: 30, minWidth: 150, padding: 5,
            background: "#fff", border: "1px solid var(--border)", borderRadius: 8, boxShadow: "var(--shadow-lg)",
          }}>
            <MenuItem icon={<Pencil size={13} />} onClick={() => { setMenu(false); onEdit(p); }}>Edit info</MenuItem>
            <MenuItem icon={<Send size={13} />} onClick={() => { setMenu(false); onAssign(p); }}>Assign</MenuItem>
            <MenuItem icon={<BookmarkPlus size={13} />} onClick={() => { setMenu(false); onToggleTemplate(p); }}>
              {p.isTemplate ? "Remove from templates" : "Save as template"}
            </MenuItem>
            <div style={{ height: 1, background: "var(--border-subtle)", margin: "4px 0" }} />
            <MenuItem icon={<Trash2 size={13} />} danger onClick={() => { setMenu(false); onDelete(p); }}>Delete</MenuItem>
          </div>
        )}
      </div>
    </div>
  );
}

function MenuItem({ icon, danger, children, onClick }: { icon: React.ReactNode; danger?: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left",
      padding: "7px 9px", borderRadius: 6, border: "none", background: "transparent",
      cursor: "pointer", fontSize: 12.5, fontWeight: 500,
      color: danger ? "#DC2626" : "var(--fg1)",
    }}>{icon}{children}</button>
  );
}

const secBtn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 13px",
  borderRadius: 9, border: "1px solid var(--border)", background: "#fff",
  color: "var(--fg1)", fontSize: 12.5, fontWeight: 500, cursor: "pointer",
};

/** A toolbar button carrying at least one active selection. */
const activeBtn: React.CSSProperties = {
  borderColor: "var(--brand-primary)", color: "var(--brand-primary)", fontWeight: 600,
};

const panel: React.CSSProperties = {
  position: "absolute", top: "calc(100% + 6px)", zIndex: 40, minWidth: 210,
  background: "#fff", border: "1px solid var(--border)", borderRadius: 10,
  boxShadow: "var(--shadow-lg)", padding: 10,
};

const panelLabel: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, color: "var(--fg4)",
  textTransform: "uppercase", letterSpacing: "0.06em", margin: "2px 0 6px",
};

/** Close a popover on outside click, so the toolbar behaves like the row menus. */
function useDismiss(onClose: () => void) {
  useEffect(() => {
    const close = () => onClose();
    // Deferred so the click that opened the panel does not immediately shut it.
    const id = window.setTimeout(() => document.addEventListener("click", close), 0);
    return () => { window.clearTimeout(id); document.removeEventListener("click", close); };
  }, [onClose]);
}

function OptionRow({ label, selected, onClick }: {
  label: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} role="checkbox" aria-checked={selected} style={{
      display: "flex", alignItems: "center", gap: 8, width: "100%",
      padding: "6px 8px", border: "none", borderRadius: 6, cursor: "pointer",
      background: selected ? "var(--bg-subtle)" : "transparent",
      color: "var(--fg1)", fontSize: 12.5, textAlign: "left",
    }}>
      <span style={{
        width: 13, height: 13, borderRadius: 3, flexShrink: 0,
        border: `1px solid ${selected ? "var(--brand-primary)" : "var(--border-strong)"}`,
        background: selected ? "var(--brand-primary)" : "#fff",
      }} />
      {label}
    </button>
  );
}

function FilterPanel({ modalities, experiences, modality, experience, onModality, onExperience, onClose }: {
  modalities: string[]; experiences: string[];
  modality: string | null; experience: string | null;
  onModality: (v: string | null) => void; onExperience: (v: string | null) => void;
  onClose: () => void;
}) {
  useDismiss(onClose);
  const empty = modalities.length === 0 && experiences.length === 0;
  return (
    <div onClick={(e) => e.stopPropagation()} style={{ ...panel, left: 0 }} role="dialog" aria-label="Filter programs">
      {empty ? (
        <div style={{ fontSize: 12, color: "var(--fg3)", padding: "4px 6px" }}>
          No modality or experience level set on any program yet.
        </div>
      ) : (
        <>
          {modalities.length > 0 && (
            <>
              <div style={panelLabel}>Modality</div>
              {modalities.map((m) => (
                <OptionRow key={m} label={m} selected={modality === m}
                  onClick={() => onModality(modality === m ? null : m)} />
              ))}
            </>
          )}
          {experiences.length > 0 && (
            <>
              <div style={{ ...panelLabel, marginTop: 10 }}>Experience</div>
              {experiences.map((x) => (
                <OptionRow key={x} label={x} selected={experience === x}
                  onClick={() => onExperience(experience === x ? null : x)} />
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}

function TagsPanel({ tags, active, onToggle, onClose }: {
  tags: string[]; active: string[]; onToggle: (t: string) => void; onClose: () => void;
}) {
  useDismiss(onClose);
  return (
    <div onClick={(e) => e.stopPropagation()} style={{ ...panel, right: 0, maxHeight: 280, overflowY: "auto" }}
      role="dialog" aria-label="Filter by tag">
      {tags.length === 0 ? (
        <div style={{ fontSize: 12, color: "var(--fg3)", padding: "4px 6px" }}>
          No tags yet — add them when you create or edit a program.
        </div>
      ) : (
        <>
          <div style={panelLabel}>Tags</div>
          {tags.map((t) => (
            <OptionRow key={t} label={t} selected={active.includes(t)} onClick={() => onToggle(t)} />
          ))}
        </>
      )}
    </div>
  );
}

const hdrCell: React.CSSProperties = { display: "flex", alignItems: "center", gap: 6 };
