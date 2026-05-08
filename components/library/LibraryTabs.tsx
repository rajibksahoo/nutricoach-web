"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Dumbbell, Apple, ListChecks, FileText } from "lucide-react";

type Tab = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  matchPrefixes?: string[];
};

// Legacy /library/{exercises,workouts,programs,sections} routes still hold
// the rich implementations until the fitness/ migration finishes — keep them
// lighting up the Fitness tab so the section header stays sensible.
const TABS: Tab[] = [
  {
    href: "/library/fitness",
    label: "Fitness",
    icon: Dumbbell,
    matchPrefixes: [
      "/library/fitness",
      "/library/exercises",
      "/library/workouts",
      "/library/programs",
      "/library/sections",
    ],
  },
  {
    href: "/library/nutrition",
    label: "Nutrition",
    icon: Apple,
    matchPrefixes: [
      "/library/nutrition",
      "/library/meal-plans",
      "/library/recipes",
      "/library/ingredients",
      "/library/recipe-books",
    ],
  },
  {
    href: "/library/habits",
    label: "Habits",
    icon: ListChecks,
    matchPrefixes: ["/library/habits", "/library/tasks", "/library/metric-groups"],
  },
  { href: "/library/forms", label: "Forms", icon: FileText },
];

export default function LibraryTabs() {
  const pathname = usePathname();
  return (
    <nav
      className="flex gap-1 border-b"
      style={{ borderColor: "var(--border)" }}
    >
      {TABS.map(({ href, label, icon: Icon, matchPrefixes }) => {
        const prefixes = matchPrefixes ?? [href];
        const active = prefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors"
            )}
            style={
              active
                ? { color: "var(--brand-primary)", borderColor: "var(--brand-primary)" }
                : { color: "var(--fg3)", borderColor: "transparent" }
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
