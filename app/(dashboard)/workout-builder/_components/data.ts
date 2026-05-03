import {
  Dumbbell, Activity, Clock, Running, Flame, Sun, Snow, Zap,
} from "./icons";
import type { ComponentType, SVGProps } from "react";

export type IconCmp = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;
export type CategoryKey = "strength" | "bodyweight" | "timed" | "cardio" | "amrap";
export type SectionType = "warmup" | "main" | "accessory" | "cooldown" | "finisher";

export interface Category {
  key: CategoryKey;
  label: string;
  sub: string;
  Icon: IconCmp;
  color: string;
  tint: string;
}

export interface LibraryExercise {
  id: string;
  name: string;
  cat: CategoryKey;
  muscle: string;
  equip: string;
  pattern: string;
  custom: boolean;
  tags: string[];
  videoUrl?: string;
  instructions?: string;
}

export const MUSCLE_OPTIONS = [
  "Chest", "Mid back", "Upper back", "Lower back", "Shoulders",
  "Biceps", "Triceps", "Quads", "Hamstrings", "Glutes",
  "Hip & groin", "Lower leg", "Core", "Full body",
];

export const EQUIPMENT_OPTIONS = [
  "Bodyweight", "Barbell", "Dumbbells", "Kettlebell", "Cable",
  "Machine", "Resistance band", "Box", "Cardio", "Foam roller", "Skipping rope",
];

export const PATTERN_OPTIONS = [
  "Upper body horiz. push", "Upper body horiz. pull",
  "Upper body vert. push", "Upper body vert. pull",
  "Lower body push", "Lower body hinge",
  "Core", "Locomotion", "Mobility", "Recovery", "Compound",
];

export interface SectionExercise {
  id: string;
  libId: string;
  sets: number;
  reps: number | null;
  duration: number | null;
  rest: number | null;
  weight: string;
  note: string;
}

export interface WorkoutSection {
  id?: string;
  type: SectionType;
  title: string;
  exCount?: number;
  exercises?: SectionExercise[];
}

export interface SavedWorkout {
  id: string;
  name: string;
  description: string;
  sectionCount: number;
  exerciseCount: number;
  sections: WorkoutSection[];
  tags: string[];
  lastUsed: string;
  owner: string;
}

export interface PaletteEntry { color: string; bg: string; bar: string; barText: string; }
export type Palette = Record<SectionType, PaletteEntry>;

export const CATEGORIES: Category[] = [
  { key: "strength",   label: "Strength",   sub: "Weight × reps",    Icon: Dumbbell, color: "#4F46E5", tint: "#EEF2FF" },
  { key: "bodyweight", label: "Bodyweight", sub: "Reps only",        Icon: Activity, color: "#0D9488", tint: "#F0FDFA" },
  { key: "timed",      label: "Timed",      sub: "Hold or duration", Icon: Clock,    color: "#D97706", tint: "#FEF3C7" },
  { key: "cardio",     label: "Cardio",     sub: "Distance or time", Icon: Running,  color: "#DC2626", tint: "#FEF2F2" },
  { key: "amrap",      label: "AMRAP/EMOM", sub: "Metcon · rounds",  Icon: Flame,    color: "#7C3AED", tint: "#FAF5FF" },
];
export const CAT: Record<CategoryKey, Category> = Object.fromEntries(
  CATEGORIES.map(c => [c.key, c])
) as Record<CategoryKey, Category>;

