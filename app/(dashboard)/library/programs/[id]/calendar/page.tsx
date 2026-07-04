"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Spinner from "@/components/ui/Spinner";
import type { Program, ProgramSummary } from "@/lib/library-types";
import {
  assignProgram, getProgram, updateProgram, uploadProgramCover,
} from "@/lib/programs-api";
import { listClients } from "@/lib/workout-builder-api";
import type { Client } from "@/app/(dashboard)/workout-builder/_components/data";
import ProgramPlannerView from "@/components/library/programs/ProgramPlannerView";
import CreateProgramModal, { type ProgramFormPayload } from "@/components/library/programs/CreateProgramModal";
import AssignProgramModal from "@/components/library/programs/AssignProgramModal";

export default function ProgramCalendarPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);

  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [assignTarget, setAssignTarget] = useState<ProgramSummary | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);

  const load = useCallback(() => {
    setLoading(true);
    getProgram(id)
      .then(setProgram)
      .catch(() => toast.error("Failed to load program"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  function openAssign(p: ProgramSummary) {
    setAssignTarget(p);
    if (clients.length === 0) {
      listClients().then(setClients).catch(() => toast.error("Failed to load clients"));
    }
  }

  async function handleEdit(payload: ProgramFormPayload) {
    setSaving(true);
    try {
      const body = {
        name: payload.name,
        description: payload.description || null,
        weeks: payload.weeks,
        modality: payload.modality || null,
        experienceLevel: payload.experienceLevel || null,
      };
      const updated = await updateProgram(id, body);
      if (payload.coverFile) await uploadProgramCover(id, payload.coverFile);
      toast.success("Program updated");
      setEditOpen(false);
      // Keep planner header in sync without a full refetch of days
      setProgram((prev) => (prev ? { ...prev, ...updated, days: prev.days } : prev));
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
  if (!program) {
    return <p style={{ padding: 24, fontSize: 14, color: "var(--fg2)" }}>Program not found.</p>;
  }

  return (
    <>
      <ProgramPlannerView
        program={program}
        onBack={() => router.push("/library/programs")}
        onEditInfo={() => setEditOpen(true)}
        onAssign={openAssign}
      />

      <CreateProgramModal
        open={editOpen}
        mode="edit"
        initial={program}
        saving={saving}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEdit}
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
