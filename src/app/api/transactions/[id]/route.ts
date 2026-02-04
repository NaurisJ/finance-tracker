import { TransactionType } from "@prisma/client";
import { getUserIdOrNull, unauthorizedJson } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type UpdateTransactionBody = {
  amount?: number;
  type?: TransactionType;
  category?: string;
  date?: string;
  description?: string;
};

function validateUpdateBody(body: unknown) {
  if (!body || typeof body !== "object") {
    return { error: "Invalid JSON payload." };
  }

  const payload = body as UpdateTransactionBody;
  const updates: {
    amount?: number;
    type?: TransactionType;
    category?: string;
    date?: Date;
    description?: string | null;
  } = {};

  let hasKnownField = false;

  if (payload.amount !== undefined) {
    hasKnownField = true;
    const amount = Number(payload.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return { error: "Amount must be a number greater than 0." };
    }

    updates.amount = amount;
  }

  if (payload.type !== undefined) {
    hasKnownField = true;

    if (!Object.values(TransactionType).includes(payload.type)) {
      return { error: "Type must be either INCOME or EXPENSE." };
    }

    updates.type = payload.type;
  }

  if (payload.category !== undefined) {
    hasKnownField = true;

    if (typeof payload.category !== "string") {
      return { error: "Category must be text." };
    }

    const category = payload.category.trim();

    if (!category) {
      return { error: "Category cannot be empty." };
    }

    updates.category = category;
  }

  if (payload.date !== undefined) {
    hasKnownField = true;

    if (typeof payload.date !== "string") {
      return { error: "Date must be a string." };
    }

    const parsedDate = new Date(payload.date);

    if (Number.isNaN(parsedDate.getTime())) {
      return { error: "Date must be valid." };
    }

    updates.date = parsedDate;
  }

  if (payload.description !== undefined) {
    hasKnownField = true;

    if (typeof payload.description !== "string") {
      return { error: "Description must be text." };
    }

    updates.description = payload.description.trim() || null;
  }

  if (!hasKnownField) {
    return {
      error:
        "Provide at least one field to update: amount, type, category, date, description.",
    };
  }

  return { data: updates };
}

export async function GET(_req: Request, { params }: RouteContext) {
  const userId = await getUserIdOrNull();

  if (!userId) {
    return unauthorizedJson();
  }

  const { id } = await params;

  const transaction = await prisma.transaction.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!transaction) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  return NextResponse.json(transaction);
}

export async function PATCH(req: Request, { params }: RouteContext) {
  const userId = await getUserIdOrNull();

  if (!userId) {
    return unauthorizedJson();
  }

  const { id } = await params;

  const existingTransaction = await prisma.transaction.findFirst({
    where: {
      id,
      userId,
    },
    select: { id: true },
  });

  if (!existingTransaction) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const result = validateUpdateBody(body);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const updatedTransaction = await prisma.transaction.update({
    where: { id },
    data: result.data,
  });

  return NextResponse.json(updatedTransaction);
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const userId = await getUserIdOrNull();

  if (!userId) {
    return unauthorizedJson();
  }

  const { id } = await params;

  const deleteResult = await prisma.transaction.deleteMany({
    where: {
      id,
      userId,
    },
  });

  if (deleteResult.count === 0) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
