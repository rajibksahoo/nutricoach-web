"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search, ChevronDown, ChevronUp, Plus, Edit, Bell, Calendar as Cal,
  MessageCircle as Msg, Star, Sliders, Activity, Dumbbell,
} from "lucide-react";
import {
  STATUS_COLORS,
  type ClientDetail, type ClientPhoto, type StatusKey,
} from "./data";
import {
  listClients, getClientChart, listClientPhotos, getClientTrainingStats,
  toClientDetail, STATUS_MAP, type ClientTrainingStats,
} from "@/lib/clients-api";
import { isEnabled, type SectionKey } from "@/lib/features";
import ClientAvatar from "@/components/ui/ClientAvatar";
import StatusPill from "@/components/ui/StatusPill";
import Spark from "@/components/ui/Spark";
import ErrorState from "@/components/ui/ErrorState";
import ClientSettingsTab from "./ClientSettingsTab";
import TrainingTab from "./TrainingTab";
import ProgressPhotos from "./ProgressPhotos";
import CoachNotesCard from "./CoachNotesCard";
import UpdatesCard from "./UpdatesCard";
import { Card, CardTitle, iconBtnStyle } from "./detail-ui";
import Delta from "@/components/ui/Delta";

// ─── Sub-pane: search + client list ────────────────────────────────────
function ClientsSubNav({ clients, selectedId, onSelect }: {
  clients: ClientDetail[]; selectedId: string; onSelect: (id: string) => void;
}) {
  const [q, setQ] = React.useState("");
  const [sortAsc, setSortAsc] = React.useState(true);
  const filtered = clients
    .filter((c) => !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.goal.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
  return (
    <aside style={{
      width: 280, background: "#fff", borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column", flexShrink: 0, minHeight: "100vh",
    }}>
      <div style={{ padding: "22px 22px 14px" }}>
        <div style={{
          fontSize: 10, fontWeight: 700, color: "var(--fg4)",
          textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 4,
        }}>Clients</div>
        <h2 style={{
          fontFamily: "var(--font-display-xl)", fontSize: 22, fontWeight: 700,
          letterSpacing: "-0.02em", margin: 0, color: "var(--fg1)",
        }}>All Clients</h2>
      </div>

      <div style={{ padding: "0 16px 12px", display: "flex", gap: 8 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={13} style={{
            position: "absolute", left: 11, top: "50%",
            transform: "translateY(-50%)", color: "var(--fg4)",
          }} />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search client"
            style={{
              width: "100%", padding: "7px 12px 7px 32px",
              border: "1px solid var(--border)", borderRadius: 8,
              fontSize: 12.5, background: "#fff", outline: "none",
            }}
          />
        </div>
        <button onClick={() => setSortAsc((s) => !s)} title={`Sort ${sortAsc ? "A→Z" : "Z→A"}`}
          style={{
            width: 34, height: 34, padding: 0, border: "1px solid var(--border)",
            borderRadius: 8, background: "#fff", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg2)",
          }}>
          {sortAsc ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 16px" }}>
        {filtered.length === 0 && (
          <div style={{ padding: "24px 14px", textAlign: "center", color: "var(--fg4)", fontSize: 12 }}>
            No clients match.
          </div>
        )}
        {filtered.map((c) => {
          const on = selectedId === c.id;
          return (
            <button
              key={c.id} onClick={() => onSelect(c.id)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "10px 10px", borderRadius: 9, border: "none",
                background: on ? "var(--brand-primary-50)" : "transparent",
                cursor: "pointer", textAlign: "left", marginBottom: 2,
                transition: "background 80ms",
              }}
              onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = "var(--bg)"; }}
              onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = "transparent"; }}
            >
              <ClientAvatar name={c.name} tone={c.avatarTone} size={36} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  fontSize: 13.5, fontWeight: on ? 600 : 500,
                  color: on ? "var(--brand-primary)" : "var(--fg1)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{c.name}</div>
                <div style={{
                  fontSize: 11.5, color: "var(--fg3)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{c.goal} · {c.lastActive}</div>
              </div>
              <span style={{
                width: 7, height: 7, borderRadius: "50%",
                background: STATUS_COLORS[c.status]?.dot || "#94A3B8",
              }} />
            </button>
          );
        })}
      </div>

      <div style={{
        borderTop: "1px solid var(--border-subtle)", padding: "12px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        fontSize: 11.5, color: "var(--fg3)",
      }}>
        <span>{filtered.length} of {clients.length}</span>
        <Link href="/clients/new" style={subAddBtnStyle}>
          <Plus size={11} />Add client
        </Link>
      </div>
    </aside>
  );
}

const subAddBtnStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "5px 10px", borderRadius: 7,
  background: "var(--brand-primary-50)", color: "var(--brand-primary)",
  border: "1px dashed var(--brand-primary-200)",
  fontSize: 11.5, fontWeight: 600, cursor: "pointer", textDecoration: "none",
};

// ─── Detail header (avatar + tabs) ─────────────────────────────────────
const ALL_DETAIL_TABS = [
  "Overview", "Training", "Tasks", "Metrics", "Food Journal", "Meal Plan", "Settings",
] as const;
type DetailTab = typeof ALL_DETAIL_TABS[number];

/**
 * Tabs that are not built yet render a "PLANNED" placeholder, so each one is
 * switched from `lib/features.ts` like every other section. A tab with no entry
 * here is always shown.
 */
const TAB_SECTIONS: Partial<Record<DetailTab, SectionKey>> = {
  "Tasks": "clientTabTasks",
  "Food Journal": "clientTabFoodJournal",
  "Meal Plan": "clientTabMealPlan",
};

const DETAIL_TABS: readonly DetailTab[] = ALL_DETAIL_TABS.filter((t) => {
  const section = TAB_SECTIONS[t];
  return section === undefined || isEnabled(section);
});

function ClientDetailHeader({ client, tab, onTab }: { client: ClientDetail; tab: DetailTab; onTab: (t: DetailTab) => void }) {
  return (
    <div style={{
      background: "#fff", borderBottom: "1px solid var(--border)",
      padding: "16px 28px 0", flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <ClientAvatar name={client.name} tone={client.avatarTone} size={56} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h1 style={{
              fontFamily: "var(--font-display-xl)", fontSize: 22, fontWeight: 700,
              letterSpacing: "-0.02em", margin: 0, color: "var(--fg1)",
            }}>{client.name}</h1>
            <StatusPill status={client.status} />
          </div>
          <div style={{ display: "flex", gap: 0, marginTop: 6 }}>
            {DETAIL_TABS.map((t) => {
              const on = tab === t;
              return (
                <button key={t} onClick={() => onTab(t)} style={{
                  padding: "10px 14px 12px", border: "none", background: "transparent",
                  borderBottom: on ? "2px solid var(--brand-primary)" : "2px solid transparent",
                  marginBottom: -1,
                  color: on ? "var(--brand-primary)" : "var(--fg3)",
                  fontWeight: on ? 600 : 500, fontSize: 13.5,
                  cursor: "pointer", letterSpacing: "-0.005em",
                }}>{t}</button>
              );
            })}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, alignSelf: "flex-start" }}>
          <button style={iconBtnStyle} title="Search"><Search size={14} /></button>
          <button style={iconBtnStyle} title="Schedule"><Cal size={14} /></button>
          <button style={iconBtnStyle} title="Notifications"><Bell size={14} /></button>
        </div>
      </div>
    </div>
  );
}

// ─── Overview helpers ──────────────────────────────────────────────────
function TrainStat({ label, done, total, color = "#22C55E", emptyText }: {
  label: string; done: number; total: number; color?: string; emptyText?: string;
}) {
  const isEmpty = total === 0 && !done;
  return (
    <div style={{ textAlign: "center", padding: "4px 6px" }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: "var(--fg4)",
        textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6,
      }}>{label}</div>
      <div style={{
        fontFamily: "var(--font-display-xl)", fontSize: 30, fontWeight: 700,
        color: "var(--fg1)", letterSpacing: "-0.02em", lineHeight: 1,
        fontVariantNumeric: "tabular-nums",
      }}>
        {isEmpty ? "0" : <><span>{done}</span><span style={{ color: "var(--fg4)" }}>/{total}</span></>}
      </div>
      <div style={{ fontSize: 11.5, color: isEmpty ? "#B91C1C" : color, marginTop: 5, fontWeight: 500 }}>
        {isEmpty ? (emptyText || "Not tracked") : "Tracked"}
      </div>
    </div>
  );
}

