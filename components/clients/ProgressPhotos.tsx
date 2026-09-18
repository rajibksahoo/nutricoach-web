"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import type { ClientPhoto } from "./data";

/**
 * Progress Photos for one client: the three most recent on the card, the rest
 * behind View All.
 *
 * Every URL here is a pre-signed S3 link that expires after 60 minutes, and in
 * local dev `S3Service` hands back a dummy host that never resolves at all — so
 * a broken image is a normal state, not an error, and each tile falls back to a
 * labelled placeholder rather than a browser's broken-image glyph.
 */

const CARD_THUMBNAILS = 3;

function fmtDay(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
    day: "numeric", month: "short",
  });
}

function fmtFullDay(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
}

/** A thumbnail that degrades to a placeholder when the URL will not load. */
function PhotoTile({ photo }: { photo: ClientPhoto }) {
  const [failed, setFailed] = React.useState(false);

  const frame: React.CSSProperties = {
    aspectRatio: "3 / 4", width: "100%", borderRadius: 8,
    overflow: "hidden", display: "block",
  };

  if (failed) {
    return (
      <div style={{
        ...frame,
        background: "linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)",
        border: "1px dashed var(--border-strong)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--fg4)", fontSize: 10.5, fontFamily: "var(--font-mono)",
      }}>{photo.photoType.toLowerCase()}</div>
    );
  }

  return (
    <img
      src={photo.downloadUrl}
      alt={`${photo.photoType.toLowerCase()} photo from ${fmtFullDay(photo.loggedDate)}`}
      onError={() => setFailed(true)}
      style={{ ...frame, objectFit: "cover", border: "1px solid var(--border)" }}
    />
  );
}

function ViewAllModal({ photos, onClose }: { photos: ClientPhoto[]; onClose: () => void }) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Already newest-first from the API; group runs of the same log date.
  const groups: { date: string; items: ClientPhoto[] }[] = [];
  for (const photo of photos) {
    const last = groups[groups.length - 1];
    if (last && last.date === photo.loggedDate) last.items.push(photo);
    else groups.push({ date: photo.loggedDate, items: [photo] });
  }

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 90, background: "rgba(15,23,42,.45)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-label="All progress photos" style={{
        width: 720, maxWidth: "100%", maxHeight: "calc(100vh - 48px)",
        background: "#fff", borderRadius: 14,
        boxShadow: "0 30px 80px rgba(15,23,42,.32)",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <div style={{
          padding: "18px 22px 14px", borderBottom: "1px solid var(--border-subtle)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <h2 style={{
            font: "700 17px var(--font-display-xl)", margin: 0,
            letterSpacing: "-0.02em", color: "var(--fg1)",
          }}>Progress Photos</h2>
          <button onClick={onClose} aria-label="Close" style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 30, height: 30, padding: 0, border: "none", borderRadius: 7,
            background: "transparent", color: "var(--fg2)", cursor: "pointer",
          }}><X size={15} /></button>
        </div>

        <div style={{ overflowY: "auto", padding: "16px 22px 22px" }}>
          {groups.map((group) => (
            <div key={group.date} style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 10, fontWeight: 700, color: "var(--fg4)",
                textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8,
              }}>{fmtFullDay(group.date)}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                {group.items.map((photo) => (
                  <div key={photo.id}>
                    <PhotoTile photo={photo} />
                    <div style={{
                      fontSize: 11, color: "var(--fg3)", textAlign: "center",
                      marginTop: 4, textTransform: "capitalize",
                    }}>{photo.photoType.toLowerCase()}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * `photos` is undefined until the fetch resolves. That distinction matters:
 * defaulting to an empty array made the card flash "No photos uploaded yet."
 * on every client before the real photos arrived.
 */
export default function ProgressPhotos({ photos }: { photos?: ClientPhoto[] }) {
  const [viewAll, setViewAll] = React.useState(false);
  const loading = photos === undefined;
  const items = photos ?? [];
  const recent = items.slice(0, CARD_THUMBNAILS);

  return (
    <>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>📸</span>
          <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--fg1)" }}>Progress Photos</div>
        </div>
      </div>

      {loading ? (
        <div style={{ fontSize: 12, color: "var(--fg4)" }}>Loading photos…</div>
      ) : items.length === 0 ? (
        <div style={{ fontSize: 12, color: "var(--fg4)" }}>No photos uploaded yet.</div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            {recent.map((photo) => (
              <div key={photo.id} style={{ flex: 1, minWidth: 0 }}>
                <PhotoTile photo={photo} />
                <div style={{
                  fontSize: 11.5, color: "var(--fg2)", textAlign: "center",
                  marginTop: 5, fontWeight: 500,
                }}>{fmtDay(photo.loggedDate)}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
            <button onClick={() => setViewAll(true)} style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "6px 11px", borderRadius: 7,
              border: "1px solid var(--border)", background: "#fff",
              fontSize: 12, color: "var(--fg2)", cursor: "pointer",
            }}>
              <Search size={12} />
              View All{items.length > CARD_THUMBNAILS ? ` (${items.length})` : ""}
            </button>
          </div>
        </>
      )}

      {viewAll && <ViewAllModal photos={items} onClose={() => setViewAll(false)} />}
    </>
  );
}
