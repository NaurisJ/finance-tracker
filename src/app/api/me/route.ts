import { NextResponse } from "next/server";
import { requireAuth, unauthorizedJson } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requireAuth();
    return NextResponse.json(session);
  } catch {
    return unauthorizedJson();
  }
}
