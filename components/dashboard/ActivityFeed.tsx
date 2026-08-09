"use client";

import * as React from "react";
import Link from "next/link";
import { MessageCircle, ClipboardCheck, LineChart, UserPlus } from "lucide-react";
import { fmtRelative, type ActivityItem, type ActivityType } from "@/lib/dashboard-api";
import { Card, CardTitle, EmptyState } from "./primitives";

const META: Record<ActivityType, { Icon: React.ComponentType<{ size?: number }>; fg: string; bg: string }> = {
  MESSAGE:      { Icon: MessageCircle,  fg: "var(--info-700)",             bg: "var(--info-50)" },
  CHECK_IN:     { Icon: ClipboardCheck, fg: "var(--success-700)",          bg: "var(--success-50)" },
  PROGRESS_LOG: { Icon: LineChart,      fg: "var(--brand-primary)",        bg: "var(--brand-primary-50)" },
  CLIENT_JOINED:{ Icon: UserPlus,       fg: "var(--brand-secondary-600)",  bg: "var(--brand-secondary-50)" },
};

export default function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <Card>
      <CardTitle>Recent activity</CardTitle>

      {items.length === 0 ? (
        <EmptyState title="Nothing yet" hint="Client messages, check-ins and logs will appear here." />
      ) : (
        <ul style={{
          listStyle: "none", margin: 0, padding: 0,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
          gap: "2px 22px",
        }}>
          {items.map((a, i) => {
            const { Icon, fg, bg } = META[a.type];
            return (
              <li key={`${a.type}-${a.clientId}-${i}`}>
                <Link href={`/clients/${a.clientId}`} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 6px", textDecoration: "none",
                }}>
                  <span style={{
                    width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                    background: bg, color: fg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={13} />
                  </span>
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span style={{
                      display: "block", fontSize: 12.5, color: "var(--fg2)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      <span style={{ fontWeight: 600, color: "var(--fg1)" }}>{a.clientName}</span>
                      {" — "}{a.summary}
                    </span>
                  </span>
                  <span style={{
                    flexShrink: 0, fontSize: 11, color: "var(--fg4)",
                    fontVariantNumeric: "tabular-nums",
                  }}>{fmtRelative(a.occurredAt)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
