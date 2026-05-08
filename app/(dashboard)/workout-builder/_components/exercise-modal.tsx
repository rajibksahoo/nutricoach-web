"use client";
import * as React from "react";
import {
  CATEGORIES, CAT, MUSCLE_OPTIONS, EQUIPMENT_OPTIONS, PATTERN_OPTIONS,
  type LibraryExercise, type CategoryKey,
} from "./data";
import { X, Video, Sparkles, SaveIcon } from "./icons";
import { CatBadge, CustomBadge } from "./shared";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "7px 11px", border: "1px solid var(--border)",
  borderRadius: 7, fontSize: 13, background: "#fff", color: "var(--fg1)",
  fontFamily: "var(--font-sans)", outline: "none",
};

const kbdStyle: React.CSSProperties = {
  font: "500 10px var(--font-mono)", background: "#fff",
  border: "1px solid var(--border)", padding: "1px 5px", borderRadius: 4,
};

function Field({
  label, required, hint, children,
}: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--fg2)", display: "flex", alignItems: "center", gap: 5 }}>
        {label}{required && <span style={{ color: "var(--danger)" }}>*</span>}
      </span>
      {children}
      {hint && <span style={{ fontSize: 11, color: "var(--fg4)" }}>{hint}</span>}
    </label>
  );
}

interface FormState {
  name: string;
  cat: CategoryKey;
  muscle: string;
  equip: string;
  pattern: string;
  videoUrl: string;
  instructions: string;
  tags: string[];
  custom: boolean;
}

const defaultForm: FormState = {
  name: "", cat: "strength", muscle: "Chest", equip: "Bodyweight",
  pattern: "Upper body horiz. push", videoUrl: "", instructions: "",
  tags: [], custom: true,
};

