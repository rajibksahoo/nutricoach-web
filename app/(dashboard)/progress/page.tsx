"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { TrendingUp, TrendingDown, Minus, Plus, CheckSquare, Scale, Camera, Upload, Trash2 } from "lucide-react";

interface Client {
  id: string;
  name: string;
  phone: string;
  status: string;
}

interface ProgressLog {
  id: string;
  loggedDate: string;
  weightKg: number | null;
  bodyFatPercent: number | null;
  waistCm: number | null;
  chestCm: number | null;
  hipCm: number | null;
  adherencePercent: number | null;
  notes: string | null;
}

interface CheckIn {
  id: string;
  checkInDate: string;
  adherencePercent: number;
  notes: string | null;
}

interface Photo {
  id: string;
  photoType: string;
  downloadUrl: string;
  createdAt: string;
}

const TABS = ["Progress Logs", "Check-ins", "Photos", "Chart"] as const;
type Tab = (typeof TABS)[number];

export default function ProgressPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [tab, setTab] = useState<Tab>("Progress Logs");
  const [logs, setLogs] = useState<ProgressLog[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [chartLogs, setChartLogs] = useState<ProgressLog[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);

  useEffect(() => {
    api.get("/api/v1/clients")
      .then((res) => {
        const active = (res.data.data as Client[]).filter((c) => c.status === "ACTIVE" || c.status === "ONBOARDING");
        setClients(active);
        if (active.length > 0) setSelectedClient(active[0]);
      })
      .catch(() => toast.error("Failed to load clients"))
      .finally(() => setLoadingClients(false));
  }, []);

  useEffect(() => {
    if (!selectedClient || tab === "Photos" || tab === "Chart") return;
    setLoadingData(true);
    const endpoint = tab === "Progress Logs"
      ? `/api/v1/clients/${selectedClient.id}/progress`
      : `/api/v1/clients/${selectedClient.id}/check-ins`;

    api.get(endpoint)
      .then((res) => {
        if (tab === "Progress Logs") setLogs(res.data.data);
        else setCheckIns(res.data.data);
      })
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoadingData(false));
  }, [selectedClient, tab]);

  useEffect(() => {
    if (tab !== "Chart" || !selectedClient) return;
    setLoadingChart(true);
    api.get(`/api/v1/clients/${selectedClient.id}/progress/chart?days=60`)
      .then((res) => setChartLogs(res.data.data))
      .catch(() => toast.error("Failed to load chart data"))
      .finally(() => setLoadingChart(false));
  }, [selectedClient, tab]);

  useEffect(() => {
    if (tab === "Photos" && selectedClient) {
      setLoadingData(true);
      api.get(`/api/v1/clients/${selectedClient.id}/progress`)
        .then((res) => setLogs(res.data.data))
        .catch(() => toast.error("Failed to load progress logs"))
        .finally(() => setLoadingData(false));
    }
  }, [selectedClient, tab]);

  useEffect(() => {
    if (!selectedClient || !selectedLogId) return;
    setLoadingPhotos(true);
    api.get(`/api/v1/clients/${selectedClient.id}/progress/${selectedLogId}/photos`)
      .then((res) => setPhotos(res.data.data))
      .catch(() => toast.error("Failed to load photos"))
      .finally(() => setLoadingPhotos(false));
  }, [selectedClient, selectedLogId]);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-900">Progress</h1>

      {loadingClients ? (
        <div className="flex justify-center py-16"><Spinner className="w-8 h-8" /></div>
      ) : clients.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16 text-slate-400 text-sm">
            No active clients yet.
          </CardContent>
        </Card>
      ) : (
        <div className="flex gap-5 items-start">
          {/* Client list */}
          <div className="w-56 shrink-0 space-y-1">
            {clients.map((c) => (
              <button
                key={c.id}
                onClick={() => { setSelectedClient(c); setShowLogForm(false); setShowCheckInForm(false); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  selectedClient?.id === c.id
                    ? "bg-emerald-600 text-white font-medium"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <p className="font-medium truncate">{c.name}</p>
                <p className={`text-xs truncate ${selectedClient?.id === c.id ? "text-emerald-100" : "text-slate-400"}`}>
                  {c.phone}
                </p>
              </button>
            ))}
          </div>

          {/* Detail panel */}
          <div className="flex-1 space-y-4">
            {/* Tabs */}
            <div className="flex items-center justify-between">
              <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                {TABS.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setShowLogForm(false); setShowCheckInForm(false); }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {tab === "Progress Logs" && !showLogForm && (
                <Button size="sm" onClick={() => setShowLogForm(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Log Progress
                </Button>
              )}
              {tab === "Check-ins" && !showCheckInForm && (
                <Button size="sm" onClick={() => setShowCheckInForm(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Add Check-in
                </Button>
              )}
              {tab === "Photos" && selectedLogId && selectedClient && (
                <PhotoUploadButton
                  clientId={selectedClient.id}
                  logId={selectedLogId}
                  onUploaded={(p) => setPhotos((prev) => [...prev, p])}
                />
              )}
            </div>

            {/* Log progress form */}
            {showLogForm && selectedClient && (
              <LogProgressForm
                clientId={selectedClient.id}
                onSaved={(log) => { setLogs((prev) => [log, ...prev]); setShowLogForm(false); }}
                onCancel={() => setShowLogForm(false)}
              />
            )}

            {/* Check-in form */}
            {showCheckInForm && selectedClient && (
              <CheckInForm
                clientId={selectedClient.id}
                onSaved={(ci) => { setCheckIns((prev) => [ci, ...prev]); setShowCheckInForm(false); }}
                onCancel={() => setShowCheckInForm(false)}
              />
            )}

            {/* Data */}
            {tab === "Chart" ? (
              loadingChart ? (
                <div className="flex justify-center py-12"><Spinner className="w-6 h-6" /></div>
              ) : (
                <ProgressChart logs={chartLogs} />
              )
            ) : loadingData ? (
              <div className="flex justify-center py-12"><Spinner className="w-6 h-6" /></div>
            ) : tab === "Progress Logs" ? (
              <ProgressLogList logs={logs} />
            ) : tab === "Check-ins" ? (
              <CheckInList checkIns={checkIns} />
            ) : (
              <PhotosPanel
                clientId={selectedClient!.id}
                logs={logs}
                selectedLogId={selectedLogId}
                onSelectLog={(id) => { setSelectedLogId(id); setPhotos([]); }}
                photos={photos}
                loadingPhotos={loadingPhotos}
                onDeletePhoto={(id) => setPhotos((prev) => prev.filter((p) => p.id !== id))}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Log Progress Form ─────────────────────────────────────────── */

function LogProgressForm({ clientId, onSaved, onCancel }: {
  clientId: string;
  onSaved: (log: ProgressLog) => void;
  onCancel: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    loggedDate: new Date().toISOString().slice(0, 10),
    weightKg: "", bodyFatPercent: "", waistCm: "", chestCm: "", hipCm: "",
    adherencePercent: "", notes: "",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { loggedDate: form.loggedDate };
      if (form.weightKg) payload.weightKg = parseFloat(form.weightKg);
      if (form.bodyFatPercent) payload.bodyFatPercent = parseFloat(form.bodyFatPercent);
      if (form.waistCm) payload.waistCm = parseFloat(form.waistCm);
      if (form.chestCm) payload.chestCm = parseFloat(form.chestCm);
      if (form.hipCm) payload.hipCm = parseFloat(form.hipCm);
      if (form.adherencePercent) payload.adherencePercent = parseInt(form.adherencePercent);
      if (form.notes.trim()) payload.notes = form.notes.trim();
      const res = await api.post(`/api/v1/clients/${clientId}/progress`, payload);
      toast.success("Progress logged");
      onSaved(res.data.data);
    } catch {
      toast.error("Failed to save progress");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader><p className="font-semibold text-slate-900 text-sm">Log Progress</p></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Field label="Date" required>
              <input type="date" value={form.loggedDate} onChange={(e) => set("loggedDate", e.target.value)}
                required className={inputCls} />
            </Field>
            <Field label="Weight (kg)">
              <input type="number" step="0.1" min="0" placeholder="e.g. 72.5" value={form.weightKg}
                onChange={(e) => set("weightKg", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Body Fat (%)">
              <input type="number" step="0.1" min="0" max="100" placeholder="e.g. 22" value={form.bodyFatPercent}
                onChange={(e) => set("bodyFatPercent", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Waist (cm)">
              <input type="number" step="0.1" min="0" placeholder="e.g. 80" value={form.waistCm}
                onChange={(e) => set("waistCm", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Chest (cm)">
              <input type="number" step="0.1" min="0" placeholder="e.g. 95" value={form.chestCm}
                onChange={(e) => set("chestCm", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Hip (cm)">
              <input type="number" step="0.1" min="0" placeholder="e.g. 92" value={form.hipCm}
                onChange={(e) => set("hipCm", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Adherence (%)">
              <input type="number" min="0" max="100" placeholder="e.g. 80" value={form.adherencePercent}
                onChange={(e) => set("adherencePercent", e.target.value)} className={inputCls} />
            </Field>
          </div>
          <Field label="Notes">
            <textarea rows={2} placeholder="Optional notes..." value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              className={`${inputCls} resize-none`} />
          </Field>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
            <Button type="submit" size="sm" loading={saving}>Save</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

/* ── Check-in Form ─────────────────────────────────────────────── */

function CheckInForm({ clientId, onSaved, onCancel }: {
  clientId: string;
  onSaved: (ci: CheckIn) => void;
  onCancel: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    checkInDate: new Date().toISOString().slice(0, 10),
    adherencePercent: "",
    notes: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.adherencePercent) { toast.error("Adherence % is required"); return; }
    setSaving(true);
    try {
      const res = await api.post(`/api/v1/clients/${clientId}/check-ins`, {
        checkInDate: form.checkInDate,
        adherencePercent: parseInt(form.adherencePercent),
        notes: form.notes.trim() || null,
      });
      toast.success("Check-in recorded");
      onSaved(res.data.data);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      toast.error(status === 409 ? "Check-in already exists for this date" : "Failed to save check-in");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader><p className="font-semibold text-slate-900 text-sm">Record Check-in</p></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date" required>
              <input type="date" value={form.checkInDate}
                onChange={(e) => setForm((f) => ({ ...f, checkInDate: e.target.value }))}
                required className={inputCls} />
            </Field>
            <Field label="Adherence (%)" required>
              <input type="number" min="0" max="100" placeholder="e.g. 85" value={form.adherencePercent}
                onChange={(e) => setForm((f) => ({ ...f, adherencePercent: e.target.value }))}
                required className={inputCls} />
            </Field>
          </div>
          <Field label="Notes">
            <textarea rows={2} placeholder="Optional notes..." value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className={`${inputCls} resize-none`} />
          </Field>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
            <Button type="submit" size="sm" loading={saving}>Save</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

/* ── Progress Log List ─────────────────────────────────────────── */

function ProgressLogList({ logs }: { logs: ProgressLog[] }) {
  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12 text-slate-400 text-sm">
          No progress logged yet. Click "Log Progress" to add the first entry.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log, i) => {
        const prev = logs[i + 1];
        const weightDelta = log.weightKg != null && prev?.weightKg != null
          ? log.weightKg - prev.weightKg : null;

        return (
          <Card key={log.id}>
            <CardContent className="py-4">
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm font-semibold text-slate-900">
                  {formatDate(log.loggedDate)}
                </p>
                {weightDelta !== null && (
                  <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                    weightDelta < 0 ? "bg-emerald-50 text-emerald-700" :
                    weightDelta > 0 ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-500"
                  }`}>
                    {weightDelta < 0 ? <TrendingDown className="w-3 h-3" /> :
                     weightDelta > 0 ? <TrendingUp className="w-3 h-3" /> :
                     <Minus className="w-3 h-3" />}
                    {weightDelta > 0 ? "+" : ""}{weightDelta.toFixed(1)} kg
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Metric icon={<Scale className="w-3.5 h-3.5" />} label="Weight" value={log.weightKg} unit="kg" />
                <Metric label="Body Fat" value={log.bodyFatPercent} unit="%" />
                <Metric label="Waist" value={log.waistCm} unit="cm" />
                <Metric label="Adherence" value={log.adherencePercent} unit="%" highlight />
              </div>
              {(log.chestCm != null || log.hipCm != null) && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                  <Metric label="Chest" value={log.chestCm} unit="cm" />
                  <Metric label="Hip" value={log.hipCm} unit="cm" />
                </div>
              )}
              {log.notes && (
                <p className="mt-3 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">{log.notes}</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/* ── Check-in List ─────────────────────────────────────────────── */

function CheckInList({ checkIns }: { checkIns: CheckIn[] }) {
  if (checkIns.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12 text-slate-400 text-sm">
          No check-ins yet. Click "Add Check-in" to record one.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {checkIns.map((ci) => (
        <Card key={ci.id}>
          <CardContent className="flex items-center justify-between py-3.5">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-emerald-50 rounded-lg">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{formatDate(ci.checkInDate)}</p>
                {ci.notes && <p className="text-xs text-slate-400 mt-0.5">{ci.notes}</p>}
              </div>
            </div>
            <AdherenceBadge value={ci.adherencePercent} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ── Small helpers ─────────────────────────────────────────────── */

function Metric({ label, value, unit, icon, highlight }: {
  label: string; value: number | null | undefined; unit: string;
  icon?: React.ReactNode; highlight?: boolean;
}) {
  if (value == null) return null;
  return (
    <div className="flex items-center gap-1.5">
      {icon && <span className="text-slate-400">{icon}</span>}
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className={`text-sm font-semibold ${highlight ? adherenceColor(value) : "text-slate-800"}`}>
          {value}{unit}
        </p>
      </div>
    </div>
  );
}

function AdherenceBadge({ value }: { value: number }) {
  const cls = value >= 80
    ? "bg-emerald-100 text-emerald-700"
    : value >= 60
    ? "bg-amber-100 text-amber-700"
    : "bg-red-100 text-red-600";
  return (
    <span className={`text-sm font-bold px-3 py-1 rounded-full ${cls}`}>
      {value}%
    </span>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-slate-600">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}

function adherenceColor(value: number) {
  if (value >= 80) return "text-emerald-600";
  if (value >= 60) return "text-amber-600";
  return "text-red-500";
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const inputCls = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500";

/* ── Progress Chart ────────────────────────────────────────────── */

function ProgressChart({ logs }: { logs: ProgressLog[] }) {
  const withWeight = logs.filter((l) => l.weightKg != null);

  if (withWeight.length < 2) {
    return (
      <Card>
        <CardContent className="text-center py-12 text-slate-400 text-sm">
          {withWeight.length === 0
            ? "No weight data yet. Log progress with weight to see a chart."
            : "Need at least 2 data points to draw a chart."}
        </CardContent>
      </Card>
    );
  }

  const W = 600, H = 200, PAD = { top: 16, right: 16, bottom: 32, left: 44 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const weights = withWeight.map((l) => l.weightKg as number);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW || 1;

  function x(i: number) {
    return PAD.left + (i / (withWeight.length - 1)) * innerW;
  }
  function y(w: number) {
    return PAD.top + innerH - ((w - minW) / range) * innerH;
  }

  const points = withWeight.map((l, i) => `${x(i)},${y(l.weightKg as number)}`).join(" ");

  // Y-axis ticks (3 lines)
  const ticks = [minW, minW + range / 2, maxW];

  return (
    <Card>
      <CardHeader>
        <p className="text-sm font-semibold text-slate-900">Weight trend (last 60 days)</p>
      </CardHeader>
      <CardContent>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto"
          aria-label="Weight progress chart"
        >
          {/* Grid lines + Y ticks */}
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={PAD.left} y1={y(t)} x2={W - PAD.right} y2={y(t)}
                stroke="#f1f5f9" strokeWidth="1"
              />
              <text x={PAD.left - 6} y={y(t) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
                {t.toFixed(1)}
              </text>
            </g>
          ))}

          {/* Area fill */}
          <polygon
            points={`${PAD.left},${PAD.top + innerH} ${points} ${W - PAD.right},${PAD.top + innerH}`}
            fill="#d1fae5" opacity="0.5"
          />

          {/* Line */}
          <polyline points={points} fill="none" stroke="#059669" strokeWidth="2" strokeLinejoin="round" />

          {/* Data points */}
          {withWeight.map((l, i) => (
            <circle key={l.id} cx={x(i)} cy={y(l.weightKg as number)} r="4" fill="#059669" />
          ))}

          {/* X-axis labels — first, middle, last */}
          {[0, Math.floor((withWeight.length - 1) / 2), withWeight.length - 1].map((i) => (
            <text
              key={i}
              x={x(i)}
              y={H - 6}
              textAnchor="middle"
              fontSize="10"
              fill="#94a3b8"
            >
              {new Date(withWeight[i].loggedDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </text>
          ))}
        </svg>

        {/* Summary row */}
        <div className="mt-3 flex items-center gap-6 text-xs text-slate-500">
          <span><span className="font-semibold text-slate-800">{withWeight[0].weightKg} kg</span> start</span>
          <span><span className="font-semibold text-slate-800">{withWeight[withWeight.length - 1].weightKg} kg</span> latest</span>
          <span className={`font-semibold ${(withWeight[withWeight.length - 1].weightKg! - withWeight[0].weightKg!) < 0 ? "text-emerald-600" : "text-red-500"}`}>
            {(withWeight[withWeight.length - 1].weightKg! - withWeight[0].weightKg!) > 0 ? "+" : ""}
            {(withWeight[withWeight.length - 1].weightKg! - withWeight[0].weightKg!).toFixed(1)} kg change
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Photos Panel ──────────────────────────────────────────────── */

function PhotosPanel({ clientId, logs, selectedLogId, onSelectLog, photos, loadingPhotos, onDeletePhoto }: {
  clientId: string;
  logs: ProgressLog[];
  selectedLogId: string | null;
  onSelectLog: (id: string) => void;
  photos: Photo[];
  loadingPhotos: boolean;
  onDeletePhoto: (id: string) => void;
}) {
  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12 text-slate-400 text-sm">
          Log progress first to attach photos.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><p className="text-sm font-semibold text-slate-900">Select a progress log</p></CardHeader>
        <CardContent>
          <select
            value={selectedLogId ?? ""}
            onChange={(e) => onSelectLog(e.target.value)}
            className={inputCls}
          >
            <option value="">-- Choose a date --</option>
            {logs.map((l) => (
              <option key={l.id} value={l.id}>
                {formatDate(l.loggedDate)}{l.weightKg != null ? ` · ${l.weightKg} kg` : ""}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {selectedLogId && (
        loadingPhotos ? (
          <div className="flex justify-center py-12"><Spinner className="w-6 h-6" /></div>
        ) : photos.length === 0 ? (
          <Card>
            <CardContent className="text-center py-10 text-slate-400 text-sm">
              No photos for this log yet. Use "Upload Photo" above to add one.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {photos.map((p) => (
              <PhotoCard
                key={p.id}
                photo={p}
                clientId={clientId}
                logId={selectedLogId}
                onDeleted={() => onDeletePhoto(p.id)}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}

/* ── Photo Card ────────────────────────────────────────────────── */

function PhotoCard({ photo, clientId, logId, onDeleted }: {
  photo: Photo; clientId: string; logId: string; onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this photo?")) return;
    setDeleting(true);
    try {
      await api.delete(`/api/v1/clients/${clientId}/progress/${logId}/photos/${photo.id}`);
      toast.success("Photo deleted");
      onDeleted();
    } catch {
      toast.error("Failed to delete photo");
      setDeleting(false);
    }
  }

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 aspect-square group">
      <img src={photo.downloadUrl} alt={photo.photoType} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
      <div className="absolute bottom-0 left-0 right-0 p-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs font-semibold text-white drop-shadow">{photo.photoType}</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-1 rounded-lg bg-red-500/80 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ── Photo Upload Button ────────────────────────────────────────── */

const PHOTO_TYPES = ["FRONT", "SIDE", "BACK"] as const;

function PhotoUploadButton({ clientId, logId, onUploaded }: {
  clientId: string; logId: string; onUploaded: (p: Photo) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [photoType, setPhotoType] = useState<"FRONT" | "SIDE" | "BACK">("FRONT");
  const fileRef = React.useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      // 1. Get presigned URL
      const initRes = await api.post(
        `/api/v1/clients/${clientId}/progress/${logId}/photos`,
        { photoType, contentType: file.type || "image/jpeg" }
      );
      const { photoId, uploadUrl, s3Key } = initRes.data.data;

      // 2. Upload directly to S3
      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "image/jpeg" },
        body: file,
      });

      // 3. Fetch the photo record with download URL
      const listRes = await api.get(`/api/v1/clients/${clientId}/progress/${logId}/photos`);
      const uploaded = (listRes.data.data as Photo[]).find((p) => p.id === photoId);
      if (uploaded) onUploaded(uploaded);

      toast.success("Photo uploaded");
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={photoType}
        onChange={(e) => setPhotoType(e.target.value as "FRONT" | "SIDE" | "BACK")}
        className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        disabled={uploading}
      >
        {PHOTO_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      <Button size="sm" loading={uploading} onClick={() => fileRef.current?.click()}>
        <Camera className="w-3.5 h-3.5 mr-1.5" />
        {uploading ? "Uploading…" : "Upload Photo"}
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
