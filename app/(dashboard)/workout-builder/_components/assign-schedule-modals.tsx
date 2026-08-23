"use client";
import * as React from "react";
import toast from "react-hot-toast";
import { type Client } from "./data";
import { Search, ChevLeft, ChevRight, X, Check, Send, Bell, Cal } from "./icons";
import { Avatar } from "./shared";
import { listAssignments, unassignWorkout, type WorkoutAssignment } from "@/lib/workout-builder-api";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "7px 11px", border: "1px solid var(--border)",
  borderRadius: 7, fontSize: 13, background: "#fff", color: "var(--fg1)",
  fontFamily: "var(--font-sans)", outline: "none",
};

function Field({
  label, required, hint, children,
}: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--fg2)", display: "flex", alignItems: "center", gap: 5 }}>
        {label}{required && <span style={{ color: "var(--danger)" }}>*</span>}
      </span>
      {children}
      {hint && <span style={{ fontSize: 11, color: "var(--fg4)" }}>{hint}</span>}
    </label>
  );
}

function ModalFrame({
  open, onClose, width, ariaLabel, children,
}: {
  open: boolean; onClose: () => void; width: number;
  ariaLabel: string; children: React.ReactNode;
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
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={ariaLabel}
        style={{
          background: "#fff", borderRadius: 12, width: "100%", maxWidth: width,
          maxHeight: "calc(100vh - 48px)", display: "flex", flexDirection: "column",
          boxShadow: "var(--shadow-xl)", animation: "wb-slideUp 180ms ease",
        }}>
        {children}
      </div>
    </div>
  );
}

export interface AssignOpts { message: string; }

