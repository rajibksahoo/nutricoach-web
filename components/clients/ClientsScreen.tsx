"use client";

import * as React from "react";
import {
  Search, ChevronDown, ChevronUp, Plus, Edit, Bell, Calendar as Cal,
  MessageCircle as Msg, Star, Sliders, Activity, Dumbbell,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  STATUS_COLORS,
  type ClientDetail, type StatusKey,
} from "./data";
import {
  listClients, getClientChart, toClientDetail, isMockFallbackEnv, mockFallbackClients,
} from "@/lib/clients-api";

// ─── Tiny visuals ──────────────────────────────────────────────────────
function ClientAvatar({ name, tone = "#4F46E5", size = 32 }: { name: string; tone?: string; size?: number }) {
  const initials = (name || "?").split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("");
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: tone + "22", color: tone, border: `1px solid ${tone}55`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 600, fontSize: Math.round(size * 0.36), flexShrink: 0,
      letterSpacing: "-0.01em",
    }}>{initials}</div>
  );
}

function StatusPill({ status }: { status: StatusKey }) {
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

function Spark({ data, color = "#4F46E5", w = 240, h = 80, fill, axis }: {
  data: number[]; color?: string; w?: number; h?: number; fill?: boolean; axis?: boolean;
}) {
  if (!data || !data.length) return <div style={{ width: w, height: h }} />;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const padX = 8, padY = 8;
  const innerW = w - padX * 2, innerH = h - padY * 2;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1 || 1)) * innerW + padX;
    const y = padY + innerH - ((v - min) / range) * innerH;
    return [x, y] as const;
  });
  const path = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const areaPath = path + ` L ${pts[pts.length - 1][0].toFixed(1)} ${h - padY} L ${pts[0][0].toFixed(1)} ${h - padY} Z`;
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      {axis && [0.25, 0.5, 0.75].map((p, i) => (
        <line key={i} x1={padX} x2={w - padX} y1={padY + innerH * p} y2={padY + innerH * p}
          stroke="var(--border-subtle)" strokeDasharray="2 3" />
      ))}
      {fill && <path d={areaPath} fill={color + "18"} />}
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map(([x, y], i) => i === pts.length - 1 ?
        <circle key={i} cx={x} cy={y} r="3" fill={color} stroke="#fff" strokeWidth="1.5" /> : null)}
    </svg>
  );
}

function Delta({ pct, dir = "down", positiveIsDown }: { pct: number; dir?: "up" | "down"; positiveIsDown?: boolean }) {
  const isGood = positiveIsDown ? dir === "down" : dir === "up";
  const tone = isGood ? "#15803D" : "#B91C1C";
  const bg = isGood ? "#F0FDF4" : "#FEF2F2";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      background: bg, color: tone,
      padding: "1px 7px", borderRadius: 99,
      fontSize: 11, fontWeight: 600,
      fontVariantNumeric: "tabular-nums",
    }}>
      <span style={{ fontSize: 10 }}>{dir === "down" ? "↓" : "↑"}</span>
      {pct}%
    </span>
  );
}

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
        <button style={subAddBtnStyle}>
          <Plus size={11} />Add client
        </button>
      </div>
    </aside>
  );
}

const subAddBtnStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "5px 10px", borderRadius: 7,
  background: "var(--brand-primary-50)", color: "var(--brand-primary)",
  border: "1px dashed var(--brand-primary-200)",
  fontSize: 11.5, fontWeight: 600, cursor: "pointer",
};

// ─── Detail header (avatar + tabs) ─────────────────────────────────────
const DETAIL_TABS = ["Overview", "Training", "Tasks", "Metrics", "Food Journal", "Meal Plan", "Settings"] as const;
type DetailTab = typeof DETAIL_TABS[number];

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

const iconBtnStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  width: 30, height: 30, padding: 0, border: "none", borderRadius: 7,
  background: "transparent", color: "var(--fg2)", cursor: "pointer",
};

// ─── Overview helpers ──────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid var(--border)",
      borderRadius: 12, boxShadow: "var(--shadow-sm)",
      padding: "16px 18px",
      ...style,
    }}>{children}</div>
  );
}

