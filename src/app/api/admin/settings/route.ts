import { NextResponse } from "next/server";
import { updateSiteSettings } from "@/lib/data";
import { ensureAdminRequest } from "@/lib/server-auth";

export async function PATCH(request: Request) {
  const unauthorized = await ensureAdminRequest(request);

  if (unauthorized) {
    return unauthorized;
  }

  const body = await request.json().catch(() => null);

  try {
    const settings = await updateSiteSettings(body ?? {});

    return NextResponse.json({ settings });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel atualizar as configuracoes.";
    const status = message.includes("configure") ? 503 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
