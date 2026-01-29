import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log: ["query"], // optional: log SQL queries in dev
});
