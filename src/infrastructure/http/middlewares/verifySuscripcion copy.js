import dayjs from '#shared/dayjs.js'
import {
    obtenerSesion,
    borrarSesion,
    obtenerSesionesActivasPorEmpresa,
} from '#store/sessions.js'
import { redis } from '#infrastructure/redis/index.js'

async function verifySuscripcion(req, res, next) {
    const { empresa } = req

    if (!empresa) return next()

    // --- VERIFICAR SUSCRIPCIÓN --- //
    if (empresa.subdominio !== 'admin') {
        const hoy = dayjs().startOf('day')
        const totalCupos = (empresa.suscripciones || []).reduce((sum, sub) => {
            const vencimiento = dayjs(sub.fecha_vencimiento).startOf('day')
            if (!vencimiento.isBefore(hoy)) return sum + sub.limite_usuarios
            return sum
        }, 0)

        if (totalCupos === 0) {
            return res.status(403).json({
                code: 1,
                msg: 'La empresa no cuenta con una suscripción activa',
            })
        }

        // --- VALIDAR SESIONES VIGENTES EN CASO DE BAJA DE CUPO --- //
        const numSesiones = await obtenerSesionesActivasPorEmpresa(empresa.id)

        if (numSesiones > totalCupos) {
            // Obtener todos los IDs de usuarios en esta empresa
            const usersIds = await redis.smembers(`empresa_sessions:${empresa.id}`)
            const sesionesActivas = []

            for (const uid of usersIds) {
                const s = await obtenerSesion(uid)
                if (s) sesionesActivas.push(s)
            }

            // Ordenamos por fecha de login (los primeros en entrar tienen prioridad)
            sesionesActivas.sort((a, b) => dayjs(a.loginAt).unix() - dayjs(b.loginAt).unix())

            // Nos quedamos solo con los IDs de los permitidos
            const permitidos = sesionesActivas.slice(0, totalCupos).map((s) => s.id)

            if (!permitidos.includes(req.user.colaborador)) {
                await borrarSesion(req.user.colaborador)
                return res.status(403).json({
                    code: 1,
                    msg: 'Ha alcanzado el límite de usuarios concurrentes.',
                })
            }
        }
    }

    next()
}

export default verifySuscripcion
