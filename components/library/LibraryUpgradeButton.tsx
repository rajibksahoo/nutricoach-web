"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

export default function LibraryUpgradeButton() {
  return (
    <Link
      href="/billing"
      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition-colors"
    >
      <Zap className="w-4 h-4 fill-current" />
      Upgrade
    </Link>
  );
}
