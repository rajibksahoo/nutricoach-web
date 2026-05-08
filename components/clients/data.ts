// Static fixture mirroring CLIENT_DETAILS in the design's clients.jsx.
// Used by the redesigned Clients screen (and Inbox right-pane lookup) until
// these blocks are wired to backend data.

export type StatusKey =
  | "Connected"
  | "Pending"
  | "Offline"
  | "Waiting Activation"
  | "Need Programming"
  | "Archived";

export interface ClientUpdate {
  who: string;
  text: string;
  time: string;
}

export interface ClientNote {
  text: string;
  date: string;
}

export interface ClientDetail {
  id: string;
  name: string;
  goal: string;
  phone: string;
  email: string;
  category: "Online" | "In-Person";
  status: StatusKey;
  segment: string;
  joined: string;
  lastActive: string;
  coach: string;
  program: string;
  pkg: string;
  pkgEnd: string;
  age: number;
  sex: "F" | "M";
  height: string;
  weight: string;
  startWeight: string;
  bf: string;
  restingHR: number;
  train7: number;
  train30: number;
  tasks7: number;
  nutr7: number;
  streak: number;
  sessions: number;
  nextSession: string;
  avatarTone: string;
  timezone: string;
  train7d: { done: number; total: number };
  train30d: { done: number; total: number };
  nextWeek: { done: number; total: number };
  lastWorkout: { name: string; days: number };
  metrics: { weight: number[]; bf: number[]; steps: number[] };
  goalDesc: string;
  notes: ClientNote[];
  limitations: ClientNote[];
  photos: string[];
  updates: ClientUpdate[];
}

