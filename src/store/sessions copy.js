import { redis } from '#infrastructure/redis/index.js'
import { keys } from '#infrastructure/redis/keys.js'

const COMPANY_SESSIONS_PREFIX = 'empresa_sessions:'

async function guardarSesion(userId, sessionData) {
    const sessionKey = keys.user(userId)
    await redis.set(sessionKey, JSON.stringify(sessionData))

    if (sessionData.empresa) {
        await redis.sadd(`${COMPANY_SESSIONS_PREFIX}${sessionData.empresa}`, userId)
    }
}

async function obtenerSesion(userId) {
    const data = await redis.get(keys.user(userId))
    return data ? JSON.parse(data) : null
}

async function borrarSesion(userId) {
    const session = await obtenerSesion(userId)
    if (session && session.empresa) {
        await redis.srem(`${COMPANY_SESSIONS_PREFIX}${session.empresa}`, userId)
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
    return await redis.scard(`${COMPANY_SESSIONS_PREFIX}${empresaId}`)
}

export {
    guardarSesion,
    obtenerSesion,
    borrarSesion,
    actualizarSesion,
    obtenerSesionesActivasPorEmpresa,
}