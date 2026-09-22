"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { UtensilsCrossed, Trash2, Plus, X } from "lucide-react";
import FoodSearchPanel from "./FoodSearchPanel";
import { MACRO_COLORS, MEAL_TYPE_ICONS, MEAL_TYPE_LABELS, type Meal } from "./types";

const macroCol: React.CSSProperties = { width: 40, textAlign: "right", fontVariantNumeric: "tabular-nums" };

export default function MealCard({ planId, dayId, meal, onDelete, onMealUpdated }: {
  planId: string;
  dayId: string;
  meal: Meal;
  onDelete: () => void;
  onMealUpdated: (meal: Meal) => void;
}) {
  const [showAddFood, setShowAddFood] = useState(false);

  const mealKcal = meal.items.reduce((sum, i) => sum + (i.calories ?? 0), 0);

  async function addFoodItem(foodItemId: string, quantityGrams: number) {
    try {
      const res = await api.post(
        `/api/v1/meal-plans/${planId}/days/${dayId}/meals/${meal.id}/items`,
        { foodItemId, quantityGrams, quantityUnit: "g" }
      );
      onMealUpdated({ ...meal, items: [...meal.items, res.data.data] });
      setShowAddFood(false);
      toast.success("Food added");
    } catch {
      toast.error("Failed to add food item");
    }
  }

  async function deleteItem(itemId: string) {
    try {
      await api.delete(`/api/v1/meal-plans/${planId}/days/${dayId}/meals/${meal.id}/items/${itemId}`);
      onMealUpdated({ ...meal, items: meal.items.filter((i) => i.id !== itemId) });
    } catch {
      toast.error("Failed to remove item");
    }
  }

  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 12, boxShadow: "var(--shadow-sm)", overflow: "hidden",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
        padding: "12px 18px", borderBottom: "1px solid var(--border-subtle)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <span style={{ color: "var(--brand-primary)", display: "inline-flex" }}>
            {MEAL_TYPE_ICONS[meal.mealType] ?? <UtensilsCrossed size={15} />}
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--fg1)" }}>{meal.name}</div>
            <div style={{ fontSize: 11.5, color: "var(--fg4)" }}>
              {MEAL_TYPE_LABELS[meal.mealType] ?? meal.mealType}
              {meal.timeOfDay && ` · ${meal.timeOfDay}`}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          {meal.items.length > 0 && (
            <span style={{
              fontSize: 11.5, color: "var(--fg3)", fontWeight: 500,
              fontVariantNumeric: "tabular-nums",
            }}>{mealKcal} kcal</span>
          )}
          <button
            onClick={onDelete}
            style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--fg5)", display: "inline-flex" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--danger)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--fg5)"; }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div style={{ padding: "10px 18px 14px" }}>
        {meal.items.length === 0 && !showAddFood && (
          <p style={{ fontSize: 11.5, color: "var(--fg4)", margin: "4px 0" }}>No food items yet.</p>
        )}

        {meal.items.map((item, i) => (
          <div
            key={item.id}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: 10, padding: "7px 0",
              borderBottom: i === meal.items.length - 1 ? "none" : "1px solid var(--border-subtle)",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 13, color: "var(--fg2)" }}>{item.foodItemName}</span>
              {item.custom && (
                // AI-generated plans can name foods we do not stock. Flagging them
                // tells the coach which macros came from the model rather than
                // from our own per-100g data, so they know what to check.
                <span
                  title="Not in the food library — macros supplied with the plan"
                  style={{
                    marginLeft: 8, padding: "1px 6px", borderRadius: 4,
                    fontSize: 10, fontWeight: 600,
                    background: "var(--warning-50)", color: "var(--warning-700)",
                    border: "1px solid var(--warning-50)",
                  }}
                >
                  unverified
                </span>
              )}
              <span style={{ fontSize: 11.5, color: "var(--fg4)", marginLeft: 8 }}>
                {item.quantityGrams}{item.quantityUnit}
              </span>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              fontSize: 11.5, flexShrink: 0,
            }}>
              <span style={{ ...macroCol, width: 56, color: "var(--fg3)", fontWeight: 500 }}>
                {item.calories ?? "—"} kcal
              </span>
              <span style={{ ...macroCol, color: MACRO_COLORS.protein }}>
                {parseFloat(item.proteinG ?? "0").toFixed(1)}P
              </span>
              <span style={{ ...macroCol, color: MACRO_COLORS.carbs }}>
                {parseFloat(item.carbsG ?? "0").toFixed(1)}C
              </span>
              <span style={{ ...macroCol, color: MACRO_COLORS.fat }}>
                {parseFloat(item.fatG ?? "0").toFixed(1)}F
              </span>
              <button
                onClick={() => deleteItem(item.id)}
                style={{
                  border: "none", background: "transparent", cursor: "pointer",
                  color: "var(--fg5)", marginLeft: 4, display: "inline-flex",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--danger)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--fg5)"; }}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}

        {showAddFood && (
          <FoodSearchPanel onAdd={addFoodItem} onCancel={() => setShowAddFood(false)} />
        )}

        <button
          onClick={() => setShowAddFood((v) => !v)}
          style={{
            marginTop: 8, display: "inline-flex", alignItems: "center", gap: 5,
            border: "none", background: "transparent", cursor: "pointer", padding: 0,
            fontSize: 11.5, fontWeight: 600, color: "var(--brand-primary)",
          }}
        >
          <Plus size={14} />
          {showAddFood ? "Cancel" : "Add food"}
        </button>
      </div>
    </div>
  );
}
