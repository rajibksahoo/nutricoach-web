"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { Field, inputStyle } from "@/components/coach/chrome";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { Search, X } from "lucide-react";
import type { FoodItem } from "./types";

export default function FoodSearchPanel({ onAdd, onCancel }: {
  onAdd: (foodItemId: string, quantityGrams: number) => void;
  onCancel: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [qty, setQty] = useState(100);

  // Search with debounce; 0ms delay on mount for initial load
  useEffect(() => {
    const delay = query.length > 0 ? 400 : 0;
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const url = query
          ? `/api/v1/food-items?q=${encodeURIComponent(query)}`
          : "/api/v1/food-items";
        const res = await api.get(url);
        setResults(res.data.data);
      } catch {
        toast.error("Food search failed");
      } finally {
        setSearching(false);
      }
    }, delay);
    return () => clearTimeout(t);
  }, [query]);

  function nutrition(item: FoodItem, grams: number) {
    const r = grams / 100;
    return {
      kcal: Math.round(item.caloriesPer100g * r),
      prot: (item.proteinPer100g * r).toFixed(1),
      carbs: (item.carbsPer100g * r).toFixed(1),
      fat: (item.fatPer100g * r).toFixed(1),
    };
  }

  return (
    <div style={{
      border: "1px solid var(--border)", borderRadius: 10, padding: 12,
      background: "var(--surface-alt)", display: "grid", gap: 12, marginTop: 4,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--fg2)" }}>Add Food Item</div>
        <button
          onClick={onCancel}
          style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--fg4)", padding: 2 }}
        >
          <X size={15} />
        </button>
      </div>

      {!selected ? (
        <>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{
              position: "absolute", left: 11, top: "50%",
              transform: "translateY(-50%)", color: "var(--fg4)",
            }} />
            <input
              autoFocus
              type="text"
              placeholder="Search food items…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 32 }}
            />
          </div>
          <div style={{ maxHeight: 192, overflowY: "auto", display: "grid", gap: 2 }}>
            {searching ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "16px 0" }}>
                <Spinner className="w-5 h-5" />
              </div>
            ) : results.length === 0 ? (
              <p style={{ fontSize: 11.5, color: "var(--fg4)", textAlign: "center", padding: "16px 0", margin: 0 }}>
                No results
              </p>
            ) : (
              results.map((food) => (
                <button
                  key={food.id}
                  onClick={() => { setSelected(food); setQty(100); }}
                  style={{
                    width: "100%", textAlign: "left", padding: "7px 10px", borderRadius: 8,
                    border: "none", background: "transparent", cursor: "pointer", fontSize: 13,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{ fontWeight: 500, color: "var(--fg2)" }}>{food.name}</span>
                  {food.nameHindi && (
                    <span style={{ color: "var(--fg4)", marginLeft: 6, fontSize: 11.5 }}>
                      ({food.nameHindi})
                    </span>
                  )}
                  <span style={{ marginLeft: 8, fontSize: 11.5, color: "var(--fg4)" }}>
                    {food.caloriesPer100g} kcal · {food.proteinPer100g}P · {food.carbsPer100g}C · {food.fatPer100g}F / 100g
                  </span>
                </button>
              ))
            )}
          </div>
        </>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--fg2)" }}>{selected.name}</div>
              <div style={{ fontSize: 11.5, color: "var(--fg4)", marginTop: 2 }}>
                {nutrition(selected, qty).kcal} kcal · {nutrition(selected, qty).prot}g P ·{" "}
                {nutrition(selected, qty).carbs}g C · {nutrition(selected, qty).fat}g F
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              style={{
                border: "none", background: "transparent", cursor: "pointer", flexShrink: 0,
                fontSize: 11.5, fontWeight: 600, color: "var(--brand-primary)", textDecoration: "underline",
              }}
            >
              Change
            </button>
          </div>
          <Field label="Quantity (grams)">
            <input
              autoFocus
              type="number"
              min={1}
              max={2000}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              style={inputStyle}
            />
          </Field>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Button type="button" variant="secondary" size="sm" onClick={() => setSelected(null)}>
              Back
            </Button>
            <Button size="sm" disabled={!qty || qty < 1} onClick={() => onAdd(selected.id, qty)}>
              Add to meal
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
