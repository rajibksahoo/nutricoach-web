"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Tag as TagIcon,
  Trash2,
  Play,
  Pencil,
} from "lucide-react";
import api from "@/lib/api";
import Spinner from "@/components/ui/Spinner";
import AddExerciseModal from "@/components/library/AddExerciseModal";
import { cn, formatDate } from "@/lib/utils";
import type { ApiEnvelope, Exercise } from "@/lib/library-types";

const TAG_PALETTE = [
  "bg-indigo-50 text-indigo-700 ring-indigo-100",
  "bg-sky-50 text-sky-700 ring-sky-100",
  "bg-emerald-50 text-emerald-700 ring-emerald-100",
  "bg-amber-50 text-amber-700 ring-amber-100",
  "bg-rose-50 text-rose-700 ring-rose-100",
  "bg-violet-50 text-violet-700 ring-violet-100",
];

function tagColor(tag: string) {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) >>> 0;
  return TAG_PALETTE[h % TAG_PALETTE.length];
}

function Cell({ value }: { value?: string | null }) {
  if (!value) return <span className="text-slate-300">—</span>;
  return <span className="text-slate-700">{value}</span>;
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Exercise | null>(null);
  const [showModal, setShowModal] = useState(false);

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
    if (!q) return exercises;
    return exercises.filter((ex) =>
      [ex.name, ex.muscleGroup, ex.modality, ex.movementPattern, ex.category, ex.equipment]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(q))
    );
  }, [exercises, search]);

  const allChecked = filtered.length > 0 && filtered.every((ex) => selected.has(ex.id));
  const someChecked = filtered.some((ex) => selected.has(ex.id)) && !allChecked;

  function toggleAll() {
    if (allChecked) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((ex) => ex.id)));
    }
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

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Exercises</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Reusable exercises you can drop into any workout section.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button
          type="button"
          onClick={() => toast("Filters coming soon")}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filter
        </button>
        <button
          type="button"
          onClick={() => toast("Tag browser coming soon")}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
        >
          <TagIcon className="w-4 h-4" />
          Tags
        </button>
        <div className="flex-1" />
        {selected.size > 0 && (
          <button
            type="button"
            onClick={() => handleDelete(Array.from(selected))}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete ({selected.size})
          </button>
        )}
        <button
          type="button"
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add New Exercise
        </button>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><Spinner /></div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-left">
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={(el) => { if (el) el.indeterminate = someChecked; }}
                    onChange={toggleAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    disabled={filtered.length === 0}
                  />
                </th>
                <Th>Exercise Name</Th>
                <Th>Tags</Th>
                <Th>Modality</Th>
                <Th>Muscle Group</Th>
                <Th>Movement Pattern</Th>
                <Th>Category</Th>
                <Th>Most Recent</Th>
                <th className="w-10 px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center">
                    <p className="text-sm text-slate-500">
                      {search
                        ? `No exercises match "${search}".`
                        : "No exercises yet. Click Add New Exercise to create one."}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((ex) => {
                  const checked = selected.has(ex.id);
                  return (
                    <tr
                      key={ex.id}
                      className={cn(
                        "border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 transition-colors group",
                        checked && "bg-blue-50/40"
                      )}
                    >
                      <td className="px-3 py-3 align-middle">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(ex.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-3 align-middle">
                        <button
                          type="button"
                          onClick={() => { setEditing(ex); setShowModal(true); }}
                          className="flex items-center gap-3 text-left"
                        >
                          <Thumb video={ex.videoUrl} />
                          <div className="min-w-0">
                            <div className="font-medium text-slate-900 truncate max-w-[220px]">
                              {ex.name}
                            </div>
                            {ex.description && (
                              <div className="text-xs text-slate-500 truncate max-w-[220px]">
                                {ex.description}
                              </div>
                            )}
                          </div>
                        </button>
                      </td>
                      <td className="px-3 py-3 align-middle">
                        {ex.tags && ex.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {ex.tags.slice(0, 3).map((t) => (
                              <span
                                key={t}
                                className={cn(
                                  "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ring-1",
                                  tagColor(t)
                                )}
                              >
                                {t}
                              </span>
                            ))}
                            {ex.tags.length > 3 && (
                              <span className="text-xs text-slate-400">+{ex.tags.length - 3}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 align-middle"><Cell value={ex.modality ?? ex.equipment} /></td>
                      <td className="px-3 py-3 align-middle"><Cell value={ex.muscleGroup} /></td>
                      <td className="px-3 py-3 align-middle"><Cell value={ex.movementPattern} /></td>
                      <td className="px-3 py-3 align-middle"><Cell value={ex.category} /></td>
                      <td className="px-3 py-3 align-middle text-slate-500 text-xs">
                        {formatDate(ex.updatedAt)}
                      </td>
                      <td className="px-3 py-3 align-middle">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setEditing(ex); setShowModal(true); }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete([ex.id])}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
      {children}
    </th>
  );
}

function Thumb({ video }: { video?: string | null }) {
  return (
    <div className="flex items-center justify-center w-10 h-10 rounded-md bg-slate-100 ring-1 ring-slate-200 shrink-0">
      <Play className={cn("w-4 h-4", video ? "text-blue-600" : "text-slate-300")} fill={video ? "currentColor" : "none"} />
    </div>
  );
}
