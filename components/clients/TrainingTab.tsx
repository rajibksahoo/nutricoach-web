"use client";

import * as React from "react";
import { Dumbbell } from "lucide-react";
import toast from "react-hot-toast";
import {
  listClientSchedules, unscheduleWorkout,
  listClientAssignments, unassignProgramFromClient, unassignWorkout,
  type WorkoutScheduleEntry,
  type ClientProgramAssignmentItem, type ClientWorkoutAssignmentItem,
} from "@/lib/workout-builder-api";
import { Card, CardTitle, iconBtnStyle } from "./detail-ui";

/**
 * Coach-side Training tab for one client.
 *
 * A coach can attach training three ways — assign a program, assign a workout,
 * or schedule a workout for a date — and this tab shows all three. It used to
 * show only the dated schedules, so a coach who assigned an 8-week program saw
 * "No workouts scheduled yet" while the client's portal listed the workouts.
 */

function fmtScheduleDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
}

function fmtStartDate(d: string | undefined) {
  if (!d) return null;
  return new Date(d + "T00:00:00").toLocaleDateString(undefined, {
    day: "numeric", month: "short", year: "numeric",
  });
}

/** One list row: icon, title, muted subtitle, remove button. */
function AssignmentRow({ title, subtitle, onRemove, removeLabel, first }: {
  title: string; subtitle: string; onRemove: () => void;
  removeLabel: string; first: boolean;
}) {
  return (
    <div style={{
      padding: "10px 14px", display: "flex", alignItems: "center", gap: 12,
      borderTop: first ? "none" : "1px solid var(--border-subtle)",
      background: "#fff",
    }}>
      <Dumbbell size={15} style={{ color: "var(--brand-primary)", flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--fg1)" }}>{title}</div>
        <div style={{
          fontSize: 11.5, color: "var(--fg3)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{subtitle}</div>
      </div>
      <button type="button" onClick={onRemove} aria-label={removeLabel}
        style={{ ...iconBtnStyle, width: 26, height: 26, color: "var(--fg3)" }}>
        ✕
      </button>
    </div>
  );
}

function RowList({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 9, overflow: "hidden" }}>
      {children}
    </div>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, color: "var(--fg4)",
      textTransform: "uppercase", letterSpacing: "0.06em", margin: "4px 0 8px",
    }}>{children}</div>
  );
}

function ScheduleGroup({ label, entries, onRemove }: {
  label: string; entries: WorkoutScheduleEntry[]; onRemove: (id: string) => void;
}) {
  if (entries.length === 0) return null;
  return (
    <div>
      <GroupLabel>{label}</GroupLabel>
      <RowList>
        {entries.map((s, idx) => (
          <AssignmentRow key={s.id} first={idx === 0}
            title={s.workoutName ?? "Workout"}
            subtitle={`${fmtScheduleDate(s.date)}${s.notes ? ` · ${s.notes}` : ""}`}
            onRemove={() => onRemove(s.id)} removeLabel="Remove from schedule" />
        ))}
      </RowList>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      padding: "36px 20px", textAlign: "center",
      border: "1px dashed var(--border)", borderRadius: 10,
      color: "var(--fg3)", fontSize: 12.5,
    }}>
      <Dumbbell size={20} style={{ color: "var(--fg4)", marginBottom: 8 }} />
      <div style={{ fontWeight: 600, color: "var(--fg2)", marginBottom: 3 }}>
        Nothing assigned yet
      </div>
      <div>Assign a program or workout from the Library, or schedule one from the Workout Builder.</div>
    </div>
  );
}

