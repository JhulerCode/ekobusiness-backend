import { redis } from '#infrastructure/redis/index.js'
import { keys } from '#infrastructure/redis/keys.js'

async function obtenerSesion(userId) {
    const data = await redis.get(keys.user(userId))
    return data ? JSON.parse(data) : null
}

async function guardarSesion(userId, sessionData) {
    const sessionKey = keys.user(userId)
    await redis.set(sessionKey, JSON.stringify(sessionData))

    if (sessionData.refreshToken) {
        await redis.set(
            keys.refreshToken(sessionData.refreshToken),
            userId,
            'EX',
            30 * 24 * 60 * 60,
        )
    }

    if (sessionData.empresa) {
        await redis.sadd(keys.companySessions(sessionData.empresa), userId)
    }
}

async function borrarSesion(userId) {
    const session = await obtenerSesion(userId)
    if (session) {
        if (session.empresa) {
            await redis.srem(keys.companySessions(session.empresa), userId)
        }
        if (session.refreshToken) {
            await redis.del(keys.refreshToken(session.refreshToken))
        }
    }
    await redis.del(keys.user(userId))
}

async function actualizarSesion(id, values) {
    const sesion = await obtenerSesion(id)
    if (!sesion || !values) return

    Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined) {
            sesion[key] = value
        }
    })

    await guardarSesion(id, sesion)
}

async function obtenerSesionesActivasPorEmpresa(empresaId) {
    return await redis.scard(keys.companySessions(empresaId))
}

export {
    guardarSesion,
    obtenerSesion,
    borrarSesion,
    actualizarSesion,
    obtenerSesionesActivasPorEmpresa,
}
