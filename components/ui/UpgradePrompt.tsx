"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UpgradeRequiredEvent extends CustomEvent {
  detail: { message: string };
}

export default function UpgradePrompt() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    function handleUpgradeRequired(e: Event) {
      const event = e as UpgradeRequiredEvent;
      setMessage(event.detail?.message ?? "Upgrade your plan to continue.");
      setVisible(true);
    }

    window.addEventListener("nutricoach:upgrade-required", handleUpgradeRequired);
    return () => {
      window.removeEventListener("nutricoach:upgrade-required", handleUpgradeRequired);
    };
  }, []);

  if (!visible) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={() => setVisible(false)}
    >
      {/* Modal card */}
      <div
        className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="mb-5 flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 mx-auto">
          <svg
            className="w-6 h-6 text-amber-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-slate-900 text-center mb-2">
          Client Limit Reached
        </h2>
        <p className="text-sm text-slate-500 text-center leading-relaxed mb-8">
          {message}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              setVisible(false);
              router.push("/billing");
            }}
            className="flex-1 inline-flex items-center justify-center py-2.5 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
          >
            Upgrade Plan
          </button>
          <button
            onClick={() => setVisible(false)}
            className="flex-1 inline-flex items-center justify-center py-2.5 rounded-lg text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
