"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserPlus, X } from "lucide-react";
import api from "@/lib/api";

interface Client { id: string }

export default function LibraryOnboardingPill() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("nc_onboarding_pill_dismissed") === "1") {
      setDismissed(true);
      return;
    }
    api
      .get<{ data: Client[] }>("/api/v1/clients")
      .then((r) => setShow((r.data.data ?? []).length === 0))
      .catch(() => {});
  }, []);

  function dismiss() {
    localStorage.setItem("nc_onboarding_pill_dismissed", "1");
    setDismissed(true);
  }

  if (!show || dismissed) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <div className="flex items-center gap-3 pl-4 pr-2 py-2 rounded-full bg-slate-900 text-white shadow-lg ring-1 ring-black/5">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500">
            <UserPlus className="w-3.5 h-3.5 text-white" />
          </span>
          <span className="text-sm font-medium">Add your first client</span>
        </div>
        <Link
          href="/clients/new"
          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-500 hover:bg-indigo-400 transition-colors"
        >
          Start
        </Link>
        <button
          onClick={dismiss}
          className="p-1 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </div>
  );
}
