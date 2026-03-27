"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit Indian mobile number");
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/v1/auth/otp/send", { phone });
      toast.success("OTP sent to your phone");
      router.push(`/otp?phone=${phone}`);
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Failed to send OTP";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {process.env.NEXT_PUBLIC_DEV_MODE === "true" && (
          <div className="mb-5 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs font-semibold text-amber-700">DEV MODE — no real SMS sent</p>
            <p className="text-xs text-amber-600 mt-0.5">OTP will be <span className="font-mono font-bold">111111</span></p>
          </div>
        )}
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Sign in</h2>
        <p className="text-sm text-slate-500 mb-6">We'll send a 6-digit OTP to your number</p>
        <form onSubmit={handleSendOtp} className="space-y-4">
          <Input
            id="phone"
            label="Mobile number"
            type="tel"
            placeholder="9876543210"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            error={error}
            autoFocus
          />
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Send OTP
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
