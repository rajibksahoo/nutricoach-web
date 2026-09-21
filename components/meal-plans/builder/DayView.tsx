"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { EmptyState } from "@/components/dashboard/primitives";
import { secondaryBtn } from "@/components/coach/chrome";
import { Plus, Trash2, UtensilsCrossed } from "lucide-react";
import MealCard from "./MealCard";
import AddMealForm from "./AddMealForm";
import { MACRO_COLORS, calcDayTotals, type Meal, type MealType, type PlanDay } from "./types";

function MacroStat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div>
      <div style={{
        fontFamily: "var(--font-display-xl)", fontSize: 20, fontWeight: 700,
        letterSpacing: "-0.02em", color, fontVariantNumeric: "tabular-nums",
      }}>{value}</div>
      <div style={{
        fontSize: 10, fontWeight: 700, color: "var(--fg4)",
        textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 1,
      }}>{label}</div>
    </div>
  );
}

export default function DayView({ planId, day, onDeleteDay, onDayUpdated }: {
  planId: string;
  day: PlanDay;
  onDeleteDay: () => void;
  onDayUpdated: (day: PlanDay) => void;
}) {
  const [showAddMeal, setShowAddMeal] = useState(false);
  const totals = calcDayTotals(day);
  const sorted = [...day.meals].sort((a, b) => a.sequenceOrder - b.sequenceOrder);

  async function addMeal(mealType: MealType, name: string, timeOfDay: string) {
    try {
      const res = await api.post(`/api/v1/meal-plans/${planId}/days/${day.id}/meals`, {
        mealType,
        name,
        timeOfDay: timeOfDay || null,
        sequenceOrder: day.meals.length,
      });
      onDayUpdated({ ...day, meals: [...day.meals, res.data.data] });
      setShowAddMeal(false);
      toast.success("Meal added");
    } catch {
      toast.error("Failed to add meal");
    }
  }

  async function deleteMeal(meal: Meal) {
    if (!confirm(`Delete "${meal.name}"?`)) return;
    try {
      await api.delete(`/api/v1/meal-plans/${planId}/days/${day.id}/meals/${meal.id}`);
      onDayUpdated({ ...day, meals: day.meals.filter((m) => m.id !== meal.id) });
      toast.success("Meal deleted");
    } catch {
      toast.error("Failed to delete meal");
    }
  }

  function updateMeal(updated: Meal) {
    onDayUpdated({ ...day, meals: day.meals.map((m) => m.id === updated.id ? updated : m) });
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* Macro summary */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 16, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <MacroStat value={String(totals.kcal)} label="kcal" color={MACRO_COLORS.kcal} />
          <MacroStat value={`${totals.prot}g`} label="protein" color={MACRO_COLORS.protein} />
          <MacroStat value={`${totals.carbs}g`} label="carbs" color={MACRO_COLORS.carbs} />
          <MacroStat value={`${totals.fat}g`} label="fat" color={MACRO_COLORS.fat} />
        </div>
        <button
          onClick={onDeleteDay}
          style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            border: "none", background: "transparent", cursor: "pointer",
            fontSize: 11.5, color: "var(--fg4)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--danger)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--fg4)"; }}
        >
          <Trash2 size={14} /> Delete day
        </button>
      </div>

      {/* Meals */}
      {sorted.length === 0 && !showAddMeal && (
        <EmptyState
          icon={<UtensilsCrossed size={22} />}
          title="No meals yet"
          hint="Add a meal to get started."
        />
      )}

      {sorted.map((meal) => (
        <MealCard
          key={meal.id}
          planId={planId}
          dayId={day.id}
          meal={meal}
          onDelete={() => deleteMeal(meal)}
          onMealUpdated={updateMeal}
        />
      ))}

      {showAddMeal ? (
        <AddMealForm onSubmit={addMeal} onCancel={() => setShowAddMeal(false)} />
      ) : (
        <div>
          <button style={secondaryBtn} onClick={() => setShowAddMeal(true)}>
            <Plus size={14} /> Add Meal
          </button>
        </div>
      )}
    </div>
  );
}
