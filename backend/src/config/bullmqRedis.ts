import { Redis } from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// Convert Upstash REST URL and Token to a standard Redis connection string
const restUrl = process.env.UPSTASH_REDIS_REST_URL || "";
const token = process.env.UPSTASH_REDIS_REST_TOKEN || "";

const host = restUrl.replace("https://", "");
const redisUrl = `rediss://default:${token}@${host}:6379`;

export const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

connection.on("error", (err) => {
  console.error("Redis connection error (BullMQ):", err);
});
