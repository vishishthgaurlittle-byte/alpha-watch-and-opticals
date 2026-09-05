import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrisma() {
  process.env.DATABASE_URL = process.env.DATABASE_URL || "file:./prisma/prod.db";
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });
}

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) globalForPrisma.prisma = createPrisma();
  return globalForPrisma.prisma;
}

// Back-compat getter so existing `import prisma from "@/lib/prisma"` still works
// but construction happens on first property access, not at import during collect-page-data.
const prisma = new Proxy({} as PrismaClient, {
  get(_t, prop, recv) {
    const client = getPrisma();
    const value = Reflect.get(client, prop, recv);
    return typeof value === "function" ? value.bind(client) : value;
  }
});

export default prisma;
export { prisma };
