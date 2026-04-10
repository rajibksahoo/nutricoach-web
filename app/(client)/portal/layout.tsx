"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isClientAuthenticated } from "@/lib/client-auth";
import ClientNav from "@/components/layout/ClientNav";

const PUBLIC_PATHS = ["/portal/login", "/portal/otp"];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (!isPublic && !isClientAuthenticated()) {
      router.push("/portal/login");
    }
  }, [isPublic, router]);

  if (isPublic) return <>{children}</>;

  return (
    <div className="min-h-screen bg-slate-50">
      <ClientNav />
      <main className="max-w-2xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
