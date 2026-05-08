"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Tag as TagIcon,
  Trash2,
  Pencil,
  Copy,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  X,
  Dumbbell,
  HeartPulse,
  Clock,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import api from "@/lib/api";
import Spinner from "@/components/ui/Spinner";
import AddExerciseModal from "@/components/library/AddExerciseModal";
import { cn } from "@/lib/utils";
import type { ApiEnvelope, Exercise } from "@/lib/library-types";
import { CATEGORIES, getCategory, type CategoryKey } from "@/lib/library-categories";

const PAGE_SIZE = 25;

const MUSCLE_QUICK = [
  "Full body", "Shoulders", "Lower back", "Hip & groin",
  "Quads", "Hamstrings", "Lower leg", "Glutes",
];
const MUSCLE_MORE = [
  "Chest", "Mid back", "Upper back", "Biceps", "Triceps", "Core",
];

function rowIconFor(ex: Exercise): LucideIcon {
  const eq = (ex.equipment ?? ex.modality ?? "").toLowerCase();
  const cat = (ex.category ?? "").toLowerCase();
  if (eq.includes("bodyweight")) return HeartPulse;
  if (cat === "cardio" || eq.includes("cardio") || eq.includes("timed")) return Clock;
  return Dumbbell;
}

function Cell({ value }: { value?: string | null }) {
  if (!value) return <span className="text-slate-300">—</span>;
  return <span className="text-slate-700">{value}</span>;
}

function Chip({
  active,
  onClick,
  color,
  tint,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  color?: string;
  tint?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11.5px] font-medium whitespace-nowrap transition-colors",
        active
          ? cn(tint ?? "bg-indigo-50", color ?? "text-indigo-700", "border-current")
          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
      )}
    >
      {children}
    </button>
  );
}

