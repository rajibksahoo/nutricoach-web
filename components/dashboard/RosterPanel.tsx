"use client";

import * as React from "react";
import Link from "next/link";
import ClientAvatar from "@/components/ui/ClientAvatar";
import { toneFromId, type DashboardCounts, type RecentClient } from "@/lib/dashboard-api";
import { Card, CardTitle, EmptyState } from "./primitives";

const SEGMENTS = [
  { key: "activeClients",     label: "Active",     color: "var(--success)" },
  { key: "onboardingClients", label: "Onboarding", color: "var(--brand-secondary)" },
  { key: "inactiveClients",   label: "Inactive",   color: "var(--fg5)" },
] as const;

export default function RosterPanel({
  counts, clientLimit, recentClients,
}: {
  counts: DashboardCounts;
  clientLimit: number;
  recentClients: RecentClient[];
}) {
  const total = counts.totalClients;
  const unlimited = clientLimit < 0;
  const nearLimit = !unlimited && clientLimit > 0 && total / clientLimit >= 0.8;

  return (
    <Card>
      <CardTitle right={
        <Link href="/clients" style={{
          fontSize: 11.5, fontWeight: 600, color: "var(--brand-primary)", textDecoration: "none",
        }}>View all</Link>
      }>
        Roster
      </CardTitle>

      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 10 }}>
        <span style={{
          fontFamily: "var(--font-display-xl)",
          fontSize: 30, fontWeight: 700, lineHeight: 1,
          letterSpacing: "-0.02em", color: "var(--fg1)",
          fontVariantNumeric: "tabular-nums",
        }}>{total}</span>
        <span style={{ fontSize: 13, color: "var(--fg4)" }}>
          {unlimited ? "clients" : `/ ${clientLimit} clients`}
        </span>
        {nearLimit && (
          <span style={{
            marginLeft: "auto", fontSize: 10.5, fontWeight: 600,
            color: "var(--warning-700)", background: "var(--warning-50)",
            padding: "2px 7px", borderRadius: 99,
          }}>Near limit</span>
        )}
      </div>

      {/* Status mix */}
      <div style={{
        display: "flex", height: 6, borderRadius: 99, overflow: "hidden",
        background: "var(--bg-subtle)", marginBottom: 9,
      }}>
        {total > 0 && SEGMENTS.map((s) => {
          const v = counts[s.key];
          if (!v) return null;
          return <div key={s.key} style={{ width: `${(v / total) * 100}%`, background: s.color }} />;
        })}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", marginBottom: 18 }}>
        {SEGMENTS.map((s) => (
          <span key={s.key} style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            fontSize: 11.5, color: "var(--fg3)",
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.color }} />
            {s.label}
            <span style={{ color: "var(--fg2)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
              {counts[s.key]}
            </span>
          </span>
        ))}
      </div>

      <div style={{
        fontSize: 10, fontWeight: 700, color: "var(--fg4)",
        textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 9,
      }}>Recently joined</div>

      {recentClients.length === 0 ? (
        <EmptyState title="No clients yet" hint="Add your first client to get started." />
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
          {recentClients.map((c) => (
            <li key={c.id}>
              <Link href={`/clients/${c.id}`} style={{
                display: "flex", alignItems: "center", gap: 9,
                padding: "6px 8px", borderRadius: 8, textDecoration: "none",
              }}>
                <ClientAvatar name={c.name} tone={toneFromId(c.id)} size={26} />
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{
                    display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--fg1)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{c.name}</span>
                  <span style={{ display: "block", fontSize: 11.5, color: "var(--fg4)" }}>{c.phone}</span>
                </span>
                <span style={{
                  flexShrink: 0, fontSize: 10, fontWeight: 600,
                  color: "var(--fg3)", background: "var(--bg-subtle)",
                  padding: "2px 7px", borderRadius: 99, textTransform: "capitalize",
                }}>{c.status.toLowerCase()}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
