// Environment validation utility

interface EnvConfig {
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;
  DATABASE_URL?: string;
  NEXT_PUBLIC_WS_URL?: string;
  NEXT_PUBLIC_LIVEKIT_WS_URL?: string;
}

const required: (keyof EnvConfig)[] = [
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
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
