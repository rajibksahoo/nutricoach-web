"use client";

import React, { useState } from "react";
import { Card, CardTitle } from "@/components/dashboard/primitives";
import { Field, inputStyle } from "@/components/coach/chrome";
import Button from "@/components/ui/Button";
import { MEAL_TYPES, MEAL_TYPE_LABELS, type MealType } from "./types";

export default function AddMealForm({ onSubmit, onCancel }: {
  onSubmit: (mealType: MealType, name: string, timeOfDay: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [mealType, setMealType] = useState<MealType>("BREAKFAST");
  const [name, setName] = useState(MEAL_TYPE_LABELS["BREAKFAST"]);
  const [timeOfDay, setTimeOfDay] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSubmit(mealType, name.trim(), timeOfDay);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardTitle>Add Meal</CardTitle>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12,
        }}>
          <Field label="Type">
            <select
              value={mealType}
              onChange={(e) => {
                const t = e.target.value as MealType;
                setMealType(t);
                setName(MEAL_TYPE_LABELS[t]);
              }}
              style={inputStyle}
            >
              {MEAL_TYPES.map((t) => (
                <option key={t} value={t}>{MEAL_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </Field>
          <Field label="Time (optional)">
            <input
              type="time"
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value)}
              style={inputStyle}
            />
          </Field>
        </div>
        <Field label="Name" required>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={150}
            required
            style={inputStyle}
          />
        </Field>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" size="sm" loading={saving} disabled={!name.trim()}>
            Add Meal
          </Button>
        </div>
      </form>
    </Card>
  );
}
