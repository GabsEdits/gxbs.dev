import type { APIRoute } from "astro";
import {
  isStudioAdminAuthenticated,
  STUDIO_ADMIN_COOKIE,
  verifyStudioAdminToken,
} from "../../../../utils/studioAdminAuth";

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
  const authenticated = isStudioAdminAuthenticated(cookies);
  const token = cookies.get(STUDIO_ADMIN_COOKIE)?.value;
  const username = verifyStudioAdminToken(token);

  return json(200, {
    ok: true,
    authenticated,
    username: username ?? "",
  });
};
