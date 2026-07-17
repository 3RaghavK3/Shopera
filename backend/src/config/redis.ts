import { Redis } from '@upstash/redis'
import dotnenv from "dotenv"

dotnenv.config();

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN}
)

export default redis;
