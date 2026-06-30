export const COMMISSION_STATUSES = {
  NEW: "new",
  UNDER_REVIEW: "under_review",
  APPROVED: "approved",
  DENIED: "denied",
};

export const PAYMENT_STATUSES = {
  UNPAID: "unpaid",
  PENDING: "pending",
  PAID: "paid",
};

export const PAYMENT_PROVIDERS = {
  KOFI: "kofi",
  GITHUB_SPONSORS: "github_sponsors",
  MANUAL: "manual",
};

export type CommissionStatus =
  (typeof COMMISSION_STATUSES)[keyof typeof COMMISSION_STATUSES];
export type PaymentStatus =
  (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];
export type PaymentProvider =
  (typeof PAYMENT_PROVIDERS)[keyof typeof PAYMENT_PROVIDERS];

export type StudioCommission = {
  id: string;
  clientName: string;
  clientEmail: string;
  projectTitle: string;
  offer: string;
  tier: string;
  status: CommissionStatus;
  brief: string;
  submittedAt: string;
  updatedAt: string;
  decisionNote: string;
  accessCode: string;
  sessionId: string;
  approvedAt: string;
  quotedAmount: number;
  currency: string;
  paymentStatus: PaymentStatus;
  paymentProvider: PaymentProvider;
  paymentUrl: string;
  paymentReference: string;
  paidAt: string;
};

type ApprovalMessageInput = {
  clientName: string;
  projectTitle: string;
  accessCode: string;
  studioLink: string;
  paymentLink?: string;
};

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const createStudioAccessCode = (length = 8) => {
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);

  return Array.from(
    values,
    (value) => CODE_ALPHABET[value % CODE_ALPHABET.length],
  ).join("");
};

export const createStudioSessionId = () => {
  const values = new Uint8Array(6);
  crypto.getRandomValues(values);
  const token = Array.from(
    values,
    (value) => value.toString(16).padStart(2, "0"),
  ).join("");
  return `s_${token}`;
};

export const buildApprovalMessage = (
  { clientName, projectTitle, accessCode, studioLink, paymentLink }:
    ApprovalMessageInput,
) => {
  const lines = [
    `Hi ${clientName},`,
    "",
    `Your project request for ${projectTitle} was approved.`,
    "",
    `Studio access code: ${accessCode}`,
    `Studio link: ${studioLink}`,
  ];

  if (paymentLink) {
    lines.push(`Payment link: ${paymentLink}`);
  }

  lines.push(
    "",
    "Reply to this email if you want to adjust scope before kickoff.",
  );
  return lines.join("\n");
};

const toQuotedAmount = (tier: string) => {
  if (tier === "Core") return 420;
  if (tier === "Presence") return 1050;
  if (tier === "System") return 2200;
  return 500;
};

const withDefaults = (
  commission:
    & Partial<StudioCommission>
    & Pick<
      StudioCommission,
      | "id"
      | "clientName"
      | "clientEmail"
      | "projectTitle"
      | "offer"
      | "tier"
      | "status"
      | "brief"
      | "submittedAt"
      | "updatedAt"
      | "decisionNote"
      | "accessCode"
      | "sessionId"
      | "approvedAt"
    >,
): StudioCommission => ({
  ...commission,
  quotedAmount: commission.quotedAmount ?? toQuotedAmount(commission.tier),
  currency: commission.currency ?? "EUR",
  paymentStatus: commission.paymentStatus ?? PAYMENT_STATUSES.UNPAID,
  paymentProvider: commission.paymentProvider ?? PAYMENT_PROVIDERS.KOFI,
  paymentUrl: commission.paymentUrl ?? "",
  paymentReference: commission.paymentReference ?? "",
  paidAt: commission.paidAt ?? "",
});

