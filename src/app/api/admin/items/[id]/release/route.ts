import { NextResponse } from "next/server";
import { adminReleaseGiftItem } from "@/lib/data";
import { ensureAdminRequest } from "@/lib/server-auth";

type Context = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: Context) {
  const unauthorized = await ensureAdminRequest(request);

  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await context.params;

  try {
    const item = await adminReleaseGiftItem(id);

    return NextResponse.json({ item });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel remover a reserva.";
    const status = message.includes("configure") ? 503 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
