"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { Card, CardTitle, EmptyState, Shimmer } from "@/components/dashboard/primitives";
import { inputStyle } from "@/components/coach/chrome";
import Button from "@/components/ui/Button";
import { Camera, Trash2 } from "lucide-react";
import { formatDate } from "./ui";
import type { Photo, ProgressLog } from "./types";

export default function PhotosPanel({
  clientId, logs, selectedLogId, onSelectLog, photos, loadingPhotos, onDeletePhoto,
}: {
  clientId: string;
  logs: ProgressLog[];
  selectedLogId: string | null;
  onSelectLog: (id: string) => void;
  photos: Photo[];
  loadingPhotos: boolean;
  onDeletePhoto: (id: string) => void;
}) {
  if (logs.length === 0) {
    return (
      <EmptyState
        icon={<Camera size={22} />}
        title="No progress logs yet"
        hint="Log progress first to attach photos."
      />
    );
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <CardTitle>Select a progress log</CardTitle>
        <select
          value={selectedLogId ?? ""}
          onChange={(e) => onSelectLog(e.target.value)}
          style={inputStyle}
        >
          <option value="">-- Choose a date --</option>
          {logs.map((l) => (
            <option key={l.id} value={l.id}>
              {formatDate(l.loggedDate)}{l.weightKg != null ? ` · ${l.weightKg} kg` : ""}
            </option>
          ))}
        </select>
      </Card>

      {selectedLogId && (
        loadingPhotos ? (
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12,
          }}>
            {[0, 1, 2].map((i) => <Shimmer key={i} h={180} radius={12} />)}
          </div>
        ) : photos.length === 0 ? (
          <EmptyState
            icon={<Camera size={22} />}
            title="No photos for this log yet"
            hint={'Use "Upload Photo" above to add one.'}
          />
        ) : (
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12,
          }}>
            {photos.map((p) => (
              <PhotoCard
                key={p.id}
                photo={p}
                clientId={clientId}
                logId={selectedLogId}
                onDeleted={() => onDeletePhoto(p.id)}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}

function PhotoCard({ photo, clientId, logId, onDeleted }: {
  photo: Photo; clientId: string; logId: string; onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [hover, setHover] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this photo?")) return;
    setDeleting(true);
    try {
      await api.delete(`/api/v1/clients/${clientId}/progress/${logId}/photos/${photo.id}`);
      toast.success("Photo deleted");
      onDeleted();
    } catch {
      toast.error("Failed to delete photo");
      setDeleting(false);
    }
  }

  return (
    <div
      style={{
        position: "relative", borderRadius: 12, overflow: "hidden",
        border: "1px solid var(--border)", background: "var(--bg-subtle)",
        aspectRatio: "1 / 1",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Pre-signed S3 URL — next/image would need remotePatterns and breaks the
          dead-URL fallback the photo specs rely on. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.downloadUrl}
        alt={photo.photoType}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div style={{
        position: "absolute", inset: 0,
        background: hover ? "rgba(15, 23, 42, 0.30)" : "transparent",
        transition: "background 120ms",
      }} />
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0, padding: 8,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        opacity: hover ? 1 : 0, transition: "opacity 120ms",
      }}>
        <span style={{
          fontSize: 11.5, fontWeight: 600, color: "#fff",
          textShadow: "0 1px 2px rgba(15,23,42,0.6)",
        }}>{photo.photoType}</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{
            padding: 5, borderRadius: 8, border: "none", cursor: "pointer",
            background: "var(--danger)", color: "#fff",
            opacity: deleting ? 0.5 : 0.9, display: "inline-flex",
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

const PHOTO_TYPES = ["FRONT", "SIDE", "BACK"] as const;

export function PhotoUploadButton({ clientId, logId, onUploaded }: {
  clientId: string; logId: string; onUploaded: (p: Photo) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [photoType, setPhotoType] = useState<"FRONT" | "SIDE" | "BACK">("FRONT");
  const fileRef = React.useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      // 1. Get presigned URL
      const initRes = await api.post(
        `/api/v1/clients/${clientId}/progress/${logId}/photos`,
        { photoType, contentType: file.type || "image/jpeg" }
      );
      const { photoId, uploadUrl } = initRes.data.data;

      // 2. Upload directly to S3 — fetch does not throw on non-2xx
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "image/jpeg" },
        body: file,
      });
      if (!uploadRes.ok) throw new Error(`S3 upload failed: ${uploadRes.status}`);

      // 3. Fetch the photo record with download URL
      const listRes = await api.get(`/api/v1/clients/${clientId}/progress/${logId}/photos`);
      const uploaded = (listRes.data.data as Photo[]).find((p) => p.id === photoId);
      if (uploaded) onUploaded(uploaded);

      toast.success("Photo uploaded");
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <select
        value={photoType}
        onChange={(e) => setPhotoType(e.target.value as "FRONT" | "SIDE" | "BACK")}
        style={{ ...inputStyle, width: "auto", padding: "6px 10px", fontSize: 11.5 }}
        disabled={uploading}
      >
        {PHOTO_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      <Button size="sm" loading={uploading} onClick={() => fileRef.current?.click()}>
        <Camera className="w-3.5 h-3.5 mr-1.5" />
        {uploading ? "Uploading…" : "Upload Photo"}
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
