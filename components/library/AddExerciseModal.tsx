"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { X, Video, Sparkles, Save } from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { parseVideoUrl } from "@/lib/video";
import type { ApiEnvelope, Exercise } from "@/lib/library-types";
import {
  CATEGORIES,
  MUSCLE_GROUPS,
  EQUIPMENT,
  MOVEMENT_PATTERNS,
  type CategoryKey,
} from "@/lib/library-categories";

interface FormState {
  name: string;
  category: CategoryKey;
  muscleGroup: string;
  equipment: string;
  movementPattern: string;
  videoUrl: string;
  instructions: string;
  tags: string[];
}

function initial(ex?: Exercise | null): FormState {
  const cat = (ex?.category as CategoryKey) ?? "strength";
  const isKnownCat = CATEGORIES.some((c) => c.key === cat);
  return {
    name: ex?.name ?? "",
    category: isKnownCat ? cat : "strength",
    muscleGroup: ex?.muscleGroup ?? "Chest",
    equipment: ex?.equipment ?? ex?.modality ?? "Bodyweight",
    movementPattern: ex?.movementPattern ?? "Upper body horiz. push",
    videoUrl: ex?.videoUrl ?? "",
    instructions: ex?.description ?? "",
    tags: ex?.tags ?? [],
  };
}