function CardTitle({ children, inline }: { children: React.ReactNode; inline?: boolean }) {
  return (
    <div style={{
      fontSize: 14.5, fontWeight: 600, color: "var(--fg1)",
      marginBottom: inline ? 0 : 14,
      letterSpacing: "-0.005em",
    }}>{children}</div>
  );
}

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

function MetricRow({ label, unit, data, color, deltaPct, dir, positiveIsDown }: {
  label: string; unit: string; data: number[]; color: string; deltaPct: number; dir: "up" | "down"; positiveIsDown?: boolean;
}) {
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
        <Delta pct={deltaPct} dir={dir} positiveIsDown={positiveIsDown} />
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

function RangeSelect() {
  return (
    <button style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "5px 11px", borderRadius: 7, border: "1px solid var(--border)",
      background: "#fff", fontSize: 12, color: "var(--fg2)", cursor: "pointer",
      fontWeight: 500,
    }}>
      Last 4 weeks <ChevronDown size={11} />
    </button>
  );
}

function SmallBtn({ icon: Icon, children, primary }: { icon?: React.ComponentType<{ size?: number }>; children: React.ReactNode; primary?: boolean }) {
  return (
    <button style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
      padding: "6px 11px", borderRadius: 7, cursor: "pointer",
      background: primary ? "var(--brand-primary)" : "#fff",
      color: primary ? "#fff" : "var(--fg1)",
      border: primary ? "none" : "1px solid var(--border)",
      fontSize: 12, fontWeight: 500, flex: 1,
    }}>
      {Icon && <Icon size={12} />}{children}
    </button>
  );
}

