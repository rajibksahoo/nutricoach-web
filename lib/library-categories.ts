import {
  Dumbbell,
  Heart,
  Move,
  Zap,
  Target,
  type LucideIcon,
} from "lucide-react";

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
