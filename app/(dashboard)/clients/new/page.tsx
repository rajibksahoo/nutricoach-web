"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", goal: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = "Enter a valid 10-digit mobile number";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post("/api/v1/clients", form);
      toast.success("Client added!");
      router.push(`/clients/${res.data.data.id}`);
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Failed to add client";
      if (err.response?.status === 402) {
        toast.error(msg, { duration: 5000 });
        router.push("/billing");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/clients"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button></Link>
        <h1 className="text-xl font-bold text-slate-900">Add Client</h1>
      </div>
      <Card>
        <CardHeader><p className="text-sm text-slate-500">Basic information</p></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="name" label="Full name" placeholder="Priya Sharma" value={form.name} onChange={(e) => set("name", e.target.value)} error={errors.name} />
            <Input id="phone" label="Mobile number" type="tel" placeholder="9876543210" maxLength={10} value={form.phone} onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))} error={errors.phone} />
            <Input id="goal" label="Goal (optional)" placeholder="e.g. Weight loss, Muscle gain" value={form.goal} onChange={(e) => set("goal", e.target.value)} />
            <Button type="submit" loading={loading} className="w-full">Add Client</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
