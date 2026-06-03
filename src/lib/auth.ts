import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "keila_admin_session";

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? "";
}

function getAdminSessionSalt() {
  return process.env.ADMIN_SESSION_SALT ?? "keila-secret-session-salt";
}

export async function createAdminSessionToken(password: string) {
  const payload = `${password}:${getAdminSessionSalt()}`;
  const bytes = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

export async function isAdminCookieValid(cookieValue: string | undefined) {
  const password = getAdminPassword();

  if (!password || !cookieValue) {
    return false;
  }

  return cookieValue === (await createAdminSessionToken(password));
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  return isAdminCookieValid(sessionCookie);
}
