/**
 * Business identity used across the legal pages, the footer and the contact
 * page. Razorpay merchant onboarding (and the DPDP Act) require these to be
 * real, publicly reachable and consistent.
 *
 * Every value below is a PLACEHOLDER. Replace them before going live:
 *   rg "REPLACE_ME" lib/legal.ts
 *
 * Nothing here is legal advice. The page copy is a starting draft and needs
 * review by your own counsel before you accept payments.
 */

export const LEGAL_PLACEHOLDER = "REPLACE_ME";

function ph(value: string): string {
  return value;
}

export const BUSINESS = {
  /** Registered legal entity, e.g. "Acme Wellness Technologies Pvt Ltd". */
  legalEntityName: ph("REPLACE_ME — registered legal entity name"),
  /** Consumer-facing brand. Safe to keep as NutriCoach. */
  brandName: "NutriCoach",
  /** Full registered address including PIN code. */
  registeredAddress: ph("REPLACE_ME — registered address, city, state, PIN"),
  /** GSTIN as printed on invoices. */
  gstin: ph("REPLACE_ME — 15-character GSTIN"),
  /** CIN / LLPIN if incorporated; leave blank for a proprietorship. */
  cin: ph("REPLACE_ME — CIN or LLPIN (or blank)"),
  supportEmail: ph("REPLACE_ME — support@yourdomain.in"),
  grievanceEmail: ph("REPLACE_ME — grievance officer email"),
  grievanceOfficer: ph("REPLACE_ME — grievance officer name"),
  supportPhone: ph("REPLACE_ME — +91 XXXXX XXXXX"),
  /** City whose courts have jurisdiction. */
  jurisdictionCity: ph("REPLACE_ME — city"),
  /** Shown as the "last updated" date on each policy. */
  policiesLastUpdated: ph("REPLACE_ME — e.g. 1 October 2026"),
  /** Support response commitment quoted in the policies. */
  supportResponseDays: 2,
  /** Refund window in days from the charge date. */
  refundWindowDays: 7,
} as const;

/** True when any business detail is still a placeholder. */
export function hasUnreplacedPlaceholders(): boolean {
  return Object.values(BUSINESS).some(
    (v) => typeof v === "string" && v.includes(LEGAL_PLACEHOLDER),
  );
}