export function AssignWorkoutModal({
  open, onClose, onAssign, workoutName, workoutId, clients,
}: {
  open: boolean;
  onClose: () => void;
  onAssign: (clients: Client[], opts: AssignOpts) => void;
  workoutName?: string;
  workoutId?: string | null;
  clients: Client[];
}) {
  const [q, setQ] = React.useState("");
  const [picked, setPicked] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState("");
  const [assigned, setAssigned] = React.useState<WorkoutAssignment[]>([]);
  const [loadingAssigned, setLoadingAssigned] = React.useState(false);

  React.useEffect(() => {
    if (open) { setQ(""); setPicked(null); setMessage(""); }
  }, [open]);

  React.useEffect(() => {
    if (!open || !workoutId) { setAssigned([]); return; }
    let cancelled = false;
    setLoadingAssigned(true);
    listAssignments(workoutId)
      .then((rows) => { if (!cancelled) setAssigned(rows); })
      .catch((e) => { console.error(e); if (!cancelled) toast.error("Failed to load current assignments"); })
      .finally(() => { if (!cancelled) setLoadingAssigned(false); });
    return () => { cancelled = true; };
  }, [open, workoutId]);

  const handleUnassign = async (assignmentId: string) => {
    if (!workoutId) return;
    const prev = assigned;
    setAssigned(rows => rows.filter(a => a.id !== assignmentId));
    try {
      await unassignWorkout(workoutId, assignmentId);
      toast.success("Assignment removed");
    } catch (e) {
      console.error(e);
      toast.error("Failed to remove assignment");
      setAssigned(prev);
    }
  };

  const assignedClientIds = new Set(assigned.map(a => a.clientId));
  const clientName = (id: string) => clients.find(c => c.id === id)?.name ?? "Client";

  const filtered = clients.filter(c =>
    !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.goal.toLowerCase().includes(q.toLowerCase())
  );

  const confirm = () => {
    if (!picked) return;
    const target = clients.find(c => c.id === picked);
    if (!target) return;
    onAssign([target], { message: message.trim() });
  };

  return (
    <ModalFrame open={open} onClose={onClose} width={560} ariaLabel="Assign client">
      <div style={{
        padding: "15px 22px", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <h2 style={{ font: "600 17px var(--font-display)", letterSpacing: "-0.01em", margin: 0 }}>
            Assign client
          </h2>
          <p style={{ fontSize: 12, color: "var(--fg3)", margin: "3px 0 0" }}>
            Send <strong>{workoutName ?? "this workout"}</strong> to a client.
          </p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close">
          <X size={15} />
        </button>
      </div>

      <div style={{
        padding: "16px 22px", display: "flex", flexDirection: "column", gap: 14,
        overflow: "hidden", flex: 1,
      }}>
        {workoutId && (loadingAssigned || assigned.length > 0) && (
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--fg2)", marginBottom: 6 }}>
              Currently assigned ({assigned.length})
            </div>
            <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "auto", maxHeight: 150 }}>
              {loadingAssigned ? (
                <div style={{ padding: "12px", textAlign: "center", color: "var(--fg3)", fontSize: 12 }}>
                  Loading…
                </div>
              ) : assigned.map((a, idx) => (
                <div key={a.id} style={{
                  padding: "8px 12px", display: "flex", alignItems: "center", gap: 10,
                  borderTop: idx === 0 ? "none" : "1px solid var(--border-subtle)",
                }}>
                  <Avatar name={clientName(a.clientId)} size={28} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--fg1)" }}>
                      {clientName(a.clientId)}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--fg3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      Assigned {new Date(a.assignedAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                      {a.notes ? ` · ${a.notes}` : ""}
                    </div>
                  </div>
                  <button type="button" onClick={() => handleUnassign(a.id)} aria-label={`Unassign ${clientName(a.clientId)}`}
                    style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: 24, height: 24, padding: 0, border: "none", borderRadius: 6,
                      background: "transparent", color: "var(--fg3)", cursor: "pointer",
                    }}>
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ position: "relative" }}>
          <Search size={14} style={{
            position: "absolute", left: 11, top: "50%",
            transform: "translateY(-50%)", color: "var(--fg4)",
          }} />
          <input value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search clients by name or goal…"
            style={{ ...inputStyle, paddingLeft: 32, fontSize: 13 }} />
        </div>

        <div style={{
          border: "1px solid var(--border)", borderRadius: 8,
          overflow: "auto", maxHeight: 280,
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "26px 12px", textAlign: "center", color: "var(--fg3)", fontSize: 13 }}>
              No clients match.
            </div>
          ) : filtered.map((c, idx) => {
            const on = picked === c.id;
            const already = assignedClientIds.has(c.id);
            return (
              <button key={c.id} type="button" disabled={already}
                onClick={() => { if (!already) setPicked(c.id); }} style={{
                width: "100%", padding: "9px 12px", border: "none",
                borderTop: idx === 0 ? "none" : "1px solid var(--border-subtle)",
                background: on ? "var(--brand-primary-50)" : "#fff",
                display: "flex", alignItems: "center", gap: 10,
                cursor: already ? "default" : "pointer", textAlign: "left", transition: "background 80ms",
                opacity: already ? 0.55 : 1,
              }}>
                <Avatar name={c.name} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 500,
                    color: on ? "var(--brand-primary)" : "var(--fg1)",
                  }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: "var(--fg3)" }}>{c.goal} · {c.phone}</div>
                </div>
                {already ? (
                  <span style={{
                    fontSize: 9.5, padding: "1px 7px", borderRadius: 5,
                    background: "var(--brand-primary-50)", color: "var(--brand-primary)",
                    fontWeight: 600, letterSpacing: "0.05em",
                  }}>ASSIGNED</span>
                ) : (
                  <span style={{
                    fontSize: 9.5, padding: "1px 7px", borderRadius: 5,
                    background: c.status === "ACTIVE" ? "#DCFCE7" : c.status === "PAUSED" ? "#FEE2E2" : "#FEF3C7",
                    color: c.status === "ACTIVE" ? "#166534" : c.status === "PAUSED" ? "#991B1B" : "#854D0E",
                    fontWeight: 600, letterSpacing: "0.05em",
                  }}>{c.status}</span>
                )}
                {on && <Check size={15} style={{ color: "var(--brand-primary)" }} />}
              </button>
            );
          })}
        </div>

        <Field label="Personal message (optional)">
          <textarea value={message} onChange={(e) => setMessage(e.target.value)}
            placeholder="Hey! Try to nail the tempo on the squats today — pause 1s at the bottom."
            rows={2}
            style={{ ...inputStyle, resize: "vertical", minHeight: 56, fontFamily: "var(--font-sans)" }} />
        </Field>
      </div>

      <div style={{
        padding: "13px 22px", borderTop: "1px solid var(--border)", background: "var(--bg)",
        display: "flex", justifyContent: "flex-end", gap: 8,
      }}>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" disabled={!picked} onClick={confirm}
          style={!picked ? { opacity: 0.5, cursor: "not-allowed" } : undefined}>
          <Send size={13} />Send to client
        </button>
      </div>
    </ModalFrame>
  );
}

