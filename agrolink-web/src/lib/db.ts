import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

// Helper to convert string amount to number
export function parseAmount(amount: string | number): number {
  return typeof amount === "number" ? amount : parseFloat(amount) || 0;
}

// Helper to convert number to string for storage
export function formatAmount(amount: number): string {
  return amount.toFixed(2);
}
