import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Prisma 7 requires a driver adapter for PostgreSQL
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

const pool = new Pool({ 
  connectionString,
  // Increase timeouts for serverless environments
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 10000,
});

const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

export * from "@prisma/client";
