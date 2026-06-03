import { NextResponse } from "next/server";
import { deleteGiftItem, updateGiftItem } from "@/lib/data";
import { ensureAdminRequest } from "@/lib/server-auth";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: Context) {
  const unauthorized = await ensureAdminRequest(request);

  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);

  try {
    const item = await updateGiftItem(id, body ?? {});

    return NextResponse.json({ item });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel atualizar o item.";
    const status = message.includes("configure") ? 503 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: Request, context: Context) {
  const unauthorized = await ensureAdminRequest(request);

  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await context.params;

  try {
    await deleteGiftItem(id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel remover o item.";
    const status = message.includes("configure") ? 503 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