function CatBadge({ catKey }: { catKey?: string | null }) {
  const c = getCategory(catKey);
  if (!c) return <span className="text-slate-300">—</span>;
  const Icon = c.Icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium",
        c.tint,
        c.color
      )}
    >
      <Icon className="w-3 h-3" />
      {c.label}
    </span>
  );
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<"all" | CategoryKey>("all");
  const [activeMuscle, setActiveMuscle] = useState("all");
  const [customOnly, setCustomOnly] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Exercise | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);

  function load() {
    setLoading(true);
    api
      .get<ApiEnvelope<Exercise[]>>("/api/v1/library/exercises")
      .then((r) => setExercises(r.data.data))
      .catch(() => toast.error("Failed to load exercises"))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return exercises.filter((ex) => {
      if (activeCat !== "all" && (ex.category ?? "").toLowerCase() !== activeCat) return false;
      if (activeMuscle !== "all" && ex.muscleGroup !== activeMuscle) return false;
      if (customOnly && ex.tags?.includes("pre-seeded")) return false;
      if (!q) return true;
      return [ex.name, ex.muscleGroup, ex.modality, ex.movementPattern, ex.category, ex.equipment]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(q));
    });
  }, [exercises, search, activeCat, activeMuscle, customOnly]);

  useEffect(() => { setPage(1); }, [search, activeCat, activeMuscle, customOnly]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageStart = (page - 1) * PAGE_SIZE;
  const visible = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  const allChecked = visible.length > 0 && visible.every((ex) => selected.has(ex.id));
  const someChecked = visible.some((ex) => selected.has(ex.id)) && !allChecked;

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allChecked) visible.forEach((ex) => next.delete(ex.id));
      else visible.forEach((ex) => next.add(ex.id));
      return next;
    });
  }
  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleDelete(ids: string[]) {
    if (ids.length === 0) return;
    const msg = ids.length === 1 ? "Delete this exercise?" : `Delete ${ids.length} exercises?`;
    if (!confirm(msg)) return;
    Promise.all(ids.map((id) => api.delete(`/api/v1/library/exercises/${id}`)))
      .then(() => {
        toast.success(ids.length === 1 ? "Exercise deleted" : `${ids.length} exercises deleted`);
        setSelected(new Set());
        load();
      })
      .catch(() => toast.error("Failed to delete"));
  }

  function handleDuplicate(ex: Exercise) {
    const payload = {
      name: `${ex.name} (copy)`,
      videoUrl: ex.videoUrl ?? null,
      description: ex.description ?? null,
      modality: ex.modality ?? null,
      muscleGroup: ex.muscleGroup ?? null,
      movementPattern: ex.movementPattern ?? null,
      category: ex.category ?? null,
      equipment: ex.equipment ?? null,
      tags: ex.tags ?? [],
    };
    api
      .post("/api/v1/library/exercises", payload)
      .then(() => { toast.success("Exercise duplicated"); load(); })
      .catch(() => toast.error("Failed to duplicate"));
  }

  return (
    <div className="flex flex-col gap-4" style={{ padding: "20px 28px 80px" }}>
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <h1
          className="flex items-center gap-2 text-slate-900"
          style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}
        >
          <Dumbbell className="w-5 h-5 text-indigo-600" />
          Exercise Library
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toast("Tag browser coming soon")}
            className="inline-flex items-center gap-1.5 px-3 py-[7px] text-[12.5px] font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50"
          >
            <TagIcon className="w-3.5 h-3.5" />
            Tags
          </button>
          <button
            type="button"
            onClick={() => toast("NutriCoach AI coming soon")}
            className="inline-flex items-center gap-1.5 px-3 py-[7px] text-[12.5px] font-semibold rounded-md shadow-sm text-amber-900 border border-amber-500"
            style={{ background: "linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)" }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            NutriCoach AI
          </button>
          <div className="w-px h-5 bg-slate-200 mx-0.5" />
          <button
            type="button"
            onClick={() => { setEditing(null); setShowModal(true); }}
            className="inline-flex items-center gap-1.5 px-3 py-[7px] text-[12.5px] font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            New exercise
          </button>
        </div>
      </div>

      {/* Filter bar card */}
      <div
        className="bg-white border border-slate-200 rounded-lg flex flex-col"
        style={{ padding: "12px 14px", gap: 10 }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exercise name…"
              className="w-full bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{ padding: "7px 36px 7px 32px", fontSize: 12.5 }}
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[10px] bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">
              ⌘K
            </kbd>
          </div>
          <button
            type="button"
            onClick={() => toast("More filters coming soon")}
            className="inline-flex items-center gap-1.5 text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50"
            style={{ padding: "5px 9px", fontSize: 12, fontWeight: 500 }}
          >
            <SlidersHorizontal className="w-3 h-3" />
            More filters
          </button>
          <label className="inline-flex items-center gap-1.5 text-[12px] text-slate-600 cursor-pointer ml-1">
            <input
              type="checkbox"
              checked={customOnly}
              onChange={(e) => setCustomOnly(e.target.checked)}
              className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
            />
            Custom only
          </label>
          <div className="ml-auto text-[11.5px] text-slate-500">
            {filtered.length.toLocaleString()} of {exercises.length.toLocaleString()} exercises
          </div>
        </div>

        {/* Category chips */}
        <div className="flex gap-1.5 flex-wrap">
          <Chip active={activeCat === "all"} onClick={() => setActiveCat("all")}>
            All categories
          </Chip>
          {CATEGORIES.map((c) => {
            const Icon = c.Icon;
            return (
              <Chip
                key={c.key}
                active={activeCat === c.key}
                onClick={() => setActiveCat(c.key)}
                color={c.color}
                tint={c.tint}
              >
                <Icon className="w-3 h-3" />
                {c.label}
              </Chip>
            );
          })}
        </div>

        {/* Muscle chips — fixed quick-pick list with horizontal scroll */}
        <div className="flex gap-1.5 items-center overflow-x-auto pb-0.5">
          <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 mr-1 shrink-0">
            Muscle
          </span>
          <div className="shrink-0">
            <Chip active={activeMuscle === "all"} onClick={() => setActiveMuscle("all")}>
              All
            </Chip>
          </div>
          {MUSCLE_QUICK.map((m) => (
            <div key={m} className="shrink-0">
              <Chip active={activeMuscle === m} onClick={() => setActiveMuscle(m)}>
                {m}
              </Chip>
            </div>
          ))}
          <div className="shrink-0">
            <Chip onClick={() => toast("More muscle filters coming soon")}>
              +{MUSCLE_MORE.length} more <ChevronDown className="w-3 h-3" />
            </Chip>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-16 flex justify-center"><Spinner /></div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
          <table className="w-full" style={{ fontSize: 13 }}>
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-left">
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={(el) => { if (el) el.indeterminate = someChecked; }}
                    onChange={toggleAll}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    disabled={visible.length === 0}
                  />
                </th>
                <Th sortable>Exercise <span className="text-slate-400 font-medium">({filtered.length})</span></Th>
                <Th>Source</Th>
                <Th sortable>Category</Th>
                <Th sortable>Muscle group</Th>
                <Th>Movement pattern</Th>
                <Th>Equipment</Th>
                <th className="w-10 px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <p className="text-sm text-slate-500">
                      {search || activeCat !== "all" || activeMuscle !== "all" || customOnly ? (
                        <>
                          No exercises match.{" "}
                          <button
                            type="button"
                            onClick={() => {
                              setSearch("");
                              setActiveCat("all");
                              setActiveMuscle("all");
                              setCustomOnly(false);
                            }}
                            className="text-indigo-600 font-medium hover:underline"
                          >
                            Clear filters
                          </button>
                        </>
                      ) : (
                        "No exercises yet. Click New exercise to create one."
                      )}
                    </p>
                  </td>
                </tr>
              ) : (
                visible.map((ex) => {
                  const checked = selected.has(ex.id);
                  return (
                    <tr
                      key={ex.id}
                      onClick={() => { setEditing(ex); setShowModal(true); }}
                      className={cn(
                        "border-t border-slate-100 hover:bg-slate-50/60 transition-colors group cursor-pointer",
                        checked && "bg-indigo-50/40"
                      )}
                    >
                      <Td onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(ex.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </Td>
                      <Td>
                        <div className="flex items-center gap-3">
                          <RowThumb ex={ex} />
                          <div className="min-w-0">
                            <div className="font-medium text-slate-900 truncate max-w-[260px]">
                              {ex.name}
                            </div>
                            {ex.description && (
                              <div className="text-[11.5px] text-slate-500 truncate max-w-[260px]">
                                {ex.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </Td>
                      <Td>
                        {ex.tags?.includes("pre-seeded") ? (
                          <span className="text-[11px] text-slate-400">Pre-seeded</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 text-[10.5px] font-medium ring-1 ring-violet-200">
                            <Sparkles className="w-2.5 h-2.5" />
                            Custom
                          </span>
                        )}
                      </Td>
                      <Td><CatBadge catKey={ex.category} /></Td>
                      <Td><Cell value={ex.muscleGroup} /></Td>
                      <Td className="text-[12px]"><Cell value={ex.movementPattern} /></Td>
                      <Td className="text-[12px]"><Cell value={ex.equipment ?? ex.modality} /></Td>
                      <Td
                        className="text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center gap-0.5">
                          <div className="inline-flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => { setEditing(ex); setShowModal(true); }}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDuplicate(ex)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                              title="Duplicate"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete([ex.id])}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button
                            onClick={() => toast("Row actions coming soon")}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                            title="More"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </Td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Pagination footer */}
          <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-slate-100 bg-slate-50/60 text-[11.5px] text-slate-500">
            <span>
              {filtered.length === 0
                ? "No results"
                : `Showing ${pageStart + 1}–${Math.min(filtered.length, pageStart + PAGE_SIZE)} of ${filtered.length}`}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1 rounded text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2.5 py-0.5 text-[12px] font-semibold text-slate-700 bg-white border border-slate-200 rounded">
                {page}
              </span>
              <span className="text-slate-400">/ {totalPages}</span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1 rounded text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating bulk-action bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-900 text-white shadow-lg">
          <span className="text-[12.5px] font-medium">{selected.size} selected</span>
          <span className="w-px h-4 bg-slate-700" />
          <button
            type="button"
            onClick={() => toast("Add to workout coming soon")}
            className="inline-flex items-center gap-1.5 px-2 py-1 text-[12px] font-medium text-slate-100 hover:bg-slate-800 rounded"
          >
            <Plus className="w-3 h-3" />
            Add to workout
          </button>
          <button
            type="button"
            onClick={() => toast("Bulk tag coming soon")}
            className="inline-flex items-center gap-1.5 px-2 py-1 text-[12px] font-medium text-slate-100 hover:bg-slate-800 rounded"
          >
            <TagIcon className="w-3 h-3" />
            Tag
          </button>
          <button
            type="button"
            onClick={() => handleDelete(Array.from(selected))}
            className="inline-flex items-center gap-1.5 px-2 py-1 text-[12px] font-medium text-red-300 hover:bg-slate-800 rounded"
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {showModal && (
        <AddExerciseModal
          initial={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSaved={() => { setShowModal(false); setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function Th({ children, sortable }: { children: React.ReactNode; sortable?: boolean }) {
  return (
    <th
      className="text-left text-[10.5px] font-semibold uppercase tracking-[0.05em] text-slate-500"
      style={{ padding: "9px 13px" }}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortable && <ChevronDown className="w-3 h-3 text-slate-400" />}
      </span>
    </th>
  );
}

function Td({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLTableCellElement>) => void;
}) {
  return (
    <td
      className={cn("align-middle", className)}
      style={{ padding: "10px 13px" }}
      onClick={onClick}
    >
      {children}
    </td>
  );
}

function RowThumb({ ex }: { ex: Exercise }) {
  const Icon = rowIconFor(ex);
  const hasVideo = !!ex.videoUrl;
  return (
    <div className="flex items-center justify-center w-9 h-9 rounded-md bg-slate-100 ring-1 ring-slate-200 shrink-0">
      <Icon className={cn("w-4 h-4", hasVideo ? "text-indigo-600" : "text-slate-500")} />
    </div>
  );
}
