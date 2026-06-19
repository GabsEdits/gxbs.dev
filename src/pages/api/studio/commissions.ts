import type { APIRoute } from "astro";
import { listCommissions } from "../../../utils/studioServerStore";

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const commissions = await listCommissions();
    return json(200, { ok: true, commissions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return json(500, { ok: false, error: message });
  }
};

