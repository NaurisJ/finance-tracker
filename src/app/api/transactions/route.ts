import { getServerSession } from "next-auth";
import { TransactionType } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type CreateTransactionBody = {
  amount?: number;
  type?: TransactionType;
  category?: string;
  date?: string;
  description?: string;
};

function validateTransactionBody(body: CreateTransactionBody) {
  const amount = Number(body.amount);
  const category = body.category?.trim();
  const description = body.description?.trim();
  const type = body.type;
  const parsedDate = body.date ? new Date(body.date) : null;

  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Amount must be a number greater than 0." };
  }

  if (!category) {
    return { error: "Category is required." };
  }

  if (!type || !Object.values(TransactionType).includes(type)) {
    return { error: "Type must be either INCOME or EXPENSE." };
  }

  if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
    return { error: "Date is required and must be valid." };
  }

  return {
    data: {
      amount,
      category,
      type,
      date: parsedDate,
      description: description || null,
    },
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(transactions);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateTransactionBody;

  try {
    body = (await req.json()) as CreateTransactionBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const result = validateTransactionBody(body);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const transaction = await prisma.transaction.create({
    data: {
      ...result.data,
      userId: session.user.id,
    },
  });

  return NextResponse.json(transaction, { status: 201 });
}
