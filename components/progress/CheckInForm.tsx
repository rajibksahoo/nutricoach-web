"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { Card, CardTitle } from "@/components/dashboard/primitives";
import { Field, inputStyle } from "@/components/coach/chrome";
import Button from "@/components/ui/Button";
import type { CheckIn } from "./types";

export default function CheckInForm({ clientId, onSaved, onCancel }: {
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
      <CardTitle>Record Check-in</CardTitle>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12,
        }}>
          <Field label="Date" required>
            <input type="date" value={form.checkInDate}
              onChange={(e) => setForm((f) => ({ ...f, checkInDate: e.target.value }))}
              required style={inputStyle} />
          </Field>
          <Field label="Adherence (%)" required>
            <input type="number" min="0" max="100" placeholder="e.g. 85" value={form.adherencePercent}
              onChange={(e) => setForm((f) => ({ ...f, adherencePercent: e.target.value }))}
              required style={inputStyle} />
          </Field>
        </div>
        <Field label="Notes">
          <textarea rows={2} placeholder="Optional notes..." value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
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
