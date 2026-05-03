"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuth, getCoach } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  TrendingUp,
  CreditCard,
  LogOut,
  Leaf,
  UserCircle,
  MessageCircle,
  Utensils,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  matchPrefixes?: string[];
};

const navItems: NavItem[] = [
  { href: "/dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { href: "/clients",    label: "Clients",    icon: Users },
  { href: "/meal-plans", label: "Meal plans", icon: Utensils },
  {
    href: "/library",
    label: "Library",
    icon: BookOpen,
    matchPrefixes: ["/library", "/workout-builder"],
  },
  { href: "/progress",   label: "Progress",   icon: TrendingUp },
  { href: "/messages",   label: "Messaging",  icon: MessageCircle, badge: 3 },
  { href: "/billing",    label: "Billing",    icon: CreditCard },
  { href: "/profile",    label: "Profile",    icon: UserCircle },
];

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const coach = getCoach();

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-slate-900 flex flex-col z-10">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-slate-800">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <span className="text-white font-semibold text-lg">NutriCoach</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, badge, matchPrefixes }) => {
          const prefixes = matchPrefixes ?? [href];
          const active = prefixes.some((p) => pathname.startsWith(p));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-emerald-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {badge ? (
                <span className="bg-red-500 text-white text-[10px] font-bold leading-none px-1.5 py-0.5 rounded-full">
                  {badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Coach footer */}
      <div className="border-t border-slate-800 px-3 py-3 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white text-[11px] font-semibold flex items-center justify-center shrink-0">
          {initialsFromName(coach?.name ?? "Coach")}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[12.5px] font-medium text-white truncate">
            {coach?.name ?? "Coach"}
          </div>
          <div className="text-[10.5px] text-slate-500 truncate">Coach · Pro</div>
        </div>
        <button
          onClick={handleLogout}
          aria-label="Logout"
          title="Logout"
          className="text-slate-500 hover:text-white transition-colors p-1 rounded"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}