export const SECTION_PALETTES: Record<"warm" | "cool" | "mono", Palette> = {
  warm: {
    warmup:    { color: "#B45309", bg: "#FEF3C7", bar: "#F59E0B", barText: "#78350F" },
    main:      { color: "#9A3412", bg: "#FFEDD5", bar: "#F97316", barText: "#7C2D12" },
    accessory: { color: "#9F1239", bg: "#FFE4E6", bar: "#F43F5E", barText: "#881337" },
    cooldown:  { color: "#A16207", bg: "#FEF9C3", bar: "#EAB308", barText: "#713F12" },
    finisher:  { color: "#9A3412", bg: "#FFEDD5", bar: "#EA580C", barText: "#7C2D12" },
  },
  cool: {
    warmup:    { color: "#0E7490", bg: "#CFFAFE", bar: "#06B6D4", barText: "#155E75" },
    main:      { color: "#3730A3", bg: "#E0E7FF", bar: "#4F46E5", barText: "#312E81" },
    accessory: { color: "#0F766E", bg: "#CCFBF1", bar: "#14B8A6", barText: "#134E4A" },
    cooldown:  { color: "#1D4ED8", bg: "#DBEAFE", bar: "#3B82F6", barText: "#1E3A8A" },
    finisher:  { color: "#6B21A8", bg: "#F3E8FF", bar: "#A855F7", barText: "#581C87" },
  },
  mono: {
    warmup:    { color: "#475569", bg: "#F1F5F9", bar: "#94A3B8", barText: "#334155" },
    main:      { color: "#1E293B", bg: "#E2E8F0", bar: "#475569", barText: "#0F172A" },
    accessory: { color: "#475569", bg: "#F1F5F9", bar: "#64748B", barText: "#334155" },
    cooldown:  { color: "#64748B", bg: "#F8FAFC", bar: "#94A3B8", barText: "#475569" },
    finisher:  { color: "#334155", bg: "#E2E8F0", bar: "#64748B", barText: "#1E293B" },
  },
};

export const SECTION_TYPES: SectionType[] = ["warmup", "main", "accessory", "cooldown", "finisher"];
export const SECTION_LABELS: Record<SectionType, { label: string; Icon: IconCmp }> = {
  warmup:    { label: "Warm-up",   Icon: Sun },
  main:      { label: "Main",      Icon: Dumbbell },
  accessory: { label: "Accessory", Icon: Zap },
  cooldown:  { label: "Cool-down", Icon: Snow },
  finisher:  { label: "Finisher",  Icon: Flame },
};

