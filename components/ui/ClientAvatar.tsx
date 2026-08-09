"use client";

/** Initials circle tinted with the client's deterministic tone. */
export default function ClientAvatar({
  name,
  tone = "#4F46E5",
  size = 32,
}: {
  name: string;
  tone?: string;
  size?: number;
}) {
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
