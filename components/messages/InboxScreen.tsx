"use client";

import * as React from "react";
import toast from "react-hot-toast";
import {
  Search, Send, Edit, MoreHorizontal as MoreH, ChevronDown,
  Video, Activity, Bookmark, Clock,
} from "lucide-react";
import { CLIENT_DETAILS, type ClientDetail } from "@/components/clients/data";
import {
  listConversations, getThread, sendMessage, isMockFallbackEnv,
  toneFromId, fmtRelative, fmtMessageDate, fmtMessageTime,
  type ConversationSummary, type BackendMessage,
} from "@/lib/messaging-api";

interface ThreadMsg {
  d: string;
  side: "in" | "out";
  text: string;
  time: string;
}

interface Thread {
  id: string;
  clientId: string;
  lastDate: string;
  preview: string;
  unread: number;
  msgs: ThreadMsg[];
}

const FALLBACK_THREADS: Thread[] = [
  {
    id: "c1", clientId: "c1", lastDate: "Mar 31",
    preview: "Sounds good — see you Tuesday!",
    unread: 0, msgs: [
      { d: "Mon, 27 Nov 2023", side: "in",  text: "Hey hey, just a reminder that I will be out of town for a wedding next week!", time: "03:10 PM" },
      { d: "Mon, 27 Nov 2023", side: "out", text: "Ok, thanks Priya. Want me to pre-load 2 hotel-friendly sessions?", time: "03:14 PM" },
      { d: "Tue, 31 Mar 2026", side: "in",  text: "Yes please 🙏 also sending Friday's check-in late.", time: "11:18 PM" },
      { d: "Tue, 31 Mar 2026", side: "out", text: "Got it. Pushed Day 4/5 with bands only.", time: "11:32 PM" },
    ],
  },
  { id: "c2", clientId: "c2", lastDate: "Just now", preview: "PR! Bench 80 × 5 🎉", unread: 2, msgs: [
    { d: "Wed, 6 May 2026", side: "in", text: "Bench felt insane today.", time: "08:40 AM" },
    { d: "Wed, 6 May 2026", side: "in", text: "PR! Bench 80 × 5 🎉", time: "08:42 AM" },
  ]},
  { id: "c3", clientId: "c3", lastDate: "1d", preview: "Thinking of moving to bi-weekly cadence next month.", unread: 0, msgs: [
    { d: "Tue, 5 May 2026", side: "in",  text: "Quick thought — feeling really steady. Wonder if bi-weekly check-ins make sense?", time: "06:22 PM" },
    { d: "Tue, 5 May 2026", side: "out", text: "Totally fine. Let's revisit on Saturday's call.", time: "06:40 PM" },
  ]},
  { id: "c4", clientId: "c4", lastDate: "4d", preview: "Filled out the PAR-Q form.", unread: 1, msgs: [
    { d: "Sat, 2 May 2026", side: "in", text: "Filled out the PAR-Q form.", time: "10:05 AM" },
  ]},
  { id: "c5", clientId: "c5", lastDate: "3h", preview: "Cycle log submitted ✅", unread: 0, msgs: [
    { d: "Wed, 6 May 2026", side: "in",  text: "Cycle log submitted ✅", time: "04:01 PM" },
    { d: "Wed, 6 May 2026", side: "out", text: "Nice. Bumping protein +10g for next 2 weeks.", time: "04:18 PM" },
  ]},
];

// ─── Map backend types → render-shape ─────────────────────────────────
function conversationToThread(c: ConversationSummary, msgs: BackendMessage[] = []): Thread {
  return {
    id: c.clientId,
    clientId: c.clientId,
    lastDate: c.lastMessageAt ? fmtRelative(c.lastMessageAt) : "",
    preview: c.lastMessage || "",
    unread: c.unreadCount || 0,
    msgs: msgs.map(messageToThreadMsg),
  };
}

function messageToThreadMsg(m: BackendMessage): ThreadMsg {
  return {
    d: fmtMessageDate(m.sentAt),
    side: m.senderType === "COACH" ? "out" : "in",
    text: m.content,
    time: fmtMessageTime(m.sentAt),
  };
}

function InboxAvatar({ name, tone = "#4F46E5", size = 36 }: { name: string; tone?: string; size?: number }) {
  const initials = (name || "?").split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("");
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: tone + "22", color: tone, border: `1px solid ${tone}55`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 600, fontSize: Math.round(size * 0.36), flexShrink: 0,
    }}>{initials}</div>
  );
}

