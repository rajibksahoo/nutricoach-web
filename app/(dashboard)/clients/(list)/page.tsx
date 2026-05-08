"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  Users,
  UserPlus,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Trash2,
  Pencil,
  X,
  Mail,
} from "lucide-react";
import api from "@/lib/api";
import Spinner from "@/components/ui/Spinner";
import Badge, { clientStatusBadge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 25;

const STATUS_CHIPS = [
  { key: "all",        label: "All" },
  { key: "ACTIVE",     label: "Active" },
  { key: "ONBOARDING", label: "Onboarding" },
  { key: "PAUSED",     label: "Paused" },
  { key: "INACTIVE",   label: "Inactive" },
] as const;
type StatusKey = (typeof STATUS_CHIPS)[number]["key"];

interface Client {
  id: string;
  name: string;
  phone: string;
  status: string;
  goal: string | null;
  createdAt: string;
}

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11.5px] font-medium whitespace-nowrap transition-colors",
        active
          ? "bg-emerald-50 text-emerald-700 border-current"
          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
      )}
    >
      {children}
    </button>
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
    <td className={cn("align-middle", className)} style={{ padding: "10px 13px" }} onClick={onClick}>
      {children}
    </td>
  );
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return ""; }
}

function ClientsListInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = (searchParams.get("status") ?? "all") as StatusKey;

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  function load() {
    setLoading(true);
    api
      .get("/api/v1/clients")
      .then((r) => setClients(r.data.data))
      .catch(() => toast.error("Failed to load clients"))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  function setStatus(next: StatusKey) {
    const qs = next === "all" ? "" : `?status=${next}`;
    router.replace(`/clients${qs}`, { scroll: false });
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clients.filter((c) => {
      if (statusParam !== "all" && c.status !== statusParam) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.goal ?? "").toLowerCase().includes(q)
      );
    });
  }, [clients, search, statusParam]);

  useEffect(() => { setPage(1); }, [search, statusParam]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageStart = (page - 1) * PAGE_SIZE;
  const visible = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  const allChecked = visible.length > 0 && visible.every((c) => selected.has(c.id));
  const someChecked = visible.some((c) => selected.has(c.id)) && !allChecked;

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allChecked) visible.forEach((c) => next.delete(c.id));
      else visible.forEach((c) => next.add(c.id));
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
    const msg = ids.length === 1 ? "Delete this client?" : `Delete ${ids.length} clients?`;
    if (!confirm(msg)) return;
    Promise.all(ids.map((id) => api.delete(`/api/v1/clients/${id}`)))
      .then(() => {
        toast.success(ids.length === 1 ? "Client deleted" : `${ids.length} clients deleted`);
        setSelected(new Set());
        load();
      })
      .catch(() => toast.error("Failed to delete"));
  }

  return (
    <div className="flex flex-col gap-4" style={{ padding: "20px 28px 80px" }}>
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <h1
          className="flex items-center gap-2 text-slate-900"
          style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}
        >
          <Users className="w-5 h-5 text-emerald-600" />
          Clients
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toast("Bulk message coming soon")}
            className="inline-flex items-center gap-1.5 px-3 py-[7px] text-[12.5px] font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50"
          >
            <Mail className="w-3.5 h-3.5" />
            Message
          </button>
          <div className="w-px h-5 bg-slate-200 mx-0.5" />
          <Link
            href="/clients/new"
            className="inline-flex items-center gap-1.5 px-3 py-[7px] text-[12.5px] font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-700 shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            New client
          </Link>
        </div>
      </div>

      {/* Filter bar */}
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
              placeholder="Search name, phone or goal…"
              className="w-full bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
          <div className="ml-auto text-[11.5px] text-slate-500">
            {filtered.length.toLocaleString()} of {clients.length.toLocaleString()} clients
          </div>
        </div>

        {/* Status chips */}
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_CHIPS.map((s) => (
            <Chip key={s.key} active={statusParam === s.key} onClick={() => setStatus(s.key)}>
              {s.label}
            </Chip>
          ))}
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
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    disabled={visible.length === 0}
                  />
                </th>
                <Th sortable>Client <span className="text-slate-400 font-medium">({filtered.length})</span></Th>
                <Th>Phone</Th>
                <Th sortable>Status</Th>
                <Th>Goal</Th>
                <Th sortable>Joined</Th>
                <th className="w-10 px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <p className="text-sm text-slate-500">
                      {search || statusParam !== "all" ? (
                        <>
                          No clients match.{" "}
                          <button
                            type="button"
                            onClick={() => { setSearch(""); setStatus("all"); }}
                            className="text-emerald-600 font-medium hover:underline"
                          >
                            Clear filters
                          </button>
                        </>
                      ) : (
                        <>
                          No clients yet.{" "}
                          <Link href="/clients/new" className="text-emerald-600 font-medium hover:underline">
                            Add your first client
                          </Link>
                        </>
                      )}
                    </p>
                  </td>
                </tr>
              ) : (
                visible.map((c) => {
                  const checked = selected.has(c.id);
                  return (
                    <tr
                      key={c.id}
                      onClick={() => router.push(`/clients/${c.id}`)}
                      className={cn(
                        "border-t border-slate-100 hover:bg-slate-50/60 transition-colors group cursor-pointer",
                        checked && "bg-emerald-50/40"
                      )}
                    >
                      <Td onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(c.id)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </Td>
                      <Td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md bg-emerald-100 ring-1 ring-emerald-200 flex items-center justify-center text-emerald-700 font-semibold text-sm shrink-0">
                            {c.name[0]?.toUpperCase() ?? "?"}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-slate-900 truncate max-w-[260px]">
                              {c.name}
                            </div>
                          </div>
                        </div>
                      </Td>
                      <Td className="text-[12px] text-slate-700">{c.phone}</Td>
                      <Td>
                        <Badge variant={clientStatusBadge(c.status)}>{c.status}</Badge>
                      </Td>
                      <Td className="text-[12px]">
                        {c.goal ? <span className="text-slate-700">{c.goal}</span> : <span className="text-slate-300">—</span>}
                      </Td>
                      <Td className="text-[12px] text-slate-500">{formatDate(c.createdAt)}</Td>
                      <Td className="text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-0.5">
                          <div className="inline-flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link
                              href={`/clients/${c.id}`}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                              title="Open"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => handleDelete([c.id])}
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
            onClick={() => toast("Bulk message coming soon")}
            className="inline-flex items-center gap-1.5 px-2 py-1 text-[12px] font-medium text-slate-100 hover:bg-slate-800 rounded"
          >
            <Mail className="w-3 h-3" />
            Message
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
    </div>
  );
}

export default function ClientsListPage() {
  return (
    <Suspense fallback={<div className="py-16 flex justify-center"><Spinner /></div>}>
      <ClientsListInner />
    </Suspense>
  );
}