export const CLIENT_DETAILS: ClientDetail[] = [
  {
    id: "c1", name: "Priya Sharma", goal: "Weight loss", phone: "+91 98765 43210", email: "priya.sharma@example.in",
    category: "Online", status: "Connected", segment: "connected", joined: "Mar 12, 2025", lastActive: "2h ago",
    coach: "Rajib K.", program: "Fat-loss Phase 2", pkg: "3 mo · ₹12,000", pkgEnd: "Jul 12, 2026",
    age: 31, sex: "F", height: "165 cm", weight: "68.4 kg", startWeight: "74.1 kg", bf: "28%", restingHR: 72,
    train7: 80, train30: 71, tasks7: 86, nutr7: 74, streak: 9, sessions: 24, nextSession: "Tomorrow · 7:00 AM",
    avatarTone: "#F59E0B", timezone: "7:18 PM · Asia/Kolkata",
    train7d: { done: 4, total: 5 }, train30d: { done: 17, total: 24 }, nextWeek: { done: 0, total: 5 },
    lastWorkout: { name: "Lower body A — Squat focus", days: 1 },
    metrics: {
      weight: [74.1, 73.4, 72.8, 72.0, 71.4, 70.6, 69.8, 69.1, 68.7, 68.4],
      bf: [31, 30.5, 30, 29.6, 29.1, 28.7, 28.3, 28, 28, 28],
      steps: [7200, 7800, 8100, 7500, 8400, 9100, 8800, 8600, 9000, 9200],
    },
    goalDesc: "Reach 65 kg with sustainable habits and build a strong base.",
    notes: [{ text: "Knee niggle on Thursday — switched leg curl for hip thrust.", date: "May 5, 2026 · 6:14 PM" }],
    limitations: [{ text: "Mild left-knee discomfort during deep squats.", date: "Apr 18, 2026" }],
    photos: ["05/06", "04/01"],
    updates: [
      { who: "Priya", text: "completed Lower body A", time: "2h" },
      { who: "Priya", text: "logged Body Fat — 28%", time: "1d" },
      { who: "Priya", text: "submitted Weekly check-in", time: "3d" },
      { who: "You",   text: "sent meal plan: Indian veg high-protein", time: "5d" },
    ],
  },
  {
    id: "c2", name: "Arjun Reddy", goal: "Muscle gain", phone: "+91 91234 56789", email: "arjun.r@example.in",
    category: "In-Person", status: "Connected", segment: "connected", joined: "Jan 04, 2025", lastActive: "7m ago",
    coach: "Rajib K.", program: "8-wk hypertrophy", pkg: "6 mo · ₹24,000", pkgEnd: "Jul 04, 2026",
    age: 26, sex: "M", height: "178 cm", weight: "74.8 kg", startWeight: "71.2 kg", bf: "15%", restingHR: 58,
    train7: 100, train30: 92, tasks7: 71, nutr7: 88, streak: 31, sessions: 62, nextSession: "Today · 6:30 PM",
    avatarTone: "#4F46E5", timezone: "7:18 PM · Asia/Kolkata",
    train7d: { done: 5, total: 5 }, train30d: { done: 22, total: 24 }, nextWeek: { done: 0, total: 5 },
    lastWorkout: { name: "Push A — Bench focus", days: 0 },
    metrics: {
      weight: [71.2, 71.6, 72.0, 72.4, 72.8, 73.3, 73.6, 74.0, 74.4, 74.8],
      bf: [16.4, 16.2, 16, 15.8, 15.6, 15.5, 15.4, 15.2, 15.1, 15],
      steps: [6800, 7400, 7100, 7600, 7900, 8000, 7700, 8100, 7800, 7900],
    },
    goalDesc: "Reach 78 kg lean by end of Q3 with bench at bodyweight × 1.2.",
    notes: [{ text: "Bench broke 80 kg × 5 PR. Bumping accessory volume.", date: "May 6, 2026 · 8:42 AM" }],
    limitations: [],
    photos: ["05/05", "02/01"],
    updates: [
      { who: "Arjun", text: "hit a PR on Bench — 80 kg × 5", time: "7m" },
      { who: "You",   text: "approved deload week starting Mon", time: "2h" },
      { who: "Arjun", text: "logged 3120 kcal", time: "6h" },
      { who: "Arjun", text: "completed Push A", time: "1d" },
    ],
  },
  {
    id: "c3", name: "Meera Iyer", goal: "Maintenance", phone: "+91 90000 11223", email: "meera.iyer@example.in",
    category: "Online", status: "Connected", segment: "connected", joined: "Nov 18, 2024", lastActive: "1d ago",
    coach: "Rajib K.", program: "Recomp · maintenance", pkg: "12 mo · ₹40,000", pkgEnd: "Nov 18, 2026",
    age: 34, sex: "F", height: "160 cm", weight: "55.2 kg", startWeight: "57.8 kg", bf: "24%", restingHR: 64,
    train7: 60, train30: 67, tasks7: 100, nutr7: 92, streak: 5, sessions: 48, nextSession: "Sat · 8:00 AM",
    avatarTone: "#0D9488", timezone: "7:18 PM · Asia/Kolkata",
    train7d: { done: 3, total: 5 }, train30d: { done: 16, total: 24 }, nextWeek: { done: 0, total: 5 },
    lastWorkout: { name: "Pilates · 45m", days: 1 },
    metrics: {
      weight: [57.8, 57.4, 57, 56.6, 56.2, 55.9, 55.6, 55.4, 55.3, 55.2],
      bf: [26, 25.6, 25.2, 24.8, 24.5, 24.2, 24, 24, 24, 24],
      steps: [8800, 9100, 8500, 9300, 9000, 8700, 9400, 9200, 9000, 9100],
    },
    goalDesc: "Hold body recomp; build to bi-weekly check-ins.",
    notes: [{ text: "Considering moving to bi-weekly cadence next month.", date: "May 1, 2026" }],
    limitations: [],
    photos: ["05/01", "02/01"],
    updates: [
      { who: "Meera", text: "completed Full body B", time: "1d" },
      { who: "Meera", text: "submitted Monthly review", time: "5d" },
      { who: "You",   text: "sent Pilates flow update", time: "1w" },
    ],
  },
  {
    id: "c4", name: "Karthik Rao", goal: "Weight loss", phone: "+91 77889 10101", email: "karthik.rao@example.in",
    category: "In-Person", status: "Pending", segment: "pending", joined: "Apr 28, 2026", lastActive: "4d ago",
    coach: "Rajib K.", program: "— not assigned", pkg: "Trial · ₹0", pkgEnd: "May 12, 2026",
    age: 42, sex: "M", height: "172 cm", weight: "86.1 kg", startWeight: "86.1 kg", bf: "31%", restingHR: 78,
    train7: 0, train30: 14, tasks7: 43, nutr7: 50, streak: 0, sessions: 1, nextSession: "Not scheduled",
    avatarTone: "#DC2626", timezone: "7:18 PM · Asia/Kolkata",
    train7d: { done: 0, total: 0 }, train30d: { done: 1, total: 8 }, nextWeek: { done: 0, total: 0 },
    lastWorkout: { name: "Intake assessment", days: 4 },
    metrics: { weight: [86.1], bf: [31], steps: [3200] },
    goalDesc: "Reach 78 kg over 6 months with sustainable habits.",
    notes: [{ text: "Awaiting PAR-Q & program assignment. Follow up Mon.", date: "May 4, 2026" }],
    limitations: [{ text: "High blood pressure — needs MD clearance for HIIT.", date: "Apr 28" }],
    photos: [],
    updates: [
      { who: "You", text: "sent PAR-Q form", time: "4d" },
      { who: "You", text: "created client profile", time: "1w" },
    ],
  },
  {
    id: "c5", name: "Sneha Gupta", goal: "PCOS support", phone: "+91 99887 76655", email: "sneha.g@example.in",
    category: "Online", status: "Connected", segment: "connected", joined: "Feb 02, 2025", lastActive: "3h ago",
    coach: "Rajib K.", program: "PCOS · low-impact", pkg: "6 mo · ₹22,000", pkgEnd: "Aug 02, 2026",
    age: 29, sex: "F", height: "162 cm", weight: "63.5 kg", startWeight: "66.2 kg", bf: "27%", restingHR: 70,
    train7: 80, train30: 78, tasks7: 100, nutr7: 81, streak: 14, sessions: 31, nextSession: "Tomorrow · 6:00 PM",
    avatarTone: "#A855F7", timezone: "7:18 PM · Asia/Kolkata",
    train7d: { done: 4, total: 5 }, train30d: { done: 18, total: 23 }, nextWeek: { done: 0, total: 5 },
    lastWorkout: { name: "Strength B — Hinge focus", days: 0 },
    metrics: {
      weight: [66.2, 65.9, 65.5, 65.2, 64.8, 64.5, 64.1, 63.9, 63.7, 63.5],
      bf: [29, 28.7, 28.3, 28, 27.7, 27.5, 27.2, 27.1, 27, 27],
      steps: [6500, 7000, 7500, 7200, 7800, 8000, 8300, 8100, 8400, 8500],
    },
    goalDesc: "Regulate cycle, lower fasting glucose, build strength.",
    notes: [{ text: "Energy way up. Bumping protein +10g.", date: "May 4, 2026" }],
    limitations: [{ text: "Avoid high-intensity cardio during luteal phase.", date: "Feb 10" }],
    photos: ["05/04", "02/02"],
    updates: [
      { who: "Sneha", text: "submitted Cycle log", time: "3h" },
      { who: "Sneha", text: "completed Strength B", time: "1d" },
      { who: "You",   text: "updated meal plan: protein +10g", time: "3d" },
    ],
  },
];

export const STATUS_COLORS: Record<StatusKey, { color: string; bg: string; dot: string }> = {
  "Connected":          { color: "#15803D", bg: "#F0FDF4", dot: "#22C55E" },
  "Pending":            { color: "#A16207", bg: "#FEFCE8", dot: "#EAB308" },
  "Offline":            { color: "#475569", bg: "#F1F5F9", dot: "#94A3B8" },
  "Waiting Activation": { color: "#9A3412", bg: "#FFEDD5", dot: "#F97316" },
  "Need Programming":   { color: "#1D4ED8", bg: "#DBEAFE", dot: "#3B82F6" },
  "Archived":           { color: "#64748B", bg: "#F8FAFC", dot: "#CBD5E1" },
};
