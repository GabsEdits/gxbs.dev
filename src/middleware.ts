import { defineMiddleware } from "astro:middleware";
import { isStudioAdminAuthenticated } from "./utils/studioAdminAuth";

const isProtectedPage = (pathname: string) => {
  return pathname === "/studio/admin";
};

const isProtectedApi = (pathname: string) => {
  return pathname.startsWith("/api/studio/") || pathname.startsWith("/api/paypal/");
};

const isPublicAuthApi = (pathname: string) => {
  return pathname.startsWith("/api/studio/auth/");
};

const unauthorizedJson = () =>
  new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });

export const onRequest = defineMiddleware((context, next) => {
  const pathname = context.url.pathname;

  if (!isProtectedPage(pathname) && !isProtectedApi(pathname)) {
    return next();
  }

  if (isPublicAuthApi(pathname)) {
    return next();
  }

  if (isStudioAdminAuthenticated(context.cookies)) {
    return next();
  }

  if (isProtectedApi(pathname)) {
    return unauthorizedJson();
  }

  const loginUrl = new URL("/studio/admin/login", context.url.origin);
  loginUrl.searchParams.set("next", `${pathname}${context.url.search}`);
  return context.redirect(loginUrl.pathname + loginUrl.search);
});

