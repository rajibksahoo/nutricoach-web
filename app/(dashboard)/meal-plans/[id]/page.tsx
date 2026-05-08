"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import {
  ArrowLeft, Plus, Trash2, UtensilsCrossed,
  Search, X, Coffee, Sun, Moon, Apple, Zap, MessageCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MealItem {
  id: string;
  foodItemId: string;
  foodItemName: string;
  quantityGrams: number;
  quantityUnit: string;
  calories: number | null;
  proteinG: string | null;
  carbsG: string | null;
  fatG: string | null;
}

interface Meal {
  id: string;
  mealType: string;
  name: string;
  timeOfDay: string | null;
  sequenceOrder: number;
  items: MealItem[];
}

interface PlanDay {
  id: string;
  dayNumber: number;
  totalCalories: number | null;
  totalProteinG: string | null;
  totalCarbsG: string | null;
  totalFatG: string | null;
  meals: Meal[];
}

interface MealPlan {
  id: string;
  clientId: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
  aiGenerated: boolean;
  totalCaloriesTarget: number | null;
  days: PlanDay[];
}

interface FoodItem {
  id: string;
  name: string;
  nameHindi: string | null;
  category: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK" | "PRE_WORKOUT" | "POST_WORKOUT";

const MEAL_TYPES: MealType[] = ["BREAKFAST", "LUNCH", "DINNER", "SNACK", "PRE_WORKOUT", "POST_WORKOUT"];

const MEAL_TYPE_LABELS: Record<string, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
  SNACK: "Snack",
  PRE_WORKOUT: "Pre-Workout",
  POST_WORKOUT: "Post-Workout",
};

const MEAL_TYPE_ICONS: Record<string, React.ReactNode> = {
  BREAKFAST: <Coffee className="w-4 h-4" />,
  LUNCH: <Sun className="w-4 h-4" />,
  DINNER: <Moon className="w-4 h-4" />,
  SNACK: <Apple className="w-4 h-4" />,
  PRE_WORKOUT: <Zap className="w-4 h-4" />,
  POST_WORKOUT: <Zap className="w-4 h-4" />,
};

