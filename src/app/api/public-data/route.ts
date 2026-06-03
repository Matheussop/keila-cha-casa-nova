import { NextResponse } from "next/server";
import { getPublicData } from "@/lib/data";

export async function GET() {
  const data = await getPublicData();

  return NextResponse.json(data);
}
