"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { track } from "@/lib/analytics";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { ArrowLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  GOALS, DIETARY_PREFS, ACTIVITY_LEVELS, GENDERS, type ClientOption,
} from "@/lib/client-options";

/**
 * Adding a client.
 *
 * The backend has accepted fourteen fields since the client module was built,
 * but this form only ever collected three — so a coach had to add someone and
 * then immediately go and edit them to record anything useful.
 *
 * Split in two: what you need to create the client, and what you'd rather
 * capture while you have it. Step two is skippable on purpose — a coach adding
 * someone mid-session should not be blocked on their hip measurement.
 */

interface FormState {
  name: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  goal: string;
  dateOfBirth: string;
  gender: string;
  heightCm: string;
  weightKg: string;
  dietaryPref: string;
  activityLevel: string;
  healthConditions: string;
  allergies: string;
}

const EMPTY: FormState = {
  name: "", phone: "", whatsappNumber: "", email: "", goal: "",
  dateOfBirth: "", gender: "", heightCm: "", weightKg: "",
  dietaryPref: "", activityLevel: "", healthConditions: "", allergies: "",
};

function Select({ id, label, value, options, placeholder, onChange }: {
  id: string; label: string; value: string; options: ClientOption[];
  placeholder: string; onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label} <span className="text-slate-400 font-normal">(optional)</span>
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

/** Comma-separated text to the string list the API expects. */
function toList(text: string): string[] {
  return text.split(",").map((s) => s.trim()).filter(Boolean);
}

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  function validateEssentials() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = "Enter a valid 10-digit mobile number";
    if (form.whatsappNumber && !/^[6-9]\d{9}$/.test(form.whatsappNumber)) {
      e.whatsappNumber = "Enter a valid 10-digit mobile number";
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Enter a valid email address";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateProfile() {
    const e: Record<string, string> = {};
    if (form.heightCm && (Number(form.heightCm) < 50 || Number(form.heightCm) > 250)) {
      e.heightCm = "Enter a height between 50 and 250 cm";
    }
    if (form.weightKg && (Number(form.weightKg) < 20 || Number(form.weightKg) > 300)) {
      e.weightKg = "Enter a weight between 20 and 300 kg";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone,
        ...(form.whatsappNumber && { whatsappNumber: form.whatsappNumber }),
        ...(form.email && { email: form.email.trim() }),
        ...(form.goal && { goal: form.goal }),
        ...(form.dateOfBirth && { dateOfBirth: form.dateOfBirth }),
        ...(form.gender && { gender: form.gender }),
        ...(form.heightCm && { heightCm: Number(form.heightCm) }),
        ...(form.weightKg && { weightKg: Number(form.weightKg) }),
        ...(form.dietaryPref && { dietaryPref: form.dietaryPref }),
        ...(form.activityLevel && { activityLevel: form.activityLevel }),
        ...(toList(form.healthConditions).length && { healthConditions: toList(form.healthConditions) }),
        ...(toList(form.allergies).length && { allergies: toList(form.allergies) }),
      };
      const res = await api.post("/api/v1/clients", payload);
      track("client_added", { viaOnboarding: false });
      toast.success("Client added!");
      router.push(`/clients/${res.data.data.id}`);
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Failed to add client";
      if (err.response?.status === 402) {
        toast.error(msg, { duration: 5000 });
        router.push("/billing");
      } else {
        // A duplicate number is the common one and the message explains it, so
        // step the coach back to where the number is editable.
        toast.error(msg);
        if (err.response?.status === 409) setStep(1);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step === 1) {
      if (validateEssentials()) setStep(2);
      return;
    }
    if (validateProfile()) submit();
  }

  return (
    <div className="max-w-lg space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/clients"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button></Link>
        <h1 className="text-xl font-bold text-slate-900">Add Client</h1>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span className={step === 1 ? "font-semibold text-indigo-600" : "text-slate-400"}>1. Essentials</span>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span className={step === 2 ? "font-semibold text-indigo-600" : "text-slate-400"}>2. Profile</span>
      </div>

      <Card>
        <CardHeader>
          <p className="text-sm text-slate-500">
            {step === 1
              ? "How to reach them"
              : "Anything you already know — all optional, and editable later"}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                <Input id="name" label="Full name" placeholder="Priya Sharma"
                  value={form.name} onChange={(e) => set("name", e.target.value)} error={errors.name} />
                <Input id="phone" label="Mobile number" type="tel" placeholder="9876543210" maxLength={10}
                  value={form.phone} onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))}
                  error={errors.phone} />
                <Input id="whatsappNumber" label="WhatsApp number (if different)" type="tel"
                  placeholder="9876543210" maxLength={10} value={form.whatsappNumber}
                  onChange={(e) => set("whatsappNumber", e.target.value.replace(/\D/g, ""))}
                  error={errors.whatsappNumber} />
                <Input id="email" label="Email (optional)" type="email" placeholder="priya@example.in"
                  value={form.email} onChange={(e) => set("email", e.target.value)} error={errors.email} />
                <Select id="goal" label="Goal" value={form.goal} options={GOALS}
                  placeholder="Select a goal…" onChange={(v) => set("goal", v)} />
                <Button type="submit" className="w-full">Continue</Button>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Input id="dateOfBirth" label="Date of birth" type="date"
                    value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} />
                  <Select id="gender" label="Gender" value={form.gender} options={GENDERS}
                    placeholder="Select…" onChange={(v) => set("gender", v)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input id="heightCm" label="Height (cm)" type="number" placeholder="165"
                    value={form.heightCm} onChange={(e) => set("heightCm", e.target.value)}
                    error={errors.heightCm} />
                  <Input id="weightKg" label="Weight (kg)" type="number" step="0.1" placeholder="62.5"
                    value={form.weightKg} onChange={(e) => set("weightKg", e.target.value)}
                    error={errors.weightKg} />
                </div>
                <Select id="dietaryPref" label="Dietary preference" value={form.dietaryPref}
                  options={DIETARY_PREFS} placeholder="Select…" onChange={(v) => set("dietaryPref", v)} />
                <Select id="activityLevel" label="Activity level" value={form.activityLevel}
                  options={ACTIVITY_LEVELS} placeholder="Select…" onChange={(v) => set("activityLevel", v)} />
                <Input id="healthConditions" label="Health conditions (comma separated)"
                  placeholder="PCOS, hypothyroidism" value={form.healthConditions}
                  onChange={(e) => set("healthConditions", e.target.value)} />
                <Input id="allergies" label="Allergies (comma separated)"
                  placeholder="Peanuts, shellfish" value={form.allergies}
                  onChange={(e) => set("allergies", e.target.value)} />

                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button type="submit" loading={loading} className="flex-1">Add Client</Button>
                </div>
                <button
                  type="button"
                  onClick={() => { setErrors({}); submit(); }}
                  disabled={loading}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-700 disabled:opacity-50"
                >
                  Skip and add with just the essentials
                </button>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
