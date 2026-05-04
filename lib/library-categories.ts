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
  main:      { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
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
export interface TemplateSection {
  title: string;
  style: string;
  items: TemplateExercise[];
}
export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  exerciseCount: number;
  sectionCount: number;
  equipment: string[];
  cover: string;
  sections: TemplateSection[];
}

export const TEMPLATE_THUMB_COLOR: Record<TemplateExercise["thumb"], string> = {
  bodyweight: "#0D9488",
  strength:   "#059669",
  timed:      "#D97706",
  cardio:     "#DC2626",
  amrap:      "#7C3AED",
};

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: "t1", name: "Steady State Treadmill Run",
    description: "Cardiovascular Training: Running. Intermediate level. Progress by increasing pace.",
    exerciseCount: 9, sectionCount: 3, equipment: ["Cardio"],
    cover: "linear-gradient(135deg, #047857 0%, #059669 50%, #10B981 100%)",
    sections: [
      { title: "Warm Up", style: "Superset", items: [
        { name: "Downward Dog to Runner's Lunge", thumb: "bodyweight", reps: "6 reps", note: "x1" },
        { name: "Walking knee hugs",              thumb: "bodyweight", reps: "30 sec", note: "x1" },
        { name: "Hip openers",                    thumb: "timed",      reps: "30 sec", note: "x1" },
        { name: "Glute bridges",                  thumb: "bodyweight", reps: "12 reps", note: "x1" },
      ]},
      { title: "Main Set", style: "Steady-state", items: [
        { name: "Treadmill — easy pace",     thumb: "cardio", reps: "5 min",  note: "x1" },
        { name: "Treadmill — moderate pace", thumb: "cardio", reps: "15 min", note: "x1" },
        { name: "Treadmill — tempo",         thumb: "cardio", reps: "5 min",  note: "x1" },
      ]},
      { title: "Cool Down", style: "Static stretches", items: [
        { name: "Standing forward fold", thumb: "timed", reps: "45 sec", note: "x1" },
        { name: "Pigeon stretch",        thumb: "timed", reps: "60 sec", note: "each side" },
      ]},
    ],
  },
  {
    id: "t2", name: "Machine Cardio Session",
    description: "Beginner-friendly machine circuit. Mix of bike, rower, and stair climber.",
    exerciseCount: 5, sectionCount: 3, equipment: ["Cardio"],
    cover: "linear-gradient(135deg, #DC2626 0%, #EA580C 50%, #F59E0B 100%)",
    sections: [
      { title: "Warm Up", style: "Single", items: [
        { name: "Assault bike — easy", thumb: "cardio", reps: "3 min", note: "x1" },
      ]},
      { title: "Main Set", style: "Circuit", items: [
        { name: "Rowing machine",          thumb: "cardio", reps: "5 min", note: "x3" },
        { name: "Stair climber",           thumb: "cardio", reps: "4 min", note: "x3" },
        { name: "Assault bike — moderate", thumb: "cardio", reps: "4 min", note: "x3" },
      ]},
      { title: "Cool Down", style: "Single", items: [
        { name: "Walking", thumb: "cardio", reps: "5 min", note: "x1" },
      ]},
    ],
  },
  {
    id: "t3", name: "Bodyweight Conditioning Countdown",
    description: "Descending-rep ladder. 10-9-8 …-1 reps, no rest until done.",
    exerciseCount: 6, sectionCount: 3, equipment: ["Bodyweight"],
    cover: "linear-gradient(135deg, #0D9488 0%, #14B8A6 50%, #06B6D4 100%)",
    sections: [
      { title: "Warm Up", style: "Round", items: [
        { name: "Jumping jacks",            thumb: "bodyweight", reps: "60 sec", note: "x1" },
        { name: "World's greatest stretch", thumb: "timed",      reps: "5 reps", note: "each side" },
      ]},
      { title: "Conditioning", style: "Countdown 10→1", items: [
        { name: "Burpee",   thumb: "amrap",      reps: "10→1", note: "" },
        { name: "Push-up",  thumb: "bodyweight", reps: "10→1", note: "" },
        { name: "Air squat", thumb: "bodyweight", reps: "10→1", note: "" },
      ]},
      { title: "Cool Down", style: "Static", items: [
        { name: "Child's pose", thumb: "timed", reps: "60 sec", note: "x1" },
      ]},
    ],
  },
  {
    id: "t4", name: "Bodyweight Circuit",
    description: "4-round circuit, 12 reps per move. Beginner / intermediate.",
    exerciseCount: 6, sectionCount: 3, equipment: ["Bodyweight"],
    cover: "linear-gradient(135deg, #B45309 0%, #D97706 50%, #F59E0B 100%)",
    sections: [
      { title: "Warm Up", style: "Round", items: [
        { name: "Arm circles", thumb: "bodyweight", reps: "30 sec", note: "x1" },
        { name: "Hip circles", thumb: "bodyweight", reps: "30 sec", note: "x1" },
      ]},
      { title: "Main Circuit", style: "4 rounds", items: [
        { name: "Push-up",       thumb: "bodyweight", reps: "12 reps", note: "x4" },
        { name: "Air squat",     thumb: "bodyweight", reps: "12 reps", note: "x4" },
        { name: "Bent-over row", thumb: "strength",   reps: "12 reps", note: "x4" },
        { name: "Plank",         thumb: "timed",      reps: "30 sec",  note: "x4" },
      ]},
      { title: "Cool Down", style: "Static", items: [
        { name: "Child's pose", thumb: "timed", reps: "60 sec", note: "x1" },
      ]},
    ],
  },
  {
    id: "t5", name: "Lower Body Strength A",
    description: "Compound-focused leg day. Heavy squat, hinge, and unilateral work.",
    exerciseCount: 7, sectionCount: 3, equipment: ["Barbell", "Dumbbells"],
    cover: "linear-gradient(135deg, #065F46 0%, #047857 50%, #059669 100%)",
    sections: [
      { title: "Warm Up", style: "Superset", items: [
        { name: "Glute bridge", thumb: "strength", reps: "12 reps", note: "x2" },
        { name: "Goblet squat", thumb: "strength", reps: "8 reps",  note: "x2" },
      ]},
      { title: "Main Lifts", style: "Straight sets", items: [
        { name: "Back squat",            thumb: "strength", reps: "5 reps",  note: "x5 @ 80%" },
        { name: "Romanian deadlift",     thumb: "strength", reps: "8 reps",  note: "x4" },
        { name: "Bulgarian split squat", thumb: "strength", reps: "10 reps", note: "x3 each" },
      ]},
      { title: "Cool Down", style: "Static", items: [
        { name: "Pigeon stretch",    thumb: "timed", reps: "60 sec", note: "each side" },
        { name: "Hamstring stretch", thumb: "timed", reps: "45 sec", note: "each side" },
      ]},
    ],
  },
  {
    id: "t6", name: "Upper Body Push & Pull",
    description: "Balanced upper-body strength session. 3 push, 3 pull movements.",
    exerciseCount: 6, sectionCount: 3, equipment: ["Barbell", "Dumbbells"],
    cover: "linear-gradient(135deg, #9F1239 0%, #DC2626 50%, #F43F5E 100%)",
    sections: [
      { title: "Warm Up", style: "Round", items: [
        { name: "Band pull-apart", thumb: "strength", reps: "15 reps", note: "x2" },
      ]},
      { title: "Strength", style: "A1/B1 alternating", items: [
        { name: "Bench press",     thumb: "strength",   reps: "6 reps", note: "x4" },
        { name: "Bent-over row",   thumb: "strength",   reps: "6 reps", note: "x4" },
        { name: "Overhead press",  thumb: "strength",   reps: "8 reps", note: "x3" },
        { name: "Pull-up",         thumb: "bodyweight", reps: "8 reps", note: "x3" },
      ]},
      { title: "Cool Down", style: "Static", items: [
        { name: "Doorway chest stretch", thumb: "timed", reps: "45 sec", note: "x2" },
      ]},
    ],
  },
];
