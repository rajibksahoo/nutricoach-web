"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { getCoach, saveAuth, getToken } from "@/lib/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { TRIAL_CLIENT_LIMIT } from "@/lib/plans";

const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PHONE_RE = /^[6-9]\d{9}$/;

type Step = 1 | 2 | 3;

/**
 * First-run setup. A new coach used to land on an empty dashboard with no
 * prompt to set a name, business or GSTIN — those were only reachable by
 * manually visiting /profile.
 *
 * Every step is skippable and the whole flow is resumable: it writes through
 * the existing PUT /coach/me and POST /clients, so leaving halfway keeps
 * whatever was already saved.
 */
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [gstin, setGstin] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Prefill from whatever the coach already has.
  useEffect(() => {
    let cancelled = false;
    api.get("/api/v1/coach/me")
      .then((res) => {
        if (cancelled) return;
        const c = res.data.data;
        setName(c.name ?? "");
        setEmail(c.email ?? "");
        setBusinessName(c.businessName ?? "");
        setGstin(c.gstin ?? "");
      })
      .catch(() => { /* an empty form is a fine fallback */ })
      .finally(() => { if (!cancelled) setReady(true); });
    return () => { cancelled = true; };
  }, []);

  function finish() {
    toast.success("You're all set");
    router.push("/dashboard");
  }

  /** Persist profile fields, keeping the cached coach record in sync. */
  async function saveProfile(patch: Record<string, unknown>): Promise<boolean> {
    setSaving(true);
    try {
      const res = await api.put("/api/v1/coach/me", patch);
      const updated = res.data.data;
      const token = getToken();
      const existing = getCoach();
      if (token && existing) {
        saveAuth(token, {
          ...existing,
          name: updated.name ?? existing.name,
          subscriptionTier: updated.subscriptionTier ?? existing.subscriptionTier,
          subscriptionStatus: updated.subscriptionStatus ?? existing.subscriptionStatus,
        });
      }
      return true;
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(msg ?? "Couldn't save that");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function submitStep1() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Your name is required";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
    setErrors(e);
    if (Object.keys(e).length) return;

    if (await saveProfile({ name: name.trim(), email: email.trim() || null })) setStep(2);
  }

  async function submitStep2() {
    const e: Record<string, string> = {};
    const gst = gstin.trim().toUpperCase();
    if (gst && !GSTIN_RE.test(gst)) e.gstin = "That doesn't look like a valid 15-character GSTIN";
    setErrors(e);
    if (Object.keys(e).length) return;

    if (await saveProfile({
      businessName: businessName.trim() || null,
      gstin: gst || null,
    })) setStep(3);
  }

  async function submitStep3() {
    const e: Record<string, string> = {};
    if (!clientName.trim()) e.clientName = "Client name is required";
    if (!PHONE_RE.test(clientPhone.trim())) e.clientPhone = "Enter a valid 10-digit mobile number";
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    try {
      await api.post("/api/v1/clients", {
        name: clientName.trim(),
        phone: clientPhone.trim(),
      });
      toast.success("First client added");
      finish();
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(msg ?? "Couldn't add the client");
    } finally {
      setSaving(false);
    }
  }

  if (!ready) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <Stepper step={step} />

      <Card className="mt-6">
        <CardContent className="py-7">
          {step === 1 && (
            <StepBody
              title="Welcome to NutriCoach"
              blurb="Let's set up your account. This takes under a minute, and you can change everything later in your profile."
            >
              <Field label="Your name" error={errors.name}>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Priya Menon"
                  autoFocus
                />
              </Field>
              <Field label="Email (optional)" error={errors.email} hint="For receipts and account notices.">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.in"
                />
              </Field>
              <Actions
                onNext={submitStep1}
                nextLabel="Continue"
                saving={saving}
                onSkip={() => setStep(2)}
              />
            </StepBody>
          )}

          {step === 2 && (
            <StepBody
              title="Your practice"
              blurb="Used on the invoices and plans your clients receive."
            >
              <Field label="Business name (optional)">
                <Input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Menon Nutrition Studio"
                  autoFocus
                />
              </Field>
              <Field
                label="GSTIN (optional)"
                error={errors.gstin}
                hint="Add it now and it appears on every GST invoice we issue you."
              >
                <Input
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="29ABCDE1234F1Z5"
                  maxLength={15}
                />
              </Field>
              <Actions
                onNext={submitStep2}
                nextLabel="Continue"
                saving={saving}
                onSkip={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            </StepBody>
          )}

          {step === 3 && (
            <StepBody
              title="Add your first client"
              blurb={`Your free trial covers up to ${TRIAL_CLIENT_LIMIT} clients. They'll get their own portal login using this mobile number.`}
            >
              <Field label="Client name" error={errors.clientName}>
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Arjun Reddy"
                  autoFocus
                />
              </Field>
              <Field label="Mobile number" error={errors.clientPhone} hint="10 digits, no +91.">
                <Input
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="9876543210"
                  inputMode="numeric"
                />
              </Field>
              <Actions
                onNext={submitStep3}
                nextLabel="Add client & finish"
                saving={saving}
                onSkip={finish}
                skipLabel="I'll do this later"
                onBack={() => setStep(2)}
              />
            </StepBody>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const labels = ["You", "Practice", "First client"];
  return (
    <ol className="flex items-center gap-2" aria-label="Setup progress">
      {labels.map((label, i) => {
        const n = (i + 1) as Step;
        const done = n < step;
        const active = n === step;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              aria-current={active ? "step" : undefined}
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                done
                  ? "bg-indigo-600 text-white"
                  : active
                    ? "bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500"
                    : "bg-slate-100 text-slate-400"
              }`}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : n}
            </span>
            <span className={`text-xs ${active ? "font-semibold text-slate-900" : "text-slate-400"}`}>
              {label}
            </span>
            {i < labels.length - 1 && <span className="h-px flex-1 bg-slate-200" />}
          </li>
        );
      })}
    </ol>
  );
}

function StepBody({
  title, blurb, children,
}: { title: string; blurb: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">{blurb}</p>
      </div>
      {children}
    </div>
  );
}

function Field({
  label, error, hint, children,
}: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

function Actions({
  onNext, nextLabel, saving, onSkip, skipLabel = "Skip", onBack,
}: {
  onNext: () => void;
  nextLabel: string;
  saving: boolean;
  onSkip: () => void;
  skipLabel?: string;
  onBack?: () => void;
}) {
  return (
    <div className="flex items-center justify-between pt-1">
      <div className="flex gap-2">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} disabled={saving}>
            Back
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onSkip} disabled={saving}>
          {skipLabel}
        </Button>
      </div>
      <Button size="sm" onClick={onNext} loading={saving}>
        {nextLabel}
        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
