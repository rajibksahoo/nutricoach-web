import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import LegalShell, { Section } from "@/components/legal/LegalShell";
import { BUSINESS } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Contact Us · NutriCoach",
  description: "How to reach the NutriCoach team for support, billing or privacy queries.",
};

export default function ContactPage() {
  return (
    <LegalShell
      title="Contact Us"
      intro="Questions about your account, a charge, or your data? Reach us directly — a person reads every message."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <ContactCard icon={<Mail className="w-4 h-4" />} label="Email">
          <a href={`mailto:${BUSINESS.supportEmail}`} className="text-indigo-600 hover:underline">
            {BUSINESS.supportEmail}
          </a>
        </ContactCard>

        <ContactCard icon={<Phone className="w-4 h-4" />} label="Phone">
          <a href={`tel:${BUSINESS.supportPhone}`} className="text-indigo-600 hover:underline">
            {BUSINESS.supportPhone}
          </a>
        </ContactCard>

        <ContactCard icon={<Clock className="w-4 h-4" />} label="Response time">
          Within {BUSINESS.supportResponseDays} working days
        </ContactCard>

        <ContactCard icon={<MapPin className="w-4 h-4" />} label="Registered address">
          {BUSINESS.registeredAddress}
        </ContactCard>
      </div>

      <Section title="Business details">
        <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200">
          <DetailRow label="Legal entity" value={BUSINESS.legalEntityName} />
          <DetailRow label="Brand" value={BUSINESS.brandName} />
          <DetailRow label="GSTIN" value={BUSINESS.gstin} />
          {BUSINESS.cin && <DetailRow label="CIN / LLPIN" value={BUSINESS.cin} />}
        </dl>
      </Section>

      <Section title="Billing and refunds">
        <p>
          For a charge you do not recognise, or to request a refund, email{" "}
          {BUSINESS.supportEmail} with your registered mobile number and the invoice
          number. See our Refund &amp; Cancellation Policy for what qualifies.
        </p>
      </Section>

      <Section title="Privacy and data requests">
        <p>
          To access, correct or delete your data, contact our grievance officer{" "}
          {BUSINESS.grievanceOfficer} at {BUSINESS.grievanceEmail}. If you are a coaching
          client, contact your coach first — they control your record.
        </p>
      </Section>
    </LegalShell>
  );
}

function ContactCard({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <div className="mt-2 text-[15px] text-slate-700 break-words">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 px-4 py-3 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-900">{value}</dd>
    </div>
  );
}
