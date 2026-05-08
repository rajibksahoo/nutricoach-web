import Link from "next/link";
import {
  Leaf,
  Users,
  UtensilsCrossed,
  MessageCircle,
  Sparkles,
  TrendingUp,
  CreditCard,
  Check,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface PricingPlan {
  name: string;
  price: string;
  features: string[];
  popular?: boolean;
}

// ── Data ─────────────────────────────────────────────────────────────────────

const FEATURES: Feature[] = [
  {
    icon: <Users className="w-6 h-6 text-indigo-600" />,
    title: "Client Management",
    description:
      "Track all your clients in one place with detailed health profiles, goal tracking, and status filters.",
  },
  {
    icon: <UtensilsCrossed className="w-6 h-6 text-indigo-600" />,
    title: "Meal Plan Builder",
    description:
      "Create detailed 7-day Indian meal plans with nutrition auto-calculation for every item.",
  },
  {
    icon: <MessageCircle className="w-6 h-6 text-indigo-600" />,
    title: "WhatsApp Sharing",
    description:
      "Share meal plans directly to your clients' WhatsApp with one click.",
  },
  {
    icon: <Sparkles className="w-6 h-6 text-indigo-600" />,
    title: "AI Generation",
    description:
      "Generate personalized Indian meal plans instantly using GPT-4o.",
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-indigo-600" />,
    title: "Progress Tracking",
    description:
      "Log measurements, photos, and adherence scores. Chart your clients' progress over time.",
  },
  {
    icon: <CreditCard className="w-6 h-6 text-indigo-600" />,
    title: "Razorpay Billing",
    description:
      "Accept payments in ₹ via UPI and cards. Automated GST invoicing included.",
  },
];

const PLANS: PricingPlan[] = [
  {
    name: "Starter",
    price: "₹999",
    features: [
      "Up to 25 clients",
      "Meal plan builder",
      "WhatsApp sharing",
      "Email support",
    ],
  },
  {
    name: "Professional",
    price: "₹2,499",
    popular: true,
    features: [
      "Up to 100 clients",
      "AI meal plan generation",
      "Progress photos",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    price: "₹4,999",
    features: [
      "Unlimited clients",
      "Everything in Professional",
      "Dedicated account manager",
      "Custom branding",
    ],
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-indigo-600" />
            <span className="font-bold text-lg text-slate-900">NutriCoach</span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
            <Link href="/login" className="hover:text-slate-900 transition-colors">Login</Link>
          </nav>

          {/* CTA */}
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            Start Free Trial
          </Link>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 text-center bg-gradient-to-b from-indigo-50/60 to-white">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
            The nutrition platform built for{" "}
            <span className="text-indigo-600">Indian coaches</span>
          </h1>
          <p className="mt-5 text-lg text-slate-500 leading-relaxed">
            Manage clients, create personalized meal plans, and grow your
            practice — all in one place.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Start Free Trial →
            </Link>
            <a
              href="#pricing"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              See Pricing
            </a>
          </div>

          <p className="mt-5 text-sm text-slate-400">
            14-day free trial · No credit card required · Pay in ₹
          </p>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-3">
            Everything you need to run your practice
          </h2>
          <p className="text-center text-slate-500 mb-12 text-base">
            Built specifically for the Indian nutrition coaching market.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-4 inline-flex items-center justify-center w-11 h-11 rounded-lg bg-indigo-50">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-3">
            Simple, transparent pricing
          </h2>
          <p className="text-center text-slate-500 mb-12 text-base">
            No hidden fees. Cancel any time.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border bg-white p-8 flex flex-col ${
                  plan.popular
                    ? "border-indigo-400 ring-2 ring-indigo-400 shadow-lg"
                    : "border-slate-200 shadow-sm"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-600 text-white">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <p className="font-semibold text-slate-900 mb-1">{plan.name}</p>
                  <p className="text-4xl font-extrabold text-slate-900">
                    {plan.price}
                    <span className="text-base font-normal text-slate-400">/mo</span>
                  </p>
                </div>

                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <Check className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                      {feat}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/login"
                  className={`inline-flex items-center justify-center w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    plan.popular
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="py-8 px-6 border-t border-slate-100 text-center text-sm text-slate-400">
        © 2026 NutriCoach · Built for Indian nutrition professionals
      </footer>
    </div>
  );
}
