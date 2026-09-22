"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { Card, EmptyState } from "@/components/dashboard/primitives";
import { inputStyle } from "@/components/coach/chrome";
import Button from "@/components/ui/Button";
import { CheckSquare, Trash2 } from "lucide-react";
import { AdherenceBadge, formatDate } from "./ui";
import type { CheckIn } from "./types";

/** Aligns the reply block under the check-in title, past the icon tile. */
const REPLY_INDENT = 44;

export default function CheckInList({ checkIns, clientId, onChanged }: {
  checkIns: CheckIn[];
  clientId: string;
  onChanged: () => void;
}) {
  if (checkIns.length === 0) {
    return (
      <EmptyState
        icon={<CheckSquare size={22} />}
        title="No check-ins yet"
        hint={'Click "Add Check-in" to record one.'}
      />
    );
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {checkIns.map((ci) => (
        <CheckInCard key={ci.id} checkIn={ci} clientId={clientId} onChanged={onChanged} />
      ))}
    </div>
  );
}

/**
 * One check-in, with the coach's reply.
 *
 * Replying is the point: a client can submit a check-in from their portal, and
 * until now `coachNotes` could only be set when the coach created one — so a
 * client-submitted check-in was a message into a void. The portal has always
 * rendered the reply.
 */
function CheckInCard({ checkIn: ci, clientId, onChanged }: {
  checkIn: CheckIn;
  clientId: string;
  onChanged: () => void;
}) {
  const [replying, setReplying] = useState(false);
  const [text, setText] = useState(ci.coachNotes ?? "");
  const [busy, setBusy] = useState(false);

  async function saveReply() {
    setBusy(true);
    try {
      await api.put(`/api/v1/clients/${clientId}/check-ins/${ci.id}`, {
        coachNotes: text.trim(),
      });
      toast.success("Reply saved");
      setReplying(false);
      onChanged();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? "Couldn't save the reply");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm(`Remove the check-in from ${formatDate(ci.checkInDate)}?`)) return;
    try {
      await api.delete(`/api/v1/clients/${clientId}/check-ins/${ci.id}`);
      toast.success("Check-in removed");
      onChanged();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? "Couldn't remove the check-in");
    }
  }

  return (
    <Card>
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              background: "var(--brand-primary-50)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <CheckSquare size={15} style={{ color: "var(--brand-primary)" }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--fg1)" }}>
                {formatDate(ci.checkInDate)}
              </div>
              {ci.clientNotes && (
                <div style={{ fontSize: 11.5, color: "var(--fg3)", marginTop: 2 }}>{ci.clientNotes}</div>
              )}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <AdherenceBadge value={ci.adherencePercent} />
            <button
              onClick={remove}
              aria-label={`Remove check-in from ${formatDate(ci.checkInDate)}`}
              style={{
                padding: 6, borderRadius: 6, border: "none", background: "transparent",
                color: "var(--fg4)", cursor: "pointer", display: "inline-flex",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-subtle)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {replying ? (
          <div style={{ paddingLeft: REPLY_INDENT, display: "grid", gap: 8 }}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
              autoFocus
              aria-label="Reply to this check-in"
              placeholder="Your client sees this in their portal"
              style={{ ...inputStyle, resize: "none" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Button size="sm" variant="secondary" onClick={() => { setText(ci.coachNotes ?? ""); setReplying(false); }}>
                Cancel
              </Button>
              <Button size="sm" onClick={saveReply} loading={busy}>Save reply</Button>
            </div>
          </div>
        ) : ci.coachNotes ? (
          <div style={{
            paddingLeft: REPLY_INDENT, display: "flex",
            alignItems: "flex-start", justifyContent: "space-between", gap: 8,
          }}>
            <p style={{
              margin: 0, flex: 1, fontSize: 11.5,
              color: "var(--brand-primary-hover)", background: "var(--brand-primary-50)",
              borderRadius: 6, padding: "6px 10px",
            }}>
              <span style={{ fontWeight: 600 }}>You:</span> {ci.coachNotes}
            </p>
            <button
              onClick={() => setReplying(true)}
              style={{
                border: "none", background: "transparent", cursor: "pointer",
                fontSize: 11.5, color: "var(--fg4)", flexShrink: 0, paddingTop: 6,
              }}
            >
              Edit
            </button>
          </div>
        ) : (
          <div style={{ paddingLeft: REPLY_INDENT }}>
            <button
              onClick={() => setReplying(true)}
              style={{
                border: "none", background: "transparent", cursor: "pointer", padding: 0,
                fontSize: 11.5, fontWeight: 600, color: "var(--brand-primary)",
              }}
            >
              Reply to this check-in
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