export type ScheduleRepeat = "none" | "daily" | "weekly" | "mwf";
export interface ScheduleOpts { time: string; repeat: ScheduleRepeat; }

export function ScheduleWorkoutModal({
  open, onClose, onSchedule, workoutName,
}: {
  open: boolean;
  onClose: () => void;
  onSchedule: (date: Date, opts: ScheduleOpts) => void;
  workoutName?: string;
}) {
  const [date, setDate] = React.useState("");
  const [time, setTime] = React.useState("07:00");
  const [repeat, setRepeat] = React.useState<ScheduleRepeat>("none");

  React.useEffect(() => {
    if (!open) return;
    const d = new Date(); d.setDate(d.getDate() + 1);
    setDate(d.toISOString().slice(0, 10));
    setTime("07:00");
    setRepeat("none");
  }, [open]);

  const valid = !!date;

  const submit = () => {
    if (!valid) return;
    const [y, m, dd] = date.split("-").map(Number);
    const [hh, mm] = time.split(":").map(Number);
    const out = new Date(y, m - 1, dd, hh || 0, mm || 0, 0, 0);
    onSchedule(out, { time, repeat });
  };

  const repeatOpts: { k: ScheduleRepeat; l: string }[] = [
    { k: "none", l: "One time" },
    { k: "daily", l: "Daily" },
    { k: "weekly", l: "Weekly" },
    { k: "mwf", l: "M / W / F" },
  ];

  return (
    <ModalFrame open={open} onClose={onClose} width={480} ariaLabel="Schedule workout">
      <div style={{
        padding: "15px 22px", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <h2 style={{ font: "600 17px var(--font-display)", letterSpacing: "-0.01em", margin: 0 }}>
            Schedule workout
          </h2>
          <p style={{ fontSize: 12, color: "var(--fg3)", margin: "3px 0 0" }}>
            Pick when {workoutName ? <strong>{workoutName}</strong> : "this workout"} should appear in the client app.
          </p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close">
          <X size={15} />
        </button>
      </div>

      <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", gap: 13 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Date" required>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Time" required>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={inputStyle} />
          </Field>
        </div>

        <Field label="Repeat">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
            {repeatOpts.map(opt => {
              const on = repeat === opt.k;
              return (
                <button key={opt.k} type="button" onClick={() => setRepeat(opt.k)} style={{
                  padding: "8px 6px", borderRadius: 7,
                  border: `1px solid ${on ? "var(--brand-primary)" : "var(--border)"}`,
                  background: on ? "var(--brand-primary-50)" : "#fff",
                  color: on ? "var(--brand-primary)" : "var(--fg2)",
                  cursor: "pointer", font: `${on ? 600 : 500} 12px var(--font-sans)`,
                }}>{opt.l}</button>
              );
            })}
          </div>
        </Field>

        <div style={{
          background: "var(--brand-primary-50)", border: "1px solid #C7D2FE", borderRadius: 8,
          padding: "9px 12px", fontSize: 12, color: "#3730A3",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <Bell size={14} />
          <span>Appears on the client&rsquo;s Training tab. No reminder is sent.</span>
        </div>
      </div>

      <div style={{
        padding: "13px 22px", borderTop: "1px solid var(--border)", background: "var(--bg)",
        display: "flex", justifyContent: "flex-end", gap: 8,
      }}>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" disabled={!valid} onClick={submit}
          style={!valid ? { opacity: 0.5, cursor: "not-allowed" } : undefined}>
          <Cal size={13} />Schedule
        </button>
      </div>
    </ModalFrame>
  );
}
