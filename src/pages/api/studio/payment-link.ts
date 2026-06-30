import type { APIRoute } from "astro";
import {
  PAYMENT_PROVIDERS,
  PAYMENT_STATUSES,
} from "../../../utils/studioWorkflow";
import { updateCommissionById } from "../../../utils/studioServerStore";
import { createPaymentLinkEmail } from "../../../utils/studioEmailTemplates";
import { sendStudioEmail } from "../../../utils/studioMailer";

type RequestBody = {
  commissionId?: string;
  provider?: string;
  paymentUrl?: string;
};

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const defaultProviderUrl = (provider: string) => {
  if (provider === PAYMENT_PROVIDERS.GITHUB_SPONSORS) {
    return process.env.STUDIO_GITHUB_SPONSORS_URL ??
      "https://github.com/sponsors/gabs";
  }
  return process.env.STUDIO_KOFI_URL ?? "https://ko-fi.com/gabs";
};

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as RequestBody;
    const commissionId = body.commissionId?.trim();
    if (!commissionId) {
      return json(400, { ok: false, error: "Missing commissionId." });
    }

    const provider = body.provider === PAYMENT_PROVIDERS.GITHUB_SPONSORS
      ? PAYMENT_PROVIDERS.GITHUB_SPONSORS
      : PAYMENT_PROVIDERS.KOFI;

    const paymentUrl = body.paymentUrl?.trim() || defaultProviderUrl(provider);

    const updated = await updateCommissionById(commissionId, {
      paymentProvider: provider,
      paymentUrl,
      paymentReference: provider,
      paymentStatus: PAYMENT_STATUSES.PENDING,
      paidAt: "",
    });

    if (!updated) {
      return json(404, { ok: false, error: "Commission not found." });
    }

    let emailResult: { ok: boolean; skipped: boolean; error?: string } | null =
      null;
    if (updated.clientEmail && updated.paymentUrl) {
      const email = createPaymentLinkEmail(updated);
      try {
        emailResult = await sendStudioEmail({
          to: updated.clientEmail,
          subject: email.subject,
          html: email.html,
        });
      } catch (emailError) {
        emailResult = {
          ok: false,
          skipped: false,
          error: emailError instanceof Error
            ? emailError.message
            : "Unknown email error",
        };
      }
    }

    return json(200, {
      ok: true,
      paymentUrl,
      provider,
      commission: updated,
      email: emailResult,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return json(500, { ok: false, error: message });
  }
};