export default function TrainingTab({ clientId }: { clientId: string }) {
  const [schedules, setSchedules] = React.useState<WorkoutScheduleEntry[] | null>(null);
  const [programs, setPrograms] = React.useState<ClientProgramAssignmentItem[]>([]);
  const [workouts, setWorkouts] = React.useState<ClientWorkoutAssignmentItem[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    setSchedules(null);
    Promise.all([listClientSchedules(clientId), listClientAssignments(clientId)])
      .then(([rows, assignments]) => {
        if (cancelled) return;
        setSchedules(rows);
        setPrograms(assignments.programs);
        setWorkouts(assignments.workouts);
      })
      .catch((e) => {
        console.error(e);
        if (cancelled) return;
        toast.error("Failed to load training");
        setSchedules([]);
      });
    return () => { cancelled = true; };
  }, [clientId]);

  // All three removals are optimistic with rollback — the row disappears at
  // once and comes back if the server refuses.
  const handleUnschedule = async (id: string) => {
    const prev = schedules;
    setSchedules((rows) => (rows ?? []).filter((s) => s.id !== id));
    try {
      await unscheduleWorkout(id);
      toast.success("Removed from schedule");
    } catch (e) {
      console.error(e);
      toast.error("Failed to remove from schedule");
      setSchedules(prev);
    }
  };

  const handleUnassignProgram = async (item: ClientProgramAssignmentItem) => {
    const prev = programs;
    setPrograms((rows) => rows.filter((p) => p.id !== item.id));
    try {
      await unassignProgramFromClient(item.programId!, item.id!);
      toast.success("Program unassigned");
    } catch (e) {
      console.error(e);
      toast.error("Failed to unassign program");
      setPrograms(prev);
    }
  };

  const handleUnassignWorkout = async (item: ClientWorkoutAssignmentItem) => {
    const prev = workouts;
    setWorkouts((rows) => rows.filter((w) => w.id !== item.id));
    try {
      await unassignWorkout(item.workoutId!, item.id!);
      toast.success("Workout unassigned");
    } catch (e) {
      console.error(e);
      toast.error("Failed to unassign workout");
      setWorkouts(prev);
    }
  };

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const rows = schedules ?? [];
  const upcoming = rows.filter((s) => s.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const past = rows.filter((s) => s.date < today).sort((a, b) => b.date.localeCompare(a.date));

  const loading = schedules === null;
  const nothingAtAll = !loading && rows.length === 0 && programs.length === 0 && workouts.length === 0;

  const programSubtitle = (p: ClientProgramAssignmentItem) => {
    const start = fmtStartDate(p.startDate);
    const weeks = p.weeks ? `${p.weeks} week${p.weeks === 1 ? "" : "s"}` : null;
    return [start ? `Starts ${start}` : null, weeks].filter(Boolean).join(" · ") || "Assigned";
  };

  return (
    <div style={{ padding: "24px 28px 60px", maxWidth: 720, display: "flex", flexDirection: "column", gap: 16 }}>
      {loading ? (
        <Card>
          <div style={{ padding: "20px 0", textAlign: "center", color: "var(--fg3)", fontSize: 12.5 }}>
            Loading…
          </div>
        </Card>
      ) : nothingAtAll ? (
        <Card>
          <CardTitle>Training</CardTitle>
          <EmptyState />
        </Card>
      ) : (
        <>
          {programs.length > 0 && (
            <Card>
              <CardTitle>Assigned programs</CardTitle>
              <RowList>
                {programs.map((p, idx) => (
                  <AssignmentRow key={p.id} first={idx === 0}
                    title={p.name ?? "Program"}
                    subtitle={programSubtitle(p)}
                    onRemove={() => handleUnassignProgram(p)}
                    removeLabel={`Unassign ${p.name ?? "program"}`} />
                ))}
              </RowList>
            </Card>
          )}

          {workouts.length > 0 && (
            <Card>
              <CardTitle>Assigned workouts</CardTitle>
              <RowList>
                {workouts.map((w, idx) => (
                  <AssignmentRow key={w.id} first={idx === 0}
                    title={w.name ?? "Workout"}
                    subtitle={w.notes || "No date set"}
                    onRemove={() => handleUnassignWorkout(w)}
                    removeLabel={`Unassign ${w.name ?? "workout"}`} />
                ))}
              </RowList>
            </Card>
          )}

          {rows.length > 0 && (
            <Card>
              <CardTitle>Scheduled workouts</CardTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <ScheduleGroup label="Upcoming" entries={upcoming} onRemove={handleUnschedule} />
                <ScheduleGroup label="Past" entries={past} onRemove={handleUnschedule} />
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