export const createSeedCommissions = (): StudioCommission[] => [
  withDefaults({
    id: "cmp_2026_051",
    clientName: "Mara Voicu",
    clientEmail: "mara@atelier.io",
    projectTitle: "Atelier relaunch",
    offer: "Design",
    tier: "Presence",
    status: COMMISSION_STATUSES.NEW,
    brief:
      "Need a premium portfolio website with booking CTA and launch by mid-June.",
    submittedAt: "2026-05-20T14:22:00.000Z",
    updatedAt: "2026-05-20T14:22:00.000Z",
    decisionNote: "",
    accessCode: "",
    sessionId: "",
    approvedAt: "",
  }),
  withDefaults({
    id: "cmp_2026_052",
    clientName: "Alex Negoita",
    clientEmail: "alex@northline.app",
    projectTitle: "SaaS marketing site",
    offer: "Full Package",
    tier: "System",
    status: COMMISSION_STATUSES.UNDER_REVIEW,
    brief:
      "Need conversion-focused website + gated demo flow. Must launch in 6 weeks.",
    submittedAt: "2026-05-21T09:10:00.000Z",
    updatedAt: "2026-05-22T08:05:00.000Z",
    decisionNote: "Waiting on final integration list.",
    accessCode: "",
    sessionId: "",
    approvedAt: "",
  }),
  withDefaults({
    id: "cmp_2026_053",
    clientName: "Radu Matei",
    clientEmail: "radu@habitatstudio.co",
    projectTitle: "Studio website refresh",
    offer: "Development",
    tier: "Core",
    status: COMMISSION_STATUSES.APPROVED,
    brief:
      "Implement approved design and keep content editing simple for internal team.",
    submittedAt: "2026-05-18T11:36:00.000Z",
    updatedAt: "2026-05-23T16:40:00.000Z",
    decisionNote: "Approved with fast-track launch support add-on.",
    accessCode: "N7P4Q9LM",
    sessionId: "s_28f59c6a0cbd",
    approvedAt: "2026-05-23T16:40:00.000Z",
    paymentStatus: PAYMENT_STATUSES.PENDING,
    paymentProvider: PAYMENT_PROVIDERS.KOFI,
    paymentUrl: "https://ko-fi.com/gabs",
    paymentReference: "kofi-link",
  }),
];

export const normalizeCommission = (
  commission: StudioCommission | Partial<StudioCommission>,
) => {
  const legacy = commission as {
    paypalCheckoutUrl?: string;
    paypalOrderId?: string;
  };

  const paymentUrl =
    (commission.paymentUrl === "" ? undefined : commission.paymentUrl) ??
      legacy.paypalCheckoutUrl ?? undefined;
  const paymentReference =
    (commission.paymentReference === ""
      ? undefined
      : commission.paymentReference) ?? legacy.paypalOrderId ?? undefined;

  return withDefaults({
    id: commission.id === "" ? undefined : commission.id,
    clientName: commission.clientName === ""
      ? undefined
      : commission.clientName,
    clientEmail: commission.clientEmail === ""
      ? undefined
      : commission.clientEmail,
    projectTitle: commission.projectTitle === ""
      ? undefined
      : commission.projectTitle,
    offer: commission.offer === "" ? undefined : commission.offer,
    tier: commission.tier === "" ? undefined : commission.tier,
    status: (commission.status === ""
      ? undefined
      : commission.status) as CommissionStatus,
    brief: commission.brief === "" ? undefined : commission.brief,
    submittedAt: commission.submittedAt === ""
      ? undefined
      : commission.submittedAt,
    updatedAt: commission.updatedAt === "" ? undefined : commission.updatedAt,
    decisionNote: commission.decisionNote === ""
      ? undefined
      : commission.decisionNote,
    accessCode: commission.accessCode === ""
      ? undefined
      : commission.accessCode,
    sessionId: commission.sessionId === "" ? undefined : commission.sessionId,
    approvedAt: commission.approvedAt === ""
      ? undefined
      : commission.approvedAt,
    quotedAmount: commission.quotedAmount === 0
      ? undefined
      : commission.quotedAmount,
    currency: commission.currency === "" ? undefined : commission.currency,
    paymentStatus: (commission.paymentStatus === ""
      ? undefined
      : commission.paymentStatus) as PaymentStatus,
    paymentProvider: (commission.paymentProvider === ""
      ? undefined
      : commission.paymentProvider) as PaymentProvider,
    paymentUrl,
    paymentReference,
    paidAt: commission.paidAt === "" ? undefined : commission.paidAt,
  });
};
