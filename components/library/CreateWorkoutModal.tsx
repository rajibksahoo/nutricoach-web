"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  X,
  ChevronLeft,
  Search,
  Dumbbell,
  FileText,
  LayoutGrid,
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  WORKOUT_TEMPLATES,
  TEMPLATE_THUMB_COLOR,
  type WorkoutTemplate,
} from "@/lib/library-categories";
import type { ApiEnvelope, WorkoutSummary, WorkoutSectionType } from "@/lib/library-types";

type Step = "chooser" | "template" | "blank";

export default function CreateWorkoutModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const [step, setStep] = useState<Step>("chooser");

  useEffect(() => {
    if (open) setStep("chooser");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      style={{ background: "rgba(15,23,42,0.55)" }}
    >
      {step === "chooser" && (
        <ChooserCard
          onClose={onClose}
          onPickTemplate={() => setStep("template")}
          onPickBlank={() => setStep("blank")}
        />
      )}
      {step === "template" && (
        <TemplatePickerCard
          onClose={onClose}
          onBack={() => setStep("chooser")}
          onCreated={onCreated}
        />
      )}
      {step === "blank" && (
        <BlankFormCard
          onClose={onClose}
          onBack={() => setStep("chooser")}
          onCreated={onCreated}
        />
      )}
    </div>
  );
}

/* ─── Step 1: chooser ─────────────────────────────────────────────────── */
function ChooserCard({
  onClose,
  onPickTemplate,
  onPickBlank,
}: {
  onClose: () => void;
  onPickTemplate: () => void;
  onPickBlank: () => void;
}) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-xl shadow-2xl w-full relative"
      style={{ maxWidth: 560, padding: "22px 24px 24px" }}
    >
      <button
        onClick={onClose}
        className="absolute flex items-center justify-center rounded-full bg-slate-900 text-white"
        style={{ top: 11, right: 11, width: 24, height: 24 }}
        aria-label="Close"
      >
        <X className="w-3 h-3" />
      </button>

      <h2
        className="text-slate-900 m-0"
        style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em" }}
      >
        Create workout
      </h2>
      <p
        className="text-slate-500"
        style={{ fontSize: 13, margin: "4px 0 18px" }}
      >
        Please select how you would like to start.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <ChoiceCard
          Icon={LayoutGrid}
          title="Create from Template"
          subtitle="Choose from our list of workout templates"
          onClick={onPickTemplate}
        />
        <ChoiceCard
          Icon={FileText}
          title="New Workout"
          subtitle="Create your own"
          onClick={onPickBlank}
        />
      </div>
    </div>
  );
}

function ChoiceCard({
  Icon,
  title,
  subtitle,
  onClick,
}: {
  Icon: typeof FileText;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white border border-slate-200 rounded-lg flex flex-col items-center text-center transition-all hover:border-emerald-500 hover:bg-emerald-50/40 hover:-translate-y-px hover:shadow-sm"
      style={{ padding: "24px 16px 20px", gap: 10 }}
    >
      <div
        className="flex items-center justify-center rounded-md text-emerald-700 bg-emerald-50 border border-emerald-200"
        style={{ width: 44, height: 44 }}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div
          className="text-slate-900"
          style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 3 }}
        >
          {title}
        </div>
        <div className="text-slate-500" style={{ fontSize: 11.5, lineHeight: 1.4 }}>
          {subtitle}
        </div>
      </div>
    </button>
  );
}

