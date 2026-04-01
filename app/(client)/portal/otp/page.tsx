"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import clientApi from "@/lib/client-api";
import { saveClientAuth } from "@/lib/client-auth";
import Button from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Leaf } from "lucide-react";

function ClientOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") ?? "";
  const coachId = searchParams.get("coach") ?? "";

  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";
  const DEV_OTP = "111111";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCountdown, setResendCountdown] = useState(isDevMode ? 0 : 60);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!phone || !coachId) router.push("/portal/login");
    inputs.current[0]?.focus();
  }, [phone, coachId, router]);

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
      const res = await clientApi.post("/api/v1/client-auth/otp/verify", {
        phone,
        otp: code,
        coachId,
      });
      const { token, clientId, coachId: resCoachId, name, phone: resPhone } = res.data.data;
      saveClientAuth(token, { id: clientId, coachId: resCoachId, name, phone: resPhone });
      toast.success("Login successful!");
      router.push("/portal/home");
    } catch (err: any) {
      localStorage.removeItem("nc_client_token");
      setError(err.response?.data?.message ?? "Invalid OTP");
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    try {
      await clientApi.post("/api/v1/client-auth/otp/send", { phone });
      toast.success("OTP resent");
      setResendCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } catch {
      toast.error("Failed to resend OTP");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-600 rounded-xl mb-4">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">NutriCoach</h1>
          <p className="text-sm text-slate-500 mt-1">Client portal</p>
        </div>

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
      </div>
    </div>
  );
}

export default function ClientOtpPage() {
  return (
    <Suspense>
      <ClientOtpForm />
    </Suspense>
  );
}
