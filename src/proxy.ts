import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, isAdminCookieValid } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/acesso-keila/painel")) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (await isAdminCookieValid(sessionCookie)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/acesso-keila", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/acesso-keila/painel/:path*"],
};
