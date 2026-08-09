"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearAuth, getCoach } from "@/lib/auth";
import type { CoachUser } from "@/lib/auth";
import { listConversations } from "@/lib/messaging-api";
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
  /** Renders the live unread-message count fetched below. */
  showsUnread?: boolean;
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
  { href: "/messages",   label: "Messaging",  icon: MessageCircle, showsUnread: true },
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
  const [coach, setCoach] = useState<CoachUser | null>(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    setCoach(getCoach());
  }, []);

  // Real unread total. listConversations is read-only — unlike getThread it
  // does not mark anything as read server-side.
  useEffect(() => {
    let cancelled = false;
    listConversations()
      .then((cs) => {
        if (!cancelled) setUnread(cs.reduce((sum, c) => sum + (c.unreadCount || 0), 0));
      })
      .catch(() => { /* a badge is not worth a toast */ });
    return () => { cancelled = true; };
  }, [pathname]);

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  return (
    <aside
      className="fixed inset-y-0 left-0 w-[212px] flex flex-col z-10 text-white"
      style={{ background: "var(--sidebar)" }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-[18px] py-[14px] pt-4"
        style={{ borderBottom: "1px solid var(--sidebar-hover)" }}
      >
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center"
          style={{ background: "var(--brand-primary)" }}
        >
          <Leaf className="w-4 h-4 text-white" strokeWidth={2.2} />
        </div>
        <span
          className="font-semibold"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 15,
            letterSpacing: "-0.01em",
          }}
        >
          NutriCoach
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-2.5 flex flex-col gap-px">
        {navItems.map(({ href, label, icon: Icon, showsUnread, matchPrefixes }) => {
          const prefixes = matchPrefixes ?? [href];
          const active = prefixes.some((p) => pathname.startsWith(p));
          const badge = showsUnread ? unread : 0;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-md transition-colors",
                "px-2.5 py-[7px] text-[12.5px] font-medium",
                active
                  ? "text-white"
                  : "text-slate-400 hover:text-white hover:bg-[var(--sidebar-hover)]"
              )}
              style={active ? { background: "var(--brand-primary)" } : undefined}
            >
              <Icon className="w-[15px] h-[15px] shrink-0" />
              <span className="flex-1">{label}</span>
              {badge ? (
                <span
                  className="text-[10px] font-bold leading-tight px-1.5 py-px rounded-full"
                  style={{ background: "var(--danger)", color: "#fff" }}
                >
                  {badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Coach footer */}
      <div
        className="px-3.5 py-3 flex items-center gap-2.5"
        style={{ borderTop: "1px solid var(--sidebar-hover)" }}
      >
        <div
          className="w-7 h-7 rounded-full text-[11.5px] font-semibold flex items-center justify-center shrink-0"
          style={{ background: "var(--brand-primary-50)", color: "#3730A3" }}
        >
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
