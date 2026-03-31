import { redis } from '#infrastructure/redis/index.js'

export async function getOrSetCache(key, callback, ttl = 3600) {
    const cached = await redis.get(key)

    if (cached) {
        return JSON.parse(cached)
    }

    const freshData = await callback()

    await redis.set(key, JSON.stringify(freshData), 'EX', ttl)

    return freshData
}
