"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Dumbbell,
  ClipboardList,
  CalendarDays,
  Apple,
  ListChecks,
  FileText,
} from "lucide-react";

const ITEMS = [
  { href: "/library/exercises",  label: "Exercises",  icon: Dumbbell       },
  { href: "/library/workouts",   label: "Workouts",   icon: ClipboardList  },
  { href: "/library/programs",   label: "Programs",   icon: CalendarDays   },
  { href: "/library/meal-plans", label: "Meal Plans", icon: Apple          },
  { href: "/library/habits",     label: "Habits",     icon: ListChecks     },
  { href: "/library/forms",      label: "Forms",      icon: FileText       },
];

export default function LibrarySidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 shrink-0 border-r border-slate-200 bg-slate-50/60">
      <div className="px-5 pt-6 pb-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Library
        </p>
      </div>
      <nav className="px-2 pb-4 space-y-0.5">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                active
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-600 hover:bg-white hover:text-slate-900"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