/**
 * Percentage change across a series, or null when there is not enough data.
 *
 * The Metrics and Overview cards used to hardcode these (1.5%, 8%, 12%) for
 * every client, which read as real measurement. An honest empty state beats a
 * plausible invented number.
 */
function seriesDelta(data: number[]): { pct: number; dir: "up" | "down" } | null {
  if (!data || data.length < 2) return null;
  const first = data[0];
  const last = data[data.length - 1];
  if (!Number.isFinite(first) || !Number.isFinite(last) || first === 0) return null;
  const pct = ((last - first) / Math.abs(first)) * 100;
  if (Math.abs(pct) < 0.05) return null;
  return { pct: Math.abs(pct), dir: pct >= 0 ? "up" : "down" };
}

/** The numeric series for a metric key; `dates` is not one of them. */
function seriesFor(metrics: ClientDetail["metrics"], key: string): number[] {
  if (key === "weight") return metrics.weight;
  if (key === "bf") return metrics.bf;
  if (key === "steps") return metrics.steps;
  return [];
}

/** Evenly spaced labels across the real log dates, for the chart x-axis. */
function axisLabels(dates: string[], count = 6): string[] {
  if (!dates || dates.length === 0) return [];
  if (dates.length <= count) return dates.map(fmtAxisDate);
  const step = (dates.length - 1) / (count - 1);
  return Array.from({ length: count }, (_, i) => fmtAxisDate(dates[Math.round(i * step)]));
}

function fmtAxisDate(iso: string): string {
  return new Date(iso + "T00:00:00")
    .toLocaleDateString(undefined, { day: "numeric", month: "short" })
    .toUpperCase();
}

function MetricRow({ label, unit, data, color, positiveIsDown }: {
  label: string; unit: string; data: number[]; color: string; positiveIsDown?: boolean;
}) {
  const delta = seriesDelta(data);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: "var(--fg2)", fontWeight: 600 }}>{label}</span>
        <span style={{
          fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700,
          color: "var(--fg1)", letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums",
        }}>
          {data[data.length - 1]}
        </span>
        <span style={{ fontSize: 13, color: "var(--fg3)" }}>{unit}</span>
        {delta
          ? <Delta pct={Number(delta.pct.toFixed(1))} dir={delta.dir} positiveIsDown={positiveIsDown} />
          : <span style={{ fontSize: 11.5, color: "var(--fg4)" }}>not enough data</span>}
      </div>
      <Spark data={data} color={color} w={460} h={64} fill axis />
    </div>
  );
}

function ProfileRow({ icon, value }: { icon: string; value: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "7px 0", fontSize: 12.5, color: "var(--fg1)",
      borderTop: "1px solid var(--border-subtle)",
    }}>
      <span style={{ fontSize: 13, width: 18, textAlign: "center" }}>{icon}</span>
      <span>{value}</span>
    </div>
  );
}

/**
 * The chart window. Fixed for now, and labelled with the window actually
 * fetched — it used to read "Last 4 weeks" while `getClientChart` asked for 60
 * days, so the control was both inert and wrong.
 */
function RangeSelect() {
  return (
    <button
      disabled
      title="Choosing a range is planned"
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "5px 11px", borderRadius: 7, border: "1px solid var(--border)",
        background: "var(--bg-subtle)", fontSize: 12, color: "var(--fg4)",
        cursor: "not-allowed", fontWeight: 500,
      }}>
      Last 60 days <ChevronDown size={11} />
    </button>
  );
}

