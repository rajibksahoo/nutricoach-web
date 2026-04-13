"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/library/fitness/programs",  label: "Programs"  },
  { href: "/library/fitness/workouts",  label: "Workouts"  },
  { href: "/library/fitness/exercises", label: "Exercises" },
];

export default function FitnessTabs() {
  const pathname = usePathname();
  return (
    <div className="inline-flex p-1 bg-slate-100 rounded-lg mb-6">
      {TABS.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
              active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
