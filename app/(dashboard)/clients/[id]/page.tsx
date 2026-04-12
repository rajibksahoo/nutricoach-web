"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge, { clientStatusBadge } from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";
import { ArrowLeft, Pencil, UtensilsCrossed, BarChart2, Trash2, ExternalLink } from "lucide-react";
import { getCoach } from "@/lib/auth";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  whatsappNumber: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  heightCm: number | null;
  weightKg: string | null;
  goal: string | null;
  dietaryPref: string | null;
  activityLevel: string | null;
  healthConditions: string[] | null;
  allergies: string[] | null;
  status: string;
  createdAt: string;
}

interface EditForm {
  name: string;
  email: string;
  whatsappNumber: string;
  dateOfBirth: string;
  gender: string;
  heightCm: string;
  weightKg: string;
  goal: string;
  dietaryPref: string;
  activityLevel: string;
  status: string;
  healthConditions: string;
  allergies: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GOALS = [
  { value: "WEIGHT_LOSS", label: "Weight Loss" },
  { value: "WEIGHT_GAIN", label: "Weight Gain" },
  { value: "MUSCLE_GAIN", label: "Muscle Gain" },
  { value: "MAINTENANCE", label: "Maintenance" },
];

const DIETARY_PREFS = [
  { value: "VEG", label: "Vegetarian" },
  { value: "NON_VEG", label: "Non-Veg" },
  { value: "VEGAN", label: "Vegan" },
  { value: "JAIN", label: "Jain" },
  { value: "EGGETARIAN", label: "Eggetarian" },
];

const ACTIVITY_LEVELS = [
  { value: "SEDENTARY", label: "Sedentary" },
  { value: "LIGHT", label: "Light" },
  { value: "MODERATE", label: "Moderate" },
  { value: "ACTIVE", label: "Active" },
  { value: "VERY_ACTIVE", label: "Very Active" },
];

const GENDERS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

const STATUSES = [
  { value: "ONBOARDING", label: "Onboarding" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function optionLabel(options: { value: string; label: string }[], value: string | null) {
  return options.find((o) => o.value === value)?.label ?? value ?? "—";
}

function toEditForm(c: Client): EditForm {
  return {
    name: c.name,
    email: c.email ?? "",
    whatsappNumber: c.whatsappNumber ?? "",
    dateOfBirth: c.dateOfBirth ?? "",
    gender: c.gender ?? "",
    heightCm: c.heightCm != null ? String(c.heightCm) : "",
    weightKg: c.weightKg != null ? String(parseFloat(c.weightKg)) : "",
    goal: c.goal ?? "",
    dietaryPref: c.dietaryPref ?? "",
    activityLevel: c.activityLevel ?? "",
    status: c.status,
    healthConditions: (c.healthConditions ?? []).join(", "),
    allergies: (c.allergies ?? []).join(", "),
  };
}

function splitTags(value: string): string[] {
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.id as string;
  const router = useRouter();

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<EditForm | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [coachId, setCoachId] = useState<string | null>(null);

  useEffect(() => {
    setCoachId(getCoach()?.id ?? null);
    let cancelled = false;
    api.get(`/api/v1/clients/${clientId}`)
      .then((res) => { if (!cancelled) setClient(res.data.data); })
      .catch(() => { if (!cancelled) toast.error("Failed to load client"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [clientId]);

  function startEdit() {
    if (!client) return;
    setForm(toEditForm(client));
    setErrors({});
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setForm(null);
    setErrors({});
  }

  function setField(field: keyof EditForm, value: string) {
    setForm((f) => f ? { ...f, [field]: value } : f);
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  function validate(): boolean {
    if (!form) return false;
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (form.whatsappNumber && !/^[6-9]\d{9}$/.test(form.whatsappNumber)) e.whatsappNumber = "Enter a valid 10-digit number";
    if (form.heightCm && (Number(form.heightCm) < 50 || Number(form.heightCm) > 300)) e.heightCm = "Must be 50–300 cm";
    if (form.weightKg && (Number(form.weightKg) < 10 || Number(form.weightKg) > 500)) e.weightKg = "Must be 10–500 kg";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function saveEdit() {
    if (!form || !validate()) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim() || undefined,
        email: form.email || null,
        whatsappNumber: form.whatsappNumber || null,
        dateOfBirth: form.dateOfBirth || null,
        gender: form.gender || null,
        heightCm: form.heightCm ? Number(form.heightCm) : null,
        weightKg: form.weightKg ? Number(form.weightKg) : null,
        goal: form.goal || null,
        dietaryPref: form.dietaryPref || null,
        activityLevel: form.activityLevel || null,
        status: form.status || undefined,
        healthConditions: splitTags(form.healthConditions),
        allergies: splitTags(form.allergies),
      };
      const res = await api.put(`/api/v1/clients/${clientId}`, payload);
      setClient(res.data.data);
      cancelEdit();
      toast.success("Client updated");
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to update client");
    } finally {
      setSaving(false);
    }
  }

  async function deleteClient() {
    if (!confirm(`Delete ${client?.name}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await api.delete(`/api/v1/clients/${clientId}`);
      toast.success("Client deleted");
      router.push("/clients");
    } catch {
      toast.error("Failed to delete client");
      setDeleting(false);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-24"><Spinner className="w-8 h-8" /></div>;
  }

  if (!client) {
    return (
      <div className="text-center py-24 text-slate-400 text-sm">
        Client not found.{" "}
        <button onClick={() => router.push("/clients")} className="text-emerald-600 underline">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/clients")}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-base shrink-0">
              {client.name[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900">{client.name}</h1>
                <Badge variant={clientStatusBadge(client.status)}>{client.status}</Badge>
              </div>
              <p className="text-sm text-slate-400">{client.phone}</p>
            </div>
          </div>
        </div>
        {!editing ? (
          <div className="flex gap-2 shrink-0">
            {process.env.NEXT_PUBLIC_DEV_MODE === "true" && coachId && (
              <a
                href={`/portal/login?coach=${coachId}&phone=${client.phone}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="ghost">
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  Client View
                </Button>
              </a>
            )}
            <Button size="sm" variant="secondary" onClick={startEdit}>
              <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
            </Button>
          </div>
        ) : (
          <div className="flex gap-2 shrink-0">
            <Button size="sm" variant="secondary" onClick={cancelEdit}>Cancel</Button>
            <Button size="sm" onClick={saveEdit} loading={saving}>Save</Button>
          </div>
        )}
      </div>

      {/* Profile */}
      {editing && form ? (
        <EditProfileCard form={form} errors={errors} onChange={setField} />
      ) : (
        <ViewProfileCard client={client} />
      )}

      {/* Quick actions */}
      {!editing && (
        <div className="grid grid-cols-2 gap-3">
          <Link href="/meal-plans">
            <Card className="hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer">
              <CardContent className="flex items-center gap-3 py-4">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Meal Plans</p>
                  <p className="text-xs text-slate-400">View &amp; manage plans</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/progress">
            <Card className="hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer">
              <CardContent className="flex items-center gap-3 py-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <BarChart2 className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Progress</p>
                  <p className="text-xs text-slate-400">Logs &amp; check-ins</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}

      {/* Danger zone */}
      {!editing && (
        <Card className="border-red-100">
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-medium text-slate-900">Delete client</p>
              <p className="text-xs text-slate-400">Permanently removes this client and all their data.</p>
            </div>
            <Button size="sm" variant="danger" onClick={deleteClient} loading={deleting}>
              <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── ViewProfileCard ──────────────────────────────────────────────────────────

function ViewProfileCard({ client }: { client: Client }) {
  return (
    <Card>
      <CardHeader>
        <p className="text-sm font-semibold text-slate-900">Profile</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <ProfileSection title="Body">
          <ProfileRow label="Gender">{optionLabel(GENDERS, client.gender)}</ProfileRow>
          <ProfileRow label="Date of birth">{client.dateOfBirth ?? "—"}</ProfileRow>
          <ProfileRow label="Height">{client.heightCm != null ? `${client.heightCm} cm` : "—"}</ProfileRow>
          <ProfileRow label="Weight">{client.weightKg != null ? `${parseFloat(client.weightKg)} kg` : "—"}</ProfileRow>
        </ProfileSection>

        <ProfileSection title="Goals & Lifestyle">
          <ProfileRow label="Goal">{optionLabel(GOALS, client.goal)}</ProfileRow>
          <ProfileRow label="Diet">{optionLabel(DIETARY_PREFS, client.dietaryPref)}</ProfileRow>
          <ProfileRow label="Activity">{optionLabel(ACTIVITY_LEVELS, client.activityLevel)}</ProfileRow>
        </ProfileSection>

        <ProfileSection title="Contact">
          <ProfileRow label="Email">{client.email ?? "—"}</ProfileRow>
          <ProfileRow label="WhatsApp">{client.whatsappNumber ?? "—"}</ProfileRow>
        </ProfileSection>

        {((client.healthConditions?.length ?? 0) > 0 || (client.allergies?.length ?? 0) > 0) && (
          <ProfileSection title="Health">
            {(client.healthConditions?.length ?? 0) > 0 && (
              <ProfileRow label="Conditions">
                <TagList tags={client.healthConditions!} />
              </ProfileRow>
            )}
            {(client.allergies?.length ?? 0) > 0 && (
              <ProfileRow label="Allergies">
                <TagList tags={client.allergies!} />
              </ProfileRow>
            )}
          </ProfileSection>
        )}
      </CardContent>
    </Card>
  );
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ProfileRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between text-sm">
      <span className="text-slate-500 shrink-0 w-32">{label}</span>
      <span className="text-slate-900 text-right">{children}</span>
    </div>
  );
}

function TagList({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-1 justify-end">
      {tags.map((t) => (
        <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-xs">{t}</span>
      ))}
    </div>
  );
}

// ─── EditProfileCard ──────────────────────────────────────────────────────────

function EditProfileCard({
  form,
  errors,
  onChange,
}: {
  form: EditForm;
  errors: Record<string, string>;
  onChange: (field: keyof EditForm, value: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <p className="text-sm font-semibold text-slate-900">Edit Profile</p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Basic */}
        <ProfileSection title="Basic">
          <Input
            id="name"
            label="Full name"
            value={form.name}
            onChange={(e) => onChange("name", e.target.value)}
            error={errors.name}
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Status</label>
            <SelectField value={form.status} options={STATUSES} onChange={(v) => onChange("status", v)} />
          </div>
        </ProfileSection>

        {/* Body */}
        <ProfileSection title="Body">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Gender</label>
              <SelectField
                value={form.gender}
                options={GENDERS}
                placeholder="Select…"
                onChange={(v) => onChange("gender", v)}
              />
            </div>
            <Input
              id="dob"
              label="Date of birth"
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => onChange("dateOfBirth", e.target.value)}
            />
            <Input
              id="height"
              label="Height (cm)"
              type="number"
              min={50}
              max={300}
              value={form.heightCm}
              onChange={(e) => onChange("heightCm", e.target.value)}
              error={errors.heightCm}
            />
            <Input
              id="weight"
              label="Weight (kg)"
              type="number"
              min={10}
              max={500}
              step={0.1}
              value={form.weightKg}
              onChange={(e) => onChange("weightKg", e.target.value)}
              error={errors.weightKg}
            />
          </div>
        </ProfileSection>

        {/* Goals */}
        <ProfileSection title="Goals & Lifestyle">
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Goal</label>
              <SelectField
                value={form.goal}
                options={GOALS}
                placeholder="Select a goal…"
                onChange={(v) => onChange("goal", v)}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Dietary preference</label>
              <SelectField
                value={form.dietaryPref}
                options={DIETARY_PREFS}
                placeholder="Select…"
                onChange={(v) => onChange("dietaryPref", v)}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Activity level</label>
              <SelectField
                value={form.activityLevel}
                options={ACTIVITY_LEVELS}
                placeholder="Select…"
                onChange={(v) => onChange("activityLevel", v)}
              />
            </div>
          </div>
        </ProfileSection>

        {/* Contact */}
        <ProfileSection title="Contact">
          <div className="space-y-3">
            <Input
              id="email"
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => onChange("email", e.target.value)}
              error={errors.email}
            />
            <Input
              id="whatsapp"
              label="WhatsApp number"
              type="tel"
              placeholder="10-digit mobile"
              maxLength={10}
              value={form.whatsappNumber}
              onChange={(e) => onChange("whatsappNumber", e.target.value.replace(/\D/g, ""))}
              error={errors.whatsappNumber}
            />
          </div>
        </ProfileSection>

        {/* Health */}
        <ProfileSection title="Health">
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Health conditions
                <span className="text-slate-400 font-normal ml-1">(comma-separated)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Diabetes, Hypertension"
                value={form.healthConditions}
                onChange={(e) => onChange("healthConditions", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Allergies
                <span className="text-slate-400 font-normal ml-1">(comma-separated)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Peanuts, Gluten"
                value={form.allergies}
                onChange={(e) => onChange("allergies", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </ProfileSection>
      </CardContent>
    </Card>
  );
}

function SelectField({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
