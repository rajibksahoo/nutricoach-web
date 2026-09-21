"use client";

import { useState } from "react";
import { Card, CardTitle } from "@/components/dashboard/primitives";
import { Field, inputStyle } from "@/components/coach/chrome";
import Button from "@/components/ui/Button";

export default function NewPlanForm({ onSubmit, onCancel, loading }: {
  onSubmit: (name: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [name, setName] = useState("");

  return (
    <Card>
      <CardTitle>New Meal Plan</CardTitle>
      <form
        onSubmit={(e) => { e.preventDefault(); if (name.trim()) onSubmit(name.trim()); }}
        style={{ display: "grid", gap: 12 }}
      >
        <Field label="Plan name" required>
          <input
            autoFocus
            type="text"
            placeholder="e.g. Weight Loss — Week 1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            required
            style={inputStyle}
          />
        </Field>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button type="button" variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
          <Button type="submit" size="sm" loading={loading} disabled={!name.trim()}>Create</Button>
        </div>
      </form>
    </Card>
  );
}
