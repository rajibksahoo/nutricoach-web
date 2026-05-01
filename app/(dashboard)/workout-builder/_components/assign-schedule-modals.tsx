"use client";
import * as React from "react";
import { type Client } from "./data";
import { Search, ChevLeft, ChevRight } from "./icons";
import { ModalShell, ModalHeader } from "./create-workout-modals";

function FooterButtons({
  onCancel, onConfirm, confirmLabel, confirmDisabled,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  confirmDisabled?: boolean;
}) {
  return (
    <div style={{
      padding: "12px 22px", borderTop: "1px solid var(--border-subtle)",
      display: "flex", justifyContent: "flex-end", gap: 8,
    }}>
      <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      <button
        type="button"
        className="btn btn-primary"
        onClick={onConfirm}
        disabled={confirmDisabled}
        style={confirmDisabled ? { opacity: 0.5, cursor: "not-allowed" } : undefined}>
        {confirmLabel}
      </button>
    </div>
  );
}

export function AssignWorkoutModal({
  open, onClose, onAssign, workoutName, clients,
}: {
  open: boolean;
  onClose: () => void;
  onAssign: (clients: Client[]) => void;
  workoutName?: string;
  clients: Client[];
}) {
  const CLIENTS = clients;
  const [q, setQ] = React.useState("");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = React.useState<"all" | "ACTIVE">("ACTIVE");

  React.useEffect(() => { if (open) { setQ(""); setSelected(new Set()); setStatusFilter("ACTIVE"); } }, [open]);

  const filtered = CLIENTS.filter(c => {
    if (statusFilter === "ACTIVE" && c.status !== "ACTIVE") return false;
    if (q.trim()) {
      const n = q.trim().toLowerCase();
      if (!c.name.toLowerCase().includes(n) && !c.goal.toLowerCase().includes(n)) return false;
    }
    return true;
  });

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const confirm = () => {
    const picked = CLIENTS.filter(c => selected.has(c.id));
    onAssign(picked);
  };

  return (
    <ModalShell open={open} onClose={onClose} width={520} ariaLabel="Assign workout">
      <ModalHeader
        title="Assign workout"
        subtitle={workoutName ? `Assign "${workoutName}" to one or more clients.` : "Select clients to assign this workout to."}
        onClose={onClose} />

      <div style={{ padding: "12px 22px 0", display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search clients"
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
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === "ACTIVE" ? "all" : "ACTIVE")}
          style={{
            padding: "6px 12px", borderRadius: 6,
            border: "1px solid " + (statusFilter === "ACTIVE" ? "var(--fg1)" : "var(--border)"),
            background: statusFilter === "ACTIVE" ? "var(--fg1)" : "#fff",
            color: statusFilter === "ACTIVE" ? "#fff" : "var(--fg2)",
            fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)",
          }}>
          Active only
        </button>
      </div>

      <div style={{ padding: "10px 14px 14px", overflowY: "auto", maxHeight: 360 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "30px 12px", textAlign: "center", color: "var(--fg3)", fontSize: 13 }}>
            No clients match.
          </div>
        ) : filtered.map(c => {
          const checked = selected.has(c.id);
          return (
            <label
              key={c.id}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px", borderRadius: 6,
                cursor: "pointer", background: checked ? "var(--bg-soft)" : "transparent",
                fontFamily: "var(--font-sans)",
              }}
              onMouseEnter={e => { if (!checked) e.currentTarget.style.background = "var(--bg-soft)"; }}
              onMouseLeave={e => { if (!checked) e.currentTarget.style.background = "transparent"; }}>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(c.id)}
                style={{ accentColor: "var(--accent)" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--fg1)" }}>{c.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--fg3)" }}>{c.goal} · {c.phone}</div>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 999,
                background: c.status === "ACTIVE" ? "#DCFCE7" : c.status === "PAUSED" ? "#FEE2E2" : "#FEF3C7",
                color:      c.status === "ACTIVE" ? "#166534" : c.status === "PAUSED" ? "#991B1B" : "#92400E",
              }}>{c.status}</span>
            </label>
          );
        })}
      </div>

      <FooterButtons
        onCancel={onClose}
        onConfirm={confirm}
        confirmDisabled={selected.size === 0}
        confirmLabel={selected.size > 0 ? `Assign to ${selected.size} client${selected.size === 1 ? "" : "s"}` : "Assign"} />
    </ModalShell>
  );
}

