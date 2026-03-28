"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { getCoach, saveAuth, getToken } from "@/lib/auth";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";
import { Pencil } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CoachProfile {
  id: string;
  phone: string;
  name: string;
  email: string | null;
  businessName: string | null;
  gstin: string | null;
  subscriptionTier: string;
  subscriptionStatus: string;
  trialEndsAt: string | null;
  createdAt: string;
}

interface EditForm {
  name: string;
  email: string;
  businessName: string;
  gstin: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

function tierBadge(tier: string): "green" | "blue" | "yellow" | "slate" {
  if (tier === "PROFESSIONAL") return "green";
  if (tier === "ENTERPRISE")   return "blue";
  return "yellow"; // STARTER
}

function statusBadge(status: string): "green" | "yellow" | "red" | "slate" {
  if (status === "ACTIVE")    return "green";
  if (status === "TRIAL")     return "yellow";
  if (status === "PAST_DUE")  return "red";
  return "slate"; // CANCELLED
}

function toEditForm(p: CoachProfile): EditForm {
  return {
    name: p.name,
    email: p.email ?? "",
    businessName: p.businessName ?? "",
    gstin: p.gstin ?? "",
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [profile, setProfile] = useState<CoachProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<EditForm | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.get("/api/v1/coach/me")
      .then((res) => { if (!cancelled) setProfile(res.data.data); })
      .catch(() => { if (!cancelled) toast.error("Failed to load profile"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  function startEdit() {
    if (!profile) return;
    setForm(toEditForm(profile));
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
    if (!form.name.trim() || form.name.trim().length < 2) e.name = "Name must be at least 2 characters";
    if (form.name.trim().length > 100) e.name = "Name must be under 100 characters";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address";
    if (form.businessName.length > 150) e.businessName = "Must be under 150 characters";
    if (form.gstin && !GSTIN_RE.test(form.gstin)) e.gstin = "Invalid GSTIN format (e.g. 22AAAAA0000A1Z5)";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function saveEdit() {
    if (!form || !validate()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email || null,
        businessName: form.businessName || null,
        gstin: form.gstin || null,
      };
      const res = await api.put("/api/v1/coach/me", payload);
      const updated: CoachProfile = res.data.data;
      setProfile(updated);

      // Keep localStorage in sync so the sidebar name updates
      const token = getToken();
      const current = getCoach();
      if (token && current) {
        saveAuth(token, {
          ...current,
          name: updated.name,
          subscriptionTier: updated.subscriptionTier,
          subscriptionStatus: updated.subscriptionStatus,
        });
      }

      cancelEdit();
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-24"><Spinner className="w-8 h-8" /></div>;
  }

  if (!profile) {
    return <div className="text-center py-24 text-slate-400 text-sm">Could not load profile.</div>;
  }

  return (
    <div className="max-w-xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg shrink-0">
            {profile.name[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{profile.name}</h1>
            <p className="text-sm text-slate-400">{profile.phone}</p>
          </div>
        </div>
        {!editing ? (
          <Button size="sm" variant="secondary" onClick={startEdit}>
            <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
          </Button>
        ) : (
          <div className="flex gap-2 shrink-0">
            <Button size="sm" variant="secondary" onClick={cancelEdit}>Cancel</Button>
            <Button size="sm" onClick={saveEdit} loading={saving}>Save</Button>
          </div>
        )}
      </div>

      {/* Profile info */}
      {editing && form ? (
        <EditCard form={form} errors={errors} onChange={setField} />
      ) : (
        <ViewCard profile={profile} />
      )}

      {/* Subscription — always read-only */}
      <Card>
        <CardHeader>
          <p className="text-sm font-semibold text-slate-900">Subscription</p>
        </CardHeader>
        <CardContent className="space-y-2">
          <ProfileRow label="Plan">
            <Badge variant={tierBadge(profile.subscriptionTier)}>
              {profile.subscriptionTier}
            </Badge>
          </ProfileRow>
          <ProfileRow label="Status">
            <Badge variant={statusBadge(profile.subscriptionStatus)}>
              {profile.subscriptionStatus.replace("_", " ")}
            </Badge>
          </ProfileRow>
          {profile.trialEndsAt && profile.subscriptionStatus === "TRIAL" && (
            <ProfileRow label="Trial ends">
              <span className="text-slate-900 text-sm">
                {new Date(profile.trialEndsAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </ProfileRow>
          )}
          <p className="text-xs text-slate-400 pt-1">
            To change your plan, visit{" "}
            <a href="/billing" className="text-emerald-600 hover:underline">Billing</a>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── ViewCard ─────────────────────────────────────────────────────────────────

function ViewCard({ profile }: { profile: CoachProfile }) {
  return (
    <Card>
      <CardHeader>
        <p className="text-sm font-semibold text-slate-900">Profile</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <ProfileSection title="Basic">
          <ProfileRow label="Name">{profile.name}</ProfileRow>
          <ProfileRow label="Phone">{profile.phone}</ProfileRow>
          <ProfileRow label="Email">{profile.email ?? "—"}</ProfileRow>
        </ProfileSection>
        <ProfileSection title="Business">
          <ProfileRow label="Business name">{profile.businessName ?? "—"}</ProfileRow>
          <ProfileRow label="GSTIN">{profile.gstin ?? "—"}</ProfileRow>
        </ProfileSection>
        <ProfileSection title="Account">
          <ProfileRow label="Member since">
            {new Date(profile.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </ProfileRow>
        </ProfileSection>
      </CardContent>
    </Card>
  );
}

// ─── EditCard ─────────────────────────────────────────────────────────────────

function EditCard({
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
        <ProfileSection title="Basic">
          <Input
            id="name"
            label="Full name"
            value={form.name}
            onChange={(e) => onChange("name", e.target.value)}
            error={errors.name}
          />
          <Input
            id="email"
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => onChange("email", e.target.value)}
            error={errors.email}
          />
        </ProfileSection>
        <ProfileSection title="Business">
          <Input
            id="businessName"
            label="Business name"
            value={form.businessName}
            onChange={(e) => onChange("businessName", e.target.value)}
            error={errors.businessName}
          />
          <div className="space-y-1">
            <Input
              id="gstin"
              label="GSTIN"
              value={form.gstin}
              onChange={(e) => onChange("gstin", e.target.value.toUpperCase())}
              error={errors.gstin}
            />
            <p className="text-xs text-slate-400">15-character Indian tax ID, e.g. 22AAAAA0000A1Z5</p>
          </div>
        </ProfileSection>
      </CardContent>
    </Card>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

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
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500 shrink-0 w-32">{label}</span>
      <span className="text-slate-900 text-right">{children}</span>
    </div>
  );
}
