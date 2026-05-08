"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Plus, Calendar, ChevronRight, Trash2 } from "lucide-react";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";
import type { ApiEnvelope, ProgramSummary } from "@/lib/library-types";

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<ProgramSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  function load() {
    setLoading(true);
    api
      .get<ApiEnvelope<ProgramSummary[]>>("/api/v1/library/programs")
      .then((r) => setPrograms(r.data.data))
      .catch(() => toast.error("Failed to load programs"))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function handleDelete(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this program?")) return;
    api
      .delete(`/api/v1/library/programs/${id}`)
      .then(() => { toast.success("Program deleted"); load(); })
      .catch(() => toast.error("Failed to delete"));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">
          Multi-day fitness programs built from your workout library.
        </p>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-1" /> New program
        </Button>
      </div>

      {showForm && (
        <ProgramForm
          onClose={() => setShowForm(false)}
          onSaved={(id) => {
            setShowForm(false);
            load();
            if (id) window.location.href = `/library/programs/${id}`;
          }}
        />
      )}

      {loading ? (
        <div className="py-12 flex justify-center"><Spinner /></div>
      ) : programs.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-slate-500">
            No programs yet. Create your first one above.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {programs.map((p) => (
            <Link key={p.id} href={`/library/programs/${p.id}`}>
              <Card className="hover:border-indigo-300 hover:shadow transition cursor-pointer">
                <CardContent className="flex items-center gap-3 py-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{p.name}</h3>
                    {p.description && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{p.description}</p>
                    )}
                  </div>
                  <div className="flex items-center text-xs text-slate-500 shrink-0">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    {p.durationDays} days
                  </div>
                  <button
                    onClick={(e) => handleDelete(p.id, e)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function ProgramForm({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (id?: string) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [durationDays, setDurationDays] = useState("30");
  const [saving, setSaving] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name is required");
    const days = Number(durationDays);
    if (!days || days < 1 || days > 365) return toast.error("Duration must be 1–365 days");
    setSaving(true);
    api
      .post<ApiEnvelope<ProgramSummary>>("/api/v1/library/programs", {
        name,
        description: description || null,
        durationDays: days,
      })
      .then((r) => { toast.success("Program created"); onSaved(r.data.data.id); })
      .catch((err) =>
        toast.error(err.response?.data?.message ?? "Failed to save program")
      )
      .finally(() => setSaving(false));
  }

  return (
    <Card className="mb-4">
      <CardContent>
        <form onSubmit={submit} className="space-y-3">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. 30-Day Push-Pull-Legs"
            required
          />
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional"
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Duration (days)</label>
            <select
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="30">30 days</option>
              <option value="45">45 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
            </select>
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="submit" loading={saving}>Create</Button>
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
