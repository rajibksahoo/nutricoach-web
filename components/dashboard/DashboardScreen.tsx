"use client";

import * as React from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { UserPlus, RefreshCw } from "lucide-react";
import { getCoach } from "@/lib/auth";
import { getDashboardOverview, type ActionType, type DashboardOverview } from "@/lib/dashboard-api";
import AttentionStrip from "./AttentionStrip";
import ActionQueue from "./ActionQueue";
import TodayPanel from "./TodayPanel";
import RosterPanel from "./RosterPanel";
import ActivityFeed from "./ActivityFeed";
import TrialChip from "./TrialChip";
import { Card, Eyebrow, Shimmer } from "./primitives";

export default function DashboardScreen() {
  const [data, setData] = React.useState<DashboardOverview | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [filter, setFilter] = React.useState<ActionType | null>(null);

  // localStorage and the clock are browser-only — resolving them during render
  // would make the server and client markup disagree and blow up hydration.
  const [header, setHeader] = React.useState<{ greeting: string; date: string; name: string } | null>(null);
  React.useEffect(() => {
    const coach = getCoach();
    setHeader({
      greeting: greeting(),
      date: longDate(),
      name: coach?.name ? coach.name.split(" ")[0] : "",
    });
  }, []);

  const load = React.useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    try {
      setData(await getDashboardOverview());
    } catch (e) {
      console.error(e);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  // Distinct clients, not raw reasons — the queue groups by client, so the
  // header must count the same way or the two numbers contradict each other.
  const attentionTotal = data
    ? new Set(data.actionQueue.map((a) => a.clientId)).size
    : 0;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header */}
      <header style={{
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        gap: 16, flexWrap: "wrap",
        padding: "24px 28px 18px",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
      }}>
        <div>
          <Eyebrow>Dashboard</Eyebrow>
          <h1 style={{
            fontFamily: "var(--font-display-xl)",
            fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em",
            margin: "4px 0 0", color: "var(--fg1)",
            minHeight: 27,
          }}>
            {header ? `Good ${header.greeting}${header.name ? `, ${header.name}` : ""}` : " "}
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "var(--fg3)", minHeight: 19 }}>
            {header?.date}
            {header && !loading && (
              <>
                {" · "}
                {attentionTotal === 0
                  ? "nothing needs you right now"
                  : `${attentionTotal} ${attentionTotal === 1 ? "client needs" : "clients need"} your attention`}
              </>
            )}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {data && <TrialChip subscription={data.subscription} />}
          <button
            type="button"
            onClick={() => load(true)}
            disabled={refreshing}
            title="Refresh"
            aria-label="Refresh dashboard"
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: "1px solid var(--border)", background: "var(--surface)",
              color: "var(--fg2)", cursor: refreshing ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <RefreshCw size={14} style={refreshing ? { animation: "dashSpin 0.9s linear infinite" } : undefined} />
          </button>
          <Link href="/clients/new" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "var(--brand-primary)", color: "var(--fg-inverse)",
            border: "none", borderRadius: 8, padding: "8px 13px",
            fontSize: 12.5, fontWeight: 600, textDecoration: "none",
          }}>
            <UserPlus size={14} />
            Add client
          </Link>
        </div>
      </header>

      {loading ? (
        <LoadingState />
      ) : !data ? null : (
        <div style={{ padding: "20px 28px 60px", display: "grid", gap: 20 }}>
          <AttentionStrip
            counts={data.counts}
            active={filter}
            onToggle={setFilter}
          />

          <div style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.5fr) minmax(300px, 1fr)",
            gap: 20,
            alignItems: "start",
          }}>
            <ActionQueue
              items={data.actionQueue}
              filter={filter}
              onClearFilter={() => setFilter(null)}
            />
            <div style={{ display: "grid", gap: 20 }}>
              <TodayPanel sessions={data.today.sessions} checkIns={data.today.checkIns} />
              <RosterPanel
                counts={data.counts}
                clientLimit={data.roster.clientLimit}
                recentClients={data.roster.recentClients}
              />
            </div>
          </div>

          <ActivityFeed items={data.activity} />
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ padding: "20px 28px 60px", display: "grid", gap: 20 }}>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(168px, 1fr))", gap: 12,
      }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}><Shimmer h={38} /></Card>
        ))}
      </div>
      <div style={{
        display: "grid", gridTemplateColumns: "minmax(0, 1.5fr) minmax(300px, 1fr)", gap: 20,
        alignItems: "start",
      }}>
        <Card>
          <div style={{ display: "grid", gap: 14 }}>
            {Array.from({ length: 6 }).map((_, i) => <Shimmer key={i} h={34} />)}
          </div>
        </Card>
        <Card>
          <div style={{ display: "grid", gap: 14 }}>
            {Array.from({ length: 4 }).map((_, i) => <Shimmer key={i} h={34} />)}
          </div>
        </Card>
      </div>
    </div>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function longDate(): string {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long",
  });
}
