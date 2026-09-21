"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { Card, CardTitle } from "@/components/dashboard/primitives";
import { Field, inputStyle } from "@/components/coach/chrome";
import Button from "@/components/ui/Button";
import type { ProgressLog } from "./types";

const fieldGrid: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12,
};

export default function LogProgressForm({ clientId, onSaved, onCancel }: {
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
      <CardTitle>Log Progress</CardTitle>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
        <div style={fieldGrid}>
          <Field label="Date" required>
            <input type="date" value={form.loggedDate} onChange={(e) => set("loggedDate", e.target.value)}
              required style={inputStyle} />
          </Field>
          <Field label="Weight (kg)">
            <input type="number" step="0.1" min="0" placeholder="e.g. 72.5" value={form.weightKg}
              onChange={(e) => set("weightKg", e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Body Fat (%)">
            <input type="number" step="0.1" min="0" max="100" placeholder="e.g. 22" value={form.bodyFatPercent}
              onChange={(e) => set("bodyFatPercent", e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Waist (cm)">
            <input type="number" step="0.1" min="0" placeholder="e.g. 80" value={form.waistCm}
              onChange={(e) => set("waistCm", e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Chest (cm)">
            <input type="number" step="0.1" min="0" placeholder="e.g. 95" value={form.chestCm}
              onChange={(e) => set("chestCm", e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Hip (cm)">
            <input type="number" step="0.1" min="0" placeholder="e.g. 92" value={form.hipCm}
              onChange={(e) => set("hipCm", e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Adherence (%)">
            <input type="number" min="0" max="100" placeholder="e.g. 80" value={form.adherencePercent}
              onChange={(e) => set("adherencePercent", e.target.value)} style={inputStyle} />
          </Field>
        </div>
        <Field label="Notes">
          <textarea rows={2} placeholder="Optional notes..." value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            style={{ ...inputStyle, resize: "none" }} />
        </Field>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button type="button" variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
          <Button type="submit" size="sm" loading={saving}>Save</Button>
        </div>
      </form>
    </Card>
  );
}