// ─── Overview tab ──────────────────────────────────────────────────────
function OverviewTab({ client }: { client: ClientDetail }) {
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
            <TrainStat label="LAST 7 DAYS"  done={client.train7d.done}  total={client.train7d.total}/>
            <TrainStat label="LAST 30 DAYS" done={client.train30d.done} total={client.train30d.total}/>
            <TrainStat label="NEXT WEEK"    done={client.nextWeek.done} total={client.nextWeek.total}
              color="#EAB308" emptyText="Not assigned yet"/>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "12px 14px", borderRadius: 8,
            background: "var(--bg)", border: "1px solid var(--border-subtle)",
          }}>
            <Dumbbell size={14} style={{ color: "var(--brand-primary)" }} />
            <div style={{ flex: 1, fontSize: 12.5, color: "var(--fg2)" }}>
              <span style={{ color: "var(--fg3)" }}>Last Workout: </span>
              <span style={{ color: "var(--fg1)", fontWeight: 600 }}>{client.lastWorkout.name}</span>
              <span style={{ color: "var(--fg4)" }}> · {client.lastWorkout.days === 0 ? "today" : `${client.lastWorkout.days}d ago`}</span>
            </div>
            <button style={{
              padding: "5px 11px", borderRadius: 7, border: "1px solid var(--border)",
              background: "#fff", color: "var(--fg1)", fontSize: 12, fontWeight: 500, cursor: "pointer",
            }}>Check Result</button>
          </div>
        </Card>

        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <CardTitle inline>Body Metrics Overview</CardTitle>
            <RangeSelect />
          </div>
          <MetricRow label="Weight"   unit="kg" data={client.metrics.weight} color="#4F46E5" deltaPct={1.5} dir="down" positiveIsDown />
          <div style={{ height: 1, background: "var(--border-subtle)", margin: "14px 0" }} />
          <MetricRow label="Body Fat" unit="%"  data={client.metrics.bf}     color="#EC4899" deltaPct={8}   dir="down" positiveIsDown />
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>📝</span>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--fg1)" }}>Notes</div>
            </div>
            <Edit size={13} style={{ color: "var(--fg4)", cursor: "pointer" }} />
          </div>
          {client.notes.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--fg4)" }}>No notes yet.</div>
          ) : client.notes.map((n, i) => (
            <div key={i} style={{
              borderLeft: "2px solid var(--brand-primary)",
              paddingLeft: 10, marginBottom: i < client.notes.length - 1 ? 10 : 0,
            }}>
              <div style={{ fontSize: 12.5, color: "var(--fg1)", lineHeight: 1.45, fontWeight: 500 }}>{n.text}</div>
              <div style={{ fontSize: 11, color: "var(--fg4)", marginTop: 3 }}>{n.date}</div>
            </div>
          ))}
        </Card>

        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>🩹</span>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--fg1)" }}>Limitations / Injuries</div>
            </div>
            <Edit size={13} style={{ color: "var(--fg4)", cursor: "pointer" }} />
          </div>
          {client.limitations.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--fg4)" }}>No limitations recorded.</div>
          ) : client.limitations.map((n, i) => (
            <div key={i} style={{
              borderLeft: "2px solid #EF4444",
              paddingLeft: 10, marginBottom: i < client.limitations.length - 1 ? 10 : 0,
            }}>
              <div style={{ fontSize: 12.5, color: "var(--fg1)", lineHeight: 1.45, fontWeight: 500 }}>{n.text}</div>
              <div style={{ fontSize: 11, color: "var(--fg4)", marginTop: 3 }}>{n.date}</div>
            </div>
          ))}
        </Card>

        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>📸</span>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--fg1)" }}>Progress Photos</div>
            </div>
          </div>
          {client.photos.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--fg4)" }}>No photos uploaded yet.</div>
          ) : (
            <>
              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                {client.photos.map((d, i) => (
                  <div key={i} style={{ flex: 1 }}>
                    <div style={{
                      aspectRatio: "3 / 4", width: "100%", borderRadius: 8,
                      background: "linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)",
                      border: "1px dashed var(--border-strong)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "var(--fg4)", fontSize: 10.5, fontFamily: "var(--font-mono)",
                    }}>progress {i + 1}</div>
                    <div style={{
                      fontSize: 11.5, color: "var(--fg2)", textAlign: "center",
                      marginTop: 5, fontWeight: 500,
                    }}>{d}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
                <SmallBtn icon={Search}>View All</SmallBtn>
                <SmallBtn icon={Sliders}>Compare</SmallBtn>
              </div>
            </>
          )}
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
            <SmallBtn icon={Msg}>Message</SmallBtn>
            <SmallBtn icon={Plus}>Assign</SmallBtn>
          </div>
          <ProfileRow icon="✉️" value={client.email} />
          <ProfileRow icon="📞" value={client.phone} />
          <ProfileRow icon="🏠" value={client.timezone} />
          <ProfileRow icon="📍" value={`Joined ${client.joined}`} />
        </Card>

        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--fg1)" }}>Updates</div>
            <button style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "4px 9px", borderRadius: 7, border: "1px solid var(--border)",
              background: "#fff", fontSize: 11.5, color: "var(--fg2)", cursor: "pointer",
            }}>
              Filter: All <ChevronDown size={11} />
            </button>
          </div>
          {client.updates.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--fg4)" }}>No recent updates.</div>
          ) : client.updates.map((u, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "10px 0", borderTop: i > 0 ? "1px solid var(--border-subtle)" : "none",
            }}>
              <ClientAvatar
                name={u.who === "You" ? "Coach R" : client.name}
                tone={u.who === "You" ? "#0F766E" : client.avatarTone}
                size={28}
              />
              <div style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: "var(--fg2)", lineHeight: 1.4 }}>
                <span style={{ color: "var(--fg1)", fontWeight: 600 }}>
                  {u.who === "You" ? "You" : client.name}
                </span>{" "}{u.text}
              </div>
              <div style={{ fontSize: 11, color: "var(--fg4)", flexShrink: 0, marginTop: 2 }}>{u.time}</div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ─── Metrics tab ───────────────────────────────────────────────────────
