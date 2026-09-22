"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { useSubscription } from "@/lib/use-subscription";
import { AI_MIN_PLAN, canUseAiMealPlans, formatRupees } from "@/lib/plans";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { Sparkles, X } from "lucide-react";
import {
  type AiJobResponse, type AiJobStatus, type Client,
  POLL_INTERVAL_MS, POLL_TIMEOUT_MS,
} from "./types";

/** Violet is the AI accent across the app and has no token — intentional literals. */
const AI_ACCENT = "#8B5CF6";

export default function AiGenerateModal({ client, onClose, onGenerated }: {
  client: Client;
  onClose: () => void;
  onGenerated: (planId: string) => void;
}) {
  const [status, setStatus] = useState<AiJobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Set when the backend answers 402. The hook below usually spares the coach
  // the round trip, but `SubscriptionGate` is the only authority — if the hook
  // failed to load, or a subscription lapsed mid-session, this is what catches it.
  const [locked, setLocked] = useState(false);
  const cancelledRef = useRef(false);

  const sub = useSubscription();
  // `sub` is null until loaded and stays null on failure; don't lock the UI on
  // a fetch we never got, let the 402 do it.
  const lockedUpFront = sub !== null && !canUseAiMealPlans(sub.tier, sub.status);
  const isLocked = locked || lockedUpFront;

  useEffect(() => {
    cancelledRef.current = false;
    return () => { cancelledRef.current = true; };
  }, []);

  const isWorking = status === "PENDING" || status === "PROCESSING";

  async function startGenerate() {
    setError(null);
    setStatus("PENDING");
    try {
      const res = await api.post("/api/v1/ai/meal-plans/generate", { clientId: client.id });
      const job: AiJobResponse = res.data.data;
      await pollJob(job.id);
    } catch (e: unknown) {
      if (cancelledRef.current) return;
      const res = (e as { response?: { status?: number; data?: { message?: string } } })?.response;
      if (res?.status === 402) {
        setLocked(true);
        setStatus(null);
        return;
      }
      setError(res?.data?.message ?? "Failed to start AI generation");
      setStatus("FAILED");
    }
  }

  async function pollJob(jobId: string) {
    const deadline = Date.now() + POLL_TIMEOUT_MS;
    while (!cancelledRef.current && Date.now() < deadline) {
      try {
        const res = await api.get(`/api/v1/ai/jobs/${jobId}`);
        const job: AiJobResponse = res.data.data;
        if (cancelledRef.current) return;
        setStatus(job.status);

        if (job.status === "COMPLETED" && job.generatedMealPlanId) {
          // Report what was actually produced. This flow used to land the coach
          // on an empty plan while claiming success, so a bare "generated" toast
          // is exactly what we do not want back.
          const days = job.dayCount ?? 0;
          const meals = job.mealCount ?? 0;
          const unverified = job.unmatchedCount ?? 0;
          toast.success(
            `Generated ${days} day${days === 1 ? "" : "s"}, ${meals} meal${meals === 1 ? "" : "s"}` +
            (unverified > 0 ? ` — ${unverified} item${unverified === 1 ? "" : "s"} to check` : ""),
          );
          onGenerated(job.generatedMealPlanId);
          return;
        }
        if (job.status === "FAILED") {
          setError(job.errorMessage ?? "AI generation failed");
          return;
        }
      } catch {
        if (!cancelledRef.current) {
          setError("Lost connection while polling job");
          setStatus("FAILED");
        }
        return;
      }
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
    if (!cancelledRef.current) {
      setError("Generation timed out — check again later");
      setStatus("FAILED");
    }
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--overlay)", padding: 16,
    }}>
      <div style={{
        background: "var(--surface)", borderRadius: 16, boxShadow: "var(--shadow-xl)",
        width: "100%", maxWidth: 400, padding: 24,
        display: "grid", gap: 18,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={18} style={{ color: AI_ACCENT }} />
            <h2 style={{
              fontSize: 16, fontWeight: 700, margin: 0,
              color: "var(--fg1)", letterSpacing: "-0.01em",
            }}>AI Meal Plan</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isWorking}
            style={{
              border: "none", background: "transparent", cursor: isWorking ? "not-allowed" : "pointer",
              color: "var(--fg4)", opacity: isWorking ? 0.4 : 1, padding: 2,
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ background: "var(--bg-subtle)", borderRadius: 12, padding: "12px 16px" }}>
          <div style={{ fontSize: 11.5, color: "var(--fg3)", marginBottom: 2 }}>Client</div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--fg1)" }}>{client.name}</div>
          <div style={{ fontSize: 11.5, color: "var(--fg4)" }}>{client.phone}</div>
        </div>

        <p style={{ fontSize: 11.5, color: "var(--fg3)", lineHeight: 1.65, margin: 0 }}>
          GPT-4o will generate a 7-day Indian meal plan tailored to this client&apos;s dietary
          preferences, goal, and activity level. This takes 30–60 seconds.
        </p>

        {isLocked && (
          <div style={{
            background: "#F5F3FF", border: "1px solid #EDE9FE",
            borderRadius: 12, padding: "12px 16px",
            fontSize: 11.5, color: "var(--fg2)", lineHeight: 1.65,
          }}>
            AI meal plan generation is part of the{" "}
            <strong style={{ color: "var(--fg1)" }}>{AI_MIN_PLAN.label}</strong> plan
            ({formatRupees(AI_MIN_PLAN.priceRupees)}/month). You can still build a plan by hand
            on any plan.
          </div>
        )}

        {isWorking && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            fontSize: 11.5, color: "var(--fg3)",
            background: "#F5F3FF", border: "1px solid #EDE9FE",
            borderRadius: 8, padding: "8px 12px",
          }}>
            <Spinner className="w-4 h-4" />
            {status === "PENDING" ? "Submitting job…" : "Generating plan…"}
          </div>
        )}

        {error && (
          <div style={{
            fontSize: 11.5, color: "var(--danger-700)",
            background: "var(--danger-50)", border: "1px solid var(--danger-50)",
            borderRadius: 8, padding: "8px 12px",
          }}>
            {error}
          </div>
        )}

        {isLocked ? (
          <Link href="/billing" style={{ textDecoration: "none" }}>
            <Button className="w-full">Upgrade to {AI_MIN_PLAN.label}</Button>
          </Link>
        ) : (
          <Button className="w-full" onClick={startGenerate} loading={isWorking} disabled={isWorking}>
            <Sparkles className="w-4 h-4 mr-2" />
            {error ? "Try Again" : "Generate Meal Plan"}
          </Button>
        )}
      </div>
    </div>
  );
}
