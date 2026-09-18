import type { Metadata } from "next";
import LegalShell, { Section } from "@/components/legal/LegalShell";
import { BUSINESS } from "@/lib/legal";
import { TRIAL_CLIENT_LIMIT } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy · NutriCoach",
  description:
    "How NutriCoach subscription cancellations and refunds work, including timelines.",
};

export default function RefundPage() {
  return (
    <LegalShell
      title="Refund & Cancellation Policy"
      intro={`${BUSINESS.brandName} is a monthly software subscription. This policy explains how to cancel and when we refund.`}
    >
      <Section title="Free trial">
        <p>
          Every new account starts on a free trial limited to {TRIAL_CLIENT_LIMIT} clients.
          No card is required and nothing is charged during the trial. If you never
          subscribe, you are never billed.
        </p>
      </Section>

      <Section title="Cancelling a subscription">
        <p>
          You can cancel yourself at any time from the <strong>Billing</strong> page in
          your dashboard. Cancellation stops future renewals and takes effect at the end
          of the billing period you have already paid for. You keep full access until
          then, and your data stays available for the rest of the period.
        </p>
        <p>You do not need to contact us to cancel, and there is no cancellation fee.</p>
      </Section>

      <Section title="Refunds">
        <p>
          Because plans are billed monthly in advance, we do not generally refund part of
          a month once it has started. We will refund a charge in full if:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            you were charged in error, for example billed twice for the same month or
            charged after cancelling;
          </li>
          <li>
            a fault on our side made the service substantially unusable for a sustained
            period and we could not fix it;
          </li>
          <li>
            you request a refund within {BUSINESS.refundWindowDays} days of your{" "}
            <em>first ever</em> paid charge and have not used the paid features
            meaningfully.
          </li>
        </ul>
        <p>
          Outside those cases, renewals are non-refundable. We consider genuine
          exceptions case by case.
        </p>
      </Section>

      <Section title="How to request a refund">
        <p>
          Email {BUSINESS.supportEmail} from your registered address, or call{" "}
          {BUSINESS.supportPhone}, with your registered mobile number and the invoice
          number. We will acknowledge within {BUSINESS.supportResponseDays} working days
          and tell you our decision.
        </p>
      </Section>

      <Section title="Refund timeline and method">
        <p>
          Approved refunds are issued through Razorpay to the original payment method. We
          initiate them within {BUSINESS.supportResponseDays} working days of approval.
          Your bank or card issuer then typically takes 5 to 7 working days, and up to 10
          working days in some cases, to credit the amount. We cannot refund to a
          different account or method.
        </p>
        <p>
          GST already paid to the government is refunded together with the base amount
          where a refund is approved in full.
        </p>
      </Section>

      <Section title="Failed payments">
        <p>
          If a renewal payment fails, we retry it and your account moves to a past-due
          state. If it keeps failing we may suspend access until payment succeeds. Your
          data is not deleted while suspended.
        </p>
      </Section>

      <Section title="Plan changes">
        <p>
          Upgrading takes effect immediately and is charged at the new price from that
          point. Downgrading takes effect at your next renewal, so you keep the higher
          plan for the period you have already paid for. Downgrades are not refunded
          mid-period.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          {BUSINESS.legalEntityName}
          <br />
          {BUSINESS.registeredAddress}
          <br />
          {BUSINESS.supportEmail} · {BUSINESS.supportPhone}
        </p>
      </Section>
    </LegalShell>
  );
}
