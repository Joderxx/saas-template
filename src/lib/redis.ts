import { Redis } from "@upstash/redis"

export const redis = Redis.fromEnv()

export async function get(key: string) {
  return await redis.get(key)
}

export async function set(key: string, value: string, expire?: number) {
  if (!expire) {
    return await redis.set(key, value)
  }
  return await redis.set(key, value, {ex: expire || 0})
}

export async function del(key: string) {
  return await redis.del(key)
}