export default function AddExerciseModal({
  initial: initialEx,
  onClose,
  onSaved,
}: {
  initial: Exercise | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = !initialEx;
  const [form, setForm] = useState<FormState>(() => initial(initialEx));
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(initial(initialEx)); }, [initialEx]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function addTag() {
    const t = tagInput.trim();
    if (!t) return;
    if (!form.tags.includes(t)) set("tags", [...form.tags, t]);
    setTagInput("");
  }

  function save() {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      videoUrl: form.videoUrl || null,
      description: form.instructions || null,
      modality: form.equipment || null,
      muscleGroup: form.muscleGroup || null,
      movementPattern: form.movementPattern || null,
      category: form.category || null,
      equipment: form.equipment || null,
      tags: form.tags,
    };
    const req = initialEx
      ? api.put(`/api/v1/library/exercises/${initialEx.id}`, payload)
      : api.post<ApiEnvelope<Exercise>>("/api/v1/library/exercises", payload);
    req
      .then(() => {
        toast.success(initialEx ? "Exercise updated" : "Exercise created");
        onSaved();
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "Failed to save exercise"))
      .finally(() => setSaving(false));
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, initialEx]);

  const cat = CATEGORIES.find((c) => c.key === form.category) ?? CATEGORIES[0];
  const CatIcon = cat.Icon;
  const canSave = form.name.trim().length > 0;
  const embed = parseVideoUrl(form.videoUrl);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[calc(100vh-48px)] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-start justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[17px] font-semibold tracking-tight text-slate-900">
                {isNew ? "New custom exercise" : `Edit ${form.name || "exercise"}`}
              </h2>
              {!isNew && <CustomBadge />}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isNew
                ? "Create a coach-defined exercise that lives only in your library."
                : "Custom exercises sync to all your clients."}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-slate-100 text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Body */}
        <div className="grid grid-cols-[1fr_280px] gap-6 px-6 py-5 overflow-y-auto">
          {/* Left: form */}
          <div className="flex flex-col gap-4">
            <Field label="Exercise name" required>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Banded glute bridge"
                autoFocus
                className={inputCls}
              />
            </Field>

            <Field label="Category" required>
              <div className="grid grid-cols-5 gap-1.5">
                {CATEGORIES.map((opt) => {
                  const on = form.category === opt.key;
                  const Icon = opt.Icon;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => set("category", opt.key)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 px-1.5 py-2.5 rounded-lg border text-xs font-medium transition-colors",
                        on
                          ? cn(opt.tint, opt.color, opt.ring)
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
              <div
                className={cn(
                  "mt-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs",
                  cat.tint, cat.color
                )}
              >
                <CatIcon className="w-3 h-3" />
                Captured fields: <strong className="font-semibold">{cat.sub}</strong>, sets, rest. Coaches log results in this format.
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Muscle group">
                <select
                  value={form.muscleGroup}
                  onChange={(e) => set("muscleGroup", e.target.value)}
                  className={inputCls}
                >
                  {form.muscleGroup && !MUSCLE_GROUPS.includes(form.muscleGroup) && (
                    <option value={form.muscleGroup}>{form.muscleGroup}</option>
                  )}
                  {MUSCLE_GROUPS.map((m) => <option key={m}>{m}</option>)}
                </select>
              </Field>
              <Field label="Equipment">
                <select
                  value={form.equipment}
                  onChange={(e) => set("equipment", e.target.value)}
                  className={inputCls}
                >
                  {form.equipment && !EQUIPMENT.includes(form.equipment) && (
                    <option value={form.equipment}>{form.equipment}</option>
                  )}
                  {EQUIPMENT.map((m) => <option key={m}>{m}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Movement pattern">
              <select
                value={form.movementPattern}
                onChange={(e) => set("movementPattern", e.target.value)}
                className={inputCls}
              >
                {form.movementPattern && !MOVEMENT_PATTERNS.includes(form.movementPattern) && (
                  <option value={form.movementPattern}>{form.movementPattern}</option>
                )}
                {MOVEMENT_PATTERNS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </Field>

            <Field label="Video URL" hint="YouTube, Vimeo, or a direct link.">
              <div className="relative">
                <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={form.videoUrl}
                  onChange={(e) => set("videoUrl", e.target.value)}
                  placeholder="https://youtube.com/…"
                  className={cn(inputCls, "pl-9")}
                />
              </div>
            </Field>

            <Field label="Instructions / cues" hint="Shown to clients when they tap the exercise.">
              <textarea
                value={form.instructions}
                onChange={(e) => set("instructions", e.target.value)}
                placeholder="Set up shoulder-width, brace your core, drive through the heels…"
                rows={3}
                className={cn(inputCls, "resize-y min-h-[72px]")}
              />
            </Field>

            <Field label="Tags" hint="Press Enter to add. Used to filter your library.">
              <div className="flex gap-2">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  placeholder="e.g. warm-up, unilateral"
                  className={inputCls}
                />
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium ring-1 ring-indigo-100"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => set("tags", form.tags.filter((x) => x !== t))}
                        className="p-0.5 rounded hover:bg-indigo-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </Field>
          </div>

          {/* Right: preview */}
          <aside className="border-l border-slate-200 pl-6 flex flex-col gap-3">
            <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
              Preview
            </span>

            {embed ? (
              <div className="aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-900">
                {embed.kind === "file" ? (
                  <video key={embed.url} src={embed.url} controls className="w-full h-full object-contain" />
                ) : (
                  <iframe
                    key={embed.id}
                    src={embed.embedUrl}
                    title="Exercise video preview"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
            ) : (
              <div
                className={cn(
                  "aspect-[4/3] rounded-lg flex flex-col items-center justify-center gap-2 border",
                  cat.tint, "border-slate-200"
                )}
              >
                <CatIcon className={cn("w-9 h-9", cat.color)} strokeWidth={1.6} />
                <span className={cn("text-xs font-medium", cat.color)}>
                  {form.videoUrl ? "Video link attached" : "No video — icon shown"}
                </span>
              </div>
            )}

            <div className="border-t border-slate-100 pt-3">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={cn("font-semibold text-[13.5px] truncate", form.name ? "text-slate-900" : "italic text-slate-400 font-normal")}>
                  {form.name || "Exercise name…"}
                </span>
                {isNew && <CustomBadge small />}
              </div>
              <div className="text-[11.5px] text-slate-500 mb-2">
                {form.muscleGroup} · {form.equipment}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10.5px] font-medium", cat.tint, cat.color)}>
                  <CatIcon className="w-2.5 h-2.5" />{cat.label}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10.5px] font-medium">
                  {form.movementPattern}
                </span>
              </div>
            </div>

            <div className="mt-auto p-2.5 rounded-lg bg-violet-50 border border-violet-200 text-[11px] text-violet-900">
              <div className="flex items-center gap-1.5 font-semibold mb-0.5">
                <Sparkles className="w-3 h-3" />Custom exercise
              </div>
              Lives in your library — not the public catalog.
            </div>
          </aside>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50">
          <span className="text-[11.5px] text-slate-400">
            <Kbd>Esc</Kbd> close · <Kbd>⌘ Enter</Kbd> save
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={!canSave || saving}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-3.5 h-3.5" />
              {isNew ? "Create exercise" : "Save changes"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

const inputCls =
  "w-full px-3 py-1.5 text-[13px] border border-slate-200 rounded-md bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

function Field({
  label, required, hint, children,
}: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11.5px] font-semibold text-slate-700 flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </span>
      {children}
      {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
    </label>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="font-mono text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded">
      {children}
    </kbd>
  );
}

function CustomBadge({ small }: { small?: boolean } = {}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded font-medium bg-violet-50 text-violet-700 ring-1 ring-violet-200",
        small ? "px-1.5 py-0 text-[10px]" : "px-2 py-0.5 text-[11px]"
      )}
    >
      <Sparkles className={small ? "w-2.5 h-2.5" : "w-3 h-3"} />Custom
    </span>
  );
}