function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function fmt(d: Date) {
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}
function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function ScheduleWorkoutModal({
  open, onClose, onSchedule, workoutName,
}: {
  open: boolean;
  onClose: () => void;
  onSchedule: (date: Date) => void;
  workoutName?: string;
}) {
  const today = React.useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const [viewMonth, setViewMonth] = React.useState<Date>(startOfMonth(today));
  const [picked, setPicked] = React.useState<Date | null>(null);

  React.useEffect(() => { if (open) { setPicked(null); setViewMonth(startOfMonth(today)); } }, [open, today]);

  const monthLabel = viewMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const firstWeekday = viewMonth.getDay();
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const cells: Array<Date | null> = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d));
  while (cells.length % 7 !== 0) cells.push(null);

  const isSame = (a: Date | null, b: Date | null) => a && b && a.getTime() === b.getTime();
  const isPast = (d: Date) => d < today;

  const quickPicks: { label: string; date: Date }[] = [
    { label: "Today", date: today },
    { label: "Tomorrow", date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1) },
    { label: "In a week", date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7) },
  ];

  return (
    <ModalShell open={open} onClose={onClose} width={460} ariaLabel="Schedule workout">
      <ModalHeader
        title="Schedule workout"
        subtitle={workoutName ? `Pick a date for "${workoutName}".` : "Pick a date to schedule this workout."}
        onClose={onClose} />

      <div style={{ padding: "14px 22px 6px", display: "flex", gap: 6, flexWrap: "wrap" }}>
        {quickPicks.map(qp => {
          const active = isSame(picked, qp.date);
          return (
            <button
              key={qp.label}
              type="button"
              onClick={() => { setPicked(qp.date); setViewMonth(startOfMonth(qp.date)); }}
              style={{
                padding: "5px 12px", borderRadius: 999,
                border: "1px solid " + (active ? "var(--fg1)" : "var(--border)"),
                background: active ? "var(--fg1)" : "#fff",
                color: active ? "#fff" : "var(--fg2)",
                fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)",
              }}>
              {qp.label}
            </button>
          );
        })}
      </div>

      <div style={{ padding: "10px 22px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          type="button"
          onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
          aria-label="Previous month"
          style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6, color: "var(--fg2)" }}>
          <ChevLeft size={16} />
        </button>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--fg1)", fontFamily: "var(--font-sans)" }}>
          {monthLabel}
        </div>
        <button
          type="button"
          onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
          aria-label="Next month"
          style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6, color: "var(--fg2)" }}>
          <ChevRight size={16} />
        </button>
      </div>

      <div style={{ padding: "8px 22px 4px", display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} style={{
            textAlign: "center", fontSize: 10.5, fontWeight: 600,
            color: "var(--fg4)", textTransform: "uppercase", letterSpacing: "0.05em",
            padding: "4px 0",
          }}>{d}</div>
        ))}
      </div>

      <div style={{ padding: "0 22px 14px", display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const past = isPast(d);
          const active = isSame(picked, d);
          const isToday = isSame(today, d);
          return (
            <button
              key={i}
              type="button"
              disabled={past}
              onClick={() => setPicked(d)}
              style={{
                aspectRatio: "1 / 1",
                border: "1px solid " + (active ? "var(--fg1)" : "transparent"),
                background: active ? "var(--fg1)" : isToday ? "var(--bg-soft)" : "#fff",
                color: active ? "#fff" : past ? "var(--fg4)" : "var(--fg1)",
                borderRadius: 6, fontSize: 12.5,
                fontFamily: "var(--font-sans)",
                cursor: past ? "not-allowed" : "pointer",
                opacity: past ? 0.4 : 1,
                fontWeight: isToday ? 600 : 400,
              }}>
              {d.getDate()}
            </button>
          );
        })}
      </div>

      {picked && (
        <div style={{
          padding: "0 22px 14px", fontSize: 12.5,
          color: "var(--fg2)", fontFamily: "var(--font-sans)",
        }}>
          Scheduled for <strong style={{ color: "var(--fg1)" }}>{fmt(picked)}</strong>
          <span style={{ color: "var(--fg4)", fontFamily: "var(--font-mono)", marginLeft: 6 }}>({ymd(picked)})</span>
        </div>
      )}

      <FooterButtons
        onCancel={onClose}
        onConfirm={() => { if (picked) onSchedule(picked); }}
        confirmDisabled={!picked}
        confirmLabel="Schedule" />
    </ModalShell>
  );
}
