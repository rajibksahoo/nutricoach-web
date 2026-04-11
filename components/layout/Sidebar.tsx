"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuth, getCoach } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  TrendingUp,
  CreditCard,
  LogOut,
  Leaf,
  UserCircle,
  Inbox,
} from "lucide-react";

const navItems = [
  { href: "/dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { href: "/clients",    label: "Clients",     icon: Users           },
  { href: "/messages",   label: "Inbox",       icon: Inbox           },
  { href: "/meal-plans", label: "Meal Plans",  icon: UtensilsCrossed },
  { href: "/progress",   label: "Progress",    icon: TrendingUp      },
  { href: "/billing",    label: "Billing",     icon: CreditCard      },
  { href: "/profile",    label: "Profile",     icon: UserCircle      },
];

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
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
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
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Coach info + logout */}
      <div className="px-3 py-4 border-t border-slate-800">
        {coach && (
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-white truncate">{coach.name}</p>
            <p className="text-xs text-slate-500 truncate">{coach.phone}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