/* ─── Step 2: template picker ─────────────────────────────────────────── */
function TemplatePickerCard({
  onClose,
  onBack,
  onCreated,
}: {
  onClose: () => void;
  onBack: () => void;
  onCreated: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const [pickedId, setPickedId] = useState<string>(WORKOUT_TEMPLATES[0]?.id ?? "");
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(
    () =>
      WORKOUT_TEMPLATES.filter((t) =>
        !q ||
        t.name.toLowerCase().includes(q.toLowerCase()) ||
        t.description.toLowerCase().includes(q.toLowerCase()),
      ),
    [q],
  );
  const picked =
    WORKOUT_TEMPLATES.find((t) => t.id === pickedId) ?? filtered[0] ?? null;

  function handleSelect() {
    if (!picked) return;
    setCreating(true);
    api
      .post<ApiEnvelope<WorkoutSummary>>("/api/v1/library/workouts", {
        name: picked.name,
        description: picked.description,
        estimatedDurationMinutes: null,
      })
      .then((r) => {
        toast.success("Workout created from template");
        onCreated(r.data.data.id);
      })
      .catch((err) =>
        toast.error(err.response?.data?.message ?? "Failed to create workout"),
      )
      .finally(() => setCreating(false));
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-xl shadow-2xl w-full grid relative overflow-hidden"
      style={{
        maxWidth: 880,
        height: "calc(100vh - 48px)",
        maxHeight: 640,
        gridTemplateColumns: "1fr 1fr",
      }}
    >
      <button
        onClick={onClose}
        className="absolute flex items-center justify-center rounded-full text-slate-500 border border-slate-200 bg-white z-10"
        style={{ top: 14, right: 14, width: 24, height: 24 }}
        aria-label="Close"
      >
        <X className="w-3 h-3" />
      </button>

      {/* Left: list */}
      <div className="flex flex-col border-r border-slate-200">
        <div style={{ padding: "18px 22px 12px" }}>
          <div className="flex items-center gap-2 mb-3.5">
            <button
              onClick={onBack}
              className="flex items-center text-emerald-600 p-0"
              aria-label="Back"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2
              className="text-slate-900 m-0"
              style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em" }}
            >
              Choose Workout Template
            </h2>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search workout"
              className="w-full bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              style={{ padding: "8px 12px 8px 32px", fontSize: 12.5 }}
            />
          </div>
        </div>

        <div style={{ padding: "0 14px", marginBottom: 8 }}>
          <span
            className="text-slate-500"
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              padding: "6px 8px",
            }}
          >
            Most popular ({filtered.length})
          </span>
        </div>

        <div className="flex-1 overflow-y-auto" style={{ padding: "0 8px 14px" }}>
          {filtered.map((t) => {
            const on = picked?.id === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setPickedId(t.id)}
                className={cn(
                  "w-full text-left rounded-md transition-colors",
                  on ? "bg-emerald-50" : "hover:bg-slate-50",
                )}
                style={{ padding: "12px 14px", marginBottom: 1 }}
              >
                <div
                  className={cn(
                    on ? "text-emerald-700" : "text-slate-900",
                  )}
                  style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}
                >
                  {t.name}
                </div>
                <div
                  className={cn(on ? "text-emerald-700" : "text-slate-500")}
                  style={{ fontSize: 11.5 }}
                >
                  {t.exerciseCount} Exercises • {t.sectionCount} Sections
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div
              className="text-center text-slate-400"
              style={{ padding: "30px 16px", fontSize: 12 }}
            >
              No templates match.
            </div>
          )}
        </div>
      </div>

      {/* Right: preview */}
      <div className="flex flex-col bg-slate-50 overflow-hidden relative">
        {picked && <TemplatePreview template={picked} />}
        <div
          className="flex justify-end bg-slate-50 border-t border-slate-200"
          style={{ padding: "12px 22px 16px" }}
        >
          <button
            onClick={handleSelect}
            disabled={creating || !picked}
            className="bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-60"
            style={{ padding: "8px 18px", fontSize: 13, fontWeight: 600 }}
          >
            {creating ? "Creating…" : "Select"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TemplatePreview({ template }: { template: WorkoutTemplate }) {
  return (
    <div
      className="flex-1 overflow-y-auto flex flex-col"
      style={{ padding: "18px 22px 6px", gap: 14 }}
    >
      {/* Phone-style hero */}
      <div
        className="relative rounded-xl overflow-hidden text-white flex flex-col justify-end"
        style={{
          background: template.cover,
          padding: "32px 18px 20px",
          minHeight: 120,
          boxShadow: "0 8px 22px -10px rgba(15, 23, 42, 0.4)",
        }}
      >
        <div
          className="absolute"
          style={{
            top: 8,
            left: "50%",
            transform: "translateX(-50%)",
            width: 60,
            height: 5,
            borderRadius: 99,
            background: "rgba(255,255,255,0.4)",
          }}
        />
        <h3
          className="m-0"
          style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15 }}
        >
          {template.name}
        </h3>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.06em",
            marginTop: 8,
            opacity: 0.92,
          }}
        >
          {template.exerciseCount} EXERCISES • {template.sectionCount} SECTIONS
        </div>
      </div>

      <PreviewBlock label="Description">
        <p className="text-slate-700 m-0" style={{ fontSize: 12.5, lineHeight: 1.5 }}>
          {template.description}
        </p>
      </PreviewBlock>

      <PreviewBlock label="Equipment">
        <div className="flex flex-wrap gap-1.5">
          {template.equipment.map((e) => (
            <span
              key={e}
              className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-md text-slate-700"
              style={{ padding: "4px 9px", fontSize: 11.5, fontWeight: 500 }}
            >
              <Dumbbell className="w-3 h-3" />
              {e}
            </span>
          ))}
        </div>
      </PreviewBlock>

      {template.sections.map((s, idx) => {
        const isEdge = idx === 0 || idx === template.sections.length - 1;
        return (
          <div key={idx}>
            <div className="flex items-center gap-2 mb-2.5 whitespace-nowrap">
              <span
                className={cn(
                  "rounded-full",
                  isEdge ? "bg-slate-300" : "bg-emerald-600",
                )}
                style={{ width: 7, height: 7, flexShrink: 0 }}
              />
              <h4
                className="text-slate-900 m-0"
                style={{ fontSize: 13, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.2 }}
              >
                {s.title}
              </h4>
            </div>
            <div
              className="border-l border-dashed border-slate-200"
              style={{ paddingLeft: 14, marginLeft: 3 }}
            >
              <div
                className="text-slate-400 uppercase"
                style={{
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: "0.07em",
                  marginBottom: 8,
                  lineHeight: 1.4,
                }}
              >
                {s.style}
              </div>
              {s.items.map((it, i) => {
                const color = TEMPLATE_THUMB_COLOR[it.thumb];
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center gap-2.5",
                      i > 0 && "border-t border-slate-100",
                    )}
                    style={{ padding: "5px 0" }}
                  >
                    <div
                      className="flex items-center justify-center rounded-md"
                      style={{
                        width: 34,
                        height: 34,
                        background: `${color}1A`,
                        border: `1px solid ${color}33`,
                        color,
                      }}
                    >
                      <Dumbbell className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-slate-900 truncate"
                        style={{ fontSize: 12.5, fontWeight: 500 }}
                      >
                        {it.name}
                      </div>
                      <div className="text-slate-400" style={{ fontSize: 11 }}>
                        {it.reps}
                      </div>
                    </div>
                    {it.note && (
                      <span
                        className="bg-slate-100 text-slate-500 font-mono"
                        style={{ fontSize: 11, padding: "1px 7px", borderRadius: 4 }}
                      >
                        {it.note}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PreviewBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4
        className="text-slate-900"
        style={{
          fontSize: 12,
          fontWeight: 700,
          lineHeight: 1.3,
          letterSpacing: "-0.01em",
          margin: "0 0 6px",
        }}
      >
        {label}
      </h4>
      {children}
    </div>
  );
}

/* ─── Step 2b: blank workout form ─────────────────────────────────────── */
function BlankFormCard({
  onClose,
  onBack,
  onCreated,
}: {
  onClose: () => void;
  onBack: () => void;
  onCreated: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [saving, setSaving] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name is required");
    setSaving(true);
    api
      .post<ApiEnvelope<WorkoutSummary>>("/api/v1/library/workouts", {
        name,
        description: description || null,
        estimatedDurationMinutes: duration ? Number(duration) : null,
      })
      .then((r) => {
        toast.success("Workout created");
        onCreated(r.data.data.id);
      })
      .catch((err) =>
        toast.error(err.response?.data?.message ?? "Failed to save workout"),
      )
      .finally(() => setSaving(false));
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-xl shadow-2xl w-full relative"
      style={{ maxWidth: 520, padding: "22px 24px 22px" }}
    >
      <button
        onClick={onClose}
        className="absolute flex items-center justify-center rounded-full bg-slate-900 text-white"
        style={{ top: 11, right: 11, width: 24, height: 24 }}
        aria-label="Close"
      >
        <X className="w-3 h-3" />
      </button>

      <div className="flex items-center gap-2 mb-3.5">
        <button
          onClick={onBack}
          className="flex items-center text-emerald-600 p-0"
          aria-label="Back"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h2
          className="text-slate-900 m-0"
          style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em" }}
        >
          New workout
        </h2>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <Field label="Name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Upper-body Strength Day"
            className="w-full bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            style={{ padding: "8px 12px", fontSize: 13 }}
            autoFocus
            required
          />
        </Field>
        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Optional"
            className="w-full bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            style={{ padding: "8px 12px", fontSize: 13 }}
          />
        </Field>
        <Field label="Estimated duration (minutes)">
          <input
            type="number"
            min={1}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g. 60"
            className="w-full bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            style={{ padding: "8px 12px", fontSize: 13 }}
          />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="bg-white border border-slate-200 text-slate-700 rounded-md hover:bg-slate-50"
            style={{ padding: "8px 14px", fontSize: 13, fontWeight: 500 }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-60"
            style={{ padding: "8px 18px", fontSize: 13, fontWeight: 600 }}
          >
            {saving ? "Creating…" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span
        className="text-slate-700"
        style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: "0.01em" }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

// Re-export for callers that want to know the section type union
export type { WorkoutSectionType };
