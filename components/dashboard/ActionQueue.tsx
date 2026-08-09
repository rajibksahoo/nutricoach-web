"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import ClientAvatar from "@/components/ui/ClientAvatar";
import {
  actionHref, actionLabel, fmtRelative, toneFromId,
  type ActionItem, type ActionType,
} from "@/lib/dashboard-api";
import { ACTION_META } from "./action-meta";
import { Card, CardTitle, EmptyState } from "./primitives";

/**
 * One row per client rather than per reason: a client who is both onboarding
 * and has no meal plan is one person to deal with, not two queue entries. The
 * highest-priority reason leads; the rest ride along as extra pills.
 */
interface QueueGroup {
  lead: ActionItem;
  others: ActionItem[];
}

function group(items: ActionItem[]): QueueGroup[] {
  const byClient = new Map<string, ActionItem[]>();
  for (const i of items) {
    const list = byClient.get(i.clientId);
    if (list) list.push(i);
    else byClient.set(i.clientId, [i]);
  }
  // items arrive priority-sorted, so the first per client is the lead and the
  // map preserves that ordering across clients too.
  return [...byClient.values()].map(([lead, ...others]) => ({ lead, others }));
}

export default function ActionQueue({
  items, filter, onClearFilter,
}: {
  items: ActionItem[];
  filter: ActionType | null;
  onClearFilter: () => void;
}) {
  const groups = React.useMemo(() => group(items), [items]);

  // When filtering, promote the matching reason to lead so the row's title and
  // action verb describe what the coach actually clicked on.
  const shown = React.useMemo(() => {
    if (!filter) return groups;
    return groups
      .filter((g) => g.lead.type === filter || g.others.some((o) => o.type === filter))
      .map((g) => {
        if (g.lead.type === filter) return g;
        const match = g.others.find((o) => o.type === filter)!;
        return { lead: match, others: [g.lead, ...g.others.filter((o) => o !== match)] };
      });
  }, [groups, filter]);

  return (
    <Card style={{ padding: "16px 0 6px" }}>
      <div style={{ padding: "0 18px" }}>
        <CardTitle
          right={filter ? (
            <button
              type="button"
              onClick={onClearFilter}
              style={{
                padding: "4px 10px", borderRadius: 7,
                border: "1px solid var(--border)", background: "var(--surface)",
                fontSize: 11.5, fontWeight: 500, color: "var(--fg2)", cursor: "pointer",
              }}
            >
              Clear filter
            </button>
          ) : (
            <span style={{ fontSize: 11.5, color: "var(--fg4)" }}>
              {groups.length} {groups.length === 1 ? "client" : "clients"}
            </span>
          )}
        >
          Needs your attention
        </CardTitle>
      </div>

      {shown.length === 0 ? (
        <div style={{ padding: "0 18px 14px" }}>
          <EmptyState
            icon={<CheckCircle2 size={20} />}
            title={filter ? "Nothing in this category" : "You're all caught up"}
            hint={filter ? "Clear the filter to see the rest of the queue." : "No clients are waiting on you right now."}
          />
        </div>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {shown.map((g) => (
            <QueueRow key={g.lead.clientId} lead={g.lead} others={g.others} />
          ))}
        </ul>
      )}
    </Card>
  );
}

function QueueRow({ lead: item, others }: { lead: ActionItem; others: ActionItem[] }) {
  const meta = ACTION_META[item.type];
  const [hover, setHover] = React.useState(false);

  return (
    <li>
      <Link
        href={actionHref(item)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "11px 18px",
          borderTop: "1px solid var(--border-subtle)",
          background: hover ? "var(--bg)" : "transparent",
          textDecoration: "none",
          transition: "background var(--dur-fast) var(--ease-out)",
        }}
      >
        <ClientAvatar name={item.clientName} tone={toneFromId(item.clientId)} size={34} />

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <span style={{
              fontSize: 13.5, fontWeight: 600, color: "var(--fg1)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{item.clientName}</span>
            <span style={{
              flexShrink: 0,
              background: meta.bg, color: meta.fg,
              padding: "1px 7px", borderRadius: 99,
              fontSize: 10.5, fontWeight: 600,
              border: `1px solid ${meta.fg}22`,
            }}>{meta.pill}</span>
            {others.map((o) => {
              const m = ACTION_META[o.type];
              return (
                <span key={o.type} title={o.title} style={{
                  flexShrink: 0,
                  background: "transparent", color: m.fg,
                  padding: "1px 7px", borderRadius: 99,
                  fontSize: 10.5, fontWeight: 600,
                  border: `1px solid ${m.fg}33`,
                }}>{m.pill}</span>
              );
            })}
          </div>
          <div style={{
            fontSize: 12, color: "var(--fg3)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {item.title}
            {item.detail ? <span style={{ color: "var(--fg4)" }}> · {item.detail}</span> : null}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: "var(--fg4)", fontVariantNumeric: "tabular-nums" }}>
            {fmtRelative(item.occurredAt)}
          </span>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 2,
            fontSize: 12, fontWeight: 600,
            color: hover ? "var(--brand-primary)" : "var(--fg3)",
          }}>
            {actionLabel(item.type)}
            <ChevronRight size={13} />
          </span>
        </div>
      </Link>
    </li>
  );
}
