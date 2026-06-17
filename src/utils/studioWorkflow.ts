export const COMMISSION_STATUSES = {
  NEW: "new",
  UNDER_REVIEW: "under_review",
  APPROVED: "approved",
  DENIED: "denied",
};

type ApprovalMessageInput = {
  clientName: string;
  projectTitle: string;
  accessCode: string;
  studioLink: string;
};

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const createStudioAccessCode = (length = 8) => {
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);

  return Array.from(values, (value) => CODE_ALPHABET[value % CODE_ALPHABET.length]).join("");
};

export const createStudioSessionId = () => {
  const values = new Uint8Array(6);
  crypto.getRandomValues(values);
  const token = Array.from(values, (value) => value.toString(16).padStart(2, "0")).join("");
  return `s_${token}`;
};

export const buildApprovalMessage = ({ clientName, projectTitle, accessCode, studioLink }: ApprovalMessageInput) => {
  return [
    `Hi ${clientName},`,
    "",
    `Your project request for ${projectTitle} was approved.`,
    "",
    `Studio access code: ${accessCode}`,
    `Studio link: ${studioLink}`,
    "",
    "Reply to this email if you want to adjust scope before kickoff.",
  ].join("\n");
};

export const STUDIO_STORAGE_KEY = "gxbs.studio.commissions.v1";

export const createSeedCommissions = () => [
  {
    id: "cmp_2026_051",
    clientName: "Mara Voicu",
    clientEmail: "mara@atelier.io",
    projectTitle: "Atelier relaunch",
    offer: "Design",
    tier: "Presence",
    status: COMMISSION_STATUSES.NEW,
    brief: "Need a premium portfolio website with booking CTA and launch by mid-June.",
    submittedAt: "2026-05-20T14:22:00.000Z",
    updatedAt: "2026-05-20T14:22:00.000Z",
    decisionNote: "",
    accessCode: "",
    sessionId: "",
    approvedAt: "",
  },
  {
    id: "cmp_2026_052",
    clientName: "Alex Negoita",
    clientEmail: "alex@northline.app",
    projectTitle: "SaaS marketing site",
    offer: "Full Package",
    tier: "System",
    status: COMMISSION_STATUSES.UNDER_REVIEW,
    brief: "Need conversion-focused website + gated demo flow. Must launch in 6 weeks.",
    submittedAt: "2026-05-21T09:10:00.000Z",
    updatedAt: "2026-05-22T08:05:00.000Z",
    decisionNote: "Waiting on final integration list.",
    accessCode: "",
    sessionId: "",
    approvedAt: "",
  },
  {
    id: "cmp_2026_053",
    clientName: "Radu Matei",
    clientEmail: "radu@habitatstudio.co",
    projectTitle: "Studio website refresh",
    offer: "Development",
    tier: "Core",
    status: COMMISSION_STATUSES.APPROVED,
    brief: "Implement approved design and keep content editing simple for internal team.",
    submittedAt: "2026-05-18T11:36:00.000Z",
    updatedAt: "2026-05-23T16:40:00.000Z",
    decisionNote: "Approved with fast-track launch support add-on.",
    accessCode: "N7P4Q9LM",
    sessionId: "s_28f59c6a0cbd",
    approvedAt: "2026-05-23T16:40:00.000Z",
  },
];



