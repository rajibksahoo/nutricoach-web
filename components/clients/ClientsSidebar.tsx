"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Users,
  UserCheck,
  UserPlus,
  PauseCircle,
  UserMinus,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  status: "all" | "ACTIVE" | "ONBOARDING" | "PAUSED" | "INACTIVE";
  label: string;
  icon: LucideIcon;
}

const ITEMS: NavItem[] = [
  { status: "all",        label: "All clients", icon: Users },
  { status: "ACTIVE",     label: "Active",      icon: UserCheck },
  { status: "ONBOARDING", label: "Onboarding",  icon: UserPlus },
  { status: "PAUSED",     label: "Paused",      icon: PauseCircle },
  { status: "INACTIVE",   label: "Inactive",    icon: UserMinus },
];

export default function ClientsSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("status") ?? "all";
  const onListRoute = pathname === "/clients";

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
          Clients
        </p>
      </div>
      <nav style={{ paddingTop: 8, paddingBottom: 16 }}>
        {ITEMS.map(({ status, label, icon: Icon }) => {
          const href = status === "all" ? "/clients" : `/clients?status=${status}`;
          const active = onListRoute && current === status;
          return (
            <Link
              key={status}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-4 py-1.5 text-[12.5px] font-medium transition-colors border-l-2",
                active
                  ? "bg-emerald-50 text-emerald-700 border-emerald-600"
                  : "text-slate-600 border-transparent hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon className="w-[15px] h-[15px] shrink-0" />
              <span className="flex-1 truncate">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