const ibBtn: React.CSSProperties = {
  width: 30, height: 30, padding: 0, border: "none", borderRadius: 6,
  background: "transparent", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
  color: "var(--fg3)",
};

type EnrichedThread = Thread & { client: ClientDetail | { name: string; avatarTone: string; timezone?: string; notes?: ClientDetail["notes"]; updates?: ClientDetail["updates"] } };

const useMock = isMockFallbackEnv();

// In dev fallback the "client" lookup uses CLIENT_DETAILS (rich notes
// + updates). For real backend rows we synthesize a minimal client
// from the conversation row + a deterministic avatar tone.
function fallbackClient(name: string, clientId: string) {
  return { name, avatarTone: toneFromId(clientId) } as { name: string; avatarTone: string };
}

export default function InboxScreen() {
  const [conversations, setConversations] = React.useState<ConversationSummary[]>([]);
  const [threads, setThreads] = React.useState<Thread[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<"All" | "Unread" | "Groups">("All");
  const [q, setQ] = React.useState("");
  const [draft, setDraft] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  // ─── Initial load: conversations ────────────────────────────────────
  const refreshConversations = React.useCallback(async () => {
    if (useMock) {
      setThreads(FALLBACK_THREADS);
      setActiveId((prev) => prev ?? FALLBACK_THREADS[0]?.id ?? null);
      return;
    }
    try {
      const list = await listConversations();
      setConversations(list);
      // Preserve any already-fetched message arrays on refresh so the
      // active thread doesn't blank out while the list updates.
      setThreads((prev) => {
        const byId = new Map(prev.map((t) => [t.clientId, t.msgs]));
        return list.map((c) => ({ ...conversationToThread(c, []), msgs: byId.get(c.clientId) || [] }));
      });
      setActiveId((prev) => prev ?? list[0]?.clientId ?? null);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load conversations");
      setThreads(FALLBACK_THREADS);
      setActiveId((prev) => prev ?? FALLBACK_THREADS[0]?.id ?? null);
    }
  }, []);

  React.useEffect(() => {
    refreshConversations().finally(() => setLoading(false));
  }, [refreshConversations]);

  // ─── Lazy-load thread messages on selection ────────────────────────
  React.useEffect(() => {
    if (useMock || !activeId) return;
    let cancelled = false;
    getThread(activeId)
      .then((msgs) => {
        if (cancelled) return;
        setThreads((prev) => prev.map((t) =>
          t.clientId === activeId ? { ...t, msgs: msgs.map(messageToThreadMsg), unread: 0 } : t,
        ));
      })
      .catch((e) => {
        console.error(e);
        if (!cancelled) toast.error("Failed to load messages");
      });
    return () => { cancelled = true; };
  }, [activeId]);

  // ─── Enrich for render ──────────────────────────────────────────────
  const enriched: EnrichedThread[] = threads.map((t) => {
    if (useMock) {
      const c = CLIENT_DETAILS.find((cl) => cl.id === t.clientId);
      if (c) return { ...t, client: c };
    }
    const summary = conversations.find((s) => s.clientId === t.clientId);
    return { ...t, client: fallbackClient(summary?.clientName || "Client", t.clientId) };
  });

  const filtered = enriched.filter((t) => {
    if (filter === "Unread" && !t.unread) return false;
    if (q && !t.client.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  const active = enriched.find((t) => t.id === activeId) || enriched[0];

  const byDate = (active?.msgs || []).reduce<Record<string, ThreadMsg[]>>((acc, m) => {
    (acc[m.d] = acc[m.d] || []).push(m);
    return acc;
  }, {});

  const totalUnread = threads.reduce((s, t) => s + t.unread, 0);

  // ─── Send a message ─────────────────────────────────────────────────
  const handleSend = async () => {
    const body = draft.trim();
    if (!body || !active || sending) return;
    if (useMock) {
      // Just append locally so the screen demos.
      const now = new Date().toISOString();
      const m: ThreadMsg = { d: fmtMessageDate(now), side: "out", text: body, time: fmtMessageTime(now) };
      setThreads((prev) => prev.map((t) => t.clientId === active.clientId
        ? { ...t, msgs: [...t.msgs, m], preview: body, lastDate: "Just now" } : t));
      setDraft("");
      return;
    }
    setSending(true);
    try {
      const sent = await sendMessage(active.clientId, body);
      const m = messageToThreadMsg(sent);
      setThreads((prev) => prev.map((t) => t.clientId === active.clientId
        ? { ...t, msgs: [...t.msgs, m], preview: sent.content, lastDate: "Just now" } : t));
      setDraft("");
      // Refresh the conversations list so other rows' lastMessageAt etc stay accurate.
      refreshConversations();
    } catch (e) {
      console.error(e);
      toast.error("Failed to send");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "var(--bg)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--fg3)", fontSize: 13,
      }}>
        Loading conversations…
      </div>
    );
  }

  if (!active) {
    return (
      <div style={{
        minHeight: "100vh", background: "var(--bg)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 8, color: "var(--fg3)",
      }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--fg2)" }}>No conversations yet</div>
        <div style={{ fontSize: 12.5 }}>Add a client to start messaging.</div>
      </div>
    );
  }

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "320px 1fr 320px",
      minHeight: "100vh", background: "var(--bg)",
    }}>
      {/* Sub-pane: conversation list */}
      <aside style={{
        background: "#fff", borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{
          padding: "22px 22px 14px", display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <h2 style={{
            fontFamily: "var(--font-display-xl)", fontSize: 24, fontWeight: 700,
            letterSpacing: "-0.02em", margin: 0, color: "var(--fg1)",
          }}>Inbox</h2>
          <div style={{ display: "flex", gap: 6 }}>
            <button title="Broadcast" style={{
              position: "relative", width: 34, height: 34, padding: 0, border: "1px solid var(--border)",
              borderRadius: 8, background: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg2)",
            }}>
              <Send size={14} />
              <span style={{
                position: "absolute", top: -4, right: -4, width: 14, height: 14, borderRadius: 7,
                background: "#F97316", color: "#fff", fontSize: 9, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>↑</span>
            </button>
            <button title="Compose" style={{
              width: 34, height: 34, padding: 0, border: "1px solid var(--border)",
              borderRadius: 8, background: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg2)",
            }}><Edit size={14} /></button>
          </div>
        </div>

        <div style={{
          padding: "4px 22px 12px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{
            fontSize: 11, fontWeight: 700, color: "var(--fg3)",
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            My Messages ({totalUnread})
          </span>
          <button title="Search" onClick={() => setQ("")} style={{
            width: 26, height: 26, padding: 0, border: "none", borderRadius: 6,
            background: "transparent", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg3)",
          }}><Search size={13} /></button>
        </div>

        <div style={{ padding: "0 16px 6px", display: "flex", gap: 6 }}>
          {(["All", "Unread", "Groups"] as const).map((f) => {
            const on = filter === f;
            return (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "6px 14px", borderRadius: 99,
                border: on ? "none" : "1px solid var(--border)",
                background: on ? "var(--brand-primary-100)" : "#fff",
                color: on ? "var(--brand-primary)" : "var(--fg2)",
                fontSize: 12, fontWeight: on ? 600 : 500, cursor: "pointer",
              }}>{f}</button>
            );
          })}
        </div>

        <div style={{ padding: "0 16px 8px" }}>
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name…"
            style={{
              width: "100%", padding: "7px 11px", marginTop: 8,
              border: "1px solid var(--border)", borderRadius: 7,
              fontSize: 12.5, background: "#fff", outline: "none",
            }}
          />
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "4px 8px 16px" }}>
          {filtered.length === 0 && (
            <div style={{ padding: "24px 14px", textAlign: "center", color: "var(--fg4)", fontSize: 12 }}>
              No conversations.
            </div>
          )}
          {filtered.map((t) => {
            const on = activeId === t.id;
            return (
              <button
                key={t.id} onClick={() => setActiveId(t.id)}
                style={{
                  width: "100%", display: "flex", alignItems: "flex-start", gap: 11,
                  padding: "11px 12px", borderRadius: 9, border: "none",
                  background: on ? "var(--brand-primary-50)" : "transparent",
                  cursor: "pointer", textAlign: "left", marginBottom: 2,
                  position: "relative",
                }}
                onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = "var(--bg)"; }}
                onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = "transparent"; }}
              >
                {on && <span style={{
                  position: "absolute", left: 0, top: 8, bottom: 8, width: 3,
                  background: "var(--brand-primary)", borderRadius: "0 3px 3px 0",
                }} />}
                <InboxAvatar name={t.client.name} tone={t.client.avatarTone} size={40} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "baseline", gap: 6, marginBottom: 2,
                  }}>
                    <div style={{
                      fontSize: 13.5, fontWeight: t.unread ? 700 : 600,
                      color: on ? "var(--brand-primary)" : "var(--fg1)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>{t.client.name}</div>
                    <div style={{
                      fontSize: 11, color: t.unread ? "var(--brand-primary)" : "var(--fg4)",
                      fontWeight: t.unread ? 600 : 400, flexShrink: 0,
                    }}>{t.lastDate}</div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                    <div style={{
                      fontSize: 12, color: t.unread ? "var(--fg1)" : "var(--fg3)",
                      fontWeight: t.unread ? 500 : 400,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
                    }}>{t.preview}</div>
                    {!!t.unread && (
                      <span style={{
                        background: "var(--brand-primary)", color: "#fff",
                        fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 99, flexShrink: 0,
                        minWidth: 18, textAlign: "center",
                      }}>{t.unread}</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Thread */}
      <section style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header style={{
          padding: "18px 24px", borderBottom: "1px solid var(--border)",
          background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <InboxAvatar name={active.client.name} tone={active.client.avatarTone} size={36} />
            <div>
              <div style={{
                fontSize: 16, fontWeight: 600, color: "var(--fg1)", letterSpacing: "-0.01em",
              }}>{active.client.name}</div>
              <div style={{ fontSize: 11.5, color: "var(--fg3)", marginTop: 1 }}>
                <span style={{
                  display: "inline-block", width: 6, height: 6, borderRadius: "50%",
                  background: "#22C55E", marginRight: 5,
                }} />
                Active now · {active.client.timezone || "Asia/Kolkata"}
              </div>
            </div>
          </div>
          <button title="More" style={{
            width: 32, height: 32, padding: 0, border: "none", borderRadius: 7,
            background: "transparent", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg3)",
          }}><MoreH size={16} /></button>
        </header>

        <div style={{
          flex: 1, overflowY: "auto", padding: "20px 28px",
          display: "flex", flexDirection: "column", gap: 18, background: "#FAFBFC",
        }}>
          {Object.entries(byDate).map(([date, msgs]) => (
            <React.Fragment key={date}>
              <div style={{
                textAlign: "center", color: "var(--fg4)", fontSize: 11.5,
                fontWeight: 500, margin: "4px 0", letterSpacing: "0.01em",
              }}>{date}</div>
              {msgs.map((m, i) => (
                <div key={i} style={{
                  display: "flex", gap: 10,
                  flexDirection: m.side === "out" ? "row-reverse" : "row",
                  alignItems: "flex-end",
                }}>
                  <InboxAvatar
                    name={m.side === "out" ? "Coach Rajib" : active.client.name}
                    tone={m.side === "out" ? "#0F766E" : active.client.avatarTone}
                    size={28}
                  />
                  <div style={{
                    maxWidth: "min(560px, 70%)",
                    display: "flex", flexDirection: "column",
                    alignItems: m.side === "out" ? "flex-end" : "flex-start", gap: 3,
                  }}>
                    <div style={{
                      padding: "10px 14px", borderRadius: 14,
                      background: m.side === "out" ? "var(--brand-primary)" : "#fff",
                      color: m.side === "out" ? "#fff" : "var(--fg1)",
                      border: m.side === "out" ? "none" : "1px solid var(--border)",
                      borderBottomRightRadius: m.side === "out" ? 4 : 14,
                      borderBottomLeftRadius: m.side === "out" ? 14 : 4,
                      fontSize: 13.5, lineHeight: 1.45,
                      boxShadow: m.side === "out" ? "none" : "var(--shadow-sm)",
                      wordWrap: "break-word",
                    }}>{m.text}</div>
                    <span style={{
                      fontSize: 10.5, color: "var(--fg4)", fontVariantNumeric: "tabular-nums",
                    }}>{m.time}</span>
                  </div>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>

        <footer style={{
          padding: "12px 20px 18px", background: "#fff",
          borderTop: "1px solid var(--border)",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 12px", borderRadius: 24,
            background: "var(--bg)", border: "1px solid var(--border)",
          }}>
            <div style={{ display: "flex", gap: 4, color: "var(--fg3)" }}>
              <button title="Photo" style={ibBtn}><Video size={15} /></button>
              <button title="Voice" style={ibBtn}><Activity size={15} /></button>
              <button title="GIF" style={{
                ...ibBtn, fontFamily: "var(--font-mono)",
                fontSize: 10.5, fontWeight: 700, color: "var(--fg2)",
              }}>GIF</button>
              <button title="Saved" style={{ ...ibBtn, position: "relative" }}>
                <Bookmark size={15} />
                <span style={{
                  position: "absolute", top: 0, right: 0, width: 8, height: 8, borderRadius: "50%",
                  background: "#F97316", border: "2px solid var(--bg)",
                }} />
              </button>
            </div>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
              placeholder="Type message here…"
              disabled={sending}
              style={{
                flex: 1, padding: "6px 4px", border: "none", outline: "none",
                background: "transparent", fontSize: 13.5, color: "var(--fg1)",
              }}
            />
            <button
              title="Send" onClick={handleSend} disabled={!draft.trim() || sending}
              style={{
                width: 36, height: 36, padding: 0, border: "none", borderRadius: "50%",
                background: "var(--brand-primary)", color: "#fff",
                cursor: !draft.trim() || sending ? "not-allowed" : "pointer",
                opacity: !draft.trim() || sending ? 0.5 : 1,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}><Send size={15} /></button>
          </div>
        </footer>
      </section>

      {/* Right: Profile / Notes / Updates */}
      <aside style={{
        background: "#fff", borderLeft: "1px solid var(--border)",
        padding: "22px 22px 24px", overflowY: "auto",
      }}>
        <div style={{ textAlign: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
            <InboxAvatar name={active.client.name} tone={active.client.avatarTone} size={84} />
          </div>
          <div style={{
            fontFamily: "var(--font-display-xl)", fontSize: 17, fontWeight: 700,
            letterSpacing: "-0.02em", color: "var(--fg1)",
          }}>{active.client.name}</div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            marginTop: 6, color: "var(--fg3)", fontSize: 11.5,
          }}>
            <Clock size={11} />{active.client.timezone || "11:05 AM (GMT-07:00)"}
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 14, marginBottom: 14 }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10,
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg1)" }}>
              Notes ({(active.client.notes || []).length || 2})
            </div>
            <Edit size={13} style={{ color: "var(--fg4)", cursor: "pointer" }} />
          </div>
          {((active.client.notes && active.client.notes.length)
            ? active.client.notes
            : [
                { text: "Goes to Barry's bootcamp and Soul Cycle once a week with friends", date: "Nov 27, 2023 · 3:10 PM" },
                { text: "She is a vegan and has gluten intolerance", date: "Nov 22, 2023 · 3:10 PM" },
              ]
          ).map((n, i, arr) => (
            <div key={i} style={{
              borderLeft: "2px solid var(--brand-primary)",
              paddingLeft: 10, marginBottom: i < arr.length - 1 ? 12 : 0,
            }}>
              <div style={{ fontSize: 12.5, color: "var(--fg1)", lineHeight: 1.45, fontWeight: 500 }}>
                {n.text}
              </div>
              <div style={{ fontSize: 11, color: "var(--fg4)", marginTop: 3 }}>{n.date}</div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 14 }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10,
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg1)" }}>Updates</div>
            <button style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "4px 9px", borderRadius: 7, border: "1px solid var(--border)",
              background: "#fff", fontSize: 11.5, color: "var(--fg2)", cursor: "pointer",
            }}>Filter: All <ChevronDown size={11} /></button>
          </div>
          {(active.client.updates || [
            { who: active.client.name, text: "logged a workout for Mon 11/27", time: "2y" },
            { who: active.client.name, text: "logged a workout for Mon 11/20", time: "2y" },
            { who: active.client.name, text: "added a progress photo", time: "2y" },
            { who: active.client.name, text: "added a progress photo", time: "2y" },
          ]).map((u, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "10px 0",
              borderTop: i > 0 ? "1px solid var(--border-subtle)" : "none",
            }}>
              <InboxAvatar
                name={u.who === "You" ? "Coach R" : (u.who || active.client.name)}
                tone={u.who === "You" ? "#0F766E" : active.client.avatarTone}
                size={26}
              />
              <div style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: "var(--fg2)", lineHeight: 1.4 }}>
                <span style={{ color: "var(--fg1)", fontWeight: 600 }}>
                  {u.who === "You" ? "You" : (u.who || active.client.name)}
                </span>{" "}{u.text}
              </div>
              <div style={{ fontSize: 11, color: "var(--fg4)", flexShrink: 0, marginTop: 1 }}>{u.time}</div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
