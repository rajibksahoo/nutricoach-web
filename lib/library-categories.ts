import {
  Dumbbell,
  Heart,
  Move,
  Zap,
  Target,
  type LucideIcon,
} from "lucide-react";
import type { Exercise } from "./library-types";

export type CategoryKey = "strength" | "cardio" | "mobility" | "plyometric" | "skill";

export interface CategoryDef {
  key: CategoryKey;
  label: string;
  Icon: LucideIcon;
  color: string; // text + accent color class
  tint: string;  // background tint class
  ring: string;  // border-on-select class
  sub: string;   // captured fields hint
}

export const CATEGORIES: CategoryDef[] = [
  { key: "strength",   label: "Strength",   Icon: Dumbbell, color: "text-orange-700", tint: "bg-orange-50", ring: "border-orange-400", sub: "reps × weight" },
  { key: "cardio",     label: "Cardio",     Icon: Heart,    color: "text-rose-700",   tint: "bg-rose-50",   ring: "border-rose-400",   sub: "duration / distance" },
  { key: "mobility",   label: "Mobility",   Icon: Move,     color: "text-sky-700",    tint: "bg-sky-50",    ring: "border-sky-400",     sub: "duration" },
  { key: "plyometric", label: "Plyometric", Icon: Zap,      color: "text-amber-700",  tint: "bg-amber-50",  ring: "border-amber-400",   sub: "reps" },
  { key: "skill",      label: "Skill",      Icon: Target,   color: "text-violet-700", tint: "bg-violet-50", ring: "border-violet-400",  sub: "reps" },
];

export function getCategory(key?: string | null): CategoryDef | null {
  if (!key) return null;
  return CATEGORIES.find((c) => c.key === key.toLowerCase()) ?? null;
}

export const MUSCLE_GROUPS = [
  "Chest", "Mid back", "Upper back", "Lower back", "Shoulders",
  "Biceps", "Triceps", "Quads", "Hamstrings", "Glutes",
  "Hip & groin", "Lower leg", "Core", "Full body",
];

export const EQUIPMENT = [
  "Bodyweight", "Barbell", "Dumbbells", "Kettlebell", "Cable",
  "Machine", "Resistance band", "Box", "Cardio", "Foam roller", "Skipping rope",
];

export const MOVEMENT_PATTERNS = [
  "Upper body horiz. push", "Upper body horiz. pull",
  "Upper body vert. push", "Upper body vert. pull",
  "Lower body push", "Lower body hinge",
  "Core", "Locomotion", "Mobility", "Recovery", "Compound",
];

// ─── Taxonomy normalization ──────────────────────────────────────────────
// Seeded exercises store snake_case taxonomy values (core, full_body, none,
// core_anti_rotation…) while the option lists above are display labels.
// Normalize on load so tables, filter chips, and modal selects line up.

const MUSCLE_ALIASES: Record<string, string> = {
  core: "Core",
  chest: "Chest",
  back: "Mid back",
  full_body: "Full body",
  glutes: "Glutes",
  quads: "Quads",
};

const EQUIPMENT_ALIASES: Record<string, string> = {
  none: "Bodyweight",
};

const PATTERN_ALIASES: Record<string, string> = {
  horizontal_push: "Upper body horiz. push",
  horizontal_pull: "Upper body horiz. pull",
  vertical_push: "Upper body vert. push",
  vertical_pull: "Upper body vert. pull",
  hinge: "Lower body hinge",
  squat: "Lower body push",
  lunge: "Lower body push",
  core_anti_rotation: "Core",
  core_anti_extension: "Core",
  core_extension: "Core",
  core_dynamic: "Core",
  full_body_conditioning: "Compound",
};

function humanize(value: string): string {
  const s = value.replace(/_/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function normalizeValue(
  raw: string | null | undefined,
  aliases: Record<string, string>,
  canonical: string[],
): string | null {
  if (!raw) return raw ?? null;
  if (canonical.includes(raw)) return raw;
  const key = raw.trim().toLowerCase();
  if (aliases[key]) return aliases[key];
  const human = humanize(raw);
  const match = canonical.find((c) => c.toLowerCase() === human.toLowerCase());
  return match ?? human;
}

export function normalizeExercise(ex: Exercise): Exercise {
  return {
    ...ex,
    muscleGroup: normalizeValue(ex.muscleGroup, MUSCLE_ALIASES, MUSCLE_GROUPS),
    equipment: normalizeValue(ex.equipment, EQUIPMENT_ALIASES, EQUIPMENT),
    modality: normalizeValue(ex.modality, EQUIPMENT_ALIASES, EQUIPMENT),
    movementPattern: normalizeValue(ex.movementPattern, PATTERN_ALIASES, MOVEMENT_PATTERNS),
  };
}

// ─── Workout section palette (chips on workout rows) ────────────────────
export type SectionType = "warmup" | "main" | "accessory" | "finisher" | "cooldown";

export interface SectionPaletteEntry {
  /** background tint */
  bg: string;
  /** text color */
  text: string;
  /** border color (rgba-friendly hex) */
  border: string;
}

export const WORKOUT_SECTION_PALETTE: Record<SectionType, SectionPaletteEntry> = {
  warmup:    { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200" },
  main:      { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  accessory: { bg: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-200" },
  finisher:  { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200" },
  cooldown:  { bg: "bg-slate-100",  text: "text-slate-600",   border: "border-slate-200" },
};

export function sectionPalette(type?: string | null): SectionPaletteEntry {
  const k = (type ?? "main").toLowerCase() as SectionType;
  return WORKOUT_SECTION_PALETTE[k] ?? WORKOUT_SECTION_PALETTE.main;
}

// Infer section type from server-side WorkoutSectionType or freeform name
export function inferSectionType(opts: { sectionType?: string | null; name?: string | null }): SectionType {
  const st = opts.sectionType?.toUpperCase();
  if (st === "WARM_UP") return "warmup";
  if (st === "COOL_DOWN") return "cooldown";
  if (st === "MAIN") return "main";
  const n = (opts.name ?? "").toLowerCase();
  if (n.includes("warm")) return "warmup";
  if (n.includes("cool")) return "cooldown";
  if (n.includes("finish")) return "finisher";
  if (n.includes("access")) return "accessory";
  return "main";
}

// ─── Workout templates (Everfit-style preset library) ───────────────────
export interface TemplateExercise {
  name: string;
  thumb: "bodyweight" | "strength" | "timed" | "cardio" | "amrap";
  reps: string;
  note?: string;
}
export const TEMPLATE_THUMB_COLOR: Record<TemplateExercise["thumb"], string> = {
  bodyweight: "#0D9488",
  strength:   "#4F46E5",
  timed:      "#D97706",
  cardio:     "#DC2626",
  amrap:      "#7C3AED",
};