const METRIC_DEFS = [
  { key: "weight", label: "Weight",   unit: "kg", color: "#4F46E5", deltaPct: 1.5, dir: "down" as const, positiveIsDown: true,  group: "body" },
  { key: "bf",     label: "Body Fat", unit: "%",  color: "#EC4899", deltaPct: 8,   dir: "down" as const, positiveIsDown: true,  group: "body" },
  { key: "steps",  label: "Steps",    unit: "",   color: "#0D9488", deltaPct: 12,  dir: "up" as const,   positiveIsDown: false, group: "body" },
];

function MetricsTab({ client }: { client: ClientDetail }) {
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
                  const arr = (client.metrics as Record<string, number[]>)[m.key] || [];
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
                        <span style={{ color: "var(--fg3)" }}>{v == null ? "—" : "May 6, 2026"}</span>
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
              data={(client.metrics as Record<string, number[]>)[m.key] || []}
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

function MetricChartCard({ def, data, large }: {
  def: { label: string; unit: string; color: string; deltaPct: number; dir: "up" | "down"; positiveIsDown: boolean };
  data: number[]; large?: boolean;
}) {
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
          <Delta pct={def.deltaPct} dir={def.dir} positiveIsDown={def.positiveIsDown} />
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
          {["APR 13", "APR 18", "APR 23", "APR 28", "MAY 3", "MAY 8"].map((d) => <span key={d}>{d}</span>)}
        </div>
      )}
    </Card>
  );
}

// ─── Top-level Clients screen ──────────────────────────────────────────
const useMock = isMockFallbackEnv();

export default function ClientsScreen() {
  const [clients, setClients] = React.useState<ClientDetail[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState<DetailTab>("Overview");
  const [loading, setLoading] = React.useState(true);
  // Cache of progress arrays keyed by client id; merged into the
  // selected client's `metrics` so sparklines come from real logs.
  const [chartById, setChartById] = React.useState<Record<string, ClientDetail["metrics"]>>({});

  // Initial load: fetch the coach's clients (or fall back to fixtures
  // when no API URL is configured / API returns empty in dev).
  React.useEffect(() => {
    if (useMock) {
      const list = mockFallbackClients();
      setClients(list);
      setSelectedId(list[0]?.id ?? null);
      setLoading(false);
      return;
    }
    listClients()
      .then((rows) => {
        if (rows.length === 0) {
          // Empty backend → keep fixtures so the screen still demos.
          const list = mockFallbackClients();
          setClients(list);
          setSelectedId(list[0]?.id ?? null);
          return;
        }
        const mapped = rows.map((r) => toClientDetail(r));
        setClients(mapped);
        setSelectedId(mapped[0]?.id ?? null);
      })
      .catch((e) => {
        console.error(e);
        toast.error("Failed to load clients");
        const list = mockFallbackClients();
        setClients(list);
        setSelectedId(list[0]?.id ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Lazy-load progress chart for the selected client.
  React.useEffect(() => {
    if (useMock || !selectedId || chartById[selectedId]) return;
    // Skip fixture rows — real backend IDs are UUIDs (contain dashes).
    if (!selectedId.includes("-")) return;
    getClientChart(selectedId, 60)
      .then((logs) => {
        const sorted = [...logs].sort((a, b) => a.loggedDate.localeCompare(b.loggedDate));
        const weight = sorted.map((p) => p.weightKg).filter((v): v is string => !!v).map(Number);
        const bf = sorted.map((p) => p.bodyFatPercent).filter((v): v is string => !!v).map(Number);
        setChartById((prev) => ({ ...prev, [selectedId]: { weight, bf, steps: [] } }));
      })
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
        {tab === "Overview" && <OverviewTab client={client} />}
        {tab === "Metrics"  && <MetricsTab  client={client} />}
        {!["Overview", "Metrics"].includes(tab) && (
          <div style={{
            margin: "40px 28px", padding: "60px 20px",
            background: "#fff", border: "1px dashed var(--border)", borderRadius: 12,
            textAlign: "center", color: "var(--fg3)",
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg2)", marginBottom: 4 }}>{tab}</div>
            <div style={{ fontSize: 12.5 }}>This tab is part of the broader client roadmap — coming soon.</div>
          </div>
        )}
      </div>
    </div>
  );
}
