"use client";
import * as React from "react";
import {
  CATEGORIES, LIBRARY, type LibraryExercise, type CategoryKey,
} from "./data";
import { X } from "./icons";
import { ModalShell, ModalHeader } from "./create-workout-modals";

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: "var(--fg2)",
  textTransform: "uppercase", letterSpacing: "0.04em",
  fontFamily: "var(--font-sans)",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "8px 10px",
  border: "1px solid var(--border)", borderRadius: 6,
  fontSize: 13, fontFamily: "var(--font-sans)", outline: "none",
  background: "#fff", color: "var(--fg1)",
};

function Field({
  label, children, hint,
}: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={labelStyle}>{label}</span>
      {children}
      {hint && <span style={{ fontSize: 11, color: "var(--fg4)" }}>{hint}</span>}
    </label>
  );
}

function TextWithSuggestions({
  value, onChange, suggestions, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  suggestions: string[];
  placeholder?: string;
}) {
  const [focused, setFocused] = React.useState(false);
  const matches = focused && value
    ? suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase()) && s.toLowerCase() !== value.toLowerCase()).slice(0, 6)
    : [];
  return (
    <div style={{ position: "relative" }}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 120)}
        placeholder={placeholder}
        style={inputStyle} />
      {matches.length > 0 && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 5,
          marginTop: 4, background: "#fff",
          border: "1px solid var(--border)", borderRadius: 6,
          boxShadow: "var(--shadow-md)", padding: 4,
          maxHeight: 180, overflowY: "auto",
        }}>
          {matches.map(s => (
            <button
              key={s} type="button"
              onMouseDown={(e) => { e.preventDefault(); onChange(s); }}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "6px 8px", border: "none", background: "transparent",
                cursor: "pointer", fontSize: 12.5, color: "var(--fg1)",
                fontFamily: "var(--font-sans)", borderRadius: 4,
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-soft)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ExerciseModal({
  open, exercise, onClose, onSave,
}: {
  open: boolean;
  exercise: LibraryExercise | null;
  onClose: () => void;
  onSave: (ex: LibraryExercise) => void;
}) {
  const isEdit = !!exercise;
  const [name, setName] = React.useState("");
  const [cat, setCat] = React.useState<CategoryKey>("strength");
  const [muscle, setMuscle] = React.useState("");
  const [equip, setEquip] = React.useState("");
  const [pattern, setPattern] = React.useState("");
  const [tags, setTags] = React.useState<string[]>([]);
  const [tagDraft, setTagDraft] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setName(exercise?.name ?? "");
    setCat(exercise?.cat ?? "strength");
    setMuscle(exercise?.muscle ?? "");
    setEquip(exercise?.equip ?? "");
    setPattern(exercise?.pattern ?? "");
    setTags(exercise?.tags ?? []);
    setTagDraft("");
  }, [open, exercise]);

  const muscles = React.useMemo(() => Array.from(new Set(LIBRARY.map(e => e.muscle).filter(Boolean))).sort(), []);
  const equips = React.useMemo(() => Array.from(new Set(LIBRARY.map(e => e.equip).filter(Boolean))).sort(), []);
  const patterns = React.useMemo(() => Array.from(new Set(LIBRARY.map(e => e.pattern).filter(Boolean))).sort(), []);

  const addTag = () => {
    const t = tagDraft.trim();
    if (!t) return;
    if (!tags.includes(t)) setTags([...tags, t]);
    setTagDraft("");
  };
  const removeTag = (t: string) => setTags(tags.filter(x => x !== t));

  const valid = name.trim().length > 0;

  const submit = () => {
    if (!valid) return;
    onSave({
      id: exercise?.id ?? `ex-custom-${Date.now()}`,
      name: name.trim(),
      cat, muscle: muscle.trim(), equip: equip.trim(),
      pattern: pattern.trim(), tags,
      custom: exercise?.custom ?? true,
    });
  };

  return (
    <ModalShell open={open} onClose={onClose} width={580} ariaLabel={isEdit ? "Edit exercise" : "New exercise"}>
      <ModalHeader
        title={isEdit ? "Edit exercise" : "New exercise"}
        subtitle={isEdit ? "Update the details for this exercise." : "Add a custom exercise to your library."}
        onClose={onClose} />

      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto" }}>
        <Field label="Name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Bulgarian split squat"
            autoFocus
            style={inputStyle} />
        </Field>

        <Field label="Category">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
            {CATEGORIES.map(c => {
              const active = c.key === cat;
              const Icon = c.Icon;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCat(c.key)}
                  style={{
                    padding: "8px 6px", borderRadius: 8, cursor: "pointer",
                    border: "1px solid " + (active ? c.color : "var(--border)"),
                    background: active ? c.tint : "#fff",
                    color: active ? c.color : "var(--fg2)",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                    fontFamily: "var(--font-sans)",
                  }}>
                  <Icon size={16} />
                  <span style={{ fontSize: 11.5, fontWeight: 600 }}>{c.label}</span>
                </button>
              );
            })}
          </div>
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Primary muscle">
            <TextWithSuggestions value={muscle} onChange={setMuscle} suggestions={muscles} placeholder="Glutes, Quads…" />
          </Field>
          <Field label="Equipment">
            <TextWithSuggestions value={equip} onChange={setEquip} suggestions={equips} placeholder="Barbell, Dumbbells…" />
          </Field>
        </div>

        <Field label="Movement pattern" hint="Squat, Hinge, Push, Pull, Carry, Locomotion…">
          <TextWithSuggestions value={pattern} onChange={setPattern} suggestions={patterns} placeholder="e.g. Lower body squat" />
        </Field>

        <Field label="Tags">
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 6,
            padding: 6, border: "1px solid var(--border)", borderRadius: 6, background: "#fff",
          }}>
            {tags.map(t => (
              <span
                key={t}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  padding: "3px 4px 3px 9px", borderRadius: 999,
                  background: "var(--bg-soft)", color: "var(--fg1)",
                  fontSize: 11.5, fontFamily: "var(--font-sans)",
                }}>
                {t}
                <button
                  type="button"
                  onClick={() => removeTag(t)}
                  aria-label={`Remove ${t}`}
                  style={{
                    background: "transparent", border: "none", cursor: "pointer",
                    padding: 2, color: "var(--fg3)", display: "flex",
                  }}>
                  <X size={11} />
                </button>
              </span>
            ))}
            <input
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); }
                else if (e.key === "Backspace" && !tagDraft && tags.length) { setTags(tags.slice(0, -1)); }
              }}
              onBlur={addTag}
              placeholder={tags.length ? "" : "Add tags (Enter to commit)"}
              style={{
                flex: 1, minWidth: 120, border: "none", outline: "none",
                padding: "3px 4px", fontSize: 12.5, color: "var(--fg1)",
                fontFamily: "var(--font-sans)", background: "transparent",
              }} />
          </div>
        </Field>
      </div>

      <div style={{
        padding: "12px 22px", borderTop: "1px solid var(--border-subtle)",
        display: "flex", justifyContent: "flex-end", gap: 8,
      }}>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={submit}
          disabled={!valid}
          style={!valid ? { opacity: 0.5, cursor: "not-allowed" } : undefined}>
          {isEdit ? "Save changes" : "Add exercise"}
        </button>
      </div>
    </ModalShell>
  );
}