export const LIBRARY: LibraryExercise[] = [
  { id: "ex-1",  name: "Jumping jacks",            cat: "bodyweight", muscle: "Full body",   equip: "Bodyweight",  pattern: "Locomotion",            custom: false, tags: ["warm-up"] },
  { id: "ex-2",  name: "Arm circles",              cat: "bodyweight", muscle: "Shoulders",   equip: "Bodyweight",  pattern: "Mobility",              custom: false, tags: ["warm-up"] },
  { id: "ex-3",  name: "World's greatest stretch", cat: "timed",      muscle: "Full body",   equip: "Bodyweight",  pattern: "Mobility",              custom: false, tags: ["warm-up"] },
  { id: "ex-4",  name: "Cat-cow",                  cat: "timed",      muscle: "Lower back",  equip: "Bodyweight",  pattern: "Mobility",              custom: false, tags: ["warm-up"] },
  { id: "ex-5",  name: "Hip circles",              cat: "bodyweight", muscle: "Hip & groin", equip: "Bodyweight",  pattern: "Mobility",              custom: false, tags: ["warm-up"] },
  { id: "ex-6",  name: "Leg swings",               cat: "bodyweight", muscle: "Hip & groin", equip: "Bodyweight",  pattern: "Mobility",              custom: false, tags: ["warm-up"] },
  { id: "ex-7",  name: "Barbell back squat",       cat: "strength",   muscle: "Quads",       equip: "Barbell",     pattern: "Lower body push",       custom: false, tags: ["compound"] },
  { id: "ex-8",  name: "Front squat",              cat: "strength",   muscle: "Quads",       equip: "Barbell",     pattern: "Lower body push",       custom: false, tags: ["compound"] },
  { id: "ex-9",  name: "Romanian deadlift",        cat: "strength",   muscle: "Hamstrings",  equip: "Barbell",     pattern: "Lower body hinge",      custom: false, tags: ["compound"] },
  { id: "ex-10", name: "Conventional deadlift",    cat: "strength",   muscle: "Hamstrings",  equip: "Barbell",     pattern: "Lower body hinge",      custom: false, tags: ["compound"] },
  { id: "ex-11", name: "Bulgarian split squat",    cat: "strength",   muscle: "Quads",       equip: "Dumbbells",   pattern: "Lower body push",       custom: false, tags: ["unilateral"] },
  { id: "ex-12", name: "Walking lunge",            cat: "bodyweight", muscle: "Quads",       equip: "Bodyweight",  pattern: "Locomotion",            custom: false, tags: [] },
  { id: "ex-13", name: "Leg press",                cat: "strength",   muscle: "Quads",       equip: "Machine",     pattern: "Lower body push",       custom: false, tags: [] },
  { id: "ex-14", name: "Leg curl",                 cat: "strength",   muscle: "Hamstrings",  equip: "Machine",     pattern: "Lower body hinge",      custom: false, tags: [] },
  { id: "ex-15", name: "Leg extension",            cat: "strength",   muscle: "Quads",       equip: "Machine",     pattern: "Lower body push",       custom: false, tags: [] },
  { id: "ex-16", name: "Standing calf raise",      cat: "strength",   muscle: "Lower leg",   equip: "Machine",     pattern: "Lower body push",       custom: false, tags: [] },
  { id: "ex-17", name: "Hip thrust",               cat: "strength",   muscle: "Glutes",      equip: "Barbell",     pattern: "Lower body hinge",      custom: false, tags: [] },
  { id: "ex-18", name: "Goblet squat",             cat: "strength",   muscle: "Quads",       equip: "Dumbbells",   pattern: "Lower body push",       custom: false, tags: [] },
  { id: "ex-19", name: "Bench press",              cat: "strength",   muscle: "Chest",       equip: "Barbell",     pattern: "Upper body horiz. push", custom: false, tags: ["compound"] },
  { id: "ex-20", name: "Incline dumbbell press",   cat: "strength",   muscle: "Chest",       equip: "Dumbbells",   pattern: "Upper body horiz. push", custom: false, tags: [] },
  { id: "ex-21", name: "Bent-over row",            cat: "strength",   muscle: "Mid back",    equip: "Barbell",     pattern: "Upper body horiz. pull", custom: false, tags: ["compound"] },
  { id: "ex-22", name: "Overhead press",           cat: "strength",   muscle: "Shoulders",   equip: "Barbell",     pattern: "Upper body vert. push",  custom: false, tags: ["compound"] },
  { id: "ex-23", name: "Pull-up",                  cat: "bodyweight", muscle: "Upper back",  equip: "Bodyweight",  pattern: "Upper body vert. pull",  custom: false, tags: [] },
  { id: "ex-24", name: "Lat pulldown",             cat: "strength",   muscle: "Upper back",  equip: "Cable",       pattern: "Upper body vert. pull",  custom: false, tags: [] },
  { id: "ex-25", name: "Push-up",                  cat: "bodyweight", muscle: "Chest",       equip: "Bodyweight",  pattern: "Upper body horiz. push", custom: false, tags: [] },
  { id: "ex-26", name: "Dumbbell row",             cat: "strength",   muscle: "Mid back",    equip: "Dumbbells",   pattern: "Upper body horiz. pull", custom: false, tags: [] },
  { id: "ex-27", name: "Lateral raise",            cat: "strength",   muscle: "Shoulders",   equip: "Dumbbells",   pattern: "Upper body vert. push",  custom: false, tags: [] },
  { id: "ex-28", name: "Bicep curl",               cat: "strength",   muscle: "Biceps",      equip: "Dumbbells",   pattern: "Upper body vert. pull",  custom: false, tags: [] },
  { id: "ex-29", name: "Tricep pushdown",          cat: "strength",   muscle: "Triceps",     equip: "Cable",       pattern: "Upper body vert. push",  custom: false, tags: [] },
  { id: "ex-30", name: "Plank",                    cat: "timed",      muscle: "Core",        equip: "Bodyweight",  pattern: "Core",                  custom: false, tags: [] },
  { id: "ex-31", name: "Side plank",               cat: "timed",      muscle: "Core",        equip: "Bodyweight",  pattern: "Core",                  custom: false, tags: [] },
  { id: "ex-32", name: "Hanging leg raise",        cat: "bodyweight", muscle: "Core",        equip: "Bodyweight",  pattern: "Core",                  custom: false, tags: [] },
  { id: "ex-33", name: "Dead bug",                 cat: "bodyweight", muscle: "Core",        equip: "Bodyweight",  pattern: "Core",                  custom: false, tags: [] },
  { id: "ex-34", name: "Bird dog",                 cat: "bodyweight", muscle: "Core",        equip: "Bodyweight",  pattern: "Core",                  custom: false, tags: [] },
  { id: "ex-35", name: "Pallof press",             cat: "strength",   muscle: "Core",        equip: "Cable",       pattern: "Core",                  custom: false, tags: [] },
  { id: "ex-36", name: "Wall sit",                 cat: "timed",      muscle: "Quads",       equip: "Bodyweight",  pattern: "Lower body push",       custom: false, tags: [] },
  { id: "ex-37", name: "Farmer's carry",           cat: "timed",      muscle: "Full body",   equip: "Dumbbells",   pattern: "Locomotion",            custom: false, tags: [] },
  { id: "ex-38", name: "Treadmill run",            cat: "cardio",     muscle: "Full body",   equip: "Cardio",      pattern: "Locomotion",            custom: false, tags: [] },
  { id: "ex-39", name: "Rowing machine",           cat: "cardio",     muscle: "Full body",   equip: "Cardio",      pattern: "Upper body horiz. pull", custom: false, tags: [] },
  { id: "ex-40", name: "Assault bike",             cat: "cardio",     muscle: "Full body",   equip: "Cardio",      pattern: "Locomotion",            custom: false, tags: [] },
  { id: "ex-41", name: "Stair climber",            cat: "cardio",     muscle: "Full body",   equip: "Cardio",      pattern: "Locomotion",            custom: false, tags: [] },
  { id: "ex-42", name: "Box jump",                 cat: "amrap",      muscle: "Glutes",      equip: "Box",         pattern: "Lower body push",       custom: false, tags: [] },
  { id: "ex-43", name: "Thrusters",                cat: "amrap",      muscle: "Full body",   equip: "Barbell",     pattern: "Compound",              custom: false, tags: [] },
  { id: "ex-44", name: "Kettlebell swing",         cat: "amrap",      muscle: "Glutes",      equip: "Kettlebell",  pattern: "Lower body hinge",      custom: false, tags: [] },
  { id: "ex-45", name: "Burpee",                   cat: "amrap",      muscle: "Full body",   equip: "Bodyweight",  pattern: "Compound",              custom: false, tags: [] },
  { id: "ex-46", name: "Double unders",            cat: "amrap",      muscle: "Lower leg",   equip: "Skipping rope", pattern: "Locomotion",          custom: false, tags: [] },
  { id: "ex-47", name: "Child's pose",             cat: "timed",      muscle: "Lower back",  equip: "Bodyweight",  pattern: "Mobility",              custom: false, tags: ["cool-down"] },
  { id: "ex-48", name: "Pigeon stretch",           cat: "timed",      muscle: "Hip & groin", equip: "Bodyweight",  pattern: "Mobility",              custom: false, tags: ["cool-down"] },
  { id: "ex-49", name: "Foam roll quads",          cat: "timed",      muscle: "Quads",       equip: "Foam roller", pattern: "Recovery",              custom: false, tags: ["cool-down"] },
  { id: "ex-50", name: "Hamstring stretch",        cat: "timed",      muscle: "Hamstrings",  equip: "Bodyweight",  pattern: "Mobility",              custom: false, tags: ["cool-down"] },
  { id: "ex-51", name: "Surya Namaskar (12-step)", cat: "timed",      muscle: "Full body",   equip: "Bodyweight",  pattern: "Mobility",              custom: true,  tags: ["yoga"] },
  { id: "ex-52", name: "3-min jog (treadmill)",    cat: "cardio",     muscle: "Full body",   equip: "Cardio",      pattern: "Locomotion",            custom: true,  tags: [] },
  { id: "ex-53", name: "Banded glute bridge",      cat: "strength",   muscle: "Glutes",      equip: "Resistance band", pattern: "Lower body hinge",  custom: true,  tags: [] },
];

