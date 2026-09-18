"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Spinner from "@/components/ui/Spinner";
import type { ProgramSummary } from "@/lib/library-types";
import {
  assignProgram, createProgram, deleteProgram, listPrograms,
  updateProgram, uploadProgramCover, setProgramTemplate, instantiateProgram,
} from "@/lib/programs-api";
import { listClients } from "@/lib/workout-builder-api";
import type { Client } from "@/lib/workout-types";
import ProgramListView from "./ProgramListView";
import CreateProgramModal, { type ProgramFormPayload } from "./CreateProgramModal";
import AssignProgramModal from "./AssignProgramModal";
import TemplatePickerModal from "./TemplatePickerModal";

export default function ProgramsLibrary() {
  const router = useRouter();
  const [programs, setPrograms] = useState<ProgramSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<ProgramSummary | null>(null);
  const [saving, setSaving] = useState(false);

  const [assignTarget, setAssignTarget] = useState<ProgramSummary | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);

  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [templates, setTemplates] = useState<ProgramSummary[] | null>(null);
  const [instantiating, setInstantiating] = useState(false);

  function load() {
    setLoading(true);
    listPrograms(false)
      .then(setPrograms)
      .catch(() => toast.error("Failed to load programs"))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openPlanner(p: ProgramSummary) {
    router.push(`/library/programs/${p.id}/calendar`);
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
        tags: payload.tags,
      };
      if (modalMode === "edit" && editTarget) {
        await updateProgram(editTarget.id, body);
        if (payload.coverFile) await uploadProgramCover(editTarget.id, payload.coverFile);
        toast.success("Program updated");
        setModalMode(null);
        load();
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

  async function handleToggleTemplate(p: ProgramSummary) {
    const next = !p.isTemplate;
    try {
      await setProgramTemplate(p.id, next);
      toast.success(next ? "Saved as template" : "Removed from templates");
      // A promoted program leaves the library list, so reload rather than patch.
      setTemplates(null);
      load();
    } catch {
      toast.error(next ? "Failed to save as template" : "Failed to remove from templates");
    }
  }

  function openTemplates() {
    setTemplatesOpen(true);
    if (templates !== null) return;
    listPrograms(true)
      .then(setTemplates)
      .catch(() => { toast.error("Failed to load templates"); setTemplatesOpen(false); });
  }

  async function handleInstantiate(template: ProgramSummary, name: string) {
    setInstantiating(true);
    try {
      const created = await instantiateProgram(template.id, name);
      toast.success("Program created from template");
      setTemplatesOpen(false);
      load();
      openPlanner(created);
    } catch {
      toast.error("Failed to create from template");
    } finally {
      setInstantiating(false);
    }
  }

  if (loading) {
    return <div style={{ padding: "60px 0", display: "flex", justifyContent: "center" }}><Spinner /></div>;
  }

  return (
    <>
      <ProgramListView
        programs={programs}
        onOpen={openPlanner}
        onCreate={() => { setEditTarget(null); setModalMode("create"); }}
        onEdit={(p) => { setEditTarget(p); setModalMode("edit"); }}
        onAssign={openAssign}
        onDelete={handleDelete}
        onExploreTemplates={openTemplates}
        onToggleTemplate={handleToggleTemplate}
      />

      {templatesOpen && (
        <TemplatePickerModal
          templates={templates}
          busy={instantiating}
          onClose={() => setTemplatesOpen(false)}
          onPick={handleInstantiate}
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
        programId={assignTarget?.id ?? null}
        clients={clients}
        saving={assigning}
        onClose={() => setAssignTarget(null)}
        onAssign={handleAssign}
      />
    </>
  );
}
