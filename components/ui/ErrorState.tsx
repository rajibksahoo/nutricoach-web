"use client";

import { AlertTriangle } from "lucide-react";

/**
 * Shown when a fetch fails. Screens used to fall back to design fixtures
 * here, which made an outage look like working software — always surface
 * the failure and offer a retry instead.
 */
export default function ErrorState({
  title = "Couldn't load this",
  message = "Something went wrong reaching the server.",
  onRetry,
  fullHeight = true,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  fullHeight?: boolean;
}) {
  return (
    <div
      role="alert"
      style={{
        minHeight: fullHeight ? "100vh" : undefined,
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: 24,
        textAlign: "center",
      }}
    >
      <AlertTriangle size={22} style={{ color: "var(--fg4)" }} />
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--fg2)" }}>{title}</div>
      <div style={{ fontSize: 12.5, color: "var(--fg3)", maxWidth: 360 }}>{message}</div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            marginTop: 4,
            padding: "7px 14px",
            fontSize: 12.5,
            fontWeight: 600,
            color: "#fff",
            background: "var(--brand-primary)",
            border: "none",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      )}
    </div>
  );
}
