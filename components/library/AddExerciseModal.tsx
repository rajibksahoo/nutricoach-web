"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import api from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type { ApiEnvelope, Exercise } from "@/lib/library-types";

type Step = 0 | 1 | 2;
const STEPS = ["Basics", "Classification", "Tags"] as const;

interface FormState {
  name: string;
  videoUrl: string;
  description: string;
  modality: string;
  muscleGroup: string;
  movementPattern: string;
  category: string;
  equipment: string;
  tags: string[];
}

function empty(initial?: Exercise | null): FormState {
  return {
    name: initial?.name ?? "",
    videoUrl: initial?.videoUrl ?? "",
    description: initial?.description ?? "",
    modality: initial?.modality ?? "",
    muscleGroup: initial?.muscleGroup ?? "",
    movementPattern: initial?.movementPattern ?? "",
    category: initial?.category ?? "",
    equipment: initial?.equipment ?? "",
    tags: initial?.tags ?? [],
  };
}

export default function AddExerciseModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: Exercise | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [step, setStep] = useState<Step>(0);
  const [form, setForm] = useState<FormState>(empty(initial));
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(empty(initial)); setStep(0); }, [initial]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function next() {
    if (step === 0 && !form.name.trim()) { toast.error("Name is required"); return; }
    setStep((s) => Math.min(2, s + 1) as Step);
  }
  function prev() { setStep((s) => Math.max(0, s - 1) as Step); }

  function addTag() {
    const t = tagInput.trim();
    if (!t) return;
    if (form.tags.includes(t)) { setTagInput(""); return; }
    set("tags", [...form.tags, t]);
    setTagInput("");
  }

  function save() {
    if (!form.name.trim()) { toast.error("Name is required"); setStep(0); return; }
    setSaving(true);
    const payload = {
      name: form.name,
      videoUrl: form.videoUrl || null,
      description: form.description || null,
      modality: form.modality || null,
      muscleGroup: form.muscleGroup || null,
      movementPattern: form.movementPattern || null,
      category: form.category || null,
      equipment: form.equipment || null,
      tags: form.tags,
    };
    const req = initial
      ? api.put(`/api/v1/library/exercises/${initial.id}`, payload)
      : api.post<ApiEnvelope<Exercise>>("/api/v1/library/exercises", payload);
    req
      .then(() => {
        toast.success(initial ? "Exercise updated" : "Exercise created");
        onSaved();
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "Failed to save exercise"))
      .finally(() => setSaving(false));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">
            {initial ? "Edit exercise" : "New exercise"}
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </header>

        <div className="px-6 pt-5">
          <StepIndicator current={step} />
        </div>

        <div className="px-6 py-5 space-y-4">
          {step === 0 && (
            <>
              <Input
                label="Name *"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Barbell Back Squat"
                autoFocus
              />
              <Input
                label="Video URL"
                value={form.videoUrl}
                onChange={(e) => set("videoUrl", e.target.value)}
                placeholder="https://…"
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Description</label>
                <textarea
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={3}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Cues, setup, common mistakes…"
                />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Modality"
                  value={form.modality}
                  onChange={(e) => set("modality", e.target.value)}
                  placeholder="Barbell, Dumbbell…"
                />
                <Input
                  label="Equipment"
                  value={form.equipment}
                  onChange={(e) => set("equipment", e.target.value)}
                  placeholder="Rack, bench…"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Muscle group"
                  value={form.muscleGroup}
                  onChange={(e) => set("muscleGroup", e.target.value)}
                  placeholder="Quads, Back…"
                />
                <Input
                  label="Movement pattern"
                  value={form.movementPattern}
                  onChange={(e) => set("movementPattern", e.target.value)}
                  placeholder="Push, Pull, Squat…"
                />
              </div>
              <Input
                label="Category"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                placeholder="Strength, Cardio, Mobility…"
              />
              <p className="text-xs text-slate-400">
                These fields organize your library. Leave blank if unsure — you can edit later.
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <label className="text-sm font-medium text-slate-700">Tags</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  placeholder="Type a tag and press Enter"
                  className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Button type="button" variant="secondary" onClick={addTag}>Add</Button>
              </div>
              {form.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {form.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium ring-1 ring-indigo-100"
                    >
                      {t}
                      <button
                        onClick={() => set("tags", form.tags.filter((x) => x !== t))}
                        className="p-0.5 rounded-full hover:bg-indigo-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No tags yet. Tags help you filter exercises later.</p>
              )}
            </>
          )}
        </div>

        <footer className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <Button type="button" variant="ghost" onClick={step === 0 ? onClose : prev}>
            {step === 0 ? "Cancel" : <><ChevronLeft className="w-4 h-4 mr-1" /> Back</>}
          </Button>
          {step < 2 ? (
            <Button type="button" onClick={next}>
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button type="button" onClick={save} loading={saving}>
              <Check className="w-4 h-4 mr-1" />
              {initial ? "Save changes" : "Create exercise"}
            </Button>
          )}
        </footer>
      </div>
    </div>
  );
}

function StepIndicator({ current }: { current: Step }) {
  return (
    <ol className="flex items-center gap-2">
      {STEPS.map((label, idx) => {
        const active = idx === current;
        const done = idx < current;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold transition-colors",
                active && "bg-emerald-600 text-white",
                done && "bg-emerald-100 text-emerald-700",
                !active && !done && "bg-slate-100 text-slate-400"
              )}
            >
              {done ? <Check className="w-3.5 h-3.5" /> : idx + 1}
            </span>
            <span className={cn("text-xs font-medium", active ? "text-slate-900" : "text-slate-500")}>
              {label}
            </span>
            {idx < STEPS.length - 1 && <span className="w-6 h-px bg-slate-200 mx-1" />}
          </li>
        );
      })}
    </ol>
  );
}
