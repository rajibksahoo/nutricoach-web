"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import Button from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

function OtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") ?? "";

  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";
  const DEV_OTP = "111111";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCountdown, setResendCountdown] = useState(isDevMode ? 0 : 60);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!phone) router.push("/login");
    inputs.current[0]?.focus();
  }, [phone, router]);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCountdown]);

  function handleChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) { setError("Enter the complete 6-digit OTP"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/api/v1/auth/otp/verify", { phone, otp: code });
      const { token, coachId, phone: coachPhone } = res.data.data;

      // Save token first so the profile fetch is authenticated
      localStorage.setItem("nc_token", token);

      // Fetch full coach profile for name + subscription info
      let name = "";
      let subscriptionTier = "";
      let subscriptionStatus = "";
      try {
        const profileRes = await api.get("/api/v1/coach/me");
        const p = profileRes.data.data;
        name = p.name ?? "";
        subscriptionTier = p.subscriptionTier ?? "";
        subscriptionStatus = p.subscriptionStatus ?? "";
      } catch {
        // Non-fatal — proceed with empty fields, profile can be loaded later
      }

      saveAuth(token, { id: coachId, phone: coachPhone, name, subscriptionTier, subscriptionStatus });
      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (err: any) {
      localStorage.removeItem("nc_token");
      setError(err.response?.data?.message ?? "Invalid OTP");
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    try {
      await api.post("/api/v1/auth/otp/send", { phone });
      toast.success("OTP resent");
      setResendCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } catch {
      toast.error("Failed to resend OTP");
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {isDevMode && (
          <div className="mb-5 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs font-semibold text-amber-700 mb-1">DEV MODE</p>
            <p className="text-xs text-amber-600">
              Use OTP <span className="font-mono font-bold">{DEV_OTP}</span> or{" "}
              <button
                type="button"
                onClick={() => setOtp(DEV_OTP.split(""))}
                className="underline font-medium hover:text-amber-800"
              >
                auto-fill
              </button>
            </p>
          </div>
        )}
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Enter OTP</h2>
        <p className="text-sm text-slate-500 mb-6">Sent to +91 {phone}</p>
        <form onSubmit={handleVerify} className="space-y-5">
          <div className="flex gap-2 justify-center">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputs.current[i] = el; }}
                type="tel"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-11 h-12 text-center text-lg font-semibold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            ))}
          </div>
          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Verify OTP
          </Button>
          <div className="text-center">
            {resendCountdown > 0 ? (
              <p className="text-sm text-slate-400">Resend in {resendCountdown}s</p>
            ) : (
              <button type="button" onClick={handleResend} className="text-sm text-emerald-600 font-medium hover:underline">
                Resend OTP
              </button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function OtpPage() {
  return (
    <Suspense>
      <OtpForm />
    </Suspense>
  );
}
