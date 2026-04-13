"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Dumbbell, Apple, ListChecks, FileText } from "lucide-react";

const TABS = [
  { href: "/library/fitness",   label: "Fitness",   icon: Dumbbell   },
  { href: "/library/nutrition", label: "Nutrition", icon: Apple      },
  { href: "/library/habits",    label: "Habits",    icon: ListChecks },
  { href: "/library/forms",     label: "Forms",     icon: FileText   },
];

export default function LibraryTabs() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 border-b border-slate-200 mb-6">
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              active
                ? "text-emerald-600 border-emerald-600"
                : "text-slate-500 border-transparent hover:text-slate-700"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
