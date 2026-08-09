import { z } from 'zod';

const envSchema = z.object({
  // Clerk
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  // Database
  DATABASE_URL: z.string().min(1),
  // Redis
  UPSTASH_REDIS_REST_URL: z.string().min(1),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  // Storage (R2)
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET_NAME: z.string().min(1),
  R2_PUBLIC_URL: z.string().url(),
  // Payments
  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  // LiveKit
  LIVEKIT_API_KEY: z.string().min(1),
  LIVEKIT_API_SECRET: z.string().min(1),
  LIVEKIT_WS_URL: z.string().url(),
  // AI
  GROQ_API_KEY: z.string().min(1),
  // WebSocket
  NEXT_PUBLIC_WS_URL: z.string().url().optional(),
});

export function validateEnv() {
  try {
    envSchema.parse(process.env);
    console.log('✅ Environment variables validated.');
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

export type Env = z.infer<typeof envSchema>;
