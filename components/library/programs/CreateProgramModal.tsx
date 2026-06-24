"use client";

import { useEffect, useRef, useState } from "react";
import { Send, MoreHorizontal, X, ChevronDown, Check, ImageIcon, Info } from "lucide-react";
import type { ProgramSummary } from "@/lib/library-types";

const MODALITIES = [
  "Strength & Hypertrophy",
  "Cardio Vascular Training",
  "HIIT",
  "Speed/Power",
  "Recovery Training",
  "Mind-Body",
  "Combinations",
  "Hyrox",
];
const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Advanced"];

export interface ProgramFormPayload {
  name: string;
  description: string;
  weeks: number;
  modality: string;
  experienceLevel: string;
  coverFile: File | null;
}

const modalInput: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 13,
  background: "#fff",
  color: "var(--fg1)",
  outline: "none",
  fontFamily: "var(--font-sans)",
};

const iconBtn: React.CSSProperties = {
  width: 28,
  height: 28,
  padding: 0,
  border: "none",
  borderRadius: 6,
  background: "transparent",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--fg3)",
};

export default function CreateProgramModal({
  open,
  onClose,
  onSubmit,
  mode = "create",
  initial = null,
  saving = false,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: ProgramFormPayload) => void;
  mode?: "create" | "edit";
  initial?: ProgramSummary | null;
  saving?: boolean;
}) {
  const isEdit = mode === "edit";
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [weeks, setWeeks] = useState(1);
  const [modality, setModality] = useState("");
  const [experience, setExperience] = useState("");
  const [cover, setCover] = useState<{ name: string; url: string } | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (isEdit && initial) {
      setName(initial.name || "");
      setDescription(initial.description || "");
      setWeeks(initial.weeks || Math.max(1, Math.ceil(initial.durationDays / 7)) || 1);
      setModality(initial.modality || "");
      setExperience(initial.experienceLevel || "");
      setCover(initial.coverImageUrl ? { name: "Current cover", url: initial.coverImageUrl } : null);
    } else {
      setName(""); setDescription(""); setWeeks(1);
      setModality(""); setExperience(""); setCover(null);
    }
    setCoverFile(null);
  }, [open, isEdit, initial]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const canSubmit = name.trim().length > 0 && weeks >= 1 && !saving;

  const handleFile = (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    setCoverFile(file);
    setCover({ name: file.name, url: URL.createObjectURL(file) });
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 80,
      background: "rgba(15,23,42,.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Create New Program" style={{
        width: 560, maxWidth: "100%", maxHeight: "calc(100vh - 48px)",
        background: "#fff", borderRadius: 14,
        boxShadow: "0 30px 80px rgba(15,23,42,.32), 0 4px 12px rgba(15,23,42,.08)",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "1px solid var(--border-subtle)",
        }}>
          <h2 style={{
            font: "700 19px var(--font-display-xl)", letterSpacing: "-0.02em",
            margin: 0, color: "var(--fg1)",
          }}>{isEdit ? "Edit Program" : "Create New Program"}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button title="Share" style={iconBtn}><Send size={14} /></button>
            {isEdit && <button title="More" style={iconBtn}><MoreHorizontal size={15} /></button>}
            <button onClick={onClose} title="Close" style={iconBtn}><X size={15} /></button>
          </div>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", padding: "20px 24px 8px", flex: 1 }}>
          <Field label="Program Name" required>
            <input value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Name your program" style={modalInput} />
          </Field>

          <Field label="Description">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Add program description" rows={4}
              style={{ ...modalInput, resize: "vertical", minHeight: 84 }} />
          </Field>

          <Field label="Week" required>
            <input type="number" min={1} max={52} value={weeks}
              onChange={(e) => setWeeks(Math.max(1, parseInt(e.target.value || "1", 10)))}
              style={{ ...modalInput, width: 120 }} />
          </Field>

          <Field label="Modality">
            <SelectPicker value={modality} onChange={setModality}
              placeholder="Select Modality" options={MODALITIES} />
          </Field>

          <Field label="Experience Level">
            <SelectPicker value={experience} onChange={setExperience}
              placeholder="Select Experience Level" options={EXPERIENCE_LEVELS} />
          </Field>

          <Field label="Cover Image (Optional)">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]); }}
              style={{
                position: "relative",
                border: `1px dashed ${dragging ? "var(--brand-primary)" : "var(--border-strong)"}`,
                background: dragging ? "var(--brand-primary-50)" : "var(--bg)",
                borderRadius: 10, padding: "22px 16px",
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", gap: 8, textAlign: "center",
              }}>
              <span title="Recommended 1200×600px" style={{
                position: "absolute", top: 8, right: 8, color: "var(--fg4)",
                display: "flex", alignItems: "center",
              }}><Info size={14} /></span>
              {cover ? (
                <>
                  <img src={cover.url} alt="cover" style={{
                    maxHeight: 120, maxWidth: "100%", borderRadius: 8, boxShadow: "var(--shadow-sm)",
                  }} />
                  <div style={{ fontSize: 12, color: "var(--fg2)", marginTop: 4 }}>{cover.name}</div>
                  <button type="button" onClick={() => { setCover(null); setCoverFile(null); }} style={{
                    background: "none", border: "none", color: "var(--brand-primary)",
                    fontSize: 12, fontWeight: 600, cursor: "pointer", marginTop: 2,
                  }}>Remove</button>
                </>
              ) : (
                <>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: "#fff", border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--fg3)",
                  }}><ImageIcon size={22} /></div>
                  <div style={{ fontSize: 13, color: "var(--fg2)", lineHeight: 1.4 }}>
                    Drag &amp; Drop your images here<br />or{" "}
                    <button type="button" onClick={() => fileRef.current?.click()} style={{
                      background: "none", border: "none", color: "var(--brand-primary)",
                      fontWeight: 600, cursor: "pointer", fontSize: 13, padding: 0,
                    }}>Choose Files</button>
                  </div>
                </>
              )}
              <input ref={fileRef} type="file" accept="image/*" hidden
                onChange={(e) => handleFile(e.target.files?.[0])} />
            </div>
          </Field>
        </div>

        {/* Footer */}
        <div style={{
          padding: "14px 24px", borderTop: "1px solid var(--border-subtle)",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          background: "#fff",
        }}>
          {isEdit ? <span /> : (
            <span style={{ fontSize: 12, color: "var(--fg4)" }}>You can plan workouts after creating.</span>
          )}
          <button type="button" disabled={!canSubmit}
            onClick={() => onSubmit({ name, description, weeks, modality, experienceLevel: experience, coverFile })}
            style={{
              background: canSubmit ? "var(--brand-primary)" : "var(--bg-subtle)",
              color: canSubmit ? "#fff" : "var(--fg4)",
              border: "none", padding: "10px 22px", borderRadius: 9,
              fontSize: 13, fontWeight: 600,
              cursor: canSubmit ? "pointer" : "not-allowed",
              boxShadow: canSubmit ? "0 1px 2px rgba(79,70,229,.25)" : "none",
            }}>
            {saving ? "Saving…" : isEdit ? "Save" : "Create Program"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{
        display: "block", fontSize: 11, fontWeight: 700,
        color: "var(--fg3)", textTransform: "uppercase",
        letterSpacing: "0.08em", marginBottom: 7,
      }}>
        {label}{required && <span style={{ color: "#EF4444", marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function SelectPicker({
  value, onChange, placeholder, options,
}: {
  value: string; onChange: (v: string) => void; placeholder: string; options: string[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button type="button" onClick={() => setOpen((o) => !o)} style={{
        ...modalInput, textAlign: "left", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        color: value ? "var(--fg1)" : "var(--fg4)",
      }}>
        <span>{value || placeholder}</span>
        <ChevronDown size={14} style={{
          color: "var(--fg3)", transition: "transform 120ms",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
        }} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 5,
          background: "#fff", border: "1px solid var(--border)",
          borderRadius: 9, boxShadow: "var(--shadow-lg)",
          maxHeight: 260, overflowY: "auto", padding: 6,
        }}>
          {options.map((opt) => {
            const on = value === opt;
            return (
              <button key={opt} type="button" onClick={() => { onChange(opt); setOpen(false); }} style={{
                width: "100%", textAlign: "left", padding: "9px 11px", borderRadius: 6, border: "none",
                background: on ? "var(--brand-primary-50)" : "transparent",
                color: on ? "var(--brand-primary)" : "var(--fg1)",
                font: `${on ? 600 : 500} 13px var(--font-sans)`, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span>{opt}</span>
                {on && <Check size={13} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
