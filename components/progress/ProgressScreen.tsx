"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import ClientRail from "@/components/coach/ClientRail";
import ScreenHeader from "@/components/coach/ScreenHeader";
import { SCREEN_BODY, UnderlineTabs, primaryBtn } from "@/components/coach/chrome";
import Spinner from "@/components/ui/Spinner";
import { Plus } from "lucide-react";
import LogProgressForm from "./LogProgressForm";
import CheckInForm from "./CheckInForm";
import ProgressLogList from "./ProgressLogList";
import CheckInList from "./CheckInList";
import ProgressChart from "./ProgressChart";
import PhotosPanel, { PhotoUploadButton } from "./PhotosPanel";
import { TABS, type CheckIn, type Client, type Photo, type ProgressLog, type Tab } from "./types";

export default function ProgressScreen() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [tab, setTab] = useState<Tab>("Progress Logs");
  const [logs, setLogs] = useState<ProgressLog[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
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
  }, [selectedClient, tab, reloadKey]);

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

  if (loadingClients) {
    return (
      <div style={{
        minHeight: "100vh", background: "var(--bg)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
        <ScreenHeader eyebrow="Coaching" title="Progress" />
        <div style={SCREEN_BODY}>
          <div style={{
            padding: "40px 20px", textAlign: "center",
            border: "1px dashed var(--border)", borderRadius: 10,
            color: "var(--fg3)", fontSize: 12.5,
          }}>
            <div style={{ fontWeight: 600, color: "var(--fg2)" }}>No active clients yet</div>
          </div>
        </div>
      </div>
    );
  }

  const headerAction = (
    <>
      {tab === "Progress Logs" && !showLogForm && (
        <button style={primaryBtn} onClick={() => setShowLogForm(true)}>
          <Plus size={14} /> Log Progress
        </button>
      )}
      {tab === "Check-ins" && !showCheckInForm && (
        <button style={primaryBtn} onClick={() => setShowCheckInForm(true)}>
          <Plus size={14} /> Add Check-in
        </button>
      )}
      {tab === "Photos" && selectedLogId && selectedClient && (
        <PhotoUploadButton
          clientId={selectedClient.id}
          logId={selectedLogId}
          onUploaded={(p) => setPhotos((prev) => [...prev, p])}
        />
      )}
    </>
  );

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "280px 1fr",
      minHeight: "100vh", background: "var(--bg)",
    }}>
      <ClientRail
        clients={clients}
        selectedId={selectedClient?.id ?? null}
        onSelect={(c) => { setSelectedClient(c); setShowLogForm(false); setShowCheckInForm(false); }}
        eyebrow="Progress"
        title="Active Clients"
      />

      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <ScreenHeader eyebrow="Coaching" title="Progress" actions={headerAction}>
          <UnderlineTabs
            tabs={TABS}
            value={tab}
            onChange={(t) => { setTab(t); setShowLogForm(false); setShowCheckInForm(false); }}
          />
        </ScreenHeader>

        <div style={SCREEN_BODY}>
          {showLogForm && selectedClient && (
            <LogProgressForm
              clientId={selectedClient.id}
              onSaved={(log) => { setLogs((prev) => [log, ...prev]); setShowLogForm(false); }}
              onCancel={() => setShowLogForm(false)}
            />
          )}

          {showCheckInForm && selectedClient && (
            <CheckInForm
              clientId={selectedClient.id}
              onSaved={(ci) => { setCheckIns((prev) => [ci, ...prev]); setShowCheckInForm(false); }}
              onCancel={() => setShowCheckInForm(false)}
            />
          )}

          {tab === "Chart" ? (
            loadingChart
              ? <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}><Spinner className="w-6 h-6" /></div>
              : <ProgressChart logs={chartLogs} />
          ) : loadingData ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}><Spinner className="w-6 h-6" /></div>
          ) : tab === "Progress Logs" ? (
            <ProgressLogList logs={logs} />
          ) : tab === "Check-ins" ? (
            <CheckInList
              checkIns={checkIns}
              clientId={selectedClient?.id ?? ""}
              onChanged={() => setReloadKey((k) => k + 1)}
            />
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
    </div>
  );
}
