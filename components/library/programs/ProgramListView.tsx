"use client";

import { useEffect, useState } from "react";
import {
  Calendar, Search, SlidersHorizontal, Tag, Plus, Dumbbell, Activity, Clock,
  ChevronDown, ChevronUp, Send, MoreVertical, Pencil, Trash2,
} from "lucide-react";
import type { ProgramSummary } from "@/lib/library-types";

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

const GRID = "36px 1fr 90px 200px 110px 80px 110px 120px";

const iconBtn: React.CSSProperties = {
  width: 28, height: 28, padding: 0, border: "none", borderRadius: 6,
  background: "transparent", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg3)",
};

export default function ProgramListView({
  programs, onOpen, onCreate, onEdit, onAssign, onDelete,
}: {
  programs: ProgramSummary[];
  onOpen: (p: ProgramSummary) => void;
  onCreate: () => void;
  onEdit: (p: ProgramSummary) => void;
  onAssign: (p: ProgramSummary) => void;
  onDelete: (p: ProgramSummary) => void;
}) {
  const [q, setQ] = useState("");
  const [showBanner, setShowBanner] = useState(true);
  const filtered = programs.filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase()));

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
          <span style={{ fontSize: 12.5, color: "var(--fg3)" }}>
            <span style={{ color: "var(--fg1)", fontWeight: 600 }}>29 days left</span> until trial ends
          </span>
          <button style={{
            background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
            border: "none", color: "#fff", padding: "8px 22px", borderRadius: 8,
            fontWeight: 700, fontSize: 12.5, cursor: "pointer", letterSpacing: "0.02em",
            boxShadow: "0 1px 2px rgba(234,88,12,.3)",
          }}>Upgrade</button>
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
                Save time by exploring pre-built program templates curated by NutriCoach.{" "}
                <a href="#" onClick={(e) => e.preventDefault()} style={{ color: "var(--brand-primary)", fontWeight: 600 }}>Learn more →</a>
              </div>
            </div>
            <button style={{
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
        <button style={secBtn}><SlidersHorizontal size={13} />Filter</button>
        <div style={{ flex: 1 }} />
        <button style={secBtn}><Tag size={13} />Tags</button>
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
          display: "grid", gridTemplateColumns: GRID, alignItems: "center", gap: 14,
          padding: "11px 18px", borderBottom: "1px solid var(--border-subtle)", background: "#fff",
          fontSize: 10.5, fontWeight: 600, color: "var(--fg3)", textTransform: "uppercase", letterSpacing: "0.06em",
        }}>
          <input type="checkbox" />
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
            onOpen={onOpen} onEdit={onEdit} onAssign={onAssign} onDelete={onDelete} />
        ))}

        {filtered.length === 0 && (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--fg3)", fontSize: 12.5 }}>
            {programs.length === 0 ? "No programs yet. Create your first one." : "No programs match. "}
            {programs.length > 0 && (
              <button onClick={() => setQ("")} style={{ background: "none", border: "none", color: "var(--brand-primary)", fontWeight: 500, cursor: "pointer" }}>
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ProgramRow({
  program: p, last, onOpen, onEdit, onAssign, onDelete,
}: {
  program: ProgramSummary; last: boolean;
  onOpen: (p: ProgramSummary) => void;
  onEdit: (p: ProgramSummary) => void;
  onAssign: (p: ProgramSummary) => void;
  onDelete: (p: ProgramSummary) => void;
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
        display: "grid", gridTemplateColumns: GRID, alignItems: "center", gap: 14,
        padding: "16px 18px", borderBottom: last ? "none" : "1px solid var(--border-subtle)",
        background: hov ? "var(--bg)" : "#fff", cursor: "pointer", transition: "background 100ms",
      }}>
      <input type="checkbox" onClick={(e) => e.stopPropagation()} />
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
      <span style={{ color: "var(--fg4)", fontSize: 12 }}>
        {p.tags && p.tags.length > 0 ? p.tags.slice(0, 2).join(", ") : "—"}
      </span>
      <span style={{ color: "var(--fg4)", fontSize: 12 }}>—</span>
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

const hdrCell: React.CSSProperties = { display: "flex", alignItems: "center", gap: 6 };
