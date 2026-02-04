import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  return session;
}

export async function requireUserId() {
  const session = await requireAuth();
  return session.user.id;
}

export async function getSessionOrNull() {
  try {
    return await requireAuth();
  } catch {
    return null;
  }
}

export async function getUserIdOrNull() {
  const session = await getSessionOrNull();
  return session?.user.id ?? null;
}

export function unauthorizedJson() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