const STATUS_VARIANT: Record<string, "green" | "yellow" | "blue" | "slate"> = {
  ACTIVE: "green",
  DRAFT: "yellow",
  COMPLETED: "blue",
  ARCHIVED: "slate",
};

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcDayTotals(day: PlanDay) {
  let kcal = 0, prot = 0, carbs = 0, fat = 0;
  for (const meal of day.meals) {
    for (const item of meal.items) {
      kcal += item.calories ?? 0;
      prot += parseFloat(item.proteinG ?? "0");
      carbs += parseFloat(item.carbsG ?? "0");
      fat += parseFloat(item.fatG ?? "0");
    }
  }
  return { kcal, prot: prot.toFixed(1), carbs: carbs.toFixed(1), fat: fat.toFixed(1) };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MealPlanBuilderPage() {
  const params = useParams();
  const planId = params.id as string;
  const router = useRouter();

  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const [addingDay, setAddingDay] = useState(false);


  useEffect(() => {
    let cancelled = false;
    api.get(`/api/v1/meal-plans/${planId}`)
      .then((res) => {
        if (cancelled) return;
        const data: MealPlan = res.data.data;
        setPlan(data);
        if (data.days.length > 0) setActiveDayId(data.days[0].id);
      })
      .catch(() => { if (!cancelled) toast.error("Failed to load meal plan"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [planId]);

  async function addDay() {
    if (!plan) return;
    const existing = plan.days.map((d) => d.dayNumber);
    const next = [1, 2, 3, 4, 5, 6, 7].find((n) => !existing.includes(n));
    if (!next) { toast.error("All 7 days already added"); return; }
    setAddingDay(true);
    try {
      const res = await api.post(`/api/v1/meal-plans/${planId}/days?dayNumber=${next}`);
      const newDay: PlanDay = res.data.data;
      setPlan((p) => p ? {
        ...p,
        days: [...p.days, newDay].sort((a, b) => a.dayNumber - b.dayNumber),
      } : p);
      setActiveDayId(newDay.id);
      toast.success(`Day ${next} added`);
    } catch {
      toast.error("Failed to add day");
    } finally {
      setAddingDay(false);
    }
  }

  async function deleteDay(dayId: string, dayNumber: number) {
    if (!confirm(`Delete Day ${dayNumber} and all its meals?`)) return;
    try {
      await api.delete(`/api/v1/meal-plans/${planId}/days/${dayId}`);
      const remaining = (plan?.days ?? []).filter((d) => d.id !== dayId);
      setPlan((p) => p ? { ...p, days: remaining } : p);
      if (activeDayId === dayId) setActiveDayId(remaining[0]?.id ?? null);
      toast.success("Day deleted");
    } catch {
      toast.error("Failed to delete day");
    }
  }

  async function changeStatus(status: string) {
    try {
      const res = await api.patch(`/api/v1/meal-plans/${planId}/status?status=${status}`);
      setPlan((p) => p ? { ...p, status: res.data.data.status } : p);
      toast.success(`Marked as ${status.toLowerCase()}`);
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function shareWhatsApp() {
    try {
      await api.post(`/api/v1/meal-plans/${planId}/share/whatsapp`);
      toast.success("Meal plan shared via WhatsApp");
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to share via WhatsApp";
      toast.error(msg);
    }
  }

  function updateDay(updated: PlanDay) {
    setPlan((p) => p ? { ...p, days: p.days.map((d) => d.id === updated.id ? updated : d) } : p);
  }

  if (loading) {
    return <div className="flex justify-center py-24"><Spinner className="w-8 h-8" /></div>;
  }

  if (!plan) {
    return (
      <div className="text-center py-24 text-slate-400 text-sm">
        Meal plan not found.{" "}
        <button onClick={() => router.push("/meal-plans")} className="text-indigo-600 underline">
          Go back
        </button>
      </div>
    );
  }

  const activeDay = plan.days.find((d) => d.id === activeDayId) ?? null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/meal-plans")}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900">{plan.name}</h1>
              <Badge variant={STATUS_VARIANT[plan.status] ?? "slate"}>{plan.status}</Badge>
              {plan.aiGenerated && <Badge variant="blue">AI</Badge>}
            </div>
            {plan.totalCaloriesTarget && (
              <p className="text-xs text-slate-400 mt-0.5">
                Target: {plan.totalCaloriesTarget} kcal/day
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {plan.status === "ACTIVE" && (
            <Button size="sm" variant="secondary" onClick={shareWhatsApp}>
              <MessageCircle className="w-3.5 h-3.5 mr-1" /> Share
            </Button>
          )}
          {plan.status === "DRAFT" && (
            <Button size="sm" onClick={() => changeStatus("ACTIVE")}>Mark Active</Button>
          )}
          {plan.status === "ACTIVE" && (
            <>
              <Button size="sm" variant="secondary" onClick={() => changeStatus("COMPLETED")}>
                Complete
              </Button>
              <Button size="sm" variant="ghost" onClick={() => changeStatus("ARCHIVED")}>
                Archive
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Day Tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {plan.days.map((day) => (
          <button
            key={day.id}
            onClick={() => setActiveDayId(day.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeDayId === day.id
                ? "bg-indigo-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Day {day.dayNumber}
            <span className={`ml-1 text-xs ${activeDayId === day.id ? "text-indigo-100" : "text-slate-400"}`}>
              {DAY_NAMES[day.dayNumber - 1]}
            </span>
          </button>
        ))}
        {plan.days.length < 7 && (
          <Button size="sm" variant="ghost" onClick={addDay} loading={addingDay}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Day
          </Button>
        )}
      </div>

      {/* Day Content */}
      {!activeDay ? (
        <Card>
          <CardContent className="text-center py-16">
            <UtensilsCrossed className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400 mb-4">No days added yet.</p>
            <Button size="sm" onClick={addDay} loading={addingDay}>
              <Plus className="w-4 h-4 mr-1" /> Add Day 1
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DayView
          planId={planId}
          day={activeDay}
          onDeleteDay={() => deleteDay(activeDay.id, activeDay.dayNumber)}
          onDayUpdated={updateDay}
        />
      )}
    </div>
  );
}

// ─── DayView ──────────────────────────────────────────────────────────────────

function DayView({
  planId,
  day,
  onDeleteDay,
  onDayUpdated,
}: {
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
    <div className="space-y-4">
      {/* Macro summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <MacroStat value={String(totals.kcal)} label="kcal" className="text-slate-900" />
          <MacroStat value={`${totals.prot}g`} label="protein" className="text-blue-600" />
          <MacroStat value={`${totals.carbs}g`} label="carbs" className="text-amber-600" />
          <MacroStat value={`${totals.fat}g`} label="fat" className="text-red-500" />
        </div>
        <button
          onClick={onDeleteDay}
          className="text-xs text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete day
        </button>
      </div>

      {/* Meals */}
      {sorted.length === 0 && !showAddMeal && (
        <Card>
          <CardContent className="text-center py-10">
            <p className="text-sm text-slate-400">No meals yet. Add a meal to get started.</p>
          </CardContent>
        </Card>
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
        <Button size="sm" variant="secondary" onClick={() => setShowAddMeal(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add Meal
        </Button>
      )}
    </div>
  );
}

// ─── MacroStat ────────────────────────────────────────────────────────────────

function MacroStat({ value, label, className }: { value: string; label: string; className: string }) {
  return (
    <div>
      <p className={`text-base font-bold ${className}`}>{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}

// ─── MealCard ─────────────────────────────────────────────────────────────────

function MealCard({
  planId,
  dayId,
  meal,
  onDelete,
  onMealUpdated,
}: {
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <div className="flex items-center gap-2.5">
          <span className="text-indigo-600">
            {MEAL_TYPE_ICONS[meal.mealType] ?? <UtensilsCrossed className="w-4 h-4" />}
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">{meal.name}</p>
            <p className="text-xs text-slate-400">
              {MEAL_TYPE_LABELS[meal.mealType] ?? meal.mealType}
              {meal.timeOfDay && ` · ${meal.timeOfDay}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {meal.items.length > 0 && (
            <span className="text-xs text-slate-500 font-medium">{mealKcal} kcal</span>
          )}
          <button onClick={onDelete} className="text-slate-300 hover:text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="py-3 space-y-1.5">
        {meal.items.length === 0 && !showAddFood && (
          <p className="text-xs text-slate-400 py-1">No food items yet.</p>
        )}

        {meal.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0"
          >
            <div className="flex-1 min-w-0">
              <span className="text-sm text-slate-800">{item.foodItemName}</span>
              <span className="text-xs text-slate-400 ml-2">
                {item.quantityGrams}{item.quantityUnit}
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-xs shrink-0">
              <span className="text-slate-600 font-medium w-14 text-right">
                {item.calories ?? "—"} kcal
              </span>
              <span className="text-blue-600 w-10 text-right">
                {parseFloat(item.proteinG ?? "0").toFixed(1)}P
              </span>
              <span className="text-amber-600 w-10 text-right">
                {parseFloat(item.carbsG ?? "0").toFixed(1)}C
              </span>
              <span className="text-red-500 w-10 text-right">
                {parseFloat(item.fatG ?? "0").toFixed(1)}F
              </span>
              <button
                onClick={() => deleteItem(item.id)}
                className="text-slate-300 hover:text-red-500 transition-colors ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {showAddFood && (
          <FoodSearchPanel
            onAdd={addFoodItem}
            onCancel={() => setShowAddFood(false)}
          />
        )}

        <button
          onClick={() => setShowAddFood((v) => !v)}
          className="mt-1 flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {showAddFood ? "Cancel" : "Add food"}
        </button>
      </CardContent>
    </Card>
  );
}

// ─── AddMealForm ──────────────────────────────────────────────────────────────

function AddMealForm({
  onSubmit,
  onCancel,
}: {
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
      <CardHeader>
        <p className="font-semibold text-slate-900 text-sm">Add Meal</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="text-xs font-medium text-slate-600">Type</span>
              <select
                value={mealType}
                onChange={(e) => {
                  const t = e.target.value as MealType;
                  setMealType(t);
                  setName(MEAL_TYPE_LABELS[t]);
                }}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {MEAL_TYPES.map((t) => (
                  <option key={t} value={t}>{MEAL_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-slate-600">Time (optional)</span>
              <input
                type="time"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>
          </div>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-slate-600">
              Name <span className="text-red-500">*</span>
            </span>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={150}
              required
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={saving} disabled={!name.trim()}>
              Add Meal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── FoodSearchPanel ──────────────────────────────────────────────────────────

function FoodSearchPanel({
  onAdd,
  onCancel,
}: {
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
    <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-3 mt-1">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-700">Add Food Item</p>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {!selected ? (
        <>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              autoFocus
              type="text"
              placeholder="Search food items…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
          <div className="max-h-48 overflow-y-auto space-y-0.5">
            {searching ? (
              <div className="flex justify-center py-4"><Spinner className="w-5 h-5" /></div>
            ) : results.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No results</p>
            ) : (
              results.map((food) => (
                <button
                  key={food.id}
                  onClick={() => { setSelected(food); setQty(100); }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-white text-sm transition-colors"
                >
                  <span className="font-medium text-slate-800">{food.name}</span>
                  {food.nameHindi && (
                    <span className="text-slate-400 ml-1.5 text-xs">({food.nameHindi})</span>
                  )}
                  <span className="ml-2 text-xs text-slate-400">
                    {food.caloriesPer100g} kcal · {food.proteinPer100g}P · {food.carbsPer100g}C · {food.fatPer100g}F / 100g
                  </span>
                </button>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">{selected.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {nutrition(selected, qty).kcal} kcal · {nutrition(selected, qty).prot}g P ·{" "}
                {nutrition(selected, qty).carbs}g C · {nutrition(selected, qty).fat}g F
              </p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium underline shrink-0"
            >
              Change
            </button>
          </div>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-slate-600">Quantity (grams)</span>
            <input
              autoFocus
              type="number"
              min={1}
              max={2000}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </label>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" size="sm" onClick={() => setSelected(null)}>
              Back
            </Button>
            <Button
              size="sm"
              disabled={!qty || qty < 1}
              onClick={() => onAdd(selected.id, qty)}
            >
              Add to meal
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
