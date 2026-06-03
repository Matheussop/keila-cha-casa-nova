import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, isAdminCookieValid } from "@/lib/auth";

export async function ensureAdminRequest(request: Request) {
  const rawCookie = request.headers.get("cookie") ?? "";
  const sessionCookie = rawCookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_COOKIE_NAME}=`))
    ?.split("=")
    .slice(1)
    .join("=");

  if (await isAdminCookieValid(sessionCookie)) {
    return null;
  }

  return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
}