export const LIBRARY_BY_ID: Record<string, LibraryExercise> = Object.fromEntries(
  LIBRARY.map(e => [e.id, e])
);

export const INITIAL_WORKOUT = {
  id: "w-initial" as string | null,
  name: "Day 1 — Legs & Core",
  program: "8-week hypertrophy block",
  week: 1,
  day: 1,
  client: "Arjun Reddy",
  description: "",
  sectionCount: 4,
  exerciseCount: 10,
  tags: [] as string[],
  lastUsed: "today",
  owner: "Rajib Sahoo",
  sections: [
    { id: "s1", type: "warmup" as SectionType, title: "Warm-up", exercises: [
      { id: "e-1", libId: "ex-1", sets: 2, reps: null, duration: 60, rest: 30, weight: "", note: "" },
      { id: "e-2", libId: "ex-3", sets: 2, reps: 5,    duration: null, rest: 30, weight: "", note: "each side" },
      { id: "e-3", libId: "ex-6", sets: 2, reps: 10,   duration: null, rest: 20, weight: "", note: "slow & controlled" },
    ]},
    { id: "s2", type: "main" as SectionType, title: "Main strength", exercises: [
      { id: "e-4", libId: "ex-7", sets: 4, reps: 8,  duration: null, rest: 120, weight: "70 kg", note: "Pause 1s at bottom. Keep chest up." },
      { id: "e-5", libId: "ex-9", sets: 4, reps: 10, duration: null, rest: 90,  weight: "60 kg", note: "Feel the stretch in the hamstrings." },
    ]},
    { id: "s3", type: "accessory" as SectionType, title: "Accessory work", exercises: [
      { id: "e-6", libId: "ex-11", sets: 3, reps: 12, duration: null, rest: 60, weight: "15 kg DB", note: "12 each leg" },
      { id: "e-7", libId: "ex-13", sets: 3, reps: 12, duration: null, rest: 60, weight: "100 kg",  note: "" },
      { id: "e-8", libId: "ex-16", sets: 4, reps: 15, duration: null, rest: 45, weight: "40 kg",   note: "" },
    ]},
    { id: "s4", type: "cooldown" as SectionType, title: "Cool-down", exercises: [
      { id: "e-9",  libId: "ex-47", sets: 1, reps: null, duration: 60, rest: null, weight: "", note: "" },
      { id: "e-10", libId: "ex-48", sets: 1, reps: null, duration: 45, rest: null, weight: "", note: "each side" },
    ]},
  ],
};

