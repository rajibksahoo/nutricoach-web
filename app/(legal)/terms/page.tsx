import type { Metadata } from "next";
import LegalShell, { Section } from "@/components/legal/LegalShell";
import { BUSINESS } from "@/lib/legal";
import { PLANS, formatRupees, TRIAL_CLIENT_LIMIT } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Terms of Service · NutriCoach",
  description: "The terms governing use of the NutriCoach coaching platform.",
};

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of Service"
      intro={`These terms govern your use of ${BUSINESS.brandName}, operated by ${BUSINESS.legalEntityName}. By creating an account or subscribing to a plan, you agree to them.`}
    >
      <Section title="1. Who we are">
        <p>
          {BUSINESS.brandName} is a software platform operated by{" "}
          {BUSINESS.legalEntityName}, registered at {BUSINESS.registeredAddress}. You can
          reach us at {BUSINESS.supportEmail}.
        </p>
      </Section>

      <Section title="2. What the service does">
        <p>
          {BUSINESS.brandName} provides tools for nutrition and fitness coaches to manage
          clients, build meal plans and workout programs, track client progress, message
          clients, and handle subscription billing. We provide software only. We do not
          provide medical, nutritional or fitness advice.
        </p>
      </Section>

      <Section title="3. Accounts and eligibility">
        <p>
          You need an Indian mobile number to register, and you must be at least 18 years
          old. You are responsible for everything that happens under your account,
          including keeping your device and phone number secure. Tell us promptly at{" "}
          {BUSINESS.supportEmail} if you believe your account has been accessed without
          your permission.
        </p>
      </Section>

      <Section title="4. Your responsibilities as a coach">
        <p>
          You are solely responsible for the professional advice, meal plans and training
          programs you deliver to your clients through the platform, and for holding any
          qualifications, registrations or licences your practice requires.
        </p>
        <p>
          You are responsible for having a lawful basis to upload your clients&apos;
          personal and health information, and for telling them how their data will be
          used. In data-protection terms, you determine why and how that data is
          processed; we process it on your instructions in order to run the service.
        </p>
      </Section>

      <Section title="5. Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>break any applicable law, or use the service to harm or defraud anyone;</li>
          <li>upload malware, or attempt to break, overload or probe our systems;</li>
          <li>
            access another coach&apos;s or client&apos;s data, or try to work around the
            limits of your plan;
          </li>
          <li>resell or white-label the service without our written agreement;</li>
          <li>send unsolicited bulk messages through the platform.</li>
        </ul>
      </Section>

      <Section title="6. Plans, trials and payment">
        <p>
          New accounts include a free trial limited to {TRIAL_CLIENT_LIMIT} clients. Paid
          plans are billed monthly in advance through Razorpay:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          {PLANS.map((p) => (
            <li key={p.tier}>
              <strong>{p.label}</strong> — {formatRupees(p.priceRupees)} per month plus 18%
              GST, {p.clientsLabel.toLowerCase()}.
            </li>
          ))}
        </ul>
        <p>
          Prices are exclusive of GST, which is added at checkout and shown on your
          invoice. We may change prices with at least 30 days&apos; notice; changes take
          effect at your next renewal. If you exceed your plan&apos;s client limit you
          will need to upgrade before adding more clients.
        </p>
      </Section>

      <Section title="7. Cancellation and refunds">
        <p>
          You can cancel at any time from the Billing page. Cancellation takes effect at
          the end of your current billing period and you keep access until then. Refunds
          are governed by our Refund &amp; Cancellation Policy.
        </p>
      </Section>

      <Section title="8. Your data and content">
        <p>
          You keep all rights to the content you upload, including your client records,
          plans and programs. You grant us only the permission needed to host, process and
          display that content in order to operate the service. You can ask us for an
          export, or for deletion, at {BUSINESS.supportEmail}.
        </p>
      </Section>

      <Section title="9. Third-party services">
        <p>
          We rely on third parties to deliver parts of the service, including Razorpay
          (payments), MSG91 (login codes by SMS), WhatsApp Business via WATI (client
          messaging), Amazon Web Services in Mumbai (hosting and file storage) and OpenAI
          (optional AI meal-plan generation). Using those features means your data passes
          through those providers.
        </p>
      </Section>

      <Section title="10. Availability">
        <p>
          We work to keep the service available but do not guarantee uninterrupted
          operation. We may suspend access for maintenance, and we may change or
          discontinue features. We will give reasonable notice of material changes where
          we can.
        </p>
      </Section>

      <Section title="11. Suspension and termination">
        <p>
          We may suspend or close your account if you materially breach these terms, if
          payment fails repeatedly, or if required by law. You may close your account at
          any time. On closure we will delete or return your data in line with our Privacy
          Policy.
        </p>
      </Section>

      <Section title="12. Limitation of liability">
        <p>
          To the extent the law allows, we are not liable for indirect or consequential
          loss, lost profits, or loss of data, and our total liability in any 12-month
          period is limited to the fees you paid us in that period. Nothing in these terms
          limits liability that cannot lawfully be limited.
        </p>
        <p>
          We are not responsible for the coaching advice you give your clients, or for any
          outcome arising from it.
        </p>
      </Section>

      <Section title="13. Governing law">
        <p>
          These terms are governed by the laws of India. The courts at{" "}
          {BUSINESS.jurisdictionCity} have exclusive jurisdiction over any dispute.
        </p>
      </Section>

      <Section title="14. Contact">
        <p>
          Questions about these terms: {BUSINESS.supportEmail}, or write to us at{" "}
          {BUSINESS.registeredAddress}.
        </p>
      </Section>
    </LegalShell>
  );
}
