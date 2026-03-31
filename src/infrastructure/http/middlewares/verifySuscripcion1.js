import dayjs from '#shared/dayjs.js'

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
        const { sessionStore, borrarSesion } = await import('#store/sessions.js')

        let sesionesActivas = []
        for (const s of sessionStore.values()) {
            if (s.empresa === empresa.id) sesionesActivas.push(s)
        }

        if (sesionesActivas.length > totalCupos) {
            // Ordenamos por fecha de login (los primeros en entrar tienen prioridad)
            sesionesActivas.sort((a, b) => a.loginAt - b.loginAt)

            // Nos quedamos solo con los IDs de los permitidos
            const permitidos = sesionesActivas.slice(0, totalCupos).map((s) => s.id)

            if (!permitidos.includes(req.user.colaborador)) {
                borrarSesion(req.user.colaborador)
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
