"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import toast from "react-hot-toast";
import {
  listCoachNotes, createCoachNote, updateCoachNote, deleteCoachNote,
  type CoachNote,
} from "@/lib/clients-api";

/**
 * Coach-authored notes on a client.
 *
 * The card existed as a permanent "No notes yet." — the backing table only
 * landed with this component, so there was never a way to write one.
 */

function fmtWhen(iso: string | undefined) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric", month: "short", year: "numeric",
  });
}

const iconButton: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  width: 22, height: 22, padding: 0, border: "none", borderRadius: 5,
  background: "transparent", color: "var(--fg4)", cursor: "pointer",
};

function Editor({ initial, busy, onCancel, onSave }: {
  initial: string; busy: boolean; onCancel: () => void; onSave: (body: string) => void;
}) {
  const [text, setText] = React.useState(initial);
  const ref = React.useRef<HTMLTextAreaElement>(null);
  React.useEffect(() => { ref.current?.focus(); }, []);

  return (
    <div style={{ marginBottom: 10 }}>
      <textarea
        ref={ref}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        aria-label="Note text"
        placeholder="e.g. Prefers morning sessions — travels most Fridays"
        style={{
          width: "100%", padding: "8px 10px", border: "1px solid var(--border)",
          borderRadius: 8, fontSize: 12.5, color: "var(--fg1)", outline: "none",
          fontFamily: "var(--font-sans)", resize: "vertical",
        }} />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 6 }}>
        <button onClick={onCancel} disabled={busy} aria-label="Cancel note" style={{
          ...iconButton, width: 26, height: 26,
          border: "1px solid var(--border)", color: "var(--fg3)",
        }}><X size={13} /></button>
        <button onClick={() => onSave(text)} disabled={busy || !text.trim()}
          aria-label="Save note" style={{
            ...iconButton, width: 26, height: 26,
            background: text.trim() && !busy ? "var(--brand-primary)" : "var(--bg-subtle)",
            color: text.trim() && !busy ? "#fff" : "var(--fg4)",
            cursor: text.trim() && !busy ? "pointer" : "not-allowed",
          }}><Check size={13} /></button>
      </div>
    </div>
  );
}

export default function CoachNotesCard({ clientId }: { clientId: string }) {
  const [notes, setNotes] = React.useState<CoachNote[] | null>(null);
  const [adding, setAdding] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    setNotes(null);
    setAdding(false);
    setEditingId(null);
    listCoachNotes(clientId)
      .then((rows) => { if (!cancelled) setNotes(rows); })
      .catch((e) => {
        console.error(e);
        if (cancelled) return;
        toast.error("Failed to load notes");
        setNotes([]);
      });
    return () => { cancelled = true; };
  }, [clientId]);

  const add = async (body: string) => {
    setBusy(true);
    try {
      const created = await createCoachNote(clientId, body.trim());
      setNotes((prev) => [created, ...(prev ?? [])]);
      setAdding(false);
      toast.success("Note added");
    } catch (e) {
      console.error(e);
      toast.error("Failed to add note");
    } finally { setBusy(false); }
  };

  const edit = async (noteId: string, body: string) => {
    setBusy(true);
    try {
      const saved = await updateCoachNote(clientId, noteId, body.trim());
      setNotes((prev) => (prev ?? []).map((n) => (n.id === noteId ? saved : n)));
      setEditingId(null);
      toast.success("Note updated");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update note");
    } finally { setBusy(false); }
  };

  // Optimistic with rollback, matching the other cards on this screen.
  const remove = async (noteId: string) => {
    const prev = notes;
    setNotes((rows) => (rows ?? []).filter((n) => n.id !== noteId));
    try {
      await deleteCoachNote(clientId, noteId);
      toast.success("Note deleted");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete note");
      setNotes(prev);
    }
  };

  const rows = notes ?? [];

  return (
    <>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>📝</span>
          <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--fg1)" }}>Notes</div>
        </div>
        <button onClick={() => { setAdding(true); setEditingId(null); }}
          aria-label="Add note" disabled={notes === null} style={iconButton}>
          <Plus size={14} />
        </button>
      </div>

      {adding && <Editor initial="" busy={busy} onCancel={() => setAdding(false)} onSave={add} />}

      {notes === null ? (
        <div style={{ fontSize: 12, color: "var(--fg4)" }}>Loading notes…</div>
      ) : rows.length === 0 && !adding ? (
        <div style={{ fontSize: 12, color: "var(--fg4)" }}>No notes yet.</div>
      ) : (
        rows.map((n, i) => (
          <div key={n.id} style={{
            borderLeft: "2px solid var(--brand-primary)",
            paddingLeft: 10, marginBottom: i < rows.length - 1 ? 10 : 0,
          }}>
            {editingId === n.id ? (
              <Editor initial={n.body ?? ""} busy={busy}
                onCancel={() => setEditingId(null)}
                onSave={(body) => edit(n.id!, body)} />
            ) : (
              <>
                <div style={{
                  fontSize: 12.5, color: "var(--fg1)", lineHeight: 1.45,
                  fontWeight: 500, whiteSpace: "pre-wrap",
                }}>{n.body}</div>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 3,
                }}>
                  <span style={{ fontSize: 11, color: "var(--fg4)" }}>{fmtWhen(n.createdAt)}</span>
                  <span style={{ display: "flex", gap: 2 }}>
                    <button onClick={() => { setEditingId(n.id!); setAdding(false); }}
                      aria-label={`Edit note from ${fmtWhen(n.createdAt)}`} style={iconButton}>
                      <Pencil size={12} />
                    </button>
                    <button onClick={() => remove(n.id!)}
                      aria-label={`Delete note from ${fmtWhen(n.createdAt)}`} style={iconButton}>
                      <Trash2 size={12} />
                    </button>
                  </span>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </>
  );
}
