"use client";

import { STATUS_COLORS, type StatusKey } from "@/components/clients/data";

/** Dot + label pill for a client's presence/engagement status. */
export default function StatusPill({ status }: { status: StatusKey }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS["Offline"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: c.bg, color: c.color,
      padding: "2px 8px", borderRadius: 999,
      fontSize: 11, fontWeight: 600,
      border: `1px solid ${c.color}22`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot }} />
      {status}
    </span>
  );
}
