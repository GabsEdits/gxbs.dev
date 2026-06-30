import type { APIRoute } from "astro";
import {
  getStudioAuthConfigError,
  setStudioAdminCookie,
  validateStudioAdminCredentials,
} from "../../../../utils/studioAdminAuth";

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

const parseCredentials = async (request: Request) => {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as {
      username?: string;
      password?: string;
      next?: string;
    };
    return {
      username: body.username?.trim() ?? "",
      password: body.password ?? "",
      next: body.next ?? "",
    };
  }

  const form = await request.formData();
  return {
    username: String(form.get("username") ?? "").trim(),
    password: String(form.get("password") ?? ""),
    next: String(form.get("next") ?? ""),
  };
};

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, url }) => {
  const configError = getStudioAuthConfigError();
  if (configError) {
    return json(500, { ok: false, error: configError });
  }

  try {
    const { username, password, next } = await parseCredentials(request);
    const isValid = validateStudioAdminCredentials(username, password);

    if (!isValid) {
      const contentType = request.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        const loginUrl = new URL("/studio/admin/login", url.origin);
        loginUrl.searchParams.set("error", "invalid_credentials");
        if (next?.startsWith("/")) loginUrl.searchParams.set("next", next);
        return redirect(loginUrl.pathname + loginUrl.search);
      }
      return json(401, { ok: false, error: "Invalid credentials." });
    }

    setStudioAdminCookie(cookies, username);

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      const destination = next && next.startsWith("/") ? next : "/studio/admin";
      return redirect(destination);
    }

    return json(200, { ok: true, username });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return json(500, { ok: false, error: message });
  }
};
