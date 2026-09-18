import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import LegalShell, { Section } from "@/components/legal/LegalShell";
import { PLANS, formatRupees, TRIAL_CLIENT_LIMIT } from "@/lib/plans";
import { BUSINESS } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Pricing · NutriCoach",
  description:
    "NutriCoach plans and pricing in INR, inclusive of what each tier includes. GST charged separately.",
};

export default function PricingPage() {
  return (
    <LegalShell
      title="Pricing"
      intro={`Every plan is billed monthly in Indian rupees through Razorpay, and you can cancel any time. Prices exclude 18% GST, which is added at checkout and itemised on your invoice.`}
    >
      <div className="grid gap-5 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.tier}
            className={`relative flex flex-col rounded-2xl border bg-white p-6 ${
              plan.popular
                ? "border-indigo-400 ring-2 ring-indigo-400 shadow-lg"
                : "border-slate-200 shadow-sm"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                  Most Popular
                </span>
              </div>
            )}

            <p className="font-semibold text-slate-900">{plan.label}</p>
            <p className="mt-1 text-3xl font-extrabold text-slate-900">
              {formatRupees(plan.priceRupees)}
              <span className="text-sm font-normal text-slate-400">/mo</span>
            </p>
            <p className="mt-1 text-xs text-slate-400">+ 18% GST</p>

            <ul className="mt-5 mb-7 flex-1 space-y-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/login"
              className={`inline-flex w-full items-center justify-center rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                plan.popular
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              Start free trial
            </Link>
          </div>
        ))}
      </div>

      <Section title="What the free trial includes">
        <p>
          New accounts start on a free trial with up to {TRIAL_CLIENT_LIMIT} clients. No
          card is required and nothing is charged. Subscribe whenever you need more
          clients.
        </p>
      </Section>

      <Section title="Taxes and invoices">
        <p>
          All prices are exclusive of GST at 18%, added at checkout. Every payment
          generates a GST invoice you can see on the Billing page, showing the base amount
          and tax separately. Add your GSTIN in your profile to have it appear on your
          invoices.
        </p>
      </Section>

      <Section title="Payment methods">
        <p>
          Payments are processed by Razorpay, which supports UPI, credit and debit cards,
          net banking and wallets. We never see or store your card details.
        </p>
      </Section>

      <Section title="Changing or cancelling">
        <p>
          Upgrades apply immediately. Downgrades apply at your next renewal. Cancel any
          time from the Billing page and keep access until the period you have paid for
          ends. See the Refund &amp; Cancellation Policy for details.
        </p>
      </Section>

      <Section title="Questions">
        <p>
          Email {BUSINESS.supportEmail} and we will reply within{" "}
          {BUSINESS.supportResponseDays} working days.
        </p>
      </Section>
    </LegalShell>
  );
}
