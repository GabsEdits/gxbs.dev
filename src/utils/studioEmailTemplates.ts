import {
  COMMISSION_STATUSES,
  PAYMENT_STATUSES,
  type StudioCommission,
} from "./studioWorkflow";

type TemplateInput = {
  commission: StudioCommission;
  preheader: string;
  title: string;
  subtitle: string;
  message: string;
  ctaLabel?: string;
  ctaUrl?: string;
  accent?: string;
};

const htmlEscape = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const money = (amount: number, currency = "EUR") =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);

const renderEditorialEmail = ({
  commission,
  preheader,
  title,
  subtitle,
  message,
  ctaLabel,
  ctaUrl,
  accent = "#A34D32",
}: TemplateInput) => {
  const safeTitle = htmlEscape(title);
  const safeSubtitle = htmlEscape(subtitle);
  const safeMessage = htmlEscape(message).replaceAll("\n", "<br />");
  const safeClient = htmlEscape(commission.clientName);
  const safeProject = htmlEscape(commission.projectTitle);
  const safeOffer = htmlEscape(`${commission.offer} / ${commission.tier}`);
  const safeAmount = htmlEscape(
    money(commission.quotedAmount, commission.currency),
  );
  const safePreheader = htmlEscape(preheader);
  const safeCtaLabel = ctaLabel ? htmlEscape(ctaLabel) : "";
  const safeCtaUrl = ctaUrl ? htmlEscape(ctaUrl) : "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
  <style>
    :root { color-scheme: light; }
    body {
      margin: 0;
      background: #f4f1ed;
      color: #1f1f1f;
      font-family: "Georgia", "Times New Roman", serif;
      line-height: 1.6;
    }
    .shell {
      max-width: 680px;
      margin: 32px auto;
      background: #fcfbf9;
      border: 1px solid rgba(31, 31, 31, 0.1);
      box-shadow: 0 24px 60px rgba(13, 13, 13, 0.08);
    }
    .hero {
      padding: 42px 42px 28px;
      border-bottom: 1px solid rgba(31, 31, 31, 0.08);
      background:
        radial-gradient(120% 90% at 110% -10%, rgba(163, 77, 50, 0.16), transparent 62%),
        radial-gradient(80% 70% at -10% 20%, rgba(26, 26, 26, 0.06), transparent 55%),
        #fdfcf9;
    }
    .kicker {
      margin: 0 0 10px;
      font-family: "Arial", sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      font-size: 11px;
      color: ${accent};
    }
    h1 {
      margin: 0;
      font-size: 42px;
      line-height: 1.05;
      font-style: italic;
      letter-spacing: -0.02em;
      color: #1a1a1a;
      font-weight: 500;
    }
    .subtitle {
      margin: 14px 0 0;
      font-size: 16px;
      color: rgba(26, 26, 26, 0.75);
    }
    .body {
      padding: 34px 42px 28px;
    }
    .body p {
      margin: 0 0 18px;
      font-size: 16px;
      color: rgba(26, 26, 26, 0.9);
    }
    .meta {
      margin: 22px 0;
      border: 1px solid rgba(31, 31, 31, 0.12);
      background: rgba(26, 26, 26, 0.02);
      padding: 16px;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      padding: 6px 0;
      font-size: 13px;
      border-bottom: 1px dashed rgba(31, 31, 31, 0.14);
      font-family: "Arial", sans-serif;
    }
    .meta-row:last-child { border-bottom: none; }
    .meta-label { opacity: 0.6; text-transform: uppercase; letter-spacing: 0.08em; }
    .meta-value { font-weight: 600; color: #1a1a1a; text-align: right; }
    .cta-wrap { margin-top: 28px; }
    .cta {
      display: inline-block;
      padding: 12px 20px;
      border: 1px solid #1a1a1a;
      color: #fcfbf9 !important;
      background: #1a1a1a;
      text-decoration: none;
      font-size: 13px;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      font-family: "Arial", sans-serif;
    }
    .footer {
      border-top: 1px solid rgba(31, 31, 31, 0.08);
      padding: 18px 42px 28px;
      color: rgba(26, 26, 26, 0.5);
      font-size: 12px;
      font-family: "Arial", sans-serif;
    }
    @media (max-width: 680px) {
      .shell { margin: 0; border-left: none; border-right: none; }
      .hero, .body, .footer { padding-left: 20px; padding-right: 20px; }
      h1 { font-size: 34px; }
    }
  </style>
</head>
<body>
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${safePreheader}</div>
  <article class="shell" role="article" aria-label="Studio update">
    <header class="hero">
      <p class="kicker">gxbs.dev studio</p>
      <h1>${safeTitle}</h1>
      <p class="subtitle">${safeSubtitle}</p>
    </header>
    <section class="body">
      <p>Hi ${safeClient},</p>
      <p>${safeMessage}</p>

      <div class="meta">
        <div class="meta-row"><span class="meta-label">Project</span><span class="meta-value">${safeProject}</span></div>
        <div class="meta-row"><span class="meta-label">Offer</span><span class="meta-value">${safeOffer}</span></div>
        <div class="meta-row"><span class="meta-label">Investment</span><span class="meta-value">${safeAmount}</span></div>
      </div>

      ${
    safeCtaLabel && safeCtaUrl
      ? `<div class="cta-wrap"><a class="cta" href="${safeCtaUrl}">${safeCtaLabel}</a></div>`
      : ""
  }
    </section>
    <footer class="footer">
      This message was generated by the private Studio workflow. Reply directly to continue the thread.
    </footer>
  </article>
</body>
</html>`;
};

export const createStatusEmail = (commission: StudioCommission) => {
  if (commission.status === COMMISSION_STATUSES.APPROVED) {
    return {
      subject: `Approved: ${commission.projectTitle}`,
      html: renderEditorialEmail({
        commission,
        preheader: "Your project request has been approved.",
        title: "Request Approved",
        subtitle: "Your build is cleared and ready to move.",
        message:
          "Your request has been approved. You now have private Studio access for roadmap tracking, staged previews, and delivery coordination.",
        ctaLabel: "Open Studio",
        ctaUrl: commission.sessionId
          ? `https://gxbs.dev/studio/${commission.sessionId}`
          : undefined,
      }),
    };
  }

  if (commission.status === COMMISSION_STATUSES.DENIED) {
    return {
      subject: `Update on your request: ${commission.projectTitle}`,
      html: renderEditorialEmail({
        commission,
        preheader: "Your request was not accepted this cycle.",
        title: "Request Declined",
        subtitle: "A timing or scope constraint blocked this cycle.",
        message: commission.decisionNote ||
          "Your request is not a fit for the current delivery window. You can reply to revisit scope, timing, or a phased rollout.",
      }),
    };
  }

  return {
    subject: `Under review: ${commission.projectTitle}`,
    html: renderEditorialEmail({
      commission,
      preheader: "Your request is now under review.",
      title: "Request In Review",
      subtitle: "Architecture and execution planning is in progress.",
      message:
        "Your request is now under active review. A final decision and next-step brief will follow shortly.",
    }),
  };
};

export const createPaymentLinkEmail = (commission: StudioCommission) => ({
  subject: `Payment link ready: ${commission.projectTitle}`,
  html: renderEditorialEmail({
    commission,
    preheader: "Your payment link is ready.",
    title: "Payment Link Ready",
    subtitle: "Secure checkout has been prepared for your project.",
    message:
      "Your payment link is now ready. Once completed, your delivery timeline and active build cadence are locked.",
    ctaLabel: "Complete Payment",
    ctaUrl: commission.paymentUrl,
  }),
});

export const createPaymentCapturedEmail = (commission: StudioCommission) => ({
  subject: `Payment confirmed: ${commission.projectTitle}`,
  html: renderEditorialEmail({
    commission,
    preheader: "Your payment has been captured successfully.",
    title: "Payment Confirmed",
    subtitle: "Funds received. Build execution is now in motion.",
    message: commission.paymentStatus === PAYMENT_STATUSES.PAID
      ? "Your payment has been confirmed. The project now advances into active execution and milestone delivery."
      : "Your payment update has been recorded.",
    ctaLabel: commission.sessionId ? "Open Studio" : undefined,
    ctaUrl: commission.sessionId
      ? `https://gxbs.dev/studio/${commission.sessionId}`
      : undefined,
  }),
});
