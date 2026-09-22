"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import ErrorState from "@/components/ui/ErrorState";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PLANS, formatRupees, tierRank } from "@/lib/plans";
import { track } from "@/lib/analytics";
import {
  getBillingStatus, subscribe, cancelSubscription, pollUntilActive,
  RAZORPAY_KEY_ID, type BillingStatus,
} from "@/lib/billing-api";
import { useRazorpayScript } from "@/lib/use-razorpay";
import { getCoach } from "@/lib/auth";

export default function BillingPage() {
  const [data, setData] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [busyTier, setBusyTier] = useState<string | null>(null);
  const [awaitingPayment, setAwaitingPayment] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { ready: razorpayReady, failed: razorpayFailed } = useRazorpayScript();

  const load = useCallback(async () => {
    try {
      setData(await getBillingStatus());
      setLoadFailed(false);
    } catch {
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /**
   * Create the subscription, then collect payment in Razorpay's in-page modal.
   * Activation happens server-side via the Razorpay webhook, so once the modal
   * succeeds we poll `/billing/status` until that lands rather than
   * optimistically claiming the plan changed.
   */
  async function handleSubscribe(tier: string) {
    // Check we can actually collect payment BEFORE creating a subscription —
    // otherwise a missing key or blocked script leaves an orphaned Razorpay
    // subscription behind on every click.
    if (!RAZORPAY_KEY_ID) {
      toast.error("Payments aren't configured (NEXT_PUBLIC_RAZORPAY_KEY_ID is unset).");
      return;
    }
    if (!razorpayReady || !window.Razorpay) {
      toast.error("Payment window couldn't load. Check your connection and retry.");
      return;
    }

    setBusyTier(tier);
    track("checkout_started", { tier });
    let status: BillingStatus;
    try {
      status = await subscribe(tier);
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(msg ?? "Couldn't start the subscription");
      setBusyTier(null);
      return;
    }

    setData(status);
    const subId = status.activeSubscription?.razorpaySubscriptionId;

    if (!subId) {
      toast.error("Razorpay didn't return a subscription. Nothing has been charged.");
      setBusyTier(null);
      return;
    }

    const coach = getCoach();
    const previous = status;

    const rzp = new window.Razorpay({
      key: RAZORPAY_KEY_ID,
      subscription_id: subId,
      name: "NutriCoach",
      description: `${tier.charAt(0) + tier.slice(1).toLowerCase()} plan, billed monthly`,
      prefill: {
        name: coach?.name ?? undefined,
        contact: coach?.phone ?? undefined,
      },
      theme: { color: "#4F46E5" },
      handler: () => {
        // Razorpay captured the payment; our webhook flips the tier.
        setAwaitingPayment(true);
        setBusyTier(null);
        // Fired here, not on the Razorpay handler alone: the webhook is the
        // source of truth for activation, so "paid" and "active" are different
        // events and conflating them would overcount revenue.
        pollUntilActive(previous)
          .then((next) => {
            if (next) {
              setData(next);
              track("subscription_activated", { tier });
              toast.success("Payment received, your plan is active");
            } else {
              toast.success("Payment received. Activation can take a minute, refresh shortly.");
            }
          })
          .finally(() => setAwaitingPayment(false));
      },
      modal: {
        ondismiss: () => {
          setBusyTier(null);
          toast("Payment cancelled, you have not been charged.");
        },
      },
    });

    rzp.on("payment.failed", () => {
      setBusyTier(null);
      toast.error("Payment failed. You have not been charged.");
    });

    rzp.open();
  }

  async function handleCancel() {
    if (!confirm("Cancel your subscription? Access continues until the end of the billing period.")) return;
    setCancelling(true);
    try {
      setData(await cancelSubscription());
      toast.success("Subscription cancelled");
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(msg ?? "Failed to cancel");
    } finally {
      setCancelling(false);
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner className="w-8 h-8" /></div>;

  if (loadFailed || !data) {
    return (
      <ErrorState
        fullHeight={false}
        title="Couldn't load billing"
        message="We couldn't reach the server. No charge has been made."
        onRetry={() => { setLoading(true); load(); }}
      />
    );
  }

  const isActive = data.status === "ACTIVE";
  const isTrial = data.status === "TRIAL";
  const currentTier = isActive ? data.activeSubscription?.planTier : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Billing</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Current plan: <span className="font-medium text-slate-700">{data.tier}</span>
          {" · "}
          <Badge variant={isActive ? "green" : isTrial ? "blue" : "red"}>{data.status}</Badge>
          {isTrial && data.trialEndsAt && (
            <span className="ml-2 text-xs text-amber-600">Trial ends {formatDate(data.trialEndsAt)}</span>
          )}
        </p>
      </div>

      {razorpayFailed && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          The payment window could not load. Disable any script blocker and reload before subscribing.
        </div>
      )}

      {awaitingPayment && (
        <div className="flex items-center gap-2.5 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
          <Spinner className="w-4 h-4" />
          Confirming your payment with Razorpay...
        </div>
      )}

      {/* Plans */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = currentTier === plan.tier;
          const delta = tierRank(plan.tier) - tierRank(currentTier);
          const verb = !isActive ? "Subscribe" : delta > 0 ? "Upgrade" : "Downgrade";
          return (
            <Card
              key={plan.tier}
              className={`relative ${plan.popular ? "border-indigo-400" : ""} ${isCurrent ? "ring-2 ring-indigo-500" : ""}`}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="green">Current plan</Badge>
                </div>
              )}
              <CardContent className="pt-6 pb-5 text-center space-y-3">
                <p className="font-semibold text-slate-900">{plan.label}</p>
                <p className="text-3xl font-bold text-slate-900">
                  {formatRupees(plan.priceRupees)}
                  <span className="text-sm font-normal text-slate-400">/mo</span>
                </p>
                <p className="text-sm text-slate-500">{plan.clientsLabel}</p>
                <Button
                  variant={isCurrent ? "secondary" : "primary"}
                  size="sm"
                  className="w-full"
                  loading={busyTier === plan.tier}
                  disabled={isCurrent || !!busyTier || awaitingPayment}
                  onClick={() => handleSubscribe(plan.tier)}
                >
                  {isCurrent ? "Current plan" : verb}
                </Button>
                <p className="text-[11px] text-slate-400">Plus 18% GST, billed monthly</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {isActive && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            loading={cancelling}
            onClick={handleCancel}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            Cancel subscription
          </Button>
        </div>
      )}

      {/* Invoices */}
      <Card>
        <CardHeader><h2 className="font-semibold text-slate-900">Invoice history</h2></CardHeader>
        <CardContent className="p-0">
          {!data.invoices?.length ? (
            <p className="text-sm text-slate-400 text-center py-8">No invoices yet</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.invoices.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between px-5 py-3.5 text-sm">
                  <div>
                    <p className="font-medium text-slate-900">{inv.invoiceNumber}</p>
                    <p className="text-xs text-slate-400">
                      {inv.invoiceDate ? formatDate(inv.invoiceDate) : "—"}
                      {" · GST "}{formatCurrency(inv.gstAmountPaise ?? 0)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-900">{formatCurrency(inv.amountPaise ?? 0)}</span>
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
