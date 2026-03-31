import dayjs from '#shared/dayjs.js'
import { getInfoSuscripcion } from '#shared/suscripciones.js'
import { obtenerSesion, borrarSesion } from '#store/sessions.js'
import { redis } from '#infrastructure/redis/index.js'

async function verifySuscripcion(req, res, next) {
    const { empresa } = req
    const { cuposTotal, cuposDisponibles } = await getInfoSuscripcion(empresa)

    if (cuposTotal == 0) {
        return res.json({
            code: 1,
            msg: 'La empresa no cuenta con una suscripción activa',
        })
    }

    if (cuposDisponibles <= 0) {
        // Obtener todos los IDs de usuarios en esta empresa
        const usersIds = await redis.smembers(`empresa_sessions:${empresa.id}`)
        const sessions = []

        for (const uid of usersIds) {
            const s = await obtenerSesion(uid)
            if (s) sessions.push(s)
        }

        // Ordenamos por fecha de login (los primeros en entrar tienen prioridad)
        sessions.sort((a, b) => dayjs(a.loginAt).unix() - dayjs(b.loginAt).unix())

        // Nos quedamos solo con los IDs de los permitidos
        const permitidos = sessions.slice(0, cuposTotal).map((s) => s.id)

        if (!permitidos.includes(req.user.colaborador)) {
            await borrarSesion(req.user.colaborador)
            return res.status(403).json({
                code: 1,
                msg: 'La empresa ha alcanzado el límite de usuarios concurrentes.',
            })
        }
    }

    next()
}

export default verifySuscripcion
