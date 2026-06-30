type SendInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

const RESEND_ENDPOINT = "https://api.resend.com/emails";

const getSender = () =>
  process.env.STUDIO_EMAIL_FROM ?? "gxbs Studio <studio@gxbs.dev>";

const htmlToText = (html: string) =>
  html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const sendStudioEmail = async (
  { to, subject, html, text }: SendInput,
) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Soft-fail in local/dev when email credentials are intentionally missing.
    return { ok: false, skipped: true, error: "Missing RESEND_API_KEY" };
  }

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getSender(),
      to: [to],
      subject,
      html,
      text: text ?? htmlToText(html),
      reply_to: process.env.STUDIO_EMAIL_REPLY_TO || undefined,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Resend error: ${response.status} ${details}`);
  }

  const payload = await response.json();
  return { ok: true, skipped: false, id: payload.id ?? "" };
};
