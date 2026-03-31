import Redis from 'ioredis'
import config from '../../config.js'

const redis = new Redis(config.REDIS_URI, {
    retryStrategy(times) {
        console.log(`🔁 Reintentando Redis (${times})`)
        return Math.min(times * 50, 2000)
    },
})

redis.on('connect', () => {
    console.log('✅ Redis conectado')
})

redis.on('error', (err) => {
    console.error('❌ Redis error:', err)
})

export default redis