export interface Client { id: string; name: string; goal: string; phone: string; status: string; }
export const CLIENTS: Client[] = [
  { id: "c1", name: "Priya Sharma",       goal: "Weight loss",   phone: "+91 98765 43210", status: "ACTIVE" },
  { id: "c2", name: "Arjun Reddy",        goal: "Muscle gain",   phone: "+91 91234 56789", status: "ACTIVE" },
  { id: "c3", name: "Meera Iyer",         goal: "Maintenance",   phone: "+91 90000 11223", status: "ACTIVE" },
  { id: "c4", name: "Karthik Rao",        goal: "Weight loss",   phone: "+91 77889 10101", status: "PAUSED" },
  { id: "c5", name: "Sneha Gupta",        goal: "PCOS support",  phone: "+91 99887 76655", status: "ACTIVE" },
  { id: "c6", name: "Rohit Bhattacharya", goal: "Strength",      phone: "+91 98112 90034", status: "ACTIVE" },
  { id: "c7", name: "Ananya Nair",        goal: "Fat loss",      phone: "+91 73554 12100", status: "ONBOARDING" },
];

export interface SectionTemplate {
  id: string; title: string; type: SectionType; count: number; lastUsed: string;
}
export const SECTION_TEMPLATES: SectionTemplate[] = [
  { id: "st1", title: "Standard 8-min warm-up",  type: "warmup",    count: 4, lastUsed: "2 days ago" },
  { id: "st2", title: "Lower-body main A",       type: "main",      count: 3, lastUsed: "yesterday" },
  { id: "st3", title: "Glute accessory finisher",type: "accessory", count: 3, lastUsed: "5 days ago" },
  { id: "st4", title: "5-min static cool-down",  type: "cooldown",  count: 3, lastUsed: "today" },
  { id: "st5", title: "AMRAP 8 (4 movements)",   type: "finisher",  count: 4, lastUsed: "1 week ago" },
];

