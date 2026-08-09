"use client";

import * as React from "react";
import Link from "next/link";
import { Dumbbell, ClipboardCheck } from "lucide-react";
import ClientAvatar from "@/components/ui/ClientAvatar";
import { toneFromId, type CheckInToday, type ScheduledSession } from "@/lib/dashboard-api";
import { Card, CardTitle, EmptyState } from "./primitives";

export default function TodayPanel({
  sessions, checkIns,
}: {
  sessions: ScheduledSession[];
  checkIns: CheckInToday[];
}) {
  return (
    <Card>
      <CardTitle right={<span style={{ fontSize: 11.5, color: "var(--fg4)" }}>{todayLabel()}</span>}>
        Today
      </CardTitle>

      <Section icon={<Dumbbell size={13} />} label="Sessions" count={sessions.length} />
      {sessions.length === 0 ? (
        <EmptyState title="No sessions today" hint="Nothing scheduled or programmed." />
      ) : (
        <ul style={{ listStyle: "none", margin: "0 0 18px", padding: 0, display: "grid", gap: 8 }}>
          {sessions.map((s, i) => (
            <li key={`${s.clientId}-${s.workoutId}-${i}`}>
              <Link href={`/clients/${s.clientId}`} style={row}>
                <ClientAvatar name={s.clientName} tone={toneFromId(s.clientId)} size={26} />
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={nameStyle}>{s.clientName}</span>
                  <span style={subStyle}>{s.workoutName}</span>
                </span>
                {s.source === "PROGRAM" && (
                  <span style={{
                    flexShrink: 0, fontSize: 10, fontWeight: 600,
                    color: "var(--brand-secondary-600)", background: "var(--brand-secondary-50)",
                    padding: "1px 6px", borderRadius: 99,
                  }}>Program</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: 18 }}>
        <Section icon={<ClipboardCheck size={13} />} label="Check-ins" count={checkIns.length} />
        {checkIns.length === 0 ? (
          <EmptyState title="No check-ins yet today" />
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
            {checkIns.map((c, i) => (
              <li key={`${c.clientId}-${i}`}>
                <Link href={`/clients/${c.clientId}`} style={row}>
                  <ClientAvatar name={c.clientName} tone={toneFromId(c.clientId)} size={26} />
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span style={nameStyle}>{c.clientName}</span>
                  </span>
                  {c.adherencePercent != null && (
                    <span style={{
                      flexShrink: 0, fontSize: 11, fontWeight: 600,
                      fontVariantNumeric: "tabular-nums",
                      color: adherenceTone(c.adherencePercent),
                    }}>{c.adherencePercent}%</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}

function Section({ icon, label, count }: { icon: React.ReactNode; label: string; count: number }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6, marginBottom: 9,
      fontSize: 10, fontWeight: 700, color: "var(--fg4)",
      textTransform: "uppercase", letterSpacing: "0.08em",
    }}>
      <span style={{ display: "inline-flex" }}>{icon}</span>
      {label}
      <span style={{ color: "var(--fg5)" }}>·</span>
      <span style={{ fontVariantNumeric: "tabular-nums" }}>{count}</span>
    </div>
  );
}

function adherenceTone(pct: number): string {
  if (pct >= 80) return "var(--success-700)";
  if (pct >= 50) return "var(--warning-700)";
  return "var(--danger-700)";
}

function todayLabel(): string {
  return new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

const row: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 9,
  padding: "6px 8px", borderRadius: 8,
  textDecoration: "none",
};

const nameStyle: React.CSSProperties = {
  display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--fg1)",
  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
};

const subStyle: React.CSSProperties = {
  display: "block", fontSize: 11.5, color: "var(--fg3)",
  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
};
