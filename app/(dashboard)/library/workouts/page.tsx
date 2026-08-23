"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Tag as TagIcon,
  ClipboardList,
  Activity,
  Clock,
  User,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  MoreVertical,
  Pencil,
  Copy,
  Send,
  Trash2,
  X,
  Sparkles,
} from "lucide-react";
import api from "@/lib/api";
import Spinner from "@/components/ui/Spinner";
import CreateWorkoutModal from "@/components/library/CreateWorkoutModal";
import { AssignWorkoutModal } from "@/app/(dashboard)/workout-builder/_components/assign-schedule-modals";
import { listClients, assignWorkout } from "@/lib/workout-builder-api";
import type { Client } from "@/app/(dashboard)/workout-builder/_components/data";
import { cn } from "@/lib/utils";
import type { ApiEnvelope, Workout } from "@/lib/library-types";

const PAGE_SIZE = 25;

type SortKey = "recent" | "name";

interface WorkoutRow {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
  owner: string;
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "—";
  const diff = Date.now() - then;
  const day = 86400000;
  if (diff < day) return "today";
  const days = Math.floor(diff / day);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${days < 14 ? "" : "s"} ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo`;
  return `${Math.floor(days / 365)}y`;
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function Avatar({ name }: { name: string }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 shrink-0"
      style={{ width: 24, height: 24, fontSize: 10.5, fontWeight: 700 }}
    >
      {initialsOf(name)}
    </span>
  );
}

function Th({ children, width }: { children: React.ReactNode; width?: number | string }) {
  return (
    <th
      className="text-left text-slate-500 uppercase border-b border-slate-200"
      style={{
        padding: "9px 13px",
        fontSize: 10.5,
        fontWeight: 600,
        letterSpacing: "0.05em",
        background: "#F8FAFC",
        width,
      }}
    >
      {children}
    </th>
  );
}

export default function WorkoutsPage() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("recent");
  const [assignFor, setAssignFor] = useState<WorkoutRow | null>(null);
  const [clients, setClients] = useState<Client[]>([]);

  function load() {
    setLoading(true);
    // The list endpoint returns WorkoutSummaryResponse, which carries no sections.
    // Per-workout section/exercise counts need a backend change before they can be shown here.
    api
      .get<ApiEnvelope<Workout[]>>("/api/v1/library/workouts")
      .then((r) => setWorkouts(r.data.data))
      .catch(() => toast.error("Failed to load workouts"))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  // Close any open row menu when clicking elsewhere
  useEffect(() => {
    if (!menuFor) return;
    const fn = () => setMenuFor(null);
    document.addEventListener("click", fn);
    return () => document.removeEventListener("click", fn);
  }, [menuFor]);

  const rows = useMemo<WorkoutRow[]>(() => {
    return workouts.map((w) => ({
      id: w.id,
      name: w.name,
      description: w.description ?? "",
      updatedAt: w.updatedAt,
      owner: "You",
    }));
  }, [workouts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? rows.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q),
        )
      : rows;
    const sorted = [...list];
    if (sortKey === "recent") {
      sorted.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
    } else {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    return sorted;
  }, [rows, search, sortKey]);

  useEffect(() => setPage(1), [search, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageStart = (page - 1) * PAGE_SIZE;
  const visible = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  const allChecked =
    visible.length > 0 && visible.every((r) => selected.has(r.id));

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allChecked) visible.forEach((r) => next.delete(r.id));
      else visible.forEach((r) => next.add(r.id));
      return next;
    });
  }
  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleDelete(ids: string[]) {
    if (ids.length === 0) return;
    const msg =
      ids.length === 1 ? "Delete this workout?" : `Delete ${ids.length} workouts?`;
    if (!confirm(msg)) return;
    Promise.all(ids.map((id) => api.delete(`/api/v1/library/workouts/${id}`)))
      .then(() => {
        toast.success(ids.length === 1 ? "Workout deleted" : `${ids.length} deleted`);
        setSelected(new Set());
        load();
      })
      .catch(() => toast.error("Failed to delete"));
  }

  function handleDuplicate(ids: string[]) {
    if (ids.length === 0) return;
    Promise.all(ids.map((id) => api.post(`/api/v1/library/workouts/${id}/duplicate`)))
      .then(() => {
        toast.success(ids.length === 1 ? "Workout duplicated" : `${ids.length} duplicated`);
        setSelected(new Set());
        load();
      })
      .catch(() => toast.error("Failed to duplicate"));
  }

  function openAssign(row: WorkoutRow) {
    setAssignFor(row);
    if (clients.length === 0) {
      listClients()
        .then(setClients)
        .catch(() => toast.error("Failed to load clients"));
    }
  }

  function handleAssign(picked: Client[], opts: { message: string }) {
    const target = assignFor;
    setAssignFor(null);
    if (!target || picked.length === 0) return;
    assignWorkout(target.id, picked.map((c) => c.id), opts.message || undefined)
      .then(() =>
        toast.success(
          `Assigned "${target.name}" to ${picked.length} client${picked.length === 1 ? "" : "s"}`,
        ),
      )
      .catch(() => toast.error("Failed to assign workout"));
  }

  return (
    <div className="flex flex-col gap-4" style={{ padding: "20px 28px 80px" }}>
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <h1
          className="flex items-center gap-2 text-slate-900"
          style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}
        >
          <ClipboardList className="w-5 h-5 text-indigo-600" />
          Workouts
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
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-[7px] text-[12.5px] font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            New workout
          </button>
        </div>
      </div>

      {/* Filter card */}
      <div
        className="bg-white border border-slate-200 rounded-lg flex items-center gap-2 flex-wrap"
        style={{ padding: "10px 12px" }}
      >
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workout name…"
            className="w-full bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            style={{ padding: "7px 12px 7px 32px", fontSize: 12.5 }}
          />
        </div>
        <button
          type="button"
          onClick={() => toast("More filters coming soon")}
          className="inline-flex items-center gap-1.5 text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50"
          style={{ padding: "5px 9px", fontSize: 12, fontWeight: 500 }}
        >
          <SlidersHorizontal className="w-3 h-3" />
          Filter
        </button>
        <div className="ml-auto text-[11.5px] text-slate-500">
          {filtered.length.toLocaleString()} of {rows.length.toLocaleString()} workouts
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <Spinner />
          </div>
        ) : (
          <table className="w-full" style={{ borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <Th width={36}>
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </Th>
                <Th>
                  <button
                    type="button"
                    onClick={() => setSortKey("name")}
                    className="inline-flex items-center gap-1 hover:text-slate-700 uppercase"
                  >
                    <ArrowRight
                      className="w-2.5 h-2.5 opacity-50"
                      style={{ transform: "rotate(90deg)" }}
                    />
                    Workouts
                    <span className="text-slate-400 normal-case font-medium ml-0.5">
                      ({filtered.length})
                    </span>
                    <ChevronDown className="w-2.5 h-2.5 ml-0.5" />
                  </button>
                </Th>
                <Th>
                  <span className="inline-flex items-center gap-1">
                    <TagIcon className="w-2.5 h-2.5" />
                    Tags
                  </span>
                </Th>
                <Th width={120}>
                  <span className="inline-flex items-center gap-1">
                    <Activity className="w-2.5 h-2.5" />
                    Exercises
                  </span>
                </Th>
                <Th width={140}>
                  <button
                    type="button"
                    onClick={() => setSortKey("recent")}
                    className={cn(
                      "inline-flex items-center gap-1 uppercase",
                      sortKey === "recent" ? "text-indigo-600" : "hover:text-slate-700",
                    )}
                  >
                    <Clock className="w-2.5 h-2.5" />
                    Most recent
                    <ChevronDown className="w-2.5 h-2.5" />
                  </button>
                </Th>
                <Th width={160}>
                  <span className="inline-flex items-center gap-1">
                    <User className="w-2.5 h-2.5" />
                    Owner
                  </span>
                </Th>
                <Th width={36}>{""}</Th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center text-slate-500"
                    style={{ padding: "40px 16px" }}
                  >
                    No workouts match.
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        className="ml-1 text-indigo-600 font-medium"
                      >
                        Clear search
                      </button>
                    )}
                  </td>
                </tr>
              )}
              {visible.map((row) => {
                const on = selected.has(row.id);
                return (
                  <tr
                    key={row.id}
                    onClick={() => router.push(`/library/workouts/${row.id}`)}
                    className={cn(
                      "border-t border-slate-100 cursor-pointer transition-colors group",
                      on ? "bg-indigo-50" : "bg-white hover:bg-slate-50",
                    )}
                    style={{ verticalAlign: "top" }}
                  >
                    <Td onClick={(e) => { e.stopPropagation(); toggle(row.id); }}>
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => {}}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </Td>
                    <Td>
                      <div
                        className="text-slate-900"
                        style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 3 }}
                      >
                        {row.name}
                      </div>
                      {row.description && (
                        <div
                          className="text-slate-500 truncate"
                          style={{
                            fontSize: 12,
                            lineHeight: 1.45,
                            maxWidth: 520,
                          }}
                        >
                          {row.description}
                        </div>
                      )}
                    </Td>
                    <Td>
                      <span className="text-slate-300" style={{ fontSize: 12 }}>—</span>
                    </Td>
                    <Td>
                      <span className="text-slate-300" style={{ fontSize: 12 }}>—</span>
                    </Td>
                    <Td>
                      <span className="text-slate-700" style={{ fontSize: 12.5 }}>
                        {relativeTime(row.updatedAt)}
                      </span>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <Avatar name={row.owner} />
                        <span className="text-slate-700" style={{ fontSize: 12 }}>
                          {row.owner}
                        </span>
                      </div>
                    </Td>
                    <Td
                      onClick={(e) => e.stopPropagation()}
                      className="relative whitespace-nowrap text-right"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuFor(menuFor === row.id ? null : row.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                        aria-label="Row actions"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                      {menuFor === row.id && (
                        <div
                          className="absolute right-2 z-30 bg-white border border-slate-200 rounded-md shadow-lg"
                          style={{ top: 30, minWidth: 160, padding: 5 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MenuItem
                            Icon={Pencil}
                            onClick={() => {
                              setMenuFor(null);
                              router.push(`/library/workouts/${row.id}`);
                            }}
                          >
                            Edit
                          </MenuItem>
                          <MenuItem
                            Icon={Copy}
                            onClick={() => {
                              setMenuFor(null);
                              handleDuplicate([row.id]);
                            }}
                          >
                            Duplicate
                          </MenuItem>
                          <MenuItem
                            Icon={Send}
                            onClick={() => {
                              setMenuFor(null);
                              openAssign(row);
                            }}
                          >
                            Assign to client
                          </MenuItem>
                          <div
                            className="bg-slate-100"
                            style={{ height: 1, margin: "4px 0" }}
                          />
                          <MenuItem
                            Icon={Trash2}
                            danger
                            onClick={() => {
                              setMenuFor(null);
                              handleDelete([row.id]);
                            }}
                          >
                            Delete
                          </MenuItem>
                        </div>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination footer */}
        <div
          className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60"
          style={{ padding: "10px 14px", fontSize: 11.5, color: "#64748B" }}
        >
          <span>
            {selected.size > 0
              ? `${selected.size} selected`
              : `Showing ${visible.length === 0 ? 0 : pageStart + 1}–${pageStart + visible.length} of ${filtered.length}`}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1 text-slate-500 hover:bg-slate-100 rounded disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span
              className="bg-white border border-slate-200 rounded text-slate-700"
              style={{ padding: "4px 10px", fontWeight: 600 }}
            >
              {page}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 text-slate-500 hover:bg-slate-100 rounded disabled:opacity-40"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div
          className="fixed bg-slate-900 text-white rounded-xl shadow-2xl flex items-center gap-3 z-50"
          style={{
            bottom: 24,
            left: "calc(50% + 106px)",
            transform: "translateX(-50%)",
            padding: "9px 14px",
          }}
        >
          <span style={{ fontSize: 12.5, fontWeight: 500 }}>
            {selected.size} selected
          </span>
          <div className="bg-slate-700" style={{ width: 1, height: 18 }} />
          <button
            type="button"
            onClick={() => handleDuplicate(Array.from(selected))}
            className="inline-flex items-center gap-1 text-slate-200 hover:text-white"
            style={{ fontSize: 12, fontWeight: 500 }}
          >
            <Copy className="w-3 h-3" />
            Duplicate
          </button>
          <button
            type="button"
            onClick={() => toast("Tag coming soon")}
            className="inline-flex items-center gap-1 text-slate-200 hover:text-white"
            style={{ fontSize: 12, fontWeight: 500 }}
          >
            <TagIcon className="w-3 h-3" />
            Tag
          </button>
          <button
            type="button"
            onClick={() => handleDelete(Array.from(selected))}
            className="inline-flex items-center gap-1 text-rose-300 hover:text-rose-200"
            style={{ fontSize: 12, fontWeight: 500 }}
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="text-slate-400 hover:text-white"
            aria-label="Clear selection"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <CreateWorkoutModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={(id) => {
          setShowModal(false);
          load();
          router.push(`/library/workouts/${id}`);
        }}
      />
      <AssignWorkoutModal
        open={assignFor !== null}
        clients={clients}
        workoutName={assignFor?.name}
        workoutId={assignFor?.id ?? null}
        onClose={() => setAssignFor(null)}
        onAssign={handleAssign}
      />
    </div>
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
      className={cn("align-top", className)}
      style={{ padding: "12px 13px" }}
      onClick={onClick}
    >
      {children}
    </td>
  );
}

function MenuItem({
  Icon,
  danger,
  children,
  onClick,
}: {
  Icon: typeof Pencil;
  danger?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 w-full text-left rounded transition-colors",
        danger
          ? "text-rose-600 hover:bg-rose-50"
          : "text-slate-700 hover:bg-slate-50",
      )}
      style={{ padding: "6px 9px", fontSize: 12.5, fontWeight: 500 }}
    >
      <Icon className="w-3 h-3" />
      {children}
    </button>
  );
}
