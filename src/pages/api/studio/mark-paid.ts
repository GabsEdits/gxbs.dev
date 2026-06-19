import type { APIRoute } from "astro";
import { PAYMENT_STATUSES } from "../../../utils/studioWorkflow";
import { updateCommissionById } from "../../../utils/studioServerStore";
import { createPaymentCapturedEmail } from "../../../utils/studioEmailTemplates";
import { sendStudioEmail } from "../../../utils/studioMailer";

type RequestBody = {
  commissionId?: string;
  reference?: string;
};

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as RequestBody;
    const commissionId = body.commissionId?.trim();
    if (!commissionId) {
      return json(400, { ok: false, error: "Missing commissionId." });
    }

    const updated = await updateCommissionById(commissionId, {
      paymentStatus: PAYMENT_STATUSES.PAID,
      paymentReference: body.reference?.trim() || "manual-confirmation",
      paidAt: new Date().toISOString(),
    });

    if (!updated) {
      return json(404, { ok: false, error: "Commission not found." });
    }

    let emailResult: { ok: boolean; skipped: boolean; error?: string } | null = null;
    if (updated.clientEmail) {
      const email = createPaymentCapturedEmail(updated);
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
          error: emailError instanceof Error ? emailError.message : "Unknown email error",
        };
      }
    }

    return json(200, { ok: true, commission: updated, email: emailResult });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return json(500, { ok: false, error: message });
  }
};

