import Link from "next/link";
import { Leaf, AlertTriangle } from "lucide-react";
import { BUSINESS, hasUnreplacedPlaceholders } from "@/lib/legal";

export const LEGAL_LINKS = [
  { href: "/pricing", label: "Pricing" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/refund", label: "Refund & Cancellation" },
  { href: "/contact", label: "Contact Us" },
];

/** Shared chrome for the public policy pages. */
export default function LegalShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-6 h-16">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <Leaf className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-slate-900">{BUSINESS.brandName}</span>
          </Link>
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Login
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-slate-400">
          Last updated: {BUSINESS.policiesLastUpdated}
        </p>

        {hasUnreplacedPlaceholders() && <DraftBanner />}

        {intro && <p className="mt-6 text-[15px] leading-relaxed text-slate-600">{intro}</p>}

        <div className="mt-8 space-y-8">{children}</div>
      </main>

      <LegalFooter />
    </div>
  );
}

function DraftBanner() {
  return (
    <div
      role="alert"
      className="mt-6 flex gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3.5"
    >
      <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
      <div className="text-sm text-amber-900">
        <p className="font-semibold">Draft — not ready to publish</p>
        <p className="mt-1 leading-relaxed">
          This page still contains <code className="font-mono text-[12px]">REPLACE_ME</code>{" "}
          placeholders and has not been reviewed by a lawyer. Fill in your business
          details in <code className="font-mono text-[12px]">lib/legal.ts</code> and have
          counsel review the wording before you accept payments. This banner disappears
          once no placeholders remain.
        </p>
      </div>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="mt-2.5 space-y-3 text-[15px] leading-relaxed text-slate-600">
        {children}
      </div>
    </section>
  );
}

export function LegalFooter() {
  return (
    <footer className="border-t border-slate-100 mt-16">
      <div className="max-w-5xl mx-auto px-6 py-10 text-sm text-slate-500">
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {LEGAL_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-slate-900">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 space-y-1 text-xs text-slate-400">
          <p>{BUSINESS.legalEntityName}</p>
          <p>{BUSINESS.registeredAddress}</p>
          <p>
            GSTIN: {BUSINESS.gstin}
            {BUSINESS.cin ? ` · ${BUSINESS.cin}` : ""}
          </p>
          <p>
            {BUSINESS.supportEmail} · {BUSINESS.supportPhone}
          </p>
          <p className="pt-2">
            © {new Date().getFullYear()} {BUSINESS.brandName}. Built for Indian nutrition
            professionals.
          </p>
        </div>
      </div>
    </footer>
  );
}
