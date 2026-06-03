import { NextResponse } from "next/server";
import { createGiftItem } from "@/lib/data";
import { ensureAdminRequest } from "@/lib/server-auth";

export async function POST(request: Request) {
  const unauthorized = await ensureAdminRequest(request);

  if (unauthorized) {
    return unauthorized;
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const category = typeof body?.category === "string" ? body.category.trim() : "";
  const note = typeof body?.note === "string" ? body.note.trim() : "";

  if (!name || !category) {
    return NextResponse.json({ error: "Nome e categoria sao obrigatorios." }, { status: 400 });
  }

  try {
    const item = await createGiftItem({ name, category, note });

    return NextResponse.json({ item });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel criar o item.";
    const status = message.includes("configure") ? 503 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
