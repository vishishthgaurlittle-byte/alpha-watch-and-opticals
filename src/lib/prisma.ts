import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function setupDatabaseUrl(): string {
  let dbUrl = process.env.DATABASE_URL;

  // Check if we are on Vercel / serverless runtime
  const isServerless = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT
  );

  if (!dbUrl || dbUrl.startsWith("file:")) {
    if (isServerless) {
      const tmpDb = "/tmp/prod.db";
      const projectRoot = process.cwd();
      const candidates = [
        path.join(projectRoot, "prisma", "prod.db"),
        path.join(projectRoot, "prisma", "dev.db"),
        path.join(projectRoot, "prod.db"),
        path.join(projectRoot, "dev.db")
      ];

      if (!fs.existsSync(tmpDb)) {
        for (const candidate of candidates) {
          if (fs.existsSync(candidate)) {
            try {
              fs.copyFileSync(candidate, tmpDb);
              break;
            } catch (err) {
              console.warn("Could not copy database file to /tmp:", err);
            }
          }
        }
      }

      dbUrl = `file:${tmpDb}`;
      process.env.DATABASE_URL = dbUrl;
    } else {
      if (!dbUrl) {
        const localPath = path.join(process.cwd(), "prisma", "prod.db");
        dbUrl = `file:${localPath}`;
        process.env.DATABASE_URL = dbUrl;
      }
    }
  }

  return dbUrl;
}

function createPrisma(): PrismaClient {
  setupDatabaseUrl();
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });
}

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrisma();
  }
  return globalForPrisma.prisma;
}

// Back-compat getter so `import prisma from "@/lib/prisma"` still works
const prisma = new Proxy({} as PrismaClient, {
  get(_t, prop, recv) {
    const client = getPrisma();
    const value = Reflect.get(client, prop, recv);
    return typeof value === "function" ? value.bind(client) : value;
  }
});

export default prisma;
export { prisma };