export const SAVED_WORKOUTS: SavedWorkout[] = [
  {
    id: "w1", name: "HIIT — TABATA 20:10 8×8",
    description: "Two movements per round, alternating. Work 20s, rest 10s × 8 rounds. Repeat 8 sets.",
    sectionCount: 3, exerciseCount: 18,
    sections: [
      { type: "warmup",   title: "Full Body Warm Up", exCount: 5 },
      { type: "main",     title: "TABATA 20:10 (8)",  exCount: 8 },
      { type: "cooldown", title: "Full Body Cool Down", exCount: 5 },
    ],
    tags: ["Full Body Cool Down (5)", "Full Body Warm Up (5)", "TABATA 20:10 (8)"],
    lastUsed: "2y", owner: "Rajib Sahoo",
  },
  {
    id: "w2", name: "Lower Body 40:20 5×5",
    description: "Five exercises, 40s of work, 20s of rest, repeated for 5 rounds.",
    sectionCount: 3, exerciseCount: 14,
    sections: [
      { type: "warmup",   title: "Full Body Warm Up", exCount: 4 },
      { type: "main",     title: "Legs (5)",          exCount: 5 },
      { type: "cooldown", title: "Full Body Cool Down", exCount: 5 },
    ],
    tags: ["Full Body Cool Down (4)", "Legs (5)", "Full Body Warm Up (5)"],
    lastUsed: "3 days ago", owner: "Rajib Sahoo",
  },
  {
    id: "w3", name: "Full Body EMOM 5×4",
    description: "Four rounds of five exercises. One minute of work, no rest between movements.",
    sectionCount: 6, exerciseCount: 25,
    sections: [
      { type: "warmup",   title: "Full Body Warm Up", exCount: 5 },
      { type: "main",     title: "EMOM #1 (5)",       exCount: 5 },
      { type: "main",     title: "EMOM #2 (5)",       exCount: 5 },
      { type: "finisher", title: "EMOM #3 (5)",       exCount: 5 },
      { type: "cooldown", title: "Full Body Cool Down", exCount: 5 },
    ],
    tags: ["EMOM #1 (5)", "EMOM #2 (5)", "EMOM #3 (5)", "Full Body Cool Down (5)", "Full Body Warm Up (5)"],
    lastUsed: "1 week ago", owner: "Rajib Sahoo",
  },
  {
    id: "w4", name: "Day 1 — Legs & Core",
    description: "Hypertrophy block, week 1. Heavy compounds + accessory work for glutes and quads.",
    sectionCount: 4, exerciseCount: 10,
    sections: [
      { type: "warmup",    title: "Warm-up",        exCount: 3 },
      { type: "main",      title: "Main strength",  exCount: 2 },
      { type: "accessory", title: "Accessory work", exCount: 3 },
      { type: "cooldown",  title: "Cool-down",      exCount: 2 },
    ],
    tags: ["Warm-up (3)", "Main strength (2)", "Accessory work (3)"],
    lastUsed: "yesterday", owner: "Rajib Sahoo",
  },
  {
    id: "w5", name: "Push Day — Chest & Shoulders",
    description: "Strength + hypertrophy push session. Bench, OHP, accessory volume.",
    sectionCount: 3, exerciseCount: 9,
    sections: [
      { type: "warmup",    title: "Shoulder mobility", exCount: 3 },
      { type: "main",      title: "Push compounds",    exCount: 3 },
      { type: "accessory", title: "Pump finisher",     exCount: 3 },
    ],
    tags: ["Shoulder mobility (3)", "Push compounds (3)", "Pump finisher (3)"],
    lastUsed: "4 days ago", owner: "Priya Sharma",
  },
];

