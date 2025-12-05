import jat from "#shared/jat.js"
import config from "../../../config.js"
import { sessionStore, obtenerSesion } from "#core/_signin/sessions.js"

async function verifyToken(req, res, next) {
    const authorization = req.headers['authorization']

    if (!authorization) return res.status(401).json({ msg: 'Token faltante' })

    if (!authorization.toLowerCase().startsWith('bearer')) return res.status(401).json({ msg: 'Token no válido' })

    const token = authorization.substring(7)

    try {
        const user = jat.decrypt(token, config.tokenMyApi)
        // console.log('user', user)
        // const sesion = obtenerSesion(user.colaborador || user.id)
        const session = obtenerSesion(user.id)
        // console.log('session', session)

        if (!session || session.token !== token) {
            return res.status(401).json({ msg: 'Sesión no válida' })
        }

        req.user = {
            // colaborador: user.colaborador, // este es el id del jwt
            colaborador: session.id,
            ...session
        }

        next()
    }
    catch (error) {
        return res.status(401).json({ msg: 'Token inválido o expirado' })
    }
}

export default verifyToken