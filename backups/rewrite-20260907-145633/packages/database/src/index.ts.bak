import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

let prismaInstance: PrismaClient | null = null;

function getPrismaClient() {
  if (!prismaInstance) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    const adapter = new PrismaNeon({ connectionString });
    prismaInstance = new PrismaClient({ adapter });
  }
  return prismaInstance;
}

// Create a proxy that lazily initializes the client on first property access
export const prisma = new Proxy({} as PrismaClient, {
  get: (target, prop) => {
    const client = getPrismaClient();
    return Reflect.get(client, prop);
  },
});

export * from '@prisma/client';
