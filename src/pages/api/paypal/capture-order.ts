import type { APIRoute } from "astro";
import {
  getPayPalAccessToken,
  getPayPalBaseUrl,
} from "../../../utils/paypalServer";
import { PAYMENT_STATUSES } from "../../../utils/studioWorkflow";
import { updateCommissionById } from "../../../utils/studioServerStore";
import { createPaymentCapturedEmail } from "../../../utils/studioEmailTemplates";
import { sendStudioEmail } from "../../../utils/studioMailer";

type CaptureOrderRequest = {
  orderId?: string;
  commissionId?: string;
};

type CaptureUnit = {
  payments?: {
    captures?: Array<{ id?: string; status?: string }>;
  };
};

type PayPalCaptureResponse = {
  status: string;
  purchase_units?: CaptureUnit[];
};

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as CaptureOrderRequest;
    const orderId = body.orderId?.trim();

    if (!orderId) {
      return json(400, { ok: false, error: "Missing orderId." });
    }

    const token = await getPayPalAccessToken();
    const baseUrl = getPayPalBaseUrl();

    const captureResponse = await fetch(
      `${baseUrl}/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!captureResponse.ok) {
      const details = await captureResponse.text();
      return json(502, {
        ok: false,
        error: "PayPal capture failed.",
        details,
      });
    }

    const payload = (await captureResponse.json()) as PayPalCaptureResponse;
    const capture = payload.purchase_units?.[0]?.payments?.captures?.[0];
    const isPaid = payload.status === "COMPLETED" ||
      capture?.status === "COMPLETED";

    let emailResult: { ok: boolean; skipped: boolean; error?: string } | null =
      null;

    if (isPaid && body.commissionId) {
      const updated = await updateCommissionById(body.commissionId, {
        paymentStatus: PAYMENT_STATUSES.PAID,
        paymentReference: capture?.id ?? "paypal-captured",
        paidAt: new Date().toISOString(),
      });

      if (updated?.clientEmail) {
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
            error: emailError instanceof Error
              ? emailError.message
              : "Unknown email error",
          };
        }
      }
    }

    return json(200, {
      ok: true,
      status: payload.status,
      captureId: capture?.id ?? "",
      captureStatus: capture?.status ?? "",
      email: emailResult,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return json(500, { ok: false, error: message });
  }
};
