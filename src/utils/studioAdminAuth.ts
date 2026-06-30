import { createHmac, timingSafeEqual } from "node:crypto";
import type { AstroCookies } from "astro";

export const STUDIO_ADMIN_COOKIE = "gxbs_studio_admin";

const SESSION_TTL_SECONDS = 60 * 60 * 12;

type SessionPayload = {
  u: string;
  exp: number;
};

const getConfiguredUsername = () =>
  (process.env.STUDIO_ADMIN_USERNAME ?? "owner").trim();
const getConfiguredPassword = () => process.env.STUDIO_ADMIN_PASSWORD ?? "";
const getAuthSecret = () => process.env.STUDIO_AUTH_SECRET ?? "";

const safeEquals = (a: string, b: string) => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
};

const sign = (encodedPayload: string) => {
  const secret = getAuthSecret();
  return createHmac("sha256", secret).update(encodedPayload).digest(
    "base64url",
  );
};

const encodePayload = (payload: SessionPayload) => {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
};

const decodePayload = (encodedPayload: string): SessionPayload | null => {
  try {
    const raw = Buffer.from(encodedPayload, "base64url").toString("utf8");
    const parsed = JSON.parse(raw) as SessionPayload;
    if (!parsed?.u || !parsed?.exp) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const isStudioAuthConfigured = () => {
  return Boolean(getConfiguredPassword() && getAuthSecret());
};

export const validateStudioAdminCredentials = (
  username: string,
  password: string,
) => {
  if (!isStudioAuthConfigured()) return false;
  return (
    safeEquals(username.trim(), getConfiguredUsername()) &&
    safeEquals(password, getConfiguredPassword())
  );
};

export const issueStudioAdminToken = (
  username: string,
  ttlSeconds = SESSION_TTL_SECONDS,
) => {
  const payload: SessionPayload = {
    u: username,
    exp: Date.now() + ttlSeconds * 1000,
  };

  const encodedPayload = encodePayload(payload);
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
};

export const verifyStudioAdminToken = (token: string | undefined | null) => {
  if (!token || !isStudioAuthConfigured()) return null;

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expected = sign(encodedPayload);
  if (!safeEquals(signature, expected)) return null;

  const payload = decodePayload(encodedPayload);
  if (!payload) return null;
  if (payload.exp <= Date.now()) return null;
  return payload.u;
};

export const isStudioAdminAuthenticated = (cookies: AstroCookies) => {
  const token = cookies.get(STUDIO_ADMIN_COOKIE)?.value;
  return Boolean(verifyStudioAdminToken(token));
};

export const setStudioAdminCookie = (
  cookies: AstroCookies,
  username: string,
) => {
  const token = issueStudioAdminToken(username);
  cookies.set(STUDIO_ADMIN_COOKIE, token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: SESSION_TTL_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });
};

export const clearStudioAdminCookie = (cookies: AstroCookies) => {
  cookies.delete(STUDIO_ADMIN_COOKIE, {
    path: "/",
  });
};

export const getStudioAuthConfigError = () => {
  if (isStudioAuthConfigured()) return "";
  return "Missing STUDIO_ADMIN_PASSWORD or STUDIO_AUTH_SECRET.";
};
