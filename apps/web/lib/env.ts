import { z } from "zod";

const EnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  DATABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_WS_URL: z.string().url().optional(),
});

export function validateEnv() {
  try {
    EnvSchema.parse(process.env);
    console.log("✅ Environment variables validated");
  } catch (error) {
    console.error("❌ Invalid environment variables:", error);
    process.exit(1);
  }
}
