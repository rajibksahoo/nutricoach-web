"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import clientApi from "@/lib/client-api";
import { getClientUser, clearClientAuth } from "@/lib/client-auth";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import { User } from "lucide-react";

interface ClientProfile {
  id: string;
  name: string;
  phone: string;
  status: string;
  goal: string | null;
  activityLevel: string | null;
  dietaryPref: string | null;
  weightKg: number | null;
  heightCm: number | null;
  gender: string | null;
  healthConditions: string[] | null;
  allergies: string[] | null;
}

const STATUS_VARIANT: Record<string, "green" | "yellow" | "slate" | "blue"> = {
  ACTIVE: "green",
  PAUSED: "yellow",
  INACTIVE: "slate",
  ONBOARDING: "blue",
};

export default function ClientProfilePage() {
  const router = useRouter();
  const localClient = getClientUser();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientApi.get("/api/v1/portal/profile")
      .then((r) => setProfile(r.data.data))
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    clearClientAuth();
    router.push("/portal/login");
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner className="w-8 h-8" /></div>;
  }

  const p = profile;

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-slate-900">Profile</h1>

      <Card>
        <CardContent className="py-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
              <User className="w-7 h-7 text-indigo-600" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900">{p?.name ?? localClient?.name}</p>
              <p className="text-sm text-slate-500 mt-0.5">+91 {p?.phone ?? localClient?.phone}</p>
              {p?.status && (
                <div className="mt-1.5">
                  <Badge variant={STATUS_VARIANT[p.status] ?? "slate"}>{p.status}</Badge>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {p && (
        <Card>
          <CardHeader>
            <p className="text-sm font-semibold text-slate-900">Health details</p>
          </CardHeader>
          <CardContent className="py-0 divide-y divide-slate-100">
            {[
              { label: "Goal", value: p.goal },
              { label: "Activity level", value: p.activityLevel },
              { label: "Dietary preference", value: p.dietaryPref },
              { label: "Weight", value: p.weightKg != null ? `${p.weightKg} kg` : null },
              { label: "Height", value: p.heightCm != null ? `${p.heightCm} cm` : null },
              { label: "Gender", value: p.gender },
              { label: "Health conditions", value: p.healthConditions?.join(", ") || null },
              { label: "Allergies", value: p.allergies?.join(", ") || null },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-3">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="text-sm font-medium text-slate-800">{value ?? "—"}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Button variant="danger" className="w-full" onClick={handleLogout}>
        Sign out
      </Button>
    </div>
  );
}
