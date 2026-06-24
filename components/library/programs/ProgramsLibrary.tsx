"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Spinner from "@/components/ui/Spinner";
import type { Program, ProgramSummary } from "@/lib/library-types";
import {
  assignProgram, createProgram, deleteProgram, getProgram, listPrograms,
  updateProgram, uploadProgramCover,
} from "@/lib/programs-api";
import { listClients } from "@/lib/workout-builder-api";
import type { Client } from "@/app/(dashboard)/workout-builder/_components/data";
import ProgramListView from "./ProgramListView";
import ProgramPlannerView from "./ProgramPlannerView";
import CreateProgramModal, { type ProgramFormPayload } from "./CreateProgramModal";
import AssignProgramModal from "./AssignProgramModal";

export default function ProgramsLibrary() {
  const [programs, setPrograms] = useState<ProgramSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "planner">("list");
  const [current, setCurrent] = useState<Program | null>(null);

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<ProgramSummary | null>(null);
  const [saving, setSaving] = useState(false);

  const [assignTarget, setAssignTarget] = useState<ProgramSummary | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);

  function load() {
    setLoading(true);
    listPrograms()
      .then(setPrograms)
      .catch(() => toast.error("Failed to load programs"))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function openPlanner(p: ProgramSummary) {
    try {
      const full = await getProgram(p.id);
      setCurrent(full);
      setView("planner");
    } catch {
      toast.error("Failed to open program");
    }
  }

  function openAssign(p: ProgramSummary) {
    setAssignTarget(p);
    if (clients.length === 0) {
      listClients().then(setClients).catch(() => toast.error("Failed to load clients"));
    }
  }

  async function handleDelete(p: ProgramSummary) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    try {
      await deleteProgram(p.id);
      toast.success("Program deleted");
      load();
    } catch {
      toast.error("Failed to delete");
    }
  }

  async function handleSubmit(payload: ProgramFormPayload) {
    setSaving(true);
    try {
      const body = {
        name: payload.name,
        description: payload.description || null,
        weeks: payload.weeks,
        modality: payload.modality || null,
        experienceLevel: payload.experienceLevel || null,
      };
      if (modalMode === "edit" && editTarget) {
        const updated = await updateProgram(editTarget.id, body);
        if (payload.coverFile) await uploadProgramCover(editTarget.id, payload.coverFile);
        toast.success("Program updated");
        setModalMode(null);
        load();
        // Keep planner header in sync if editing the open program
        if (current && current.id === editTarget.id) {
          setCurrent({ ...current, ...updated, days: current.days });
        }
      } else {
        const created = await createProgram(body);
        if (payload.coverFile) await uploadProgramCover(created.id, payload.coverFile);
        toast.success("Program created");
        setModalMode(null);
        load();
        openPlanner(created);
      }
    } catch (e) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? "Failed to save program");
    } finally {
      setSaving(false);
    }
  }

  async function handleAssign(clientIds: string[], opts: { startDate?: string; notes: string }) {
    if (!assignTarget) return;
    setAssigning(true);
    try {
      await assignProgram(assignTarget.id, clientIds, { startDate: opts.startDate, notes: opts.notes });
      toast.success(`Assigned to ${clientIds.length} client${clientIds.length === 1 ? "" : "s"}`);
      setAssignTarget(null);
    } catch {
      toast.error("Failed to assign program");
    } finally {
      setAssigning(false);
    }
  }

  if (loading) {
    return <div style={{ padding: "60px 0", display: "flex", justifyContent: "center" }}><Spinner /></div>;
  }

  return (
    <>
      {view === "planner" && current ? (
        <ProgramPlannerView
          program={current}
          onBack={() => { setView("list"); load(); }}
          onEditInfo={(p) => { setEditTarget(p); setModalMode("edit"); }}
          onAssign={openAssign}
        />
      ) : (
        <ProgramListView
          programs={programs}
          onOpen={openPlanner}
          onCreate={() => { setEditTarget(null); setModalMode("create"); }}
          onEdit={(p) => { setEditTarget(p); setModalMode("edit"); }}
          onAssign={openAssign}
          onDelete={handleDelete}
        />
      )}

      <CreateProgramModal
        open={modalMode !== null}
        mode={modalMode ?? "create"}
        initial={editTarget}
        saving={saving}
        onClose={() => setModalMode(null)}
        onSubmit={handleSubmit}
      />

      <AssignProgramModal
        open={assignTarget !== null}
        programName={assignTarget?.name}
        clients={clients}
        saving={assigning}
        onClose={() => setAssignTarget(null)}
        onAssign={handleAssign}
      />
    </>
  );
}