/**
 * @param planned marks a control that is on the roadmap but not built. It is
 *   shown disabled with a tooltip rather than looking live and doing nothing —
 *   a button that silently ignores a click teaches a coach the product is
 *   broken.
 */
function SmallBtn({ icon: Icon, children, primary, planned }: {
  icon?: React.ComponentType<{ size?: number }>;
  children: React.ReactNode;
  primary?: boolean;
  planned?: boolean;
}) {
  return (
    <button
      disabled={planned}
      title={planned ? "Planned — not available yet" : undefined}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
        padding: "6px 11px", borderRadius: 7,
        cursor: planned ? "not-allowed" : "pointer",
        background: planned ? "var(--bg-subtle)" : primary ? "var(--brand-primary)" : "#fff",
        color: planned ? "var(--fg4)" : primary ? "#fff" : "var(--fg1)",
        border: planned ? "1px solid var(--border)" : primary ? "none" : "1px solid var(--border)",
        fontSize: 12, fontWeight: 500, flex: 1,
      }}>
      {Icon && <Icon size={12} />}{children}
    </button>
  );
}

// ─── Overview tab ──────────────────────────────────────────────────────
// `photos` stays undefined until its fetch resolves, so the card can tell
// "still loading" from "this client has none".
function OverviewTab({ client, photos, stats }: {
  client: ClientDetail; photos?: ClientPhoto[]; stats?: ClientTrainingStats;
}) {
  const w7 = stats?.last7Days;
  const w30 = stats?.last30Days;
  const wNext = stats?.nextWeek;
  const last = stats?.lastWorkout;
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "minmax(0, 1.4fr) minmax(280px, 1fr) minmax(280px, 1fr)",
      gap: 20, padding: "24px 28px 60px",
    }}>
      {/* Col A: Training + Body Metrics */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
        <Card>
          <CardTitle>Training</CardTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "6px 0 14px" }}>
            <TrainStat label="LAST 7 DAYS"  done={w7?.done ?? 0}  total={w7?.planned ?? 0}
              emptyText={stats ? "Nothing planned" : "Loading…"}/>
            <TrainStat label="LAST 30 DAYS" done={w30?.done ?? 0} total={w30?.planned ?? 0}
              emptyText={stats ? "Nothing planned" : "Loading…"}/>
            <TrainStat label="NEXT WEEK"    done={wNext?.done ?? 0} total={wNext?.planned ?? 0}
              color="#EAB308" emptyText={stats ? "Not assigned yet" : "Loading…"}/>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "12px 14px", borderRadius: 8,
            background: "var(--bg)", border: "1px solid var(--border-subtle)",
          }}>
            <Dumbbell size={14} style={{ color: "var(--brand-primary)" }} />
            <div style={{ flex: 1, fontSize: 12.5, color: "var(--fg2)" }}>
              <span style={{ color: "var(--fg3)" }}>Last Workout: </span>
              {last ? (
                <>
                  <span style={{ color: "var(--fg1)", fontWeight: 600 }}>{last.workoutName}</span>
                  <span style={{ color: "var(--fg4)" }}>
                    {" · "}{last.daysAgo === 0 ? "today" : `${last.daysAgo}d ago`}
                  </span>
                </>
              ) : (
                <span style={{ color: "var(--fg4)" }}>
                  {stats ? "none completed yet" : "loading…"}
                </span>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <CardTitle inline>Body Metrics Overview</CardTitle>
            <RangeSelect />
          </div>
          <MetricRow label="Weight"   unit="kg" data={client.metrics.weight} color="#4F46E5" positiveIsDown />
          <div style={{ height: 1, background: "var(--border-subtle)", margin: "14px 0" }} />
          <MetricRow label="Body Fat" unit="%"  data={client.metrics.bf}     color="#EC4899" positiveIsDown />
        </Card>
      </div>

      {/* Col B: Goal · Notes · Limitations · Photos */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 16 }}>🎯</span>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--fg1)" }}>Goal &amp; Countdown</div>
          </div>
          <div style={{ fontSize: 11, color: "var(--fg4)", marginBottom: 10 }}>(Shared with client)</div>
          <div style={{
            padding: "10px 12px", borderRadius: 8,
            background: "#FEF3C7", border: "1px solid #FDE68A",
          }}>
            <div style={{
              display: "inline-block", padding: "1px 8px", borderRadius: 5,
              background: "#FCD34D", color: "#78350F",
              fontSize: 10.5, fontWeight: 600, marginBottom: 6,
            }}>General Goal</div>
            <div style={{ fontSize: 12.5, color: "#78350F", lineHeight: 1.45 }}>
              {client.goalDesc}
            </div>
            <div style={{ fontSize: 11, color: "#92400E", marginTop: 6, fontWeight: 600 }}>
              Ends {client.pkgEnd}
            </div>
          </div>
        </Card>

        <Card>
          <CoachNotesCard clientId={client.id} />
        </Card>

        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>🩹</span>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--fg1)" }}>Limitations / Injuries</div>
            </div>
            <Edit size={13} aria-label="Editing limitations is planned"
              style={{ color: "var(--fg4)", cursor: "not-allowed", opacity: 0.5 }} />
          </div>
          {client.limitations.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--fg4)" }}>No limitations recorded.</div>
          ) : client.limitations.map((n, i) => (
            <div key={i} style={{
              borderLeft: "2px solid #EF4444",
              paddingLeft: 10, marginBottom: i < client.limitations.length - 1 ? 10 : 0,
            }}>
              <div style={{ fontSize: 12.5, color: "var(--fg1)", lineHeight: 1.45, fontWeight: 500 }}>{n.text}</div>
              {n.date && (
                <div style={{ fontSize: 11, color: "var(--fg4)", marginTop: 3 }}>{n.date}</div>
              )}
            </div>
          ))}
        </Card>

        <Card>
          <ProgressPhotos photos={photos} />
        </Card>
      </div>

      {/* Col C: Profile + Updates */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--fg1)" }}>Profile</div>
            <Star size={14} style={{ color: "var(--fg4)", cursor: "pointer" }} />
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <SmallBtn icon={Msg} planned>Message</SmallBtn>
            <SmallBtn icon={Plus} planned>Assign</SmallBtn>
          </div>
          <ProfileRow icon="✉️" value={client.email} />
          <ProfileRow icon="📞" value={client.phone} />
          <ProfileRow icon="🏠" value={client.timezone} />
          <ProfileRow icon="📍" value={`Joined ${client.joined}`} />
        </Card>

        <Card>
          <UpdatesCard clientId={client.id} />
        </Card>
      </div>
    </div>
  );
}

