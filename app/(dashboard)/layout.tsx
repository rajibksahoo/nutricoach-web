"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import Sidebar from "@/components/layout/Sidebar";
import UpgradePrompt from "@/components/ui/UpgradePrompt";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated()) router.push("/login");
  }, [router]);

  // Sections that own their own chrome (two-pane layout, sticky headers) sit flush against the primary sidebar.
  const fullBleed =
    pathname.startsWith("/library") ||
    pathname.startsWith("/workout-builder") ||
    pathname === "/clients";

  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="ml-[212px] flex-1 overflow-y-auto">
        {fullBleed ? children : (
          <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
        )}
      </main>
      <UpgradePrompt />
    </div>
  );
}