export type ThumbCat = "bodyweight" | "strength" | "timed" | "cardio" | "amrap";
export interface TemplateItem { name: string; thumb: ThumbCat; reps: string; note: string; }
export interface WorkoutTemplate {
  id: string; name: string; description: string;
  exerciseCount: number; sectionCount: number; equipment: string[];
  cover: string;
  sections: { title: string; style: string; items: TemplateItem[] }[];
}

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: "t1", name: "Steady State Treadmill Run",
    description: "Cardiovascular Training: Running. Intermediate level. Progress by increasing pace.",
    exerciseCount: 15, sectionCount: 3, equipment: ["Cardio"],
    cover: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #2563EB 100%)",
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
    exerciseCount: 15, sectionCount: 3, equipment: ["Bodyweight"],
    cover: "linear-gradient(135deg, #0D9488 0%, #14B8A6 50%, #06B6D4 100%)",
    sections: [
      { title: "Warm Up", style: "Round", items: [
        { name: "Jumping jacks",           thumb: "bodyweight", reps: "60 sec", note: "x1" },
        { name: "World's greatest stretch", thumb: "timed",      reps: "5 reps", note: "each side" },
      ]},
      { title: "Conditioning", style: "Countdown 10→1", items: [
        { name: "Burpee",    thumb: "amrap",      reps: "10→1", note: "" },
        { name: "Push-up",   thumb: "bodyweight", reps: "10→1", note: "" },
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
    exerciseCount: 14, sectionCount: 3, equipment: ["Bodyweight"],
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
    cover: "linear-gradient(135deg, #3730A3 0%, #4F46E5 50%, #6366F1 100%)",
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
        { name: "Pigeon stretch",   thumb: "timed", reps: "60 sec", note: "each side" },
        { name: "Hamstring stretch", thumb: "timed", reps: "45 sec", note: "each side" },
      ]},
    ],
  },
  {
    id: "t6", name: "Upper Body Push & Pull",
    description: "Balanced upper-body strength session. 3 push, 3 pull movements.",
    exerciseCount: 8, sectionCount: 3, equipment: ["Barbell", "Dumbbells"],
    cover: "linear-gradient(135deg, #9F1239 0%, #DC2626 50%, #F43F5E 100%)",
    sections: [
      { title: "Warm Up", style: "Round", items: [
        { name: "Band pull-apart", thumb: "strength", reps: "15 reps", note: "x2" },
      ]},
      { title: "Strength", style: "A1/B1 alternating", items: [
        { name: "Bench press",    thumb: "strength",   reps: "6 reps", note: "x4" },
        { name: "Bent-over row",  thumb: "strength",   reps: "6 reps", note: "x4" },
        { name: "Overhead press", thumb: "strength",   reps: "8 reps", note: "x3" },
        { name: "Pull-up",        thumb: "bodyweight", reps: "8 reps", note: "x3" },
      ]},
      { title: "Cool Down", style: "Static", items: [
        { name: "Doorway chest stretch", thumb: "timed", reps: "45 sec", note: "x2" },
      ]},
    ],
  },
];

export const TEMPLATE_THUMB_COLOR: Record<ThumbCat, string> = {
  bodyweight: "#0D9488",
  strength:   "#4F46E5",
  timed:      "#D97706",
  cardio:     "#DC2626",
  amrap:      "#7C3AED",
};

export const fmtRest = (s: number | null) => {
  if (!s) return null;
  if (s < 60) return `${s}s rest`;
  const m = Math.floor(s / 60), r = s % 60;
  return r ? `${m}m ${r}s rest` : `${m}m rest`;
};

export function inferSectionType(title: string): SectionType {
  const t = title.toLowerCase();
  if (t.includes("warm")) return "warmup";
  if (t.includes("cool") || t.includes("stretch")) return "cooldown";
  if (t.includes("finish")) return "finisher";
  if (t.includes("accessor")) return "accessory";
  return "main";
}

export function pickLibForThumb(thumb: ThumbCat, idx: number): string {
  const matches = LIBRARY.filter(e => e.cat === thumb);
  return (matches[idx % matches.length] || LIBRARY[idx % LIBRARY.length]).id;
}