// ─── Metrics tab ───────────────────────────────────────────────────────
const METRIC_DEFS = [
  { key: "weight", label: "Weight",   unit: "kg", color: "#4F46E5", positiveIsDown: true,  group: "body" },
  { key: "bf",     label: "Body Fat", unit: "%",  color: "#EC4899", positiveIsDown: true,  group: "body" },
  { key: "steps",  label: "Steps",    unit: "",   color: "#0D9488", positiveIsDown: false, group: "body" },
];

function MetricsTab({ client }: { client: ClientDetail }) {
  const dates = client.metrics.dates;
  const lastLogged = dates.length
    ? new Date(dates[dates.length - 1] + "T00:00:00")
        .toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
    : "—";
  const [group, setGroup] = React.useState<"body" | "exercise">("body");
  const [q] = React.useState("");
  const metrics = METRIC_DEFS.filter((m) => m.group === group)
    .filter((m) => !q || m.label.toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "minmax(380px, 1fr) minmax(0, 1.6fr)",
      gap: 20, padding: "24px 28px 60px",
    }}>
      <div>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0,
          background: "#fff", border: "1px solid var(--border)",
          borderRadius: 10, padding: 4, marginBottom: 16,
        }}>
          {[
            { k: "body" as const, l: "Body Metrics", I: Activity },
            { k: "exercise" as const, l: "Exercise Metrics", I: Dumbbell },
          ].map((t) => {
            const on = group === t.k;
            return (
              <button key={t.k} onClick={() => setGroup(t.k)} style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
                padding: "9px 12px", borderRadius: 7, border: "none",
                background: on ? "var(--brand-primary)" : "transparent",
                color: on ? "#fff" : "var(--fg2)",
                fontSize: 13, fontWeight: on ? 600 : 500,
                cursor: "pointer", transition: "all 80ms",
              }}>
                <t.I size={13} />{t.l}
              </button>
            );
          })}
        </div>

        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 16px",
          }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--fg1)" }}>Body Metrics</div>
            <div style={{ display: "flex", gap: 6 }}>
              <button title="Search" style={{
                width: 30, height: 30, padding: 0, border: "1px solid var(--border)",
                borderRadius: 7, background: "#fff", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg2)",
              }}><Search size={13} /></button>
              <button style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "5px 11px", borderRadius: 7, border: "1px solid var(--border)",
                background: "#fff", fontSize: 12, color: "var(--fg1)", fontWeight: 500, cursor: "pointer",
              }}>
                <Plus size={11} />Add New <ChevronDown size={11} />
              </button>
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border-subtle)", padding: "4px 0" }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 16px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ChevronDown size={13} style={{ color: "var(--brand-primary)" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--brand-primary)" }}>
                  All Metrics ({metrics.length})
                </span>
              </div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={mTh}>Name</th>
                  <th style={{ ...mTh, textAlign: "right" }}>Value</th>
                  <th style={{ ...mTh, textAlign: "right" }}>Last update</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((m) => {
                  const arr = seriesFor(client.metrics, m.key);
                  const v = arr.length ? arr[arr.length - 1] : null;
                  return (
                    <tr key={m.key} style={{ borderTop: "1px solid var(--border-subtle)" }}>
                      <td style={mTd}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.color }} />
                          <span style={{ fontWeight: 500, color: "var(--fg1)" }}>{m.label}</span>
                        </div>
                      </td>
                      <td style={{ ...mTd, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                        {v == null
                          ? <span style={{ color: "var(--fg4)" }}>—</span>
                          : <span style={{ color: "var(--fg1)", fontWeight: 600 }}>{v}{m.unit && " " + m.unit}</span>}
                      </td>
                      <td style={{ ...mTd, textAlign: "right" }}>
                        <span style={{ color: "var(--fg3)" }}>{v == null ? "—" : lastLogged}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{
            borderTop: "1px solid var(--border-subtle)",
            padding: "12px 16px", display: "flex", justifyContent: "center",
          }}>
            <button style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "5px 9px", borderRadius: 7, border: "none",
              background: "transparent", color: "var(--fg2)", fontSize: 12, cursor: "pointer",
            }}>
              <Sliders size={12} />Manage Metrics
            </button>
          </div>
        </Card>
      </div>

      <div>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 14,
        }}>
          <h2 style={{
            fontFamily: "var(--font-display-xl)", fontSize: 20, fontWeight: 700,
            letterSpacing: "-0.02em", margin: 0, color: "var(--fg1)",
          }}>All Metrics</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <RangeSelect />
            <button style={{
              padding: "5px 11px", borderRadius: 7,
              border: "1px solid var(--brand-primary-200)", color: "var(--brand-primary)",
              background: "#fff", fontSize: 12, fontWeight: 500, cursor: "pointer",
            }}>
              Update Results
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {metrics.map((m) => (
            <MetricChartCard
              key={m.key} def={m}
              data={seriesFor(client.metrics, m.key)}
              dates={client.metrics.dates}
              large={m.key === "weight"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const mTh: React.CSSProperties = {
  padding: "8px 16px", textAlign: "left",
  fontSize: 10, fontWeight: 700, color: "var(--fg4)",
  textTransform: "uppercase", letterSpacing: "0.07em",
  background: "var(--bg)", borderTop: "1px solid var(--border-subtle)",
};
const mTd: React.CSSProperties = { padding: "12px 16px", verticalAlign: "middle" };

function MetricChartCard({ def, data, dates, large }: {
  def: { label: string; unit: string; color: string; positiveIsDown: boolean };
  data: number[]; dates: string[]; large?: boolean;
}) {
  const delta = seriesDelta(data);
  const empty = !data.length;
  const v = empty ? null : data[data.length - 1];
  return (
    <Card style={{ padding: "14px 16px", gridColumn: large ? "1 / -1" : "auto" }}>
      <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--fg1)", marginBottom: 6 }}>{def.label}</div>
      {empty ? (
        <div style={{ fontSize: 11, color: "var(--fg4)" }}>—</div>
      ) : (
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
          <span style={{
            fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700,
            color: "var(--fg1)", letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums",
          }}>{v}</span>
          {def.unit && <span style={{ fontSize: 13, color: "var(--fg3)" }}>{def.unit}</span>}
          {delta && <Delta pct={Number(delta.pct.toFixed(1))} dir={delta.dir} positiveIsDown={def.positiveIsDown} />}
        </div>
      )}
      {empty || data.length < 2 ? (
        <div style={{
          height: large ? 200 : 140, borderRadius: 8,
          background: "var(--bg)", border: "1px dashed var(--border)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
          color: "var(--fg4)", fontSize: 12,
        }}>
          <Activity size={20} />
          No data available
        </div>
      ) : (
        <Spark data={data} color={def.color} w={large ? 720 : 320} h={large ? 200 : 140} fill axis />
      )}
      {!empty && (
        <div style={{
          display: "flex", justifyContent: "space-between",
          fontSize: 10, color: "var(--fg4)", marginTop: 6, fontFamily: "var(--font-mono)",
          letterSpacing: "0.04em",
        }}>
          {axisLabels(dates).map((d, i) => <span key={`${d}-${i}`}>{d}</span>)}
        </div>
      )}
    </Card>
  );
}

// ─── Top-level Clients screen ──────────────────────────────────────────

export default function ClientsScreen({ initialClientId }: { initialClientId?: string } = {}) {
  const [clients, setClients] = React.useState<ClientDetail[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState<DetailTab>("Overview");
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState(false);
  const [reloadKey, setReloadKey] = React.useState(0);
  // Cache of progress arrays keyed by client id; merged into the
  // selected client's `metrics` so sparklines come from real logs.
  const [chartById, setChartById] = React.useState<Record<string, ClientDetail["metrics"]>>({});
  // Progress photos are fetched per selected client, like the chart — the list
  // endpoint doesn't carry them and presigning every roster client's URLs up
  // front would be wasted work.
  const [photosById, setPhotosById] = React.useState<Record<string, ClientPhoto[]>>({});
  const [statsById, setStatsById] = React.useState<Record<string, ClientTrainingStats>>({});

  // Initial load: fetch the coach's clients. An empty roster is a real
  // state (new coach) and an error is a real error — neither falls back
  // to fixtures, which used to make both look like a populated account.
  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    listClients()
      .then((rows) => {
        if (cancelled) return;
        const mapped = rows.map((r) => toClientDetail(r));
        setClients(mapped);
        // `/clients/{id}` deep-links into this screen — prefer that client.
        const deepLinked = initialClientId && mapped.some((c) => c.id === initialClientId)
          ? initialClientId
          : null;
        setSelectedId(deepLinked ?? mapped[0]?.id ?? null);
      })
      .catch(() => {
        if (cancelled) return;
        setClients([]);
        setSelectedId(null);
        setLoadError(true);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [reloadKey, initialClientId]);

  // Lazy-load progress chart for the selected client.
  React.useEffect(() => {
    if (!selectedId || chartById[selectedId]) return;
    getClientChart(selectedId, 60)
      .then((logs) => {
        const sorted = [...logs].sort((a, b) => a.loggedDate.localeCompare(b.loggedDate));
        const weight = sorted.map((p) => p.weightKg).filter((v): v is string => !!v).map(Number);
        const bf = sorted.map((p) => p.bodyFatPercent).filter((v): v is string => !!v).map(Number);
        // Dates come along so the chart axis and "last update" show what was
        // actually logged instead of hardcoded labels.
        const dates = sorted.map((p) => p.loggedDate);
        setChartById((prev) => ({ ...prev, [selectedId]: { weight, bf, steps: [], dates } }));
      })
      .catch((e) => { console.error(e); });
  }, [selectedId, clients]);

  // Lazy-load progress photos for the selected client.
  React.useEffect(() => {
    if (!selectedId || photosById[selectedId]) return;
    listClientPhotos(selectedId)
      .then((photos) => setPhotosById((prev) => ({ ...prev, [selectedId]: photos })))
      .catch((e) => { console.error(e); });
  }, [selectedId, clients]);

  // Lazy-load training stats for the selected client.
  React.useEffect(() => {
    if (!selectedId || statsById[selectedId]) return;
    getClientTrainingStats(selectedId)
      .then((stats) => setStatsById((prev) => ({ ...prev, [selectedId]: stats })))
      .catch((e) => { console.error(e); });
  }, [selectedId, clients]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "var(--bg)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--fg3)", fontSize: 13,
      }}>
        Loading clients…
      </div>
    );
  }

  if (loadError) {
    return (
      <ErrorState
        title="Couldn't load your clients"
        message="We couldn't reach the server. Your roster is safe — this is a connection problem."
        onRetry={() => setReloadKey((k) => k + 1)}
      />
    );
  }

  if (clients.length === 0) {
    return (
      <div style={{
        minHeight: "100vh", background: "var(--bg)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 8, color: "var(--fg3)",
      }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--fg2)" }}>No clients yet</div>
        <div style={{ fontSize: 12.5 }}>Add your first client to start coaching.</div>
      </div>
    );
  }

  const baseClient = clients.find((c) => c.id === selectedId) || clients[0];
  const chart = selectedId ? chartById[selectedId] : undefined;
  const photos = selectedId ? photosById[selectedId] : undefined;
  const stats = selectedId ? statsById[selectedId] : undefined;
  const client: ClientDetail = chart ? { ...baseClient, metrics: chart } : baseClient;

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "280px 1fr",
      minHeight: "100vh", background: "var(--bg)",
    }}>
      <ClientsSubNav
        clients={clients}
        selectedId={baseClient.id}
        onSelect={(id) => { setSelectedId(id); setTab("Overview"); }}
      />
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <ClientDetailHeader client={client} tab={tab} onTab={setTab} />
        {tab === "Overview" && <OverviewTab client={client} photos={photos} stats={stats} />}
        {tab === "Metrics"  && <MetricsTab  client={client} />}
        {tab === "Training" && <TrainingTab clientId={client.id} />}
        {tab === "Settings" && (
          <div style={{ padding: "24px 28px" }}>
            <ClientSettingsTab
              clientId={client.id}
              onUpdated={(name, status) => setClients((prev) => prev.map((c) =>
                c.id === client.id ? { ...c, name, status: STATUS_MAP[status as keyof typeof STATUS_MAP] ?? c.status } : c))}
              onDeleted={() => {
                setClients((prev) => {
                  const next = prev.filter((c) => c.id !== client.id);
                  setSelectedId(next[0]?.id ?? null);
                  return next;
                });
                setTab("Overview");
              }}
            />
          </div>
        )}
        {!["Overview", "Metrics", "Training", "Settings"].includes(tab) && (
          <div style={{
            margin: "40px 28px", padding: "60px 20px",
            background: "#fff", border: "1px dashed var(--border)", borderRadius: 12,
            textAlign: "center", color: "var(--fg3)",
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg2)", marginBottom: 4 }}>{tab}</div>
            <div style={{
              display: "inline-block", padding: "2px 8px", borderRadius: 99, marginBottom: 8,
              background: "var(--bg-subtle)", border: "1px solid var(--border)",
              fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: "var(--fg4)",
            }}>PLANNED</div>
            <div style={{ fontSize: 12.5 }}>
              {tab === "Food Journal"
                ? "Client food logging is planned. Meal plans live under Meal plans in the sidebar."
                : tab === "Meal Plan"
                  ? "Meal plans are created from Meal plans in the sidebar; showing them here is planned."
                  : "This part of the client roadmap is not built yet."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
