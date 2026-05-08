"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  badge?: "NEW";
}

const ITEMS: NavItem[] = [
  { href: "/library/exercises",     label: "Exercises" },
  { href: "/library/workouts",      label: "Workouts" },
  { href: "/library/sections",      label: "Sections" },
  { href: "/library/programs",      label: "Programs" },
  { href: "/library/tasks",         label: "Tasks" },
  { href: "/library/forms",         label: "Forms & Questionnaires" },
  { href: "/library/meal-plans",    label: "Meal Plan Templates" },
  { href: "/library/recipes",       label: "Recipes" },
  { href: "/library/ingredients",   label: "Ingredients" },
  { href: "/library/recipe-books",  label: "Recipe Books",           badge: "NEW" },
  { href: "/library/metric-groups", label: "Metric Groups" },
];

export default function LibrarySidebar() {
  const pathname = usePathname();
  return (
    <aside
      className="shrink-0 border-r border-slate-200 bg-slate-50/60"
      style={{ width: 212 }}
    >
      <div style={{ padding: "16px 18px 12px" }} className="border-b border-slate-200">
        <p
          className="text-slate-900 m-0"
          style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.005em", lineHeight: 1.2 }}
        >
          Library
        </p>
      </div>
      <nav style={{ paddingTop: 8, paddingBottom: 16 }}>
        {ITEMS.map(({ href, label, badge }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 text-[12.5px] font-medium transition-colors border-l-2",
                active
                  ? "bg-emerald-50 text-emerald-700 border-emerald-600"
                  : "text-slate-600 border-transparent hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <span className="flex-1 truncate">{label}</span>
              {badge === "NEW" && (
                <span className="px-1.5 py-[1px] text-[9px] font-bold tracking-wide rounded bg-emerald-600 text-white leading-tight">
                  NEW
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
