import { PrismaClient, Prisma } from "../generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

// ─── Global singleton (hot-reload safe) ──────────────────────────────────
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// ─── Adapter ─────────────────────────────────────────────────────────────
// Prisma 7 requires the connection to be configured via an adapter.
// `@prisma/adapter-neon` uses the Neon serverless driver over WebSockets,
// which is required for Vercel/Netlify serverless functions.
//
// The connection string is read from DATABASE_URL. Do NOT pass accelerateUrl
// — that field only applies to Prisma Accelerate, and it is incompatible
// with a direct adapter in Prisma 7.
const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});

// ─── PrismaClient ────────────────────────────────────────────────────────
// The adapter must be part of the options object literal so TypeScript
// picks up `PrismaClientOptionsWithAdapter` (not the base options type).
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "production"
        ? ["error", "warn"]
        : ["error", "warn"],
    errorFormat: "pretty",
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ─── Serializable transaction with retry ─────────────────────────────────
// Retries on serialization failures (P2034) and deadlocks, both of which
// PostgreSQL raises under concurrent writes.
export async function withTransaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
  options?: {
    maxRetries?: number;
    isolationLevel?: Prisma.TransactionIsolationLevel;
  },
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 3;
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await prisma.$transaction(
        async (tx) => fn(tx),
        {
          isolationLevel:
            options?.isolationLevel ??
            Prisma.TransactionIsolationLevel.Serializable,
          maxWait: 5000,
          timeout: 10000,
        },
      );
    } catch (error) {
      lastError = error;
      const isRetryable =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === "P2034" || error.code === "P2028");
      if (!isRetryable || attempt === maxRetries) throw error;
      const delay = Math.min(50 * Math.pow(2, attempt), 1000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError ?? new Error("Transaction failed after retries");
}

// ─── Query timing helper ─────────────────────────────────────────────────
export async function measureQuery<T>(
  name: string,
  fn: () => Promise<T>,
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    if (duration > 100) {
      console.warn("[Slow Query] " + name + " took " + duration + "ms");
    }
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(
      "[Query Error] " + name + " failed after " + duration + "ms",
      error,
    );
    throw error;
  }
}

// ─── Re-exports ──────────────────────────────────────────────────────────
export * from "../generated/prisma/client";
export { Prisma };

