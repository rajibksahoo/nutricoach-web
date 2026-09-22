"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isEnabled, type SectionKey } from "@/lib/features";

type Item = {
  href: string;
  label: string;
  badge?: "NEW";
};

type Group = {
  title: string;
  items: Item[];
  /**
   * Which switch in `lib/features.ts` decides whether this group is shown.
   * This used to be a `launched` boolean declared here; it moved so that every
   * section in the product is toggled from one file.
   *
   * Note this is the *library* Nutrition group, not meal plans as a whole —
   * the per-client meal plan builder lives at /meal-plans in the main sidebar
   * and has its own switch.
   */
  section: SectionKey;
};

// Mirrors navGroups in the design's library.jsx — Fitness / Nutrition /
// Habits / Forms grouped headers with items under each.
const GROUPS: Group[] = [
  {
    title: "Fitness",
    section: "libraryFitness",
    items: [
      { href: "/library/exercises", label: "Exercises" },
      { href: "/library/workouts",  label: "Workouts"  },
      { href: "/library/sections",  label: "Sections"  },
      { href: "/library/programs",  label: "Programs"  },
    ],
  },
  {
    title: "Nutrition",
    section: "libraryNutrition",
    items: [
      { href: "/library/meal-plans",   label: "Meal Plan Templates" },
      { href: "/library/recipes",      label: "Recipes" },
      { href: "/library/ingredients",  label: "Ingredients" },
      { href: "/library/recipe-books", label: "Recipe Books" },
    ],
  },
  {
    title: "Habits",
    section: "libraryHabits",
    items: [
      { href: "/library/tasks",         label: "Tasks" },
      { href: "/library/metric-groups", label: "Metric Groups" },
    ],
  },
  {
    title: "Forms",
    section: "libraryForms",
    items: [
      { href: "/library/forms", label: "Forms & Questionnaires" },
    ],
  },
];

export default function LibrarySidebar() {
  const pathname = usePathname();
  return (
    <aside
      className="shrink-0 flex flex-col"
      style={{
        width: 232,
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        padding: "22px 0 40px",
      }}
    >
      <div style={{ padding: "0 22px 14px" }}>
        <h2
          className="m-0"
          style={{
            fontFamily: "var(--font-display-xl)",
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: "-0.01em",
            color: "var(--fg1)",
          }}
        >
          Library
        </h2>
      </div>

      {GROUPS.filter((g) => isEnabled(g.section)).map((g, i) => (
        <div key={g.title} style={{ padding: "4px 10px", marginTop: i === 0 ? 0 : 10 }}>
          <div
            style={{
              padding: "6px 12px 4px",
              fontSize: 10.5,
              fontWeight: 700,
              color: "var(--fg4)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {g.title}
          </div>
          {g.items.map(({ href, label, badge }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center justify-between transition-colors w-full",
                  "px-3 py-2 rounded-[7px] text-[13px]"
                )}
                style={{
                  marginBottom: 1,
                  background: active ? "var(--brand-primary-50)" : "transparent",
                  color: active ? "var(--brand-primary)" : "var(--fg2)",
                  fontWeight: active ? 600 : 500,
                }}
              >
                <span>{label}</span>
                {badge === "NEW" && (
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      padding: "1px 6px",
                      borderRadius: 9,
                      background: "#7C3AED",
                      color: "#fff",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </aside>
  );
}
