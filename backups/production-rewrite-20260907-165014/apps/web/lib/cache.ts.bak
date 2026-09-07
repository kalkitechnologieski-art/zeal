import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

let redisInstance: Redis | null = null;
if (url && token) {
  redisInstance = new Redis({ url, token });
} else {
  console.warn("Upstash Redis not configured – caching disabled.");
}

export const redis = redisInstance || {
  get: async () => null,
  setex: async () => {},
  set: async () => {},
  del: async () => {},
};
