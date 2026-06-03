import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, createAdminSessionToken, getAdminPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";
  const configuredPassword = getAdminPassword();

  if (!configuredPassword) {
    return NextResponse.json(
      { error: "Defina ADMIN_PASSWORD para habilitar a area administrativa." },
      { status: 503 },
    );
  }

  if (!password || password !== configuredPassword) {
    return NextResponse.json({ error: "Senha invalida." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: await createAdminSessionToken(configuredPassword),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
