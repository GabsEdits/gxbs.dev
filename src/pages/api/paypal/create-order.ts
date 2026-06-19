import type { APIRoute } from "astro";
import { getPayPalAccessToken, getPayPalBaseUrl } from "../../../utils/paypalServer";
import { PAYMENT_PROVIDERS, PAYMENT_STATUSES } from "../../../utils/studioWorkflow";
import { updateCommissionById } from "../../../utils/studioServerStore";
import { createPaymentLinkEmail } from "../../../utils/studioEmailTemplates";
import { sendStudioEmail } from "../../../utils/studioMailer";

type CreateOrderRequest = {
  amount?: number;
  currency?: string;
  description?: string;
  commissionId?: string;
  returnUrl?: string;
  cancelUrl?: string;
};

type PayPalLink = {
  rel: string;
  href: string;
};

type PayPalCreateOrderResponse = {
  id: string;
  status: string;
  links?: PayPalLink[];
};

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const prerender = false;

export const POST: APIRoute = async ({ request, url }) => {
  try {
    const body = (await request.json()) as CreateOrderRequest;

    const amount = Number(body.amount ?? 0);
    const currency = (body.currency ?? "EUR").toUpperCase();

    if (!Number.isFinite(amount) || amount <= 0) {
      return json(400, { ok: false, error: "Invalid amount." });
    }

    const returnUrl = body.returnUrl ?? `${url.origin}/studio`;
    const cancelUrl = body.cancelUrl ?? `${url.origin}/studio`;

    const token = await getPayPalAccessToken();
    const baseUrl = getPayPalBaseUrl();

    const createResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount.toFixed(2),
            },
            description: body.description ?? "Studio commission",
            custom_id: body.commissionId ?? undefined,
          },
        ],
        application_context: {
          brand_name: "gxbs.dev Studio",
          user_action: "PAY_NOW",
          return_url: returnUrl,
          cancel_url: cancelUrl,
        },
      }),
    });

    if (!createResponse.ok) {
      const details = await createResponse.text();
      return json(502, {
        ok: false,
        error: "PayPal create order failed.",
        details,
      });
    }

    const order = (await createResponse.json()) as PayPalCreateOrderResponse;
    const approveLink = order.links?.find((link) => link.rel === "approve")?.href ?? "";

    let emailResult: { ok: boolean; skipped: boolean; error?: string } | null = null;

    if (body.commissionId) {
      const updated = await updateCommissionById(body.commissionId, {
        paymentProvider: PAYMENT_PROVIDERS.MANUAL,
        paymentReference: order.id,
        paymentUrl: approveLink,
        paymentStatus: PAYMENT_STATUSES.PENDING,
        paidAt: "",
      });

      if (updated?.clientEmail && updated.paymentUrl) {
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
            error: emailError instanceof Error ? emailError.message : "Unknown email error",
          };
        }
      }
    }

    return json(200, {
      ok: true,
      orderId: order.id,
      status: order.status,
      approveLink,
      email: emailResult,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return json(500, { ok: false, error: message });
  }
};





