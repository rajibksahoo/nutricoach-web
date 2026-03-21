"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { formatCurrency, formatDate } from "@/lib/utils";

interface BillingStatus {
  tier: string;
  status: string;
  trialEndsAt: string | null;
  activeSubscription: {
    id: string;
    planTier: string;
    subscriptionStatus: string;
    checkoutUrl: string | null;
    currentPeriodEnd: string | null;
  } | null;
  invoices: {
    id: string;
    invoiceNumber: string;
    amountPaise: number;
    gstAmountPaise: number;
    status: string;
    invoiceDate: string;
  }[];
}

const PLANS = [
  { tier: "STARTER",      price: 999,  label: "Starter",      clients: "25 clients",    color: "border-slate-200" },
  { tier: "PROFESSIONAL", price: 2499, label: "Professional", clients: "100 clients",   color: "border-emerald-400" },
  { tier: "ENTERPRISE",   price: 4999, label: "Enterprise",   clients: "Unlimited",     color: "border-violet-400" },
];

export default function BillingPage() {
  const [data, setData] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetch_();
  }, []);

  async function fetch_() {
    try {
      const res = await api.get("/api/v1/billing/status");
      setData(res.data.data);
    } catch {
      toast.error("Failed to load billing status");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubscribe(tier: string) {
    setSubscribing(tier);
    try {
      const res = await api.post("/api/v1/billing/subscribe", { planTier: tier });
      const checkoutUrl = res.data.data.activeSubscription?.checkoutUrl;
      if (checkoutUrl) {
        window.open(checkoutUrl, "_blank");
        toast.success("Complete payment in the new tab");
      }
      await fetch_();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Subscription failed");
    } finally {
      setSubscribing(null);
    }
  }

  async function handleCancel() {
    if (!confirm("Cancel your subscription? Access continues until end of billing period.")) return;
    setCancelling(true);
    try {
      await api.delete("/api/v1/billing/cancel");
      toast.success("Subscription cancelled");
      await fetch_();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to cancel");
    } finally {
      setCancelling(false);
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner className="w-8 h-8" /></div>;

  const isActive = data?.status === "ACTIVE";
  const currentTier = data?.activeSubscription?.planTier;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Billing</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Current plan: <span className="font-medium text-slate-700">{data?.tier}</span>
          {" · "}
          <Badge variant={data?.status === "ACTIVE" ? "green" : data?.status === "TRIAL" ? "blue" : "red"}>
            {data?.status}
          </Badge>
          {data?.trialEndsAt && data?.status === "TRIAL" && (
            <span className="ml-2 text-xs text-amber-600">Trial ends {formatDate(data.trialEndsAt)}</span>
          )}
        </p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = currentTier === plan.tier && isActive;
          return (
            <Card key={plan.tier} className={`relative ${plan.color} ${isCurrent ? "ring-2 ring-emerald-500" : ""}`}>
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="green">Current plan</Badge>
                </div>
              )}
              <CardContent className="pt-6 pb-5 text-center space-y-3">
                <p className="font-semibold text-slate-900">{plan.label}</p>
                <p className="text-3xl font-bold text-slate-900">₹{plan.price.toLocaleString("en-IN")}<span className="text-sm font-normal text-slate-400">/mo</span></p>
                <p className="text-sm text-slate-500">{plan.clients}</p>
                <Button
                  variant={isCurrent ? "secondary" : "primary"}
                  size="sm"
                  className="w-full"
                  loading={subscribing === plan.tier}
                  disabled={isCurrent || !!subscribing}
                  onClick={() => handleSubscribe(plan.tier)}
                >
                  {isCurrent ? "Current plan" : isActive ? "Switch plan" : "Subscribe"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Cancel */}
      {isActive && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" loading={cancelling} onClick={handleCancel} className="text-red-500 hover:text-red-600 hover:bg-red-50">
            Cancel subscription
          </Button>
        </div>
      )}

      {/* Invoices */}
      <Card>
        <CardHeader><h2 className="font-semibold text-slate-900">Invoice history</h2></CardHeader>
        <CardContent className="p-0">
          {!data?.invoices?.length ? (
            <p className="text-sm text-slate-400 text-center py-8">No invoices yet</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.invoices.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between px-5 py-3.5 text-sm">
                  <div>
                    <p className="font-medium text-slate-900">{inv.invoiceNumber}</p>
                    <p className="text-xs text-slate-400">{formatDate(inv.invoiceDate)} · GST {formatCurrency(inv.gstAmountPaise)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-900">{formatCurrency(inv.amountPaise)}</span>
                    <Badge variant={inv.status === "PAID" ? "green" : "red"}>{inv.status}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