export function ExerciseModal({
  open, exercise, onClose, onSave,
}: {
  open: boolean;
  exercise: LibraryExercise | null;
  onClose: () => void;
  onSave: (ex: LibraryExercise) => void;
}) {
  const isNew = !exercise || !exercise.id;
  const [form, setForm] = React.useState<FormState>(defaultForm);

  React.useEffect(() => {
    if (!open) return;
    setForm({
      ...defaultForm,
      ...(exercise ? {
        name: exercise.name,
        cat: exercise.cat,
        muscle: exercise.muscle || "Chest",
        equip: exercise.equip || "Bodyweight",
        pattern: exercise.pattern || "Upper body horiz. push",
        videoUrl: exercise.videoUrl ?? "",
        instructions: exercise.instructions ?? "",
        tags: exercise.tags ?? [],
        custom: exercise.custom,
      } : {}),
    });
  }, [open, exercise]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (form.name.trim()) submit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, form, onClose]);

  if (!open) return null;

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm(f => ({ ...f, [k]: v }));
  const c = CAT[form.cat];

  const submit = () => {
    if (!form.name.trim()) return;
    onSave({
      id: exercise?.id ?? `ex-custom-${Date.now()}`,
      name: form.name.trim(),
      cat: form.cat,
      muscle: form.muscle,
      equip: form.equip,
      pattern: form.pattern,
      videoUrl: form.videoUrl.trim() || undefined,
      instructions: form.instructions.trim() || undefined,
      tags: form.tags,
      custom: exercise?.custom ?? true,
    });
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.55)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
      padding: 24, animation: "wb-fadeIn 140ms ease",
    }}>
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true"
        aria-label={isNew ? "New custom exercise" : "Edit exercise"}
        style={{
          background: "#fff", borderRadius: 12, width: "100%", maxWidth: 780,
          maxHeight: "calc(100vh - 48px)", display: "flex", flexDirection: "column",
          boxShadow: "var(--shadow-xl)", animation: "wb-slideUp 180ms ease",
        }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "15px 22px", borderBottom: "1px solid var(--border)",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h2 style={{ font: "600 17px var(--font-display)", letterSpacing: "-0.01em", margin: 0 }}>
                {isNew ? "New custom exercise" : `Edit ${form.name}`}
              </h2>
              {!isNew && form.custom && <CustomBadge small />}
            </div>
            <p style={{ fontSize: 12, color: "var(--fg3)", margin: "3px 0 0" }}>
              {isNew
                ? "Create a coach-defined exercise that lives only in your library."
                : "Custom exercises sync to all your clients."}
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div style={{
          padding: "18px 22px", overflowY: "auto",
          display: "grid", gridTemplateColumns: "1fr 280px", gap: 22,
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Exercise name" required>
              <input value={form.name} onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Banded glute bridge" autoFocus style={inputStyle} />
            </Field>

            <Field label="Category" required>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
                {CATEGORIES.map(opt => {
                  const on = form.cat === opt.key;
                  const Icon = opt.Icon;
                  return (
                    <button key={opt.key} type="button" onClick={() => set("cat", opt.key)} style={{
                      padding: "10px 6px", borderRadius: 8,
                      border: `1px solid ${on ? opt.color : "var(--border)"}`,
                      background: on ? opt.tint : "#fff",
                      color: on ? opt.color : "var(--fg2)",
                      cursor: "pointer", display: "flex", flexDirection: "column",
                      alignItems: "center", gap: 5, transition: "all 100ms",
                    }}>
                      <Icon size={16} />
                      <span style={{ fontSize: 11, fontWeight: on ? 600 : 500 }}>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
              <div style={{
                marginTop: 8, padding: "7px 10px", background: c.tint, color: c.color,
                borderRadius: 6, fontSize: 11.5, display: "flex", alignItems: "center", gap: 6,
              }}>
                <c.Icon size={12} />
                Captured fields: <strong>{c.sub}</strong>, sets, rest. Coaches log results in this format.
              </div>
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Muscle group">
                <select value={form.muscle} onChange={(e) => set("muscle", e.target.value)} style={inputStyle}>
                  {MUSCLE_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </Field>
              <Field label="Equipment">
                <select value={form.equip} onChange={(e) => set("equip", e.target.value)} style={inputStyle}>
                  {EQUIPMENT_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Movement pattern">
              <select value={form.pattern} onChange={(e) => set("pattern", e.target.value)} style={inputStyle}>
                {PATTERN_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>

            <Field label="Video URL" hint="YouTube, Vimeo, or a direct link.">
              <div style={{ position: "relative" }}>
                <Video size={14} style={{
                  position: "absolute", left: 11, top: "50%",
                  transform: "translateY(-50%)", color: "var(--fg4)",
                }} />
                <input value={form.videoUrl} onChange={(e) => set("videoUrl", e.target.value)}
                  placeholder="https://youtube.com/…"
                  style={{ ...inputStyle, paddingLeft: 32 }} />
              </div>
            </Field>

            <Field label="Instructions / cues" hint="Shown to clients when they tap the exercise.">
              <textarea value={form.instructions} onChange={(e) => set("instructions", e.target.value)}
                placeholder="Set up shoulder-width, brace your core, drive through the heels…"
                rows={3}
                style={{ ...inputStyle, resize: "vertical", minHeight: 72, fontFamily: "var(--font-sans)" }} />
            </Field>
          </div>

          {/* Preview pane */}
          <aside style={{
            borderLeft: "1px solid var(--border)", paddingLeft: 22,
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            <span style={{
              fontSize: 10.5, fontWeight: 600, color: "var(--fg3)",
              textTransform: "uppercase", letterSpacing: "0.06em",
            }}>Preview</span>

            <div style={{
              aspectRatio: "4 / 3", borderRadius: 9, background: c.tint,
              border: `1px solid ${c.color}26`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexDirection: "column", gap: 8,
            }}>
              <c.Icon size={36} style={{ color: c.color, strokeWidth: 1.6 }} />
              <span style={{ fontSize: 11, color: c.color, fontWeight: 500 }}>
                {form.videoUrl ? "Video attached" : "No video — icon shown"}
              </span>
            </div>

            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 12 }}>
              <div style={{
                fontWeight: 600, fontSize: 13.5, color: "var(--fg1)", marginBottom: 2,
                display: "flex", alignItems: "center", gap: 7,
              }}>
                {form.name || (
                  <span style={{ color: "var(--fg4)", fontStyle: "italic", fontWeight: 400 }}>
                    Exercise name…
                  </span>
                )}
                {form.custom && <CustomBadge small />}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--fg3)", marginBottom: 8 }}>
                {form.muscle} · {form.equip}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                <CatBadge cat={form.cat} size="sm" />
                <span style={{
                  fontSize: 10, padding: "1px 6px", borderRadius: 5,
                  background: "var(--bg-subtle)", color: "var(--fg3)", fontWeight: 500,
                }}>{form.pattern}</span>
              </div>
            </div>

            <div style={{
              marginTop: "auto", padding: 10, background: "#FAF5FF",
              border: "1px solid #E9D5FF", borderRadius: 8, fontSize: 11, color: "#581C87",
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 5, marginBottom: 3, fontWeight: 600,
              }}>
                <Sparkles size={11} />Custom exercise
              </div>
              Lives in your library — not the public catalog.
            </div>
          </aside>
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "13px 22px", borderTop: "1px solid var(--border)", background: "var(--bg)",
        }}>
          <span style={{ fontSize: 11.5, color: "var(--fg4)" }}>
            <kbd style={kbdStyle}>Esc</kbd> close · <kbd style={kbdStyle}>⌘ Enter</kbd> save
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={!form.name.trim()} onClick={submit}
              style={!form.name.trim() ? { opacity: 0.5, cursor: "not-allowed" } : undefined}>
              <SaveIcon size={13} />{isNew ? "Create exercise" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
