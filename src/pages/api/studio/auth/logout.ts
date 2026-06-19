import type { APIRoute } from "astro";
import { clearStudioAdminCookie } from "../../../../utils/studioAdminAuth";

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const redirect = (location: string) =>
  new Response(null, {
    status: 303,
    headers: { Location: location },
  });

export const prerender = false;

export const POST: APIRoute = async ({ cookies, request, url }) => {
  clearStudioAdminCookie(cookies);

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const redirectTo = url.searchParams.get("redirect");
    if (redirectTo && redirectTo.startsWith("/")) {
      return redirect(redirectTo);
    }
    return redirect("/studio/admin/login");
  }

  return json(200, { ok: true });
};

