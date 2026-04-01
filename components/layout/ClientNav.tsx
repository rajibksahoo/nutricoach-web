"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearClientAuth, getClientUser } from "@/lib/client-auth";
import { Leaf, Home, UtensilsCrossed, TrendingUp, ClipboardList, User, LogOut } from "lucide-react";

const NAV = [
  { href: "/portal/home", label: "Home", icon: Home },
  { href: "/portal/meal-plans", label: "Meal Plans", icon: UtensilsCrossed },
  { href: "/portal/progress", label: "Progress", icon: TrendingUp },
  { href: "/portal/check-ins", label: "Check-ins", icon: ClipboardList },
  { href: "/portal/profile", label: "Profile", icon: User },
];

export default function ClientNav() {
  const pathname = usePathname();
  const router = useRouter();
  const client = getClientUser();

  function handleLogout() {
    clearClientAuth();
    router.push("/portal/login");
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center shrink-0">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-slate-900">NutriCoach</span>
        </div>
        {client && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden sm:block">{client.name}</span>
            <button onClick={handleLogout} className="text-slate-400 hover:text-slate-600 transition-colors" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom nav tabs */}
      <nav className="max-w-2xl mx-auto px-4 flex border-t border-slate-100">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
                active ? "text-emerald-600 border-b-2 border-emerald-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
