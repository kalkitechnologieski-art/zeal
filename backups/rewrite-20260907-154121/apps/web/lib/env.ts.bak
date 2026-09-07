interface EnvConfig {
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;
  DATABASE_URL: string;
  INSTAMOJO_CLIENT_ID: string;
  INSTAMOJO_CLIENT_SECRET: string;
  INSTAMOJO_WEBHOOK_SECRET: string;
  LIVEKIT_API_KEY: string;
  LIVEKIT_API_SECRET: string;
  LIVEKIT_WS_URL: string;
  GROQ_API_KEY: string;
}

const required: (keyof EnvConfig)[] = [
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "DATABASE_URL",
  "INSTAMOJO_CLIENT_ID",
  "INSTAMOJO_CLIENT_SECRET",
  "INSTAMOJO_WEBHOOK_SECRET",
];

export function validateEnv(): boolean {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.warn(`⚠️ Missing environment variables: ${missing.join(", ")}`);
    return false;
  }
  return true;
}

export function getEnv<T extends keyof EnvConfig>(key: T): EnvConfig[T] {
  const value = process.env[key] as EnvConfig[T];
  if (!value && required.includes(key)) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = new Proxy({} as EnvConfig, {
  get: (_, prop: string) => {
    const value = process.env[prop];
    if (required.includes(prop as keyof EnvConfig) && !value) {
      throw new Error(`Missing required environment variable: ${prop}`);
    }
    return value;
  },
});
