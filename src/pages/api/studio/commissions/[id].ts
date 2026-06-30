import type { APIRoute } from "astro";
import type { StudioCommission } from "../../../../utils/studioWorkflow";
import {
  getCommissionById,
  updateCommissionById,
} from "../../../../utils/studioServerStore";
import { createStatusEmail } from "../../../../utils/studioEmailTemplates";
import { sendStudioEmail } from "../../../../utils/studioMailer";

type PatchBody = {
  patch?: Partial<StudioCommission>;
};

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const prerender = false;

export const PATCH: APIRoute = async ({ params, request }) => {
  try {
    const id = params.id?.trim();
    if (!id) return json(400, { ok: false, error: "Missing commission id." });

    const body = (await request.json()) as PatchBody;
    const patch = body.patch ?? {};

    const before = await getCommissionById(id);

    const updated = await updateCommissionById(id, patch);
    if (!updated) {
      return json(404, { ok: false, error: "Commission not found." });
    }

    let emailResult: { ok: boolean; skipped: boolean; error?: string } | null =
      null;
    const statusChanged = Boolean(before && before.status !== updated.status);
    if (statusChanged) {
      const email = createStatusEmail(updated);
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

    return json(200, { ok: true, commission: updated, email: emailResult });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return json(500, { ok: false, error: message });
  }
};
