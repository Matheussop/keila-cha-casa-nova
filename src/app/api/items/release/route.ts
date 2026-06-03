import { NextResponse } from "next/server";
import { releaseGiftItem } from "@/lib/data";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Requisicao invalida." }, { status: 400 });
  }

  const itemId = typeof body.itemId === "string" ? body.itemId : "";
  const reservedByName = typeof body.reservedByName === "string" ? body.reservedByName : "";
  const reservedByWhatsApp = typeof body.reservedByWhatsApp === "string" ? body.reservedByWhatsApp : "";

  if (!itemId || !reservedByName.trim() || !reservedByWhatsApp.trim()) {
    return NextResponse.json({ error: "Informe os mesmos dados usados na reserva." }, { status: 400 });
  }

  try {
    const item = await releaseGiftItem({
      itemId,
      reservedByName: reservedByName.trim(),
      reservedByWhatsApp: reservedByWhatsApp.trim(),
    });

    return NextResponse.json({ item });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel liberar o item.";
    const status = message.includes("configure") ? 503 : message.includes("nao corresponde") ? 403 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
