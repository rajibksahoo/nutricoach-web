import type { Metadata } from "next";
import LegalShell, { Section } from "@/components/legal/LegalShell";
import { BUSINESS } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy · NutriCoach",
  description:
    "How NutriCoach collects, uses, stores and protects personal data, including client health information.",
};

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      intro={`This policy explains what personal data ${BUSINESS.legalEntityName} collects through ${BUSINESS.brandName}, why we collect it, and what rights you have. It is written with India's Digital Personal Data Protection Act, 2023 in mind.`}
    >
      <Section title="1. Who controls your data">
        <p>
          {BUSINESS.legalEntityName}, {BUSINESS.registeredAddress}, is the data fiduciary
          for coach account data. For the client records a coach uploads, the coach is the
          data fiduciary and we act as a data processor on their instructions.
        </p>
      </Section>

      <Section title="2. What we collect">
        <p>
          <strong>From coaches:</strong> mobile number, name, email, business name and
          GSTIN, subscription and invoice records, and technical logs such as IP address
          and device information.
        </p>
        <p>
          <strong>About clients, uploaded by their coach:</strong> name, contact details,
          date of birth, gender, height and weight, goals, dietary preferences, activity
          level, allergies and health conditions, progress measurements, progress photos,
          check-ins, and messages exchanged with the coach.
        </p>
        <p>
          Health information is sensitive. We only ever collect it because a coach enters
          it to deliver coaching, and we do not use it for advertising or profiling.
        </p>
      </Section>

      <Section title="3. Why we use it">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>to run the service and show coaches and clients their own data;</li>
          <li>to authenticate logins by sending one-time codes to your phone;</li>
          <li>to take payments, meet GST obligations and issue invoices;</li>
          <li>to send plans, reminders and notifications you have asked for;</li>
          <li>to generate meal plans with AI, when a coach chooses to use that feature;</li>
          <li>to keep the service secure, debug faults and prevent abuse;</li>
          <li>to meet legal and tax obligations.</li>
        </ul>
        <p>We do not sell personal data, and we do not use it for third-party advertising.</p>
      </Section>

      <Section title="4. Who we share it with">
        <p>We share data only with processors that help us run the service:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong>Razorpay</strong> — payments. Card details go directly to Razorpay; we
            never see or store them.
          </li>
          <li>
            <strong>MSG91</strong> — sending login codes by SMS.
          </li>
          <li>
            <strong>WATI / WhatsApp Business</strong> — sending plans and reminders to
            clients, when a coach uses that feature.
          </li>
          <li>
            <strong>Amazon Web Services (Mumbai region)</strong> — hosting, database and
            file storage, including progress photos.
          </li>
          <li>
            <strong>OpenAI</strong> — AI meal-plan generation. Client details relevant to
            the plan are sent to generate it, when a coach triggers this.
          </li>
        </ul>
        <p>
          We may also disclose data where the law requires it, or to protect our rights or
          someone&apos;s safety.
        </p>
      </Section>

      <Section title="5. Where it is stored">
        <p>
          Data is hosted in the Amazon Web Services Mumbai (ap-south-1) region, in India.
          Some processors listed above may process limited data outside India; where that
          happens we rely on contractual safeguards.
        </p>
      </Section>

      <Section title="6. How long we keep it">
        <p>
          We keep account and client data while the account is active. After closure we
          delete or anonymise it within a reasonable period, except where we must keep
          records longer, such as invoices and tax records retained for the period Indian
          tax law requires. Deleted records are removed from backups on our normal backup
          cycle.
        </p>
      </Section>

      <Section title="7. How we protect it">
        <p>
          Traffic is encrypted in transit. Access is authenticated with one-time codes and
          signed tokens, every record is scoped to the owning coach&apos;s account, and
          progress photos are served through short-lived links. No system is perfectly
          secure, so we also keep logs to detect misuse. If a breach affects your data we
          will notify you and the Data Protection Board as the law requires.
        </p>
      </Section>

      <Section title="8. Your rights">
        <p>Subject to the DPDP Act, you may ask us to:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>tell you what data we hold about you and why;</li>
          <li>correct or complete inaccurate data;</li>
          <li>delete your data, where we are not required to keep it;</li>
          <li>nominate someone to exercise your rights if you cannot;</li>
          <li>withdraw consent for an optional feature.</li>
        </ul>
        <p>
          Email {BUSINESS.supportEmail} and we will respond within{" "}
          {BUSINESS.supportResponseDays} working days. If you are a coaching client,
          contact your coach first, since they control your record; we will help them
          action it.
        </p>
      </Section>

      <Section title="9. Children">
        <p>
          Coach accounts are for adults only. A coach must have verifiable consent from a
          parent or guardian before adding a client under 18.
        </p>
      </Section>

      <Section title="10. Cookies and local storage">
        <p>
          We use browser storage to keep you signed in and remember interface preferences
          such as a collapsed panel. We do not use advertising or cross-site tracking
          cookies.
        </p>
      </Section>

      <Section title="11. Grievance officer">
        <p>
          {BUSINESS.grievanceOfficer}
          <br />
          {BUSINESS.grievanceEmail}
          <br />
          {BUSINESS.registeredAddress}
        </p>
      </Section>

      <Section title="12. Changes">
        <p>
          We will post any change here and update the date above. If a change materially
          affects you we will also notify you in the app or by message.
        </p>
      </Section>
    </LegalShell>
  );
}
